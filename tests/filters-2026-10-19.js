#!/usr/bin/env node
// 2026-10-18 (owner 21:18: "The text filters in all my texts in the Bramble game UI don't reset when I refresh the explorer (I'm
// using Chrome) or when I move between pages in game"). Static + stub-DOM checks, no browser:
//   1. every free-text filter / search box in arena_app.js and arena_template.html is marked data-text-filter and has
//      autocomplete="off" (Chrome's form restore and autofill skip it); no data-text-filter box lacks it;
//   2. the sticky filters (uiSticky / uiStickySave, 2026-10-16) keep the non-text choices but never save or read back a free-text
//      query ('q', the Camp's 'deckSearch'); stickyControls skips text boxes;
//   3. resetTextFilterState() empties every page's remembered query (Codex, Skill Codex, Forge, Flea Market, Sandbox, Admin cards,
//      the sim pools, the Test Kit, the Effects library, Friends search) and leaves the non-text choices alone;
//   4. resetTextFilters(root) clears every marked box under root and fires 'input' on the ones that held text (so the list redraws),
//      none with {silent:true};
//   5. syncTextFilterPage() resets on a new page key (tab + Codex / Play sub-tab) and not on a redraw of the same page; switchTab,
//      renderCodex and renderPlay call it, switchTab before the page draws; `pageshow` calls resetTextFilters.
// The browser side (a typed filter is gone after a reload and after a page switch) is in tests/e2e/filters_2026_10_19.py.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}

// ---- 1. the boxes
const inputs = [];
for(const [file, text] of [['arena_app.js', src], ['arena_template.html', tpl]]) for(const m of text.matchAll(/<input\b[^>]*>/g)) inputs.push({file, tag: m[0]});
const isFilter = t=> /type="search"/.test(t) || /(placeholder|aria-label)="[^"]*\b(search|filter)/i.test(t) || /placeholder="Friend code/.test(t);
const filters = inputs.filter(x=> isFilter(x.tag));
ok(filters.length >= 20, `found the text filter boxes (${filters.length})`);
filters.forEach(x=> ok(/\bdata-text-filter\b/.test(x.tag) && /autocomplete="off"/.test(x.tag), `${x.file}: marked data-text-filter + autocomplete="off": ${x.tag.slice(0, 110)}`));
inputs.filter(x=> /\bdata-text-filter\b/.test(x.tag)).forEach(x=> ok(/autocomplete="off"/.test(x.tag) && !/type="(checkbox|number|range|radio)"/.test(x.tag), `${x.file}: a data-text-filter box is a text box with autocomplete="off": ${x.tag.slice(0, 110)}`));
for(const id of ['cxSearch', 'skFilterInput', 'forgeSearch', 'mkQ', 'deckSearch', 'sbxSearch', 'adminCardSearchInput', 'frSearchInput', 'tkSearch', 'tkSkillSearch', 'fxlSearch', 'lpSearch', 'dbpSearch', 'stdSearch', 'seSearch', 'reSearch', 'nrSearch', 'deQ'])
  ok(filters.some(x=> x.tag.includes(`id="${id}"`)), `#${id} is one of them`);
ok(filters.some(x=> x.tag.includes('poolFilter${side}')) && filters.some(x=> x.tag.includes('sg-search')), 'the sim pools and the skirmish gallery are too');

