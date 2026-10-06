<?php
function admin_login(): string {
    http('POST', '/api/v1/admin/auth/request-code', [], ['email' => 'a@example.org']);
    $code = last_code('a@example.org');
    [$s, $b] = http('POST', '/api/v1/admin/auth/verify-code', [], ['email' => 'a@example.org', 'code' => $code]);
    return jbody($b)['token'] ?? '';
}
/** A registered-but-unapproved parish; returns [parishId, approvalToken]. */
function pending_parish(string $email = 'ada@stbedes.org', array $over = []): array {
    global $pdo;
    mail_reset();
    [$s] = register_and_verify(array_merge(['email' => $email], $over));
    $token = approval_token_from_mail();
    $id = (int)$pdo->query("SELECT parish_id FROM staff WHERE email = " . $pdo->quote($email))->fetchColumn();
    return [$id, $token];
}

section('Admin: sign-in');
reset_state();
mail_reset();
[$s1, $b1] = http('POST', '/api/v1/admin/auth/request-code', [], ['email' => 'a@example.org']);
[$s2, $b2] = http('POST', '/api/v1/admin/auth/request-code', [], ['email' => 'stranger@example.org']);
t('admin and non-admin addresses get identical answers', $s1 === 200 && $s2 === 200 && $b1 === $b2);
$m = mail_messages();
t('only the admin address is mailed a code', count($m) === 1 && $m[0]['to'] === 'a@example.org');
[$aid] = make_parish('alpha'); make_staff($aid, 'rector@alpha.org');
mail_reset();
http('POST', '/api/v1/admin/auth/request-code', [], ['email' => 'rector@alpha.org']);
t('a parish rector is not an admin (no code)', mail_messages() === []);
[$s] = http('POST', '/api/v1/admin/auth/request-code', [], ['email' => "a@example.org\r\nBcc: x@y.org"]);
t('CR/LF in the admin email -> 422', $s === 422);
$code = last_code('a@example.org');
mail_reset(); http('POST', '/api/v1/admin/auth/request-code', [], ['email' => 'a@example.org']); $code = last_code('a@example.org');
[$s] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'a@example.org', 'code' => $code]);
t('an admin code does not work in the staff login flow', $s === 401);
mail_reset(); http('POST', '/api/v1/admin/auth/request-code', [], ['email' => 'a@example.org']); $code = last_code('a@example.org');
[$s, $b] = http('POST', '/api/v1/admin/auth/verify-code', [], ['email' => 'a@example.org', 'code' => $code]);
$tok = jbody($b);
t('the right code -> an admin session', $s === 200 && strlen($tok['token'] ?? '') === 64 && ($tok['admin']['email'] ?? '') === 'a@example.org', "$s $b");
[$s, $b] = http('GET', '/api/v1/me', bearer($tok['token']));
t('/me reports the admin principal', $s === 200 && (jbody($b)['principal'] ?? '') === 'admin');
mail_reset(); http('POST', '/api/v1/auth/request-code', [], ['email' => 'a@example.org']);
t('the admin address is not treated as a parish rector', mail_messages() === []);
[$s] = http('POST', '/api/v1/admin/auth/verify-code', [], ['email' => 'a@example.org', 'code' => $code]);
t('the code works once', $s === 401);
$r = []; for ($i = 0; $i < 5; $i++) { [$r[]] = http('POST', '/api/v1/admin/auth/verify-code', [], ['email' => 'stranger@example.org', 'code' => '123456']); }
t('a non-admin cannot get a session however the code is forged', $r === [401, 401, 401, 401, 401]);
$pdo->prepare("INSERT INTO login_codes (purpose,email,code_hash,created_at,expires_at) VALUES ('admin','stranger@example.org',?,UTC_TIMESTAMP(),UTC_TIMESTAMP()+INTERVAL 10 MINUTE)")->execute([Crypto::hmac('admin|stranger@example.org|654321')]);
[$s] = http('POST', '/api/v1/admin/auth/verify-code', [], ['email' => 'stranger@example.org', 'code' => '654321']);
t('...even with a genuine-looking code row for a non-admin address', $s === 401);
reset_state();
$r = []; for ($i = 1; $i <= 6; $i++) { [$r[]] = http('POST', '/api/v1/admin/auth/request-code', [], ['email' => 'a@example.org']); }
t('admin request-code: 5 per email per hour (6th -> 429)', $r === [200, 200, 200, 200, 200, 429], json_encode($r));
reset_state();

