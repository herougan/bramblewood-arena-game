#!/usr/bin/env node
// Package BAL27 (2026-11-08): Maps 0-20 after ENG34 / ENG35 / ENG36 (BAL26's test, its rules unchanged). No games are played.
//   1. road retune (tools/bal27/road_tune_2026_11_08.js): every fight with a dated BAL27 comment is one a tune file kept (2+ points nearer
//      its target at 200 games on the road seeds); the deck is the pick; new cards on the fight's list, within the road's rarity cap, no
//      other fight's reward; size and first-clear cards kept, K14 no worse, Shield not above the rule, no bramble Health override added.
//   2. the pins: the retuned fights below hold exactly these decks / leaders / Shield overrides.
//   3. no The Canopy fight carries a BAL27 edit (BAL27-1: the tuner found no move); cards.json carries no BAL27 edit; the tuner aims a
//      challenge skirmish 10 points under its curve target (CHALLENGE_DROP, as skirmish_pass.js measure).
//   4. the Canopy cause file, the road totals file and decisions BAL27-n (under 100 words) exist.
//   node tests/bal27-2026-11-08.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), K = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js'));
const pools = J('canonical/map-pools.json'), src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const size = d => Object.values(d).reduce((t, k) => t + k, 0), keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
const lineRe = /^\s*\{ ?key:\s*"([^"]+)",.*$/gm, lines = new Map(); { let x; while ((x = lineRe.exec(src))) if (!lines.has(x[1])) lines.set(x[1], x[0]); }
const fields = l => ({ deck: JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]), leaders: (l.match(/leaders:(\[[^\]]*\])/) || [0, null])[1], shield: (l.match(/shieldOverride:(\d+)/) || [0, null])[1], hqHp: (l.match(/hqHp:(\d+)/) || [0, null])[1] });
const find = code => { for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower || m.endless) continue; const n = (m.nodes || []).find(x => x.key === code && x.deck); if (n) return { m, n }; } return null; };

// ---- 1. road retune ----
// round 1 (tune) then round 2 (tune-r2, from round 1's decks; its 'before' is round 1's pick), then round 3 (tune-r3, 2026-11-08: tune
// seeds 11300, re-read at 120 games), the later kept pick wins
const tune = {}, first = {};
['tune', 'tune-r2', 'tune-r3'].map(d => path.join(ROOT, 'docs', 'balance', 'bal27', d)).filter(d => fs.existsSync(d)).forEach(tdir =>
  fs.readdirSync(tdir).filter(f => f.endsWith('.json')).forEach(f => { const x = JSON.parse(fs.readFileSync(path.join(tdir, f), 'utf8')); if (x.keep) { tune[x.code] = x; if (!first[x.code]) first[x.code] = x; } }));
