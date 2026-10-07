<?php
// Optional accounts (migration 004): reader sign-in with an emailed code, saved settings, optional passwords,
// re-confirmation, and the passkey endpoints (the full browser ceremony is in browser/accounts.mjs).
function jpost(string $path, array $body = [], array $h = []): array { return http('POST', "/api/v1$path", $h, $body); }
function auth_h(string $t): array { return ['Authorization: Bearer ' . $t]; }
function reader_login(string $email): string {
    mail_reset();
    jpost('/reader/request-code', ['email' => $email]);
    [$s, $b] = jpost('/reader/verify-code', ['email' => $email, 'code' => last_code($email)]);
    return jbody($b)['token'] ?? '';
}
const GOODPW = 'seven quiet candles at dusk';

section('Accounts: migration 004');
t('tables exist', count(array_intersect(['readers', 'credentials', 'passkeys', 'webauthn_challenges'], $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN))) === 4);
t('004 recorded once', (int)$pdo->query("SELECT COUNT(*) FROM schema_migrations WHERE version='004_accounts'")->fetchColumn() === 1);

section('Accounts: reader sign-in with an emailed code');
reset_state();
[$s, $b] = jpost('/reader/request-code', ['email' => 'not-an-email']);
t('a bad address is refused (422)', $s === 422);
[$s, $b] = jpost('/reader/request-code', ['email' => "x@y.org\r\nBcc: e@evil.org"]);
t('header injection is refused (422)', $s === 422);
mail_reset();
[$s, $b1] = jpost('/reader/request-code', ['email' => 'Reader@Example.org ']);
t('any valid address is sent a code', $s === 200 && last_code('reader@example.org') !== null);
[$s, $b2] = jpost('/reader/request-code', ['email' => 'someone.else@example.org']);
t('the answer is identical for every address', $b1 === $b2);
[$s] = jpost('/reader/verify-code', ['email' => 'reader@example.org', 'code' => '000000']);
t('a wrong code is refused (401)', $s === 401);
mail_reset(); jpost('/reader/request-code', ['email' => 'reader@example.org']);
$code = last_code('reader@example.org');
[$s, $b] = jpost('/reader/verify-code', ['email' => 'reader@example.org', 'code' => $code]);
$j = jbody($b);
t('the right code creates the account and signs in', $s === 200 && strlen($j['token'] ?? '') === 64 && ($j['principal'] ?? '') === 'reader', "$s $b");
t('...with no password and no passkeys yet', ($j['account']['has_password'] ?? null) === false && ($j['account']['passkeys'] ?? -1) === 0);
[$s] = jpost('/reader/verify-code', ['email' => 'reader@example.org', 'code' => $code]);
t('the code works only once', $s === 401);
t('exactly one reader row', (int)$pdo->query("SELECT COUNT(*) FROM readers WHERE email='reader@example.org'")->fetchColumn() === 1);
$rt = $j['token'];
[$s, $b] = http('GET', '/api/v1/me', auth_h($rt));
t('/me says reader, with the address and how they can sign in', $s === 200 && (jbody($b)['principal'] ?? '') === 'reader' && (jbody($b)['email'] ?? '') === 'reader@example.org' && isset(jbody($b)['account']['has_password']));
[$s] = http('GET', '/api/v1/staff/intentions', auth_h($rt));
t('a reader session is not a staff session (403)', $s === 403);
[$s] = http('GET', '/api/v1/admin/parishes', auth_h($rt));
t('a reader session is not an admin session (403)', $s === 403);
[$s] = http('POST', '/api/v1/auth/verify-code', [], ['email' => 'reader@example.org', 'code' => $code]);
t('a reader code cannot sign anyone in as staff', $s === 401);
t('the audit log keeps ids only', (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE detail LIKE '%@%' OR actor LIKE '%@%'")->fetchColumn() === 0);
$pdo->exec('TRUNCATE TABLE rate_limits');
$bad = []; for ($i = 0; $i < 6; $i++) { [$s] = jpost('/reader/request-code', ['email' => 'flood@example.org']); $bad[] = $s; }
t('code requests are limited per address (6th -> 429)', $bad[5] === 429 && $bad[4] === 200, json_encode($bad));

section('Accounts: saved settings');
$pdo->exec('TRUNCATE TABLE rate_limits');
[$s, $b] = http('GET', '/api/v1/reader/profile', auth_h($rt));
t('a new account has no saved settings', $s === 200 && array_key_exists('profile', jbody($b)) && jbody($b)['profile'] === null, "$s $b");
$prof = ['userName' => 'Josh', 'traditionDefault' => 'anglican', 'cycleOfPrayerDiocese' => 'episcopal/western-oregon', 'parishIntentionsSlug' => 'st-bedes', 'exploreOtherOffices' => true, 'x' => null];
[$s, $b] = http('PUT', '/api/v1/reader/profile', auth_h($rt), ['profile' => $prof]);
t('settings are saved', $s === 200 && isset(jbody($b)['updated_at']), "$s $b");
[$s, $b] = http('GET', '/api/v1/reader/profile', auth_h($rt));
t('...and come back exactly as saved', $s === 200 && jbody($b)['profile'] == $prof);
t('...stored encrypted, not as readable text', strpos((string)$pdo->query("SELECT profile_enc FROM readers LIMIT 1")->fetchColumn(), 'Josh') === false);
foreach ([['profile' => 'text'], ['profile' => ['a' => ['nested' => 1]]], ['profile' => ['bad key!' => 1]], ['profile' => ['k' => str_repeat('z', 601)]],
          ['profile' => [1, 2, 3]], []] as $i => $case) {
    [$s] = http('PUT', '/api/v1/reader/profile', auth_h($rt), $case);
    t("settings rejected: case $i", $s === 422, "$s");
}
$big = []; for ($i = 0; $i < 12; $i++) { $big['k' . $i] = str_repeat('a', 590); }
[$s] = http('PUT', '/api/v1/reader/profile', auth_h($rt), ['profile' => $big]);
t('settings over the size limit are refused (422)', $s === 422);
[$s, $b] = http('GET', '/api/v1/reader/profile', auth_h($rt));
t('a refused save changes nothing', jbody($b)['profile'] == $prof);
[$s] = http('GET', '/api/v1/reader/profile');
t('no session -> 401', $s === 401);
make_parish('acct-p', 'approved', 'public'); $rid = make_staff((int)$pdo->query("SELECT id FROM parishes WHERE slug='acct-p'")->fetchColumn(), 'rector@acct.org', 'rector');
[$s] = http('GET', '/api/v1/reader/profile', auth_h(Auth::createSession('staff', $rid)['token']));
t('only a reader session reads reader settings (403)', $s === 403);

section('Accounts: passwords');
$pdo->exec('TRUNCATE TABLE rate_limits');
foreach (['short one', str_repeat('a', 129), 'passwordpassword', 'aaaaaaaaaaaaaaaaaaaa', 'reader@example.org1234', 'readerreader longer words'] as $i => $pw) {
    [$s, $b] = http('POST', '/api/v1/account/password', auth_h($rt), ['password' => $pw]);
    t("password rejected: case $i", $s === 422 && isset(jbody($b)['fields']['password']), "$s $b");
}
[$s] = http('POST', '/api/v1/account/password', auth_h($rt), ['password' => ['array']]);
t('a non-string password is refused (422)', $s === 422);
[$s, $b] = http('POST', '/api/v1/account/password', auth_h($rt), ['password' => GOODPW]);
t('a good passphrase is accepted', $s === 200 && (jbody($b)['account']['has_password'] ?? false) === true, "$s $b");
$hash = (string)$pdo->query("SELECT password_hash FROM credentials WHERE email='reader@example.org'")->fetchColumn();
t('only a salted Argon2id (or bcrypt) hash is stored', $hash !== '' && strpos($hash, GOODPW) === false && (strpos($hash, '$argon2id$') === 0 || strpos($hash, '$2y$') === 0));
t('...with the cheaper-than-default memory setting we chose', strpos($hash, 'm=19456,t=2,p=1') !== false || strpos($hash, '$2y$') === 0);
[$s, $b] = jpost('/auth/password-login', ['email' => 'reader@example.org', 'password' => GOODPW, 'as' => 'reader']);
$pwTok = jbody($b)['token'] ?? '';
t('the reader signs in with the password', $s === 200 && strlen($pwTok) === 64 && (jbody($b)['principal'] ?? '') === 'reader', "$s $b");
[$s, $bw] = jpost('/auth/password-login', ['email' => 'reader@example.org', 'password' => 'wrong wrong wrong wrong', 'as' => 'reader']);
[$s2, $bu] = jpost('/auth/password-login', ['email' => 'nobody@example.org', 'password' => 'wrong wrong wrong wrong', 'as' => 'reader']);
[$s3, $br] = jpost('/auth/password-login', ['email' => 'reader@example.org', 'password' => GOODPW, 'as' => 'staff']);
[$s4, $bx] = jpost('/auth/password-login', ['email' => 'reader@example.org', 'password' => GOODPW, 'as' => 'wizard']);
t('a wrong password, an unknown address, a role the address does not hold and a bad role all answer identically (401)',
    $s === 401 && $s2 === 401 && $s3 === 401 && $s4 === 401 && $bw === $bu && $bu === $br && $br === $bx, "$bw | $bu | $br | $bx");
[$s] = jpost('/auth/password-login', ['email' => ['x'], 'password' => GOODPW, 'as' => 'reader']);
t('malformed input -> the same 401', $s === 401);

// The same password works for the other roles of the same address.
$ownerEmail = 'a@example.org';
$ownerTok = Auth::createSession('admin', null, $ownerEmail)['token'];
[$s, $b] = http('POST', '/api/v1/account/password', auth_h($ownerTok), ['password' => 'an owner passphrase of length']);
t('an administrator can add a password too', $s === 200);
[$s, $b] = jpost('/auth/password-login', ['email' => $ownerEmail, 'password' => 'an owner passphrase of length', 'as' => 'admin']);
t('...and sign in to the admin page with it', $s === 200 && (jbody($b)['principal'] ?? '') === 'admin');
[$s] = http('GET', '/api/v1/admin/parishes', auth_h(jbody($b)['token']));
t('...and that session works as an administrator', $s === 200);
$staffTok = Auth::createSession('staff', $rid)['token'];
[$s] = http('POST', '/api/v1/account/password', auth_h($staffTok), ['password' => 'seven quiet candles at dusk lit']);
t('a rector can add a password', $s === 200);
[$s, $b] = jpost('/auth/password-login', ['email' => 'rector@acct.org', 'password' => 'seven quiet candles at dusk lit', 'as' => 'staff']);
t('...and sign in to the dashboard with it', $s === 200 && (jbody($b)['principal'] ?? '') === 'staff');
[$s] = http('GET', '/api/v1/staff/intentions', auth_h(jbody($b)['token']));
t('...and that session works as a rector', $s === 200);
$pdo->exec("UPDATE parishes SET status = 'suspended' WHERE slug = 'acct-p'");
[$s] = jpost('/auth/password-login', ['email' => 'rector@acct.org', 'password' => 'seven quiet candles at dusk lit', 'as' => 'staff']);
t('a suspended parish blocks password sign-in too (401)', $s === 401);
$pdo->exec("UPDATE parishes SET status = 'approved' WHERE slug = 'acct-p'");

section('Accounts: confirming it is you, and ending other sign-ins');
$pdo->exec('TRUNCATE TABLE rate_limits');
$old = reader_login('stale@example.org');
$pdo->exec("UPDATE sessions SET created_at = UTC_TIMESTAMP() - INTERVAL 2 HOUR, reauth_at = NULL WHERE reader_id = (SELECT id FROM readers WHERE email='stale@example.org')");
[$s, $b] = http('POST', '/api/v1/account/password', auth_h($old), ['password' => GOODPW]);
t('an older session cannot add a password without confirming (403 reauth_required)', $s === 403 && (jbody($b)['error'] ?? '') === 'reauth_required', "$s $b");
t('...and nothing was saved', (int)$pdo->query("SELECT COUNT(*) FROM credentials WHERE email='stale@example.org'")->fetchColumn() === 0);
[$s] = http('POST', '/api/v1/account/passkeys/options', auth_h($old), []);
t('...nor can it start adding a passkey (403)', $s === 403);
$other = reader_login('stale@example.org');   // a second, newer sign-in on another device
mail_reset();
[$s] = http('POST', '/api/v1/account/reauth/request-code', auth_h($old), []);
$rcode = last_code('stale@example.org');
t('it can ask for a confirmation code', $s === 200 && $rcode !== null);
[$s] = http('POST', '/api/v1/account/reauth', auth_h($old), ['code' => '000000']);
t('a wrong confirmation code is refused (401)', $s === 401);
[$s] = http('POST', '/api/v1/account/reauth', auth_h($old), ['code' => $rcode]);
t('the right code confirms it', $s === 200);
[$s] = http('POST', '/api/v1/account/password', auth_h($old), ['password' => GOODPW]);
t('...and then the password can be added', $s === 200);
[$s] = http('GET', '/api/v1/me', auth_h($other));
t('adding a password signed out the other device', $s === 401, "$s");
[$s] = http('GET', '/api/v1/me', auth_h($old));
t('...but not the session that made the change', $s === 200, "$s");
$a2 = reader_login('stale@example.org');
$pdo->exec("UPDATE sessions SET created_at = UTC_TIMESTAMP() - INTERVAL 2 HOUR WHERE token_hash = '" . hash('sha256', $a2) . "'");
[$s] = http('POST', '/api/v1/account/password', auth_h($a2), ['password' => 'a brand new quiet passphrase', 'current_password' => 'not the password at all']);
t('an older session with a wrong current password is refused (403)', $s === 403);
[$s] = http('POST', '/api/v1/account/password', auth_h($a2), ['password' => 'a brand new quiet passphrase', 'current_password' => GOODPW]);
t('...but the current password is enough to change it', $s === 200);
[$s] = jpost('/auth/password-login', ['email' => 'stale@example.org', 'password' => GOODPW, 'as' => 'reader']);
t('the old password no longer works', $s === 401);
[$s] = jpost('/auth/password-login', ['email' => 'stale@example.org', 'password' => 'a brand new quiet passphrase', 'as' => 'reader']);
t('the new one does', $s === 200);
[$s, $b] = http('DELETE', '/api/v1/account/password', auth_h($a2), ['current_password' => 'a brand new quiet passphrase']);
t('a password can be removed', $s === 200 && (jbody($b)['account']['has_password'] ?? true) === false);
[$s] = jpost('/auth/password-login', ['email' => 'stale@example.org', 'password' => 'a brand new quiet passphrase', 'as' => 'reader']);
t('...after which it no longer signs anyone in', $s === 401);
$pdo->exec('TRUNCATE TABLE rate_limits');
$codes = []; for ($i = 0; $i < 11; $i++) { [$s] = jpost('/auth/password-login', ['email' => 'limit@example.org', 'password' => 'wrong wrong wrong wrong', 'as' => 'reader']); $codes[] = $s; }
t('password attempts are limited per address (11th -> 429)', $codes[10] === 429 && $codes[9] === 401, json_encode($codes));

section('Accounts: passkey endpoints');
$pdo->exec('TRUNCATE TABLE rate_limits');
$pk = reader_login('pk@example.org');
[$s, $b] = http('POST', '/api/v1/account/passkeys/options', auth_h($pk), []);
$o = jbody($b);
t('registration options carry a challenge, this site as the relying party, and require a resident key and user verification',
    $s === 200 && strlen($o['token'] ?? '') === 48 && ($o['publicKey']['rp']['id'] ?? '') === 'localhost'
    && strlen($o['publicKey']['challenge'] ?? '') >= 40 && ($o['publicKey']['authenticatorSelection']['residentKey'] ?? '') === 'required'
    && ($o['publicKey']['authenticatorSelection']['userVerification'] ?? '') === 'required' && ($o['publicKey']['attestation'] ?? '') === 'none', "$s $b");
t('a challenge is stored hashed and single-use', (int)$pdo->query("SELECT COUNT(*) FROM webauthn_challenges WHERE purpose='register'")->fetchColumn() === 1);
[$s] = http('POST', '/api/v1/account/passkeys', auth_h($pk), ['token' => $o['token'], 'clientDataJSON' => 'AAAA', 'attestationObject' => 'AAAA']);
t('a bogus registration is refused (422)', $s === 422);
[$s] = http('POST', '/api/v1/account/passkeys', auth_h($pk), ['token' => $o['token'], 'clientDataJSON' => 'AAAA', 'attestationObject' => 'AAAA']);
t('...and the challenge cannot be tried twice', $s === 422 && (int)$pdo->query("SELECT COUNT(*) FROM webauthn_challenges")->fetchColumn() === 0);
[$s, $b] = http('GET', '/api/v1/account/passkeys', auth_h($pk));
t('no passkeys were saved', $s === 200 && (jbody($b)['passkeys'] ?? ['x']) === []);
[$s, $b] = jpost('/passkey/login/options');
$lo = jbody($b);
t('sign-in options need no address and name no accounts', $s === 200 && !isset($lo['publicKey']['allowCredentials']) && ($lo['publicKey']['rpId'] ?? '') === 'localhost' && ($lo['publicKey']['userVerification'] ?? '') === 'required');
[$s] = jpost('/passkey/login', ['token' => $lo['token'], 'as' => 'reader', 'id' => 'AAAA', 'clientDataJSON' => 'AAAA', 'authenticatorData' => 'AAAA', 'signature' => 'AAAA']);
t('a bogus sign-in is refused (401)', $s === 401);
[$s] = jpost('/passkey/login', ['token' => 'nope', 'as' => 'reader', 'id' => 'AAAA', 'clientDataJSON' => 'AAAA', 'authenticatorData' => 'AAAA', 'signature' => 'AAAA']);
t('an unknown challenge is refused (401)', $s === 401);
[$s] = http('DELETE', '/api/v1/account/passkeys/999', auth_h($pk), []);
t('removing a passkey that is not yours or not there -> 404', $s === 404);

section('Accounts: deleting a reader account');
$pdo->exec('TRUNCATE TABLE rate_limits');
$del = reader_login('gone@example.org');
http('POST', '/api/v1/account/password', auth_h($del), ['password' => GOODPW]);
http('PUT', '/api/v1/reader/profile', auth_h($del), ['profile' => ['userName' => 'Gone']]);
$del = reader_login('gone@example.org');   // the password change ended the earlier session
[$s] = http('DELETE', '/api/v1/account', auth_h($rt), []);
t('(another reader is unaffected by the next step)', true);
[$s] = http('DELETE', '/api/v1/account', auth_h($del), []);
t('a reader deletes their account', $s === 200);
t('...the account, its saved settings, its password and its sessions are gone',
    (int)$pdo->query("SELECT COUNT(*) FROM readers WHERE email='gone@example.org'")->fetchColumn() === 0
    && (int)$pdo->query("SELECT COUNT(*) FROM credentials WHERE email='gone@example.org'")->fetchColumn() === 0);
[$s] = http('GET', '/api/v1/me', auth_h($del));
t('...and the old token is dead (401)', $s === 401);
[$s] = jpost('/auth/password-login', ['email' => 'gone@example.org', 'password' => GOODPW, 'as' => 'reader']);
t('...and the password no longer signs in (401)', $s === 401);
// An address that is also a rector keeps its password when only the reader account goes.
$both = reader_login('rector@acct.org');
http('POST', '/api/v1/account/password', auth_h($both), ['password' => 'seven candles lit for both roles']);
$both = reader_login('rector@acct.org');
[$s] = http('DELETE', '/api/v1/account', auth_h($both), []);
t('deleting the reader account of someone who is also a rector succeeds', $s === 200);
[$s] = jpost('/auth/password-login', ['email' => 'rector@acct.org', 'password' => 'seven candles lit for both roles', 'as' => 'staff']);
t('...and their rector password still works', $s === 200);
[$s] = http('DELETE', '/api/v1/account', auth_h(Auth::createSession('staff', $rid)['token']), []);
t('only a reader session can delete a reader account (403)', $s === 403);

section('Accounts: sign-in routes need a body and a valid session');
$bad = [];
foreach ([['POST', '/account/password'], ['DELETE', '/account/password'], ['GET', '/account/passkeys'], ['POST', '/account/passkeys'],
          ['POST', '/account/passkeys/options'], ['DELETE', '/account/passkeys/1'], ['POST', '/account/reauth'], ['POST', '/account/reauth/request-code'],
          ['GET', '/reader/profile'], ['PUT', '/reader/profile'], ['DELETE', '/account']] as [$m, $path]) {
    [$s] = http($m, "/api/v1$path", [], in_array($m, ['GET', 'DELETE'], true) ? null : []); if ($s !== 401) { $bad[] = "$m $path=$s"; }
}
t('every account route returns 401 without a session', $bad === [], implode(', ', $bad));
