<?php
// Diocesan sign-in (migration 005): an administrator designates an editor for ONE diocese; that person signs in
// and keeps only that diocese's page. Nobody can claim a diocese for themselves, and removing an editor ends
// their access at once.
function dpost(string $path, array $body = [], array $h = []): array { return http('POST', "/api/v1$path", $h, $body); }
function dbearer(string $t): array { return ['Authorization: Bearer ' . $t]; }
$DA = 'episcopal/western-oregon';
$DB = 'episcopal/iowa';

section('Diocese sign-in: migration 005');
reset_state();
t('table exists: diocese_staff', in_array('diocese_staff', $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN), true));
t('005 recorded once', (int)$pdo->query("SELECT COUNT(*) FROM schema_migrations WHERE version='005_diocese_staff'")->fetchColumn() === 1);

section('Diocese sign-in: only an administrator designates editors');
$owner = Auth::createSession('admin', null, 'a@example.org')['token'];
$ob = dbearer($owner);
[$pid] = make_parish('dio-p', 'approved', 'code', null, 'Dio Parish');
make_staff($pid, 'rector@dio.org', 'rector');
$rector = login_as('rector@dio.org');
$bad = [];
foreach ([['GET', "/admin/dioceses/$DA/editors"], ['POST', "/admin/dioceses/$DA/editors"], ['DELETE', '/admin/diocese-editors/1']] as [$m, $path]) {
    [$s] = http($m, "/api/v1$path", [], $m === 'POST' ? [] : null); if ($s !== 401) { $bad[] = "$m $path=$s"; }
    [$s] = http($m, "/api/v1$path", dbearer($rector), $m === 'POST' ? [] : null); if ($s !== 403) { $bad[] = "rector $m $path=$s"; }
}
t('the editor routes need an administrator (401 without a session, 403 for a rector)', $bad === [], implode(', ', $bad));
foreach ([[], ['email' => 'nope'], ['email' => "x@y.org\r\nBcc: e@evil.org"], ['email' => ['a@b.org']]] as $case) {
    [$s] = http('POST', "/api/v1/admin/dioceses/$DA/editors", $ob, $case);
    t('designating rejected: ' . substr(json_encode($case), 0, 40), $s === 422, "$s");
}
[$s] = http('POST', '/api/v1/admin/dioceses/Bad_Key/x/editors', $ob, ['email' => 'b@x.org']);
t('a malformed diocese key -> 404', $s === 404);
mail_reset();
[$s, $b] = http('POST', "/api/v1/admin/dioceses/$DA/editors", $ob, ['email' => '  Bishop.Office@Example.ORG ']);
$ed = jbody($b)['editor'] ?? [];
t('an administrator designates an editor (address cleaned)', $s === 201 && ($ed['email'] ?? '') === 'bishop.office@example.org' && ($ed['id'] ?? 0) > 0, "$s $b");
$msgs = array_values(array_filter(mail_messages(), fn($m) => $m['to'] === 'bishop.office@example.org'));
t('the editor is emailed how to sign in, with no code in it', count($msgs) === 1 && strpos($msgs[0]['body'], '/parish/diocese-admin.html') !== false && !preg_match('/\b\d{6}\b/', $msgs[0]['body']));
[$s] = http('POST', "/api/v1/admin/dioceses/$DB/editors", $ob, ['email' => 'bishop.office@example.org']);
t('one address keeps at most one diocese (409)', $s === 409);
t('the audit log records ids only, never the address', (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE action = 'diocese.editor.add' AND detail LIKE '%@%'")->fetchColumn() === 0);
[$s, $b] = http('GET', "/api/v1/admin/dioceses/$DA/editors", $ob);
t('the list shows the editor for that diocese only', $s === 200 && count(jbody($b)['editors'] ?? []) === 1);
[$s, $b] = http('GET', "/api/v1/admin/dioceses/$DB/editors", $ob);
t('...and nothing for another', $s === 200 && count(jbody($b)['editors'] ?? ['x']) === 0);

section('Diocese sign-in: emailed code');
$pdo->exec('TRUNCATE TABLE rate_limits');
mail_reset();
[$s, $b1] = dpost('/diocese/auth/request-code', ['email' => 'bishop.office@example.org']);
$code = last_code('bishop.office@example.org');
t('a designated address is sent a code', $s === 200 && $code !== null);
mail_reset();
[$s, $b2] = dpost('/diocese/auth/request-code', ['email' => 'stranger@example.org']);
t('a stranger gets the identical answer and no mail', $s === 200 && $b1 === $b2 && last_code('stranger@example.org') === null);
[$s] = dpost('/diocese/auth/request-code', ['email' => 'not-an-email']);
t('a bad address -> 422', $s === 422);
[$s] = dpost('/diocese/auth/verify-code', ['email' => 'bishop.office@example.org', 'code' => '000000']);
t('a wrong code -> 401', $s === 401);
[$s] = dpost('/diocese/auth/verify-code', ['email' => 'stranger@example.org', 'code' => $code]);
t('the code is useless for another address (401)', $s === 401);
mail_reset(); dpost('/diocese/auth/request-code', ['email' => 'bishop.office@example.org']);
$code = last_code('bishop.office@example.org');
[$s, $b] = dpost('/diocese/auth/verify-code', ['email' => 'bishop.office@example.org', 'code' => $code]);
$j = jbody($b); $tok = $j['token'] ?? '';
t('the right code signs in, naming the diocese', $s === 200 && strlen($tok) === 64 && ($j['diocese']['key'] ?? '') === $DA, "$s $b");
[$s] = dpost('/diocese/auth/verify-code', ['email' => 'bishop.office@example.org', 'code' => $code]);
t('the code works only once', $s === 401);
mail_reset(); dpost('/reader/request-code', ['email' => 'bishop.office@example.org']);
[$s] = dpost('/diocese/auth/verify-code', ['email' => 'bishop.office@example.org', 'code' => (string)last_code('bishop.office@example.org')]);
t('a reader code cannot sign in as a diocese editor (401)', $s === 401);
[$s, $b] = http('GET', '/api/v1/me', dbearer($tok));
t('/me names the diocese editor and their diocese', $s === 200 && (jbody($b)['principal'] ?? '') === 'diocese' && (jbody($b)['diocese_key'] ?? '') === $DA, "$s $b");

section('Diocese sign-in: the editor keeps their own diocese, and only theirs');
$eb = dbearer($tok);
[$s] = http('PUT', '/api/v1/diocese/page', $eb, ['bishop_name' => 'The Rt. Rev. Test', 'website' => 'https://diocese.example.org', 'convention_dates' => ['Convention: 1 Nov']]);
t('the editor saves the page', $s === 200);
[$s, $b] = http('GET', "/api/v1/dioceses/$DA");
t('...and readers see it', $s === 200 && (jbody($b)['diocese']['bishop_name'] ?? '') === 'The Rt. Rev. Test');
[$s] = http('PUT', '/api/v1/diocese/page', $eb, ['bishop_name' => 'x', 'key' => $DB, 'diocese_key' => $DB]);
t('a key in the body is ignored: the diocese comes from the session', $s === 200 && (int)$pdo->query("SELECT COUNT(*) FROM dioceses WHERE diocese_key = '$DB'")->fetchColumn() === 0);
[$s] = http('PUT', "/api/v1/admin/dioceses/$DB", $eb, ['bishop_name' => 'x']);
t('the editor cannot use an administrator route (403)', $s === 403);
[$s] = http('GET', "/api/v1/admin/dioceses/$DA/editors", $eb);
t('...nor list or add editors (403)', $s === 403);
[$s] = http('GET', '/api/v1/admin/parishes', $eb);
t('...nor manage parishes (403)', $s === 403);
[$s] = http('GET', '/api/v1/staff/intentions', $eb);
t('...nor reach a parish dashboard (not a staff session)', $s === 403 || $s === 401);
[$s, $b] = http('GET', '/api/v1/parishes/dio-p', $eb);
t('...nor open a code-only parish page (an editor is treated as any reader)', $s === 403 || $s === 404 || (jbody($b)['locked'] ?? true) === true || !isset(jbody($b)['events']), "$s");
[$s] = http('PUT', '/api/v1/diocese/page', $eb, ['bishop_name' => str_repeat('x', 500)]);
t('an over-long value -> 422', $s === 422);
[$s] = http('PUT', '/api/v1/diocese/page', [], ['bishop_name' => 'x']);
t('writing without a session -> 401', $s === 401);
[$s] = http('PUT', '/api/v1/diocese/page', dbearer($owner), ['bishop_name' => 'x']);
t('an administrator session cannot use the editor route (403)', $s === 403);

[$s, $b] = http('POST', '/api/v1/diocese/prayers', $eb, ['text' => "For all clergy <b>and</b> people", 'days' => 5]);
$pr = jbody($b)['prayer'] ?? [];
t('the editor adds a prayer item', $s === 201 && ($pr['id'] ?? 0) > 0, "$s $b");
t('...stored under their own diocese', (int)$pdo->query("SELECT COUNT(*) FROM diocese_prayers WHERE id = " . (int)$pr['id'] . " AND diocese_key = '$DA'")->fetchColumn() === 1);
$pdo->prepare('INSERT INTO diocese_prayers (diocese_key, body, created_at, expires_at) VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL 5 DAY)')->execute([$DB, 'Iowa item']);
$otherId = (int)$pdo->lastInsertId();
[$s] = http('DELETE', "/api/v1/diocese/prayers/$otherId", $eb);
t('the editor cannot remove another diocese\'s item (404)', $s === 404 && (int)$pdo->query("SELECT COUNT(*) FROM diocese_prayers WHERE id = $otherId")->fetchColumn() === 1);
[$s] = http('DELETE', '/api/v1/diocese/prayers/abc', $eb);
t('a non-numeric id -> 404', $s === 404);
[$s] = http('DELETE', '/api/v1/diocese/prayers/' . $pr['id'], $eb);
t('the editor removes their own item', $s === 200);
[$s] = dpost('/diocese/prayers', ['text' => ''], $eb);
t('an empty item -> 422', $s === 422);
t('the audit log names the editor by id, never the address', (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE actor LIKE 'diocese:%' AND action = 'diocese.put'")->fetchColumn() >= 1
    && (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE (actor LIKE '%@%' OR detail LIKE '%@%')")->fetchColumn() === 0);

section('Diocese sign-in: password sign-in and sessions for the diocese role');
$pdo->exec('TRUNCATE TABLE rate_limits');
$tok2 = (function () { mail_reset(); dpost('/diocese/auth/request-code', ['email' => 'bishop.office@example.org']); return jbody(dpost('/diocese/auth/verify-code', ['email' => 'bishop.office@example.org', 'code' => (string)last_code('bishop.office@example.org')])[1])['token'] ?? ''; })();
[$s] = http('POST', '/api/v1/account/password', dbearer($tok2), ['password' => 'seven quiet candles at dusk']);
t('an editor can add an optional password', $s === 200);
[$s] = http('GET', '/api/v1/me', $eb);
t('...which signed out their other device', $s === 401);
[$s, $b] = dpost('/auth/password-login', ['email' => 'bishop.office@example.org', 'password' => 'seven quiet candles at dusk', 'as' => 'diocese']);
t('the password signs in as a diocese editor', $s === 200 && (jbody($b)['principal'] ?? '') === 'diocese', "$s $b");
[$s] = dpost('/auth/password-login', ['email' => 'bishop.office@example.org', 'password' => 'seven quiet candles at dusk', 'as' => 'admin']);
t('...but not as an administrator (401)', $s === 401);
[$s] = dpost('/auth/password-login', ['email' => 'stranger@example.org', 'password' => 'seven quiet candles at dusk', 'as' => 'diocese']);
t('an address that is not an editor cannot sign in as one (401)', $s === 401);

section('Diocese sign-in: removing an editor ends their access at once');
[$s] = http('DELETE', '/api/v1/admin/diocese-editors/999999', $ob);
t('removing an unknown id -> 404', $s === 404);
[$s] = http('DELETE', '/api/v1/admin/diocese-editors/abc', $ob);
t('removing a non-numeric id -> 404', $s === 404);
[$s] = http('DELETE', '/api/v1/admin/diocese-editors/' . $ed['id'], $ob);
t('an administrator removes the editor', $s === 200 && (int)$pdo->query('SELECT COUNT(*) FROM diocese_staff')->fetchColumn() === 0);
t('...their sessions went with them', (int)$pdo->query("SELECT COUNT(*) FROM sessions WHERE principal = 'diocese'")->fetchColumn() === 0);
[$s] = http('PUT', '/api/v1/diocese/page', dbearer($tok2), ['bishop_name' => 'x']);
t('...and their old token no longer writes (401)', $s === 401);
mail_reset();
[$s] = dpost('/diocese/auth/request-code', ['email' => 'bishop.office@example.org']);
t('...nor are they sent a code', $s === 200 && last_code('bishop.office@example.org') === null);
[$s] = dpost('/auth/password-login', ['email' => 'bishop.office@example.org', 'password' => 'seven quiet candles at dusk', 'as' => 'diocese']);
t('...nor can the password sign them in (401)', $s === 401);
reset_state();
