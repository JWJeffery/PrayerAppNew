<?php
// Writes <private dir>/backup.cnf (mode 600) from the database settings already in config.php, so
// the backup job never puts the password on a command line and you never have to create the file
// by hand. Run by backup.sh; safe to run repeatedly.
if (PHP_SAPI !== 'cli') { exit; }
define('UO_API', true);
require_once __DIR__ . '/../src/Config.php';
try { Config::load(); } catch (Throwable $e) { fwrite(STDERR, 'Cannot read config.php (' . $e->getMessage() . ").\n"); exit(1); }
$out = $argv[1] ?? '';
if ($out === '') { fwrite(STDERR, "Usage: make-backup-cnf.php <output file>\n"); exit(1); }
$q = static fn(string $v): string => '"' . str_replace(['\\', '"'], ['\\\\', '\\"'], $v) . '"';
$host = (string)Config::get('db.host', 'localhost');
$cnf = "[client]\nuser=" . $q((string)Config::get('db.user')) . "\npassword=" . $q((string)Config::get('db.pass'))
     . "\nhost=" . $q($host) . "\n";
$old = umask(0077);
$ok = file_put_contents($out, $cnf) !== false;
umask($old);
@chmod($out, 0600);
if (!$ok) { fwrite(STDERR, "Cannot write $out\n"); exit(1); }
echo Config::get('db.name') . "\n"; // backup.sh reads the database name from here
