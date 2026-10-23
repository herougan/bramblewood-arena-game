#!/usr/bin/env node
// Special (non-player) monsters against the stat budget (2026-10-19, package RJ, owner 15:48: "Justify special monster stats like Raid
// monster stats. What would that card's BR be then?"). An analysis: it changes no stats.
// For every monster only the enemy fields (the raid's elders / boss units, its row-deck copies, its Commons, the Core's stumps, the raid
// and async-raid brambles, the conquest bosses' signature units, the Tower's and the dungeons' specials, canonical/unit-themes.json's
// nonPlayer) it works out, from the stats the game really builds (arena_app.js buildRaidFullFight, levelledEnemyDeck, towerFloorDeck,
// read through tools/lib_bramble.js's grab, as tools/raid_full_sim.js does):
//   score      2A+H+S (and A·H+S), ×1.5 per half-miss skill: SkillCosts.budget (tools/skill_costs.js, canonical/skill-costs.json)
//   N needed   the smallest N that holds it: max(2A+H+S, 3·sqrt(A·H+S)) (both rules are strict: N must be above it)
//   equivalent the first player card whose N holds it: its own Wait and Lumber, its own rarity then each rarity above it up to Legendary,
//              Levels from its start level to 11 (the player cap); past that a Legendary at a Level above 11 on the same N line, and
//              "exceeds any player budget by Y×" against the biggest N any player card has at Level 11
//   N          bramblewood-budget.js (BramblewoodBudget.baseOf / nAt) with canonical/skill-costs.json's budget numbers (v5 now); the v6
//              preview (owner, in progress elsewhere: (Base + L/10)(1 + L/30) + Map × 0.2) is the helper with levelLinDiv 10 and, while
//              the helper has no Map term (no perMap in its DEFAULTS), 0.2 × Map added to Base here
//   BR         the game's battle rating (ratingWeightOf × ratingLevelFactor): as a player card at its equivalent (past Level 11 on the
//              straight line the Tower uses), and what it adds on the boss side now (raidBossBR's parts; enemyDeckLevel's 20-card
//              scaling and 2× leaders; towerDeckBR)
//   node tools/special_monsters.js            writes canonical/special-monsters.json and docs/balance/special-monsters-2026-10-19.md
//   node tools/special_monsters.js --print    prints the tables, writes nothing
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('./lib_bramble.js');
const {E, G, CARD_DEFS_BASELINE, CHARACTER_DEFS} = B;
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SC = require('./skill_costs.js');
const RaidM = require(path.join(ROOT, 'bramblewood-raid.js')), TrenchM = require(path.join(ROOT, 'bramblewood-trench.js'));
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(TABLE);
const RAIDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8'));
const RAID_BOSSES = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raid-bosses.json'), 'utf8'));
const UNIT_THEMES = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8'));
const CARDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const r2 = v=> Math.round(v * 100) / 100, r1 = v=> Math.round(v * 10) / 10;

// ---------- the game's own functions (arena_app.js) ----------
const NAMES = ['RARITY_DEFS', 'RATING_WEIGHT', 'ratingWeightOf', 'ratingLevelFactor', 'deckLevelFrom', 'RARITY_TIER_BANDS', 'canLeadDef', 'RAID_BOSS_ATK', 'raidAllyOf', 'raidAllyLeaderOf',
  'RAID_BOSS_UNIT_ROUNDS', 'RAID_BOSS_UNIT_NAMES', 'raidBossUnitName', 'raidFieldRulesOf', 'mergeRaidCastles', 'RAID_TUNE_DEFAULTS', 'raidTune', 'guildScaledBramble', 'BRAMBLE_SCALE', 'brambleHp', 'brambleChar', 'raidDefScaled', /* BF5 */ 'buildRaidFullFight', 'seededRng',
  'raidCardBR', 'raidBossBR', 'RAID_BRAMBLES', 'raidBrambleOf',
  'hashStr', 'statsBeyondLevel', 'TOWER_LEVEL_CAP', 'TOWER_POOLS', 'TOWER_LUMBER_POOL', 'isLumberSource', 'towerNeedsLumber', 'towerTargetBR', 'seededUnit', 'towerDeckBR', 'towerFloorDeck'];
const A = new Function('E', 'G', 'CARD_DEFS_BASELINE', 'CHARACTER_DEFS', 'RaidM', 'TrenchM', 'require', 'ROOT_TEXTS', [
  'let matchDefsOverlay = {}; const makeSimEngine = E.makeSimEngine; function getCardDefs(){ return Object.assign({}, CARD_DEFS_BASELINE, matchDefsOverlay); }',
  'const cardBaseLevel = G.cardBaseLevel, statsAtLevel = G.statsAtLevel, cardMaxLevel = G.cardMaxLevel, DECK_SIZE = 20; const TEXT = (require(ROOT_TEXTS).TEXT || {}); function TX(k){ return TEXT[k] || k; }',
  ...NAMES.map(B.grab),
  'return {' + NAMES.filter(x=> !/^[A-Z_]+$/.test(x)).join(', ') + ', RATING_WEIGHT, RAID_BOSS_UNIT_ROUNDS, RAID_BOSS_UNIT_NAMES, TOWER_POOLS, TOWER_LEVEL_CAP, getCardDefs};',
].join('\n'))(E, G, CARD_DEFS_BASELINE, CHARACTER_DEFS, RaidM, TrenchM, require, path.join(ROOT, 'bramblewood-texts.js'));

// ---------- the budget ----------
const CFG = {v5: Object.assign({}, TABLE.budget), v6: Object.assign({}, TABLE.budget, {levelLinDiv: 10, perMap: 0.2})};
const HELPER_HAS_MAP = BB.DEFAULTS && BB.DEFAULTS.perMap != null;
function baseOf(d, cfg, map){ const b = BB.baseOf(Object.assign({}, d, {map}), cfg); return (cfg.perMap && !HELPER_HAS_MAP) ? r2(b + cfg.perMap * (Number(map) || 0)) : b; }
function nOf(d, L, cfg, map){ return BB.nAt(baseOf(d, cfg, map), L, cfg); }
const LEGENDARY = BB.LADDER.indexOf('legendary');
const rarityKey = r=> BB.LADDER[BB.rankOf(r)];
const startLevel = d=> G.cardBaseLevel(d);
// The score of a card as it fights ({attack, health, wait, cost, rarity, effects}); N plays no part in x1 / x2.
function scoreOf(d){ const b = T.budget(d, {N: 0}); return {S: b.S, m: b.m, x1: b.x1, x2: b.x2, need: r2(Math.max(b.x1, 3 * Math.sqrt(Math.max(0, b.x2)))), missing: b.missing}; }
const holds = (N, sc)=> N > sc.x1 && require('../bramblewood-budget.js').cap2Limit(N) > sc.x2; // BF11 (2026-10-23)
// The biggest N any player card reaches at Level 11 (its own rarity, Wait and Lumber), the top of every player budget.
const PLAYER_TOP = (()=>{ let best = {N: 0}; CARDS.filter(c=> !c.pool && !c.test && !c.token && !c.baseId && !c.field && !c.eggKind && !c.hatchInto && !c.equip && c.attack != null && c.health != null && (c.source || c.hidden)).forEach(c=>{
  const N5 = nOf(c, 11, CFG.v5, 0), N6 = nOf(c, 11, CFG.v6, 20); if(N5 > best.N) best = {N: N5, N6, id: c.id, name: c.name, rarity: c.rarity, wait: c.wait, cost: c.cost}; }); return best; })();
