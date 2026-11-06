#!/usr/bin/env node
// 2026-11-05 (package CONTENT11): the owner's 11-04 22:34 answers (docs/decisions.json).
//   1  NUDI-1: the Nudibranch, a new card (Sequestration + Immunity), inside the budget, on the Sunken Depths list (mj), named in 12 packs,
//      its art prompt in docs/art-style-prompts.md (a background, no banned words), the emoji placeholder (no art yet)
//   2  IDEA-VREGIA: Victoria Regia, the same (Bulldoze 1 + Thorns 1), on the Lilypad Reach list (mp)
//   3  IDEA-EARLY-2: a gimmick for each boss of Maps 0-5 and their side maps (BOSS_GIMMICKS), each one doing its thing in a scenario, on its
//      node only, its texts (name, rule, log line) in 12 packs, the Environment card / float / log hooks in the app; the before / after
//      measure on file, every changed fight in its band or closer to it than before
//   4  the proposals: docs/content11-2026-11-05.md and decisions CONTENT11-1..4 (YET, under 100 words); no existing card edited
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
const TXm = require(path.join(ROOT, 'bramblewood-texts.js')), TXT = TXm.TEXT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, o)=> Object.assign({id, name:id, attack:2, health:20, wait:9, cost:0, effects:{}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-a': U('x-a'), 'x-b': U('x-b', {attack:5}), 'x-c': U('x-c', {health:40}), 'x-hit': U('x-hit', {attack:2, wait:0, health:50}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, battleMode:'open', rules: rules || {}});
  return {e, P:{1: e.newPlayer(1, {}, null), 2: e.newPlayer(2, {}, null)}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const starts = (e, P, from, to)=>{ const ev = []; for(let r = from; r <= to; r++) e.roundStart(P, r, so, {}, ev); return ev.filter(x=> x.type === 'bossGimmick'); };
const BG = E.BOSS_GIMMICKS || {};
const app = R('arena_app.js'), eng = R('bramblewood-engine.js');

// ---- 1-2. the two new cards ------------------------------------------------------------------------------------------------------
const cards = J('canonical/cards.json'), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(J('canonical/skill-costs.json'));
const OBT = J('canonical/card-obtain-maps.json').maps, POOLS = J('canonical/map-pools.json').maps, REV = J('canonical/map-review.json').maps;
const NEW = [{id:'nudibranch', fx:['sequestration', 'immunity'], parent:'m7', sub:'mj'}, {id:'victoria-regia', fx:['bulldoze', 'thorns'], parent:'mb', sub:'mp'}];
const ids = new Set(); cards.forEach(c=> ids.add(c.numericId)); ok(ids.size === cards.length, 'cards: numericIds are unique');
const prompts = R('docs/art-style-prompts.md'), BANNED = ['no clothes', 'spiked', 'studded', 'monitor', 'sperm', 'corpse', 'sword', 'spear', 'axe', 'dagger', 'bow and arrow', 'weapon', 'blade'];
NEW.forEach(s=>{ const c = byId[s.id]; ok(!!c, `${s.id}: in cards.json`); if(!c) return;
  ok(s.fx.every(k=> c.effects && c.effects[k]) && Object.keys(c.effects).length === 2, `${s.id}: carries ${s.fx.join(' + ')} (two skills)`);
  ok(/^data:image\/png;base64,/.test(c.art || "") && !!c.icon, `${s.id}: has its ART9 card art and keeps its icon`); // 2026-11-05 (ART9): the art came in; was "the emoji placeholder"
  ok(c.source && c.source.kind === 'pack' && c.source.map === s.sub && !c.unattainable && !c.awaitingSource, `${s.id}: a pack card of its list, in play`);
  ok(cards.indexOf(c) >= cards.length - 3, `${s.id}: appended at the end`); // 2026-11-06 (ENG27): the Crimson Wing Drumcaller came after it
  const m = OBT[s.id]; ok(m > 0, `${s.id}: obtainable from Map ${m} (card-obtain-maps)`);
  const b = T.budget(Object.assign({}, c, {obtainMap: m}), {level:1}); ok(b.ok && b.x1 <= b.N, `${s.id}: inside the budget at Level 1, Map ${m} (${b.x1} / ${b.N})`);
  ok(POOLS[s.parent].submaps[s.sub].includes(s.id) && !POOLS[s.parent].cards.includes(s.id), `${s.id}: on the ${s.sub} list only`);
  ok(Object.keys(POOLS).filter(k=> JSON.stringify(POOLS[k]).includes('"' + s.id + '"')).length === 1, `${s.id}: on one map's lists`);
  ok((REV[s.sub].chosen || []).some(x=> x.id === s.id && x.by === 'claude' && /CONTENT11/.test(x.why)), `${s.id}: the Map cards window says why (CONTENT11)`);
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{
    ok(!!J(`lang/cards/${code}.json`)[c.name], `${s.id}: name in lang/cards/${code}`); ok(!!J(`lang/ui/${code}.json`)[c.flavor], `${s.id}: flavour in lang/ui/${code}`); });
  const sec = prompts.split(/\n### /).find(x=> x.startsWith(c.name)); ok(!!sec, `${s.id}: an art prompt in docs/art-style-prompts.md`);
  if(sec){ ok(/background/i.test(sec), `${s.id}: the prompt has a background`); BANNED.forEach(w=> ok(!sec.toLowerCase().includes(w), `${s.id}: the prompt avoids "${w}"`)); }
});

// ---- 3. boss gimmicks ------------------------------------------------------------------------------------------------------------
const NODES = {'0-4':'coldSnap', '1-5':'thistlePrick', '2-5':'shellUp', '3-7':'gannetDive', '4-5':'undertow', '5-7':'snapBack', '1-A-5':'hareNap', '2-A-7':'lodgeMend', '2-B-4':'inkCloud', '5-A-4':'rootGrip', '0-B-4':'crackingBark'};
ok(Object.keys(BG).length === 11, `3: eleven gimmicks (${Object.keys(BG).length})`);
Object.entries(NODES).forEach(([k, id])=>{ const line = app.split('\n').find(l=> l.trimStart().startsWith(`{ key:"${k}",`)) || '';
  ok(BG[id] && BG[id].node === k && line.includes(`"bossGimmick":"${id}"`), `3: ${k} has ${id}`);
  ['-name', '', '-log'].forEach(sfx=> ok(!!TXT['ui.c11-' + id + sfx], `3: text ui.c11-${id}${sfx}`)); });
ok((app.match(/"bossGimmick":"/g) || []).length === 11, '3: no other node has a gimmick');
const words = s=> String(s).replace(/\{\w+\}/g, 'N').trim().split(/\s+/).length;
Object.keys(BG).forEach(id=> ok(words(TXT['ui.c11-' + id]) <= 22, `3: ${id}'s rule is short (${words(TXT['ui.c11-' + id])} words)`));
{ const packs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].map(c=> J(`lang/${c}.json`));
  const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍]*/u, core = s=>{ const t = s.trim(); return t.slice((t.match(LEAD) || [''])[0].length).replace(/[\s:]+$/, ''); }; // the runtime's key (tests/i18n-templates-2026-10-18.js)
  Object.keys(TXT).filter(k=> /^ui\.c11-/.test(k)).forEach(k=> ok(packs.every(p=> p[core(TXT[k])]), `3: ${k} in the 12 packs`)); }
ok(/function bossGimmickVfx\(ev\)/.test(app) && /case 'bossGimmick':/.test(app) && /add\(bossGimmickRowKey\(id\)/.test(app) && /ev\.type === 'bossGimmick'\) return bossGimmickRowKey/.test(app), '3: the Environment card, the float and the log line are wired');
ok(/if\(rules\.bossGimmick && round > 1\) bossGimmickTick/.test(eng), '3: the engine ticks it at the round start');
// each gimmick in a scenario (the boss is side B)
{ const {e, P} = mk({}); put(e, P, 1, 'x-a', 0); ok(starts(e, P, 2, 6).length === 0, '3: no rule, no gimmick'); }
{ const {e, P} = mk({bossGimmick:'coldSnap'}); const a = put(e, P, 1, 'x-a', 0), a2 = put(e, P, 1, 'x-b', 1), b = put(e, P, 2, 'x-a', 0);
  ok(starts(e, P, 2, 2).length === 0, '3 coldSnap: nothing on round 2'); const g = starts(e, P, 3, 3);
  ok(g.length === 2 && a2.frozen === 1 && !a.frozen && b.frozen === 1, `3 coldSnap: round 3 freezes the newest unit on each side (${a.frozen}/${a2.frozen}/${b.frozen})`); }
{ const {e, P} = mk({bossGimmick:'thistlePrick'}); const a = put(e, P, 1, 'x-a', 0), c = put(e, P, 1, 'x-c', 1); starts(e, P, 2, 3);
  ok(c.hp === 39 && a.hp === 20, `3 thistlePrick: round 3 pricks the unit with the most Health for 1 (${c.hp}, ${a.hp})`); }
{ const {e, P} = mk({bossGimmick:'shellUp'}); put(e, P, 1, 'x-hit', 0); put(e, P, 1, 'x-hit', 2); P[2].hq.shield = 0;
  e.roundStart(P, 1, so, {}, []); const ev = []; e.resolveCombat(P, so, {}, ev, 1); const hits = P[2]._bgHits;
  const g = starts(e, P, 2, 2); ok(hits >= 2 && g.length === 1 && P[2].hq.shield === 3, `3 shellUp: two hits on the bramble (${hits}), then +3 Shield (${P[2].hq.shield})`);
  ok(starts(e, P, 3, 3).length === 0, '3 shellUp: no hits last round, no shell'); }
{ const {e, P} = mk({bossGimmick:'gannetDive'}); const l = put(e, P, 1, 'x-a', -2), m = put(e, P, 1, 'x-a', 0), r = put(e, P, 1, 'x-a', 2);
  starts(e, P, 2, 3); ok(l.hp === 17 && m.hp === 20 && r.hp === 20, `3 gannetDive: round 3 dives on the left end (${l.hp}/${m.hp}/${r.hp})`);
  starts(e, P, 4, 6); ok(r.hp === 17 && l.hp === 17, `3 gannetDive: round 6 on the right end (${r.hp})`); }
{ const {e, P} = mk({bossGimmick:'undertow'}); const a = put(e, P, 1, 'x-a', 0), b = put(e, P, 1, 'x-b', 1); starts(e, P, 2, 2);
  ok(b.stunned && !a.stunned, '3 undertow: round 2 stuns the unit with the most Attack'); }
{ const {e, P} = mk({bossGimmick:'snapBack'}); const h = put(e, P, 1, 'x-hit', 0); e.roundStart(P, 1, so, {}, []); e.resolveCombat(P, so, {}, [], 1);
  const hp0 = h.hp; starts(e, P, 2, 2); ok(P[2]._bgLastHitter == null && h.hp === hp0 - 6, `3 snapBack: the bramble bites the last unit that hit it for 6 (${hp0} -> ${h.hp})`); }
{ const {e, P} = mk({bossGimmick:'hareNap'}); const b1 = put(e, P, 2, 'x-a', 0), b2 = put(e, P, 2, 'x-b', 1), a = put(e, P, 1, 'x-a', 0); starts(e, P, 2, 4);
  ok(!b1.asleep, '3 hareNap: awake before round 5'); starts(e, P, 5, 5); ok(b1.asleep && b2.asleep && !a.asleep, '3 hareNap: round 5 her units nap, yours do not'); }
{ const {e, P} = mk({bossGimmick:'lodgeMend'}); const b1 = put(e, P, 2, 'x-a', 0), b2 = put(e, P, 2, 'x-c', 1); b1.hp = 15; b2.hp = 30; starts(e, P, 2, 2);
  ok(b2.hp === 34 && b1.hp === 15, `3 lodgeMend: round 2 heals her most hurt unit 4 (${b2.hp}, ${b1.hp})`); }
{ const {e, P} = mk({bossGimmick:'inkCloud'}); put(e, P, 1, 'x-a', 0); put(e, P, 1, 'x-a', 1); put(e, P, 2, 'x-a', 0); put(e, P, 2, 'x-a', 1); const g = starts(e, P, 2, 3);
  ok(g.length === 2 && all(P[1]).filter(c=> c.blind).length === 1 && all(P[2]).filter(c=> c.blind).length === 1, '3 inkCloud: round 3 blinds one unit on each side'); }
{ const {e, P} = mk({bossGimmick:'rootGrip'}); const a = put(e, P, 1, 'x-a', 0), c = put(e, P, 1, 'x-c', 1), b = put(e, P, 2, 'x-c', 0); starts(e, P, 2, 4);
  ok(c.tangled && !a.tangled && b.tangled, '3 rootGrip: round 4 tangles the unit with the most Health on each side'); }
{ const {e, P} = mk({bossGimmick:'crackingBark'}); P[2].hq.shield = 60; starts(e, P, 2, 3); ok(P[2].hq.shield === 30, `3 crackingBark: round 3 halves the Shield (${P[2].hq.shield})`); }
{ const {e, P} = mk({bossGimmick:'undertow', bossSide:'A'}); const a = put(e, P, 2, 'x-b', 0); starts(e, P, 2, 2); ok(a.stunned, '3: bossSide A turns it round (tests)'); }
// the measure: before / after with the Map reference deck (tools/skirmish_pass.js measure 300)
{ const rows = f=> Object.fromEntries(R(f).trim().split('\n').map(l=> JSON.parse(l)).map(r=> [r.key, r]));
  const B = rows('docs/balance/skirmish-pass-content11-before.jsonl'), A = rows('docs/balance/skirmish-pass-content11-after.jsonl');
  Object.keys(NODES).forEach(k=>{ const b = B[k], a = A[k]; ok(b && a && a.games >= 300, `3: ${k} measured before and after (300 games)`); if(!b || !a) return;
    const dist = r=> r.win < r.lo ? r.lo - r.win : r.win > r.hi ? r.win - r.hi : 0;
    ok(dist(a) === 0 || dist(a) < dist(b), `3: ${k} in its band or closer (${b.win}% -> ${a.win}%, band ${a.lo}-${a.hi})`); }); }

// ---- 4. proposals ----------------------------------------------------------------------------------------------------------------
ok(fs.existsSync(path.join(ROOT, 'docs', 'content11-2026-11-05.md')), '4: docs/content11-2026-11-05.md');
{ const D = J('docs/decisions.json').items, mine = D.filter(d=> /^CONTENT11-\d$/.test(d.id));
  ok(mine.length === 4, `4: four decisions CONTENT11-1..4 (${mine.length})`);
  mine.forEach(d=>{ ok(['YET', 'DONE'].includes(d.status) /* 2026-11-05 22:20: the owner left these to Claude, now DONE */ && d.body.split(/\s+/).length < 100 && (d.options || []).length >= 2, `4: ${d.id} is a YET call under 100 words`); ok(/content11-2026-11-05\.md/.test(d.body), `4: ${d.id} points at the detail doc`); }); }

console.log(`content11: ${n - fail}/${n} passed${fail ? ', ' + fail + ' failure(s)' : ''}`);
process.exit(fail ? 1 : 0);
