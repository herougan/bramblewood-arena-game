#!/usr/bin/env node
// CONTENT12 (2026-11-06): the card edits of decisions CONTENT11-1 a (one job each), CONTENT11-3 a (carriers for Relict, Meld, Immunity,
// Sequestration), ENG22-1 a (carriers for Tally, Almanac, Onslaught, Riled) and FIX9-1 a (the Shell cards back to their old budget use,
// Giant Clam, Sawfish and the rest trimmed into band). Run after tools/fold_server_overrides_2026_11_06.js (the owner's live edits first).
//   node tools/content12_cards_2026_11_06.js plan | apply
// The owner's cards are never re-tuned (balance.md BAL-ROLES): a proposal that lands on a card he edited live (the 11-06 fold) or a named
// owner card (tools/pipeline/config.json refit.ownerCards) is skipped and listed for docs/decisions.json (CONTENT12-1).
// The re-fit (the budget, tools/skill_costs.js), the smallest change: a card still in band after its edit (inside both caps, above 60% of N)
// keeps its stats; an over card loses the fewest points of Health that bring it inside; an under one gains Health toward its use before the
// edit; a swapped skill (one for another) aims at the card's use before the swap. Attack is kept. FIX9-1's Shell cards aim at their use before FIX9's Shell price (e596ebc4~1).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json');
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const TOLD = SC.make(JSON.parse(cp.execFileSync('git', ['-C', ROOT, 'show', 'e596ebc4~1:canonical/skill-costs.json'], {maxBuffer: 1 << 28}).toString()));
const OWNER = new Set([...JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'server-overrides', 'fold-plan-2026-11-06.json'), 'utf8')).rows.map(r=> r.id),
  ...JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'pipeline', 'config.json'), 'utf8')).refit.ownerCards]);
