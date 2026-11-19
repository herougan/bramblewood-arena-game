#!/usr/bin/env node
// 2026-11-20 (package SKM1): runs registry methods one after another over a skill list, one line a skill in
// docs/balance/skm/results/<method>.jsonl (resumable: a skill already on file for the same game fingerprint is skipped).
//   nice -n 10 node tools/skm/run.js [--methods all|offline|sim|V1-win,H1-*] [--skills all|a,b] [--workers 2] [--list]
// A sim design's primary method plays stages of paired fights per skill and stops when the 95% half-width is under 10% of the estimate or at
// the design's cap; its other estimators read the same games (M = the primary's stopping point for that skill).
'use strict';
const path = require('path'), fs = require('fs');
const S = require('./lib.js'), R = require('./registry.js');
const OUT = path.join(S.ROOT, 'docs', 'balance', 'skm', 'results');

function args(a) { const o = { methods: 'all', skills: 'all', workers: 2 }; for (let i = 0; i < a.length; i++) { const k = a[i];
  if (k === '--methods') o.methods = a[++i]; else if (k === '--skills') o.skills = a[++i]; else if (k === '--workers') o.workers = +a[++i]; else if (k === '--list') o.list = true; else if (k === '--force') o.force = true; }
  return o; }
const glob = (pat, id) => new RegExp('^' + pat.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(id);
function pick(sel) {
  if (sel === 'all') return R.REG; if (sel === 'offline') return R.REG.filter(m => !m.exp); if (sel === 'sim') return R.REG.filter(m => m.exp);
  const pats = sel.split(','); return R.REG.filter(m => pats.some(p => glob(p, m.id)));
}
function readLines(f) { if (!fs.existsSync(f)) return []; return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean); }

async function main() {
  const o = args(process.argv.slice(2)), methods = pick(o.methods);
  if (o.list) { methods.forEach(m => console.log(m.id.padEnd(22), m.idea)); console.log(methods.length + ' methods'); return; }
  fs.mkdirSync(OUT, { recursive: true });
  const sim = new S.Sim({ workers: o.workers, quiet: true }), U = S.universe(sim.gm), fp = S.L.fingerprint();
  const skills = o.skills === 'all' ? U.list : o.skills.split(',');
  for (const m of methods) {
    const f = path.join(OUT, m.id + '.jsonl'), have = new Set(readLines(f).filter(r => r.fp === fp || !m.exp).map(r => r.skill));
    const todo = skills.filter(s => o.force || !have.has(s)); if (!todo.length) { console.log(`${m.id}: done (cached)`); continue; }
    const prim = m.exp && !m.primary ? R.REG.find(x => x.exp === m.exp && x.primary) : null;
    const primM = prim ? new Map(readLines(path.join(OUT, prim.id + '.jsonl')).filter(r => r.fp === fp).map(r => [r.skill, r.M])) : null;
    const t0 = Date.now(), p0 = sim.played; let n = 0, got = 0;
    for (const s of todo) {
      if (prim && !primM.has(s)) continue; // its design's primary has not measured this skill yet
      let r; try { r = await m.run(s, { sim, U, M: prim ? primM.get(s) : null }); } catch (e) { r = { worth: null, note: 'error: ' + String(e.message || e).slice(0, 160) }; }
      const line = { method: m.id, skill: s, worth: r.worth == null ? null : +r.worth.toFixed(3), ci: r.ci == null ? null : +r.ci.toFixed(3), games: r.games || 0,
        price: +U.skills[s].price.toFixed(3), carrier: r.carrier, M: r.M, n: r.n, note: r.note, fp, t: new Date().toISOString() };
      fs.appendFileSync(f, JSON.stringify(line) + '\n'); n++; if (r.worth != null) got++;
    }
    console.log(`${m.id}: ${n} skills (${got} with an estimate), ${sim.played - p0} games played, ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  sim.close();
}
main().catch(e => { console.error(e); process.exit(1); });
