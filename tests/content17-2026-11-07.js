#!/usr/bin/env node
// 2026-11-07 (package CONTENT17, owner 23:55: "More Claude recommendations per map (maybe up to 15 per map) ... I can't fit arrow-ers in Maps 0-20
// much ... where are the yeti hunters?"):
//   1  canonical/claude-new-cards.json content17: every map and submap of Maps 0-20 has 1-15 picks in 2+ theme groups, the first group the
//      map's current theme; every pick id is a card, labelled melee / ranged / none by canonical/skill-delivery.json, existing or new;
//      no pick is on its own map's lists; every map has a ranged pick; THEME5's and SKILLREC1's picks are kept
//   2  the new cards: in cards.json, awaitingSource + unattainable, on no list and in no pack's extras, two skills at most, inside the budget
//      at Level 1 with their proposed map's term (tools/skill_costs.js budget), unique numericIds, named and flavoured in the 12 packs, an
//      art prompt each (a background, no banned or weapon words); no existing card changed (only appended at the end)
//   3  the Map cards window: c17McGroups reads content17 inside the Claude New section, at most 15, small theme headings, ranged mark, the
//      build bakes content17 in (assemble_arena.py, index.html), the three TX keys with rows in the 12 packs
//   4  the design note for Maps 21+ (15-20 concepts) and the card-ideas rows (yeti hunters); a dry run of the tool reports no problem
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const C17 = require(path.join(ROOT, 'tools', 'content17_2026_11_07.js'));
const cards = J('canonical/cards.json'), by = Object.fromEntries(cards.map(c=> [c.id, require('../bramblewood-skillparams.js').expandDef(c)])); // ENG39 (2026-11-09): kinds read as their old keys (Ice Arrow is Arrow {type: ice})
const POOLS = J('canonical/map-pools.json').maps, DELIV = J('canonical/skill-delivery.json'), CN = J('canonical/claude-new-cards.json');
const LMP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const isRanged = c=> Object.keys(c.effects || {}).some(k=> DELIV.delivery[k] === 'ranged' || (DELIV.swing || []).includes(k));
const newIds = new Set(C17.NEW.map(s=> s.id));

