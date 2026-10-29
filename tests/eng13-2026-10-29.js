#!/usr/bin/env node
// Package ENG13 (2026-10-29, owner 21:36):
//   1. "Ambushes - no need to be completed to progress - but typically very hard.": the Map 3 Ambush locks nothing (ambushLocksNode, the
//      next map's unlock and the map-cleared check skip it), and its deck (AMBUSH_DECKS) on a Smart CPU at a raised Enemy level (AMBUSH_HARD)
//      holds the Map 3 reference deck under 50% (it won 98% against the old Hummingbird deck).
//   2. "New ability: Slow - loses tie when same speed.": inside one Speed a Slow unit acts after every non-Slow one; two Slow units as usual.
//   3. "Canopy cover only blocks 50% attacks from ranged and flying attacks": a ground unit's melee swing is never dodged; a Flyer's swing and a
//      shot are, on the fight's seeded roll (the same seed, the same outcome; both outcomes are reached).
//   4. "Admin - clicking the currencies +100 then doubles it": adminCurrencyTapNext (+100 under 100, then x2, capped), one delegated listener.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-a': U('x-a', {}), 'x-slow': U('x-slow', {slow:true}), 'x-slow1': U('x-slow1', {slow:true, speed:1}),
  'x-wall': U('x-wall', {}, {attack:0, health:5000, wait:9}),
  'x-fly': U('x-fly', {flying:true}), 'x-arch': U('x-arch', {arrow:1}, {attack:0, wait:0}),
  'x-cc': U('x-cc', {canopyCover:true}, {attack:0, health:5000, wait:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || {}});
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:500, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:500, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const order = (ev, uids)=> ev.filter(x=> (x.type === 'hit' || x.type === 'hitHQ' || x.type === 'evaded') && uids.includes(x.attUid)).map(x=> x.attUid);
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };

