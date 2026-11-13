#!/usr/bin/env node
// Package CONTENT19 (2026-11-11, owner: "Add a new card, Sea Bass for Map 10"): the Sea Bass, THEME8's design (docs/design/map-suggestions-2026-11-11.json
// seaBass) as it went into the game.
//   1  the card: common Fish, 1 Lumber, Wait 1, Tide + Wave 1 + Swarm (Fish) (three skills, the engine's own ids), Types Coral Reef + Fish (Swarm counts
//      Types, not species), the emoji and no art, THEME8's flavour, a unique numericId / uuid, a basic-pack card of Pack 2 (m7)
//   2  the budget at the game's own term: cardObtainMap gives a Pack 2 card Map 7, where THEME8's 3/7 read over (21.78 > 21.5), so it is 3/6
//   3  Map 10's list (main map m7): on it and on no other list, in no pack's extras, in no skirmish deck, not held by the budget check
//   4  the skills work in the engine: the Swarm counts the Fish type (a second Sea Bass, the Reef Shark, not the Clownfish Scout), Wave 1 pushes
//   5  name and flavour in the 12 packs and the build; the art prompt with the fish body plan, the art-needed entry, CHANGELOG, run-all.sh
//   node tests/content19-2026-11-11.js
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, E = H.Engine;
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8'), J = rel=> JSON.parse(rd(rel));
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), TB = SC.make(J('canonical/skill-costs.json'));
const L = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = LB.G;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

const cards = J('canonical/cards.json'), by = Object.fromEntries(cards.map(c=> [c.id, c])), c = by['sea-bass'];
const design = J('docs/design/map-suggestions-2026-11-11.json').seaBass;
// 2026-11-12 (TESTFIX1): the owner's 11-12 picks for Map 10 left the Sea Bass out and SKIR3 took it off every list: it is out of play now ('unplaced'), flagged unattainable,
// in no deck and exempt from the budget hold. OUT switches each placement check to that rule; the card's own data, skills and texts are checked as before
const OUT = L.budgetHold('sea-bass') === 'unplaced';

// ---- 1. the card -----------------------------------------------------------------------------------------------------------------------
ok(!!c, '1 sea-bass is in canonical/cards.json'); if(!c){ console.log(`content19: ${n - fail}/${n} ok`); process.exit(1); }
ok(c.name === 'Sea Bass' && c.rarity === 'common' && c.cost === 1 && c.wait === 1, `1 Sea Bass, common, 1 Lumber, Wait 1 (${c.name} ${c.rarity} ${c.cost}/${c.wait})`);
ok(c.attack === 3 && c.health === 6, `1 stats 3/6 (${c.attack}/${c.health})`);
ok(JSON.stringify(c.species) === '["Fish"]' && c.animal === 'sea bass' && c.dmgType === 'physical', '1 species Fish, animal sea bass, physical damage (as the other reef fish)');
ok(c.archetypes.includes('Fish') && c.archetypes.includes('Coral Reef'), `1 Types Coral Reef + Fish (Swarm counts Types, not species): ${c.archetypes}`);
{ const fx = c.effects || {}, keys = Object.keys(fx);
  ok(keys.length >= 2 && keys.length <= 3, `1 two or three skills (${keys})`);
  ok(fx.tide === true && fx.wave === true && JSON.stringify(fx.swarm) === '["Fish"]', '1 the engine ids: tide, wave (true = Wave 1, as the editor writes it), swarm ["Fish"]');
  ok(!('waveN' in fx) && !('swarmN' in fx) && !('swarmSpecies' in fx) && !('tideGrant' in fx), '1 no twin keys (ENG35: one key per skill)'); }
