#!/usr/bin/env node
// Two skills at most (2026-10-21, package BF5; owner: "cards have at most 2 skills; special / thematic creatures may keep more ... Feel
// free to cut skills ... For the introduction of skills we try to be gentle and strict."). For every live card with more than two
// abilities (bramblewood-budget.js abilitiesOf: an effects key that is not a parameter of another skill, and each trigger):
//   - special and thematic cards keep theirs: Epic and up (Epic, Heroic, Unique, Legendary, Mythic, Ancient, Divine ...), Supreme, the
//     hidden ones, the Easter eggs, the tokens;
//   - the rest keep the two that carry the card's name and flavour. First in order: Bounty goes (owner 21:36: "Bounty is way too
//     strong"), then a time-of-day skill (Nocturnal / Diurnal / Crepuscular) beside two others, then Darksight; where that still leaves
//     three, the KEEP table below names the two (read from the card's name and flavour). A skill's parameters go with it.
//   - the owner's ants (21:36: "Soldier Ant, Ant Scout and Tunnel ant are too similar ... I like that Ant Scout is cheap ... Ant
//     Soldier takes 1 wait while ant tunneler takes 1 wait 1 lumber"): Ant Scout keeps Swarm alone; Soldier Ant gets Formation 1 beside
//     Swarm (soldiers hold the line); Tunnel Ant gets Ambush 2 beside Swarm (it comes out of the tunnel at the enemy that enters).
//   node tools/two_skills_2026_10_21.js plan|apply     -> docs/balance/two-skills-2026-10-21.json (+ canonical/cards.json on apply)
// 2026-10-21 (package TR, owner HB2-1, 18:23: "Flying, Tide (plain), Diurnal (plain) and Nocturnal (plain) do not count as skills for the
// two-skill limit. Having several of them counts as 1."): the count is bramblewood-budget.js skillCountOf, not the number of abilities. A
// time of day goes in the order only when taking it off lowers that count. The skills BF5 cut only because one of these counted are back
// (tools/tr_cards_2026_10_21.js); the JSON above is BF5's record and was not re-planned. The Swordbill Challenger (Flying + Taunt +
// Counterattack) counts two now, so it is no longer a named exception.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), B = require(path.join(ROOT, 'bramblewood-budget.js')), R = require('./card_retune_2026_10_19.js');
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json'), OUT = path.join(ROOT, 'docs', 'balance', 'two-skills-2026-10-21.json');
const PARAM_OF = {crepuscularHp: 'crepuscular', diurnalHp: 'diurnal', diurnalGrant: 'diurnal', nocturnalHp: 'nocturnal', nocturnalGrant: 'nocturnal', espritHp: 'esprit', swarmN: 'swarm',
  arrowCount: 'arrow', hunterVs: 'hunter', defianceN: 'defiance', fullMoonGrant: 'fullMoon', loyalGrant: 'loyal', swimmerGrant: 'swimmer', tideGrant: 'tide', stemGrant: 'stem' /* 2026-10-21 (EV): a Stem's braces */, kinglyGrant: 'king' /* 2026-10-21 (TR): King's braces */};