// what each edit does to effects (and to the same skill in levelSkills): add {key: value}, or swap one key for another
const EDITS = [
  // CONTENT11-1 a (docs/content11-2026-11-05.md section 3); Chipmunk Skirmisher, Field Mouse, Terrier Pup, Bramble Sprout and Feral Tomcat
  // got their own lines from the owner live (11-03 .. 11-05), folded in by CONTENT12 instead
  {id: 'dormouse', add: {nocturnal: 1}, why: 'CONTENT11-1 a: a dormouse sleeps by day'},
  {id: 'torch', add: {illuminate: true}, why: 'CONTENT11-1 a: a torch lights its row (Illuminate, Lantern\'s live name; Lantern is retired)'},
  {id: 'meadow-frog', add: {tide: true}, why: 'CONTENT11-1 a: a frog of the wet meadow'},
  {id: 'caiman-hatchling', swap: ['quick', 'ambush', 1], why: 'CONTENT11-1 a: Ambush 1 instead of Quick (Hedgerow Shrew and the Tomcat no longer share its line)'},
  {id: 'pike-lancer', add: {pierce: 1}, why: 'CONTENT11-1 a: the lance pierces'},
  {id: 'dolphin-knight', add: {sonar: true}, why: 'CONTENT11-1 a: a dolphin hears by sonar'},
  {id: 'irradiated-glow-wyrm', swap: ['poison', 'irradiated', 1], why: 'CONTENT11-1 a: Irradiated instead of Poison (Caustic Scorpion keeps Poison 2)'},
  {id: 'mangrove-mudskipper', add: {skitter: true}, why: 'CONTENT11-1 a: a mudskipper skitters over the mud'},
  // CONTENT11-3 a (section 5). Old Sturgeon (Relict), Ant Warrior and Fire Ant Raft (Meld {Quick}) are the owner's live cards: skipped,
  // Nautilus Drifter (a living fossil) carries Relict instead and Leafcutter Gardener (an ant) Meld {Quick}
  {id: 'horseshoe-crab', add: {relict: true}, why: 'CONTENT11-3 a: a living fossil the weather never changed'},
  {id: 'old-sturgeon', add: {relict: true}, why: 'CONTENT11-3 a'},
  {id: 'nautilus-drifter', add: {relict: true}, why: 'CONTENT11-3 a (in place of Old Sturgeon, the owner\'s card): the nautilus is a living fossil'},
  {id: 'ant-warrior', add: {meld: {quick: true}}, why: 'CONTENT11-3 a'},
  {id: 'fire-ant-raft', add: {meld: {quick: true}}, why: 'CONTENT11-3 a'},
  {id: 'leafcutter-gardener', add: {meld: {quick: true}}, why: 'CONTENT11-3 a (in place of Ant Warrior / Fire Ant Raft, the owner\'s cards): ants that link up'},
  {id: 'coral-polyp-colony', add: {meld: {armor: 1}}, why: 'CONTENT11-3 a: polyps share one skeleton'},
  {id: 'hedgehog-herbalist', add: {immunity: true}, why: 'CONTENT11-3 a: hedgehogs shrug off venom'},
  {id: 'venomlord-serpent', add: {immunity: true}, why: 'CONTENT11-3 a: a viper is immune to its own kind'},
  {id: 'poison-dart-croaker', add: {sequestration: true}, why: 'CONTENT11-3 a: dart frogs sequester their prey\'s toxins'},
  // ENG22-1 a: one Map 0-20 card each
  {id: 'raven-scout', add: {tally: 3}, why: 'ENG22-1 a: Tally 3, the raven counts the fallen'},
  {id: 'cone-cutter-squirrel', add: {almanac: 4}, why: 'ENG22-1 a: Almanac 4, a squirrel keeps its caches by the calendar'},
  {id: 'bison-bulldozer', add: {onslaught: 3}, why: 'ENG22-1 a: Onslaught 3, the herd keeps charging the wall it has dented'},
  {id: 'boreal-elk', add: {riled: 3}, why: 'ENG22-1 a: Riled 3, a wounded bull elk charges'},
];
// FIX9-1 a: stat lines (Health only), nearest their pre-FIX9 use (shell) or just into band (over cards)
const SHELL = ['stalactite-golem', 'conch-crawler', 'malachite-golem', 'shellwright-apprentice', 'limpet-clinger', 'reefback-turtle'];
const TRIM = {'giant-clam': 'FIX9-1 a: was 102% of N', 'sawfish': 'FIX9-1 a: Breach\'s price (ENG25) put it at 110%', 'moon-jelly': 'FIX9-1 a: 128% after Moonpull\'s price (ENG25)', 'bee-drone': 'FIX9-1 a: 71% before the fold'};
const useOf = (TT, c)=>{ const b = TT.budget(c, {}); return b && b.N > 0 ? {u: b.x1 / b.N, ok: b.ok, under: b.wellUnder} : null; };
function fitHealth(c, target, mode){ // mode 'near' (nearest target, in band) or 'trim' (the most Health that is inside)
  let best = null; for(let H = 1; H <= Math.max(40, c.health * 2); H++){ const u = useOf(T, Object.assign({}, c, {health: H})); if(!u || !u.ok || u.under) continue;
    if(mode === 'trim'){ if(H <= c.health && (!best || H > best.H)) best = {H, u: u.u}; }
    else if(!best || Math.abs(u.u - target) < Math.abs(best.u - target) || (Math.abs(u.u - target) === Math.abs(best.u - target) && H > best.H)) best = {H, u: u.u}; }
  return best; }
function applyEdit(c, ed){ const out = JSON.parse(JSON.stringify(c)), e = out.effects = out.effects || {};
  const doTo = o=>{ if(!o) return; if(ed.add) Object.assign(o, ed.add); if(ed.swap && o[ed.swap[0]] !== undefined){ delete o[ed.swap[0]]; o[ed.swap[1]] = ed.swap[2]; } };
  doTo(e); if(ed.swap && out.levelSkills) Object.values(out.levelSkills).forEach(doTo);
  if(ed.add && out.levelSkills) Object.values(out.levelSkills).forEach(o=>{ if(o && Object.keys(c.effects || {}).every(k=> k in o)) Object.assign(o, ed.add); });
  return out; }
