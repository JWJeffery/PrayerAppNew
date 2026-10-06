<?php
function bearer(string $t): array { return ["Authorization: Bearer $t"]; }
function api(string $method, string $path, string $token, ?array $json = null): array {
    return http($method, "/api/v1$path", bearer($token), $json);
}
/** Fresh world: parish A (rector + delegate) and parish B (rector). Returns tokens/ids. */
function world(): array {
    global $pdo;
    reset_state();
    [$a, $aCode] = make_parish('alpha', 'approved', 'code', null, 'Alpha Church');
    [$b] = make_parish('beta', 'approved', 'public', null, 'Beta Church');
    make_staff($a, 'rector@alpha.org', 'rector', 'Rev. Alpha');
    make_staff($a, 'deacon@alpha.org', 'delegate', 'Deacon Al');
    make_staff($b, 'rector@beta.org', 'rector', 'Rev. Beta');
    $w = ['a' => $a, 'b' => $b, 'aCode' => $aCode,
          'ra' => login_as('rector@alpha.org'), 'da' => login_as('deacon@alpha.org'), 'rb' => login_as('rector@beta.org')];
    $pdo->exec('TRUNCATE TABLE rate_limits');
    return $w;
}

section('Staff: authentication required everywhere');
$w = world();
$routes = [['GET', '/staff/intentions'], ['POST', '/staff/intentions'], ['PATCH', '/staff/intentions/1'], ['DELETE', '/staff/intentions/1'],
           ['POST', '/staff/intentions/1/extend'], ['GET', '/staff/delegates'], ['POST', '/staff/delegates'], ['DELETE', '/staff/delegates/1'],
           ['PATCH', '/staff/parish'], ['DELETE', '/staff/parish'], ['GET', '/staff/parish/join-code'],
           ['POST', '/staff/parish/join-code/rotate'], ['DELETE', '/staff/me']];
$bad = [];
foreach ($routes as [$m, $path]) { [$s] = http($m, "/api/v1$path", [], in_array($m, ['GET', 'DELETE'], true) ? null : []); if ($s !== 401) { $bad[] = "$m $path=$s"; } }
t('every staff route returns 401 without a session', $bad === [], implode(', ', $bad));
$adminTok = Auth::createSession('admin', null, 'admin@example.org')['token'];
[$s] = api('GET', '/staff/intentions', $adminTok);
t('an admin session is not a staff session here (403)', $s === 403);

section('Staff: adding intentions');
$w = world();
[$s, $b, $h] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'individual', 'text' => "  Margaret,   recovering\tfrom surgery \n "]);
$it = jbody($b)['intention'] ?? [];
t('create -> 201 with the item', $s === 201 && ($it['category'] ?? '') === 'individual' && ($it['expired'] ?? null) === false, "$s $b");
t('text is trimmed and whitespace collapsed', ($it['text'] ?? '') === 'Margaret, recovering from surgery');
$days = (int)$pdo->query('SELECT TIMESTAMPDIFF(HOUR, created_at, expires_at) FROM intentions LIMIT 1')->fetchColumn();
t('no days given -> 21-day expiry (504 hours)', $days === 504, (string)$days);
t('extension_count starts at 0', ($it['extension_count'] ?? -1) === 0);
$by = $pdo->query('SELECT created_by FROM intentions LIMIT 1')->fetchColumn();
t('creator recorded by staff id', (int)$by > 0);
[$s, $b] = api('POST', '/staff/intentions', $w['da'], ['category' => 'family', 'text' => 'The Smith family', 'days' => 45]);
t('a delegate can add too, with days=45', $s === 201 && (int)$pdo->query("SELECT TIMESTAMPDIFF(HOUR, created_at, expires_at) FROM intentions WHERE body='The Smith family'")->fetchColumn() === 1080);
[$s] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'situation', 'text' => 'One day', 'days' => 1]);
t('days=1 accepted', $s === 201);

