// 2026-11-18 (CONTENT13 phase 2): the 16 cards onto the map lists: pack cards on their map's MAP list, the two carriers on SPECIAL.
const fs = require('fs'), path = require('path'), {serialize} = require('../fold_map_pools.js');
const F = path.join(__dirname, '../../canonical/map-pools.json'), doc = JSON.parse(fs.readFileSync(F, 'utf8'));
const spec = require('../../docs/design/content13-2026-11-18.json').cards;
const SPECIAL = {'caddisfly-casemaker': 'm24', 'mole-cricket-megaphone': 'm22'};
spec.forEach(x=>{ const c = x.card, id = c.id, sp = SPECIAL[id], m = sp || c.source.map, list = sp ? doc.maps[m].special : doc.maps[m].cards; if(!list.includes(id)) list.push(id); });
fs.writeFileSync(F, serialize(doc));
