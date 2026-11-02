// 2026-11-02 (package FIX6, owner 21:37: "Drowned Matriarch is ALWAYS my leader. (and also is never played by the way ...) So make sure we
// take leaders into account."): a seat the engine plays for you (Auto-play, the sims' reference player) brings its leader out (leaderPlan);
// the CPU's leaders keep LEAD-4; the sims deal the set's leader (dealPlayerLeader); the Tower pools follow the cards' current rarities.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const rd = p=> fs.readFileSync(path.join(ROOT, p), 'utf8'); let checks = 0, fail = 0;
const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('FAIL ' + m); } };
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, E = B.E;
const app = rd('arena_app.js'), eng = rd('bramblewood-engine.js');
function rng(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// One game as playReferenceGame plays it, with the events kept; deal: 'none' | 'reserve' (reserveLeaders only, the CPU's rule) | 'plan' (dealPlayerLeader).
function game(ctx, g, deal){
  const engine = E.makeSimEngine(ctx.defs, rng(ctx.seed0 + g * 37), {recordEvents: true, battleMode: ctx.mode, rules: ctx.rules, aiAim: true, aiLevel: ctx.cpu});
  const sideOf = id=> id === 1 ? 'A' : 'B', st = {}, ev = [];
  const P = {1: engine.newPlayer(1, ctx.mine, ctx.myCastle), 2: engine.newPlayer(2, ctx.enemyDeck, ctx.sc.character)};
  P[2].loopCards = []; Object.assign(P[2].hq, ctx.setup.hq); if(ctx.setup.hq.shieldLayers) P[2].hq.shieldLayers = ctx.setup.hq.shieldLayers.slice(); if(ctx.setup.reserveLeaders) P[2].reserveLeaders = ctx.setup.reserveLeaders.slice();
  if(deal === 'plan') G.dealPlayerLeader(P[1], ctx.ref.leader, ctx.defs); else if(deal === 'reserve') P[1].reserveLeaders = [ctx.ref.leader];
  engine.draw(P[1], 3, 'A', st, ev); engine.draw(P[2], 3, 'B', st, ev);
  let over = false;
  for(let r = 1; r <= 30 && !over; r++){
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, sideOf, st, ev);
    engine.setAiLevel(1); engine.aiTakeTurn(P, sideOf, 1, st, ev); engine.setAiLevel(ctx.cpu); engine.aiTakeTurn(P, sideOf, 2, st, ev);
    over = engine.resolveCombat(P, sideOf, st, ev, r % 2 === 0 ? 1 : 2); if(over) break;
    engine.draw(P[1], 1, 'A', st, ev); engine.draw(P[2], 1, 'B', st, ev);
  }
  const lead = side=> ev.filter(e=> e.type === 'play' && e.leader && e.side === side);
  return {A: lead('A'), B: lead('B'), aPlays: ev.filter(e=> e.type === 'play' && e.side === 'A').map(e=> String(e.defId).replace(/@p\d+$/, ''))};
}

// a) the player's leader: who may lead, the default, the choice kept on the deck
{ const D = B.CARD_DEFS_BASELINE, dm = D['drowned-matriarch'];
  ok(dm && dm.rarity === 'uncommon' && dm.effects.leader, 'Drowned Matriarch: Uncommon with the Leader skill (it may lead: canLeadDef)');
  ok(/function canLeadDef\(d\)\{[\s\S]{0,200}effects\.leader \|\| d\.effects\.dictator\)\) return true;/.test(app), 'canLeadDef: the Leader skill makes any rarity a leader');
  ok(/return 'wandering-traveller';\n\}/.test(app) && /var DECK_DEFAULT_LEADER_ID = 'wandering-traveller';/.test(app), 'no leader chosen: the Wandering Traveller leads (loadMyLeader, DECK_DEFAULT_LEADER_ID)');
  ok(/else \{ myLeaderId = id \|\| null; saveMyLeader\(\); \}/.test(app) && /d\.leaderId = myLeaderId;\n  saveMyDecks\(\);/.test(app), 'the picker writes the choice onto the active deck (it sticks)');
  ok(!/drowned-matriarch/.test(app.slice(app.indexOf('function loadMyLeader'), app.indexOf('function matchLeaderId'))), 'nothing in the leader code names the Drowned Matriarch');
  // The "Reference (Random)" decks (the REF fights' default) name their own leader: the Drowned Matriarch on Maps 5-8 (BAL9, JJ7)
  const prog = G.REF_DECK_SETS.prog; ok(prog && prog.decks && prog.decks[5].every(d=> d.leader === 'drowned-matriarch'), 'Reference (Random) Map 5: every deck leads with the Drowned Matriarch (the owner\'s report)');
  ok(/!\(\(counts \|\| \{\}\)\[id\] > 0\)/.test(rd('tools/opt/ref5_prog.js')), 'ref5_prog chooseLeader: never a card the deck already holds'); }

