#!/usr/bin/env node
// 2026-11-11 (package UI46, owner 00:06): source checks for (1) the pack opening's pencil off the "xN" copy badge, (2) the wandering merchant's menu on every click,
// (3) the Codex's Create card in the row of tabs. The browser measures at 1366 and 390 are in tests/e2e/ui46_2026_11_11.py.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), html = rd('index.html');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const k = app.indexOf('\n', i), line = app.slice(i, k); if(/\}\s*(\/\/.*)?$/.test(line) && !/\{\s*(\/\/.*)?$/.test(line)) return line; const j = app.indexOf('\n}\n', i); return app.slice(i, j + 2); };
const rule = (css, sel)=>{ const m = css.match(new RegExp(sel.replace(/[.+*?()[\]{}|\\^$]/g, '\\$&') + '\\s*\\{([^}]*)\\}')); return m ? m[1] : null; };

// ---- 1. pack opening: the pencil and the copy badge never share a corner
{ const pen = rule(tpl, '.po2-sum-card .po-ed-edit'), badge = rule(tpl, '.po2-x');
  ok(pen && badge, 'both rules exist');
  const num = (r, p)=>{ const m = r.match(new RegExp('(?:^|[;\\s])' + p + ':\\s*(-?[\\d.]+)(px|%)?')); return m ? {v: +m[1], u: m[2] || ''} : null; };
  const bt = num(badge, 'top'), br = num(badge, 'right');
  ok(bt && br && bt.v < 0 && br.v < 0, 'the copy badge stays at the top-right corner (negative top and right): ' + badge.trim());
  const pt = num(pen, 'top');
  ok(pt && pt.u === '%' && pt.v >= 60 && pt.v <= 66 && /translate:\s*0 -50%/.test(pen), 'the pencil hangs from the right edge below the middle (top ~64%, pulled up by half its height), not in the top corner: ' + pen.trim());
  const wd = num(pen, 'width'), ht = num(pen, 'height');
  ok(wd && ht && wd.v >= 24 && wd.v <= 28 && ht.v === wd.v, 'the pencil is 24-28px (fits the gap between the NEW! tags and the stat plates, still a 24px target): ' + (wd && wd.v));
  ok(/left:\s*auto/.test(pen) && /right:\s*-?\d+px/.test(pen), 'the pencil hangs from the right edge');
  ok(/class="ed-edit-card po-ed-edit"/.test(app) && (app.match(/\$\{poEditBtn\(/g) || []).length === 3, 'the same pencil in all three summaries (one card, Open all, all packs)');
  ok(!/po-ed-edit|data-po-edit/.test(fn('showReveal')) && !/data-po-edit/.test(app.slice(app.indexOf('const cardsHTML = o=>'), app.indexOf('let deckO = null;'))), 'the one-at-a-time reveal has no pencil (its "xN" stack badge is free)'); }

// ---- 2. wandering merchant: his menu opens on every click
{ const v = fn('visitWanderer'), o = fn('openWandererDeal');
  ok(/openWandererDeal\(w\)/.test(v) && !/bought/.test(v) && /showSpeechBubble\(el/.test(v), 'a click always plays the speech and opens the menu; visitWanderer never looks at "bought"');
  ok(!/if\(st\.bought\)|st\.bought \?[^:]*<button type="button" class="btn primary" data-wd-close>Bye/.test(o), 'the old "already sold" Bye-only dialog is gone');
  ok(/rows\.push\(\{pack:p,.*sold:!!st\.bought, soldText:'Bought today'/.test(o), 'the daily deal is a row; sold = bought today, shown "Bought today"');
  ok(/rows\.push\(\{pack:mp,[^}]*sold:!mysteryPacksLeft\(\), soldText:'Sold out', buy:\(\)=> buyPack\(mp\.id, null, 1\)/.test(o), 'the Mystery Boosters are a row; sold out at the last one; bought through buyPack (the shop path)');
  ok(/data-wd-buy="\$\{i\}"/.test(o) && /rows\[\+b\.dataset\.wdBuy\]\.buy\(\)/.test(o) && /requireSignIn\('to buy packs'/.test(o), 'every unsold row has its own Buy button, behind the sign-in gate');
  ok(/if\(!rows\.length\)/.test(o) && /Nothing on the barrow for you today/.test(o), 'only a barrow with nothing on it says so');
  ok(/live\.length \? 'Not today' : 'Bye'/.test(o), 'the close button says Not today while something is for sale, Bye when all is sold');
  // the helper both the menu and the Shops card use
  const stub = (mystery, anytime, left, bought)=> new Function(`const MYSTERY_PACK_ID = 'mystery'; const getShopPacks = ()=> ${mystery ? `[{id: 'mystery', anytime: ${anytime}}]` : '[]'}; const mysteryPacksLeft = ()=> ${left}; const wandererState = ()=> ({mystery: ${bought}});` + fn('wandererMysteryPack') + 'return wandererMysteryPack();')();
  ok(stub(true, false, 5, 0) && stub(true, false, 2, 3) && stub(true, false, 0, 5), 'Mystery row: listed with some left, and listed (sold out) once any were bought');
  ok(!stub(true, false, 0, 0) && !stub(true, true, 5, 0) && !stub(false, false, 5, 0), 'Mystery row: not listed before the wanderer sells them (Map 13), when they are on the shelf anytime, or when the pack is missing');
  ok(!/const mp = getShopPacks\(\)\.find\(x=> x\.id === MYSTERY_PACK_ID\); if\(!mp \|\| mp\.anytime\)/.test(fn('wanderingMerchantShopHTML')) && /wandererMysteryPack\(\)/.test(fn('wanderingMerchantShopHTML')), 'the Shops card uses the same helper (no second copy of the rule)'); }
ok(/\.wander-deal \.wd-offer\.is-sold\{opacity:/.test(tpl), 'a sold row is dimmed');

// ---- 3. Codex: Create card in the row of tabs
{ const f = fn('edCodexCreateBtn');
  ok(/if\(!body \|\| !adminModeEnabled/.test(f), 'still admin-only');
  ok(/getElementById\('codexToDeckBtn'\)/.test(f) && /insertAdjacentHTML\('beforebegin'/.test(f) && !/afterbegin/.test(f), 'it is inserted into the tab row, just before Deck (no line of its own above the toolbar)');
  ok(/class="btn primary small ed-cx-create"/.test(f) && /title="\$\{tip\}" aria-label="\$\{escapeAttr\(lbl\)\}"/.test(f) && /<span class="ed-cx-lbl">/.test(f), 'icon + label span, a tooltip and an accessible name (the same existing text)');
  ok(!/ed-cx-admin/.test(app) && !/\.ed-cx-admin/.test(tpl), 'the old .ed-cx-admin line is gone');
  ok(/\.codex-sub-tabs \.ed-cx-create\{margin-left:auto;\}/.test(tpl) && /\.ed-cx-create \+ \.subnav-right-btn\{margin-left:0;\}/.test(tpl), 'Create card takes the free space; Deck sits right after it (two auto margins would split it)');
  ok(/@media \(max-width:600px\)\{ \.codex-sub-tabs \.ed-cx-lbl\{display:none;\} \}/.test(tpl), 'phone width: label hidden, the 🆕 stays');
  ok(/\.codex-sub-tabs\{[^}]*flex-wrap:wrap/.test(tpl), 'the row wraps (never scrolls sideways)'); }
ok(/edCodexCreateBtn\(body\)/.test(fn('renderCodex')), 'the card browser still calls it');

// ---- no new text: every reused string is translated in the 12 packs
{ const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'], texts = rd('bramblewood-texts.js');
  const ui = {}; codes.forEach(c=> ui[c] = JSON.parse(rd('lang/ui/' + c + '.json')));
  ['Bought today', 'Sold out', 'Not today', 'Bye', 'Buy it · {v1}', 'Already sold you my best today. Same road tomorrow, maybe.', 'Nothing on the barrow for you today, friend. Come find me tomorrow.'].forEach(s=>{
    ok(codes.every(c=> typeof ui[c][s] === 'string' && ui[c][s]), 'translated in 12 packs: ' + s); });
  ok(texts.includes('"ui.ed-create-card": "Create card"') && texts.includes('"ui.ed-create-card-tip"'), 'Create card keeps its TX keys'); }
ok(html.includes('wandererMysteryPack') && html.includes('ed-cx-create') && html.includes('top:64%; translate:0 -50%'), 'index.html rebuilt');
console.log(fail ? 'FAIL ' + fail : 'ok', pass + ' checks'); process.exit(fail ? 1 : 0);
