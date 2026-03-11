#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WM_DIR="$ROOT_DIR/integrations/worldmonitor-koala73"

if [ ! -d "$WM_DIR" ]; then
  echo "Missing directory: $WM_DIR"
  exit 1
fi

cd "$WM_DIR"
npm install
npm run dev -- --host 127.0.0.1 --port 5175

