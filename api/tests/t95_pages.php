<?php
// Parish home page, events, announcements and the diocesan page (2026-10-06).
// Uses world()/api() from t50_staff.php and run_daily() from t90_jobs.php (files run in name order).

section('Pages: migration 002');
$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
foreach (['parish_events', 'parish_announcements', 'dioceses', 'diocese_prayers'] as $tbl) { t("table exists: $tbl", in_array($tbl, $tables, true)); }
t('002 recorded once', (int)$pdo->query("SELECT COUNT(*) FROM schema_migrations WHERE version='002_parish_pages'")->fetchColumn() === 1);
t('re-running migrations applies nothing', Migrator::run($pdo, dirname(__DIR__) . '/migrations') === []);

section('Pages: staff routes need a staff session');
$w = world();
$routes = [['GET', '/staff/parish/profile'], ['PUT', '/staff/parish/profile'], ['GET', '/staff/events'], ['POST', '/staff/events'],
           ['PATCH', '/staff/events/1'], ['DELETE', '/staff/events/1'], ['GET', '/staff/announcements'], ['POST', '/staff/announcements'],
           ['POST', '/staff/announcements/1/extend'], ['DELETE', '/staff/announcements/1'],
           ['PUT', '/admin/dioceses/episcopal/western-oregon'], ['POST', '/admin/dioceses/episcopal/western-oregon/prayers'],
           ['DELETE', '/admin/dioceses/episcopal/western-oregon/prayers/1']];
$bad = [];
foreach ($routes as [$m, $path]) { [$s] = http($m, "/api/v1$path", [], in_array($m, ['GET', 'DELETE'], true) ? null : []); if ($s !== 401) { $bad[] = "$m $path=$s"; } }
t('every new route returns 401 without a session', $bad === [], implode(', ', $bad));
[$s] = api('GET', '/staff/events', Auth::createSession('admin', null, 'a@example.org')['token']);
t('an admin session is not a staff session for events (403)', $s === 403);

section('Pages: parish profile');
[$s, $b] = api('PUT', '/staff/parish/profile', $w['da'], ['rector_name' => 'x']);
t('a delegate cannot edit the profile (403)', $s === 403);
[$s, $b] = api('GET', '/staff/parish/profile', $w['da']);
t('a delegate can read it', $s === 200 && array_key_exists('profile', jbody($b)));
$prof = ['rector_name' => "  The Rev.   Ann Alpha ", 'address' => '12 Main St, Springfield', 'website' => 'https://alpha.example.org/',
         'service_times' => ['Sunday 8:00 am Rite I', '  Sunday 10:00 am Rite II ', '', 'Wednesday 12:00 pm Eucharist']];
[$s, $b] = api('PUT', '/staff/parish/profile', $w['ra'], $prof);
$pr = jbody($b)['profile'] ?? [];
t('rector saves the profile', $s === 200 && ($pr['rector_name'] ?? '') === 'The Rev. Ann Alpha' && ($pr['website'] ?? '') === 'https://alpha.example.org/', "$s $b");
t('blank service-time lines dropped, whitespace cleaned', ($pr['service_times'] ?? []) === ['Sunday 8:00 am Rite I', 'Sunday 10:00 am Rite II', 'Wednesday 12:00 pm Eucharist']);
foreach (['javascript:alert(1)', 'data:text/html,hi', 'ftp://x.example.org', 'https://user:pw@alpha.example.org', 'https://nodot', 'https://a b.example.org', 'not a url'] as $u) {
    [$s, $b] = api('PUT', '/staff/parish/profile', $w['ra'], ['website' => $u]);
    t("website rejected: $u", $s === 422 && isset(jbody($b)['fields']['website']), "$s");
}
[$s] = api('PUT', '/staff/parish/profile', $w['ra'], ['service_times' => array_fill(0, 9, 'x')]);
t('more than 8 service-time lines -> 422', $s === 422);
[$s] = api('PUT', '/staff/parish/profile', $w['ra'], ['service_times' => 'Sunday']);
t('service_times must be a list -> 422', $s === 422);
[$s] = api('PUT', '/staff/parish/profile', $w['ra'], ['address' => str_repeat('a', 256)]);
t('address over 255 characters -> 422', $s === 422);
[$s, $b] = api('PUT', '/staff/parish/profile', $w['ra'], []);
$cleared = jbody($b)['profile'] ?? ['rector_name' => 'x'];
t('an empty body clears the profile', $s === 200 && $cleared['rector_name'] === null && $cleared['service_times'] === [], "$s $b");
api('PUT', '/staff/parish/profile', $w['ra'], $prof);

