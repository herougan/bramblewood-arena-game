// 2026-11-18 (TESTFIX): the cards the owner's redesign (OWN-1117-3: FOLD6, SKAUD1/2, CONTENT13) or a later dated edit re-set on purpose.
// An old test that pins a card's earlier stats, skills or list accepts these; every other card keeps its pin.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const DIFF = J('tests/lib/redesign-changed.json'), CHANGED = new Set(DIFF.changed.concat(DIFF.added, DIFF.removed)), DIFF_ADDED = new Set(DIFF.added);
const R3 = J('docs/design/redesign3-2026-11-17.json'), MADE_OBTAINABLE = new Set(R3.clearUnattainable);
// 2026-11-19 (TESTFIX6): DATAFIX's (11-18) moves on the main lists (tools/datafix_2026_11_18.js: JJ28 defenders, opt2, N221's MAP-tier cap;
// a card it moved to SPECIAL is a remove here). Applied after FOLD6's.
const DATAFIX_LISTS = [['mw', 'add', 'cypress-root-lurker'], ['m7', 'add', 'fiddler-crab-swarm'], ['m2', 'remove', 'dolphin-knight'],
  ...['ur-elk', 'cinder-hornet', 'pumice-beetle'].map(id => ['m21', 'remove', id]),
  ...['glacier-yak', 'fumarole-ibex', 'obsidian-scorpion', 'ash-cloud-condor', 'ravenous-wolverine'].map(id => ['m22', 'remove', id]),
  ...['pack-mule', 'lodge-engineer'].map(id => ['m23', 'remove', id])].map(([map, op, id]) => ({ map, op, id }));
// 2026-11-20 (TESTFIX8): DEC19-DATA (11-19, LIST1-1 a): Malachite Golem takes Granite Ox Golem's place on Basalt Foundry (m3/m9). Applied last.
const DEC19_LISTS = [{ map: 'm3', sub: 'm9', op: 'remove', id: 'granite-ox-golem' }, { map: 'm3', sub: 'm9', op: 'add', id: 'malachite-golem' }];
R3.lists = R3.lists.concat(DATAFIX_LISTS, DEC19_LISTS);
// FOLD6's list moves, and CONTENT13's new cards (on no list before it): '<map>' or '<map>/<sub>' -> ids added there
const LIST_ADDS = {}; R3.lists.filter(l => l.op === 'add').forEach(l => { const k = l.sub ? l.map + '/' + l.sub : l.map; (LIST_ADDS[k] = LIST_ADDS[k] || new Set()).add(l.id); });
const listAdded = (map, id, sub) => !!(LIST_ADDS[sub ? map + '/' + sub : map] && LIST_ADDS[sub ? map + '/' + sub : map].has(id)) || DIFF_ADDED.has(id);
// a list as FOLD6 left it: its remove / add ops applied to an earlier expectation (CONTENT13's new cards added where the live list has them)
function withListMoves(map, sub, list, live) {
  const ops = R3.lists.filter(l => l.map === map && (l.sub || null) === (sub || null)), out = list.slice(); // in order: FOLD6's, then DATAFIX's
  ops.forEach(o => { const i = out.indexOf(o.id); if (o.op === 'remove' && i >= 0) out.splice(i, 1); else if (o.op === 'add' && i < 0) out.push(o.id); });
  (live || []).filter(id => DIFF_ADDED.has(id) && !out.includes(id)).forEach(id => out.push(id));
  return out;
}
const BY_ID = Object.fromEntries(J('canonical/cards.json').map(c => [c.id, c]));
// a creatorNote line dated on or after `since` (FOLD5's owner edits, SKAUD1, and the balance passes after it write one)
const notedSince = (c, since) => (((c && c.creatorNote) || '').match(/\b2026-\d\d-\d\d\b/g) || []).some(d => d >= since);
// since: the date of the pin being checked; a card edited (with a note) after it moved on
function redesigned(idOrCard, since = '2026-11-16') {
  const id = typeof idOrCard === 'string' ? idOrCard : idOrCard && idOrCard.id;
  return CHANGED.has(id) || notedSince(BY_ID[id], since);
}
// 2026-11-19 (TESTFIX6): LVL10 moved skills a card learns later into levelSkills; "does this card carry X" reads its skills by Level 10
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const skillsAt10 = idOrCard => { const c = typeof idOrCard === 'string' ? BY_ID[idOrCard] : idOrCard; return c ? BB.levelEffectsAt(c, 10) : {}; };
module.exports = { redesigned, MADE_OBTAINABLE, CHANGED, LIST_ADDS, listAdded, withListMoves, card: id => BY_ID[id], skillsAt10 };
