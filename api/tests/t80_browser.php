<?php
// Real-browser tests (Chromium via Playwright) for the /parish/ pages, including spec test 11:
// hostile prayer text and names must render as inert literal text in the dashboard and admin page.
section('Browser (Chromium)');
if (trim((string)shell_exec('command -v node')) === '') {
    echo "  SKIP browser tests (node is not installed)\n";
    return;
}
reset_state();
mail_reset();

$payloads = [
    '<img src=x onerror="window.__pwned=1">',
    '<script>window.__pwned=1</script>',
    '"><svg/onload=window.__pwned=1>',
    "'; DROP TABLE intentions; --",
    '<b onmouseover="window.__pwned=1">bold</b> &lt;i&gt;',
];
$parishName = 'Grace <img src=x onerror="window.__pwned=1"> & "Co"';
$staffName = 'Rev. <script>window.__pwned=1</script> O\'Neil';
$pendingName = 'Pending <svg/onload=window.__pwned=1> Church';

[$gid] = make_parish('grace-hostile', 'approved', 'code', 'episcopal/western-oregon', $parishName);
$rid = make_staff($gid, 'rector@grace.org', 'rector', $staffName);
make_staff($gid, 'helper@grace.org', 'delegate', $staffName);
foreach ($payloads as $i => $p) { make_intention($gid, ['individual', 'family', 'situation', 'institution', 'individual'][$i], $p, 86400 * 5 + $i); }
[$pid] = make_parish('pending-hostile', 'pending', 'code', null, $pendingName);
make_staff($pid, 'pending@x.org', 'rector', $staffName);
make_intention($pid, 'individual', $payloads[0], 86400);

[$fid] = make_parish('flow-church', 'approved', 'code', null, 'Flow Church');
make_staff($fid, 'flow@parish.org', 'rector', 'Rev. Flow');
make_intention($fid, 'individual', 'Expired two days ago', -86400 * 2);

// Reader-side fixtures (M6): a public parish with hostile requests, and a code parish for the join flow.
[$oid] = make_parish('office-public', 'approved', 'public', 'episcopal/western-oregon', 'Office Public Church');
$officeCats = ['individual', 'family', 'situation', 'institution', 'individual'];
foreach ($payloads as $i => $p) { make_intention($oid, $officeCats[$i], $p, 86400 * 5 + $i); }
[$cid, $cjoin] = make_parish('office-coded', 'approved', 'code', 'episcopal/western-oregon', 'Office Coded Church');
make_intention($cid, 'situation', 'Coded parish request', 86400 * 3);

$fixtures = [
    'base' => "http://127.0.0.1:$port",
    'mailLog' => mail_file(),
    'reminder' => "Add names only with the person's or family's permission \u{2014} first names or initials are fine. Please don't share overly sensitive information, such as detailed medical, legal, financial or family details. When in doubt, keep it general.",
    'xss' => ['payloads' => $payloads, 'parishName' => $parishName, 'staffName' => $staffName, 'pendingName' => $pendingName,
              'rectorToken' => Auth::createSession('staff', $rid)['token']],
    'admin' => ['token' => Auth::createSession('admin', null, 'a@example.org')['token'], 'email' => 'a@example.org'],
    'flow' => ['email' => 'flow@parish.org', 'parishName' => 'Flow Church', 'slug' => 'flow-church'],
    'office' => ['slug' => 'office-public', 'codedSlug' => 'office-coded', 'joinCode' => $cjoin, 'payloads' => $payloads],
    'reg' => ['email' => 'newrector@parish.org'],
];
$fxFile = "$tmp/browser-fixtures.json";
file_put_contents($fxFile, json_encode($fixtures));
$pdo->exec('TRUNCATE TABLE rate_limits');

$cmd = 'cd ' . escapeshellarg(dirname($apiDir)) . ' && timeout 400 node ' . escapeshellarg("$apiDir/tests/browser/pages.mjs") . ' ' . escapeshellarg($fxFile) . ' 2>&1; echo "EXIT:$?"';
$out = (string)shell_exec($cmd);
$exit = preg_match('/EXIT:(\d+)\s*$/', $out, $em) ? (int)$em[1] : -1;
$ran = 0;
foreach (preg_split('/\R/', $out) as $line) {
    if (preg_match('/^  ok   (.*)$/', $line, $m)) { t($m[1], true); $ran++; }
    elseif (preg_match('/^  FAIL (.*)$/', $line, $m)) { t($m[1], false); $ran++; }
    elseif (strpos($line, '  SKIP') === 0) { echo $line . "\n"; }
    elseif (preg_match('/^Browser: /', $line)) { echo $line . "\n"; }
}
if (($ran === 0 && strpos($out, 'SKIP') === false) || $exit !== 0) {
    t('the browser test script ran to the end without crashing', false, 'exit ' . $exit . ': ' . substr(preg_replace('/^  (ok|FAIL) .*\R/m', '', $out), -900));
}

if ($ran > 0) {
    t('after the UI tests: the registered chapel was deleted through the admin page', (int)$pdo->query("SELECT COUNT(*) FROM parishes WHERE slug LIKE 'st-aidans%'")->fetchColumn() === 0);
    t('the hostile parish and its requests are unchanged in the database', (int)$pdo->query('SELECT COUNT(*) FROM intentions WHERE parish_id = ' . $gid)->fetchColumn() === count($payloads));
    t('no audit entry contains an email address or request text', (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE detail LIKE '%@%' OR actor LIKE '%@%' OR detail LIKE '%onerror%'")->fetchColumn() === 0);
}
reset_state();

// Static guard for the safety rule in parish/common.js: the parish scripts must never use an API that
// turns text into markup or code. (Comments are stripped first, so explaining the rule is allowed.)
section('Parish pages: unsafe-API guard');
$forbidden = '/\binnerHTML\b|\bouterHTML\b|insertAdjacentHTML|document\.write|\beval\s*\(|new\s+Function\s*\(|setAttribute\(\s*[\'"]on|setAttribute\(\s*[\'"]style|createContextualFragment|srcdoc/i';
foreach (glob(dirname($apiDir) . '/parish/*.js') as $f) {
    if (basename($f) === 'dioceses.js') { continue; }
    $code = (string)file_get_contents($f);
    $code = preg_replace('#/\*.*?\*/#s', '', $code);
    $code = preg_replace('#(^|[^:\'"])//[^\n]*#', '$1', $code);
    t('no unsafe text-to-markup API in parish/' . basename($f), preg_match($forbidden, $code) !== 1);
}
foreach (glob(dirname($apiDir) . '/parish/*.html') as $f) {
    $html = (string)file_get_contents($f);
    t('parish/' . basename($f) . ' has no inline script, inline style or on* handlers',
        preg_match('/<script(?![^>]*\bsrc=)[^>]*>|<style|\sstyle\s*=|\son[a-z]+\s*=/i', $html) !== 1);
}
