// CARDS1 item 20 (owner 2026-11-23 23:39): Fork is for octopi (Map 4's Drowned Matriarch, Kraken Spawnling, Colossal Squid keep it), Trident is rare (Swordfish Spearman, Anhinga Spearbird,
// the Exo-Podas easter egg keep it). The others take a fitting skill of similar budget (docs/design/cards1-2026-11-24.md has the budget at Levels 1 / 5 / 10).
const L = require('./cards1_lib_2026_11_24.js'), cards = L.load(), by = Object.fromEntries(cards.map(c=>[c.id, c]));
const plan = [ // id, old key, new effect, [attack, health] or null, why
  ['shoal-shark', 'fork', {swift: true}, null, 'a shark is fast water (Swift, Map 3 row)'],
  ['grass-snake', 'fork', {pounce: 3}, null, 'a snake strikes (Pounce, Map 3 row)'],
  ['two-headed-calf', 'fork', {twinStrike: true}, [2, 10], 'two heads, two strikes (Twin Strike, Map 13 row); Attack 3 -> 2 to hold the band'],
  ['ironmaw-warwolf', 'fork', {pack: 1}, null, 'a wolf hunts in a pack (Pack, Map 14 row)'],
  ['pack-wolf-reaver', 'fork', {pack: 1}, [3, 14], 'the pack wolf (Pack); Health 16 -> 14: it was over the cap with Fork'],
  ['alpine-avalanche', 'fork', {mighty: true}, null, 'an avalanche of bear (Mighty)'],
  ['conger-eel', 'fork', {evasive: true}, null, 'an eel slips away (Evasive)'],
  ['mangrove-monitor', 'trident', {armor: 1}, null, 'scaly hide (Armor, Map 2 row), same budget'],
  ['otter-angler', 'trident', {pounce: 1}, null, 'an otter lunges at fish (Pounce, Map 3 row)'],
];
for(const [id, old, nu, st, why] of plan){ const c = by[id], was = c.attack + '/' + c.health;
  delete c.effects[old]; Object.assign(c.effects, nu); if(st){ c.attack = st[0]; c.health = st[1]; }
  L.note(c, '2026-11-24 (CARDS1, owner 2026-11-23 23:39 #20): ' + old[0].toUpperCase() + old.slice(1) + ' is for octopi / iconic carriers only; now ' + JSON.stringify(nu) + (st ? ', stats ' + was + ' -> ' + st.join('/') : '') + ' (' + why + ').'); console.log(id, old, '->', JSON.stringify(nu), was, '->', c.attack + '/' + c.health); }
L.save(cards);
