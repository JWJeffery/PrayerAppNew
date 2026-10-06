# Sourced by daily.sh and backup.sh. Sets $PHP_BIN to a PHP 8.1+ command-line binary that has the
# database and encryption extensions, trying the usual shared-hosting locations. cPanel cron jobs
# do not always use the same PHP as the website, so this checks instead of assuming.
uo_find_php() {
  local p
  for p in "${UO_PHP:-}" /opt/alt/php84/usr/bin/php /opt/alt/php83/usr/bin/php /opt/alt/php82/usr/bin/php /opt/alt/php81/usr/bin/php \
           /opt/cpanel/ea-php84/root/usr/bin/php /opt/cpanel/ea-php83/root/usr/bin/php /opt/cpanel/ea-php82/root/usr/bin/php /opt/cpanel/ea-php81/root/usr/bin/php \
           /usr/local/bin/php "$(command -v php 2>/dev/null)"; do
    [ -n "$p" ] && [ -x "$p" ] || continue
    if "$p" -r 'exit((PHP_VERSION_ID >= 80100 && extension_loaded("pdo_mysql") && extension_loaded("sodium")) ? 0 : 1);' 2>/dev/null; then
      PHP_BIN="$p"; return 0
    fi
  done
  return 1
}

# Time gate, so the cPanel schedule can simply be "every hour" and these jobs still run once a day at
# the intended Pacific time whatever time zone the server's cron uses. uo_due <name> <hour> is true
# when it is at or after <hour> Pacific and the job has not yet completed today (so a missed day,
# e.g. the server was down at 8am, catches up at the next hourly tick). uo_mark_done records success.
# UO_FORCE=1 skips the gate (manual runs, tests); UO_PACIFIC_NOW="YYYY-MM-DD HH" fakes the clock (tests).
uo_due() {
  local name="$1" hour="$2" now day h
  [ "${UO_FORCE:-}" = "1" ] && return 0
  now="${UO_PACIFIC_NOW:-$(TZ=America/Los_Angeles date '+%Y-%m-%d %H')}"
  day="${now% *}"; h="${now#* }"
  [ $((10#$h)) -ge "$hour" ] || return 1
  [ "$(cat "$UO_STATE_DIR/$name.last" 2>/dev/null)" != "$day" ]
}
uo_mark_done() {
  local name="$1" now day
  now="${UO_PACIFIC_NOW:-$(TZ=America/Los_Angeles date '+%Y-%m-%d %H')}"; day="${now% *}"
  mkdir -p "$UO_STATE_DIR" 2>/dev/null && printf '%s\n' "$day" > "$UO_STATE_DIR/$name.last"
}
