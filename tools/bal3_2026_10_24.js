#!/usr/bin/env node
// Package BAL3 (2026-10-24, owner 12:02 on BAL2-3: "use our agreed philosophy and schedule, not my balancing"): the road retune's data steps.
//   node tools/bal3_2026_10_24.js apply [--fixes=bal3-curve-fixes-2026-10-24] [--dry]
//        writes each tuned deck of docs/balance/<fixes>.jsonl (tools/skirmish_pass.js curve --all --decks-only --keep-leaders --pool
//        --distinct) into its fight in arena_app.js, with a dated note; a fight key must be unique on the map's node lines (refused otherwise)
//   node tools/bal3_2026_10_24.js report --before=<tag> --after=<tag> [--pd-before=<tag> --pd-after=<tag>]
//        the before / after table of Maps 0-24 (and the Pale Desert) from two `measure` files: docs/balance/bal3-road-2026-10-24.json + .md.
//        A challenge skirmish counts against its road-curve target minus 10 (DF3-1); every other fight against the game's band.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), APP = path.join(ROOT, 'arena_app.js'), OUT = path.join(ROOT, 'docs', 'balance');
const argv = process.argv.slice(2), CMD = argv[0];
const opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const readJsonl = f=>{ try{ return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } };

if(CMD === 'apply'){
  const fixes = readJsonl(path.join(OUT, opt('fixes', 'bal3-curve-fixes-2026-10-24') + '.jsonl')).filter(x=> x.deck && (x.moves || []).length);
  let s = fs.readFileSync(APP, 'utf8'), n = 0;
  for(const x of fixes){
    const tag = '{ key:"' + x.key + '"', at = s.indexOf(tag);
    if(at < 0 || s.indexOf(tag, at + 1) >= 0){ console.log('  not unique / not found', x.key); continue; }
    const eol = s.indexOf('\n', at), ds = s.indexOf('deck:{', at); if(ds < 0 || ds > eol){ console.log('  no deck on the line', x.key); continue; }
    const de = s.indexOf('}', ds) + 1;
    const note = ` /* 2026-10-24 (BAL3, BAL2-3): deck retuned toward the road curve${x.role === 'challenge' ? ' (challenge: target minus 10)' : ''}, ${x.trail[0].win}% -> ${x.after.win}% at 50 tune games, target ${Math.round(x.target)} (tools/skirmish_pass.js curve --all --decks-only --keep-leaders --pool --distinct) */`;
    s = s.slice(0, ds) + 'deck:' + JSON.stringify(x.deck) + note + s.slice(de); n++;
    console.log(`${(x.code || x.key).padEnd(8)} ${String(x.trail[0].win).padStart(5)} -> ${String(x.after.win).padStart(5)} (target ${Math.round(x.target)})  ${x.moves.map(m=> m.type + ' ' + (m.out || '') + (m.inn ? ' -> ' + m.inn : '') + ' x' + (m.kIn || m.k)).join('; ')}`);
  }
  if(!argv.includes('--dry')){ fs.writeFileSync(APP, s); console.log('applied', n, 'decks to arena_app.js'); } else console.log('dry run:', n, 'decks');
}

