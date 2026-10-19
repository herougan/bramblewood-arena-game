#!/usr/bin/env node
// The card pass, 2026-10-19 (package CB; owner 00:19, the overnight plan: "balance the cards themselves (L1) + balance rarity, choose
// where the cards come from"). docs/card-pass-2026-10-19.md.
//
// The yardstick is tools/card_balance.js's test, unchanged (each card at Level 1, 8 copies, or 6 / 4 / 3 at 1 / 2 / 3+ Lumber, in a
// deck of the reference filler, against 20 filler cards, Open battles, 60 rounds, seeds 7700 + 131k), so a number here is the same
// number card_balance.js gives at that many games. What this tool adds: more games (sharded, resumable, one JSON line a card), a
// search for the smallest stat change that lands a card in its rarity band and still passes budget v3, and the plan's apply step.
//
//   node tools/card_pass_2026_10_19.js measure [games=100] [shard nshards] [--tag=screen] [--only=a,b] [--from=tag --outside=3]
//        one line per card to docs/balance/card-pass-<tag>.s<shard>.jsonl (resumable). --from/--outside: only the cards that tag found
//        more than that many points outside their band (the confirm run).
//   node tools/card_pass_2026_10_19.js search [games=100] [shard nshards] [--from=confirm] [--tag=search] [--outside=8]
//        for each card more than --outside points outside its band in --from (and not on the skip list): stat variants in order of
//        size (budget units 2|dA| + |dH|), each checked against budget v3 first, the first that lands inside the band (2 points of
//        margin) at `games` is confirmed at 400 games; else the nearest that improves by 5+ points. docs/balance/card-pass-<tag>.s<k>.jsonl
//   node tools/card_pass_2026_10_19.js rows --tag=t     merges a tag's shards and prints a summary
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const argv = process.argv.slice(2), CMD = argv[0] || 'rows';
const nums = argv.filter(a=> /^\d+$/.test(a)).map(Number);
const GAMES = nums[0] || 100, SHARD = nums[1] || 0, NSH = nums[2] || 1;
const opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const OUTDIR = path.join(ROOT, 'docs', 'balance');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const RAW = {}; cards.forEach(c=> RAW[c.id] = c);

// ---- card_balance.js's test, as it is there (Level 1 for the Level 0 cards; the filler at its 2026-10-09 printed stats)
function baseLevel0(d){ const k = d.source && d.source.kind; return !!(d.basic || d.rarity==='starter' || d.tutorial || d.quest || k==='quest' || k==='errand' || k==='base' || d.id==='wandering-traveller'); }
function atLevel1(d){ if(!baseLevel0(d)) return d; const ov = d.levelStats && (d.levelStats[1] || d.levelStats['1']); const r = v=> v==null ? v : Math.max(v > 0 ? 1 : 0, Math.round(v * 1.10));
  return Object.assign({}, d, {attack: ov && ov.attack!=null ? ov.attack : r(d.attack), health: ov && ov.health!=null ? ov.health : r(d.health), startsAt0: true}); }
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = atLevel1(d); });
const FILLER = ['warren-scout', 'fawn-scout', 'bee-sentry', 'mouse-sapper', 'poison-dart-croaker'].filter(id=> defs[id]);
FILLER.forEach(id=>{ const d = Object.assign({effects:{}}, RAW[id]); delete d.art; d.effects = Object.assign({}, d.effects); ['swimmer','tailwind','headwind','darksight','dry'].forEach(k=> delete d.effects[k]); defs[id] = d; });
function fillerDeck(n){ const d = {}; for(let i=0;i<n;i++){ const id = FILLER[i % FILLER.length]; d[id] = (d[id]||0) + 1; } return d; }
const OPP = fillerDeck(20), COPIES_BY_COST = [8, 6, 4, 3];
// over: printed-stat changes ({attack, health, cost}); a Level 0 card's Level 1 step is applied to them as the game would
function winRate(id, over, games){
  let D = defs;
  if(over){ const printed = Object.assign({}, RAW[id], over), d = Object.assign({effects:{}}, printed); delete d.art; D = Object.assign({}, defs, {[id]: atLevel1(d)}); }
  const k = COPIES_BY_COST[Math.min(3, D[id].cost||0)];
  const deck = fillerDeck(20 - k); deck[id] = (deck[id]||0) + k;
  let w = 0;
  for(let g=0; g<games; g++){
    const r = E.simulateOneMatch(D, g%2 ? deck : OPP, g%2 ? OPP : deck, {rnd: E.mulberry32(7700 + g*131), maxRounds: 60, battleMode: 'open'});
    const mine = g%2 ? 1 : 2;
    w += r.winner===mine ? 1 : r.winner===0 ? 0.5 : 0;
  }
  return w / games;
}
const BANDS = {
  starter:[.20,.48], common:[.35,.60], uncommon:[.45,.68], quest:[.45,.68], rare:[.52,.75], veryrare:[.56,.80], superrare:[.60,.84],
  epic:[.62,.87], heroic:[.64,.89], unique:[.66,.92], questunique:[.66,.92], legendary:[.70,.97], mythic:[.72,1], ancient:[.75,1],
};
const bandOf = rar=> BANDS[rar || 'common'] || BANDS.common;
const SkillCosts = require(path.join(__dirname, 'skill_costs.js'));
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8'));
const SC = SkillCosts.make(TABLE);
// the same table with each entry's measuredS in place of its value (the owner's pending call): what the budget would say then
const TABLE_M = JSON.parse(JSON.stringify(TABLE)); ['skills','triggers','actions','modifiers'].forEach(k=> (TABLE_M[k] || []).forEach(x=>{ if(typeof x.measuredS === 'number') x.value = x.measuredS; }));
const SCM0 = SkillCosts.make(TABLE_M);
// a shorthand's measuredS is its S per N as a whole (Bounty 11.65 a point), not trigger × action, so it replaces that part outright
const SCM = {budget(c){ const b = SCM0.budget(c), e = c.effects || {}, SH = TABLE.shorthands || {}; let S = b.S;
  b.parts.forEach(p=>{ if(p[0] === 'shorthand' && SH[p[1]] && typeof SH[p[1]].measuredS === 'number'){ const v = e[p[1]], n = typeof v === 'number' ? v : 1; S += SH[p[1]].measuredS * n - p[2]; } });
  const N = b.N, A = c.attack || 0, H = c.health || 0, x1 = (2 * A + H + S) * b.m, x2 = (A * H + S) * b.m;
  return {N, S: r1(S), x1: r1(x1), x2: r1(x2), N2: b.N2, ok: x1 < N && x2 < b.N2}; }};

