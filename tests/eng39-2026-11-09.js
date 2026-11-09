#!/usr/bin/env node
// 2026-11-09 (package ENG39, owner decision DES2-3 a, 22:53: "Merge all 15 groups as parameters (ENG35) and rename Exploit to Vulnerable";
// docs/design/skill-plan-maps-0-20-2026-11-08.md section 3):
//   A  canonical/skill-params.json lists each duplicate group's old skills as KINDS of one family (old key -> family + selector + value);
//      expand / fuse in JS and Python agree; old keys still read
//   B  canonical/cards.json carries the fused keys (no kind left), the fold tool has nothing left, fuse is idempotent
//   C  the 30 folded cards (tests/golden/eng39-pre-fold-effects.json) round-trip exactly, price the same on every card, and fixed-seed
//      board fights and full matches are identical old keys vs fused keys
//   D  delivery, costs, budget, counters read the fused keys (kinds delivered as their family, costs marked kindOf)
//   E  Exploit's tokens read Vulnerable; the SK3 action reads Shock; 12 language packs
//   F  the card editor's Version field; Swift out of "+ Add Skill"; docs, CHANGELOG, run-all, decision ENG39-1
//   G  owner 23:05 (scope addition): ENG35-2 Delivery + Delivery every round and Arrow + Fire Arrow + the Bolts fused (one shot family:
//      type + form), Evolute / Supreme left apart; ENG35-4 the bramble rider beside the type, shown in the editor (a Bramble box);
//      ENG35-3 b would change Sunthroat Courier's price, so it is not done (decision ENG39-3)
'use strict';
const H = require('./lib/harness.js');
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
const SPL = require('../bramblewood-skillparams.js');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const eq = (a, b)=> JSON.stringify(a) === JSON.stringify(b);

