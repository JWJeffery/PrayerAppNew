<?php
// Administrators designated inside the app (migration 003): owners come from the private config,
// designated administrators live in the admins table and are managed on the admin page.
section('Admins: designated inside the app');
reset_state();
[$aid, $acode] = make_parish('adm-alpha', 'approved', 'code', null, 'Admin Alpha');
$owner = Auth::createSession('admin', null, 'a@example.org')['token'];
$ob = ['Authorization: Bearer ' . $owner];
t('table exists: admins', in_array('admins', $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN), true));
t('003 recorded once', (int)$pdo->query("SELECT COUNT(*) FROM schema_migrations WHERE version='003_admins'")->fetchColumn() === 1);

$bad = [];
foreach ([['GET', '/admin/admins'], ['POST', '/admin/admins'], ['DELETE', '/admin/admins/1']] as [$m, $path]) {
    [$s] = http($m, "/api/v1$path", [], $m === 'POST' ? [] : null); if ($s !== 401) { $bad[] = "$m $path=$s"; }
}
t('the admin routes need a session (401)', $bad === [], implode(', ', $bad));
$staffTok = login_as((function () use ($aid) { make_staff($aid, 'rector@admalpha.org', 'rector'); return 'rector@admalpha.org'; })());
[$s] = http('GET', '/api/v1/admin/admins', ['Authorization: Bearer ' . $staffTok]);
t('a rector session cannot see or manage administrators (403)', $s === 403);

[$s, $b] = http('GET', '/api/v1/admin/admins', $ob);
$l = jbody($b);
t('the owner sees themselves listed as an owner, able to manage', $s === 200 && ($l['admins'][0]['email'] ?? '') === 'a@example.org' && ($l['admins'][0]['owner'] ?? false) === true && ($l['can_manage'] ?? false) === true, "$s $b");

