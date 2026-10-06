<?php
section('Auth: email handling and mail');
t('normalize: trims and lowercases', Auth::normalizeEmail("  Rev@Example.ORG ") === 'rev@example.org');
t('normalize rejects CR/LF injection', Auth::normalizeEmail("a@b.org\r\nBcc: x@y.org") === null && Auth::normalizeEmail("a@b.org\nBcc: x@y.org") === null);
t('normalize rejects junk and non-strings', Auth::normalizeEmail('nope') === null && Auth::normalizeEmail(null) === null
    && Auth::normalizeEmail(['a@b.org']) === null && Auth::normalizeEmail(str_repeat('a', 250) . '@b.org') === null);
reset_state();
t('mailer refuses CR/LF in recipient (nothing logged)', !Mailer::send("a@b.org\r\nBcc: x@y.org", 'Hi', 'body') && mail_messages() === []);
t('mailer refuses CR/LF in subject (nothing logged)', !Mailer::send('a@b.org', "Hi\r\nBcc: x@y.org", 'body') && mail_messages() === []);
t('log driver records a message', Mailer::send('a@b.org', 'Hello', "Line one\nLine two") && mail_messages() === [['to' => 'a@b.org', 'subject' => 'Hello', 'body' => "Line one\nLine two\n"]]);

// A broken SMTP config must fail quietly (false), never throw or leak details.
$badCfg = "$tmp/config-badsmtp.php";
$c = include $cfgFile;
$c['mail'] = ['driver' => 'smtp', 'host' => '127.0.0.1', 'port' => 1, 'encryption' => 'tls', 'username' => 'u', 'password' => 'p',
              'from_email' => 'admin@example.org', 'from_name' => 'UO'];
file_put_contents($badCfg, '<?php return ' . var_export($c, true) . ';');
Config::load($badCfg);
$t0 = microtime(true);
$sent = Mailer::send('someone@example.org', 'x', 'y');
Config::load($cfgFile);
t('unreachable SMTP server -> returns false quietly and quickly', $sent === false && (microtime(true) - $t0) < 10);
$log = (string)@file_get_contents("$tmp/logs/api-error.log");
t('error log names the exception class only (no addresses)', strpos($log, 'mail send failed') !== false && strpos($log, 'someone@example.org') === false);

section('Auth: request-code enumeration resistance');
reset_state();
[$aid] = make_parish('alpha', 'approved', 'code');
[$pid] = make_parish('waiting', 'pending', 'code');
[$xid] = make_parish('banned', 'suspended', 'code');
make_staff($aid, 'rector@alpha.org');
make_staff($pid, 'rector@waiting.org');
make_staff($xid, 'rector@banned.org');
[$s1, $b1] = http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
[$s2, $b2] = http('POST', '/api/v1/auth/request-code', [], ['email' => 'stranger@nowhere.org']);
[$s3, $b3] = http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@waiting.org']);
[$s4, $b4] = http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@banned.org']);
t('authorized and unauthorized get byte-identical answers', $s1 === 200 && $s2 === 200 && $b1 === $b2 && $b2 === $b3 && $b3 === $b4, "$b1 | $b2");
$msgs = mail_messages();
t('mail sent only to staff of the approved parish', count($msgs) === 1 && $msgs[0]['to'] === 'rector@alpha.org', json_encode(array_column($msgs, 'to')));
t('message subject and wording follow the spec', ($msgs[0]['subject'] ?? '') === 'Your Universal Office code'
    && strpos($msgs[0]['body'] ?? '', 'expires in 10 minutes') !== false);