// ---- A: the groups (old key -> [family, selector, value])
const W1 = (f, p, v)=> [f, {[p]: v}];
const WANT = {
  iceArrow: W1('arrow', 'type', 'ice'), fireArrow: W1('arrow', 'type', 'fire'), archer: W1('arrow', 'swings', 'never'),
  fireBolt: ['arrow', {type: 'fire', form: 'bolt'}], iceBolt: ['arrow', {type: 'ice', form: 'bolt'}], acidBolt: ['arrow', {type: 'acid', form: 'bolt'}],
  poisonBolt: ['arrow', {type: 'poison', form: 'bolt'}], shockBolt: ['arrow', {type: 'shock', form: 'bolt'}],
  darksight: W1('keenSense', 'sees', 'dark'), blitz: W1('speed', 'kind', 'blitz'), swift: W1('speed', 'kind', 'swift'),
  stockpile: W1('delivery', 'kind', 'stockpile'), pearl: W1('delivery', 'kind', 'pearl'), deliveryEvery: W1('delivery', 'every', 'round'),
  weaken: W1('daunt', 'lasts', 'lasting'), stench: W1('daunt', 'lasts', 'washed'), constrict: W1('strangle', 'hold', 'full'), tangle: W1('strangle', 'hold', 'bind'),
  scar: W1('exploit', 'lasts', 'lasting'), nursing: W1('healing', 'who', 'weakest'), bloom: W1('healing', 'who', 'random'), berserk: W1('harbinger', 'who', 'ally'),
  doubleTime: W1('twinStrike', 'shots', true), breach: W1('puncture', 'kind', 'breach'), spoils: W1('momentum', 'stat', 'hp'),
  midas: W1('felling', 'kind', 'midas'), prospector: W1('felling', 'res', 'metal'), timber: W1('hoard', 'kind', 'timber'),
  requiem: W1('carnage', 'who', 'any'), dirge: W1('carnage', 'who', 'yours'), tally: W1('carnage', 'who', 'foes'),
  muster: W1('throng', 'who', 'yours'), beset: W1('throng', 'who', 'theirs'), sociable: W1('formation', 'range', 2),
};
const P = J('canonical/skill-params.json'), FAM = P.families;
const badKinds = Object.keys(WANT).filter(k=> !eq(SPL.kindOf(k), WANT[k]));
ok(!badKinds.length, `every merged skill is a kind of its family (${Object.keys(WANT).length}; ${badKinds.map(k=> k + '=' + JSON.stringify(SPL.kindOf(k))).join(', ')})`);
ok(Object.keys(SPL.KIND).length === Object.keys(WANT).length, `no other kinds (${Object.keys(SPL.KIND).length})`);
const groups = new Set(Object.values(WANT).map(w=> w[0]));
ok(groups.size === 17, '17 families hold kinds (the 15 groups, the shots fused into Arrow, Delivery every round into Delivery)');
ok(!FAM.iceBolt && !FAM.evolute && !FAM.supreme && !SPL.kindOf('evoluteAlpha') && !SPL.kindOf('evoluteOmega') && !SPL.kindOf('supremeTide'), 'Evolute / Alpha / Omega and Supreme / Supreme Tide stay apart (owner 23:05)');
ok(Object.keys(FAM).every(k=> { const sels = Object.keys(FAM[k].kinds || {}).concat(...(FAM[k].kindSets || []).map(e=> Object.keys(e.match))); return sels.every(s=> !(s in (FAM[k].params || {})) && P.fields[s]); }), 'no selector shares a name with a parameter; every selector is described in fields');
ok(eq(SPL.fuse({fireBolt: 2, fireBoltBramble: true}), {arrow: {v: 2, type: 'fire', form: 'bolt', bramble: true}}) && eq(SPL.expand({arrow: {v: 2, type: 'fire', form: 'bolt', bramble: true}}), {fireBolt: 2, fireBoltBramble: true}), 'Fire Bolt 2 – bramble <-> arrow {v 2, type fire, form bolt, bramble}: the bramble part sits beside the type (ENG35-4)');
ok(eq(SPL.fuse({deliveryEvery: 1, deliveryRes: 'metal'}), {delivery: {v: 1, every: 'round', res: 'metal'}}) && eq(SPL.expand({delivery: {v: 1, every: 'round', res: 'metal'}}), {deliveryEvery: 1, deliveryRes: 'metal'}), 'Delivery every round {metal} <-> delivery {v 1, every round, res metal} (ENG35-2)');
ok(SPL.expand({arrow: {v: 2, form: 'bolt'}}).arrow !== undefined && !('form' in SPL.expand({arrow: {v: 2, type: 'fire'}})), 'a form with no kind (a plain-arrow bolt) is not a kind: left alone');
ok(Object.keys(SPL.KIND).every(k=> !SPL.aliasOf(k)), 'a kind is no other family\'s part');
ok(SPL.rootOf('requiemGrant') === 'carnage' && SPL.rootOf('archerStyle') === 'arrow' && SPL.rootOf('weaken') === 'daunt' && SPL.rootOf('flying') === 'flying' && SPL.fusedKey('weaken') === 'weaken', 'rootOf: a part, a kind, a plain skill (fusedKey keeps ENG35\'s parts-only meaning)');
// shapes
ok(eq(SPL.fuse({weaken: 1}), {daunt: {v: 1, lasts: 'lasting'}}) && eq(SPL.expand({daunt: {v: 1, lasts: 'lasting'}}), {weaken: 1}), 'weaken 1 <-> daunt {v 1, lasts lasting}');
ok(eq(SPL.fuse({requiem: 5, requiemGrant: {attack: 1}}), {carnage: {v: 5, who: 'any', gives: {attack: 1}}}) && eq(SPL.expand({carnage: {v: 5, who: 'any', gives: {attack: 1}}}), {requiem: 5, requiemGrant: {attack: 1}}), 'a kind that is a family keeps its parts (Requiem\'s braces)');
ok(eq(SPL.fuse({archer: 3, archerStyle: 'drop'}), {arrow: {v: 3, swings: 'never', style: 'drop'}}) && eq(SPL.fuse({doubleTime: true}), {twinStrike: {shots: true}}) && eq(SPL.fuse({sociable: [1, 1]}), {formation: {v: [1, 1], range: 2}}), 'Archer, Double Time (true), Sociable (a list)');
ok(eq(SPL.fuse({daunt: 2, weaken: 1}), {daunt: 2, weaken: 1}) && eq(SPL.fuse({weaken: 1, stench: 2}), {daunt: {v: 1, lasts: 'lasting'}, stench: 2}), 'two versions of one family: the second keeps its old key');
ok(eq(SPL.expand({weaken: 1}), {weaken: 1}) && eq(SPL.expand({daunt: {v: 1, lasts: 'bogus'}}), {daunt: {v: 1, lasts: 'bogus'}}), 'old keys read as they are; an unknown selector value is left alone');
ok(eq(SPL.expand({daunt: {v: 1, lasts: 'lasting'}, weaken: 3}), {weaken: 3}), 'a flat override merged after the fused key wins');

