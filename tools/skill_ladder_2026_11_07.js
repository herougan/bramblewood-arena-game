#!/usr/bin/env node
// 2026-11-07 (owner 07:15: "redo a skill budgeting test ... such that the skill's budget is a comprehensive and good one. E.g. test armor 1,
// armor 2, armor 3..."): the skill ladder. Every skill on a Map 0-20 card is measured by the canon tool (tools/skill_canon_2026_10_31.js,
// paired fights on 6 vanilla carriers, read in 3A + H budget points against the 15 canon anchors) at every number from 1 up to one past
// the highest on any card (capped at 5; Pounce 6), at Level 1 and Level 5, both brambles 15 (the road's). A numbered skill then gets one
// curve, value x N^pow, fitted to its measured points (least squares on the measured worths, weighted by their precision), shown beside
// the current table price. Nothing is written to canonical/skill-costs.json: a price change stays the owner's call.
//
//   node tools/skill_ladder_2026_11_07.js plan                    the list of measurements (no games)
//   node tools/skill_ladder_2026_11_07.js run [--games 400] [--levels 1,5] [--only armor,poison]   play them (resumes: a saved point is skipped)
//   node tools/skill_ladder_2026_11_07.js check [--games 1000] [--levels 1,5]   the anchors against each other at each level (run first)
//   node tools/skill_ladder_2026_11_07.js summary                 fit the curves -> docs/balance/skill-ladder/summary-2026-11-07.json + .md
//
// Saved points: docs/balance/skill-ladder/skill-canon-<key>-<N>-L<level>-ladder.json (the canon tool's own file).
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'docs', 'balance', 'skill-ladder'), TAG = 'ladder';
const CAP = 5, CAP_OVER = { pounce: 6 };
// keys that are a parameter of another skill, or not a skill the table prices on its own
const SKIP = new Set(['deliveryEvery', 'triggers', 'remember', 'leader', 'archerStyle', 'hatchling', 'fodder', 'speciesOverride']);

const args = process.argv.slice(2), cmd = args.shift() || 'plan';
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const GAMES = +opt('--games', cmd === 'check' ? 1000 : 400), LEVELS = String(opt('--levels', '1,5')).split(',').map(Number), ONLY = opt('--only', '') ? opt('--only').split(',') : null;

function mapNumbers() { // map id -> map number, from the road measure's records (the game's own numbering)
  const no = {}, dir = path.join(ROOT, 'docs', 'balance');
  const f = fs.readdirSync(dir).filter(n => /^skirmish-pass-.*\.jsonl$/.test(n)).map(n => path.join(dir, n)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).forEach(l => { const r = JSON.parse(l); no[r.map] = r.mapNo; });
  return no;
}
function plan() {
  const cards = new Map(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).map(c => [c.id, c]));
  const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps, no = mapNumbers();
  const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
  const priced = new Set((table.skills || []).map(e => e.id));
  const ids = new Set(); Object.entries(pools).forEach(([m, v]) => { if (no[m] != null && no[m] <= 20) (v.cards || []).forEach(id => ids.add(id)); });
  const seen = new Map(); // key -> {max, flag, cards}
  ids.forEach(id => { const c = cards.get(id); if (!c) return; Object.entries(c.effects || {}).forEach(([k, v]) => {
    if (SKIP.has(k)) return; const s = seen.get(k) || { key: k, max: 0, flag: false, other: false, cards: 0 }; s.cards++;
    if (typeof v === 'boolean') s.flag = true; else if (typeof v === 'number') s.max = Math.max(s.max, v); else s.other = true; seen.set(k, s); }); });
  const items = [], skipped = [];
  [...seen.values()].sort((a, b) => b.cards - a.cards || (a.key < b.key ? -1 : 1)).forEach(s => {
    if (!priced.has(s.key)) { skipped.push(s.key + ' (not in the cost table)'); return; }
    if (s.max > 0) { const top = Math.min(CAP_OVER[s.key] || CAP, Math.max(2, Math.ceil(s.max) + 1)); for (let n = 1; n <= top; n++) items.push({ key: s.key, n, cards: s.cards }); }
    else if (s.flag) items.push({ key: s.key, n: true, cards: s.cards });
    else skipped.push(s.key + ' (object value: measured with its card, not on its own)');
  });
  return { items: ONLY ? items.filter(x => ONLY.includes(x.key)) : items, skipped, cards: ids.size };
}
const fileOf = (key, n, L) => path.join(OUT, `skill-canon-${key}-${n === true ? 'on' : n}-L${L}-${TAG}.json`);
function canon(extra) { return spawnSync(process.execPath, [path.join(ROOT, 'tools', 'skill_canon_2026_10_31.js')].concat(extra), { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 64 << 20 }); }

