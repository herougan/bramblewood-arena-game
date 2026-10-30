#!/usr/bin/env node
// 2026-10-25 (package PL2: the owner's playtest notes 10-24 22:28 and 10-25 00:02, UI / VFX / rewards / audio). Source and data checks, plus the
// small pieces that run without a page (the map-moment queue, the XP that waits, the PRO keys). The browser checks and the screenshots at 390
// and 1366 are tests/e2e/pl2_2026_10_25.py. Covers:
//   A  22:28 #1 no mound where a bramble fell; 00:02 #1 the end of a match reconciles the rows (no rebuild), the flyer's Health bar rides in its
//      .fly-body, an artless card's emoji at full strength; #4 the Inspiring burst and its 0.3 s Attack update; #5 the stat bounce; #7 the bramble
//      bars ease; 21:54 the bramble's hit / repair chips; 00:02 #4 Poison ☠N; #8 the enemy's resource pills only with Shift or in its deck tooltip
//   B  22:28 #8 + PL1-1 the XP of every fight on the map, the map moments queued; 00:02 #3 #5 card rewards as cards (a stack, the rank ribbon,
//      no "Rare find" pill); 22:28 #9 the pack card detail's "Pack 1" pill, its contrast, the popover over the pack opener; 00:02 #6 the one-step
//      trigger lesson; #7 the Energy panel; 22:28 #6 Whisper's Game for admins; PL1-3 no Dungeons tab, the Arena's Co-op tab and the map spot;
//      PRO-UI the preview panel and BPRO in the game; i18n-templates: the "{have}/{total} {theme}" key gone
//   C  00:02 #9 Fork / Trident / Pitchfork sounds; #10 the results' music
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } else if(process.env.VERBOSE) console.log('  ✓', m); };
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), fxe = rd('bramblewood-fx-e.js'), asm = rd('assemble_arena.py'), TXT = rd('bramblewood-texts.js');
const T = require(path.join(ROOT, 'bramblewood-texts.js'));
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const packs = CODES.map(c=> JSON.parse(rd(path.join('lang', c + '.json'))));
const fnSrc = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}'){ d--; if(!d) return app.slice(i, k + 1); } } return ''; };

// ---- A. board and VFX
ok(/\.match-castle-tile\.castle-fallen::before, \.match-castle-tile\.castle-fallen::after\{content:none !important; display:none !important;\}/.test(tpl), 'A 22:28 #1: a fallen bramble draws no mound (its ::before is off)');
ok(/function pl2ReconcileRow\(row, html\)/.test(app) && /pl2End && pl2ReconcileRow\(rowEnemy, h\)/.test(app) && /pl2End && pl2ReconcileRow\(rowMine, h\)/.test(app), 'A 00:02 #1: once the match is decided, the rows are reconciled cell by cell');
{ const f = fnSrc('pl2ReconcileRow');
  // 2026-10-30 (package UI6, X11): cells are matched by uid now, also when the column count changed (it used to rebuild the row)
  ok(/byUid\.get\(nuU\)/.test(f) && /row\.insertBefore\(el, cur \|\| null\)/.test(f) && /updateCardHpDisplay\(u\); updateCardAtkDisplay\(u\); updateCardStatusDisplay\(u\); eq2Refresh\(u\)/.test(f) && !/fresh\.length !== old\.length\) return false/.test(f),
    'A 00:02 #1 (+UI6 X11): a unit still on the board keeps its element (numbers patched) even when the column count changed; a changed cell is swapped'); }
ok(/function pl2SeatHpBar\(el\)/.test(app) && /body\.appendChild\(nu\)/.test(fnSrc('pl2SeatHpBar')) && /pl2SeatHpBar\(el\); \/\/ PL2/.test(fnSrc('eq2Refresh')) && /pl2SeatHpBars\(rowEnemy\)/.test(app),
  'A 00:02 SS#1: a flyer\'s / floater\'s Health bar moves into its .fly-body (on render and on eq2Refresh)');