// ---- which cards the pass measures, and which it only reports (the 2026-10-18 pass's skip list, by rule)
const ENEMY_ONLY = new Set(['caldera-wyrm', 'rimeheart-colossus', 'marshal-tuskwell', 'magnate-duck', 'great-gate']);
const live = c=> !c.token && !c.test && !c.hallOfFame && !c.baseId && !c.field && !c.pool;
const EFF = c=> c.effects || {};
const hasAny = (c, keys)=> keys.some(k=> EFF(c)[k] != null && EFF(c)[k] !== false);
const trig = c=> (EFF(c).triggers || []).filter(Boolean);
function skipReason(c){
  const types = [...(c.archetypes||[]), ...(c.species||[])];
  if(FILLER.includes(c.id)) return 'filler'; // the yardstick: changing it moves every number
  if(c.cardType === 'materia') return 'materia';
  if(c.cardType === 'equipment') return 'equipment';
  if(c.cardType === 'spell' || c.spell) return 'spell';
  if(c.eggKind || c.hatchInto) return 'egg';
  if(c.rarity === 'starter' || c.basic) return 'starter';
  if(c.creatureRank || c.rarity === 'legendary') return 'legendary'; // the Dragons, the great beasts and the Legendaries: reported, changed only if wildly off
  if((c.source && c.source.kind === 'raid') || c.raid) return 'raid';
  if(c.worldBoss || ENEMY_ONLY.has(c.id)) return 'boss'; // enemy-only bosses (the map leaders are player cards: a map's boss gives its leader, so they are measured)
  if((c.attack||0) === 0 && types.includes('Structure')) return 'wall';
  // deck-plan cards the filler test can't see: Ecclesia (Prayer), Devilry, Remember, Changeling, Lumber makers, Sacrifice
  if(hasAny(c, ['prayer','prayerReq','devilry','remember','changeling','onSpawnGold','onReadyGold','sacrifice','lumberjack','timber']) || c.prayerReq || c.darkSummon
     || trig(c).some(t=> t.do === 'gainGold' || t.do === 'gainLumber' || (t.do === 'gain' && (t.resource||'lumber') === 'lumber'))) return 'deckplan';
  if(c.id === 'missingno') return 'secret';
  return null;
}
const readJsonl = f=>{ try{ return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } };
const tagRows = tag=>{ const out = {}; fs.readdirSync(OUTDIR).filter(f=> f.startsWith(`card-pass-${tag}.s`) && f.endsWith('.jsonl')).forEach(f=> readJsonl(path.join(OUTDIR, f)).forEach(r=> out[r.id] = r)); return out; };
const outside = (wr, rar)=>{ const [lo, hi] = bandOf(rar); return wr < lo ? (wr - lo) * 100 : wr > hi ? (wr - hi) * 100 : 0; };
const r1 = v=> Math.round(v * 10) / 10;

