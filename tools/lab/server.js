// 2026-11-16 (package LAB1): the local web UI's server (127.0.0.1 only) and its JSON API over the store, the queue and the importer.
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), url = require('url');
const P = require('./pull.js'), S = require('./store.js'), I = require('./importer.js'), J = require('./jobs.js');
const VERSION = require('./package.json').version;

function start(opts) {
  opts = opts || {};
  const q = new J.Queue(); q.kick();
  let gcache = { k: null, groups: null };
  const groups = () => { const k = S.all().length + ':' + (S.all().slice(-1)[0] || {}).id; if (gcache.k !== k) gcache = { k, groups: S.roadGroups() }; return gcache.groups; };
  const last = () => (P.readJ(path.join(P.home(), 'state.json'), {}).last) || null;
  const snapNow = async () => last() || P.pull({ local: opts.local });
  const metaCtx = () => { const c = J.context({ id: 'meta', log: [] }, () => {}); c.snap = last(); return c; };
  const json = (res, code, o) => { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(o)); };
  const body = req => new Promise((ok, no) => { let b = ''; req.on('data', d => { b += d; if (b.length > 5e6) req.destroy(); }); req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch (e) { no(e); } }); });
  const groupSummary = g => { const s = S.status(g, 20); return { key: g.key, label: g.label || g.dataHash, dataHash: g.dataHash, ref: g.ref, date: g.date, source: g.source, runs: g.runs.length, shas: g.shas, main: s.main, side: s.side }; };

  const routes = {
    'GET /': (req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(fs.readFileSync(path.join(__dirname, 'ui.html'))); },
    'GET /api/ping': (req, res) => json(res, 200, { lab: true, version: VERSION }),
    'GET /api/state': (req, res) => json(res, 200, { version: VERSION, home: P.home(), cores: J.cores(), snapshot: last(), local: opts.local || process.env.LAB_LOCAL || null,
      presets: Object.fromEntries(Object.entries(J.PRESETS).map(([k, v]) => [k, { label: v.label, cmd: v.cmd, defaults: v.defaults }])),
      jobs: q.jobs.slice(-60).map(j => Object.assign({}, j, { log: j.status === 'running' ? j.log.slice(-40) : j.log.slice(-3) })) }),
    'GET /api/job': (req, res, Q) => { const j = q.jobs.find(x => x.id === Q.id); j ? json(res, 200, j) : json(res, 404, { error: 'no job' }); },
    'GET /api/dashboard': (req, res, Q) => {
      const G = groups(), list = G.map(groupSummary).filter(g => g.main.total || g.side.total), mm = +Q.maxmap || 20, sel = G.find(g => g.key === Q.group) || G.find(g => g.source === 'lab' && S.full(g, mm, G)) || G.find(g => g.date && S.full(g, mm, G)) || G[0];
      const st = sel ? S.status(sel, +Q.maxmap || 20) : null;
      const fights = sel ? Object.values(sel.fights).filter(f => f.mapNo != null && f.mapNo <= (+Q.maxmap || 20)).sort((a, b) => a.mapNo - b.mapNo || String(a.key).localeCompare(String(b.key), undefined, { numeric: true }))
        .map(f => ({ id: S.fightId(f), code: f.code || f.key, name: f.name, mapNo: f.mapNo, side: !!f.side, kind: f.kind, curve: !!f.curve, endless: !!f.endless, win: f.win, ci: f.ci, target: f.target, lo: f.lo, hi: f.hi, gap: f.gap, games: f.games, runs: f.runs, need5: S.gamesNeeded(f.wins, f.games, 0.05) })) : [];
      const kinds = {}; S.all().forEach(r => { if (r.kind !== 'file') { const k = r.source === 'import' ? 'saved ' + r.kind : r.kind; kinds[k] = (kinds[k] || 0) + 1; } });
      json(res, 200, { groups: list, group: sel ? groupSummary(sel) : null, status: st, fights, trend: S.trend(G, +Q.maxmap || 20), kinds });
    },
    'GET /api/runs': (req, res) => json(res, 200, S.all().filter(r => r.kind !== 'file').map(S.brief).reverse()),
    'GET /api/run': (req, res, Q) => { const r = S.get(Q.id); r ? json(res, 200, r) : json(res, 404, { error: 'no run' }); },
    'GET /api/catalogue': async (req, res) => json(res, 200, await I.catalogue(await snapNow())),
    'GET /api/headlines': async (req, res, Q) => json(res, 200, await I.headlines(await snapNow(), Q.kind, +Q.limit || 20)),
    'GET /api/meta': async (req, res) => { if (!last()) await P.pull({ local: opts.local }); json(res, 200, await J.metaOf(metaCtx(), last().root)); },
    'GET /api/export.csv': (req, res, Q) => {
      let rows = [];
      if (Q.group) { const g = groups().find(x => x.key === Q.group); rows = g ? Object.values(g.fights).map(f => ({ fight: S.fightId(f), code: f.code || f.key, name: f.name, map: f.mapNo, side: !!f.side, kind: f.kind, win: +f.win.toFixed(2), ci_lo: +f.ci[0].toFixed(2), ci_hi: +f.ci[1].toFixed(2), target: f.target, lo: f.lo, hi: f.hi, games: f.games, runs: f.runs })) : []; }
      else if (Q.run) { const r = S.get(Q.run); rows = !r ? [] : r.kind === 'journey' ? r.summary : r.rows || (r.result && r.result.road) || []; }
      res.writeHead(200, { 'content-type': 'text/csv', 'content-disposition': `attachment; filename="lab-${(Q.group || Q.run || 'export').replace(/[^\w-]/g, '_').slice(0, 40)}.csv"` }); res.end(S.csv(rows));
    },
    'POST /api/jobs': async (req, res) => { const b = await body(req); if (opts.local && b.params && b.params.local == null) b.params.local = opts.local; json(res, 200, q.add(b.type, b.params)); },
    'POST /api/cancel': async (req, res) => { const b = await body(req); json(res, 200, { ok: q.cancel(b.id) }); },
    'POST /api/pull': async (req, res) => { try { json(res, 200, await P.pull({ local: opts.local })); } catch (e) { json(res, 502, { error: e.message }); } },
    'POST /api/quit': (req, res) => { json(res, 200, { bye: true }); setTimeout(() => { if (q.ctx) q.ctx.cancel(); process.exit(0); }, 200); },
  };
  const server = http.createServer(async (req, res) => {
    const u = url.parse(req.url, true), r = routes[req.method + ' ' + u.pathname];
    // the API answers this machine's own pages only (no other site may start runs)
    if (req.method === 'POST' && req.headers.origin && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.origin)) return json(res, 403, { error: 'origin' });
    if (!r) return json(res, 404, { error: 'not found' });
    try { await r(req, res, u.query); } catch (e) { if (!res.headersSent) json(res, 500, { error: e.message }); }
  });
  return new Promise(ok => {
    const listen = port => server.once('error', e => { if (e.code === 'EADDRINUSE' && port) listen(0); else throw e; }).listen(port, '127.0.0.1', () => ok({ server, queue: q, port: server.address().port }));
    listen(opts.port == null ? 47800 : +opts.port);
  });
}
module.exports = { start };
