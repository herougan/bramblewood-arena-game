#!/usr/bin/env node
// 2026-10-18 (package X1, the owner's decisions of 15:05): static and logic checks that
//   1. the starting bramble is called "Bramble" (was "Castle"): characters.json, the UI's label fallbacks, and every language
//      pack's "Castle" entry reads as that pack's bramble word;
//   2. "Bramble" only means the base: the courier mouse is Burdock, the middle rank tier is Thicket, and no rival is named Bramble
//      (nor Burdock, now the mouse);
//   3. eggs are rare (first clears 2/4/6/10/20%, smaller repeat multipliers, raids 1%) and Map 1 gives exactly one sure egg, from a
//      mid-map ordinary skirmish, on its first clear, once per save; Map 3's first egg stays;
//   4. Lilypad Reach waits on Map 6 (mapIdAt(6)) — tests/maps-2026-10-18.js runs the full lock logic;
//   5. a cost of 5+ is one icon with its number in the centre, white with a dark outline;
//   6. the tutorial deals the golden (highlighted) card into the opening hand, so the drag hint always shows it;
//   7. "Put it in my deck" follows the Collection level (DECK_PROMPT_FLOORS) — tests/ui-2026-10-18.js runs the table;
//   8. the Dromedary: a Glass Dunes card with the owner's art, existing skills only, budget v3, on Map 18, named in 12 languages.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const readJSON = rel=> JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const fn = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i + 1, j + 1); };
const constLine = name=>{ const m = src.match(new RegExp(`^const ${name} = [^\\n]*$`, 'm')); return m ? m[0] : ''; };
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];

// --- the maps (as tests/maps-2026-10-18.js evaluates them)
const ms = src.indexOf('const CONQUEST_MAPS = ['), me = src.indexOf('\n];', ms) + 3;
const dg = src.indexOf('function endlessDungeon(cfg){'), de = src.indexOf('const CONQUEST_MAPS_BASELINE', dg);
const CONQUEST_MAPS = new Function(src.slice(ms, me) + '\n' + src.slice(dg, de) + '\nreturn CONQUEST_MAPS;')();
const mains = CONQUEST_MAPS.filter(m=> !m.sub), mapAt = n=> mains[n];

// --- 1. Castle -> Bramble
const chars = readJSON('canonical/characters.json'), castle = chars.find(c=> c.id === 'castle');
ok(castle && castle.name === 'Bramble' && castle.icon === '🏰', '1. the starting bramble (id "castle", the save key) is named "Bramble"');
ok(!chars.some(c=> c.name === 'Castle'), '1. no bramble is called "Castle" any more');
ok(!/name:\s*'Castle'|\|\|\s*'Castle'|:\s*'Castle'\)|castle\.name\s*:\s*'Castle'|castle\.name\)\s*:\s*'Castle'/.test(src), "1. the UI's name fallbacks say 'Bramble', not 'Castle'");
ok((src.match(/name:'Bramble', icon:'🏰'/g) || []).length === 2 && /\(label\|\|'Bramble'\)/.test(src), '1. ...the placeholder bramble and the HP ribbon label included');
CODES.forEach(c=>{ const L = readJSON(`lang/${c}.json`); ok(L.Castle && L.Castle === L.Bramble, `1. lang/${c}.json: "Castle" reads "${L.Bramble}" (its bramble word), not a castle`); });

