#!/usr/bin/env node
// Card balance report (2026-10-09, user: "card balancing was one of the key things to start on").
//
// How strong is each card, measured by playing real matches with the engine's own AI:
//   test deck  = 8 copies of the card (fewer for costly cards: 6 / 4 / 3) + filler up to 20
//   opponent   = 20 cards of the same filler
// A card that adds nothing scores ~50%; a strong card pushes the deck's win rate up. Then each card
// is compared with what its rarity should deliver (a band per rarity), and the outliers get a
// suggested stat change found by re-simulating (±Attack / ±Health in small steps until it lands in
// its band).
//
//   node tools/card_balance.js [games=60] [--suggest] [--mode=open]
// Writes docs/balance/card-balance.json and docs/card-balance-2026-10-09.md.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const args = process.argv.slice(2);
const N = +(args.find(a=> /^\d+$/.test(a)) || 60);
const SUGGEST = args.includes('--suggest');
const MODE = (args.find(a=> a.startsWith('--mode=')) || '--mode=open').slice(7);

const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const fieldable = Object.keys(defs).filter(id=> !defs[id].token && !defs[id].test && !defs[id].hallOfFame && !defs[id].baseId).sort();

// The filler: plain, effect-free commons/starters around the middle of the pack (stable list so
// reports compare run to run).
const FILLER = ['otter-paddler', 'tunnel-ant', 'meadow-rabbit', 'otter-guard', 'bee-sentry', 'cricket-drummer'].filter(id=> defs[id]);
function fillerDeck(n){ const d = {}; for(let i=0;i<n;i++){ const id = FILLER[i % FILLER.length]; d[id] = (d[id]||0) + 1; } return d; }
const OPP = fillerDeck(20);
const COPIES_BY_COST = [8, 6, 4, 3];

function winRate(id, over){
  const D = over ? Object.assign({}, defs, {[id]: Object.assign({}, defs[id], over)}) : defs;
  // Expensive cards can't be played eight times a match, so the test deck carries fewer of them.
  const k = COPIES_BY_COST[Math.min(3, defs[id].cost||0)];
  const deck = fillerDeck(20 - k); deck[id] = (deck[id]||0) + k;
  let w = 0;
  for(let k=0;k<N;k++){
    const r = E.simulateOneMatch(D, k%2 ? deck : OPP, k%2 ? OPP : deck, {rnd: E.mulberry32(7700 + k*131), maxRounds: 60, battleMode: MODE});
    const mine = k%2 ? 1 : 2;
    w += r.winner===mine ? 1 : r.winner===0 ? 0.5 : 0;
  }
  return w / N;
}

// What each rarity should deliver, as a win-rate band for the 8-copy test deck. Starters sit near
// the filler; each rarity step is meant to be a visible step up.
const BANDS = {
  starter:[.35,.62], common:[.45,.72], uncommon:[.55,.80], quest:[.55,.80], rare:[.62,.86], veryrare:[.66,.90], superrare:[.70,.92],
  epic:[.72,.94], heroic:[.74,.95], unique:[.76,.97], questunique:[.76,.97], legendary:[.80,.99], mythic:[.82,1], ancient:[.85,1],
};
const bandOf = d=> BANDS[d.rarity || 'common'] || BANDS.common;

const t0 = Date.now();
const rows = fieldable.map(id=>{
  const d = defs[id], wr = winRate(id), [lo, hi] = bandOf(d);
  const verdict = wr > hi ? 'strong' : wr < lo ? 'weak' : 'ok';
  return {id, name:d.name, rarity:d.rarity || null, cost:d.cost||0, wait:d.wait||0, attack:d.attack||0, health:d.health||0,
    skills:Object.keys(d.effects||{}).filter(k=> k!=='triggers').concat((d.effects.triggers||[]).length ? ['triggers'] : []),
    winRate: Math.round(wr*1000)/10, band:[lo*100, hi*100], verdict, locked: !!d.locked, source: (d.source||{}).kind || 'base'};
});

// Suggest a fix for outliers: step Attack, then Health, toward the band (max 4 steps each).
if(SUGGEST){
  rows.filter(r=> r.verdict!=='ok').forEach(r=>{
    const d = defs[r.id], [lo, hi] = bandOf(d), target = (lo + hi) / 2, dir = r.verdict==='strong' ? -1 : 1;
    let best = null;
    for(const stat of ['attack', 'health']){
      const base = d[stat] || 0, step = stat==='attack' ? 1 : Math.max(1, Math.round(base * 0.12));
      for(let k=1; k<=4; k++){
        const v = Math.max(stat==='health' ? 1 : 0, base + dir*step*k); if(v === base) break;
        const wr = winRate(r.id, {[stat]: v});
        const cand = {stat, from: base, to: v, winRate: Math.round(wr*1000)/10, dist: Math.abs(wr - target)};
        if(!best || cand.dist < best.dist) best = cand;
        if(wr >= lo && wr <= hi) break;
      }
    }
    if(best) r.suggest = best;
  });
}

const out = {generated: new Date().toISOString().slice(0,10), games: N, mode: MODE, filler: FILLER, bands: BANDS, rows};
fs.mkdirSync(path.join(ROOT, 'docs', 'balance'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'card-balance.json'), JSON.stringify(out, null, 1) + '\n');
const cnt = v=> rows.filter(r=> r.verdict===v).length;
console.log(`${rows.length} cards, ${N} games each, ${((Date.now()-t0)/1000).toFixed(0)}s: ${cnt('strong')} too strong, ${cnt('weak')} too weak, ${cnt('ok')} in band`);
