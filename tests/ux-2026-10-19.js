#!/usr/bin/env node
// 2026-10-19 (package UX, owner 21:36, UI notes):
//   7.  "Make the tutorial summary like the normal skirmish summary - deck list, and doesn't list field effect." — the tutorial node's
//       panel shows the rival deck the tutorial deals (tutorialDecksFor), its BR and the rival's real Health, and no Field panel
//   8a. "After selecting a card to forge, there is a sub-window that shows ALL cards of the same name." — the copies sheet, grouped
//       by level and treatment ("Lv 10 · Plain ×5"), strongest first; a pick puts that copy on the anvil
//   8b. "In the main filter window, the cards displayed should also show # of copies, for any treatments." — the ×N badge
//   8c. "I also think Forging should have centre of field treatment." — forgeCentreStage around every Forge animation
//   9.  "The entry in the codex should be looking at the lvl 1 version(s) ... maybe you can toggle it." — base level by default,
//       Base level / My best kept per device
//   11. "Filter in codex for Spells (unused), Equipment (unused), creature units, structure units, Brambles." — the card-type chips
//   + TX keys for every new text, in all 12 packs
// The pure parts are evaluated from arena_app.js (CODEX_UX and FORGE_UX blocks) with stubs; with Playwright and a built index.html,
// the browser part plays it at 390x844 (touch) and 1366x768. UX_SHOTS=1 saves the screenshots to docs/screens/ux/.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const SHOTS = process.env.UX_SHOTS ? 'ux' : '';
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const slice = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('missing ' + a); return src.slice(i, j); };
const fnSrc = name=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; const j = src.indexOf('\n}\n', i); return src.slice(i, j + 2); };

