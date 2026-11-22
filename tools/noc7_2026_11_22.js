#!/usr/bin/env node
// 2026-11-22 (package NOC7, owner 13:22 SGT: "help me move nocturnal to the morell map. Then adjust accordingly. I think moonlight hare doesn't below
// anymore."): step A. Nocturnal is new on Map 7 (mu): Leopard Slug takes it (stats kept, budget ok), the Glow-worm Cluster joins Map 7's list;
// Lotus Frog loses it (3/7 Pounce), Barrow Leech loses it (2/9; Map 6 keeps only Lamprey as a second Parasite carrier, so the bat stays on Map 6);
// Moonlit Hare leaves every list (the card stays, unattainable). Step B (decks) is tools/noc7_decks_2026_11_22.js.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json');
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8')), by = Object.fromEntries(cards.map(c=> [c.id, c]));
const note = (c, s)=>{ c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + '2026-11-22 (NOC7, owner 13:22): ' + s; };
const dropLvl = (c, k)=>{ Object.values(c.levelBonus || {}).forEach(b=>{ if(b.skills){ delete b.skills[k]; if(!Object.keys(b.skills).length) delete b.skills; } }); };
let c = by['lotus-frog']; delete c.effects.nocturnal; dropLvl(c, 'nocturnal'); c.attack = 3; note(c, 'Nocturnal moved to the Morel Hollow (Map 7); Pounce 1 stays, 2/7 -> 3/7 (the fewest points that restore its power).');
c = by['barrow-leech-bat']; delete c.effects.nocturnal; dropLvl(c, 'nocturnal'); c.attack = 2; note(c, 'Nocturnal moved to Map 7 (Map 6 keeps one Parasite carrier besides it, Lamprey, so the bat stays); Flying + Parasite stay, 1/9 -> 2/9.');
c = by['leopard-slug']; c.effects = Object.assign({nocturnal: 1}, c.effects); note(c, 'Nocturnal 1 added (slugs feed at night): the Map 7 Nocturnal carrier, stats kept (1/11 within budget).');
c = by['glowworm-cluster']; delete c.unattainable; c.source = {kind: 'pack', tier: 2, map: 'mu'}; note(c, 'placed on Map 7 (Morel Hollow) as its second Nocturnal carrier; stats kept.');
note(by['moonlit-hare'], 'taken off every map list (Nocturnal is Map 7\'s skill now); the card stays in the data, unattainable (decision NOC7-1).');
fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
// map-pools.json keeps its inline-array layout: edit the text, not a re-dump
let txt = fs.readFileSync(POOLS, 'utf8'); txt = txt.replace(/"moonlit-hare", /g, '');
txt = txt.replace(/("mu": \{\n\s+"cards": \[[^\]]*)\]/, '$1, "glowworm-cluster"]');
fs.writeFileSync(POOLS, txt);
