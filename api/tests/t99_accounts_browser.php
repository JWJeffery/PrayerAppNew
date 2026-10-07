<?php
// Real-browser tests (Chromium via Playwright) for the optional accounts: the app's account section, and the
// password and passkey sign-in options on the dashboard and admin pages. Passkeys use Chromium's virtual
// authenticator, so the whole ceremony runs for real. The pages are opened as http://localhost:PORT because a
// passkey needs a real host name (not an IP address) as its relying-party id.
section('Browser: accounts');
if (trim((string)shell_exec('command -v node')) === '') {
    echo "  SKIP browser tests (node is not installed)\n";
    return;
}
reset_state();
mail_reset();
[$aid] = make_parish('acct-church', 'approved', 'public', 'episcopal/western-oregon', 'Account Church');
make_staff($aid, 'rector@acctchurch.org', 'rector', 'Rev. Account');
$fixtures = [
    'base' => "http://localhost:$port",
    'mailLog' => mail_file(),
    'rector' => 'rector@acctchurch.org',
    'owner' => 'a@example.org',
    'ownerToken' => Auth::createSession('admin', null, 'a@example.org')['token'],
];
$fxFile = "$tmp/browser-fixtures-accounts.json";
file_put_contents($fxFile, json_encode($fixtures));
$pdo->exec('TRUNCATE TABLE rate_limits');

$cmd = 'cd ' . escapeshellarg(dirname($apiDir)) . ' && timeout 400 node ' . escapeshellarg("$apiDir/tests/browser/accounts.mjs") . ' ' . escapeshellarg($fxFile) . ' 2>&1; echo "EXIT:$?"';
$out = (string)shell_exec($cmd);
$exit = preg_match('/EXIT:(\d+)\s*$/', $out, $em) ? (int)$em[1] : -1;
$ran = 0;
foreach (preg_split('/\R/', $out) as $line) {
    if (preg_match('/^  ok   (.*)$/', $line, $m)) { t($m[1], true); $ran++; }
    elseif (preg_match('/^  FAIL (.*)$/', $line, $m)) { t($m[1], false); $ran++; }
    elseif (strpos($line, '  SKIP') === 0) { echo $line . "\n"; }
}
if (($ran === 0 && strpos($out, 'SKIP') === false) || $exit !== 0) {
    t('the accounts browser script ran to the end without crashing', false, 'exit ' . $exit . ': ' . substr(preg_replace('/^  (ok|FAIL) .*\R/m', '', $out), -1200));
}
reset_state();
