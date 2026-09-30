<?php
// Configuration loader. Fails closed: a missing, unreadable, malformed or
// still-placeholder config is an error, never a silent default.
if (!defined('UO_API')) { exit; }

final class Config
{
    private static ?array $data = null;
    private static ?string $path = null;

    /** Locate config.php: UO_CONFIG_PATH env first, then <docroot parent>/uo-private/config.php. */
    public static function locate(): ?string
    {
        $env = getenv('UO_CONFIG_PATH');
        if (is_string($env) && $env !== '') {
            return is_file($env) ? $env : null;
        }
        $docroot = $_SERVER['DOCUMENT_ROOT'] ?? '';
        if ($docroot !== '') {
            $candidate = dirname(rtrim($docroot, '/')) . '/uo-private/config.php';
            if (is_file($candidate)) { return $candidate; }
        }
        return null;
    }

    /** Load and validate. Throws RuntimeException (reason only -- no values). */
    public static function load(?string $path = null): array
    {
        $path = $path ?? self::locate();
        if ($path === null) { throw new RuntimeException('config_not_found'); }
        if (!is_readable($path)) { throw new RuntimeException('config_unreadable'); }
        $data = (static function (string $p) { return include $p; })($path);
        if (!is_array($data)) { throw new RuntimeException('config_malformed'); }
        $bad = self::placeholders($data);
        if ($bad !== []) { throw new RuntimeException('config_has_placeholders'); }
        self::$data = $data;
        self::$path = $path;
        return $data;
    }

    /** Dotted-key lookup, e.g. Config::get('db.host'). */
    public static function get(string $key, $default = null)
    {
        if (self::$data === null) { throw new RuntimeException('config_not_loaded'); }
        $node = self::$data;
        foreach (explode('.', $key) as $part) {
            if (!is_array($node) || !array_key_exists($part, $node)) { return $default; }
            $node = $node[$part];
        }
        return $node;
    }

    public static function path(): ?string { return self::$path; }

    /** Directory for logs: config 'log_dir', else <config dir>/logs. */
    public static function logDir(): ?string
    {
        $dir = self::$data['log_dir'] ?? null;
        if (is_string($dir) && $dir !== '') { return $dir; }
        return self::$path !== null ? dirname(self::$path) . '/logs' : null;
    }

    /** Dotted names of every string value that is still a CHANGE_ME placeholder. */
    public static function placeholders(array $data, string $prefix = ''): array
    {
        $found = [];
        foreach ($data as $k => $v) {
            $name = $prefix . $k;
            if (is_array($v)) {
                $found = array_merge($found, self::placeholders($v, $name . '.'));
            } elseif (is_string($v) && strpos($v, 'CHANGE_ME') === 0) {
                $found[] = $name;
            }
        }
        return $found;
    }
}
