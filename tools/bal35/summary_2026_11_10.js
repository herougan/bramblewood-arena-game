#!/usr/bin/env node
// 2026-11-10 (package BAL35): one summary of the retune (docs/balance/bal35/tune-2026-11-10.json: every fight read, before / after at 200
// games on the road seeds, the tool that kept it, its moves) and the pins of the retuned fights (tests/bal35-pins-2026-11-10.json, read from
// arena_app.js after the apply).
//   node tools/bal35/summary_2026_11_10.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), DIR = path.join(ROOT, 'docs', 'balance', 'bal35');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const lineRe = /^\s*\{ ?key:\s*"([^"]+)",.*$/gm, lines = new Map(); { let x; while ((x = lineRe.exec(src))) if (!lines.has(x[1])) lines.set(x[1], x[0]); }
const keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
const rows = {};
for (const d of ['tune', 'space', 'exhaust', 'tune-r2', 'exhaust-r2']) { const dir = path.join(DIR, d); if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) { const x = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const r = rows[x.code] = rows[x.code] || { code: x.code, map: x.map, mapName: x.mapName, kind: x.kind, name: x.name, target: x.band.target, before200: null, after200: null, reads: [] };
    if (['tune', 'space', 'exhaust'].includes(d) && r.before200 == null) r.before200 = x.before.win200;
    r.reads.push({ tool: d, before200: x.before.win200, pick200: x.pick.win200, keep: x.keep, space: x.space, range: x.range }); } }
const pins = {};
for (const r of Object.values(rows)) {
  const l = lines.get(r.code) || '', deck = JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]);
  const kept = r.reads.filter(x => x.keep), applied = /2026-11-10 \(BAL35\): retuned/.test(l);
  r.applied = applied; r.after200 = applied ? kept[kept.length - 1].pick200 : r.before200;
  if (applied) pins[r.code] = { deck, leaders: JSON.parse((l.match(/leaders:(\[[^\]]*\])/) || [0, 'null'])[1]), shield: (l.match(/shieldOverride:(\d+)/) || [0, null])[1],
    hqHp: (l.split('/*')[0].match(/hqHp:(\d+)/) || [0, null])[1], characterId: (l.split('/*')[0].match(/characterId:"([^"]+)"/) || [0, null])[1] };
}
const out = Object.values(rows).sort((a, b) => a.map.localeCompare(b.map) || a.code.localeCompare(b.code, 'en', { numeric: true }));
fs.writeFileSync(path.join(DIR, 'tune-2026-11-10.json'), JSON.stringify({ about: 'BAL35 road retune summary (tools/bal35/summary_2026_11_10.js); 200 games on the road seeds (9100 + 37g), the Map reference', rows: out }, null, 1) + '\n');
fs.writeFileSync(path.join(ROOT, 'tests', 'bal35-pins-2026-11-10.json'), JSON.stringify(pins, null, 1) + '\n');
out.forEach(r => console.log(r.code.padEnd(8), 't', String(r.target).padEnd(5), r.before200, '->', r.after200, r.applied ? 'APPLIED' : ''));