// ---- B: cards.json
const cards = J('canonical/cards.json'), kindSet = new Set(Object.keys(SPL.KIND)), byIdEarly = {}; cards.forEach(c=> byIdEarly[c.id] = c);
const srcs = c=> [c.effects || {}].concat(Object.values(c.levelSkills || {}));
const left = cards.filter(c=> srcs(c).some(o=> Object.keys(o).some(k=> kindSet.has(k)))).map(c=> c.id);
ok(left.join() === 'rimefire-salamander' && (byIdEarly['rimefire-salamander'].effects || {}).iceArrow === 1, 'cards.json has no kind left as an old key but Rimefire Salamander\'s Ice Arrow (it also has Fire Arrow: one key holds one version; decision ENG39-2) (' + left.join(', ') + ')');
const kindCards = cards.filter(c=> srcs(c).some(o=> Object.keys(o).some(k=> SPL.isFused(k, o[k]) && Object.keys(FAM[k].kinds || {}).some(s=> s in o[k]))));
ok(kindCards.length >= 50, 'cards.json carries the fused kinds (' + kindCards.length + ' cards)');
ok(cards.every(c=> eq(SPL.fuseDef(c), c)), 'fuse is idempotent on cards.json');
{ const r = cp.spawnSync('python3', ['-c', 'import json,sys; sys.path.insert(0, "tools"); import skill_params as SP; cs = json.load(open("canonical/cards.json")); print(json.dumps([[SP.expand_def(c).get("effects", {}), SP.fuse(SP.expand_def(c).get("effects", {}))] for c in cs]))'], {cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28});
  const py = r.status === 0 ? JSON.parse(r.stdout) : null;
  ok(py && py.length === cards.length && cards.every((c, i)=> eq(SPL.expandDef(c).effects || {}, py[i][0]) && eq(SPL.fuse(SPL.expandDef(c).effects || {}), py[i][1])), 'the Python expander (the build) and the JS one agree on every card, expand and fuse, key order included'); }
{ const r = cp.spawnSync('python3', ['tools/fold_skill_params_2026_11_07.py', '--check'], {cwd: ROOT, encoding: 'utf8'});
  ok(r.status === 0 && /kinds left[^\n]*\['rimefire-salamander: iceArrow'\]/.test(r.stdout), 'the fold tool reports nothing left to fold but Rimefire\'s second shot (' + (r.stdout || r.stderr).trim().slice(0, 200) + ')'); }