section('Admin: staff sessions are locked out (spec test 2)');
$w = world();
$adminPaths = [['GET', '/admin/parishes'], ['POST', '/admin/parishes/1/approve'], ['POST', '/admin/parishes/1/suspend'],
               ['POST', '/admin/parishes/1/unsuspend'], ['DELETE', '/admin/parishes/1'], ['GET', '/admin/status']];
$got = [];
foreach ($adminPaths as [$m, $path]) { [$s] = api($m, $path, $w['ra'], $m === 'GET' ? null : []); $got[] = $s; }
t('a rector session gets 403 on every admin session endpoint', $got === array_fill(0, count($adminPaths), 403), json_encode($got));
$got = [];
foreach ($adminPaths as [$m, $path]) { [$s] = api($m, $path, $w['da'], $m === 'GET' ? null : []); $got[] = $s; }
t('...and so does a delegate', $got === array_fill(0, count($adminPaths), 403));
$got = [];
foreach ($adminPaths as [$m, $path]) { [$s] = http($m, "/api/v1$path", [], $m === 'GET' ? null : []); $got[] = $s; }
t('no session at all gets 401', $got === array_fill(0, count($adminPaths), 401), json_encode($got));

section('Admin: approval by emailed link');
reset_state();
[$pid, $token] = pending_parish();
[$s, $b] = http('GET', '/api/v1/admin/approve?token=' . $token);
t('a GET on the approve endpoint is refused (405)', $s === 405);
[$s] = http('GET', '/parish/approve.html');
t('opening the approval page (GET) is just a static page', $s === 200);
t('...and neither of those approved anything', $pdo->query("SELECT status FROM parishes WHERE id = $pid")->fetchColumn() === 'pending'
    && $pdo->query('SELECT used_at FROM approval_tokens')->fetchColumn() === null);
[$s, $b] = http('POST', '/api/v1/admin/approval-info', [], ['token' => $token]);
t('approval-info returns only the parish name and diocese', $s === 200 && jbody($b) === ['parish' => ['name' => "St. Bede's Episcopal Church", 'diocese_key' => 'episcopal/western-oregon']], "$s $b");
t('...and reading it approves nothing', $pdo->query("SELECT status FROM parishes WHERE id = $pid")->fetchColumn() === 'pending');
[$s, $b] = http('POST', '/api/v1/admin/approval-info', [], ['token' => str_repeat('a', 64)]);
$unknown = $b;
t('an unknown token -> 400 generic', $s === 400);
foreach ([['token' => 'short'], ['token' => 12345], ['token' => ['x']], [], ['token' => "' OR '1'='1"]] as $bad) {
    [$s, $b] = http('POST', '/api/v1/admin/approve', [], $bad);
    t('bad token ' . substr(json_encode($bad), 0, 30) . ' -> 400 identical body', $s === 400 && $b === $unknown);
}
mail_reset();
[$s, $b] = http('POST', '/api/v1/admin/approve', [], ['token' => $token]);
t('POST with the token approves the parish', $s === 200 && (jbody($b)['status'] ?? '') === 'approved' && (jbody($b)['parish']['name'] ?? '') === "St. Bede's Episcopal Church", "$s $b");
$p = $pdo->query("SELECT status, approved_at FROM parishes WHERE id = $pid")->fetch();
t('status=approved with approved_at stamped', $p['status'] === 'approved' && $p['approved_at'] !== null);
t('the token is marked used', $pdo->query('SELECT used_at FROM approval_tokens')->fetchColumn() !== null);
$m = mail_messages();
t('the rector is emailed "Your parish is approved" with the login page', count($m) === 1 && $m[0]['to'] === 'ada@stbedes.org'
    && $m[0]['subject'] === 'Your parish is approved' && strpos($m[0]['body'], 'http://localhost/parish/') !== false);
[$s, $b] = http('POST', '/api/v1/admin/approve', [], ['token' => $token]);
t('a token works once (second use -> 400, same body)', $s === 400 && $b === $unknown);
[$s, $b] = http('POST', '/api/v1/admin/approval-info', [], ['token' => $token]);
t('a used token no longer reveals anything', $s === 400 && $b === $unknown);
[$s, $b] = http('GET', '/api/v1/parishes');
t('the approved parish is now listed', array_column(jbody($b)['parishes'], 'slug') === ['st-bedes-episcopal-church']);
$tk = login_as('ada@stbedes.org');
[$s, $b] = api('GET', '/staff/intentions', $tk);
t('and the rector can log in and work', strlen($tk) === 64 && $s === 200);

