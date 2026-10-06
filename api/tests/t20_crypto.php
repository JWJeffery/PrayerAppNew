<?php
section('Crypto: join codes');
$code = Crypto::generateJoinCode();
t('code is 8 chars from the safe alphabet', preg_match('/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/', $code) === 1, $code);
$all = ''; for ($i = 0; $i < 200; $i++) { $all .= Crypto::generateJoinCode(); }
t('no ambiguous characters (I L O 0 1) in 200 codes', preg_match('/[ILO01]/', $all) === 0);
t('normalize: lowercase, hyphen, spaces', Crypto::normalizeJoinCode(' k7tq-2mxa ') === 'K7TQ2MXA');
t('normalize rejects wrong length', Crypto::normalizeJoinCode('ABC') === null);
t('normalize rejects ambiguous chars', Crypto::normalizeJoinCode('OOOOOOOO') === null);
t('normalize rejects non-strings', Crypto::normalizeJoinCode(['x']) === null && Crypto::normalizeJoinCode(null) === null);
t('display format', Crypto::formatJoinCode('K7TQ2MXA') === 'K7TQ-2MXA');
$blob = Crypto::encryptJoinCode($code);
t('encrypt/decrypt round trip', Crypto::decryptJoinCode($blob) === $code);
t('ciphertext does not contain the plaintext', strpos($blob, $code) === false);
t('encryption uses a fresh nonce each time', Crypto::encryptJoinCode($code) !== $blob);
$tampered = $blob; $tampered[strlen($tampered) - 1] = chr(ord($tampered[strlen($tampered) - 1]) ^ 1);
t('tampered ciphertext fails to decrypt', Crypto::decryptJoinCode($tampered) === null);
t('verify accepts the right code in any format', Crypto::verifyJoinCode(strtolower(Crypto::formatJoinCode($code)), $blob));
t('verify rejects a wrong code', !Crypto::verifyJoinCode('ZZZZ-ZZZZ', $blob));
t('verify rejects null/garbage', !Crypto::verifyJoinCode(null, $blob) && !Crypto::verifyJoinCode($code, null) && !Crypto::verifyJoinCode($code, 'short'));

section('Crypto: reader passes');
$now = time();
$rp = Crypto::makePass(7, 3, $now);
t('valid pass verifies', Crypto::verifyPass($rp, 7, 3, $now));
t('pass for another parish rejected', !Crypto::verifyPass($rp, 8, 3, $now));
t('pass with old code version rejected (rotation)', !Crypto::verifyPass($rp, 7, 4, $now));
t('pass exactly 365 days old accepted', Crypto::verifyPass(Crypto::makePass(7, 3, $now - 365 * 86400), 7, 3, $now));
t('pass older than 365 days rejected', !Crypto::verifyPass(Crypto::makePass(7, 3, $now - 365 * 86400 - 1), 7, 3, $now));
t('pass from the future rejected', !Crypto::verifyPass(Crypto::makePass(7, 3, $now + 3600), 7, 3, $now));
[$p, $sig] = explode('.', $rp);
t('bad signature rejected', !Crypto::verifyPass($p . '.' . strrev($sig), 7, 3, $now));
$forgedPayload = rtrim(strtr(base64_encode("8.3.$now"), '+/', '-_'), '=');
t('edited payload with old signature rejected', !Crypto::verifyPass($forgedPayload . '.' . $sig, 8, 3, $now));
t('garbage passes rejected', !Crypto::verifyPass('', 7, 3) && !Crypto::verifyPass('a.b.c', 7, 3) && !Crypto::verifyPass(null, 7, 3)
    && !Crypto::verifyPass(str_repeat('x', 500), 7, 3));

section('Rate limiting');
reset_state();
$ok = true; for ($i = 1; $i <= 3; $i++) { $ok = $ok && RateLimit::hit('t', 'someone@example.org', 3, 3600)['allowed']; }
t('first 3 hits allowed', $ok);
$r = RateLimit::hit('t', 'someone@example.org', 3, 3600);
t('4th hit blocked with retry-after', !$r['allowed'] && $r['retry_after'] >= 1 && $r['retry_after'] <= 3600, json_encode($r));
t('different key has its own bucket', RateLimit::hit('t', 'other@example.org', 3, 3600)['allowed']);
t('different bucket name is independent', RateLimit::hit('u', 'someone@example.org', 3, 3600)['allowed']);
$pdo->exec("UPDATE rate_limits SET window_start = UTC_TIMESTAMP() - INTERVAL 2 HOUR");
$r = RateLimit::hit('t', 'someone@example.org', 3, 3600);
t('window reset: allowed again after the window passes', $r['allowed']);
t('window reset: counter restarted at 1', (int)$pdo->query("SELECT hits FROM rate_limits WHERE bucket LIKE 't:%' ORDER BY window_start DESC LIMIT 1")->fetchColumn() >= 1);
$again = RateLimit::hit('t', 'someone@example.org', 3, 3600); $again = RateLimit::hit('t', 'someone@example.org', 3, 3600);
t('after reset the limit applies afresh (2 more allowed, 3rd blocked)', $again['allowed'] && !RateLimit::hit('t', 'someone@example.org', 3, 3600)['allowed']);
$buckets = $pdo->query('SELECT bucket FROM rate_limits')->fetchAll(PDO::FETCH_COLUMN);
t('raw keys are never stored', count(array_filter($buckets, fn($b) => stripos($b, 'someone') !== false || stripos($b, 'example') !== false)) === 0);
