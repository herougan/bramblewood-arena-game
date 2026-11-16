#!/usr/bin/env node
// 2026-11-16 (package CARDPOW1, owner 11-16 23:53: "Balancing is the most important. ... balancing of each card currently existent (farm dog
// isn't power rated yet for example)"): every card of canonical/cards.json that can be on the board (test cards, Hall of Fame variants and
// materia left out), read two ways:
//   budget  B / N at Levels 1-10, read as the card editor's budget box reads it (sbBudgetAt, sbPriceS, sbCheck, sbMissMult, sbFragileUse,
//           sbShieldH, sbAttackOf, sbEffectsOf evaluated from arena_app.js, as tools/side1/power_2026_11_12.js does), with the card's stats
//           and skills at that level (the game's statsAtLevel / effectsAtLevel: the Forge curve, levelStats overrides, levelSkills) and N at
//           that level for the map where a player first gets it (cardObtainMap). Fill = B / N (cap 1); cap 2 is checked too.
//   power   the card power test (docs/balance/bal25/card-power.json, tools/card_balance.js --v3), as the editor shows it: win % minus the
//           median Maps 0-20 card's, so 0 is the median card; Advanced and "for its budget" beside it.
// Checklist B1 (fill at Level 1 in 85-100%, both caps) and B2 (the Level 1-10 curve: a level where the fill jumps or the card stalls).
//   node tools/cardpow1/cardpow1_2026_11_16.js [--xlsx]   -> docs/balance/cardpow1/cardpow1-2026-11-16.{json,csv,md}
//   --xlsx also writes the owner workbook (/home/claude/out/CardPower - Bramblewood.xlsx) through tools/cardpow1/workbook_2026_11_16.py.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const LB = require('../lib_bramble.js'), G = LB.G, S1 = require('../side1/lib_side1_2026_11_12.js');
const BAND = [85, 100], STEP_JUMP = 15, DRIFT = 10; // B2: a one-level rise of more than STEP_JUMP points; a level DRIFT+ points off the Level 1 fill
// the editor's budget box in a sandbox (the same names as tools/side1/power_2026_11_12.js), read at any level
function editor() {
  const names = ['SB_DEFAULT_SKILLS', 'SB_HALF_MISS', 'SB_PAY_DEF', 'SB_V3_DEFAULTS', 'sbRitualPts', 'sbSkillCost', 'sbMissMult', 'sbFragileUse', 'sbBudgetAt', 'SB_WELL_UNDER', 'sbCheck', 'sbShieldH', 'sbCanon', 'sbPriceS', 'sbAttackMult', 'sbAttackOf', 'sbEffectsOf'];
  const body = ['let SB_SC = null, sbFbSkills = null; const SKILL_COSTS_TABLE = TABLE; const cardObtainMap = d=> OBTAIN(d);',
    'function sbLoad(){ return Object.assign({}, SB_V3_DEFAULTS, {skills: SB_DEFAULT_SKILLS, halfMiss: SKILL_COSTS_TABLE.halfMiss || SB_HALF_MISS}); }',
    ...names.map(n => LB.grab(n)),
    'return function read(d, L){ const cfg = sbLoad(), A = sbAttackOf(d), D = Number(d.health)||0, pr = sbPriceS(d, cfg), N = sbBudgetAt(d, cfg, L), M = sbMissMult(d, cfg), F = sbFragileUse(d, cfg), SH = sbShieldH(d), c = sbCheck(A, D, pr.S, N, M, F, SH, sbEffectsOf(d)); return {N, S: pr.S, missing: pr.missing, B: c.x1, P: c.x2, N2: c.N2, r1: c.r1, r2: c.r2, ok: c.ok}; };'].join('\n');
  return new Function('BramblewoodBudget', 'SkillCosts', 'TABLE', 'OBTAIN', 'RARITY_DEFS', 'localStorage', body)(require(path.join(ROOT, 'bramblewood-budget.js')), require('../skill_costs.js'), J('canonical/skill-costs.json'), d => G.cardObtainMap(d), G.RARITY_DEFS || [], { getItem: () => null });
}
const read = editor(), BBM = require(path.join(ROOT, 'bramblewood-budget.js'));
// an equipment piece's grant read as skills; a damage-type resist list is a card field the budget prices on no card (resist on 600+ cards), so it is left out
const eqGrant = c => { const g = Object.assign({}, (c.equip && c.equip.grant) || {}); delete g.resist; return g; };
// the game's effectsAtLevel (self-contained; not on lib_bramble's G)
const effectsAtLevel = G.effectsAtLevel || new Function(LB.grab('effectsAtLevel') + '\nreturn effectsAtLevel;')();
const r2 = v => Math.round(v * 100) / 100, pct = (b, n) => n ? Math.round(1000 * b / n) / 10 : null;
const CARDS = J('canonical/cards.json').filter(c => !c.test && !c.hallOfFame && !c.baseId && c.cardType !== 'materia');
const OWNER = new Set(((J('tools/pipeline/config.json').refit || {}).ownerCards) || []);
// the lists a card is on: main maps by number, side maps by name (canonical/map-pools.json)
const P = S1.pools(), lists = {};
const addL = (c, w) => { (lists[c] = lists[c] || []).push(w); };
S1.mainByNo().forEach(({ id, n }) => { ((P[id] || {}).cards || []).forEach(c => addL(c, 'Map ' + n)); Object.entries((P[id] || {}).submaps || {}).forEach(([s, cs]) => (cs || []).forEach(c => addL(c, S1.mapName(s)))); });
// the card power test, centred as assemble_arena.py centres it for the editor (on the Maps 0-20 cards' median)
const CPF = 'docs/balance/bal25/card-power.json', CPJ = fs.existsSync(path.join(ROOT, CPF)) ? J(CPF) : { rows: [] };
const cpRows = {}; (CPJ.rows || []).forEach(r => { cpRows[r.id] = r; });
const medOf = v => { v = v.slice().sort((a, b) => a - b); return v.length ? (v.length % 2 ? v[v.length >> 1] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : 50; };
const CP_MED = medOf((CPJ.rows || []).filter(r => r.winRate != null && r.scope !== 'extra').map(r => r.winRate));
// a card's place: main map number (cardObtainMap), obtainable or not, its kind
function kindOf(c) { return c.token ? 'token' : c.field ? 'field' : c.cardType === 'spell' ? 'spell' : c.cardType === 'equipment' ? 'equipment' : c.pool ? 'pool candidate' : c.eggKind ? 'egg' : 'creature'; }
function skillText(fx) { const s = S1.skillsOf({ effects: fx }); const tr = (fx.triggers || []).map(t => S1.label('trigger:' + t.on) + ': ' + (t.do || '?')); return s.filter(x => !/^trigger/.test(x.key)).map(x => x.label + (typeof fx[x.key] === 'number' ? ' ' + fx[x.key] : '')).concat(tr).join(', '); }
const rows = [], missingAll = {};
CARDS.forEach(c => {
  const base = G.cardBaseLevel(c), curve = [];
  for (let L = 1; L <= 10; L++) {
    const st = G.statsAtLevel(c, L), fx = effectsAtLevel(c, L);
    const EQ = c.cardType === 'equipment', d = Object.assign({}, c, { attack: st.attack, health: st.health, effects: EQ ? eqGrant(c) : fx }); // equipment: its grant as skills (package EQ's reading)
    const x = read(d, L); if (EQ) { const m = BBM.equipLifeMult(c); x.B *= m; x.P *= m; } // x equipLifeMult on cap 1 (EQ2), as tools/eq2_equipment_2026_10_24.js
    x.missing.forEach(m => { (missingAll[m] = missingAll[m] || new Set()).add(c.id); });
    curve.push({ L, A: st.attack, H: st.health, N: r2(x.N), B: r2(x.B), S: r2(x.S), fill: pct(x.B, x.N), cap2: x.r2, ok: x.ok, skills: Object.keys(fx).length, missing: x.missing });
  }
  const l1 = curve[0], f = curve.map(x => x.fill);
  // B2: jumps and stalls along Levels 1-10
  const jumps = [], stalls = [];
  // the Forge curve is a saw (N grows every level, the stats on the majors 4, 7, 10), so a few points down and back up is the design; flagged:
  // a one-level step of more than STEP_JUMP points, a level more than DRIFT points over the L1 fill, a level over budget that L1 was not;
  // a level more than DRIFT points under the L1 fill that also drops under the band (a card already over may sink toward 100)
  for (let i = 1; i < curve.length; i++) { if (f[i] - f[i - 1] > STEP_JUMP) jumps.push(`L${curve[i - 1].L}->L${curve[i].L} +${r2(f[i] - f[i - 1])}`); }
  const hi = Math.max(...f.slice(1)), atHi = curve[f.indexOf(hi, 1)];
  if (hi - f[0] > DRIFT) jumps.push(`L${atHi.L} ${hi}% (${r2(hi - f[0])} over its L1 fill)`);
  if (l1.ok) { const ov = curve.find(x => x.L > 1 && !x.ok); if (ov) jumps.push(`L${ov.L} over budget (${ov.fill}%${ov.cap2 ? '' : ', cap 2'})`); }
  const lo = Math.min(...f), at = curve[f.indexOf(lo)];
  if (f[0] - lo > DRIFT && lo < BAND[0]) stalls.push(`L${at.L} ${lo}% (${r2(f[0] - lo)} under its L1 fill)`);
  const flat = [4, 7, 10].filter(L => { const a = curve[L - 1], b = curve[L - 2]; return a.A === b.A && a.H === b.H; });
  if (flat.length === 3) stalls.push('no gain at any major level (4, 7, 10)');
  const gained = (curve[9].A - l1.A) + '/' + (curve[9].H - l1.H);
  const pw = cpRows[c.id], om = G.cardObtainMap(c), una = G.isUnattainable(c);
  const verdict = c.eggKind || c.hatchInto ? 'egg' : c.cardType === 'spell' ? 'spell' : c.cardType === 'equipment' ? 'equipment' : !l1.ok && !l1.cap2 ? 'over (cap 2)' : !l1.ok ? 'over' : l1.fill < BAND[0] ? 'under' : 'in band'; // an egg (Wait 5-10, a shell that hatches) has no band, as card_balance.js leaves it out of its fit
  const flags = [];
  if (verdict === 'egg') flags.push('egg: hatches, no band'); else if (verdict === 'spell' || verdict === 'equipment') flags.push(verdict + ': not a unit, no band (reading shown)'); else if (verdict !== 'in band') flags.push('B1 ' + verdict + ' ' + l1.fill + '%');
  if (jumps.length) flags.push('B2 jump: ' + jumps.join('; '));
  if (stalls.length) flags.push('B2 stall: ' + stalls.join('; '));
  if (l1.missing.length) flags.push('no price: ' + l1.missing.join(', '));
  rows.push({ id: c.id, name: c.name, kind: kindOf(c), rarity: c.rarity || '', map: om, obtainable: !una && !c.token, lists: lists[c.id] || [], baseLevel: base,
    attack: c.attack || 0, health: c.health || 0, wait: c.wait || 0, lumber: c.cost || 0, skills: skillText(c.effects || {}), levelSkills: c.levelSkills ? Object.keys(c.levelSkills).join(',') : '',
    fillL1: f[0], fillL5: f[4], fillL10: f[9], N1: l1.N, B1: l1.B, S1: l1.S, cap2L1: l1.cap2, verdict, gainedL1to10: gained, curve: curve.map(x => ({ L: x.L, A: x.A, H: x.H, N: x.N, B: x.B, fill: x.fill, ok: x.ok })),
    jumps, stalls, flags, owner: OWNER.has(c.id),
    power: pw ? { n: pw.winRate == null ? null : Math.round(pw.winRate - CP_MED), adv: pw.advRate == null ? null : Math.round(pw.advRate - 50), forBudget: pw.forBudget == null ? null : pw.forBudget, played: pw.played, games: pw.games, lowSample: !!pw.lowSample, why: pw.unplayedWhy || undefined, helpers: pw.helpers || undefined } : null });
});
// a stat proposal for a card outside 85-100% at Level 1 (proposal only; card stats are the owner's): the smallest Attack / Health step that lands
// it in the band at Level 1, keeping its shape (Attack moves first when it is over and has 2+, Health otherwise), read with the same box
function propose(r) {
  if (['in band', 'egg', 'spell', 'equipment'].includes(r.verdict) || r.kind === 'field') return '';
  const c = CARDS.find(x => x.id === r.id), base = r.baseLevel, L1 = (A, H) => { const d = Object.assign({}, c, { attack: A, health: H }); const st = G.statsAtLevel(d, 1); const x = read(Object.assign({}, d, { attack: st.attack, health: st.health, effects: effectsAtLevel(c, 1) }), 1); return { fill: pct(x.B, x.N), ok: x.ok }; };
  let A = r.attack, H = r.health, best = null;
  const over = r.verdict !== 'under';
  for (let k = 0; k < 40; k++) {
    const t = L1(A, H); if (t.ok && t.fill >= BAND[0]) { best = { A, H, fill: t.fill }; break; }
    if (over) { if (A >= 2 && (A * 3 >= H || H <= 2)) A--; else if (H > 1) H--; else if (A > 0) A--; else break; }
    else { if (H + 1 > A * 4 && A > 0 && L1(A + 1, H).ok) A++; else H++; }
  }
  if (!best) return over ? 'over even when trimmed: trim a skill' : '';
  return (best.A === r.attack && best.H === r.health) ? '' : `${r.attack}/${r.health} -> ${best.A}/${best.H} (${best.fill}% at L1)` + (base === 0 ? ' (printed Level 0 stats)' : '');
}
rows.forEach(r => { r.proposal = r.owner ? 'owner-set: not retuned (flag)' : propose(r); });
rows.sort((a, b) => (a.map - b.map) || a.name.localeCompare(b.name));
const inPlay = r => r.obtainable && r.kind !== 'field' && !['egg', 'spell', 'equipment'].includes(r.verdict); // eggs and fields: no band
const cnt = f => rows.filter(f).length;
const S = { cards: rows.length, inPlay: cnt(inPlay), maps0to20InPlay: cnt(r => inPlay(r) && r.map <= 20),
  inBand: cnt(r => r.verdict === 'in band'), under: cnt(r => r.verdict === 'under'), over: cnt(r => r.verdict.startsWith('over')),
  inPlayOutside: cnt(r => inPlay(r) && r.verdict !== 'in band'), maps0to20Outside: cnt(r => inPlay(r) && r.map <= 20 && r.verdict !== 'in band'),
  jumps: cnt(r => r.jumps.length), stalls: cnt(r => r.stalls.length), noPrice: cnt(r => r.flags.some(f => f.startsWith('no price'))),
  powerRated: cnt(r => r.power && r.power.n != null), powerMissing: rows.filter(r => !(r.power && r.power.n != null)).map(r => r.id) };
const OUT = path.join(ROOT, 'docs', 'balance', 'cardpow1'); fs.mkdirSync(OUT, { recursive: true });
const commit = (() => { try { return cp.execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch (e) { return ''; } })();
const out = { about: 'CARDPOW1 (2026-11-16): every playable card, budget fill B / N at Levels 1-10 (the card editor\'s reading at each level: statsAtLevel, effectsAtLevel, N at the first map) and the card power test. tools/cardpow1/cardpow1_2026_11_16.js', built: '2026-11-16', commit,
  band: BAND, jumpPoints: STEP_JUMP, driftPoints: DRIFT, budget: 'bramblewood-budget.js DEFAULTS (BUDGET2, 3A + H)', power: { file: CPF, generated: CPJ.generated, games: CPJ.games, medianWinRate: CP_MED, scope: CPJ.scope },
  missingPrices: Object.fromEntries(Object.entries(missingAll).map(([k, v]) => [k, [...v]])), summary: S, cards: rows };
fs.writeFileSync(path.join(OUT, 'cardpow1-2026-11-16.json'), JSON.stringify(out, null, 1) + '\n');
// csv: one row per card
const q = v => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
const head = ['id', 'name', 'kind', 'map', 'obtainable', 'lists', 'rarity', 'attack', 'health', 'wait', 'lumber', 'skills', 'baseLevel', 'fillL1', 'fillL5', 'fillL10', ...Array.from({ length: 10 }, (_, i) => 'L' + (i + 1)), 'verdict', 'power', 'advanced', 'forBudget', 'flags', 'proposal', 'ownerSet'];
const csv = [head.join(',')].concat(rows.map(r => [r.id, r.name, r.kind, r.map, r.obtainable ? 'yes' : 'no', r.lists.join('; '), r.rarity, r.attack, r.health, r.wait, r.lumber, r.skills, r.baseLevel, r.fillL1, r.fillL5, r.fillL10, ...r.curve.map(x => x.fill), r.verdict,
  r.power ? r.power.n : '', r.power ? r.power.adv : '', r.power ? r.power.forBudget : '', r.flags.join(' | '), r.proposal, r.owner ? 'yes' : ''].map(q).join(',')));
fs.writeFileSync(path.join(OUT, 'cardpow1-2026-11-16.csv'), csv.join('\n') + '\n');
// owner page: counts, then the outliers
const fm = r => `${r.name} (${r.rarity || '-'}, ${r.attack}/${r.health}, W${r.wait} L${r.lumber}, Map ${r.map})`;
const pw = r => r.power && r.power.n != null ? (r.power.n > 0 ? '+' : '') + r.power.n : 'n/a';
const md = ['# CARDPOW1: card power and budget fill, every card (2026-11-16)', '',
  `Every card of \`canonical/cards.json\` that can be on the board (${S.cards}; test cards, Hall of Fame variants and materia left out), read as the card editor reads it: **fill** = B / N, B the cap-1 score f x ((3A + H) x m + S), N at that level for the map where a player first gets it; stats and skills at each level from the game's Forge curve (statsAtLevel, effectsAtLevel). Band (checklist B1): ${BAND[0]}-${BAND[1]}% at Level 1 with cap 2 kept. **Power** = the card power test (\`${CPF}\`, ${CPJ.generated}, ${CPJ.games} games a card), win % minus the median Maps 0-20 card's (${CP_MED}%), as the editor shows it.`, '',
  `Data: \`docs/balance/cardpow1/cardpow1-2026-11-16.json\` and \`.csv\`. Workbook: \`/home/claude/out/CardPower - Bramblewood.xlsx\`. Tool: \`node tools/cardpow1/cardpow1_2026_11_16.js --xlsx\`. Proposals only; the stats are the owner's.`, '',
  '## Counts', '', '| | All cards | In play (obtainable) | In play, Maps 0-20 |', '|---|---|---|---|',
  `| Cards | ${S.cards} | ${S.inPlay} | ${S.maps0to20InPlay} |`,
  `| In band at L1 | ${S.inBand} | ${cnt(r => inPlay(r) && r.verdict === 'in band')} | ${cnt(r => inPlay(r) && r.map <= 20 && r.verdict === 'in band')} |`,
  `| Under 85% | ${S.under} | ${cnt(r => inPlay(r) && r.verdict === 'under')} | ${cnt(r => inPlay(r) && r.map <= 20 && r.verdict === 'under')} |`,
  `| Over (cap 1 or 2) | ${S.over} | ${cnt(r => inPlay(r) && r.verdict.startsWith('over'))} | ${cnt(r => inPlay(r) && r.map <= 20 && r.verdict.startsWith('over'))} |`,
  `| B2 jump (L1-10) | ${S.jumps} | ${cnt(r => inPlay(r) && r.jumps.length)} | ${cnt(r => inPlay(r) && r.map <= 20 && r.jumps.length)} |`,
  `| B2 stall (L1-10) | ${S.stalls} | ${cnt(r => inPlay(r) && r.stalls.length)} | ${cnt(r => inPlay(r) && r.map <= 20 && r.stalls.length)} |`,
  `| Power rated | ${S.powerRated} | ${cnt(r => inPlay(r) && r.power && r.power.n != null)} | ${cnt(r => inPlay(r) && r.map <= 20 && r.power && r.power.n != null)} |`, '',
  `Not rated by the power test (it never got to play them in 400 games; none is obtainable): ${rows.filter(r => !(r.power && r.power.n != null)).map(r => r.name + " (" + ((r.power && r.power.why) || "no row") + ")").join(", ") || "none"}. Cards that cost Stone, Metal or Uranium were measured with 2 copies of a card that delivers it in the test deck (Caldera Wyrm, Irradiated Glow Wyrm, Phoenix Mushrooms, Dynamite Packrat, Malachite Golem).`, "",
  `Skills with no price in \`canonical/skill-costs.json\`: ${Object.keys(missingAll).length ? Object.entries(missingAll).map(([k, v]) => k + ' (' + [...v].length + ')').join(', ') : 'none'}.`, '',
  `B2 rules: a jump is a one-level rise of more than ${STEP_JUMP} fill points, or a level over budget that Level 1 was not; a stall is a level more than ${DRIFT} points under the Level 1 fill, or no stat gain at any of the major levels 4, 7, 10.`, ''];
// B2 in one paragraph: the saw of the Forge curve for Level 1 starters, the Level 0 starters' Level 2 catch-up, the level-skill jumps
{ const ip = rows.filter(r => inPlay(r) && r.map <= 20), b0 = ip.filter(r => r.baseLevel === 0), b1 = ip.filter(r => r.baseLevel === 1);
  const med = a => { a = a.slice().sort((x, y) => x - y); return a.length ? r2(a[a.length >> 1]) : null; };
  const jumpers = ip.filter(r => r.jumps.length), lsJ = jumpers.filter(r => r.baseLevel !== 0);
  md.push('## The Level 1-10 curve (B2)', '',
    `- Level 1 starters (${b1.length} in play, Maps 0-20): the Forge curve is a saw, down a few points a level as N grows and back up on the majors 4, 7, 10; median range ${med(b1.map(r => Math.max(...r.curve.map(x => x.fill)) - Math.min(...r.curve.map(x => x.fill))))} points, Level 10 vs Level 1 median ${med(b1.map(r => r.fillL10 - r.fillL1))} points. No card stalls (a level ${DRIFT}+ points under its L1 fill and under the band).`,
    `- Level 0 starters (${b0.length}: tutorial, Base and Baby cards): Level 1 spends a third of the 0 -> 1 gain (it is no major level), so Level 2 (minor) catches up: median +${med(b0.map(r => r.curve[1].fill - r.curve[0].fill))} points from Level 1 to 2 (Level 1 starters ${med(b1.map(r => r.curve[1].fill - r.curve[0].fill))}). ${jumpers.length - lsJ.length} of the ${jumpers.length} jump flags are this. A curve call, not a card fix: make Level 1 a major for Level 0 starters (bramblewood-budget.js levelKind), or leave it.`,
    `- The other jumps: ${lsJ.map(r => r.name + ' (' + r.jumps.join('; ') + (r.levelSkills ? '; level skill at L' + r.levelSkills : '') + ')').join(', ') || 'none'}.`, ''); }
const tbl = (title, list) => { md.push('## ' + title, '', '| Card | Lists | L1 | L5 | L10 | Power | Flag | Proposal |', '|---|---|---|---|---|---|---|---|');
  list.forEach(r => md.push(`| ${fm(r)}${r.owner ? ' **owner-set**' : ''} | ${r.lists.slice(0, 3).join(', ')}${r.lists.length > 3 ? ' +' + (r.lists.length - 3) : ''} | ${r.fillL1}% | ${r.fillL5}% | ${r.fillL10}% | ${pw(r)} | ${r.flags.join('; ')} | ${r.proposal} |`)); md.push(''); };
const dist = r => r.fillL1 > BAND[1] ? r.fillL1 - BAND[1] : r.fillL1 < BAND[0] ? BAND[0] - r.fillL1 : 0;
tbl('In play, Maps 0-20: over budget at Level 1', rows.filter(r => inPlay(r) && r.map <= 20 && r.verdict.startsWith('over')).sort((a, b) => b.fillL1 - a.fillL1));
tbl('In play, Maps 0-20: under 85% at Level 1', rows.filter(r => inPlay(r) && r.map <= 20 && r.verdict === 'under').sort((a, b) => a.fillL1 - b.fillL1));
tbl('In play, Maps 0-20: in band at Level 1, curve flagged (B2)', rows.filter(r => inPlay(r) && r.map <= 20 && r.verdict === 'in band' && (r.jumps.length || r.stalls.length)));
tbl('In play, Map 21+: outside the band', rows.filter(r => inPlay(r) && r.map > 20 && r.verdict !== 'in band').sort((a, b) => dist(b) - dist(a)));
// owner-set cards outside the band: never retuned; why the budget misses them (its stat points, its skill prices, its N and first map)
{ const SCT = require('../skill_costs.js').make(J('canonical/skill-costs.json'));
  md.push('## Owner-set cards outside the band: why the budget misses them', '', 'Never retuned (tools/pipeline/config.json refit.ownerCards and the owner\'s hand-set cards are the same rule). B = stat points + S; the map is the first map a player can get the card on (a Pack 1 card reads Map 0 even when its first list is later).', '',
    '| Card | Lists | N at L1 (Map) | Stat points | S (skill prices) | Fill L1 | Power |', '|---|---|---|---|---|---|---|');
  rows.filter(r => r.owner && inPlay(r) && r.verdict !== 'in band').sort((a, b) => dist(b) - dist(a)).forEach(r => { const c = CARDS.find(x => x.id === r.id), p = SCT.cardS(c.effects || {}, c);
    md.push(`| ${r.name} (${r.rarity}, ${r.attack}/${r.health}, W${r.wait} L${r.lumber}) | ${r.lists.slice(0, 3).join(', ')} | ${r.N1} (Map ${r.map}) | ${r2(r.B1 - r.S1)} | ${r.S1}: ${(p.parts || []).filter(x => x[2]).map(x => x[1] + ' ' + r2(x[2])).join(', ') || 'none'} | ${r.fillL1}% | ${pw(r)} |`); });
  md.push(''); }
md.push('## Not in play (no list, tokens, fields, pool candidates): outside the band', '', `${cnt(r => !inPlay(r) && r.verdict !== 'in band')} of ${cnt(r => !inPlay(r))}; listed in the json / csv / workbook only.`, '');
fs.writeFileSync(path.join(OUT, 'cardpow1-2026-11-16.md'), md.join('\n') + '\n');
console.log(`${S.cards} cards (${S.inPlay} in play, ${S.maps0to20InPlay} Maps 0-20): in band ${S.inBand}, under ${S.under}, over ${S.over}; in play outside ${S.inPlayOutside} (Maps 0-20 ${S.maps0to20Outside}); B2 jumps ${S.jumps}, stalls ${S.stalls}; no price ${S.noPrice}; power rated ${S.powerRated}/${S.cards}`);
if (process.argv.includes('--xlsx')) cp.execFileSync('python3', [path.join(__dirname, 'workbook_2026_11_16.py'), path.join(OUT, 'cardpow1-2026-11-16.json'), '/home/claude/out/CardPower - Bramblewood.xlsx'], { stdio: 'inherit' });
