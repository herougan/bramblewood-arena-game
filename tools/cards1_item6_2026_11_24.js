// CARDS1 item 6 (owner 2026-11-23 23:39): starter cards start at Level 0 (baseLevel 0, the Worker Ant / UX8 way); their skills arrive at Level 1 (levelSkills "1").
// Hatchling / Regeneration-less drawbacks stay at Level 0 (slow). Stats unchanged: Level 1 = printed (no levelBonus "1" on any of them).
const L = require('./cards1_lib_2026_11_24.js'), cards = L.load(), by = Object.fromEntries(cards.map(c=>[c.id, c]));
const ids = 'duck-paddler pond-trout crimson-wing-recruit mosswing-laborer cobalt-talon-fledgling honey-bee silver-minnow river-carp burrow-rabbit chipmunk-forager harvest-mouse sheep pond-duck acorn-chipmunk cottontail otter-paddler meadow-rabbit crossed-eyes garden-snail earthworm guppy'.split(' ');
const STAY = new Set(['slow', 'hatchling', 'chrysalis']);
for(const id of ids){ const c = by[id]; const moved = [];
  if(c.baseLevel !== 0){ c.baseLevel = 0; }
  const fx = c.effects || {}; Object.keys(fx).forEach(k=>{ if(STAY.has(k)) return; c.levelSkills = c.levelSkills || {}; c.levelSkills['1'] = Object.assign({[k]: fx[k]}, c.levelSkills['1'] || {}); delete fx[k]; moved.push(k); });
  if(c.effects && !Object.keys(c.effects).length && c.effects !== undefined) c.effects = {};
  L.note(c, '2026-11-24 (CARDS1, owner 2026-11-23 23:39 #6): a starter that starts at Level 0 (baseLevel 0)' + (moved.length ? '; ' + moved.join(', ') + ' arrives at Level 1 (levelSkills)' : '') + '. Stats unchanged.');
  console.log(id, 'baseLevel 0', moved.join(',')); }
L.save(cards);
