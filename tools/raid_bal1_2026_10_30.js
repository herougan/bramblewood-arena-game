#!/usr/bin/env node
// RAIDBAL1 (2026-10-30, owner 10-30 21:35-21:53 W8: "Start balancing the raid against 3 decks at roughly the level they unlock the raid,
// but with +2 higher level."). The Goliath raid's fights (the three warm-ups: Left Tentacle, Right Tentacle, Tail; then the Core) played
// through tools/raid_full_sim.js (the page's own buildRaidFullFight, the two CPU allies from the raid's allyDecks, the boss's rows,
// specials, boss units and Commons) against three reference decks at the raid's unlock map (the Raid Banner, Map 13) + 2 levels:
//   map   the Map reference (WINRATE_REF_DECKS.road[13]) at referencePlayerLevel(13) + 2
//   ref2  Reference-2 (the owner's Ant Deck) at its Map 13 per-copy levels (refSetFor) + 2 each
//   opt   the deck optimizer's Map 13 map-true optimum (docs/balance/opt/deckopt-map13-mr-2026-10-27-hub7-maptrue.json) at the map level + 2
// No leader on your side (the reference harness has none; the allies keep theirs). A copy's level is capped at its card's top level, Base
// cards at Lv 4 (refPartsDeck). A "win" is the part's bramble destroyed inside the fight's 20 turns (raid_full_sim's overwhelm).
//   node tools/raid_bal1_2026_10_30.js decks                         write the three decks into the result file
//   node tools/raid_bal1_2026_10_30.js measure --tag before [--n 40] [--decks map,ref2,opt] [--parts left,right,tail,core] [--stages s1,s0.5]
//        [--raids <json>] [--plus 2]                                 play the cells (cached per cell; re-running plays only what is missing)
//   node tools/raid_bal1_2026_10_30.js table --tag before            print the cells
// Cache: /home/claude/bench-cache-raidbal1 (--cache-dir), keyed by the raid def, the decks, the game files and the seeds.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const arg = (k, d)=>{ const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const cmd = process.argv[2] || 'help';
const OUT = path.join(ROOT, 'docs/balance/raidbal1-2026-10-30.json');
const CACHE = arg('cache-dir', '/home/claude/bench-cache-raidbal1');
const OPT_FILE = 'docs/balance/opt/deckopt-map13-mr-2026-10-27-hub7-maptrue.json';
const UNLOCK_MAP = 13, UNLOCK_MAP_ID = 'mr'; // the Raid Banner (FEATURE_SPOTS key 'raid', mapNumber 13: The Redwood Deep)

function loadOut(){ try{ return JSON.parse(fs.readFileSync(OUT, 'utf8')); }catch(e){ return {package: 'RAIDBAL1', date: '2026-10-30', runs: {}}; } }
function saveOut(o){ fs.writeFileSync(OUT, JSON.stringify(o, null, 1) + '\n'); }
const sha = s=> crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);

function buildDecks(plus){
  const B = require('./lib_bramble.js'), G = B.G, base = Object.assign({}, B.CARD_DEFS_BASELINE);
  const top = id=> G.cardMaxLevel(base[id]);
  const bump = parts=> parts.map(([id, n, L])=> [id, n, Math.min(top(id), L + plus)]);
  const L0 = G.referencePlayerLevel(UNLOCK_MAP), mref = G.referenceDeckFor(UNLOCK_MAP_ID);
  const r2 = G.refSetFor('ref2', UNLOCK_MAP_ID);
  const opt = JSON.parse(fs.readFileSync(path.join(ROOT, OPT_FILE), 'utf8')).optima[0].deck;
  const mixed = deck=> G.levelMixDeck(deck, L0 + plus); // the map level + plus, as a per-copy mix (whole here: 5)
  const decks = {
    map: {label: 'Map reference (Map 13 road deck)', counts: mref.deck, baseLevel: L0, parts: mixed(mref.deck)},
    ref2: {label: 'Reference-2 (the owner\'s Ant Deck), Map 13 schedule', counts: r2.deck, baseLevel: r2.level, parts: bump(r2.parts)},
    opt: {label: 'Deck optimizer, Map 13 map-true optimum (' + OPT_FILE + ')', counts: opt, baseLevel: L0, parts: mixed(opt)},
  };
  Object.values(decks).forEach(d=>{ const n = d.parts.reduce((t, p)=> t + p[1], 0); d.level = Math.round(d.parts.reduce((t, p)=> t + p[1] * p[2], 0) / n * 100) / 100; d.copies = n; d.plus = plus;
    const missing = d.parts.filter(p=> !base[p[0]]).map(p=> p[0]); if(missing.length) throw new Error(d.label + ': unknown cards ' + missing.join(', ')); });
  return decks;
}

// --edit '{"parts": {"left": {"fight": {"castleHp": 470}}}, "tuning": {...}}': a trial on top of the raid file (parts merged by id, deep;
// a deck or an array is replaced whole)
function merge(a, b){ if(!b || typeof b !== 'object' || Array.isArray(b)) return b; const o = Object.assign({}, a || {});
  Object.keys(b).forEach(k=>{ o[k] = (k === 'deck' || Array.isArray(b[k])) ? b[k] : merge(o[k], b[k]); }); return o; }