foreach ([[], ['email' => 'not-an-email'], ['email' => "x@y.org\r\nBcc: e@evil.org"], ['email' => ['a@b.org']]] as $case) {
    [$s] = http('POST', '/api/v1/admin/admins', $ob, $case);
    t('add rejected: ' . substr(json_encode($case), 0, 40), $s === 422, "$s");
}
mail_reset();
[$s, $b] = http('POST', '/api/v1/admin/admins', $ob, ['email' => '  Helper@Example.ORG ']);
$new = jbody($b)['admin'] ?? [];
t('an owner designates an administrator (address cleaned)', $s === 201 && ($new['email'] ?? '') === 'helper@example.org' && ($new['id'] ?? 0) > 0, "$s $b");
$msgs = array_values(array_filter(mail_messages(), fn($m) => $m['to'] === 'helper@example.org'));
t('the new administrator is emailed how to sign in', count($msgs) === 1 && strpos($msgs[0]['body'], '/parish/admin.html') !== false && !preg_match('/\b\d{6}\b/', $msgs[0]['body']));
[$s] = http('POST', '/api/v1/admin/admins', $ob, ['email' => 'helper@example.org']);
t('adding the same address again -> 409', $s === 409);
[$s] = http('POST', '/api/v1/admin/admins', $ob, ['email' => 'A@example.org']);
t('adding an owner again -> 409', $s === 409);
t('the audit log records ids only, never the address', (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE action = 'admin.add' AND detail LIKE '%@%'")->fetchColumn() === 0);

section('Admins: a designated administrator signs in and works');
mail_reset();
[$s] = http('POST', '/api/v1/admin/auth/request-code', [], ['email' => 'helper@example.org']);
$code = last_code('helper@example.org');
t('a designated address is sent an admin code', $s === 200 && $code !== null);
[$s, $b] = http('POST', '/api/v1/admin/auth/verify-code', [], ['email' => 'helper@example.org', 'code' => $code]);
$helper = jbody($b)['token'] ?? '';
t('...and gets an administrator session', $s === 200 && strlen($helper) === 64);
$hb = ['Authorization: Bearer ' . $helper];
[$s] = http('GET', '/api/v1/admin/parishes', $hb);
t('a designated administrator can manage parishes', $s === 200);
[$s, $b] = http('GET', '/api/v1/parishes/adm-alpha', $hb);
t('...and open any parish page, join code or not', $s === 200 && (jbody($b)['viewer_admin'] ?? false) === true && strpos($b, $acode) === false);
[$s, $b] = http('GET', '/api/v1/admin/admins', $hb);
t('...can see the administrator list, but not manage it', $s === 200 && (jbody($b)['can_manage'] ?? true) === false);
[$s] = http('POST', '/api/v1/admin/admins', $hb, ['email' => 'third@example.org']);
t('...cannot add administrators (403)', $s === 403);
[$s] = http('DELETE', '/api/v1/admin/admins/' . $new['id'], $hb);
t('...cannot remove administrators (403)', $s === 403);
t('nothing was added by that attempt', (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn() === 1);

section('Admins: removing someone ends their access at once');
[$s] = http('DELETE', '/api/v1/admin/admins/999999', $ob);
t('removing an unknown id -> 404', $s === 404);
[$s] = http('DELETE', '/api/v1/admin/admins/abc', $ob);
t('removing a non-numeric id -> 404', $s === 404);
[$s] = http('DELETE', '/api/v1/admin/admins/' . $new['id'], $ob);
t('an owner removes the administrator', $s === 200 && (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn() === 0);
t('...their sessions are deleted', (int)$pdo->query("SELECT COUNT(*) FROM sessions WHERE admin_email = 'helper@example.org'")->fetchColumn() === 0);
[$s] = http('GET', '/api/v1/admin/parishes', $hb);
t('...their old token no longer manages parishes (401)', $s === 401);
[$s] = http('GET', '/api/v1/parishes/adm-alpha', $hb);
t('...nor opens a code-only parish page (401)', $s === 401);
mail_reset();
[$s] = http('POST', '/api/v1/admin/auth/request-code', [], ['email' => 'helper@example.org']);
t('...and is no longer sent a code', $s === 200 && last_code('helper@example.org') === null);
[$s, $b] = http('GET', '/api/v1/admin/admins', $ob);
t('the owner cannot be removed through the app (no id to remove)', ($l2 = jbody($b)['admins'] ?? []) && count($l2) === 1 && $l2[0]['id'] === null);

section('Admins: a session whose address is on no list is refused everywhere');
$ghost = Auth::createSession('admin', null, 'ghost@example.org')['token'];
$gb = ['Authorization: Bearer ' . $ghost];
$bad = [];
foreach ([['GET', '/admin/parishes'], ['GET', '/admin/status'], ['GET', '/admin/admins'], ['PUT', '/admin/dioceses/episcopal/iowa']] as [$m, $path]) {
    [$s] = http($m, "/api/v1$path", $gb, $m === 'PUT' ? [] : null); if ($s !== 401) { $bad[] = "$m $path=$s"; }
}
t('every admin route returns 401', $bad === [], implode(', ', $bad));

section('Admins: status lists database updates not yet imported');
[$s, $b] = http('GET', '/api/v1/admin/status', ['Authorization: Bearer ' . ($ownerTok = Auth::createSession('admin', null, 'a@example.org')['token'])]);
$st = jbody($b);
t('status reports no pending updates when the database is current', $s === 200 && ($st['pending_migrations'] ?? ['x']) === [], "$s $b");
$pdo->exec("DELETE FROM schema_migrations WHERE version = '004_accounts'");
[$s, $b] = http('GET', '/api/v1/admin/status', ['Authorization: Bearer ' . $ownerTok]);
t('...and names an update that is missing', ($st2 = jbody($b))['pending_migrations'] === ['004_accounts'], $b);
$pdo->exec("INSERT IGNORE INTO schema_migrations (version, applied_at) VALUES ('004_accounts', UTC_TIMESTAMP())");
section('Admins: a value the tables cannot store fails loudly');
$bad = false;
try { $pdo = Db::pdo(); $pdo->exec("INSERT INTO login_codes (purpose, email, code_hash, created_at, expires_at) VALUES ('nonexistent', 'x@y.org', REPEAT('a',64), UTC_TIMESTAMP(), UTC_TIMESTAMP())"); }
catch (PDOException $e) { $bad = true; }
t('inserting an unknown code purpose is an error, not a silent blank', $bad);