ok(c.flavor === design.flavor, '1 THEME8\'s flavour line');
ok(/\p{Extended_Pictographic}/u.test(c.icon), `1 the emoji fallback is kept (${c.icon})`); // 2026-11-13 TESTFIX3: the card has art now (was: no art yet); the icon stays as the fallback
ok(JSON.stringify(c.source) === '{"kind":"pack","tier":2,"map":"m7"}', '1 a basic-pack card of Pack 2, map m7 (as Parrotfish and the other Map 10 pack cards)');
ok(!c.awaitingSource && (OUT ? c.unattainable === true : !c.unattainable) && !c.pool && c.locked === true && c.test === false, `1 ${OUT ? 'out of play and flagged unattainable (SKIR3), not awaiting a source' : 'placed, not awaiting a source'}`);
{ const ids = cards.map(x=> x.numericId).filter(x=> x != null), uu = cards.map(x=> x.uuid).filter(Boolean);
  ok(new Set(ids).size === ids.length && new Set(uu).size === uu.length, '1 numericIds and uuids are unique'); ok(cards.slice(cards.indexOf(c) + 1).every(x=> x.numericId > c.numericId) /* 2026-11-12 (TESTFIX1): later cards (Barrel Cactus) were appended after it */, `1 appended at the end with the next numericId (${c.numericId})`); }
ok(/CONTENT19/.test(c.creatorNote || ''), '1 a CONTENT19 creatorNote');

// ---- 2. the budget at the game's own term ----------------------------------------------------------------------------------------------
const def = LB.CARD_DEFS_BASELINE['sea-bass'];
ok(!!def, '2 the game reads the card (tools/lib_bramble CARD_DEFS_BASELINE)');
const om = G.cardObtainMap(def);
if(OUT) ok(!om && J('canonical/card-obtain-maps.json').maps['sea-bass'] == null, `2 out of play: the game gives it no obtain map (${om}), and canonical/card-obtain-maps.json lists none`);
else ok(om === 7 && J('canonical/card-obtain-maps.json').maps['sea-bass'] === 7, `2 the game prices it at Map 7 (Pack 2's first map), and canonical/card-obtain-maps.json says so (${om})`);
const omB = om ? om : 7; // Pack 2's first map: the term its budget is judged at
{ const b = TB.budget(Object.assign({}, c, {obtainMap: omB}), {level: 1});
  ok(b.ok, `2 passes at the game's term (3A + H + S ${b.x1} / N ${b.N}; cap 2 ${b.x2} / ${b.N2})`);
  ok(Math.abs(b.S - 5.78) < 0.01 && b.parts.length === 3 && !(b.missing || []).length, `2 S 5.78 = Tide 0.5 + Wave 2.15 + Swarm 3.13 (${b.S}), every skill priced`);
  const old = TB.budget(Object.assign({}, c, {attack: 3, health: 7, obtainMap: omB}), {level: 1}), at10 = TB.budget(Object.assign({}, c, {attack: 3, health: 7, obtainMap: 10}), {level: 1});
  ok(!old.ok && at10.ok, `2 THEME8's 3/7 is over at Map 7 (${old.x1} > ${old.N}) and passes only at the Map 10 term (${at10.x1} <= ${at10.N}): why Health is 6`);
  ok(TB.budget(Object.assign({}, c, {obtainMap: 10}), {level: 1}).ok, '2 and 3/6 passes at Map 10 as well'); }
ok(OUT ? L.budgetHold('sea-bass') === 'unplaced' : L.budgetHold('sea-bass') === '', `2 the card-pass budget check ${OUT ? 'skips it (unplaced)' : 'looks at it (not unplaced or pending)'}: "${L.budgetHold('sea-bass')}"`);

// ---- 3. Map 10's list ------------------------------------------------------------------------------------------------------------------
const pools = J('canonical/map-pools.json'), extras = J('canonical/pack-extras.json');
ok(G.mapNumberOf('m7') === 10, '3 main map m7 is Map 10 (mapNumberOf)');
ok(OUT ? !pools.maps.m7.cards.includes('sea-bass') : pools.maps.m7.cards.includes('sea-bass'), OUT ? '3 off Map 10\'s MAP list (SKIR3: not one of the owner\'s picks)' : '3 on Map 10\'s MAP list (canonical/map-pools.json m7 cards)');
{ const on = []; Object.entries(pools.maps).forEach(([k, e])=>{ if((e.cards || []).includes('sea-bass')) on.push(k); if((e.special || []).includes('sea-bass')) on.push(k + ' special'); Object.entries(e.submaps || {}).forEach(([s, l])=>{ if(l.includes('sea-bass')) on.push(s); }); });
  ok(OUT ? on.length === 0 : (on.length === 1 && on[0] === 'm7'), `3 ${OUT ? 'on no list at all' : 'on no other list, no SPECIAL, no submap'} (${on})`); }
