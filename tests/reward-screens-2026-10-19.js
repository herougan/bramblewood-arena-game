#!/usr/bin/env node
// 2026-10-18 (package RW, owner 20:52: "The Raid Claim button → screen should be doubly more exciting than the skirmish reward screen.
// btw, the boss reward screen should be more crimsony I think."):
//   1. Claim opens the raid claim screen (FX.F.raidClaimScreen) with every reward of the tier: XP, the currencies, the raid cards, the
//      title; rewards in rising weight, the rarest last; the contribution counted; the old toast only as the fallback
//   2. tap / Esc skips to the end state, Collect closes; reduced motion (or Effects Low) is the calm version: fades only
//   3. a won boss fight's results card gets the crimson class (is-boss) and the embers; elites / mini-bosses / raids don't
//   4. every new text is a TX key with all 12 packs; the Effects Lab registers both looks
//   5. (owner 23:20 follow-up) a won NEW Babel Spire floor gets its own Victory card (is-tower: sky and stone-gold, the ascent line
//      "Floor N cleared → Floor N+1" with a little tower); a free replay of a cleared floor keeps the ordinary card; Spire Keepers aren't crimson
//   6. (owner 23:32 follow-up) the reward screens show the XP bar at the top filling with the fight's XP (level-up bursts there), and the
//      XP / level-up toasts are skipped while it shows; calm = the end state with a fade
// Static checks always run; the browser part (Playwright, Chromium at /opt/pw-browsers) runs when index.html and Chromium are there.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const fxf = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const {createTranslator} = require(path.join(ROOT, 'bramblewood-i18n.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const lineOf = start=>{ const i = src.indexOf(start); if(i < 0) return ''; return src.slice(i, src.indexOf('\n', i)); };