const bal27Lines = [...lines.entries()].filter(([, l]) => /2026-11-08 \(BAL27\)/.test(l));
ok(bal27Lines.length >= 1, 'BAL27 retuned some road fights: ' + bal27Lines.length);
for (const [code, l] of bal27Lines) {
  if (/2026-11-10 \(BAL45\): retuned/.test(l)) continue; // 2026-11-10 (BAL45): retuned again (5-2, 5-4, 5-5, 11-8); tests/bal45-2026-11-10.js checks and pins it now
  if (/2026-11-10 \(BAL42\): retuned/.test(l)) continue; // 2026-11-10 (BAL42): retuned again (7-6); tests/bal42-2026-11-10.js checks and pins it now
  if (/2026-11-10 \(BAL41\): retuned/.test(l)) continue; // 2026-11-10 (BAL41): retuned again (9-4); tests/bal41-2026-11-10.js checks and pins it now
  if (/2026-11-10 \(BAL3[56]\): retuned/.test(l)) continue; // 2026-11-10 (BAL35): retuned again (the worst road maps); tests/bal35-2026-11-10.js checks and pins it now; (BAL36): + 2-B-4, tests/bal36-2026-11-10.js
  const x = tune[code], f = find(code); ok(x && f, code + ': kept in a BAL27 tune file and in CONQUEST_MAPS'); if (!x || !f) continue;
  const now = fields(l), MAP = f.m.id, mapNo = G.mapNumberOf(MAP), kind = f.n.kind || 'skirmish', was = x.before.deck, d = now.deck;
  ok(mapNo != null && mapNo <= 20, code + ': on Maps 0-20');
  ok(Math.abs(x.pick.win200 - x.band.target) + 2 <= Math.abs(x.before.win200 - x.band.target), `${code}: 2+ points nearer the target at 200 games (${x.before.win200} -> ${x.pick.win200}, target ${x.band.target})`);
  ok(keyOf(d) === keyOf(x.pick.deck), code + ': the deck is the tune file\'s pick');
  const list = LP.fightPool(pools, MAP, f.m.sub ? f.m.parent : null) || new Set();
  Object.keys(d).filter(id => !was[id]).forEach(id => { const s = (D[id] || {}).source;
    ok(D[id] && list.has(id), `${code}: ${id} is on the fight's list`);
    ok(D[id] && G.roadRarityOk(D[id].rarity, mapNo, kind), `${code}: ${id} within the road's rarity cap`);
    ok(!(s && s.kind === 'map' && s.node && !(s.id === MAP && s.node === code)), `${code}: ${id} is not another fight's reward card`); });
  ok(size(d) === size(was), `${code}: deck size kept (${size(was)} -> ${size(d)})`);
  ((G.nodeFirstClearCardIds || G.nodeRewardCardIds)(MAP, code) || []).filter(id => was[id]).forEach(id => ok(d[id] > 0, `${code}: first-clear card ${id} kept`));
  if (MAP !== 'm1') { const n0 = Object.assign({}, f.n, { leaders: (x.before.leaders || []).slice() });
    ok(K.violations({ map: MAP, key: code, n: n0 }, d).length <= K.violations({ map: MAP, key: code, n: n0 }, was).length, `${code}: K14 no worse`); }
  const rule = G.ruleShieldOf(f.n);
  ok(now.shield == null || +now.shield <= Math.max(rule, x.before.shieldOverride == null ? 0 : +x.before.shieldOverride), `${code}: Shield override ${now.shield} not above the rule ${rule}`);
  ok(now.hqHp == null || !x.pick.hqHp, code + ': no bramble Health override added by the tuner');
}