ok(!Object.values(extras).some(v=> Array.isArray(v) && v.includes('sea-bass')), '3 in no pack extras');
{ const e = J('canonical/map-review.json').maps.m7.chosen.find(x=> x.id === 'sea-bass'); ok(OUT || (e && e.by === 'owner' && /CONTENT19/.test(e.why)), '3 Map 10\'s review (canonical/map-review.json m7 chosen) has it as the owner\'s ask (content4 / content10 want a review row for every list card)'); }{ const f = G.cardFirstMapList(def); ok(OUT ? !f : (f && f.n === 10 && f.loc === 'm7'), `3 its first map list is ${OUT ? 'none (out of play)' : 'Map 10'} (${JSON.stringify(f)})`); ok(OUT || G.basicPackTierOf(def) === 2, `3 a Pack 2 card (${G.basicPackTierOf(def)})`); }
// 2026-11-11 (SKIR1): the later package came: SKIR1 rebuilt the skirmishes from the new lists, so the Sea Bass may sit in Map 10's (m7) decks
// (lines SKIR1 rebuilt) and Map 10's PRO decks, nowhere else
{ const lines = rd('arena_app.js').split('\n').filter(l=> l.includes('"sea-bass"'));
  // out of play: no fight deck literal and no baked reference deck (REF_DECK_SETS) may hold it (the 'was {...}' comments SKIR1 / SKIR3 left do not count)
  const live = lines.filter(l=> /deck:\{[^}]*"sea-bass"/.test(l) || (/REF_DECK_SETS =/.test(l) && /"sea-bass":\d/.test(l)));
  ok(OUT ? live.length === 0 : lines.every(l=> /^\s*\{ ?key:\s*"10-\d+"/.test(l) && /\(SKIR1( fit)?\)/.test(l)), `3 in no skirmish deck or map block of arena_app.js but Map 10's, rebuilt by SKIR1 (${OUT ? live.length + ' live lines: ' + live.map(l=> (/key:"([^"]+)"/.exec(l) || [0, l.slice(0, 24)])[1]).join(', ') : lines.length + ' lines'})`); }
{ const P = J('canonical/pro-skirmishes.json').maps, on = Object.keys(P).filter(k=> JSON.stringify([P[k].pro, P[k].bpro, P[k].wpro]).includes('sea-bass'));
  ok(on.every(k=> k === 'm7'), `3 in no PRO skirmish but Map 10's (SKIR1 rebuilt them; ${on.join(', ') || 'none'})`); }
{ const m = /"m7": \{"cards": \[([^\]]*)\]/.exec(rd('index.html')); ok(m && (OUT ? !/"sea-bass"/.test(m[1]) : /"sea-bass"/.test(m[1])), OUT ? '3 the build does not carry it on Map 10\'s list (index.html)' : '3 the build carries it on Map 10\'s list (index.html)'); }

// ---- 4. the skills in the engine --------------------------------------------------------------------------------------------------------
{ const so = id=> id === 1 ? 'A' : 'B', all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
  const defs = Object.assign({}, H.loadCardDefs(), {'c19-wall': {id: 'c19-wall', name: 'Wall', attack: 0, health: 500, wait: 0, cost: 0, effects: {}}});
  const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents: true, battleMode: 'open'}); return {e, P: {1: e.newPlayer(1, {}, {health: 200}), 2: e.newPlayer(2, {}, {health: 200})}}; };
  const put = (e, P, pid, id, slot)=>{ e.debugSpawnCard(P, so, pid, id, 'left', {}, []); const pl = P[pid], u = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); u.slot = slot;
    const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot); e.syncSlots(pl); return u; };
  { const {e, P} = mk(), s = put(e, P, 1, 'sea-bass', 0); ok(e.swarmBonusOf(P, s) === 0, `4 alone: no Swarm bonus (${e.swarmBonusOf(P, s)})`);
    put(e, P, 1, 'sea-bass', 1); ok(e.swarmBonusOf(P, s) === 1, `4 a second Sea Bass counts as a Fish ally (+${e.swarmBonusOf(P, s)})`);
    put(e, P, 1, 'reef-shark', -1); ok(e.swarmBonusOf(P, s) === 2, `4 the Reef Shark (a Fish) counts too (+${e.swarmBonusOf(P, s)})`);
    put(e, P, 1, 'clownfish-scout', -2); ok(e.swarmBonusOf(P, s) === 2, `4 the Clownfish Scout (Coral Reef only, no Fish Type) does not (+${e.swarmBonusOf(P, s)})`); }
  { const {e, P} = mk(), s = put(e, P, 1, 'sea-bass', 0), t = put(e, P, 2, 'c19-wall', 0), ev = []; e.debugAttack(P, so, s.uid, {}, ev);
    ok(t.hp === 497, `4 a swing lands its 3 (${500 - t.hp})`);
    const w = ev.find(x=> x.type === 'wave'); ok(w && w.attDefId === 'sea-bass' && w.n === 1, `4 Wave 1: the hit is a wave event of 1 column (${w && w.n})`); }
  { const {e, P} = mk(), s = put(e, P, 1, 'sea-bass', 0); put(e, P, 1, 'sea-bass', 1); const t = put(e, P, 2, 'c19-wall', 0); e.syncPhaseStats(P, so, []); const ev = []; e.debugAttack(P, so, s.uid, {}, ev);
    ok(t.hp === 496, `4 with a second Sea Bass beside it the swing is 3 + 1 (${500 - t.hp})`); } }

