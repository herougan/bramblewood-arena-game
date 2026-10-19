#!/usr/bin/env node
// 2026-10-19 (package HB, owner 17:44: "Where is our balance, monsters, and skills file -> can it be put into the artefact for my
// assessment. Also s.t. i can edit the values"): the hub's 🎚️ Budget & stats tab and tools/hub/apply_balance_edits.js.
//   1. apply_balance_edits.js on a copy of the files (a temp tree): budget constants into skill-costs.json and bramblewood-budget.js
//      DEFAULTS, card stats + creatorNote, a bramble into raids.json, an async boss into raid-bosses.json, a computed monster onto
//      docs/balance/monster-overrides.json; --dry-run writes nothing; the files keep their formatting.
//   2. the built hub (.hub/index.html, if present) in Chromium with a stub db: a saved budget edit loads, an edit saves to
//      budgetEdits and recomputes the cards, Reset to file deletes the doc, a card's Attack saves to cardEdits, a monster's Health to
//      monsterEdits, no horizontal page scroll at 390 and 1366.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  FAIL ' + m); } };

// ---------- 1. the apply tool on a temp tree ----------
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-'));
['tools/hub/apply_balance_edits.js', 'bramblewood-budget.js', 'canonical/skill-costs.json', 'canonical/cards.json', 'canonical/raids.json', 'canonical/raid-bosses.json', 'canonical/special-monsters.json']
  .forEach(f=>{ fs.mkdirSync(path.dirname(path.join(T, f)), {recursive: true}); fs.copyFileSync(path.join(ROOT, f), path.join(T, f)); });
fs.mkdirSync(path.join(T, 'docs', 'balance'), {recursive: true});
const raids0 = JSON.parse(fs.readFileSync(path.join(T, 'canonical/raids.json'), 'utf8')), rb0 = JSON.parse(fs.readFileSync(path.join(T, 'canonical/raid-bosses.json'), 'utf8'));
const cards0 = JSON.parse(fs.readFileSync(path.join(T, 'canonical/cards.json'), 'utf8')), card = cards0.find(c=> c.id === 'otter-centurion');
const leftHp = raids0[0].parts.find(p=> p.id === 'left').fight.castleHp, yeti = rb0.find(b=> b.id === 'the-frost-yeti-king');
const edits = {budgetEdits: [{id: 'levelDiv', data: {key: 'levelDiv', value: 25, prev: 30, updatedAt: '2026-10-19T18:00:00Z'}}, {id: 'bandLow', data: {key: 'bandLow', value: 0.55, prev: 0.6}}],
  cardEdits: [{id: 'otter-centurion', data: {id: 'otter-centurion', attack: card.attack + 1, health: card.health + 2, prev: {attack: card.attack, health: card.health}, note: 'hb test', updatedAt: '2026-10-19T18:00:00Z'}}],
  monsterEdits: [{id: 'bramble:left', data: {id: 'bramble:left', group: 'brambles', attack: 0, health: leftHp - 10, prev: {attack: 0, health: leftHp}}},
    {id: 'the-frost-yeti-king', data: {id: 'the-frost-yeti-king', group: 'async', attack: 0, health: yeti.hqHp - 5, prev: {attack: 0, health: yeti.hqHp}}},
    {id: 'kraken-spawnling~boss@x', data: {id: 'kraken-spawnling~boss', name: 'Kraken Brute', group: 'units', attack: 3, health: 40, prev: {attack: 3, health: 50}, note: 'elder'}}]};
const EF = path.join(T, 'edits.json'); fs.writeFileSync(EF, JSON.stringify(edits));
const snap = ()=> ['bramblewood-budget.js', 'canonical/skill-costs.json', 'canonical/cards.json', 'canonical/raids.json', 'canonical/raid-bosses.json'].map(f=> fs.readFileSync(path.join(T, f), 'utf8'));
const before = snap();
const dry = cp.execFileSync('node', [path.join(T, 'tools/hub/apply_balance_edits.js'), EF, '--dry-run'], {encoding: 'utf8'});
ok(JSON.stringify(snap()) === JSON.stringify(before) && !fs.existsSync(path.join(T, 'docs/balance/monster-overrides.json')), '1a. --dry-run writes nothing');
ok(/DEFAULTS\.levelDiv: 30 -> 25/.test(dry) && /budget\.bandLow/.test(dry) && /castleHp/.test(dry) && /hqHp/.test(dry) && /override list/.test(dry), '1b. the dry run lists every change');
cp.execFileSync('node', [path.join(T, 'tools/hub/apply_balance_edits.js'), EF], {encoding: 'utf8'});
const sc = JSON.parse(fs.readFileSync(path.join(T, 'canonical/skill-costs.json'), 'utf8')), bjs = fs.readFileSync(path.join(T, 'bramblewood-budget.js'), 'utf8');
ok(sc.budget.levelDiv === 25 && sc.budget.bandLow === 0.55 && /levelDiv:25[,}]/.test(bjs), '1c. budget into skill-costs.json and DEFAULTS');
const BBt = require(path.join(T, 'bramblewood-budget.js')); ok(BBt.DEFAULTS.levelDiv === 25, '1d. the edited helper still loads');
const c1 = JSON.parse(fs.readFileSync(path.join(T, 'canonical/cards.json'), 'utf8')).find(c=> c.id === 'otter-centurion');
ok(c1.attack === card.attack + 1 && c1.health === card.health + 2 && /hub edit.*hb test/.test(c1.creatorNote), '1e. card stats + creatorNote');
ok(snap()[2].split('\n').length === before[2].split('\n').length, '1f. cards.json keeps its layout (same line count)');
ok(JSON.parse(fs.readFileSync(path.join(T, 'canonical/raids.json'), 'utf8'))[0].parts.find(p=> p.id === 'left').fight.castleHp === leftHp - 10, '1g. the bramble into raids.json');
ok(JSON.parse(fs.readFileSync(path.join(T, 'canonical/raid-bosses.json'), 'utf8')).find(b=> b.id === 'the-frost-yeti-king').hqHp === yeti.hqHp - 5 && snap()[4].split('\n').length === before[4].split('\n').length, '1h. the async boss into raid-bosses.json, one line each');
const ov = JSON.parse(fs.readFileSync(path.join(T, 'docs/balance/monster-overrides.json'), 'utf8'));
ok(ov.overrides['kraken-spawnling~boss@x'] && ov.overrides['kraken-spawnling~boss@x'].health === 40, '1i. a computed monster on the override list');
fs.rmSync(T, {recursive: true, force: true});

