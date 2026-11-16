// REDESIGN2 generator (2026-11-16): node gen.js <ranks.json> <out.json>
const fs = require('fs');
const L = require('./lib.js');
const P = require('./plan.js');
const RANKS = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const ROAD = JSON.parse(fs.readFileSync(__dirname + '/road.json', 'utf8'));
const MAPNAMES = []; ROAD.forEach(f => MAPNAMES[f.map] = f.mapName);
const LIGHT = new Set(['flying', 'tide', 'diurnal', 'nocturnal']);
const KEEP = {triggers: 'trigger x action pairs are not on the skill list', onDeathSpawn: 'a death trigger', bounty: 'Bounty stays where thematic (BAL2-4)', injured: 'a drawback', purblind: 'a drawback'};
// sheet rows by key (ranked row first)
const ROW = {};
RANKS.forEach(r => { if (!r.key) return; if (!ROW[r.key] || (r.ii && !ROW[r.key].ii)) ROW[r.key] = r; });
ROW.pillage = RANKS.find(r => r.name === 'Pillage');
const SHEETKEY = {darksight: 'darksight', acid: 'acidBolt', pearl: 'pearl', delivery: 'deliveryRes', siege: 'demolisher'};
function skillId(k, v) {
  if (k === 'keenSense') return v && v.sees === 'dark' ? 'darksight' : 'keenSense';
  if (k === 'arrow' && v && v.type === 'acid') return 'acid';
  if (k === 'delivery') return v && v.res === 'pearl' ? 'pearl' : 'delivery';
  if (k === 'deliveryEvery' || k === 'deliveryRes') return 'delivery';
  if (k === 'acidBolt') return 'acid';
  return k;
}
const NAME_OVR = {sap: 'Leech', sweep: 'Cleave', strangle: 'Constrict', siege: 'Siege', poison: 'Venomous', regen: 'Regeneration', bloomCopy: 'Bloom', overwhelm: 'Stampede', leader: 'Natural Leader', darksight: 'Darksight', acid: 'Acid', pearl: 'Pearl', delivery: 'Delivery', electricity: 'Electricity', keenSense: 'Keen Sense', onReadyDamage: 'On Ready damage', brambleArmor: 'Fortify (Armor 1)', keenEye: 'True Sight', healing: 'Heal', puncture: 'Puncture'};
function info(id) {
  const r = ROW[SHEETKEY[id] || id];
  const raw = NAME_OVR[id] || (r && r.name) || id; return {id, name: raw.charAt(0).toUpperCase() + raw.slice(1), ii: r ? r.ii : null, k: r ? r.k : null, tip: r ? r.tip : ''};
}
const BASIC = new Set(RANKS.filter(r => r.ii === 1).map(r => ({demolisher: 'siege', deliveryRes: 'delivery', acidBolt: 'acid'})[r.key] || r.key));
Object.keys(P.II2_BASICS).forEach(k => BASIC.add(k));
const SINGLE_OF = {}; Object.entries(P.SINGLES).forEach(([k, s]) => SINGLE_OF[k] = s.id);
const fmtV = v => v === true ? '' : (typeof v === 'number' ? ' ' + v : (Array.isArray(v) ? (v.every(x => typeof x === 'string') ? ' (' + v.join(', ') + ')' : ' ' + v.join('/')) : (v && typeof v === 'object' ? (v.v != null ? ' ' + (Array.isArray(v.v) ? v.v.join('/') : v.v) : '') + (v.type === 'fire' ? ' (Flaming)' : '') + (v.when ? ' (' + v.when.join(' & ') + ')' : '') + (v.every ? ', every turn' : '') + (v.who === 'ally' ? ' (ally)' : '') + (v.res && v.res !== 'pearl' ? ' {' + v.res + '}' : '') : ' ' + v)));
function label(eff) {
  const parts = [];
  Object.entries(eff || {}).forEach(([k, v]) => {
    if (k === 'triggers') { (v || []).forEach(t => parts.push(trigLabel(t))); return; }
    if (k === 'onDeathSpawn') { parts.push('On Death: spawn ' + (v.count || 1) + ' ' + v.defId); return; }
    const id = skillId(k, v); const nm = info(id).name;
    parts.push(nm + (id === 'darksight' || id === 'acid' && false ? '' : fmtV(id === 'darksight' ? true : v)));
  });
  return parts.length ? parts.join(', ') : 'vanilla';
}
function trigLabel(t) { const on = {onAttack: 'On Attack', onAttacked: 'On Attacked', onHit: 'On Hit', onSpawn: 'On Spawn', onKill: 'On Kill', onReady: 'On Ready', onDeath: 'On Death'}[t.on] || t.on; return on + ': ' + (t.do === 'gain' ? 'Deliver ' + (t.amount || 1) + ' ' + t.resource : t.do + (t.amount ? ' ' + t.amount : '')); }
function counted(eff) { let n = 0; Object.keys(eff || {}).forEach(k => { if (!LIGHT.has(k) || (k === 'tide' && typeof eff[k] === 'number' && eff[k] > 1)) { if (k !== 'tide' || typeof eff[k] === 'number') n += (LIGHT.has(k) ? 0 : 1); } }); return n; }
// --- fit
const BAND = [85, 100];
function fit(c, eff) {
  const A0 = c.attack || 0, H0 = c.health || 0; let best = null;
  const aLo = A0 === 0 ? 0 : Math.max(1, A0 - 3), aHi = A0 === 0 ? 0 : A0 + 3;
  for (let A = aLo; A <= aHi; A++) for (let H = 1; H <= 80; H++) {
    const f = L.fillOf(c, eff, A, H).fill; if (f < BAND[0] || f > BAND[1]) continue;
    const rel = Math.abs(A - A0) / Math.max(A0, 1) + Math.abs(H - H0) / Math.max(H0, 1); if (H < Math.ceil(H0 / 2) || A < Math.ceil(A0 / 2)) continue; // keep the card's shape: never below half its Attack or Health
    const key = [3 * Math.abs(A - A0) + Math.abs(H - H0), Math.abs(A - A0) + Math.round(rel * 1000) / 1e6, Math.abs(f - 92.5)];
    if (!best || key[0] < best.key[0] || (key[0] === best.key[0] && (key[1] < best.key[1] || (key[1] === best.key[1] && key[2] < best.key[2])))) best = {A, H, f, key};
  }
  return best;
}
const same = (a, b) => JSON.stringify(a || {}) === JSON.stringify(b || {});
const cards = [], violations = [];
L.roadCards().forEach(({id, map}) => {
  const c = L.BYID[id], owner = L.OWNER.has(id);
  const before = c.effects || {};
  const pr = P.PROPOSED[id]; const eff = pr ? pr[0] : before;
  const skillsChanged = !same(before, eff);
  const f0 = L.fillOf(c, before, c.attack, c.health).fill;
  let A = c.attack, H = c.health, note = pr ? pr[1] : '', flags = [];
  let fNow = L.fillOf(c, eff, A, H).fill;
  const inBand = x => x >= BAND[0] && x <= BAND[1];
  if ((skillsChanged || !owner) && !inBand(fNow)) {
    const b = fit(c, eff);
    if (b) { A = b.A; H = b.H; fNow = b.f; if (!skillsChanged) note = 'skills kept; stats re-fitted into the 85-100% band'; }
    else flags.push('no legal stats in the band');
  }
  if (owner && !skillsChanged && !inBand(fNow)) { flags.push('owner card at ' + fNow + '%: not refitted'); }
  // plan check
  Object.entries(eff).forEach(([k, v]) => {
    if (KEEP[k]) { if (k === 'injured' || k === 'purblind' || k === 'bounty') flags.push(info(k).name + ' kept (' + KEEP[k] + ')'); return; }
    const sid = skillId(k, v);
    if (BASIC.has(sid)) return;
    if (SINGLE_OF[sid] === id) return;
    violations.push(id + ': ' + sid);
  });
  if (counted(eff) > 2) flags.push('three counted skills');
  cards.push({id, name: c.name, map, mapName: MAPNAMES[map], rarity: c.rarity, wait: c.wait || 0, cost: c.cost || 0, owner,
    change: skillsChanged || A !== c.attack || H !== c.health, skillsChanged, effects: eff, attack: A, health: H, fill: fNow,
    before: {effects: before, attack: c.attack, health: c.health, fill: f0}, skillsNow: label(before), skillsProposed: skillsChanged ? label(eff) : '=', note, flags});
});
// --- plan: carriers
const carriers = {};
cards.forEach(c => Object.entries(c.effects).forEach(([k, v]) => { if (KEEP[k]) return; const sid = skillId(k, v); (carriers[sid] = carriers[sid] || []).push({id: c.id, name: c.name, map: c.map}); }));
const basics = [...BASIC].filter(s => s !== 'rebuild' || true).map(sid => {
  const inf = info(sid), cs = carriers[sid] || [];
  return {key: sid, name: inf.name, ii: inf.ii, k: inf.k, light: LIGHT.has(sid), map: cs.length ? Math.min(...cs.map(x => x.map)) : null, carriers: cs, why: P.II2_BASICS[sid] || '', tip: inf.tip};
}).sort((a, b) => (a.map == null ? 99 : a.map) - (b.map == null ? 99 : b.map) || a.ii - b.ii || a.name.localeCompare(b.name));
const singles = Object.entries(P.SINGLES).map(([sid, s]) => { const inf = info(sid), c = cards.find(x => x.id === s.id); const ok = (carriers[sid] || []).some(x => x.id === s.id); return {key: sid, name: inf.name, ii: inf.ii, iiNote: (ROW[SHEETKEY[sid] || sid] || {}).iiNote || null, k: inf.k, carrier: s.id, carrierName: c ? c.name : s.id, map: c ? c.map : null, why: s.why, ok, others: (carriers[sid] || []).filter(x => x.id !== s.id).map(x => x.id), tip: inf.tip}; })
  .concat(Object.entries(P.OFF_SINGLES).map(([sid, why]) => { const inf = info(sid); return {key: sid, name: inf.name, ii: inf.ii || 3, iiNote: (ROW[SHEETKEY[sid] || sid] || {}).iiNote || null, k: inf.k, carrier: null, carrierName: 'moves off Maps 0-20', map: null, why, ok: true, others: [], tip: inf.tip}; }))
  .sort((a, b) => a.ii - b.ii || a.name.localeCompare(b.name));
