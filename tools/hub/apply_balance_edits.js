#!/usr/bin/env node
// Applies the owner's saved 🎚️ Budget & stats edits (the hub db's "budgetEdits", "cardEdits" and "monsterEdits" documents, read with
// ArtifactData; tools/hub/pull_balance_edits.md) to the files. 2026-10-19 (package HB, owner 17:44: "Where is our balance, monsters, and
// skills file -> can it be put into the artefact for my assessment. Also s.t. i can edit the values").
//   node tools/hub/apply_balance_edits.js edits.json --dry-run     print what would change (always run this first)
//   node tools/hub/apply_balance_edits.js edits.json               write it
// edits.json: {budgetEdits: [...], cardEdits: [...], monsterEdits: [...]}, each list the documents as a listing returns them
// ({id, data: {...}} or the plain body with its id), or the hub's Copy JSON (the same shape).
//   budgetEdits   doc id = the constant -> canonical/skill-costs.json "budget" and bramblewood-budget.js DEFAULTS (a constant the
//                 helper has no slot for, e.g. bandLow, goes to skill-costs.json only and is reported)
//   cardEdits     doc id = card id -> canonical/cards.json attack / health, with a dated line appended to the card's creatorNote
//   monsterEdits  doc id = the monster's key -> a raid part's bramble: canonical/raids.json <raid>.parts[<part>].fight.castleHp;
//                 an async raid boss: canonical/raid-bosses.json hqHp; every other monster's stats are computed (from card stats,
//                 levels and the raid's tuning), so its edit is written to docs/balance/monster-overrides.json and reported.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), P = (...a)=> path.join(ROOT, ...a);
const args = process.argv.slice(2), src = args.find(a=> !a.startsWith('--')), DRY = args.includes('--dry-run');
if(!src){ console.log('usage: node tools/hub/apply_balance_edits.js edits.json [--dry-run]'); process.exit(2); }
const IN = JSON.parse(fs.readFileSync(src, 'utf8'));
const docsOf = list=>{ if(!list) return []; if(!Array.isArray(list)) list = list.docs || list.items || list.documents || list.rows || Object.entries(list).map(([id, data])=> ({id, data}));
  return list.map(d=>{ if(!d) return null; const body = d.data && typeof d.data === 'object' ? d.data : d; return Object.assign({}, body, {_id: d.id || body.key || body.id}); }).filter(d=> d && d._id); };
const B = docsOf(IN.budgetEdits), C = docsOf(IN.cardEdits), M = docsOf(IN.monsterEdits);
const out = {budget: [], cards: [], monsters: [], overrides: [], warn: [], files: new Set()};
const today = new Date().toISOString().slice(0, 10);
const esc8 = s=> s.replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
const fmtTable = o=> '{\n' + Object.entries(o).map(([k, v])=> ' ' + JSON.stringify(k) + ': ' + (Array.isArray(v) && v.length && typeof v[0] === 'object' ? '[\n' + v.map(x=> '  ' + JSON.stringify(x)).join(',\n') + '\n ]' : JSON.stringify(v))).join(',\n') + '\n}\n';
const num = v=> typeof v === 'number' && isFinite(v) ? v : (v != null && v !== '' && isFinite(+v) ? +v : null);

// ---------- budget ----------
const SCF = P('canonical', 'skill-costs.json'), BJS = P('bramblewood-budget.js');
const table = JSON.parse(fs.readFileSync(SCF, 'utf8')); table.budget = table.budget || {};
let bjs = fs.readFileSync(BJS, 'utf8');
const dm = bjs.match(/const DEFAULTS = \{([^}]*)\};/), DEF = {};
if(dm) dm[1].split(',').forEach(p=>{ const m = p.match(/^\s*(\w+)\s*:\s*([-\d.eE]+)\s*$/); if(m) DEF[m[1]] = +m[2]; });
else out.warn.push('bramblewood-budget.js: no "const DEFAULTS = {...};" line found; only skill-costs.json is updated');
B.forEach(d=>{ const k = d._id, v = num(d.value);
  if(!/^\w+$/.test(k) || v == null){ out.warn.push(`budget ${k}: not a number (${JSON.stringify(d.value)}), skipped`); return; }
  const was = table.budget[k] != null ? table.budget[k] : DEF[k];
  if(d.prev != null && was != null && num(d.prev) !== was) out.warn.push(`budget ${k}: the hub edited it from ${d.prev}, the file now says ${was} (changed since the hub was built); applied ${v} anyway`);
  if(table.budget[k] !== v){ out.budget.push(`skill-costs.json budget.${k}: ${table.budget[k] == null ? '(none)' : table.budget[k]} -> ${v}`); table.budget[k] = v; out.files.add('canonical/skill-costs.json'); }
  if(k in DEF){ if(DEF[k] !== v){ out.budget.push(`bramblewood-budget.js DEFAULTS.${k}: ${DEF[k]} -> ${v}`); DEF[k] = v; out.files.add('bramblewood-budget.js'); } }
  else out.warn.push(`budget ${k}: bramblewood-budget.js has no ${k} in DEFAULTS (the helper does not read it): written to skill-costs.json only` + (k === 'bandLow' ? '; tools/skill_costs.js and the Skill costs tab use 60% for "well under" until they read budget.bandLow' : k === 'perMap' ? '; the helper needs the Map term (BF3) before it counts' : ''));
});
if(dm && out.files.has('bramblewood-budget.js')){
  const body = dm[1].split(',').map(p=>{ const m = p.match(/^(\s*)(\w+)(\s*:\s*)([-\d.eE]+)(\s*)$/); return m && m[2] in DEF ? m[1] + m[2] + m[3] + DEF[m[2]] + m[5] : p; }).join(',');
  bjs = bjs.replace(dm[0], `const DEFAULTS = {${body}};`);
}