// The first player card whose N holds the score: {rarity, level, past (above Level 11), N}, + Y (need / the Legendary's N at Level 11 with
// its own Wait and Lumber) and Yany (need / the top player budget).
function equivalentOf(d, sc, cfg, map){
  const r0 = Math.min(LEGENDARY, BB.rankOf(d.rarity)), from = Math.min(1, startLevel(d));
  for(let r = r0; r <= LEGENDARY; r++){ const dd = Object.assign({}, d, {rarity: BB.LADDER[r]});
    for(let L = from; L <= 11; L++){ const N = nOf(dd, L, cfg, map); if(holds(N, sc)) return {rarity: BB.LADDER[r], level: L, past: false, N}; } }
  const leg = Object.assign({}, d, {rarity: 'legendary'}), N11 = nOf(leg, 11, cfg, map), top = cfg === CFG.v6 ? PLAYER_TOP.N6 : PLAYER_TOP.N;
  let L = 12; for(; L <= 2000 && !holds(nOf(leg, L, cfg, map), sc); L++);
  return {rarity: 'legendary', level: L, past: true, N: nOf(leg, L, cfg, map), Y: r2(sc.need / N11), Yany: r2(sc.need / top)};
}
// The smallest player card that holds it: the lowest rarity from Common (Level from its start level), its own Wait and Lumber.
function smallestOf(d, sc, cfg, map){ const from = Math.min(1, startLevel(d));
  for(let r = 1; r <= LEGENDARY; r++){ const dd = Object.assign({}, d, {rarity: BB.LADDER[r]}); for(let L = from; L <= 11; L++){ if(holds(nOf(dd, L, cfg, map), sc)) return {rarity: BB.LADDER[r], level: L}; } }
  return null; }
function brAs(rarity, L){ return r1(A.RATING_WEIGHT[rarityKey(rarity)] * A.ratingLevelFactor(L, Math.max(11, L))); }
const RANK_LABEL = {starter: 'Base', common: 'Common', uncommon: 'Uncommon', rare: 'Rare', veryrare: 'Very Rare', superrare: 'Super Rare', epic: 'Epic', heroic: 'Heroic', unique: 'Unique', legendary: 'Legendary', mythic: 'Mythic', ancient: 'Ancient'};
const rarityName = r=> RANK_LABEL[rarityKey(r)] || r;
function equivText(e, d){
  const card = `Level ${e.level} ${rarityName(e.rarity)} with Wait ${d.wait || 0}, Lumber ${d.cost || 0}`;
  if(!e.past) return `equivalent to a ${card}`;
  return e.Yany >= 1 ? `exceeds any player budget by ${e.Yany}× (${e.Y}× a Lv 11 Legendary with Wait ${d.wait || 0}, Lumber ${d.cost || 0}; the N line reaches it at Lv ${e.level})`
    : `past the player cap with Wait ${d.wait || 0}, Lumber ${d.cost || 0}: ${e.Y}× a Lv 11 Legendary's N (the N line reaches it at Lv ${e.level}); within the top player N (${PLAYER_TOP.name}'s) at ${e.Yany}×`;
}
function skillsText(fx){
  return Object.entries(fx || {}).map(([k, v])=>{
    if(k === 'triggers') return (Array.isArray(v) ? v : []).map(t=> `${t.on}→${t.do}${t.amount != null ? ' ' + t.amount : ''}${t.sub ? ' (' + t.sub + ')' : ''}`).join(', ');
    if(v === true) return k; if(typeof v === 'number') return `${k} ${v}`; if(v && typeof v === 'object') return `${k} ${Object.entries(v).map(([a, b])=> a + ':' + b).join('/')}`; return `${k} ${v}`;
  }).filter(Boolean).join(', ') || '—';
}
// One monster as a player card. d: the stats it fights with; L: the level it fights at; map: the map it is met on (for v6's Map term).
function evaluate(d, L, map){
  const sc = scoreOf(d), N5 = nOf(d, L, CFG.v5, map), N6 = nOf(d, L, CFG.v6, map), e5 = equivalentOf(d, sc, CFG.v5, map), e6 = equivalentOf(d, sc, CFG.v6, map), sm = smallestOf(d, sc, CFG.v5, map);
  return {fx: d.effects || {}, score: sc, level: L, map, N: {v5: N5, v6: N6}, inBand: {v5: holds(N5, sc), v6: holds(N6, sc)}, over: r2(sc.need / N5), equiv: {v5: e5, v6: e6},
    equivText: equivText(e5, d) + (sm && (sm.rarity !== e5.rarity || sm.level !== e5.level) ? `; as small as a Lv ${sm.level} ${rarityName(sm.rarity)} (BR ${brAs(sm.rarity, sm.level)})` : ''),
    smallest: sm ? Object.assign({br: brAs(sm.rarity, sm.level)}, sm) : null, brPlayer: brAs(e5.rarity, e5.level)};
}
const statLine = d=> `${d.attack == null ? '—' : d.attack}/${d.health == null ? '—' : d.health} · W${d.wait || 0} · 🪵${d.cost || 0} · ${rarityName(d.rarity)}`;

