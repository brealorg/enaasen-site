#!/usr/bin/env bash
set -euo pipefail

rm -rf _site
mkdir -p _site

cp -R public/. _site/

COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo local)"
COMMIT_TIME="$(git log -1 --format=%cI 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")"

cat > _site/deploy-info.js <<EOF
window.__DEPLOY_INFO__ = {
  commit: "$COMMIT",
  commitTime: "$COMMIT_TIME"
};
EOF
