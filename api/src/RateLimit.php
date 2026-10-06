<?php
// Fixed-window rate limiter backed by the rate_limits table. Bucket keys are
// HMAC-hashed so raw IPs/emails are never stored (spec 6.3).
if (!defined('UO_API')) { exit; }

final class RateLimit
{
    /**
     * Count one hit against "<name>:<hmac(rawKey)>" and report whether it is within $limit
     * per $windowSeconds. The upsert is a single atomic statement; MariaDB evaluates SET
     * clauses left to right, so hits is updated before window_start.
     *
     * @return array{allowed:bool, retry_after:int}
     */
    public static function hit(string $name, string $rawKey, int $limit, int $windowSeconds): array
    {
        $pdo = Db::pdo();
        $bucket = $name . ':' . Crypto::hmac($name . '|' . $rawKey);
        $now = time();
        $nowStr = gmdate('Y-m-d H:i:s', $now);
        $cutoff = gmdate('Y-m-d H:i:s', $now - $windowSeconds);

        $pdo->prepare(
            'INSERT INTO rate_limits (bucket, window_start, hits) VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE
               hits = IF(window_start < ?, 1, hits + 1),
               window_start = IF(window_start < ?, ?, window_start)'
        )->execute([$bucket, $nowStr, $cutoff, $cutoff, $nowStr]);

        $st = $pdo->prepare('SELECT hits, window_start FROM rate_limits WHERE bucket = ?');
        $st->execute([$bucket]);
        $row = $st->fetch();
        $retry = max(1, strtotime($row['window_start'] . ' UTC') + $windowSeconds - $now);
        return ['allowed' => (int)$row['hits'] <= $limit, 'retry_after' => $retry];
    }
}