// ---- 5. texts, art prompt, docs ---------------------------------------------------------------------------------------------------------
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
CODES.forEach(code=>{ const cn = J(`lang/cards/${code}.json`), fl = J(`lang/ui/${code}.json`), asset = rd(`assets/lang/${code}.js`); // the built pack: window.BW_LANG_PACKS[code] = {...}
  ok(typeof cn['Sea Bass'] === 'string' && cn['Sea Bass'].trim() && cn['Sea Bass'] !== 'Sea Bass', `5 ${code}: the name is translated (${cn['Sea Bass']})`);
  ok(typeof fl[c.flavor] === 'string' && fl[c.flavor].trim() && fl[c.flavor] !== c.flavor, `5 ${code}: the flavour is translated`);
  const w = {}; new Function('window', asset)(w); const built = w.BW_LANG_PACKS[code] || {};
  ok(built['Sea Bass'] === cn['Sea Bass'] && built[c.flavor] === fl[c.flavor], `5 ${code}: both rows are in the built pack (assets/lang/${code}.js)`); });
{ const art = rd('docs/art-style-prompts.md'), i = art.indexOf('package CONTENT19'), sec = i < 0 ? '' : art.slice(i), prompt = (sec.split('\n').find(l=> l.startsWith('> ')) || '').toLowerCase();
  ok(i >= 0 && sec.includes('### Sea Bass') && prompt, '5 an art prompt for the Sea Bass under CONTENT19 in docs/art-style-prompts.md');
  ok(/anatomically correct fish: one streamlined body with no limbs, two dorsal fins, a pair of pectoral fins, a pair of pelvic fins, one anal fin and a forked tail fin/.test(prompt), '5 the prompt names the true fish body plan');
  ok(/background/.test(prompt) && prompt.includes('silver sea bass') && prompt.includes('breaking wave'), '5 the prompt has a background and is THEME8\'s scene');
  const bad = ['spear', 'sword', 'arrow', 'dagger', 'blade', 'weapon', 'spiked', 'studded', 'monitor', 'sperm', 'corpse', 'no clothes'];
  ok(!bad.some(w=> sec.toLowerCase().includes(w)), '5 the prompt avoids the banned words'); }
ok(/Art needed: \*\*Sea Bass\*\*/.test(rd('docs/action-items.md')), '5 an art-needed entry in docs/action-items.md');
ok(/Package CONTENT19/.test(rd('docs/CHANGELOG.md')), '5 CHANGELOG entry');
ok(/run node tests\/content19-2026-11-11\.js/.test(rd('tests/run-all.sh')), '5 listed in run-all.sh');

console.log(`content19: ${n - fail}/${n} ok`);
process.exit(fail ? 1 : 0);
