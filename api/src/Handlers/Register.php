<?php
// Parish registration (spec 8.2): a rector asks to join. Nothing goes live until the admin approves.
if (!defined('UO_API')) { exit; }

final class RegisterApi
{
    private const HOUR = 3600;
    private const GENERIC_OK = ['status' => 'ok', 'message' => 'If the details are valid, a verification code has been sent to that address.'];

    /** POST /register {parish_name, diocese_key?, corpus_parish_slug?, contact_name, email, visibility?} */
    public static function register(array $params): void
    {
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }

        $errors = [];
        [$parishName, $e] = Validate::text($b['parish_name'] ?? null, 160);
        if ($e !== null) { $errors['parish_name'] = $e; }
        [$contactName, $e] = Validate::text($b['contact_name'] ?? null, 120);
        if ($e !== null) { $errors['contact_name'] = $e; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email === null) { $errors['email'] = 'Enter a valid email address.'; }
        $diocese = $b['diocese_key'] ?? null;
        if ($diocese !== null && $diocese !== '' && !Validate::dioceseKey($diocese)) { $errors['diocese_key'] = 'Invalid diocese.'; }
        $corpus = $b['corpus_parish_slug'] ?? null;
        if ($corpus !== null && $corpus !== '' && !Validate::slug($corpus)) { $errors['corpus_parish_slug'] = 'Invalid parish reference.'; }
        $vis = $b['visibility'] ?? 'code';
        if ($vis === null || $vis === '') { $vis = 'code'; }
        if (!is_string($vis) || !in_array($vis, ['public', 'code'], true)) { $errors['visibility'] = "Choose 'public' or 'code'."; }
        if ($errors) { Response::error(422, 'invalid_input', 'Invalid input.', $errors); return; }

        foreach ([['register_ip', Request::ip(), 5], ['register_email', $email, 3]] as [$name, $key, $limit]) {
            $rl = RateLimit::hit($name, $key, $limit, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }

        // An address that already belongs to staff gets no mail -- and the same answer as everyone else.
        $st = Db::pdo()->prepare('SELECT 1 FROM staff WHERE email = ? LIMIT 1');
        $st->execute([$email]);
        $job = $st->fetchColumn() !== false ? null : function () use ($email, $parishName, $contactName, $diocese, $corpus, $vis): void {
            $payload = json_encode([
                'parish_name' => $parishName, 'contact_name' => $contactName,
                'diocese_key' => ($diocese === '' ? null : $diocese), 'corpus_parish_slug' => ($corpus === '' ? null : $corpus),
                'visibility' => $vis,
            ], JSON_UNESCAPED_UNICODE);
            $code = Auth::issueCode('register', $email, $payload);
            Mailer::send($email, 'Your Universal Office code',
                "Your Universal Office code is $code.\n\nIt expires in " . Auth::CODE_TTL_MINUTES
                . " minutes. If you didn't ask for this, you can ignore this message.\n");
        };

        Response::json(200, self::GENERIC_OK);
        Deferred::run($job);
    }

    /** POST /register/verify {email, code} -> creates the pending parish, the rector, and the approval request. */
    public static function verify(array $params): void
    {
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $email = Auth::normalizeEmail($b['email'] ?? null);
        if ($email !== null) {
            $rl = RateLimit::hit('regverify_email', $email, 10, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        }
        $fail = fn() => Response::error(401, 'unauthorized', 'That code was not accepted.');
        if ($email === null) { $fail(); return; }
        $row = Auth::verifyCode('register', $email, $b['code'] ?? null);
        if ($row === null) { $fail(); return; }
        $reg = json_decode((string)$row['payload'], true);
        if (!is_array($reg) || !isset($reg['parish_name'], $reg['contact_name'])) { $fail(); return; }

        $pdo = Db::pdo();
        $joinCode = null;
        $pdo->beginTransaction();
        try {
            $vis = ($reg['visibility'] ?? 'code') === 'public' ? 'public' : 'code';
            $joinCode = $vis === 'code' ? Crypto::generateJoinCode() : null;
            $enc = $joinCode === null ? null : Crypto::encryptJoinCode($joinCode);
            $base = Validate::slugify($reg['parish_name']);
            $parishId = null;
            for ($n = 1; $n <= 50 && $parishId === null; $n++) {
                $slug = $n === 1 ? $base : substr($base, 0, 76) . '-' . $n;
                try {
                    $pdo->prepare("INSERT INTO parishes (slug, name, tradition, diocese_key, corpus_parish_slug, visibility, join_code_enc, status, created_at)
                                   VALUES (?, ?, 'anglican', ?, ?, ?, ?, 'pending', UTC_TIMESTAMP())")
                        ->execute([$slug, $reg['parish_name'], $reg['diocese_key'] ?? null, $reg['corpus_parish_slug'] ?? null, $vis, $enc]);
                    $parishId = (int)$pdo->lastInsertId();
                } catch (PDOException $ex) {
                    if ($ex->getCode() !== '23000') { throw $ex; } // slug taken: try the next suffix
                }
            }
            if ($parishId === null) { throw new RuntimeException('slug_exhausted'); }
            $pdo->prepare("INSERT INTO staff (parish_id, email, display_name, role, created_at) VALUES (?, ?, ?, 'rector', UTC_TIMESTAMP())")
                ->execute([$parishId, $email, $reg['contact_name']]);
            $token = bin2hex(random_bytes(32));
            $pdo->prepare('INSERT INTO approval_tokens (token_hash, parish_id, created_at, expires_at)
                           VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL 7 DAY)')
                ->execute([hash('sha256', $token), $parishId]);
            $pdo->commit();
        } catch (PDOException $ex) {
            if ($pdo->inTransaction()) { $pdo->rollBack(); }
            if ($ex->getCode() === '23000') { $fail(); return; } // the address became staff meanwhile
            throw $ex;
        } catch (Throwable $ex) {
            if ($pdo->inTransaction()) { $pdo->rollBack(); }
            throw $ex;
        }
        Audit::log('registrant', $parishId, 'parish.register');

        Response::json(200, ['status' => 'pending_approval']);
        Deferred::run(function () use ($reg, $email, $token): void {
            $url = rtrim((string)Config::get('site_url'), '/') . '/parish/approve.html#' . $token;
            $body = "A parish is waiting for your approval.\n\n"
                . "Parish: {$reg['parish_name']}\n"
                . 'Diocese: ' . ($reg['diocese_key'] ?? '(not given)') . "\n"
                . "Contact: {$reg['contact_name']}\n"
                . "Contact email: $email\n\n"
                . "Approval link (open it, then press the Approve button):\n$url\n\n"
                . "The link expires in 7 days. Opening it does not approve anything by itself.\n";
            foreach ((array)Config::get('admin_emails', []) as $admin) {
                Mailer::send((string)$admin, 'Parish awaiting approval: ' . $reg['parish_name'], $body);
            }
        });
    }
}