// ---- C: the pre-fold cards
const PREF = J('tests/golden/eng39-pre-fold-effects.json'), PRE = PREF.effects, PRELS = PREF.levelSkills || {}, preIds = Object.keys(PRE), byId = {}; cards.forEach(c=> byId[c.id] = c);
ok(preIds.length === 54 && Object.keys(PRELS).join() === 'fire-drake-hatchling', 'the snapshot holds the 54 cards the fold changed (one with a level skill)');
ok(Object.keys(PRELS).every(id=> Object.keys(PRELS[id]).every(L=> eq(SPL.expand(byId[id].levelSkills[L]), SPL.expand(PRELS[id][L])))), 'its level skills expand to the old ones');
ok(preIds.every(id=> eq(SPL.expand(byId[id].effects), SPL.expand(PRE[id]))), 'every folded card expands to exactly its old effects (keys, values, order)');
ok(preIds.every(id=> eq(SPL.fuse(PRE[id]), byId[id].effects)), 'and its old effects fuse to what cards.json holds');
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), BB = require('../bramblewood-budget.js');
  const diff = preIds.filter(id=> { const c = byId[id]; const a = T.budget(Object.assign({}, c, {effects: PRE[id]})), b = T.budget(c);
    return a.S !== b.S || a.N !== b.N || a.x1 !== b.x1 || a.x2 !== b.x2 || a.ok !== b.ok; });
  ok(!diff.length, 'the budget prices each folded card the same with old or fused keys (S, N, both caps) (' + diff.join(', ') + ')');
  ok(preIds.every(id=> BB.skillCountOf(PRE[id]) === BB.skillCountOf(byId[id].effects) && BB.nMultOf(PRE[id], {}) === BB.nMultOf(byId[id].effects, {})), 'skill count and N multiplier the same');
  // every kind priced alone, old key vs fused, at a few values
  const kd = []; Object.keys(WANT).forEach(k=> [true, 1, 2, 3].forEach(v=>{ const a = T.skillCost ? T.skillCost(k, v) : null, f = SPL.fuse({[k]: v}), fk = Object.keys(f)[0]; const ex = SPL.expand(f);
    if(!eq(ex, {[k]: v})) kd.push(k + ' ' + v); void a; void fk; }));
  ok(!kd.length, 'every kind at true / 1 / 2 / 3 round-trips to its old key, so the price table reads it (' + kd.join(', ') + ')'); }
const base = H.loadCardDefs();
function defsWith(fx, lsx){ const d = Object.assign({}, base); preIds.forEach(id=>{ if(d[id]){ d[id] = Object.assign({}, d[id], {effects: JSON.parse(JSON.stringify(fx(id)))}); const L = lsx(id); if(L) d[id].levelSkills = JSON.parse(JSON.stringify(L)); } }); return d; }
const flat = id=> PRE[id], fused = id=> byId[id].effects, flatLs = id=> PRELS[id] || null, fusedLs = id=> PRELS[id] ? byId[id].levelSkills : null;
const opp = H.fieldableIds(base).filter((id, i)=> i % 37 === 0).slice(0, 14);
let boards = 0; const boardDiff = [];
preIds.filter(id=> base[id]).forEach(id=> opp.forEach((o, j)=> [1, 2].forEach(seed=>{
  const spec = s=> ({seed: seed * 1000 + j, rounds: 14, A: [{id}, {id: o}], B: [{id: opp[(j + 3) % opp.length]}, {id}], defs: defsWith(s[0], s[1])});
  const a = H.fightSignature(H.runBoard(spec([flat, flatLs]))), b = H.fightSignature(H.runBoard(spec([fused, fusedLs]))); boards++;
  if(!eq(a, b)) boardDiff.push(id + ' vs ' + o + ' seed ' + seed);
})));
ok(boards >= 1400 && !boardDiff.length, `fixed-seed board fights identical, old keys vs fused (${boards} fights; ${boardDiff.slice(0, 4).join('; ')})`);
let matches = 0; const matchDiff = [];
const fillers = H.fieldableIds(base).filter((id, i)=> i % 53 === 5).slice(0, 8);
preIds.filter(id=> base[id] && !base[id].token).forEach((id, i)=>{ for(let seed = 1; seed <= 3; seed++){
  const deckA = {[id]: 3}; fillers.slice(0, 4).forEach(f=> deckA[f] = (deckA[f] || 0) + 2); const deckB = {[preIds[(i + 5) % preIds.length]]: 3}; fillers.slice(4).forEach(f=> deckB[f] = (deckB[f] || 0) + 2);
  const run = s=> H.runMatch(deckA, deckB, {seed: 9100 + i * 10 + seed, defs: defsWith(s[0], s[1]), recordEvents: true});
  const a = run([flat, flatLs]), b = run([fused, fusedLs]); matches++;
  const sig = r=> JSON.stringify([r.winner, r.rounds, r.events && r.events.length, H.hashStr(JSON.stringify((r.events || []).map(e=> [e.type, e.dmg, e.amount, e.targetUid, e.uid])))]);
  if(sig(a) !== sig(b)) matchDiff.push(id + ' seed ' + seed);
} });
ok(matches >= 150 && !matchDiff.length, `fixed-seed full matches identical, old keys vs fused (${matches} matches; ${matchDiff.slice(0, 4).join('; ')})`);
console.log(`  eng39 proof: ${boards} board fights and ${matches} full matches, old keys vs fused kinds, ${boardDiff.length + matchDiff.length} differ`);
// the engine reads cards.json as stored (fused) the same as the expanded defs
{ const raw = {}; cards.filter(c=> !c.pool).forEach(c=>{ const d = Object.assign({effects: {}}, c); delete d.art; raw[c.id] = d; });
  const flatDefs = {}; Object.keys(raw).forEach(id=> flatDefs[id] = SPL.expandDef(raw[id]));
  const ids = preIds.filter(id=> raw[id]).slice(0, 12), diff = [];
  ids.forEach((id, j)=>{ const spec = d=> ({seed: 700 + j, rounds: 12, A: [{id}], B: [{id: opp[j % opp.length]}], defs: Object.assign({}, d)});
    if(!eq(H.fightSignature(H.runBoard(spec(raw))), H.fightSignature(H.runBoard(spec(flatDefs))))) diff.push(id); });
  ok(!diff.length, 'makeSimEngine expands fused kinds in cards.json itself (' + diff.join(', ') + ')'); }