// ---- sources: where each live card comes from (step 3 of the package)
// Cards that stay without a source, and why (tests/card-pass-2026-10-19.js reads this list).
const SOURCELESS = {
  'red-dragon': 'one of the five hidden Dragons (Supreme): the Dragons long-quest is the owner\'s call (Map 50+, one every 25 maps)',
  'white-dragon': 'one of the five hidden Dragons (Supreme): the Dragons long-quest is the owner\'s call',
  'blue-dragon': 'one of the five hidden Dragons (Supreme): the Dragons long-quest is the owner\'s call',
  'green-dragon': 'one of the five hidden Dragons (Supreme): the Dragons long-quest is the owner\'s call',
  'black-dragon': 'one of the five hidden Dragons (Supreme): the Dragons long-quest is the owner\'s call',
  'caldera-wyrm': 'enemy only: the Map 20 world boss\'s leader (20-B-4), over the budget as a boss',
  'rimeheart-colossus': 'enemy only: the Map 22 boss card (22-8), its note: "Enemy only for now"',
  'marshal-tuskwell': 'enemy only: the Map 23 boss card (23-8), its note: "Enemy only for now"',
  'magnate-duck': 'enemy only: the Map 24 boss card (24-8), its note: "Enemy only for now"',
  'great-gate': 'enemy only: the gate the player breaks in 23-7 and 24-1',
  'missingno': 'the secret card #0; its secret (a Map 21 find) isn\'t built, so its map pointer has no fight',
  'wandering-mage': 'held: the free leader for Map 51 (its design note)',
  // parked for a map that doesn't exist yet (the 2026-10-16 placement's suggested map, all past Map 24)
  'gloom-gibbon': 'held for its suggested map (Map 26)', 'hagfish-silencer': 'held for its suggested map (Map 27)', 'lichen-tortoise': 'held for its suggested map (Map 25)',
  'sperm-whale-elder': 'held for its suggested map (Map 38)', 'thunder-lizard': 'held for its suggested map (Map 41)', 'corpse-flower-beetle': 'held for its suggested map (Map 31)',
  'salamander-pyromancer': 'held for its suggested map (Map 40)', 'starfall-owl': 'held for its suggested map (Map 52, Legendary)', 'tardigrade': 'held for its suggested map (Map 30)',
  'ice-fish': 'held for its suggested map (Map 36)', 'leopard-seal': 'held for its suggested map (Map 25)', 'supernova-jelly': 'held for its suggested map (Map 45)',
  'geode-scorpion': 'held for its suggested map (Map 27)', 'snow-leopard': 'held for its suggested map (Map 29)',
  // parked by design for late or themed maps that don't exist yet
  'ember-wisp': 'parked: the Elementals wait for Map 50+ (decided 2026-10-16)', 'gale-sprite': 'parked: the Elementals wait for Map 50+', 'stoneheart-golem': 'parked: the Elementals wait for Map 50+', 'stormcaller': 'parked: the Elementals wait for Map 50+',
  'mirrorhide-mutant': 'parked: the late Twin card (the mutants\' Maps 40-50 build-up)',
  'raven-harbinger': 'parked: an omen raven for a raven/omen fight (none on Maps 0-24)', 'raven-hexcaller': 'parked: an omen raven for a raven/omen fight (none on Maps 0-24)', 'bone-diviner': 'parked: an omen raven for a raven/omen fight (none on Maps 0-24)',
  'colony': 'parked: an insect spawner structure for a hive map (none yet)', 'nest': 'parked: an insect spawner structure for a hive map (none yet)',
  'moon-jelly': 'parked: Moonpull waits (owner: "dont do moonpull yet till >Map 10 or Map 20"); no fitting ocean fight past Map 10 yet',
};
// Fixed choices: the three map leaders with no home take their map's last fight, as every other map leader does; a raid's namesake its raid
const FIXED = {
  'the-gannet-queen': {map: 'mc', last: true, why: 'Gannet Cliffs\' leader: its last fight gives her, as each map\'s boss gives its leader (Map 3 had none)'},
  'old-snapjaw': {map: 'mw', last: true, why: 'Gatorback Swamp\'s leader: its last fight gives him, as each map\'s boss gives its leader (Map 5 had none)'},
  'triumvirate': {map: 'm23', node: '23-8', why: 'the Savanna\'s Unique Dictator leads the siege: the Map 23 boss gives him (a Unique fits the Map 21-35 boss cap)'},
  'shrine-high-priest': {map: 'm21', node: '21-6', why: 'the Quiet Summit\'s chapel (Worship and Prayer, the 2026-10-16 placement\'s home): its boss gives the High Priest'},
  'shrine-bell-ringer': {map: 'm11', node: '20-4', why: 'Shrine Steps, the 2026-10-16 placement\'s home, beside the Shrine Acolyte'},
};
// The 2026-10-16 placement's own homes for cards the later retunes took out of their fights, and the suggested maps (Maps 20-24) that exist now
const PREFER = {'baby-bat': 'm4', 'chipmunk-skirmisher': 'mf', 'dam-wall': 'mp', 'lions-mane-jelly': 'm7', 'shrine-bell-ringer': 'm11', 'shrine-high-priest': 'm21', 'snapstick-turtle': 'm2', 'vampire-bat': 'm8',
  'werebadger': 'm24', 'glasswing-butterfly': 'm11', 'margay': 'm22', 'electric-catfish': 'm22', 'elephant-nose-fish': 'm23', 'anaconda-coil': 'm24', 'ice-petrel': 'm22', 'dynamite-packrat': 'm4',
  'tusked-vanguard': 'mr', 'subterraneaner': 'm4', 'narwhal-lancer': 'm6', 'adder-ambusher': 'm8', 'antler-skirmisher': 'mr', 'colossal-squid': 'mj', 'ant-hill': 'mu',
  'margay': 'mr', // a forest cat: the Redwood Deep has the map's cats (its suggested Map 22 has none)
  'obsidian-lich': 'me', 'ember-revenant': 'me', // the ossuary's undead: they fight only in the Eye of the Volcano's dungeon waves
  'deep-cave-troll': 'm11'}; // it fights only as the 20-R raid boss's army (a raid boss gives no card): a Sundered Peak fight, the Cave Warlord's bears