$cases = [
    'days=0 -> 422' => [['category' => 'individual', 'text' => 'x', 'days' => 0], 'days'],
    'days=46 -> 422' => [['category' => 'individual', 'text' => 'x', 'days' => 46], 'days'],
    'days as string -> 422' => [['category' => 'individual', 'text' => 'x', 'days' => '7'], 'days'],
    'days as float -> 422' => [['category' => 'individual', 'text' => 'x', 'days' => 7.5], 'days'],
    'days as bool -> 422' => [['category' => 'individual', 'text' => 'x', 'days' => true], 'days'],
    'unknown category -> 422' => [['category' => 'saint', 'text' => 'x'], 'category'],
    'missing category -> 422' => [['text' => 'x'], 'category'],
    'category injection -> 422' => [['category' => "individual' OR '1'='1", 'text' => 'x'], 'category'],
    'missing text -> 422' => [['category' => 'individual'], 'text'],
    'blank text -> 422' => [['category' => 'individual', 'text' => "  \n\t "], 'text'],
    'array text -> 422' => [['category' => 'individual', 'text' => ['a']], 'text'],
    'control character -> 422' => [['category' => 'individual', 'text' => "bad\x07bell"], 'text'],
    'NUL character -> 422' => [['category' => 'individual', 'text' => "nul\x00byte"], 'text'],
    'bidi override -> 422' => [['category' => 'individual', 'text' => "evil\u{202E}txt"], 'text'],
];
foreach ($cases as $label => [$payload, $field]) {
    [$s, $b] = api('POST', '/staff/intentions', $w['ra'], $payload);
    t($label, $s === 422 && isset(jbody($b)['fields'][$field]), "$s $b");
}
[$s] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'individual', 'text' => str_repeat('a', 200)]);
t('exactly 200 characters accepted', $s === 201);
[$s, $b] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'individual', 'text' => str_repeat('a', 201)]);
t('201 characters -> 422', $s === 422 && isset(jbody($b)['fields']['text']));
[$s] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'individual', 'text' => str_repeat('é', 200)]);
t('200 multibyte characters accepted (characters, not bytes)', $s === 201);
[$s] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'individual', 'text' => str_repeat('é', 201)]);
t('201 multibyte characters -> 422', $s === 422);
[$s] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'individual', 'text' => "Daniel \u{1F64F} and María José"]);
t('emoji and accents are fine', $s === 201);
[$s] = http('POST', '/api/v1/staff/intentions', array_merge(bearer($w['ra']), ['Content-Type: application/json']), null);
t('empty body -> 400', $s === 400);

section('Staff: hostile text is stored as plain text');
$w = world();
$evil = ['<img src=x onerror=alert(1)>', '<script>alert(1)</script>', "'; DROP TABLE intentions; --", "' OR 1=1 --", '"><svg/onload=alert(1)>', 'Robert\'); DELETE FROM staff;--'];
$ids = [];
foreach ($evil as $e) { [$s, $b] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'situation', 'text' => $e]); $ids[] = jbody($b)['intention']['id'] ?? 0; }
t('all hostile strings accepted as ordinary text', count(array_filter($ids)) === count($evil));
[$s, $b] = api('GET', '/staff/intentions', $w['ra']);
$got = array_column(jbody($b)['intentions'], 'text');
t('...and returned byte-for-byte unchanged (not escaped, not stripped)', array_diff($evil, $got) === [], json_encode(array_diff($evil, $got)));
[$s, $b] = http('GET', '/api/v1/parishes/beta/intentions');
make_intention($w['b'], 'individual', $evil[0], 86400);
[$s, $b] = http('GET', '/api/v1/parishes/beta/intentions');
t('the public endpoint serves it as inert JSON text', array_column(jbody($b)['intentions'], 'text') === [$evil[0]] && strpos($b, 'application/json') === false);
t('database tables all still exist', count($pdo->query('SHOW TABLES')->fetchAll()) >= 9 && (int)$pdo->query('SELECT COUNT(*) FROM staff')->fetchColumn() === 3);
[$s, $b] = api('PATCH', '/staff/intentions/' . $ids[0], $w['ra'], ['text' => "'; DROP TABLE staff; --"]);
t('editing with an injection string stores it literally', $s === 200 && jbody($b)['intention']['text'] === "'; DROP TABLE staff; --" && (int)$pdo->query('SELECT COUNT(*) FROM staff')->fetchColumn() === 3);
[$s] = http('GET', '/api/v1/staff/intentions?id=1%20OR%201=1', bearer($w['ra']));
t('SQL in the query string is ignored', $s === 200);

