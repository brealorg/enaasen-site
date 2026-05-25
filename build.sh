#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="public"
OUT_DIR="_site"

rm -rf "$OUT_DIR" "$SRC_DIR/_site"
mkdir -p "$OUT_DIR"

cp "$SRC_DIR/index.html" "$OUT_DIR/"
cp "$SRC_DIR/style.css" "$OUT_DIR/"
cp "$SRC_DIR/script.js" "$OUT_DIR/"
cp "logo.png" "$OUT_DIR/logo.png"

COMMIT_SHA="${CF_PAGES_COMMIT_SHA:-$(git rev-parse HEAD)}"
COMMIT_SHORT="$(echo "$COMMIT_SHA" | cut -c1-7)"
COMMIT_TIME="$(git show -s --format=%cI "$COMMIT_SHA" 2>/dev/null || date -Iseconds)"
BUILD_TIME="$(date -Iseconds)"

cat > "$OUT_DIR/deploy-info.js" <<DEPLOYINFO
window.DEPLOY_INFO = {
  commit: "$COMMIT_SHORT",
  commitSha: "$COMMIT_SHA",
  commitTime: "$COMMIT_TIME",
  buildTime: "$BUILD_TIME"
};
DEPLOYINFO
