#!/usr/bin/env bash
# Development server for the Universal Office site + API.
# Usage:  bash api/dev/serve.sh            (serves on http://localhost:8080)
#         PORT=9000 bash api/dev/serve.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${PORT:-8080}"
DEV_DIR="$ROOT/.external/uo-private"
export UO_CONFIG_PATH="${UO_CONFIG_PATH:-$DEV_DIR/config.php}"

if [ ! -f "$UO_CONFIG_PATH" ]; then
  if [ "$UO_CONFIG_PATH" != "$DEV_DIR/config.php" ]; then
    echo "UO_CONFIG_PATH points to a missing file: $UO_CONFIG_PATH" >&2; exit 1
  fi
  echo "No dev config found -- creating one at $UO_CONFIG_PATH (git-ignored; mail is logged, never sent)."
  mkdir -p "$DEV_DIR/logs"
  chmod 700 "$DEV_DIR"
  php -r '
    $p = bin2hex(random_bytes(32)); $k = base64_encode(random_bytes(32));
    echo "<?php\nreturn [\n"
       . "  \"db\" => [\"host\" => \"127.0.0.1\", \"name\" => \"uo_dev\", \"user\" => \"uo_dev\", \"pass\" => \"uo_dev_local_only\"],\n"
       . "  \"mail\" => [\"driver\" => \"log\", \"host\" => \"localhost\", \"port\" => 587, \"encryption\" => \"tls\", \"username\" => \"dev\", \"password\" => \"dev-not-used\", \"from_email\" => \"admin@theuniversaloffice.com\", \"from_name\" => \"The Universal Office\"],\n"
       . "  \"secrets\" => [\"pepper\" => \"$p\", \"box_key\" => \"$k\"],\n"
       . "  \"admin_emails\" => [\"admin@theuniversaloffice.com\"],\n"
       . "  \"site_url\" => \"http://localhost:$argv[1]\",\n"
       . "  \"allowed_origins\" => [],\n  \"trust_proxy\" => false,\n  \"log_dir\" => null,\n];\n";
  ' "$PORT" > "$UO_CONFIG_PATH"
  chmod 600 "$UO_CONFIG_PATH"
fi

echo "Serving $ROOT on http://localhost:$PORT  (API: /api/v1/health)"
cd "$ROOT"
exec php -S "0.0.0.0:$PORT" -t "$ROOT" "$ROOT/api/dev/router.php"