// ---- 2. pins (filled from the applied tune files, 2026-11-08) ----
const PINS = {
  "5-1": {"deck":{"constrictor-coil":5,"cypress-root-lurker":3,"nutria-reedcutter":1,"swamp-alligator":1,"fire-ant-raft":1,"crocodile-ambusher":2}},
  "5-2": {"deck":{"bog-leech":1,"swamp-alligator":3,"cypress-root-lurker":2,"crocodile-ambusher":3,"constrictor-coil":5}},
  "5-3": {"deck":{"constrictor-coil":3,"swamp-alligator":4,"bog-leech":1,"fire-ant-raft":4,"nutria-reedcutter":3,"cypress-root-lurker":2}},
  "5-4": {"deck":{"fen-mink":3,"grass-viper":4,"cypress-root-lurker":1,"swamp-alligator":4,"nutria-reedcutter":3,"constrictor-coil":3},"shield":1},
  "5-5": {"deck":{"crocodile-ambusher":4,"bog-leech":1,"cypress-root-lurker":2,"constrictor-coil":2,"nutria-reedcutter":2,"fire-ant-raft":1,"swamp-alligator":2}},
  "14-2": {"deck":{"spitting-cobra":1,"grave-grin-hyena":3,"marula-elephant":4,"ant-hill":1,"springbok-pronker":5,"acacia-giraffe":1},"leaders":["ant-hill"]},
  "19-A-1": {"deck":{"beaver-lumberjack":3,"phoenix-fledgling":5,"anvilwhisker-otter":4,"ashbone-ghoul":1,"cinder-gecko":1}},
  "2-A-5": {"deck":{"duckling":1,"lodge-engineer":4,"muskrat-reedgatherer":1,"old-sturgeon":3,"pond-algae":1,"pond-duck":1,"water-vole":1,"victoria-regia":1},"leaders":["marsh-harrier"]},
  "2-B-3": {"deck":{"driftwood-crab":2,"duckling":1,"gull-thief":3,"open-ocean-hermit-crab":3,"pelican-diver":4,"pincushion-urchin":4,"tide-pool-crab":2,"trash-panda-trickster":1}},
  "2-B-4": {"deck":{"gull-thief":1,"octopus-tactician":3,"pelican-diver":4,"tidepool-trapper-crab":4,"conch-crawler":1,"trash-panda-trickster":4},"leaders":["gallery-orb-weaver"]},
  "7-6": {"deck":{"wolf-spider-mother":3,"leafcutter-gardener":3,"worker-ant":1,"hawthorn-shieldbug":2,"dung-beetle":4,"planarian-splitter":4,"earthworm":1,"corpse-flower-beetle":1},"shield":18},
  "8-8": {"deck":{"stalactite-golem":4,"echo-screecher":3,"blind-cave-fish":4,"gull-thief":1,"hollow-belly-rat":1,"gallery-orb-weaver":1,"sulfur-cinder-moth":1},"shield":1},
  "5-7": {"deck":{"constrictor-coil":3,"grass-viper":1,"alligator-gar":3,"bog-leech":1,"anhinga-spearbird":3,"cypress-root-lurker":1,"nutria-reedcutter":5,"crocodile-ambusher":2},"shield":0},
  "9-4": {"deck":{"fiddler-crab-swarm":1,"sea-turtle-elder":1,"reef-shark":5,"conch-crawler":1,"horseshoe-crab":4,"mangrove-mudskipper":4},"shield":4},
  "16-3": {"deck":{"woodland-caribou":4,"alpha-howler":4,"redwood-woodpecker":1,"boreal-elk":5,"snowshoe-hare":4,"cone-cutter-squirrel":2},"shield":16},
  "11-8": {"deck":{"chipmunk-hoarder":3,"eyrie-warden":4,"mountain-hare":3,"alpine-salamander":1,"alpine-swift":2,"peak-condor":1},"leaders":["gannet-nestweaver"],"shield":16}
};
for (const [code, p] of Object.entries(PINS)) {
  const l = lines.get(code); ok(!!l, code + ': pinned fight found'); if (!l) continue; const now = fields(l);
  if (/2026-11-10 \(BAL45\): retuned/.test(l)) continue; // 2026-11-10 (BAL45): 5-4, 11-8 retuned again, pinned in tests/bal45-pins-2026-11-10.json
  if (/2026-11-10 \(BAL42\): retuned/.test(l)) continue; // 2026-11-10 (BAL42): 7-6 retuned again, pinned in tests/bal42-pins-2026-11-10.json
  if (/2026-11-10 \(BAL41\): retuned/.test(l)) continue; // 2026-11-10 (BAL41): 9-4 retuned again, pinned in tests/bal41-pins-2026-11-10.json
  if (/2026-11-10 \(BAL3[56]\): retuned/.test(l)) continue; // 2026-11-10 (BAL35): retuned again (the worst road maps); tests/bal35-2026-11-10.js checks and pins it now; (BAL36): + 2-B-4, tests/bal36-2026-11-10.js
  ok(keyOf(now.deck) === keyOf(p.deck), `${code}: pinned deck ${JSON.stringify(p.deck)} (now ${JSON.stringify(now.deck)})`);
  if (p.leaders) ok((now.leaders ? JSON.parse(now.leaders) : null) + '' === p.leaders + '', `${code}: pinned leaders ${p.leaders}`);
  if (p.shield != null) ok(now.shield != null && +now.shield === p.shield, `${code}: pinned Shield override ${p.shield}`);
  ok(/2026-11-08 \(BAL27\)/.test(l), code + ': carries the dated BAL27 comment');
}

// ---- 3. untouched, and the challenge target ----
ok(![...lines.entries()].some(([code, l]) => /^14-A-/.test(code) && /BAL27/.test(l)), 'no The Canopy fight carries a BAL27 edit (BAL27-1)');
ok(!/BAL27/.test(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), 'cards.json carries no BAL27 edit');
ok(/node0\.challenge && band0\.curve \? 0\.10 : 0/.test(fs.readFileSync(path.join(ROOT, 'tools', 'bal27', 'road_tune_2026_11_08.js'), 'utf8')), 'the BAL27 tuner aims a challenge skirmish 10 points under its curve target');

// ---- 4. files and decisions ----
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal27', 'canopy-cause-2026-11-08.txt')), 'the Canopy cause file exists');
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal27', 'road-totals-2026-11-08.txt')), 'the road totals file exists');
const dec = J('docs/decisions.json'), items = (Array.isArray(dec) ? dec : dec.items || dec.decisions || []).filter(x => /^BAL27-/.test(x.id || ''));
ok(items.length >= 1, 'decisions BAL27-n filed: ' + items.length);
items.forEach(x => { const w = (x.body + ' ' + (x.options || []).join(' ')).split(/\s+/).filter(Boolean).length; ok(w < 100, `${x.id}: ${w} words (under 100)`); ok(x.group === 'game', x.id + ': group game'); });

console.log(`bal27-2026-11-08: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
