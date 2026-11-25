P='Pokemon-style pixel art card illustration, clean dark outlines, rich readable palette, one bright accent, natural animal anatomy, not anthropomorphic, no hands, '
S=', a full scenic background filling the whole frame, no text'
PROMPTS={
'ent':('Barn Owl','anatomically correct barn owl: two legs, two wings, a pale heart-shaped face, a pale barn owl gliding low over a dark moonlit hay field with wings spread wide, alert dark eyes, old barn beams and a large dark night sky behind'),
'cypress-root-lurker':('Black Caiman','anatomically correct caiman: four short legs, one long tail, a huge black caiman half-submerged in dark swamp water with only the head and armoured back showing, glowing amber eyes, menacing, cypress knees and hanging moss behind, dusk'),
'willow-o-wisp':('Marsh Firefly','anatomically correct firefly beetle: three body segments, six legs from the thorax, two wing cases, a single tiny firefly with a cold glowing green tail light hovering over dark reeds and still swamp water, night, dim and eerie'),
'kraken-spawnling':('Giant Pacific Octopus','anatomically correct octopus: one rounded mantle, eight arms with suckers, a large reddish giant Pacific octopus spreading its arms over a rocky kelp bed, menacing glowing eyes, dark green water behind'),
'yeti':('Wild Yak','anatomically correct yak: four legs, a huge shaggy black wild yak with long fur skirt and curved horns standing on a bare windswept mountain pass, menacing, bare rock and snow on the ridge behind, cold blue sky'),
'wound-reaver':('Gila Monster','anatomically correct lizard: four legs, one thick tail, a heavy orange and black beaded Gila monster on red desert rock, low and menacing, tall cacti and red mesas behind'),
'magma-salamander':('Marine Iguana','anatomically correct iguana: four legs, one long tail, a row of spines along the back, a heavy black spiny marine iguana on jagged dark lava rock, menacing, surf and ash haze behind'),
'magma-titan':('Cape Buffalo','anatomically correct buffalo: four legs, a huge black cape buffalo with a heavy boss of horn and a scarred hide, head lowered, menacing, on dark ash-grey ground with smoke behind'),
'caldera-wyrm':('The Caldera Komodo','anatomically correct giant lizard: four legs, one long muscular tail, forked tongue, a gigantic scarred Komodo dragon on a black volcanic crater rim, menacing low-angle view, steam vents and red glow behind'),
'fire-drake-hatchling':('Komodo Hatchling','anatomically correct young lizard: four legs, one long banded tail, forked tongue, a small striped green and brown young Komodo dragon on grey volcanic rock, menacing but small, steam behind'),
'granite-ox-golem':('Gaur','anatomically correct bovine: four legs, a huge muscular dark brown gaur with pale socks, a high shoulder ridge and curved horns on dark volcanic scree, menacing, grey mountain slope behind'),
'brimstone-hound':('African Wild Dog','anatomically correct canine: four legs, one bushy tail, a lean mottled black, tan and white African wild dog with large round ears prowling on ash-grey rock, menacing, smoky dusk sky behind'),
'ember-revenant':('Cassowary','anatomically correct cassowary: two strong legs with three toes, two tiny wings hidden under shaggy black feathers, a tall blue-necked black cassowary with a red wattle and a tall casque on ash-grey volcanic gravel, menacing, smoky ridge behind'),
'malachite-golem':('Glyptodon','anatomically correct glyptodon: four short thick legs, a huge domed shell of tiled plates, a small head, a huge domed armoured glyptodon on grey rock in a dim cave mouth, menacing'),
'sandstorm-roc':('Griffon Vulture','anatomically correct vulture: two legs, two broad wings with fingered feather tips, a bald pale neck ruff, a huge brown griffon vulture gliding low over pale desert dunes, menacing, hazy orange sky'),
}
def full(i):
    if i=='ent': return P.replace('no hands, ','')+PROMPTS[i][1]+S
    return P+PROMPTS[i][1]+S
