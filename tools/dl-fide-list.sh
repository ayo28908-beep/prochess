#!/usr/bin/env bash
# Self-healing download for the FIDE combined rating list.
# Resumes partial downloads (-C -), caps each attempt so stalled connections retry
# quickly, and only extracts once the zip validates. FIDE's server throttles hard,
# so this may loop many times — that's expected and fine.
set -u
cd "$(dirname "$0")"
URL="https://ratings.fide.com/download/players_list.zip"
ZIP="players_list.zip"

attempt=0
until unzip -tq "$ZIP" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  echo "[$(date +%H:%M:%S)] attempt $attempt — size $(stat -c %s "$ZIP" 2>/dev/null || echo 0)"
  curl -sL -C - --max-time 180 -o "$ZIP" "$URL" || true
  sleep 3
done
echo "[$(date +%H:%M:%S)] zip valid — extracting"
unzip -o -q "$ZIP" -d .
echo "DOWNLOAD_COMPLETE"
