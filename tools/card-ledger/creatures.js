// Creature types (2026-10-12, user: "do a count: I don't want too much of any type of creature"). A card's creature is its
// most specific animal archetype (Otter, Hummingbird, Bee...), falling back to a broad class tag (Bird, Insect) and then
// to its species (Canid, Rodent...). Biome and role tags (River, Village, Leader...) are not creatures.
const NON_CREATURE = new Set(['Volcanic','River','Village','Structure','Swamp','Cave','Flora','Leader','Tundra','Forgotten','Mountain','Ecclesia','Frost','Savanna','Coastal','Oddity','Rainforest','Devil','Materia','Ocean','Coral Reef','Taiga','Desert','Field','Shrine','Mangrove','Irradiated','King','Traveller','Misc','Shadow','Forest','Pond']);
const BROAD = new Set(['Bird','Insect','Mammal','Reptile','Fish','Elemental']);
function creatureOf(c){
  const tags = (c.archetypes||[]).filter(a=> !NON_CREATURE.has(a));
  return tags.find(a=> !BROAD.has(a)) || tags[0] || (c.species||[])[0] || 'Unknown';
}
function speciesOf(c){ return (c.species && c.species.length) ? c.species[0] : 'Unknown'; }
module.exports = {creatureOf, speciesOf, NON_CREATURE};
