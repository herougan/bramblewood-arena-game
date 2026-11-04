// 2026-11-03 (package CONTENT9, owner 21:10). 1. TEXT1-1 "I prefer Tribes.": no player-facing "Dominion" left, the knight renames in cards.json
// (ids unchanged) and in the 12 packs (renamed in place, old rows gone); 2. ECON2-9 a: one curiosity on each silent main map (drafts), with a
// script of 2-4 lines, real speakers, a place clear of the map's fights, every line translated; 3. the lore bible marks them done; 4. the
// read-only answer checker runs and writes nothing; 5. CONTENT9-1 / -2 are asked, one line each; the doc holds the five sections.
const fs = require('fs'), path = require('path'), cp = require('child_process'), ROOT = path.join(__dirname, '..');
const rd = p=> fs.readFileSync(path.join(ROOT, p), 'utf8'); let checks = 0, fail = 0;
const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('FAIL ' + m); } };
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const cards = JSON.parse(rd('canonical/cards.json')), by = id=> cards.find(c=> c.id === id);
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), texts = rd('bramblewood-texts.js');
// ---- 1. the names
const NAMES = {'dominion-nestguard': 'Sunfeather Nestguard', 'stag-knight': 'Stag Champion', 'bee-knight': 'Bee Warden', 'dolphin-knight': 'Dolphin Outrider', 'cataphract-destrier': 'Gilded Roadwarden'};
for(const [id, n] of Object.entries(NAMES)) ok(by(id) && by(id).name === n, `1. ${id} is "${n}" (${by(id) && by(id).name})`);
ok(!/Dominion|Knight\b.*questions|moat/.test(by('dolphin-knight').flavor + by('sunthroat-courier').flavor), '1. the Dolphin and Sunthroat flavour name no Dominion, moat or lance');
ok(!cards.some(c=> /Dominion/.test((c.name || '') + ' ' + (c.flavor || ''))), '1. no card name or flavour says Dominion');
const codeLines = s=> s.split('\n').filter(l=> !/^\s*\/\//.test(l)).map(l=> l.replace(/\/\/ .*$/, '').replace(/\/\*.*?\*\//g, ''));
ok(!codeLines(app).some(l=> /Dominion/.test(l)), '1. arena_app.js: no "Dominion" outside comments');
ok(!/Dominion/.test(tpl.replace(/<!--[\s\S]*?-->/g, '')) && /faction-sub">Sunfeather Tribes</.test(tpl), '1. the template says Sunfeather Tribes');
ok(/name:'Sunfeather Tribes'/.test(app) && /title:'Sunfeather Tribes'/.test(app) && /A Sunfeather war-band drops out of the canopy/.test(app), '1. faction screen, picker and Ambush say Sunfeather Tribes / war-band');
ok(!/Bee Knight|Stag Knight|Dolphin Knight/.test(texts.split('\n').filter(l=> !/^\s*\/\//.test(l)).join('\n')), '1. bramblewood-texts.js names no old knight');
const OLD = ['Sunfeather Dominion', 'Dominion Nestguard', 'Stag Knight', 'Bee Knight', 'Dolphin Knight', 'Even the Dominion cannot fell that thing alone.', 'A Dominion patrol drops out of the canopy.',
  'Carries messages the Dominion would rather you not read.', 'Rides the moat like open water. Lance first, questions never.', 'The best-laid plans of mice and otters often meet a Bee Knight.'];
const NEWR = ['Sunfeather Tribes', 'Sunfeather Nestguard', 'Stag Champion', 'Bee Warden', 'Dolphin Outrider', 'Even the Sunfeather Tribes cannot fell that thing alone.', 'A Sunfeather war-band drops out of the canopy.',
  'Carries messages between the tribes. Some were never meant for you.', 'Rides the bow-wave ahead of the patrol. Spear first, questions never.', 'The best-laid plans of mice and otters often meet a Bee Warden.'];
const packs = {}; for(const c of CODES){ packs[c] = {root: JSON.parse(rd(`lang/${c}.json`)), ui: JSON.parse(rd(`lang/ui/${c}.json`)), cards: JSON.parse(rd(`lang/cards/${c}.json`))}; }
const tr = (c, en)=> packs[c].root[en] || packs[c].ui[en] || packs[c].cards[en];
for(const c of CODES){
  ok(OLD.every(k=> !(k in packs[c].root) && !(k in packs[c].ui) && !(k in packs[c].cards)), `1. ${c}: the old rows are gone`);
  ok(NEWR.every(k=> tr(c, k)), `1. ${c}: every renamed row is translated`);
  ok(['Bee Warden', 'Stag Champion', 'Dolphin Outrider', 'Sunfeather Nestguard'].every(k=> k in packs[c].root), `1. ${c}: the card names were renamed in place in the root pack`);
  ok(!/Ritter|Chevalier|Caballero|Cavaliere|Cavaleir|Kabalyero|மாவீரன்|Ksatria|骑士|騎士|騎士|기사/.test(['Bee Warden', 'Stag Champion', 'Dolphin Outrider'].map(k=> tr(c, k)).join(' ')), `1. ${c}: no "knight" left in the three names`);
}
{ const keys = Object.keys(packs.de.root), i = keys.indexOf('Bee Warden'), j = keys.indexOf('Bee Forager'); ok(i >= 0 && Math.abs(i - (j >= 0 ? j : i)) < 40, '1. de: Bee Warden kept the old row\'s place (key order kept)'); }
// ---- 2. the curiosities
const CUR = {m8: 'bones', mk: 'kelpknot', mh: 'thread', ml: 'cartwheel', mt: 'antler', m6: 'wolfsbane', md: 'glassrose', m22: 'kettle', m23: 'payroll', m24: 'coin'};
const ci = app.indexOf('const MAP_CURIOSITIES = ['), ce = app.indexOf('\n];', ci), curSrc = app.slice(ci, ce);
const di = app.indexOf('const DIALOGUES = {'), de = app.indexOf('\n};', di), dlg = app.slice(di, de);
const sp = app.slice(app.indexOf('const DIALOGUE_SPEAKERS = {'), app.indexOf('\n};', app.indexOf('const DIALOGUE_SPEAKERS = {')));
const SPEAKERS = new Set([...sp.matchAll(/^\s+(\w+):\s*\{name:/gm)].map(m=> m[1]));
const probe = JSON.parse(rd('docs/balance/econ2-maps-2026-11-03.json'));
const unq = s=> s.replace(/\\'/g, "'");
for(const [map, key] of Object.entries(CUR)){
  const m = new RegExp(`\\{key:'${key}', map:'${map}', icon:'[^']+', name:'((?:[^'\\\\]|\\\\.)+)', x:(\\d+), y:(\\d+), dialogue:'(cur_[a-z0-9_]+)'\\}`).exec(curSrc);
  ok(m, `2. MAP_CURIOSITIES has ${key} on ${map}`); if(!m) continue;
  const name = unq(m[1]), x = +m[2], y = +m[3], did = m[4];
  ok(x >= 10 && x <= 90 && y >= 20 && y <= 90, `2. ${key} sits inside the canvas, below the title panel (${x}, ${y})`);
  const pm = probe.maps.find(q=> q.id === map), asp = pm.w / pm.h;
  const near = pm.objects.filter(o=> ['fight', 'elite', 'boss', 'feature', 'curiosity', 'submap', 'npc', 'exit', 'cave', 'well'].includes(o.kind)).map(o=> Math.hypot(o.x - x, (o.y - y) / asp));
  ok(Math.min(...near) >= 12, `2. ${key} is at least 12% from every fight, spot and curiosity in ECON2's probe (${Math.min(...near).toFixed(1)})`);
  const s0 = dlg.indexOf(`  ${did}: {lines:[`); ok(s0 > 0, `2. DIALOGUES has ${did}`); if(s0 < 0) continue;
  const body = dlg.slice(s0, dlg.indexOf(']},', s0));
  const lines = [...body.matchAll(/\{who:'([\w-]+)', text:'((?:[^'\\]|\\.)+)'\}/g)].map(x=> ({who: x[1], text: unq(x[2])}));
  ok(lines.length >= 2 && lines.length <= 4, `2. ${did} has 2-4 lines (${lines.length})`);
  for(const l of lines){ ok(SPEAKERS.has(l.who) || by(l.who), `2. ${did}: speaker ${l.who} is a speaker or a card`);
    ok(l.text.split(/\s+/).length <= 24, `2. ${did}: a line of at most 24 words`);
    for(const c of CODES) ok(packs[c].ui[l.text], `2. ${c}: "${l.text.slice(0, 40)}" translated`); }
  for(const c of CODES) ok(packs[c].ui[name], `2. ${c}: the name "${name}" translated`);
}
ok(/DRAFTS: Maps 6, 9, 12, 15, 16, 17, 18, 22, 23, 24/.test(dlg), '2. the scripts are marked as drafts for the owner');
// ---- 3. the lore bible
const lb = rd('docs/lore-bible.md');
ok(/✅ Done 2026-11-03: "Sunfeather Nestguard"/.test(lb) && /✅ Done 2026-11-03: Stag Champion, Bee Warden, Dolphin Outrider/.test(lb) && !/proposals, nothing renamed yet/.test(lb), '3. the lore bible marks the renames done');
// ---- 4. the checker: runs, prints every main map with threats, writes nothing
const before = ['canonical/cards.json', 'canonical/map-pools.json', 'arena_app.js'].map(p=> fs.statSync(path.join(ROOT, p)).mtimeMs);
let out = ''; try{ out = cp.execFileSync('node', [path.join(ROOT, 'tools/content9/answers_2026_11_03.js'), '--json'], {encoding: 'utf8', maxBuffer: 1 << 26}); }catch(e){ ok(false, '4. the checker runs: ' + e.message); }
let rows = []; try{ rows = JSON.parse(out); }catch(e){ ok(false, '4. the checker prints JSON'); }
ok(rows.length >= 25 && rows[0].map === 0 && rows.some(r=> r.map === 24), `4. the checker covers Maps 0-24 (${rows.length})`);
ok(rows.every(r=> r.threats.every(t=> ['answered', 'carried only', 'GAP', 'no keyword answer'].includes(t.status))), '4. every threat has a status');
{ const r23 = rows.find(r=> r.map === 23); ok(r23 && r23.threats.some(t=> t.key === 'arrowSlits'), '4. Map 23 lists its Arrow Slits'); }
{ const r18 = rows.find(r=> r.map === 18); ok(r18 && r18.threats.some(t=> t.key === 'quicksand' && t.status === 'answered'), '4. Map 18: Quicksand found and answered (Flyers)'); }
ok(['canonical/cards.json', 'canonical/map-pools.json', 'arena_app.js'].map(p=> fs.statSync(path.join(ROOT, p)).mtimeMs).every((t, i)=> t === before[i]), '4. the checker wrote nothing');
// ---- 5. decisions and the doc
const declines = rd('docs/decisions.json').split('\n'); JSON.parse(rd('docs/decisions.json'));
for(const id of ['CONTENT9-1', 'CONTENT9-2']){ const l = declines.filter(x=> x.trim().startsWith(`{"id": "${id}"`)); ok(l.length === 1, `5. ${id}: one line, id first`);
  let d = null; try{ d = JSON.parse(l[0].trim().replace(/,$/, '')); }catch(e){} ok(d && (d.status === 'YET' || (d.status === 'DONE' && d.answer) /* 2026-11-04 (TESTFIX1): the owner answered CONTENT9-2 on 11-03 23:01 (#13, "Ok for C9-2."; built by ENG23) */) && d.group === 'game' && /21:10/.test(d.body), `5. ${id} asked with the owner's words`); }
const doc = rd('docs/content9-2026-11-03.md');
ok(['## 1. Sunfeather Tribes', '## 2. Curiosities', '## 3. One small job', '## 4. The answer rule', '## 5. Two bramble abilities'].every(h=> doc.includes(h)), '5. the doc has the five sections');
ok(/Devour/.test(doc) && /Price estimate/.test(doc) && /Where it could appear/.test(doc), '5. the bramble drafts have rules, a price estimate and a place');
console.log(`content9: ${checks - fail}/${checks} passed`); process.exit(fail ? 1 : 0);
