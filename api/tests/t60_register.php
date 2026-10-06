<?php
function reg_body(array $over = []): array {
    return array_merge(['parish_name' => "St. Bede's Episcopal Church", 'diocese_key' => 'episcopal/western-oregon',
                        'corpus_parish_slug' => 'st-bede', 'contact_name' => 'The Rev. Ada Lovelace', 'email' => 'ada@stbedes.org'], $over);
}
/** Register and verify through the real endpoints; returns [verifyStatus, verifyBody]. */
function register_and_verify(array $over = []): array {
    $b = reg_body($over);
    http('POST', '/api/v1/register', [], $b);
    $code = last_code(strtolower(trim($b['email'])));
    return http('POST', '/api/v1/register/verify', [], ['email' => $b['email'], 'code' => $code]);
}
function approval_token_from_mail(): ?string {
    foreach (array_reverse(mail_messages()) as $m) {
        if (preg_match('/#([0-9a-f]{64})/', $m['body'], $x)) { return $x[1]; }
    }
    return null;
}

section('Register: request');
reset_state();
[$s, $b] = http('POST', '/api/v1/register', [], reg_body());
$ok = jbody($b);
t('valid registration -> 200 generic', $s === 200 && ($ok['status'] ?? '') === 'ok', "$s $b");
$msgs = mail_messages();
t('a verification code is emailed to the registrant', count($msgs) === 1 && $msgs[0]['to'] === 'ada@stbedes.org' && last_code('ada@stbedes.org') !== null);
t('the code email carries no parish name and no links', stripos($msgs[0]['body'], 'bede') === false && strpos($msgs[0]['body'], 'http') === false);
t('nothing is created until the code is verified', (int)$pdo->query('SELECT COUNT(*) FROM parishes')->fetchColumn() === 0
    && (int)$pdo->query('SELECT COUNT(*) FROM staff')->fetchColumn() === 0);
$row = $pdo->query("SELECT purpose, payload FROM login_codes WHERE purpose='register'")->fetch();
$payload = json_decode($row['payload'] ?? '', true);
t('the pending registration is held in login_codes (purpose=register)', ($payload['parish_name'] ?? '') === "St. Bede's Episcopal Church"
    && ($payload['visibility'] ?? '') === 'code' && ($payload['diocese_key'] ?? '') === 'episcopal/western-oregon');

section('Register: enumeration resistance');
reset_state();
[$aid] = make_parish('existing'); make_staff($aid, 'taken@parish.org');
mail_reset();
[$s1, $b1] = http('POST', '/api/v1/register', [], reg_body(['email' => 'taken@parish.org']));
$sent1 = count(mail_messages());
[$s2, $b2] = http('POST', '/api/v1/register', [], reg_body(['email' => 'brandnew@parish.org']));
t('an address already on staff gets the identical answer', $s1 === 200 && $s2 === 200 && $b1 === $b2, "$b1 | $b2");
t('...and no mail goes to it', $sent1 === 0);
t('...while a new address does get its code', count(mail_messages()) === 1);

section('Register: validation and injection');
reset_state();
$bad = [
    'missing parish_name' => reg_body(['parish_name' => '']), 'missing contact_name' => reg_body(['contact_name' => '']),
    'bad email' => reg_body(['email' => 'nope']), 'CR/LF in email' => reg_body(['email' => "a@b.org\r\nBcc: x@y.org"]),
    'bad diocese' => reg_body(['diocese_key' => "x' OR '1'='1"]), 'bad corpus slug' => reg_body(['corpus_parish_slug' => '../etc']),
    'bad visibility' => reg_body(['visibility' => 'secret']), 'control chars in name' => reg_body(['parish_name' => "Bad\x07Name"]),
    'over-long parish name' => reg_body(['parish_name' => str_repeat('x', 161)]),
    'over-long contact name' => reg_body(['contact_name' => str_repeat('x', 121)]),
    'array parish name' => reg_body(['parish_name' => ['x']]),
];
foreach ($bad as $label => $body) {
    [$s] = http('POST', '/api/v1/register', [], $body);
    t("$label -> 422", $s === 422, (string)$s);
}
t('none of those sent any mail', mail_messages() === []);
[$s] = http('POST', '/api/v1/register', ['Content-Type: text/plain'], null);
t('non-JSON -> 400', $s === 400);
reset_state();
[$s, $b] = register_and_verify(['parish_name' => "Robert'); DROP TABLE parishes;--", 'contact_name' => '<script>alert(1)</script>', 'email' => 'bobby@tables.org']);
$name = $pdo->query('SELECT name FROM parishes')->fetchColumn();
$who = $pdo->query('SELECT display_name FROM staff')->fetchColumn();
t('hostile names are stored as plain text and the tables survive', $s === 200 && $name === "Robert'); DROP TABLE parishes;--"
    && $who === '<script>alert(1)</script>' && count($pdo->query('SHOW TABLES')->fetchAll()) >= 9);
