#!/usr/bin/env node
// 2026-11-02 (package BAL9; owner 11-02 00:17, "Decisions - you decide"): the card-data steps of BAL9. Each writes a plan of card edits
// (docs/balance/bal9/<step>-2026-11-02.json); `--apply` writes it with python3 tools/bal9/apply_cards_2026_11_02.py (cards.json keeps its format).
//   node tools/bal9/cards_2026_11_02.js rewards [--apply]   JJ12b: the fights' reward slots against the new lists (THEME4)
//   node tools/bal9/cards_2026_11_02.js rarity  [--apply]   JJ12a: every listed card at or below its first list's rarity cap, re-fit by the budget
//   node tools/bal9/cards_2026_11_02.js refit   [--apply]   JJ21: every in-play card outside the budget band, re-fit (owner-set cards listed)
//
// REWARDS (JJ12b, "spread each map's cards between its packs and skirmish rewards (random is fine)"). A fight's skirmish-exclusive reward
// (a card whose source is {kind:'map', id, node}) and its GD5 first-clear pack card (SKIRMISH_FIRST_PACK_CARDS) must be a card that is NEW on
// that fight's map: its first list (cardFirstMapList) is that map, or a list that opens at the same map number. The slots themselves stay as
// they are (no slot is added or removed: "keep the existing reward slots valid"). A slot whose card is now on no list (cut by THEME4) or first
// listed elsewhere gets a random (seeded) new pack card of that map inside the fight's rarity cap; the card it held becomes a basic-pack card
// (on no list: out of play, as THEME4 cut it). Leaders (archetype Leader, a boss's first clear) are left alone.
// RARITY (JJ12a, "re-set rarities now the lists are chosen (e.g. Old Shell on Map 2 at most Uncommon)"): a listed card's rarity is at most the
// rarest fight of its first list (roadRarityCap(map, 'boss'); a side map by its own fights' number, as the game caps them), and a skirmish-
// exclusive reward at most its fight's cap. Only lowered, never raised. Held: Dolphin Knight (owner HH6: "limits ignored"). Not touched: the
// tutorial side map and the Old Bramble (SKIP_LOCS). A boss leader that drops below Heroic keeps leading through the Leader skill (0.1).
// Each lowered card is re-fit by BUDGET2's rule (tools/skill2_refit_2026_10_31.js fit: the smallest relative stat change into the band), or,
// when that finds nothing, the largest line on its Attack:Health shape inside both caps (tools/refit_pass_2026_10_21.js's scan).
// REFIT (JJ21, "cards still over / under the formula: fix them"): every in-play card the budget reads over (a cap broken) or well under (cap 1
// at or below 60% of N) gets BUDGET2's fit. Left alone and listed: eggs and equipment (priced their own way), the Dragons and the owner's
// named cards (tools/pipeline/config.json refit.ownerCards), cards whose creatorNote says the owner set them, and cards no stat change fits.
'use strict';
process.env.SKILL2_MISSMULT = process.env.SKILL2_MISSMULT || '1';
process.env.SKILL2_NO_NAMED = '1';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const L = require('./lib_bal9.js'), ROOT = L.ROOT;
const { G, D, LP, pools, B } = L.game();
const DATE = '2026-11-02', OUTDIR = path.join(ROOT, 'docs', 'balance', 'bal9');
const SNAP = path.join(ROOT, 'docs', 'balance', 'pipeline', 'state', 'skill-costs.before-price.json');
if (!process.env.SKILL2_OLD_TABLE && fs.existsSync(SNAP)) process.env.SKILL2_OLD_TABLE = SNAP;
const R = require('../skill2_refit_2026_10_31.js');
const CFG = L.readJson('tools/pipeline/config.json');
const HOLD_RARITY = { 'dolphin-knight': 'owner HH6 (11-01): added to Pebble Beach, "limits ignored"' };
const STEPS = G.ROAD_RARITY_STEPS || ['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic'];
const maps = G.CONQUEST_MAPS, byMap = id => maps.find(m => m.id === id);
const first = id => (D[id] ? G.cardFirstMapList(D[id]) : null);
const unlockNo = loc => { try { return G.mapUnlockNumberOf(loc); } catch (e) { return G.mapNumberOf(loc); } };
const isLeaderCard = d => (d.archetypes || []).includes('Leader');
// a map's family: the main map and its side maps (a side map's fights may give a card of its parent's lists and the other way round)
const familyOf = loc => { const m = byMap(loc); const top = m && m.sub ? m.parent : loc; return new Set([top].concat(maps.filter(x => x.sub && x.parent === top).map(x => x.id))); };
const newOn = (id, loc) => { const f = first(id); return !!f && (f.loc === loc || f.n === unlockNo(loc) || familyOf(loc).has(f.loc)); };
const srcOf = d => G.cardSourceOf(d);
const isEquip = d => !!(d && (d.cardType === 'equipment' || d.equip)), isEgg = d => !!(d && (d.easterEgg || (d.source && d.source.kind === 'easteregg')));
function nodeOf(loc, key) { const m = byMap(loc); return m && (m.nodes || []).find(n => n.key === key); }
function locsInPlay() { return maps.filter(m => !m.endless && !m.tower && !m.reserved && !L.SKIP_LOCS.has(m.id) && G.mapNumberOf(m.id) != null); }
function plainCards() { return JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')); }
function save(stepName, plan) { if (process.argv.includes("--check")) return null; // --check: report only, no file
  if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true }); let f = path.join(OUTDIR, `${stepName}-${DATE}.json`); if (!(plan.edits || []).length && fs.existsSync(f)) f = path.join(OUTDIR, `${stepName}-check-${DATE}.json`); L.writeJson(f, plan); return f; } // a clean re-run keeps the applied plan; it writes <step>-check-<date>.json