// Rewards that sit off their map's theme and outside their fight, clearly: moved to a fight of a map whose theme has them (the rest of the
// odd list is kept, each plausible: the doc lists them)
const MOVE = {'duckling-squadron': 'mp', 'canopy-sloth-guardian': 'my', 'slowpoke-sentinel': 'my', 'pack-rat-looter': 'ml', 'jackrabbit-sprinter': 'ml', 'jay-pilferer': 'mf', 'rootworm-colony': 'mu'};
const MYSTERY = new Set(['irradiated-axolotl', 'irradiated-glow-wyrm']); // the mutants go to the wandering trader's Mystery Booster with its oddities
function planSources(plan){
  const B = require('./lib_bramble.js'), TH = require('./thematic_pass_2026_10_19.js'), G = B.G, MAPS = B.MAPS, D = B.CARD_DEFS_BASELINE;
  const rarOf = id=> (plan.rarity && plan.rarity[id] && plan.rarity[id].to) || D[id].rarity;
  const mains = MAPS.filter(m=> !m.sub && !m.reserved && !m.tower), mainOf = m=> m.sub ? MAPS.find(x=> x.id === m.parent) : m, noOf = m=> mains.indexOf(mainOf(m));
  const SKIPM = new Set(['mtut', 'mm', 'mlb']), usable = m=> !m.reserved && !m.tower && !SKIPM.has(m.id);
  const rewards = {}; MAPS.forEach(m=> (m.nodes || []).forEach(n=> rewards[m.id + ':' + n.key] = G.nodeRewardCardIds(m.id, n.key).length));
  const appear = {}; MAPS.filter(usable).forEach(m=> (m.nodes || []).forEach(n=> Object.entries(n.deck || {}).forEach(([id, k])=> (appear[id] = appear[id] || []).push({m, n, k}))));
  const types = d=> [...(d.archetypes || []), ...(d.species || [])];
  const STEP = r=> ['common','uncommon','rare','veryrare','superrare','epic','heroic','unique','legendary'].indexOf(r === 'starter' ? 'common' : r);
  const kindFit = (rar, kind)=>{ const s = STEP(rar), k = /boss/.test(kind) ? 'boss' : kind; if(s <= 1) return k === 'skirmish' ? 4 : 0; if(s === 2) return k === 'elite' ? 3 : k === 'skirmish' ? 2 : 0; return k === 'elite' || k === 'boss' ? 6 : 0; };
  const nameWords = d=> d.name.toLowerCase().split(/[^a-z]+/).filter(w=> w.length > 3);
  const pick = (id, cands)=>{ const d = D[id], rar = rarOf(id); let best = null;
    cands.forEach(({m, n, k})=>{ if(n.kind === 'raidboss' || n.kind === 'tutorial' || !n.deck) return; if(!G.roadRarityOk(rar, noOf(m), n.kind)) return;
      const r = rewards[m.id + ':' + n.key] || 0; if(r >= 3) return;
      const named = nameWords(d).some(w=> (n.name || '').toLowerCase().includes(w));
      const sc = -r * 20 + (k || 0) * 2 + (named ? 15 : 0) + (m.sub ? 0 : 2) + kindFit(rar, n.kind);
      if(!best || sc > best.sc) best = {m, n, sc, named}; });
    return best; };
  const sources = [], sourceless = [], odd = [];
  const assign = (id, m, n, why)=>{ rewards[m.id + ':' + n.key] = (rewards[m.id + ':' + n.key] || 0) + 1; sources.push({id, name: D[id].name, rarity: rarOf(id), source: {kind: 'map', id: m.id, node: n.key}, from: D[id].source || null, where: `${n.key} ${n.name} (${n.kind}, ${m.name})`, why}); };
  const live = Object.values(D).filter(c=> !c.test && !c.token && !c.pool && !c.hallOfFame && !c.baseId && c.cardType !== 'materia');
  const obtainable = c=>{ const s = G.cardSourceOf(c); return ['pack','base','raid','nest','smith','secret','quest'].includes(s.kind) || (s.kind === 'map' && !!s.node); };
  for(const c of live.sort((a, b)=> a.id < b.id ? -1 : 1)){
    if(obtainable(c) && !MOVE[c.id]) continue;
    if(MOVE[c.id]){ const was = c.source; rewards[was.id + ':' + was.node]--; }
    if(SOURCELESS[c.id]){ sourceless.push({id: c.id, name: c.name, rarity: c.rarity, why: SOURCELESS[c.id], had: c.source || null}); continue; }
    const fx = FIXED[c.id];
    if(fx){ const m = MAPS.find(x=> x.id === fx.map), n = fx.last ? m.nodes.filter(x=> x.kind !== 'raidboss' && x.kind !== 'tutorial').slice(-1)[0] : m.nodes.find(x=> x.key === fx.node); assign(c.id, m, n, fx.why); continue; }
    // A: a fight it already plays in (on theme there by the thematic pass), inside the road's reward cap
    const a = pick(c.id, appear[c.id] || []);
    if(a){ assign(c.id, a.m, a.n, `it fights there${a.named ? ' (its namesake fight)' : ''}; ${(appear[c.id] || []).length} fight(s) field it`); continue; }
    // B: a fight of a map whose theme has its type, nearest its preferred map (the 2026-10-16 home, a suggested map, where it fights now)
    const pref = MOVE[c.id] || PREFER[c.id] || ((appear[c.id] || [])[0] || {}).m && ((appear[c.id] || [])[0]).m.id;
    if(pref){ const pno = noOf(MAPS.find(x=> x.id === pref)); let bestB = null;
      MAPS.filter(usable).forEach(m=>{ const spec = TH.THEMES[m.id]; if(!spec) return; if((spec.ban || []).includes(c.id)) return;
        if(!types(c).some(t=> (spec.tags || []).includes(t)) && !(spec.allow || []).includes(c.id)) return;
        const dist = Math.abs(noOf(m) - pno) + (m.id === pref ? -0.5 : 0); if(dist > 3) return;
        const p = pick(c.id, (m.nodes || []).map(n=> ({m, n, k: 0}))); if(!p) return; const sc = -dist * 10 + p.sc;
        if(!bestB || sc > bestB.sc) bestB = {m: p.m, n: p.n, sc}; });
      if(bestB){ assign(c.id, bestB.m, bestB.n, (MOVE[c.id] ? `moved from ${c.source.node} (off its map's theme, not in that fight): ` : '') + `a reward on a ${bestB.m.name} fight: its theme has the card's type (${types(c).filter(t=> (TH.THEMES[bestB.m.id].tags || []).includes(t)).join('/') || 'allowed'}), near its home map (${MAPS.find(x=> x.id === pref).name})`); continue; }
    }
    // C: the packs (common to Epic; never a Legendary in Packs 1-3)
    if(STEP(rarOf(c.id)) >= STEP('legendary')){ sourceless.push({id: c.id, name: c.name, rarity: c.rarity, why: 'a Legendary with no fitting fight (no Legendary in Packs 1-3)', had: c.source || null}); continue; }
    const tier = MYSTERY.has(c.id) ? 99 : 1;
    sources.push({id: c.id, name: c.name, rarity: rarOf(c.id), source: {kind: 'pack', tier}, where: tier === 99 ? 'the Mystery Booster (the wandering trader)' : 'the basic pack pool (Hedgerow Pouch, Tidemire Chest, Highcrest Case)',
      why: c.source && c.source.kind === 'design' ? `a ${c.source.id} design card with no fight of its own` : 'no fight fields it and no map theme near its home fits'});
  }
  // odd sources among the cards that have one: a map reward off its map's theme, a source on a fight that doesn't exist
  live.forEach(c=>{ const s = c.source; if(!s || s.kind !== 'map' || !s.node) return; const m = MAPS.find(x=> x.id === s.id), n = m && (m.nodes || []).find(x=> x.key === s.node);
    if(!n){ odd.push({id: c.id, why: 'reward of a fight that does not exist', source: s}); return; }
    const spec = TH.THEMES[m.id]; if(!spec || SKIPM.has(m.id) || (c.effects || {}).leader || types(c).includes('Leader')) return;
    if(MOVE[c.id]) return;
    if(!types(c).some(t=> (spec.tags || []).includes(t)) && !(spec.allow || []).includes(c.id) && !Object.keys(n.deck || {}).includes(c.id)) odd.push({id: c.id, name: c.name, why: `reward of ${s.node} (${m.name}) but not of its theme and not in that fight`, types: types(c)}); });
  return {sources, sourceless, odd};
}