// ---------- 2. the hub in Chromium ----------
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const HUB = path.join(ROOT, '.hub', 'index.html');
  if(!fs.existsSync(HUB)){ console.log('  (browser part skipped: build the hub first)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  const b = await pw.chromium.launch(fs.existsSync(EXE) ? {executablePath: EXE} : {});
  const STUB = `(()=>{ const store = {budgetEdits: {perWait: {key:'perWait', value: 6.5, prev: 6}}, cardEdits: {}, monsterEdits: {}}, subs = {}; window.__store = store;
    const snap = c=> ({docs: Object.entries(store[c]).map(([id, d])=> ({id, data: ()=> JSON.parse(JSON.stringify(d))}))});
    const fire = c=> (subs[c] || []).forEach(cb=> setTimeout(()=> cb(snap(c)), 5));
    const db = {collection: c=> ({onSnapshot(cb){ (subs[c] = subs[c] || []).push(cb); setTimeout(()=> cb(snap(c)), 20); return ()=>{}; },
      doc: id=> ({set(d){ store[c][id] = d; fire(c); return Promise.resolve(); }, delete(){ delete store[c][id]; fire(c); return Promise.resolve(); }})})};
    window.claude = {use: n=> Promise.resolve(n === 'db' ? db : null)}; })();`;
  try{
    for(const [w, h] of [[390, 844], [1366, 900]]){
      const pg = await b.newPage({viewport: {width: w, height: h}}); const errs = []; pg.on('pageerror', e=> errs.push(String(e)));
      await pg.addInitScript(STUB); await pg.goto('file://' + HUB + '#budget'); await pg.waitForSelector('#hbSum .sc-tile', {timeout: 30000}); await pg.waitForTimeout(300);
      ok(await pg.evaluate("document.querySelector('input[data-const=perWait]').value") === '6.5', `2a. ${w}: a saved budget edit loads`);
      const t0 = await pg.innerText('#hbSum'); await pg.fill('input[data-const=levelLinDiv]', '2'); await pg.waitForTimeout(900);
      ok((await pg.evaluate("window.__store.budgetEdits.levelLinDiv && window.__store.budgetEdits.levelLinDiv.value")) === 2 && (await pg.innerText('#hbSum')) !== t0, `2b. ${w}: an edit saves and recomputes`);
      await pg.click('button[data-reset=levelLinDiv]'); await pg.waitForTimeout(900);
      ok(await pg.evaluate("!('levelLinDiv' in window.__store.budgetEdits)"), `2c. ${w}: Reset to file deletes the doc`);
      const wide = ()=> pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.getElementById('p-budget').scrollWidth <= document.getElementById('p-budget').clientWidth + 1");
      ok(await wide(), `2d. ${w}: no horizontal page scroll (budget)`);
      await pg.click('#hbViews button[data-view=cards]'); await pg.fill('#hbQ', 'otter-centurion'); await pg.waitForTimeout(200);
      await pg.fill('#hbCbody input[data-card="otter-centurion"][data-stat=attack]', '40'); await pg.waitForTimeout(900);
      ok(await pg.evaluate("window.__store.cardEdits['otter-centurion'] && window.__store.cardEdits['otter-centurion'].attack === 40"), `2e. ${w}: a card's Attack saves to cardEdits`);
      ok(/over/.test(await pg.innerText('#hbCbody tr[data-row="otter-centurion"]')), `2f. ${w}: the row recomputes (over)`);
      ok(await wide(), `2g. ${w}: no horizontal page scroll (cards)`);
      await pg.click('#hbViews button[data-view=monsters]'); await pg.waitForSelector('#hbMbody tr[data-row]');
      const key = await pg.evaluate("document.querySelector('#hbMbody input[data-mon][data-stat=health]').dataset.mon");
      await pg.fill(`#hbMbody input[data-mon="${key}"][data-stat=health]`, '7'); await pg.waitForTimeout(900);
      ok(await pg.evaluate(`(window.__store.monsterEdits[${JSON.stringify(key)}] || {}).health === 7`), `2h. ${w}: a monster's Health saves to monsterEdits`);
      ok(await wide(), `2i. ${w}: no horizontal page scroll (monsters)`);
      ok(!errs.length, `2j. ${w}: no page errors ${errs.slice(0, 2).join(' | ')}`);
      await pg.close();
    }
  } finally { await b.close(); }
}
browser().then(()=>{ console.log(`hb-2026-10-19: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  FAIL browser: ' + e.message); process.exit(1); });
