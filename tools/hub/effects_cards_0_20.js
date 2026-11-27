#!/usr/bin/env node
// 2026-11-27 (owner 09:47: "I want a tab for every effect used on a per card basis from map0-20, including faction cards unlocked from
// 0-20, and packs, starter, etc, within 0-20 progression ... a very short summary for ALL symbols used, and the count. Then ... a
// -everycomboused table. It will ONLY present combinations that ARE used. Include 2 new symbols JUST for this purpose: glass cannon (low
// defence), and wall (no attack) ... Anyway, then the list of triggers table as well. Now, list all combos used (dont list glass cannons and
// walls first). E.g. Tide + Diurnal - 3, Tide + Crab Claw - 2 ... If 0, don't need to include."):
// the pool is every collectible card a player can get by Map 20 (the game's own cardObtainMap <= 20: map lists, side maps that open by
// Map 20, Specials, Packs 1-3, the faction pack, starters, rewards, the Nest / Smith / Mystery / raid sources), read inside the built game.
// A card's symbols are its effects at every level (Level skills included; grants and shot parameters fold into their skill), its trigger
// effects (trigger + action), and two tags only for this view: 🥂 Glass cannon (Health no more than Attack at Level 0, about the frailest 6% of the pool) and 🚫 Wall (Attack 0).
// Writes docs/effects-cards-0-20.md (generated; the hub's 🧩 Effects tab shows it).   node tools/hub/effects_cards_0_20.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), OUT = path.join(ROOT, 'docs', 'effects-cards-0-20.md');
const FOLD = { diurnalGrant: 'diurnal', nocturnalGrant: 'nocturnal', stormGrant: 'storm', tideGrant: 'tide', deliveryRes: 'delivery', arrowBramble: 'arrow', hunterVs: 'hunter' };
const TRIG = { onSpawn: ['⬆️', 'On Play'], onDeath: ['💀', 'On Death'], onAttack: ['⚔️', 'On Attack'], onAttacked: ['🛡', 'On Attacked'], onReady: ['✅', 'On Ready'], onKill: ['🎯', 'On Kill'], onHealed: ['💚', 'On Nursed'], onAction: ['🔁', 'On Action'], perTurn: ['🔁', 'Every Turn'], onPitch: ['🃏', 'On Pitch'], onDiscard: ['🗑', 'On Discard'] };
const GROUPS = require('./effects_groups.js'); // 2026-11-27 (HUB5): the by-list view's sections
const TAGS = { glass: { icon: '🥂', label: 'Glass cannon' }, wall: { icon: '🚫', label: 'Wall' } };
(async () => {
  const pw = require('playwright'), b = await pw.chromium.launch(), p = await b.newPage();
  await p.goto('file://' + path.join(ROOT, 'index.html'));
  await p.waitForFunction(() => typeof cardObtainMap === 'function' && typeof skillText === 'function', null, { timeout: 90000 });
  const data = await p.evaluate(() => {
    try { adminModeEnabled = true; } catch (e) {}
    const defs = getCardDefs(), cards = [], info = {};
    Object.keys(defs).forEach(id => { const d = defs[id];
      if (!d || d.token || d.test || d.hero || d.hallOfFame || d.cardType === 'materia' || /^dev|^event/.test(d.rarity || '')) return;
      if (isEasterEgg(d) || isUnattainable(d)) return; const at = cardObtainMap(d); if (!(at <= 20)) return;
      const keys = new Set(), trig = new Set();
      const scan = eff => Object.keys(eff || {}).forEach(k => { const v = eff[k]; if (v == null || v === false || v === 0) return;
        if (k === 'triggers') return (v || []).forEach(t => { const tk = t.on + '>' + t.do; trig.add(tk);
          if (!info[tk]) { let txt = ''; try { txt = describeEffects({ id: 'x', name: 'x', effects: { triggers: [t] } }, null, { terse: true }).join(' / ').replace(/<[^>]*>/g, ''); } catch (e) {} info[tk] = { trig: true, on: t.on, do: t.do, eg: txt }; } });
        keys.add(k); if (!info[k]) { const pd = skillDefOf(k); info[k] = { label: pd ? pd.label : '', icon: SKILL_ICON[k] || '', known: !!pd }; } });
      scan(d.effects); Object.values(d.levelSkills || {}).forEach(scan);
      cards.push({ id, name: d.name, rarity: d.rarity || '', at, src: cardSourceOf(d).kind, a: +d.attack || 0, h: +d.health || 0, keys: [...keys], trig: [...trig] }); });
    return { cards, info, skillOrder: [].concat(typeof SKILL_DEFS !== 'undefined' ? SKILL_DEFS : [], PASSIVE_DEFS).map(x => x.key) };
  });
  await b.close();
  const info = data.info, sym = {}; // symbol id -> { icon, label, kind }
  const symOfKey = k => { const f = FOLD[k] || k, i = info[f] || info[k]; if (!i || !i.known) return null; return f; };
  data.cards.forEach(c => {
    const s = new Set(); c.keys.forEach(k => { const f = symOfKey(k); if (f) { s.add(f); if (!sym[f]) sym[f] = { icon: (info[f] || {}).icon || '', label: (info[f] || {}).label || f, kind: 'skill' }; } });
    c.trig.forEach(tk => { const i = info[tk], t = TRIG[i.on] || ['🔁', i.on], act = String(i.do || '').replace(/([A-Z])/g, ' $1').toLowerCase();
      if (!sym[tk]) sym[tk] = { icon: t[0], label: `${t[1]}: ${act}`, kind: 'trigger', eg: i.eg }; s.add(tk); });
    if (c.a === 0) s.add('wall'); else if (c.h > 0 && c.h <= c.a) s.add('glass'); // items with 0 Health (Quill Spear ...) are not glass cannons
    c.syms = [...s]; });
  Object.assign(sym, { glass: Object.assign({ kind: 'tag' }, TAGS.glass), wall: Object.assign({ kind: 'tag' }, TAGS.wall) });
  const byLabel = {}; Object.keys(sym).forEach(k => { (byLabel[sym[k].label] = byLabel[sym[k].label] || []).push(k); });
  Object.values(byLabel).filter(ks => ks.length > 1).forEach(ks => ks.forEach(k => { sym[k].label += ` (${k})`; })); // two skills share a label (Loyal)
  const count = {}; data.cards.forEach(c => c.syms.forEach(s => { count[s] = (count[s] || 0) + 1; }));
  const nm = s => `${sym[s].icon} ${sym[s].label}`.trim(), order = (x, y) => (count[y] - count[x]) || nm(x).localeCompare(nm(y));
  // 2026-11-28 (HUB6, owner 03:07: "separate the combo column into skill 1 column (spans) and then sub rows in col 2 ... Skills have id so follow that precedence. If flying and venomous showed up, no need venomous and flying"):
  // id precedence = the game's own skill order (SKILL_DEFS then PASSIVE_DEFS, the list skillDefOf searches), trigger effects after skills (TRIG order, then action), the two tags last.
  // A pair or kit is listed once, in that order (Flying + Venomous, never Venomous + Flying), as an HTML table with rowspan: one column per level of the tree.
  const kord = data.skillOrder, tkeys = Object.keys(TRIG), rank = s => sym[s].kind === 'tag' ? 3000 + (s === 'wall') : sym[s].kind === 'trigger' ? 1000 + tkeys.indexOf(info[s].on) * 40 + (s.charCodeAt(s.indexOf('>') + 1) % 40) : (kord.indexOf(s) < 0 ? 999 : kord.indexOf(s)),
    byRank = (x, y) => (rank(x) - rank(y)) || nm(x).localeCompare(nm(y)), E = x => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const treeTable = (items, heads, last) => { // items: { path: [symbols in id order], n, which? }; a node cell spans its subtree; a kit that ends on a node gets its own row (empty cells to the count)
    const root = { ch: {}, own: null }; let D = 1; items.forEach(it => { let nd = root; D = Math.max(D, it.path.length); it.path.forEach(k => { nd = nd.ch[k] = nd.ch[k] || { ch: {}, own: null }; }); nd.own = it; });
    const tail = it => `<td class="n">${it.n}</td>` + (last ? `<td>${E(it.which || '')}</td>` : '');
    const walk = (nd, d) => { const out = []; Object.keys(nd.ch).sort(byRank).forEach(k => { const c = nd.ch[k], sub = [];
        if (c.own) sub.push((d < D ? `<td colspan="${D - d}" class="n">only these</td>` : '') + tail(c.own)); walk(c, d + 1).forEach(r => sub.push(r));
        sub.forEach((r, i) => out.push(i ? r : `<td rowspan="${sub.length}">${E(nm(k))}</td>` + r)); }); return out; };
    return `<table class="fx-tree"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${walk(root, 1).map(r => '<tr>' + r + '</tr>').join('')}</tbody></table>`; };
  const isTag = s => s === 'glass' || s === 'wall';
  const multi = (rows, per) => { const out = []; for (let i = 0; i < rows.length; i += per) out.push('| ' + rows.slice(i, i + per).map(r => r.join(' | ')).concat(Array(Math.max(0, per - Math.min(per, rows.length - i))).fill(' |  ')).join(' | ') + ' |'); return out; };
  const L = [], src = {}; data.cards.forEach(c => { src[c.src] = (src[c.src] || 0) + 1; });
  L.push('# Every effect, card by card (Maps 0-20 progression)', '', '_Generated by `node tools/hub/effects_cards_0_20.js` from the built game. Do not edit by hand._', '',
    `**${data.cards.length} cards** a player can collect by Map 20 (the game's own obtain map, ≤ 20): ${Object.entries(src).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ')}. ` +
    'A card counts every effect it has at any level (Level skills included) and each trigger effect. Two tags exist only in this view: ' +
    '🥂 **Glass cannon** (Health no more than Attack at Level 0: the frailest ~6%) and 🚫 **Wall** (Attack 0).', '');
  // 1. by section (2026-11-27 HUB5, owner 18:37: "where's my list of skills and combos and count for each section in design?"): the same sections as the by-list
  // view (effects_groups.js), then Trigger effects, then the two tags. Each: its symbols with card counts, a section total, and its pairs (a pair that holds one
  // of its symbols), most used first, pairs with 🥂 / 🚫 last.
  const skills = Object.keys(sym).filter(s => sym[s].kind === 'skill' && count[s]).sort(order), trigs = Object.keys(sym).filter(s => sym[s].kind === 'trigger' && count[s]).sort(order);
  const pairs = {}; data.cards.forEach(c => { const s = c.syms.slice().sort(byRank); for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) { const k = s[i] + '|' + s[j]; pairs[k] = (pairs[k] || 0) + 1; } });
  const pl = Object.entries(pairs).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])), main = pl.filter(([k]) => !k.split('|').some(isTag)), tagged = pl.filter(([k]) => k.split('|').some(isTag));
  const pr = ([k, n]) => [k.split('|').map(nm).join(' + '), String(n)];
  const sections = GROUPS.map(([t, ks]) => [t, ks.split(' ').filter(k => skills.includes(k))]);
  const listed = new Set([].concat(...sections.map(x => x[1]))), other = skills.filter(k => !listed.has(k)); if (other.length) sections.push(['Other (pack and faction cards, not on a map list)', other]);
  sections.push(['Trigger effects', trigs], ['The two tags (only in this view)', ['glass', 'wall']]);
  const per = 5, head = n => ['| ' + Array(n).fill('Symbol | Cards').join(' | ') + ' |', '|' + Array(n).fill('---|---:').join('|') + '|'], phead = ['| ' + Array(3).fill('Pair | Cards').join(' | ') + ' |', '|' + Array(3).fill('---|---:').join('|') + '|'];
  L.push(`## 1. By section: skills, counts and pairs (${skills.length} skills, ${trigs.length} trigger effects, 2 tags)`, '',
    'Sections as in the by-list view. Each lists its symbols with how many cards carry them, a section total, and the pairs that include one of its symbols (most used first; pairs with 🥂 / 🚫 last). A pair across two sections shows in both.', '');
  const secTot = [], totAt = L.length; // the totals table goes first inside section 1
  sections.forEach(([title, ks]) => { if (!ks.length) return; const set = new Set(ks), cards = data.cards.filter(c => c.syms.some(x => set.has(x))).length, uses = ks.reduce((a, x) => a + (count[x] || 0), 0);
    const has = ([k]) => k.split('|').some(x => set.has(x)), pm = main.filter(has), pt = tagged.filter(has); secTot.push([title, ks.length, cards]);
    L.push(`### ${title} (${ks.length} ${ks.length === 1 ? 'symbol' : 'symbols'}, ${cards} cards)`, '', `**Section total:** ${ks.length} ${ks.length === 1 ? 'symbol' : 'symbols'}, ${uses} uses on ${cards} cards (a card with two of them counts once here); ${pm.length + pt.length} pairs (${pt.length} with 🥂 / 🚫).`, '',
      ...head(per), ...multi(ks.slice().sort(order).map(x => [nm(x), String(count[x] || 0)]), per), '');
    if (pm.length || pt.length) L.push(treeTable(pm.concat(pt).map(([k, n]) => ({ path: k.split('|'), n })), ['Skill 1', 'Skill 2', 'Cards']), ''); });
  // 2. every full combo used
  const combos = {}; data.cards.forEach(c => { const k = c.syms.slice().sort(byRank).join('+'); (combos[k] = combos[k] || []).push(c); });
  const cl = Object.entries(combos).sort((a, b) => b[1].length - a[1].length || b[0].split('+').length - a[0].split('+').length), maxK = Math.max(...cl.map(([k]) => k ? k.split('+').length : 0));
  L.push(`## 2. Every combo used (${cl.length} distinct; each card's whole kit)`, '', 'Grouped as a tree in skill-id order: skill 1 spans its rows, each next skill sits on a sub row. A kit appears once.', '');
  L.push(treeTable(cl.filter(([k]) => k).map(([k, cs]) => ({ path: k.split('+'), n: cs.length, which: cs.map(c => c.name).sort().join(', ') })), Array.from({ length: maxK }, (_, i) => 'Skill ' + (i + 1)).concat(['Cards', 'Which']), true));
  if (combos['']) L.push('', `_No effect at all: ${combos[''].length} cards (${combos[''].map(c => c.name).sort().join(', ')})._`);
  L.push('');
  // 3. triggers
  L.push(`## 3. Trigger effects (${trigs.length})`, '', '| Trigger effect | Cards | Game text (first carrier) | Which |', '|---|---:|---|---|');
  trigs.forEach(s => L.push(`| ${nm(s)} | ${count[s]} | ${(sym[s].eg || '').replace(/\|/g, '/')} | ${data.cards.filter(c => c.syms.includes(s)).map(c => c.name).sort().join(', ')} |`));
  L.push('');
  L.splice(totAt, 0, '### Section totals', '', '| Section | Symbols | Cards with at least one |', '|---|---:|---:|', ...secTot.map(r => `| ${r[0]} | ${r[1]} | ${r[2]} |`), '');
  fs.writeFileSync(OUT, L.join('\n') + '\n');
  console.log('->', path.relative(ROOT, OUT), { cards: data.cards.length, skills: skills.length, triggers: trigs.length, combos: cl.length, pairs: main.length, tagged: tagged.length, glass: count.glass || 0, wall: count.wall || 0, src,
    unknownKeys: [...new Set([].concat(...data.cards.map(c => c.keys)).filter(k => !symOfKey(k)))] });
})().catch(e => { console.error(e); process.exit(1); });
