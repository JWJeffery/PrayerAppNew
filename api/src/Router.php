<?php
// Tiny router: exact-method routes with {param} segments. No regex from callers.
if (!defined('UO_API')) { exit; }

final class Router
{
    /** @var array<int,array{0:string,1:string,2:callable}> */
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        $this->routes[] = [strtoupper($method), $pattern, $handler];
    }

    /**
     * @return array{status:int, handler:?callable, params:array<string,string>, allow:array<int,string>}
     * status 200 = matched, 404 = no route, 405 = path exists for other methods.
     */
    public function resolve(string $method, string $path): array
    {
        $allow = [];
        foreach ($this->routes as [$m, $pattern, $handler]) {
            $params = self::match($pattern, $path);
            if ($params === null) { continue; }
            if ($m === strtoupper($method)) {
                return ['status' => 200, 'handler' => $handler, 'params' => $params, 'allow' => []];
            }
            $allow[] = $m;
        }
        if ($allow !== []) {
            return ['status' => 405, 'handler' => null, 'params' => [], 'allow' => array_values(array_unique($allow))];
        }
        return ['status' => 404, 'handler' => null, 'params' => [], 'allow' => []];
    }

    /** Segment-wise match; {name} captures one non-empty segment of safe characters. */
    public static function match(string $pattern, string $path): ?array
    {
        $p = explode('/', trim($pattern, '/'));
        $s = explode('/', trim($path, '/'));
        if (count($p) !== count($s)) { return null; }
        $params = [];
        foreach ($p as $i => $seg) {
            if ($seg !== '' && $seg[0] === '{' && substr($seg, -1) === '}') {
                if (!preg_match('/^[A-Za-z0-9_-]{1,80}$/', $s[$i])) { return null; }
                $params[substr($seg, 1, -1)] = $s[$i];
            } elseif ($seg !== $s[$i]) {
                return null;
            }
        }
        return $params;
    }
}
