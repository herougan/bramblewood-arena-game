#!/usr/bin/env node
// 2026-11-13 (package SIDE2, SIDE1 phase B step 2; owner 2026-11-12 23:50: "If the SK is too difficult - good, then make the most difficult
// mission of the map (usually the last) = SK but easier, till it hits our ease-level. If its the opposite, SK is too weak... we might have to
// rebalance the cards or redesign."): the SK anchor of each side map.
//   SK     = the map's BPRO-1 (canonical/pro-skirmishes.json, the strongest list-only deck), placed in the map's hardest road fight: the fight with
//            the lowest target (roadCurveTarget via skirmishTargetBand; ROAD_CURVE_ENDER names The Eye of the Volcano's), Volcano Lair (off the
//            curve, ROAD_CURVE_SKIP) its own lowest; the fight's leaders, bramble, Shield, rules and size kept; BPRO-1's copies scaled to the size
//            and made legal by SKIR1's deck rules (tools/skir1/build_2026_11_11.js fill: pool, K14, kept cards, caps), no down-tune.
//   Read   = the Map reference against it, --games (200) on the road seeds (9100 + 37g, the road measure's own games).
//   Verdict: under the band (too hard) -> the fight takes the SK deck and SKIR1's fit eases it into the band (copies and cards swapped down,
//            the fit's Shield moves); in the band -> anchored as is; over the band's top -> "cards too weak: rebalance or redesign" (the fight
//            still takes the SK deck, the hardest the list can make; no Shield or Health change).
//   node tools/side2/anchor_2026_11_13.js measure [--maps mo,mq] [--shard 0 --shards 2] [--games 200]  -> docs/balance/side2/anchor/<map>.json
//   node tools/side2/anchor_2026_11_13.js write [--maps ...]      writes the SK decks into arena_app.js (rebuild after); prints the fights to ease
//   node tools/side2/anchor_2026_11_13.js report                  -> docs/balance/side2/anchor-2026-11-13.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G;
const BLD = require('../skir1/build_2026_11_11.js'); // fill() only (its own commands are plan / apply / purge / pin, never ours)
const a = process.argv.slice(2), CMD = a[0] || 'report', arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const MAPS = arg('--maps', null) ? new Set(arg('--maps').split(',')) : null, SH = +arg('--shard', 0), NSH = +arg('--shards', 1), GAMES = +arg('--games', 200);
const DIR = path.join(ROOT, 'docs', 'balance', 'side2', 'anchor'), APP = path.join(ROOT, 'arena_app.js');
const PRO = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')).maps;
const sides = () => L.maps().filter(m => m.sub && (!MAPS || MAPS.has(m.id)));
function bandOf(m, n) { const b = G.skirmishTargetBand(m.id, n); if (!b) return null; const drop = n.challenge && b.curve ? 0.10 : 0; return { t: Math.round((b.t - drop) * 1000) / 10, lo: Math.round((b.t - drop - 0.08) * 1000) / 10, hi: Math.round((b.t - drop + 0.08) * 1000) / 10, curve: !!b.curve }; }
function hardest(m) { // lowest target; a tie goes to the later fight (the ender)
  const ns = L.fightsOf(m); let best = null;
  ns.forEach(n => { const b = bandOf(m, n); if (!b) return; if (!best || b.t <= best.b.t) best = { n, b }; }); return best;
}
function skDeck(m, n) {
  const e = PRO()[m.id] || {}, b1 = (e.bpro || [])[0]; if (!b1) return { none: 'no BPRO-1' };
  const f = L.fight(m, n), want = {}; Object.entries(b1.deck).forEach(([id, k]) => { if (f.pool.includes(id)) want[id] = k * f.S / 20; });
  let r = 0; const R = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  const d = BLD.fill(f, want, () => 1, R, null);
  return { bpro1: { id: b1.id, focus: b1.focus, deck: b1.deck }, offPool: Object.keys(b1.deck).filter(id => !f.pool.includes(id)), deck: d, problems: d ? [] : BLD.fill.last || [] };
}
function measure(m, n, deck, games, seed0) {
  const nn = Object.assign({}, n, { deck }); G.NODE_MAP_HINT.set(nn, m.id);
  const ctx = G.referenceFightSetup(m.id, nn, { seed0 }); let w = 0; for (let g = 0; g < games; g++) if (G.playReferenceGame(ctx, g).win) w++;
  return Math.round(w / games * 1000) / 10;
}
if (CMD === 'measure') {
  fs.mkdirSync(DIR, { recursive: true });
  sides().filter((m, i) => i % NSH === SH).forEach(m => {
    const out = path.join(DIR, m.id + '.json'); if (fs.existsSync(out) && !a.includes('--force')) return; // resumable
    const t0 = Date.now(), h = hardest(m); if (!h) { console.log(m.id, 'no fight on a target'); return; }
    const sk = skDeck(m, h.n), res = { map: m.id, name: m.name, code: h.n.key, kind: h.n.kind || 'skirmish', band: h.b, size: L.size(h.n.deck), current: { deck: h.n.deck }, games: GAMES };
    Object.assign(res, sk);
    if (sk.deck) {
      res.skWin = measure(m, h.n, sk.deck, GAMES, 9100);
      res.verdict = res.skWin < h.b.lo ? 'too-hard' : res.skWin > h.b.hi ? 'too-weak' : 'in-band';
      res.gap = Math.round((res.skWin - h.b.t) * 10) / 10;
    } else res.verdict = 'no-deck';
    res.sec = Math.round((Date.now() - t0) / 1000);
    fs.writeFileSync(out, JSON.stringify(res, null, 1) + '\n');
    console.log(`${m.id} ${h.n.key} target ${h.b.t} [${h.b.lo}-${h.b.hi}]: SK ${res.skWin}% -> ${res.verdict} | ${JSON.stringify(sk.deck)} | ${res.sec}s`);
  });
} else if (CMD === 'write') {
  let s = fs.readFileSync(APP, 'utf8'), k = 0; const ease = [];
  fs.readdirSync(DIR).filter(x => x.endsWith('.json')).map(x => JSON.parse(fs.readFileSync(path.join(DIR, x), 'utf8'))).filter(r => r.deck && (!MAPS || MAPS.has(r.map))).forEach(r => {
    const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${r.code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re); if (!mm) throw new Error('node not found ' + r.code);
    const cur = JSON.parse((mm[1].match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]), deck = Object.fromEntries(Object.keys(r.deck).sort().map(id => [id, r.deck[id]]));
    if (L.keyOf(cur) === L.keyOf(deck)) { if (r.verdict === 'too-hard') ease.push(r.code); return; }
    const why = r.verdict === 'too-hard' ? 'too hard, eased next by the fit' : r.verdict === 'in-band' ? 'in band as it stands' : 'still too easy: cards too weak (flagged), the hardest deck the list makes';
    s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck) + ` /* 2026-11-13 (SIDE2 SK anchor, owner 11-12 23:50): the map's hardest fight takes its BPRO-1 (${r.bpro1.id}, ${r.bpro1.focus}) scaled to the fight; Map reference ${r.skWin}% at ${r.games} games (target ${r.band.t}): ${why}; deck (was ${JSON.stringify(cur)}) */`));
    k++; if (r.verdict === 'too-hard') ease.push(r.code);
  });
  fs.writeFileSync(APP + '.side2tmp', s); fs.renameSync(APP + '.side2tmp', APP);
  console.log('wrote', k, 'SK decks; to ease (fit):', ease.join(','));
} else if (CMD === 'report') {
  const rows = fs.readdirSync(DIR).filter(x => x.endsWith('.json')).map(x => JSON.parse(fs.readFileSync(path.join(DIR, x), 'utf8')));
  const out = { about: 'SIDE2 SK anchor per side map (tools/side2/anchor_2026_11_13.js): BPRO-1 in the hardest fight, Map reference win rate', built: '2026-11-13',
    maps: rows.map(r => ({ map: r.map, name: r.name, code: r.code, target: r.band && r.band.t, band: r.band && [r.band.lo, r.band.hi], bpro1: r.bpro1 && r.bpro1.id, skWin: r.skWin, gap: r.gap, verdict: r.verdict, deck: r.deck })) };
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'side2', 'anchor-2026-11-13.json'), JSON.stringify(out, null, 1) + '\n');
  out.maps.forEach(r => console.log(r.map, r.code, r.target, r.skWin, r.verdict));
}
