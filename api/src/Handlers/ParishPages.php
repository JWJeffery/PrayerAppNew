<?php
// Parish home page, parish events, rector announcements and the diocesan page (2026-10-06).
// Reader endpoints follow the same visibility rule as intentions: a code-only parish serves
// nothing but its name until the reader presents a valid pass. Staff endpoints reuse StaffApi's
// session checks (the parish always comes from the session, never from the client).
if (!defined('UO_API')) { exit; }

final class ParishPagesApi
{
    private const HOUR = 3600;
    private const MAX_EVENTS = 60;
    private const MAX_ANNOUNCEMENTS = 5;
    private const MAX_DIOCESE_PRAYERS = 60;

    // ---- Reader ---------------------------------------------------------------

    /**
     * True when the request carries a live ADMIN session whose email is still an administrator (an owner in
     * the private config, or one designated on the admin page). Checked on every call, so removing an
     * address ends that person's access at once even though their 30-day session has not expired.
     */
    private static function isGlobalAdmin(): bool
    {
        $p = Auth::principal();
        if ($p === null || $p['type'] !== 'admin') { return false; }
        $email = Auth::normalizeEmail($p['email'] ?? null);
        return $email !== null && AdminApi::isAdminEmail($email);
    }

    /**
     * GET /parishes/{slug} -- profile, upcoming events, current announcements.
     * A global administrator (Bearer admin session) sees ANY parish: whatever its join code and whatever
     * its status (pending and suspended included). Everyone else is held to the reader rules.
     */
    public static function home(array $params): void
    {
        $rl = RateLimit::hit('readip', Request::ip(), 300, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }

        $slug = (string)($params['slug'] ?? '');
        if (!Validate::slug($slug)) { Response::error(404, 'not_found', 'Not found.'); return; }
        $admin = self::isGlobalAdmin();

        $st = Db::pdo()->prepare('SELECT id, slug, name, diocese_key, visibility, status, join_code_version, rector_name, address, website, service_times
                                  FROM parishes WHERE slug = ?' . ($admin ? '' : " AND status = 'approved'"));
        $st->execute([$slug]);
        $parish = $st->fetch();
        if ($parish === false) { Response::error(404, 'not_found', 'Not found.'); return; }

        if (!$admin && $parish['visibility'] === 'code'
            && !Crypto::verifyPass(Request::header('X-Parish-Pass'), (int)$parish['id'], (int)$parish['join_code_version'])) {
            Response::error(401, 'code_required', 'A join code is required for this parish.');
            return;
        }
        $pdo = Db::pdo();
        $pid = (int)$parish['id'];

        // An event stays listed through the day after its date: the server does not know the parish's
        // time zone, and a day of slack means a late-evening event is never hidden early.
        $ev = $pdo->prepare('SELECT id, title, event_date, event_time, note FROM parish_events
                             WHERE parish_id = ? AND event_date >= UTC_DATE() - INTERVAL 1 DAY
                             ORDER BY event_date ASC, event_time IS NULL, event_time ASC, id ASC');
        $ev->execute([$pid]);
        $events = array_map([self::class, 'eventRow'], $ev->fetchAll());

        $an = $pdo->prepare('SELECT id, body, expires_at FROM parish_announcements
                             WHERE parish_id = ? AND expires_at > UTC_TIMESTAMP() ORDER BY created_at DESC, id DESC');
        $an->execute([$pid]);
        $announcements = [];
        foreach ($an->fetchAll() as $r) {
            $announcements[] = ['id' => (int)$r['id'], 'text' => $r['body'], 'expires_at' => Validate::isoUtc($r['expires_at'])];
        }

        $out = [
            'parish' => [
                'slug' => $parish['slug'], 'name' => $parish['name'], 'diocese_key' => $parish['diocese_key'],
                'rector_name' => $parish['rector_name'], 'address' => $parish['address'], 'website' => $parish['website'],
                'service_times' => Validate::splitLines($parish['service_times']),
            ],
            'events' => $events,
            'announcements' => $announcements,
            'generated_at' => gmdate('Y-m-d\TH:i:s\Z'),
        ];
        if ($admin) {
            // Only an administrator is told the parish's status and visibility; never cached.
            $out['viewer_admin'] = true;
            $out['parish']['status'] = $parish['status'];
            $out['parish']['visibility'] = $parish['visibility'];
            Response::json(200, $out, 'no-store');
            return;
        }
        Response::json(200, $out, 'private, max-age=60');
    }

    /** GET /dioceses/{body}/{name} -- bishop, convention dates, prayer list and the diocese's approved parishes. */
    public static function diocese(array $params): void
    {
        $rl = RateLimit::hit('readip', Request::ip(), 300, self::HOUR);
        if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return; }
        $key = self::dioceseKeyFrom($params);
        if ($key === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        $pdo = Db::pdo();

        $st = $pdo->prepare('SELECT bishop_name, website, convention_dates FROM dioceses WHERE diocese_key = ?');
        $st->execute([$key]);
        $d = $st->fetch() ?: ['bishop_name' => null, 'website' => null, 'convention_dates' => null];

        $pr = $pdo->prepare('SELECT id, body, expires_at FROM diocese_prayers WHERE diocese_key = ? AND expires_at > UTC_TIMESTAMP()
                             ORDER BY created_at ASC, id ASC');
        $pr->execute([$key]);
        $prayers = [];
        foreach ($pr->fetchAll() as $r) {
            $prayers[] = ['id' => (int)$r['id'], 'text' => $r['body'], 'expires_at' => Validate::isoUtc($r['expires_at'])];
        }

        $ps = $pdo->prepare("SELECT slug, name, corpus_parish_slug, visibility FROM parishes
                             WHERE status = 'approved' AND diocese_key = ? ORDER BY name ASC, slug ASC LIMIT 200");
        $ps->execute([$key]);

        Response::json(200, [
            'diocese' => ['key' => $key, 'bishop_name' => $d['bishop_name'], 'website' => $d['website'],
                          'convention_dates' => Validate::splitLines($d['convention_dates'])],
            'prayers' => $prayers,
            'parishes' => $ps->fetchAll(),
            'generated_at' => gmdate('Y-m-d\TH:i:s\Z'),
        ], 'public, max-age=300');
    }

    private static function dioceseKeyFrom(array $params): ?string
    {
        $key = (string)($params['body'] ?? '') . '/' . (string)($params['name'] ?? '');
        return Validate::dioceseKey($key) ? $key : null;
    }

    private static function eventRow(array $r): array
    {
        return [
            'id' => (int)$r['id'], 'title' => $r['title'], 'date' => $r['event_date'],
            'time' => $r['event_time'] === null ? null : substr($r['event_time'], 0, 5), 'note' => $r['note'],
        ];
    }

    // ---- Staff: profile ---------------------------------------------------------

    private static function profileOf(int $parishId): array
    {
        $st = Db::pdo()->prepare('SELECT rector_name, address, website, service_times FROM parishes WHERE id = ?');
        $st->execute([$parishId]);
        $r = $st->fetch();
        return ['rector_name' => $r['rector_name'], 'address' => $r['address'], 'website' => $r['website'],
                'service_times' => Validate::splitLines($r['service_times'])];
    }

    /** GET /staff/parish/profile */
    public static function getProfile(array $params): void
    {
        $p = StaffApi::ctx(false);
        if ($p === null) { return; }
        Response::json(200, ['profile' => self::profileOf($p['parish']['id'])]);
    }

    /** PUT /staff/parish/profile {rector_name, address, website, service_times[]} -- rector only; replaces all four. */
    public static function putProfile(array $params): void
    {
        $p = StaffApi::ctx(true, true);
        if ($p === null) { return; }
        $b = StaffApi::json();
        if ($b === null) { return; }
        $errors = [];
        [$rector, $e] = Validate::text($b['rector_name'] ?? null, 120, false); if ($e !== null) { $errors['rector_name'] = $e; }
        [$address, $e] = Validate::text($b['address'] ?? null, 255, false); if ($e !== null) { $errors['address'] = $e; }
        [$website, $e] = Validate::url($b['website'] ?? null); if ($e !== null) { $errors['website'] = $e; }
        [$times, $e] = Validate::lines($b['service_times'] ?? null, 8, 80); if ($e !== null) { $errors['service_times'] = $e; }
        if ($errors) { StaffApi::invalid($errors); return; }
        Db::pdo()->prepare('UPDATE parishes SET rector_name = ?, address = ?, website = ?, service_times = ? WHERE id = ?')
            ->execute([$rector, $address, $website, Validate::joinLines($times), $p['parish']['id']]);
        StaffApi::audit($p, 'parish.profile');
        Response::json(200, ['profile' => self::profileOf($p['parish']['id'])]);
    }

    // ---- Staff: events ----------------------------------------------------------

    private static function findEvent(int $parishId, int $id): ?array
    {
        $st = Db::pdo()->prepare('SELECT id, title, event_date, event_time, note FROM parish_events WHERE id = ? AND parish_id = ?');
        $st->execute([$id, $parishId]);
        $r = $st->fetch();
        return $r === false ? null : $r;
    }

    /** GET /staff/events -- upcoming and the last week's. */
    public static function listEvents(array $params): void
    {
        $p = StaffApi::ctx(false);
        if ($p === null) { return; }
        $st = Db::pdo()->prepare('SELECT id, title, event_date, event_time, note FROM parish_events
                                  WHERE parish_id = ? AND event_date >= UTC_DATE() - INTERVAL 7 DAY
                                  ORDER BY event_date ASC, event_time IS NULL, event_time ASC, id ASC');
        $st->execute([$p['parish']['id']]);
        Response::json(200, ['events' => array_map([self::class, 'eventRow'], $st->fetchAll())]);
    }

    /** @return array{0:array,1:array} [clean fields, errors]; $partial lets PATCH skip absent keys */
    private static function eventFields(array $b, bool $partial): array
    {
        $f = []; $errors = [];
        if (!$partial || array_key_exists('title', $b)) {
            [$v, $e] = Validate::text($b['title'] ?? null, 120);
            if ($e !== null) { $errors['title'] = $e; } else { $f['title'] = $v; }
        }
        if (!$partial || array_key_exists('date', $b)) {
            [$v, $e] = Validate::date($b['date'] ?? null);
            if ($e !== null) { $errors['date'] = $e; } else { $f['event_date'] = $v; }
        }
        if (!$partial || array_key_exists('time', $b)) {
            [$v, $e] = Validate::time($b['time'] ?? null);
            if ($e !== null) { $errors['time'] = $e; } else { $f['event_time'] = $v; }
        }
        if (!$partial || array_key_exists('note', $b)) {
            [$v, $e] = Validate::text($b['note'] ?? null, 200, false);
            if ($e !== null) { $errors['note'] = $e; } else { $f['note'] = $v; }
        }
        return [$f, $errors];
    }

    /** POST /staff/events {title, date, time?, note?} */
    public static function createEvent(array $params): void
    {
        $p = StaffApi::ctx(true);
        if ($p === null) { return; }
        $b = StaffApi::json();
        if ($b === null) { return; }
        [$f, $errors] = self::eventFields($b, false);
        if ($errors) { StaffApi::invalid($errors); return; }

        $pdo = Db::pdo();
        $pid = $p['parish']['id'];
        $pdo->beginTransaction();
        try {
            $pdo->prepare('SELECT id FROM parishes WHERE id = ? FOR UPDATE')->execute([$pid]);
            $cnt = $pdo->prepare('SELECT COUNT(*) FROM parish_events WHERE parish_id = ? AND event_date >= UTC_DATE() - INTERVAL 1 DAY');
            $cnt->execute([$pid]);
            if ((int)$cnt->fetchColumn() >= self::MAX_EVENTS) {
                $pdo->rollBack();
                Response::error(409, 'limit_reached', 'This parish already has ' . self::MAX_EVENTS . ' upcoming events. Remove some first.');
                return;
            }
            $pdo->prepare('INSERT INTO parish_events (parish_id, title, event_date, event_time, note, created_by, created_at)
                           VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())')
                ->execute([$pid, $f['title'], $f['event_date'], $f['event_time'], $f['note'], $p['staff']['id']]);
            $id = (int)$pdo->lastInsertId();
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) { $pdo->rollBack(); }
            throw $e;
        }
        StaffApi::audit($p, 'event.add', "id=$id");
        Response::json(201, ['event' => self::eventRow(self::findEvent($pid, $id))]);
    }

    /** PATCH /staff/events/{id} {title?, date?, time?, note?} */
    public static function editEvent(array $params): void
    {
        $p = StaffApi::ctx(true);
        if ($p === null) { return; }
        $id = StaffApi::idParam($params);
        $b = StaffApi::json();
        if ($b === null) { return; }
        $pid = $p['parish']['id'];
        if ($id === null || self::findEvent($pid, $id) === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        [$f, $errors] = self::eventFields($b, true);
        if (!$errors && !$f) { $errors['title'] = 'Nothing to change.'; }
        if ($errors) { StaffApi::invalid($errors); return; }
        $sets = []; $args = [];
        foreach ($f as $col => $val) { $sets[] = "$col = ?"; $args[] = $val; }
        $args[] = $id; $args[] = $pid;
        Db::pdo()->prepare('UPDATE parish_events SET ' . implode(', ', $sets) . ' WHERE id = ? AND parish_id = ?')->execute($args);
        StaffApi::audit($p, 'event.edit', "id=$id");
        Response::json(200, ['event' => self::eventRow(self::findEvent($pid, $id))]);
    }

    /** DELETE /staff/events/{id} */
    public static function deleteEvent(array $params): void
    {
        $p = StaffApi::ctx(true);
        if ($p === null) { return; }
        $id = StaffApi::idParam($params);
        $pid = $p['parish']['id'];
        if ($id === null || self::findEvent($pid, $id) === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        Db::pdo()->prepare('DELETE FROM parish_events WHERE id = ? AND parish_id = ?')->execute([$id, $pid]);
        StaffApi::audit($p, 'event.delete', "id=$id");
        Response::json(200, ['status' => 'ok']);
    }

    // ---- Staff: announcements -----------------------------------------------------

    private static function announcementRow(array $r): array
    {
        return ['id' => (int)$r['id'], 'text' => $r['body'], 'created_at' => Validate::isoUtc($r['created_at']),
                'expires_at' => Validate::isoUtc($r['expires_at']), 'expired' => (bool)$r['expired']];
    }
    private const ANN_COLS = 'id, body, created_at, expires_at, (expires_at <= UTC_TIMESTAMP()) AS expired';

    private static function findAnnouncement(int $parishId, int $id): ?array
    {
        $st = Db::pdo()->prepare('SELECT ' . self::ANN_COLS . ' FROM parish_announcements WHERE id = ? AND parish_id = ?');
        $st->execute([$id, $parishId]);
        $r = $st->fetch();
        return $r === false ? null : $r;
    }

    /** GET /staff/announcements -- current plus the last week's expired. */
    public static function listAnnouncements(array $params): void
    {
        $p = StaffApi::ctx(false);
        if ($p === null) { return; }
        $st = Db::pdo()->prepare('SELECT ' . self::ANN_COLS . ' FROM parish_announcements
                                  WHERE parish_id = ? AND expires_at > UTC_TIMESTAMP() - INTERVAL 7 DAY ORDER BY expires_at DESC, id DESC');
        $st->execute([$p['parish']['id']]);
        Response::json(200, ['announcements' => array_map([self::class, 'announcementRow'], $st->fetchAll())]);
    }

    /** POST /staff/announcements {text, days?} -- default 7 days, at most 45. */
    public static function createAnnouncement(array $params): void
    {
        $p = StaffApi::ctx(true);
        if ($p === null) { return; }
        $b = StaffApi::json();
        if ($b === null) { return; }
        $errors = [];
        [$text, $e] = Validate::text($b['text'] ?? null, 300); if ($e !== null) { $errors['text'] = $e; }
        [$days, $e] = Validate::days($b['days'] ?? null, 7); if ($e !== null) { $errors['days'] = $e; }
        if ($errors) { StaffApi::invalid($errors); return; }

        $pdo = Db::pdo();
        $pid = $p['parish']['id'];
        $pdo->beginTransaction();
        try {
            $pdo->prepare('SELECT id FROM parishes WHERE id = ? FOR UPDATE')->execute([$pid]);
            $cnt = $pdo->prepare('SELECT COUNT(*) FROM parish_announcements WHERE parish_id = ? AND expires_at > UTC_TIMESTAMP()');
            $cnt->execute([$pid]);
            if ((int)$cnt->fetchColumn() >= self::MAX_ANNOUNCEMENTS) {
                $pdo->rollBack();
                Response::error(409, 'limit_reached', 'A parish can have ' . self::MAX_ANNOUNCEMENTS . ' announcements showing at once. Remove one first.');
                return;
            }
            $pdo->prepare('INSERT INTO parish_announcements (parish_id, body, created_by, created_at, expires_at)
                           VALUES (?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? DAY)')
                ->execute([$pid, $text, $p['staff']['id'], $days]);
            $id = (int)$pdo->lastInsertId();
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) { $pdo->rollBack(); }
            throw $e;
        }
        StaffApi::audit($p, 'announcement.add', "id=$id");
        Response::json(201, ['announcement' => self::announcementRow(self::findAnnouncement($pid, $id))]);
    }

    /** POST /staff/announcements/{id}/extend {days} -- from the later of now and the current expiry. */
    public static function extendAnnouncement(array $params): void
    {
        $p = StaffApi::ctx(true);
        if ($p === null) { return; }
        $id = StaffApi::idParam($params);
        $b = StaffApi::json();
        if ($b === null) { return; }
        $pid = $p['parish']['id'];
        if ($id === null || self::findAnnouncement($pid, $id) === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        [$days, $e] = Validate::days($b['days'] ?? null, null);
        if ($e !== null) { StaffApi::invalid(['days' => $e]); return; }
        Db::pdo()->prepare('UPDATE parish_announcements SET expires_at = GREATEST(expires_at, UTC_TIMESTAMP()) + INTERVAL ? DAY
                            WHERE id = ? AND parish_id = ?')->execute([$days, $id, $pid]);
        StaffApi::audit($p, 'announcement.extend', "id=$id days=$days");
        Response::json(200, ['announcement' => self::announcementRow(self::findAnnouncement($pid, $id))]);
    }

    /** DELETE /staff/announcements/{id} */
    public static function deleteAnnouncement(array $params): void
    {
        $p = StaffApi::ctx(true);
        if ($p === null) { return; }
        $id = StaffApi::idParam($params);
        $pid = $p['parish']['id'];
        if ($id === null || self::findAnnouncement($pid, $id) === null) { Response::error(404, 'not_found', 'Not found.'); return; }
        Db::pdo()->prepare('DELETE FROM parish_announcements WHERE id = ? AND parish_id = ?')->execute([$id, $pid]);
        StaffApi::audit($p, 'announcement.delete', "id=$id");
        Response::json(200, ['status' => 'ok']);
    }

    // ---- Diocesan page: written by a global administrator (any diocese) or by that diocese's own editor ----------

    /**
     * Who may write, and which diocese. The /admin/dioceses/{body}/{name} routes carry the diocese in the URL and
     * need a global administrator (re-checked on every call). The /diocese/... routes carry none: a diocese editor
     * always writes to the diocese on their own session, whatever the client sends. Returns [key, actor] or null
     * after emitting the error.
     */
    private static function dioceseScope(array $params, bool $write): ?array
    {
        $p = Auth::require();
        if ($p === null) { return null; }
        $own = !array_key_exists('body', $params);
        if ($p['type'] !== ($own ? 'diocese' : 'admin')) { Response::error(403, 'forbidden', 'Not allowed.'); return null; }
        if (!$own) {
            $email = Auth::normalizeEmail($p['email'] ?? null);
            if ($email === null || !AdminApi::isAdminEmail($email)) { Response::error(401, 'unauthorized', 'Authentication required.'); return null; }
        }
        if ($write) {
            $rl = RateLimit::hit($own ? 'dioceseWrite' : 'adminwrite', 'session:' . $p['session_id'], 60, self::HOUR);
            if (!$rl['allowed']) { Response::rateLimited($rl['retry_after']); return null; }
        }
        $key = $own ? $p['diocese_key'] : self::dioceseKeyFrom($params);
        if ($key === null) { Response::error(404, 'not_found', 'Not found.'); return null; }
        return [$key, $own ? 'diocese:' . $p['diocese_staff_id'] : 'admin'];
    }

    /** PUT /admin/dioceses/{body}/{name} or PUT /diocese/page {bishop_name, website, convention_dates[]} -- replaces all three. */
    public static function putDiocese(array $params): void
    {
        $scope = self::dioceseScope($params, true);
        if ($scope === null) { return; }
        [$key, $actor] = $scope;
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $errors = [];
        [$bishop, $e] = Validate::text($b['bishop_name'] ?? null, 120, false); if ($e !== null) { $errors['bishop_name'] = $e; }
        [$site, $e] = Validate::url($b['website'] ?? null); if ($e !== null) { $errors['website'] = $e; }
        [$dates, $e] = Validate::lines($b['convention_dates'] ?? null, 6, 120); if ($e !== null) { $errors['convention_dates'] = $e; }
        if ($errors) { Response::error(422, 'invalid_input', 'Invalid input.', $errors); return; }
        Db::pdo()->prepare('INSERT INTO dioceses (diocese_key, bishop_name, website, convention_dates, updated_at)
                            VALUES (?, ?, ?, ?, UTC_TIMESTAMP())
                            ON DUPLICATE KEY UPDATE bishop_name = VALUES(bishop_name), website = VALUES(website),
                                                    convention_dates = VALUES(convention_dates), updated_at = UTC_TIMESTAMP()')
            ->execute([$key, $bishop, $site, Validate::joinLines($dates)]);
        Audit::log($actor, null, 'diocese.put', $key);
        Response::json(200, ['status' => 'ok']);
    }

    /** POST /admin/dioceses/{body}/{name}/prayers or POST /diocese/prayers {text, days?} */
    public static function addDiocesePrayer(array $params): void
    {
        $scope = self::dioceseScope($params, true);
        if ($scope === null) { return; }
        [$key, $actor] = $scope;
        [$b] = Request::jsonBody();
        if ($b === null) { Response::error(400, 'bad_request', 'Bad request.'); return; }
        $errors = [];
        [$text, $e] = Validate::text($b['text'] ?? null, 200); if ($e !== null) { $errors['text'] = $e; }
        [$days, $e] = Validate::days($b['days'] ?? null, 21); if ($e !== null) { $errors['days'] = $e; }
        if ($errors) { Response::error(422, 'invalid_input', 'Invalid input.', $errors); return; }
        $pdo = Db::pdo();
        $cnt = $pdo->prepare('SELECT COUNT(*) FROM diocese_prayers WHERE diocese_key = ? AND expires_at > UTC_TIMESTAMP()');
        $cnt->execute([$key]);
        if ((int)$cnt->fetchColumn() >= self::MAX_DIOCESE_PRAYERS) {
            Response::error(409, 'limit_reached', 'This diocese already has ' . self::MAX_DIOCESE_PRAYERS . ' prayer items.');
            return;
        }
        $pdo->prepare('INSERT INTO diocese_prayers (diocese_key, body, created_at, expires_at)
                       VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? DAY)')->execute([$key, $text, $days]);
        $id = (int)$pdo->lastInsertId();
        Audit::log($actor, null, 'diocese.prayer.add', "id=$id");
        Response::json(201, ['prayer' => ['id' => $id, 'text' => $text]]);
    }

    /** DELETE /admin/dioceses/{body}/{name}/prayers/{id} or DELETE /diocese/prayers/{id} */
    public static function deleteDiocesePrayer(array $params): void
    {
        $scope = self::dioceseScope($params, true);
        if ($scope === null) { return; }
        [$key, $actor] = $scope;
        $id = (string)($params['id'] ?? '');
        if (!ctype_digit($id) || strlen($id) > 18) { Response::error(404, 'not_found', 'Not found.'); return; }
        $n = Db::pdo()->prepare('DELETE FROM diocese_prayers WHERE id = ? AND diocese_key = ?');
        $n->execute([(int)$id, $key]);
        if ($n->rowCount() === 0) { Response::error(404, 'not_found', 'Not found.'); return; }
        Audit::log($actor, null, 'diocese.prayer.delete', "id=$id");
        Response::json(200, ['status' => 'ok']);
    }
}