// ---------- the raid (the Goliath): its elders, row-deck copies, Commons and guards, from the fight the page builds ----------
// tools/raid_full_sim.js's stateAtShare: an outer part at that share (all three outer parts there, the Core whole); the Core: the outer parts down
function stateAtShare(def, partId, share){
  const core = (def.parts || []).find(p=> p.id === partId && (p.lockedUntil || []).length), atts = [];
  (def.parts || []).forEach(p=>{ const outer = !(p.lockedUntil || []).length, gone = core ? (outer ? 1 : 1 - share) : (outer ? 1 - share : 0);
    const n = Math.round(RaidM.partTotal(p) * Math.max(0, Math.min(1, gone))); if(n > 0) atts.push({raidId: def.id, part: p.id, cycle: 0, owner: 'sim', contribution: n, at: 0}); });
  return RaidM.raidState(def, atts, 0, {cycle: 0});
}
const RAID_MAP = 13; // the Raid Banner opens on Map 13 (arena_app.js UNLOCKS 'raid')
function raidScenarios(p){ return (p.lockedUntil || []).length ? [1, 0.5, 0.005] : [1, 0.5, 0.05]; }
function raidData(def){
  const out = {units: [], rows: [], commons: [], guards: [], brambles: []}, seen = {};
  const pct = v=> (v * 100 >= 1 ? Math.round(v * 100) : r1(v * 100)) + '%';
  def.parts.forEach(p=>{
    const scen = raidScenarios(p).map(share=>{
      const st = stateAtShare(def, p.id, share), f = RaidM.fightFor(def, st, p.id, {});
      const b = A.buildRaidFullFight(def, p.id, f, st, {rng: A.seededRng(1), rand: A.seededRng(7), recordEvents: false, allies: [], myDeck: {}});
      const br = A.raidBossBR(def, f, b), defs = Object.assign({}, A.getCardDefs(), b.overlay);
      const label = `${pct(share)} of the part, raid ${pct(st.fraction)}${st.stage ? ' · ' + st.stage.name : ''}`;
      return {share, st, f, b, br, defs, label, weaken: b.weaken};
    });
    const deck = scen[0].b.cfg.deck, nDeck = Object.values(deck).reduce((a, c)=> a + (c | 0), 0), rows = scen[0].br.rows;
    // the elder (boss unit): every scenario (its Health falls from 50 with the raid)
    scen.forEach(sc=>{ const u = sc.b.bossUnitId && sc.defs[sc.b.bossUnitId]; if(!u) return;
      const d = Object.assign({}, u, {health: (u.health || 0) + (sc.b.bossHpBonus || 0)}), base = CARD_DEFS_BASELINE[u.bossUnitOf] || {}, L = startLevel(base);
      const ev = evaluate(d, L, RAID_MAP), perUnit = sc.br.bossUnitN ? r1(sc.br.bossUnits / sc.br.bossUnitN) : 0;
      out.units.push(Object.assign({group: 'units', id: sc.b.bossUnitId, name: u.name, part: p.id, partName: p.name, scenario: sc.label, share: sc.share, stage: sc.st.stage ? sc.st.stage.name : null,
        weaken: r2(sc.weaken), of: u.bossUnitOf, ofName: base.name, printed0: `; from ${base.name} ${base.attack}/${base.health} (its ~raid copy ${(sc.defs[u.bossUnitOf + '~raid'] || sc.defs[u.bossUnitOf + '~illusory'] || sc.defs[u.bossUnitOf + '~exposed'] || {}).attack}/${(sc.defs[u.bossUnitOf + '~raid'] || sc.defs[u.bossUnitOf + '~illusory'] || sc.defs[u.bossUnitOf + '~exposed'] || {}).health}: +1 Attack, Health ×${r2(1.5 + 1.5 * sc.share)}, + ${sc.b.bossHpBonus} to the elders' ceiling)`, printedStats: {attack: base.attack, health: base.health}, basicHealth: u.health, hpBonus: sc.b.bossHpBonus, stats: pick(d), skills: skillsText(d.effects),
        brBoss: {perCopy: perUnit, copies: sc.br.bossUnitN, inPart: sc.br.bossUnits, partTotal: sc.br.total, note: `${sc.br.bossUnitN} a fight (rounds ${[...A.RAID_BOSS_UNIT_ROUNDS].join(', ')}), each Epic × (1 + ${sc.b.bossHpBonus}/${u.health} Health bonus)`}}, ev)); });
    // the row-deck copies: the strongest point of the raid, with the range
    Object.keys(deck).forEach(nid=>{ const base = CARD_DEFS_BASELINE[nid.split('~')[0]] || {}, L = startLevel(base);
      const at = scen.map(sc=>{ const k = Object.keys(sc.b.overlay).find(id=> id.split('~')[0] === nid && /~(raid|exposed|illusory)$/.test(id)); return {sc, d: k ? sc.defs[k] : null}; }).filter(x=> x.d);
      const top = at.slice().sort((a, b)=> scoreOf(b.d).x1 - scoreOf(a.d).x1)[0]; if(!top) return;
      const ev = evaluate(top.d, L, RAID_MAP), pl = evaluate(base, L, RAID_MAP), per = r1(A.raidCardBR(nid, top.sc.defs));
      const startN = (()=>{ const P2 = top.sc.b.players[2], s = P2.row.left.concat(P2.row.center, P2.row.right, ...(P2.reserve || []).map(r=> Object.values(r))); return s.filter(c=> String(c.defId).split('~')[0] === nid.split('~')[0]).length; })();
      out.rows.push(Object.assign({group: 'rows', id: nid, name: base.name, part: p.id, partName: p.name, scenario: top.sc.label, stats: pick(top.d), printedStats: pick(base), printedEval: {stats: pick(base), over: pl.over, inBand: pl.inBand.v5, N: pl.N.v5, x1: pl.score.x1},
        range: at.map(x=> `${x.d.attack}/${x.d.health}`).join(' → '), skills: skillsText(top.d.effects),
        brBoss: {perCopy: per, copies: r1(rows * (deck[nid] | 0) * 20 / nDeck), inPart: r1(rows * (deck[nid] | 0) * 20 / nDeck * per + startN * per), partTotal: top.sc.br.total, note: `${deck[nid]} of ${nDeck} in the part's deck → ${r1(rows * (deck[nid] | 0) * 20 / nDeck)} copies over ${rows} rows of 20${startN ? `, +${startN} on its board at the start (×2)` : ''}`}}, ev)); });
    // the Commons it can call in
    (scen[0].b.commonPool || []).forEach(nid=>{ if(seen['c:' + nid]) return; seen['c:' + nid] = 1; const base = CARD_DEFS_BASELINE[nid.split('~')[0]] || {}, d = scen[0].defs[nid] || base, L = startLevel(base);
      const ev = evaluate(d, L, RAID_MAP), per = r1(A.raidCardBR(nid, scen[0].defs));
      out.commons.push(Object.assign({group: 'commons', id: nid, name: base.name, part: p.id, partName: p.name, scenario: scen[0].label, stats: pick(d), printedStats: pick(base), skills: skillsText(d.effects),
        brBoss: {perCopy: per, copies: scen[0].br.commonN, inPart: r1(scen[0].br.commons / Math.max(1, (scen[0].b.commonPool || []).length)), partTotal: scen[0].br.total, note: scen[0].br.commonN ? `${scen[0].br.commonN} called in a fight, the pool's average` : `not called in: tuning.reinforce.max is ${((def.tuning || {}).reinforce || {}).max}`}}, ev)); });
    // the guards (the Core's stumps): every scenario
    scen.forEach(sc=>{ Object.keys(sc.defs).filter(id=> id.startsWith('raid-ent-')).forEach(id=>{ const d = sc.defs[id], ev = evaluate(d, 1, RAID_MAP), per = r1(A.raidCardBR(id, sc.defs));
      const twin = out.guards.find(g=> g.part === p.id && g.share === sc.share && g.stats.attack === d.attack && g.stats.health === d.health && g.skills === skillsText(d.effects));
      if(twin){ twin.name += ' / ' + d.name; twin.ids.push(id); twin.brBoss.inPart = r1(twin.brBoss.inPart + 2 * per); twin.brBoss.copies++; return; }
      out.guards.push(Object.assign({group: 'guards', id, ids: [id], name: d.name, part: p.id, partName: p.name, scenario: sc.label, share: sc.share, stats: pick(d), skills: skillsText(d.effects),
        brBoss: {perCopy: per, copies: 1, inPart: r1(2 * per), partTotal: sc.br.total, note: 'on its board at the start, not in the deck: 2× each'}}, ev)); }); });
    // the part's bramble, as a 0-Attack wall
    { const sc = scen[0], cfg = sc.b.cfg, bramble = A.raidBrambleOf(def, p.id), d = {id: 'bramble:' + p.id, name: (bramble && bramble.name) || p.name, attack: 0, health: cfg.castleHp, wait: 0, cost: 0, rarity: 'legendary', effects: {}};
      const ev = evaluate(d, 1, RAID_MAP), raiders = sc.b.players[1].hq.maxHp || sc.b.players[1].hq.hp;
      out.brambles.push(Object.assign({group: 'brambles', id: d.id, name: `${p.name} (${d.name})`, part: p.id, partName: p.name, scenario: sc.label, stats: pick(d),
        skills: (cfg.attacks || []).map(a=> `${a.name} ${a.dmg} every ${a.every} (${a.pattern})`).join(', ') + (cfg.entities && cfg.entities.length && cfg.shieldWhileEntities ? ', shielded while its stumps stand' : ''),
        poolHp: RaidM.partTotal(p), raidersBramble: raiders, vsRaiders: r2(cfg.castleHp / Math.max(1, raiders)), vsPlayer: r2(cfg.castleHp / PLAYER_BRAMBLE.hp),
        brBoss: {perCopy: null, copies: null, inPart: sc.br.total, partTotal: sc.br.total, note: `the part's whole boss BR fresh (decks ${sc.br.decks} + set-up ${sc.br.setUp} + elders ${sc.br.bossUnits} + Commons ${sc.br.commons}); no BR counts a bramble`}}, ev)); }
  });
  return out;
}
function pick(d){ return {attack: d.attack, health: d.health, wait: d.wait || 0, cost: d.cost || 0, rarity: d.rarity || 'common'}; }
// The biggest bramble a player can field: a castle's Health at its top level (castleLeveled: +1 a level, castles reach 20)
const PLAYER_BRAMBLE = (()=>{ let best = {hp: 0}; Object.values(CHARACTER_DEFS).forEach(c=>{ if(!c || !c.health || c.npc || c.boss) return; const hp = (c.health || 0) + 20; if(hp > best.hp) best = {hp, id: c.id, name: c.name, base: c.health}; }); return best; })();

