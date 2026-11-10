// 2026-11-10 (package BAL46): BAL45's tool, adapted for the three main-map fights a 400-game road measure (bal45w400) read out of band (5-2, 7-6, 10-7); every 200-game read is played at 400 (./rules_2026_11_10.js), output docs/balance/bal46/. BAL45's header: BAL44's tool. BAL44's header: BAL43's tool. BAL43's header: BAL42's tool. BAL42's header: one more lever rule on BAL35's tuner (brief: never touch a boss's or a miniboss's leaders). BAL35's setup()
// offers a leader move on any fight with a non-namesake leader, The Morel Monarch 7-6 and The Sand Widow Queen 18-7 included; here a boss
// or miniboss gets no leader candidates and legal() refuses any leader list other than the one it has. Required by ./boon_expand.
'use strict';
const T = require('../bal35/road_tune_2026_11_10.js');
if (!T.__bal42Rules) {
  const setup0 = T.setup;
  T.setup = code => {
    const F = setup0(code);
    if (F.kind === 'boss' || F.kind === 'miniboss') {
      const want = JSON.stringify(F.leaders0 || []), legal0 = F.legal;
      F.leaderCands = [];
      F.legal = (d, leaders) => legal0(d, leaders) && (!leaders || JSON.stringify(leaders) === want);
    }
    return F;
  };
  T.__bal42Rules = true;
}
// BAL46: every 200-game read (the before / pick reads on the road seeds 9100 + 37g, the exhaust's top re-reads on its tune seeds, the
// leader options) plays 400 games: bal45w400 found three fights out of band that read in band at 200, so the pick and the keep rule read
// 400 (the road measure's own first 400 games on the road seeds). Result fields keep their old names (win200 = the 400-game read).
if (!T.__bal46Games) {
  const measure0 = T.measure;
  T.measure = (F, v, games, seed0) => measure0(F, v, games === 200 ? 400 : games, seed0);
  T.__bal46Games = true;
}
module.exports = {};
