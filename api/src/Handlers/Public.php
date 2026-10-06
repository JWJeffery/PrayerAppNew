<?php
// Reader-facing endpoints (spec 8.1): list parishes, read intentions, join with a code.
// Readers have no accounts; nothing about them is stored server-side.
if (!defined('UO_API')) { exit; }

final class PublicApi
{
    private const HOUR = 3600;

    /** GET /parishes?diocese=<key> */
    public static function listParishes(array $params): void
    {
        $diocese = $_GET['diocese'] ?? null;
        if ($diocese !== null && !Validate::dioceseKey($diocese)) {
            Response::error(422, 'invalid_input', 'Invalid input.', ['diocese' => 'Invalid diocese key.']);
            return;
        }
        $sql = "SELECT slug, name, diocese_key, corpus_parish_slug, visibility FROM parishes WHERE status = 'approved'";
        $args = [];
        if ($diocese !== null) { $sql .= ' AND diocese_key = ?'; $args[] = $diocese; }
        $sql .= ' ORDER BY name ASC, slug ASC LIMIT 200';
        $st = Db::pdo()->prepare($sql);
        $st->execute($args);
        Response::json(200, ['parishes' => $st->fetchAll()]);
    }

    /** GET /parishes/{slug}/intentions -- current, unexpired items only. */
    public static function intentions(array $params): void
    {
        $rl = RateLimit::hit('readip', Request::ip(), 300, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }

        $parish = self::approvedParish($params['slug'] ?? '');
        if ($parish === null) { Response::error(404, 'not_found', 'Not found.'); return; }

        if ($parish['visibility'] === 'code'
            && !Crypto::verifyPass(Request::header('X-Parish-Pass'), (int)$parish['id'], (int)$parish['join_code_version'])) {
            Response::error(401, 'code_required', 'A join code is required for this parish.');
            return;
        }

        // Expiry is enforced here, at query time, whatever is still sitting in the table.
        $st = Db::pdo()->prepare(
            "SELECT id, category, body, expires_at FROM intentions
             WHERE parish_id = ? AND expires_at > UTC_TIMESTAMP()
             ORDER BY FIELD(category, 'individual', 'family', 'situation', 'institution'), created_at ASC, id ASC"
        );
        $st->execute([(int)$parish['id']]);
        $items = [];
        foreach ($st->fetchAll() as $r) {
            $items[] = [
                'id' => (int)$r['id'],
                'category' => $r['category'],
                'text' => $r['body'],
                'expires_at' => Validate::isoUtc($r['expires_at']),
            ];
        }
        Response::json(200, [
            'parish' => ['slug' => $parish['slug'], 'name' => $parish['name']],
            'intentions' => $items,
            'generated_at' => gmdate('Y-m-d\TH:i:s\Z'),
        ], 'private, max-age=60');
    }

    /** POST /parishes/{slug}/join  {code} -> {pass, parish} */
    public static function join(array $params): void
    {
        $slug = (string)($params['slug'] ?? '');
        $rl = RateLimit::hit('joinip', Request::ip() . '|' . $slug, 10, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }

        [$body, $err] = Request::jsonBody();
        if ($body === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }

        $parish = self::approvedParish($slug);
        if ($parish === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        if ($parish['visibility'] !== 'code') {
            Response::error(400, 'bad_request', 'This parish does not require a code.');
            return;
        }
        if (!Crypto::verifyJoinCode($body['code'] ?? null, $parish['join_code_enc'])) {
            Response::error(403, 'forbidden', 'That code was not accepted.'); // generic: never say why
            return;
        }
        Response::json(200, [
            'pass' => Crypto::makePass((int)$parish['id'], (int)$parish['join_code_version']),
            'parish' => ['slug' => $parish['slug'], 'name' => $parish['name']],
        ]);
    }

    /** Approved parish row by slug, or null. Pending/suspended parishes serve nothing. */
    private static function approvedParish(string $slug): ?array
    {
        if (!Validate::slug($slug)) { return null; }
        $st = Db::pdo()->prepare(
            "SELECT id, slug, name, visibility, join_code_enc, join_code_version
             FROM parishes WHERE slug = ? AND status = 'approved'"
        );
        $st->execute([$slug]);
        $row = $st->fetch();
        return $row === false ? null : $row;
    }
}