// ---------- async raid bosses (canonical/raid-bosses.json) and the road's raid-boss nodes: a bramble behind live cards ----------
function asyncBosses(){
  const list = RAID_BOSSES.map(rb=> ({id: rb.id, name: rb.name, hqHp: rb.hqHp, deck: rb.deck, where: 'raid-bosses.json (strength ' + rb.strength + ')', map: null}));
  G.CONQUEST_MAPS.forEach(m=> (m.nodes || []).forEach(n=>{ if(n.kind === 'raidboss') list.push({id: m.id + ':' + n.key, name: n.name, hqHp: n.hqHp, deck: n.deck, where: `road node ${n.key}`, map: G.fightMapNumber(n), node: n}); }));
  return list.map(x=>{
    const defs = A.getCardDefs(), n = Object.values(x.deck).reduce((a, c)=> a + c, 0) || 1, lv = id=> startLevel(defs[id]);
    const deckBR = Math.round(A.deckLevelFrom(x.deck, lv, []) * 20 / n);
    const tops = Object.keys(x.deck).filter(id=> defs[id]).map(id=> ({id, ev: evaluate(defs[id], lv(id), x.map || RAID_MAP)})).sort((a, b)=> b.ev.over - a.ev.over);
    const d = {id: 'bramble:' + x.id, name: x.name, attack: 0, health: x.hqHp, wait: 0, cost: 0, rarity: 'legendary', effects: {}}, ev = evaluate(d, 1, x.map || RAID_MAP);
    return Object.assign({group: 'async', id: x.id, name: x.name, where: x.where, stats: pick(d), skills: '—', vsPlayer: r2(x.hqHp / PLAYER_BRAMBLE.hp),
      topCard: tops[0] ? {id: tops[0].id, name: defs[tops[0].id].name, over: tops[0].ev.over, inBand: tops[0].ev.inBand.v5} : null,
      brBoss: {perCopy: null, copies: n, inPart: deckBR, partTotal: deckBR, note: `its ${n}-card deck at base levels, scaled to 20; the bramble adds none`}}, ev);
  });
}

// ---------- the road: each boss's signature units (its leaders, and its strongest card at the level it fights at) ----------
const BOSS_KINDS = ['boss', 'miniboss', 'worldboss', 'dungeon'];
function nodeLevelled(node, deck){ G.resetOverlay(); const out = G.levelledEnemyDeck(node, deck || node.deck) || {}, ov = G.overlay(), defs = A.getCardDefs();
  return Object.keys(out).map(id=>{ const d = ov[id] || defs[id]; if(!d) return null; const base = defs[d.derivedFrom || id] || d; return {id, baseId: d.derivedFrom || id, d, n: out[id], L: d.level != null ? d.level : startLevel(base)}; }).filter(Boolean); }
const DESIGN_OVER = {'red-dragon': 1, 'white-dragon': 1, 'blue-dragon': 1, 'green-dragon': 1, 'black-dragon': 1}; // creatureRank 1: over the budget on purpose (docs/creature-ranks-2026-10-18.md)
function roadBosses(){
  const rows = [];
  G.CONQUEST_MAPS.forEach(m=>{ if(m.endless || m.tower) return; (m.nodes || []).forEach(node=>{
    if(!BOSS_KINDS.includes(node.kind) || !node.deck) return; const map = G.fightMapNumber(node), cards = nodeLevelled(node), n = cards.reduce((a, c)=> a + c.n, 0) || 1;
    const road = Math.round(G.roadEnemyLevelExact(node) || 0), defs = A.getCardDefs();
    // leaders: at the road's level, with the node's leaderGrant
    (node.leaders || []).forEach(id=>{ const base = defs[id]; if(!base) return; const L = Math.max(startLevel(base), road || startLevel(base)), st = G.statsAtLevel(base, L);
      const d = Object.assign({}, base, {attack: st.attack, health: st.health, effects: Object.assign({}, base.effects || {}, node.leaderGrant || {})}), ev = evaluate(d, L, map);
      rows.push(Object.assign({group: 'road', id, name: base.name, node: `${node.key} ${node.name}`, kind: node.kind, role: 'leader' + (node.leaderGrant ? ' (+' + skillsText(node.leaderGrant) + ' granted)' : ''), stats: pick(d), skills: skillsText(d.effects),
        brBoss: {perCopy: r1(2 * A.ratingWeightOf(base) * A.ratingLevelFactor(L)), copies: 1, inPart: r1(2 * A.ratingWeightOf(base) * A.ratingLevelFactor(L)), partTotal: null, note: 'a leader counts 2×'}}, ev)); });
    // the deck's strongest card for its level (the highest score over N), and any card printed over the budget on purpose
    const evs = cards.map(c=> Object.assign({}, c, {ev: evaluate(c.d, c.L, map)})).sort((a, b)=> b.ev.over - a.ev.over);
    const pickd = evs.filter((c, i)=> i === 0 || DESIGN_OVER[c.baseId]);
    const total = Math.round(cards.reduce((t, c)=> t + c.n * A.ratingWeightOf(c.d) * A.ratingLevelFactor(c.L), 0) * 20 / n);
    pickd.forEach(c=>{ const per = r1(A.ratingWeightOf(c.d) * A.ratingLevelFactor(c.L) * 20 / n);
      rows.push(Object.assign({group: 'road', id: c.baseId, name: (defs[c.baseId] || c.d).name, node: `${node.key} ${node.name}`, kind: node.kind, role: 'strongest for its level', stats: pick(c.d), skills: skillsText(c.d.effects),
        brBoss: {perCopy: per, copies: c.n, inPart: r1(per * c.n), partTotal: total, note: `${c.n} of ${n}, Lv ${c.L}, scaled to 20`}}, c.ev)); });
  }); });
  G.resetOverlay();
  return rows;
}

