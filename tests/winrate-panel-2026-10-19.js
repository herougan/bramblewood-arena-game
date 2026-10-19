#!/usr/bin/env node
// 2026-10-19 (package W2, owner: "Sometimes checking the win-rate of a map hangs on skirmish 2 onwards. Does your comparison deck become
// stronger as we progress throughout the maps? It has to match progression."). The skirmish editor's "This map, new-player win rate"
// panel, run headlessly from arena_app.js itself (tools/lib_bramble.js evaluates the game's own functions):
//   1. checkSkirmishCurve finishes every map's fights (the endless dungeons too) inside a time budget, with no throw and no "!";
//   2. a fight whose deck names an unknown card (the hang: the engine threw in costOfCard and the old loop had no catch) gets "!" with
//      the reason, and the fights after it are still checked;
//   3. the map budget and the fight budget stop the check (⏱ / a partial result) instead of letting it run on;
//   4. the reference deck follows the road: a late map's deck and card level beat Map 0's starter deck on the same fights, and the
//      deck / level never step back along the main maps;
//   5. the panel and tools/skirmish_pass.js agree: the tool measures with the game's simulateReferenceFight and reads the decks from
//      WINRATE_REF_DECKS, and the panel's chip is the same number as simulateReferenceFight over the same games;
//   6. an editor draft (a copy of the node) fights like the node itself (the enemy at its road level, the map's rules).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tool = fs.readFileSync(path.join(ROOT, 'tools', 'skirmish_pass.js'), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const T0 = Date.now(), TOTAL_MS = 240000; // the whole test's budget
const fightsOf = m=> m.nodes.filter(n=> n.deck && n.kind !== 'tutorial'); // what the panel checks (skirmishCurveHTML / runSkirmishCurveCheck)
const fast = ()=> Promise.resolve();
const withTimeout = (p, ms, what)=> Promise.race([p, new Promise((_, rej)=> setTimeout(()=> rej(new Error('hung: ' + what)), ms))]);