// --- moved off
const moved = {};
cards.forEach(c => Object.entries(c.before.effects).forEach(([k, v]) => {
  if (KEEP[k]) { if (k === 'triggers' && !c.effects.triggers) { (moved['trigger'] = moved['trigger'] || {key: 'triggers', name: 'trigger x action', rank: 'not a skill', from: [], why: 'replaced on this card'}).from.push(c.id); } return; }
  const sid = skillId(k, v);
  const still = Object.entries(c.effects).some(([k2, v2]) => !KEEP[k2] && skillId(k2, v2) === sid);
  if (still) return;
  const inf = info(sid);
  const kTok = inf.k ? String(inf.k).trim().split(/[\s(]/)[0].replace(/\.0$/, '') : ''; let rank = inf.ii ? 'II ' + inf.ii : (kTok ? 'K ' + kTok : (inf.k ? 'your note' : 'unranked'));
  let why;
  if (BASIC.has(sid)) why = 'a basic, still in the plan: swapped on this card';
  else if (P.SINGLES[sid]) why = 'single-card skill: its one carrier is ' + (L.BYID[P.SINGLES[sid].id] || {}).name;
  else if (P.OFF_SINGLES[sid]) why = 'II ' + inf.ii + ', no fitting card: off Maps 0-20';
  else if (sid === 'poison') why = 'no II rank (question 1)';
  else if (sid === 'healing') why = 'Heal is Nursing now (your K note)';
  else if (sid === 'felling') why = 'your note: On Kill -> Deliver (Lumber) (done on this card)';
  else if (sid === 'shell') why = 'your note: Shell = Turtle (no II): a shell becomes Armor';
  else if (sid === 'quick') why = 'no II rank: Quick becomes Swift (II 1) on the runners and cats from Map 3';
  else if (inf.k && /^(S|GOD|MAGIC|EVO|KINGDOM|WEP|R)\b/.test(inf.k)) why = 'category ' + inf.k.split(' ')[0] + ': not a road skill';
  else why = 'no II rank: off Maps 0-20 cards';
  const m = moved[sid] = moved[sid] || {key: sid, name: inf.name, rank, from: [], why};
  m.from.push(c.id);
}));
const movedOff = Object.values(moved).sort((a, b) => a.name.localeCompare(b.name));
// --- per map new skills and focus
const plan = MAPNAMES.map((nm, m) => ({map: m, name: nm, newBasics: basics.filter(b => b.map === m).map(b => b.key), singles: singles.filter(s => s.map === m).map(s => s.key)}));
const MAP_FOCUS = {};
plan.forEach(p => {
  const nb = basics.filter(b => b.map === p.map && !b.light).sort((a, b) => a.ii - b.ii || b.carriers.length - a.carriers.length);
  MAP_FOCUS[p.map] = nb.slice(0, 3).map(b => b.name);
});
const counts = {cards: cards.length, changed: cards.filter(c => c.change).length, skillsChanged: cards.filter(c => c.skillsChanged).length, statsOnly: cards.filter(c => c.change && !c.skillsChanged).length,
  ownerChanged: cards.filter(c => c.change && c.owner).length, inBandBefore: cards.filter(c => c.before.fill >= 85 && c.before.fill <= 100).length, inBandAfter: cards.filter(c => c.fill >= 85 && c.fill <= 100).length,
  basics: basics.length, basicsII1: basics.filter(b => b.ii === 1).length, basicsII2: basics.filter(b => b.ii === 2).length, light: basics.filter(b => b.light).length,
  singlesPlaced: singles.filter(s => s.carrier).length, singlesOff: singles.filter(s => !s.carrier).length};
const out = {package: 'REDESIGN2', date: '2026-11-16', status: 'proposal (owner approves or edits; not folded); supersedes REDESIGN1',
  budget: {file: 'bramblewood-budget.js via tools/skill_costs.js budget()', level: 1, fill: 'max(cap 1 x1/N, cap 2 x2/N2)', band: BAND},
  source: {plan: 'G6 - Bramblewood_2.xlsx, sheet Skills, column II (owner 11-16 20:43; 20:48 "stick to 50+")', lists: 'canonical/map-pools.json (main maps 0-20, first list holding the card)', cards: 'canonical/cards.json', ownerCards: 'tools/pipeline/config.json refit.ownerCards'},
  counts, MAP_FOCUS, plan, basics, singles, movedOff, violations, cards};
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
console.log(JSON.stringify(counts)); console.log('violations', violations);
console.log('no carrier basics', basics.filter(b => !b.carriers.length).map(b => b.key));
console.log('thin', basics.filter(b => b.carriers.length === 1).map(b => b.key));
console.log('singles not ok', singles.filter(s => s.carrier && !s.ok).map(s => s.key), 'singles with extra carriers', singles.filter(s => s.others.length).map(s => s.key + ':' + s.others));
console.log('flags', cards.filter(c => c.flags.length).map(c => c.id + ' ' + c.flags.join('; ')).join('\n'));
plan.forEach(p => console.log(p.map, p.newBasics.join(','), '|', p.singles.join(','), '| focus', MAP_FOCUS[p.map].join(',')));
