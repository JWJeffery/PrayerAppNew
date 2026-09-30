#!/usr/bin/env bash
# Checks a deployed copy of the API from the OUTSIDE, the way an attacker or a mail scanner would.
# Usage:  bash api/dev/check-production.sh https://theuniversaloffice.com
# Prints PASS / FAIL per check. Sends no email and changes nothing.
BASE="${1:-https://theuniversaloffice.com}"
BASE="${BASE%/}"
# TEMPORARY DIAGNOSTIC ONLY: CHECK_INSECURE=1 skips certificate verification so the rest of the
# deployment can be tested while a broken certificate is being fixed. Never treat a run made this
# way as a pass: the final run must be done WITHOUT it.
CURLO=""
# If the site is behind a hosting-level password (HTTP Basic auth), pass CHECK_USER=<username>;
# you are asked for the password (hidden) and it is kept only in a temporary private file.
if [ -n "$CHECK_USER" ]; then
  read -r -s -p "Site password for $CHECK_USER: " CHECK_PASS; echo
  NETRC="$(mktemp)"; chmod 600 "$NETRC"; trap 'rm -f "$NETRC"' EXIT
  HOST="${BASE#*://}"; HOST="${HOST%%/*}"; HOST="${HOST%%:*}"
  printf 'machine %s login %s password %s\n' "$HOST" "$CHECK_USER" "$CHECK_PASS" > "$NETRC"
  CURLO="--netrc-file $NETRC"
fi
if [ -n "$CHECK_INSECURE" ]; then
  CURLO="$CURLO -k"
  echo "*** WARNING: certificate checking is OFF for this run. Fix the certificate, then re-run without CHECK_INSECURE. ***"
fi
fails=0
ok()   { echo "  PASS  $1"; }
bad()  { echo "  FAIL  $1"; fails=$((fails+1)); }
code() { curl $CURLO -s -o /dev/null -m 20 -w '%{http_code}' "$@"; }

echo "Checking $BASE"
body="$(curl $CURLO -s -m 20 "$BASE/api/v1/health")"
[ "$body" = '{"status":"ok"}' ] && ok "health answers {\"status\":\"ok\"}" || bad "health did not answer ok (got: ${body:0:120})"

body="$(curl $CURLO -s -m 20 "$BASE/api/v1/parishes")"
case "$body" in *'"parishes"'*) ok "parish list answers (database connected)";; *) bad "parish list failed (got: ${body:0:120}) -- database or config problem";; esac

c="$(code "$BASE/api/v1/definitely-not-a-route")"
[ "$c" = "404" ] && ok "unknown API route -> 404" || bad "unknown API route gave $c (want 404)"

hdrs="$(curl $CURLO -sI -m 20 "$BASE/api/v1/health")"
echo "$hdrs" | grep -qi '^x-content-type-options: *nosniff' && ok "nosniff header present" || bad "nosniff header missing"
echo "$hdrs" | grep -qi '^access-control-allow-origin' && bad "a CORS header is present (should be none)" || ok "no CORS header"

for p in api/src/bootstrap.php api/src/Config.php api/lib/PHPMailer/PHPMailer.php api/migrations/001_init.sql \
         api/cli/migrate.php api/cron/ api/config.php api/config.example.php api/tests/run.php api/dev/router.php api/.htaccess; do
  c="$(code "$BASE/$p")"
  case "$c" in 403|404) ok "blocked: /$p ($c)";; *) bad "REACHABLE: /$p gave $c";; esac
done
leak="$(curl $CURLO -s -m 20 "$BASE/api/src/Config.php" | head -c 200)"
case "$leak" in *"<?php"*) bad "PHP source is being served!";; *) ok "no PHP source is served";; esac

c="$(code "$BASE/parish/approve.html")"
[ "$c" = "200" ] && ok "approval page is served (200)" || bad "approval page gave $c (want 200)"
csp="$(curl $CURLO -sI -m 20 "$BASE/parish/approve.html" | grep -i '^content-security-policy')"
[ -n "$csp" ] && ok "approval page carries a Content-Security-Policy" || bad "no Content-Security-Policy on /parish/ pages"

http="${BASE/https:/http:}"
loc="$(curl $CURLO -sI -m 20 "$http/api/v1/health" | tr -d '\r' | grep -i '^location:')"
case "$loc" in *https://*) ok "plain http redirects to https";; *) bad "http did not redirect to https (Location: ${loc:-none})";; esac

c="$(code -X POST -H 'Content-Type: application/json' -d '{"token":"0000000000000000000000000000000000000000000000000000000000000000"}' "$BASE/api/v1/admin/approval-info")"
[ "$c" = "400" ] && ok "approval endpoint rejects a fake token (400)" || bad "approval endpoint gave $c for a fake token (want 400)"
c="$(code "$BASE/api/v1/admin/approve")"
[ "$c" = "405" ] && ok "GET on the approve endpoint is refused (405) -- scanners cannot approve" || bad "GET on approve gave $c (want 405)"

echo
if [ "$fails" -eq 0 ]; then echo "ALL CHECKS PASSED"; else echo "$fails CHECK(S) FAILED"; exit 1; fi
