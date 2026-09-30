<?php
// Small admin console that talks to a running copy of the API (your live site) over HTTPS.
// Until the admin web page exists (milestone M5), this is how you check the deployment and
// manage parishes. It stores nothing: the session token lives only in memory while it runs.
//
// Run:  php api/cli/remote-admin.php https://theuniversaloffice.com
if (PHP_SAPI !== 'cli') { exit; }

$base = rtrim($argv[1] ?? 'https://theuniversaloffice.com', '/');
$api = $base . '/api/v1';

$siteAuth = null; // "user:password" when the site is behind a hosting-level password
function call(string $method, string $url, ?array $body = null, ?string $token = null): array {
    global $siteAuth;
    $h = ['Accept: application/json'];
    if ($siteAuth !== null && !$token) { $h[] = 'Authorization: Basic ' . base64_encode($siteAuth); }
    if ($token) { $h[] = "Authorization: Bearer $token"; }
    $content = '';
    if ($body !== null) { $h[] = 'Content-Type: application/json'; $content = json_encode($body); }
    $ctx = stream_context_create(['http' => ['method' => $method, 'header' => implode("\r\n", $h), 'content' => $content,
                                             'ignore_errors' => true, 'timeout' => 30]]);
    $raw = @file_get_contents($url, false, $ctx);
    $status = 0;
    foreach ($http_response_header ?? [] as $line) { if (preg_match('#^HTTP/\S+ (\d+)#', $line, $m)) { $status = (int)$m[1]; } }
    $data = json_decode((string)$raw, true);
    return [$status, is_array($data) ? $data : [], (string)$raw];
}
function ask(string $label, string $default = ''): string {
    echo $label . ($default !== '' ? " [$default]" : '') . ': ';
    $l = trim((string)fgets(STDIN));
    return $l === '' ? $default : $l;
}

echo "Universal Office admin console -- $base\n";
[$s, $d] = call('GET', "$api/health");
if ($s === 401) {
    // The API folder is meant to be exempt from the site password; if it is not, the (temporary) workaround
    // is to answer the prompt here. Sessions use the same header, so this only works for the sign-in steps.
    fwrite(STDERR, "The site is answering 401 (password-protected) for the API. The API folder should be exempt; see the runbook.\n");
}
if ($s !== 200) { fwrite(STDERR, "Cannot reach $api/health (HTTP $s). Is the backend uploaded?\n"); exit(1); }

$email = ask('Admin email', 'josh@jwjeffery.org');
[$s, $d] = call('POST', "$api/admin/auth/request-code", ['email' => $email]);
if ($s !== 200) { fwrite(STDERR, "Could not request a code (HTTP $s): " . ($d['message'] ?? '') . "\n"); exit(1); }
echo "A code was emailed to that address if it is an admin address. Check the inbox.\n";
$code = ask('Enter the 6-digit code');
[$s, $d] = call('POST', "$api/admin/auth/verify-code", ['email' => $email, 'code' => $code]);
if ($s !== 200 || empty($d['token'])) { fwrite(STDERR, "That code was not accepted.\n"); exit(1); }
$token = $d['token'];
echo "Signed in.\n";

while (true) {
    echo "\n1) Deployment status   2) List parishes   3) Approve a pending parish   4) Suspend   5) Restore   6) Delete   0) Quit\n";
    $choice = ask('Choose');
    if ($choice === '0' || $choice === '') { break; }
    if ($choice === '1') {
        [$s, $d, $raw] = call('GET', "$api/admin/status", null, $token);
        echo $s === 200 ? json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n" : "HTTP $s\n$raw\n";
    } elseif ($choice === '2') {
        [$s, $d] = call('GET', "$api/admin/parishes", null, $token);
        if ($s !== 200) { echo "HTTP $s\n"; continue; }
        if (!$d['parishes']) { echo "No parishes yet.\n"; }
        foreach ($d['parishes'] as $p) {
            printf("#%d  %-10s %-38s staff=%d active=%d  rector=%s <%s>\n", $p['id'], $p['status'], $p['name'],
                   $p['staff_count'], $p['active_intentions'], $p['rector_name'] ?? '-', $p['rector_email'] ?? '-');
        }
    } elseif (in_array($choice, ['3', '4', '5', '6'], true)) {
        $id = ask('Parish number (the # in the list)');
        if (!ctype_digit($id)) { echo "That is not a number.\n"; continue; }
        if ($choice === '6') {
            $slug = ask('To confirm, type the parish short name (the slug), exactly');
            [$s, $d] = call('DELETE', "$api/admin/parishes/$id", ['confirm' => "DELETE $slug"], $token);
        } else {
            $action = ['3' => 'approve', '4' => 'suspend', '5' => 'unsuspend'][$choice];
            [$s, $d] = call('POST', "$api/admin/parishes/$id/$action", [], $token);
        }
        echo $s === 200 ? "Done.\n" : "Not done (HTTP $s): " . ($d['message'] ?? '') . "\n";
    }
}
call('POST', "$api/auth/logout", [], $token);
echo "Signed out.\n";
