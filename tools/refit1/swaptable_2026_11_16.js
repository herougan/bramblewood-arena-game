#!/usr/bin/env node
// 2026-11-16 (package REFIT1): the attribution table from the swap runs. Each group run (docs/balance/refit1/swap/skirmish-pass-refit1-gN.jsonl)
// plays the post-fold road with the group's cards at their pre-fold definition; a group's cards never share a fight, so a fight's move
// (group read - post-fold read, seed 7300, 400 games) belongs to the one group card in it. Per card: fights moved by 5+ points, the sum and
// the largest move, and on which side it sits (enemy deck / leader / the reference deck). Writes markdown to stdout and JSON to --json.
//   node tools/refit1/swaptable_2026_11_16.js --groups <groups.jsonl> --attr <attr.json> [--json out.json]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const rows = f => fs.readFileSync(path.resolve(ROOT, f), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const byKey = f => Object.fromEntries(rows(f).map(r => [r.key, r]));
const post = byKey('docs/balance/skirmish-pass-fold5-s7300.jsonl'), pre = byKey('docs/balance/refit1/measure-prefold-s7300.jsonl');
const attr = JSON.parse(fs.readFileSync(arg('--attr'), 'utf8'));
const groups = fs.readFileSync(arg('--groups'), 'utf8').trim().split('\n').map(JSON.parse);
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const sideOf = (key, id) => { const r = post[key], m = B.MAPS.find(x => x.id === r.map), n = m.nodes.find(x => x.key === key); G.NODE_MAP_HINT.set(n, m.id);
  const s = []; if ((n.deck || {})[id]) s.push('enemy'); if ((G.skirmishLeadersOf(n, m.id) || []).includes(id)) s.push('leader'); if (G.referenceDeckFor(m.id, n).deck[id]) s.push('ref'); return s.join('+'); };
const card = {}, missing = [];
for (const g of groups) {
  const f = path.join(ROOT, 'docs/balance/refit1/swap', `skirmish-pass-refit1-g${g.g}.jsonl`); if (!fs.existsSync(f)) { missing.push(g.g); continue; }
  const gr = byKey(f);
  for (const key of Object.keys(gr)) { if (!post[key] || !post[key].curve) continue;
    const id = g.cards.find(c => sideOf(key, c)); if (!id) continue;
    const mv = Math.round((gr[key].win - post[key].win) * 10) / 10;
    (card[id] = card[id] || { id, change: attr.changed[id], fights: [] }).fights.push({ key, side: sideOf(key, id), mv, post: post[key].win, pre: pre[key] ? pre[key].win : null, target: post[key].target }); }
}
const r1 = x => Math.round(x * 10) / 10;
const list = Object.values(card).map(c => { const big = c.fights.filter(x => Math.abs(x.mv) >= 5);
  return Object.assign(c, { n5: big.length, lost: r1(big.filter(x => x.mv > 0).reduce((t, x) => t + x.mv, 0)), gained: r1(-big.filter(x => x.mv < 0).reduce((t, x) => t + x.mv, 0)),
    abs5: r1(big.reduce((t, x) => t + Math.abs(x.mv), 0)), max: c.fights.reduce((b, x) => Math.abs(x.mv) > Math.abs(b.mv) ? x : b, { mv: 0 }) }); })
  .sort((x, y) => y.abs5 - x.abs5 || y.n5 - x.n5);
// mv = read with the card at its pre-fold stats - post-fold read: > 0 means the edit made the fight harder for the player
const out = ['| # | Card | FOLD5 change | Where it sits | Fights moved 5+ | Win % lost (harder) | Win % gained (easier) | Largest: fight, post-fold → with the old card |', '|---|---|---|---|---|---|---|---|'];
let rank = 0;
for (const c of list) { if (!c.n5) continue; const where = [...new Set(c.fights.filter(x => Math.abs(x.mv) >= 5).map(x => x.side))].join(', ');
  out.push(`| ${++rank} | ${c.id} | ${c.change} | ${where} | ${c.n5} | ${c.lost ? '-' + c.lost : 0} | ${c.gained ? '+' + c.gained : 0} | ${c.max.key}: ${c.max.post} → ${r1(c.max.post + c.max.mv)} |`); }
const quiet = list.filter(c => !c.n5).map(c => c.id);
out.push('', `Under 5 points in every fight it sits in: ${quiet.join(', ') || 'none'}.` + (missing.length ? ` Groups not read yet: ${missing.join(', ')}.` : ''));
// per fight (beyond 10 post-fold): the changed cards in it and each one's swap move
const mvOf = {}; list.forEach(c => c.fights.forEach(x => { mvOf[x.key + '|' + c.id] = x.mv; }));
const fmt = (key, es) => es.map(e => `${e.id}${e.k === 'leader' ? ' (leader)' : ' x' + e.k} ${e.ch}` + (mvOf[key + '|' + e.id] != null ? ` [${mvOf[key + '|' + e.id] > 0 ? '-' : '+'}${Math.abs(mvOf[key + '|' + e.id])}]` : '')).join('; ') || '-';
out.push('', '| Fight | Pre-fold → post-fold (target) | Changed cards in the enemy deck / leader [the edit\'s win % move] | Changed cards in the reference deck [move] |', '|---|---|---|---|');
for (const f of attr.fights) out.push(`| ${f.key} | ${f.pre} → ${f.win} (${f.target}) | ${fmt(f.key, f.enemy)} | ${fmt(f.key, f.mine)} |`);
console.log(out.join('\n'));
if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(list, null, 1));
