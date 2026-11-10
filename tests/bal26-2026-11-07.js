#!/usr/bin/env node
// Package BAL26 (2026-11-07): Maps 0-20 after ENG29 / ENG32 / ENG33 (Guardian takes the attempt, Dive, Brood's 1/1 copies, Venomous,
// Thanatosis, Log Walls). No games are played; the checks read the data as it is now.
//   1. road retune (tools/bal26/road_tune_2026_11_07.js): every fight with a dated BAL26 comment is one a tune file kept (2+ points nearer
//      its target at 200 games on the road seeds); the deck is the pick; new cards on the fight's list, within the road's rarity cap, no
//      other fight's reward; size and first-clear cards kept, K14 no worse, Shield not above the rule, no bramble Health override added.
//   2. the pins: the retuned fights below hold exactly these decks / leaders / Shield overrides.
//   3. no Map 5 (Gatorback Swamp) fight and no BAL21-1 named exception (1-3, 1-4, 2-1, 14-1, 14-5, 19-A-7, 19-A-8, The Canopy) carries a
//      BAL26 edit; cards.json carries no BAL26 edit.
//   4. the Eyrie Heights A/B file, the road totals file and decisions BAL26-n (under 100 words) exist.
//   node tests/bal26-2026-11-07.js
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
const EXC = ['1-3', '1-4', '2-1', '14-1', '14-5', '19-A-7', '19-A-8'];

// ---- 1. road retune ----
// round 1 (tune) then round 2 (tune-r2, from round 1's decks; its 'before' is round 1's pick), the later kept pick wins
const tune = {}, first = {};
['tune', 'tune-r2'].map(d => path.join(ROOT, 'docs', 'balance', 'bal26', d)).filter(d => fs.existsSync(d)).forEach(tdir =>
  fs.readdirSync(tdir).filter(f => f.endsWith('.json')).forEach(f => { const x = JSON.parse(fs.readFileSync(path.join(tdir, f), 'utf8')); if (x.keep) { tune[x.code] = x; if (!first[x.code]) first[x.code] = x; } }));
