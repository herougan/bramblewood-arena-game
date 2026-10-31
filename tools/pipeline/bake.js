'use strict';
// SPEED1 (2026-10-31): the `bake` step: the PRO re-bake and the BPRO rebuild, after the cards changed.
//   run.sh bake [--dry] [--no-bpro] [--bpro-all] [--maps 0-20] [--minutes M] [--budget G]
// 1. tools/opt/skill2_pro_rebake_2026_10_31.js: every stored average field and every PRO / BPRO showcase leader re-computed under the current
//    cards (the decks are not searched again). Fast.
// 2. tools/opt/bpro2_2026_10_31.js: the BPRO decks (focused search, 6,000 games a map) rebuilt only for the maps whose inputs changed: a map's
//    input hash is the engine, the search tools and the stats and skills of every card on its list. The first run takes the committed state as
//    the baseline (the committed docs/balance/bpro2 runs were built on the cards of --baseline REF, default HEAD); --bpro-all rebuilds every map regardless.
//    Then `apply` (canonical/pro-skirmishes.json) and `check` (the 6/4 rule, the list, 20 cards).
// The baked game needs a rebuild afterwards (python3 assemble_arena.py && mv bramblewood-arena.html index.html); the step does not do that.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const P = require('./lib.js');
const HASHES = path.join(P.STATE, 'bake-inputs.json'), PRO = path.join(P.ROOT, 'canonical', 'pro-skirmishes.json');
const BPRO_PLAN = path.join(P.ROOT, 'docs', 'balance', 'bpro2-2026-10-31.json');
const TOOLS = ['bramblewood-engine.js', 'tools/opt/bpro2_2026_10_31.js', 'tools/bench/deck.js', 'tools/opt/deckopt.js', 'tools/opt/deck1_2026_10_30.js', 'tools/opt/phase2-rules.json'];