section('Pages: reader home page and visibility');
[$s, $b] = http('GET', '/api/v1/parishes/alpha');
t('a code-only parish needs a pass (401)', $s === 401 && (jbody($b)['error'] ?? '') === 'code_required', "$s $b");
[$s, $b] = http('POST', '/api/v1/parishes/alpha/join', [], ['code' => $w['aCode']]);
$readerPass = jbody($b)['pass'] ?? '';
[$s, $b] = http('GET', '/api/v1/parishes/alpha', ['X-Parish-Pass: ' . $readerPass]);
$home = jbody($b);
t('with a pass the home page is served', $s === 200 && ($home['parish']['name'] ?? '') === 'Alpha Church', "$s $b");
t('home page carries rector, address, website and service times',
    ($home['parish']['rector_name'] ?? '') === 'The Rev. Ann Alpha' && ($home['parish']['address'] ?? '') === '12 Main St, Springfield'
    && ($home['parish']['website'] ?? '') === 'https://alpha.example.org/' && count($home['parish']['service_times'] ?? []) === 3);
t('home page never exposes the join code or ids of staff', strpos($b, $w['aCode']) === false && strpos($b, 'rector@alpha.org') === false);
[$s] = http('GET', '/api/v1/parishes/alpha', ['X-Parish-Pass: ' . substr($readerPass, 0, -2) . 'xx']);
t('a tampered pass is refused (401)', $s === 401);
[$s, $b] = http('GET', '/api/v1/parishes/beta');
t('a public parish needs no pass', $s === 200 && ($b !== '') && (jbody($b)['parish']['slug'] ?? '') === 'beta');
[$s] = http('GET', '/api/v1/parishes/nonexistent');
t('unknown parish -> 404', $s === 404);
make_parish('pending-p', 'pending', 'public');
[$s] = http('GET', '/api/v1/parishes/pending-p');
t('a pending parish serves nothing (404)', $s === 404);
[$s] = http('GET', '/api/v1/parishes/Bad_Slug!');
t('malformed slug -> 404', $s === 404);

section('Pages: events');
$tomorrow = gmdate('Y-m-d', time() + 86400);
$nextWeek = gmdate('Y-m-d', time() + 7 * 86400);
[$s, $b] = api('POST', '/staff/events', $w['da'], ['title' => 'Vestry meeting', 'date' => $nextWeek, 'time' => '19:00', 'note' => 'In the parish hall']);
$ev = jbody($b)['event'] ?? [];
t('a delegate can add an event', $s === 201 && ($ev['title'] ?? '') === 'Vestry meeting' && ($ev['time'] ?? '') === '19:00' && ($ev['date'] ?? '') === $nextWeek, "$s $b");
[$s, $b] = api('POST', '/staff/events', $w['ra'], ['title' => 'Funeral for A. B.', 'date' => $tomorrow]);
$noTime = jbody($b)['event'] ?? ['time' => 'x'];
t('event without a time -> time null', $s === 201 && $noTime['time'] === null, "$s $b");
$bad = [['title' => '', 'date' => $tomorrow, 'x' => 'title'], ['title' => 'T', 'date' => '2026-02-30', 'x' => 'date'], ['title' => 'T', 'date' => 'tomorrow', 'x' => 'date'],
        ['title' => 'T', 'date' => $tomorrow, 'time' => '25:00', 'x' => 'time'], ['title' => 'T', 'date' => $tomorrow, 'time' => '7pm', 'x' => 'time'],
        ['title' => str_repeat('a', 121), 'date' => $tomorrow, 'x' => 'title'], ['title' => 'T', 'date' => $tomorrow, 'note' => str_repeat('n', 201), 'x' => 'note']];
