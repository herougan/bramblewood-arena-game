// 2026-11-18 (package CARDPOW2, owner 11-17 23:41 overnight plan): for each Maps 0-20 listed, non-owner card outside 85-100% at its printed
// level (K.budget), the least change: one numeric skill N step first, then stat steps; every result K.budget ok. Rules in cardpow2-2026-11-18.md.
// node docs/balance/cardpow2/propose_2026_11_18.js <repo> [--weak=-10] [--strong=10] [--json=out.json]   (run on the cards before the change)
const path = require('path'), fs = require('fs'); const ROOT = process.argv[2];
const SC = require(ROOT + '/tools/skill_costs.js'), K = SC.make(require(ROOT + '/canonical/skill-costs.json'));
const R = require(ROOT + '/docs/balance/cardpow1/cardpow1-2026-11-16.json');
const CP = {}; require(ROOT + '/docs/balance/bal25/card-power.json').rows.forEach(r => CP[r.id] = r);
const C = {}; require(ROOT + '/canonical/cards.json').forEach(c => C[c.id] = c);
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const WEAK = +arg('weak', -10), STRONG = +arg('strong', 10);
const inPlay = r => r.obtainable && r.kind !== 'field' && !['egg', 'spell', 'equipment'].includes(r.verdict);
const fillOf = c => { const b = K.budget(c); return { fill: Math.round(1000 * b.x1 / b.N) / 10, ok: b.ok, N: b.N, x1: b.x1, x2: b.x2, N2: b.N2 }; };
// numeric skill parameters: number values, or {v: number}; Arrow-like {v} too
function numSkills(e) { const out = []; Object.entries(e || {}).forEach(([k, v]) => { if (k === 'triggers') return; if (typeof v === 'number') out.push({ k, get: () => v, set: (e2, n) => { e2[k] = n; } });
  else if (v && typeof v === 'object' && !Array.isArray(v) && typeof v.v === 'number') out.push({ k, get: () => v.v, set: (e2, n) => { e2[k] = Object.assign({}, v, { v: n }); } }); }); return out; }
const clone = o => JSON.parse(JSON.stringify(o));
function tryCard(c, A, H, eff) { const d = Object.assign({}, c, { attack: A, health: H, effects: eff }); return Object.assign(fillOf(d), { A, H, eff }); }
const inB = t => t.ok && t.fill >= 85 && t.fill <= 100;
function propose(c, dir) {
  const A0 = c.attack || 0, H0 = c.health || 0, e0 = c.effects || {}, cands = [];
  // 1) skill N one step (never to 0: a skill is not removed), alone
  const S0 = K.budget(c).S;
  numSkills(e0).forEach(s => [s.get() + 1, s.get() - 1].forEach(n => { if (n < 1 || n > 6) return; const e = clone(e0); s.set(e, n);
    const dS = K.budget(Object.assign({}, c, { effects: e })).S - S0; if (Math.sign(dS) !== dir) return; /* the step moves the skill price the way we want (a drawback such as Recoil goes down to buff) */
    const t = tryCard(c, A0, H0, e); t.how = `${s.k} ${s.get()} -> ${n}`; t.cost = 1; if (inB(t)) cands.push(t);
    // 1b) skill step + stat steps
    for (let dA = -2; dA <= 2; dA++) for (let dH = -4; dH <= 4; dH++) { if (!dA && !dH) continue; if (Math.sign(dA) === -dir && dA || Math.sign(dH) === -dir && dH) continue; const A = A0 + dA, H = H0 + dH; if (A < 0 || H < 1) continue; if (A0 > 0 && A === 0) continue; if (A0 === 0 && A > 0) continue; /* a 0-Attack wall stays one */
      const t2 = tryCard(c, A, H, e); t2.how = `${s.k} ${s.get()} -> ${n}, ${A0}/${H0} -> ${A}/${H}`; t2.cost = 1 + Math.abs(dA) * 1.5 + Math.abs(dH); if (inB(t2)) cands.push(t2); } }));
  if (cands.length) { cands.sort((a, b) => a.cost - b.cost || Math.abs(a.fill - 92.5) - Math.abs(b.fill - 92.5)); return cands[0]; }
  // 2) stats only: smallest step (Attack counts 1.5, Health 1), keeping the shape (no Attack to 0)
  for (let dA = -3; dA <= 3; dA++) for (let dH = -8; dH <= 8; dH++) { if (!dA && !dH) continue; if (Math.sign(dA) === -dir && dA || Math.sign(dH) === -dir && dH) continue; const A = A0 + dA, H = H0 + dH; if (A < 0 || H < 1) continue; if (A0 > 0 && A === 0) continue; if (A0 === 0 && A > 0) continue; /* a 0-Attack wall stays one */
    const t = tryCard(c, A, H, clone(e0)); t.how = `${A0}/${H0} -> ${A}/${H}`; t.cost = Math.abs(dA) * 1.5 + Math.abs(dH); if (inB(t)) cands.push(t); }
  cands.sort((a, b) => a.cost - b.cost || Math.abs(a.fill - 92.5) - Math.abs(b.fill - 92.5)); return cands[0] || null;
}
const rows = R.cards.filter(r => inPlay(r) && r.map <= 20 && r.lists.length);
const res = [];
rows.forEach(r => { const c = C[r.id]; const f = fillOf(c), p = CP[r.id], fb = p && p.forBudget != null ? p.forBudget : null, pw = r.power ? r.power.n : null;
  const over = !f.ok || f.fill > 100, under = f.ok && f.fill < 85; if (!over && !under) return;
  const row = { id: r.id, name: r.name, rarity: r.rarity, map: r.map, base: r.baseLevel, stats: `${c.attack || 0}/${c.health || 0}`, skills: r.skills, fill: f.fill, ok: f.ok, editorL1: r.fillL1, power: pw, forBudget: fb, owner: r.owner, lists: r.lists.slice(0, 4) };
  if (r.owner) { row.action = 'flag: owner-set'; res.push(row); return; }
  if (r.baseLevel === 0) { row.action = 'flag: Level 0 card (CARDPOW1-1 curve)'; res.push(row); return; }
  if (under && (fb == null || fb > WEAK)) { row.action = fb != null && fb >= STRONG ? 'flag: under budget but strong (budget misses it)' : 'leave: under budget, power near its band'; res.push(row); return; }
  if (over && fb != null && fb <= WEAK) { row.action = 'flag: over budget but weak (budget over-prices it)'; res.push(row); return; }
  const pr = propose(c, over ? -1 : 1); row.action = pr ? (pr.cost > 4.5 ? 'flag: needs more than 3 stat points (proposal only)' : 'change') : 'flag: no least change found'; if (pr) { row.how = pr.how; row.after = { attack: pr.A, health: pr.H, effects: pr.eff, fill: pr.fill, ok: pr.ok }; } res.push(row); });
const order = { change: 0 }; res.sort((a, b) => ((order[a.action] ?? 1) - (order[b.action] ?? 1)) || a.map - b.map);
res.forEach(x => console.log(`${x.action.padEnd(48)} ${x.id.padEnd(24)} M${x.map} ${x.rarity} ${x.stats} ${x.fill}% (L1 ${x.editorL1}%) pow ${x.power} fb ${x.forBudget} | ${x.skills}${x.how ? ' || ' + x.how + ' -> ' + x.after.fill + '%' : ''}`));
const js = arg('json', null); if (js) fs.writeFileSync(js, JSON.stringify(res, null, 1));
console.log('change', res.filter(x => x.action === 'change').length, 'of', res.length);
