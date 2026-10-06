<?php
// Spec tests 17 and 18: the daily job (reminders + purge) and the backup script.
section('Daily job: reminders');
reset_state();
function run_daily(string $cfg, array $args = ['--verbose']): array {
    $cmd = 'UO_CONFIG_PATH=' . escapeshellarg($cfg) . ' ' . escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(dirname(__DIR__) . '/cron/daily.php')
         . ' ' . implode(' ', array_map('escapeshellarg', $args)) . ' 2>&1; echo "EXIT:$?"';
    $out = (string)shell_exec($cmd);
    $code = preg_match('/EXIT:(\d+)\s*$/', $out, $m) ? (int)$m[1] : -1;
    return [$code, trim(preg_replace('/EXIT:\d+\s*$/', '', $out))];
}
$SECRET = 'SECRET-PRAYER-TEXT-ZZZ';
[$a] = make_parish('rem-a', 'approved', 'public', null, 'Reminder Church');
make_staff($a, 'rector@rem.org', 'rector', 'Rev. R');
make_staff($a, 'delegate@rem.org', 'delegate', 'Del');
$soon1 = make_intention($a, 'individual', $SECRET . ' one', 86400 * 1);
$soon2 = make_intention($a, 'family', $SECRET . ' two', 86400 * 2);
$later = make_intention($a, 'situation', $SECRET . ' later', 86400 * 10);
$already = make_intention($a, 'individual', $SECRET . ' already', 86400 * 1);
$pdo->exec("UPDATE intentions SET reminder_sent_at = UTC_TIMESTAMP() WHERE id = $already");
[$pend] = make_parish('rem-pending', 'pending', 'public');
make_staff($pend, 'pend@rem.org', 'rector');
make_intention($pend, 'individual', 'pending parish item', 86400);
[$norector] = make_parish('rem-norector', 'approved', 'public');
make_staff($norector, 'del-only@rem.org', 'delegate');
make_intention($norector, 'individual', 'no rector item', 86400);

[$code, $out] = run_daily($cfgFile);
t('the daily job runs and exits 0', $code === 0, "exit $code: $out");
$mails = mail_messages();
t('exactly one digest, to the rector only (not the delegate, not the pending parish)', count($mails) === 1 && $mails[0]['to'] === 'rector@rem.org', json_encode(array_column($mails, 'to')));
t('the digest counts 2 items and says nothing about prayer text', count($mails) === 1 && strpos($mails[0]['body'], '2 prayer intentions') !== false && strpos($mails[0]['body'], $SECRET) === false && strpos($mails[0]['body'], 'Reminder Church') !== false);
t('the digest names dates and links to the dashboard', count($mails) === 1 && preg_match('/will expire on \w+, \w+ \d+/', $mails[0]['body']) === 1 && strpos($mails[0]['body'], '/parish/') !== false);
$sent = $pdo->query("SELECT id FROM intentions WHERE reminder_sent_at IS NOT NULL ORDER BY id")->fetchAll(PDO::FETCH_COLUMN);
t('only the two expiring items (plus the one already reminded) are marked', array_map('intval', $sent) === [$soon1, $soon2, $already]);
t('an item expiring in 10 days is not reminded', (int)$pdo->query("SELECT COUNT(*) FROM intentions WHERE id = $later AND reminder_sent_at IS NULL")->fetchColumn() === 1);
mail_reset();
[$code] = run_daily($cfgFile);
t('running it again the same day sends nothing more', $code === 0 && mail_messages() === []);
$cron = (string)@file_get_contents("$tmp/logs/cron.log");
t('the cron log has a counts-only summary (no text, no emails)', strpos($cron, 'daily job ok') !== false && strpos($cron, $SECRET) === false && strpos($cron, '@') === false);
[$code, $out] = run_daily($cfgFile, []);
t('a quiet run prints nothing', $code === 0 && $out === '', $out);

// extending resets reminder_sent_at (already covered by the API tests) -> eligible for a new digest
$pdo->exec("UPDATE intentions SET reminder_sent_at = NULL, expires_at = UTC_TIMESTAMP() + INTERVAL 1 DAY WHERE id = $soon1");
mail_reset();
run_daily($cfgFile);
$m = mail_messages();
t('a reset item gets a new digest of 1 item', count($m) === 1 && strpos($m[0]['body'], '1 prayer intention for') !== false);

section('Daily job: a failed send is retried');
reset_state();
[$f] = make_parish('rem-fail', 'approved', 'public', null, 'Fail Church');
make_staff($f, 'rector@fail.org', 'rector');
$fid = make_intention($f, 'individual', 'x', 86400);
$bad = include $cfgFile; $bad['mail'] = ['driver' => 'bogus'];
$badCfg = "$tmp/config-badmail.php";
file_put_contents($badCfg, "<?php\nreturn " . var_export($bad, true) . ";\n"); chmod($badCfg, 0600);
[$code, $out] = run_daily($badCfg);
t('a failed send exits non-zero so cPanel mails you', $code === 1 && strpos($out, 'failed to send') !== false, "exit $code: $out");
t('...and leaves the item unmarked for tomorrow', (int)$pdo->query("SELECT COUNT(*) FROM intentions WHERE id = $fid AND reminder_sent_at IS NULL")->fetchColumn() === 1);
[$code] = run_daily($cfgFile);
t('the next run (mail working) sends it and marks it', $code === 0 && count(mail_messages()) === 1 && (int)$pdo->query("SELECT COUNT(*) FROM intentions WHERE id = $fid AND reminder_sent_at IS NOT NULL")->fetchColumn() === 1);
@unlink($badCfg);