(async ()=>{
  // 1. every map, every fight, inside a budget (2 games a fight here; the panel plays 30)
  let fights = 0, slowest = [0, ''];
  for(const m of G.CONQUEST_MAPS){
    if(m.reserved || m.tower) continue;
    const list = fightsOf(m); if(!list.length) continue;
    const t = Date.now(); let res = null;
    try{ res = await withTimeout(G.checkSkirmishCurve(m.id, list, {games: 2, pause: fast, budgetMs: 60000}), 90000, m.id); }
    catch(e){ ok(false, `${m.id}: ${e.message}`); continue; }
    const ms = Date.now() - t; if(ms > slowest[0]) slowest = [ms, m.id];
    ok(res.length === list.length, `${m.id}: ${res.length} of ${list.length} fights came back`);
    res.forEach((r, i)=>{ fights++;
      ok(!r.mark, `${m.id} ${r.key}: marked ${r.mark} (${r.why})`);
      ok(r.v != null && r.v >= 0 && r.v <= 1 && r.games === 2, `${m.id} ${r.key}: no win rate (${JSON.stringify(r)})`); });
  }
  ok(fights > 300, `only ${fights} fights checked`);
  console.log(`  ${fights} fights on every map checked, slowest map ${slowest[1]} ${slowest[0]} ms, ${((Date.now() - T0) / 1000).toFixed(0)} s so far`);

  // 2. one broken fight: "!" with the reason, the check moves on
  { const m0 = G.CONQUEST_MAPS.find(m=> m.id === 'm1'), list = fightsOf(m0).slice();
    const broken = JSON.parse(JSON.stringify(list[1])); broken.deck = Object.assign({'no-such-card-w2': 2}, broken.deck); G.NODE_MAP_HINT.set(broken, 'm1'); list[1] = broken;
    let threw = null; try{ G.simulateReferenceFight('m1', broken, 1); }catch(e){ threw = e; }
    ok(threw && /no-such-card-w2/.test(threw.message), 'an unknown card in a deck is reported by the setup');
    const seen = []; const res = await withTimeout(G.checkSkirmishCurve('m1', list, {games: 3, pause: fast, onFight: (i, r)=> seen.push(i)}), 30000, 'broken m1');
    ok(res[1].mark === '!' && /no-such-card-w2/.test(res[1].why) && res[1].v == null, `the broken fight shows "!" with the reason (${JSON.stringify(res[1])})`);
    ok(res[0].v != null && res[2].v != null && res[3].v != null && !res[2].mark && !res[3].mark, 'the fights after the broken one are still checked');
    ok(seen.join(',') === '0,1,2,3', 'every chip is painted, in order: ' + seen.join(',')); }

  // 3. the budgets: a fake clock that moves 1 s a call
  { const m = G.CONQUEST_MAPS.find(x=> x.id === 'mc'), list = fightsOf(m); let clock = 0; const now = ()=> (clock += 1000);
    G.skirmishCurveSimCache.clear();
    const res = await withTimeout(G.checkSkirmishCurve('mc', list, {games: 30, pause: fast, now, budgetMs: 20000, fightMs: 5000}), 30000, 'budget');
    ok(res.length === list.length, 'the budgeted check still answers for every fight');
    ok(res.some(r=> r.mark === '⏱') && res.filter(r=> r.mark === '⏱').every(r=> /Click again/.test(r.why)), 'fights past the map budget show ⏱ and say why');
    ok(res.some(r=> r.partial && r.games < 30 && /of 30 games/.test(r.why)), 'a fight past its own budget gives a partial result and says how many games');
    ok(G.skirmishCurveSimCache.size === res.filter(r=> r.v != null && !r.partial && !r.cached).length, 'only whole results are cached, never a partial one');
    let cancelledAt = -1; const res2 = await G.checkSkirmishCurve('mc', list, {games: 2, pause: fast, cancelled: ()=> cancelledAt >= 0, onFight: i=>{ if(i === 1) cancelledAt = i; }});
    ok(res2.length === 2, 'a cancelled check (editor closed / a newer check) stops: ' + res2.length); }

  // 4. the reference deck follows the road
  { const mains = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved && fightsOf(m).length);
    let lastDeck = -1, lastLv = 0, mono = true;
    mains.forEach(m=>{ const r = G.referenceDeckFor(m.id, fightsOf(m)[0]); if(r.deckMap < lastDeck || r.level < lastLv) mono = false; lastDeck = r.deckMap; lastLv = r.level;
      const size = Object.values(r.deck).reduce((a, b)=> a + b, 0); // a road deck is a full 20; Map 0's Otter starter is the 18 a new player starts with
      ok(r.stage === 'starter' ? size === 18 : size === 20, `${m.id}: the reference deck has ${size} cards`); });
    ok(mono, 'the reference deck and card level never step back along the main maps');
    const r0 = G.referenceDeckFor('m1', fightsOf(G.CONQUEST_MAPS.find(m=> m.id === 'm1'))[0]), last = mains[mains.length - 1], rL = G.referenceDeckFor(last.id, fightsOf(last)[0]);
    ok(r0.stage === 'starter' && r0.level === 0, 'Map 0 plays the starter deck at its own level (2026-10-19, LV: the Forge opens on Map 11, so Lv 0)');
    ok(rL.stage === 'road' && rL.deckMap >= 10 && rL.level > r0.level, `the last map (${last.id}) plays a late road deck (Map ${rL.deckMap}) at a higher level (${rL.level})`);
    ok(JSON.stringify(rL.deck) !== JSON.stringify(r0.deck), 'the late deck is not the starter deck');
    // the same fights (Maps 8 and 12, 12 games each), played by both decks: the late one must win clearly more
    const probe = G.CONQUEST_MAPS.filter(m=> m.id === 'm4' || m.id === 'mh').flatMap(m=> fightsOf(m).map(n=> [m.id, n]));
    const score = (deck, level)=> probe.reduce((t, [mid, n])=> t + G.simulateReferenceFight(mid, n, 12, {deck, level, seed0: 4100}).win, 0) / probe.length;
    const s0 = score(r0.deck, r0.level), sL = score(rL.deck, rL.level);
    console.log(`  Maps 8 and 12: Map 0's deck at Lv ${r0.level} wins ${(s0 * 100).toFixed(0)}%, ${last.id}'s (Map ${rL.deckMap} deck) at Lv ${rL.level} ${(sL * 100).toFixed(0)}%`);
    ok(sL >= s0 + 0.15, 'the late reference deck is clearly stronger than Map 0\'s'); }

  // 5. the panel and the tool agree
  ok(/G\.simulateReferenceFight\(f\.map, node, games/.test(tool), 'tools/skirmish_pass.js measures with the game\'s simulateReferenceFight');
  ok(/G\.referenceDeckFor\(f\.map, f\.n\)/.test(tool) && !/function playerDeck\(/.test(tool) && !/difficulty-curve\.json/.test(tool), 'the tool takes its decks and levels from the game, not its own copy');
  { let rep = null; try{ rep = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'skirmish-pass-decks.json'), 'utf8')); }catch(e){}
    ok(rep && rep.road, 'docs/balance/skirmish-pass-decks.json is there');
    if(rep && rep.road) Object.keys(G.WINRATE_REF_DECKS.road).forEach(k=>{ const a = rep.road[k] && Object.fromEntries(rep.road[k].cards.map(c=> [c.id, c.n]));
      ok(a && JSON.stringify(a) === JSON.stringify(G.WINRATE_REF_DECKS.road[k]), `Map ${k}: the report's deck is the game's deck`); }); }
  for(const [mid, key] of [['m1', '0-2'], ['mf', '1-3'], ['m10', '11-2']]){
    const n = B.byKey(mid, key); G.skirmishCurveSimCache.clear();
    const [p] = await G.checkSkirmishCurve(mid, [n], {games: 30, pause: fast}), t = G.simulateReferenceFight(mid, n, 30);
    ok(p.v === t.win, `${mid} ${key}: the panel's ${p.v} is the tool's ${t.win}`); }

  // 6. an editor draft is the same fight as its node
  for(const [mid, key] of [['mu', '7-2'], ['m10', '11-2']]){
    const n = B.byKey(mid, key), d = JSON.parse(JSON.stringify(n)); G.NODE_MAP_HINT.set(d, mid);
    ok(G.roadEnemyLevel(d) === G.roadEnemyLevel(n) && G.roadEnemyLevel(n) > 0, `${mid} ${key}: the draft's enemy fights at its road level`);
    ok(G.simulateReferenceFight(mid, d, 6).wins === G.simulateReferenceFight(mid, n, 6).wins, `${mid} ${key}: the draft plays like the node`); }

  // 7. the road curve (2026-10-19, R2; owner 20:39: "...it starts at 90%, and drops to 60%. Then at the boss fight, <50%."): every
  //    main map's fights in road order go 90% -> 60% before the boss (elites on the line at their place), the map's last fight is its boss
  //    (30-49%, Map 0's 45%), and the chips are green inside the fight's band, blue above, red below
  { const mains = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved && fightsOf(m).length); let lineOk = true, bossOk = true, monoOk = true;
    mains.forEach(m=>{ const list = fightsOf(m).filter(n=> !/raidboss/.test(n.kind || '')), ender = list.find(n=> n.ender) || list[list.length - 1];
      const bands = list.map(n=> [n, G.skirmishTargetBand(m.id, n)]);
      bands.forEach(([n, b])=>{ if(!b.curve) lineOk = false; });
      const eb = G.skirmishTargetBand(m.id, ender); if(!(eb.role === 'boss' && eb.lo === .30 && eb.hi === .49 && eb.t < .5 && eb.t >= .4)) bossOk = false;
      const line = bands.filter(([n, b])=> b.role === 'skirmish' || b.role === 'elite');
      if(line.length){ const [n0, b0] = line[0], [nL, bL] = line[line.length - 1];
        if(Math.abs(b0.t - .90) > 1e-9 || Math.abs(bL.t - .60) > 1e-9) lineOk = false;
        line.forEach(([n, b], i)=>{ if(i && b.t > line[i - 1][1].t + 1e-9) monoOk = false;
          if(Math.abs(b.t - Math.round((.90 - .30 * i / Math.max(1, line.length - 1)) * 1000) / 1000) > 1e-9) lineOk = false; // a straight line, elites on it
          if(Math.abs(b.hi - Math.min(1, b.t + .08)) > 1e-9 || Math.abs(b.lo - (b.t - .08)) > 1e-9) lineOk = false; }); } });
    ok(lineOk, 'every main-map fight is on the road curve: 90% for the first, 60% for the last before the boss (elites too), green ±8');
    ok(monoOk, 'the curve only falls along a map');
    ok(bossOk, 'every main map\'s last fight is its boss fight: target 40-45%, green 30-49%');
    ok(G.skirmishTargetBand('m1', B.byKey('m1', '0-4')).t === .45, 'Map 0\'s Frost Vanguard keeps a gentler 45%');
    ok(G.skirmishTargetBand('m11', B.byKey('m11', '20-9')).t === .5 && G.skirmishTargetBand('m11', B.byKey('m11', '20-9')).role === 'miniboss', 'a boss before the map\'s last fight (20-9) is a mini-boss at 50%');
    ok(!G.skirmishTargetBand('mtut', B.byKey('mtut', 'T-3')).curve, 'the Tutorial\'s come-back-later fights keep their older targets');
    // 2026-10-19 (package LV): the Old Bramble and the Eye of the Volcano are on the curve (the Eye's boss fight is its Heart of the Mountain)
    ok(G.skirmishTargetBand('mo', B.byKey('mo', '0-B-4')).role === 'boss' && G.skirmishTargetBand('me', B.byKey('me', '20-A-4')).role === 'boss' && G.skirmishTargetBand('me', B.byKey('me', '20-A-1')).t === .9, 'the Old Bramble and the Eye of the Volcano are on the curve');
    ok(G.skirmishTargetBand('mq', B.byKey('mq', '1-A-1')).t === .9 && G.skirmishTargetBand('mq', B.byKey('mq', '1-A-5')).role === 'boss', 'side maps follow the same curve');
    const n1 = B.byKey('mc', '3-1'), nB = B.byKey('mc', '3-7'), cls = (mid, n, v)=>{ G.skirmishCurveCache[mid + ':' + n.key] = v; const h = G.skirmishCurveChipHTML(mid, n, ''); return (/se-curve-chip (\w*)/.exec(h) || [])[1]; };
    ok(cls('mc', n1, .90) === 'ok' && cls('mc', n1, .83) === 'ok' && cls('mc', n1, .80) === 'hard' && cls('mc', n1, .99) === 'easy', 'the first fight: 82-98% green, under red, over blue');
    ok(cls('mc', nB, .45) === 'ok' && cls('mc', nB, .30) === 'ok' && cls('mc', nB, .55) === 'easy' && cls('mc', nB, .25) === 'hard', 'the boss: 30-49% green, 50%+ blue, under 30% red');
    ok(/target ~40% \(green 30–49%, the boss fight\)/.test(G.skirmishCurveChipHTML('mc', nB, '')), 'the chip\'s title gives the target and the green band');
    ok(/road curve: 90% for the first fight down to 60% before the boss, the boss 30–49%/.test(app), 'the legend explains the curve'); }

  // the panel's wiring in the skirmish editor
  ok(/cb\.onclick = \(\)=>\{ read\(\); runSkirmishCurveCheck\(mapId, draft\); \}/.test(app), '"Check the whole map" runs runSkirmishCurveCheck');
  ok(/data-curve-key=/.test(app) && /se-curve-chip\.err/.test(fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8')), 'chips are found by key and "!" has its style');
  { const ed = app.slice(app.indexOf('function openSkirmishEditor('), app.indexOf('function openSkirmishEditor(') + 60000); ok(!/expectedPlayerDeck\(/.test(ed.slice(0, ed.indexOf('\nfunction ', 10))), 'the skirmish editor no longer plays expectedPlayerDeck'); }

  const secs = (Date.now() - T0) / 1000;
  ok(secs * 1000 < TOTAL_MS, `the test ran ${secs.toFixed(0)} s (budget ${TOTAL_MS / 1000} s)`);
  console.log(fail ? `FAIL ${fail} of ${checks}` : `ok: ${checks} checks (${secs.toFixed(0)} s)`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.log('  ✗ threw:', e && e.stack); process.exit(1); });