// ---------- the Tower (Babel Spire) and the endless dungeons' floor bosses ----------
function towerRows(){
  const rows = [], defs = CARD_DEFS_BASELINE;
  [1, 10, 20, 30, 40, 50].forEach(f=>{ const t = A.towerFloorDeck(f, defs), n = Object.values(t.deck).reduce((a, c)=> a + c, 0) || 1, map = 20 + f; // the Tower opens past Map 20
    const evs = Object.keys(t.deck).map(id=>{ const L = t.levels[id], st = A.statsBeyondLevel(defs[id], L), d = Object.assign({}, defs[id], {attack: st.attack, health: st.health}); return {id, L, d, ev: evaluate(d, L, map)}; }).sort((a, b)=> b.ev.over - a.ev.over);
    const head = evs.find(x=> A.TOWER_POOLS.legendary.includes(x.id)), pickd = [head, evs[0]].filter((x, i, a)=> x && a.indexOf(x) === i);
    pickd.forEach(x=>{ const per = r1(A.ratingWeightOf(x.d) * A.ratingLevelFactor(x.L, A.TOWER_LEVEL_CAP) * 20 / n);
      rows.push(Object.assign({group: 'tower', id: x.id, name: x.d.name, node: `Tower floor ${f} (BR ${t.br}, target ${t.target})`, role: x === head ? 'the floor\'s Legendary head' : 'strongest for its level', stats: pick(x.d), skills: skillsText(x.d.effects),
        brBoss: {perCopy: per, copies: t.deck[x.id], inPart: r1(per * t.deck[x.id]), partTotal: t.br, note: `Lv ${x.L} (Tower cap ${A.TOWER_LEVEL_CAP}), ${t.deck[x.id]} of ${n}, scaled to 20`}}, x.ev)); });
  });
  // endless dungeons: each tenth floor's boss adds; the Heart of the Mountain's waves' specials
  G.CONQUEST_MAPS.forEach(m=>{ (m.nodes || []).forEach(node=>{
    const isEndlessBoss = m.endless && !m.tower && node.floor && node.floor % 10 === 0, isDungeon = node.dungeon && node.dungeon.waveDecks;
    if(!isEndlessBoss && !isDungeon) return; const map = G.fightMapNumber(node);
    const decks = isDungeon ? node.dungeon.waveDecks.filter(Boolean) : [node.deck];
    const plain = new Set(Object.keys(isEndlessBoss ? ((m.nodes.find(x=> x.floor === node.floor - 1) || {}).deck || {}) : node.deck));
    decks.forEach((dk, wi)=>{ const cards = nodeLevelled(node, dk), n = cards.reduce((a, c)=> a + c.n, 0) || 1;
      const best = {}; cards.filter(c=> !plain.has(c.baseId) && (isEndlessBoss || wi === decks.length - 1)).forEach(c=>{ const k = c.baseId; if(!best[k] || c.L > best[k].L) best[k] = Object.assign({}, c, {n: (best[k] ? best[k].n : 0) + c.n, Ls: (best[k] ? best[k].Ls : []).concat(c.L)}); else { best[k].n += c.n; best[k].Ls.push(c.L); } });
      Object.values(best).forEach(c=>{ const ev = evaluate(c.d, c.L, map), per = r1(A.ratingWeightOf(c.d) * A.ratingLevelFactor(c.L) * 20 / n);
        rows.push(Object.assign({group: 'tower', id: c.baseId, name: c.d.name, node: `${node.key} ${node.name}${isDungeon ? ', door ' + (wi + 2) : ''}`, role: isDungeon ? 'the last door\'s special' : 'the floor boss\'s addition', stats: pick(c.d), skills: skillsText(c.d.effects),
          brBoss: {perCopy: per, copies: c.n, inPart: r1(per * c.n), partTotal: null, note: `${c.n} of ${n}, Lv ${c.Ls.length > 1 ? Math.min(...c.Ls) + '–' + Math.max(...c.Ls) + ' (the road\'s level split over its copies; the higher shown)' : c.L}, scaled to 20`}}, ev)); });
      G.resetOverlay(); });
  }); });
  return rows;
}

// ---------- justifications and flags ----------
// The card as printed, at its start level (a player card's own budget check), for the road's and the Tower's rows
function printedOf(id, map){ const d = CARD_DEFS_BASELINE[id]; if(!d) return null; const ev = evaluate(d, startLevel(d), map); return {stats: pick(d), level: ev.level, over: ev.over, inBand: ev.inBand.v5, N: ev.N.v5, x1: ev.score.x1, player: !!d.source && !d.worldBoss}; }
function justify(r){
  const ev = r, over = ev.over, past = ev.equiv.v5.past;
  switch(r.group){
    case 'units': return {why: `an elder: a timed threat (5 a fight, rounds 3–19) whose Health falls from the raid's bossHpBonusMax (50) to its basic ${r.basicHealth} as the raid falls; one of 60+ boss cards a fight against three decks, and the raid's 1.1M Health is shared by 250 raiders`};
    case 'rows': return {why: `a boss copy at ${Math.round(100 * (RAIDS[0].tuning || {}).bossAtkPct)}% Attack / ${Math.round(100 * (RAIDS[0].tuning || {}).bossHpPct)}% Health × the weakening: far under its own card's budget; the boss's strength is its three 20-card row decks, not one card`};
    case 'commons': return {why: r.brBoss.copies ? 'a called-in Common at the boss copies\' 20% / 15%' : 'not called in today (reinforce.max 0); at 20% / 15% if it were'};
    case 'guards': return {why: 'the Core\'s shield: while a stump stands the Core takes no bramble damage; 14 Health so a normal deck clears all three (RB)'};
    case 'brambles': return {why: `a raid part's bramble: ${r.stats.health} a fight (${r.vsRaiders}× the raiders' merged bramble), but the part is ${r.poolHp.toLocaleString('en')} raid Health shared by an instance of 250; the boss's budget is the raid's total, not one card's`};
    case 'async': return {why: `a bramble behind live cards (${r.vsPlayer}× the biggest player bramble); its cards are player cards at their base level${r.topCard && !r.topCard.inBand ? ` (its top card, ${r.topCard.name}, is ${r.topCard.over}× N as printed)` : ''}`};
    case 'road': {
      if(DESIGN_OVER[r.id]) return {why: 'a rank-1 Dragon: over the budget on purpose (docs/creature-ranks-2026-10-18.md)'};
      if(ev.inBand.v5) return {why: `in band: a player card at the level it fights at (Lv ${r.level})`};
      if(r.printed && !r.printed.inBand && r.printed.player) return {why: `a player card over its own budget as printed (${r.printed.over}× at Lv ${r.printed.level}): the card pass's item, not a monster's; ${over}× as it fights here`, playerOver: true};
      if(r.kind === 'worldboss' && /leader/.test(r.role)) return {why: 'the world boss itself: one fight per player at Map 20, a leader (2× BR) with the node\'s granted skill', flag: over > 1.25};
      return {why: `${over}× its N at Lv ${r.level}`, flag: over > 1.1};
    }
    case 'tower': {
      if(DESIGN_OVER[r.id]) return {why: `a rank-1 Dragon (over the budget on purpose), and the Tower fights past the player cap (Lv ${r.level}; BR 555 + 25 a floor)`};
      if(!ev.inBand.v5 && r.printed && !r.printed.inBand && r.printed.player) return {why: `a player card over its own budget as printed (${r.printed.over}× at Lv ${r.printed.level}): the card pass's item; ${over}× at the Tower's Lv ${r.level}`, playerOver: true};
      if(r.level > 11) return {why: `the Tower fights past the player cap by design (Lv ${r.level} of 20; BR 555 + 25 a floor)${ev.inBand.v5 ? ', in band for its level' : ''}`, flag: !ev.inBand.v5 && over > 1.1};
      if(ev.inBand.v5) return {why: `in band: a player card at the level it fights at (Lv ${r.level})`};
      return {why: `${over}× its N at Lv ${r.level}`, flag: over > 1.1};
    }
  }
  return {why: ''};
}
// A stat line for a flagged card that keeps the fight: the same 2A+H at the level it fights at is not in band, so it keeps its BR and
// its share of the fight by moving the excess into its level (fight it a level or more higher with the stats its card has there, which
// is in band by construction) or, where that would pass Level 11, by trimming Health to the N line (Attack kept: the fight's damage).
function proposal(r){
  const base = CARD_DEFS_BASELINE[r.id] || {}, d = Object.assign({}, base, r.stats, {effects: r.fx}), N = r.N.v5;
  let H = d.health; for(; H > 1 && !holds(N, scoreOf(Object.assign({}, d, {health: H}))); H--);
  const dh = d.health - H, nonPlayer = !base.source;
  return {attack: d.attack, health: H, dHealth: dh, text: `${d.attack}/${H} at Lv ${r.level} (−${dh} Health, Attack and skills kept) fits N ${N}; the ${dh} Health goes onto the fight's bramble (a bramble is outside the card budget), so the Health a player has to chew through and the damage it takes stay as measured (re-measure the fight's win rate before applying)`
    + (nonPlayer ? `. Or keep ${d.attack}/${d.health} and list it as a non-player unit (canonical/unit-themes.json nonPlayer, like the elders): no player can own it (no source), it is ${r.over}× its N, a Lv ${r.equiv.v5.level} Legendary on the N line (BR ${r.brPlayer} as a player card)` : '')};
}