// --- 2. the mouse and the rank tier
ok(/mouse:\s*\{name:'Burdock the courier mouse',/.test(src) && !/Bramble the courier mouse/.test(src), '2. the courier mouse is Burdock');
ok(/escorting Burdock’s letters/.test(src) && !/escorting Bramble/.test(src), "2. the errand speaks of Burdock's letters");
const RANK_TIERS = new Function(constLine('RANK_TIERS') + '\nreturn RANK_TIERS;')();
ok(RANK_TIERS.join() === 'Sprout,Sapling,Thicket,Heartwood,Elderwood,Starwood', '2. the rank ladder: Sprout, Sapling, Thicket, Heartwood, Elderwood, Starwood');
['bramblewood-ghosts.js', 'bramblewood-autobattle.js'].forEach(f=>{ const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  ok(!/'Bramble'|'Burdock'/.test(s) && /'Briony'/.test(s) && /'Teasel'/.test(s), `2. ${f}: no rival called Bramble or Burdock (Briony, Teasel instead)`); });
const dlg = fs.readFileSync(path.join(ROOT, 'docs/dialogues.json'), 'utf8');
ok(/"Burdock the courier mouse"/.test(dlg) && !/Bramble the courier/.test(dlg), '2. docs/dialogues.json names the mouse Burdock');
ok(!chars.some(c=> /Burdock|Thicket/.test(c.name || '')), '2. no bramble shares the new names');
{ const cards = readJSON('canonical/cards.json'); ok(!cards.some(c=> /\b(Burdock|Thicket)\b/.test(c.name || '')), '2. no card shares the new names'); }

// --- 3. eggs
const EGG_FIRST_CHANCE = new Function(constLine('EGG_FIRST_CHANCE') + '\nreturn EGG_FIRST_CHANCE;')();
const EGG_REPEAT_MULT = new Function(constLine('EGG_REPEAT_MULT') + '\nreturn EGG_REPEAT_MULT;')();
ok(EGG_FIRST_CHANCE.skirmish === 0.02 && EGG_FIRST_CHANCE.elite === 0.04 && EGG_FIRST_CHANCE.miniboss === 0.06 && EGG_FIRST_CHANCE.boss === 0.10 && EGG_FIRST_CHANCE.worldboss === 0.20,
  '3. first-clear egg chances: skirmish 2%, elite 4%, mini-boss 6%, boss 10%, world boss 20%');
const OLD_REPEAT = {elite:1.5, miniboss:2, boss:3, worldboss:5};
ok(Object.keys(OLD_REPEAT).every(k=> EGG_REPEAT_MULT[k] < OLD_REPEAT[k]) && EGG_REPEAT_MULT.skirmish < 1, '3. repeat multipliers are smaller than before (skirmish below 1 too)');
const egg = new Function('KIND_BASE', 'nodeEnergyCost', [constLine('EGG_FIRST_CHANCE'), constLine('EGG_REPEAT_MULT'), fn('baseKind'), fn('eggChanceFor')].join('\n') + '\nreturn eggChanceFor;')(
  new Function(constLine('KIND_BASE') + '\nreturn KIND_BASE;')(), ()=> 4);
ok(egg({kind:'raidWin'}, null, true) === 0.01 && egg({kind:'raidboss'}, 'x', true) === 0.01, '3. raids are unchanged (1% flat)');
ok(egg({kind:'skirmish'}, 'x', true) === 0.02 && egg({kind:'subboss'}, 'x', true) === 0.06 && Math.abs(egg({kind:'boss'}, 'x', false) - 0.006) < 1e-9, '3. eggChanceFor reads the new table (a repeat boss win at 4 energy: 0.6%)');
{ const node1 = mapAt(1).nodes.find(n=> n.key === new Function(constLine('EGG_MAP1_NODE') + '\nreturn EGG_MAP1_NODE;')());
  const fights = mapAt(1).nodes.filter(n=> n.kind !== 'tutorial' && n.kind !== 'raidboss'), at = fights.indexOf(node1);
  ok(node1 && node1.kind === 'skirmish' && at > 0 && at < fights.length - 2, `3. the sure egg is a mid-map ordinary skirmish of Map 1 (${mapAt(1).name} ${node1 && node1.key})`);
  let flags = {}, granted = [];
  const g = new Function('KIND_BASE', 'mapIdAt', 'flagsRef', 'grantEgg', 'eggKindForNode', [constLine('EGG_MAP1_NODE'), fn('baseKind'),
    'function loadDialogueFlags(){ return flagsRef(); } function setDialogueFlag(k, v){ flagsRef()[k] = v; }', fn('guaranteedMap1Egg')].join('\n') + '\nreturn guaranteedMap1Egg;')(
    new Function(constLine('KIND_BASE') + '\nreturn KIND_BASE;')(), n=> mapAt(n).id, ()=> flags, (k, from)=> granted.push(k + '@' + from), ()=> 'woodland');
  const m1 = mapAt(1).id;
  ok(g(node1, m1, false) === null && !granted.length, '3. a repeat win gives no sure egg');
  ok(g(fights[0], m1, true) === null && g(node1, mapAt(2).id, true) === null && !granted.length, '3. ...nor another fight, nor the same key on another map');
  ok(g(node1, m1, true) === 'woodland' && granted.join() === 'woodland@' + node1.key && flags['egg:map1'] === true, '3. the first clear grants one egg and sets egg:map1');
  ok(g(node1, m1, true) === null && granted.length === 1, '3. once per save (a cleared save that fights it again gets none)'); }
ok(/const sure = guaranteedMap1Egg\(bn, m\.conquestNode\.mapId, isFirstClear\);\s*const egg = sure \|\| rollEggDrop\(/.test(src), '3. the sure egg replaces that win\'s random roll and shows on the results (conquestEggDrop)');
ok(/mapIdAt\(3\) && m\.conquestNode\.mapId===mapIdAt\(3\) && !loadDialogueFlags\(\)\['egg:first'\]/.test(src), "3. Map 3's first guaranteed egg (egg:first) is kept");
ok(/function rollEggDrop\(node, mapId, firstClear\)\{\n  const p = eggChanceFor\(node, mapId, firstClear\);[^\n]*\n  const kind = eggKindForNode\(node\);/.test(src), '3. random eggs and the sure egg share eggKindForNode');

// --- 4. Lilypad Reach
{ const mp = CONQUEST_MAPS.find(m=> m.id === 'mp'); ok(mp && mp.entry.afterMapCleared === mapAt(6).id, `4. Lilypad Reach waits on Map 6 (${mapAt(6).name})`);
  ok(/gateMap\.name \+ \(!gateMap\.sub && mapNumberOf\(gateMap\.id\) != null \? ` \(Map \$\{mapNumberOf\(gateMap\.id\)\}\)` : ''\)/.test(fn('subMapEntrancesHTML')), '4. the lock names the map and its number'); }

// --- 5. cost 5+
{ const pips = new Function(fn('pipsHTML') + '\nreturn pipsHTML;')();
  const five = pips('🪵', 5, 'lumber'), four = pips('🪵', 4, 'lumber'), nine = pips('🪵', 9, 'lumber');
  ok((five.match(/<i>/g) || []).length === 1 && /<b>5<\/b>/.test(five) && /is-res-num/.test(five) && (nine.match(/<i>/g) || []).length === 1 && /<b>9<\/b>/.test(nine), '5. 5+ Lumber is one log with its number');
  ok((four.match(/<i>/g) || []).length === 4 && !/<b>/.test(four), '5. 4 or less is still a row of logs');
  ok(/\.pips\.is-res-num b\{position:absolute; left:50%; top:50%; transform:translate\(-50%, -50%\);[^}]*color:#fff;/.test(tpl) && /\.pips\.is-res-num b\{[^}]*-webkit-text-stroke:[^}]*text-shadow:/.test(tpl),
    '5. the number sits in the centre of the icon, white with a dark outline');
  ok((src.match(/pipsHTML\('🪵'/g) || []).length === 1 && /costParts = isCastle \? \[\] : costBadgeParts\(d\)/.test(src) && /const statCostParts = costBadgeParts\(d\);/.test(src), '5. the tile (hand, Codex, deck lists) and the detail view draw cost through costBadgeParts/pipsHTML'); }

// --- 6. the golden card in the opening hand
{ const defs = {a:{}, b:{}, c:{}, g:{}, 'g-plain':{derivedFrom:'g'}};
  const deal = new Function('getCardDefs', fn('tutorialDealHighlight') + '\nreturn tutorialDealHighlight;')(()=> defs);
  let deck = ['g', 'a', 'b', 'c', 'a', 'b', 'c'];   // drawn from the end: a, b, c on top, the golden card at the bottom
  ok(deal(deck, 'g', 3) && deck.slice(-3).includes('g') && deck.length === 7 && deck.filter(x=> x === 'g').length === 1, '6. a golden card at the bottom is swapped into the opening hand');
  deck = ['a', 'b', 'c', 'g', 'a', 'b']; const before = deck.join();
  ok(deal(deck, 'g', 3) && deck.join() === before, '6. already in the opening hand: the seeded order is untouched');
  deck = ['g-plain', 'a', 'b', 'c', 'a']; ok(deal(deck, 'g', 3) && deck.slice(-3).includes('g-plain'), "6. the tutorial's plain copy (derivedFrom) counts");
  deck = ['a', 'b', 'c', 'a']; ok(!deal(deck, 'wandering-traveller', 3) && deck.join() === 'a,b,c,a', "6. a highlight not in the deck (part 2's leader) changes nothing");
  const st = fn('startTutorialMatch');
  ok(/tutorialDealHighlight\(players\[1\]\.deck, tutorialHighlightId\(st, pick\), hand\);\s*engine\.draw\(players\[1\], hand, 'A'/.test(st), '6. startTutorialMatch deals it before the opening draw'); }

// --- 7. deck prompt by Collection level
ok(/\nconst DECK_PROMPT_FLOORS = \[/.test(src) && /level = collectionStats\(\)\.levelSum/.test(fn('rewardWorthDeckPrompt')), '7. the deck offer reads the Collection level through DECK_PROMPT_FLOORS');

// --- 8. the Dromedary
{ const cards = readJSON('canonical/cards.json'), d = cards.find(c=> c.id === 'dromedary');
  ok(d && d.name === 'Dromedary' && d.icon === '🐪' && !d.test && !d.token, '8. the Dromedary is a real card');
  ok(d && (d.archetypes || []).includes('Desert') && (d.resist || []).includes('heat') && d.effects && d.effects.dry === true, '8. a desert walker: Desert, resists Heat, Dry (sees through Sandstorms)');
  const KW = new Set([...src.matchAll(/\{key:'(\w+)', category:/g)].map(m=> m[1]));
  ok(d && Object.keys(d.effects).every(k=> KW.has(k)), '8. existing skills only (' + (d ? Object.keys(d.effects).join(', ') : '') + ')');
  ok(d && cards.filter(c=> c.numericId === d.numericId).length === 1 && cards.filter(c=> c.uuid === d.uuid).length === 1, '8. its numericId and uuid are unique');
  // the budget at the level a reward starts at (1); 2026-10-19 (package BF): v4, N = (Base - 1 + L) x (1 + L/20), from bramblewood-budget.js
  const BB = require(require('path').join(__dirname, '..', 'bramblewood-budget.js')), L = 1;
  const N = BB.nOf(d, L), S = 1 /* Dry */ + d.effects.regen /* Regeneration: its value */;
  ok(2*d.attack + d.health + S < N && d.attack*d.health + S < (N/3)*(N/3), `8. budget v4: 2A+H+S = ${2*d.attack + d.health + S} < N = ${N.toFixed(1)}, A·H+S = ${d.attack*d.health + S} < (N/3)² = ${((N/3)*(N/3)).toFixed(1)}`);
  ok(/regen:'v'/.test(constLine('SB_DEFAULT_SKILLS')) && !/\bdry:/.test(constLine('SB_DEFAULT_SKILLS')), "8. (the Test Lab prices Regeneration at its value and Dry at the default 1, as above)");
  const md = CONQUEST_MAPS.find(m=> m.id === 'md');
  ok(mains.indexOf(md) === 18 && d.source && d.source.kind === 'map' && d.source.id === 'md' && md.nodes.some(n=> n.key === d.source.node && n.kind === 'skirmish'), `8. a card reward on Map 18, The Glass Dunes (${d.source && d.source.node})`);
  const RR = new Function(src.slice(src.indexOf('// ROAD_RARITY:BEGIN'), src.indexOf('// ROAD_RARITY:END')) + '\nreturn {roadRarityOk};')();
  ok(RR.roadRarityOk(d.rarity, 18, 'skirmish'), '8. Uncommon is within a Map 18 skirmish\'s rarity cap');
  ok(md.nodes.some(n=> n.kind === 'skirmish' && (n.deck || {}).dromedary > 0), '8. ...and it walks in a Glass Dunes deck');
  ok(typeof d.art === 'string' && d.art.startsWith('data:image/png;base64,'), '8. its art is embedded (wire_art)');
  const png = fs.readFileSync(path.join(ROOT, 'art/cards/dromedary.png'));
  ok(png.readUInt32BE(16) === 256 && png.readUInt32BE(20) === 256 && png[25] === 3, '8. art/cards/dromedary.png is 256×256, palette (256 colours)');
  ok(d.art === 'data:image/png;base64,' + png.toString('base64'), '8. the embedded art is that file');
  CODES.forEach(c=>{ const P = readJSON(`lang/cards/${c}.json`); ok(typeof P.Dromedary === 'string' && P.Dromedary && P.Dromedary !== 'Dromedary' || (c === 'tl' && P.Dromedary), `8. lang/cards/${c}.json names it (${P.Dromedary})`); }); }

console.log(fail ? `decisions-2026-10-18: ${fail} of ${checks} checks FAILED` : `decisions-2026-10-18: all ${checks} checks pass`);
process.exit(fail ? 1 : 0);
