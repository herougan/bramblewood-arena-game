#!/usr/bin/env node
// 2026-11-16 (package CARDPOW1, owner 11-16 23:53: "balancing of each card currently existent (farm dog isn't power rated yet for example)"):
// no card without a rating. Every card of canonical/cards.json that can be on the board (test cards, Hall of Fame variants and materia aside)
// has a card power row (docs/balance/bal25/card-power.json, tools/card_balance.js --v3 --scope=all) and a budget reading at Levels 1-10
// (docs/balance/cardpow1/cardpow1-2026-11-16.json); every skill on them has a price; the build hands the editor a power number for each.
// A card added later fails here until it is rated:  node tools/card_balance.js --v3 --scope=all --only=<id,...>  (folds into the full report).
// Static, no simulations.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f => JSON.parse(read(f));
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } };
const CARDS = J('canonical/cards.json'), playable = CARDS.filter(c => !c.test && !c.hallOfFame && !c.baseId && c.cardType !== 'materia');
ok(playable.length > 800, 'playable cards counted (' + playable.length + ')');

// ---- the card power test: a row with a win rate for every playable card
const CP = J('docs/balance/bal25/card-power.json'), rows = {}; (CP.rows || []).forEach(r => { rows[r.id] = r; });
// a card the test side never got to play (Prayer, Evolutes, a spell the CPU skips) has a row with its reason; allowed only while no player can own it
const GB = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G, ownable = c => !c.token && !GB.isUnattainable(c);
const unrated = playable.filter(c => !(rows[c.id] && (Number.isFinite(rows[c.id].winRate) || (rows[c.id].unplayedWhy && !ownable(c)))));
const why = playable.filter(c => rows[c.id] && !Number.isFinite(rows[c.id].winRate));
ok(why.length < 25 && why.every(c => rows[c.id].unplayedWhy), 'the few unplayed rows each say why (' + why.length + ': ' + why.filter(c => !rows[c.id].unplayedWhy).map(c => c.id).join(', ') + ')');
ok(playable.filter(ownable).every(c => rows[c.id] && Number.isFinite(rows[c.id].winRate)), 'every card a player can own has a power number');
ok(['caldera-wyrm', 'irradiated-glow-wyrm'].every(id => rows[id] && rows[id].helpers && Number.isFinite(rows[id].winRate)), 'Stone / Metal / Uranium cards measured with resource helpers');
ok(!unrated.length, `every playable card power rated (${unrated.length} not: ${unrated.slice(0, 12).map(c => c.id).join(', ')}${unrated.length > 12 ? ' ...' : ''}; rate them: node tools/card_balance.js --v3 --scope=all --only=<ids>)`);
ok(rows['farm-dog'] && rows['farm-dog'].scope !== 'extra', 'Farm Dog rated, inside the Maps 0-20 scope');
ok(CP.v === 3 && CP.games >= 400, 'v3, 400 games a card (' + CP.games + ')');
ok(CP.scope && /scope=all/.test(CP.scope.rule || '') && CP.scope.maps0to20 > 350, 'the run covers every playable card; the Maps 0-20 scope recorded (' + (CP.scope && CP.scope.maps0to20) + ')');
ok(CP.fit && CP.fit.n > 300, 'the "for its budget" fit over the Maps 0-20 cards (n ' + (CP.fit && CP.fit.n) + ')');
const extraInPool = ((CP.advanced || {}).pool || []).filter(id => rows[id] && rows[id].scope === 'extra');
ok(!extraInPool.length, 'the advanced pool holds Maps 0-20 cards only (' + extraInPool.join(', ') + ')');
ok((CP.rows || []).filter(r => r.scope === 'extra').every(r => Number.isFinite(r.winRate) || r.unplayedWhy), 'extra rows have a win rate or the reason they have none');

// ---- the tool: the scope fix and the options
const tool = read('tools/card_balance.js');
ok(/function obtainable0\(c\)/.test(tool) && /isUnattainable\(c\)/.test(tool), 'unlisted Map 0 cards the game hands out are in the Maps 0-20 scope');
ok(/optv\('scope', ''\) === 'all'/.test(tool) && /optv\('shard', ''\)/.test(tool), '--scope=all and --shard=K/N');
ok(/SCOPE_ALL && ONLY\.length/.test(tool), '--scope=all --only folds into the full report');

// ---- budget: a price for every skill, a reading at Levels 1-10 for every playable card
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(J('canonical/skill-costs.json'));
const noPrice = [];
playable.forEach(c => { const e = c.effects || {}; let r; try { r = SC.cardS(e, c); } catch (err) { noPrice.push(c.id + ' (error)'); return; } [...new Set(r.missing || [])].forEach(m => noPrice.push(c.id + ': ' + m)); });
ok(!noPrice.length, 'a price for every skill on every playable card (' + noPrice.slice(0, 10).join('; ') + ')');
const RP = J('docs/balance/cardpow1/cardpow1-2026-11-16.json'), rp = {}; RP.cards.forEach(r => { rp[r.id] = r; });
const noFill = playable.filter(c => !(rp[c.id] && rp[c.id].curve.length === 10 && rp[c.id].curve.every(x => Number.isFinite(x.fill))));
ok(!noFill.length, 'a budget fill at Levels 1-10 for every playable card (' + noFill.slice(0, 10).map(c => c.id).join(', ') + '; node tools/cardpow1/cardpow1_2026_11_16.js)');
ok(RP.band[0] === 85 && RP.band[1] === 100, 'band 85-100% at Level 1');
ok(rp['farm-dog'] && rp['farm-dog'].power && Number.isFinite(rp['farm-dog'].power.n), 'the report carries Farm Dog\'s power');

// ---- the build: the editor's CARD_POWER has a number for every playable card, centred on the Maps 0-20 median
ok(/r\.get\("scope"\) != "extra"/.test(read('assemble_arena.py')), 'the editor\'s zero is the Maps 0-20 median');
if (fs.existsSync(path.join(ROOT, 'index.html'))) {
  const html = read('index.html'), i = html.indexOf('const CARD_POWER = '), j = i < 0 ? -1 : html.indexOf(';\n', i);
  let cpb = null; try { cpb = JSON.parse(html.slice(i + 'const CARD_POWER = '.length, j)); } catch (e) { cpb = null; }
  ok(cpb && cpb.wr, 'index.html: CARD_POWER present');
  const miss = cpb && cpb.wr ? playable.filter(c => rows[c.id] && Number.isFinite(rows[c.id].winRate) && !Number.isFinite(cpb.wr[c.id])) : playable;
  ok(!miss.length, 'index.html: a power number for every rated card (' + miss.length + ' missing: ' + miss.slice(0, 8).map(c => c.id).join(', ') + '; rebuild)');
}

// ---- package bookkeeping
ok(/^## 2026-11-1[67][^\n]*CARDPOW1/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/cardpow1-2026-11-16\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');

console.log(`cardpow1: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