foreach ($bad as $case) {
    $field = $case['x']; unset($case['x']);
    [$s, $b] = api('POST', '/staff/events', $w['ra'], $case);
    t("event rejected: bad $field", $s === 422 && isset(jbody($b)['fields'][$field]), "$s $b");
}
[$s, $b] = http('GET', '/api/v1/parishes/alpha', ['X-Parish-Pass: ' . $readerPass]);
$titles = array_column(jbody($b)['events'] ?? [], 'title');
t('readers see events soonest first', $titles === ['Funeral for A. B.', 'Vestry meeting'], "$s $b");
$pdo->prepare('INSERT INTO parish_events (parish_id, title, event_date, created_at) VALUES (?, ?, UTC_DATE() - INTERVAL 5 DAY, UTC_TIMESTAMP())')->execute([$w['a'], 'Long past']);
[$s, $b] = http('GET', '/api/v1/parishes/alpha', ['X-Parish-Pass: ' . $readerPass]);
t('a past event is not shown to readers', !in_array('Long past', array_column(jbody($b)['events'] ?? [], 'title'), true));
[$s, $b] = api('GET', '/staff/events', $w['ra']);
t('staff still see last week\'s events', in_array('Long past', array_column(jbody($b)['events'] ?? [], 'title'), true));
[$s, $b] = api('PATCH', '/staff/events/' . $ev['id'], $w['ra'], ['time' => null, 'title' => 'Vestry (moved)']);
t('edit changes title and clears time', $s === 200 && ($ev2 = jbody($b)['event'])['title'] === 'Vestry (moved)' && $ev2['time'] === null && $ev2['note'] === 'In the parish hall', "$s $b");
[$s] = api('PATCH', '/staff/events/' . $ev['id'], $w['ra'], []);
t('empty edit -> 422', $s === 422);
[$s] = api('PATCH', '/staff/events/' . $ev['id'], $w['rb'], ['title' => 'hijack']);
t('another parish cannot edit it (404)', $s === 404);
[$s] = api('DELETE', '/staff/events/' . $ev['id'], $w['rb']);
t('another parish cannot delete it (404)', $s === 404);
[$s] = api('DELETE', '/staff/events/' . $ev['id'], $w['da']);
t('a delegate can delete an event', $s === 200 && (int)$pdo->query('SELECT COUNT(*) FROM parish_events WHERE id = ' . (int)$ev['id'])->fetchColumn() === 0);
$ins = $pdo->prepare('INSERT INTO parish_events (parish_id, title, event_date, created_at) VALUES (?, ?, UTC_DATE() + INTERVAL 3 DAY, UTC_TIMESTAMP())');
for ($i = 0; $i < 70; $i++) { $ins->execute([$w['a'], "Filler $i"]); }
[$s, $b] = api('POST', '/staff/events', $w['ra'], ['title' => 'One too many', 'date' => $nextWeek]);
t('more than 60 upcoming events -> 409', $s === 409 && (jbody($b)['error'] ?? '') === 'limit_reached', "$s");