section('Staff: the 100-item cap counts only active items');
$w = world();
for ($i = 0; $i < 99; $i++) { make_intention($w['a'], 'individual', "Item $i", 86400 * 3); }
for ($i = 0; $i < 10; $i++) { make_intention($w['a'], 'individual', "Expired $i", -3600); }
[$s] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'family', 'text' => 'The 100th']);
t('the 100th active item is accepted (expired ones do not count)', $s === 201);
[$s, $b] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'family', 'text' => 'The 101st']);
t('the 101st active item -> 409 limit_reached', $s === 409 && (jbody($b)['error'] ?? '') === 'limit_reached', "$s $b");
[$s] = api('POST', '/staff/intentions', $w['rb'], ['category' => 'family', 'text' => 'Beta is unaffected']);
t("another parish's cap is independent", $s === 201);
$first = (int)$pdo->query('SELECT id FROM intentions WHERE parish_id = ' . $w['a'] . ' AND expires_at > UTC_TIMESTAMP() LIMIT 1')->fetchColumn();
api('DELETE', "/staff/intentions/$first", $w['ra']);
[$s] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'family', 'text' => 'Room again']);
t('deleting one frees a slot', $s === 201);

section('Staff: listing, expired window, ordering');
$w = world();
$soon = make_intention($w['a'], 'individual', 'Expires soon', 3600);
$later = make_intention($w['a'], 'family', 'Expires later', 86400 * 10);
$gone1 = make_intention($w['a'], 'individual', 'Expired 2 days ago', -86400 * 2);
make_intention($w['a'], 'individual', 'Expired 8 days ago', -86400 * 8);
make_intention($w['b'], 'individual', 'Beta only', 86400);
[$s, $b] = api('GET', '/staff/intentions', $w['ra']);
$list = jbody($b)['intentions'] ?? [];
t('lists current items plus the last 7 days of expired ones, soonest expiry first',
    array_column($list, 'text') === ['Expired 2 days ago', 'Expires soon', 'Expires later'], json_encode(array_column($list, 'text')));
t('expired items are flagged', array_column($list, 'expired') === [true, false, false]);
t("never lists another parish's items", !in_array('Beta only', array_column($list, 'text'), true));
t('list items carry expires_at, created_at, extension_count', isset($list[0]['expires_at'], $list[0]['created_at'], $list[0]['extension_count']));
[$s, $b] = api('GET', '/staff/intentions', $w['da']);
t('delegates see the same list', count(jbody($b)['intentions']) === 3);

section('Staff: isolation between parishes (spec test 1)');
$w = world();
$aItem = make_intention($w['a'], 'individual', 'Alpha item', 86400 * 5);
$bItem = make_intention($w['b'], 'individual', 'Beta item', 86400 * 5);
$before = $pdo->query("SELECT id, body, expires_at, extension_count FROM intentions WHERE id = $bItem")->fetch();
[$s, $b] = api('PATCH', "/staff/intentions/$bItem", $w['ra'], ['text' => 'hijacked']);
t("alpha cannot edit beta's item (404)", $s === 404);
[$s] = api('POST', "/staff/intentions/$bItem/extend", $w['ra'], ['days' => 45]);
t("alpha cannot extend beta's item (404)", $s === 404);
[$s] = api('DELETE', "/staff/intentions/$bItem", $w['ra']);
t("alpha cannot delete beta's item (404)", $s === 404);
$after = $pdo->query("SELECT id, body, expires_at, extension_count FROM intentions WHERE id = $bItem")->fetch();
t("beta's item is completely untouched", $before === $after);
[$s, $b] = api('GET', '/staff/intentions', $w['ra']);
t("alpha's list does not include beta's item", array_column(jbody($b)['intentions'], 'id') === [$aItem]);
[$s] = api('PATCH', "/staff/intentions/$aItem", $w['rb'], ['text' => 'hijacked']);
t('and the other direction (404)', $s === 404);
[$s] = api('PATCH', '/staff/intentions/999999', $w['ra'], ['text' => 'x']);
t('a missing id looks identical (404)', $s === 404);
[$s] = api('PATCH', '/staff/intentions/1abc', $w['ra'], ['text' => 'x']);
t('a non-numeric id -> 404', $s === 404);
[$s] = api('PATCH', "/staff/intentions/$bItem?parish=alpha", $w['ra'], ['text' => 'x', 'parish_id' => $w['a'], 'parish' => 'alpha']);
t('a parish id supplied by the client is ignored', $s === 404);
[$s, $b] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'family', 'text' => 'Mine', 'parish_id' => $w['b'], 'parish' => 'beta']);
t('...also on create: the item lands in the session parish', $s === 201
    && (int)$pdo->query("SELECT parish_id FROM intentions WHERE body='Mine'")->fetchColumn() === $w['a']);
