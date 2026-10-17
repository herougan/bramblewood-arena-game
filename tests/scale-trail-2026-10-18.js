#!/usr/bin/env node
// 2026-10-18 (Scale Trail package, audit R1/R2/E3). The dragon thread could not be finished: eight Dragon Scales found did
// nothing, and the journal went with the Inventory shelf on 10-15. Checked here, against the real source and data:
//   1. the eight scale sites exist on the maps, each has a hint, and no line still says "Ashen Peak" (Map 19 is the Ashen Spurn)
//   2. the finale: a DIALOGUES entry in the Traveller's voice, a reward constant naming a real, obtainable card (the Red Dragon
//      Egg, which hatches into the Red Dragon), given once (a saved flag), counted from scales FOUND, not scales held
//   3. the journal: a Notices sub-tab with x/8, found sites (where + what), unfound ones as hints only, and a Claim at 8/8
//   4. the Blacksmith's equipment and the cave's secret card are obtainable again (cardObtainableFrom knew no 'smith'/'secret')
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const defs = {}; cards.forEach(c=> defs[c.id] = c);
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const slice = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('missing ' + a); return src.slice(i, j); };
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
// eslint-disable-next-line no-eval
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));

// The Scale Trail block, evaluated with a fake save (dialogue flags), card store and helpers.
const block = slice('// SCALE_TRAIL:BEGIN', '// SCALE_TRAIL:END');
function load(store){
  const st = store || {flags:{}, copies:{}, unlocked:[], currency:{}};
  const RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
  const env = {
    loadDialogueFlags: ()=> JSON.parse(JSON.stringify(st.flags)), setDialogueFlag: (k, v)=>{ st.flags[k] = v; },
    rankAtLeast: (r, min)=> RANKS.indexOf(r) >= RANKS.indexOf(min),
    unlockCardForPlayer: (id, why)=>{ if(!defs[id]) return false; (st.copies[id] = st.copies[id] || []).push({why}); st.unlocked.push([id, why]); return true; },
    copiesOwned: id=> (st.copies[id] || []).length, grantCurrency: (k, v)=>{ st.currency[k] = (st.currency[k]||0) + v; },
    CURRENCY_META: {dust:{glyph:'✨'}, gold:{glyph:'🍁'}}, refreshQuestBadge: ()=>{}, fxHook: ()=>{},
    getCardDefs: ()=> defs, CONQUEST_MAPS: MAPS, adminModeEnabled: false,
    findConquestNode: (m, k)=>{ const map = MAPS.find(x=> x.id === m), node = map && map.nodes.find(x=> x.key === k); return node ? {map, node} : null; },
    skirmishCode: (m, k)=> k, escapeHtml: s=> String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  };
  const names = Object.keys(env);
  // eslint-disable-next-line no-new-func
  const api = new Function(...names, block + `;return {DRAGON_SCALE_NODES, SCALE_TRAIL_FINALE_REWARD, SCALE_TRAIL_DONE_FLAG, scaleFlagKey, scalesFound,
    rollDragonScale, scaleTrailComplete, scaleTrailRewarded, scaleTrailClaimable, claimScaleTrailFinale, scaleTrailJournalHTML, scaleTrailTabShown, scaleTrailTabBadge};`)(...names.map(k=> env[k]));
  api.store = st; return api;
}

// 1. the sites
const T = load();
ok(T.DRAGON_SCALE_NODES.length === 8, '1. eight scale sites');
T.DRAGON_SCALE_NODES.forEach(s=>{ const m = MAPS.find(x=> x.id === s.map), node = m && m.nodes.find(x=> x.key === s.key);
  ok(!!node, `1. ${s.map}/${s.key} is a real fight`);
  ok(typeof s.hint === 'string' && s.hint.length > 10, `1. ${s.key} has a hint`);
  ok(m && s.hint.includes(m.name), `1. ${s.key}'s hint names its map (${m && m.name})`);
  ok(node && !s.hint.includes(node.name), `1. ${s.key}'s hint doesn't give away the fight (${node && node.name})`);
  ok(!/Ashen Peak/.test(s.line + s.hint), `1. ${s.key} doesn't say Ashen Peak`); });
ok(MAPS.find(m=> m.id === 'm3').name === 'Ashen Spurn' && T.DRAGON_SCALE_NODES.find(s=> s.map === 'm3').line.includes('Ashen Spurn'), '1. the Map 19 scale says Ashen Spurn');
ok(!/Inventory keeps a journal/.test(src), '1. the stale "the Inventory keeps a journal" comment is gone');

