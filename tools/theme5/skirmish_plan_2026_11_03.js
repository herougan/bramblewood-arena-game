#!/usr/bin/env node
// 2026-11-03 (package THEME5, owner 11-03 09:39: "If we have 3, we can scatter 3 of these slightly down-tuned peak deck strategies in 3
// skirmishes then the rest we have a random and weaker blend"): READ-ONLY plan for the later deck-optimisation step (nothing is applied).
// Per map list: the 3 strategies (the proposed THEME5 archetypes first, then the map's BPRO decks by rank, then its PRO decks, each a
// different focus) and the 3 fights that get them. Fights: the map's non-boss fights in road order (boss / miniboss / world boss / dungeon
// and the first fight are left out when 3 others remain); three spread picks (the second fight's slot, the middle, the last before the
// boss). The strongest strategy (BPRO-1's when it has one) takes the latest (hardest) slot, the new archetypes the earlier two. Writes
// docs/balance/theme5/skirmish-plan-2026-11-03.json and prints the markdown rows. Run after carried_data_2026_11_03.js.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const rd = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const data = rd('docs/balance/theme5/carried-data-2026-11-03.json'), picks = rd('docs/balance/theme5/carried-picks-2026-11-03.json').picks;
const D = {}; rd('canonical/cards.json').forEach(c => { D[c.id] = c; });
const nm = id => (D[id] || {}).name || id;
const BOSS = /boss|dungeon/;
const out = [], md = [];
for (const l of data.lists) {
  const ord = f => { const m = String(f.code).match(/-(\d+)$/); return m ? +m[1] : 0; };
  const all = l.fights.slice().sort((a, b) => ord(a) - ord(b)), last = all[all.length - 1];
  // the map's last fight is its ender (boss band 30-49%) even when its kind says skirmish / elite (Map 0's 0-4, Map 1's 1-5)
  const isBoss = f => BOSS.test(f.kind || '') || (f === last && f.target != null && f.target <= 50);
  const fights = all.filter(f => !isBoss(f));
  const pool = fights.length > 3 ? fights.slice(1) : fights.slice();
  const pick = pool.length <= 3 ? pool.slice() : [pool[0], pool[Math.floor((pool.length - 1) / 2)], pool[pool.length - 1]].filter((f, i, a) => a.indexOf(f) === i);
  const strat = [];
  picks.filter(p => p.map === l.id).forEach(p => strat.push({ kind: 'new', name: p.archetype + ' (+' + nm(p.card) + ')' }));
  const seenFocus = new Set();
  const ranked = l.decks.filter(d => d.kind === 'bpro').concat(l.decks.filter(d => d.kind === 'pro'));
  for (const d of ranked) { if (strat.length >= 3) break; if (seenFocus.has(d.focus)) continue; seenFocus.add(d.focus);
    const lead = (d.leaders && d.leaders[0]) || Object.entries(d.deck).sort((a, b) => b[1] - a[1])[0][0];
    strat.push({ kind: d.kind, id: d.id, name: d.id + ' ' + d.focus + ' (' + nm(lead) + ')' }); }
  while (strat.length < 3) strat.push({ kind: 'tbd', name: l.decks.length ? 'a third focus from the next bench / deckopt run (the map has ' + strat.filter(s => s.kind !== 'new').length + ' distinct BPRO / PRO focus)' : 'the strongest BPRO the deck step builds (no PRO / BPRO decks past Map 20 yet)' });
  // the strongest existing (first bpro, else first pro) goes last; new archetypes fill the earlier slots
  const order = strat.filter(s => s.kind === 'new').concat(strat.filter(s => s.kind !== 'new').reverse());
  const placed = pick.map((f, i) => ({ fight: f.code, kind: f.kind, target: f.target, strategy: (order[i] || {}).name }));
  out.push({ id: l.id, label: l.label, name: l.name, fights: l.fights.map(f => f.code + ' ' + f.kind + (f.target != null ? ' ' + f.target : '')), placed, rest: fights.filter(f => !placed.some(p => p.fight === f.code)).map(f => f.code) });
  md.push(`| ${l.label} ${l.name} | ${placed.map(p => `${p.fight} (${p.kind}, ${p.target == null ? '-' : p.target}%): ${p.strategy}`).join('<br>')} | ${out[out.length - 1].rest.join(', ') || '-'} |`);
}
fs.writeFileSync(path.join(ROOT, 'docs/balance/theme5/skirmish-plan-2026-11-03.json'), JSON.stringify({ about: 'THEME5 skirmish plan (proposal; tools/theme5/skirmish_plan_2026_11_03.js)', built: '2026-11-03', maps: out }, null, 1));
console.log(md.join('\n'));
