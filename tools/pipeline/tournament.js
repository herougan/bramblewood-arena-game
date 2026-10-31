'use strict';
// SPEED1 (2026-10-31): the `tournament` step: the reference and progression decks (REF5's "prog" 1-5 and the Map reference) played against
// every road fight of the chosen maps (tools/opt/ref5_prog.js measure road, the game's simulateReferenceFight, seeds 9100 + 37g).
//   run.sh tournament [--games 24] [--maps 0-20] [--minutes 8] [--side] [--tag T]
// Results: tests/out/pipeline-tournament/<tag>/ref5-road.jsonl (resumable: a fight already played with the same games is not played again),
// summary: the mean win rate of each reference deck over the fights, and the fights where the progression decks' mean sits more than BAND
// (0.25) from the road's target (flagged).
const fs = require('fs'), path = require('path');
const P = require('./lib.js');
const BAND = 0.25;
async function step(args, S) {
  const games = +(args.games || 24), maps = args.maps || '0-20', tag = args.tag || 'default', dir = path.join(P.ROOT, 'tests', 'out', 'pipeline-tournament', tag);
  const before = fileLines(path.join(dir, 'ref5-road.jsonl'));
  const r = P.run('node', ['tools/opt/ref5_prog.js', 'measure', 'road', '--maps', String(maps), '--games', String(games), '--out', dir, '--minutes', String(args.minutes || 8)].concat(args.side ? ['--side'] : []), { log: path.join(P.STATE, `tournament-${tag}.log`) });
  if (r.code) throw new Error('road measure failed: ' + r.out.split('\n').slice(-4).join(' / '));
  const rows = fileLines(path.join(dir, 'ref5-road.jsonl')).filter(x => x.games === games && inMaps(x.map, maps));
  const by = {}; rows.forEach(x => { (by[x.ref] = by[x.ref] || []).push(x.win); });
  const mean = a => a.reduce((t, v) => t + v, 0) / (a.length || 1);
  const means = {}; Object.keys(by).sort().forEach(k => { means[k] = P.r2(mean(by[k]) * 100) / 100; });
  const fights = {}; rows.forEach(x => { const f = fights[x.mapId + ':' + x.key] = fights[x.mapId + ':' + x.key] || { target: x.target, prog: [], map: null, no: x.map }; if (x.ref === 'map') f.map = x.win; else f.prog.push(x.win); });
  Object.keys(fights).forEach(k => { const f = fights[k]; if (f.target == null || !f.prog.length) return; const m = mean(f.prog);
    if (Math.abs(m - f.target) > BAND) S.flagged.push({ id: k, why: `prog mean ${P.r2(m)} against the road target ${f.target} (Map reference ${f.map})` }); });
  const done = rows.length, newRows = fileLines(path.join(dir, 'ref5-road.jsonl')).length - before.length;
  S.inputs = { games, maps: String(maps), tag, band: BAND, dir: path.relative(P.ROOT, dir), refs: Object.keys(by) };
  S.counts = { fights: Object.keys(fights).length, 'rows played now': newRows, 'rows on file': done };
  S.cached.hits = done - newRows; S.cached.played = newRows;
  Object.keys(means).forEach(k => S.notes.push(`${k} mean win ${means[k]}`));
  S.inputs.means = means; S.files.push(path.relative(P.ROOT, path.join(dir, 'ref5-road.jsonl')));
  if (/time budget reached/.test(r.out)) { S.status = 'partial'; S.notes.push('time budget reached: run again to go on'); }
}
function fileLines(f) { try { return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch (e) { return []; } }
function inMaps(n, spec) { return String(spec).split(',').some(p => { const m = /^(\d+)-(\d+)$/.exec(p); return m ? n >= +m[1] && n <= +m[2] : n === +p; }); }
module.exports = { step };