// ---- 2. Slow ---------------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const a = put(e, P, 1, 'x-a', 1), b = put(e, P, 1, 'x-a', 0); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-wall', 1);
  const o = order(round(e, P), [a.uid, b.uid]); ok(o[0] === b.uid && o[1] === a.uid, `plain units: the left column first (${o})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'x-a', 1), s = put(e, P, 1, 'x-slow', 0); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-wall', 1);
  const o = order(round(e, P), [a.uid, s.uid]); ok(o[0] === a.uid && o[1] === s.uid, `Slow in the left column acts after the plain unit in the right (${o})`); }
{ const {e, P} = mk(); const s = put(e, P, 1, 'x-slow', 0), f = put(e, P, 2, 'x-a', 0);
  const o = order(round(e, P, 1), [s.uid, f.uid]); ok(o[0] === f.uid && o[1] === s.uid, `Slow loses the tie to the enemy facing it even on the side that wins ties this round (${o})`); }
{ const {e, P} = mk(); const s1 = put(e, P, 1, 'x-slow', 1), s2 = put(e, P, 1, 'x-slow', 0); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-wall', 1);
  const o = order(round(e, P), [s1.uid, s2.uid]); ok(o[0] === s2.uid && o[1] === s1.uid, `two Slow units order as usual, the left column first (${o})`); }
{ const {e, P} = mk(); const s = put(e, P, 1, 'x-slow1', 1), a = put(e, P, 1, 'x-a', 0); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-wall', 1);
  const o = order(round(e, P), [s.uid, a.uid]); ok(o[0] === s.uid && o[1] === a.uid, `a Slow unit with Speed 1 still goes before a Speed 0 one (Speed first, then the tie) (${o})`); }
{ const eng = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/if\(a\.spd!==b\.spd\) return b\.spd-a\.spd;[\s\S]{0,400}const sa = slowRank\(a\), sb = slowRank\(b\);\s*if\(sa!==sb\) return sa-sb;/.test(eng), 'engine: the Slow rank sits right after the Speed compare in pickNextAttacker'); }
{ const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), row = costs.skills.find(r=> r.id === 'slow');
  ok(row && row.scale === 'fixed' && row.value < 0 && row.value === -0.8, `Slow is priced as a drawback: ${row && row.value} (bench.js skill slow: -0.9 at 80, -0.8 at 200)`);
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  ok(!cards.some(c=> c.effects && c.effects.slow), 'Slow is on no live card (the owner places it)');
  const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
  ok(TXT['ui.eng13-slow-name'] === 'Slow' && /same Speed/.test(TXT['ui.eng13-slow']), 'Slow has its TX name and line');
  ok(app.includes("PASSIVE_DEFS.push({key:'slow', category:'passive', label:TX('ui.eng13-slow-name')") && app.includes("Object.assign(SKILL_ICON, {slow:'🐌'})") && app.includes("Object.assign(SKILL_TEXT, {slow: ()=> TX('ui.eng13-slow')})"), 'arena_app.js: the passive row, the 🐌 icon and the skill line');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pk = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
    ok(['Slow', TXT['ui.eng13-slow'], TXT['ui.sk-canopy-cover'], TXT['ui.sk-canopy-cover-codex'], TXT['ui.eng13-admin-cur-tap']].every(k=> pk[k]), `lang/${c}.json has the ENG13 rows`); }); }

// ---- 3. Canopy Cover: ranged and Flying attacks only, 1 in 2 on the seeded roll ------------------------------------------------------
function swing(att, seed, rules){ const {e, P} = mk(rules || {woods:true}, seed); const a = put(e, P, 1, att, 0), c = put(e, P, 2, 'x-cc', 0);
  const ev = round(e, P).filter(x=> x.attUid === a.uid && (x.type === 'evaded' || x.type === 'hit')); return ev.map(x=> x.type === 'evaded' ? x.reason : 'hit').join(','); }
{ let cc = 0; for(let s = 1; s <= 60; s++) if(/canopyCover/.test(swing('x-a', s))) cc++;
  ok(cc === 0, `a ground unit's melee swing is never dodged by Canopy Cover (60 seeds: ${cc})`); }
{ const res = []; for(let s = 1; s <= 60; s++) res.push(swing('x-fly', s)); const cc = res.filter(r=> r === 'canopyCover').length, hit = res.filter(r=> r === 'hit').length;
  ok(cc > 15 && hit > 15 && cc + hit === 60, `a Flyer's swing: dodged on some seeds, landed on others (${cc} dodged, ${hit} landed of 60)`);
  const sd = res.indexOf('canopyCover') + 1, sh = res.indexOf('hit') + 1;
  ok(swing('x-fly', sd) === 'canopyCover' && swing('x-fly', sd) === 'canopyCover', `seed ${sd}: the Flyer's swing is dodged, every time`);
  ok(swing('x-fly', sh) === 'hit' && swing('x-fly', sh) === 'hit', `seed ${sh}: the Flyer's swing lands, every time`); }
{ const res = []; for(let s = 1; s <= 60; s++) res.push(swing('x-arch', s)); const cc = res.filter(r=> /canopyCover/.test(r)).length;
  ok(cc > 15 && cc < 50, `a shot (Arrow) is dodged on about half the seeds (${cc} of 60)`); }
{ let cc = 0; for(let s = 1; s <= 30; s++) if(/canopyCover/.test(swing('x-fly', s, {}))) cc++; ok(cc === 0, `in the open there is no cover (${cc})`); }
{ const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT; ok(/shots, skills and Flying attacks/.test(TXT['ui.sk-canopy-cover']) && /Flying/.test(TXT['ui.sk-canopy-cover']), 'the Canopy Cover line names shots, skills and Flying attackers');
  const cat = fs.readFileSync(path.join(ROOT, 'docs', 'effects-catalogue.md'), 'utf8'); ok(/en5FromAbove/.test(cat) && /Slow 🐌/.test(cat), 'docs/effects-catalogue.md describes both'); }

// ---- 1. the Ambush: optional and hard ------------------------------------------------------------------------------------------------
{ const lock = (app.match(/function ambushLocksNode\([^)]*\)\{[^\n]*\}/) || [''])[0];
  ok(lock && new Function(lock + '\nreturn ambushLocksNode;')()({id:'mc'}, {key:'3-2'}) === false, 'ambushLocksNode locks nothing');
  ok(!/the-ambush-still-blocks-the-way'\), 'warn'\); conquestSelectedNodeKey = 'ambush'/.test(app), "3-2's Fight is no longer turned away while the Ambush stands");
  const m = app.match(/\!\(n\.chance > 0\) && \!n\.secret && \!n\.ambush/g) || []; ok(m.length === 3, `the next map's unlock, its "what is left" line and conquestMapCleared skip the Ambush (${m.length} of 3)`);
  ok(/rewardTokens:\['factionGrowth'\], requires: \[\], floating: true, ambush:true/.test(app), 'its reward (a Faction Growth card) is kept'); }
{ const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = G.getCardDefs();
  const DECKS = eval('(' + B.grab('AMBUSH_DECKS').replace(/^const AMBUSH_DECKS = /, '').replace(/;\s*$/, '') + ')'), HARD = eval('(' + B.grab('AMBUSH_HARD').replace(/^const AMBUSH_HARD = /, '').replace(/;\s*$/, '') + ')');
  ['hummingbirds', 'otters'].forEach(foe=>{ const deck = DECKS[foe], tot = Object.values(deck).reduce((a, b)=> a + b, 0), side = foe === 'hummingbirds' ? 'tribes' : '';
    ok(tot >= 16 && tot <= 20 && Object.entries(deck).every(([id, k])=> D[id] && k <= G.maxCopiesForRarity(D[id].rarity)), `the ${foe}' deck: ${tot} cards, inside the copy ladder`);
    ok(Object.keys(deck).every(id=> ['common', 'uncommon'].includes(D[id].rarity) && (G.cardSourceOf(D[id]) || {}).kind === 'pack' && ((G.cardSourceOf(D[id]) || {}).side || '') === side), `the ${foe}' deck is its own faction's Common / Uncommon cards`);
    ok(HARD[foe] && HARD[foe].ai === 'smart' && HARD[foe].enemyLevel > 0, `the ${foe}' Ambush: Smart CPU, Enemy level ${HARD[foe] && HARD[foe].enemyLevel}`); });
  const map = G.CONQUEST_MAPS.filter(m=> !m.sub)[3], GAMES = 24;
  ['hummingbirds', 'otters'].forEach(foe=>{ const node = Object.assign({key:'ambush', kind:'elite', name:'Ambush', icon:'x', hqHp:24, deck: DECKS[foe], requires:[], floating:true, ambush:true, faction:foe}, HARD[foe]);
    const r = G.simulateReferenceFight(map.id, node, GAMES, {seed0: 9100}); ok(r.win < 0.5 && r.cpu === 1, `the Map 3 reference deck wins ${Math.round(r.win * 100)}% against the ${foe}' Ambush (${GAMES} games; the road's Map 3 fights 79-93%)`); }); }

// ---- 4. Admin: a tap on a currency ---------------------------------------------------------------------------------------------------
{ const f = new Function('ADMIN_RESOURCE_MAX', (app.match(/function adminCurrencyTapNext\([^)]*\)\{[^\n]*\}/) || [''])[0] + '\nconst ADMIN_CUR_TAP_STEP = 100; return adminCurrencyTapNext;')(99999);
  ok(f(0) === 100 && f(40) === 140 && f(100) === 200 && f(200) === 400 && f(60000) === 99999 && f(99999) === 99999, `+100 under 100, then doubles, up to 99,999 (0->${f(0)}, 40->${f(40)}, 100->${f(100)}, 200->${f(200)}, 60000->${f(60000)})`);
  ok((app.match(/r = adminCurrencyTap\(kind\)/g) || []).length === 1 && /if\(typeof document !== 'undefined'\) document\.addEventListener\('click', e=>\{\n  const el = e\.target && e\.target\.closest && e\.target\.closest\('\[data-cur-kind\]'\); if\(!el \|\| !adminModeEnabled\) return;/.test(app), 'one delegated listener, wired once at load, Admin Mode only');
  ok(/class="hud-pill cur-pill \$\{extraCls\|\|''\}" data-cur-kind=/.test(app) && /<div class="inv-cell" data-cur-kind="\$\{k\}">/.test(app), 'the wallet pills and the Inventory wallet carry data-cur-kind');
  ok(/if\(!adminModeEnabled \|\| !adminAllowed\(\) \|\| !CURRENCY_META\[kind\]\) return null;/.test(app), 'adminCurrencyTap: admins in Admin Mode only'); }

console.log(`eng13-2026-10-29: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
