// 2026-11-16 (package LAB1): what is already saved in docs/balance. The catalogue lists every file by kind (no download); road rows
// (any .jsonl whose lines carry key + win + games, e.g. skirmish-pass-*.jsonl) become road records; other kinds give headline numbers on
// demand. Files are fetched at the pulled commit and cached by blob, so a re-import downloads nothing.
'use strict';
const P = require('./pull.js'), S = require('./store.js');
// a subfolder is one kind (opt, skir1, pipeline ...); a top-level file's kind is its name up to the first digit (skirmish-pass-bal, contribution)
const kindOf = p => { const r = p.replace(/^docs\/balance\//, ''), i = r.indexOf('/'); return i > 0 ? r.slice(0, i) + '/' : (r.replace(/\.[a-z]+$/i, '').replace(/\d.*$/, '').replace(/[-_.]+$/, '') || '(other)'); };
const dateIn = p => (/(\d{4}-\d{2}-\d{2})/.exec(p) || [])[1] || null;

async function catalogue(snap) {
  const t = (await P.listTree(snap)).filter(x => x.path.startsWith('docs/balance/')), kinds = {};
  t.forEach(x => { const k = kindOf(x.path), o = kinds[k] = kinds[k] || { kind: k, files: 0, bytes: 0, latest: null, ext: {} };
    o.files++; o.bytes += x.size || 0; const e = (/\.(\w+)$/.exec(x.path) || [])[1] || '-'; o.ext[e] = (o.ext[e] || 0) + 1; const d = dateIn(x.path); if (d && (!o.latest || d > o.latest)) o.latest = d; });
  return { files: t.length, kinds: Object.values(kinds).sort((a, b) => b.files - a.files) };
}

// Road history: every .jsonl in docs/balance with road rows. maxDates caps the API calls for files with no date in their name.
async function importRoad(snap, opts) {
  opts = opts || {}; const log = opts.log || (() => {}), have = new Set(S.all().filter(r => r.source === 'import').map(r => r.importKey));
  const t = (await P.listTree(snap)).filter(x => /^docs\/balance\/.+\.jsonl$/.test(x.path) && (!opts.match || opts.match.test(x.path)));
  let added = 0, skipped = 0, dated = 0, i = 0;
  for (const x of t) {
    i++; const ik = x.path + '@' + (x.sha || x.size); if (have.has(ik)) { skipped++; continue; }
    let buf; try { buf = await P.fileAt(snap, x); } catch (e) { log('skip ' + x.path + ': ' + e.message); continue; }
    if (!buf) continue;
    const byFight = {};
    buf.toString('utf8').split('\n').forEach(l => { if (!l.trim()) return; let r; try { r = JSON.parse(l); } catch (e) { return; } if (S.isRoadRow(r) && r.target != null) byFight[S.fightId(r)] = S.roadRow(r); });
    const rows = Object.values(byFight);
    if (!rows.length) { S.save({ id: 'imp-' + P.sha1(ik).slice(0, 10), kind: 'file', source: 'import', importKey: ik, file: x.path, label: x.path.replace('docs/balance/', ''), dataHash: 'file:' + x.path }); continue; }
    let date = dateIn(x.path);
    if (!date && !snap.srcDir && dated < (opts.maxDates == null ? 40 : opts.maxDates)) { try { date = await P.commitDate(x.path); dated++; } catch (e) { /* the API limit: undated for now */ } }
    const ref = rows[0].ref || ((/--ref=(\w+)/.exec(x.path) || [])[1]) || 'map';
    S.save({ id: 'imp-' + P.sha1(ik).slice(0, 10), kind: 'road', source: 'import', importKey: ik, file: x.path, label: x.path.replace(/^docs\/balance\/(skirmish-pass-)?/, '').replace(/\.jsonl$/, ''),
      tool: 'tools/skirmish_pass.js (saved)', dataHash: 'file:' + x.path, date: date || '', params: { ref }, seed: null, games: Math.max(...rows.map(r => +r.games)), rows, headline: headline(rows) });
    added++; if (added % 20 === 0) log(`imported ${added} road files (${i}/${t.length})`);
  }
  // saved files with no date in their name: their last commit's date, a few per import (the API allows 60 calls an hour without a token)
  if (!snap.srcDir) { const known = P.readJ(require('path').join(P.home(), 'dates.json'), {});
    for (const r of S.all().filter(x => x.source === 'import' && x.kind === 'road' && !x.date && !known[x.file])) { if (dated >= (opts.maxDates == null ? 40 : opts.maxDates)) break; try { await P.commitDate(r.file); dated++; } catch (e) { break; } } }
  return { added, skipped, files: t.length, dated };
}
function headline(rows) { const s = S.rowsStatus(rows, 20); return { fights: rows.length, main: s.main, side: s.side }; }

// Headline numbers of one kind's newest files (the JSON kinds the balance tools write)
const READERS = [
  [/pipeline\//, j => j.schema ? `${j.step || ''} ${j.status || ''} ${j.durationSec ? Math.round(j.durationSec / 60) + ' min' : ''} changed ${(j.changed || []).length} flagged ${(j.flagged || []).length}` : null],
  [/opt\/deckopt-map/, j => j.map ? `Map ${j.map.num} ${j.map.name}: ${j.settings && j.settings.mode || ''} ${j.throughput ? j.throughput.games + ' games' : ''} best ${j.phase1 && j.phase1.best && j.phase1.best.score != null ? Math.round(100 * j.phase1.best.score) + '%' : ''}` : null],
  [/ref6\/ref6-/, j => j.maps ? `${Object.keys(j.maps).length} maps` : null],
  [/pro-ease/, j => { const p = j.pairings || j.results || []; return Array.isArray(p) ? `${p.length} pairings, ${p.filter(x => x.easy || x.flag).length} flagged easy` : null; }],
  [/contribution-/, j => j.games ? `${j.games} fights, reliability ${j.reliability != null ? (+j.reliability).toFixed(2) : '?'}` : null],
  [/bal13\/summary/, j => j.road ? `road: ${JSON.stringify(j.road.totals || j.road).slice(0, 120)}` : null],
  [/econ2-sim/, j => j.sim ? Object.entries(j.sim).map(([k, v]) => `${k}: Map 20 on day ${v.snaps && v.snaps[20] ? v.snaps[20].day : '?'}`).join('; ') : null],
  [/bench-skills|skill-canon|skill-test/, j => { const n = (j.skills || j.results || j.rows || []).length; return n ? n + ' skills' : null; }],
];
async function headlines(snap, kind, limit) {
  const t = (await P.listTree(snap)).filter(x => x.path.startsWith('docs/balance/') && kindOf(x.path) === kind).sort((a, b) => (dateIn(b.path) || b.path).localeCompare(dateIn(a.path) || a.path)).slice(0, limit || 30);
  const out = [];
  for (const x of t) {
    let h = null;
    if (/\.json$/.test(x.path) && (x.size || 0) < 30e6) { try { const j = JSON.parse((await P.fileAt(snap, x)).toString('utf8')); const rd = READERS.find(([re]) => re.test(x.path)); h = (rd && rd[1](j)) || 'keys: ' + Object.keys(j).slice(0, 8).join(', '); } catch (e) { h = 'unreadable: ' + e.message; } }
    out.push({ path: x.path, size: x.size, date: dateIn(x.path), headline: h });
  }
  return out;
}
module.exports = { catalogue, importRoad, headlines, kindOf };
