#!/usr/bin/env node
// 2026-11-07 (package ENG35, owner 20:58: "Fuse skills together. For example, Almanac number and grant are the same. In the game too, fuse
// them. It's just a matter of parameter choice"; 21:13: "Hovering over the skill 'cards' on the map cards window shows a tooltip window of
// what that skill does. Include what params it can take ... simplify the skill 'card': just leave 1 line of emoji and title."):
//   A1 every old twin key maps to a fused key (alias map), and the params file covers every family
//   A2 canonical/cards.json has no twin key left; the JS and Python expanders agree on every card; fuse is idempotent
//   A3 the pre-fold effects (tests/golden/eng35-pre-fold-effects.json) round-trip exactly, price the same, and fixed-seed fights with the
//      old flat cards and the fused cards are identical (boards and full matches)
//   A4 delivery / costs files use the fused keys (aliases resolve); the card-data hash is the same for flat and fused cards
//   B  the Map cards window's tiles are one line with the hover-window attributes; the window shows default / number / stat / ability /
//      parameters / delivery (Crepuscular, the owner's example); CSS; texts in 12 languages; docs
'use strict';
const H = require('./lib/harness.js');
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
const SPL = require('../bramblewood-skillparams.js');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const eq = (a, b)=> JSON.stringify(a) === JSON.stringify(b);
const sortK = o=> o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o).sort().reduce((m, k)=> (m[k] = sortK(o[k]), m), {}) : Array.isArray(o) ? o.map(sortK) : o;
const deq = (a, b)=> eq(sortK(a), sortK(b));