// applying also adds the plan's edits to docs/balance/bal9/applied-2026-11-02.json (every pass of every step, in order), since a later dry
// run writes the step's plan file again
function applyPlan(f) { const r = cp.spawnSync('python3', [path.join(__dirname, 'apply_cards_2026_11_02.py'), f], { cwd: ROOT, encoding: 'utf8' }); process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || ''); if (r.status) throw new Error('apply failed');
  const log = path.join(OUTDIR, `applied-${DATE}.json`), j = L.readJson(log, { _about: 'BAL9 (2026-11-02): every card edit the BAL9 steps applied, pass by pass (tools/bal9/cards_2026_11_02.js --apply)', passes: [] });
  j.passes.push({ step: path.basename(f).split('-')[0], at: new Date().toISOString(), edits: L.readJson(f).edits }); L.writeJson(log, j); }

// ---------------------------------------------------------------- REWARDS
function cmdRewards(apply) {
  const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), FP = L.firstPackTable(src);
  const edits = [], fpEdits = [], slots = [], report = [];
  const used = new Set(Object.values(FP));
  const exclusive = new Set(); locsInPlay().forEach(m => (m.nodes || []).forEach(n => G.nodeRewardCardIds(m.id, n.key).forEach(id => exclusive.add(id))));
  const takenNow = new Set();
  const pick = (loc, node, why) => { // a random new pack card of loc inside the node's cap
    const cap = L.nodeCap(loc, node), capList = L.listCap(loc);
    const cand = Object.keys(D).filter(id => { const d = D[id]; if (!d || d.token || d.test || isEquip(d)) return false; const s = srcOf(d);
      if (s.kind !== 'pack' || !newOn(id, loc) || used.has(id) || exclusive.has(id) || takenNow.has(id)) return false;
      const r = L.step(d.rarity) > L.step(capList) ? capList : d.rarity; return L.step(r) <= L.step(cap); }).sort();
    if (!cand.length) return null; const r = L.rng('bal9:' + why + ':' + loc + ':' + node.key); const id = cand[Math.floor(r() * cand.length)]; takenNow.add(id); return id;
  };
  for (const m of locsInPlay()) for (const n of (m.nodes || [])) {
    G.nodeRewardCardIds(m.id, n.key).forEach(id => { const d = D[id]; if (isLeaderCard(d)) return; if (newOn(id, m.id)) return;
      const f = first(id), why = f ? `first listed on ${f.loc} (Map ${f.n}), not ${m.id}` : 'on no list (cut by THEME4)';
      const rep = pick(m.id, n, 'ex');
      const tier = f ? (G.packTierOfMapNumber ? G.packTierOfMapNumber(f.n) : Math.floor(f.n / 7) + 1) : ((d.source && d.source.tier) || 1);
      edits.push({ id, set: { source: { kind: 'pack', tier } }, note: `reward slot ${m.id}:${n.key} released (${why}); now a basic-pack card${f ? '' : ' on no list (out of play)'}` });
      if (rep) edits.push({ id: rep, set: { source: { kind: 'map', id: m.id, node: n.key } }, note: `the skirmish-exclusive reward of ${m.id}:${n.key} (was ${id}: ${why}); a new card of that map, picked at random (seeded) inside the fight's ${L.nodeCap(m.id, n)} cap` });
      slots.push({ slot: m.id + ':' + n.key, kind: 'exclusive', was: id, why, now: rep || null });
    });
  }
  Object.entries(FP).forEach(([k, id]) => { const [loc, key] = k.split(':'); const m = byMap(loc), n = nodeOf(loc, key); if (!m || !n || L.SKIP_LOCS.has(loc)) return;
    const d = D[id], ok = d && srcOf(d).kind === 'pack' && newOn(id, loc) && !edits.some(e => e.id === id && e.set.source.kind === 'map');
    if (ok) return; const f = first(id), why = !d ? 'unknown card' : srcOf(d).kind !== 'pack' ? 'not a pack card' : f ? `first listed on ${f.loc} (Map ${f.n})` : 'on no list (cut by THEME4)';
    used.delete(id); const rep = pick(loc, n, 'fp'); fpEdits.push({ key: k, was: id, now: rep, why }); slots.push({ slot: k, kind: 'first-clear pack card', was: id, why, now: rep || null }); });
  // DV2's count per main map (report only): new givable cards -> 3 / 2 / 1 exclusive rewards
  maps.filter(m => !m.sub && !m.reserved && G.mapNumberOf(m.id) != null).sort((a, b) => G.mapNumberOf(a.id) - G.mapNumberOf(b.id)).forEach(m => {
    const newIds = Object.keys(D).filter(id => { const f = first(id); return f && f.loc === m.id; }), giv = newIds.filter(id => ['pack', 'map'].includes(srcOf(D[id]).kind) && !isLeaderCard(D[id]));
    const ex = []; (m.nodes || []).forEach(n => G.nodeRewardCardIds(m.id, n.key).forEach(id => { if (!isLeaderCard(D[id])) ex.push(id); }));
    const want = giv.length >= 10 ? 3 : giv.length >= 6 ? 2 : 1; report.push({ map: G.mapNumberOf(m.id), id: m.id, name: m.name, newCards: giv.length, rule: want, exclusiveSlots: ex.length });
  });
  const plan = { _about: 'BAL9 JJ12b (2026-11-02): reward slots re-filled against the THEME4 lists; tools/bal9/cards_2026_11_02.js rewards', built: DATE, edits, firstPack: fpEdits, slots, dv2: report };
  const f = save('rewards', plan);
  console.log(`reward slots re-filled: ${slots.length} (${slots.filter(s => !s.now).length} left empty); card edits ${edits.length} -> ${(f ? path.relative(ROOT, f) : "(check: no file)")}`);
  slots.forEach(s => console.log(`  ${s.slot.padEnd(12)} ${s.kind.padEnd(22)} ${s.was} -> ${s.now || '(none fits: slot empty)'}  [${s.why}]`));
  report.filter(r => r.exclusiveSlots !== r.rule).forEach(r => console.log(`  DV2 count: Map ${r.map} ${r.name}: ${r.newCards} new cards -> rule ${r.rule}, has ${r.exclusiveSlots} exclusive slots`));
  if (apply) { applyPlan(f); writeFirstPack(fpEdits); }
}
function writeFirstPack(fpEdits) {
  if (!fpEdits.length) return; const F = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(F, 'utf8');
  fpEdits.forEach(e => { const re = new RegExp(`\\n  '${e.key}': '${e.was}',[^\\n]*`); if (!re.test(s)) { console.log('first-pack line not found: ' + e.key); return; }
    s = s.replace(re, e.now ? `\n  '${e.key}': '${e.now}', // 2026-11-02 (BAL9, JJ12): was ${e.was} (${e.why})` : `\n  // '${e.key}': removed 2026-11-02 (BAL9, JJ12): was ${e.was} (${e.why}); no new pack card of that map fits`); });
  fs.writeFileSync(F, s); console.log(`SKIRMISH_FIRST_PACK_CARDS: ${fpEdits.length} lines`);
}

