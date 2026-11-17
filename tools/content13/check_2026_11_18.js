// 2026-11-18 (CONTENT13 phase 2): the 16 new cards: budget ok, no retired key. node tools/content13/check_2026_11_18.js
const SC = require('../skill_costs.js'), K = SC.make(require('../../canonical/skill-costs.json')), P = require('../../bramblewood-skillparams.js');
const cards = require('../../canonical/cards.json'), spec = require('../../docs/design/content13-2026-11-18.json').cards.map(x => x.card.id);
let bad = 0;
cards.filter(c => spec.includes(c.id)).forEach(c => {
  const b = K.budget(c), r = P.needsRetire(c.effects), tr = false;
  const ok = b.ok && !r && !tr && !b.missing.length; if (!ok) bad++;
  console.log(ok ? 'ok  ' : 'FAIL', c.id, 'S', b.S, 'N', b.N, 'x1', b.x1, 'x2', b.x2, 'N2', b.N2, 'retire', r, 'missing', b.missing.join());
});
process.exit(bad ? 1 : 0);
