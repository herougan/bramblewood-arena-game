#!/usr/bin/env node
// 2026-11-27 (package SKILLS3-B: the settled SKILLS3 / SKILLS3b decisions, docs/design/skills3-2026-11-25.md and skills3b-2026-11-26.md):
//   1. trigger icons (SKILLS3-1): ⬆️ On Play, 💀 On Death, 🃏 On Pitch on chips, card lines and the ring glyph;
//   2. status tokens (SKILLS3-9): Vulnerable / Feeble / Mighty / Sturdy count every hit while any remain, one off each upkeep, hits spend
//      none, new tokens add up to 3, never x4 from one side; the ladder (SKILLS3-10): plain On Hit (Harden / Embolden on an ally beside
//      it, no round-start aura), ⬆️ and 💀 forms, the owner's 💀 Rend on every unit around it (both sides);
//   3. Wet (SKILLS3-7): yes / no; water soaks and puts Burn out; a fire hit dries and lights nothing; dry weather dries; shock +1 on a
//      Wet unit and 1 to every Wet unit chained to it;
//   4. Dogfighter N (SKILLS3-4) and Attunement N – {element} (SKILLS3-11);
//   5. Warning Colours N (NEWCARDS2): 💀 its killer gets N Poison; enemies that saw it die avoid your other Warning Colours units.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const app = rd('arena_app.js');

// ================= 1. trigger icons (SKILLS3-1) =================
{ const i = app.indexOf('function trigLeadIcon('), src = app.slice(i, app.indexOf('\n', i));
  const trigLeadIcon = new Function('eng28DeathTrig', src + '\nreturn trigLeadIcon;')(t=> /^onDeath/.test(t.on));
  ok(trigLeadIcon({on:'onSpawn'}) === '⬆️' && trigLeadIcon({on:'onDeath'}) === '💀' && trigLeadIcon({on:'onPitch'}) === '🃏', '1. lead icons: ⬆️ On Play, 💀 On Death, 🃏 On Pitch');
  ok(trigLeadIcon({on:'onAttack'}) === '⚡' && trigLeadIcon({on:'onRoundStart'}) === '🕐' && trigLeadIcon({on:'onSacrifice'}) === '🦷', '1. the other triggers keep ⚡ / 🕐 / 🦷');
  ok(/onSpawn:'⬆️'/.test(app) && /onPitch:'🃏'/.test(app) && !/onPitch:'♻️'/.test(app), '1. the ring glyphs (TRIGGER_GLYPH)');
  ok((app.match(/trigLeadIcon\(t\)/g) || []).length >= 3 && /🃏 Scavenge - /.test(app), '1. chips (live and spent) and card lines use it'); }

console.log(`skills3b-2026-11-27: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