const PARAMS = B.PARAMS.concat(['arrowCount', 'hunterVs']);
const SPECIAL = new Set(['epic', 'heroic', 'unique', 'questunique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic']);
const isEgg = c=> !!(c.easterEgg || (c.source && c.source.kind === 'easteregg'));
const THEMATIC = new Set([]); // 2026-10-21 (HB2): named thematic exceptions; the Swordbill Challenger left it with HB2-1's count (TR)
const special = c=> SPECIAL.has(c.rarity) || isEgg(c) || c.token || !!(c.effects && c.effects.supreme) || !!c.hidden || THEMATIC.has(c.id);
const TOD = ['nocturnal', 'diurnal', 'crepuscular'];
// the two kept, where the order above still leaves three (from the card's name and flavour)
const KEEP = {
  'alligator-gar': ['armor', 'bleed'], 'battlement-heron': ['arrow', 'sentry'], 'bee-forager': ['swarm', 'trigger:onAttack'], beluga: ['sonar', 'inspiring'],
  'caldera-snow-leopard': ['pounce', 'ambush'], 'carrion-fly-swarm': ['poison', 'brood'], 'caustic-scorpion': ['poison', 'thorns'], 'colossal-squid': ['fork', 'gash'],
  'crown-of-thorns-star': ['thorns', 'poison'], 'eagle-owl-quartermaster': ['arrow', 'fletcher'], 'elder-tortoise': ['regen', 'trigger:onSpawn'], 'eyrie-warden': ['flying', 'onReadyDamage'],
  'fire-ant-raft': ['swarm', 'poison'], 'frillneck-duelist': ['quick', 'fencing'], 'fumarole-ibex': ['mountainClimber', 'pounce'], 'giant-cave-huntsman': ['poison', 'pounce'] /* the owner's scary spider (10-18 23:32: Poison, Pounce) */,
  'giant-clam': ['shell', 'regen'], 'gilded-swan-knight': ['armor', 'inspiring'], 'goose-sentry': ['taunt', 'sentry'], 'greenland-shark': ['carrion', 'armor'],
  'grotto-lobster': ['brood', 'crabClaws'], 'honeyjoe-brewer': ['coffee', 'kinship'], 'hummingbird-needler': ['flying', 'pierce'], 'humpback-elder': ['thorns', 'inspiring'],
  'lurking-dread': ['beware', 'scare'], 'mangrove-manatee': ['regen', 'guardian'], 'mirror-moth': ['evasive', 'reflect'], 'moon-jelly': ['tide', 'moonpull'] /* Moonpull's own card */,
  'moray-ambusher': ['stealth', 'wave'], 'open-ocean-hermit-crab': ['armor', 'crabClaws'], 'orca-vanguard': ['sweep', 'momentum'], 'ore-smelter-mole': ['heavyMetal', 'trigger:onReady'],
  'peregrine-stooper': ['quick', 'pounce'], 'phoenix-fledgling': ['renewal', 'cure'], 'quicksand-queen': ['trap', 'tangle'], 'reef-manta-glider': ['evasive', 'wave'],
  'ruby-throat-duelist': ['quick', 'pierce'], 'sea-cucumber': ['regen', 'trigger:onAttacked'], 'sea-turtle-elder': ['armor', 'revive'], subterraneaner: ['stealth', 'ambush'],
  'sulfur-cinder-moth': ['illuminate', 'trigger:onDeath'], 'sulfur-vent-crab': ['thorns', 'crabClaws'], 'swarm-matriarch': ['esprit', 'brood'], 'tax-collector-teal': ['swipe', 'hoard'],
  'testudo-tortoise': ['armor', 'guardian'], 'the-unremembered': ['remember', 'trigger:onDeath'], 'tide-pool-crab': ['tide', 'wave'], 'voltaic-eel': ['shock', 'chainLightning'],
  'walrus-icebreaker': ['freeze', 'shatter'], 'wandering-mage': ['leader', 'magic'], 'war-elephant': ['armor', 'arrow'], 'whale-shark': ['armor', 'scare']};
const ADD = {'soldier-ant': {formation: 1}, 'tunnel-ant': {ambush: 2}}; // the owner's ants
function cutTo(e, keep){ const out = {}, dropped = [];
  Object.keys(e).forEach(k=>{ if(k === 'triggers') return; const parent = PARAM_OF[k];
    if(parent ? keep.includes(parent) : keep.includes(k)) out[k] = e[k]; else if(e[k] != null && e[k] !== false) dropped.push(k); });
  if(Array.isArray(e.triggers)){ const kt = []; e.triggers.forEach(t=>{ const id = 'trigger:' + ((t && t.on) || '?'); if(keep.includes(id)) kt.push(t); else dropped.push(id + (t && t.do ? ' ' + t.do : '')); }); if(kt.length) out.triggers = kt; }
  return {effects: out, dropped}; }
