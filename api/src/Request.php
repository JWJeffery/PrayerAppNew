<?php
// Minimal request wrapper: method, /api/v1-relative path, headers, JSON body.
if (!defined('UO_API')) { exit; }

final class Request
{
    public const MAX_BODY_BYTES = 8192; // spec 6.4

    public static function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    /** Path after "/api/v1" (always begins with "/"), or null when not an API v1 path. */
    public static function path(): ?string
    {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        if (!is_string($uri)) { return null; }
        $marker = '/api/v1';
        $pos = strpos($uri, $marker);
        if ($pos === false) { return null; }
        $rest = substr($uri, $pos + strlen($marker));
        if ($rest === '' || $rest === false) { return '/'; }
        return $rest[0] === '/' ? $rest : null;
    }

    /**
     * Client address for rate limiting only (never stored raw). REMOTE_ADDR unless the
     * config says a trusted proxy sits in front, then the first X-Forwarded-For entry.
     */
    public static function ip(): string
    {
        $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        if (Config::get('trust_proxy', false) === true) {
            $xff = self::header('X-Forwarded-For');
            if ($xff !== null) {
                $first = trim(explode(',', $xff)[0]);
                if (filter_var($first, FILTER_VALIDATE_IP)) { $ip = $first; }
            }
        }
        return $ip;
    }

    public static function header(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return isset($_SERVER[$key]) ? (string)$_SERVER[$key] : null;
    }

    /**
     * Decoded JSON object body. Returns [array|null, errorCode|null].
     * Enforces Content-Type, the 8 KB cap and object-shaped JSON.
     */
    public static function jsonBody(): array
    {
        $type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
        if ($type !== 'application/json') { return [null, 'bad_request']; }
        $raw = file_get_contents('php://input', false, null, 0, self::MAX_BODY_BYTES + 1);
        if ($raw === false || strlen($raw) > self::MAX_BODY_BYTES) { return [null, 'bad_request']; }
        $data = json_decode($raw, true);
        if (!is_array($data) || (array_values($data) === $data && $data !== [])) { return [null, 'bad_request']; }
        return [$data, null];
    }
}