// ---- 2-5. the helpers, run in a stub page
const a = src.indexOf('const UI_FILTERS_KEY = '), b = src.indexOf('\nfunction stickyControls(');
const c = src.indexOf('\n', src.indexOf('\nlet codexFilter = ', b) + 1) + 1; // through the Codex's own filter state
ok(a > 0 && b > a && c > b, 'the sticky / text filter helpers are found in arena_app.js');
const helpers = src.slice(a, c);
function makeEl(id, value, type){
  const ev = [];
  return {id, value, type: type || 'search', tagName: 'INPUT', attrs: {'data-text-filter': ''}, events: ev, listeners: {},
    setAttribute(k, v){ this.attrs[k] = v; }, matches(sel){ return sel === 'input[data-text-filter]' && 'data-text-filter' in this.attrs; },
    dispatchEvent(e){ ev.push(e.type); return true; }, addEventListener(t, f){ (this.listeners[t] = this.listeners[t] || []).push(f); }};
}
function stubPage(){
  const store = {}, winL = {};
  const els = {cxSearch: makeEl('cxSearch', 'otter'), mkQ: makeEl('mkQ', 'bee'), deckSearch: makeEl('deckSearch', 'moss', 'text'), sbxSearch: makeEl('sbxSearch', '', 'text')};
  const sortEl = {id: 'deckSort', value: 'cost', type: 'select-one', tagName: 'SELECT', options: [{value: 'cost'}, {value: 'attack'}], matches: ()=> false, listeners: {}, addEventListener(t, f){ (this.listeners[t] = this.listeners[t] || []).push(f); }};
  els.deckSort = sortEl;
  const ctx = {
    console, JSON, Object, String, Event: class { constructor(t){ this.type = t; } },
    localStorage: {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }},
    document: {getElementById: id=> els[id] || null, querySelectorAll: sel=> sel === 'input[data-text-filter]' ? Object.values(els).filter(e=> e.matches(sel)) : []},
    window: {addEventListener: (t, f)=>{ winL[t] = f; }},
  };
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  // the page state resetTextFilterState() empties (declared further down arena_app.js; plain vars here)
  vm.runInContext(`var currentTab = 'codex', codexSubTab = 'browse', playSubTab = 'conquest';
    var skillCodexQuery = 'fly', forgeSearch = 'oak', sandboxSearch = 'yeti', adminCardSearch = 'bee', simFilter = {A:'a', B:'b'};
    var Market = {q:'gold', rarity:'rare', sort:'cheap'}, testKit = {search:'s', skillSearch:'k', sel:'x'}, fxLib = {search:'f', speed:1};
    var Social = {searchTerm:'moss', searchResults:[1], friends:[2]};`, ctx);
  vm.runInContext(helpers + '\nthis.__h = {uiSticky, uiStickySave, stickyControls, resetTextFilterState, resetTextFilters, syncTextFilterPage, codexFilter, UI_FILTERS_KEY, TEXT_FILTER_SEL};', ctx);
  return {ctx, els, store, winL, h: ctx.__h};
}
{
  // 2. sticky without text
  const P = stubPage();
  P.store[P.h.UI_FILTERS_KEY] = JSON.stringify({codex: {q: 'old', sort: 'cost', archetype: 'Forest'}, camp: {deckSearch: 'moss', deckSort: 'attack'}, market: {q: 'x', rarity: 'rare'}});
  ok(P.h.uiSticky('codex').q === undefined && P.h.uiSticky('codex').sort === 'cost' && P.h.uiSticky('codex').archetype === 'Forest', 'uiSticky: a saved Codex query is not read back; sort and type stay');
  ok(P.h.uiSticky('camp').deckSearch === undefined && P.h.uiSticky('camp').deckSort === 'attack', 'uiSticky: the Camp search is not read back; its sort stays');
  P.h.uiStickySave('market', {q: 'new', sort: 'dear'});
  const saved = JSON.parse(P.store[P.h.UI_FILTERS_KEY]).market;
  ok(!('q' in saved) && saved.rarity === 'rare' && saved.sort === 'dear', `uiStickySave: never writes a query, keeps the rest: ${JSON.stringify(saved)}`);
  P.h.stickyControls('camp', ['deckSearch', 'deckSort']);
  ok(P.els.deckSearch.value === 'moss' && !P.els.deckSearch.listeners.input, 'stickyControls: leaves the text box alone (no restore, no save)');
  ok(P.els.deckSort.value === 'attack' && P.els.deckSort.listeners.change, 'stickyControls: still restores and saves the sort');
  ok(P.h.codexFilter.q === '', 'the Codex starts with an empty query even with an old one saved');
}
{
  // 3 + 4. reset
  const P = stubPage(), C = P.ctx;
  P.h.codexFilter.q = 'otter'; P.h.codexFilter.sort = 'name';
  P.h.resetTextFilterState();
  const st = vm.runInContext('({skillCodexQuery, forgeSearch, sandboxSearch, adminCardSearch, simFilter, Market, testKit, fxLib, Social})', C);
  ok(P.h.codexFilter.q === '' && P.h.codexFilter.sort === 'name', 'Codex: query emptied, sort kept');
  ok(st.skillCodexQuery === '' && st.forgeSearch === '' && st.sandboxSearch === '' && st.adminCardSearch === '', 'Skill Codex, Forge, Sandbox and Admin cards queries emptied');
  ok(st.simFilter.A === '' && st.simFilter.B === '', 'sim pool filters emptied');
  ok(st.Market.q === '' && st.Market.rarity === 'rare' && st.Market.sort === 'cheap', 'Flea Market: query emptied, rarity and sort kept');
  ok(st.testKit.search === '' && st.testKit.skillSearch === '' && st.testKit.sel === 'x', 'Test Kit: both searches emptied, the pick kept');
  ok(st.fxLib.search === '' && st.Social.searchTerm === '' && st.Social.searchResults === null && st.Social.friends.length === 1, 'Effects library and Friends search emptied (the friends list kept)');
  const n1 = P.h.resetTextFilters(C.document);
  ok(n1 === 3 && P.els.cxSearch.value === '' && P.els.mkQ.value === '' && P.els.deckSearch.value === '', `resetTextFilters: clears the 3 boxes that held text (${n1})`);
  ok(P.els.cxSearch.events.join() === 'input' && P.els.sbxSearch.events.length === 0, 'resetTextFilters: fires input on a cleared box (its list redraws), not on an empty one');
  ok(P.els.cxSearch.attrs.autocomplete === 'off', 'resetTextFilters: sets autocomplete=off');
  P.els.mkQ.value = 'again'; P.h.resetTextFilters(C.document, {silent: true});
  ok(P.els.mkQ.value === '' && P.els.mkQ.events.length === 1, 'resetTextFilters {silent:true}: clears without an input event');
  ok(typeof P.winL.pageshow === 'function', 'a pageshow listener is added');
  P.els.cxSearch.value = 'restored by Chrome'; vm.runInContext('Market.q = "x"', C); P.winL.pageshow({persisted: true});
  ok(P.els.cxSearch.value === '' && vm.runInContext('Market.q', C) === '', 'pageshow (a reload or a bfcache return) clears the boxes and the queries');
}
{
  // 5. page switches
  const P = stubPage(), C = P.ctx;
  P.h.syncTextFilterPage(); // first page: just remembered
  P.els.cxSearch.value = 'otter'; vm.runInContext("skillCodexQuery = 'fly'", C);
  P.h.syncTextFilterPage();
  ok(P.els.cxSearch.value === 'otter' && vm.runInContext('skillCodexQuery', C) === 'fly', 'a redraw of the same page keeps the typed filter');
  vm.runInContext("codexSubTab = 'skills'", C); P.h.syncTextFilterPage();
  ok(P.els.cxSearch.value === '' && vm.runInContext('skillCodexQuery', C) === '' && P.els.cxSearch.events.length === 0, 'a new Codex sub-tab: filters emptied, silently (the page draws itself)');
  P.els.mkQ.value = 'bee'; vm.runInContext("currentTab = 'market'", C); P.h.syncTextFilterPage();
  ok(P.els.mkQ.value === '', 'a new tab: filters emptied');
  P.els.mkQ.value = 'bee'; vm.runInContext("currentTab = 'play'; playSubTab = 'conquest'", C); P.h.syncTextFilterPage();
  vm.runInContext("playSubTab = 'sandbox'", C); P.els.sbxSearch.value = 'yeti'; P.h.syncTextFilterPage();
  ok(P.els.sbxSearch.value === '', 'a new Play sub-tab: filters emptied');
}
{
  const sw = fnSrc('switchTab'), at = sw.indexOf('currentTab = tab;'), sy = sw.indexOf('syncTextFilterPage()'), dr = sw.indexOf("safeRender('Home'");
  ok(at > 0 && sy > at && dr > sy, 'switchTab calls syncTextFilterPage() after currentTab = tab and before the page draws');
  ok(/^function renderCodex\(\)\{\n\s*syncTextFilterPage\(\);/.test(fnSrc('renderCodex')), 'renderCodex calls it first (Codex sub-tabs)');
  ok(/^function renderPlay\(\)\{\n[^\n]*\n\s*syncTextFilterPage\(\);/.test(fnSrc('renderPlay')), 'renderPlay calls it first (Play sub-tabs)');
  ok(/window\.addEventListener\('pageshow', \(\)=>\{ try\{ resetTextFilters\(document\); \}/.test(src), 'pageshow calls resetTextFilters(document)');
}
console.log(`filters: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
