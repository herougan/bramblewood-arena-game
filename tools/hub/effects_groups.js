// 2026-11-27 (HUB5): the sections of the Effects tab, shared by effects_0_20.js (by list) and effects_cards_0_20.js (by card), so both views group the same way.
'use strict';
const GROUPS = [
  ['Strikes and attack shapes', 'pounce gash arrow fireArrow fireBolt snipe volley crabClaws trident octolash fork sweep twinStrike reach stealth siege overwhelm mighty pierce pulverise electricity wave bulldoze recoil counterattack hunter trap ambush dynamite landslide'],
  ['Statuses its hits leave', 'poison bleed decay corrode daunt weaken web strangle tangle exploit expose brittle confuse sap intimidate'],
  ['Each-turn powders and clouds', 'paralysisPowder poisonPowder sleepPowder smokeBomb'],
  ['Defence', 'armor shield bulwark rampart thorns poisonBarbs guardian taunt evasive flying swift sturdy rage regen immunity slow purblind'],
  ['Growth, deaths and new units', 'harbinger carrion carnage momentum meiosis bloomCopy offspring hatchling evolute broodkeeper onDeathSpawn parasite loneWolf throng plenty fastForward'],
  ['Team and support', 'swarm pack packHowl packLeader leader inspiring nursing foraging herbalist repair fletcher armourer illuminate'],
  ['Day, night, weather and senses', 'tide diurnal nocturnal storm heat dry darksight keenSense'],
  ['Resources', 'delivery forestry'],
];
module.exports = GROUPS;
