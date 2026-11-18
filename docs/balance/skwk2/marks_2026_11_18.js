// SKWK2 scratch: protocol marks per map from pro-ease files (args: pro-skirmishes.json, ease files...)
const fs = require('fs'); const [proF, ...files] = process.argv.slice(2);
const pro = JSON.parse(fs.readFileSync(proF, 'utf8')); const rows = {};
files.forEach(f => JSON.parse(fs.readFileSync(f, 'utf8')).rows.forEach(r => { (rows[r.id] = rows[r.id] || []).push(r); }));
const pct = x => x == null ? '  -  ' : (100 * x).toFixed(0).padStart(3) + '%';
const tot = { maps: 0, skOk: 0, skLadOk: 0, wkMaps: 0, wkOk: 0, wkLadOk: 0, allOk: 0 }; const json = {};
Object.entries(pro.maps).filter(([id, m]) => m.map <= 20).sort((a, b) => a[1].map - b[1].map || (a[1].side ? 1 : 0) - (b[1].side ? 1 : 0)).forEach(([id, m]) => {
  const sk = (m.bpro && m.bpro.length ? m.bpro : m.pro) || [], wk = m.wpro || [];
  const lad = ds => { const rs = [].concat(...ds.map(e => (rows[e.id] || []).filter(r => /^ladder-/.test(r.ref)))); return rs.length ? rs.reduce((t, r) => t + r.losses, 0) / rs.reduce((t, r) => t + r.n, 0) : null; };
  const mref = e => { const rs = (rows[e.id] || []).filter(r => r.ref === 'map'); return rs.length ? rs.reduce((t, r) => t + r.wins, 0) / rs.reduce((t, r) => t + r.n, 0) : null; };
  const deckLad = e => lad([e]);
  const strong = (m.pro || []).concat(m.bpro || []); const skW = strong.filter(e => mref(e) != null && mref(e) > 0.85).map(e => e.id);
  const wkS = wk.filter(e => mref(e) != null && mref(e) < 0.5).map(e => e.id);
  const sl = lad(sk), wl = lad(wk); const skBand = sl != null && sl >= 0.15 && sl <= 0.30, wkBand = wl != null && wl >= 0.15 && wl <= 0.30;
  tot.maps++; if (!skW.length) tot.skOk++; if (skBand) tot.skLadOk++; if (wk.length) { tot.wkMaps++; if (!wkS.length) tot.wkOk++; if (wkBand) tot.wkLadOk++; }
  if (!skW.length && skBand && !wkS.length) tot.allOk++;
  const short = e => e.id.replace(/^.*-((?:B|W)?PRO-\d)$/, '$1');
  json[id] = { no: m.map, side: !!m.side, skTooWeak: skW, skVsLadder: sl, wkTooStrong: wkS, wkVsLadder: wl,
    decks: Object.fromEntries(strong.concat(wk).map(e => [e.id, { mapRef: mref(e), vsLadder: deckLad(e) }])) };
  console.log(`${id.padEnd(5)} ${String(m.map + (m.side ? 's' : '')).padEnd(4)} SKweak:${skW.length ? 'FAIL' : 'ok  '} SKlad:${pct(sl)}${skBand ? ' ok ' : ' OUT'} WKstrong:${wk.length ? (wkS.length ? 'FAIL' : 'ok  ') : 'none'} WKlad:${pct(wl)}${wkBand ? ' ok ' : ' OUT'} | ${strong.map(e => short(e) + ':' + pct(mref(e)).trim() + '/' + pct(deckLad(e)).trim()).join(' ')} | ${wk.map(e => short(e) + ':' + pct(mref(e)).trim() + '/' + pct(deckLad(e)).trim()).join(' ')}`);
});
console.log(JSON.stringify(tot));
if (process.env.MARKS_OUT) fs.writeFileSync(process.env.MARKS_OUT, JSON.stringify({ about: 'SKWK2 protocol marks (ref = Map reference win rate vs each deck; vsLadder = the deck\'s win rate vs the 10 ladder decks)', files, totals: tot, maps: json }, null, 1) + '\n');
