#!/usr/bin/env bash
# Builds the React app into client/build (served by server/app.py).
set -euo pipefail
cd "$(dirname "$0")"
npm ci
VITE_USE_MOCKS=false npm run build
