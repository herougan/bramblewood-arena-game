// CARDS1 item 19 (owner 2026-11-23 23:39): redesign the Gallery Orb-Weaver (card-level-design skill). Art untouched.
// Concept: the orb-weaver's web IS the card (Web 1 from Level 1, Web 2 at Level 6); its mild venom for wrapped prey comes at Level 2; it
// grows by Health (a web-sitter), Attack +1 at Level 10. Level 10 form 5/10 Web 2 Venomous 1 (98% of N(10)); Levels 1-10 stay at 88-98%.
const L = require('./cards1_lib_2026_11_24.js'), cards = L.load(), c = cards.find(x=> x.id === 'gallery-orb-weaver');
c.attack = 4; c.health = 7; c.effects = {web: 1}; c.levelSkills = {'2': {poison: 1}};
c.levelBonus = {'4': {health: 1}, '6': {health: 1, skills: {web: 2}}, '8': {health: 1}, '10': {attack: 1}};
L.note(c, '2026-11-24 (CARDS1, owner 2026-11-23 23:39 #19 "Redesign gallery orb weaver"): was 4/6 Venomous 1 (Web 1 from Level 2; levelBonus 4 H+2, 7 H+2, 10 A+1); now 4/7 Web 1 from Level 1 (the web is the card), Venomous 1 from Level 2, Web 2 and H+1 at Level 6, H+1 at 4 and 8, A+1 at 10: Level 10 form 5/10 Web 2 Venomous 1 (98% of N(10)), Levels 1-10 88-98%.');
L.save(cards);