$slug = $pdo->query('SELECT slug FROM parishes')->fetchColumn();
t('the slug is generated safely from the name', preg_match('/^[a-z0-9-]{1,80}$/', $slug) === 1, $slug);

section('Register: verify creates a pending parish');
reset_state(); mail_reset();
http('POST', '/api/v1/register', [], reg_body());
$code = last_code('ada@stbedes.org');
[$s, $b] = http('POST', '/api/v1/register/verify', [], ['email' => 'ada@stbedes.org', 'code' => $code]);
t('verify -> 200 {status: pending_approval}', $s === 200 && jbody($b) === ['status' => 'pending_approval'], "$s $b");
$p = $pdo->query('SELECT * FROM parishes')->fetch();
t('parish created: pending, code-required, slug from name', $p['status'] === 'pending' && $p['visibility'] === 'code' && $p['slug'] === 'st-bedes-episcopal-church'
    && $p['approved_at'] === null && $p['diocese_key'] === 'episcopal/western-oregon' && $p['corpus_parish_slug'] === 'st-bede' && $p['tradition'] === 'anglican', json_encode($p));
t('a join code was generated and is stored encrypted', Crypto::decryptJoinCode($p['join_code_enc']) !== null && preg_match('/^[A-Z2-9]{8}$/', Crypto::decryptJoinCode($p['join_code_enc'])) === 1);
$st = $pdo->query('SELECT * FROM staff')->fetch();
t('the registrant is the rector, with their contact name', $st['role'] === 'rector' && $st['email'] === 'ada@stbedes.org' && $st['display_name'] === 'The Rev. Ada Lovelace' && (int)$st['parish_id'] === (int)$p['id']);
$tok = $pdo->query('SELECT * FROM approval_tokens')->fetch();
t('an approval token exists: SHA-256 stored, unused, 7-day expiry', preg_match('/^[0-9a-f]{64}$/', $tok['token_hash']) === 1 && $tok['used_at'] === null
    && (int)$pdo->query('SELECT TIMESTAMPDIFF(HOUR, created_at, expires_at) FROM approval_tokens')->fetchColumn() === 168);
$admin = array_values(array_filter(mail_messages(), fn($m) => strpos($m['subject'], 'Parish awaiting approval') === 0));
t('the admin is emailed: one message, right subject', count($admin) === 1 && $admin[0]['to'] === 'a@example.org'
    && $admin[0]['subject'] === "Parish awaiting approval: St. Bede's Episcopal Church", json_encode(array_column(mail_messages(), 'subject')));
$body = $admin[0]['body'] ?? '';
t('...with parish, diocese, contact, contact email', strpos($body, "Parish: St. Bede's Episcopal Church") !== false && strpos($body, 'episcopal/western-oregon') !== false
    && strpos($body, 'The Rev. Ada Lovelace') !== false && strpos($body, 'ada@stbedes.org') !== false);
$token = approval_token_from_mail();
t('...and the approval URL has the token in the #fragment', $token !== null && strpos($body, "http://localhost/parish/approve.html#$token") !== false);
t('...whose hash matches the stored token; the raw token is in no table', hash('sha256', (string)$token) === $tok['token_hash']
    && (int)$pdo->query("SELECT COUNT(*) FROM approval_tokens WHERE token_hash = " . $pdo->quote($token))->fetchColumn() === 0);
t('the admin mail says it expires in 7 days and that opening it approves nothing', strpos($body, '7 days') !== false && strpos($body, 'does not approve') !== false);
[$s, $b] = http('GET', '/api/v1/parishes');
t('the pending parish is not listed', jbody($b)['parishes'] === []);
[$s] = http('GET', '/api/v1/parishes/st-bedes-episcopal-church/intentions');
t('...and serves nothing (404)', $s === 404);
mail_reset(); http('POST', '/api/v1/auth/request-code', [], ['email' => 'ada@stbedes.org']);
t('the pending rector cannot log in (no code is mailed)', mail_messages() === []);
[$s] = http('POST', '/api/v1/register/verify', [], ['email' => 'ada@stbedes.org', 'code' => $code]);
t('the registration code works only once', $s === 401 && (int)$pdo->query('SELECT COUNT(*) FROM parishes')->fetchColumn() === 1);

