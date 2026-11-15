// 2026-11-16 (package LAB1): the results store. One JSON line per run in runs.jsonl; road rows pool across runs that share a data hash
// and a reference deck (wins and games summed per fight, Wilson 95%), and different data hashes read as a trend.
'use strict';
const fs = require('fs'), path = require('path');
const P = require('./pull.js');
const file = () => path.join(P.home(), 'runs.jsonl');
let cache = null, cacheKey = '';
function all() {
  const f = file(); if (!fs.existsSync(f)) return [];
  const st = fs.statSync(f), k = st.size + ':' + st.mtimeMs; if (cache && k === cacheKey) return cache;
  cache = fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean); cacheKey = k;
  return cache;
}
function save(rec) { rec.created = rec.created || new Date().toISOString(); fs.appendFileSync(file(), JSON.stringify(rec) + '\n'); return rec; }
const get = id => all().find(r => r.id === id);
const brief = r => { const o = Object.assign({}, r); delete o.rows; delete o.seeds; delete o.detail; o.nRows = (r.rows || []).length; return o; };

// ---- statistics
const Z = 1.96;
function wilson(w, n) { if (!n) return [0, 1]; const p = w / n, d = 1 + Z * Z / n, c = p + Z * Z / (2 * n), m = Z * Math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)); return [Math.max(0, (c - m) / d), Math.min(1, (c + m) / d)]; }
// more games for a 95% half-width of h (fraction), at the observed rate (0.5 before any game)
function gamesNeeded(w, n, h) { const p = n ? w / n : 0.5, need = Math.ceil(Z * Z * Math.max(p * (1 - p), 0.0025) / (h * h)); return Math.max(0, need - n); }

// ---- road rows: tools/skirmish_pass.js measure lines (win in %, games), reduced to what pooling needs
const ROW_KEYS = ['map', 'key', 'code', 'mapNo', 'side', 'endless', 'kind', 'name', 'target', 'lo', 'hi', 'curve', 'games', 'win', 'ref', 'mapName'];
function roadRow(r) { const o = {}; ROW_KEYS.forEach(k => { if (r[k] != null) o[k] = r[k]; }); o.wins = Math.round((+r.win) * (+r.games) / 100); return o; }
const isRoadRow = r => r && typeof r.key === 'string' && isFinite(+r.win) && +r.games > 0;
const fightId = r => (r.map || '') + ':' + r.key;
// two seed ranges {base + 37g} overlap: the same games, pooled once
const overlap = (a, b) => { if (a.seed == null || b.seed == null) return a.seed === b.seed; const d = b.seed - a.seed; return d % 37 === 0 && d / 37 > -b.games && d / 37 < a.games; };