// 2. finding scales, the finale and its reward
{ const t = load();
  ok(!t.scaleTrailTabShown(), '2. no journal tab before the first scale (the trail is a secret)');
  ok(t.rollDragonScale('mg', '2-B-4', 'A') === null, '2. an A rank finds nothing');
  ok(t.rollDragonScale('mg', '9-9', 'S') === null, '2. a fight with no scale finds nothing');
  const first = t.rollDragonScale('m11', '20-8', 'S');
  ok(first && first.index === 1 && first.total === 8 && !first.complete, '2. the first find says 1/8, whichever site it was (was the site\'s list place)');
  ok(t.rollDragonScale('m11', '20-8', 'SS') === null, '2. a site gives its scale once');
  ok(t.scaleTrailTabShown(), '2. the journal tab shows once a scale is found');
  ok(t.store.copies['dragon-scale'].length === 1, '2. a Dragon Scale card was given');
  ok(t.claimScaleTrailFinale() === null && !t.scaleTrailClaimable(), '2. no reward before all eight');
  let last = null; t.DRAGON_SCALE_NODES.forEach(s=>{ const r = t.rollDragonScale(s.map, s.key, 'SSS'); if(r) last = r; });
  ok(last && last.index === 8 && last.complete, '2. the eighth find says 8/8 and complete');
  // the scales are Materia: spend every one (Dragonscale Mail, a Mythic level 10, a castle level 25) and the trail still holds
  t.store.copies['dragon-scale'] = [];
  ok(t.scalesFound().length === 8 && t.scaleTrailComplete(), '2. spending the scales does not undo the trail (found, not held)');
  ok(t.scaleTrailClaimable() && /is-ready/.test(t.scaleTrailTabBadge()), '2. 8/8 and unclaimed: the tab shows a ready badge');
  const res = t.claimScaleTrailFinale();
  const want = t.SCALE_TRAIL_FINALE_REWARD.card;
  ok(res && res.card === want && (t.store.copies[want] || []).length === 1, '2. the finale gives the reward card once: ' + want);
  ok(t.store.unlocked.some(([id, why])=> id === want && why === 'scaleTrail'), '2. given with the scaleTrail source');
  ok(t.claimScaleTrailFinale() === null && t.store.copies[want].length === 1, '2. a second claim gives nothing');
  const t2 = load(t.store); // a reload: the same save, fresh code
  ok(t2.scaleTrailRewarded() && t2.claimScaleTrailFinale() === null && t2.store.copies[want].length === 1, '2. after a reload it is still given only once');
  ok(!!t.store.flags[t.SCALE_TRAIL_DONE_FLAG], '2. the saved flag is set');
}
// a reward card that can't be given leaves the claim open (nothing marked)
{ const t = load(); t.DRAGON_SCALE_NODES.forEach(s=> t.store.flags[t.scaleFlagKey(s)] = true);
  t.SCALE_TRAIL_FINALE_REWARD.card = 'no-such-card';
  ok(t.claimScaleTrailFinale() === null && t.scaleTrailClaimable(), '2. a reward that fails to arrive is not marked as given'); }
ok(/const SCALE_TRAIL_FINALE_REWARD = \{card:'egg-red-dragon'\};/.test(src), '2. the reward constant is {card:\'egg-red-dragon\'}');
const egg = defs['egg-red-dragon'];
ok(egg && egg.hatchInto && egg.hatchInto.defId === 'red-dragon' && defs['red-dragon'], '2. the Red Dragon Egg hatches into the Red Dragon');
ok(egg && egg.source && egg.source.kind === 'quest' && egg.source.id === 'scale-trail', '2. the egg\'s source is the Scale Trail');
// obtainability, with the game's own functions
{ const CARD_DEFS_BASELINE = defs, liveCards = {}, TUTORIAL_REWARD_IDS = []; // eslint-disable-line no-unused-vars
  // eslint-disable-next-line no-eval
  eval(slice('function cardSourceOf(d){', '// Creature rank') + slice('function isUnattainable(d){', 'function openNodeRewardsEditor') + ';globalThis.__ob = {isUnattainable, cardObtainableFrom};');
  const {isUnattainable: un} = globalThis.__ob;
  ok(!un(egg), '2. the Red Dragon Egg is obtainable (unlockCardForPlayer would refuse it otherwise)');
  ok(!un(defs['dragonscale-mail']) && !un(defs['bark-buckler']), '4. the Blacksmith\'s equipment is obtainable (a craft gave nothing before)');
  ok(!un(defs['tiny-cave-dweller']), '4. the Map 2 cave\'s secret card is obtainable');
  ok(!un(defs['dragon-scale']), '4. Dragon Scales (Materia) stay obtainable'); }