function applyEdit(def, ed){ if(!ed) return def; const out = Object.assign({}, def);
  Object.keys(ed).forEach(k=>{ if(k === 'parts') out.parts = def.parts.map(p=> ed.parts[p.id] ? merge(p, ed.parts[p.id]) : p); else out[k] = merge(def[k], ed[k]); });
  return out; }
function gameKey(){ return sha(['arena_app.js', 'bramblewood-engine.js', 'bramblewood-raid.js', 'bramblewood-trench.js', 'canonical/cards.json', 'bramblewood-budget.js'].map(f=> fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\u0000')); }

function measure(){
  const tag = arg('tag', 'before'), n = Number(arg('n', 40)), plus = Number(arg('plus', 2));
  const raidsFile = path.resolve(arg('raids', path.join(ROOT, 'canonical/raids.json')));
  const def = applyEdit(JSON.parse(fs.readFileSync(raidsFile, 'utf8'))[0], arg('edit', null) ? JSON.parse(arg('edit')) : null);
  const allDecks = buildDecks(plus), deckKeys = String(arg('decks', 'map,ref2,opt')).split(',');
  const parts = String(arg('parts', 'left,right,tail,core')).split(','), stages = String(arg('stages', 's1,s0.5')).split(',');
  const S = require('./raid_full_sim.js'); S.setDecks(allDecks);
  fs.mkdirSync(CACHE, {recursive: true});
  const gk = gameKey(), out = loadOut(); out.decks = out.decks || {}; out.decks['plus' + plus] = allDecks;
  const run = out.runs[tag] = out.runs[tag] || {raids: path.relative(ROOT, raidsFile), plus, n, cells: {}};
  run.raidSha = sha(JSON.stringify(def)); if(arg('edit', null)) run.edit = JSON.parse(arg('edit')); run.tuning = def.tuning; run.castleHp = def.parts.map(p=> p.id + ':' + p.fight.castleHp).join(' ');
  const t0 = Date.now();
  for(const dk of deckKeys) for(const partId of parts) for(const st of stages){
    const key = [dk, partId, st].join('|'), ck = path.join(CACHE, sha([gk, JSON.stringify(def), JSON.stringify(allDecks[dk]), partId, st, n].join('|')) + '.json');
    let cell = null; try{ cell = JSON.parse(fs.readFileSync(ck, 'utf8')); cell.cached = true; }catch(e){}
    if(!cell){ let w = 0, dealt = 0, surv = 0, contrib = 0; const ranks = {};
      for(let g = 0; g < n; g++){ const r = S.playOne(def, partId, st, dk, g); if(r.overwhelmed) w++; dealt += r.dealt; surv += r.survived; contrib += r.contribution; ranks[r.rank || '-'] = (ranks[r.rank || '-'] || 0) + 1; }
      cell = {deck: dk, part: partId, stage: st, n, wins: w, win: Math.round(w / n * 1000) / 1000, avgDealt: Math.round(dealt / n), avgSurvived: +(surv / n).toFixed(1), avgContribution: Math.round(contrib / n), ranks};
      fs.writeFileSync(ck, JSON.stringify(cell)); }
    run.cells[key] = cell; saveOut(out);
    console.log(`${dk.padEnd(5)} ${partId.padEnd(6)} ${st.padEnd(5)} win ${String(Math.round(cell.win * 100)).padStart(3)}%  dealt ${String(cell.avgDealt).padStart(4)}  survived ${cell.avgSurvived}${cell.cached ? '  (cached)' : ''}`);
  }
  console.log(`(${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}

function table(){
  const tag = arg('tag', 'before'), run = (loadOut().runs || {})[tag]; if(!run){ console.log('no run ' + tag); return; }
  const by = {}; Object.values(run.cells).forEach(c=>{ (by[c.part + ' ' + c.stage] = by[c.part + ' ' + c.stage] || {})[c.deck] = c; });
  console.log('part   stage  ' + ['map', 'ref2', 'opt'].map(d=> d.padStart(10)).join('') + '      mean');
  Object.keys(by).forEach(k=>{ const r = by[k], ws = ['map', 'ref2', 'opt'].map(d=> r[d]); const m = ws.filter(Boolean);
    console.log(k.padEnd(13) + ws.map(c=> c ? (Math.round(c.win * 100) + '% ' + c.avgDealt).padStart(10) : '         -').join('') + '   ' + (m.length ? Math.round(m.reduce((t, c)=> t + c.win, 0) / m.length * 100) + '%' : '')); });
}

if(cmd === 'decks'){ const o = loadOut(), plus = Number(arg('plus', 2)); o.decks = o.decks || {}; o.decks['plus' + plus] = buildDecks(plus); saveOut(o);
  Object.entries(o.decks['plus' + plus]).forEach(([k, d])=> console.log(k, d.level, JSON.stringify(d.parts))); }
else if(cmd === 'measure') measure();
else if(cmd === 'table') table();
else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 17).join('\n'));