const pct = u=> Math.round(100 * u) + '%';
function plan(){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = Object.fromEntries(cards.map(c=> [c.id, c])), rows = [], held = [];
  EDITS.forEach(ed=>{ const c = by[ed.id]; if(!c) throw new Error('no card ' + ed.id);
    if(OWNER.has(ed.id)){ held.push({id: ed.id, why: ed.why, edit: ed.add || ed.swap, note: 'the owner\'s card (live edit or a named owner card): not changed'}); return; }
    const before = useOf(T, c), next = applyEdit(c, ed), after = useOf(T, next);
    const fit = after.ok && !after.under && !ed.swap ? {H: next.health, u: after.u} : fitHealth(next, before.u, after.ok ? 'near' : 'trim');
    if(!fit) { held.push({id: ed.id, why: ed.why, note: 'no Health fits'}); return; }
    next.health = fit.H; rows.push({id: ed.id, why: ed.why, from: [c.attack, c.health], to: [next.attack, next.health], use: [pct(before.u), pct(fit.u)], effects: next.effects, levelSkills: next.levelSkills, next}); });
  SHELL.forEach(id=>{ const c = by[id], old = useOf(TOLD, c), now = useOf(T, c), fit = fitHealth(c, old.u, 'near');
    const next = Object.assign(JSON.parse(JSON.stringify(c)), {health: fit.H}); rows.push({id, why: 'FIX9-1 a: back to its use before the Shell re-price (' + pct(old.u) + ')', from: [c.attack, c.health], to: [c.attack, fit.H], use: [pct(now.u), pct(fit.u)], next}); });
  Object.entries(TRIM).forEach(([id, why])=>{ const c = by[id], now = useOf(T, c);
    if(OWNER.has(id)){ const fit = fitHealth(c, 1, 'trim'); held.push({id, why, note: `the owner's card (live edit or a named owner card), now ${c.attack}/${c.health} at ${pct(now.u)}: not changed`, proposal: now.ok && !now.under ? 'in band as he set it' : fit ? `${c.attack}/${fit.H} (${pct(fit.u)})` : 'no Health fits'}); return; }
    if(now.ok && !now.under){ held.push({id, why, note: 'already in band (' + pct(now.u) + ')'}); return; }
    const fit = fitHealth(c, 1, now.under ? 'near' : 'trim'); const next = Object.assign(JSON.parse(JSON.stringify(c)), {health: fit.H});
    rows.push({id, why, from: [c.attack, c.health], to: [c.attack, fit.H], use: [pct(now.u), pct(fit.u)], next}); });
  return {cards, by, rows, held};
}
const cmd = process.argv[2] || 'plan', P = plan();
P.rows.forEach(r=> console.log(r.id.padEnd(24), r.from.join('/'), '->', r.to.join('/'), 'use', r.use.join(' -> '), JSON.stringify(r.next.effects), '|', r.why));
P.held.forEach(h=> console.log('HELD', h.id.padEnd(20), h.note, h.proposal ? '-> proposal ' + h.proposal : '', '|', h.why));
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'content12-cards-2026-11-06.json'), JSON.stringify({_about: 'CONTENT12 (2026-11-06): card edits (tools/content12_cards_2026_11_06.js)', rows: P.rows.map(r=> Object.assign({}, r, {next: undefined})), held: P.held}, null, 1) + '\n');
if(cmd === 'apply'){
  P.rows.forEach(r=>{ const c = P.by[r.id]; const note = `2026-11-06 (CONTENT12): ${r.why}; ${r.from.join('/')} -> ${r.to.join('/')} (budget use ${r.use.join(' -> ')}).`;
    Object.keys(c).forEach(k=> delete c[k]); Object.assign(c, r.next); c.creatorNote = ((c.creatorNote || '') + ' ' + note).trim(); });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(P.cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('applied', P.rows.length, 'cards; held', P.held.length);
}