// ---- D: delivery, costs, counters, the card-data hash
const D = J('canonical/skill-delivery.json'), E = H.Engine;
ok(Object.keys(SPL.KIND).every(k=> D.delivery[k] === D.delivery[SPL.KIND[k][0]]), 'skill-delivery.json keeps each kind\'s own entry, the same as its family\'s (tools read the old keys)');
{ const D2 = {delivery: Object.assign({}, D.delivery)}; Object.keys(SPL.KIND).forEach(k=> delete D2.delivery[k]); const lib = SPL; const dl = k=> D2.delivery[k] || (lib.aliasOf(k) && D2.delivery[lib.aliasOf(k)[0]]) || D2.delivery[lib.rootOf(k)] || 'none';
  ok(Object.keys(SPL.KIND).every(k=> dl(k) === D.delivery[k]), 'with a kind left out, the engine\'s fallback (rootOf) gives the same delivery'); }
const DLV = {fireArrow: 'ranged', fireBolt: 'ranged', acidBolt: 'ranged', fireArrowBramble: 'ranged', deliveryEvery: 'none', iceArrow: 'ranged', archer: 'ranged', archerStyle: 'ranged', doubleTime: 'melee', weaken: 'none', requiem: 'none', requiemGrant: 'none', breach: 'none', constrict: 'none', sociable: 'none'};
ok(Object.keys(DLV).every(k=> E.skillDeliveryOf(k) === DLV[k]) && Object.keys(WANT).every(k=> E.skillDeliveryOf(k) === E.skillDeliveryOf(WANT[k][0])), 'each kind is delivered as before: as its family (Ice Arrow and Archer ranged, Double Time melee, the rest none)');
ok(D.rides.weaken && D.rides.breach && D.rides.constrict, 'rides keeps the old keys the rules read');
{ const C = J('canonical/skill-costs.json'), marked = {}; (C.skills || []).forEach(s=>{ if(s.kindOf) marked[s.id] = s.kindOf; }); Object.keys(C.shorthands).forEach(k=>{ if(C.shorthands[k].kindOf) marked[k] = C.shorthands[k].kindOf; });
  const want = k=> WANT[k][0] + '.' + Object.keys(WANT[k][1]).map(p=> p + '=' + WANT[k][1][p]).join(',');
  ok(Object.keys(WANT).every(k=> marked[k] === want(k)), 'skill-costs.json marks each kind kindOf family.selector=value (' + Object.keys(WANT).filter(k=> marked[k] !== want(k)).join(', ') + ')');
  ok(!(C.actions || []).some(a=> a.kindOf), 'the actions list is untouched (Stench and Constrict are also actions)'); }
{ const I = require('../bramblewood-integrity.js'), flatList = cards.map(c=> SPL.expandDef(c)), oldList = cards.map(c=> PRE[c.id] ? Object.assign({}, c, {effects: PRE[c.id]}) : c);
  ok(I.cardDataHash(cards) === I.cardDataHash(flatList) && I.cardDataHash(cards) === I.cardDataHash(oldList), 'the card-data hash is the same for cards.json (fused), the flat cards the page gets and the pre-fold cards'); }
{ const SCT = J('canonical/skill-counters.json'), named = new Set(Object.keys(SCT.counters || {}).concat(SCT.noCounter || [], Object.keys(SCT.applies || {})));
  const carried = [...new Set(kindCards.flatMap(c=> Object.keys(SPL.expandDef(c).effects || {}).filter(k=> kindSet.has(k))))];
  ok(carried.length >= 15 && carried.every(k=> named.has(k)), 'the counters table classifies each kind the cards carry, read from the expanded card as before (' + carried.filter(k=> !named.has(k)).join(', ') + ')'); }
{ const html = fs.existsSync(path.join(ROOT, 'index.html')) ? rd('index.html') : '';
  ok(/"kinds": \{/.test(html) && /function kindOf\(k\)/.test(html), 'index.html carries the kinds and the helper (rebuilt)');
  const m = html.match(/"id": ?"lamprey"[^\n]{0,4000}?"effects": ?\{([^}]*)\}/), m2 = html.match(/"id": ?"ice-petrel"[^\n]{0,4000}?"effects": ?\{([^}]*)\}/);
  ok(m && /"weaken": ?1/.test(m[1]) && m2 && /"iceBolt": ?2/.test(m2[1]), 'index.html card data is flat (Lamprey has weaken, Ice Petrel iceBolt: no fused kind reaches the page)'); }