[$s, $b] = api('GET', '/staff/delegates', $w['rb']);
t("beta's rector sees only beta's staff", array_column(jbody($b)['staff'], 'email') === ['rector@beta.org']);

section('Staff: editing and extending');
$w = world();
$id = make_intention($w['a'], 'individual', 'Original', 86400 * 2);
$pdo->exec("UPDATE intentions SET reminder_sent_at = UTC_TIMESTAMP() WHERE id = $id");
$expBefore = $pdo->query("SELECT expires_at FROM intentions WHERE id = $id")->fetchColumn();
[$s, $b] = api('PATCH', "/staff/intentions/$id", $w['da'], ['text' => 'Edited', 'category' => 'family']);
t('edit text and category (delegate allowed)', $s === 200 && jbody($b)['intention']['text'] === 'Edited' && jbody($b)['intention']['category'] === 'family');
t('editing does not change the expiry', $pdo->query("SELECT expires_at FROM intentions WHERE id = $id")->fetchColumn() === $expBefore);
[$s] = api('PATCH', "/staff/intentions/$id", $w['ra'], []);
t('an edit with no changes -> 422', $s === 422);
[$s] = api('PATCH', "/staff/intentions/$id", $w['ra'], ['text' => str_repeat('z', 201)]);
t('an edit over 200 characters -> 422', $s === 422);
[$s] = api('PATCH', "/staff/intentions/$id", $w['ra'], ['category' => 'bogus']);
t('an edit with a bad category -> 422', $s === 422);
[$s, $b] = api('POST', "/staff/intentions/$id/extend", $w['ra'], ['days' => 7]);
$row = $pdo->query("SELECT extension_count, reminder_sent_at, TIMESTAMPDIFF(HOUR, UTC_TIMESTAMP(), expires_at) AS h FROM intentions WHERE id = $id")->fetch();
t('extend: +1 extension_count', (int)$row['extension_count'] === 1 && jbody($b)['intention']['extension_count'] === 1);
t('extend: reminder_sent_at reset to NULL', $row['reminder_sent_at'] === null);
t('extend adds days to the current expiry (2 days + 7 days = about 216 hours)', abs((int)$row['h'] - 216) <= 1, (string)$row['h']);
api('POST', "/staff/intentions/$id/extend", $w['ra'], ['days' => 1]);
t('a second extension counts again', (int)$pdo->query("SELECT extension_count FROM intentions WHERE id = $id")->fetchColumn() === 2);
foreach ([[0, 'days=0'], [46, 'days=46'], ['7', 'days as string'], [null, 'days missing']] as [$d, $label]) {
    [$s] = api('POST', "/staff/intentions/$id/extend", $w['ra'], $d === null ? [] : ['days' => $d]);
    t("extend with $label -> 422", $s === 422);
}
$old = make_intention($w['a'], 'individual', 'Expired', -86400 * 3);
api('POST', "/staff/intentions/$old/extend", $w['ra'], ['days' => 7]);
$h = (int)$pdo->query("SELECT TIMESTAMPDIFF(HOUR, UTC_TIMESTAMP(), expires_at) FROM intentions WHERE id = $old")->fetchColumn();
t('extending an expired item counts from now, not from the old expiry (about 168 hours)', abs($h - 168) <= 1, (string)$h);
[$s, $b] = api('GET', '/staff/intentions', $w['ra']);
t('...and it is no longer flagged expired', !in_array(true, array_column(array_filter(jbody($b)['intentions'], fn($i) => $i['id'] === $old), 'expired'), true));

