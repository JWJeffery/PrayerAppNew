<?php
// Outgoing mail (spec section 9). Driver "smtp" sends through PHPMailer; driver "log"
// appends the rendered message to <log_dir>/mail-outbox.log and NEVER sends (dev/tests).
if (!defined('UO_API')) { exit; }

final class Mailer
{
    /** Last SMTP error text, for the interactive CLI test only. The API never logs or returns it. */
    public static ?string $lastError = null;

    /** Plain-text message. Returns false (never throws) on any failure or unsafe header value. */
    public static function send(string $to, string $subject, string $body): bool
    {
        self::$lastError = null;
        // Header-injection defence (spec 6.1): no CR/LF/NUL anywhere in header-bound strings.
        foreach ([$to, $subject, (string)Config::get('mail.from_email', ''), (string)Config::get('mail.from_name', '')] as $v) {
            if (preg_match('/[\r\n\0]/', $v)) { self::$lastError = 'unsafe_header'; return false; }
        }
        if (filter_var($to, FILTER_VALIDATE_EMAIL) === false) { self::$lastError = 'bad_recipient'; return false; }

        $driver = (string)Config::get('mail.driver', 'smtp');
        try {
            if ($driver === 'log') { return self::logMessage($to, $subject, $body); }
            if ($driver !== 'smtp') { self::$lastError = 'bad_driver'; return false; }
            return self::sendSmtp($to, $subject, $body);
        } catch (Throwable $e) {
            self::$lastError = get_class($e);
            uo_log('mail send failed: ' . get_class($e)); // class only -- no addresses
            return false;
        }
    }

    private static function logMessage(string $to, string $subject, string $body): bool
    {
        $dir = Config::logDir();
        if ($dir === null || !(is_dir($dir) || @mkdir($dir, 0700, true))) { self::$lastError = 'no_log_dir'; return false; }
        $entry = "=== MAIL " . gmdate('Y-m-d\TH:i:s\Z') . " ===\nTo: $to\nSubject: $subject\n\n$body\n=== END ===\n";
        $file = $dir . '/mail-outbox.log';
        $ok = @file_put_contents($file, $entry, FILE_APPEND | LOCK_EX) !== false;
        @chmod($file, 0600);
        return $ok;
    }

    private static function sendSmtp(string $to, string $subject, string $body): bool
    {
        $lib = __DIR__ . '/../lib/PHPMailer';
        require_once $lib . '/Exception.php';
        require_once $lib . '/PHPMailer.php';
        require_once $lib . '/SMTP.php';

        $m = new \PHPMailer\PHPMailer\PHPMailer(true);
        $m->isSMTP();
        $m->Host = (string)Config::get('mail.host');
        $m->Port = (int)Config::get('mail.port', 587);
        $m->SMTPAuth = true;
        $m->Username = (string)Config::get('mail.username');
        $m->Password = (string)Config::get('mail.password');
        $enc = (string)Config::get('mail.encryption', 'tls');
        $m->SMTPSecure = $enc === 'ssl' ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                                        : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $m->Timeout = 15;
        $m->CharSet = 'UTF-8';
        $m->isHTML(false);
        $m->setFrom((string)Config::get('mail.from_email'), (string)Config::get('mail.from_name', ''));
        $m->addAddress($to);
        $m->Subject = $subject;
        $m->Body = $body;
        try {
            $m->send();
            return true;
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            self::$lastError = $m->ErrorInfo; // shown only by cli/send-test-mail.php
            uo_log('mail send failed: ' . get_class($e));
            return false;
        }
    }
}