// ---- 1. the picks ----------------------------------------------------------------------------------------------------------------
const c17 = CN.content17 || {};
ok(CN.theme5 && Object.keys(CN.theme5).length >= 29 && CN.skillrec && Object.keys(CN.skillrec).length >= 33, '1: THEME5 and SKILLREC1 picks kept');
const MAPS = ['m1', 'mtut', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mp', 'mu', 'mg', 'm4', 'mz', 'mk', 'm7', 'm10', 'mj', 'mh', 'mq', 'mr', 'ms', 'm5', 'ml', 'mv', 'mt', 'mn', 'm6', 'md', 'my', 'm3', 'mpd', 'm11', 'me', 'mx'];
ok(MAPS.every(m=> C17.MAPS.some(x=> x[0] === m)) && C17.MAPS.length === MAPS.length, '1: the tool covers the 34 maps and submaps of Maps 0-20');
const parent = {}; Object.entries(POOLS).forEach(([k, e])=> Object.keys(e.submaps || {}).forEach(s=> parent[s] = k));
const ownLists = m=>{ const top = parent[m] || m, e = POOLS[top] || {}; return new Set([].concat(e.cards || [], e.special || [], ...Object.values(e.submaps || {}))); };
// 2026-11-11 (LISTFIX3): the 11-11 lists (SKIR1, owner 00:16: his Yes picks, Claude's admin adds and THEME8 suggestions) took up some of these
// picks; a pick on its map's list is fine when one of those three put it there (was: no pick on its own map's lists)
const appSrc = R('arena_app.js'), grabC = n=> JSON.parse((appSrc.match(new RegExp('const ' + n + ' = (\\{.*?\\});\\n')) || [0, '{}'])[1]);
const PICKS = J('docs/design/map-picks-owner-2026-11-11.json').maps, ADMIN = grabC('UI47_ADMIN_ADD'), SUGGEST = grabC('UI47_SUGGEST');
const tookUp = (m, id)=>{ const top = parent[m] || m; return [(PICKS[top] || {}).yes, ADMIN[top], SUGGEST[top], ...Object.keys((POOLS[top] || {}).submaps || {}).map(s=> SUGGEST[s])].some(l=> (l || []).includes(id)); };
let total = 0, ranged = 0;
MAPS.forEach(m=>{
  const e = c17[m]; ok(!!(e && Array.isArray(e.groups)), `${m}: has content17 groups`); if(!e || !e.groups) return;
  const picks = e.groups.flatMap(g=> g.picks || []); total += picks.length;
  ok(picks.length >= 1 && picks.length <= 15, `${m}: 1-15 picks (${picks.length})`);
  ok(e.groups.length >= 2 && e.groups.every(g=> typeof g.theme === 'string' && g.theme.trim() && (g.picks || []).length), `${m}: 2+ named theme groups, none empty`);
  ok(e.groups[0].current === true && e.groups.filter(g=> g.current).length === 1, `${m}: the first group is the current theme, the others alternatives`);
  ok(new Set(picks.map(p=> p.id)).size === picks.length, `${m}: no card twice`);
  const lists = ownLists(m);
  picks.forEach(p=>{ const c = by[p.id]; ok(!!c, `${m}: ${p.id} is in cards.json`); if(!c) return;
    const want = isRanged(c) ? 'ranged' : (Number(c.attack) > 0 ? 'melee' : 'none');
    // FIX12 (2026-11-10): ENG40 (owner ENG34-1 b "reach counts as melee") made Reach melee again; CONTENT17 stored 'ranged' for its Reach
    // throwers, and the Map cards window reads the live delivery now (c17LiveDelivery), so that stored label is stale, not wrong
    const eng40Reach = p.delivery === 'ranged' && want === 'melee' && c.effects.reach === true;
    ok(p.delivery === want || eng40Reach, `${m}: ${p.id} delivery ${p.delivery} (skill-delivery says ${want})`);
    if(eng40Reach) p.delivery = want; // the live label, for the ranged count below
    ok(p.source === (newIds.has(p.id) ? 'new' : 'existing'), `${m}: ${p.id} source ${p.source}`);
    ok(typeof p.why === 'string' && p.why.trim().length > 3, `${m}: ${p.id} has a why`);
    ok(!lists.has(p.id) || tookUp(m, p.id), `${m}: ${p.id} is not already on this map's lists (or the 11-11 picks / adds / suggestions put it there)`); });
  const r = picks.filter(p=> p.delivery === 'ranged').length; ranged += r; ok(r >= 1, `${m}: at least one ranged pick`);
});
ok(total >= 34 * 8, `1: ${total} picks in all, ${ranged} ranged`);

// ---- 2. the new cards ------------------------------------------------------------------------------------------------------------
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(J('canonical/skill-costs.json'));
const listed = LMP.listedIds({maps: POOLS}), extras = J('canonical/pack-extras.json');
const mapN = Object.fromEntries(C17.MAPS.map(x=> [x[0], x[2]]));
ok(new Set(cards.map(c=> c.numericId)).size === cards.length, '2: numericIds are unique');
ok(C17.NEW.length >= 15, `2: ${C17.NEW.length} new cards`);
const prompts = R('docs/art-style-prompts.md'), BANNED = ['no clothes', 'spiked', 'studded', 'monitor', 'sperm', 'corpse', 'sword', 'spear', 'axe', 'dagger', 'bow and arrow', 'weapon', 'blade', 'trident', 'harpoon', 'sling', 'arrow', 'dart'];
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const packs = CODES.map(code=> ({code, cards: J(`lang/cards/${code}.json`), ui: J(`lang/ui/${code}.json`), main: J(`lang/${code}.json`)}));
const firstNew = cards.findIndex(c=> newIds.has(c.id));
ok(firstNew >= cards.length - C17.NEW.length - 12 /* 2026-11-08: room for later packages' appends (ENG37 1, CONTENT18 5) */ && cards.slice(firstNew).every(c=> newIds.has(c.id) || cards.indexOf(c) > firstNew), '2: the new cards are appended at the end');
C17.NEW.forEach(s=>{ const c = by[s.id]; ok(!!c, `${s.id}: in cards.json`); if(!c) return;
  ok(c.awaitingSource === true && c.unattainable === true && !c.source, `${s.id}: awaitingSource + unattainable, no source`);
  ok((!listed.has(s.id) || Object.values(SUGGEST).some(l=> l.includes(s.id))) && !JSON.stringify(extras).includes('"' + s.id + '"'), `${s.id}: on no list (or a THEME8 suggestion SKIR1 listed, still awaiting the owner's placement) and in no pack's extras`); // 2026-11-11 (LISTFIX3)
  ok(Object.keys(c.effects || {}).length <= 2, `${s.id}: two skills at most`);
  const b = T.budget(Object.assign({}, c, {obtainMap: mapN[s.map]}), {level: 1});
  ok(b.ok && b.x1 <= b.N && !(b.missing && b.missing.length), `${s.id}: inside the budget at Level 1, Map ${mapN[s.map]} (${(+b.x1).toFixed(2)} / ${(+b.N).toFixed(2)})`);
  ok(/CONTENT17/.test(c.creatorNote || ''), `${s.id}: creatorNote names CONTENT17`);
  ok(Object.values(c17).some(e=> e.groups && e.groups.some(g=> g.picks.some(p=> p.id === s.id))), `${s.id}: a pick on at least one map`);
  packs.forEach(p=>{ ok(!!p.cards[c.name], `${s.id}: name in lang/cards/${p.code}`); ok(!!p.ui[c.flavor], `${s.id}: flavour in lang/ui/${p.code}`); });
  const sec = prompts.split(/\n### /).find(x=> x.split('\n')[0].trim() === c.name); ok(!!sec, `${s.id}: an art prompt in docs/art-style-prompts.md`);
  if(sec){ const body = sec.split('\n').slice(1).join('\n').toLowerCase(); ok(/background/.test(body), `${s.id}: the prompt has a background`);
    BANNED.forEach(w=> ok(!body.includes(w), `${s.id}: the prompt avoids "${w}"`)); }
});
['yeti-tracker', 'icefletch-fox', 'yeti-snarer'].forEach(id=> ok(by[id] && isRanged(by[id]), `2: yeti hunter ${id} is ranged`));
// FIX12 (2026-11-10): ENG40 (2026-11-09, owner ENG34-1 b "reach counts as melee"): Reach left skill-delivery.json's swing list; was "the Trident Caiman throws (Reach: its swing is ranged)"
ok(by['trident-caiman'] && by['trident-caiman'].effects.reach === true && !isRanged(by['trident-caiman']), '2: the Trident Caiman keeps Reach, a melee swing since ENG40');
ok(/function c17LiveDelivery\(/.test(R('arena_app.js')) && /delivery: c17LiveDelivery\(p, defs\[p\.id\]\)/.test(R('arena_app.js')), '3: the Map cards window marks a pick by its live delivery (FIX12, after ENG40)');
ok(by['icefletch-fox'] && Number(by['icefletch-fox'].effects.iceArrow) > 0, '2: an ice animal with Ice Arrow');
ok(['peat-smoke-shaman', 'mossmother-newt'].every(id=> by[id] && by[id].effects.healing), '2: the bog healers heal');

// ---- 3. the Map cards window -----------------------------------------------------------------------------------------------------
const app = R('arena_app.js'), tpl = R('arena_template.html'), asm = R('assemble_arena.py'), {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
const grab = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}'){ d--; if(!d) return app.slice(i, k + 1); } } return ''; };
const g = grab('c17McGroups'), h = grab('ui22McClaudeNewHTML');
const sMc = app.indexOf('// UI22_MC:START'), eMc = app.indexOf('// UI22_MC:END'), at = app.indexOf('function c17McGroups(');
ok(at > sMc && at < eMc, '3: c17McGroups lives inside the UI22 Map cards block (the Claude New section)');
ok(/CLAUDE_NEW\.content17/.test(g) && /left = 15/.test(g) && /onLists\.has\(p\.id\)/.test(g) && /seen\.has\(p\.id\)/.test(g), '3: reads content17, at most 15, skips cards on the lists or already shown');
ok(/c17McGroups\(/.test(h) && /c17-theme/.test(h) && /TX\('ui\.c17-ranged'\)/.test(h) && /TX\('ui\.c17-new-card'\)/.test(h) && /ui22McClaudeNew\(/.test(h), '3: the section shows THEME5 / SKILLREC1 picks, then theme headings, a ranged mark and a new-card pill');
ok(!/rv1-tile|data-rv-|mapPoolAdd|mpMutate/.test(g + h), '3: shown only (no review tile, no list function)');
ok(/\.c17-theme\{/.test(tpl) && /\.c17-rng\{/.test(tpl), '3: headings and the ranged mark are styled');
ok(/"content17"/.test(asm), '3: assemble_arena.py bakes content17 in');
const idx = fs.existsSync(path.join(ROOT, 'index.html')) ? R('index.html') : '';
ok(/const CLAUDE_NEW = \{[^\n]*"content17"/.test(idx) && /function c17McGroups\(/.test(idx), '3: the built index.html carries content17 and the new section code');
['ui.c17-ranged', 'ui.c17-melee', 'ui.c17-new-card'].forEach(k=>{ ok(!!TEXT[k], `3: TX key ${k}`); packs.forEach(p=> ok(!!p.main[TEXT[k]], `3: ${p.code} row for ${k}`)); });

// ---- 4. docs and the tool --------------------------------------------------------------------------------------------------------
const note = fs.existsSync(path.join(ROOT, 'docs/design/armed-creatures-2026-11-07.md')) ? R('docs/design/armed-creatures-2026-11-07.md') : '';
const rows = (note.split('## Concept cards')[1] || '').split('\n').filter(l=> /^\| \d+ \|/.test(l));
ok(rows.length >= 15 && rows.length <= 20, `4: the design note has 15-20 concept cards (${rows.length})`);
ok(/yeti hunters/i.test(note) && /ice arrow/i.test(note) && /temple/i.test(note) && /ranged becomes common/i.test(note), '4: the note covers yeti hunters, ice-arrow archers, temple crocodiles and how ranged becomes common');
ok(/[Yy]eti hunters/.test(R('docs/card-ideas.md')) && /yeti-tracker/.test(R('docs/card-ideas.md')), '4: docs/card-ideas.md has the yeti hunters (ideas and built)');
const run = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools', 'content17_2026_11_07.js')], {encoding: 'utf8'});
// 2026-11-11 (LISTFIX3): the tool's "already on this map's lists" lines are the picks the 11-11 lists took up (section 1); any other problem fails
const runProbs = (run.stdout.split('PROBLEMS:')[1] || '').split('\n').map(l=> l.trim()).filter(Boolean).filter(l=>{ const m = l.match(/^(\w+): ([a-z0-9-]+) is already on this map's lists$/); return !(m && tookUp(m[1], m[2])); });
ok((run.status === 0 || /PROBLEMS:/.test(run.stdout)) && !runProbs.length, `4: a dry run of tools/content17_2026_11_07.js reports no problem but picks the 11-11 lists took up (${runProbs.slice(0, 3).join('; ')})`);
const dec = J('docs/decisions.json'), decs = JSON.stringify(dec);
ok(/CONTENT17-1/.test(decs), '4: decisions CONTENT17-* in docs/decisions.json');

console.log(fail ? `FAIL ${fail} of ${n}` : `ok ${n} checks`);
process.exit(fail ? 1 : 0);
