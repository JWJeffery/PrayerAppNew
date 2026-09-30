<?php
// Builds the PRODUCTION config.php by asking you for the values. Nothing is committed and
// nothing is uploaded automatically: you download the finished file from the Codespace and
// upload it yourself, into the private folder on the server (see documentation/PARISH_INTENTIONS.md).
//
// Run:  php api/cli/make-prod-config.php
// Result: .external/uo-private/config-production.php  (git-ignored, mode 600)
//
// Passwords are typed here with echo turned off; they go only into the new file.
// The two secrets (pepper, box key) are generated fresh. KEEP THE FINISHED FILE SAFE:
// if you lose it or regenerate the secrets after go-live, every join code and reader pass
// stops working.
if (PHP_SAPI !== 'cli') { exit; }

$root = dirname(__DIR__, 2);
$out = $argv[1] ?? "$root/.external/uo-private/config-production.php";

function ask(string $label, string $default = '', bool $hidden = false): string {
    echo $label . ($default !== '' ? " [$default]" : '') . ': ';
    if ($hidden) { @system('stty -echo 2>/dev/null'); }
    $line = trim((string)fgets(STDIN));
    if ($hidden) { @system('stty echo 2>/dev/null'); echo "\n"; }
    return $line === '' ? $default : $line;
}
function need(string $v, string $what): string {
    if ($v === '') { fwrite(STDERR, "$what is required; nothing written.\n"); exit(1); }
    return $v;
}

echo "Production settings. Find the database values in cPanel > Manage My Databases.\n\n";
$dbName = need(ask('Database name (looks like lwmpzdytfh_something)'), 'Database name');
$dbUser = need(ask('Database username (looks like lwmpzdytfh_something)'), 'Database username');
$dbPass = need(ask('Database password (typing is hidden)', '', true), 'Database password');
$dbHost = ask('Database host', 'localhost');
echo "\nMail (Spacemail):\n";
$mailUser = ask('Mailbox / username', 'admin@theuniversaloffice.com');
$mailPass = need(ask('Mailbox password (typing is hidden)', '', true), 'Mailbox password');
$mailHost = ask('SMTP server', 'mail.spacemail.com');
$mailPort = (int)ask('SMTP port', '465');
$mailEnc = ask("Encryption ('ssl' for 465, 'tls' for 587)", $mailPort === 587 ? 'tls' : 'ssl');
echo "\nSite:\n";
$admin = ask('Admin email (receives approval requests and admin login codes)', 'josh@jwjeffery.org');
$siteUrl = rtrim(ask('Site address', 'https://theuniversaloffice.com'), '/');
if (!filter_var($admin, FILTER_VALIDATE_EMAIL)) { fwrite(STDERR, "Admin email is not valid; nothing written.\n"); exit(1); }
if (strpos($siteUrl, 'https://') !== 0) { fwrite(STDERR, "Site address must start with https://; nothing written.\n"); exit(1); }
if (!in_array($mailEnc, ['ssl', 'tls'], true)) { fwrite(STDERR, "Encryption must be ssl or tls; nothing written.\n"); exit(1); }

$cfg = [
    'db' => ['host' => $dbHost, 'name' => $dbName, 'user' => $dbUser, 'pass' => $dbPass],
    'mail' => ['driver' => 'smtp', 'host' => $mailHost, 'port' => $mailPort, 'encryption' => $mailEnc,
               'username' => $mailUser, 'password' => $mailPass,
               'from_email' => $mailUser, 'from_name' => 'The Universal Office'],
    'secrets' => ['pepper' => bin2hex(random_bytes(32)), 'box_key' => base64_encode(random_bytes(32))],
    'admin_emails' => [$admin],
    'site_url' => $siteUrl,
    'allowed_origins' => [],
    'trust_proxy' => false,
    'log_dir' => null,
];
@mkdir(dirname($out), 0700, true);
file_put_contents($out, "<?php\n// PRODUCTION config for The Universal Office API. Contains real passwords and secrets.\n"
    . "// Lives on the server at <home>/uo-private/config.php. NEVER commit, email or paste it anywhere.\n"
    . "return " . var_export($cfg, true) . ";\n");
chmod($out, 0600);
echo "\nWritten: $out\n";
echo "Next: download it from the Codespace file list (right-click > Download), then upload it to the server as\n";
echo "  /home/<your cPanel user>/uo-private/config.php\n";