reset_state();
[$pid, $token] = pending_parish();
$pdo->exec('UPDATE approval_tokens SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 SECOND');
[$s, $b] = http('POST', '/api/v1/admin/approve', [], ['token' => $token]);
t('an expired token (7 days) -> 400 and nothing changes', $s === 400 && $pdo->query("SELECT status FROM parishes WHERE id = $pid")->fetchColumn() === 'pending');
reset_state();
[$pid, $token] = pending_parish();
$pdo->exec("UPDATE parishes SET status='suspended'");
[$s] = http('POST', '/api/v1/admin/approve', [], ['token' => $token]);
t('a token cannot approve a parish that is not pending', $s === 400 && $pdo->query('SELECT status FROM parishes')->fetchColumn() === 'suspended');
reset_state();
[$pid1, $tok1] = pending_parish('one@x.org', ['parish_name' => 'Church One']);
[$pid2, $tok2] = pending_parish('two@x.org', ['parish_name' => 'Church Two']);
http('POST', '/api/v1/admin/approve', [], ['token' => $tok1]);
t("one parish's token approves only that parish", $pdo->query("SELECT status FROM parishes WHERE id = $pid1")->fetchColumn() === 'approved'
    && $pdo->query("SELECT status FROM parishes WHERE id = $pid2")->fetchColumn() === 'pending');
reset_state();
$attempts = []; for ($i = 0; $i < 32; $i++) { [$attempts[]] = http('POST', '/api/v1/admin/approve', [], ['token' => bin2hex(random_bytes(32))]); }
t('token guessing is rate limited (30 per IP per hour, then 429)', $attempts[0] === 400 && $attempts[31] === 429, json_encode(array_count_values($attempts)));
reset_state();

section('Admin: managing parishes');
reset_state();
$adminTok = admin_login();
[$pid, $token] = pending_parish('ada@stbedes.org');
[$w2] = make_parish('grace', 'approved', 'public', null, 'Grace Church');
make_staff($w2, 'rev@grace.org', 'rector', 'Rev. Grace'); make_staff($w2, 'dea@grace.org', 'delegate');
make_intention($w2, 'individual', 'SECRET PRAYER TEXT', 86400); make_intention($w2, 'family', 'Expired one', -3600);
[$s, $b] = api('GET', '/admin/parishes', $adminTok);
$list = jbody($b)['parishes'] ?? [];
t('lists all parishes, pending first', $s === 200 && count($list) === 2 && $list[0]['status'] === 'pending' && $list[1]['slug'] === 'grace');
$g = $list[1];
t('each row has status, counts, dates, rector contact', $g['staff_count'] === 2 && $g['active_intentions'] === 1 && $g['rector_email'] === 'rev@grace.org'
    && $g['rector_name'] === 'Rev. Grace' && isset($g['created_at']) && $list[0]['approved_at'] === null);
t('NO intention text appears anywhere in the response', strpos($b, 'SECRET PRAYER TEXT') === false && strpos($b, 'Expired one') === false);
mail_reset();
[$s] = api('POST', "/admin/parishes/$pid/approve", $adminTok, []);
t('admin can approve a pending parish from the page (no email token needed)', $s === 200 && $pdo->query("SELECT status FROM parishes WHERE id = $pid")->fetchColumn() === 'approved');
t('...which also retires the emailed token', http('POST', '/api/v1/admin/approve', [], ['token' => $token])[0] === 400);
t('...and emails the rector', count(array_filter(mail_messages(), fn($m) => $m['subject'] === 'Your parish is approved')) === 1);
[$s] = api('POST', "/admin/parishes/$pid/approve", $adminTok, []);
t('approving an approved parish -> 409', $s === 409);