section('Staff: removing');
$w = world();
$id = make_intention($w['a'], 'individual', 'To remove', 86400);
[$s] = api('DELETE', "/staff/intentions/$id", $w['da']);
t('a delegate can remove an item', $s === 200 && (int)$pdo->query("SELECT COUNT(*) FROM intentions WHERE id = $id")->fetchColumn() === 0);
[$s] = api('DELETE', "/staff/intentions/$id", $w['ra']);
t('removing it again -> 404 (hard delete, no history)', $s === 404);
$ids = [make_intention($w['a'], 'individual', 'A', 5), make_intention($w['a'], 'individual', 'B', 5)];
api('DELETE', '/staff/intentions/' . $ids[0], $w['ra']);
t('only that one row goes', (int)$pdo->query('SELECT COUNT(*) FROM intentions')->fetchColumn() === 1);
t('audit log never contains intention text or emails', (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE detail LIKE '%@%' OR detail LIKE '%To remove%' OR actor LIKE '%@%'")->fetchColumn() === 0);

section('Staff: delegates (rector only)');
$w = world();
[$s, $b] = api('GET', '/staff/delegates', $w['da']);
t('a delegate cannot list staff (403)', $s === 403);
[$s] = api('POST', '/staff/delegates', $w['da'], ['email' => 'x@alpha.org']);
t('a delegate cannot add a delegate (403)', $s === 403);
$rectorId = (int)$pdo->query("SELECT id FROM staff WHERE email='rector@alpha.org'")->fetchColumn();
$deaconId = (int)$pdo->query("SELECT id FROM staff WHERE email='deacon@alpha.org'")->fetchColumn();
[$s] = api('DELETE', "/staff/delegates/$rectorId", $w['da']);
t('a delegate cannot remove anyone (403)', $s === 403);
[$s, $b] = api('GET', '/staff/delegates', $w['ra']);
$staff = jbody($b)['staff'] ?? [];
t('the rector sees rector first, then delegates, marked is_you', array_column($staff, 'role') === ['rector', 'delegate'] && $staff[0]['is_you'] === true && $staff[1]['is_you'] === false);
mail_reset();
[$s, $b] = api('POST', '/staff/delegates', $w['ra'], ['email' => '  New.Helper@Alpha.ORG ', 'display_name' => "  Sam   Helper "]);
$d = jbody($b)['delegate'] ?? [];
t('add delegate -> 201, email normalized, name cleaned', $s === 201 && ($d['email'] ?? '') === 'new.helper@alpha.org' && ($d['display_name'] ?? '') === 'Sam Helper' && ($d['role'] ?? '') === 'delegate', "$s $b");
t('no email is sent when a delegate is added', mail_messages() === []);
[$s1, $b1] = api('POST', '/staff/delegates', $w['ra'], ['email' => 'new.helper@alpha.org']);
[$s2, $b2] = api('POST', '/staff/delegates', $w['ra'], ['email' => 'rector@beta.org']);
t('an address already in use (same parish or another) -> 409 with the identical generic answer', $s1 === 409 && $s2 === 409 && $b1 === $b2, "$b1 | $b2");
foreach ([['email' => 'not-an-email'], ['email' => "x@alpha.org\r\nBcc: e@evil.org"], [], ['email' => 'ok@alpha.org', 'display_name' => "bad\x07"],
          ['email' => 'ok@alpha.org', 'display_name' => str_repeat('n', 121)]] as $bad) {
    [$s] = api('POST', '/staff/delegates', $w['ra'], $bad);
    t('bad delegate input -> 422 (' . substr(json_encode($bad), 0, 40) . ')', $s === 422);
}
for ($i = 3; $i <= 5; $i++) { api('POST', '/staff/delegates', $w['ra'], ['email' => "helper$i@alpha.org"]); }
$n = (int)$pdo->query("SELECT COUNT(*) FROM staff WHERE role='delegate' AND parish_id = " . $w['a'])->fetchColumn();
[$s, $b] = api('POST', '/staff/delegates', $w['ra'], ['email' => 'sixth@alpha.org']);
t('at most 5 delegates (6th -> 409 limit_reached)', $n === 5 && $s === 409 && (jbody($b)['error'] ?? '') === 'limit_reached', "$n $s $b");
$newTok = null;
[$s] = api('DELETE', "/staff/delegates/$rectorId", $w['ra']);
t('the rector cannot remove themselves this way (403)', $s === 403);
[$s] = api('DELETE', '/staff/delegates/' . (int)$pdo->query("SELECT id FROM staff WHERE email='rector@beta.org'")->fetchColumn(), $w['ra']);
t("cannot remove another parish's staff (404)", $s === 404);
[$s] = api('GET', '/staff/intentions', $w['da']);
t('the deacon is logged in and working', $s === 200);
[$s] = api('DELETE', "/staff/delegates/$deaconId", $w['ra']);
t('remove a delegate -> 200', $s === 200);
[$s] = api('GET', '/staff/intentions', $w['da']);
t("...and the removed delegate's session dies immediately", $s === 401);
mail_reset(); http('POST', '/api/v1/auth/request-code', [], ['email' => 'deacon@alpha.org']);
t('no mail goes to a removed delegate', mail_messages() === []);
[$s] = http('POST', '/api/v1/auth/request-code', [], ['email' => 'new.helper@alpha.org']);
t('a newly added delegate can log in with a code', $s === 200 && last_code('new.helper@alpha.org') !== null);
$helperTok = login_as('new.helper@alpha.org');
[$s, $b] = api('GET', '/staff/intentions', $helperTok);
t('...and works in the same parish', $s === 200);

section('Staff: parish settings and join codes');
$w = world();
make_intention($w['a'], 'individual', 'Alpha item', 86400);
[$s, $b] = api('GET', '/staff/parish/join-code', $w['da']);
t('a delegate cannot view the join code (403)', $s === 403);
[$s, $b] = api('GET', '/staff/parish/join-code', $w['ra']);
t('the rector sees the exact join code, formatted', $s === 200 && (jbody($b)['join_code'] ?? '') === Crypto::formatJoinCode($w['aCode']), $b);
[$s, $b] = http('POST', '/api/v1/parishes/alpha/join', [], ['code' => Crypto::formatJoinCode($w['aCode'])]);
$pass1 = jbody($b)['pass'] ?? '';
[$s] = http('GET', '/api/v1/parishes/alpha/intentions', ["X-Parish-Pass: $pass1"]);
t('a reader joins with that code and reads', $s === 200);
[$s, $b] = api('POST', '/staff/parish/join-code/rotate', $w['da']);
t('a delegate cannot rotate (403)', $s === 403);
[$s, $b] = api('POST', '/staff/parish/join-code/rotate', $w['ra']);
$newCode = jbody($b)['join_code'] ?? '';
t('rotate -> 200 with a different, well-formed code', $s === 200 && preg_match('/^[A-Z2-9]{4}-[A-Z2-9]{4}$/', $newCode) === 1 && $newCode !== Crypto::formatJoinCode($w['aCode']));
[$s] = http('GET', '/api/v1/parishes/alpha/intentions', ["X-Parish-Pass: $pass1"]);
t('rotating invalidates every earlier reader pass', $s === 401);
[$s] = http('POST', '/api/v1/parishes/alpha/join', [], ['code' => Crypto::formatJoinCode($w['aCode'])]);
t('the old code no longer joins', $s === 403);
[$s, $b] = http('POST', '/api/v1/parishes/alpha/join', [], ['code' => $newCode]);
$pass2 = jbody($b)['pass'] ?? '';
[$s] = http('GET', '/api/v1/parishes/alpha/intentions', ["X-Parish-Pass: $pass2"]);
t('the new code joins and reads', $s === 200);
[$s, $b] = api('GET', '/staff/parish/join-code', $w['ra']);
t('the rector now sees the new code', (jbody($b)['join_code'] ?? '') === $newCode);
$blob = $pdo->query('SELECT join_code_enc FROM parishes WHERE id = ' . $w['a'])->fetchColumn();
t('the new code is stored encrypted', strpos((string)$blob, str_replace('-', '', $newCode)) === false);

[$s, $b] = api('PATCH', '/staff/parish', $w['da'], ['visibility' => 'public']);
t('a delegate cannot change visibility (403)', $s === 403);
foreach ([['visibility' => 'secret'], [], ['visibility' => ['public']]] as $bad) {
    [$s] = api('PATCH', '/staff/parish', $w['ra'], $bad);
    t('bad visibility -> 422', $s === 422);
}
[$s, $b] = api('PATCH', '/staff/parish', $w['ra'], ['visibility' => 'public']);
$row = $pdo->query('SELECT visibility, join_code_enc FROM parishes WHERE id = ' . $w['a'])->fetch();
t('switching to public clears the stored code', $s === 200 && $row['visibility'] === 'public' && $row['join_code_enc'] === null);
[$s] = http('GET', '/api/v1/parishes/alpha/intentions');
t('...and the reader endpoint needs no pass', $s === 200);
[$s] = http('GET', '/api/v1/parishes/alpha/intentions', ["X-Parish-Pass: $pass2"]);
t('...(an old pass is simply ignored for a public parish)', $s === 200);
[$s] = api('GET', '/staff/parish/join-code', $w['ra']);
t('a public parish has no join code to view (404)', $s === 404);
[$s] = api('POST', '/staff/parish/join-code/rotate', $w['ra']);
t('...and nothing to rotate (409)', $s === 409);
[$s, $b] = api('PATCH', '/staff/parish', $w['ra'], ['visibility' => 'code']);
$fresh = jbody($b)['join_code'] ?? '';
t('switching back to code generates a new code and returns it', $s === 200 && preg_match('/^[A-Z2-9]{4}-[A-Z2-9]{4}$/', $fresh) === 1);
[$s] = http('GET', '/api/v1/parishes/alpha/intentions', ["X-Parish-Pass: $pass2"]);
t('passes from before the round trip stay dead', $s === 401);
[$s, $b] = api('GET', '/staff/parish/join-code', $w['ra']);
t('the rector can view the new code', (jbody($b)['join_code'] ?? '') === $fresh);
[$s, $b] = api('PATCH', '/staff/parish', $w['ra'], ['visibility' => 'code']);
t('setting the same visibility again is a harmless no-op that keeps the code', $s === 200 && !isset(jbody($b)['join_code'])
    && (jbody(api('GET', '/staff/parish/join-code', $w['ra'])[1])['join_code'] ?? '') === $fresh);
[$s, $b] = api('GET', '/staff/parish/join-code', $w['rb']);
t("beta (public) cannot see alpha's code", $s === 404);

section('Staff: writes are rate limited per session');
$w = world();
$statuses = [];
for ($i = 1; $i <= 61; $i++) { [$statuses[]] = api('POST', '/staff/intentions', $w['ra'], ['category' => 'individual', 'text' => "Item $i"]); }
t('60 writes per session per hour (61st -> 429)', count(array_filter($statuses, fn($x) => $x === 201)) === 60 && $statuses[60] === 429, json_encode(array_count_values($statuses)));
[$s] = api('GET', '/staff/intentions', $w['ra']);
t('reads are not limited by the write limit', $s === 200);
[$s] = api('POST', '/staff/intentions', $w['da'], ['category' => 'individual', 'text' => 'Other session']);
t('another session has its own budget', $s === 201);

section('Staff: leaving and account deletion (spec test 19)');
$w = world();
[$s, $b] = api('DELETE', '/staff/me', $w['ra']);
t('the only rector cannot delete themselves (409, with instructions)', $s === 409 && strpos($b, 'delete the parish') !== false, "$s $b");
[$s] = api('GET', '/staff/intentions', $w['ra']);
t('...and stays logged in', $s === 200);
$deaconRows = fn() => [(int)$pdo->query("SELECT COUNT(*) FROM staff WHERE email='deacon@alpha.org'")->fetchColumn(),
                       (int)$pdo->query('SELECT COUNT(*) FROM sessions WHERE staff_id = ' . (int)$pdo->query("SELECT id FROM staff WHERE email='deacon@alpha.org'")->fetchColumn())->fetchColumn()];
t('before: the delegate has a staff row and a session', $deaconRows() === [1, 1]);
[$s] = api('DELETE', '/staff/me', $w['da']);
t('a delegate can delete their own membership', $s === 200);
[$s] = api('GET', '/staff/intentions', $w['da']);
t('...their session dies at once', $s === 401);
t('...and no staff row or session remains', (int)$pdo->query("SELECT COUNT(*) FROM staff WHERE email='deacon@alpha.org'")->fetchColumn() === 0
    && (int)$pdo->query('SELECT COUNT(*) FROM sessions')->fetchColumn() === 2);
make_staff($w['a'], 'second@alpha.org', 'rector');
[$s] = api('DELETE', '/staff/me', $w['ra']);
t('a rector may leave when another rector exists', $s === 200 && (int)$pdo->query("SELECT COUNT(*) FROM staff WHERE email='rector@alpha.org'")->fetchColumn() === 0);

$w = world();
make_intention($w['a'], 'individual', 'A1', 86400); make_intention($w['a'], 'family', 'A2', 86400);
make_intention($w['b'], 'individual', 'B1', 86400);
$pdo->prepare("INSERT INTO approval_tokens (token_hash, parish_id, created_at, expires_at) VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL 7 DAY)")->execute([hash('sha256', 'x'), $w['a']]);
$count = fn(string $sql) => (int)$pdo->query($sql)->fetchColumn();
$aStaff = $count('SELECT COUNT(*) FROM staff WHERE parish_id = ' . $w['a']);
t('before: alpha has staff, sessions, intentions and a token', $aStaff === 2 && $count('SELECT COUNT(*) FROM intentions WHERE parish_id = ' . $w['a']) === 2
    && $count('SELECT COUNT(*) FROM approval_tokens') === 1);
[$s] = api('DELETE', '/staff/parish', $w['da'], ['confirm' => 'DELETE alpha']);
t('a delegate cannot delete the parish (403)', $s === 403);
foreach ([[], ['confirm' => 'delete alpha'], ['confirm' => 'DELETE beta'], ['confirm' => 'DELETE'], ['confirm' => ['DELETE alpha']]] as $bad) {
    [$s] = api('DELETE', '/staff/parish', $w['ra'], $bad);
    t('wrong confirmation ' . json_encode($bad) . ' -> 422 and nothing deleted', $s === 422 && $count("SELECT COUNT(*) FROM parishes WHERE slug='alpha'") === 1);
}
[$s] = api('DELETE', '/staff/parish', $w['ra'], ['confirm' => 'DELETE alpha']);
t('the exact confirmation deletes the parish -> 200', $s === 200);
t('every alpha row is gone: parish, staff, sessions, intentions, tokens',
    $count("SELECT COUNT(*) FROM parishes WHERE slug='alpha'") === 0 && $count('SELECT COUNT(*) FROM staff WHERE parish_id = ' . $w['a']) === 0
    && $count('SELECT COUNT(*) FROM intentions WHERE parish_id = ' . $w['a']) === 0 && $count('SELECT COUNT(*) FROM approval_tokens') === 0
    && $count("SELECT COUNT(*) FROM sessions s LEFT JOIN staff st ON st.id = s.staff_id WHERE st.id IS NULL") === 0);
[$s] = api('GET', '/staff/intentions', $w['ra']);
t("the rector's session died immediately", $s === 401);
[$s] = api('GET', '/staff/intentions', $w['da']);
t("...and so did the delegate's", $s === 401);
[$s] = http('GET', '/api/v1/parishes/alpha/intentions');
t('the reader endpoint no longer knows the parish (404)', $s === 404);
t("beta is untouched: parish, staff, session, item", $count("SELECT COUNT(*) FROM parishes WHERE slug='beta'") === 1
    && $count('SELECT COUNT(*) FROM staff WHERE parish_id = ' . $w['b']) === 1 && $count('SELECT COUNT(*) FROM intentions WHERE parish_id = ' . $w['b']) === 1);
[$s] = api('GET', '/staff/intentions', $w['rb']);
t("...and beta's rector still works", $s === 200);
t('audit trail keeps ids only', $count("SELECT COUNT(*) FROM audit_log WHERE action='parish.delete'") === 1
    && $count("SELECT COUNT(*) FROM audit_log WHERE detail LIKE '%@%'") === 0);
[$s] = http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
mail_reset(); http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
t('a deleted rector can no longer get a login code', mail_messages() === []);

section('Staff: suspended parishes are locked out');
$w = world();
$pdo->exec("UPDATE parishes SET status='suspended' WHERE id = " . $w['a']);
$bad = [];
foreach ([['GET', '/staff/intentions'], ['POST', '/staff/intentions'], ['GET', '/staff/delegates'], ['PATCH', '/staff/parish'], ['DELETE', '/staff/me']] as [$m, $path]) {
    [$s] = api($m, $path, $w['ra'], $m === 'GET' ? null : ['category' => 'individual', 'text' => 'x', 'visibility' => 'public']);
    if ($s !== 401) { $bad[] = "$m $path=$s"; }
}
t('a suspended parish gets 401 on every staff route', $bad === [], implode(', ', $bad));
reset_state();
