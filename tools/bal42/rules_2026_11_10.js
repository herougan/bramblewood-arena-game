// 2026-11-10 (package BAL42): one more lever rule on BAL35's tuner (brief: never touch a boss's or a miniboss's leaders). BAL35's setup()
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
module.exports = {};
