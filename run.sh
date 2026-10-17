#!/bin/sh
# ./run.sh            -> regenerate the example assignment (HW_ASSIGNMENT=<name> to pick another), then start the preview on http://localhost:8080
# ./run.sh preview    -> start the preview only (uses the last generated PDFs/images)
# ./run.sh build      -> regenerate only
# ./run.sh setup      -> install dependencies first
cd "$(dirname "$0")"
case "${1:-all}" in
  setup) npm run hw:setup ;;
  build) npm run hw:build ;;
  preview) npm run hw:preview:fast ;;
  *) npm run hw:preview ;;
esac
