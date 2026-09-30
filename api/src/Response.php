<?php
// JSON responses with the security headers required by spec section 6.5.
if (!defined('UO_API')) { exit; }

final class Response
{
    public static function json(int $status, $body, string $cache = 'no-store'): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: no-referrer');
        header('Cache-Control: ' . $cache);
        echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    /** Generic error body: {"error":"<code>","message":"<text>"[,"fields":{...}]}. */
    public static function error(int $status, string $code, string $message, ?array $fields = null): void
    {
        $body = ['error' => $code, 'message' => $message];
        if ($fields !== null) { $body['fields'] = $fields; }
        self::json($status, $body);
    }
}