// b) the engine: a leaderPlan seat brings its leader out; the CPU's leaders keep LEAD-4
{ ok(/if\(ready\.length && \(ai\.leaderPlan \|\| !affordable\.length \|\| rules\.bossSurge \|\| rnd\(\) < 0\.35\)\)/.test(eng), 'the CPU rule keeps its dice: leaderPlan is checked before the 35% roll');
  ok(/function aiLeaderToGather\(players, aiId\)\{\n    const ai = players\[aiId\]; if\(!ai \|\| !ai\.leaderPlan/.test(eng), 'aiLeaderToGather: leaderPlan seats only');
  const ctx = G.referenceFightSetup('mw', B.byKey('mw', '5-7'), {refSet: 'prog-1'});
  ok(ctx.ref.leader === 'drowned-matriarch', '5-7 with Reference (Random) 1: its leader is the Drowned Matriarch');
  const N = 12, runs = {}; ['none', 'reserve', 'plan'].forEach(k=>{ runs[k] = []; for(let g = 0; g < N; g++) runs[k].push(game(ctx, g, k)); });
  const out = k=> runs[k].filter(r=> r.A.length).length;
  ok(out('none') === 0, '5-7: no leader dealt, none summoned');
  ok(out('reserve') <= N / 2, `5-7: the CPU's rule alone (no Lumber saved) rarely brings a cost-1 leader out in a free-card deck (${out('reserve')}/${N}; LEAD-4)`);
  ok(out('plan') === N, `5-7: dealt with leaderPlan, the leader comes out every game (${out('plan')}/${N})`);
  ok(runs.plan.every(r=> r.A.length <= 1), 'the leader is summoned at most once');
  ok(runs.plan.every(r=> !r.A.length || r.A[0].defId === 'drowned-matriarch'), 'it is the Drowned Matriarch that comes out');
  const bOut = k=> runs[k].filter(r=> r.B.length).length; ok(bOut('plan') > 0, `5-7: the CPU still brings its leader out (${bOut('plan')}/${N})`);
  // 4-5, the CPU's side: the Drowned Matriarch in its deck is played from hand, Old Sturgeon leads
  const c45 = G.referenceFightSetup('m2', B.byKey('m2', '4-5'), {}); ok((c45.setup.reserveLeaders || []).includes('old-sturgeon'), '4-5 is led by Old Sturgeon');
  let dmPlays = 0; for(let g = 0; g < 10; g++){ const engine = E.makeSimEngine(c45.defs, rng(9100 + g * 37), {recordEvents: true, battleMode: c45.mode, rules: c45.rules, aiAim: true, aiLevel: c45.cpu});
    const sideOf = id=> id === 1 ? 'A' : 'B', st = {}, ev = [], P = {1: engine.newPlayer(1, c45.mine, c45.myCastle), 2: engine.newPlayer(2, c45.enemyDeck, c45.sc.character)}; P[2].loopCards = []; P[2].reserveLeaders = c45.setup.reserveLeaders.slice();
    engine.draw(P[1], 3, 'A', st, ev); engine.draw(P[2], 3, 'B', st, ev);
    for(let r = 1; r <= 30; r++){ [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; }); if(r > 1) engine.roundStart(P, r, sideOf, st, ev);
      engine.setAiLevel(1); engine.aiTakeTurn(P, sideOf, 1, st, ev); engine.setAiLevel(c45.cpu); engine.aiTakeTurn(P, sideOf, 2, st, ev); if(engine.resolveCombat(P, sideOf, st, ev, r % 2 === 0 ? 1 : 2)) break; engine.draw(P[1], 1, 'A', st, ev); engine.draw(P[2], 1, 'B', st, ev); }
    dmPlays += ev.filter(e=> e.type === 'play' && e.side === 'B' && /^drowned-matriarch/.test(e.defId)).length; }
  ok(dmPlays >= 5, `4-5: the CPU plays its Drowned Matriarch copies from hand (${dmPlays} plays in 10 games)`); }

// c) the sims: playReferenceGame deals the set's leader; 'map' has none; noLeader turns it off
{ ok(typeof G.dealPlayerLeader === 'function', 'lib_bramble exports dealPlayerLeader');
  const pl = {}; ok(G.dealPlayerLeader(pl, 'drowned-matriarch', B.CARD_DEFS_BASELINE) && pl.leaderPlan === true && pl.reserveLeaders.join() === 'drowned-matriarch', 'dealPlayerLeader: a reserve leader with leaderPlan');
  ok(!G.dealPlayerLeader({}, 'no-such-card', B.CARD_DEFS_BASELINE) && !G.dealPlayerLeader({}, null), 'dealPlayerLeader: an unknown or missing leader is not dealt');
  ok(/if\(ctx\.ref && ctx\.ref\.leader\) dealPlayerLeader\(P\[1\], ctx\.ref\.leader, ctx\.defs\);/.test(app), 'playReferenceGame deals ctx.ref.leader');
  const node = B.byKey('mw', '5-7');
  ok(!G.referenceFightSetup('mw', node, {}).ref.leader, "the Map reference (the road measure) names no leader: unchanged");
  ok(G.referenceFightSetup('mw', node, {refSet: 'prog-1', noLeader: true}).ref.leader === null, '{noLeader: true} measures a set without its leader');
  ok(G.referenceFightSetup('mw', node, {refSet: 'prog-1', leader: 'old-shell'}).ref.leader === 'old-shell', '{leader: id} measures a set with another leader');
  const ctx = G.referenceFightSetup('mw', node, {refSet: 'prog-1'}), a = G.playReferenceGame(ctx, 0), b = G.playReferenceGame(ctx, 0);
  ok(JSON.stringify(a) === JSON.stringify(b), 'playReferenceGame with a leader is still a pure function of the seed');
  const dk = rd('tools/opt/deckopt.js'); ok(/case '--leader': o\.leader = take\(\);/.test(dk) && /if \(spec\.leader && !mirror\) G\.dealPlayerLeader\(P\[1\], spec\.leader, ctx\.defs\);/.test(dk), 'deckopt --leader deals the search\'s seat a leader (mirrors stay leaderless)');
  ok(/dealPlayerLeader\(P\[1\], id, defs\)/.test(rd('docs/workflows/balance.md')), 'docs/workflows/balance.md documents the call'); }

// Auto-play summons your leader (autoplayLeaderOn / Off)
{ ok(/const lead = autoplayLeaderOn\(m, me\); m\.engine\.aiTakeTurn\(m\.players, m\.sideOf, 1, m\.stats, ev\); autoplayLeaderOff\(m, me, lead, ev\);/.test(app), 'autoplayStep lends your leader to the engine for the Auto turn');
  const grab = name=> B.grab(name);
  const fx = []; const env = new Function('getCardDefs', 'document', 'leaderWidgetHTML', 'wireLeaderWidget', 'animMs', 'noteMatchFx', 'LEADER_THRONE_WAIT_MS', 'leaderThroneVfx', 'setTimeout',
    [grab('dealPlayerLeader'), grab('autoplayLeaderOn'), grab('autoplayLeaderOff'), 'return {autoplayLeaderOn, autoplayLeaderOff};'].join('\n'))(
    ()=> B.CARD_DEFS_BASELINE, {getElementById: ()=> null}, ()=> '', ()=>{}, ()=> ({strike: 380}), ()=>{}, 600, (uid)=> fx.push(uid), f=> f());
  const m = {leaderDefId: 'drowned-matriarch', leaderUid: null, sideOf: id=> id === 1 ? 'A' : 'B'}, me = {};
  const lead = env.autoplayLeaderOn(m, me); ok(lead === 'drowned-matriarch' && me.leaderPlan && me.reserveLeaders[0] === 'drowned-matriarch', 'Auto: your leader is lent to the engine');
  env.autoplayLeaderOff(m, me, lead, [{type:'play', side:'A', leader:true, uid: 77, defId:'drowned-matriarch'}]);
  ok(m.leaderUid === 77 && !me.reserveLeaders && !me.leaderPlan && fx[0] === 77, 'Auto: its summon becomes yours (m.leaderUid, the throne moment) and the loan is taken back');
  ok(env.autoplayLeaderOn(m, {}) === null, 'Auto: a leader already out is not lent again');
  ok(env.autoplayLeaderOn({leaderDefId: 'drowned-matriarch', leaderUid: null, caged: {hp: 9}}, {}) === null, 'Auto: a caged leader waits for its cage');
  const m2 = {leaderDefId: 'drowned-matriarch', leaderUid: null, sideOf: m.sideOf}, me2 = {}; env.autoplayLeaderOff(m2, me2, env.autoplayLeaderOn(m2, me2), []);
  ok(m2.leaderUid === null && !me2.reserveLeaders, 'Auto: no summon this turn, the leader stays in its slot'); }

// The Tower pools follow the current rarities (KK20)
{ const D = B.CARD_DEFS_BASELINE, T = new Function(B.grab('TOWER_POOLS') + '; return TOWER_POOLS;')(), BANDS = G.RARITY_TIER_BANDS || ['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient', 'divine'];
  ['rare', 'veryrare', 'epic', 'heroic', 'unique'].forEach(t=> (T[t] || []).forEach(id=> ok(D[id] && D[id].rarity === t, `Tower ${t} pool: ${id} is ${D[id] ? D[id].rarity : 'missing'}`)));
  (T.legendary || []).forEach(id=> ok(D[id] && BANDS.indexOf(D[id].rarity) >= BANDS.indexOf('legendary'), `Tower boss pool: ${id} is Legendary or above (${D[id] && D[id].rarity})`));
  ok(!Object.values(T).some(l=> l.includes('drowned-matriarch')), 'the Drowned Matriarch (Uncommon) left the Tower');
  ok(/const tiers = \['rare', 'veryrare', 'epic', 'heroic', 'unique'\];/.test(app), 'towerFloorDeck picks from the Very Rare tier too'); }

// The package's paperwork
{ const ds = rd('docs/decisions.json'); ['FIX6-1', 'FIX6-2', 'FIX6-3'].forEach(d=> ok(ds.includes('"id": "' + d + '"'), d + ' in decisions.json'));
  ok(/Package FIX6/.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry (2026-11-03: later packages sit above it, so the whole file is read)'); }

console.log(`fix6-2026-11-02: ${checks - fail}/${checks} passed`); process.exit(fail ? 1 : 0);