const bal26Lines = [...lines.entries()].filter(([, l]) => /2026-11-07 \(BAL26\)/.test(l));
ok(bal26Lines.length >= 1, 'BAL26 retuned some road fights: ' + bal26Lines.length);
for (const [code, l] of bal26Lines) {
  if (/2026-11-10 \(BAL44\): retuned/.test(l)) continue; // 2026-11-10 (BAL44): retuned again (11-10); tests/bal44-2026-11-10.js checks and pins it now
  if (/2026-11-10 \(BAL41\): retuned/.test(l)) continue; // 2026-11-10 (BAL41): retuned again (17-2); tests/bal41-2026-11-10.js checks and pins it now
  if (/2026-11-10 \(BAL38\): retuned/.test(l)) continue; // 2026-11-10 (BAL38): retuned again (4-5); tests/bal38-2026-11-10.js checks and pins it now
  const x = tune[code], f = find(code); ok(x && f, code + ': kept in a BAL26 tune file and in CONQUEST_MAPS'); if (!x || !f) continue;
  // 2026-11-08 (BAL27): a fight BAL27 retuned again (its line carries a BAL27 comment) is checked here on BAL26's pick; tests/bal27-2026-11-08.js checks its deck now
  const now = fields(l), MAP = f.m.id, mapNo = G.mapNumberOf(MAP), kind = f.n.kind || 'skirmish', was = x.before.deck, d = /2026-11-08 \(BAL27\)/.test(l) ? x.pick.deck : now.deck;
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

// ---- 2. pins (filled from the applied tune files, 2026-11-07) ----
const PINS = {
  "4-5": {"deck":{"drowned-matriarch":1,"lions-mane-jelly":2,"muskrat-lodgekeeper":3,"pyrenean-desman":3,"snapstick-turtle":5,"water-shrew":5,"pond-algae":1},"shield":0},
  "8-2": {"deck":{"blind-cave-fish":5,"hollow-belly-rat":1,"stalactite-golem":5,"star-nosed-mole":2,"pelican-diver":1,"gallery-orb-weaver":2}},
  "10-1": {"deck":{"clownfish-scout":3,"kraken-spawnling":5,"orca-vanguard":5,"riptide-eel":4,"supernova-jelly":3}},
  "10-3": {"deck":{"coral-reef-shark":4,"riptide-eel":4,"orca-vanguard":4,"clownfish-scout":2,"kraken-spawnling":3}},
  "10-4": {"deck":{"clownfish-scout":2,"coral-reef-shark":2,"orca-vanguard":4,"parrotfish":2,"riptide-eel":4},"shield":0},
  "10-6": {"deck":{"great-barracuda":2,"orca-vanguard":2,"kraken-spawnling":2,"reef-shark":1,"coral-reef-shark":4},"leaders":["great-barracuda"]},
  "10-8": {"deck":{"clownfish-scout":4,"colossal-squid":2,"orca-vanguard":4,"riptide-eel":4,"supernova-jelly":2,"horseshoe-crab":1}},
  "11-3": {"deck":{"alpine-marmot":5,"alpine-salamander":1,"alpine-swift":2,"eagle-owl-quartermaster":1,"eyrie-warden":3}},
  "11-5": {"deck":{"ibex-rockcaller":1,"alpine-swift":5,"swamp-alligator":1,"chipmunk-hoarder":4,"eyrie-warden":5},"leaders":["red-billed-chough"],"shield":6},
  "11-6": {"deck":{"ibex-rockcaller":1,"alpine-salamander":2,"alpine-swift":5,"swamp-alligator":1,"eyrie-warden":5},"leaders":["peak-condor"],"shield":16},
  "11-7": {"deck":{"eyrie-warden":5,"alpine-swift":4,"swamp-alligator":1,"alpine-salamander":4,"chipmunk-hoarder":1},"leaders":["eyrie-warden"],"shield":10},
  "11-8": {"deck":{"chipmunk-hoarder":4,"eyrie-warden":4,"mountain-hare":2,"alpine-salamander":1,"alpine-swift":2,"peak-condor":1},"leaders":["gannet-nestweaver"],"shield":16},
  "11-10": {"deck":{"ibex-rockcaller":1,"chipmunk-hoarder":3,"alpine-swift":5,"swamp-alligator":1,"eyrie-warden":5,"peak-condor":1},"leaders":["red-billed-chough"],"shield":21},
  "14-3": {"deck":{"spitting-cobra":3,"marula-elephant":4,"springbok-pronker":3,"acacia-giraffe":1,"hoopoe-herald":4},"leaders":["marula-elephant"]},
  "14-7": {"deck":{"acacia-giraffe":1,"marula-elephant":4,"springbok-pronker":4,"ant-hill":1,"house-cat":1,"mouse-sapper":1,"hoopoe-herald":4},"shield":4},
  "16-6": {"deck":{"dhole-matriarch":1,"snowshoe-hare":5,"alpha-howler":3,"berserker-boar":1,"boreal-elk":5,"grizzly-vanguard":1,"cone-cutter-squirrel":2},"shield":47},
  "17-2": {"deck":{"alpha-howler":1,"harbor-seal":5,"lone-grey-wolf":2,"snow-bunting-archer":4,"spitting-spider":2,"snow-ermine":3},"leaders":["alpha-howler"]},
  "17-5": {"deck":{"walrus-icebreaker":1,"harbor-seal":4,"alpha-howler":1,"snow-bunting-archer":4,"spitting-spider":4,"frost-hare-sprinter":1},"leaders":["alpha-howler"]},
  "17-8": {"deck":{"walrus-icebreaker":1,"harbor-seal":5,"alpha-howler":1,"spitting-spider":4,"snow-bunting-archer":4,"mountain-hare":1},"shield":0},
  "1-A-1": {"deck":{"bee-forager":1,"meadow-rabbit":1,"ant-scout":1,"slow-worm":4,"woodcock-lookout":3,"field-vole":3},"shield":0},
  "1-A-2": {"deck":{"meadow-rabbit":1,"field-vole":3,"bee-forager":1,"woodcock-lookout":5,"bramble-sprout":5,"slow-worm":3,"ant-scout":1},"shield":0},
  "1-A-4": {"deck":{"field-vole":5,"ant-scout":1,"field-mouse":4,"bee-forager":1,"slow-worm":4,"meadow-rabbit":1},"shield":6},
  "10-A-2": {"deck":{"coral-reef-shark":2,"orca-vanguard":4,"kraken-spawnling":4,"hagfish-silencer":1,"nudibranch":1},"shield":2}
};
for (const [code, p] of Object.entries(PINS)) {
  const l = lines.get(code); ok(!!l, code + ': pinned fight found'); if (!l) continue; const now = fields(l);
  if (/2026-11-10 \(BAL44\): retuned/.test(l)) continue; // 2026-11-10 (BAL44): 11-10 retuned again, pinned in tests/bal44-pins-2026-11-10.json
  if (/2026-11-10 \(BAL41\): retuned/.test(l)) continue; // 2026-11-10 (BAL41): 17-2 retuned again, pinned in tests/bal41-pins-2026-11-10.json
  if (!/2026-11-10 \(BAL38\): retuned/.test(l)) // 2026-11-10 (BAL38): 4-5 retuned again, pinned in tests/bal38-pins-2026-11-10.json
  if (!/2026-11-08 \(BAL27\)/.test(l)) // 2026-11-08 (BAL27): retuned again, pinned in tests/bal27-2026-11-08.js
  ok(keyOf(now.deck) === keyOf(p.deck), `${code}: pinned deck ${JSON.stringify(p.deck)} (now ${JSON.stringify(now.deck)})`);
  if (p.leaders) ok((now.leaders ? JSON.parse(now.leaders) : null) + '' === p.leaders + '', `${code}: pinned leaders ${p.leaders}`);
  if (p.shield != null) ok(now.shield != null && +now.shield === p.shield, `${code}: pinned Shield override ${p.shield}`);
  ok(/2026-11-07 \(BAL26\)/.test(l), code + ': carries the dated BAL26 comment');
}

// ---- 3. untouched ----
ok(![...lines.entries()].some(([code, l]) => /^5-/.test(code) && /BAL26/.test(l)), 'no Map 5 / 5-A fight carries a BAL26 edit');
EXC.forEach(code => ok(!/BAL26/.test(lines.get(code) || ''), code + ': a BAL21-1 exception, no BAL26 edit'));
ok(![...lines.entries()].some(([code, l]) => /^14-A-/.test(code) && /BAL26/.test(l)), 'no The Canopy fight carries a BAL26 edit');
ok(!/BAL26/.test(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), 'cards.json carries no BAL26 edit');

// ---- 4. files and decisions ----
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal26', 'eyrie-ab-2026-11-07.json')), 'the Eyrie Heights A/B file exists');
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal26', 'road-totals-2026-11-07.json')), 'the road totals file exists');
const dec = J('docs/decisions.json'), items = (Array.isArray(dec) ? dec : dec.items || dec.decisions || []).filter(x => /^BAL26-/.test(x.id || ''));
ok(items.length >= 1, 'decisions BAL26-n filed: ' + items.length);
items.forEach(x => { const w = (x.body + ' ' + (x.options || []).join(' ')).split(/\s+/).filter(Boolean).length; ok(w < 100, `${x.id}: ${w} words (under 100)`); ok(x.group === 'game', x.id + ': group game'); });

console.log(`bal26-2026-11-07: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
