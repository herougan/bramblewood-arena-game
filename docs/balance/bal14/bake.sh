#!/usr/bin/env bash
# 2026-11-03 (package BAL14): the PRO re-bake (fields, leaders) and the BPRO / WPRO rebuild for the maps whose lists changed:
# the three placed jellyfish (mb Moon Jelly, m2 Lion's Mane Jelly, m7 Supernova Jelly) and Hoopoe Herald's re-fit (m5, my).
set -e
cd "$(dirname "$0")/../../.."
node tools/opt/skill2_pro_rebake_2026_10_31.js
for m in mb m2 m7 m5 my; do node tools/opt/bpro2_2026_10_31.js run --map $m --force | tail -2; done
node tools/opt/bpro2_2026_10_31.js apply --maps 2,4,10,14 | tail -5
node tools/opt/bpro2_2026_10_31.js check | tail -5
for m in mb m2 m7 m5 my; do node tools/opt/wpro_2026_11_02.js run --map $m --force | tail -2; done
node tools/opt/wpro_2026_11_02.js apply --maps 2,4,10,14 | tail -5
node tools/opt/wpro_2026_11_02.js check | tail -5
node tools/opt/bpro2_2026_10_31.js plan --maps 0-20 > /dev/null
echo BAKE-DONE