// ---------------------------------------------------------------- the fit
const pts = c => 3 * (+c.attack || 0) + (+c.health || 0);
function shapeFit(c) { // the largest line on the card's Attack:Health shape that the band takes (refit_pass_2026_10_21.js's scan)
  const A0 = +c.attack || 0, H0 = Math.max(1, +c.health || 1); let best = null;
  for (let k = 0.05; k <= 6; k += 0.01) { const A = c.attack == null ? null : A0 === 0 ? 0 : Math.max(1, Math.round(A0 * k)), H = Math.max(1, Math.round(H0 * k));
    const t = Object.assign({}, c, { attack: A, health: H }), w = R.verdict(R.NEW, t); if (!w.over && (!best || w.use > best.w.use)) best = { attack: A, health: H, w }; }
  return best;
}
function fitCard(c) { // -> {attack, health, w, how} or null
  const v = R.verdict(R.NEW, c); if (v.ok) return { attack: c.attack, health: c.health, w: v, how: 'in band' };
  const f = R.fit(c, v, v); if (f) return { attack: c.attack == null ? null : (+c.attack || 0) + f.dA, health: c.health + f.dH, w: f.w, how: 'BUDGET2 fit' };
  const s = shapeFit(c); if (s && !s.w.over) return Object.assign(s, { how: 'shape scan' + (s.w.under ? ' (still well under)' : '') }); return null;
}

