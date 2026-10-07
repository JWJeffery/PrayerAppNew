<?php
// Real-browser tests (Chromium via Playwright) for the parish home page, the dashboard's "Parish page"
// tab, the diocesan page and the admin diocese editor. Hostile text must stay inert on every surface.
section('Browser: parish pages');
if (trim((string)shell_exec('command -v node')) === '') {
    echo "  SKIP browser tests (node is not installed)\n";
    return;
}
reset_state();
mail_reset();

$hostile = '<img src=x onerror="window.__pwned=1">';
$dk = 'episcopal/western-oregon';
[$gid, $gcode] = make_parish('grace-pages', 'approved', 'code', $dk, 'Grace Church');
$rid = make_staff($gid, 'rector@gracepages.org', 'rector', 'Rev. Grace');
[$pid] = make_parish('open-pages', 'approved', 'public', $dk, 'Open Church');
$pdo->prepare('UPDATE parishes SET rector_name = ?, address = ?, website = ?, service_times = ? WHERE id = ?')
    ->execute([$hostile, '1 <b>Main</b> St', 'https://open.example.org/', "Sunday 9:00 am $hostile\nWednesday 7:00 pm", $pid]);
$pdo->prepare('INSERT INTO parish_announcements (parish_id, body, created_at, expires_at) VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL 3 DAY)')
    ->execute([$pid, "Funeral $hostile"]);
$pdo->prepare('INSERT INTO parish_events (parish_id, title, event_date, event_time, note, created_at) VALUES (?, ?, UTC_DATE() + INTERVAL 2 DAY, \'19:00:00\', ?, UTC_TIMESTAMP())')
    ->execute([$pid, "Vestry $hostile", "Hall $hostile"]);
$pdo->exec("INSERT INTO dioceses (diocese_key, bishop_name, website, convention_dates, updated_at) VALUES ('$dk', 'Bishop $hostile', 'https://diocese.example.org', 'Convention <script>window.__pwned=1</script>', UTC_TIMESTAMP())");
$pdo->prepare('INSERT INTO diocese_prayers (diocese_key, body, created_at, expires_at) VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL 5 DAY)')
    ->execute([$dk, "For all clergy $hostile"]);

$pdo->prepare("INSERT INTO diocese_staff (diocese_key, email, added_by, created_at) VALUES ('episcopal/iowa', 'editor@iowa.example.org', 'a@example.org', UTC_TIMESTAMP())")->execute();
$editorId = (int)$pdo->lastInsertId();

$fixtures = [
    'editorToken' => Auth::createSession('diocese', null, null, null, $editorId)['token'], 'editorDiocese' => 'episcopal/iowa',
    'base' => "http://127.0.0.1:$port",
    'hostile' => $hostile,
    'rectorToken' => Auth::createSession('staff', $rid)['token'],
    'adminToken' => Auth::createSession('admin', null, 'a@example.org')['token'],
    'open' => 'open-pages', 'coded' => 'grace-pages', 'joinCode' => $gcode, 'diocese' => $dk,
];
$fxFile = "$tmp/browser-fixtures-pages.json";
file_put_contents($fxFile, json_encode($fixtures));
$pdo->exec('TRUNCATE TABLE rate_limits');

$cmd = 'cd ' . escapeshellarg(dirname($apiDir)) . ' && timeout 300 node ' . escapeshellarg("$apiDir/tests/browser/parish-pages.mjs") . ' ' . escapeshellarg($fxFile) . ' 2>&1; echo "EXIT:$?"';
$out = (string)shell_exec($cmd);
$exit = preg_match('/EXIT:(\d+)\s*$/', $out, $em) ? (int)$em[1] : -1;
$ran = 0;
foreach (preg_split('/\R/', $out) as $line) {
    if (preg_match('/^  ok   (.*)$/', $line, $m)) { t($m[1], true); $ran++; }
    elseif (preg_match('/^  FAIL (.*)$/', $line, $m)) { t($m[1], false); $ran++; }
    elseif (strpos($line, '  SKIP') === 0) { echo $line . "\n"; }
}
if (($ran === 0 && strpos($out, 'SKIP') === false) || $exit !== 0) {
    t('the parish-pages browser script ran to the end without crashing', false, 'exit ' . $exit . ': ' . substr(preg_replace('/^  (ok|FAIL) .*\R/m', '', $out), -900));
}
reset_state();
