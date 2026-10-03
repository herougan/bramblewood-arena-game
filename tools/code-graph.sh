#!/usr/bin/env bash
# Code knowledge graph (graphify, https://github.com/Graphify-Labs/graphify). Code-only, local,
# no LLM calls: tree-sitter parses the JS/Python, then clusters it into communities.
#   pip install graphifyy   (once)
#   bash tools/code-graph.sh
# Writes docs/code-graph-report.md (committed) and /tmp/bw-graph/graphify-out/{graph.json,graph.html}
# (large; not committed). Query afterwards with:
#   graphify explain "resolveLiveTarget" --graph /tmp/bw-graph/graphify-out/graph.json
#   graphify path "playCardByUid" "resolveCombat" --graph /tmp/bw-graph/graphify-out/graph.json
set -euo pipefail
cd "$(dirname "$0")/.."
command -v graphify >/dev/null || { echo "graphify not installed: pip install graphifyy"; exit 1; }
rm -rf /tmp/bw-graph && mkdir -p /tmp/bw-graph
cp arena_app.js bramblewood-*.js assemble_arena.py /tmp/bw-graph/
cp -r tests /tmp/bw-graph/tests
( cd /tmp/bw-graph && graphify update . )
cp /tmp/bw-graph/graphify-out/GRAPH_REPORT.md docs/code-graph-report.md
echo "Report: docs/code-graph-report.md · interactive graph: /tmp/bw-graph/graphify-out/graph.html"