// ---- A1
const P = J('canonical/skill-params.json'), FAM = P.families;
const app = rd('arena_app.js'), BB = require('../bramblewood-budget.js');
const twinApp = Object.keys(Function('return ' + app.match(/const ZEIT_TWIN_BACK = (\{[^\n]*\});\s*\n/)[1].replace(/\/\*[^*]*\*\//g, ''))());
const twinBudget = BB.PARAMS.filter(k=> k !== 'weakness').concat(Object.keys(BB.CONTEXT).filter(k=> /Grant$/.test(k)), Object.values(BB.CONTEXT_FLAG));
const twinEngine = []; { const m = rd('bramblewood-engine.js').match(/const IRR_COMPANION = (\{[^\n]*\});\s*\n/); Object.values(Function('return ' + m[1].replace(/\/\*[^*]*\*\//g, ''))()).forEach(a=> twinEngine.push(...a)); }
const twins = [...new Set(twinApp.concat(twinBudget, twinEngine))];
ok(twins.length >= 60, 'found the old twin keys (' + twins.length + ')');
const unmapped = twins.filter(k=> !SPL.aliasOf(k));
ok(!unmapped.length, 'every old twin key maps to a fused key (' + unmapped.join(', ') + ')');
ok(SPL.aliasOf('almanacGrant')[0] === 'almanac' && SPL.aliasOf('kinglyGrant')[0] === 'king' && SPL.aliasOf('deliveryRes')[0] === 'delivery' && SPL.aliasOf('nocturnalHp').join() === 'nocturnal,hp', 'aliases: almanacGrant -> almanac, kinglyGrant -> king, deliveryRes -> delivery, nocturnalHp -> nocturnal.hp');
const famBad = Object.keys(FAM).filter(k=> { const f = FAM[k]; return !f.params || (!Object.keys(f.params).length && f.number == null) || !f.default || !f.about || !('stat' in f) || !('ability' in f) || !('number' in f) || Object.keys(f.params).some(x=> !P.fields[x]); });
ok(!famBad.length, 'every family has params, default, number, stat, ability, about, and every parameter name is described (' + famBad.join(', ') + ')');
ok(Object.keys(Function('return ' + app.match(/const ZEIT_TWIN = (\{[^\n]*\});\s*\n/)[1].replace(/\/\*[^*]*\*\//g, ''))()).every(k=> FAM[k]), 'every editor twin (ZEIT_TWIN) is a family');
ok(FAM.crepuscular && FAM.crepuscular.stat && FAM.crepuscular.ability && FAM.crepuscular.default && FAM.almanac.number === 4, 'Crepuscular has default, stat and ability versions; Almanac N defaults to 4');

// ---- A2
const cards = J('canonical/cards.json'), twinSet = new Set(Object.values(FAM).flatMap(f=> Object.values(f.params)));
const left = cards.filter(c=> Object.keys(c.effects || {}).some(k=> twinSet.has(k)) || Object.values(c.levelSkills || {}).some(o=> Object.keys(o || {}).some(k=> twinSet.has(k)))).map(c=> c.id);
ok(!left.length, 'cards.json has no twin key left (' + left.join(', ') + '; run python3 tools/fold_skill_params_2026_11_07.py)');
const fusedCards = cards.filter(c=> Object.keys(c.effects || {}).some(k=> SPL.isFused(k, c.effects[k])));
ok(fusedCards.length >= 25, 'cards.json carries fused skills (' + fusedCards.length + ' cards)');
ok(cards.every(c=> eq(SPL.fuseDef(c), c)), 'fuse is idempotent on cards.json (the fold tool would change nothing)');
ok(cards.every(c=> deq(SPL.expandDef(SPL.fuseDef(SPL.expandDef(c))), SPL.expandDef(c))), 'expand(fuse(expand(card))) = expand(card)');
{ const r = cp.spawnSync('python3', ['-c', 'import json,sys; sys.path.insert(0, "tools"); import skill_params as SP; print(json.dumps([SP.expand_def(c).get("effects", {}) for c in json.load(open("canonical/cards.json"))]))'], {cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28});
  const py = r.status === 0 ? JSON.parse(r.stdout) : null;
  ok(py && py.length === cards.length && cards.every((c, i)=> eq(SPL.expandDef(c).effects || {}, py[i])), 'the Python expander (tools/skill_params.py, the build) and the JS one agree on every card, key order included'); }
{ const r = cp.spawnSync('python3', ['tools/fold_skill_params_2026_11_07.py', '--check'], {cwd: ROOT, encoding: 'utf8'});
  ok(r.status === 0, 'the fold tool reports nothing left to fold (' + (r.stdout || r.stderr).trim() + ')'); }
// a cloud override merged after the object wins (a flat key later in the effects)
ok(eq(SPL.expand({nocturnal: {v: 1, hp: 1}, nocturnalHp: 3}), {nocturnal: 1, nocturnalHp: 3}) && eq(SPL.expand({esprit: {v: null, hp: 1}}), {espritHp: 1}) && eq(SPL.expand({tide: {gives: {ebb: {armor: 2}}}}), {tide: true, tideGrant: {ebb: {armor: 2}}}), 'expand: a later flat key wins; v null = no base value; no v = true');

// ---- A3: the pre-fold effects
const PRE = J('tests/golden/eng35-pre-fold-effects.json').effects, preIds = Object.keys(PRE);
ok(preIds.length === 28, 'the snapshot holds the 28 cards the fold changed');
ok(preIds.every(id=> deq(SPL.expand(SPL.fuse(PRE[id])), PRE[id])), 'every pre-fold card round-trips exactly (values)');
ok(preIds.every(id=> !Object.keys(SPL.fuse(PRE[id])).some(k=> twinSet.has(k))), 'every pre-fold card fuses to no twin key');
// prices: the same S and budget result for the flat and the fused form
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), byId = {}; cards.forEach(c=> byId[c.id] = c);
  const diff = preIds.filter(id=> { const c = byId[id]; if(!c) return false; const a = T.budget(Object.assign({}, c, {effects: PRE[id]})), b = T.budget(Object.assign({}, c, {effects: SPL.fuse(PRE[id])}));
    return a.S !== b.S || a.N !== b.N || a.x1 !== b.x1 || a.x2 !== b.x2 || a.ok !== b.ok; });
  ok(!diff.length, 'the budget prices every card the same flat or fused (S, N, both caps) (' + diff.join(', ') + ')');
  ok(preIds.every(id=> BB.skillCountOf(PRE[id]) === BB.skillCountOf(SPL.fuse(PRE[id])) && BB.nMultOf(PRE[id], {}) === BB.nMultOf(SPL.fuse(PRE[id]), {})), 'skill count and N multiplier the same flat or fused'); }
// fights: the old flat cards against the fused cards, the same seeds
const base = H.loadCardDefs();
function defsWith(fx){ const d = Object.assign({}, base); preIds.forEach(id=>{ if(d[id]) d[id] = Object.assign({}, d[id], {effects: JSON.parse(JSON.stringify(fx(id)))}); }); return d; }
const flat = id=> PRE[id], fused = id=> SPL.fuse(PRE[id]);
const opp = H.fieldableIds(base).filter((id, i)=> i % 37 === 0).slice(0, 14);
let boards = 0, boardDiff = [];
preIds.filter(id=> base[id]).forEach(id=> opp.forEach((o, j)=> [1, 2].forEach(seed=>{
  const spec = s=> ({seed: seed * 1000 + j, rounds: 14, A: [{id}, {id: o}], B: [{id: opp[(j + 3) % opp.length]}, {id}], defs: defsWith(s)});
  const a = H.fightSignature(H.runBoard(spec(flat))), b = H.fightSignature(H.runBoard(spec(fused))); boards++;
  if(!eq(a, b)) boardDiff.push(id + ' vs ' + o + ' seed ' + seed);
})));
ok(boards >= 600 && !boardDiff.length, `fixed-seed board fights identical, old flat vs fused (${boards} fights; ${boardDiff.slice(0, 4).join('; ')})`);
let matches = 0, matchDiff = [];
const fillers = H.fieldableIds(base).filter((id, i)=> i % 53 === 5).slice(0, 8);
preIds.filter(id=> base[id] && !base[id].token).forEach((id, i)=>{ for(let seed = 1; seed <= 3; seed++){
  const deckA = {[id]: 3}; fillers.slice(0, 4).forEach(f=> deckA[f] = (deckA[f] || 0) + 2); const deckB = {[preIds[(i + 5) % preIds.length]]: 3}; fillers.slice(4).forEach(f=> deckB[f] = (deckB[f] || 0) + 2);
  const run = s=> H.runMatch(deckA, deckB, {seed: 7000 + i * 10 + seed, defs: defsWith(s), recordEvents: true});
  const a = run(flat), b = run(fused); matches++;
  const sig = r=> JSON.stringify([r.winner, r.rounds, r.events && r.events.length, H.hashStr(JSON.stringify((r.events || []).map(e=> [e.type, e.dmg, e.amount, e.targetUid, e.uid])))]);
  if(sig(a) !== sig(b)) matchDiff.push(id + ' seed ' + seed);
} });
ok(matches >= 75 && !matchDiff.length, `fixed-seed full matches identical, old flat vs fused (${matches} matches; ${matchDiff.slice(0, 4).join('; ')})`);
console.log(`  eng35 proof: ${boards} board fights and ${matches} full matches, old flat cards vs fused, ${boardDiff.length + matchDiff.length} differ`);
// the engine reads cards.json as stored (fused) the same as the flat defs
{ const raw = {}; cards.filter(c=> !c.pool).forEach(c=>{ const d = Object.assign({effects: {}}, c); delete d.art; raw[c.id] = d; });
  const flatDefs = {}; Object.keys(raw).forEach(id=> flatDefs[id] = SPL.expandDef(raw[id]));
  const ids = fusedCards.map(c=> c.id).filter(id=> raw[id]).slice(0, 10), diff = [];
  ids.forEach((id, j)=>{ const spec = d=> ({seed: 500 + j, rounds: 12, A: [{id}], B: [{id: opp[j % opp.length]}], defs: Object.assign({}, d)});
    if(!eq(H.fightSignature(H.runBoard(spec(raw))), H.fightSignature(H.runBoard(spec(flatDefs))))) diff.push(id); });
  ok(!diff.length, 'makeSimEngine expands fused cards.json defs itself (' + diff.join(', ') + ')'); }

// ---- A4
const D = J('canonical/skill-delivery.json'), E = H.Engine;
ok(!Object.keys(D.delivery).some(k=> twinSet.has(k)), 'skill-delivery.json lists fused keys only');
ok(twins.every(k=> E.skillDeliveryOf(k) === E.skillDeliveryOf(SPL.aliasOf(k)[0])), 'a part is delivered as its skill (arrowPoison ranged, almanacGrant none ...)') ;
ok(E.skillDeliveryOf('arrowPoison') === 'ranged' && E.skillDeliveryOf('nocturnalGrant') === 'none', 'arrowPoison is ranged, nocturnalGrant none');
{ const C = J('canonical/skill-costs.json'), parts = (C.skills || []).filter(s=> SPL.aliasOf(s.id));
  ok(parts.length >= 25 && parts.every(s=> s.paramOf === SPL.aliasOf(s.id).join('.')), 'skill-costs.json marks each part entry paramOf family.parameter (' + parts.length + ')'); }
{ const I = require('../bramblewood-integrity.js'), flatList = cards.map(c=> SPL.expandDef(c));
  ok(I.cardDataHash(cards) === I.cardDataHash(flatList), 'the card-data hash is the same for cards.json (fused) and the flat cards the page gets'); }
ok(/_sp35\.expand_def\(c\) for c in canonical/.test(rd('assemble_arena.py')) && /var __SKILL_PARAMS__ = /.test(rd('assemble_arena.py')), 'the build expands the cards for the page and puts the params file ahead of the engine');
{ const html = fs.existsSync(path.join(ROOT, 'index.html')) ? rd('index.html') : '';
  ok(/BramblewoodSkillParams = factory/.test(html) && /var __SKILL_PARAMS__ = \{/.test(html), 'index.html carries the params file and the helper');
  ok(!/"effects": \{[^}]*"nocturnal": \{"v"/.test(html), 'index.html card data is flat (no fused object reaches the page)'); }

// ---- B: the Map cards window
const grab = (name)=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}'){ d--; if(!d) return app.slice(i, k + 1); } } return ''; };
const tipSrc = app.slice(app.indexOf('// ENG35_TIP:START'), app.indexOf('// ENG35_TIP:END'));
ok(tipSrc.length > 2000, 'the ENG35 tooltip block is in arena_app.js');
const S = {crepuscular: {key: 'crepuscular', label: 'Crepuscular', kind: 'twoNumber', desc: ()=> 'By day +1/+0, at night +0/+1.'}, crepuscularGrant: {key: 'crepuscularGrant', label: 'Crepuscular {day}{night}', kind: 'grant2', desc: ()=> 'braced'}, evasive: {key: 'evasive', label: 'Evasive'}, regen: {key: 'regen', label: 'Regeneration'}, flying: {key: 'flying', label: 'Flying', kind: 'boolean', desc: ()=> 'Flies.'}, arrow: {key: 'arrow', label: 'Arrow', kind: 'number', desc: v=> 'Shoots ' + v + '.'}};
const ctx = {BramblewoodSkillParams: SPL, skillDeliveryOf: E.skillDeliveryOf, skillDefOf: k=> S[k] || null, skillText: (p, v)=> p.desc(v), SKILL_ICON: {crepuscular: '🌗', flying: '🪽'}, escapeHtml: s=> String(s).replace(/</g, '&lt;'), escapeAttr: s=> String(s).replace(/"/g, '&quot;'), TX: k=> '[' + k + ']', document: undefined};
vm.createContext(ctx); vm.runInContext(tipSrc.replace(/^let eng35TipEl/m, 'var eng35TipEl') + '\nthis.api = {eng35SkillTipHTML, eng35TileAttrs, eng35FusedKey, eng35GivesKeyOf, eng35ShapeText};', ctx);
const A = ctx.api, crep = A.eng35SkillTipHTML('crepuscular', 'By day +1/+0, at night +0/+1.', '2 of 9 cards');
ok(/\[ui\.eng35-default\][\s\S]*\+0\/\+1 at night \(a bare flag/.test(crep) && /\[ui\.eng35-stat\][\s\S]*crepuscular: day \[1, 0\] · night \[0, 2\]/.test(crep) && /\[ui\.eng35-ability\][\s\S]*gives day \{Evasive\} · night \{Regeneration 2\}/.test(crep), 'Crepuscular\'s window: default, stat version and ability version (the owner\'s example)');
ok(/\[ui\.eng35-params\][\s\S]*v: the plain value · hp: [^<]* · day: [^<]* · night: [^<]* · gives:/.test(crep) && /\[ui\.eng35-delivery\]<\/dt><dd>\[ui\.eng35-dl-none\]/.test(crep) && /2 of 9 cards/.test(crep), 'its parameters, its delivery (none) and the tile\'s context');
const fly = A.eng35SkillTipHTML('flying', 'Flies.', ''), arr = A.eng35SkillTipHTML('arrow', 'Shoots 1.', '');
ok(/\[ui\.eng35-one-value\]/.test(fly) && !/\[ui\.eng35-stat\]/.test(fly) && /\[ui\.eng35-dl-ranged\]/.test(arr) && /bramble: /.test(arr), 'a plain skill: one value; Arrow is ranged and has its parts');
ok(A.eng35FusedKey('diurnalGrant') === 'diurnal' && A.eng35GivesKeyOf('king') === 'kinglyGrant' && A.eng35ShapeText({v: 2, hp: 1}) === 'v 2 · hp 1', 'helpers: fused key, braces key, shape text');
ok(/data-eng35-key="flying"/.test(A.eng35TileAttrs('flying', 'Flying', 'Flies.', '1 of 2 cards')) && /tabindex="0"/.test(A.eng35TileAttrs('flying', 'Flying', 'x', '')) && /aria-label="Flying: Flies\. \(1 of 2 cards\)"/.test(A.eng35TileAttrs('flying', 'Flying', 'Flies.', '1 of 2 cards')), 'tile attributes: key, focusable, a screen-reader line');
// a tile is one line: icon, name, pills, no <small> text, the hover window's attributes
{ const mc = ['ui19McSkillRows', 'ui19McEarlierSkillKeys', 'ui19McSkillText', 'ui19McSkillsHTML'].map(grab).join('\n');
  const defs = {a: {id: 'a', effects: {crepuscular: 1, crepuscularHp: 1, flying: true}}, b: {id: 'b', effects: {flying: true}}};
  const c5 = Object.assign({}, ctx, {ui18CardSkillKeys: d=> { const out = [], seen = new Set(); Object.keys(d.effects).forEach(k=>{ const f = SPL.fusedKey(k); if(!seen.has(f)){ seen.add(f); out.push({key: f, lvl: 0}); } }); return out; },
    mapNumberOf: id=> ({m0: 0, m1: 1})[id], mainConquestMaps: ()=> [{id: 'm0'}, {id: 'm1'}], mapPoolSections: ()=> [], TX: (k, v)=> k === 'ui.ui19-mc-count' ? `${v.n} of ${v.total} cards` : k === 'ui.ui19-mc-new' ? 'NEW!' : k});
  vm.createContext(c5); vm.runInContext(tipSrc.replace(/^let eng35TipEl/m, 'var eng35TipEl') + mc + '\nthis.api = {ui19McSkillsHTML};', c5);
  const html = c5.api.ui19McSkillsHTML('m1', ['a', 'b'], defs, ()=> true);
  const tiles = html.match(/<li class="ui19-sk[^"]*"[\s\S]*?<\/li>/g) || [];
  ok(tiles.length === 2, 'one tile per fused skill (Crepuscular and its Health part are one tile) (' + tiles.length + ')');
  ok(tiles.every(t=> !/<small>/.test(t) && /data-eng35-key="/.test(t) && !/ title="/.test(t.replace(/<i [^>]*>/g, ''))), 'each tile is one line (no text line, no title): the hover window carries the text');
  ok(/data-eng35-ctx="2 of 2 cards"/.test(html), 'the tile keeps its card count for the window'); }
ok(/function eng35TipShow/.test(tipSrc) && /addEventListener\('mouseover'/.test(tipSrc) && /addEventListener\('focusin'/.test(tipSrc) && /role', 'tooltip'/.test(tipSrc), 'one hover / focus window (role tooltip)');
ok(/\$\{tipA\(r\.key, r\.p\.label/.test(grab('ui19McSkillsHTML')) && /eng35TileAttrs\(key, p\.label, text, ctx\)/.test(grab('ui30SuggTilesHTML')), 'skill, recommendation, intro and Sugg. Intro tiles all use it');
const tpl = rd('arena_template.html');
ok(/\.eng35-sk-tip\{position:fixed;/.test(tpl) && /\.ui19-sk\[data-eng35-key\] \.ui19-sk-main\{white-space:nowrap;/.test(tpl), 'CSS: the window and the one-line tile');
ok(/eng35FusedKey\(k0\)/.test(grab('ui18CardSkillKeys')) && /eng35ExpandDef\(liveCards\[id\]\)/.test(app), 'the skill lists count a part as its skill; cloud edits with fused skills are read');
// texts
const {TEXT} = require('../bramblewood-texts.js');
const keys = ['default', 'number', 'stat', 'ability', 'params', 'one-value', 'none', 'delivery', 'dl-melee', 'dl-ranged', 'dl-none', 'leech-n', 'leech-n-short', 'leech-blank'].map(k=> 'ui.eng35-' + k);
ok(keys.every(k=> TEXT[k]), 'the 14 TX keys exist');
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const pack = J('lang/' + code + '.json'); ok(keys.every(k=> pack[TEXT[k]] !== undefined), code + ' has every row'); }
// ---- owner 23:26: "Just Fire Arrow and Fire Bolt is enough": the nine shot riders are parameters, not skills in the lists
{ const tail = app.slice(app.indexOf('const ENG35_RIDER_KEYS'));
  ok(/ENG35_RIDER_KEYS = new Set\(Object\.keys\(EN6_BRAMBLE_APP\)\.concat\(Object\.keys\(EN7_TIP_APP\)\)\)/.test(tail) && /d\.hidden = true; d\.eng35Rider = true; d\.get = \(\)=> undefined;/.test(tail), 'the nine riders are hidden from "+ Add Skill", have no editor row (get undefined)');
  ok(/!p\.eng35Rider/.test(grab('skillBookEntriesNow')), 'the Codex skill list leaves them out');
  const riders = ['arrow', 'fireArrow', 'fireBolt'].flatMap(b=> ['Bramble', 'Poison', 'Bleed'].map(x=> b + x));
  ok(riders.every(k=> SPL.aliasOf(k) && ['arrow', 'fireArrow', 'fireBolt'].includes(SPL.aliasOf(k)[0])), 'each rider is a parameter of its shot in the params file');
  const users = cards.filter(c=> { const e = SPL.expandDef(c).effects || {}; return riders.some(k=> e[k]); }).map(c=> c.id);
  ok(users.join() === 'balloon-archer', 'one card uses a rider today: Balloon Archer (' + users.join(', ') + ')');
  const F = J('docs/decisions.json').items.find(x=> x.id === 'ENG35-4'); ok(F && /Balloon Archer/.test(F.body), 'decision ENG35-4 asks about it'); }
// ---- owner 23:30: Leech N
{ const fam = FAM.sap; ok(fam && fam.number && /damage dealt/.test(fam.number), 'Leech is in the params file: blank = the damage dealt, N = heal N');
  const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json'));
  ok(T.skillCost('sap', true) === 2.3 && T.skillCost('sap', 2) === 2.3 && T.skillCost('sap', 3) === 3.45, 'price: plain 2.3 unchanged, Leech N 1.15 x N');
  const run = sap=>{ const d = Object.assign({}, base); d['vampire-bat'] = Object.assign({}, base['vampire-bat'], {effects: Object.assign({}, base['vampire-bat'].effects, {sap})});
    const r = H.runBoard({seed: 4242, rounds: 5, A: [{id: 'vampire-bat', hp: 30}], B: [{id: 'garden-snail', hp: 60, attack: 4}], defs: d}); return r.events.filter(e=> e.type === 'sap').map(e=> e.amount); };
  const plain = run(true), three = run(3), one = run(1);
  ok(plain.length && three.length && three.every(x=> x === 3) && one.every(x=> x === 1) && plain.some(x=> x !== 3), `Leech heals the damage dealt (${plain}), Leech 3 heals 3 a hit (${three}), Leech 1 heals 1 (${one})`);
  ok(/sapHealOf\(e, dmg\)/.test(rd('bramblewood-engine.js')) && (rd('bramblewood-engine.js').match(/sapHealOf\(/g) || []).length === 6, 'every Leech heal reads sapHealOf (the swing, Cleave, flank, the bramble, the skill hits)');
  const tail = app.slice(app.indexOf("SKILL_TEXT.sap = (v, n, e)"));
  ok(/kind: 'number', blankOk: true, defaultValue: true/.test(tail) && /e\.sap = x > 0 \? x : true/.test(tail) && /s\.kind==='number' && s\.blankOk/.test(app), 'editor: an optional number field, blank saves the plain Leech');
  ok(cards.filter(c=> (c.effects || {}).sap !== undefined).every(c=> c.effects.sap === true), 'existing Leech cards unchanged (plain)'); }
// workbook, docs
const wb = rd('tools/export_workbook_2026_11_07.py');
ok(/Parameters \(default, stat version, ability version\)/.test(wb) && /if s\['key'\] in alias: continue/.test(wb), 'the workbook\'s Skills tab: one row per fused skill, a Parameters column');
ok(/skill-params\.json/.test(rd('docs/effects-catalogue.md')) && /skill-params\.json/.test(rd('docs/project-state.md')), 'effects-catalogue.md and project-state.md name the params file');
ok(/^## 2026-11-07[^\n]*ENG35/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/eng35-2026-11-07\.js/.test(rd('tests/run-all.sh')), 'in run-all.sh');
console.log(`eng35: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