// the dialogue
{ const i = src.indexOf('const DIALOGUES = {'), j = src.indexOf('\n};', i), dl = src.slice(i, j);
  const a = dl.indexOf('scale_trail_finale: {lines:['); ok(a > 0, '2. DIALOGUES has scale_trail_finale');
  const b = dl.indexOf(']},', a);
  // eslint-disable-next-line no-eval
  const lines = eval(dl.slice(a + 'scale_trail_finale: {lines:'.length, b + 1));
  ok(Array.isArray(lines) && lines.length >= 3 && lines.every(l=> l.who === 'traveller' && typeof l.text === 'string' && l.text.length > 10), '2. the finale is the Wandering Traveller\'s lines');
  ok(lines.some(l=> /sleep/i.test(l.text)) && !lines.some(l=> /\b(dead and gone|extinct|died out)\b/i.test(l.text)), '2. the dragons are sleeping, not gone (lore bible)');
  ok(!lines.some(l=> /…\s*$/.test(l.text) || /—/.test(l.text)), '2. no trailing "…" and no em dashes');
  ok(/playDialogue\('scale_trail_finale'/.test(block), '2. the finale plays that dialogue'); }
ok(/if\(found >= total\) scaleTrailFinaleSoon\(\)/.test(block), '2. the eighth find starts the finale');
ok(/scaleTrailClaimable\(\)\) scaleTrailFinaleSoon\(\)/.test(block), '2. a save already at 8/8 gets the finale after load');
ok(/questRewardFlight\(/.test(block) && /showToast\(/.test(block), '2. the reward screen ends with the quest ribbon and a toast');
ok(/scaleTrailEggFx\(/.test(block) && /fxf-scale/.test(block), '2. the reward screen plays the egg-craft look (scales fuse into the egg)');

// 3. the journal
{ const t = load(); const sites = t.DRAGON_SCALE_NODES;
  t.store.flags[t.scaleFlagKey(sites[0])] = true; t.store.flags[t.scaleFlagKey(sites[4])] = true;
  const h = t.scaleTrailJournalHTML();
  ok(/<b>2<small>\/8<\/small><\/b>/.test(h), '3. the journal shows 2/8');
  ok(h.includes(t.store && 'is-found') && (h.match(/st-entry is-found/g) || []).length === 2 && (h.match(/class="st-entry"/g) || []).length === 6, '3. two found entries, six unfound');
  const esc = s=> s.replace(/&/g, '&amp;').replace(/'/g, "'");
  ok(h.includes(esc(sites[0].line)) && h.includes(esc(sites[4].line)), '3. found entries show the scale\'s line');
  ok(h.includes('The Grotto Keeper') && h.includes('Sky Scraper Sentinel'), '3. found entries say which fight');
  sites.forEach((s, i)=>{ if(i === 0 || i === 4) return; ok(!h.includes(esc(s.line)), `3. unfound ${s.key} hides its line`); ok(h.includes(esc(s.hint)), `3. unfound ${s.key} shows its hint`); });
  ok(!/data-scale-claim/.test(h) && /Something old and warm/.test(h), '3. no Claim and a hidden reward before 8/8');
  sites.forEach(s=> t.store.flags[t.scaleFlagKey(s)] = true);
  const h8 = t.scaleTrailJournalHTML();
  ok(/data-scale-claim/.test(h8) && /is-ready/.test(h8) && h8.includes(egg.name), '3. at 8/8: a Claim, and the reward named');
  t.claimScaleTrailFinale();
  const hd = t.scaleTrailJournalHTML();
  ok(!/data-scale-claim/.test(hd) && /Complete/.test(hd), '3. claimed: no Claim, marked complete'); }
{ const shell = slice('function questsModalShellHTML(', 'let questsKeyHandler');
  ok(/data-qn-tab="scales"/.test(shell) && /scaleTrailJournalHTML\(\)/.test(shell) && /scaleTrailTabShown\(\)/.test(shell), '3. the Notices have a Scale Trail tab');
  const open = slice('function openQuestsModal(', 'function questBoardEntrance');
  ok(/focus === 'scales'/.test(open), '3. openQuestsModal(\'scales\') opens on the journal');
  ok(/\[data-scale-claim\][\s\S]*claimScaleTrailFinale\(\)[\s\S]*showScaleTrailReward\(/.test(open), '3. the journal\'s Claim gives the reward and shows its screen'); }
ok(/rollDragonScale\(m\.conquestNode\.mapId, m\.conquestNode\.nodeId, rank\)/.test(src), '3. the results still roll the scale');
ok(/run node tests\/scale-trail-2026-10-18\.js/.test(fs.readFileSync(path.join(ROOT, 'tests/run-all.sh'), 'utf8')), 'run-all.sh runs this test');

console.log(fail ? `scale-trail: ${fail} of ${n} checks failed` : `scale-trail: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