// ---- E: texts
const {TEXT} = require('../bramblewood-texts.js');
ok(TEXT['ui.skn-exploit'] === 'Vulnerable' && TEXT['ui.act-exploit'] === 'Vulnerable' && TEXT['ui.float-exploit'] === '🩻 Vulnerable', 'Exploit is shown as Vulnerable (skill, action, float)');
ok(TEXT['ui.act3-vulnerable'] === 'Shock' && TEXT['ui.log3-vulnerable'] === '{name} is Shocked for {n} rounds.' && /^Shock for N rounds/.test(TEXT['ui.act3-vulnerable-desc']), 'the SK3 status action reads Shock (its log line: Shocked)');
const exploitWords = Object.keys(TEXT).filter(k=> /\bExploit|\bexploited\b/.test(TEXT[k]));
ok(!exploitWords.length, 'no player text says Exploit any more (' + exploitWords.join(', ') + ')');
ok(/Vulnerable tokens/.test(TEXT['ui.sk-exploit']) && /Exposed, Vulnerable, Shocked/.test(TEXT['ui.act-cleanse-desc']) && TEXT['ui.eng39-version'] === 'Version', 'the skill text, Cleanse\'s list and the editor\'s Version field');
const LEAD = /^[\s \u{1F000}-\u{1FAFF}☀-➿️‍↗]+/u;
const ekeys = ['ui.act3-vulnerable', 'ui.log3-vulnerable', 'ui.skn-exploit', 'ui.sk-exploit', 'ui.sk-exploit-codex', 'ui.exploit-tip', 'ui.log-exploit', 'ui.log-exploit-hit', 'ui.log-exploit-fade', 'ui.float-exploit', 'ui.act-exploit', 'ui.act-exploit-desc', 'ui.act-cleanse-desc', 'ui.eng39-version'];
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const pack = J('lang/' + code + '.json'); const miss = ekeys.filter(k=> pack[TEXT[k].replace(LEAD, '')] === undefined); ok(!miss.length, code + ' has every row (' + miss.join(', ') + ')'); }
const app = rd('arena_app.js');
ok(/STATUS_KEYWORDS\.push\(\{k:'exploit', re:\/\\b\(vulnerable\|exploit/.test(app), 'the Vulnerable word is the exploit status in the keyword glossary');

// ---- F: the card editor
{ const i = app.indexOf('// ENG39 (2026-11-09, owner decision DES2-3 a'), j = app.indexOf('function skillRowHTML(', i); const src = app.slice(i, j);
  ok(i > 0 && j > i && /function eng39KindSelectHTML/.test(src), 'the editor\'s ENG39 block sits before skillRowHTML');
  const DEFS = [{key: 'daunt', label: 'Daunt'}, {key: 'weaken', label: 'Weaken'}, {key: 'stench', label: 'Stench'}, {key: 'speed', label: 'Speed'}, {key: 'blitz', label: 'Blitz'}, {key: 'swift', label: 'Swift', hidden: true}, {key: 'flying', label: 'Flying'}];
  const ctx = {eng35Lib: ()=> SPL, SKILL_DEFS: DEFS, TX: k=> k === 'ui.eng39-version' ? 'Version' : k, escapeHtml: s=> String(s), escapeAttr: s=> String(s)};
  vm.createContext(ctx); vm.runInContext(src + '\nthis.api = {eng39KindSelectHTML, eng39KindOf};', ctx);
  const h1 = ctx.api.eng39KindSelectHTML({key: 'weaken'}, 3), h2 = ctx.api.eng39KindSelectHTML({key: 'speed'}, 0), h3 = ctx.api.eng39KindSelectHTML({key: 'flying'}, 0);
  ok(/data-sk="twin" data-i="3"/.test(h1) && /<option value="daunt" >Daunt<\/option>/.test(h1) && /<option value="weaken" selected>Weaken \(lasts lasting\)<\/option>/.test(h1) && /Stench \(lasts washed\)/.test(h1), 'a Weaken row: Version Daunt / Weaken (lasts lasting) / Stench (lasts washed), Weaken picked');
  ok(/Blitz \(kind blitz\)/.test(h2) && !/swift/.test(h2) && h3 === '', 'Speed offers Blitz, not the hidden Swift; a plain skill has no Version field');
  ctx.SKILL_DEFS.push({key: 'arrow', label: 'Arrow'}, {key: 'fireBolt', label: 'Fire Bolt'}, {key: 'fireArrow', label: 'Fire Arrow'});
  const h4 = ctx.api.eng39KindSelectHTML({key: 'fireBolt'}, 1);
  ok(/<option value="fireBolt" selected>Fire Bolt \(type fire · form bolt\)<\/option>/.test(h4) && /Fire Arrow \(type fire\)/.test(h4) && /<option value="arrow" >Arrow/.test(h4), 'a Fire Bolt row: Version Arrow / Fire Arrow (type fire) / Fire Bolt (type fire · form bolt)'); }
{ const i = app.indexOf('// ENG39 (owner 2026-11-09 23:05 on ENG35-4'), j = app.indexOf('function skillRowHTML(', i); const src = app.slice(i, j);
  ok(i > 0 && /function eng39BrambleBoxHTML/.test(src), 'the Bramble box block sits before skillRowHTML');
  const ctx = {EN6_BRAMBLE_APP: {arrowBramble: {base: 'arrow'}, fireArrowBramble: {base: 'fireArrow'}, fireBoltBramble: {base: 'fireBolt'}}, editingCard: {effects: {flying: true, arrowBramble: true, arrow: 2}}, TX: k=> k === 'ui.eng39-bramble' ? 'Bramble' : k, escapeHtml: s=> String(s), escapeAttr: s=> String(s)};
  vm.createContext(ctx); vm.runInContext(src.replace(/^let /mg, 'var ') + '\nthis.api = {eng39BrambleBoxHTML};', ctx);
  const b1 = ctx.api.eng39BrambleBoxHTML({key: 'arrow'}, 2), b2 = ctx.api.eng39BrambleBoxHTML({key: 'fireBolt'}, 0), b3 = ctx.api.eng39BrambleBoxHTML({key: 'flying'}, 0), b4 = ctx.api.eng39BrambleBoxHTML({key: 'arrow', bramble: false}, 2);
  ok(/data-sk="eng39bramble" data-i="2" checked/.test(b1) && /Bramble<\/label>/.test(b1) && /data-sk="eng39bramble"/.test(b2) && !/checked/.test(b2) && b3 === '' && !/checked/.test(b4), 'Balloon Archer\'s Arrow row shows Bramble ticked; Fire Bolt unticked; a non-shot has none; an unticked box stays unticked'); }
ok(/eng39BrambleSet\.add\(bk\); if\(bb\.checked\) fx\[bk\] = true; else delete fx\[bk\];/.test(app) && /formKeys\.has\(k\) \|\| eng39BrambleSet\.has\(k\)/.test(app) && /r\.bramble = b\.checked/.test(app), 'Save writes or removes the bramble part from the box (the keep-step leaves it alone); the box survives a redraw');
ok(require('../bramblewood-texts.js').TEXT['ui.eng39-bramble'] === 'Bramble', 'the box is labelled Bramble (translated in all 12 packs already)');
ok(/\.filter\(x=> x\.key === row\.key \|\| !eng39KindOf\(x\.key\)\); \/\/ ENG39/.test(app) && /\$\{eng39KindSelectHTML\(row, i\)\}/.test(app), 'kinds leave the "+ Add Skill" picker; every row draws its Version field (the "twin" select the editor already handles)');
ok(/if\(d && d\.key === 'swift'\) d\.hidden = true;/.test(app), 'Swift (on no card) leaves "+ Add Skill"');
ok(/ENG39/.test(rd('bramblewood-engine.js')) && /rootOf\(key\)/.test(rd('bramblewood-engine.js')), 'the engine\'s delivery lookup reads rootOf');
// docs
ok(/ENG39/.test(rd('docs/effects-catalogue.md')) && /\| Daunt \(`daunt`\) \| lasts: lasting = `weaken`/.test(rd('docs/effects-catalogue.md')) && /ENG39, DES2-3/.test(rd('docs/project-state.md')), 'effects-catalogue.md (the table) and project-state.md');
ok(/^## 2026-11-09[^\n]*ENG39/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/eng39-2026-11-09\.js/.test(rd('tests/run-all.sh')), 'in run-all.sh');
// ---- G: ENG35-3 b would change a price: not done
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), c = byId['sunthroat-courier'];
  const a = T.budget(c), b = T.budget(Object.assign({}, c, {effects: Object.assign({}, c.effects, {esprit: {v: 0, hp: 1}})}));
  ok(eq(c.effects.esprit, {v: null, hp: 1}) && a.S !== b.S, `Sunthroat Courier keeps "esprit": {"v": null, "hp": 1}: the plain form prices differently (S ${a.S} vs ${b.S})`);
  const items = J('docs/decisions.json').items, d2 = items.find(x=> x.id === 'ENG39-2'), d3 = items.find(x=> x.id === 'ENG39-3');
  ok(d2 && d2.status !== undefined && /Rimefire/.test(d2.body) && d3 && d3.status !== undefined && /Sunthroat/.test(d3.body) && [d2, d3].every(d=> d.body.split(/\s+/).length < 100), 'decisions ENG39-2 (a card with two shots) and ENG39-3 (Sunthroat\'s plain Esprit) are asked, under 100 words'); }
{ const F = J('docs/decisions.json').items.find(x=> x.id === 'ENG39-1'); ok(F && F.status !== undefined && /Tangleweed/.test(F.body) && /Darksight/.test(F.body) && F.body.split(/\s+/).length < 100, 'decision ENG39-1 (retire Tangleweed / Darksight for real), under 100 words'); }
console.log(`eng39: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
