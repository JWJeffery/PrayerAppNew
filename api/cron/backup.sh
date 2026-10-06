#!/bin/bash
# Nightly database backup (spec 10.2): gzip'd mysqldump into <private dir>/backups, newest 14 kept.
# Prints nothing on success; any output (an error) is emailed to you by cPanel. Exits non-zero
# and leaves NO half-written file behind if the dump is empty or damaged.
# The dump contains prayer text in plain form: treat the files as sensitive (mode 600, folder 700).
set -u
umask 077
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRIVATE="${UO_PRIVATE:-$HOME/uo-private}"
KEEP="${UO_BACKUP_KEEP:-14}"
DUMP="${UO_MYSQLDUMP:-mysqldump}"
fail() { echo "Universal Office backup FAILED: $1" >&2; rm -f "${TMP:-/nonexistent}"; exit 1; }

UO_STATE_DIR="$PRIVATE/logs"
. "$HERE/find-php.sh"
uo_due backup 3 || exit 0   # every-hour schedule; really runs once a day, at or after 3:00 a.m. Pacific
uo_find_php || fail "no suitable PHP found"
[ -f "$PRIVATE/config.php" ] || fail "config.php not found in $PRIVATE"
export UO_CONFIG_PATH="$PRIVATE/config.php"

mkdir -p "$PRIVATE/backups" && chmod 700 "$PRIVATE/backups" || fail "cannot create the backups folder"
DBNAME="$("$PHP_BIN" "$HERE/make-backup-cnf.php" "$PRIVATE/backup.cnf")" || fail "cannot prepare backup.cnf"
[ -n "$DBNAME" ] || fail "no database name in config.php"

STAMP="$(date +%Y%m%d)"
FINAL="$PRIVATE/backups/uo-$STAMP.sql.gz"
TMP="$FINAL.partial"
"$DUMP" --defaults-extra-file="$PRIVATE/backup.cnf" --single-transaction --no-tablespaces "$DBNAME" 2>"$PRIVATE/backups/.dump-error" | gzip > "$TMP"
STATUS=("${PIPESTATUS[@]}")
if [ "${STATUS[0]}" != "0" ] || [ "${STATUS[1]}" != "0" ]; then
  # The message from mysqldump can name the database user but never the password.
  fail "the dump command failed ($(head -c 200 "$PRIVATE/backups/.dump-error" | tr '\n' ' '))"
fi
rm -f "$PRIVATE/backups/.dump-error"
gzip -t "$TMP" 2>/dev/null || fail "the dump file is not a valid gzip file"
# A real dump of this database always contains its tables; an empty or truncated one does not.
gzip -dc "$TMP" | grep -q 'CREATE TABLE' || fail "the dump is empty or has no tables"
chmod 600 "$TMP"
mv -f "$TMP" "$FINAL" || fail "cannot move the dump into place"

# Keep only the newest $KEEP dumps (names sort by date).
ls -1 "$PRIVATE/backups"/uo-*.sql.gz 2>/dev/null | sort | head -n "-$KEEP" | while read -r old; do rm -f "$old"; done
uo_mark_done backup
exit 0