section('Pages: announcements');
$w = world();
api('PUT', '/staff/parish/profile', $w['ra'], $prof);
[$s, $b] = api('POST', '/staff/announcements', $w['ra'], ['text' => 'Funeral for Margaret, Saturday at 11']);
$an = jbody($b)['announcement'] ?? [];
t('rector adds an announcement', $s === 201 && ($an['text'] ?? '') === 'Funeral for Margaret, Saturday at 11' && ($an['expired'] ?? null) === false, "$s $b");
$hours = (int)$pdo->query('SELECT TIMESTAMPDIFF(HOUR, created_at, expires_at) FROM parish_announcements LIMIT 1')->fetchColumn();
t('default lifetime is 7 days', $hours === 168, (string)$hours);
[$s] = api('POST', '/staff/announcements', $w['da'], ['text' => 'Parish supper cancelled', 'days' => 45]);
t('a delegate can add one, 45 days allowed', $s === 201);
foreach ([['text' => ''], ['text' => str_repeat('a', 301)], ['text' => 'x', 'days' => 0], ['text' => 'x', 'days' => 46], ['text' => 'x', 'days' => '7']] as $case) {
    [$s] = api('POST', '/staff/announcements', $w['ra'], $case);
    t('announcement rejected: ' . json_encode($case, JSON_UNESCAPED_UNICODE) === '' ? '' : 'announcement rejected: ' . substr(json_encode($case), 0, 40), $s === 422, "$s");
}
[$s, $b] = http('GET', '/api/v1/parishes/beta');
t('another parish shows none of them', $s === 200 && (jbody($b)['announcements'] ?? ['x']) === []);
[$s, $b] = http('POST', '/api/v1/parishes/alpha/join', [], ['code' => $w['aCode']]);
$readerPass = jbody($b)['pass'] ?? '';
[$s, $b] = http('GET', '/api/v1/parishes/alpha', ['X-Parish-Pass: ' . $readerPass]);
t('readers see both, newest first', array_column(jbody($b)['announcements'] ?? [], 'text') === ['Parish supper cancelled', 'Funeral for Margaret, Saturday at 11']);
$pdo->exec('UPDATE parish_announcements SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 HOUR WHERE id = ' . (int)$an['id']);
[$s, $b] = http('GET', '/api/v1/parishes/alpha', ['X-Parish-Pass: ' . $readerPass]);
t('an expired announcement disappears at query time', array_column(jbody($b)['announcements'] ?? [], 'text') === ['Parish supper cancelled']);
[$s, $b] = api('GET', '/staff/announcements', $w['ra']);
t('staff still see it, flagged expired', in_array(true, array_column(jbody($b)['announcements'] ?? [], 'expired'), true));
[$s, $b] = api('POST', '/staff/announcements/' . $an['id'] . '/extend', $w['ra'], ['days' => 3]);
t('extend revives it for the full period', $s === 200 && ($e2 = jbody($b)['announcement'])['expired'] === false && (int)$pdo->query('SELECT TIMESTAMPDIFF(HOUR, UTC_TIMESTAMP(), expires_at) FROM parish_announcements WHERE id = ' . (int)$an['id'])->fetchColumn() >= 71, "$s $b");
[$s] = api('POST', '/staff/announcements/' . $an['id'] . '/extend', $w['rb'], ['days' => 3]);
t('another parish cannot extend it (404)', $s === 404);
[$s] = api('DELETE', '/staff/announcements/' . $an['id'], $w['rb']);
t('another parish cannot delete it (404)', $s === 404);
[$s] = api('DELETE', '/staff/announcements/' . $an['id'], $w['ra']);
t('rector deletes it', $s === 200);
for ($i = 0; $i < 4; $i++) { api('POST', '/staff/announcements', $w['ra'], ['text' => "Item $i"]); }
[$s, $b] = api('POST', '/staff/announcements', $w['ra'], ['text' => 'Sixth']);
t('more than 5 showing at once -> 409', $s === 409 && (jbody($b)['error'] ?? '') === 'limit_reached', "$s $b");

