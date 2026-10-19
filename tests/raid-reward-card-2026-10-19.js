#!/usr/bin/env node
// 2026-10-19 (package RW3, owner 22:14 / 22:32: "What is 'honeybrew'? it was a reward upon completion of the raid" … "The raid just
// showed Honeybrew, not a card image."): "Honeybrew" was the card Honeyjoe Brewer (an Uncommon pack card) that the won raid fight dropped,
// shown on the raid results only as a small "🃏 Honeyjoe Brewer" pill (no art, no rarity, nothing saying it was a card). A raid's card
// reward now always shows the card:
//   1. the raid fight's results: "Cards won" with the card's tile (art), its full name, its rarity and "Pack card" / "Raid card"; the
//      card flips in on the reward reveal like any victory's; a tap opens the card's details
//   2. the raid claim screen (FX.F.raidClaimScreen): each card reward is a button with the tile, the full name, the rarity and "Pack card"
//      / "Faction card"; a tap (once the screen has settled) opens the details over the screen; Esc closes the details, not the screen;
//      the tile's stat glyphs no longer blow up to 32px (the reward icon rule leaked into the tile)
//   3. "Honeybrew" is nowhere in the code or on either screen; the new text is a TX key in all 12 packs
// Static checks always run; the browser part (Playwright, Chromium at /opt/pw-browsers) runs when index.html and Chromium are there,
// at 390 and 1366 wide, with screenshots in docs/screens/rw3/. Network requests are blocked (nothing reaches the live database).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const fxf = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const lineOf = start=>{ const i = src.indexOf(start); if(i < 0) return ''; return src.slice(i, src.indexOf('\n', i)); };
const esc = x=> String(x).replace(/[&<>"']/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));

// ---- 3. no "Honeybrew" anywhere; the card it was
ok(!/honeybrew/i.test(JSON.stringify(TEXT) + fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8') + fs.readdirSync(path.join(ROOT, 'lang')).filter(f=> /\.json$/.test(f)).map(f=> fs.readFileSync(path.join(ROOT, 'lang', f), 'utf8')).join('')), '3. "Honeybrew" is in no text, card or language pack (only in RW3\'s comments)');
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')); const list = Array.isArray(cards) ? cards : (cards.cards || Object.values(cards));
  const hj = list.find(c=> c && c.id === 'honeyjoe-brewer');
  ok(hj && hj.name === 'Honeyjoe Brewer' && hj.rarity === 'uncommon' && hj.source && hj.source.kind === 'pack', '3. Honeyjoe Brewer is an Uncommon pack card (the "Honeybrew" the raid paid)'); }

// ---- 1. the raid fight's results (static)
const results = src.slice(src.indexOf('const raidOfflineHTML ='), src.indexOf('const gReward ='));
ok(results.length > 100 && !/🃏 \$\{escapeHtml\(getCardDefs\(\)\[m\.raidCardDrop\]\.name\)\}/.test(results), '1. the "🃏 name" pill is gone from the raid results');
ok(/raidRewardCardHTML\(m\.raidCardDrop, raidDropFrom\(m, m\.raidCardDrop\)\)/.test(results) && /TX\('results\.cards-won'\)/.test(results), '1. the raid results show the dropped card as a card under "Cards won"');
ok(/m\.raidCardDrop \? \[m\.raidCardDrop\] : \[\]/.test(fnSrc('playRewardReveal')), '1. the reward reveal flips the raid card in, as any victory\'s card');
// the helpers, run for real
const defs = {'honeyjoe-brewer': {id:'honeyjoe-brewer', name:'Honeyjoe Brewer', rarity:'uncommon', source:{kind:'pack'}}, 'gl-1': {id:'gl-1', name:'Ink Squid', rarity:'rare', source:{kind:'raid', id:'goliath'}}, 'hb': {id:'hb', name:'Honey Bee', rarity:'starter'}};
const ctx = {TX, getCardDefs: ()=> defs, escapeHtml: esc, escapeAttr: esc, cardTileHTML: d=> `<div class="card-tile" data-defid="${d.id}"></div>`,
  rarityDef: k=> ({uncommon:{label:'Uncommon', color:'#3fb950'}, rare:{label:'Rare', color:'#58a6ff'}, starter:{label:'Starter', color:'#aaa'}})[k] || {label:'Common', color:'#bbb'},
  raidCardIds: def=> Object.keys(defs).filter(id=> (defs[id].source || {}).kind === 'raid' && defs[id].source.id === def.id),
  raidBossArt: ()=> '', raidLocale: ()=> 'en', opened: []};
vm.createContext(ctx);
vm.runInContext(['raidRewardFromLabel', 'raidRewardCardInfo', 'raidDropFrom', 'raidRewardCardHTML', 'raidClaimTierLabel', 'raidClaimScreenSpec'].map(fnSrc).join('\n')
  + '\n' + lineOf('const RAID_CLAIM_CUR_WEIGHT') + '\n' + lineOf('const RAID_CLAIM_CARD_WEIGHT') + '\nthis.F = {raidRewardCardHTML, raidDropFrom, raidClaimScreenSpec, raidRewardCardInfo};', ctx);
{ const h = ctx.F.raidRewardCardHTML('honeyjoe-brewer', 'pack');
  ok(/data-rw3-card="honeyjoe-brewer"/.test(h) && /<button type="button" class="rw3-card"/.test(h), '1. the card is a button to its details');
  ok(/class="card-tile" data-defid="honeyjoe-brewer"/.test(h), '1. it shows the card\'s tile (its art)');
  ok(/<b class="rw3-name">Honeyjoe Brewer<\/b>/.test(h) && />Uncommon</.test(h) && /🃏 Pack card/.test(h), '1. the full name, the rarity and "Pack card"');
  ok(/aria-label="Honeyjoe Brewer · Uncommon · Pack card\. Tap to see the card"/.test(h) && /title="Tap to see the card"/.test(h), '1. its label says what it is and that a tap opens it');
  ok(/Faction card/.test(ctx.F.raidRewardCardHTML('hb', 'faction')) && /Raid card/.test(ctx.F.raidRewardCardHTML('gl-1', 'raid')), '1. "Faction card" / "Raid card" for the others');
  ok(ctx.F.raidRewardCardHTML('nope', 'pack') === '', '1. an unknown card shows nothing (no bare id)');
  ok(ctx.F.raidDropFrom({raidDef:{id:'goliath'}}, 'gl-1') === 'raid' && ctx.F.raidDropFrom({raidDef:{id:'goliath'}}, 'honeyjoe-brewer') === 'pack', '1. a won fight\'s drop: one of the raid\'s cards is a Raid card, the rest Pack cards'); }
ok(/document\.addEventListener\('click', e=>\{ const b = e\.target && e\.target\.closest && e\.target\.closest\('\[data-rw3-card\]'\)/.test(src) && /openCardDetail\(id\)/.test(fnSrc('openRaidRewardCard')), '1. a tap on the card opens openCardDetail');

// ---- 2. the claim screen (static)
{ const sp = ctx.F.raidClaimScreenSpec({id:'goliath', name:'The Goliath'}, {key:'k', mine:10, reward:{kind:'kill', tier:'participant', base:{}, extra:{}}}, {}, [{id:'honeyjoe-brewer', from:'pack'}, {id:'hb', from:'faction'}], 500, 0);
  const c = sp.rewards.filter(r=> r.kind === 'card');
  ok(c.length === 2 && c[0].open === 'honeyjoe-brewer' && c[0].name === 'Honeyjoe Brewer' && c[0].rarity === 'Uncommon' && c[0].label === 'Pack card' && /card-tile/.test(c[0].icon), '2. the spec\'s card reward: tile, full name, rarity, "Pack card", open');
  ok(c[1].label === 'Faction card' && c[1].rarity === 'Starter' && c[1].tip === TX('results.rw3-card-open'), '2. a faction card: "Faction card", its rarity, the tap tip'); }
ok(/function rcsCardRewardHTML\(r, F\)/.test(fxf) && /r\.open \? rcsCardRewardHTML\(r, F\)/.test(fxf), '2. FX.F draws a card reward as the card (rcsCardRewardHTML)');
ok(/<button type="button" class="fxf-rcs-open" data-open-card=/.test(fxf) && /<span class="nm">\$\{esc\(r\.name \|\| ''\)\}<\/span>/.test(fxf) && /<span class="rar">/.test(fxf), '2. the button: tile, name, rarity, label');
ok(/opts\.openCard && opts\.openCard\(b\.getAttribute\('data-open-card'\)\)/.test(fxf) && /openCard: openRaidRewardCard/.test(fnSrc('showRaidClaimScreen')), '2. a tap opens the details through opts.openCard');
ok(/if\(opts\.covered && opts\.covered\(\)\) return;/.test(fxf) && /covered: raidRewardCardOpen/.test(fnSrc('showRaidClaimScreen')), '2. the screen leaves its keys to the open details');
ok(!/\.fxf-rcs-rw \.ico svg, \.fxf-rcs-rw \.ico img\{width:32px; height:32px;\}/.test(fxf) && /\.fxf-rcs-rw:not\(\.is-card\) \.ico > svg/.test(fxf), '2. the 32px icon rule no longer reaches into a card tile');
ok(/#cardDetailOverlay\.rw3-over\{z-index:9600;\}/.test(tpl) && /\.fxf-rcs\{position:fixed; inset:0; z-index:9500;/.test(fxf), '2. the details open above the claim screen');

// ---- 3. texts
ok(TEXT['results.rw3-card-open'] === 'Tap to see the card' && /TX\('results\.rw3-card-open'\)/.test(src), '3. the new text is a TX key, used');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  ok(!!pack['Tap to see the card'] && !!pack['Cards won'] && !!pack['Pack card'], `3. lang/${c}.json has "Tap to see the card", "Cards won", "Pack card"`); });
ok(/^## 2026-10-19 \(package RW3/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), '3. CHANGELOG entry');

// ---- browser: the real page (a claim paying a pack + a faction card; a won raid fight dropping Honeyjoe Brewer)
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const SHOTS = path.join(ROOT, 'docs', 'screens', 'rw3'); fs.mkdirSync(SHOTS, {recursive: true});
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  const open = async (w)=>{ const ctx = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort()); // nothing leaves the page
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
    await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(2500);
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); 1"); return [ctx, pg]; };
  const cardRead = sel=> `(()=>{ return [...document.querySelectorAll('${sel}')].map(el=>{ const t = el.querySelector('.card-tile'), r = t && t.getBoundingClientRect();
      return {id: t && t.dataset.defid, w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0, text: el.innerText.replace(/\\s+/g, ' ').trim(),
        bigGlyph: t ? (t.querySelectorAll('.stats .sg').length ? [...t.querySelectorAll('.stats .sg, .stats img, .stats svg')].some(g=> g.getBoundingClientRect().width > 24) : true) : true, label: el.getAttribute('aria-label') || (el.querySelector('[aria-label]') || {getAttribute: ()=> ''}).getAttribute('aria-label')}; }); })()`;
  const honeybrewShown = "/honeybrew/i.test(document.body.innerText)";
  try{
    for(const w of [390, 1366]){
      // -- the claim screen
      let [ctx, pg] = await open(w);
      ok(await pg.evaluate(`(()=>{ const def = activeRaidDef(); window.__k = def.id + ':rw3:' + Date.now();
        window.raidClaimsFor = ()=> [{key: window.__k, cycle: 1, mine: 4825, reward:{kind:'kill', tier:'participant', cards:2, shards:12, base:{gold:400}, extra:{}}}];
        window.grantRaidRewardCards = ()=>{ unlockCardForPlayer('honeyjoe-brewer', 'raidReward'); unlockCardForPlayer('honey-bee', 'raidReward'); return [{id:'honeyjoe-brewer', from:'pack'}, {id:'honey-bee', from:'faction'}]; };
        playSubTab = 'raid'; switchTab('play'); return !!document.querySelector('[data-raid-claim]'); })()`), `B@${w}. the Raid tab shows a Claim button`);
      await pg.click('[data-raid-claim]'); await pg.waitForTimeout(500);
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(900); // skip to the end state
      const cl = await pg.evaluate(cardRead('.fxf-rcs .fxf-rcs-rw.is-card'));
      const hj = cl.find(c=> c.id === 'honeyjoe-brewer'), hb = cl.find(c=> c.id === 'honey-bee');
      ok(cl.length === 2 && hj && hb, `B@${w}. the claim screen shows both reward cards as tiles (${JSON.stringify(cl.map(c=> c.id))})`);
      ok(hj && /Honeyjoe Brewer/.test(hj.text) && /Uncommon/.test(hj.text) && /Pack card/.test(hj.text) && hj.w >= 60, `B@${w}. claim: Honeyjoe Brewer's tile, full name, rarity, "Pack card" (${hj && hj.text}, ${hj && hj.w}px)`);
      ok(hb && /Honey Bee/.test(hb.text) && /Faction card/.test(hb.text), `B@${w}. claim: the faction card says "Faction card"`);
      ok(cl.every(c=> !c.bigGlyph), `B@${w}. claim: the tiles' stat glyphs are their own size (not 32px)`);
      ok(!(await pg.evaluate(honeybrewShown)), `B@${w}. claim: no "Honeybrew" on screen`);
      await pg.screenshot({path: path.join(SHOTS, `claim-${w}.png`)});
      await pg.click('.fxf-rcs .fxf-rcs-open[data-open-card="honeyjoe-brewer"]'); await pg.waitForTimeout(600);
      const det = await pg.evaluate("(()=>{ const o = document.getElementById('cardDetailOverlay'); return {open: !o.hidden, z: +getComputedStyle(o).zIndex, id: (o.querySelector('[data-defid]') || {dataset:{}}).dataset.defid, screen: !!document.querySelector('.fxf-rcs')}; })()");
      ok(det.open && det.id === 'honeyjoe-brewer' && det.z > 9500 && det.screen, `B@${w}. claim: a tap opens Honeyjoe Brewer's details over the screen (${JSON.stringify(det)})`);
      await pg.screenshot({path: path.join(SHOTS, `claim-detail-${w}.png`)});
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(500);
      ok(await pg.evaluate("document.getElementById('cardDetailOverlay').hidden && !!document.querySelector('.fxf-rcs') && !document.getElementById('cardDetailOverlay').classList.contains('rw3-over')"), `B@${w}. claim: Esc closes the details and leaves the claim screen up`);
      await pg.click('.fxf-rcs-go'); await pg.waitForTimeout(600);
      ok(await pg.evaluate("!document.querySelector('.fxf-rcs')"), `B@${w}. claim: Collect closes the screen`);
      await ctx.close();
      // -- a won raid fight dropping Honeyjoe Brewer (the owner's "Honeybrew")
      [ctx, pg] = await open(w);
      await pg.evaluate("window.raidFightCardDrop = ()=>{ unlockCardForPlayer('honeyjoe-brewer', 'raidReward'); return 'honeyjoe-brewer'; }; playSubTab = 'raid'; switchTab('play'); 1"); await pg.waitForTimeout(500);
      await pg.evaluate("document.querySelector('.raid-hub [data-raid-open]').click()"); await pg.waitForTimeout(500);
      await pg.evaluate("document.querySelector('[data-raid-part=left]').click()"); await pg.waitForTimeout(1500);
      await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.waitForTimeout(4000);
      ok(await pg.evaluate("!!(matchState && matchState.mode === 'raidOffline')"), `B@${w}. the raid fight opened`);
      let revealed = false; await pg.evaluate("window.__rrWait = 0; 1");
      for(let i = 0; i < 80; i++){ // a real (non-admin) win: the boss's bramble emptied
        const st = await pg.evaluate("(()=>{ const vs = document.querySelector('.vs-screen'); if(vs) vs.click(); const rr = document.querySelector('.rr-stage .card-tile[data-defid=\"honeyjoe-brewer\"]'); if(rr){ document.querySelector('.rr-stage').dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); return 'rr'; } if(document.querySelector('.rr-stage') && ++window.__rrWait > 24) document.querySelector('.rr-stage').dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));"
          + " if(matchState && !matchState.over && !matchState.resolving){ matchState.players[2].hq.shield = 0; matchState.players[2].hq.hp = 0; matchState.forcedWinner = 1; matchState.endReason = null; resolveRound({manual:true, run: ()=> true}); } return document.querySelector('.winloss-card') ? 'done' : ''; })()");
        if(st === 'rr') revealed = true; if(st === 'done') break; await pg.waitForTimeout(250); }
      ok(revealed, `B@${w}. results: the reward reveal flips Honeyjoe Brewer in`);
      await pg.waitForTimeout(3000);
      const rs = await pg.evaluate(cardRead('.winloss-card .rw3-card'));
      ok(rs.length === 1 && rs[0].id === 'honeyjoe-brewer' && rs[0].w >= 60, `B@${w}. results: the dropped card shows as its tile (${JSON.stringify(rs.map(r=> [r.id, r.w]))})`);
      ok(rs[0] && /Honeyjoe Brewer/.test(rs[0].text) && /Uncommon/.test(rs[0].text) && /Pack card/.test(rs[0].text) && /Tap to see the card/.test(rs[0].label || ''), `B@${w}. results: full name, rarity, "Pack card", the tap label (${rs[0] && rs[0].text})`);
      ok(await pg.evaluate("![...document.querySelectorAll('.winloss-card .hud-pill')].some(p=> /Honeyjoe/.test(p.textContent))"), `B@${w}. results: no name-only pill`);
      ok(!(await pg.evaluate(honeybrewShown)), `B@${w}. results: no "Honeybrew" on screen`);
      await pg.evaluate("(()=>{ const c = document.querySelector('.winloss-card .rw3-card'); if(c) c.scrollIntoView({block:'center'}); return 1; })()"); await pg.waitForTimeout(300);
      await pg.screenshot({path: path.join(SHOTS, `result-${w}.png`)});
      await pg.click('.winloss-card .rw3-card'); await pg.waitForTimeout(600);
      ok(await pg.evaluate("(()=>{ const o = document.getElementById('cardDetailOverlay'); return !o.hidden && !!o.querySelector('[data-defid=\"honeyjoe-brewer\"]'); })()"), `B@${w}. results: a tap opens the card's details`);
      await pg.screenshot({path: path.join(SHOTS, `result-detail-${w}.png`)});
      await ctx.close();
    }
  }finally{ await b.close(); }
  ok(!errs.length, 'B. no page errors: ' + errs.slice(0, 3).join(' | '));
}
browser().then(()=>{ console.log(`raid-reward-card: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  ✗ browser part crashed:', e && e.message); process.exit(1); });
