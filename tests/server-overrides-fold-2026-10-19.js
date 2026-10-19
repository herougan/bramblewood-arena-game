// tests/server-overrides-fold-2026-10-19.js (2026-10-19, package BF4; owner 19:34: "can i check that every card has ran through ur
// budget limitation? even the mythics and divines need to be balanced first pass this way")
//   1. every card row of the live server dump is folded into cards.json (its creatorNote says so) at the server's rarity unless a newer
//      file change is a listed conflict; the Dragons are Mythic / Divine / Ancient
//   2. the budget: Mythic 10, Ancient 11, Divine 12 on the ladder (Legendary 9); every folded card passes v5 at Level 1 but the owner calls
//   3. Map 0's four fights and the two tutorials are the owner's node edits
//   4. the proposed SQL (NOT applied) resets exactly the 72 card rows to an empty patch (never deleted = true: that removes a card) and
//      clears exactly the two node rows; map layouts are not touched
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let n = 0, fail = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗ ' + m); } };
const DUMP = JSON.parse(rd('docs/balance/server-overrides/card-overrides-dump-2026-10-19.json'));
const P = JSON.parse(rd('docs/balance/server-overrides/fold-plan-2026-10-19.json'));
const cards = JSON.parse(rd('canonical/cards.json')), by = {}; cards.forEach(c=> by[c.id] = c);
const rows = DUMP.filter(r=> !r.id.startsWith('__cfg:'));

// 1.
ok(rows.length === 72 && P.rows.length === 72, `1. 72 card rows in the dump and the plan (${rows.length}, ${P.rows.length})`);
rows.forEach(r=>{ const c = by[r.id], pr = P.rows.find(x=> x.id === r.id);
  ok(c && /2026-10-19 retune \(server override folded\): was \d+\/\d+ \w+/.test(c.creatorNote || ''), `1. ${r.id} is folded (creatorNote)`);
  ok(c && pr && c.attack === pr.now[0] && c.health === pr.now[1], `1. ${r.id} carries the plan's stats ${pr && pr.now.join('/')}`);
  const rc = pr && pr.conflicts.find(x=> x.field === 'rarity');
  ok(c && (c.rarity === r.data.rarity || (rc && c.rarity === rc.file)), `1. ${r.id}: the server's rarity ${r.data.rarity} (or a listed newer file change)`); });
ok(by['green-dragon'].rarity === 'mythic' && by['red-dragon'].rarity === 'mythic' && by['white-dragon'].rarity === 'divine' && by['black-dragon'].rarity === 'ancient',
  '1. the Dragons are the owner\'s: Green and Red Mythic, White Divine, Black Ancient');
ok(by['green-dragon'].effects.overwhelm === true && by['white-dragon'].effects.trueStrike === true && by['cataphract-destrier'].effects.pounce === 6,
  '1. the server\'s skills (Green Dragon Overwhelm, Cataphract Pounce 6) and the file\'s newer True Strike on the White Dragon');
ok(['green-dragon', 'red-dragon', 'white-dragon', 'black-dragon'].every(id=> !('resist' in (by[id].effects || {})) && (by[id].resist || []).length === 1),
  '1. a Dragon\'s resistance is one list, the card\'s own (the editor\'s effects.resist copy folded in)');

// 2.
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
ok(BB.rankOf('legendary') === 9 && BB.rankOf('mythic') === 10 && BB.rankOf('ancient') === 11 && BB.rankOf('divine') === 12, '2. the ladder: Legendary 9, Mythic 10, Ancient 11, Divine 12');
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(JSON.parse(rd('canonical/skill-costs.json')));
const OWNER = new Set(P.rows.filter(r=> r.verdict === 'owner').map(r=> r.id));
ok([...OWNER].join() === 'cave-bat-swarm', `2. one owner call: the Cave Bat Swarm (its server skills need a cut past half) (${[...OWNER]})`);
rows.forEach(r=>{ if(OWNER.has(r.id)) return; const b = T.budget(by[r.id], {level: 1}); ok(b.ok, `2. ${r.id} passes v5 at Level 1 (2A+H+S ${b.x1} <= N ${b.N}, A·H+S ${b.x2} <= ${b.N2})`); });
ok(P.overBefore.length === 7 && P.overAfter.length === 1, `2. over budget: 7 before (the live versions), 1 after (${P.overBefore.length}, ${P.overAfter.length})`);

// 3.
const src = rd('arena_app.js'), node = key=>{ const m = new RegExp(`\\{ ?key:"${key}",[^\\n]*\\}`).exec(src); return m ? new Function('return (' + m[0] + ');')() : null; };
const m1 = DUMP.find(r=> r.id === '__cfg:map-nodes:m1').data.edits.patches, mt = DUMP.find(r=> r.id === '__cfg:map-nodes:mtut').data.edits.patches;
const ren = d=> { const o = {}; Object.entries(d).forEach(([k, v])=> o[k === 'bee-knight-classic' ? 'bee-knight' : k] = v); return o; };
['0-1', '0-2', '0-3', '0-4'].forEach(k=>{ const nd = node(k), p = m1[k];
  ok(nd && JSON.stringify(nd.deck) === JSON.stringify(ren(p.deck)) && nd.hqHp === p.hqHp && (!p.name || nd.name === p.name) && (!p.requires || JSON.stringify(nd.requires) === JSON.stringify(p.requires)), `3. ${k} is the owner's node edit (deck, Health, name, links)`); });
['tutorial', 'tutorial2'].forEach(k=>{ const nd = node(k), p = mt[k]; ok(nd && nd.hqHp === p.hqHp && nd.tutHp === p.tutHp, `3. ${k}: hqHp ${p.hqHp}, tutHp ${p.tutHp}`); });

// 4.
const sql = rd('supabase/proposed/20261019_clear_folded_overrides.sql');
ok(/PROPOSED, NOT APPLIED/.test(sql) && !fs.existsSync(path.join(ROOT, 'supabase', 'migrations', '20261019_clear_folded_overrides.sql')), '4. the SQL is a proposal (not a migration)');
const upd = sql.split(/;\s*\n/).filter(s=> /^\s*update public\.card_overrides/m.test(s.replace(/^--.*$/mg, '')));
const idsOf = s=> (s.match(/'[^']+'/g) || []).map(x=> x.slice(1, -1)).filter(x=> !/^\{|"__patch"/.test(x));
const cardUpd = upd.find(s=> /__patch/.test(s)), nodeUpd = upd.find(s=> /deleted = true/.test(s));
ok(cardUpd && !/deleted = true/.test(cardUpd) && JSON.stringify(idsOf(cardUpd).sort()) === JSON.stringify(rows.map(r=> r.id).sort()), '4. exactly the 72 card rows get the empty patch, none is marked deleted');
ok(nodeUpd && JSON.stringify(idsOf(nodeUpd).sort()) === JSON.stringify(['__cfg:map-nodes:m1', '__cfg:map-nodes:mtut']), '4. exactly the two node rows are cleared');
ok(!/map-layout/.test(sql) && /deleted_snapshot = data/.test(sql) && /card_overrides_backup_20261019/.test(sql), '4. map layouts untouched; the old rows kept (deleted_snapshot and a backup table)');
console.log(fail ? `server-overrides-fold-2026-10-19: ${fail} of ${n} checks failed` : `server-overrides-fold-2026-10-19: all ${n} checks pass`);
process.exit(fail ? 1 : 0);
