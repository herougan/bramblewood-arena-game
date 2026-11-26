#!/usr/bin/env node
// 2026-11-26 (owner 21:32: "Lets make sure there is a series of fun effects. Whats in map0-20, wffects wise. Show every single one"):
// every effect a card carries on Maps 0-20, read inside the built game (index.html) so names, texts and lists are the game's own.
// Lists: each main map's list, its side maps (submaps) and its Special; a card's Level skills count too (marked Ln). Grants and shot
// parameters fold into their skill. Grouped by what the effect does; trigger effects (On Play / On Death / On Attack ...) last.
// Writes docs/effects-0-20.md (generated; the hub's Design tab shows it).
//   node tools/hub/effects_0_20.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), OUT = path.join(ROOT, 'docs', 'effects-0-20.md');
const FOLD = { diurnalGrant: 'diurnal', nocturnalGrant: 'nocturnal', stormGrant: 'storm', tideGrant: 'tide', deliveryRes: 'delivery', arrowBramble: 'arrow', hunterVs: 'hunter', bounty: null };
const GROUPS = [
  ['Strikes and attack shapes', 'pounce gash arrow fireArrow fireBolt snipe volley crabClaws trident octolash fork sweep twinStrike reach stealth siege overwhelm mighty pierce pulverise electricity wave bulldoze recoil counterattack hunter trap ambush dynamite landslide'],
  ['Statuses its hits leave', 'poison bleed decay corrode daunt weaken web strangle tangle exploit expose brittle confuse sap intimidate'],
  ['Each-turn powders and clouds', 'paralysisPowder poisonPowder sleepPowder smokeBomb'],
  ['Defence', 'armor shield bulwark rampart thorns poisonBarbs guardian taunt evasive flying swift sturdy rage regen immunity slow purblind'],
  ['Growth, deaths and new units', 'harbinger carrion carnage momentum meiosis bloomCopy offspring hatchling evolute broodkeeper onDeathSpawn parasite loneWolf throng plenty fastForward'],
  ['Team and support', 'swarm pack packHowl packLeader leader inspiring nursing foraging herbalist repair fletcher armourer illuminate'],
  ['Day, night, weather and senses', 'tide diurnal nocturnal storm heat dry darksight keenSense'],
  ['Resources', 'delivery forestry'],
];
const TRIG_ICON = { onSpawn: '⬆️ On Play', onDeath: '💀 On Death', onAttack: '⚔️ On Attack', onAttacked: '🛡 On Attacked', onReady: '✅ On Ready', onKill: '🎯 On Kill', onHealed: '💚 On Nursed', onAction: '🔁 On Action', perTurn: '🔁 Every Turn', onPitch: '🃏 On Pitch' };
(async () => {
  const pw = require('playwright'), b = await pw.chromium.launch(), p = await b.newPage();
  await p.goto('file://' + path.join(ROOT, 'index.html'));
  await p.waitForFunction(() => typeof mpEntry === 'function' && typeof skillText === 'function', null, { timeout: 90000 });
  const data = await p.evaluate(() => {
    try { adminModeEnabled = true; } catch (e) {}
    const defs = getCardDefs(), all = CONQUEST_MAPS, mains = all.filter(m => !m.sub), lists = [];
    mains.forEach((m, n) => { if (n > 20) return; const e = mpEntry(m.id) || {};
      lists.push({ n, kind: 'main', name: m.name, ids: (e.cards || []).filter(id => defs[id]) });
      if ((e.special || []).length) lists.push({ n, kind: 'special', name: m.name, ids: e.special.filter(id => defs[id]) });
      Object.keys(e.submaps || {}).forEach(k => { const sm = all.find(x => x.id === k), v = e.submaps[k];
        lists.push({ n, kind: 'side', name: sm ? sm.name : k, ids: (Array.isArray(v) ? v : (v && v.cards) || []).filter(id => defs[id]) }); });
    });
    const sk = {}, tr = {};
    const info = (k, v) => { const pd = skillDefOf(k); let t = ''; try { t = pd ? skillText(pd, v, {}) : ''; } catch (e) { try { t = pd.desc(v); } catch (_) {} }
      return { label: pd ? pd.label : k, icon: SKILL_ICON[k] || '', desc: String(t).replace(/<[^>]*>/g, '') }; };
    lists.forEach(L => L.ids.forEach(id => { const d = defs[id], at = { n: L.n, kind: L.kind, name: L.name };
      const scan = (eff, lv) => Object.keys(eff || {}).forEach(k => { const v = eff[k]; if (v == null || v === false || v === 0) return; const nm = d.name + (lv ? ` (L${lv})` : '');
        if (k === 'triggers') return (v || []).forEach(t => { const tk = t.on + '>' + t.do; let txt = '';
          try { txt = describeEffects({ id: 'x', name: 'x', effects: { triggers: [t] } }, null, { terse: true }).join(' / ').replace(/<[^>]*>/g, ''); } catch (e) { txt = ''; }
          tr[tk] = tr[tk] || { on: t.on, do: t.do, eg: txt, cards: {} }; (tr[tk].cards[nm] = tr[tk].cards[nm] || []).push(at); });
        if (!sk[k]) sk[k] = Object.assign({ key: k, cards: {} }, info(k, v)); (sk[k].cards[nm] = sk[k].cards[nm] || []).push(at); });
      scan(d.effects, 0); Object.entries(d.levelSkills || {}).forEach(([lv, eff]) => scan(eff, lv)); }));
    return { sk: Object.values(sk), tr: Object.values(tr), focus: MAP_FOCUS_SKILLS, lists: lists.map(l => ({ n: l.n, kind: l.kind, name: l.name, count: l.ids.length })) };
  });
  await b.close();
  // fold grants / shot parameters into their skill
  const sk = {}; data.sk.forEach(s => { const k = s.key in FOLD ? FOLD[s.key] : s.key; if (!k) return; if (!sk[k]) sk[k] = Object.assign({}, s, { key: k, cards: {} });
    if (s.key === k) Object.assign(sk[k], { label: s.label, icon: s.icon, desc: s.desc }); Object.entries(s.cards).forEach(([c, a]) => { sk[k].cards[c] = (sk[k].cards[c] || []).concat(a); }); });
  const newAt = {}; Object.entries(data.focus || {}).forEach(([n, ks]) => (ks || []).forEach(k => { if (newAt[k] == null) newAt[k] = +n; }));
  const where = a => a.kind === 'main' ? `Map ${a.n}` : a.kind === 'special' ? `Map ${a.n} Special` : `${a.name} (side ${a.n})`;
  const first = cards => { const at = [].concat(...Object.values(cards)); at.sort((x, y) => x.n - y.n || (x.kind === 'main' ? -1 : 1)); return at[0]; };
  const onlyUnder = cards => [].concat(...Object.values(cards)).every(a => a.name === 'The Undercroft');
  const row = s => { const f = first(s.cards), names = Object.keys(s.cards), mains = [].concat(...Object.values(s.cards)).filter(a => a.kind === 'main').length;
    const flags = [newAt[s.key] != null ? `New! Map ${newAt[s.key]}` : '', onlyUnder(s.cards) ? 'Undercroft only' : !mains ? 'side / Special only' : ''].filter(Boolean).join(' · ');
    return `| ${s.icon} **${s.label}** | ${s.desc.replace(/\|/g, '/')} | ${where(f)} | ${names.length} | ${names.slice(0, 3).join(', ')}${names.length > 3 ? ' …' : ''} | ${flags || '-'} |`; };
  const used = new Set(), L = [];
  const total = Object.keys(sk).length + data.tr.length;
  L.push('# Every effect on Maps 0-20', '', '_Generated by `node tools/hub/effects_0_20.js` from the built game. Do not edit by hand._', '',
    `Every skill and trigger effect on a card that a Maps 0-20 list holds: the 21 main lists, their side maps and Specials (${data.lists.length} lists), Level skills included (Ln); numbers in a text are the first carrier's. **${Object.keys(sk).length}** skills and **${data.tr.length}** trigger effects (**${total}** in all). "First seen" is the earliest list holding a carrier; "New!" is the map that introduces it in the map skill table; "Undercroft only" means only The Undercroft (the endless dungeon under Map 11) holds it.`, '');
  const head = ['| Effect | What it does (game text) | First seen | Cards | Examples | Notes |', '|---|---|---|---|---|---|'];
  GROUPS.forEach(([title, keys]) => { const rows = keys.split(' ').filter(k => sk[k]).map(k => { used.add(k); return sk[k]; });
    if (!rows.length) return; rows.sort((a, b) => first(a.cards).n - first(b.cards).n); L.push(`## ${title} (${rows.length})`, '', ...head, ...rows.map(row), ''); });
  const rest = Object.values(sk).filter(s => !used.has(s.key)); if (rest.length) L.push(`## Other (${rest.length})`, '', ...head, ...rest.map(row), '');
  L.push(`## Trigger effects (${data.tr.length})`, '', '| Trigger | Effect (game text) | First seen | Cards | Examples |', '|---|---|---|---|---|');
  data.tr.sort((a, b) => (TRIG_ICON[a.on] || a.on).localeCompare(TRIG_ICON[b.on] || b.on) || first(a.cards).n - first(b.cards).n).forEach(t => { const names = Object.keys(t.cards);
    L.push(`| ${TRIG_ICON[t.on] || t.on} | ${t.eg.replace(/\|/g, '/')} | ${where(first(t.cards))} | ${names.length} | ${names.slice(0, 3).join(', ')} |`); });
  fs.writeFileSync(OUT, L.join('\n') + '\n'); console.log('->', path.relative(ROOT, OUT), { skills: Object.keys(sk).length, triggers: data.tr.length, lists: data.lists.length, other: rest.map(s => s.key) });
})().catch(e => { console.error(e); process.exit(1); });
