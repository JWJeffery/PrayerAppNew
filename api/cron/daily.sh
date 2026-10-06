#!/bin/bash
# cPanel cron entry point for the daily job. Schedule it EVERY HOUR; it does the real work once a day,
# at or after 8:00 a.m. Pacific (see the time gate in find-php.sh). Finds a suitable PHP, then runs
# daily.php. Prints nothing on success; anything printed (an error) is emailed to you by cPanel.
umask 077
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRIVATE="${UO_PRIVATE:-$HOME/uo-private}"
UO_STATE_DIR="$PRIVATE/logs"
. "$HERE/find-php.sh"
uo_due daily 8 || exit 0
if ! uo_find_php; then
  echo "Universal Office daily job: no suitable PHP (8.1+ with pdo_mysql and sodium) was found on this server." >&2
  exit 1
fi
[ -f "$PRIVATE/config.php" ] && export UO_CONFIG_PATH="${UO_CONFIG_PATH:-$PRIVATE/config.php}"
"$PHP_BIN" "$HERE/daily.php" "$@"
rc=$?
[ "$rc" = "0" ] && uo_mark_done daily
exit $rc
