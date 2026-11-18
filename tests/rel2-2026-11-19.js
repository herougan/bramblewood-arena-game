#!/usr/bin/env node
// 2026-11-19 (package REL2): the Release 1.0 path fixes from docs/release/rel1-audit-2026-11-19.md. Source-level pins: the guest banner hides in
// fights (body flag set and cleared where in-match is), the Murgle announcement and Home note, touch wording, folded charts and map cards,
// the sticker and sticky-button CSS, the Map 41 tease gone, the new texts in all 12 packs.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), txt = rd('bramblewood-texts.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const count = (s, sub)=> s.split(sub).length - 1;

// 1. guest banner: the body flag follows the in-match flag everywhere it is added or removed
ok(count(app, "document.body.classList.add('bw-in-match')") >= 1 && count(app, "document.body.classList.remove('bw-in-match')") >= 2 && count(app, "document.body.classList.toggle('bw-in-match'") === 1, '1. bw-in-match is set at fight start, cleared on leaving, toggled by switchTab');
ok(/body\.bw-in-match \.signin-banner\{display:none;\}/.test(tpl), '1. CSS hides the sign-in strip in a fight');
ok(rd('bramblewood-fx-f.js').includes("!document.body.classList.contains('bw-in-match')"), '1. the energy floater is skipped once the board is up');
// 2. tutorial win and stickers
ok(/\.winloss-card\.is-tutorial \.winloss-actions\{position:sticky; bottom:0;/.test(tpl), '2. tutorial Claim Rewards row is sticky');
ok(/\.rw-new\{top:-14px !important; right:-12px !important;\}/.test(tpl) && /\.po2-new-tag\{top:-12px !important;\}/.test(tpl), '2. NEW / GET stickers sit on the card corner');
// 3. Murgle
ok(/function rel2MurgleOpen\(\)/.test(app) && /function rel2TellMurgle\(\)/.test(app) && app.includes("'rel2_murgle_told'"), '3. Murgle announcement is once-only (flag)');
ok(app.includes('id="homeMurgleBtn"') && app.includes("conquestSelectedMap = 'm8'"), '3. Home note opens Map 6');
ok(count(app, "' rel2-pulse'") === 2 && /\.rel2-pulse\{animation:rel2Pulse/.test(tpl), '3. both entrance variants pulse until seen');
ok(/\.endless-map \.map-node-hidden\{background:rgba\(150,200,130/.test(tpl), '3. dungeon floors are lighter');
ok(/const MURGLE_RELEASED = true, MURGLE_OPENS_AFTER_MAP = 'm7';/.test(app), '3. the unlock point is unchanged (owner call REL1-3)');
// 4. P2s
ok(app.includes('REL2_TOUCH ? TX(\'ui.rel2-tap-tip\')') && app.includes("REL2_TOUCH ? escapeHtml(TX('ui.rel2-deck-help-touch'))"), '4. touch wording for the hover tip and the deck help');
ok(app.includes('<details class="dt-charts-fold"') && app.includes('<details class="vis4-map-cards"'), '4. deck charts and the node panel map cards fold');
ok(app.includes("if(window.innerWidth < 700) return; // 2026-11-19 (package REL2)"), '4. the side-pick lean is off on a phone');
ok(app.includes("Number(ra.mapNum) > 20 ? TX('ui.rel2-gate-later')"), '4. no Map 41 tease');
ok(/body:not\(\.pg-in-match\) \.dialogue-dock\{top:132px;\}/.test(tpl), '4. NPC bubbles sit under the sub-tabs');
ok(app.includes("setDialogueFlag('rel2_pvp_seen', true)") && app.includes('ar3-pvp-note'), '4. first PvP: line before, dialogue collapsed at the start');
ok(rd('bramblewood-fx-c.js').includes('!t.getBoundingClientRect().width'), '4. the Reserve chip skips a tile without layout');
ok(app.includes('function rel2FirstMapHint()') && app.includes("'rel2_map0_hint'"), '4. first map view after Tutorial II says the next step');
// 5. texts: every rel2 key in the table and in all 12 packs
const keys = [...txt.matchAll(/"(ui\.rel2-[a-z0-9-]+)": "([^"]*)"/g)];
ok(keys.length >= 8, '5. ' + keys.length + ' rel2 texts');
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(rd('lang/' + code + '.json')); const miss = keys.filter(k=> !pack[k[2].replace(/^[^\p{L}\p{N}{]+/u, '')] && !pack[k[2]]);
  ok(!miss.length, '5. ' + code + ' misses ' + miss.map(k=> k[1]).join(', '));
}
console.log(fail ? `rel2: ${fail} FAILED of ${n}` : `rel2: ${n} checks passed`);
process.exit(fail ? 1 : 0);