// ---------- cards ----------
const CF = P('canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CF, 'utf8')), byId = {}; cards.forEach(c=> byId[c.id] = c);
C.forEach(d=>{ const c = byId[d._id]; if(!c){ out.warn.push(`card ${d._id}: not in cards.json, skipped`); return; }
  const A = num(d.attack), H = num(d.health), pa = d.prev && num(d.prev.attack), ph = d.prev && num(d.prev.health);
  if(pa != null && pa !== c.attack || ph != null && ph !== c.health) out.warn.push(`card ${c.name} (${c.id}): the hub edited it from ${pa}/${ph}, the file now says ${c.attack}/${c.health} (changed since the hub was built); applied anyway`);
  const na = A == null ? c.attack : Math.round(A), nh = H == null ? c.health : Math.round(H), note = (d.note || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  if(na === c.attack && nh === c.health){ if(note) out.warn.push(`card ${c.name} (${c.id}): a note but no stat change, not applied: "${note}"`); return; }
  out.cards.push(`${c.name} (${c.id}): ${c.attack}/${c.health} -> ${na}/${nh}${note ? ' · "' + note + '"' : ''}`);
  const when = (d.updatedAt || '').slice(0, 10) || today;
  c.creatorNote = ((c.creatorNote || '') + ` ${when} (owner's hub edit, Budget & stats tab): ${c.attack}/${c.health} -> ${na}/${nh}${note ? ' (' + note + ')' : ''}.`).trim();
  c.attack = na; c.health = nh; out.files.add('canonical/cards.json');
});

// ---------- monsters ----------
const RF = P('canonical', 'raids.json'), RBF = P('canonical', 'raid-bosses.json'), SMF = P('canonical', 'special-monsters.json'), OVF = P('docs', 'balance', 'monster-overrides.json');
const raids = JSON.parse(fs.readFileSync(RF, 'utf8')); let rbText = fs.readFileSync(RBF, 'utf8'); const rb = JSON.parse(rbText);
const SM = fs.existsSync(SMF) ? JSON.parse(fs.readFileSync(SMF, 'utf8')) : {groups: {}};
const rowOf = {}; Object.entries(SM.groups || {}).forEach(([g, x])=> (x.rows || []).forEach(r=>{ (rowOf[r.id] = rowOf[r.id] || []).push(Object.assign({g}, r)); }));
const ov = fs.existsSync(OVF) ? JSON.parse(fs.readFileSync(OVF, 'utf8')) : {_about: 'Owner stat edits for special monsters whose stats are computed (card stats, levels, the raid tuning), from the hub\'s 🎚️ Budget & stats tab (tools/hub/apply_balance_edits.js, package HB 2026-10-19). Nothing in the game reads this file yet: each entry needs a change at its source (the card, the raid tuning or the Tower / Conquest level). Keyed by the hub\'s monster key.', overrides: {}};
M.forEach(d=>{ const key = d._id, id = d.id || key.split('@')[0], group = d.group || ((rowOf[id] || [])[0] || {}).g || '', A = num(d.attack), H = num(d.health), note = (d.note || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  const prev = d.prev || {}, tag = `${d.name || id} [${key}]`;
  if(group === 'brambles' && H != null){ const part = ((rowOf[id] || [])[0] || {}).part || id.replace(/^bramble:/, ''); let hit = null;
    raids.forEach(r=> (r.parts || []).forEach(p=>{ if(p.id === part && p.fight && 'castleHp' in p.fight) hit = {r, p}; }));
    if(hit){ if(prev.health != null && prev.health !== hit.p.fight.castleHp) out.warn.push(`${tag}: the hub showed ${prev.health} (special-monsters.json, RJ's run); raids.json says ${hit.p.fight.castleHp} now; the edit sets ${H}`);
      if(hit.p.fight.castleHp !== H){ out.monsters.push(`${tag}: raids.json ${hit.r.id}.parts[${part}].fight.castleHp ${hit.p.fight.castleHp} -> ${H}${note ? ' · "' + note + '"' : ''}`); hit.p.fight.castleHp = Math.round(H); out.files.add('canonical/raids.json'); }
      if(A != null && A !== (prev.attack != null ? prev.attack : 0)) out.warn.push(`${tag}: a bramble has no Attack in raids.json; Attack ${A} not applied`); return; }
    out.warn.push(`${tag}: no part "${part}" with a castleHp in raids.json; written to the override list`); }
  if(group === 'async' && H != null){ const b = rb.find(x=> x.id === id);
    if(b && 'hqHp' in b){ if(prev.health != null && prev.health !== b.hqHp) out.warn.push(`${tag}: the hub showed ${prev.health}; raid-bosses.json says ${b.hqHp} now; the edit sets ${H}`);
      if(b.hqHp !== H){ out.monsters.push(`${tag}: raid-bosses.json ${id}.hqHp ${b.hqHp} -> ${H}${note ? ' · "' + note + '"' : ''}`);
        const re = new RegExp('(\\{"id":"' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^\\n]*?"hqHp":)\\d+(\\.\\d+)?'); b.hqHp = Math.round(H); if(rbText != null && re.test(rbText)) rbText = rbText.replace(re, '$1' + Math.round(H)); else rbText = null; out.files.add('canonical/raid-bosses.json'); }
      if(A != null && A !== (prev.attack != null ? prev.attack : 0)) out.warn.push(`${tag}: an async boss's bramble has no Attack; Attack ${A} not applied`); return; }
    out.warn.push(`${tag}: ${id} has no hqHp in raid-bosses.json; written to the override list`); }
  // computed: the override list
  const row = (rowOf[id] || [])[0] || {};
  const entry = {id, name: d.name || row.name || id, group, where: d.where || '', attack: A, health: H, prev: {attack: prev.attack, health: prev.health}, note, updatedAt: d.updatedAt || today,
    source: group === 'units' ? 'computed: the card ' + (row.of || id.split('~')[0]) + "'s stats + the raid's bossHpBonusMax / weakening (canonical/raids.json)"
      : group === 'rows' || group === 'commons' ? "computed: the card's printed stats × the raid's bossAtkPct / bossHpPct (canonical/raids.json tuning)"
      : group === 'guards' ? 'computed: canonical/raids.json trench.entities stats + the stage rules'
      : group === 'road' || group === 'tower' ? "computed: the card's stats at the level it fights at (bramblewood-budget.js forgeCurve)" : 'computed'};
  const was = JSON.stringify((ov.overrides || {})[key] && Object.assign({}, ov.overrides[key], {updatedAt: 0}));
  if(was !== JSON.stringify(Object.assign({}, entry, {updatedAt: 0}))){ out.overrides.push(`${tag}: ${prev.attack}/${prev.health} -> ${A}/${H} (${entry.source})${note ? ' · "' + note + '"' : ''}`); (ov.overrides = ov.overrides || {})[key] = entry; out.files.add('docs/balance/monster-overrides.json'); }
});

// ---------- report / write ----------
const sec = (t, l)=>{ console.log(`${t} (${l.length})`); l.forEach(x=> console.log('  ' + x)); };
console.log(`${DRY ? 'DRY RUN: nothing written. ' : ''}${B.length} budget, ${C.length} card, ${M.length} monster edit(s) read from ${src}`);
sec('Budget constants', out.budget); sec('Card stats (canonical/cards.json)', out.cards); sec('Monsters written to their source', out.monsters); sec('Monsters on the override list (docs/balance/monster-overrides.json; computed stats, nothing reads it yet)', out.overrides);
if(out.warn.length) sec('Check', out.warn);
console.log('Files' + (DRY ? ' that would change' : ' written') + ': ' + ([...out.files].join(', ') || 'none'));
if(DRY || !out.files.size) process.exit(0);
if(out.files.has('canonical/skill-costs.json')) fs.writeFileSync(SCF, fmtTable(table));
if(out.files.has('bramblewood-budget.js')) fs.writeFileSync(BJS, bjs);
if(out.files.has('canonical/cards.json')) fs.writeFileSync(CF, esc8(JSON.stringify(cards, null, 2)) + '\n');
if(out.files.has('canonical/raids.json')) fs.writeFileSync(RF, JSON.stringify(raids, null, 2) + '\n');
if(out.files.has('canonical/raid-bosses.json')) fs.writeFileSync(RBF, rbText != null ? rbText : '[\n' + rb.map(x=> ' ' + JSON.stringify(x)).join(',\n') + '\n]\n');
if(out.files.has('docs/balance/monster-overrides.json')) fs.writeFileSync(OVF, JSON.stringify(ov, null, 1) + '\n');
console.log('Next: node tools/skill_costs.js --diff; node tools/special_monsters.js (re-measures the monsters); rebuild the hub (tools/hub/build_hub.py).');