t('message has no links and no parish name', strpos($msgs[0]['body'], 'http') === false && stripos($msgs[0]['body'], 'alpha') === false);
[$s, $b] = http('POST', '/api/v1/auth/request-code', [], ['email' => "  RECTOR@Alpha.ORG "]);
t('email is matched case-insensitively and trimmed', $s === 200 && count(mail_messages()) === 2);
$row = $pdo->query('SELECT code_hash FROM login_codes ORDER BY id DESC LIMIT 1')->fetch();
t('code is stored only as a 64-hex HMAC, not the code itself', preg_match('/^[0-9a-f]{64}$/', $row['code_hash']) === 1
    && $row['code_hash'] !== last_code('rector@alpha.org'));

section('Auth: header injection and bad input');
reset_state(); [$aid] = make_parish('alpha'); make_staff($aid, 'rector@alpha.org');
[$s, $b] = http('POST', '/api/v1/auth/request-code', [], ['email' => "rector@alpha.org\r\nBcc: attacker@evil.org"]);
t('CR/LF in email -> 422 and no mail', $s === 422 && mail_messages() === [], "$s");
[$s] = http('POST', '/api/v1/auth/request-code', [], ['email' => "rector@alpha.org\nBcc: attacker@evil.org"]);
t('bare LF in email -> 422 and no mail', $s === 422 && mail_messages() === []);
[$s] = http('POST', '/api/v1/auth/request-code', [], ['email' => ['x']]);
t('non-string email -> 422', $s === 422);
[$s] = http('POST', '/api/v1/auth/request-code', ['Content-Type: text/plain'], null);
t('non-JSON request -> 400', $s === 400);
[$s] = http('POST', '/api/v1/auth/request-code', [], ['email' => "x' OR '1'='1@a.org"]);
t('SQL-injection-shaped email is rejected or harmless (no mail)', in_array($s, [200, 422], true) && mail_messages() === []);
[$s] = http('GET', '/api/v1/auth/request-code');
t('wrong method -> 405', $s === 405);

section('Auth: code lifetime, guesses, single use');
reset_state(); [$aid] = make_parish('alpha'); make_staff($aid, 'rector@alpha.org', 'rector', 'Rev. Alpha');
http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
$code = last_code('rector@alpha.org');
[$s, $b] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => $code]);
$ok = jbody($b);
t('correct code -> 200 with token, expiry, staff, parish', $s === 200 && preg_match('/^[0-9a-f]{64}$/', $ok['token'] ?? '') === 1
    && ($ok['staff']['role'] ?? '') === 'rector' && ($ok['staff']['display_name'] ?? '') === 'Rev. Alpha'
    && ($ok['parish']['slug'] ?? '') === 'alpha' && ($ok['parish']['status'] ?? '') === 'approved', "$s $b");
t('response does not echo the email', strpos($b, 'rector@alpha.org') === false);
[$s2] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => $code]);
t('a code works only once', $s2 === 401);

http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
$old = last_code('rector@alpha.org');
http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
$new = last_code('rector@alpha.org');
$wrongOne = ($new === '000000') ? '000001' : '000000';
[$s] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => $old === $new ? $wrongOne : $old]);
t('a newer code kills the previous one', $s === 401);
[$s] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => $new]);
t('...and the newest code works', $s === 200);

http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
$real = last_code('rector@alpha.org');
$bad = ($real === '111111') ? '222222' : '111111';
$statuses = [];
for ($i = 0; $i < 5; $i++) { [$statuses[]] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => $bad]); }
[$s] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => $real]);
t('5 wrong guesses kill the code; the right code then fails', $statuses === [401, 401, 401, 401, 401] && $s === 401, json_encode($statuses) . " $s");

reset_state(); [$aid] = make_parish('alpha'); make_staff($aid, 'rector@alpha.org');
http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
$real = last_code('rector@alpha.org');
$pdo->exec("UPDATE login_codes SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 SECOND");
[$s] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => $real]);
t('an expired code is rejected', $s === 401);
http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
$life = $pdo->query('SELECT TIMESTAMPDIFF(SECOND, created_at, expires_at) FROM login_codes ORDER BY id DESC LIMIT 1')->fetchColumn();
t('code lifetime is exactly 10 minutes', (int)$life === 600, (string)$life);