function plan(){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), rows = [];
  cards.forEach(c=>{
    if(ADD[c.id]){ rows.push({id: c.id, name: c.name, rarity: c.rarity, was: B.abilitiesOf(c.effects, PARAMS), keep: B.abilitiesOf(Object.assign({}, c.effects, ADD[c.id]), PARAMS), dropped: [], added: Object.keys(ADD[c.id]), why: 'the owner\'s ants: a distinct second skill'}); return; }
    if(!R.live(c)) return; const a = B.abilitiesOf(c.effects, PARAMS), e0 = c.effects || {}, cnt = ks=> B.skillCountOf(Object.fromEntries(Object.entries(e0).filter(([k])=> ks.includes(k) || ks.includes(PARAM_OF[k]) || (k === 'triggers'))), PARAMS) - (e0.triggers || []).filter(t=> !ks.includes('trigger:' + ((t && t.on) || '?'))).length; // TR: HB2-1's count
    if(cnt(a) <= 2) return;
    if(special(c)){ rows.push({id: c.id, name: c.name, rarity: c.rarity, was: a, keep: a, dropped: [], why: 'special / thematic: keeps them'}); return; }
    let k = a.slice(); const rm = x=>{ if(cnt(k) > 2 && k.includes(x)){ const k2 = k.filter(y=> y !== x); if(cnt(k2) < cnt(k)) k = k2; } }; // TR: only when it lowers the count
    rm('bounty'); TOD.forEach(rm); rm('darksight');
    if(cnt(k) > 2){ if(!KEEP[c.id]) throw new Error('no KEEP for ' + c.id + ' (' + k.join('+') + ')'); k = KEEP[c.id]; }
    k.forEach(x=>{ if(!a.includes(x)) throw new Error(c.id + ' keeps ' + x + ' it does not have'); });
    rows.push({id: c.id, name: c.name, rarity: c.rarity, was: a, keep: k, dropped: a.filter(x=> !k.includes(x)), why: KEEP[c.id] && a.length - (a.includes('bounty') ? 1 : 0) > 2 ? 'the two its name and flavour carry' : 'in order: Bounty, then a time-of-day skill, then Darksight'}); });
  const out = {_about: 'BF5 (2026-10-21): two skills at most (owner); special / thematic cards (Epic and up, Supreme, hidden, Easter eggs, tokens) keep theirs', generated: '2026-10-21',
    cut: rows.filter(r=> r.dropped.length).length, special: rows.filter(r=> !r.dropped.length && !r.added).length, added: rows.filter(r=> r.added).length, rows};
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n'); return out; }
const P = process.argv[2] === 'apply' || process.argv[2] === 'plan' ? plan() : JSON.parse(fs.readFileSync(OUT, 'utf8')); console.log(P.cut, 'cards cut to two,', P.special, 'special cards keep more,', P.added, 'ants given a second skill');
if(process.argv[2] === 'apply'){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
  P.rows.forEach(r=>{ const c = by[r.id];
    if(r.added){ c.effects = Object.assign({}, c.effects, ADD[r.id]); c.creatorNote = ((c.creatorNote || '') + ` 2026-10-21 (BF5, the owner's ants): + ${Object.entries(ADD[r.id]).map(([k, v])=> k + ' ' + v).join(', ')} beside Swarm.`).trim(); return; }
    if(!r.dropped.length) return; const {effects, dropped} = cutTo(c.effects || {}, r.keep); c.effects = effects;
    c.creatorNote = ((c.creatorNote || '') + ` 2026-10-21 (BF5, two skills at most): cut ${dropped.join(', ')}; keeps ${r.keep.join(' + ')}.`).trim(); });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('applied');
}