$rTok = login_as('rev@grace.org');
[$s] = api('GET', '/staff/intentions', $rTok);
t('before suspension the rector works', $s === 200);
[$s] = api('POST', "/admin/parishes/$w2/suspend", $adminTok, []);
t('suspend -> 200', $s === 200 && $pdo->query("SELECT status FROM parishes WHERE id = $w2")->fetchColumn() === 'suspended');
[$s] = api('GET', '/staff/intentions', $rTok);
t("...the rector's session stops working at once", $s === 401);
[$s] = http('GET', '/api/v1/parishes/grace/intentions');
t('...the reader endpoint stops serving it', $s === 404);
[$s, $b] = http('GET', '/api/v1/parishes');
t('...and it drops out of the list', !in_array('grace', array_column(jbody($b)['parishes'], 'slug'), true));
mail_reset(); http('POST', '/api/v1/auth/request-code', [], ['email' => 'rev@grace.org']);
t('...and no login code is mailed to its staff', mail_messages() === []);
[$s] = api('POST', "/admin/parishes/$w2/suspend", $adminTok, []);
t('suspending a suspended parish -> 409', $s === 409);
[$s] = api('POST', "/admin/parishes/$w2/unsuspend", $adminTok, []);
t('unsuspend -> 200', $s === 200 && $pdo->query("SELECT status FROM parishes WHERE id = $w2")->fetchColumn() === 'approved');
[$s] = api('GET', '/staff/intentions', $rTok);
t('...and the same session works again', $s === 200);
[$s] = api('POST', "/admin/parishes/$w2/unsuspend", $adminTok, []);
t('unsuspending an approved parish -> 409', $s === 409);
[$s] = api('POST', '/admin/parishes/999999/suspend', $adminTok, []);
t('unknown parish id -> 404', $s === 404);
[$s] = api('POST', '/admin/parishes/abc/suspend', $adminTok, []);
t('non-numeric id -> 404', $s === 404);

[$s, $b] = api('GET', '/admin/status', $adminTok);
$st = jbody($b);
t('/admin/status reports PHP, extensions, migrations and mail driver (no secrets)', $s === 200 && ($st['database'] ?? null) === true
    && in_array('001_init', $st['migrations'] ?? [], true) && ($st['extensions']['sodium'] ?? false) === true && ($st['mail_driver'] ?? '') === 'log'
    && strpos($b, 'password') === false && strpos($b, 'pepper') === false);

section('Admin: deleting a parish (spec test 19, admin half)');
$count = fn(string $sql) => (int)$pdo->query($sql)->fetchColumn();
$sessBefore = $count('SELECT COUNT(*) FROM sessions');
[$s] = api('DELETE', "/admin/parishes/$w2", $adminTok, []);
t('delete without the confirmation -> 422 and nothing deleted', $s === 422 && $count("SELECT COUNT(*) FROM parishes WHERE id = $w2") === 1);
[$s] = api('DELETE', "/admin/parishes/$w2", $adminTok, ['confirm' => 'DELETE nope']);
t('delete with the wrong confirmation -> 422', $s === 422 && $count("SELECT COUNT(*) FROM parishes WHERE id = $w2") === 1);
[$s] = api('DELETE', "/admin/parishes/$w2", $rTok, ['confirm' => 'DELETE grace']);
t('a parish rector cannot use the admin delete (403)', $s === 403);
[$s] = api('DELETE', "/admin/parishes/$w2", $adminTok, ['confirm' => 'DELETE grace']);
t('delete with the exact confirmation -> 200', $s === 200);
t('every row for that parish is gone: parish, staff, intentions, sessions',
    $count("SELECT COUNT(*) FROM parishes WHERE id = $w2") === 0 && $count("SELECT COUNT(*) FROM staff WHERE parish_id = $w2") === 0
    && $count("SELECT COUNT(*) FROM intentions WHERE parish_id = $w2") === 0
    && $count("SELECT COUNT(*) FROM sessions WHERE principal='staff' AND staff_id IS NOT NULL AND staff_id NOT IN (SELECT id FROM staff)") === 0);
[$s] = api('GET', '/staff/intentions', $rTok);
t("the deleted parish's rector session died immediately", $s === 401);
t('the other parish and the admin session are untouched', $count("SELECT COUNT(*) FROM parishes WHERE id = $pid") === 1 && api('GET', '/admin/parishes', $adminTok)[0] === 200);
t('audit entries hold actions and ids only (no emails, no text)', $count("SELECT COUNT(*) FROM audit_log WHERE detail LIKE '%@%' OR actor LIKE '%@%'") === 0
    && $count("SELECT COUNT(*) FROM audit_log WHERE action IN ('parish.approve','parish.suspend','parish.unsuspend','parish.delete')") >= 4);
[$s] = api('POST', '/auth/logout', $adminTok, []);
[$s2] = api('GET', '/admin/parishes', $adminTok);
t('admin logout kills the admin session', $s === 200 && $s2 === 401);
reset_state();