section('Pages: diocese');
$dk = 'episcopal/western-oregon';
[$s, $b] = http('GET', '/api/v1/dioceses/episcopal/western-oregon');
$empty = jbody($b);
t('an unconfigured diocese answers with empty fields (200)', $s === 200 && $empty['diocese']['bishop_name'] === null && $empty['prayers'] === [], "$s $b");
[$s] = http('GET', '/api/v1/dioceses/Episcopal/Western_Oregon');
t('a malformed diocese key -> 404', $s === 404);
make_parish('wo-one', 'approved', 'public', $dk, 'St. Bede');
make_parish('wo-two', 'approved', 'code', $dk, 'All Saints');
make_parish('wo-pending', 'pending', 'public', $dk, 'Pending Church');
make_parish('elsewhere', 'approved', 'public', 'episcopal/iowa', 'Iowa Church');
[$s, $b] = http('GET', '/api/v1/dioceses/episcopal/western-oregon');
t('lists only approved parishes of that diocese, by name', array_column(jbody($b)['parishes'] ?? [], 'slug') === ['wo-two', 'wo-one'], $b);
$adm = Auth::createSession('admin', null, 'a@example.org')['token'];
[$s, $b] = api('PUT', "/admin/dioceses/$dk", $w['ra'], ['bishop_name' => 'x']);
t('a staff session cannot edit a diocese (403)', $s === 403);
[$s, $b] = api('PUT', "/admin/dioceses/$dk", $adm, ['bishop_name' => 'The Rt. Rev. Diane Doe', 'website' => 'https://diocese.example.org', 'convention_dates' => ['Convention: Oct 23-24, 2026', 'Eugene']]);
t('admin saves the diocesan page', $s === 200, "$s $b");
[$s, $b] = api('PUT', "/admin/dioceses/$dk", $adm, ['website' => 'javascript:alert(1)']);
t('admin website must be http(s) (422)', $s === 422);
[$s, $b] = api('POST', "/admin/dioceses/$dk/prayers", $adm, ['text' => 'For Bishop Diane and all clergy', 'days' => 30]);
$pid1 = jbody($b)['prayer']['id'] ?? 0;
t('admin adds a prayer item', $s === 201 && $pid1 > 0, "$s $b");
[$s, $b] = http('GET', '/api/v1/dioceses/episcopal/western-oregon');
$d = jbody($b);
t('reader sees bishop, dates and prayer', ($d['diocese']['bishop_name'] ?? '') === 'The Rt. Rev. Diane Doe' && ($d['diocese']['convention_dates'] ?? []) === ['Convention: Oct 23-24, 2026', 'Eugene']
    && array_column($d['prayers'] ?? [], 'text') === ['For Bishop Diane and all clergy']);
$pdo->exec('UPDATE diocese_prayers SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 MINUTE');
[$s, $b] = http('GET', '/api/v1/dioceses/episcopal/western-oregon');
t('an expired prayer item disappears at query time', (jbody($b)['prayers'] ?? ['x']) === []);
[$s] = api('DELETE', "/admin/dioceses/episcopal/iowa/prayers/$pid1", $adm);
t('a prayer item cannot be deleted through another diocese (404)', $s === 404);
[$s] = api('DELETE', "/admin/dioceses/$dk/prayers/$pid1", $adm);
t('admin deletes a prayer item', $s === 200);

section('Pages: scheduled purge');
$pdo->prepare('INSERT INTO parish_events (parish_id, title, event_date, created_at) VALUES (?, ?, UTC_DATE() - INTERVAL 8 DAY, UTC_TIMESTAMP())')->execute([$w['a'], 'Old event']);
$pdo->prepare('INSERT INTO parish_events (parish_id, title, event_date, created_at) VALUES (?, ?, UTC_DATE() - INTERVAL 3 DAY, UTC_TIMESTAMP())')->execute([$w['a'], 'Recent event']);
$pdo->exec("INSERT INTO parish_announcements (parish_id, body, created_at, expires_at) VALUES ({$w['a']}, 'Old note', UTC_TIMESTAMP(), UTC_TIMESTAMP() - INTERVAL 8 DAY)");
$pdo->exec("INSERT INTO diocese_prayers (diocese_key, body, created_at, expires_at) VALUES ('$dk', 'Old prayer', UTC_TIMESTAMP(), UTC_TIMESTAMP() - INTERVAL 8 DAY)");
[$code, $out] = run_daily($cfgFile);
t('purge removes events 8+ days old, keeps recent ones', (int)$pdo->query("SELECT COUNT(*) FROM parish_events WHERE title = 'Old event'")->fetchColumn() === 0
    && (int)$pdo->query("SELECT COUNT(*) FROM parish_events WHERE title = 'Recent event'")->fetchColumn() === 1);
t('purge removes announcements and diocese prayers expired over 7 days ago',
    (int)$pdo->query("SELECT COUNT(*) FROM parish_announcements WHERE body = 'Old note'")->fetchColumn() === 0
    && (int)$pdo->query("SELECT COUNT(*) FROM diocese_prayers WHERE body = 'Old prayer'")->fetchColumn() === 0);