function roadGroups(records) {
  const groups = {}, dates = P.readJ(path.join(P.home(), 'dates.json'), {}); // saved files dated later by the importer (commit dates)
  (records || all()).filter(r => r.kind === 'road' && r.rows && r.rows.length).forEach(r => {
    const gk = r.dataHash + '|' + (r.params && r.params.ref || 'map'), g = groups[gk] = groups[gk] || { key: gk, dataHash: r.dataHash, ref: r.params && r.params.ref || 'map', runs: [], shas: [], created: '', date: '', source: r.source || 'lab', fights: {}, seen: {} };
    g.runs.push(r.id); if (r.sha && !g.shas.includes(r.sha)) g.shas.push(r.sha); if (r.created > g.created) g.created = r.created; const d = r.source === 'import' ? (r.date || (dates[r.file] || '').slice(0, 10)) : (r.date || r.created); if (d > g.date) g.date = d; if (r.label) g.label = r.label;
    r.rows.forEach(x => { const id = fightId(x), seed = { seed: r.seed != null ? r.seed : null, games: +x.games };
      const seen = g.seen[id] = g.seen[id] || []; if (seen.some(s => overlap(s, seed) || overlap(seed, s))) return; seen.push(seed);
      const f = g.fights[id] = g.fights[id] || Object.assign({}, x, { wins: 0, games: 0, runs: 0 });
      f.wins += x.wins; f.games += +x.games; f.runs++; });
  });
  return Object.values(groups).map(g => { delete g.seen; Object.values(g.fights).forEach(f => { f.p = f.wins / f.games; f.win = 100 * f.p; f.ci = wilson(f.wins, f.games).map(v => 100 * v); f.gap = f.target != null ? f.win - f.target : null; }); return g; })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
// status of one group: Maps 0..maxMap, curve fights, no endless floors, main vs side
function status(g, maxMap) {
  maxMap = maxMap == null ? 20 : maxMap;
  const fs_ = Object.values(g.fights).filter(f => f.curve && !f.endless && f.mapNo != null && f.mapNo <= maxMap && f.target != null), out = {};
  ['main', 'side'].forEach(s => { const L = fs_.filter(f => !!f.side === (s === 'side'));
    out[s] = { total: L.length, inBand: L.filter(f => f.lo <= f.win && f.win <= f.hi).length, within10: L.filter(f => Math.abs(f.gap) <= 10).length, beyond20: L.filter(f => Math.abs(f.gap) > 20).length,
      games: L.reduce((t, f) => t + f.games, 0) }; });
  out.worst = fs_.slice().sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap)).slice(0, 15).map(f => ({ id: fightId(f), code: f.code || f.key, name: f.name, mapNo: f.mapNo, side: !!f.side, kind: f.kind, win: f.win, ci: f.ci, target: f.target, lo: f.lo, hi: f.hi, gap: f.gap, games: f.games, need5: gamesNeeded(f.wins, f.games, 0.05) }));
  const maps = {}; fs_.forEach(f => { const m = maps[f.mapNo] = maps[f.mapNo] || { mapNo: f.mapNo, name: f.mapName || '', fights: 0, inBand: 0, within10: 0, beyond20: 0, gapSum: 0, worst: null };
    m.fights++; if (f.lo <= f.win && f.win <= f.hi) m.inBand++; if (Math.abs(f.gap) <= 10) m.within10++; if (Math.abs(f.gap) > 20) m.beyond20++; m.gapSum += f.gap; if (!m.worst || Math.abs(f.gap) > Math.abs(m.worst.gap)) m.worst = { code: f.code || f.key, gap: f.gap }; });
  out.maps = Object.values(maps).sort((a, b) => a.mapNo - b.mapNo).map(m => Object.assign(m, { meanGap: m.gapSum / m.fights }));
  return out;
}
// headline of one run's rows (no pooling): main / side totals and the worst fights
function rowsStatus(rows, maxMap) {
  const g = roadGroups([{ kind: 'road', dataHash: '-', rows, seed: null }])[0]; if (!g) return null;
  const s = status(g, maxMap); delete s.maps; s.worst = s.worst.slice(0, 5); return s;
}
// a group that covers most of the road's main fights (a full measure, not a spot check)
const maxTotal = new WeakMap();
const full = (g, maxMap, G) => { const k = maxTotal.get(G) || {}; if (k[maxMap] == null) { k[maxMap] = Math.max(0, ...G.map(x => status(x, maxMap).main.total)); maxTotal.set(G, k); } return status(g, maxMap).main.total >= 0.6 * k[maxMap]; };
function trend(groups, maxMap) {
  return (groups || roadGroups()).map(g => { const s = status(g, maxMap); return { key: g.key, label: g.label || g.dataHash, date: g.date, source: g.source, shas: g.shas, ref: g.ref, main: s.main, side: s.side }; })
    .filter(t => t.main.total && t.date).filter((t, i, L) => t.main.total >= 0.6 * Math.max(...L.map(x => x.main.total))).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}
function csv(rows, cols) {
  cols = cols || [...new Set(rows.flatMap(r => Object.keys(r)))];
  const q = v => { if (v == null) return ''; const s = typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [cols.join(',')].concat(rows.map(r => cols.map(c => q(r[c])).join(','))).join('\n') + '\n';
}
module.exports = { full, all, save, get, brief, wilson, gamesNeeded, roadRow, isRoadRow, fightId, roadGroups, status, rowsStatus, trend, csv, file };
