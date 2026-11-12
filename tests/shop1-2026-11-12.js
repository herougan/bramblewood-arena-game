#!/usr/bin/env node
// 2026-11-12 (package SHOP1, owner note 4): the Shop is split into the normal Shop and the Premium shop; the Rename Ticket (and the
// Gold Leaf Raid Ticket) sit in Premium, packs/kit/bread stay in the normal shop; prices and purchase code are untouched.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const texts = require(path.join(ROOT, 'bramblewood-texts.js'));
const TX = texts.TX || (globalThis.BramblewoodTexts && globalThis.BramblewoodTexts.TX);
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), d = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) break; } }
  return src.slice(a + 1, i + 1);
}
const rows = fnSrc('shelfRows');
ok(/let shopMode = 'normal'/.test(src), 'shopMode defaults to normal');
ok(/prem && shopTicketOnShelf\(\)/.test(rows), 'Rename Ticket only on the Premium shelf');
ok(/prem && shopRaidTicketOnShelf\(\)/.test(rows), 'Raid Ticket (Gold Leaves) only on the Premium shelf');
ok(/prem \? \[\] : packs\.map/.test(rows) && /!prem && shopKitToday\(\)/.test(rows) && /prem \? \[\] : \[\{bread:true/.test(rows), 'packs, kit and bread only in the normal shop');
ok(/!prem && onSale\.length === 1/.test(rows), 'pack bundles only in the normal shop');
const rs = fnSrc('renderShop');
ok(/data-shopmode/.test(rs) && /ui\.shop1-normal/.test(rs) && /ui\.shop1-premium/.test(rs), 'entry: Shop | Premium switch');
ok(/is-premium-shop/.test(rs) && /is-premium-shop/.test(tpl), 'Premium look class in JS and CSS');
ok(/shopMode = 'premium'; shopSelected = 'ticket:1'/.test(src), 'the guild "Shop" link opens Premium on the ticket');
ok(/RENAME_TICKET_PRICE/.test(fnSrc('shopTicketCounter')) && /RAID_TICKET_ITEM_COST = \{gold:400, gems:5\}/.test(src), 'prices and purchase code unchanged');
const css = (tpl.match(/\.shop-mode[^\n]*|#view-shop\.is-premium-shop[^\n]*/g) || []).join('\n');
ok(css && !/#[0-9a-fA-F]{3,6}\b/.test(css) && !/rgb\(/.test(css), 'new CSS uses tokens only');
ok(!fs.existsSync(path.join(ROOT, 'supabase/migrations/20261112_shop1.sql')), 'no server check ties an item to a shop id: nothing applied');
for(const k of ['modes', 'normal', 'premium', 'premium-empty']){
  ok(typeof TX === 'function' && TX('ui.shop1-' + k) && TX('ui.shop1-' + k) !== 'ui.shop1-' + k, 'text ui.shop1-' + k);
  for(const l of ['fr','de','es','it','pt','tl','ta','id','zh-Hans','zh-Hant','ja','ko']) ok(fs.existsSync(path.join(ROOT, 'lang', l + '.json')), 'pack ' + l);
}
console.log(fail ? 'shop1: ' + fail + ' failed' : 'shop1: all passed');
process.exit(fail ? 1 : 0);