if(CMD === 'report'){
  const B = require('./lib_bramble.js'), G = B.G;
  const band = r=>{ const m = G.CONQUEST_MAPS.find(x=> x.id === r.map), n = m && m.nodes.find(x=> x.key === r.key); G.NODE_MAP_HINT.set(n, m.id);
    const b = G.skirmishTargetBand(m.id, n); if(n.challenge && b.curve){ const t = b.t - 0.10; return {t, lo: t - 0.08, hi: t + 0.08, role: 'challenge'}; } return b; };
  const verdict = (r, b)=> r.win > b.hi * 100 + 1e-9 ? 'easy' : r.win < b.lo * 100 - 1e-9 ? 'hard' : 'green';
  const load = tag=> new Map(readJsonl(path.join(OUT, `skirmish-pass-${tag}.jsonl`)).map(r=> [r.map + ':' + r.key, r]));
  const table = (bt, at)=>{ const bf = load(bt), af = load(at), rows = [];
    for(const [k, a] of af){ const b = bf.get(k), bd = band(a); rows.push({code: a.code, name: a.name, map: a.map, mapNo: a.mapNo, mapName: a.mapName, kind: a.kind, role: bd.role,
      target: Math.round(bd.t * 1000) / 10, lo: Math.round(bd.lo * 1000) / 10, hi: Math.round(bd.hi * 1000) / 10, before: b ? b.win : null, after: a.win, vb: b ? verdict(b, bd) : null, va: verdict(a, bd)}); }
    rows.sort((x, y)=> x.mapNo - y.mapNo || (x.code < y.code ? -1 : 1)); return rows; };
  const sum = rows=> ({fights: rows.length, greenBefore: rows.filter(r=> r.vb === 'green').length, greenAfter: rows.filter(r=> r.va === 'green').length,
    easyAfter: rows.filter(r=> r.va === 'easy').length, hardAfter: rows.filter(r=> r.va === 'hard').length});
  const main = table(opt('before'), opt('after')), pd = opt('pd-after') ? table(opt('pd-before'), opt('pd-after')) : [];
  const res = {_about: 'Package BAL3 (2026-10-24): the road after the retune (tools/skirmish_pass.js measure 100, seeds 9100 + 37g, the reference deck). A challenge skirmish counts against its road-curve target minus 10 (DF3-1).',
    before: opt('before'), after: opt('after'), main: sum(main), paleDesert: pd.length ? sum(pd) : null, rows: main.concat(pd)};
  fs.writeFileSync(path.join(OUT, 'bal3-road-2026-10-24.json'), JSON.stringify(res, null, 1) + '\n');
  const mean = a=> a.length ? Math.round(a.reduce((x, y)=> x + y, 0) / a.length) : '';
  let md = '| Map | Name | Fights | Green before | Green after | Too easy after | Too hard after | Mean win before | Mean win after | Mean target |\n|---|---|---|---|---|---|---|---|---|---|\n';
  const groups = new Map(); main.concat(pd).forEach(r=>{ const k = r.map === 'mpd' ? 'PD' : r.mapNo; if(!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });
  for(const [k, rs] of groups){ md += `| ${k} | ${rs[0].map === 'mpd' ? 'The Pale Desert' : rs[0].mapName} | ${rs.length} | ${rs.filter(r=> r.vb === 'green').length} | ${rs.filter(r=> r.va === 'green').length} | ${rs.filter(r=> r.va === 'easy').length} | ${rs.filter(r=> r.va === 'hard').length} | ${mean(rs.map(r=> r.before).filter(x=> x != null))}% | ${mean(rs.map(r=> r.after))}% | ${mean(rs.map(r=> r.target))}% |\n`; }
  const S = res.main; md += `| | **Maps 0-24** | ${S.fights} | **${S.greenBefore}** | **${S.greenAfter}** | ${S.easyAfter} | ${S.hardAfter} | | | |\n`;
  md += '\n| Fight | Kind | Target (band) | Before | After |\n|---|---|---|---|---|\n';
  main.concat(pd).forEach(r=>{ md += `| ${r.code} ${r.name} | ${r.role === 'challenge' ? 'challenge' : r.kind} | ${r.target} (${r.lo}-${r.hi}) | ${r.before}%${r.vb && r.vb !== 'green' ? ' (' + r.vb + ')' : ''} | ${r.after}%${r.va !== 'green' ? ' (' + r.va + ')' : ''} |\n`; });
  { const f = path.join(OUT, 'bal3-road-table-2026-10-24.md'); let head = ''; try{ const old = fs.readFileSync(f, 'utf8'), i = old.indexOf('| Map |'); if(i > 0) head = old.slice(0, i); }catch(e){} fs.writeFileSync(f, head + md); } // the header (hand-written) is kept
  console.log(JSON.stringify({main: res.main, paleDesert: res.paleDesert}));
}
