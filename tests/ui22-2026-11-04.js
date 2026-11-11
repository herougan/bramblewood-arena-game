#!/usr/bin/env node
// 2026-11-04 (package UI22, owner 22:56): static checks, no browser:
//   1 the Map cards window has a Skirmish rewards section read from the game's own functions (nodeRewardCardIds, nodeFirstPackCardIds, cardRewardIsChallenge)
//   2 Claude's recommended cards are a section with a "Claude New" pill, on no list (no .rv1-tile, no data-rv-*), data from canonical/claude-new-cards.json
//   3 the compact skills block of UI22a is kept
//   4 every new text is a TX key with a row in the 12 language packs
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const asm = fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗', m); } };
const grab = (name)=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };

const rw = grab('ui22McRewardsHTML');
ok(/nodeRewardCardIds\(/.test(rw) && /nodeFirstPackCardIds\(/.test(rw) && /cardRewardIsChallenge\(/.test(rw), '1. rewards come from nodeRewardCardIds, nodeFirstPackCardIds and cardRewardIsChallenge');
ok(/skirmishCode\(/.test(rw) && /data-ui22-fight/.test(grab('ui22McTile')), '1. each card carries its fight code as a pill (2026-11-12, UI48: one grid, no caption per fight)');
ok(/mpSubsOf\(top\)/.test(grab('ui22McMaps')) && /mpIsSub\(mapId\)/.test(grab('ui22McMaps')), '1. a main map includes its side maps; a side map its own fights');
ok(/ui39PlainTileHTML/.test(grab('ui22McTile')), '1. same card tiles as the other sections');
const cn = grab('ui22McClaudeNewHTML'), cn2 = grab('ui22McClaudeNew');
ok(/ui22-pill/.test(cn) && /TX\('ui\.ui22-claude-new'\)/.test(cn), '2. tiles wear a Claude New pill (TX key)');
ok(!/rv1-tile|data-rv-/.test(cn) && !/mapPoolAdd|mpMutate|mapPoolMove/.test(cn + cn2 + rw), '2. not a review tile, no list function called');
ok(/!onLists\.has\(id\)/.test(cn2), '2. a card already on one of the map\'s lists is left out');
ok(/__CLAUDE_NEW__/.test(asm) && /claude-new-cards\.json/.test(asm) && fs.existsSync(path.join(ROOT, 'canonical', 'claude-new-cards.json')), '2. data baked in from canonical/claude-new-cards.json');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'claude-new-cards.json'), 'utf8'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), arr = Array.isArray(cards) ? cards : (cards.cards || Object.values(cards));
const ids = new Set(arr.map(c=> c.id));
const all = Object.values(data.theme5).concat(Object.values(data.skillrec)).flat();
ok(all.length > 20 && all.every(e=> ids.has(e.id)), '2. every recommended id is a real card (' + all.length + ')');
ok(/ui22Secs\}<\/div><\/div>`/.test(src) && /\.ui22-pill\{/.test(css), '2. sections are placed in the body; pill styled');
ok(/\.pk1-mc-modal\{overflow-y:auto/.test(css) && /\.ui19-sk-main small\{[^}]*-webkit-line-clamp:2/.test(css), '3. UI22a: whole dialog scrolls, skills block compact');
const keys = ['ui.ui22-rewards-title', 'ui.ui22-role-reward', 'ui.ui22-role-first', 'ui.ui22-role-challenge', 'ui.ui22-claude-title', 'ui.ui22-claude-new', 'ui.ui22-claude-new-tip'];
const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const packs = codes.map(c=> JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')));
keys.forEach(k=>{ ok(!!TEXT[k], '4. TX key ' + k); packs.forEach((p, i)=> ok(p[TEXT[k]] && p[TEXT[k]] !== '', '4. ' + codes[i] + ' row for ' + k)); });
ok(TEXT['ui.ui22-claude-new'] === 'Claude New', '4. the pill reads Claude New');
console.log(fail ? 'FAIL ' + fail + ' (pass ' + pass + ')' : 'ok ' + pass + ' checks');
process.exit(fail ? 1 : 0);