reset_state(); [$aid] = make_parish('alpha'); make_staff($aid, 'rector@alpha.org');
http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
$real = last_code('rector@alpha.org');
$r1 = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => '999999' === $real ? '888888' : '999999']);
$r2 = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'nobody@nowhere.org', 'code' => '999999']);
$r3 = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'not an email', 'code' => '999999']);
$r4 = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => "12 34'; DROP TABLE staff;--"]);
t('every failure looks identical (wrong code, unknown user, bad email, injection)', $r1[0] === 401 && $r1[1] === $r2[1] && $r2[1] === $r3[1] && $r3[1] === $r4[1]);
t('staff table survived the injection attempt', (int)$pdo->query('SELECT COUNT(*) FROM staff')->fetchColumn() === 1);
[$s] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => ['x']]);
t('non-string code -> 401', $s === 401);

section('Auth: pending and suspended parishes cannot log in');
reset_state();
[$pid] = make_parish('waiting', 'pending'); make_staff($pid, 'rector@waiting.org');
$pdo->prepare("INSERT INTO login_codes (purpose,email,code_hash,created_at,expires_at) VALUES ('login','rector@waiting.org',?,UTC_TIMESTAMP(),UTC_TIMESTAMP()+INTERVAL 10 MINUTE)")
    ->execute([Crypto::hmac('login|rector@waiting.org|123456')]);
[$s] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@waiting.org', 'code' => '123456']);
t('a valid code for a pending parish still gives no session', $s === 401 && (int)$pdo->query('SELECT COUNT(*) FROM sessions')->fetchColumn() === 0);

section('Auth: sessions, /me, logout');
reset_state(); [$aid] = make_parish('alpha', 'approved', 'code', null, 'Alpha Church'); $sid = make_staff($aid, 'rector@alpha.org', 'rector', 'Rev. Alpha');
$token = login_as('rector@alpha.org');
t('login helper produced a token', strlen($token) === 64);
[$s, $b] = http('GET', '/api/v1/me', ["Authorization: Bearer $token"]);
$me = jbody($b);
t('/me returns the staff member and parish', $s === 200 && ($me['principal'] ?? '') === 'staff' && ($me['staff']['role'] ?? '') === 'rector'
    && ($me['parish']['slug'] ?? '') === 'alpha' && ($me['parish']['name'] ?? '') === 'Alpha Church' && !isset($me['parish']['id']), "$s $b");
[$s] = http('GET', '/api/v1/me');
t('no token -> 401', $s === 401);
[$s] = http('GET', '/api/v1/me', ['Authorization: Bearer ' . str_repeat('0', 64)]);
t('unknown token -> 401', $s === 401);
[$s] = http('GET', '/api/v1/me', ["Authorization: Token $token"]);
t('wrong scheme -> 401', $s === 401);
[$s] = http('GET', '/api/v1/me', ["Cookie: token=$token; session=$token"]);
t('a token in a cookie is ignored (bearer header only)', $s === 401);
[$s] = http('GET', "/api/v1/me?token=$token&access_token=$token");
t('a token in the URL is ignored', $s === 401);

