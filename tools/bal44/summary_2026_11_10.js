#!/usr/bin/env node
// 2026-11-10 (package BAL44): BAL43's tool, adapted for 0-3, 3-2, 11-10, 16-1 and Sable Swampmire 6-* (main maps); output docs/balance/bal44/. BAL43's header: BAL42's tool. BAL42's header: BAL37's summary (tools/bal37/summary_2026_11_10.js, same rows) for BAL42's reads of The Glass Dunes and The Morel Hollow
// (main maps only): docs/balance/bal44/tune-2026-11-10.json (every fight read, before / after at 200 games on the road seeds, each tool's pick) and
// tests/bal44-pins-2026-11-10.json (the applied fights as arena_app.js now has them).
//   node tools/bal44/summary_2026_11_10.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), DIR = path.join(ROOT, 'docs', 'balance', 'bal44'), DIRS = ['exhaust', 'exhaust-r2', 'tune', 'tune-r2', 'pick'];
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const lineRe = /^\s*\{ ?key:\s*"([^"]+)",.*$/gm, lines = new Map(); { let x; while ((x = lineRe.exec(src))) if (!lines.has(x[1])) lines.set(x[1], x[0]); }
const rows = {};
for (const d of DIRS) { const dir = path.join(DIR, d); if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) { const x = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const r = rows[x.code] = rows[x.code] || { code: x.code, map: x.map, mapName: x.mapName, kind: x.kind, name: x.name, target: x.band.target, before200: x.before.win200, after200: null, reads: [] };
    r.reads.push({ tool: d, before200: x.before.win200, pick200: x.pick.win200, keep: x.keep, space: x.space, range: x.range, pick: { deck: x.pick.deck, leaders: x.pick.leaders, shieldOverride: x.pick.shieldOverride } }); } }
const pins = {};
for (const r of Object.values(rows)) {
  const l = lines.get(r.code) || '', applied = /2026-11-10 \(BAL44\): retuned/.test(l), kept = r.reads.filter(x => x.keep);
  // BAL37: the read applied is the kept one whose deck is the line's (several tools may keep a pick for one fight)
  const lineDeck = JSON.stringify(JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]), Object.keys(JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1])).sort());
  // BAL42: and whose leaders are the line's (18-6: the exhaust and the named pick kept the same deck, led by Antlion Pit / Komodo Warlord)
  const lineLeaders = JSON.stringify(JSON.parse((l.match(/leaders:(\[[^\]]*\])/) || [0, 'null'])[1]));
  const sameDeck = kept.filter(x => JSON.stringify(x.pick.deck, Object.keys(x.pick.deck).sort()) === lineDeck);
  // BAL43: and whose Shield is the line's (13-5: the exhaust kept the deck at Shield 0, the named pick the same deck at Shield 8)
  const lineShield = (l.match(/shieldOverride:(\d+)/) || [0, null])[1], sameShield = sameDeck.filter(x => (x.pick.shieldOverride == null ? null : String(x.pick.shieldOverride)) === lineShield);
  const used = sameShield.find(x => JSON.stringify(x.pick.leaders) === lineLeaders) || sameShield[0] || sameDeck.find(x => JSON.stringify(x.pick.leaders) === lineLeaders) || sameDeck[0] || kept[kept.length - 1];
  r.applied = applied; r.appliedFrom = applied ? used.tool : null; r.after200 = applied ? used.pick200 : r.before200;
  if (applied) pins[r.code] = { deck: JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]), leaders: JSON.parse((l.match(/leaders:(\[[^\]]*\])/) || [0, 'null'])[1]), shield: (l.match(/shieldOverride:(\d+)/) || [0, null])[1],
    hqHp: (l.split('/*')[0].match(/hqHp:(\d+)/) || [0, null])[1], characterId: (l.split('/*')[0].match(/characterId:"([^"]+)"/) || [0, null])[1] };
}
const out = Object.values(rows).sort((a, b) => a.map.localeCompare(b.map) || a.code.localeCompare(b.code, 'en', { numeric: true }));
fs.writeFileSync(path.join(DIR, 'tune-2026-11-10.json'), JSON.stringify({ about: 'BAL44 road retune summary (tools/bal44/summary_2026_11_10.js); 200 games on the road seeds (9100 + 37g), the Map reference', rows: out }, null, 1) + '\n');
fs.writeFileSync(path.join(ROOT, 'tests', 'bal44-pins-2026-11-10.json'), JSON.stringify(pins, null, 1) + '\n');
out.forEach(r => console.log(r.code.padEnd(8), 't', String(r.target).padEnd(5), r.before200, '->', r.after200, r.applied ? 'APPLIED' : ''));
