// SKAUD1 phase 2 (2026-11-18): rewrite canonical/cards.json with the survivors (bramblewood-skillparams.js retire), the plan's trims,
// and a budget check (tools/skill_costs.js budget(card).ok at Level 1). Writes the changes to <out.json>; tools/skaud1/write_cards.py
// applies them (json.dumps indent 2, ensure_ascii, the file's own format). node tools/skaud1/apply.js <out.json>
const ROOT = require('path').resolve(__dirname, '../..');
const fs = require('fs');
const SP = require(ROOT + '/bramblewood-skillparams.js');
const SC = require(ROOT + '/tools/skill_costs.js');
const T = SC.make(JSON.parse(fs.readFileSync(ROOT + '/canonical/skill-costs.json', 'utf8')));
const CARDS = JSON.parse(fs.readFileSync(ROOT + '/canonical/cards.json', 'utf8'));
const PLAN = JSON.parse(fs.readFileSync(ROOT + '/docs/design/skaud1-2026-11-17.json', 'utf8'));
const TRIM = {}; PLAN.skills.forEach(s=> (s.cards || []).forEach(c=>{ if(c.newStats) TRIM[c.id] = c; }));
const plain = v=> !!v && typeof v === 'object' && !Array.isArray(v);
// one raw (fused) effects object: each key that expands to a retired key is replaced, in place, by its survivor (fused again)
function rewrite(raw){
  if(!plain(raw)) return raw;
  let changed = false; const out = {}, extraTrig = [];
  Object.keys(raw).forEach(k=>{
    if(k === 'triggers'){ out.triggers = raw.triggers; return; }
    const flat = SP.expand({[k]: raw[k]});
    if(!SP.needsRetire(flat)){ if(out[k] === undefined) out[k] = raw[k]; return; }
    changed = true;
    const fused = SP.fuse(SP.retire(flat));
    Object.keys(fused).forEach(f=>{ const v = fused[f], o = out[f] !== undefined ? out[f] : (f !== k ? raw[f] : undefined);
      if(f === 'triggers'){ extraTrig.push(...v); return; }
      if(o === undefined) out[f] = v; else if(typeof o === 'number' && typeof v === 'number') out[f] = Math.max(o, v); else out[f] = o; });
  });
  if(!changed) return raw;
  if(extraTrig.length) out.triggers = (out.triggers || []).concat(extraTrig);
  return out;
}
const fill = (c, eff, A, H)=>{ const b = T.budget(Object.assign({}, c, {effects: eff, attack: A, health: H}), {level: 1}); return {ok: b.ok, fill: Math.round(1000 * Math.max(b.x1 / b.N, b.x2 / b.N2)) / 10}; };
function minTrim(c, eff){ let best = null;
  for(let da = 0; da <= Math.floor(c.attack / 2); da++) for(let dh = 0; dh <= Math.floor(c.health / 2); dh++){
    const f = fill(c, eff, c.attack - da, c.health - dh); if(f.ok){ const cost = 3 * da + dh; if(!best || cost < best.cost) best = {cost, A: c.attack - da, H: c.health - dh, fill: f.fill}; } }
  return best; }
const changes = {}, report = [];
CARDS.forEach(c=>{
  const eff = rewrite(c.effects); let ls = c.levelSkills;
  if(plain(ls)){ const n = {}; let any = false; Object.keys(ls).forEach(L=>{ n[L] = rewrite(ls[L]); if(n[L] !== ls[L]) any = true; }); if(any) ls = n; }
  if(c.id === 'cottontail' && ls !== c.levelSkills){ ls = JSON.parse(JSON.stringify(ls)); Object.keys(ls).forEach(L=>{ delete ls[L].speed; delete ls[L].swift; if(!Object.keys(ls[L]).length) delete ls[L]; }); } // plan: a Map 0 starter loses its Level 1 Quick (Swift is New! on Map 3)
  if(c.test && eff !== c.effects && !Object.keys(eff).length){ const cover = {'test-skill-crit': {mighty: true}, 'test-skill-blind': {smokeBomb: true}}[c.id]; if(cover) Object.assign(eff, cover); } // a test card points at the skill that covers its removed one
  if(eff === c.effects && ls === c.levelSkills) return;
  const before = fill(c, c.effects, c.attack, c.health), after = fill(c, eff, c.attack, c.health);
  const r = {id: c.id, test: !!c.test, from: c.effects, to: eff, A: c.attack, H: c.health, fillBefore: before.fill, fill: after.fill, okBefore: before.ok, ok: after.ok};
  if(ls !== c.levelSkills) r.levelSkills = ls;
  if(!after.ok && !c.test){
    const p = TRIM[c.id], t = minTrim(c, eff);
    if(p && p.stats[0] === c.attack && p.stats[1] === c.health && fill(c, eff, p.newStats[0], p.newStats[1]).ok){ r.newA = p.newStats[0]; r.newH = p.newStats[1]; r.trim = 'plan'; }
    else if(t){ r.newA = t.A; r.newH = t.H; r.trim = p ? 'rederived (plan ' + p.stats.join('/') + ' -> ' + p.newStats.join('/') + ')' : 'rederived (not in plan)'; }
    else r.trim = 'none fits';
    if(r.newA !== undefined) r.fill = fill(c, eff, r.newA, r.newH).fill;
  }
  changes[c.id] = r; report.push(r);
});
fs.writeFileSync(process.argv[2], JSON.stringify(changes, null, 1));
report.forEach(r=> console.log((r.test ? 'T ' : '  ') + r.id.padEnd(28), `${r.A}/${r.H} ${r.fillBefore}% -> ${r.fill}%`, r.ok ? 'ok' : (r.newA !== undefined ? `trim ${r.newA}/${r.newH} (${r.trim})${r.okBefore ? '' : ' over before'}` : 'OVER ' + (r.trim || '')), Object.keys(r.from).filter(k=> !(k in r.to)).join(',') + ' -> ' + Object.keys(r.to).filter(k=> !(k in r.from) || JSON.stringify(r.to[k]) !== JSON.stringify(r.from[k])).join(',')));
console.log(report.length, 'cards change');
