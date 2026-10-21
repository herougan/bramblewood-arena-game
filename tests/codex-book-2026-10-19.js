#!/usr/bin/env node
// 2026-10-18 (package C, owner 20:31: "codex: skills - look like pages in a book. bestiary - look like a card album. overall collection
// score listed at the btm and in profile w/ achievements"; 20:36: "Skills and cards dont show up if you havent seen them before"):
//   1. album pages: a section starts a page, a long one runs on (cont.), 9 / 6 sleeves a page, an admin's empty skirmish gets its page
//   2. book pages: measured entries packed into pages, a chapter starts a page
//   3. reveal gating kept: the album gets the Codex's visible list (seen / owned, Hall of Fame out, revealAfter in the tile key); the
//      book lists only skills on cards you have seen or met in a fight, never SKILL_REVEAL-hidden ones, field effects once seen;
//      the basic-skill "?" hints
//   4. seen tracking: the seen list follows the account (PROGRESS_KEYS, union merge) and every save is migrated once (owned,
//      unlocked, discovered, every enemy deck of a cleared fight)
//   5. the collection score (Collection level: owned cards' levels) and its Codex bar
//   6. the Profile shows the score beside the achievements
//   7. every new string is a TX key, in the table, used, and in all 12 packs; the new templates carry no inline English
// 2026-10-19 (package CX, owner 14:07): 4 × 4 album pages; 10. short section names (TX keys, the detail in a tooltip), « » first /
// last, the turn tabs on the book (no bar below), Home / End
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const run = (names, ctx, expose)=>{ vm.createContext(ctx); vm.runInContext(names.map(fnSrc).join('\n') + `\n;this.R = {${expose || names.join(', ')}};`, ctx); return ctx.R; };
// The literal text of every template string in a piece of code (not the ${...} parts, which may hold templates of their own).
function templateTexts(s){
  const out = []; let i = 0;
  const skipStr = q=>{ i++; while(i < s.length && s[i] !== q){ if(s[i] === '\\') i++; i++; } i++; };
  const tmpl = ()=>{ i++; let buf = '';
    while(i < s.length && s[i] !== '`'){ if(s[i] === '\\'){ buf += s[i + 1]; i += 2; continue; } if(s[i] === '$' && s[i + 1] === '{'){ i += 2; code(true); buf += ' '; continue; } buf += s[i++]; }
    i++; out.push(buf); };
  const code = inner=>{ let depth = 0;
    while(i < s.length){ const c = s[i];
      if(c === '`'){ tmpl(); continue; } if(c === "'" || c === '"'){ skipStr(c); continue; }
      if(c === '/' && s[i + 1] === '/'){ while(i < s.length && s[i] !== '\n') i++; continue; }
      if(c === '{') depth++; else if(c === '}'){ if(!depth && inner){ i++; return; } depth--; }
      i++; } };
  code(false); return out;
}
const esc = s=> String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- 1. album pages
{ const R = run(['albumPaginate'], {});
  const A = {key:'a', label:'A'}, B = {key:'b', label:'B', nodeKey:'x'}, C = {key:'c', label:'', bare:true};
  const ids = k=> Array.from({length:k}, (_, i)=> 'c' + i);
  let pages = R.albumPaginate([{sec:A, ids:ids(20), all:ids(20)}, {sec:B, ids:[], all:[]}, {sec:C, ids:[], all:[]}], 9);
  ok(pages.length === 4, `1. 20 cards in 9-sleeve pages + an empty admin section = 4 pages (${pages.length})`);
  ok(pages[0].ids.length === 9 && pages[1].ids.length === 9 && pages[2].ids.length === 2, '1. 9, 9, then 2');
  ok(!pages[0].cont && pages[1].cont && pages[2].cont, '1. the pages after a section\'s first are (cont.)');
  ok(pages[3].sec === B && pages[3].ids.length === 0, '1. an empty section (an admin\'s skirmish) still gets its page; a bare empty one none');
  pages = R.albumPaginate([{sec:A, ids:ids(5), all:ids(5)}, {sec:B, ids:ids(7), all:ids(7)}], 6);
  ok(pages.length === 3 && pages[0].ids.length === 5 && pages[1].sec === B && pages[1].ids.length === 6 && pages[2].ids.length === 1, '1. a section starts its own page (phone: 6 a page)');
  // 2026-10-19 (package CX, owner 14:07: "Show 16 cards on each page"): 4 × 4 at every width (was 3 × 3, and 2 × 3 on a phone)
  ok(/w >= 960 \? \{pages:2, cols:4, rows:4, key:'2x16'\} : \{pages:1, cols:4, rows:4, key:'1x16'\}/.test(src), '1. two 4 × 4 pages wide, one 4 × 4 page (smaller cards) on a phone');
  { const R16 = run(['albumPaginate'], {}); const ids40 = Array.from({length:40}, (_, i)=> 'c' + i);
    const pg16 = R16.albumPaginate([{sec:{key:'a', label:'A'}, ids:ids40, all:ids40}], 16);
    ok(pg16.length === 3 && pg16[0].ids.length === 16 && pg16[1].ids.length === 16 && pg16[2].ids.length === 8, '1. 16 sleeves a page: 40 cards are 16, 16, 8'); }
  ok(/const shown = \[\]; for\(let k = 0; k < sides\.length; k\+\+\) shown\.push\(pages\[first \+ k\]\)/.test(src) && /sides\.map\(\(sd, k\)=> albumPageHTML\(pages\[codexPage \+ k\], codexPage \+ k, sd\)\)/.test(src), '1. only the open spread is drawn (album and book)');
  ok(/S\.tileFor\(id\)/.test(fnSrc('albumPageHTML')) && /codexTileCache\.set\(id, \{sig, html\}\)/.test(src), '1. the album\'s sleeves come from tileFor and its cache');
  ok(/ahead\.forEach\(p=> p\.ids\.forEach\(id=>\{ try\{ S\.tileFor\(id\); \}/.test(fnSrc('albumDraw')), '1. the next spread\'s tiles are built while idle');
}

// ---- 2. book pages
{ const R = run(['bookPaginate'], {});
  let pg = R.bookPaginate([100, 100, 100, 100, 100], 330, 10, null);
  ok(JSON.stringify(pg) === '[[0,1,2],[3,4]]', `2. 3 × 100 + 2 gaps fit 330, the 4th starts a page: ${JSON.stringify(pg)}`);
  pg = R.bookPaginate([30, 100, 100, 30, 100], 1000, 10, [true, false, false, true, false]);
  ok(JSON.stringify(pg) === '[[0,1,2],[3,4]]', `2. a chapter heading starts a page: ${JSON.stringify(pg)}`);
  pg = R.bookPaginate([500, 50], 300, 10, null);
  ok(JSON.stringify(pg) === '[[0],[1]]', '2. an entry taller than a page still gets one (it scrolls inside)');
  ok(/heights = \[\.\.\.meas\.children\]\.map\(c=> c\.offsetHeight \+ 1\)/.test(src) && /I\.translateTextNode\(n\)/.test(fnSrc('bookBuild')), '2. entries are measured at the page\'s width, as they will read (translated)');
  ok(/S\.pages = \[\{toc:true\}\]\.concat/.test(src) && /bk-az/.test(fnSrc('bookTocHTML')), '2. page 1 is the contents, with an A to Z index');
}

// ---- 3. reveal gating
{ const g = fnSrc('renderCodexGrid');
  const vis = g.indexOf("ids = ids.filter(id=> !isHofVariant(defs[id]) && codexVisible(id));"), album = g.indexOf('codexDrawAlbum(gEl,');
  ok(vis > 0 && album > vis, '3. the album draws the Codex\'s visible list (seen, owned, revealed packs; no Hall of Fame)');
  ok(/\(ra \? \(revealAfterMet\(ra\) \? 'R' : 'r'\) : '-'\)/.test(g), '3. the tile key still carries revealAfter (masked "?" tiles)');
  ok(/cx-tile-wrap\$\{owned \? '' : ' cx-unowned'\}/.test(g) && /\.cx-tile-wrap\.cx-unowned > \.card-tile\{filter:grayscale/.test(css), '3. seen-but-not-owned cards are dimmed; owned ones in full');
  // the book: only skills on seen cards or met in a fight
  const SKILL_DEFS = [{key:'flying', label:'Flying'}, {key:'armor', label:'Armor'}, {key:'bleed', label:'Bleed'}, {key:'stealth', label:'Stealth'}];
  const defs = {a:{id:'a', effects:{flying:true}}, b:{id:'b', effects:{armor:2}}, c:{id:'c', effects:{stealth:true}, test:true}};
  const ctx = {getCardDefs: ()=> defs, adminModeEnabled:false, isCardHiddenForPlayer: ()=> false, codexRevealedForPlayer: id=> id === 'a' || id === 'c', SKILL_DEFS, coachSeen: new Set(['skill-bleed', 'wait'])};
  const R = run(['skillBookSeen'], ctx);
  const met = [...R.skillBookSeen()].sort().join(',');
  ok(met === 'bleed,flying', `3. the book's skills: on a seen card (Flying) or met in a fight (Bleed), not on an unseen card (Armor) or a test card: ${met}`);
  ctx.adminModeEnabled = true; ok(R.skillBookSeen().has('armor'), '3. admins read every card\'s skills');
  const e = fnSrc('skillBookEntriesNow');
  ok(/!skillHiddenNow\(p\.key\) && \(adminModeEnabled \|\| met\.has\(p\.key\)\)/.test(e), '3. a skill SKILL_REVEAL still hides stays out, and so does one not seen');
  ok(/fieldRowState\(row\.key\) !== 'unknown'/.test(e) && /isMapUnlocked\(m, pr\)/.test(e), '3. field effects only once seen happen (fieldRowState: revealAfter gates too), on maps reached');
  ok(/skillHiddenNow\(k\) \? '' : \(SKILL_ICON\[k\]/.test(e) && /name:'\?'/.test(e) && /isMapUnlocked\(m, pr\)/.test(e), '3. a basic skill not seen yet is a "?" once its map is reached (no icon while hidden)');
  ok(/coachSeen\.has\('st-' \+ k\.k\) \|\| coachSeen\.has\('st-' \+ k\.name\.toLowerCase\(\)\) \|\| new RegExp\(k\.re\.source, 'i'\)\.test\(txts\)/.test(e) && /\{ch:'st', icon:'🌀', title:\(\)=> TX\('ui\.codex-statuses'\)/.test(src), '3. statuses: a chapter of their own, each once a seen skill names it or it was put on a unit in a fight');
  ok(/SKILL_CODEX_NOTE\[p\.key\]; if\(cx\) txt \+= ' ' \+ cx\(\);/.test(e), '3. package D\'s longer Codex notes are in the book');
  const hints = (src.match(/const BASIC_SKILL_HINTS = \[([^\]]*)\]/) || [])[1] || '';
  const keys = hints.split(',').map(s=> s.trim().replace(/'/g, '')).filter(Boolean);
  ok(keys.length >= 6 && keys.length <= 10, `3. 6 to 10 basic skills hint (${keys.join(', ')})`);
  ok(keys.every(k=> new RegExp(`\\{key:'${k}', category:'passive'`).test(src)), '3. each is a real skill');
  { const I = run(['skillIntroMaps'], {getCardDefs: ()=> ({x:{effects:{flying:true}}, y:{effects:{armor:1}}}), SKILL_DEFS: [{key:'flying', get: e=> e.flying}, {key:'armor', get: e=> e.armor}], PASSIVE_DEFS: [],
      CONQUEST_MAPS: [{id:'m0', nodes:[{deck:{}}]}, {id:'m1', nodes:[{deck:{x:2}}]}, {id:'m2', reserved:true, nodes:[{deck:{y:1}}]}, {id:'m3', nodes:[{deck:{y:1, x:1}}]}]});
    const r = I.skillIntroMaps(['flying', 'armor']); ok(r.flying.id === 'm1' && r.armor.id === 'm3', '3. a hint waits for the first (unreserved) map that brings its skill'); }
}

// ---- 4. seen tracking + migration
{ const store = {bramblewood_arena_seen: JSON.stringify(['a'])};
  const localStorage = {getItem: k=> k in store ? store[k] : null, setItem: (k, v)=>{ store[k] = String(v); }};
  const ctx = {localStorage, SEEN_KEY:'bramblewood_arena_seen', SEEN_MIGRATED_KEY:'bramblewood_arena_seen_v2', mySeenCardIds:null, seenMigrated:false,
    myDiscoveredCardIds: new Set(['d']), myCardCopies: {b:[{}], z:[]}, myUnlockedCardIds: new Set(['c']),
    loadConquestProgress: ()=> ({completed:['m1:n1']}), conquestNodeId: (m, k)=> m + ':' + k,
    CONQUEST_MAPS: [{id:'m1', nodes:[{key:'n1', deck:{e:3}}, {key:'n2', deck:{f:1}}]}], JSON, Set, Object};
  vm.createContext(ctx); vm.runInContext(fnSrc('seenCardIds') + '\n;this.seenCardIds = seenCardIds;', ctx);
  const s1 = [...ctx.seenCardIds()].sort().join(',');
  ok(s1 === 'a,b,c,d,e', `4. migration: kept a, owned b, unlocked c, discovered d, cleared fight's deck e (not f, not 0-copy z): ${s1}`);
  ok(store.bramblewood_arena_seen_v2 === '1' && JSON.parse(store.bramblewood_arena_seen).length === 5, '4. saved, and marked migrated');
  ctx.mySeenCardIds = null; ctx.myCardCopies = {q:[{}]}; store.bramblewood_arena_seen = JSON.stringify(['a', 'x']);
  const s2 = [...ctx.seenCardIds()].sort().join(',');
  ok(s2 === 'a,x', `4. once migrated, a list pulled from the account is read back as it is: ${s2}`);
  ok(/PROGRESS_KEYS\.push\(SEEN_KEY\); PROGRESS_MERGE_KEYS\[SEEN_KEY\] = PROGRESS_MERGE_KEYS\['bramblewood_arena_discovered'\];/.test(src), '4. the seen list follows the account, merged as a union');
  ok(/mySeenCardIds = null; \/\/ 2026-10-18 \(package C\): read the merged seen list back/.test(fnSrc('livePullProgress').replace(/^\nasync /, '\n') || src), '4. a pull reads the merged list back');
  const merge = eval('(' + (src.match(/'bramblewood_arena_discovered': (\(a,b\)=> JSON\.stringify\(Array\.from\(new Set\(\[[^\n]*\]\)\)\)),/) || [])[1] + ')');
  ok(JSON.stringify(JSON.parse(merge('["a","b"]', '["b","c"]')).sort()) === '["a","b","c"]', '4. two devices\' lists merge as a union');
  for(const f of ['noteSighted']) ok(/seenCardIds\(\)/.test(fnSrc(f)), `4. ${f} still records sightings in the same list`);
  ok(/noteSighted\(\[\.\.\.p1Rows\.left/.test(src) && /noteSighted\(me\.hand\.map/.test(src) && /noteSighted\(\[id\]\); \/\/ 2026-10-02: getting a card counts as seeing it/.test(src), '4. both sides of a fight, your hand and rewards count as seen');
}

// ---- 5. the collection score
{ const ctx = {collectionStats: ()=> ({levelSum:42, levelMax:100, owned:5, total:10}), CHARACTER_DEFS:{a:{id:'a'}, b:{id:'b'}, c:{id:'c'}}, castleUnlocked: ch=> ch.id !== 'c',
    ACHIEVEMENT_DEFS:[{id:'x'}, {id:'y'}, {id:'z'}], myClaimedAchievements: new Set(['x']), achievementContext: ()=> ({}), achievementStatus: d=> ({claimable: d.id !== 'z', claimed: d.id === 'x'}),
    TX, escapeHtml: esc, escapeAttr: s=> String(s).replace(/"/g, '&quot;'), Math, Object};
  const R = run(['collectionScoreInfo', 'collectionScoreBarHTML', 'profileCollectionCardHTML'], ctx);
  const c = R.collectionScoreInfo();
  ok(c.score === 42 && c.max === 100 && c.pct === 42, `5. the score is the Collection level (owned cards' levels): ${c.score}/${c.max}`);
  ok(c.owned === 5 && c.total === 10 && c.brambles === 2 && c.bramblesTotal === 3 && c.achv === 1 && c.achvTotal === 3 && c.ready === 1, '5. its counts: cards, brambles, achievements, ready to claim');
  const bar = R.collectionScoreBarHTML();
  ok(/<b>42<\/b> \/ 100/.test(bar) && bar.includes('5 of 10 cards') && bar.includes('2 of 3 brambles') && bar.includes('1 of 3 achievements') && bar.includes('1 ready to claim') && /width:42%/.test(bar), '5. the Codex bar shows the score, its bar and the counts');
  ok(/const c = collectionStats\(\);/.test(fnSrc('collectionScoreInfo')) && /owned = ids\.filter\(id=> \(!defs\[id\]\.locked && !isCardHiddenForPlayer\(defs\[id\]\)\) \|\| \(myCardCopies\[id\]\|\|\[\]\)\.length\)/.test(fnSrc('collectionStats')), '5. it counts only owned cards (collectionStats)');
  ok(/<div id="codexScore" class="cx-score-wrap"><\/div>/.test(fnSrc('codexShell')) && /sc\.innerHTML = collectionScoreBarHTML\(\)/.test(fnSrc('renderCodex')), '5. the bar is at the bottom of every Codex tab');
  // ---- 6. the Profile
  const card = R.profileCollectionCardHTML();
  ok(card.includes('Collection score: 42 / 100') && card.includes('id="pfScoreBtn"'), '6. the Profile card shows the score');
  const p = fnSrc('renderProfile');
  const i1 = p.indexOf('profileCollectionCardHTML()'), i2 = p.indexOf('profileAchievementsCardHTML()');
  ok(i1 > 0 && i2 > i1 && i2 - i1 < 200, '6. on the Profile, right beside the achievements card');
  ok(/claimed\$\{ready \? ` · <em>\$\{ready\} ready to claim<\/em>` : ''\}/.test(fnSrc('profileAchievementsCardHTML')) && /pf-tile-bar/.test(fnSrc('profileAchievementsCardHTML')), '6. the achievements card shows its progress (claimed, ready, bar)');
}

// ---- 7. texts
{ const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const keys = Object.keys(TEXT).filter(k=> /^ui\.(codex|book|score)-/.test(k));
  ok(keys.length >= 30, `7. the package's texts are in the TX table (${keys.length})`);
  const used = new Set([...src.matchAll(/TX\('(ui\.(?:codex|book|score)-[a-z-]+)'/g)].map(m=> m[1]));
  ok([...used].every(k=> k in TEXT) && keys.every(k=> used.has(k)), '7. every one is in the table and used');
  for(const code of CODES){ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
    const miss = keys.filter(k=> !pack[TEXT[k]]); ok(!miss.length, `7. ${code} has them all (missing: ${miss.join(', ')})`); }
  // no inline English in the new templates (admin-only buttons excepted, as before)
  const ADMIN = ['Edit rewards', 'Get all', 'Admin: add one copy of every card in this section to your collection'];
  for(const f of ['albumPageHTML', 'albumDraw', 'codexPagerNavHTML', 'codexEdgeTabsHTML', 'renderSkillBook', 'bookBuild', 'bookTocHTML', 'bookSpreadHTML', 'bookEntryHTML', 'collectionScoreBarHTML', 'profileCollectionCardHTML']){
    let s = fnSrc(f); ok(s, `7. ${f} exists`);
    s = s.replace(/\/\*[\s\S]*?\*\//g, '');
    const words = templateTexts(s).map(t=> t.replace(/<[^>]*>/g, ' ')).join(' ');
    let left = words; ADMIN.forEach(a=> left = left.split(a).join(' '));
    const eng = left.match(/[A-Za-z]{3,}(?:\s+[A-Za-z]{2,})*/g) || [];
    ok(!eng.length, `7. ${f}: no inline English (${eng.slice(0, 4).join(' | ')})`);
  }
}

// ---- 8. turning: buttons, keys, swipe, motion
{ ok(/e\.key !== 'ArrowLeft' && e\.key !== 'ArrowRight'/.test(src) && /t\.closest\('input, textarea, select/.test(src) && /\.modal-overlay:not\(\[hidden\]\)/.test(src), '8. ← / → turn the page, not while typing or under a window');
  ok(/Math\.abs\(dx\) >= 50 && Math\.abs\(dx\) > Math\.abs\(dy\) \* 1\.5/.test(fnSrc('codexWireSwipe')) && /Date\.now\(\) - codexSwipedAt < 400/.test(fnSrc('codexWireGridClick')), '8. a sideways swipe turns, and the click it ends doesn\'t open a card');
  ok(/const motion = !!host && host\.isConnected && !reducedMotion\(\) && fxAtLeast\('med'\)/.test(fnSrc('codexLeafTurn')) && /@media \(prefers-reduced-motion: reduce\)\{ \.pg-leaf, \.pg-leaf::after, \.pg-in-back\{animation:none !important;\}/.test(css), '8. no page-turn animation with reduced motion or Low effects');
  ok(/touch-action:pan-y/.test(css) && /\.bk-page\{[^}]*height:clamp/.test(css), '8. vertical scrolling still works over the album and the book; pages have a fixed height');
  ok(/:root\[data-theme="dark"\]/.test(css) && !/\.bk-page\{[^}]*#[0-9a-f]{3,6}/i.test(css) && /\.bk-page\{[^}]*var\(--surface\)/.test(css), '8. the book\'s parchment is the theme\'s --surface (light and dark)');
}

// ---- 9. the skill filter (owner 23:21: "add a way to filter by skills in codex")
{ const SKILL_DEFS = [{key:'flying', get: e=> e.flying ? true : undefined}, {key:'armor', get: e=> e.armor > 0 ? e.armor : undefined}];
  const R = run(['skillDefOf', 'cardHasSkill', 'codexSkillsChosen', 'codexFilterCount'], {SKILL_DEFS, PASSIVE_DEFS: [{key:'thorns'}], codexFilter:{skills:['flying', 'armor', 5]}, codexViewMode:'album', Array, Set});
  ok(R.cardHasSkill({effects:{flying:true}}, 'flying') && !R.cardHasSkill({effects:{}}, 'flying') && R.cardHasSkill({effects:{thorns:1}}, 'thorns') && !R.cardHasSkill({effects:{thorns:false}}, 'thorns'), '9. cardHasSkill: the skills book\'s own test (get, or a plain value)');
  ok(JSON.stringify(R.codexSkillsChosen()) === '["flying","armor"]', '9. the picks are a list of skill keys (junk dropped)');
  ok(R.codexFilterCount() === 1, '9. the picks count once in the ⚙️ Filters badge');
  const g = fnSrc('renderCodexGrid');
  // 2026-10-21 (package TX): each pick is a skill family (Diurnal = Diurnal {…}) or a skill group, read on the "?"-masked card
  ok(/const want = codexSkillsChosen\(\); if\(want\.length\)\{ ids = ids\.filter\(id=>\{ const d = maskHiddenSkills\(defs\[id\]\); return want\.every\(k=> cardMatchesSkillPick\(d, k\)\); \}\); \}/.test(g), '9. Browse keeps only cards with EVERY skill picked (album and grid views: before the views split)');
  ok(g.indexOf('const want = codexSkillsChosen()') < g.indexOf('codexDrawAlbum(gEl,'), '9. ... for the album and the grids alike');
  ok(/const o = Object\.assign\(\{\}, codexFilter\)/.test(fnSrc('saveCodexFilters')) && !/skills/.test(fnSrc('saveCodexFilters')), '9. the picks are saved with the other non-text filters (sticky)');
  const w = fnSrc('wireCodexSkillFilter');
  ok(/if\(!panel\.dataset\.built\)\{ panel\.innerHTML = codexSkillPanelHTML\(\); panel\.dataset\.built = '1'; \}/.test(w), '9. the picker is built once, when first opened (no work on a Codex open)');
  ok(/skillBookEntries\(\)\.filter\(e=> e\.ch === 'sk' && !e\.hint\)/.test(fnSrc('codexSkillChoices')), '9. the picker lists the skills you have seen (the book\'s list; admins: all), with their icons');
  ok(/data-cxskillclear/.test(fnSrc('codexSkillPanelHTML')) && /data-cxskillclear/.test(fnSrc('codexSkillUI')) && /data-cxskilloff/.test(fnSrc('codexSkillUI')), '9. Clear in the picker and under the toolbar; each pick can be removed');
  ok(/id="cxSkillBtn"/.test(src) && /id="cxSkillActive"/.test(src) && /wireCodexSkillFilter\(\);/.test(fnSrc('renderCodex')), '9. the Skills button sits with the other filters');
  // the book's jump
  const B = run(['bookEntryHTML'], {TX, escapeHtml: esc, escapeAttr: s=> String(s).replace(/"/g, '&quot;'), _t: s=> s, legendaryTagHTML: ()=> '', PASSIVE_BY_KEY: {}});
  ok(/data-bkskill="armor"/.test(B.bookEntryHTML({ch:'sk', key:'armor', name:'Armor', html:'x', icon:'🛡'})) && !/data-bkskill/.test(B.bookEntryHTML({ch:'sk', key:'flying', hint:true, name:'?', html:'x'})) && !/data-bkskill/.test(B.bookEntryHTML({ch:'fx', key:'tide', name:'Tide', html:'x'})), '9. each seen skill in the book offers "Show cards with this skill" (not the ? hints, statuses or field effects)');
  const ctx = {codexFilter:{skills:['x'], q:'otter', rarity:'rare'}, codexPage:4, codexSubTab:'skills', saved:0, rendered:0, saveCodexFilters(){ ctx.saved++; }, renderCodex(){ ctx.rendered++; }, codexPageTurn(){}};
  const J = run(['codexShowCardsWithSkill'], ctx); J.codexShowCardsWithSkill('armor');
  ok(JSON.stringify(ctx.codexFilter.skills) === '["armor"]' && ctx.codexFilter.q === '' && ctx.codexFilter.rarity === 'rare' && ctx.codexSubTab === 'browse' && ctx.codexPage === 0 && ctx.saved === 1 && ctx.rendered === 1, '9. it opens Browse with just that skill picked (search emptied, other filters kept)');
  ok(/data-bkskill.*codexShowCardsWithSkill/.test(fnSrc('bookDraw').replace(/\n/g, ' ')), '9. the book wires the button');
  for(const f of ['codexSkillPanelHTML', 'codexSkillUI']){ const words = templateTexts(fnSrc(f)).map(t=> t.replace(/<[^>]*>/g, ' ')).join(' '); const eng = words.match(/[A-Za-z]{3,}/g) || []; ok(!eng.length, `9. ${f}: no inline English (${eng.slice(0, 4).join(' | ')})`); }
}

// ---- 10. package CX (2026-10-19, owner 14:07): short section names, first / last, the turn controls on the book
{ // short names: every section the player can see is a TX key with no "·" detail in it; the detail is a tooltip
  const ctx = {TX, adminModeEnabled:false, codexFlatById:false, BASE_GAME_MAPS:21, CODEX_TIER_THEMES:['The Wildwood', 'The Far Reaches'], baseGameBeaten: ()=> true,
    isEasterEgg: d=> !!d.egg, advancementKey: ()=> '', mapNumberOf: id=> ({m3:3, m8:8, m13:13, m18:18, m30:30, m45:45})[id], mainConquestMaps: ()=> [], CONQUEST_MAPS: [],
    cardSourceOf: d=> d.src, Math, Number, Object};
  const R = run(['codexTierName', 'codexSectionOf', 'codexSmithSection', 'mapBandOf', 'packPoolSection', 'packSectionOf', 'easterEggSectionOf', 'codexViewSectionOf'], ctx);
  const cards = [{src:{kind:'base'}}, {src:{kind:'map', id:'m3'}}, {src:{kind:'map', id:'m8'}}, {src:{kind:'map', id:'m13'}}, {src:{kind:'map', id:'m18'}}, {src:{kind:'map', id:'m30'}}, {src:{kind:'map', id:'m45'}},
    {src:{kind:'pack', tier:1}}, {src:{kind:'pack', tier:11}}, {src:{kind:'pack', tier:99}}, {src:{kind:'event', theme:'Harvest'}}, {src:{kind:'raid', id:'r1'}}, {src:{kind:'smith'}}, {src:{kind:'unsorted'}}, {egg:true, src:{kind:'pack', tier:1}}];
  const secs = []; ['bands', 'all', 'advance'].forEach(v=> cards.forEach(d=>{ const s = R.codexViewSectionOf(d, v); if(s && !s.bare) secs.push(s); }));
  const labels = [...new Set(secs.map(s=> s.label))];
  ok(labels.every(l=> l && !/·|\(|—/.test(l) && l.length <= 18 && /^[A-Za-z]/.test(l)), `10. short plain section names, no glyphs or "·" detail: ${labels.join(', ')}`);
  ok(['Factions', 'Base', 'Packs', 'Mystery Booster', 'Easter eggs', 'Raid', 'Events', 'Blacksmith', 'First season', 'Maps 21–40'].every(l=> labels.includes(l)), '10. Factions, Base, Packs, Mystery Booster, Easter eggs, Raid, Events, Blacksmith, the seasons, Maps 21–40');
  const fac = R.codexViewSectionOf(cards[8], 'bands'), egg = R.codexViewSectionOf(cards[14], 'bands'), s1 = R.codexViewSectionOf(cards[1], 'bands');
  // 2026-10-21 (package TT): package RP's faction rewards are in no pack ("Faction rewards: earned through skirmish progress and achievements, never from packs")
  ok(fac.label === 'Factions' && /skirmish progress/.test(fac.tip) && /never from packs/.test(fac.tip) && egg.label === 'Easter eggs' && /Not obtainable/.test(egg.tip) && s1.tip === 'Map rewards from Maps 0–5', '10. the detail is in the tooltip (tip)');
  ok(/<span class="al-sec"\$\{sec\.tip \? ' title="' \+ escapeAttr\(sec\.tip\)/.test(fnSrc('albumPageHTML')) && /cx-section-head[^\n]*sec\.tip \? ` title=/.test(src), '10. the album page and the grid views show it on hover');
  ok(!/PACK_POOL_LABEL|'⚒️ Blacksmith · |'🎉 Events'|'🐙 Raid cards'|label:'🌱 Base'|'🍂 First season'/.test(src) && !('ui.ee-section' in TEXT), '10. none of the long names is left');
  // the controls on the book
  const tabs = run(['codexEdgeTabsHTML'], {TX, escapeAttr: s=> String(s).replace(/"/g, '&quot;')}).codexEdgeTabsHTML;
  const mid = tabs(4, 2, 12), start = tabs(0, 2, 12), end = tabs(10, 2, 12);
  ok(/pg-edge-l[\s\S]*data-turn="-1"[\s\S]*data-turn="first"[\s\S]*pg-edge-r[\s\S]*data-turn="1"[\s\S]*data-turn="last"/.test(mid) && !/disabled/.test(mid), '10. ‹ and « on the left edge, › and » on the right');
  ok((start.match(/disabled/g) || []).length === 2 && /data-turn="-1" disabled/.test(start) && /data-turn="first" disabled/.test(start), '10. on the first spread ‹ « are off');
  ok((end.match(/disabled/g) || []).length === 2 && /data-turn="1" disabled/.test(end) && /data-turn="last" disabled/.test(end), '10. on the last spread › » are off');
  ok(/aria-label="First page"/.test(mid) && /aria-label="Last page"/.test(mid) && /role="group"/.test(mid), '10. labelled for screen readers');
  const ad = fnSrc('albumDraw'), bd = fnSrc('bookDraw');
  ok(/codexPagerNavHTML\('album'[^;]*\+ `<div class="al-album pg-book[^`]*\$\{codexEdgeTabsHTML\(codexPage, L\.pages, pages\.length\)\}<\/div>`/.test(ad), '10. the album: the page count above, the tabs on the album, no bar below');
  ok(/book\.innerHTML = codexPagerNavHTML\('book'[^;]*\+ bookSpreadHTML\(S\.pages, skillBookPage, per, true\)/.test(bd) && /codexEdgeTabsHTML\(first, per, S\.pages\.length\)/.test(fnSrc('bookSpreadHTML')), '10. the book: the same, its tabs on the spread');
  ok(!/pg-btn|<nav/.test(fnSrc('codexPagerNavHTML')), '10. the old bar\'s buttons are gone');
  // first / last
  const at = {codexPage:6, codexAlbumState:{gridEl:{isConnected:true}, L:{pages:2}, pages:new Array(13)}, went:[], albumGo(p){ at.went.push(p); }, codexLeafTurn(){}, albumDraw(){}, codexKeepInView(){}};
  const T = run(['albumTurn'], at); T.albumTurn('first'); T.albumTurn('last');
  ok(JSON.stringify(at.went) === '[0,12]', '10. « opens the first page, » the last (album)');
  const bt = {skillBookPage:4, codexBookState:{L:{pages:1}, pages:new Array(9)}, went:[], bookGo(p){ bt.went.push(p); }, codexLeafTurn(){}, bookDraw(){}, document:{getElementById: ()=> ({})}};
  const B = run(['bookTurn'], bt); B.bookTurn('first'); B.bookTurn('last');
  ok(JSON.stringify(bt.went) === '[0,8]', '10. « opens the contents, » the last page (book)');
  ok(/const CODEX_TURN_KEYS = \{ArrowLeft:-1, ArrowRight:1, Home:'first', End:'last'\}/.test(src) && /codexTurnFn\(CODEX_TURN_KEYS\[e\.key\]\)/.test(src), '10. ← → turn, Home / End go to the first / last page');
  ok(/\.pg-edge-in\{position:sticky; top:calc\(50vh - 60px\); bottom:14px;/.test(css) && /@media \(max-width:559px\)\{ \.pg-book\{padding-left:6px !important;/.test(css), '10. the tabs stay in reach down a tall page; on a phone they sit in the page\'s top corners');
  for(const k of ['ui.codex-first-page', 'ui.codex-last-page']) ok(k in TEXT, `10. ${k} is in the table`);
  const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'], cxKeys = Object.keys(TEXT).filter(k=> /^ui\.cx-sec-/.test(k));
  ok(cxKeys.length >= 20 && cxKeys.every(k=> src.includes(`TX('${k}'`)), `10. the section names are TX keys, all used (${cxKeys.length})`);
  for(const code of CODES){ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')); const miss = cxKeys.filter(k=> !pack[TEXT[k]]); ok(!miss.length, `10. ${code} has the section names (missing: ${miss.join(', ')})`); }
}

console.log(`codex-book: ${fail ? fail + ' failure(s)' : 'all passed'} (${n} checks)`);
process.exit(fail ? 1 : 0);
