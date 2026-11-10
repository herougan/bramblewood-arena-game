// 2026-11-10 (package BAL46): BAL45's tool, adapted for the three main-map fights a 400-game road measure (bal45w400) read out of band (5-2, 7-6, 10-7); every 200-game read is played at 400 (./rules_2026_11_10.js), output docs/balance/bal46/. BAL45's header: BAL44's tool. BAL44's header: BAL43's tool. BAL43's header: BAL42's tool. BAL42's header: BAL35's tuner checks a challenge deck's selfish boon (DF3) with ENG.selfishBoonCount on the raw card defs
// (lib_bramble's CARD_DEFS_BASELINE). Since ENG39 cards.json stores some skills as kinds (Berserk as Harbinger {who: ally}, ...) that the
// engine expands before a fight reads them, so the theme count must read the expanded defs, as tests/bal3-2026-10-24.js does since FIX12.
// Required first by every tools/bal42 script: the tuner's boon check then reads an expanded copy (E.SKILL_PARAMS_LIB.expandDefsInPlace).
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const ENG = require(path.join(ROOT, 'bramblewood-engine.js')), D = require('../lib_bramble.js').CARD_DEFS_BASELINE;
if (!ENG.__bal41Boon) {
  const DX = JSON.parse(JSON.stringify(D)); if (ENG.SKILL_PARAMS_LIB) ENG.SKILL_PARAMS_LIB.expandDefsInPlace(DX);
  const orig = ENG.selfishBoonCount; ENG.selfishBoonCount = (defs, deck, boon) => orig(defs === D ? DX : defs, deck, boon); ENG.__bal41Boon = true;
}
module.exports = { expanded: true };
require('./rules_2026_11_10.js'); // BAL42: a boss or miniboss keeps its leaders
