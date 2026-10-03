#!/bin/bash
# Recreates the pinned Divinum Officium engine clone that the Roman Breviary oracles run against.
# The clone lives OUTSIDE the repo (default /home/user/divinumofficium/divinum-officium) and is only
# needed to (re)generate test oracles; the shipped app never uses Perl.
set -euo pipefail
SHA=0ce8747d7dba3276fc05937635e02360b49a60a6
DEST="${DO_ENGINE_DIR:-/home/user/divinumofficium/divinum-officium}"
if ! perl -MCGI -e1 2>/dev/null; then
  apt-get install -y -q perl libcgi-pm-perl libwww-perl liblocale-gettext-perl libtime-hires-perl
fi
mkdir -p "$(dirname "$DEST")"
if [ ! -d "$DEST/.git" ]; then git init -q "$DEST"; git -C "$DEST" remote add origin https://github.com/DivinumOfficium/divinum-officium.git; fi
if [ "$(git -C "$DEST" rev-parse HEAD 2>/dev/null || true)" != "$SHA" ]; then
  git -C "$DEST" fetch -q --depth 1 origin "$SHA"
  git -C "$DEST" checkout -q "$SHA"
fi
echo "engine clone at $(git -C "$DEST" rev-parse HEAD)"