// ---------- build ----------
function build(){
  const raid = RAIDS[0], rd = raidData(raid), groups = {
    brambles: {title: 'Raid bosses: the Goliath\'s parts (brambles)', rows: rd.brambles},
    units: {title: 'Raid elders (boss units)', rows: rd.units},
    rows: {title: 'Raid row-deck cards (the boss\'s copies)', rows: rd.rows},
    commons: {title: 'Raid Commons (the pool the boss calls in)', rows: rd.commons},
    guards: {title: 'Trench guards (the Core\'s stumps)', rows: rd.guards},
    async: {title: 'Async raid bosses and the road\'s raid-boss nodes (brambles)', rows: asyncBosses()},
    road: {title: 'Conquest bosses\' signature units', rows: roadBosses()},
    tower: {title: 'Tower and dungeon specials', rows: towerRows()},
  };
  Object.values(groups).forEach(g=> g.rows.forEach(r=>{ if(g === groups.road || g === groups.tower) r.printed = printedOf(r.id, r.map); const j = justify(r); r.why = j.why; r.flag = !!j.flag; r.playerOver = !!j.playerOver; if(r.flag) r.proposal = proposal(r); }));
  // canonical/unit-themes.json's nonPlayer, matched to the rows above (the hub's Units tab reads these)
  const np = (UNIT_THEMES.nonPlayer || []).map(u=>{
    if(u.kind === 'raid-boss-unit'){ const list = groups.units.rows.filter(r=> r.id === u.id), fresh = list.filter(r=> r.share === 1).sort((a, b)=> b.score.x1 - a.score.x1)[0], late = list.filter(r=> r.share < 0.1)[0];
      if(!fresh) return {id: u.id, missing: true};
      return {id: u.id, name: u.name, parts: [...new Set(list.map(r=> r.part))], fresh: {stats: fresh.stats, score: fresh.score.x1, need: fresh.score.need, N: fresh.N.v5, over: fresh.over, equiv: fresh.equivText, brPlayer: fresh.brPlayer, brBoss: fresh.brBoss.perCopy},
        late: late ? {stats: late.stats, score: late.score.x1, equiv: late.equivText, brPlayer: late.brPlayer, brBoss: late.brBoss.perCopy} : null,
        unitThemesBody: u.body, stale: !!(u.body && (u.body.attack !== fresh.stats.attack || (u.body.health && u.body.health.fresh !== fresh.stats.health))), why: fresh.why}; }
    const a = groups.async.rows.find(r=> r.id === u.id); if(!a) return {id: u.id, missing: true};
    return {id: u.id, name: u.name, fresh: {stats: a.stats, score: a.score.x1, need: a.score.need, N: a.N.v5, over: a.over, equiv: a.equivText, brPlayer: a.brPlayer, brBoss: a.brBoss.inPart}, why: a.why};
  });
  // the hub's Units tab (👹 Non-player view): the nonPlayer rows above, and the other special monsters, worst point per name
  const others = [];
  ['brambles', 'units', 'guards', 'road', 'tower'].forEach(k=>{ const worst = {}; groups[k].rows.forEach(r=>{ if(k === 'road' && !/leader/.test(r.role || '') && !r.flag) return; if(k === 'tower' && !r.flag && !/head/.test(r.role || '')) return;
    const key = r.name; if(!worst[key] || r.over > worst[key].over) worst[key] = r; });
    Object.values(worst).forEach(r=> others.push({group: groups[k].title, name: r.name, where: r.part ? r.partName + ' · ' + r.scenario : (r.node || ''), stats: r.stats, score: r.score.x1, need: r.score.need, N: r.N.v5, level: r.level, over: r.over, inBand: r.inBand.v5,
      equiv: r.equivText, brPlayer: r.brPlayer, brBoss: r.brBoss.perCopy != null ? r.brBoss.perCopy : r.brBoss.inPart, why: r.why, flag: r.flag, proposal: r.proposal ? r.proposal.text : null})); });
  return {generated: '2026-10-19', tool: 'tools/special_monsters.js', package: 'RJ', doc: 'docs/balance/special-monsters-2026-10-19.md',
    budget: {v5: {formula: BB.formulaParts(CFG.v5), numbers: CFG.v5}, v6: {formula: '(Base + L/10) × (1 + L/30), Base + 0.2 × Map' + (HELPER_HAS_MAP ? ' (the helper\'s Map term)' : ' (Map term added here: the helper has none yet)'), levelLinDiv: 10, perMap: 0.2},
      playerTop: PLAYER_TOP, playerBramble: PLAYER_BRAMBLE, raidMap: RAID_MAP, tuning: raid.tuning},
    groups, nonPlayer: np, others};
}

