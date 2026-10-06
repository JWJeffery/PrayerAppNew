<?php
// Runs work after the HTTP response has been sent, so response time does not reveal
// whether an email address is authorized (spec 6.1, enumeration resistance).
if (!defined('UO_API')) { exit; }

final class Deferred
{
    /**
     * Call after the response body has been echoed. Where the SAPI can close the connection
     * early (PHP-FPM / LiteSpeed) the job runs after the client has its answer. Elsewhere the
     * job runs inline, and when there is no job we sleep a random 0.4-1.2 s so "nothing to do"
     * is not measurably faster than "sent an email".
     */
    public static function run(?callable $job): void
    {
        $finished = false;
        if (function_exists('fastcgi_finish_request')) { $finished = fastcgi_finish_request(); }
        elseif (function_exists('litespeed_finish_request')) { litespeed_finish_request(); $finished = true; }

        if ($job === null) {
            if (!$finished) { usleep(random_int(400000, 1200000)); }
            return;
        }
        try {
            $job();
        } catch (Throwable $e) {
            uo_log('deferred job failed: ' . get_class($e)); // class only -- no addresses or codes
        }
    }
}
