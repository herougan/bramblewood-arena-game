#!/usr/bin/env node
// 2026-11-22 (package REWARD3, owner 22:41 #3 #4 #8 #9): Reward picks (<= 2 per map), General drops (Baby), Free drops section, x N counts.
//   1. static: texts in all 12 packs, the cloud row, run-all.sh, CHANGELOG, the design doc;
//   2. browser (index.html + Chromium; skipped when missing): max 2 Rewards a map, a Reward card leaves the pack pool, Baby cards are in no pack, every starter / Baby card is listed
//      with a source or the red flag, Add as reward gives a flagged card a Map 0 fight, the drop roll honours x N.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f => JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  x ' + m); } };
const app = rd('arena_app.js');

// ---- 1. static
ok(/reward3-2026-11-22/.test(rd('tests/run-all.sh')), '1. run-all.sh lists this test');
// 2026-11-25 (TESTFIX11): later packages push the entry down; the check is that the package's dated entry is there
ok(/^## 2026-11-22 Package REWARD3\b/m.test(rd('docs/CHANGELOG.md')), '1. CHANGELOG entry (## 2026-11-22 Package REWARD3)');
ok(fs.existsSync(path.join(ROOT, 'docs/design/reward3-2026-11-22.md')), '1. design doc');
ok(/__cfg:reward3/.test(app) && /applyCloudReward3\(r\)/.test(app), '1. the cloud row is written and read');
const tx = rd('bramblewood-texts.js'), keys = [...new Set((app.match(/ui\.rw3-(?!rt-)[a-z-]+/g) || []))];
ok(keys.length >= 11, '1. the rw3 text keys are used (' + keys.length + ')');
keys.forEach(k => ok(tx.includes('"' + k + '"'), '1. text key ' + k));
const T = J('tools/i18n_2026-11-22_reward3.json').tx;
for (const c of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']) { const p = J('lang/' + c + '.json'); Object.values(T).forEach(e => ok(p[e.en], `1. lang/${c}.json has "${e.en}"`)); }

// ---- 2. browser
async function browser() {
  let pw; try { pw = require('playwright'); } catch (e) { try { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } catch (_) { console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if (!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))) { console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const b = await pw.chromium.launch({ executablePath: EXE });
  try {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 860 } });
    await ctx.route('**/*', r => /^(file|data|blob):/.test(r.request().url()) ? r.continue() : r.abort());
    const pg = await ctx.newPage(), errs = []; pg.on('pageerror', e => errs.push(String(e && e.message || e).slice(0, 200)));
    await pg.addInitScript("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');");
    await pg.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 180000 });
    await pg.waitForFunction("typeof switchTab === 'function' && typeof rw3Toggle === 'function'", null, { timeout: 180000 }); await pg.waitForTimeout(1500);
    const ev = f => pg.evaluate(f);
    await ev("adminModeEnabled = true; rw3State = {}; packIndexReset();");

    // max 2 a map; a third is refused; a Reward card leaves the pack pool and is still obtainable
    const r1 = await ev(() => { const defs = getCardDefs(), pool = id => defs[id] && !defs[id].derivedFrom && defs[id].kind !== 'baby' && basicPackTier0(defs[id]) > 0, ids = mpEntry('mf').cards.filter(pool), a = ids[0], b2 = ids[1], c = ids[2];
      const before = packTierCardIds(1, defs).includes(a); const t1 = rw3Toggle('mf', a, true), t2 = rw3Toggle('mf', b2, true), t3 = rw3Toggle('mf', c, true);
      const o = { before, t1, t2, t3, n: rw3List('mf').length, tier: basicPackTierOf(defs[a]), inPool: packTierCardIds(1, defs).includes(a), pp: packCardPool(defs, 'basic', false, false).includes(a), from: cardObtainableFrom(defs[a]), unatt: isUnattainable(defs[a]), node: rw3NodeOf(a), code: rw3CodeOf(a), c3tier: basicPackTierOf(defs[c]), a, b2, c };
      const nd = rw3NodeOf(a).split(':'); o.pays = nodeFirstClearCardIds(nd[0], nd[1]).includes(a); o.nodes = [rw3NodeOf(a), rw3NodeOf(b2)]; return o; });
    ok(r1.before, '2. the card is a pack card before it is a Reward');
    ok(r1.t1 && r1.t2 && !r1.t3 && r1.n === 2, `2. at most 2 Rewards a map (${r1.t1}/${r1.t2}/${r1.t3}, ${r1.n})`);
    ok(r1.tier === 0 && !r1.inPool && !r1.pp, '2. a Reward card is in no pack pool');
    ok(r1.from === 'skirmish' && !r1.unatt, '2. a Reward card stays obtainable (skirmish)');
    ok(r1.pays && r1.node && r1.code, '2. its fight pays it on a first clear (' + r1.code + ')');
    ok(r1.nodes[0] !== r1.nodes[1], '2. two Rewards sit on different fights (' + r1.nodes + ')');
    ok(r1.c3tier > 0, '2. the refused card stays a pack card');
    // Yes -> No drops the pick; a side map has its own 2
    const r2 = await ev(() => { const a = rw3List('mf')[0]; ui37SetFlag('mf', a, 'yes'); ui37SetFlag('mf', a, 'no'); const sub = ui44ProsSubs()[0].id, ids = mpEntry('mc').cards.filter(id => !rw3List('mf').includes(id)).slice(0, 3); const t = ids.map(id => rw3Toggle(sub, id, true)); return { left: rw3List('mf').includes(a), len: rw3List('mf').length, sub: t }; });
    ok(!r2.left && r2.len === 1, '2. a card that is no longer Yes loses its Reward (' + JSON.stringify(r2) + ')');
    ok(r2.sub[0] && r2.sub[1] && !r2.sub[2], '2. a side map follows the same 2');

    // Baby cards: no pack, a General drop
    const r3 = await ev(() => { const defs = getCardDefs(), baby = Object.keys(defs).filter(id => defs[id].kind === 'baby' && !defs[id].derivedFrom), gen = baby.filter(id => rw3IsBaby(defs[id]));
      return { n: baby.length, gen: gen.length, packed: gen.filter(id => basicPackTier0(defs[id]) > 0), inPool: gen.filter(id => packCardPool(defs, 'basic', false, false).includes(id)), unatt: gen.filter(id => isUnattainable(defs[id])), drop: rw3GeneralIds(defs).length, only: gen.every(id => ['pack', 'base', 'unsorted'].includes(cardSourceOf(defs[id]).kind)) }; });
    ok(r3.gen >= 8 && r3.packed.length === 0 && r3.inPool.length === 0, `2. General Baby cards are in no pack (${r3.gen}, packed ${r3.packed}, pooled ${r3.inPool})`);
    ok(r3.unatt.length === 0 && r3.drop === r3.gen, '2. every General Baby card can drop (' + r3.drop + ')');

    // every starter / Baby card is listed with a source or a flag; T-1 / T-2 base cards are in no pack
    const r4 = await ev(() => { rw3State = {}; const defs = getCardDefs(), rows = rw3FreeRows(defs), by = new Map(rows.map(r => [r.id, r.src])), want = new Set(Object.keys(defs).filter(id => defs[id].kind === 'baby'));
      [STARTER_CFG_DEFAULT, TUTORIAL_CFG_DEFAULT, tutorialCfg || {}].forEach(c => { ['starterShared', 'starterOtters', 'starterHummingbirds', 'starterBoth', 'starterFiller'].forEach(k => Object.keys((c && c[k]) || {}).forEach(id => want.add(id))); ((c && c.starterTopUp) || []).forEach(id => want.add(id)); });
      ['otters', 'hummingbirds', 'both'].forEach(f => Object.keys(starterDeckParts(f).all).forEach(id => want.add(id))); ui43TutorialCards().forEach(id => want.add(id));
      const miss = [...want].filter(id => defs[id] && !defs[id].token && !by.has(id)), none = rows.filter(r => !r.src).map(r => r.id);
      const html = rw3FreeHTML('m1', defs), html2 = rw3FreeHTML('mtut', defs), other = rw3FreeHTML('mf', defs);
      const fl = none[0]; rw3Toggle('m1', fl, true, true); const after = rw3FreeRows(defs).find(r => r.id === fl);
      return { listed: rows.length, miss, none: none.length, flags: (html.match(/rw3-none"/g) || []).length, onTut: html2.includes('id="rw3Free"'), other, fl, srcAfter: after && after.src, tut: ui43TutorialCards().map(id => basicPackTierOf(defs[id])), flaggedHas: html.includes('data-rw3-free="' + fl + '"') }; });
    ok(r4.miss.length === 0 && r4.listed >= 40, `2. every starter, Baby and T-1 / T-2 card is listed (${r4.listed}; missing ${r4.miss})`);
    ok(r4.none > 0 && r4.flags === r4.none && r4.flaggedHas, `2. a card with no free drop wears the red flag and Add as reward (${r4.none} flagged)`);
    ok(r4.onTut && r4.other === '', '2. the section is on Map 0 and the tutorial map only');
    ok(r4.srcAfter && r4.srcAfter.code, '2. Add as reward gives a flagged card a fight (' + JSON.stringify(r4.srcAfter) + ')');
    ok(r4.tut.length >= 5 && r4.tut.every(t => t === 0), '2. the T-1 / T-2 base cards are in no pack (' + r4.tut + ')');

    // counts: a Reward card drops on repeat wins only while the copies owned are under x N; General drops too
    const r5 = await ev(() => { rw3State = {}; const defs = getCardDefs(), id = mpEntry('mf').cards.filter(i => defs[i].kind !== 'baby' && basicPackTier0(defs[i]) > 0)[0]; rw3Toggle('mf', id, true);
      const [mapId, nodeKey] = rw3NodeOf(id).split(':'), node = findConquestNode(mapId, nodeKey).node, saved = myCardCopies[id], own = k => { myCardCopies[id] = Array.from({ length: k }, (_, i) => ({ uid: 't' + i })); }, ids = () => skirmishOwnDropIds(node, mapId).includes(id);
      const o = {}; rw3SetN(id, 1); own(0); o.n1o0 = ids(); own(1); o.n1o1 = ids(); rw3SetN(id, 3); own(2); o.n3o2 = ids(); own(3); o.n3o3 = ids(); rw3SetN(id, 0); own(0); o.n0 = ids();
      rw3SetN(id, 9); o.cap = rw3Want(defs[id]) === maxCopiesForRarity(defs[id].rarity || 'common');
      rw3SetN(id, 2); own(0); const hits = []; for (let i = 0; i < 3; i++) hits.push(rollCardDrop(node, mapId, { firstClear: false }, () => 0)); o.roll0 = hits[0] === id;
      own(2); o.rollFull = rollCardDrop(node, mapId, { firstClear: false }, () => 0) !== id;
      const baby = Object.keys(defs).find(i => rw3IsBaby(defs[i])); rw3SetN(baby, 2); myCardCopies[baby] = [{ uid: 'b0' }]; o.gen1 = rw3GeneralIds(defs).includes(baby); myCardCopies[baby] = [{ uid: 'b0' }, { uid: 'b1' }]; o.gen2 = rw3GeneralIds(defs).includes(baby); rw3SetN(baby, 0); myCardCopies[baby] = []; o.gen0 = rw3GeneralIds(defs).includes(baby);
      if (saved) myCardCopies[id] = saved; else delete myCardCopies[id]; delete myCardCopies[baby]; o.tile = rw3CtlHTML('mf', id, defs[id]).includes('data-rw3-n'); return o; });
    ok(r5.n1o0 && !r5.n1o1, `2. x1: drops until one copy is owned (${r5.n1o0}/${r5.n1o1})`);
    ok(r5.n3o2 && !r5.n3o3, `2. x3: drops until three copies are owned (${r5.n3o2}/${r5.n3o3})`);
    ok(!r5.n0, '2. x0: never drops');
    ok(r5.cap, '2. the count is capped by the rarity copy cap');
    ok(r5.roll0 && r5.rollFull, '2. the repeat-win roll honours the count');
    ok(r5.gen1 && !r5.gen2 && !r5.gen0, `2. a General drop honours the count (${r5.gen1}/${r5.gen2}/${r5.gen0})`);
    ok(r5.tile, '2. the tile shows the x N field');
    ok(errs.length === 0, '2. no page errors ' + errs.join(' | '));
  } finally { await b.close(); }
}
browser().then(() => { console.log(fail ? `reward3: ${fail} FAILED of ${n}` : `reward3: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e => { console.log('  x browser part crashed: ' + (e && e.stack || e)); process.exit(1); });
