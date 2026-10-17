#!/bin/sh
# One-time setup for the handwritten-assignment generator.
set -eu
cd "$(dirname "$0")/../.."
npm install
python3 -m venv tools/hwbuild/.venv
tools/hwbuild/.venv/bin/pip install -q pillow numpy
npx playwright install chromium || echo "playwright download failed - set CHROME_PATH to a Chromium binary"
echo "Setup done. Run:  npm run hw:preview"