// ---- 9 + 11: the Codex block, with a fake localStorage and the level helpers stubbed
function codexApi(store, throwing){
  const defs = {}; cards.forEach(c=> defs[c.id] = c);
  const levels = store.levels || {};
  const full = id=> Object.assign({}, defs[id], {level: levels[id] != null ? levels[id] : (defs[id].source && defs[id].source.kind === 'base' ? 0 : 1)});
  const env = {
    localStorage: throwing ? {getItem(){ throw new Error('blocked'); }, setItem(){ throw new Error('blocked'); }} : {getItem: k=> store.ls[k] != null ? store.ls[k] : null, setItem: (k, v)=>{ store.ls[k] = String(v); }},
    isStructure: d=> (d.archetypes || []).includes('Structure') || d.type === 'Structure',
    copyBaseDef: id=> defs[id] || null,
    cardBaseLevel: d=> d && d.source && d.source.kind === 'base' ? 0 : 1,
    // copyDefAt's contract: null when the card already shows at L, else the card at L under a "~cp" id, unlocked
    copyDefAt: (id, L)=>{ const f = full(id); if(f.level === L) return null; return Object.assign({}, f, {id: id + '~cp' + L, derivedFrom: id, copyOf: id, level: L, attack: (defs[id].attack || 0), locked: false}); },
  };
  const names = Object.keys(env);
  // eslint-disable-next-line no-new-func
  return {defs, full, api: new Function(...names, slice('// CODEX_UX:BEGIN', '// CODEX_UX:END') + ';return {CODEX_KINDS, codexCardKind, codexKindCounts, CODEX_LEVEL_KEY, codexLevelMode, setCodexLevelMode, codexShownDef};')(...names.map(k=> env[k]))};
}
{
  const store = {ls: {}, levels: {'ant-scout': 10, 'otter-centurion': 4}};
  const {defs, full, api: C} = codexApi(store);
  ok(C.codexLevelMode() === 'base', '9. the Codex shows the base level by default (nothing saved)');
  ok(codexApi({ls: {}}, true).api.codexLevelMode() === 'base', '9. blocked storage: still the base level, no throw');
  ok(codexApi({ls: {}}, true).api.setCodexLevelMode('best') === 'best', '9. blocked storage: setting the mode does not throw');
  const lv = full('ant-scout'), shown = C.codexShownDef('ant-scout', lv);
  ok(shown.level === 1 && shown.id === 'ant-scout' && shown.locked === lv.locked, `9. a Lv 10 card shows at Lv 1 under its own id and lock (got Lv ${shown.level}, ${shown.id})`);
  ok(!('derivedFrom' in shown) && !('copyOf' in shown), '9. the base-level view is not marked as a copy of another card');
  const base = full('bee-knight'); ok(C.codexShownDef('bee-knight', base) === base, '9. a card already at its base level is shown as it is');
  const baseCard = cards.find(c=> c.source && c.source.kind === 'base');
  if(baseCard){ store.levels[baseCard.id] = 3; const b = C.codexShownDef(baseCard.id, full(baseCard.id)); ok(b.level === 0, `9. a Base card's base level is Lv 0 (${baseCard.id}: ${b.level})`); }
  ok(C.setCodexLevelMode('best') === 'best' && store.ls[C.CODEX_LEVEL_KEY] === 'best' && C.codexLevelMode() === 'best', '9. "My best" is saved per device');
  ok(C.codexShownDef('ant-scout', lv) === lv, '9. "My best" shows your highest level');
  C.setCodexLevelMode('nonsense'); ok(C.codexLevelMode() === 'base', '9. anything else saved reads as the base level');
  // 11: the kinds
  ok(JSON.stringify(C.CODEX_KINDS.map(k=> k.key)) === JSON.stringify(['creature', 'structure', 'spell', 'equipment', 'bramble']), '11. five card types: Creatures, Structures, Spells, Equipment, Brambles');
  const ids = cards.map(c=> c.id), counts = C.codexKindCounts(ids, defs, 7);
  const want = {equipment: cards.filter(c=> c.cardType === 'equipment').length, spell: cards.filter(c=> c.cardType === 'spell' || c.field).length};
  ok(counts.equipment === want.equipment && want.equipment > 0, `11. every equipment card counts as Equipment (${counts.equipment}/${want.equipment})`);
  ok(counts.spell === want.spell && want.spell > 0, `11. spells (and field cards) count as Spells (${counts.spell}/${want.spell})`);
  const structs = cards.filter(c=> !c.cardType && !c.field && (c.archetypes || []).includes('Structure')).length;
  ok(counts.structure === structs && structs > 0, `11. Structure-tagged cards count as Structures (${counts.structure}/${structs})`);
  ok(ids.every(id=> ['creature', 'structure', 'spell', 'equipment', 'bramble', 'materia'].includes(C.codexCardKind(defs[id])) || defs[id].cardType === 'materia'), '11. no card falls outside the five types');
  ok(counts.bramble === 7, '11. the Brambles count is the Brambles page\'s');
  const none = C.codexKindCounts(ids.filter(id=> C.codexCardKind(defs[id]) === 'creature'), defs, 0);
  ok(none.spell === 0 && none.equipment === 0 && 'spell' in none && 'equipment' in none, '11. an empty type is still listed, at 0');
  ok(C.codexCardKind({cardType: 'equipment', archetypes: ['Structure']}) === 'equipment' && C.codexCardKind({archetypes: ['Structure']}) === 'structure' && C.codexCardKind({isCastle: true}) === 'bramble' && C.codexCardKind({}) === 'creature', '11. the type rules (equipment before the Structure tag; a castle is a Bramble)');
}
// the Codex wiring
{
  const grid = fnSrc('renderCodexGrid'), shell = fnSrc('renderCodex'), detail = fnSrc('openCardDetail');
  ok(/codexShownDef\(id, defs\[id\]\)/.test(grid), '9. Codex tiles are drawn at the Codex\'s level');
  ok(/codexKindRowUpdate\(codexKindCounts\(ids, defs, nb\)/.test(grid) && /codexCardKind\(defs\[id\]\) === codexFilter\.kind/.test(grid), '11. the grid counts each type, then filters by the chosen one');
  ok(/codexKindRowHTML\(\)/.test(shell) && /wireCodexKindRow\(\)/.test(shell), '11. the chip row sits under the Codex toolbar');
  ok(/openCardDetail\(t\.getAttribute\('data-defid'\), \{codex:true\}\)/.test(src), '9. a Codex tile opens its detail at the Codex\'s level');
  ok(/fromCodex \? codexShownDef\(defId, d0\) : d0/.test(detail) && /codexDetailLevelChipHTML/.test(detail) && /uxCdLevel/.test(detail), '9. the detail shows the level and flips Base level / My best');
  ok(/codexSubTab = 'brambles'/.test(fnSrc('wireCodexKindRow')), '11. the Brambles chip opens the Brambles page');
}
// ---- 8a / 8b: the Forge block (copy groups, the breakdown), with a fake copy store
{
  const REFINE_LADDER = [{key:null, label:'Plain'}, {key:'auto', label:'Foil'}, {key:'hex', label:'Hex'}];
  const st = {copies: {x: [{uid:'a', level:1}, {uid:'b', level:10}, {uid:'c', level:10, foil:true, finish:'hex'}, {uid:'d', level:10}, {uid:'e', level:2},
    {uid:'f', level:10, cr:{dust:5}}, {uid:'g', level:1, shiny:true}, {uid:'h', level:10}, {uid:'i', level:1}, {uid:'j', level:10, skin:'alt1'}]}};
  const env = {
    myCardCopies: st.copies, TX, _t: s=> s, REFINE_LADDER, copyModelSync: ()=>{}, copyLevel: (id, c)=> c.level,
    copyRefineRank: c=> !c || !c.foil ? 0 : Math.max(1, REFINE_LADDER.findIndex(r=> r.key === (c.finish || 'auto'))),
    copyCreditOf: c=> ({dust: (c.cr && c.cr.dust) | 0, gold: (c.cr && c.cr.gold) | 0}),
    copyOrder: id=>{ const a = st.copies[id]; const fr = c=> (c.foil ? 1 : 0) + (c.shiny ? .5 : 0); return a.map((c, i)=> i).sort((x, y)=> a[y].level - a[x].level || fr(a[y]) - fr(a[x]) || x - y); },
    escapeHtml: s=> String(s), escapeAttr: s=> String(s),
  };
  const names = Object.keys(env);
  // eslint-disable-next-line no-new-func
  const F = new Function(...names, slice('// FORGE_UX:BEGIN', '// FORGE_UX:END') + ';return {forgeCopyTreatment, forgeCopyGroups, forgeCopyBreakdown, forgeCountBadgeHTML};')(...names.map(k=> env[k]));
  const g = F.forgeCopyGroups('x'), show = g.map(x=> `Lv ${x.level} ${x.label} ×${x.uids.length}`);
  ok(g.length === 6, `8a. ten copies in six groups (${show.join(' | ')})`);
  ok(g[0].level === 10 && /Hex/.test(g[0].label) && g[0].uids.length === 1, '8a. strongest first: the Lv 10 Hex foil');
  const plain10 = g.find(x=> x.level === 10 && x.label === 'Plain');
  ok(plain10 && plain10.uids.length === 4 && plain10.pick === 'f', `8a. "Lv 10 · Plain ×4", and a tap picks the copy with Forge credit (${plain10 && plain10.pick})`);
  ok(g.some(x=> x.level === 10 && /Alt art/.test(x.label)) && g.some(x=> x.level === 1 && /Shiny/.test(x.label)), '8a. alt art and Shiny are their own groups');
  ok(g.map(x=> x.level).join(',') === [...g.map(x=> x.level)].sort((a, b)=> b - a).join(','), '8a. groups run from the highest level down');
  const bd = F.forgeCopyBreakdown('x');
  ok(/^Plain ×7/.test(bd) && /Hex ×1/.test(bd) && /Shiny ×1/.test(bd) && /Alt art ×1/.test(bd), `8b. the breakdown by treatment (${bd})`);
  const badge = F.forgeCountBadgeHTML('x');
  ok(/>×10</.test(badge) && /You own 10: Plain ×7/.test(badge), '8b. the badge says ×10 with the breakdown as its tip');
  ok(F.forgeCountBadgeHTML('none') === '', '8b. no badge for a card you do not own');
}
// the Forge wiring
{
  const rf = fnSrc('renderForge');
  ok(/forgeCountBadgeHTML\(id\)/.test(rf) && /wireForgeCountBadges\(poolEl\)/.test(rf), '8b. every pool tile carries its count badge');
  ok(/forgeCopiesWorthASheet\(forgeSelectedId\)\) openForgeCopySheet\(forgeSelectedId\)/.test(rf) && /data-forge-copies/.test(rf), '8a. picking a card opens the copies sheet; the anvil\'s button opens it again');
  ok(/data-forge-copies/.test(fnSrc('forgeCopyPickerHTML')) && /forgeCopyPickerHTML\(id\)/.test(fnSrc('forgeAnvilHTML')) && /forgeCopyPickerHTML\(id\)/.test(fnSrc('refineAnvilHTML')), '8a. Upgrade and Refine show the copy summary');
  ok((src.match(/await forgeCentreStage\(/g) || []).length >= 5, '8c. temper, refine, limit break, promote and prestige play on the centre stage');
  ok(/forgeCentreStage\(play, \{el: panel/.test(fnSrc('energyForgeCelebrate')), '8c. forging Max Energy lifts its panel to the centre stage too');
  ok(/if\(!centred\) metaFx\('levelUp'/.test(fnSrc('forgeTemper')), '8c. the LEVEL burst plays once (centred, or on the anvil)');
  const cs = fnSrc('forgeCentreStage');
  ok(/reducedMotion\(\)/.test(cs) && /fxLevel\(\) === 'none'/.test(cs) && /ph\.replaceWith\(stage\)/.test(cs), '8c. reduced motion / Effects None stay put; the stage always goes back');
}
// ---- 7: the tutorial summary
{
  ok(/sumNode = isTut \? tutorialSummaryNode\(selectedNode\) : selectedNode/.test(src) && /isTut \? '' : skirmishFieldHTML\(map\.id, selectedNode\)/.test(src), '7. a tutorial node is summed up like a skirmish, with no Field panel');
  ok(/Object\.entries\(sumNode\.deck\|\|\{\}\)/.test(src) && /enemyDeckLevel\(sumNode\)/.test(src) && /castleLineHTML\(sumNode\)/.test(src), '7. its deck strip, BR and Health come from the tutorial\'s own fight');
  ok(/tutorialDecksFor\(st, loadFactionChoice\(\) \|\| 'both'\)\.rival/.test(fnSrc('tutorialSummaryNode')), '7. the deck is the one startTutorialMatch deals (tutorialDecksFor ... .rival)');
  const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
  // eslint-disable-next-line no-eval
  const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
  const tuts = MAPS.flatMap(m=> m.nodes.filter(x=> x.kind === 'tutorial'));
  ok(tuts.length === 2 && tuts.every(t=> !Object.keys(t.deck || {}).length), '7. the tutorial nodes\' own decks are empty (the tutorial never reads them): the panel must not use them');
}
// ---- texts
{
  const keys = Object.keys(TEXT).filter(k=> k.startsWith('ui.ux-'));
  ok(keys.length >= 18, `TX keys (${keys.length})`);
  ok(keys.every(k=> src.includes(`TX('${k}'`)), 'every ui.ux- key is used by its literal name: ' + keys.filter(k=> !src.includes(`TX('${k}'`)).join(', '));
  const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  CODES.forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); const miss = keys.filter(k=> !pack[TEXT[k]]); ok(!miss.length, `pack ${c} has every new text (${miss.join(', ')})`); });
  ok(/<style id="uxStyles">/.test(tpl) && /\.ux-fcs-grid\{/.test(tpl) && /\.ux-fc-ov\{/.test(tpl) && /\.ux-kind\b/.test(tpl) && /\.ux-copy-count\{/.test(tpl), 'the CSS');
  ok(/^## 2026-10-19 \(package UX/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');
}

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html'), OUT = path.join(ROOT, 'docs', 'screens', 'ux');
  if(SHOTS) fs.mkdirSync(OUT, {recursive:true});
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const QUIET = '[class^="coach-"], .coach-tip, .coach-pointer, .coach-spotlight, .coach-shield, .dlg-overlay, .dialogue-overlay, .toast{display:none !important;}';
  // eleven Ant Scouts: five Plain at Lv 10, a Hex foil at Lv 10, alt art at Lv 10, Lv 3 and Lv 2 Plain, two Lv 1 (one Shiny)
  const GIVE = `(()=>{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); copyModelOn();
    const mk = (level, x)=> Object.assign({uid: newCopyUid(), level, foil:false}, x || {});
    myCardCopies['ant-scout'] = [mk(10), mk(10), mk(10), mk(10), mk(10), mk(10, {foil:true, finish:'hex'}), mk(10, {skin:'alt'}), mk(3), mk(2), mk(1), mk(1, {shiny:true})];
    myCardLevels['ant-scout'] = 10; try{ saveCardCopies(); }catch(e){} try{ saveCardLevels(); }catch(e){}
    try{ const defs = getCardDefs(); noteSighted(Object.keys(defs).filter(id=> isStructure(defs[id]) && !defs[id].test).slice(0, 12)); }catch(e){}
    window.playDialogue = ()=> null; // no Cobble lines over the pictures
    myCurrencies.dust = 99999; myCurrencies.gold = 99999; window.levelGateNeed = ()=> 0; window.forgeTierFor = ()=> 0; invalidateCardDefs(); return 1; })()`;
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  try{
    for(const [w, h, mobile] of [[390, 844, true], [1366, 768, false]]){
      const tag = String(w);
      const ctx = await b.newContext({viewport:{width:w, height:h}, isMobile:mobile, hasTouch:mobile, deviceScaleFactor: mobile ? 2 : 1}); const pg = await ctx.newPage();
      pg.on('pageerror', e=> errs.push(tag + ': ' + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:120000}); await pg.waitForTimeout(2500);
      await pg.addStyleTag({content: QUIET});
      await pg.evaluate(GIVE);
      const shot = async name=>{ if(SHOTS) await pg.screenshot({path: path.join(OUT, `${name}-${tag}.png`)}); };
      const hscroll = ()=> pg.evaluate('document.documentElement.scrollWidth - innerWidth');
      // 7. the tutorial node's panel
      await pg.evaluate(`(()=>{ const m = CONQUEST_MAPS.find(m=> m.nodes.some(n=> n.key === 'tutorial')); conquestWorldView = false; conquestSelectedMap = m.id; conquestSelectedNodeKey = 'tutorial'; playSubTab = 'conquest'; switchTab('play'); try{ renderPlay(); }catch(e){} return 1; })()`);
      await pg.waitForTimeout(1200);
      const tut = await pg.evaluate(`(()=>{ const p = document.getElementById('conquestNodePanel'); if(!p || p.hidden) return null;
        const br = p.querySelector('.cnp-lvl-inline'); return {cards: p.querySelectorAll('.cnp-squad .cnp-sq-card').length, field: !!p.querySelector('.cnp-field'), br: br ? br.textContent.trim() : '', hp: (p.querySelector('.castle-line .cl-num') || {}).textContent, code: (p.querySelector('.sk-code') || {}).textContent}; })()`);
      ok(tut && tut.cards > 0, `${tag} 7. the tutorial panel lists its deck (${tut && tut.cards} cards)`);
      ok(tut && !tut.field, `${tag} 7. no Field panel on the tutorial`);
      ok(tut && /[1-9]/.test(tut.br), `${tag} 7. a real BR (${tut && tut.br})`);
      ok(tut && Number(tut.hp) > 0 && Number(tut.hp) < 28, `${tag} 7. the rival bramble's real Health (${tut && tut.hp}, not the map's 28)`);
      await shot('tutorial-summary');
      // 8b. the Forge pool's ×N badges
      await pg.evaluate("forgeMode = 'upgrade'; forgeFilter = 'all'; forgeDeckScope = 'all'; forgeSearch = 'Ant Scout'; forgeSelectedId = null; codexSubTab = 'forge'; switchTab('codex'); 1");
      await pg.waitForTimeout(900);
      const badge = await pg.evaluate(`(()=>{ const t = document.querySelector('#forgePool [data-ux-count="ant-scout"]'); return t ? {text: t.textContent, tip: t.getAttribute('title')} : null; })()`);
      ok(badge && badge.text === '×11' && /Plain ×8/.test(badge.tip) && /Hex ×1/.test(badge.tip), `${tag} 8b. the Ant Scout tile says ×11 with the breakdown (${badge && badge.tip})`);
      await pg.evaluate("document.getElementById('forgePool').scrollIntoView({block:'center'}); 1"); await pg.waitForTimeout(300);
      await shot('forge-pool');
      if(mobile){ await pg.dispatchEvent('#forgePool [data-ux-count="ant-scout"]', 'pointerdown', {pointerType:'touch'}); await pg.waitForTimeout(650);
        ok(await pg.evaluate("[...document.querySelectorAll('.speech-bubble.ux-count-bubble')].some(b=> /Plain/.test(b.textContent))"), `${tag} 8b. a long press shows the breakdown`);
        await pg.dispatchEvent('#forgePool [data-ux-count="ant-scout"]', 'pointerup', {pointerType:'touch'}); await shot('forge-count-longpress'); await pg.waitForTimeout(400); }
      // 8a. picking the card opens the copies sheet
      await pg.click('#forgePool .card-tile[data-defid="ant-scout"]'); await pg.waitForTimeout(700);
      const sheet = await pg.evaluate(`(()=>{ const s = document.querySelector('.ux-fcs'); if(!s) return null; const g = [...s.querySelectorAll('.ux-fcs-g')];
        const grid = s.querySelector('.ux-fcs-grid'), r = s.getBoundingClientRect();
        return {groups: g.length, labels: g.map(x=> x.querySelector('.ux-fcs-lbl b').textContent + ' ' + x.querySelector('.ux-fcs-lbl small').textContent.trim() + (x.querySelector('.ux-fcs-n') ? ' ' + x.querySelector('.ux-fcs-n').textContent : '')), on: s.querySelectorAll('.ux-fcs-g.on').length,
          scrolls: getComputedStyle(grid).overflowY, fits: r.left >= 0 && r.right <= innerWidth + 0.5}; })()`);
      ok(sheet && sheet.groups === 7, `${tag} 8a. the sheet shows every copy in groups (${sheet && sheet.labels.join(' | ')})`);
      ok(sheet && /Lv 10 Plain ×5/.test(sheet.labels.join('|')) && sheet.on === 1, `${tag} 8a. "Lv 10 Plain ×5", and the copy on the anvil is marked`);
      ok(sheet && sheet.scrolls === 'auto' && sheet.fits, `${tag} 8a. the grid scrolls and the sheet fits the screen`);
      await shot('forge-copies-sheet');
      // pick the Lv 2 copy
      await pg.evaluate(`(()=>{ const g = [...document.querySelectorAll('.ux-fcs-g')].find(x=> x.querySelector('.ux-fcs-lbl b').textContent.trim() === 'Lv 2'); if(g) g.click(); return !!g; })()`); await pg.waitForTimeout(600);
      const anvil = await pg.evaluate(`(()=>{ const c = document.querySelector('.ux-fcp .ux-fcp-cur'); return {cur: c ? c.textContent.replace(/\\s+/g, ' ').trim() : '', sheet: !!document.querySelector('.ux-fcs-ov'), label: (document.querySelector('.forge-level-label') || {}).textContent}; })()`);
      ok(anvil && !anvil.sheet && /Lv 2/.test(anvil.cur) && /Lv 2/.test(anvil.label || ''), `${tag} 8a. a pick closes the sheet and puts that copy on the anvil (${anvil && anvil.cur} / ${anvil && anvil.label})`);
      await pg.evaluate("document.getElementById('forgeDetail').scrollIntoView({block:'center'}); 1"); await pg.waitForTimeout(300);
      await shot('forge-anvil');
      ok(await hscroll() <= 1, `${tag} no sideways scroll in the Forge`);
      // 8c. temper on the centre stage
      await pg.click('#forgeLevelUpBtn'); await pg.waitForTimeout(1300);
      const mid = await pg.evaluate(`(()=>{ const o = document.querySelector('.ux-fc-ov'), s = o && o.querySelector('#anvilStage'); if(!s) return null; const r = s.getBoundingClientRect();
        return {cx: Math.round(r.left + r.width / 2 - innerWidth / 2), cy: Math.round(r.top + r.height / 2 - innerHeight / 2), w: Math.round(r.width)}; })()`);
      ok(mid && Math.abs(mid.cx) <= 12 && Math.abs(mid.cy) <= 30, `${tag} 8c. the anvil stage is in the middle of the screen while it forges (${JSON.stringify(mid)})`);
      await shot('forge-centre-stage');
      await pg.waitForTimeout(4200);
      const after = await pg.evaluate(`(()=>({ov: !!document.querySelector('.ux-fc-ov'), inPanel: !!document.querySelector('#forgeDetail #anvilStage'), label: (document.querySelector('.forge-level-label') || {}).textContent}))()`);
      ok(after && !after.ov && after.inPanel && /Lv 3/.test(after.label || ''), `${tag} 8c. it returns to the anvil, tempered (${after && after.label})`);
      // 9 + 11. the Codex
      await pg.mouse.move(2, h - 2); // no hover popover from where the last click was
      await pg.evaluate("codexSubTab = 'browse'; codexFilter.kind = ''; codexFilter.q = ''; switchTab('codex'); 1"); await pg.waitForTimeout(1500);
      const kinds = await pg.evaluate(`(()=>{ const r = document.getElementById('cxKindRow'); if(!r) return null; return {chips: [...r.querySelectorAll('[data-cxkind]')].map(b=> b.dataset.cxkind + ':' + b.querySelector('.ux-kind-n').textContent), empty: [...r.querySelectorAll('.ux-kind.is-empty')].map(b=> b.dataset.cxkind), base: !!r.querySelector('[data-cxlevel="base"].on')}; })()`);
      ok(kinds && kinds.chips.length === 6 && kinds.chips.every(c=> /:\d+$/.test(c)), `${tag} 11. six type chips with counts (${kinds && kinds.chips.join(' ')})`);
      ok(kinds && kinds.empty.includes('spell'), `${tag} 11. Spells shows at 0 (shelved)`);
      ok(kinds && kinds.base, `${tag} 9. Base level is on by default`);
      ok(await hscroll() <= 1, `${tag} no sideways scroll in the Codex`);
      await shot('codex-types');
      await pg.click('[data-cxkind="structure"]'); await pg.waitForTimeout(900);
      const st = await pg.evaluate(`(()=>{ const defs = getCardDefs(), t = [...document.querySelectorAll('#codexGrid .card-tile[data-defid]')].map(e=> e.dataset.defid); return {n: t.length, all: t.every(id=> isStructure(defs[id]))}; })()`);
      ok(st.n > 0 && st.all, `${tag} 11. Structures shows only structures (${st.n})`);
      await shot('codex-structures');
      await pg.evaluate("codexFilter.kind = ''; codexFilter.q = 'Ant Scout'; renderCodexGrid(); 1"); await pg.waitForTimeout(800);
      await pg.evaluate("openCardDetail('ant-scout', {codex:true}); 1"); await pg.waitForTimeout(600);
      const cd = await pg.evaluate(`(()=>{ const c = document.getElementById('uxCdLevel'), atk = document.querySelector('.card-detail-card .card-pop-visual .card-tile .atk'); return {chip: c ? c.textContent : '', atk: atk ? parseInt(atk.textContent, 10) : null}; })()`);
      const lv = await pg.evaluate("(()=>{ const d = getCardDefs()['ant-scout'], L = cardBaseLevel(CARD_DEFS_BASELINE['ant-scout']), b = statsAtLevel(CARD_DEFS_BASELINE['ant-scout'], L); return {best: d.attack, base: b.attack, L}; })()");
      ok(/Base level/.test(cd.chip) && cd.chip.includes('Lv ' + lv.L + ' ') && cd.atk === lv.base, `${tag} 9. the detail shows the card at its base level (${cd.chip}, ⚔ ${cd.atk}; base ${lv.base}, best ${lv.best})`);
      await shot('codex-detail-base');
      await pg.click('#uxCdLevel'); await pg.waitForTimeout(600);
      const cd2 = await pg.evaluate(`(()=>{ const c = document.getElementById('uxCdLevel'), atk = document.querySelector('.card-detail-card .card-pop-visual .card-tile .atk'); return {chip: c ? c.textContent : '', atk: atk ? parseInt(atk.textContent, 10) : null, saved: localStorage.getItem('bramblewood_codex_level_v1')}; })()`);
      ok(/My best/.test(cd2.chip) && /Lv 10/.test(cd2.chip) && cd2.atk === lv.best && cd2.saved === 'best', `${tag} 9. the toggle shows your best and is remembered (${cd2.chip}, ⚔ ${cd2.atk})`);
      await shot('codex-detail-best');
      await pg.evaluate("localStorage.setItem('bramblewood_codex_level_v1', 'base'); 1");
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
}
browser().then(()=>{ console.log(fail ? `ux-2026-10-19: ${fail} of ${n} FAILED` : `ux-2026-10-19: all ${n} passed`); process.exit(fail ? 1 : 0); },
  e=>{ console.log('  ✗ browser part crashed:', e && e.stack || e); console.log(`ux-2026-10-19: FAILED`); process.exit(1); });