// ---------- the doc ----------
const fmt = v=> v == null ? '—' : (typeof v === 'number' ? (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en') : String(v)) : String(v));
const esc = s=> String(s == null ? '' : s).replace(/\|/g, '\\|');
function rowLine(r){
  const sc = r.score, where = r.part ? `${r.partName}${r.scenario ? ' · ' + r.scenario : ''}` : (r.node || r.where || '');
  const band = r.inBand.v5 ? '✓' : `${r.over}×`;
  const pe = r.printedEval || r.printed, printed = pe ? `; printed ${pe.stats ? pe.stats.attack + '/' + pe.stats.health : ''}${pe.inBand === true || (pe.inBand && pe.inBand.v5) ? ' in band' : ` **${pe.over}× its N**`}` : r.printed0 || '';
  return `| ${esc(r.name)}${r.flag ? ' ⚑' : ''} | ${esc(where)}${r.role ? ' · ' + esc(r.role) : ''} | ${esc(statLine(r.stats))}${r.range ? ` (${esc(r.range)})` : ''}${esc(printed)} | ${esc(r.skills)} | ${fmt(sc.x1)}${sc.m > 1 ? ` (×${sc.m})` : ''} / ${fmt(sc.x2)} | Lv ${r.level}: ${fmt(r.N.v5)} (v6 ${fmt(r.N.v6)}) ${band} | ${fmt(sc.need)} | ${esc(r.equivText)}${r.equiv.v6.level !== r.equiv.v5.level || r.equiv.v6.rarity !== r.equiv.v5.rarity ? ` (v6: Lv ${r.equiv.v6.level} ${rarityName(r.equiv.v6.rarity)})` : ''} | ${fmt(r.brPlayer)} | ${fmt(r.brBoss.perCopy)}${r.brBoss.inPart != null ? ` · ${fmt(r.brBoss.inPart)} in all` : ''}${r.brBoss.partTotal ? ` of ${fmt(r.brBoss.partTotal)}` : ''} | ${esc(r.why)} |`;
}
function doc(D){
  const L = [], b = D.budget, t = b.tuning || {};
  L.push('# Special monsters against the stat budget (package RJ, 2026-10-19)', '');
  L.push('The owner (15:48): *"Justify special monster stats like Raid monster stats. What would that card\'s BR be then?"* An analysis: no stats change here. Regenerate with `node tools/special_monsters.js` (it also writes `canonical/special-monsters.json`, which the hub\'s Units tab reads).', '');
  // the findings, from the numbers below
  { const g = D.groups, u = g.units.rows, fr = id=> u.filter(r=> r.id === id && r.share === 1)[0], kb = fr('kraken-spawnling~boss'), le = fr('humpback-elder~boss');
    const br = g.brambles.rows, rowsAll = g.rows.rows, small = rowsAll.filter(r=> r.smallest && r.smallest.rarity === 'common' && r.smallest.level <= 1).length;
    const brood = rowsAll.find(r=> r.id === 'goliath-broodmother'), st = g.guards.rows.find(r=> r.share === 1), as = g.async.rows;
    const flaggedIds = [...new Set(Object.values(g).flatMap(x=> x.rows).filter(r=> r.flag).map(r=> r.name))];
    const npStale = D.nonPlayer.filter(n=> n.stale);
    L.push('## Findings', '');
    if(kb) L.push(`- **The elders are near their budget, and the raid's BR weighs them more than their stats do.** A fresh Kraken Brute fights at ${kb.stats.attack}/${kb.stats.health} (from its ~raid copy: +1 Attack, Health up to the raid's ${RAIDS[0].bossHpBonusMax} ceiling): ${kb.over}× an Epic's N, ${kb.equivText.replace(/^equivalent to a /, 'a ')}, BR ${kb.brPlayer} as a player card. On the boss side each one counts ${kb.brBoss.perCopy} (an Epic × (1 + bonus / basic Health)), 5 a fight = ${kb.brBoss.inPart} of the Left Tentacle's ${kb.brBoss.partTotal}.${le ? ` A fresh Leviathan Elder (${le.stats.attack}/${le.stats.health}, Wait 3) is in band as a Level 1 Epic (BR ${le.brPlayer}) but counts ${le.brBoss.perCopy}.` : ''} Both fall into band as the raid falls (the Health ceiling and the weakening).`);
    if(brood) L.push(`- **The boss's row-deck copies are tiny next to their cards, but the BR counts their printed rarity.** At ${Math.round(100 * b.tuning.bossAtkPct)}% Attack / ${Math.round(100 * b.tuning.bossHpPct)}% Health every copy is in band at its strongest point; ${small} of ${rowsAll.length} fit a Level 1 Common. The Goliath Broodmother fights at ${brood.stats.attack}/${brood.stats.health} (a Level 1 Common's size, BR 1) and still adds ${brood.brBoss.perCopy} a copy (a Legendary) to the Core's BR. The raid's BR is a count of rarity × 60 cards (3 rows × 20), not of strength; that is the BR package's rule ("no fight's BR counts stats"), so it reads high against what the cards do.`);
    if(br.length) L.push(`- **The brambles are the boss.** Each arm and the tail is a ${br[0].stats.health}-Health bramble a fight (${br[0].vsRaiders}× the raiders' merged ${br[0].raidersBramble}), the Core ${br[br.length - 1].stats.health} behind its stumps; as a 0-Attack wall card it ${br[0].equivText.replace(/; the N line.*$/, ')')}. It is allowed because the part is ${br[0].poolHp.toLocaleString('en')} raid Health shared by an instance of 250, and no BR counts a bramble.`);
    if(st) L.push(`- **The Core's stumps** fight at ${st.stats.attack}/${st.stats.health} on a fresh Core (Thrashing's +4 Attack, then the weakening): ${st.over}× a Common's N, a Level ${st.equiv.v5.level} Common. Their job is the shield, so a little over is fine.`);
    L.push(`- **The Commons are not called in today** (tuning.reinforce.max ${((RAIDS[0].tuning || {}).reinforce || {}).max}); at 20% / 15% they would be 1-Attack Commons.`);
    if(as.length) L.push(`- **Async raid bosses** (raid-bosses.json and the road's 11-R / 20-R) are brambles of ${Math.min(...as.map(r=> r.stats.health))}–${Math.max(...as.map(r=> r.stats.health))} Health (${Math.min(...as.map(r=> r.vsPlayer))}–${Math.max(...as.map(r=> r.vsPlayer))}× the biggest player bramble, ${b.playerBramble.hp}) behind decks of base-level player cards (BR ${Math.min(...as.map(r=> r.brBoss.inPart))}–${Math.max(...as.map(r=> r.brBoss.inPart))}): every card is a player card; only the bramble exceeds a player's.`);
    L.push(`- **Conquest, Tower and dungeon specials are player cards at the level they fight at**, nearly all in band. The Tower's Legendary heads are in band for their Level 13–20 except ${[...new Set(g.tower.rows.filter(r=> /head/.test(r.role || '') && !r.inBand.v5).map(r=> r.name + (DESIGN_OVER[r.id] ? ' (a rank-1 Dragon, over on purpose)' : r.flag ? ' (flagged)' : '')))].join(' and ') || 'none'}. The ones over their N are mostly player cards over their own budget as printed (listed after the flags: the card pass's, not this doc's).`);
    L.push(`- **Flagged: ${flaggedIds.length ? flaggedIds.join(', ') : 'none'}.**${flaggedIds.length ? ' See Flagged below.' : ''}`);
    if(npStale.length) L.push(`- **canonical/unit-themes.json's nonPlayer bodies are stale** for ${npStale.map(n=> n.name).join(' and ')}: it lists ⚔${npStale[0].unitThemesBody.attack} ❤${npStale[0].unitThemesBody.health.fresh} fresh (the printed card × 3), while the fight builds ${npStale[0].fresh.stats.attack}/${npStale[0].fresh.stats.health} (the ~raid copy at 20% / 15%, then the elder rule). tools/unit_themes.js should read the built fight (left as is here: another package owns it).`);
    L.push(''); }
  L.push('## How each number is worked out', '');
  L.push(`- **Stats** are the ones the game builds for the fight, not the printed card: the raid's from \`buildRaidFullFight\` (the boss copies at ${Math.round(100 * t.bossAtkPct)}% Attack / ${Math.round(100 * t.bossHpPct)}% Health, then the stage's +Attack, then the weakening ${t.weakenFloor} + ${r2(1 - t.weakenFloor)} × share; the elders' Health from 50 down to basic with the raid's share; the stumps' 14 Health), the road's from \`levelledEnemyDeck\` at the level each card fights at, the Tower's from \`towerFloorDeck\` + \`statsBeyondLevel\`.`);
  L.push('- **Score**: 2A+H+S and A·H+S, ×1.5 per half-miss skill (`SkillCosts.budget`, `canonical/skill-costs.json`). Skills with no entry in the table cost 1 + ⌊N/2⌋ (the old default).');
  L.push('- **N needed**: max(2A+H+S, 3·√(A·H+S)); a card is in band when its N is above both.');
  L.push(`- **N**: \`bramblewood-budget.js\` with the table's budget numbers: ${b.v5.formula.n}, ${b.v5.formula.zero}; ${b.v5.formula.base} (v5). The **v6** column is the formula in progress: ${b.v6.formula}. Map: the map it is met on (the raid: Map ${b.raidMap}, where the Raid Banner opens).`);
  L.push(`- **Equivalent player card**: its own Wait and Lumber; its own rarity, then each rarity above it up to Legendary, at Levels from its start level to 11. When none holds it: "exceeds any player budget by Y×", Y = N needed / the biggest N any player card has at Level 11 (${b.playerTop.name}: ${b.playerTop.N}, v6 ${b.playerTop.N6}); the second number is against a Level 11 Legendary with its own Wait and Lumber, and the Level is where the Legendary's N line (past 11, as the Tower's levels go) would hold it.`);
  L.push('- **BR as player**: the battle rating that equivalent card adds in a player deck (rarity weight × level factor; past Level 11 on the Tower\'s straight line). **BR as boss**: what one copy adds on the boss side now, and the card\'s share in all: the raid\'s `raidBossBR` (each row a 20-card deck, set-up cards 2×, the elders as Epics × (1 + Health bonus / Health), Commons), the road\'s `enemyDeckLevel` (scaled to 20, leaders 2×), the Tower\'s `towerDeckBR`. No BR counts stats or brambles, so the raid\'s 20% / 15% stats and the weakening change nothing in the boss\'s BR.');
  L.push('- ✓ = in band at the level it fights at; otherwise its N needed ÷ its N. ⚑ = flagged: over its budget with no mechanic to account for it (a proposal follows the tables).', '');
  const flagged = [];
  Object.values(D.groups).forEach(g=>{
    L.push(`## ${g.title} (${g.rows.length})`, '');
    if(!g.rows.length){ L.push('None.', ''); return; }
    L.push('| Name | Where / when | Stats (fights with) | Skills | Score 2A+H+S / A·H+S | N at its level | N needed | Equivalent player card | BR as player | BR as boss (a copy · in all of the part) | Justification |', '|---|---|---|---|---|---|---|---|---|---|---|');
    g.rows.forEach(r=>{ L.push(rowLine(r)); if(r.flag) flagged.push(r); });
    L.push('');
  });
  L.push('## Flagged', '', 'Over its budget where it fights, with no mechanic that accounts for it. Nothing here is applied.', '');
  const worst = {}; flagged.forEach(r=>{ if(!worst[r.id] || r.over > worst[r.id].over) worst[r.id] = r; });
  const fl = Object.values(worst);
  if(!fl.length) L.push('None: every monster over its budget has a mechanic behind it.');
  else fl.forEach(r=> L.push(`- **${r.name}** (worst at ${r.node || r.partName}; flagged ${flagged.filter(x=> x.id === r.id).length}×): ${statLine(r.stats)}, ${skillsText(r.fx)}; score ${r.score.x1} vs N ${r.N.v5} at Lv ${r.level} (${r.over}×)${r.printed ? `; printed ${r.printed.stats.attack}/${r.printed.stats.health} is ${r.printed.inBand ? 'in band' : r.printed.over + '× its N'} at Lv ${r.printed.level}` : ''}. Proposed: ${r.proposal.text}.`));
  const po = {}; Object.values(D.groups).forEach(g=> g.rows.forEach(r=>{ const pe = r.printedEval || r.printed; if(pe && !(pe.inBand === true) && !DESIGN_OVER[r.id] && !(CARD_DEFS_BASELINE[r.id] || {}).worldBoss && (!po[r.id] || pe.over > po[r.id].over)) po[r.id] = {name: r.name, over: pe.over, stats: pe.stats, where: r.node || r.partName}; }));
  L.push('', '### Player cards over their own budget as printed (met here as monsters)', '', 'Not special monsters: these are player cards whose printed stats are over their N at their start level. They show up above because a boss fields them. They belong to the card pass, not to this list.', '');
  Object.entries(po).sort((a, b)=> b[1].over - a[1].over).forEach(([id, x])=> L.push(`- ${x.name} (${id}): ${x.stats.attack}/${x.stats.health}, ${x.over}× its N (met at ${x.where})`));
  L.push('', '## canonical/unit-themes.json nonPlayer', '');
  L.push('| id | Fresh: stats · score · equivalent · BR as player / boss | Late | unit-themes body |', '|---|---|---|---|');
  D.nonPlayer.forEach(n=>{ if(n.missing){ L.push(`| ${n.id} | not found in the build | | |`); return; }
    L.push(`| ${esc(n.name)} (${n.id}) | ${esc(statLine(n.fresh.stats))} · ${n.fresh.score} · ${esc(n.fresh.equiv)} · ${fmt(n.fresh.brPlayer)} / ${fmt(n.fresh.brBoss)} | ${n.late ? esc(statLine(n.late.stats)) + ' · ' + n.late.score + ' · ' + esc(n.late.equiv) : '—'} | ${n.unitThemesBody ? `⚔${n.unitThemesBody.attack} ❤${n.unitThemesBody.health.fresh}…${n.unitThemesBody.health.nearlyDown}${n.stale ? ' **stale**' : ''}` : '—'} |`); });
  L.push('');
  return L.join('\n');
}

if(require.main === module){
  const D = build();
  if(process.argv.includes('--print')){ console.log(doc(D)); process.exit(0); }
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'special-monsters-2026-10-19.md'), doc(D));
  Object.values(D.groups).forEach(g=> g.rows.forEach(r=>{ delete r.fx; if(r.score && !(r.score.missing || []).length) delete r.score.missing; })); // the doc is written; keep the json lean
  fs.writeFileSync(path.join(ROOT, 'canonical', 'special-monsters.json'), JSON.stringify(D) + '\n');
  const all = Object.values(D.groups).flatMap(g=> g.rows);
  console.log(`special_monsters: ${all.length} rows, ${all.filter(r=> !r.inBand.v5).length} over their N, ${all.filter(r=> r.flag).length} flagged -> canonical/special-monsters.json, docs/balance/special-monsters-2026-10-19.md`);
}
module.exports = {build, evaluate, scoreOf, equivalentOf};
