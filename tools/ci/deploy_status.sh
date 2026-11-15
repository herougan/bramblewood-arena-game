#!/usr/bin/env bash
# 2026-11-16 (package INFRA1): the latest "Deploy check" run (.github/workflows/deploy-check.yml): did the live site pick up the pushed build?
#   bash tools/ci/deploy_status.sh
set -euo pipefail
gh run list -R "${GH_REPO:-herougan/bramblewood-arena-game}" --workflow deploy-check.yml -L 1 \
  --json status,conclusion,headSha,displayTitle,createdAt,url \
  -q '.[] | "\(.conclusion // .status)  \(.headSha[0:7])  \(.createdAt)  \(.displayTitle)\n\(.url)"' | grep . || echo "no deploy-check run yet"