// ---------------------------------------------------------------- RARITY
function cmdRarity(apply) {
  const cards = plainCards(), edits = [], held = [], skipped = [];
  for (const c of cards) {
    const d = D[c.id]; if (!d || c.token || c.test || c.health == null && c.attack == null) continue;
    const s = srcOf(d); if (s.kind === 'base') continue; if (isEquip(d) || isEgg(d)) continue;
    const f = first(c.id); if (!f) continue; if (L.SKIP_LOCS.has(f.loc)) { skipped.push(c.id + ' (' + f.loc + ')'); continue; }
    let cap = L.listCap(f.loc), capWhy = `the rarest fight of ${f.loc} (Map ${G.mapNumberOf(f.loc)})`;
    if (s.kind === 'map') { const n = nodeOf(s.id, s.node); if (n) { const nc = L.nodeCap(s.id, n); if (L.step(nc) < L.step(cap)) { cap = nc; capWhy = `its fight ${s.id}:${s.node} (${n.kind || 'skirmish'})`; } } }
    if (!(L.step(c.rarity) > L.step(cap))) continue;
    if (G.roadNever && G.roadNever(c.rarity)) continue;
    if (HOLD_RARITY[c.id]) { held.push({ id: c.id, rarity: c.rarity, cap, why: HOLD_RARITY[c.id] }); continue; }
    const to = STEPS[L.step(cap)], t = Object.assign({}, c, { rarity: to }), set = { rarity: to };
    const wasLeader = isLeaderCard(c) && L.step(c.rarity) >= L.step('heroic') && !(c.effects || {}).leader;
    if (wasLeader && L.step(to) < L.step('heroic')) { t.effects = Object.assign({}, c.effects || {}, { leader: true }); set.effects = t.effects; }
    const fit = fitCard(t);
    if (fit && (fit.attack !== c.attack || fit.health !== c.health)) { if (c.attack != null) set.attack = fit.attack; set.health = fit.health; }
    edits.push({ id: c.id, set, from: { rarity: c.rarity, stats: `${c.attack}/${c.health}` }, note: `rarity ${c.rarity} -> ${to}: at most ${capWhy}, first listed on ${f.loc} (owner JJ12)` + (set.effects ? '; keeps leading through the Leader skill' : '') + (set.health != null ? `; re-fit ${c.attack}/${c.health} -> ${set.attack != null ? set.attack : c.attack}/${set.health} (${fit.how}, cap-1 use ${fit.w.use})` : fit ? '' : '; no stat line fits the band (listed)') });
  }
  const plan = { _about: 'BAL9 JJ12a (2026-11-02): rarities at or below the first list\'s cap, re-fit; tools/bal9/cards_2026_11_02.js rarity', built: DATE, edits, held, skipped };
  const f = save('rarity', plan);
  console.log(`rarity lowered: ${edits.length}; held ${held.length}; skipped (tutorial / Old Bramble lists) ${skipped.length} -> ${(f ? path.relative(ROOT, f) : "(check: no file)")}`);
  edits.forEach(e => console.log(`  ${e.id.padEnd(26)} ${e.from.rarity.padEnd(9)} -> ${e.set.rarity.padEnd(9)} ${e.from.stats} -> ${e.set.attack != null ? e.set.attack : e.from.stats.split('/')[0]}/${e.set.health != null ? e.set.health : e.from.stats.split('/')[1]}`));
  held.forEach(h => console.log(`  held ${h.id} ${h.rarity} (cap ${h.cap}): ${h.why}`));
  if (apply) applyPlan(f);
}

