// 2026-11-11 (package SKIR1): Claude's own administrative list adds beyond THEME8's (owner 00:16: "For Map 0-11, if you think my selection was
// not diverse enough ... you can make administrative changes. Carrying 2-3 more cards is not game-breaking at all"). {main: {mapId: {cardId:
// reason}}, sub: {submapId: {cardId: reason}}}; read by tools/skir1/fold_lists_2026_11_11.js and reported. Only the owner's focus (Lumber) is
// filled: each add is a card an earlier map already lists (carried, so no card's first map moves), and no card is on more than two maps' adds.
'use strict';
module.exports = {
  main: {
    mf: { 'hazel-coppice': 'a second Lumber maker for Thistlewood (only the Pack Rat Looter makes Lumber in its fights; the Chipmunk Skirmisher is 0-1\'s reward): carried from Map 0, a hazel thicket under the first big trees; also a fourth 1-Lumber card' },
    m4: { 'pack-rat-looter': 'Caves & Alcoves had no Lumber maker its fights may field (the Driftwood Crab is 2-5\'s reward): a rat that hoards in the alcoves, carried from Map 1',
      'bone-diviner': 'a second Lumber maker for the caves: the barrow crow (Map 6\'s admin add) next to the Barrow Leech Bat' },
    mk: { 'salvager-hermit-crab': 'a second Lumber maker for the Kelp Mangroves (only the Nutria Reedcutter; the Driftwood Crab is 2-5\'s reward): a salvaging crab among the fiddlers, carried from Smugglers\' Grotto (Map 7)' },
  },
  sub: {},
  // the batch's own list adds that landed while SKIR1 ran (kept on top of the fold): CONTENT19's Sea Bass on Map 10 (THEME8's Map 10 suggestion)
  batch: { m7: { 'sea-bass': 'CONTENT19 (2026-11-11): the Sea Bass, THEME8\'s Wave / Swarm (Fish) card for Coral Current' } },
};
