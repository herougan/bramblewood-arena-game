#!/usr/bin/env node
// 2026-11-10 (package BAL37): one named pick read with BAL35's rules and keep rule, for a move the two tools do not try together. The
// exhaust read changes the deck and leader at the fight's Shield (Shield 0 only on a fight too hard), and the tuner takes one move a step
// and stops when a single move gains under 2 points: on Shrine Steps (20-4, too easy) the leader move alone and the Shield move alone each
// gain little (81.5 -> 81.5 / 78.5), together 81.5 -> 73. The pick must pass the tuner's setup().legal (own list, size, first-clear
// cards, K14, a challenge fight leads with a card of its deck) and its Shield stay within the rule; it plays 200 games on the road seeds
// (9100 + 37g) against the fight as it stands and is kept only when 2+ points nearer the target there. Output
// docs/balance/bal37/pick/<code>.json in the tuner's format (apply: node tools/bal37/apply_2026_11_10.js --dir pick).
//   node tools/bal37/pick_2026_11_10.js --code 20-4 --deck '{"a":5,...}' [--leaders obsidian-scorpion] [--shield 20]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), T = require('../bal35/road_tune_2026_11_10.js');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), F = T.setup(code), keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
const deck = arg('--deck') ? JSON.parse(arg('--deck')) : Object.assign({}, F.node0.deck), L = arg('--leaders'), S = arg('--shield');
const v = { deck, leaders: L == null ? null : L.split(',').filter(Boolean), shield: S == null ? null : +S };
if (!F.legal(v.deck, v.leaders || F.leaders0)) throw new Error(code + ': pick not legal under the tuner rules');
if (v.shield != null && (v.shield > F.rule || F.MAP === 'mpd')) throw new Error(code + ': Shield above the rule ' + F.rule);
const orig = { deck: F.node0.deck, leaders: null, shield: null }, was = T.measure(F, orig, 200, 9100), now = T.measure(F, v, 200, 9100);
const gap = x => Math.abs(x - F.want), changed = keyOf(v.deck) !== keyOf(orig.deck) || !!v.leaders || v.shield != null, keep = changed && gap(now.win) + 2 <= gap(was.win);
const desc = x => ({ deck: x.deck, leaders: x.leaders || F.leaders0, shieldOverride: x.shield == null ? F.ov0 : x.shield });
const res = { about: 'BAL37 named pick (tools/bal37/pick_2026_11_10.js)', code, map: F.MAP, mapName: F.m.name, kind: F.kind, name: F.node0.name,
  band: { lo: F.lo, hi: F.hi, target: F.want }, list: F.ins, firstClear: F.first, k14Before: F.K0, leaders: F.leaders0, namesake: F.namesake, shieldRule: F.rule, shieldOverride: F.ov0,
  before: Object.assign(desc(orig), { win200: was.win, shown: was.shield }), pick: Object.assign(desc(v), { win200: now.win, shown: now.shield }), keep, k14After: F.k14(v.deck),
  trail: [{ move: 'start', win: was.win }, { move: 'named pick', win: now.win }] };
const OUT = path.join(ROOT, 'docs', 'balance', 'bal37', 'pick'); fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, code + '.json'), JSON.stringify(res, null, 1) + '\n');
console.log(code, 'target', F.want, '| 200 games:', was.win, '->', now.win, keep ? 'KEEP' : 'no', JSON.stringify(desc(v)));