if (cmd === 'plan') {
  const p = plan(); console.log(`${p.cards} cards on Maps 0-20; ${p.items.length} points a level (x ${LEVELS.length} levels = ${p.items.length * LEVELS.length} measurements)`);
  const by = {}; p.items.forEach(x => { (by[x.key] = by[x.key] || []).push(x.n); }); Object.entries(by).forEach(([k, ns]) => console.log(`  ${k.padEnd(18)} ${ns.join(' ')}`));
  if (p.skipped.length) console.log('skipped: ' + p.skipped.join('; '));
} else if (cmd === 'check') {
  fs.mkdirSync(OUT, { recursive: true });
  LEVELS.forEach(L => { const f = path.join(OUT, `skill-canon-anchors-L${L}-${TAG}.json`); if (fs.existsSync(f)) { console.log('have ' + path.relative(ROOT, f)); return; }
    const r = canon(['check', '--bramble', '15', '--games', String(GAMES), '--level', String(L), '--save', '--out', OUT, '--name', `anchors-L${L}`, '--tag', TAG]);
    console.log(`anchors L${L}: exit ${r.status}`); process.stdout.write((r.stdout || '').split('\n').filter(l => /canon rate|outside|κ/.test(l)).join('\n') + '\n'); if (r.status) process.stderr.write(r.stderr || ''); });
} else if (cmd === 'run') {
  fs.mkdirSync(OUT, { recursive: true }); const p = plan(), todo = [];
  LEVELS.forEach(L => p.items.forEach(x => { if (!fs.existsSync(fileOf(x.key, x.n, L))) todo.push(Object.assign({ L }, x)); }));
  console.log(`${todo.length} measurements to play (${GAMES} fights a variant)`); const t0 = Date.now();
  todo.forEach((x, i) => { const sk = x.n === true ? x.key : `${x.key}=${x.n}`;
    const r = canon(['measure', '--skill', sk, '--bramble', '15', '--games', String(GAMES), '--level', String(x.L), '--save', '--out', OUT, '--name', `${x.key}-${x.n === true ? 'on' : x.n}-L${x.L}`, '--tag', TAG]);
    const line = (r.stdout || '').split('\n').find(l => l.startsWith('test ')) || ('exit ' + r.status + ' ' + String(r.stderr || '').split('\n').slice(-3).join(' | '));
    console.log(`[${i + 1}/${todo.length}, ${Math.round((Date.now() - t0) / 60000)} min] L${x.L} ${sk}: ${line.slice(0, 160)}`); });
} else if (cmd === 'summary') {
  const p = plan(), table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
  const row = id => (table.skills || []).find(e => e.id === id) || {};
  const cur = (e, n) => { if (n === true) return +e.value || 0; if (e.scale === 'n') return e.pow != null ? e.value * Math.pow(n, e.pow) : e.value * n; if (e.scale === 'half') return n > 1 ? e.value * (1 + Math.floor(n / 2)) : e.value; return +e.value || 0; };
  const keys = [...new Set(p.items.map(x => x.key))], out = { generated: new Date().toISOString(), games: null, levels: LEVELS, skills: [] };
  keys.forEach(k => {
    const e = row(k), ns = p.items.filter(x => x.key === k).map(x => x.n), pts = [];
    ns.forEach(n => { const per = {}; LEVELS.forEach(L => { const f = fileOf(k, n, L); if (!fs.existsSync(f)) return; const r = JSON.parse(fs.readFileSync(f, 'utf8')); out.games = r.context.fights;
      const w = r.test.worthRuler; per['L' + L] = { m: w.m, lo: w.lo, hi: w.hi, gain: r.test.gain }; });
      const ls = Object.values(per); if (!ls.length) return;
      const m = ls.reduce((t, x) => t + x.m, 0) / ls.length, se = Math.sqrt(ls.reduce((t, x) => t + Math.pow((x.hi - x.lo) / 3.92, 2), 0)) / ls.length;
      const spread = ls.length > 1 ? Math.abs(per['L' + LEVELS[0]].m - per['L' + LEVELS[1]].m) / Math.max(0.5, Math.abs(m)) : 0;
      pts.push({ n, measured: +m.toFixed(2), se: +se.toFixed(2), byLevel: per, current: +cur(e, n).toFixed(2), levelGap: spread > 0.3 ? +(spread * 100).toFixed(0) : null }); });
    let fit = null; const num = pts.filter(x => x.n !== true && x.measured > 0.05);
    if (num.length >= 2) { // weighted least squares on log worth: log m = log a + p log N (weight 1 / relative variance)
      let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0; num.forEach(x => { const w = 1 / Math.max(0.01, Math.pow(x.se / x.measured, 2)), X = Math.log(x.n), Y = Math.log(x.measured); sw += w; sx += w * X; sy += w * Y; sxx += w * X * X; sxy += w * X * Y; });
      const pw = (sw * sxy - sx * sy) / Math.max(1e-9, sw * sxx - sx * sx), a = Math.exp((sy - pw * sx) / sw);
      fit = { value: +a.toFixed(2), pow: +pw.toFixed(3) }; pts.forEach(x => { if (x.n !== true) x.fitted = +(a * Math.pow(x.n, pw)).toFixed(2); }); }
    const off = pts.filter(x => Math.abs(x.measured - x.current) > Math.max(0.5, 1.96 * x.se));
    out.skills.push({ key: k, cards: (p.items.find(x => x.key === k) || {}).cards, current: { scale: e.scale || 'fixed', value: e.value, pow: e.pow == null ? null : e.pow }, fit, points: pts, priceOff: off.map(x => x.n) });
  });
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'summary-2026-11-07.json'), JSON.stringify(out, null, 1) + '\n');
  const md = ['# Skill ladder, 2026-11-07', '', `Measured by \`tools/skill_ladder_2026_11_07.js\` (the canon tool, ${out.games} paired fights a point, Levels ${LEVELS.join(' and ')}, brambles 15). Worth in 3A + H budget points; "now" is the table's price. A row is marked when the measure is clearly off the price (more than 0.5 and outside 95%). Nothing applied.`, '',
    '| Skill | Cards | N | Now | Measured (95% ±) | Fitted | L1 / L5 |', '|---|---|---|---|---|---|---|'];
  out.skills.forEach(s => s.points.forEach((x, i) => md.push(`| ${i ? '' : s.key + (s.fit ? ` (fit ${s.fit.value} × N^${s.fit.pow}; now ${s.current.value}${s.current.pow != null ? ' × N^' + s.current.pow : ''})` : '')} | ${i ? '' : s.cards} | ${x.n === true ? 'on' : x.n} | ${x.current} | ${s.priceOff.includes(x.n) ? '**' : ''}${x.measured}${s.priceOff.includes(x.n) ? '**' : ''} ±${(1.96 * x.se).toFixed(1)} | ${x.fitted != null ? x.fitted : ''} | ${Object.values(x.byLevel).map(v => v.m.toFixed(1)).join(' / ')}${x.levelGap ? ' ⚠' : ''} |`)));
  fs.writeFileSync(path.join(OUT, 'summary-2026-11-07.md'), md.join('\n') + '\n');
  console.log(`${out.skills.length} skills, ${out.skills.reduce((t, s) => t + s.points.length, 0)} points -> docs/balance/skill-ladder/summary-2026-11-07.{json,md}`);
}