// ---------------------------------------------------------------- REFIT
const OWNER_NOTE = /owner[^.]{0,60}\b(set|tune|tuned|chose|picked|asked for|wants?)\b[^.]{0,40}\b(stat|attack|health|\d+\/\d+)/i;
function cmdRefit(apply) {
  const cards = plainCards(), edits = [], listed = [];
  // 2026-11-02 (package BAL11): the cards its budget fit held for the owner (Stealth / Breach at the road's bramble Health)
  const BAL11_HELD = new Set(((() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal11', 'refit-2026-11-02.json'), 'utf8')).held; } catch (e) { return []; } })()).map(h => h.id));
  const owner = new Set(CFG.refit.ownerCards);
  for (const c of cards) {
    const d = D[c.id]; if (!d || c.pool || c.token || c.test || c.health == null) continue;
    if (LP.isOutOfPlay(G, d)) continue;
    const v = R.verdict(R.NEW, c); if (v.ok) continue;
    const base = { id: c.id, rarity: c.rarity, stats: `${c.attack == null ? '-' : c.attack}/${c.health}`, verdict: v.over ? 'over' : 'under', use: v.use, cap2: v.cap2 };
    if (/^egg-/.test(c.id) || (c.effects || {}).egg || isEquip(d) || c.cardType === 'equipment') { listed.push(Object.assign(base, { why: 'egg / equipment: priced its own way (read well under by design)' })); continue; }
    if (owner.has(c.id)) { listed.push(Object.assign(base, { why: 'named owner card (' + CFG.refit.ownerWhy + ')' })); continue; }
    if (BAL11_HELD.has(c.id)) { listed.push(Object.assign(base, { why: 'held for the owner by BAL11 (decision BAL11-2: no fit within 2 a stat keeps its body shape; docs/balance/bal11/refit-2026-11-02.json)' })); continue; } // 2026-11-02 (BAL11)
    if (OWNER_NOTE.test(c.creatorNote || '')) { listed.push(Object.assign(base, { why: 'creatorNote: the owner set it ("' + ((c.creatorNote || '').match(OWNER_NOTE) || [''])[0].slice(0, 90) + '")' })); continue; }
    if ((c.effects || {}).anadromous) { listed.push(Object.assign(base, { why: 'Anadromous: ENG15 prices it' })); continue; }
    const f = fitCard(c);
    if (!f || f.w.over) { listed.push(Object.assign(base, { why: 'no stat change fits the band (its skills alone break a cap)' })); continue; }
    const set = { health: f.health }; if (c.attack != null) set.attack = f.attack;
    edits.push({ id: c.id, set, from: base, to: `${f.attack == null ? '-' : f.attack}/${f.health}`, use: f.w.use, note: `re-fit ${base.stats} -> ${f.attack == null ? '-' : f.attack}/${f.health}: it read ${base.verdict} the budget band (cap-1 use ${v.use} of N), now ${f.w.use} (${f.how}; owner JJ21)` });
  }
  const plan = { _about: 'BAL9 JJ21 (2026-11-02): in-play cards outside the budget band re-fit; tools/bal9/cards_2026_11_02.js refit', built: DATE, edits, listed };
  const f = save('refit', plan);
  console.log(`re-fit: ${edits.length}; listed (not changed): ${listed.length} -> ${(f ? path.relative(ROOT, f) : "(check: no file)")}`);
  edits.forEach(e => console.log(`  ${e.id.padEnd(28)} ${String(e.rarity).padEnd(9)} ${e.from.verdict.padEnd(5)} ${e.from.stats} -> ${e.to} (use ${e.from.use} -> ${e.use})`));
  listed.forEach(x => console.log(`  listed ${x.id} ${x.stats} ${x.verdict} use ${x.use}: ${x.why}`));
  if (apply) applyPlan(f);
}

const cmd = process.argv[2], apply = process.argv.includes('--apply');
if (cmd === 'rewards') cmdRewards(apply); else if (cmd === 'rarity') cmdRarity(apply); else if (cmd === 'refit') cmdRefit(apply);
else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 6).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
module.exports = { fitCard };
