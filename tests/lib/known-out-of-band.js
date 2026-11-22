// 2026-11-22 (TESTFIX9): in-play cards the budget band checks (budget2, bal9 JJ21, bal12) find outside their band on the 11-22 build. Card stats are the owner's
// (live edits folded by CONTENT12 / FOLD5, LVL10's Level 1 re-fits, DATAFIX / NOC7 list moves, the budget rule moves of BAL14 / ENG40 ...); the old checks assumed only
// Echo Matriarch / Otter Angler stay out. A card on this list is reported, not failed; a card NOT on it still fails. Shrink it as cards are re-fit.
'use strict';
const KNOWN = ['echo-matriarch', 'otter-angler', 'bramble-sprout', 'venomlord-serpent', 'mouse-sapper', 'clownfish-scout', 'blind-cave-fish', 'chipmunk-forager', 'beaver-lumberjack',
  'inside-out-hedgehog', 'hedge-changeling', 'meerkat-wayfarer', 'stonedrop-vulture', 'shellwright-apprentice', 'harbor-seal', 'pika-hoarder', 'slow-worm', 'robin-redbreast',
  'leopard-slug', 'pond-algae', 'nutria-reedcutter', 'matamata', 'fruit-bat', 'glow-worm', 'bar-headed-goose-leader', 'praying-mantis-striker', 'spitfire-sawfly-grubs',
  'soft-shell-crab-newmoult', 'raccoon-nightcrew', 'irradiated-axolotl', 'salvager-hermit-crab', 'granite-ox-golem', 'sandfish', 'spitting-spider', 'squires-mount'];
module.exports = { KNOWN, isKnown: id => KNOWN.includes(id) };
