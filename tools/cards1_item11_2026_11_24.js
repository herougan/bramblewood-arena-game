// CARDS1 item 11 (owner 2026-11-23 23:39): resistances / weaknesses default none; explicit only when super relevant to the real animal and the damage types.
// Cards store them in the top-level `resist` array (the engine's resistFactor reads it; the budget does not price it).
const L = require('./cards1_lib_2026_11_24.js'), cards = L.load(), by = Object.fromEntries(cards.map(c=>[c.id, c]));
const drop = 'caustic-scorpion sand-widow stag-knight riverworks-bastion ashbone-ghoul cinder-skeleton cinder-gecko ash-moth tide-spirit harp-seal-pup ringed-seal arctic-tern lemming-swarm krill-swarm woodland-caribou greenland-shark fathom-leviathan beluga lions-mane-jelly turtle-bastion bog-behemoth grovebearer-dragon-turtle'.split(' ');
const add = {'poison-dart-frog': ['poison'], 'phoenix-fledgling': ['heat'], 'fire-drake-hatchling': ['heat'], 'fire-salamander': ['heat'], 'snow-leopard': ['cold'], 'glacier-yak': ['cold']};
const out = [];
for(const id of drop){ const c = by[id], was = JSON.stringify(c.resist); c.resist = []; L.note(c, '2026-11-24 (CARDS1, owner 2026-11-23 23:39 #11): resist ' + was + ' removed (default none; not super relevant to the animal).'); out.push([id, was, '[]']); }
{ const c = by['komodo-warlord']; const was = JSON.stringify(c.resist); c.resist = ['poison']; L.note(c, '2026-11-24 (CARDS1, #11): resist ' + was + ' -> ["poison"] (the heat resist was generic; a komodo is the venomous one).'); out.push([c.id, was, '["poison"]']); }
for(const id in add){ const c = by[id], was = JSON.stringify(c.resist || []); c.resist = add[id]; L.note(c, '2026-11-24 (CARDS1, #11): resist ' + JSON.stringify(add[id]) + ' added (super relevant: the animal is a ' + add[id][0] + ' creature by nature).'); out.push([id, was, JSON.stringify(add[id])]); }
L.save(cards); out.forEach(r=> console.log(r.join(' | ')));