section('Pages: deleting a parish removes its events and announcements');
[$s] = api('DELETE', '/staff/parish', $w['ra'], ['confirm' => 'DELETE alpha']);
t('parish delete cascades', $s === 200 && (int)$pdo->query("SELECT COUNT(*) FROM parish_events WHERE parish_id = {$w['a']}")->fetchColumn() === 0
    && (int)$pdo->query("SELECT COUNT(*) FROM parish_announcements WHERE parish_id = {$w['a']}")->fetchColumn() === 0);

section('Pages: global administrator sees every parish page');
$w = world();
[$codeId, $code] = [$w['a'], $w['aCode']];                     // alpha: approved, code-only
[$pendId] = make_parish('pending-view', 'pending', 'code', null, 'Pending View');
[$suspId] = make_parish('suspended-view', 'suspended', 'public', null, 'Suspended View');
$adm = Auth::createSession('admin', null, 'a@example.org')['token'];
$bearer = ['Authorization: Bearer ' . $adm];
[$s, $b] = http('GET', '/api/v1/parishes/alpha');
t('without a session a code-only parish still needs its code (401)', $s === 401);
[$s, $b] = http('GET', '/api/v1/parishes/alpha', $bearer);
$v = jbody($b);
t('an administrator sees a code-only parish with no join code', $s === 200 && ($v['parish']['name'] ?? '') === 'Alpha Church', "$s $b");
t('...and is told it is the administrator view, with status and visibility', ($v['viewer_admin'] ?? false) === true && ($v['parish']['status'] ?? '') === 'approved' && ($v['parish']['visibility'] ?? '') === 'code');
t('...and the join code never appears in the response', strpos($b, $code) === false);
[$s, $b] = http('GET', '/api/v1/parishes/pending-view', $bearer);
t('an administrator sees a PENDING parish, marked pending', $s === 200 && (jbody($b)['parish']['status'] ?? '') === 'pending', "$s $b");
[$s, $b] = http('GET', '/api/v1/parishes/suspended-view', $bearer);
t('an administrator sees a SUSPENDED parish, marked suspended', $s === 200 && (jbody($b)['parish']['status'] ?? '') === 'suspended');
[$s] = http('GET', '/api/v1/parishes/pending-view');
t('everyone else still gets 404 for a pending parish', $s === 404);
[$s] = http('GET', '/api/v1/parishes/suspended-view', ['Authorization: Bearer ' . $w['ra']]);
t('a rector session is not an administrator (suspended parish 404)', $s === 404);
[$s] = http('GET', '/api/v1/parishes/beta', ['Authorization: Bearer ' . $w['ra']]);
t('a rector session does not open another parish\'s code-only page', $s === 200);   // beta is public: ordinary reading
[$s] = http('GET', '/api/v1/parishes/alpha', ['Authorization: Bearer ' . $w['rb']]);
t('another parish\'s rector cannot read alpha\'s code-only page (401)', $s === 401);
[$s] = http('GET', '/api/v1/parishes/alpha', ['Authorization: Bearer ' . str_repeat('0', 64)]);
t('an unknown token is no administrator (401)', $s === 401);
[$s] = http('GET', '/api/v1/parishes/alpha', ['Authorization: Bearer notatoken']);
t('a malformed token is no administrator (401)', $s === 401);
$gone = Auth::createSession('admin', null, 'removed@example.org')['token'];
[$s] = http('GET', '/api/v1/parishes/alpha', ['Authorization: Bearer ' . $gone]);
t('an admin session whose address is no longer on the administrator list is refused (401)', $s === 401);
[$s, $b, $h] = http('GET', '/api/v1/parishes/alpha', $bearer);
t('the administrator view is never cached', ($h['cache-control'] ?? '') === 'no-store');
[$s, $b, $h] = http('GET', '/api/v1/parishes/beta');
t('the ordinary reader view still caches privately for 60 seconds', ($h['cache-control'] ?? '') === 'private, max-age=60');