// ---- 1. the claim flow (static)
const claimFn = fnSrc('claimRaidReward');
ok(/const screen = raidClaimScreenReady\(\);/.test(claimFn) && /if\(screen\) showRaidClaimScreen\(spec\);/.test(claimFn), '1. claimRaidReward opens the claim screen');
// 2026-10-19 (package RC): the claim's cards are pack / faction cards now (grantRaidRewardCards); their toast is still only for no screen
ok(/grantRaidRewardCards\(def, rwc\)/.test(claimFn) && /if\(!screen && cardsGot\.length\)/.test(claimFn) && !/function grantRaidCards\(/.test(src), '1. the reward-card toast is quiet when the screen shows the cards');
ok(/if\(!screen\) showToast\(/.test(claimFn), '1. the old toast is only the fallback');
ok(claimFn.indexOf('showRaidClaimScreen(spec)') < claimFn.indexOf('awardXp(xp'), '1. the screen opens before the XP, so a level-up waits for it');
ok(/out\.push\(\{key, cycle:c, reward: rw, mine: st\.contributors\[me\] \|\| 0\}\)/.test(fnSrc('raidClaimsFor')), '1. a claim carries your contribution');
ok(/calm = reducedMotion\(\) \|\| !fxAtLeast\('med'\) \|\| !hasGsap\(\)/.test(fnSrc('showRaidClaimScreen')), '1. calm under reduced motion, Effects Off / Low, or no GSAP');
{ const ctx = {TX, CURRENCY_META:{gold:{glyph:'<svg class="coin-ico"></svg>', label:'Maple Leaves'}, dust:{glyph:'✨', label:'Magic Dust'}, metal:{glyph:'🔩', label:'Metal'}},
    getCardDefs: ()=> ({c1:{id:'c1', name:'Ink Squid', rarity:'common'}, c2:{id:'c2', name:'Broodmother', rarity:'legendary'}}), cardTileHTML: d=> `<div class="card-tile">${d.name}</div>`,
    raidBossArt: ()=> 'art/raids/goliath.png'};
  vm.createContext(ctx);
  vm.runInContext([lineOf('const RAID_CLAIM_CUR_WEIGHT'), lineOf('const RAID_CLAIM_CARD_WEIGHT'), fnSrc('raidClaimTierLabel'), fnSrc('raidClaimScreenSpec'), fnSrc('raidLocale') /* 2026-10-19 (package RB): raid numbers in the game's language */].join('\n') + '\nthis.S = raidClaimScreenSpec;', ctx);
  const def = {id:'goliath', name:'The Goliath', icon:'🐙'};
  const claim = {key:'goliath:1', cycle:1, mine:48250, reward:{kind:'kill', tier:'top1', base:{gold:400, dust:60, metal:3}, extra:{metal:3, title:'Goliath-Slayer'}}};
  const sp = ctx.S(def, claim, {gold:400, dust:60, metal:6}, ['c1', 'c2'], 500);
  ok(sp.kind === 'kill' && sp.tier === 'top1' && sp.contribution === 48250, '1. the spec: kill, Top 1%, the contribution');
  ok(sp.boss.name === 'The Goliath' && sp.boss.art === 'art/raids/goliath.png' && sp.boss.icon === '🐙', '1. the spec: the boss and its art');
  const kinds = sp.rewards.map(r=> r.kind + ':' + (r.id || ''));
  ok(JSON.stringify(kinds) === JSON.stringify(['xp:', 'currency:gold', 'currency:dust', 'currency:metal', 'card:c1', 'card:c2', 'title:']), `1. every reward: XP, the currencies, both cards, the title (${kinds})`);
  ok(sp.rewards.find(r=> r.id === 'metal').amount === '+6' && sp.rewards[0].amount === '+500', '1. amounts: +6 Metal (base + tier), +500 XP');
  const w = Object.fromEntries(sp.rewards.map(r=> [r.kind + (r.id || ''), r.weight]));
  ok(w.xp === 1 && w.currencygold === 1 && w.currencydust === 2 && w.currencymetal === 3 && w.cardc1 === 2 && w.cardc2 === 5 && w.title === 5, '1. weights: the rarer, the bigger the beat');
  ok(sp.text.title === TX('results.raid-claim-fell', {name:'The Goliath'}) && sp.text.tier === TX('results.raid-tier-top1') && sp.text.skip === TX('results.tap-to-skip'), '1. the texts are TX');
  const comp = ctx.S(def, {key:'g:0', cycle:0, mine:12, reward:{kind:'compensation', tier:'participant', base:{gold:160}, extra:{}}}, {gold:160}, [], 150);
  ok(comp.kind === 'compensation' && comp.text.title === TX('results.raid-claim-held', {name:'The Goliath'}) && comp.text.tier === TX('results.raid-tier-participant') && comp.rewards.length === 2, '1. compensation: its own title, Participant, XP + gold');
}
// the screen itself (bramblewood-fx-f.js)
ok(/M\.raidClaimScreen = function\(spec, opts\)/.test(fxf) && /M\.bossVictory = function\(cardEl, opts\)/.test(fxf), '1/3. FX.F.raidClaimScreen and FX.F.bossVictory');
ok(/const g = G\(\), calm = !!opts\.calm \|\| !g \|\| RM\(\);/.test(fxf), '2. the screen goes calm by itself under reduced motion or without GSAP');
ok(/sort\(\(a, b\)=> a\.weight - b\.weight \|\| a\._i - b\._i\)/.test(fxf), '1. rewards in rising weight (stable), the rarest last');
ok(/tl\.progress\(1, true\)/.test(fxf) && /e\.key === 'Escape'/.test(fxf) && /'pointerdown'/.test(fxf), '2. tap / Esc fast-forward to the end state');
ok(/shake\(st\.querySelector\('\.fxf-rcs-card'\), \{amp:12/.test(fxf), '1. the top reward shakes the screen');
ok(/const resultsUp = \(\)=> !!document\.querySelector\('[^']*\.fxf-rcs'\)/.test(fxf), '1. the XP level-up waits for the claim screen');
ok(!/M\.raidClaim\(\{getBoundingClientRect/.test(fxf), '1. the small claim-button splash no longer plays under the screen');
ok(/@media \(prefers-reduced-motion:reduce\)\{ \.fxf-rcs-rays, \.fxf-rcs-bubbles i\{animation:none !important;\}/.test(fxf), '2. no drifting rays or bubbles under reduced motion');
ok(/@media \(max-width:480px\)\{ \.fxf-rcs\{/.test(fxf), '2. a phone layout');

// ---- 3. the boss results (static)
const findNode = (mapId, key)=> mapId === 'tw' ? {map:{id:'tw', tower:true}, node:{key, tower:true, floor: +String(key).split('-').pop(), kind: /-10$|-50$/.test(key) ? 'boss' : 'elite'}} : {map:{id:mapId}, node:{key}};
{ const ctx = {findConquestNode: findNode}; vm.createContext(ctx); vm.runInContext(lineOf('const CRIMSON_RESULT_KINDS') + '\n' + fnSrc('isBossResults') + '\n' + fnSrc('towerResultsFloor') + '\nthis.B = isBossResults;', ctx);
  const m = (kind, o)=> Object.assign({mode:'conquest', winner:1, conquestNode:{mapId:'m3', nodeId:'x', kind}}, o || {});
  ['boss', 'subboss', 'finalboss', 'worldboss'].forEach(k=> ok(ctx.B(m(k)) === true, `3. a won ${k} fight is crimson`));
  ['elite', 'miniboss', 'champion', 'skirmish', 'dungeon'].forEach(k=> ok(ctx.B(m(k)) === false, `3. a won ${k} fight keeps the gold card`));
  ok(ctx.B(m('boss', {winner:2})) === false && ctx.B(m('boss', {winner:0})) === false, '3. a lost or drawn boss fight is not crimson');
  ok(ctx.B(m('boss', {raidFull:true})) === false && ctx.B({mode:'ai', winner:1}) === false, '3. raids and fights without a node keep their look');
  ok(ctx.B({mode:'conquest', winner:1, conquestNode:{mapId:'tw', nodeId:'20-TW-10', kind:'boss'}}) === false, '5. a Spire Keeper floor is not crimson (the Spire has its own card)'); }
// ---- 5. the Babel Spire's Victory card (static)
{ const esc = x=> String(x).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
  const ctx = {TX, findConquestNode: findNode, escapeHtml: esc}; vm.createContext(ctx);
  vm.runInContext(lineOf('const TOWER_LEVEL_CAP') + '\n' + ['towerResultsFloor', 'isTowerResults', 'towerAscentHTML'].map(fnSrc).join('\n') + '\nthis.T = {towerResultsFloor, isTowerResults, towerAscentHTML};', ctx);
  const T = ctx.T, tm = (f, o)=> Object.assign({mode:'conquest', winner:1, conquestNode:{mapId:'tw', nodeId:'20-TW-' + f, kind:'elite'}}, o || {});
  ok(T.towerResultsFloor(tm(12)) === 12 && T.towerResultsFloor({conquestNode:{mapId:'m3', nodeId:'3-4'}}) === 0, '5. the floor of a Spire fight (0 elsewhere)');
  ok(T.isTowerResults(tm(12)) === true && T.isTowerResults(tm(10, {conquestNode:{mapId:'tw', nodeId:'20-TW-10', kind:'boss'}})) === true, '5. a new floor won (a Keeper floor too) gets the Spire card');
  ok(T.isTowerResults(tm(12, {towerReplay:true})) === false, '5. a free replay of a cleared floor keeps the ordinary card');
  ok(T.isTowerResults(tm(12, {winner:2})) === false && T.isTowerResults(tm(12, {winner:0})) === false, '5. a lost or drawn floor is not');
  ok(T.isTowerResults({mode:'conquest', winner:1, conquestNode:{mapId:'m3', nodeId:'3-8', kind:'boss'}}) === false, '5. a map boss is not a Spire win');
  const h = T.towerAscentHTML(tm(12));
  ok(h.includes(esc(TX('results.tower-step-up', {n:12, next:13}))) && h.includes(TX('results.tower-step-sub')) && /Floor 12 cleared → Floor 13/.test(TX('results.tower-step-up', {n:12, next:13})), '5. "Floor 12 cleared → Floor 13" and the tier line');
  ok((h.match(/<i class="/g) || []).length === 5 && /<i class="is-lit"><\/i><i class="is-next"><\/i>/.test(h) && /wl-ascent-beam/.test(h) && /aria-hidden="true"/.test(h), '5. the little tower: five floors, the cleared one lit, the next one glowing, the beam');
  const h50 = T.towerAscentHTML(tm(50));
  ok(/wl-ascent is-top/.test(h50) && h50.includes(esc(TX('results.tower-step-top', {n:50}))) && !/is-next/.test(h50), '5. floor 50: "the top of the Spire!", no next floor'); }
ok(/\$\{!isPc && isTowerResults\(m\) \? ' is-tower' : ''/.test(src) && /\$\{!isPc && isTowerResults\(m\) \? towerAscentHTML\(m\) : ''\}/.test(src), '5. the results card gets is-tower and the ascent line');
ok(/\.pass-card\.winloss-card\.is-glory\.is-tower\{background:radial-gradient\([^}]*#4d7fae/.test(tpl) && /\.winloss-card\.is-glory\.is-tower \.wl-title\{/.test(tpl) && /\.wl-ascent-beam\{/.test(tpl), '5. the sky and stone-gold card, its title and the beam');
ok(/@media \(prefers-reduced-motion:reduce\)\{ \.wl-ascent-beam, \.wl-ascent-tower i\.is-next\{animation:none !important;\} \}/.test(tpl) && /html\[data-fx="low"\]\) \.wl-ascent-beam/.test(tpl), '5. the beam stands still under reduced motion or Effects Low');
ok(/M\.towerAscend = function\(towerEl, opts\)/.test(fxf) && /add\(c=> c\.classList\.contains\('is-tower'\) && m\.winner === 1 && c\.querySelector\('\.wl-ascent-tower'\), el=> M\.towerAscend\(/.test(fxf), '5. resultsShown plays the light column on a new floor');
ok(/\$\{!isPc && isBossResults\(m\) \? ' is-boss' : ''/.test(src) && /\$\{!isPc && isBossResults\(m\) \? bossEmbersHTML\(\) : ''\}/.test(src), '3. the results card gets is-boss and the embers');
ok(/\.pass-card\.winloss-card\.is-glory\.is-boss\{background:radial-gradient\([^}]*#9a1f27/.test(tpl) && /\.winloss-card\.is-glory\.is-boss \.wl-title\{/.test(tpl), '3. the crimson wash and title');
ok(/@media \(prefers-reduced-motion:reduce\)\{ \.winloss-card\.is-boss > \.wl-embers i\{animation:none !important; display:none;\} \}/.test(tpl) && /html\[data-fx="low"\]\) \.winloss-card\.is-boss > \.wl-embers i\{animation:none; display:none;\}/.test(tpl), '3. no drifting embers under reduced motion or Effects Low');
ok(/add\(c=> c\.classList\.contains\('is-boss'\) && m\.winner === 1, el=> M\.bossVictory\(el/.test(fxf), '3. resultsShown plays the ember burst on a boss win');

// ---- 6. the XP bar (static)
{ const ctx = {TX}; vm.createContext(ctx);
  vm.runInContext(['xpToNext', 'levelFromXp', 'xpBarSpec'].map(fnSrc).join('\n') + '\nthis.X = {xpBarSpec, levelFromXp, xpToNext};', ctx);
  const X = ctx.X, up = X.xpBarSpec(190, 290), need2 = X.xpToNext(2);
  ok(up.segs.length === 2 && up.segs[0].level === 1 && Math.abs(up.segs[0].from - 190/200) < 1e-9 && up.segs[0].to === 1 && up.segs[0].up === 2, '6. +100 from 190: the bar fills Level 1 to the end, then levels up');
  ok(up.segs[1].level === 2 && up.segs[1].from === 0 && Math.abs(up.segs[1].to - 90/need2) < 1e-9 && !up.segs[1].up, '6. ... and fills on into Level 2 from empty');
  ok(up.labels[1] === TX('results.xp-level', {n:1}) && up.labels[2] === TX('results.xp-level', {n:2}) && up.ups[2] === TX('results.xp-level-up', {n:2}) && up.gainText === TX('results.xp-gain', {n:100}), '6. the labels: "Level 1", "Level 2", "Level 2!", "+100 XP"');
  const flat = X.xpBarSpec(10, 38);
  ok(flat.segs.length === 1 && !flat.segs[0].up && flat.segs[0].from === .05 && flat.segs[0].to === .19 && !Object.keys(flat.ups).length, '6. +28 inside a level: one plain fill');
  ok(X.xpBarSpec(50, 50).gainText === '' && X.xpBarSpec(50, 20).segs[0].to === X.xpBarSpec(50, 50).segs[0].to, '6. no XP (a free Spire replay): no gain, never backwards');
  const big = X.xpBarSpec(0, 5000); ok(big.segs.filter(x=> x.up).length === X.levelFromXp(5000).level - 1, '6. several levels at once: one burst per level'); }
{ const aw = fnSrc('awardXp'), i = aw.indexOf('if(rewardXpBarUp()){ try{ syncRewardXpBar(); }catch(e){} refreshLevelBadge(); return; }');
  ok(i > 0 && i < aw.indexOf("fxHook('xpGain'") && i < aw.indexOf("TX('toast.level'"), '6. awardXp: with the bar up, the XP fills it; no level-up toast, no badge moment'); }
ok(/if\(!\(fresh\.length === 1 && fresh\[0\]\.id === 'tutorial'\) && !rewardXpBarUp\(\)\) showToast\(TX\('toast\.xp'/.test(fnSrc('checkXpMilestones')), '6. the milestone XP toast ("+25 XP — First clear") is skipped while the bar shows');
ok(/m\.winner = \(m\.forcedWinner!=null\)[^\n]*\n\s*if\(m\.xpBefore == null\) m\.xpBefore = loadXp\(\)\.xp;/.test(src), '6. the fight\'s XP counts from when the result is decided');
ok(/\$\{!isPc && !isTutorial \? rewardXpBarHTML\(m\) : ''/.test(src) && /if\(showWinModal\)\{\n\s*try\{ syncRewardXpBar\(\); \}catch\(e\)\{\}/.test(src), '6. the Victory card draws the bar at its top and fills it');
ok(/if\(xpBarReady\(\)\)\{ const x0 = loadXp\(\)\.xp; spec\.xp = xpBarSpec\(x0, x0 \+ xp\); \}/.test(fnSrc('claimRaidReward')) && /spec\.xp \? `<div class="fxf-rcs-xp/.test(fxf), '6. the raid claim screen has the bar too');
ok(/M\.xpBarFill = function\(bar, spec, opts\)/.test(fxf) && /if\(opts\.calm \|\| !g \|\| RM\(\)\)\{ final\(\); bar\.classList\.add\('is-fade'\); return Promise\.resolve\(\); \}/.test(fxf), '6. calm: the end state with a short fade');
ok(/calm: reducedMotion\(\) \|\| !fxAtLeast\('med'\) \|\| !hasGsap\(\)/.test(fnSrc('syncRewardXpBar')), '6. calm under reduced motion and Effects Low');

// ---- 4. texts, packs, the lab
const KEYS = ['results.raid-claim-kicker', 'results.raid-claim-fell', 'results.raid-claim-held', 'results.raid-claim-sub-kill', 'results.raid-claim-sub-comp', 'results.raid-claim-damage',
  'results.raid-claim-xp', 'results.raid-claim-card', 'results.raid-claim-title', 'results.raid-claim-collect', 'results.raid-tier-top1', 'results.raid-tier-top10', 'results.raid-tier-top50', 'results.raid-tier-participant',
  'results.tower-step-up', 'results.tower-step-top', 'results.tower-step-sub', 'results.xp-level', 'results.xp-level-up', 'results.xp-gain', 'results.xp-aria'];
KEYS.forEach(k=> ok(typeof TEXT[k] === 'string' && src.includes(`TX('${k}'`), `4. ${k} is a TX key the code uses`));
const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u;
const core = v=> v.trim().replace(LEAD, '').replace(/[\s:]+$/, '');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
CODES.forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const miss = KEYS.filter(k=> !pack[core(TEXT[k])]); ok(!miss.length, `4. lang/${c}.json has every new text (missing: ${miss.join(', ')})`); });
{ const fr = createTranslator(JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'fr.json'), 'utf8')));
  ok(/^(?:The|Le) Goliath est tombé !$/.test(fr(TX('results.raid-claim-fell', {name:'The Goliath'}))), `4. the title template translates: ${fr(TX('results.raid-claim-fell', {name:'The Goliath'}))}`);
  ok(fr(TX('results.raid-claim-collect')) === 'Récupérer', '4. Collect translates');
  ok(fr(TX('results.xp-level-up', {n:7})) === 'Niveau 7 !' && fr(TX('results.xp-gain', {n:28})) === '+28 XP', `6. the bar's texts translate: ${fr(TX('results.xp-level-up', {n:7}))}`);
  ok(fr(TX('results.tower-step-up', {n:12, next:13})) === 'Étage 12 vaincu → Étage 13', `5. the Spire line translates: ${fr(TX('results.tower-step-up', {n:12, next:13}))}`); }
ok(fs.existsSync(path.join(ROOT, 'tools', 'i18n_2026_10_18rw.py')), '4. tools/i18n_2026_10_18rw.py');
{ const reg = []; const ctx = {FXLAB:{register: s=> reg.push(s)}, window:{FX:{F:{}}}}; ctx.window.FXLAB = ctx.FXLAB; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'tools', 'effects-lab', 'manifest', 'rw.js'), 'utf8'), ctx);
  const a = reg.find(r=> r.id === 'res-raid-claim-screen'), b = reg.find(r=> r.id === 'res-boss-crimson'), tw = reg.find(r=> r.id === 'res-tower-ascent');
  ok(tw && tw.variants.map(v=> v.key).join('') === 'ABCD' && tw.stage === 'ui', '5. lab: the Spire card, 4 variants (C still, D the replay)');
  const xb = reg.find(r=> r.id === 'res-xp-bar'); ok(xb && xb.variants.map(v=> v.key).join('') === 'ABC' && xb.stage === 'ui', '6. lab: the XP bar, 3 variants (A a level-up, C calm)');
  ok(a && a.variants.map(v=> v.key).join('') === 'ABCD' && a.stage === 'screen', '4. lab: the raid claim screen, 4 variants (A–C full, D calm)');
  ok(b && b.variants.map(v=> v.key).join('') === 'ABC' && b.stage === 'ui', '4. lab: the boss crimson card, 3 variants (C the ordinary card)');
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'effects-inventory-2026-10-15.json'), 'utf8'));
  ['res-raid-claim-screen', 'res-boss-crimson', 'res-tower-ascent', 'res-xp-bar'].forEach(id=>{ const e = inv.filter(x=> x.id === id); ok(e.length === 1 && e[0].lab === 'rw.js' && e[0].status === 'live', `4. inventory: one ${id} row, live, lab rw.js`); }); }
ok(/^## 2026-10-18 \(RW: /m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), '4. CHANGELOG entry');

// ---- browser: the real page (Claim → screen → skip → Collect; reduced motion; boss results)
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const CLAIMS = `(()=>{ const def = activeRaidDef(); window.__claimKey = def.id + ':' + Date.now();
    window.raidClaimsFor = ()=> [{key: window.__claimKey, cycle: 1, mine: 48250, reward:{kind:'kill', tier:'top1', base:{gold:400, dust:60, metal:3}, extra:{metal:3, title:'Goliath-Slayer'}}}];
    window.__gold0 = myCurrencies.gold || 0; playSubTab = 'raid'; switchTab('play'); return !!document.querySelector('[data-raid-claim]'); })()`;
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  const open = async (o)=>{ const ctx = await b.newContext(Object.assign({viewport:{width:1280, height:820}}, o || {})); const pg = await ctx.newPage();
    pg.on('pageerror', e=> errs.push(String(e))); await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(2500);
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); 1"); return [ctx, pg]; };
  try{
    // full motion: Claim → the screen with each reward; a tap skips; Collect closes
    let [ctx, pg] = await open();
    ok(await pg.evaluate(CLAIMS), 'B1. the Raid tab shows a Claim button');
    await pg.click('[data-raid-claim]'); await pg.waitForTimeout(400);
    const s1 = await pg.evaluate(`(()=>{ const s = document.querySelector('.fxf-rcs'); if(!s) return null; return {calm: s.classList.contains('is-calm'), done: s.classList.contains('is-done'), role: s.getAttribute('role'),
      items: [...s.querySelectorAll('.fxf-rcs-rw')].map(li=> li.className.replace(/fxf-rcs-rw /, '') + '|' + li.textContent.trim()), title: s.querySelector('.fxf-rcs-title').textContent, tier: s.querySelector('.fxf-rcs-tier').textContent.trim(),
      boss: !!s.querySelector('.fxf-rcs-bossin img'), claimed: !!(JSON.parse(localStorage.getItem('bramblewood_raid_claims_v1') || '{}')[window.__claimKey]), gold: (myCurrencies.gold || 0) - window.__gold0}; })()`);
    ok(s1 && s1.role === 'dialog' && !s1.calm && !s1.done, `B1. Claim opens the full claim screen (${JSON.stringify(s1 && {calm:s1.calm, done:s1.done})})`);
    ok(s1 && s1.items.length === 7, `B1. seven rewards: XP, three currencies, two raid cards, the title (${s1 && s1.items.length})`);
    ok(s1 && /^w-1 is-xp\|.*\+500XP$/.test(s1.items[0]) && /is-title/.test(s1.items[6]) && /Goliath-Slayer/.test(s1.items[6]), `1. XP first, the title last (${s1 && [s1.items[0], s1.items[6]].join(' / ')})`);
    ok(s1 && s1.items.some(x=> /is-currency.*\+400.*Maple Leaves/.test(x)) && s1.items.some(x=> /\+60.*Magic Dust/.test(x)) && s1.items.some(x=> /\+6.*Metal/.test(x)) && s1.items.filter(x=> /is-card/.test(x)).length === 2, 'B1. every currency and both cards are on it');
    ok(s1 && /has fallen!/.test(s1.title) && s1.tier === 'Top 1%' && s1.boss, 'B1. the title, the Top 1% badge and the Goliath');
    ok(s1 && s1.claimed && s1.gold === 400, `B1. the claim is recorded and paid (+${s1 && s1.gold} gold)`);
    await pg.mouse.click(30, 30); await pg.waitForTimeout(300);
    const s2 = await pg.evaluate(`(()=>{ const s = document.querySelector('.fxf-rcs'); return s && {done: s.classList.contains('is-done'), num: s.querySelector('.fxf-rcs-num').textContent, shown: [...s.querySelectorAll('.fxf-rcs-rw')].every(li=> getComputedStyle(li).opacity === '1'), focus: document.activeElement && document.activeElement.classList.contains('fxf-rcs-go')}; })()`);
    ok(s2 && s2.done && s2.num === (48250).toLocaleString('en-US') && s2.shown, `B2. a tap skips to the end: every reward shown, the damage counted (${JSON.stringify(s2)})`);
    ok(s2 && s2.focus, 'B2. Collect has the focus after the skip');
    const x2 = await pg.evaluate(`(()=>{ const b = document.querySelector('.fxf-rcs .fxf-xp'); return b && {gain: b.querySelector('[data-xp-gain]').textContent, lv: b.querySelector('[data-xp-lv]').textContent, w: parseFloat(b.querySelector('.fxf-xp-fill').style.width), toasts: [...document.querySelectorAll('.toast')].map(t=> t.textContent).filter(t=> /XP|Level/.test(t))}; })()`);
    ok(x2 && x2.gain === '+500 XP' && /^Level \d+$/.test(x2.lv) && x2.w > 0 && !x2.toasts.length, `B6. the claim screen's XP bar: "+500 XP", filled, no XP / level toast (${JSON.stringify(x2)})`);
    await pg.waitForTimeout(400); await pg.click('.fxf-rcs-go'); await pg.waitForTimeout(700);
    ok(await pg.evaluate("!document.querySelector('.fxf-rcs')"), 'B2. Collect closes the screen');
    await ctx.close();
    // reduced motion: the calm screen (fades only); Esc skips, Esc again closes
    [ctx, pg] = await open({reducedMotion:'reduce'});
    await pg.evaluate(CLAIMS); await pg.click('[data-raid-claim]'); await pg.waitForTimeout(300);
    const r1 = await pg.evaluate(`(()=>{ const s = document.querySelector('.fxf-rcs'); return s && {calm: s.classList.contains('is-calm'), bubbles: s.querySelectorAll('.fxf-rcs-bubbles i').length, tl: !!s._fxfTl, num: s.querySelector('.fxf-rcs-num').textContent}; })()`);
    ok(r1 && r1.calm && r1.bubbles === 0 && !r1.tl && r1.num === (48250).toLocaleString('en-US'), `B3. reduced motion: the calm screen, no bubbles, no timeline, the number already final (${JSON.stringify(r1)})`);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    ok(await pg.evaluate("document.querySelector('.fxf-rcs').classList.contains('is-done')"), 'B3. Esc shows everything');
    ok(await pg.evaluate("!!document.querySelector('.fxf-rcs .fxf-xp.is-fade')"), 'B6. reduced motion: the XP bar shows its end state with a fade');
    await pg.waitForTimeout(400); await pg.keyboard.press('Escape'); await pg.waitForTimeout(500);
    ok(await pg.evaluate("!document.querySelector('.fxf-rcs')"), 'B3. Esc again closes it');
    // Effects Low: calm as well
    await pg.evaluate("setFxLevel('low'); window.__claimKey += 'b'; 1");
    await ctx.close();
    [ctx, pg] = await open();
    await pg.evaluate("setFxLevel('low'); 1"); await pg.evaluate(CLAIMS); await pg.click('[data-raid-claim]'); await pg.waitForTimeout(300);
    ok(await pg.evaluate("document.querySelector('.fxf-rcs').classList.contains('is-calm')"), 'B3. Effects Low: the calm screen');
    await ctx.close();
    // boss results: crimson; an elite's are not
    [ctx, pg] = await open();
    const win = async (kind, tw)=>{ await pg.evaluate(`(()=>{ if(window.matchState){ try{ endMatch(); }catch(e){} } const pair = ${tw ? `[CONQUEST_MAPS.find(m=> m.tower), CONQUEST_MAPS.find(m=> m.tower).nodes[0]]` : `CONQUEST_MAPS.map(m=> [m, m.nodes.find(n=> n.kind === '${kind}')]).find(x=> x[1] && !x[0].sub && !x[0].endless && !x[0].tower)`};
        conquestSelectedMap = pair[0].id; playSubTab = 'conquest'; switchTab('play'); startConquestMatch(pair[0].id, pair[1].key, {skipEnergyCost:true, noOpener:true}); adminModeEnabled = true; return 1; })()`);
      await pg.waitForTimeout(1500);
      for(let i = 0; i < 60; i++){ await pg.evaluate("(()=>{ const vs = document.querySelector('.vs-screen'); if(vs) vs.click(); if(document.querySelector('.rr-stage')) document.querySelector('.rr-stage').dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); if(matchState && !matchState.over && !matchState.resolving) adminAutoWin(); return 1; })()");
        await pg.waitForTimeout(500); if(await pg.evaluate("!!document.querySelector('.winloss-card')")) break; }
      await pg.waitForTimeout(2500);
      return pg.evaluate("(()=>{ const c = document.querySelector('.winloss-card'); const a = c && c.querySelector('.wl-ascent'); const xb = c && c.querySelector('.wl-xp .fxf-xp'); return c ? {cls: c.className, embers: c.querySelectorAll('.wl-embers i').length, kind: matchState && matchState.conquestNode && matchState.conquestNode.kind, bg: getComputedStyle(c).backgroundImage.slice(0, 80), ascent: a ? a.textContent : '', replay: !!(matchState && matchState.towerReplay), xp: xb ? {gain: xb.querySelector('[data-xp-gain]').textContent, top: xb.getBoundingClientRect().top - c.getBoundingClientRect().top < 60} : null, xpToasts: [...document.querySelectorAll('.toast')].map(t=> t.textContent).filter(t=> /XP|Level \\d/.test(t))} : null; })()"); };
    const boss = await win('boss');
    ok(boss && /\bis-glory\b/.test(boss.cls) && /\bis-boss\b/.test(boss.cls) && boss.embers === 14 && /154, 31, 39/.test(boss.bg), `B4. a boss win: the crimson card with its embers (${JSON.stringify(boss)})`);
    ok(boss && boss.xp && /^\+\d+ XP$/.test(boss.xp.gain) && boss.xp.top && !boss.xpToasts.length, `B6. the boss Victory card has the XP bar with this fight's XP, and no XP toast (${JSON.stringify(boss && {xp: boss.xp, t: boss.xpToasts})})`);
    const elite = await win('elite');
    ok(elite && /\bis-glory\b/.test(elite.cls) && !/\bis-boss\b/.test(elite.cls) && elite.embers === 0, `B4. an elite win keeps the gold card (${JSON.stringify(elite)})`);
    const fl1 = await win('', true);
    ok(fl1 && /\bis-tower\b/.test(fl1.cls) && !/\bis-boss\b/.test(fl1.cls) && /Floor 1 cleared → Floor 2/.test(fl1.ascent) && /77, 127, 174/.test(fl1.bg) && !fl1.replay, `B5. a new Spire floor: the sky card with "Floor 1 cleared → Floor 2" (${JSON.stringify(fl1)})`);
    const again = await win('', true);
    ok(again && again.replay && /\bis-glory\b/.test(again.cls) && !/\bis-tower\b/.test(again.cls) && !again.ascent, `B5. its free replay keeps the ordinary card (${JSON.stringify(again)})`);
    await ctx.close();
  } finally { await b.close(); }
  ok(!errs.length, `B. no page errors (${errs.slice(0, 3).join(' | ')})`);
}
browser().catch(e=>{ fail++; console.log('  ✗ browser part threw:', e && e.message); }).then(()=>{
  console.log(`reward-screens-2026-10-19: ${n - fail}/${n} passed`);
  process.exit(fail ? 1 : 0);
});