let BASE_REF = 'HEAD';
function headBlob(f) { const r = P.run('git', ['show', BASE_REF + ':' + f]); return r.code === 0 ? r.out : ''; }
function hashMap(entry, cards, files) {
  const h = crypto.createHash('sha1'); h.update(files.join('\n')); h.update(JSON.stringify([entry.pool, entry.focuses]));
  (entry.pool || []).forEach(id => { const c = cards[id]; h.update(id + ':' + (c ? JSON.stringify([c.attack, c.health, c.effects, c.wait, c.cost, c.rarity, c.levelSkills, c.types || c.type]) : '-')); });
  return h.digest('hex').slice(0, 12);
}
async function step(args, S) {
  const dry = !!args.dry;
  // 1. the PRO re-bake
  const rb = P.run('node', ['tools/opt/skill2_pro_rebake_2026_10_31.js'].concat(dry ? ['--dry'] : []), { log: path.join(P.STATE, 'bake-rebake.log') });
  if (rb.code) throw new Error('PRO re-bake failed: ' + rb.out.split('\n').slice(-4).join(' / '));
  const m = /(\d+) fields, (\d+) leaders re-baked/.exec(rb.out) || [];
  rb.out.split('\n').filter(l => /: leader |: field /.test(l)).forEach(l => { const q = /^(\S+?): (leader|field) (.*) -> (.*)$/.exec(l); if (q) S.changed.push({ id: q[1], field: q[2], old: q[3].slice(0, 60), new: q[4].slice(0, 60) }); });
  S.counts = { 'fields re-baked': +m[1] || 0, 'leaders re-baked': +m[2] || 0 };
  S.files.push('canonical/pro-skirmishes.json');
  if (args['no-bpro']) { S.notes.push('BPRO rebuild skipped (--no-bpro)'); return; }
  // 2. the BPRO rebuild for the maps whose inputs changed
  const pl = P.run('node', ['tools/opt/bpro2_2026_10_31.js', 'plan'].concat(args.maps ? ['--maps', String(args.maps)] : ['--maps', '0-20']), { log: path.join(P.STATE, 'bake-plan.log') });
  if (pl.code) throw new Error('BPRO plan failed: ' + pl.out.split('\n').slice(-4).join(' / '));
  const plan = P.readJson(BPRO_PLAN), cur = {}; P.readJson(path.join(P.ROOT, 'canonical', 'cards.json')).forEach(c => { cur[c.id] = c; });
  const curFiles = TOOLS.map(f => f + ':' + P.sha(f, 12));
  BASE_REF = args.baseline || 'HEAD';
  let state = P.readJson(HASHES, null);
  if (!state) { // baseline: the committed cards and tools
    const old = {}; JSON.parse(headBlob('canonical/cards.json') || '[]').forEach(c => { old[c.id] = c; });
    const files = TOOLS.map(f => f + ':' + crypto.createHash('sha1').update(headBlob(f)).digest('hex').slice(0, 12));
    state = { note: 'baseline = the committed cards and tools at the first bake', maps: {} };
    Object.keys(plan.maps).forEach(id => { state.maps[id] = hashMap(plan.maps[id], old, files); });
    S.notes.push(`first bake: ${BASE_REF} is the baseline for the BPRO runs on file`);
  }
  const maps = Object.keys(plan.maps).filter(id => !plan.maps[id].none), stale = maps.filter(id => args['bpro-all'] || state.maps[id] !== hashMap(plan.maps[id], cur, curFiles));
  S.inputs = { rebake: dry ? 'dry' : 'applied', bproMaps: maps.length, stale: stale, budgetGames: args.budget ? +args.budget : 6000, engine: P.sha('bramblewood-engine.js'), cards: P.sha('canonical/cards.json') };
  S.counts['BPRO maps'] = maps.length; S.counts['BPRO maps stale'] = stale.length;
  if (dry) { S.notes.push('dry: would rebuild ' + stale.join(', ')); return; }
  const before = P.readJson(PRO), prevBest = {}; Object.keys(before.maps).forEach(id => { const b = (before.maps[id].bpro || []).map(e => e.source && e.source.score).filter(x => x != null); if (b.length) prevBest[id] = Math.max(...b); });
  const t0 = Date.now(), minutes = args.minutes != null ? +args.minutes : Infinity; let ran = 0, left = 0; const rebuilt = [];
  for (const id of stale) {
    if ((Date.now() - t0) / 60000 > minutes) { left++; continue; }
    const r = P.run('node', ['tools/opt/bpro2_2026_10_31.js', 'run', '--map', id, '--force'].concat(args.budget ? ['--budget', String(args.budget)] : []), { log: path.join(P.STATE, `bake-bpro-${id}.log`) });
    if (r.code) throw new Error(`BPRO run ${id} failed: ` + r.out.split('\n').slice(-4).join(' / '));
    ran++; rebuilt.push(id); state.maps[id] = hashMap(plan.maps[id], cur, curFiles); P.writeJson(HASHES, state);
  }
  if (rebuilt.length) {
    const ap = P.run('node', ['tools/opt/bpro2_2026_10_31.js', 'apply', '--maps', [...new Set(rebuilt.map(id => plan.maps[id].num))].join(',')], { log: path.join(P.STATE, 'bake-apply.log') });
    if (ap.code) throw new Error('BPRO apply failed: ' + ap.out.split('\n').slice(-4).join(' / '));
    const after = P.readJson(PRO);
    rebuilt.forEach(id => { const b = (after.maps[id].bpro || []), best = b.length ? Math.max(...b.map(e => e.source.score)) : null;
      S.changed.push({ id: 'BPRO ' + id, field: 'best deck score', old: prevBest[id] != null ? prevBest[id] : '-', new: best });
      if (best != null && prevBest[id] != null && best < prevBest[id] - 0.1) S.flagged.push({ id: 'BPRO ' + id, why: `best score fell ${prevBest[id]} -> ${best}` }); });
  }
  const ck = P.run('node', ['tools/opt/bpro2_2026_10_31.js', 'check'], { log: path.join(P.STATE, 'bake-check.log') });
  ck.out.split('\n').filter(l => /^problem: /.test(l)).forEach(l => S.flagged.push({ id: 'BPRO check', why: l.slice(9, 200) }));
  P.writeJson(HASHES, state);
  S.counts['BPRO maps rebuilt'] = ran; if (left) { S.counts['BPRO maps left'] = left; S.status = 'partial'; S.notes.push('run bake again to finish (--minutes)'); }
  S.files.push('docs/balance/bpro2/', path.relative(P.ROOT, HASHES));
}
module.exports = { step, hashMap };
