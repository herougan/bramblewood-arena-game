#!/usr/bin/env node
// 2026-11-02 (package BAL12, owner 22:26: "really design cards to give more lumber"; 20:19: no new cards): the existing in-play cards that
// could take On Ready +1 Lumber (or an On Play gain) by theme and by budget room. A list for the owner to pick from, nothing applied.
//   node tools/bal12/lumber_candidates_2026_11_02.js   -> docs/balance/bal12/lumber-candidates-2026-11-02.md
// Theme: a gatherer, hoarder or builder animal (the names below) or a forest / wood card type. Room: N - the cap-1 left side at its start
// level, against On Ready +1 Lumber's price at its home lists (onReadyGold x lumberHomeMult); "fits as is" = room covers it, else the stat
// points it would give up (3A + H).
'use strict';
process.env.SKILL2_MISSMULT = '1'; process.env.SKILL2_NO_NAMED = '1';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..', '..');
const R = require('../skill2_refit_2026_10_31.js'), LB = require('../lib_bramble.js'), LP = require('../lib_map_pools.js'), BB = require('../../bramblewood-budget.js');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const THEME = /beaver|squirrel|chipmunk|woodpecker|termite|packrat|pack-rat|gopher|vole|hamster|pika|marmot|mole|(^|-)ants?(-|$)|bee-|wasp|bowerbird|weaver|magpie|jackdaw|crow|raven|jay|nutcracker|dormouse|mouse|(^|-)rat(-|$)|badger|porcupine|lumber|logger|forager|gatherer|hoarder|builder|carpenter|mason|tiller/i;
const price = R.NEW.skillCost('onReadyGold', 1), out = [];
cards.forEach(c => { const d = LB.CARD_DEFS_BASELINE[c.id]; if (!d || c.pool || c.token || c.test || c.health == null || LP.isOutOfPlay(LB.G, d)) return;
  const e = c.effects || {}; if (e.onReadyGold || (e.triggers || []).some(t => t && t.do === 'gain' && t.resource === 'lumber') || e.egg || /^egg-/.test(c.id)) return;
  if (!THEME.test(c.id) && !THEME.test(c.name || '')) return;
  const v = R.verdict(R.NEW, c), lh = (table.lumberHome || {})[c.id], cost = Math.round(price * BB.lumberHomeMult(lh) * 100) / 100, room = Math.round((v.N - v.x1) * 100) / 100;
  out.push({ id: c.id, name: c.name, rarity: c.rarity, stats: `${c.attack}/${c.health}`, lumber: c.cost || 0, use: v.use, room, cost, fits: room >= cost, give: Math.max(0, Math.round((cost - room) * 100) / 100) }); });
out.sort((a, b) => (b.fits - a.fits) || a.give - b.give || b.room - a.room);
const md = ['# Lumber-gain candidates among existing cards (BAL12, 2026-11-02)', '', `Owner 22:26 "design cards to give more lumber"; no new cards (20:19). On Ready +1 Lumber costs ${price} (the canon at bramble 15) x its home lists' multiplier. Room = N - the cap-1 left side. Nothing applied: the owner picks.`, '',
  '| Card | Rarity | Lumber | A/H | Cap-1 use | Room | Skill price | Fits as is | Stat points to give up |', '|---|---|---|---|---|---|---|---|---|', ...out.map(r => `| ${r.name} (${r.id}) | ${r.rarity} | ${r.lumber} | ${r.stats} | ${r.use} | ${r.room} | ${r.cost} | ${r.fits ? 'yes' : 'no'} | ${r.give} |`), ''];
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal12', 'lumber-candidates-2026-11-02.md'), md.join('\n'));
out.slice(0, 25).forEach(r => console.log(`${r.id.padEnd(28)} ${String(r.rarity).padEnd(9)} L${r.lumber} ${r.stats.padEnd(6)} use ${r.use} room ${r.room} price ${r.cost} ${r.fits ? 'fits' : 'give ' + r.give}`));
console.log(out.length + ' candidates -> docs/balance/bal12/lumber-candidates-2026-11-02.md');