module.exports = {winRate, BANDS, bandOf, SC, SCM, skipReason, live, tagRows, outside, defs, RAW, FILLER, readJsonl, SOURCELESS, planSources};
if(require.main !== module) return;

if(CMD === 'measure'){
  const tag = opt('tag', 'screen'), OUT = path.join(OUTDIR, `card-pass-${tag}.s${SHARD}.jsonl`);
  const done = new Set(Object.keys(tagRows(tag)));
  let ids = cards.filter(live).map(c=> c.id).sort();
  const ONLY = opt('only', '').split(',').filter(Boolean); if(ONLY.length) ids = ids.filter(id=> ONLY.includes(id));
  if(opt('from')){ const from = tagRows(opt('from')), cut = +opt('outside', 3); ids = ids.filter(id=> from[id] && Math.abs(outside(from[id].wr / 100, RAW[id].rarity)) > cut && (!argv.includes('--measured') || !skipReason(RAW[id]))); }
  const mine = ids.filter((id, i)=> i % NSH === SHARD && !done.has(id));
  console.log('cards', ids.length, 'mine', mine.length, 'games', GAMES);
  const t0 = Date.now();
  for(const id of mine){ const t = Date.now(), wr = winRate(id, null, GAMES), c = RAW[id], b = SC.budget(c), bm = SCM.budget(c);
    fs.appendFileSync(OUT, JSON.stringify({id, name: c.name, rarity: c.rarity || null, cost: c.cost||0, wait: c.wait||0, attack: c.attack||0, health: c.health||0,
      wr: r1(wr * 100), games: GAMES, band: bandOf(c.rarity).map(x=> x * 100), outside: r1(outside(wr, c.rarity)), skip: skipReason(c),
      budget: {N: b.N, S: b.S, ok: b.ok, x1: b.x1, x2: b.x2, N2: b.N2}, budgetM: {S: bm.S, ok: bm.ok}, ms: Date.now() - t}) + '\n'); }
  console.log('done', ((Date.now() - t0) / 1000).toFixed(0) + 's');
} else if(CMD === 'search'){
  const from = tagRows(opt('from', 'confirm')), cut = +opt('outside', 8), tag = opt('tag', 'search'), OUT = path.join(OUTDIR, `card-pass-${tag}.s${SHARD}.jsonl`);
  const done = new Set(Object.keys(tagRows(tag)));
  const ONLY = opt('only', '').split(',').filter(Boolean);
  const TRIES = +opt('tries', 14), MARGIN = +opt('margin', 2) / 100, NOLUMBER = argv.includes('--nolumber');
  const todo = Object.values(from).filter(r=> (ONLY.length ? ONLY.includes(r.id) : (!r.skip && Math.abs(r.outside) > cut))).sort((a, b)=> a.id < b.id ? -1 : 1)
    .filter((r, i)=> i % NSH === SHARD && !done.has(r.id));
  console.log('outliers to search', todo.length);
  for(const r of todo){ const t = Date.now(), c = RAW[r.id], [lo, hi] = bandOf(c.rarity), dir = r.outside > 0 ? -1 : 1, A = c.attack||0, H = c.health||0;
    // the variants: Attack 0..3 steps, Health in 10% steps up to 50% (at least 1 a step), both directions toward the band
    const hStep = Math.max(1, Math.round(H * 0.10)), vars = [];
    for(let da = 0; da <= 3; da++) for(let dh = 0; dh <= 5; dh++){ if(!da && !dh) continue;
      const a = A + dir * da, h = H + dir * dh * hStep; if(a < 0 || h < 1) continue; if(dir < 0 && A > 0 && a === 0 && (c.attack||0) > 0 && !((c.archetypes||[]).includes('Structure'))) continue; // never take a fighter to 0 Attack
      const size = 2 * da + dh * hStep, rel = (da / Math.max(1, A)) + (dh * hStep / Math.max(1, H));
      vars.push({attack: a, health: h, size, rel}); }
    vars.sort((x, y)=> x.size - y.size || x.rel - y.rel);
    // A 2+ Lumber card far under its band: the 2026-10-18 pass's Lumber cut (owner 2026-10-18: "Yea, don't let high lumber cost be
    // normal"), one Lumber less (two for 3+, never below 1), stats re-fit to budget v3 at the new Lumber, tried after the plain stat steps
    if(dir > 0 && (c.cost||0) >= 2){ const cuts = [(c.cost||0) - 1]; if((c.cost||0) >= 3) cuts.push(Math.max(1, (c.cost||0) - 2));
      cuts.forEach(L=>{ for(let a = Math.max(0, A - 3); a <= A + 2; a++) for(let f = 0.6; f <= 1.31; f += 0.1){ const h = Math.max(1, Math.round(H * f));
        vars.push({attack: a, health: h, cost: L, size: 100 * ((c.cost||0) - L) + 2 * Math.abs(a - A) + Math.abs(h - H), rel: 0}); } }); }
    const target = (lo + hi) / 2; let found = null, best = null, tried = 0;
    for(const v of vars){
      const ov = v.cost != null ? {attack: v.attack, health: v.health, cost: v.cost} : {attack: v.attack, health: v.health};
      const b = SC.budget(Object.assign({}, c, ov)); if(!b.ok) continue;
      if(v.cost != null && NOLUMBER) break;
      if(tried >= (v.cost != null ? 24 : TRIES)) { if(v.cost == null) continue; break; } tried++;
      const wr = winRate(r.id, ov, GAMES);
      const cand = Object.assign({}, v, {wr: r1(wr * 100), budgetOk: b.ok});
      if(!best || Math.abs(wr - target) < Math.abs(best.wr / 100 - target)) best = cand;
      if(wr >= lo + MARGIN && wr <= hi - MARGIN){ found = cand; break; }
    }
    let pick = found || best, confirm = null;
    if(pick){ confirm = r1(winRate(r.id, pick.cost != null ? {attack: pick.attack, health: pick.health, cost: pick.cost} : {attack: pick.attack, health: pick.health}, 400) * 100); }
    fs.appendFileSync(OUT, JSON.stringify({id: r.id, name: c.name, rarity: c.rarity, from: {attack: A, health: H, wr: r.wr, games: r.games}, band: [lo * 100, hi * 100],
      found: !!found, pick, confirm400: confirm, tried, ms: Date.now() - t}) + '\n');
    console.log(r.id, `${A}/${H} ${r.wr}%`, '->', pick ? `${pick.attack}/${pick.health} ${pick.wr}% (400: ${confirm}%)` : 'none', found ? 'IN' : 'near', ((Date.now() - t) / 1000).toFixed(0) + 's');
  }
} else if(CMD === 'plan'){
  // node tools/card_pass_2026_10_19.js plan  -> docs/balance/card-pass-plan.json (stats; rarity and sources come after, see `sources`)
  // The choices, from the measures: confirm (400 games, every non-skip card > 3 points out at 100), search / search3 (stat steps at 100
  // games, the pick confirmed at 400), refine / refine2 (the strong side and the crossings, every step at 400).
  //   IN       the 400-game rate of the pick is inside the band: applied
  //   TOWARD   5+ points nearer, not past the band's far edge, no Lumber change: applied ("toward its band")
  //   EDGE     past the far edge by under 1 point (inside the noise of 400 games): applied
  //   else     left, and reported (a skill / cost question, or a Lumber cliff)
  const conf = Object.assign({}, tagRows('screen'), tagRows('confirm'));
  const S = Object.assign({}, tagRows('search'), tagRows('search3')), R = Object.assign({}, tagRows('refine'), tagRows('refine2'));
  // hand picks among measured variants (each measured at 400 games): the smallest change nearest the band
  const HAND = {'bramblewood-macaque': {attack: 2, health: 4, wr: 75.5, why: 'the owner\'s open call (action items: "only fix found is 2/10 -> 2/4"); 2/4 measured 75.5% at 400 games (1/5 78.8%, 2/5 85.5%, 1/6 88.3%)'},
    'swarm-matriarch': {attack: 1, health: 7, wr: 75.3},
    'brimstone-hound': {attack: 3, health: 3, wr: 70.5, why: '3/3 measured nearest (3/4 73.3%, 2/5 74.8%, 2/6 78.5%; 3/2 70.8%)'},
    'upside-down-bat': {attack: 1, health: 2, wr: 44.5, why: '1/2 (2/1 78%, 1/1 44.8%)'},
    'puddle-changeling': {attack: 2, health: 3, wr: 58.8, why: '2/3 (2/4 69.8%, 2/2 56.8%, 1/6 50.5%)'}};
  // Sacrifice cards whose strength is the CPU sacrificing them: a stat cut hardly moves them (Ash Imp 1/2 still 94%), so both are left for
  // a look at Sacrifice itself (the 2026-10-18 pass left them too)
  const NOSTAT = new Set(['cinder-imp', 'ash-imp']);
  const stats = {}, left = [];
  Object.values(conf).forEach(x=>{ const c = RAW[x.id], sk = skipReason(c); if(Math.abs(x.outside) <= 8 || x.games < 400 && !S[x.id]) return;
    // a deck-plan card or wall that measures far ABOVE its band shows its strength even without its plan, so it is tuned; below, it is left
    const deckplanHigh = (sk === 'deckplan' || sk === 'wall') && x.outside > 0; if(sk && !(deckplanHigh && S[x.id])) return;
    if(NOSTAT.has(x.id)){ left.push({id: x.id, name: c.name, rarity: c.rarity, wr: x.wr, why: 'a Sacrifice card: its strength is the sacrifice, a stat cut hardly moves it (1 Attack / Health less: 91-94%)'}); return; }
    let p = null, wr = null, src = '';
    if(HAND[x.id]){ p = HAND[x.id]; wr = p.wr; src = 'hand pick'; }
    else { const cands = [S[x.id] && S[x.id].pick && {p: S[x.id].pick, wr: S[x.id].confirm400, src: 'search'}, R[x.id] && R[x.id].pick && {p: R[x.id].pick, wr: R[x.id].confirm400, src: 'refine (every step at 400 games)'}].filter(Boolean);
      const o = w=> Math.abs(outside(w / 100, c.rarity)); cands.sort((a, b)=> o(a.wr) - o(b.wr)); if(cands.length){ p = cands[0].p; wr = cands[0].wr; src = cands[0].src; } }
    const before = x.wr; if(!p){ left.push({id: x.id, wr: before, why: 'no step tried'}); return; }
    const o0 = outside(before / 100, c.rarity), o1 = outside(wr / 100, c.rarity), cross = Math.sign(o0) * Math.sign(o1) < 0, imp = Math.abs(o0) - Math.abs(o1), lum = p.cost != null && p.cost !== c.cost;
    const verdict = !o1 ? 'IN' : (!cross && imp >= 5 && !lum) ? 'TOWARD' : (Math.abs(o1) < 1 && imp >= 5) ? 'EDGE' : null;
    if(!verdict){ left.push({id: x.id, name: c.name, rarity: c.rarity, wr: before, tried: `${p.attack}/${p.health}${lum ? ' at ' + p.cost + ' Lumber' : ''}: ${wr}%`, why: lum ? 'a Lumber cut that misses the band (the 2026-10-18 rule: a Lumber cut only when it lands in the band)' : cross ? 'the nearest step crosses the band' : 'no budget-legal step moved it 5 points (a skill / role question)'}); return; }
    const band = bandOf(c.rarity).map(v=> Math.round(v * 100)).join('-') + '%';
    stats[x.id] = {name: c.name, rarity: c.rarity, from: {attack: c.attack, health: c.health, cost: c.cost || 0}, attack: p.attack, health: p.health, cost: lum ? p.cost : undefined, wrBefore: before, gamesBefore: x.games, wrAfter: wr, band, verdict, nearest: verdict !== 'IN', src,
      why: (o0 > 0 ? 'above' : 'below') + ` its ${c.rarity} band (${band})` + (verdict === 'TOWARD' ? '; the nearest budget-legal step, toward the band' : verdict === 'EDGE' ? '; lands on the band\'s edge' : '') + (lum ? '; one Lumber less (owner 2026-10-18: high Lumber shouldn\'t be normal)' : '') + (HAND[x.id] && HAND[x.id].why ? '; ' + HAND[x.id].why : '')}; });
  // budget v3 fits for the three cards the 10-19 cost model put over (CHANGELOG, package SC): one Health each
  [['raven-harbinger', 5, 18], ['bone-diviner', 5, 19], ['magnate-duck', 6, 59]].forEach(([id, a, h])=>{ const c = RAW[id];
    stats[id] = {name: c.name, rarity: c.rarity, from: {attack: c.attack, health: c.health, cost: c.cost || 0}, attack: a, health: h, fit: true, wrBefore: (conf[id] || {}).wr, wrAfter: r1(winRate(id, {attack: a, health: h}, 100) * 100), band: bandOf(c.rarity).map(v=> Math.round(v * 100)).join('-') + '%', verdict: 'FIT',
      why: 'budget v3 fit: the 2026-10-19 skill-cost model put it just over (Bounty / On Kill Gain); one Health less passes'}; });
  const PLAN = path.join(OUTDIR, 'card-pass-plan.json'); let plan = {}; try{ plan = JSON.parse(fs.readFileSync(PLAN, 'utf8')); }catch(e){}
  Object.assign(plan, {note: 'Package CB (2026-10-19): the card pass. stats / rarity / sources are applied by `node tools/card_pass_2026_10_19.js apply`.', stats, left});
  fs.writeFileSync(PLAN, JSON.stringify(plan, null, 1) + '\n');
  const v = {}; Object.values(stats).forEach(s=> v[s.verdict] = (v[s.verdict] || 0) + 1); console.log('stat changes', Object.keys(stats).length, v, 'left', left.length);
} else if(CMD === 'sources'){
  // node tools/card_pass_2026_10_19.js sources [--plan=card-pass-plan]  -> fills plan.sources (and plan.sourceless) in docs/balance/<plan>.json
  const PLAN = path.join(OUTDIR, opt('plan', 'card-pass-plan') + '.json'), plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
  const res = planSources(plan); plan.sources = res.sources; plan.sourceless = res.sourceless; plan.oddSources = res.odd;
  fs.writeFileSync(PLAN, JSON.stringify(plan, null, 1) + '\n');
  const k = {}; res.sources.forEach(s=> k[s.source.kind + (s.source.kind === 'pack' ? s.source.tier : '')] = (k[s.source.kind + (s.source.kind === 'pack' ? s.source.tier : '')] || 0) + 1);
  console.log('sources', res.sources.length, k, 'stay sourceless', res.sourceless.length, 'odd', res.odd.length);
} else if(CMD === 'apply'){
  // node tools/card_pass_2026_10_19.js apply [--plan=card-pass-plan] [--dry]: the plan's stats, rarities and sources into canonical/cards.json,
  // each changed card with a "2026-10-19 (card pass, package CB)" line in its creatorNote
  const PLAN = path.join(OUTDIR, opt('plan', 'card-pass-plan') + '.json'), plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
  const CARDS = path.join(ROOT, 'canonical/cards.json'), all = JSON.parse(fs.readFileSync(CARDS, 'utf8')), by = {}; all.forEach(c=> by[c.id] = c);
  const notes = {}, add = (id, t)=> (notes[id] = notes[id] || []).push(t); let n = 0;
  Object.entries(plan.stats || {}).forEach(([id, x])=>{ const c = by[id]; if(!c) throw new Error('no card ' + id);
    const was = `${c.attack}/${c.health}` + (x.cost != null && x.cost !== c.cost ? `, ${c.cost} Lumber` : ''), now = `${x.attack}/${x.health}` + (x.cost != null && x.cost !== c.cost ? `, ${x.cost} Lumber` : '');
    add(id, `${was} -> ${now} (${x.why}; ${x.wrBefore}% -> ${x.wrAfter}% at 400 games, band ${x.band})`);
    c.attack = x.attack; c.health = x.health; if(x.cost != null) c.cost = x.cost; n++; });
  Object.entries(plan.rarity || {}).forEach(([id, x])=>{ const c = by[id]; add(id, `rarity ${c.rarity} -> ${x.to} (${x.why})`); c.rarity = x.to; n++; });
  (plan.sources || []).forEach(s=>{ const c = by[s.id]; if(!c) throw new Error('no card ' + s.id);
    add(s.id, `source: ${s.where} (${s.why})` + (s.from && s.from.kind ? `; was ${s.from.kind}${s.from.node ? ' ' + s.from.node : s.from.id ? ' ' + s.from.id : ''}` : '')); c.source = s.source; n++; });
  Object.entries(notes).forEach(([id, t])=>{ const c = by[id]; c.creatorNote = ((c.creatorNote || '') + ` 2026-10-19 (card pass, package CB): ${t.join('; ')}.`).trim(); });
  console.log('changes', n, 'cards', Object.keys(notes).length);
  if(!argv.includes('--dry')) fs.writeFileSync(CARDS, JSON.stringify(all, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
} else if(CMD === 'report'){
  // node tools/card_pass_2026_10_19.js report  -> docs/balance/card-balance.json in card_balance.js's shape, from this pass's measures (the
  // changed cards at their new stats, 400 games; the confirmed cards 400; the rest 100), so the deck tools rank cards by today's numbers
  const plan = JSON.parse(fs.readFileSync(path.join(OUTDIR, 'card-pass-plan.json'), 'utf8')), conf = Object.assign({}, tagRows('screen'), tagRows('confirm'));
  const now = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), NOW = {}; now.forEach(c=> NOW[c.id] = c);
  const rows = Object.values(conf).sort((a, b)=> a.id < b.id ? -1 : 1).map(x=>{ const c = NOW[x.id], st = (plan.stats || {})[x.id], wr = st ? st.wrAfter : x.wr, [lo, hi] = bandOf(c.rarity);
    const b = SC.budget(c), d = defs[x.id] || {};
    return {id: x.id, name: c.name, rarity: c.rarity || null, cost: c.cost || 0, wait: c.wait || 0, attack: c.attack || 0, health: c.health || 0,
      skills: Object.keys(c.effects || {}).filter(k=> k !== 'triggers').concat(((c.effects || {}).triggers || []).length ? ['triggers'] : []),
      winRate: wr, games: st ? (st.fit ? 100 : 400) : x.games, band: [lo * 100, hi * 100], verdict: wr / 100 > hi ? 'strong' : wr / 100 < lo ? 'weak' : 'ok', locked: !!c.locked, source: (c.source || {}).kind || 'base',
      startsAt0: !!d.startsAt0, budget: {N: b.N, S: b.S, x1: b.x1, x2: b.x2, N2: b.N2, ok: b.ok}, note: d.startsAt0 ? 'measured at Lv 1 (starts at Lv 0: its first level is a major +10% step)' : undefined}; });
  const out = {generated: '2026-10-19', games: '100 (400 for the cards the card pass confirmed or changed)', mode: 'open', filler: FILLER, bands: BANDS, by: 'tools/card_pass_2026_10_19.js report (package CB)', rows};
  fs.writeFileSync(path.join(OUTDIR, 'card-balance.json'), JSON.stringify(out, null, 1) + '\n');
  const cnt = v=> rows.filter(r=> r.verdict === v).length; console.log(rows.length, 'rows:', cnt('strong'), 'strong,', cnt('weak'), 'weak,', cnt('ok'), 'in band');
} else if(CMD === 'rows'){
  const rows = Object.values(tagRows(opt('tag', 'screen')));
  const by = {}; rows.forEach(r=>{ const k = r.skip || 'measured'; by[k] = by[k] || {n: 0, inBand: 0, out8: 0}; by[k].n++; if(!r.outside) by[k].inBand++; if(Math.abs(r.outside) > 8) by[k].out8++; });
  console.log(rows.length, 'rows'); console.log(by);
}