section('Register: code rules');
reset_state();
http('POST', '/api/v1/register', [], reg_body());
$real = last_code('ada@stbedes.org'); $wrong = $real === '111111' ? '222222' : '111111';
$r = [];
for ($i = 0; $i < 5; $i++) { [$r[]] = http('POST', '/api/v1/register/verify', [], ['email' => 'ada@stbedes.org', 'code' => $wrong]); }
[$s] = http('POST', '/api/v1/register/verify', [], ['email' => 'ada@stbedes.org', 'code' => $real]);
t('5 wrong guesses kill the registration code', $r === [401, 401, 401, 401, 401] && $s === 401 && (int)$pdo->query('SELECT COUNT(*) FROM parishes')->fetchColumn() === 0);
reset_state();
http('POST', '/api/v1/register', [], reg_body());
$real = last_code('ada@stbedes.org');
$pdo->exec('UPDATE login_codes SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 SECOND');
[$s] = http('POST', '/api/v1/register/verify', [], ['email' => 'ada@stbedes.org', 'code' => $real]);
t('an expired registration code is rejected', $s === 401);
reset_state(); [$aid] = make_parish('other'); make_staff($aid, 'ada@stbedes.org');
$pdo->prepare("INSERT INTO login_codes (purpose,email,code_hash,created_at,expires_at) VALUES ('login','ada@stbedes.org',?,UTC_TIMESTAMP(),UTC_TIMESTAMP()+INTERVAL 10 MINUTE)")->execute([Crypto::hmac('login|ada@stbedes.org|123456')]);
[$s] = http('POST', '/api/v1/register/verify', [], ['email' => 'ada@stbedes.org', 'code' => '123456']);
t('a LOGIN code cannot complete a registration (purposes are separate)', $s === 401);
reset_state();
http('POST', '/api/v1/register', [], reg_body(['email' => 'reg@x.org']));
$regCode = last_code('reg@x.org');
[$s] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'reg@x.org', 'code' => $regCode]);
t('a REGISTRATION code cannot log anyone in', $s === 401);
[$s, $b] = http('POST', '/api/v1/register/verify', [], ['email' => 'nobody@x.org', 'code' => '000000']);
[$s2, $b2] = http('POST', '/api/v1/register/verify', [], ['email' => 'reg@x.org', 'code' => $regCode === '000000' ? '000001' : '000000']);
t('every verify failure looks the same', $s === 401 && $b === $b2);
reset_state();

section('Register: slugs and public parishes');
[$s] = register_and_verify(['email' => 'one@x.org']);
[$s2] = register_and_verify(['email' => 'two@x.org']);
[$s3] = register_and_verify(['email' => 'three@x.org', 'visibility' => 'public']);
$slugs = $pdo->query('SELECT slug FROM parishes ORDER BY id')->fetchAll(PDO::FETCH_COLUMN);
t('the same name gets numeric suffixes: name, name-2, name-3', $s === 200 && $s2 === 200 && $s3 === 200
    && $slugs === ['st-bedes-episcopal-church', 'st-bedes-episcopal-church-2', 'st-bedes-episcopal-church-3'], json_encode($slugs));
$pub = $pdo->query("SELECT visibility, join_code_enc FROM parishes WHERE slug LIKE '%-3'")->fetch();
t('a public registration stores no join code', $pub['visibility'] === 'public' && $pub['join_code_enc'] === null);
t('slugify: accents, apostrophes, symbols, emptiness', Validate::slugify("Église Saint-Étienne d'Œuvre") === 'eglise-saint-etienne-doeuvre'
    && Validate::slugify('!!!') === 'parish' && Validate::slugify(str_repeat('a', 200)) === str_repeat('a', 80)
    && Validate::slugify("St. Mary's — Cathedral") === 'st-marys-cathedral');
[$s] = register_and_verify(['email' => 'nodiocese@x.org', 'diocese_key' => null, 'corpus_parish_slug' => null, 'parish_name' => 'No Diocese Church']);
t('diocese and corpus reference are optional', $s === 200 && $pdo->query("SELECT diocese_key FROM parishes WHERE slug='no-diocese-church'")->fetchColumn() === null);

section('Register: rate limits');
reset_state();
$r = []; for ($i = 1; $i <= 6; $i++) { [$r[]] = http('POST', '/api/v1/register', [], reg_body(['email' => "p$i@x.org"])); }
t('register: 5 per IP per hour (6th -> 429)', $r === [200, 200, 200, 200, 200, 429], json_encode($r));
[$s, $b, $h] = http('POST', '/api/v1/register', [], reg_body(['email' => 'p7@x.org']));
t('...with Retry-After', $s === 429 && (int)($h['retry-after'] ?? 0) > 0);
$pdo->exec('TRUNCATE TABLE rate_limits');
$r = []; for ($i = 1; $i <= 4; $i++) { [$r[]] = http('POST', '/api/v1/register', [], reg_body(['email' => 'same@x.org'])); }
t('register: 3 per email per hour (4th -> 429)', $r === [200, 200, 200, 429], json_encode($r));
reset_state();