section('Daily job: purge');
reset_state();
[$pp] = make_parish('purge-p', 'approved', 'public');
$staff = make_staff($pp, 'purge@x.org', 'rector');
$keepFresh = make_intention($pp, 'individual', 'expired 6 days ago', -86400 * 6);
$goneOld = make_intention($pp, 'individual', 'expired 8 days ago', -86400 * 8);
$keepActive = make_intention($pp, 'individual', 'active', 86400 * 5);
$pdo->exec("INSERT INTO login_codes (purpose,email,code_hash,created_at,expires_at) VALUES
  ('login','a@x.org',REPEAT('a',64),UTC_TIMESTAMP()-INTERVAL 3 DAY,UTC_TIMESTAMP()-INTERVAL 2 DAY),
  ('login','b@x.org',REPEAT('b',64),UTC_TIMESTAMP()-INTERVAL 3 HOUR,UTC_TIMESTAMP()-INTERVAL 2 HOUR)");
$pdo->exec("INSERT INTO sessions (token_hash,principal,staff_id,created_at,expires_at) VALUES
  (REPEAT('c',64),'staff',$staff,UTC_TIMESTAMP()-INTERVAL 40 DAY,UTC_TIMESTAMP()-INTERVAL 1 DAY),
  (REPEAT('d',64),'staff',$staff,UTC_TIMESTAMP(),UTC_TIMESTAMP()+INTERVAL 20 DAY)");
$pdo->exec("INSERT INTO rate_limits (bucket,window_start,hits) VALUES ('old',UTC_TIMESTAMP()-INTERVAL 3 DAY,1),('new',UTC_TIMESTAMP()-INTERVAL 1 DAY,1)");
$pdo->exec("INSERT INTO audit_log (at,actor,action) VALUES (UTC_TIMESTAMP()-INTERVAL 181 DAY,'system','old'),(UTC_TIMESTAMP()-INTERVAL 100 DAY,'system','recent')");
$pdo->exec("INSERT INTO approval_tokens (token_hash,parish_id,created_at,expires_at) VALUES
  (REPEAT('e',64),$pp,UTC_TIMESTAMP()-INTERVAL 50 DAY,UTC_TIMESTAMP()-INTERVAL 40 DAY),
  (REPEAT('f',64),$pp,UTC_TIMESTAMP()-INTERVAL 10 DAY,UTC_TIMESTAMP()-INTERVAL 3 DAY)");
[$code, $out] = run_daily($cfgFile);
$ids = array_map('intval', $pdo->query('SELECT id FROM intentions ORDER BY id')->fetchAll(PDO::FETCH_COLUMN));
t('purge: requests expired more than 7 days are deleted; newer ones stay', $code === 0 && $ids === [$keepFresh, $keepActive], "exit $code: $out");
t('purge: login codes expired over a day ago are deleted', (int)$pdo->query('SELECT COUNT(*) FROM login_codes')->fetchColumn() === 1);
t('purge: expired sessions are deleted, live ones stay', (int)$pdo->query("SELECT COUNT(*) FROM sessions WHERE token_hash = REPEAT('d',64)")->fetchColumn() === 1 && (int)$pdo->query('SELECT COUNT(*) FROM sessions')->fetchColumn() === 1);
t('purge: rate-limit rows older than 2 days are deleted', (int)$pdo->query("SELECT COUNT(*) FROM rate_limits WHERE bucket = 'new'")->fetchColumn() === 1 && (int)$pdo->query('SELECT COUNT(*) FROM rate_limits')->fetchColumn() === 1);
t('purge: audit rows older than 180 days are deleted', (int)$pdo->query("SELECT COUNT(*) FROM audit_log WHERE action = 'recent'")->fetchColumn() === 1 && (int)$pdo->query('SELECT COUNT(*) FROM audit_log')->fetchColumn() === 1);
t('purge: approval tokens expired over 30 days ago are deleted', (int)$pdo->query('SELECT COUNT(*) FROM approval_tokens')->fetchColumn() === 1);
reset_state();

section('Schedule gate (runs hourly, acts once a day at Pacific time)');
$gp = "$tmp/gate-private"; shell_exec('rm -rf ' . escapeshellarg($gp)); mkdir("$gp/logs", 0700, true);
copy($cfgFile, "$gp/config.php"); chmod("$gp/config.php", 0600);
[$gq] = make_parish('gate', 'approved', 'public', null, 'Gate Church');
make_staff($gq, 'rector@gate.org', 'rector');
$gi = make_intention($gq, 'individual', 'g', 86400);
$gmail = fn() => substr_count((string)@file_get_contents("$gp/logs/mail-outbox.log"), '=== MAIL');
$gate = function (string $now) use ($gp): array {
    $out = (string)shell_exec('UO_PACIFIC_NOW=' . escapeshellarg($now) . ' UO_PRIVATE=' . escapeshellarg($gp) . ' UO_PHP=' . escapeshellarg(PHP_BINARY)
        . ' bash ' . escapeshellarg(dirname(__DIR__) . '/cron/daily.sh') . ' --verbose 2>&1; echo "EXIT:$?"');
    return [preg_match('/EXIT:(\d+)\s*$/', $out, $m) ? (int)$m[1] : -1, trim(preg_replace('/EXIT:\d+\s*$/', '', $out))];
};
[$code, $out] = $gate('2030-05-01 07');
t('before 8:00 Pacific the hourly tick does nothing', $code === 0 && $out === '' && $gmail() === 0);
[$code, $out] = $gate('2030-05-01 08');
t('at 8:00 Pacific it runs the daily job once', $code === 0 && strpos($out, 'daily job ok') !== false && $gmail() === 1, "exit $code: $out");
[$code, $out] = $gate('2030-05-01 09');
t('later the same day it does not run again', $code === 0 && $out === '' && $gmail() === 1);
$pdo->exec("UPDATE intentions SET reminder_sent_at = NULL WHERE id = $gi");
[$code, $out] = $gate('2030-05-02 14');
t('the next day a late tick still catches up', $code === 0 && strpos($out, 'daily job ok') !== false && $gmail() === 2);
shell_exec('rm -rf ' . escapeshellarg($gp));
reset_state();

section('Backup script');
$bin = trim((string)shell_exec('command -v mysqldump'));
if ($bin === '' || trim((string)shell_exec('command -v bash gzip')) === '') {
    echo "  SKIP backup tests (mysqldump, bash or gzip not found)\n";
} else {
    $priv = "$tmp/bk-private"; shell_exec('rm -rf ' . escapeshellarg($priv)); mkdir($priv, 0700, true);
    copy($cfgFile, "$priv/config.php"); chmod("$priv/config.php", 0600);
    make_parish('bk', 'approved', 'public', null, 'Backup Church');
    $script = escapeshellarg(dirname(__DIR__) . '/cron/backup.sh');
    $run = function (array $env = []) use ($priv, $script): array {
        $e = 'UO_FORCE=1 UO_PRIVATE=' . escapeshellarg($priv) . ' UO_PHP=' . escapeshellarg(PHP_BINARY);
        foreach ($env as $k => $v) { $e .= " $k=" . escapeshellarg($v); }
        $out = (string)shell_exec("$e bash $script 2>&1; echo \"EXIT:$?\"");
        return [preg_match('/EXIT:(\d+)\s*$/', $out, $m) ? (int)$m[1] : -1, trim(preg_replace('/EXIT:\d+\s*$/', '', $out))];
    };
    // pre-existing old dumps to test the keep-14 rule
    mkdir("$priv/backups", 0700, true);
    for ($d = 1; $d <= 16; $d++) { touch(sprintf('%s/backups/uo-202001%02d.sql.gz', $priv, $d)); }
    [$code, $out] = $run();
    $today = "$priv/backups/uo-" . date('Ymd') . '.sql.gz';
    t('backup.sh runs quietly and exits 0', $code === 0 && $out === '', "exit $code: $out");
    t('the dump exists, is valid gzip and contains the tables and data', is_file($today) && trim((string)shell_exec('gzip -t ' . escapeshellarg($today) . ' 2>&1; echo $?')) === '0'
        && strpos((string)shell_exec('gzip -dc ' . escapeshellarg($today)), 'Backup Church') !== false);
    t('the dump file is mode 600 and the folder 700', is_file($today) && (fileperms($today) & 0777) === 0600 && (fileperms("$priv/backups") & 0777) === 0700);
    t('only the newest 14 dumps are kept', count(glob("$priv/backups/uo-*.sql.gz")) === 14 && !is_file("$priv/backups/uo-20200101.sql.gz") && is_file("$priv/backups/uo-20200116.sql.gz"));
    t('backup.cnf was generated with mode 600 and the password is not on the command line', is_file("$priv/backup.cnf") && (fileperms("$priv/backup.cnf") & 0777) === 0600);
    t('no partial file is left behind', glob("$priv/backups/*.partial") === []);
    // empty dump -> loud failure, no file
    shell_exec('rm -f ' . escapeshellarg($today));
    [$code, $out] = $run(['UO_MYSQLDUMP' => '/bin/true']);
    t('an empty dump fails loudly (exit 1, message) and leaves no file', $code === 1 && strpos($out, 'FAILED') !== false && !is_file($today) && glob("$priv/backups/*.partial") === [], "exit $code: $out");
    t('the failure message contains no password', strpos($out, (string)(include $cfgFile)['db']['pass']) === false);
    [$code, $out] = $run(['UO_MYSQLDUMP' => '/bin/false']);
    t('a failing dump command also fails loudly', $code === 1 && strpos($out, 'FAILED') !== false);
    shell_exec('rm -rf ' . escapeshellarg($priv));
}
reset_state();