ok(/\.card-tile\.no-art > \.ico, \.card-tile\.no-art \.ico\{opacity:1;\}/.test(tpl), 'A 00:02 SS#1: an artless card shows its emoji whole (was 55%)');
{ const f = fnSrc('pl2InspireFx');
  ok(/else if\(ev\.kind==='inspired'\)\{ pl2InspireFx\(ev, rc\); \}/.test(app) && !/📯 \+\$\{ev\.amount\}⚔ next swing/.test(app), 'A 22:28 #4: the inspired event plays pl2InspireFx (no "next swing" float)');
  ok(/const PL2_INSPIRE_LAG = 0\.3/.test(app) && /gsap\.delayedCall\(wait, apply\)/.test(f) && /updateCardAtkDisplay\(ev\.targetUid\)/.test(f) && /pl2InspireBurst\(boardCardEl\(ev\.attUid\)\)/.test(f), 'A 22:28 #4: one burst over the inspirer, each ally\'s Attack 0.3 s later');
  const b = fnSrc('pl2InspireBurst'); ok(/rotation:-17/.test(b) && /scale:1\.95/.test(b) && /opacity:0, duration:\.22/.test(b), 'A 22:28 #4: the horn shakes, grows and fades');
  ok(/ev\.kind==='inspired'\) base = \(prevKind!=null && vfxKindOf\(ev\)===prevKind\) \? 60 : 380/.test(app), 'A 22:28 #4: the replay gives the burst its beat');
  ok(/pl2InspireSpent\(ev\)/.test(app), 'A 22:28 #4: the swing that spends it brings the plate back'); }
{ const f = fnSrc('pl2SetStat');
  ok(/scale:\.78, duration:\.08/.test(f) && /scale:1\.38/.test(f) && /\(opts\.any \|\| after > before\)/.test(f), 'A 22:28 #5: the bounce: shrink, swap, overshoot, settle; Health only when it rises');
  ok(/pl2SetStat\(a, atkLabelHTML\(tot, d\.attack, d\), \{any:true\}\)/.test(app) && /pl2SetStat\(hpSpan, /.test(app) && /pl2BounceAfterRedraw\(pl2Snap/.test(app), 'A 22:28 #5: the Attack / Health updaters and the board redraw use it'); }
ok(/function pl2RibbonFill\(/.test(app) && /duration: 420, easing: 'cubic-bezier\(\.22,\.8,\.3,1\)'/.test(app) && /pl2-hp-chip/.test(tpl) && /pl2RibbonFromAttr\(m, side, pct\)/.test(app), 'A 22:28 #7: the bramble bars ease (also across a redraw), with a drain chip on damage');
ok(/pl2BrambleHitFx\(el, tier\)/.test(app) && /pl2BrambleMendFx\(tile\)/.test(app) && /const PL2_CHIP_COLOURS = \['#6b5a44', '#8a7556', '#4e4234'/.test(app), 'A 21:54: the bramble\'s hit and repair throw the fall\'s bark / stone chips');
ok(T.TEXT['ui.en7-float-poison'] === '☠{n}', 'A 00:02 #4: the applied-Poison float is ☠N');
ok(/\.field-res\.enemy\{opacity:0; transition:opacity \.16s ease; visibility:hidden;\}/.test(tpl) && /html\.pl2-shift \.field-res\.enemy\{opacity:1; visibility:visible;\}/.test(tpl) && /pl2ShiftWatch/.test(app) && /pl2-tip-res/.test(app),
  'A 00:02 #8: the enemy\'s pills show only while Shift is held; its deck tooltip shows them');

// ---- B. rewards and UI
ok(/function pl1XpOnMap\(m\)\{ return !!m && !ARENA_FIGHT_MODES\.has\(m\.mode\); \}/.test(app) /* 2026-10-26 (RES3, R8): the Arena's XP fills on its results; the rest waits for the first screen after the fight */ && /const PL2_XP_KEY = 'bramblewood_pl2_xp_pending_v1'/.test(app) && /pl2MapViewed\(\); \/\/ PL2/.test(app), 'B #8 / PL1-1: every fight\'s XP waits (stored) for the Conquest map');
ok(/window\.__pl2MapReturnBusy/.test(fnSrc('pl1XpOnMapSoon')), 'B #8: the XP waits for the map\'s own moments');
{ // the map-moment queue, run with a stand-in storage
  const store = {}; const localStorage = {getItem: k=> k in store ? store[k] : null, setItem: (k, v)=>{ store[k] = String(v); }, removeItem: k=>{ delete store[k]; }};
  const src = ['pl2LoadMoments', 'pl2SaveMoments', 'pl2QueueMapMoment', 'pl2HasMapMoments', 'pl2TakeMapMoments'].map(fnSrc).join('\n');
  const Q = new Function('localStorage', "const PL2_MOMENTS_KEY = 'k';\n" + src + '\nreturn {pl2QueueMapMoment, pl2HasMapMoments, pl2TakeMapMoments};')(localStorage);
  Q.pl2QueueMapMoment('m2', '4-1', 'A'); Q.pl2QueueMapMoment('m2', '4-2', 'S'); Q.pl2QueueMapMoment('m2', '4-1', 'S'); Q.pl2QueueMapMoment('m3', '5-1', 'B');
  const got = Q.pl2TakeMapMoments('m2');
  ok(got.length === 2 && got.find(x=> x.key === '4-1').rank === 'S' && !Q.pl2HasMapMoments('m2') && Q.pl2HasMapMoments('m3'), 'B #8: wins queue per map (a later rank replaces), taken once when that map is in view ' + JSON.stringify(got));
}
ok(/pl2QueueMapMoment\(node\.mapId, node\.nodeId, rank \|\| progress\.ranks\[id\] \|\| null\)/.test(fnSrc('completeConquestNode')), 'B #8: a first clear or a better rank queues its emblem');
ok(/pl2TakeMapMoments\(mapId\)/.test(fxe) && /if\(!prev\)\{ if\(pendQ\) playReturn\(map\.id, none\(\), progress\); return; \}/.test(fxe) && /finally \{ window\.__pl2MapReturnBusy = false; \}/.test(fxe),
  'B #8: FX.E plays the queued emblems when the map is in view, a first view included');
{ const f = app.slice(app.indexOf('const pl2Mat = '), app.indexOf('// New cards seen, with what opened (2026-10-17)'));
  // 2026-10-26 (package RES3, R1): the one stack became a fan of groups (different cards apart, copies stacked with ×N): res3FanHTML
  ok(/res3FanHTML\(tiles, 'won'\)/.test(f) && /\.rw-panel \.res3-fan \.res3-g\.is-stack/.test(tpl), 'B 00:02 #3 (RES3 R1): card rewards are grouped: different cards apart, copies stacked');
  ok(/rankWon = new Set\(\[m\.conquestRareFind, m\.conquestCardDrop\]/.test(f) && /pl2-rank-reward/.test(f) && /class="rank-hex rank-\$\{rr\}"/.test(f) && /@keyframes pl2RrFlash/.test(tpl), 'B 00:02 #5: a rank-won card flashes and wears the emblem + "reward"');
  ok(/eggCards\.forEach\(id=>\{ const d = defs\[id\]; if\(d\) add\(id, d,/.test(f) && /rw-materia-card/.test(f), 'B 00:02 #5: egg cards and card-form materia are cards (RES3, 2026-10-26: added through res3FanHTML\'s list)'); }
ok(!/TX\('results\.rare-find'\)/.test(app) && !/TX\('results\.rare-find-2'\)/.test(app), 'B 00:02 #5: no "Rare find" pill anywhere');
{ const f = fnSrc('neInspectDetailHTML');
  ok(/pl2-where-pill/.test(f) && /TX\('ui\.pl2-pack-n', \{n: tier\}\)/.test(f) && !/cd-where-k/.test(f), 'B 22:28 #9: the pack card detail\'s "📦 Pack 1" pill (no "Where to get it" label)');
  ok(/\.ci-detail \.cd-abilities h3\{color:var\(--ink\);\}/.test(tpl) && /body:has\(> #packOpenOverlay:not\(\[hidden\]\)\) #cardPop\{z-index:9600 !important;\}/.test(tpl), 'B 22:28 #9: the heading follows the theme; the card popover opens over the pack opener'); }
{ const L = app.match(/const TRIGGER_LESSON = \[[\s\S]*?\n\];/)[0];
  ok((L.match(/\{id:/g) || []).length === 1 && /coach\.pl2-trigger/.test(L) && T.TEXT['coach.pl2-trigger'] === '⚡ This chip is a trigger — read the card.', 'B 00:02 #6: one short trigger step: "This chip is a trigger — read the card."'); }
{ const f = fnSrc('openEnergyPanel');
  ok(/class="ep-count"/.test(f) && /🔋×\$\{capN\}/.test(f) && !/class="ep-cap"/.test(f) && !/ep-grow/.test(f), 'B 00:02 #7: the Energy panel: the count, the refill line, free Energy and 🔋×N Use'); }
ok(/\{key:'autobattle', adminOnly:true/.test(app) && /if\(sp && pl2SpotHidden\(sp\)\) return false;/.test(fnSrc('tabOpen')), 'B 22:28 #6: Whisper\'s Game is for Admin Mode only');
ok(/function dungeonsTabOpen\(\)\{ try\{ return dungeonsAdminView\(\); \}/.test(app) && /\{key:'coop', icon:'👥'/.test(app) && /data-pl2-arena/.test(app) && T.TEXT['ui.pl2-coop'] === 'Multiplayer' /* 2026-10-30 (UI6, X19): the Co-op tab is called Multiplayer */, 'B PL1-3: no Dungeons tab for players; the Arena\'s Multiplayer (was Co-op) tab and the map\'s 👥 spot');
// PRO-UI
{ const re = new RegExp(app.match(/const PRO_KEY_RE = \/(.*?)\/;/)[1]);
  ok(re.test('3-PRO-1') && re.test('12-BPRO-4') && !re.test('3-XPRO-1') && !re.test('PRO-1'), 'B PRO-UI: the keys N-PRO-k and N-BPRO-k');
  ok(/out\[mid\]\["bpro"\] = /.test(asm) && /function proEntriesOf\(ent\)/.test(app) && /if\(b\.dataset\.proStart\)\{ pl2ProPreview\(b\.dataset\.proStart\); return; \}/.test(app), 'B PRO-UI: BPRO baked and listed; a click opens the preview');
  ok(/selectedNode\.pro \? startProFight\(selectedNode\.key\)/.test(app) && /\|\| pl2ProNodeOn\(map, conquestSelectedNodeKey\)/.test(app), 'B PRO-UI: the fight panel shows a PRO fight; its Fight button starts it free');
  if(fs.existsSync(path.join(ROOT, 'index.html'))){ const idx = rd('index.html'); ok(/"0-BPRO-1"/.test(idx), 'B PRO-UI: the built page holds the BPRO fights'); } }
// i18n templates
ok(!('ui.pl1-boon-card' in T.TEXT) && packs.every(p=> !('{have}/{total} {theme}' in p)) && /row\.short = row\.selfish \? boonTheme\(row\.selfish\)/.test(app) /* 2026-10-30 (UI6, X23): the theme only, no count */, 'B i18n-templates: the word-less "{have}/{total} {theme}" key is gone (built in place)');

// ---- C. audio
ok(/prongTone\(kind\)\{/.test(app) && /SoundKit\.prongTone \? SoundKit\.prongTone\(ev\.kind\)/.test(app), 'C 00:02 #9: Fork / Trident / Pitchfork play their own tings');
ok(/function pl2ResultsPhase\(\)/.test(app) && /const PL2_RESULTS_DUCK = 0\.3, PL2_MAP_FADE_IN = 4;/.test(app) && /res \? PL2_RESULTS_DUCK : 1/.test(app) && /pl2WasResults \? PL2_MAP_FADE_IN : 1\.5/.test(app),
  'C 00:02 #10: the fight\'s theme ducks under the results; the map\'s fades in after them');

// ---- texts: every new TX text translated in the 12 packs
for(const k of ['coach.pl2-trigger', 'ui.pl2-coop', 'ui.pl2-reward', 'ui.pl2-rank-reward', 'ui.pl2-pack-n']){ const en = T.TEXT[k]; ok(!!en, `texts: ${k}`); if(en) CODES.forEach((c, i)=> ok(typeof packs[i][en] === 'string' && packs[i][en], `texts: ${c} "${en}"`)); }
ok(!/\/\*|\/\/ /.test(TXT.slice(TXT.indexOf('"ui.pl2-pack-n"'), TXT.indexOf('"coach.tl-what"'))), 'texts: no comments inside the TEXT table');
// ---- records
ok(/^## 2026-10-25 \(package PL2/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/pl2-2026-10-25\.js/.test(rd('tests/run-all.sh')), 'run-all.sh lists the test');
ok(fs.existsSync(path.join(ROOT, 'tools', 'effects-lab', 'manifest', 'pl2.js')), 'Effects Lab: PL2\'s variants');

console.log(`pl2: ${checks - fail} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