$row = $pdo->query('SELECT token_hash, TIMESTAMPDIFF(HOUR, created_at, expires_at) AS hrs FROM sessions ORDER BY id DESC LIMIT 1')->fetch();
t('session token stored only as its SHA-256', $row['token_hash'] === hash('sha256', $token) && $row['token_hash'] !== $token);
t('session lasts 30 days (720 hours), absolute', (int)$row['hrs'] === 720, $row['hrs']);
$found = 0;
foreach (['sessions', 'login_codes', 'staff', 'audit_log'] as $tbl) {
    $found += (int)$pdo->query("SELECT COUNT(*) FROM `$tbl` WHERE CONCAT_WS('|', " . implode(',', array_map(fn($c) => "`$c`", $pdo->query("SHOW COLUMNS FROM `$tbl`")->fetchAll(PDO::FETCH_COLUMN))) . ") LIKE " . $pdo->quote("%$token%"))->fetchColumn();
}
t('the raw token appears in no table', $found === 0);
t('audit log records the login by id, not by email', (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE action='session.create' AND actor='staff:$sid' AND detail IS NULL")->fetchColumn() === 1);

[$s] = http('POST', '/api/v1/auth/logout');
t('logout without a token -> 401', $s === 401);
[$s] = http('POST', '/api/v1/auth/logout', ["Authorization: Bearer $token"]);
t('logout -> 200', $s === 200);
[$s] = http('GET', '/api/v1/me', ["Authorization: Bearer $token"]);
t('the token is dead after logout', $s === 401 && (int)$pdo->query('SELECT COUNT(*) FROM sessions')->fetchColumn() === 0);

$token = login_as('rector@alpha.org');
$pdo->exec("UPDATE sessions SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 SECOND");
[$s] = http('GET', '/api/v1/me', ["Authorization: Bearer $token"]);
t('an expired session is rejected', $s === 401);

$token = login_as('rector@alpha.org');
$pdo->exec("UPDATE parishes SET status='suspended' WHERE slug='alpha'");
[$s] = http('GET', '/api/v1/me', ["Authorization: Bearer $token"]);
t('suspending the parish kills existing sessions immediately', $s === 401);
$pdo->exec("UPDATE parishes SET status='approved' WHERE slug='alpha'");
[$s] = http('GET', '/api/v1/me', ["Authorization: Bearer $token"]);
t('...and un-suspending restores them', $s === 200);

$pdo->exec('DELETE FROM staff');
[$s] = http('GET', '/api/v1/me', ["Authorization: Bearer $token"]);
t('deleting the staff row removes their sessions (cascade)', $s === 401 && (int)$pdo->query('SELECT COUNT(*) FROM sessions')->fetchColumn() === 0);

reset_state();
$adminTok = Auth::createSession('admin', null, 'admin@example.org')['token'];
[$s, $b] = http('GET', '/api/v1/me', ["Authorization: Bearer $adminTok"]);
t('/me recognises an admin session', $s === 200 && (jbody($b)['principal'] ?? '') === 'admin');

section('Auth: rate limits');
reset_state(); [$aid] = make_parish('alpha'); make_staff($aid, 'rector@alpha.org');
$codes = []; for ($i = 1; $i <= 6; $i++) { [$codes[]] = http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']); }
t('request-code: 5 per email per hour, 6th -> 429', $codes === [200, 200, 200, 200, 200, 429], json_encode($codes));
[$s, $b, $h] = http('POST', '/api/v1/auth/request-code', [], ['email' => 'rector@alpha.org']);
t('...with Retry-After and a generic body', $s === 429 && (int)($h['retry-after'] ?? 0) > 0 && (jbody($b)['error'] ?? '') === 'rate_limited');
$last = null; $hit = null;
for ($i = 1; $i <= 22; $i++) { [$last] = http('POST', '/api/v1/auth/request-code', [], ['email' => "user$i@example.org"]); if ($last === 429 && $hit === null) { $hit = $i; } }
t('request-code: 20 per IP per hour (21st distinct address -> 429; 5 already used by the earlier test)', $hit !== null && $hit <= 16, "first 429 at #$hit");
reset_state(); [$aid] = make_parish('alpha'); make_staff($aid, 'rector@alpha.org');
$codes = []; for ($i = 1; $i <= 11; $i++) { [$codes[]] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'rector@alpha.org', 'code' => '000000']); }
t('verify-code: 10 per email per hour, 11th -> 429', array_slice($codes, 0, 10) === array_fill(0, 10, 401) && $codes[10] === 429, json_encode($codes));
reset_state();
