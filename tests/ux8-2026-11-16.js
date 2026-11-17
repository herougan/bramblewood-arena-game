#!/usr/bin/env node
// 2026-11-16 (package UX8, owner 23:35): kits are Baby; Worker Ant a Level 0 starter whose trigger arrives at Level 1; a skill only Baby cards carry below their map level is listed last with a Baby tag;
// Starter / Baby tags on Map card tiles, no "Your note"; AI pick wording; LvL button on skill and trigger rows (levelSkills[L].triggers).
'use strict';
const fs = require('fs'), path = require('path');
const R = p=> fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const app = R('arena_app.js'), cards = JSON.parse(R('canonical/cards.json')), T = require('../bramblewood-texts.js').TEXT;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } };
function fnSrc(name){ const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return ''; let i = app.indexOf('{', a), d = 0; for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) break; } } return app.slice(a, i + 1); }
const by = id=> cards.find(c=> c.id === id);
['fox-kit', 'otter-kit', 'rabbit-kit'].forEach(id=> ok(by(id) && by(id).kind === 'baby', id + ' is a Baby'));
const lift = new Function(['cardBaseLevel', 'effectsAtLevel', 'ux8TriggerLevels'].map(fnSrc).join('\n') + '\nreturn {cardBaseLevel, effectsAtLevel, ux8TriggerLevels};')();
const ant = by('worker-ant');
ok(lift.cardBaseLevel(ant) === 0, 'Worker Ant starts at Level 0');
ok(lift.cardBaseLevel(by('honey-bee')) === 1, 'other Base starters unchanged (Level 1)');
ok(!lift.effectsAtLevel(ant, 0).triggers && lift.effectsAtLevel(ant, 1).triggers.length === 1, 'its trigger arrives at Level 1');
ok(ant.attack === 1 && ant.health === 6, 'stats unchanged');
// editor round trip: a levelled trigger reads back as lv, the base-level list does not
const c = {effects: {triggers: [{on: 'onAttack', do: 'drawCard'}, {on: 'onKill', do: 'drawCard'}]}, levelSkills: {0: {triggers: [{on: 'onAttack', do: 'drawCard'}]}, 2: {triggers: [{on: 'onAttack', do: 'drawCard'}, {on: 'onKill', do: 'drawCard'}]}}, baseLevel: 0};
lift.ux8TriggerLevels(c); ok(c.effects.triggers[0].lv === undefined && c.effects.triggers[1].lv === 2, 'trigger levels derive from levelSkills');
ok(/levelFx\[L\] = levelFx\[L\] \|\| \{\}\)\.triggers = triggers\.filter/.test(app) && /data-tlvadd/.test(app), 'trigger rows save and offer the LvL button');
ok(T['ui.ux8-lvl-btn'] === 'LvL' && !/＋<\/button>`}\n    <button class="btn small danger rm" data-rmskill/.test(app), 'skill row button reads LvL');
ok(/AI pick/.test(T['ui.rv2-tag-claude']) && !/Claude|Codex/.test(T['ui.ui37-src-claude']) && T['ui.ui37-src-flag'] === 'My pick', 'AI pick / My pick wording');
ok(!/rv2-tag-owner/.test(fnSrc('rv2TagsOf')) && /ux8-tag-starter/.test(fnSrc('rv2TagsOf')), 'Starter tag in, Your note out');
ok(/lateBaby/.test(app) && /flagged\.filter\(r=> r\.late\)/.test(app), 'late (Baby-only) skills go last');
console.log(fail ? 'FAIL ' + fail : 'ok: ux8'); process.exit(fail ? 1 : 0);
