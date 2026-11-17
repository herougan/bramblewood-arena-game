#!/usr/bin/env python3
# SKAUD1 (2026-11-17) phase 1: the skill audit plan. Builds docs/design/skaud1-2026-11-17.json (machine) and the md tables.
import json, collections, sys
import os
S = os.path.dirname(os.path.abspath(__file__)) + '/'
ROOT = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../..') + '/'
inv = json.load(open(S + 'out/inv2.json'))
moves = json.load(open(S + 'out/moves.json'))
sheet = {r['Key']: r for r in json.load(open(S + 'out/skills.json')) if r.get('Key')}
ci = inv['cardInfo']
keys = [l.split('\t')[0] for l in open(S + 'out/keys.tsv')]

NONSKILL = set('ancient common daemonic devancient devlegendary divine epic eventlegendary eventrare foil heroic idle legendary mythic none quest questunique rare special starter superrare uncommon unique veryrare void res: skill: st: term: pvp onSkill'.split())
TRIGGERS = set('onAction onAllyDie onAllyHealed onAllyPlayed onAllyReady onAllySpawn onAnyDeath onAttack onAttacked onColumnSpawn onDeath onDiscard onEnemyEnter onEnemyPlayed onEnemyReady onEnemySpawn onExile onHeal onHealed onHit onKill onKillCreature onMove onPitch onReady onRoundStart onSacrifice onSpawn perTurn'.split())
ACTIONS = set('addWait barrage buff buffAll cleanse damage debuff devourGrave drawCard duplicate exile exileGrave fireHit forage forgeWeapon gain grantFastForward grantShield heal magnet mindControl missile poisonTick positionBeam pulse reduceWaitOfSpawned refine smokeScreen spawnCard stun stunPlayer swapPositions'.split())
WB_ACTIONS = [k for k in keys if k.startswith('action:')]
PRESETS = {'gilded': 'Transform preset', 'championed': 'Transform preset', 'veteran': 'Transform preset', 'matured': 'Transform preset',
           'kingly': "the Crown's braces (never printed)", 'hazardIce': 'equipment hazard', 'hazardRubble': 'equipment hazard',
           'tamperProof': 'equipment flag', 'arrows': 'cost-table counter'}
# parameters of a skill (ENG35 fused params / ENG39 parts): they live and die with their parent
PARTS = {}
for k in keys:
    if k.endswith('Grant') and k != 'grantSkill': PARTS[k] = {'kinglyGrant': 'king', 'stemGrant': 'stem', 'swimmerGrant': 'swimmer'}.get(k, k[:-5])
PARTS.update({'crepuscularHp': 'crepuscular', 'diurnalHp': 'diurnal', 'nocturnalHp': 'nocturnal', 'espritHp': 'esprit', 'defianceN': 'defiance', 'swarmN': 'swarm',
              'diveBonus': 'dive', 'diveUses': 'dive', 'hunterVs': 'hunter', 'hoardRes': 'hoard', 'archerStyle': 'archer', 'arrowCount': 'arrow', 'arrowBramble': 'arrow',
              'arrowBleed': 'arrow', 'arrowPoison': 'arrow', 'fireArrowBleed': 'fireArrow', 'fireArrowBramble': 'fireArrow', 'fireArrowPoison': 'fireArrow',
              'fireBoltBleed': 'fireBolt', 'fireBoltBramble': 'fireBolt', 'fireBoltPoison': 'fireBolt', 'shellWhen': 'shell', 'shieldArmor': 'shield',
              'weakness': 'rabid', 'rageAt': 'rage', 'deliveryRes': 'delivery', 'tribeDeliveryRes': 'tribeDelivery', 'salvageEvery': 'salvage',
              'scavengeEvery': 'scavenge', 'renewal': 'cure', 'bloomWhen': 'bloomCopy'})

PROPOSAL = set('''swarm flying nursing thorns guardian inspiring foraging diurnal esprit armor pierce shield tide crabClaws loyal poisonBarbs pounce swift arrow fencing
bloomCopy meiosis delivery nocturnal fork trident octolash forestry bleed poison bulwark sap parasite strangle smokeBomb carrion corrode sleepPowder poisonPowder
broodkeeper darksight web illuminate keenSense electricity regen weaken wave paralysisPowder fletcher avalanche frostbite siege recoil stealth bulldoze dynamite
harbinger twinStrike repair carnage mighty pack snipe overwhelm ambush sweep fortify sturdy loneWolf momentum offspring freeze trap expose acidBolt fireArrow fireBolt'''.split())
R3KEEP = set('exploit helmet herald pitchfork twinShot scare lastStand evasive herbalist pearl puncture pulverise bludgeon purblind venomMaster packLeader cure daunt taunt'.split())
ENG50 = {'paralysisPowder': 'Paralysis Powder', 'rend': 'Rend (Vulnerable tokens)', 'enfeeble': 'Enfeeble', 'vulnerable': 'Vulnerable (passive)', 'feeble': 'Feeble',
         'weaken': 'Weaken (+ action)', 'grant': 'Grant {who} {what} (action)', 'bulwark': 'Bulwark (scaling)', 'armourer': 'Armourer'}
LIGHT = ['flying', 'tide', 'diurnal', 'nocturnal', 'crepuscular']
FIELD_STATE = ['rain', 'storm', 'heat', 'frost', 'fog', 'salt', 'drought', 'season', 'rainrunner', 'castDarkness', 'rainmaker', 'moonpull', 'fieldBreaker', 'relict', 'mountainClimber']
SETS = {'GOD': 'consecration coreEvil desecration inherentDarkness prayer prayerWard remember ritual sacrifice worship desecrate penance bloodTithe beware'.split(),
        'EVO': 'chrysalis crystallise evolute evoluteAlpha evoluteOmega hatchling stem'.split(),
        'KINGDOM': 'king kingSlayer liege usurper dictator'.split(),
        'MAGIC': 'ghost immolation magic magicArmor nova nullify psychic shade shadow socket keenEye supreme supremeTide'.split(),
        'S': 'absoluteZero avalanche castDarkness earthquake fireball meteor poisonGas rainmaker slashBurn tornado tsunami encore volley chainLightning greaterPoison'.split(),
        'ECON': 'forestry quarrying mining prospecting masonry refining barter plunder metallurgy lumberjack heavyMetal coppice salvage scavenge tribeDelivery'.split(),
        'WEP': 'disarm sunder'.split()}

# ---- the verdicts that are not plain keep. (verdict, into, why)
V = {}
def put(keys_, verdict, into, why):
    for k in keys_.split(): V[k] = (verdict, into, why)
# owner instructions
put('injured', 'remove', None, 'owner 11-17 23:41 (OWN-1117-3): "take out Injured"')
put('dirge', 'merge', 'carnage', 'owner: "Explicit remove, and remove other duplicates"; a Carnage kind (who yours)')
put('fireArrowBleed fireArrowBramble fireArrowPoison fireBoltBleed fireBoltBramble fireBoltPoison', 'remove', None, 'owner: "Explicit remove"; off the editor since SKN1, the engine still reads old saves: delete the cost rows, params and readers')
put('grantSkill', 'merge', 'action:grant', 'owner: "Convert to action: Grant {who} {what}"; ENG50 builds the action; the passive is on no card')
put('charge', 'merge', 'trigger:onCharge', 'owner: "Move it to triggers instead"; the engine already fires it as onCharge')
put('felling', 'merge', 'pair:onKill>gain', 'owner: "Just use On kill -> Deliver (Lumber)"; the same rule as the On Kill: Gain line (SKN1-18 names it Deliver)')
put('midas prospector', 'merge', 'pair:onKill>gain', 'a Felling kind (N Lumber / Metal on a kill): goes with Felling to On Kill: Deliver')
put('healing', 'merge', 'nursing', 'owner: "use Nursing instead of Heal; the action is Nurse"; the Proposal puts Nursing on Map 0; which unit it heals: SKN1-16')
put('bloom', 'remove', None, 'retired (the old random-ally heal, a Heal kind); on no card')
# retired / legacy keys (on no card; old saves only)
put('venomous', 'remove', None, 'retired "Old Venomous" (Venomous is the poison key); on no card')
put('bloomWhen swimmer swimmerGrant hiveMind shieldCall lantern worthy fullMoonGrant', 'remove', None, 'retired in the registry, on no card')
put('onReadyGold', 'remove', None, 'legacy every-turn Gold; Delivery / Prospecting cover it; on no card')
put('stockpile', 'merge', 'delivery', 'a Delivery kind with the same rule (Lumber once when Ready); on no card')
put('deliveryEvery', 'merge', 'forestry', 'the old every-turn Delivery: ECONSK1 Forestry / Quarrying / Mining / Prospecting are the same rule per resource; on no card')
put('pearlBed', 'remove', None, 'every-turn Pearl, on no card; Pearl (Delivery once) stays')
put('smelter', 'merge', 'refining', 'old key of Refining (ECONSK1 renamed it); same rule')
put('demolisher', 'merge', 'siege', 'old key of Siege (the engine reads the higher of the two); on no card')
put('breach', 'merge', 'puncture', 'a Puncture kind with the same rule under its own price; no card writes it')
put('blitz', 'remove', None, 'a Speed kind (Speed 10), on no card')
put('speed haste', 'merge', 'swift', 'the Speed skills: Speed N and Haste are on no card after REDESIGN3 (Pronghorn Racer and Roadrunner Courier change there)')
put('quick', 'merge', 'swift', 'Quick (Speed 2) and Swift both strike first; Swift is the Proposal\'s (Map 3) and REDESIGN3 already turned five Quick cards into Swift')
put('doubleTime', 'remove', None, 'a Twin Strike kind (its shots twice too), on no card; Twin Strike stays')
put('spoils', 'remove', None, 'a Momentum kind (+0/+N on a kill), on no card')
put('grit', 'merge', 'momentum', '+1 Attack on a kill = Momentum 1; its one card (Basalt Boar) loses it in REDESIGN3')
put('berserk', 'merge', 'harbinger', 'a Harbinger kind (+N/+0 when an ally dies); no card writes it')
put('stench', 'remove', None, 'a Daunt kind (a token until washed off), on no card; Daunt and Weaken stay')
put('scar', 'remove', None, 'an Exploit kind (lasting), on no card')
put('constrict', 'merge', 'strangle', 'a Strangle kind (full hold), on no card; the Proposal names the skill Constrict (rename below)')
# thresholds and states (owner: "remove other duplicates")
put('requiem tally', 'merge', 'carnage', 'Carnage kinds (who any / foes): the same +2/+2 at N deaths; owner on Dirge: remove the duplicates')
put('muster beset', 'merge', 'throng', 'Throng kinds (your side / their side): the same +2/+2 at N units')
put('riled', 'remove', None, '+2/+2 after taking 3 damage: Rage and Last Stand cover it; its card (Boreal Elk) loses it in REDESIGN3')
put('almanac', 'remove', None, 'cards-drawn threshold; its card (Cone-cutter Squirrel) loses it in REDESIGN3; Plenty covers hand size')
put('scarcity fullHand lean foeFullHand foeLean', 'remove', None, 'hand-size bonuses on no card, mirrors of Plenty / Against All Odds')
put('foeScarcity', 'remove', None, 'mirror of Against All Odds; its card (Stoat Cutthroat) loses it in REDESIGN3')
put('bedrock forged', 'remove', None, 'resource-state bonuses (Stone / Metal held): on no card after REDESIGN3 (Quarry Mole); Timbered and Hoard cover the idea')
put('rockSolid ironWill', 'merge', 'hoard', 'Hoard N already counts Stone or Metal (ENG40 res); +N/+N per Stone / Metal held')
put('timber', 'merge', 'hoard', 'a Hoard kind (+1/+1 per Lumber)')
put('frost salt season', 'remove', None, 'field-state bonuses on no card after REDESIGN3; Frostbite (Proposal) and Tide\'s Ebb Armor cover them')
put('drought', 'remove', None, '+1/+0 after 3 dry rounds: its one card (Dromedary) keeps Dry')
put('rain', 'merge', 'rainrunner', 'In rain +1/+1 = Rainrunner 1 without the unblockable part; Rainrunner (owner II 3) stays')
put('moonborn', 'merge', 'fullMoon', 'two moon bonuses; Full Moon (your note: +X/+X at the full moon) stays')
# copies, spawns, deaths
put('brood twin', 'merge', 'offspring', 'three "copies hatch as it arrives" skills; Offspring is the Proposal\'s (Map 17)')
put('hydra', 'remove', None, 'death split with Hydra again, on no card; Meiosis (Proposal) is the same idea')
put('immortal', 'remove', None, 'returns as a token every death, on no card; Undead and Thanatosis cover the idea')
put('sprout', 'merge', 'pair:onSpawn>spawnCard', 'On Play: a Growth Sprout = the On Spawn: Spawn line; owner rank 8 (the lowest)')
put('corpsefeeder', 'remove', None, 'graveyard eater on no card; Devour and Carrion cover it')
put('retribution', 'remove', None, 'On Ally Death: damage a random enemy, on no card: the trigger line does it')
# economy
put('milling', 'merge', 'forestry', '+Lumber every turn = Forestry; its card (Redwood Woodpecker) loses it in REDESIGN3')
put('quarry stonecutter', 'merge', 'masonry', 'Lumber into Stone each turn = Masonry (ECONSK1); your Stonecutter note asks for exactly that (SKN1-3 a)')
put('tribute', 'merge', 'prospecting', 'Gold each turn while Ready = Prospecting 1 (the Crown gives it)')
put('driftwood', 'remove', None, 'your note: "similar to Delivery, but worse"; its card (Beachcomber Sanderling) loses it in REDESIGN3')
put('harvest glean lumberFeast creative', 'remove', None, 'resource oddities on no card (swing for Lumber, eat Berries, eat Lumber, Creativity); Forestry, Foraging and Offspring\'s Lumber cover them')
put('arson sabotage', 'remove', None, 'resource theft on hit, on no card; Plunder / Swipe and Pickpocket cover it')
put('swipe', 'merge', 'plunder', 'steal N on a hit: Swipe (Lumber) and Plunder (Gold) are one rule; Plunder takes a resource')
put('dismantle', 'merge', 'sunder', 'break equipment on play vs on hit: one skill (Sunder), both on no card')
# defence
put('cower', 'remove', None, 'hide in the shell after a hit, on no card; Shell covers it')
put('bolster', 'remove', None, 'temporary Health each round, on no card; Shield covers it')
put('shieldwall', 'remove', None, '+1 Armor beside it, on no card; you declined Shellsmith (REDESIGN3-1); Armourer is ENG50\'s')
put('brambleArmor', 'merge', 'fortify', 'two Fortify skills ("Fortify: +1 Armor" while it lives, and Fortify {X} for the fight); REDESIGN3 writes Fortify {Armor 1}')
put('unfortify', 'remove', None, 'drawback on no card; Vulnerable (ENG50) is the drawback form')
put('spellward', 'remove', None, 'Guardian for skills, on no card')
put('spiteful ichor punish', 'merge', 'thorns', 'retaliation: Thorns N does it for melee; Spiteful (any source), Ichor (acid + riders) and Punish (being tried) are variants')
put('canopyCover prey', 'merge', 'evasive', 'conditional dodges (under trees / while a Predator is out); Evasive stays')
put('mach', 'remove', None, 'a stronger Flying, on no card')
put('atheist', 'remove', None, 'half magic damage, on no card; Magic Armor covers it')
put('dropRoll', 'merge', 'dry', 'a fire counter, on no card; Dry (half fire) covers it')
put('relict', 'merge', 'mountainClimber', '"field effects pass it by" twice; Mountain Climber keeps the name and its 3 cards')
put('sonar', 'merge', 'keenSense', 'Echolocation and Keen Sense: both never miss in the dark and can\'t be Blinded')
put('shatter', 'merge', 'hunter', 'Cull family (+N against a kind of target); on no card after REDESIGN3')
put('predator executioner', 'merge', 'hunter', '+N damage against weaker / wounded units = Cull N with a target (hunter vs)')
put('crit', 'remove', None, '1 in 2 double damage, only a test card; Mighty is the double-damage skill')
# status and on-hit
put('petrify', 'remove', None, 'a stun on hit, on no card; Stun covers it')
put('silence', 'remove', None, 'skills off for 2 rounds, on no card; Bludgeon knocks a skill out')
put('stymie', 'remove', None, 'stops the Wait clock, on no card; Bulldoze (+1 Wait, Proposal) covers it')
put('majesty', 'remove', None, 'enemies facing it -1 Attack, on no card; Daunt covers it')
put('lasso', 'merge', 'bola', 'two thrown ties (Lasso until one dies, Bola a turn); Bola stays (owner II 3)')
put('scatterbrained drunk nightblind', 'remove', None, 'always Confused / Tipsy / Blind at night: drawbacks on no card after REDESIGN3; Purblind and Sun-shy stay')
put('sleep', 'merge', 'sleepPowder', 'Sleep on hit is on a test card only after REDESIGN3 (Nightshade Moth gets Paralysis Powder); Sleeping Powder is the Proposal\'s')
put('paralyze', 'merge', 'paralysisPowder', 'Paralyze on hit is on a test card only; Paralysis Powder (ENG50) is the Proposal\'s')
put('blind', 'remove', None, 'Blind on hit is on a test card only after REDESIGN3 (Horned Lizard); Smoke Bomb blinds')
put('rabid toxin', 'merge', 'poison', 'Venom variants (Rabid = Venomous 2 + a water drawback; Toxin = a Venom that never wears off): Venomous N')
put('venomPulse', 'merge', 'detonate', 'Pulse and Detonate both make Venom tick at once; Pulse is on no card')
put('poisonous', 'remove', None, 'Venom to its killer, on no card; the On Death: Venom line covers it')
put('wither', 'remove', None, 'max-Health drain, on no card after REDESIGN3 (Corpse-flower Beetle); Decay stays')
put('perforate', 'merge', 'pierce', 'Pierce + strip Armor + Bleed + bramble damage in one (owner II 7); Pierce stays')
put('friction', 'merge', 'recoil', 'a self-hurt drawback (damage to allies when it attacks); Recoil (Proposal) is the drawback')
put('dragonLightning', 'merge', 'electricity', 'lightning to the target and one beside it = Electricity\'s arc')
put('skyfall', 'merge', 'lightning', 'On Play: N damage to a random enemy, only a test card; Lightning is the same with a type')
put('rocket', 'merge', 'fireBolt', 'a one-off fire shot; the fire shots are Arrow (Flaming) and Fire Bolt')
put('spitfire', 'merge', 'fireBolt', 'a random-target fire bolt; its card (Fire Salamander) becomes Arrow (Flaming) in REDESIGN3')
put('explode', 'merge', 'dynamite', 'a fuse that blows at 0 twice; Dynamite is the Proposal\'s')
put('bananarang', 'merge', 'boomerang', 'a Boomerang that may be eaten; Boomerang stays')
put('banana', 'remove', None, 'eat or throw a banana; its card (Bramblewood Macaque) loses it in REDESIGN3')
put('converge', 'remove', None, 'pull the enemy line to the centre; its card (Border Collie) loses it in REDESIGN3; Wave moves units')
put('formation sociable isolation', 'remove', None, 'bonus per ally nearby (and its drawback twin): on no card after REDESIGN3; Pack and Lone Wolf (Proposal) cover it')
put('rally', 'merge', 'warcry', 'On Play: your units +1 Attack for a round = a temporary Warcry; on no card')
put('natureForce', 'merge', 'kinship', 'Elementals +1/+1 = Kinship {Elemental} 1/1')
put('shapeshifter', 'merge', 'changeling', 'shares a type with every Structure = Changeling')
put('weaponMaster', 'merge', 'fletcher', '+1 to your shots (and equipped +1/+1) = Fletcher, the Proposal\'s upgrader')
put('sentry', 'merge', 'ambush', 'strike an enemy that enters the slots facing it: Ambush (Proposal) is the same with one slot')
put('hibernate', 'remove', None, 'sleeps in the cold; its card (Polar Bear) gets Offspring in REDESIGN3; owner rank 7')
put('mulligan satiety shedding spotter', 'remove', None, 'on no card, each overlapping a kept skill (draw again; Molting; True Strike)')
put('onReadyDamage', 'merge', 'pair:onReady>damage', 'old flat key of the On Ready: Deal damage line')
put('onSpawnDevilry', 'merge', 'pair:onSpawn>gain', 'old flat key of the On Spawn: Gain Darkness line')
put('antiAirOnly', 'remove', None, 'drawback on no card (swings hit only flyers)')
put('arrowPoison', 'remove', None, 'Arrow - venom rider on no card; you removed the Fire Arrow riders; Arrow - bleed stays (SKN1-14)')
put('pry', 'remove', None, 'strip 1 Armor for good, on no card; Corrode (Proposal) does it')
put('skitter', 'remove', None, 'Haste and Evasive after a hit; its card (Mangrove Mudskipper) gets Evasive in REDESIGN3')
put('fortification', 'merge', 'bulwark', 'On Play: build a wall beside it = Bulwark (Log Walls, Proposal; ENG50 scales it); on no card')
V['berserk'] = ('merge', 'harbinger', "a Harbinger kind (who ally: +N/+0 when an ally dies); REDESIGN3's two Map 13 Harbinger cards carry this kind, the Proposal names plain Harbinger")
V['scar'] = ('merge', 'exploit', "the lasting Exploit kind; REDESIGN3's Map 14 cards carry it, OWN-1117-2 defines Exploit as tokens that wear off")
V['breach'] = ('merge', 'puncture', 'a Puncture kind with the same rule under its own price entry; 4 cards write it as Puncture {kind: breach}')
put('dirgeGrant', 'remove', None, 'owner: "Explicit remove, and remove other duplicates" (the braced Dirge twin; ENG35 fused the twins into one entry)')
put('weakness', 'remove', None, "Rabid's water drawback (a parameter): goes with Rabid")
# owner calls
put('exhaust', 'owner-call', None, 'your note: Exhaust, Exploit and Expose are similar but give tactical depth; Exhaust is on no card')
put('pickpocket', 'owner-call', 'disarm', 'your note: Pickpocket "steals items only"; then it is Disarm (takes a weapon)')
put('thanatosis', 'owner-call', 'undead', 'Thanatosis and Undead both come back once at 1 Health; Thanatosis is on no card after REDESIGN3')
# renames (keep the key)
put('strangle', 'rename', None, 'label "Constrict" (the Proposal\'s name, Map 6; REDESIGN3 writes Constrict on the strangle key)')
put('broodkeeper', 'rename', None, 'label "Broodmother" (the Proposal\'s Map 7 special; your note: "I don\'t really like the name")')
put('exploit', 'rename', None, 'label "Exploit" again: ENG39 shows it as Vulnerable, but OWN-1117-2 makes Vulnerable its own 2x status (ENG50)')
put('brittle', 'rename', None, 'pending SKN1-13 (default "Embrittle"): Brittle is the status')
put('fog', 'rename', None, 'pending SKN1-19 (default "In Fog - {...}"): Fog is the field pill')
put('arrowBleed', 'rename', None, 'pending SKN1-14 (default "Arrow (Laced)")')

PAIRS_V = {
    'perTurn>gain': ('merge', 'quarrying', 'petrified-tree: Every Turn: gain 1 Stone = Quarrying 1 (the keyword)'),
    'perTurn>spawnCard': ('merge', 'spawner', 'ant-hill, mother-carrier: = Spawner {card} (SKN1-4, default a)'),
    'onKill>gain': ('keep', None, 'takes Felling\'s cards (On Kill: Deliver, SKN1-18)'),
    'onReady>damage': ('keep', None, 'takes the onReadyDamage cards'),
    'onSpawn>gain': ('keep', None, 'takes onSpawnDevilry\'s card'),
    'onSpawn>spawnCard': ('keep', None, 'new: takes Sprout\'s cards'),
    'perTurn>heal': ('remove', None, 'a test card only; Nursing / Regeneration are the keywords'),
}
ACT_V = {
    'missile': ('merge', 'damage', 'Missile = Deal damage to a random enemy (sub random)'),
    'buffAll': ('merge', 'buff', 'Buff with who = all (SKN1-11 names the action)'),
    'poisonTick': ('remove', None, 'retired action'),
    'constrict': ('merge', 'strangle', 'the strangle action with hold full'),
    'pulse': ('keep', None, 'the action form of the venom tick (Detonate)'),
    'grantShield': ('keep', None, ''),
}
WB_ACT_V = {k: ('keep', None, 'workbook row for a custom action') for k in WB_ACTIONS}
WB_ACT_V['action:missile'] = ('merge', 'action:damage', 'Missile = Deal damage (random)')
WB_ACT_V['action:poisonTick'] = ('remove', None, 'retired')

def name(k):
    r = sheet.get(k)
    return (r['Skill'] if r else None) or ENG50.get(k) or k
def cardsOf(k, which='inv3'):
    return inv[which].get(k, [])
def tagOf(i):
    c = ci.get(i, {})
    m = c.get('main')
    w = sorted(set(x for x in c.get('where', []) if not x.startswith('M')))
    t = []
    if m is not None: t.append('Map %d' % m)
    subs = sorted(set(int(x[1:]) for x in w if x.startswith('S')))
    if subs: t.append('submap of ' + ','.join(map(str, subs)))
    if any(x.startswith('X') for x in w): t.append('special')
    if not t: t.append('no list')
    if c.get('test'): t.append('test card')
    if c.get('easter'): t.append('easter egg')
    if c.get('token'): t.append('token')
    return '; '.join(t)

allkeys = []
for k in keys:
    if k[0].isdigit() or k in NONSKILL or k.startswith('action:'): continue
    allkeys.append(k)
for k in list(inv['inv3']) + list(ENG50):
    if k not in allkeys and not k[0].isdigit(): allkeys.append(k)

KEEPWHY = {
    'iceArrow': 'the ice arrow; bolts and arrows stay apart (OWN-1117-1: bolts on Maps 21+)', 'iceBolt': 'an ice bolt for Maps 21+ (OWN-1117-1)',
    'poisonBolt': 'Venom Spit, a bolt for Maps 21+ (OWN-1117-1); counts with Venomous as one skill (SKN1)', 'shockBolt': 'Spark, an electric bolt for Maps 21+; counts with Electricity as one skill (SKN1)',
    'rebuild': 'owner II 1; Repair (Proposal) is its structure twin: SKN1-2 can close as a', 'shell': 'pending SKN1-15 ("same as Turtle"); off Maps 0-20 after REDESIGN3',
    'mimic': 'pending SKN1-5 (its parameters)', 'spawner': 'owner II 5; takes the Every Turn: Spawn lines (SKN1-4)', 'assault': 'pending SKN1-17 ("if it attacks first")',
    'warcry': 'pending SKN1-1 (already permanent); takes Rally', 'foePlenty': 'your name "Against All Odds" (SKN1); mirror of Plenty', 'plenty': 'the one hand-size bonus left',
    'illuminate': 'Proposal (Map 8); its new use: SKN1-12', 'counterattack': 'owner rank 3 and your SKN1 note (it swings at the bramble when nothing faces it)',
    'leader': 'Natural Leader: "not considered" for Maps 0-20 (owner 11-17 22:33), 14 cards off the road', 'anchor': 'the counter to Wave and Underwater Currents (Map 10)',
    'amplifier': 'a distinct aura (+1 to neighbours\' skill numbers), an upgrader candidate', 'moonpull': 'a field changer (the Tide comes in) for Tide maps',
    'undead': 'real undead creatures (ENG33, owner 11-07)', 'reload': 'a drawback (sits out after attacking): drawbacks free budget (OWN-1117-2)',
    'wilting': 'a drawback', 'fragile': 'the generic drawback (your note: better than Brittle)', 'sunshy': 'a drawback (Blind by day)', 'slow': 'a drawback (acts last); the tutorial uses it',
    'tangle': 'a Strangle kind with its own rule (attacks fail 1 in 2), unlike Web (no dodge, no move)', 'dry': 'fire resistance; takes Stop, Drop and Roll',
    'mountainClimber': 'field hazards pass it by; takes Relict', 'hunter': 'Cull N: takes Predator, Executioner and Shatter as targets (vs)',
    'thorns': 'Proposal; takes Spiteful, Ichor and Punish', 'carnage': 'Proposal; takes Dirge, Requiem and Tally', 'throng': 'takes Muster and Beset (plain: both sides)',
    'hoard': 'takes Rock-solid, Iron-will and Timber (res stone / metal)', 'offspring': 'Proposal (Map 17); takes Brood and Twin', 'swift': 'Proposal (Map 3); takes Quick, Speed and Haste',
    'keenSense': 'Proposal (Map 8); takes Echolocation', 'evasive': 'REDESIGN3 card; takes Canopy Cover and Prey', 'masonry': 'ECONSK1 (owner 11-16); takes Quarry and Stonecutter',
    'forestry': 'Proposal (Map 5); takes Delivery every turn and Milling', 'plunder': 'ECONSK1; takes Swipe (a resource parameter)', 'harbinger': 'Proposal (Map 13); takes Berserk',
    'momentum': 'Proposal (Map 17); takes Grit', 'nursing': 'Proposal (Map 0); takes Heal (SKN1-16 picks who it heals)', 'ambush': 'Proposal (Map 15); takes Sentry',
    'poison': 'Proposal (Map 5); takes Rabid and Toxin', 'dynamite': 'Proposal special (Map 12); takes Explode', 'fireBolt': 'Proposal (Map 20); takes Spitfire and Rocket',
    'bulwark': 'ENG50 (scaling); takes Build (fortification)', 'fortify': 'Proposal special (Map 15); takes the old bramble-Armor Fortify', 'kinship': 'takes Nature\'s Force',
    'changeling': 'takes Shapeshifter', 'fletcher': 'Proposal special (Map 11); takes Weapon Master', 'recoil': 'Proposal (Map 12); takes Friction', 'pierce': 'Proposal (Map 2); takes Perforate',
    'electricity': 'Proposal (Map 9); takes Dragon Lightning', 'lightning': 'counts with Electricity (SKN1); takes Skyfall', 'boomerang': 'takes Bananarang', 'bola': 'owner II 3; takes Lasso',
    'detonate': 'owner rank 5; takes Pulse', 'rainrunner': 'owner II 3; takes Rain', 'fullMoon': 'your note (+X/X at the full moon); takes Moonborn', 'sunder': 'WEP; takes Dismantle',
    'exploit': 'REDESIGN3 Map 14; takes Scar', 'puncture': 'REDESIGN3 Map 3 (Peak Condor); takes Breach', 'siege': 'Proposal (Map 12); takes the old Demolisher key',
    'sleepPowder': 'Proposal (Map 7); takes Sleep on hit', 'paralysisPowder': 'ENG50 building (Proposal Map 11); takes Paralyze on hit', 'refining': 'ECONSK1; the old Smelter key',
    'prospecting': 'ECONSK1; takes Tribute (the Crown gives Prospecting 1)', 'delivery': 'Proposal (Map 4); takes Stockpile', 'strangle': 'Proposal (Map 6, as Constrict); takes the Constrict kind',
}
def default_keep(k):
    n = len(cardsOf(k)); road = [i for i in cardsOf(k) if ci[i].get('road')]
    if k in KEEPWHY: return KEEPWHY[k]
    if k in ENG50: return 'ENG50 is building it (do not remove)'
    if k in PROPOSAL: return "on the owner's Proposal (must keep)"
    if k in R3KEEP: return 'on a REDESIGN3 Maps 0-20 card'
    if k in LIGHT: return 'light flag (does not count toward two skills)'
    for s, l in SETS.items():
        if k in l: return '%s set (owner category)' % s
    if n: return 'on %d card%s, no close twin%s' % (n, '' if n == 1 else 's', '' if not road else ' (%d on Maps 0-20 lists)' % len(road))
    r = sheet.get(k)
    if r and (r.get('II') not in (None, 'None')): return 'on no card; owner rank II %s' % r['II']
    return 'on no card; kept: a distinct rule a Map 21+ card can use'

skills, parts, presets = [], [], []
for k in sorted(allkeys, key=str.lower):
    if k in TRIGGERS or k in ACTIONS: continue
    if k in PRESETS:
        presets.append({'key': k, 'what': PRESETS[k], 'verdict': 'keep', 'why': 'internal: not a skill a card prints'}); continue
    rk = sheet.get(k, {})
    entry = {'key': k, 'name': name(k), 'ii': rk.get('II'), 'rank1': rk.get('Comments'),
             'cardsToday': len(cardsOf(k, 'inv')), 'cardsAfterR3': len(cardsOf(k)),
             'onMaps0to20': [i for i in cardsOf(k) if ci[i].get('road')]}
    if k in PARTS and k not in V:
        p = PARTS[k]; pv = V.get(p, ('keep',))[0]
        entry.update({'part': p, 'verdict': 'keep' if pv in ('keep', 'rename', 'owner-call') else ('remove' if pv == 'remove' else 'merge'),
                      'into': None if pv in ('keep', 'rename', 'owner-call', 'remove') else V[p][1],
                      'why': 'a parameter of %s (ENG35 / ENG39): lives and dies with it' % p})
        parts.append(entry); continue
    if k in PARTS:
        entry['part'] = PARTS[k]
    v = V.get(k)
    if v: entry.update({'verdict': v[0], 'into': v[1], 'why': v[2]})
    else: entry.update({'verdict': 'keep', 'into': None, 'why': default_keep(k)})
    if k in LIGHT: entry['light'] = True
    if k in FIELD_STATE: entry['fieldLike'] = True
    if k in ENG50: entry['eng50'] = True
    if k in PROPOSAL: entry['proposal'] = True
    # card moves
    if entry['verdict'] in ('merge', 'remove'):
        mv = moves.get(k)
        today = cardsOf(k, 'inv'); after = cardsOf(k)
        entry['r3Removes'] = [i for i in today if i not in after]
        if mv:
            entry['cards'] = [{'id': m['id'], 'name': m['name'], 'where': tagOf(m['id']), 'from': m['from'], 'to': m['to'],
                               'stats': [m['A'], m['H']], 'newStats': [m['newA'], m['newH']] if 'newA' in m else None,
                               'fillBefore': m['fillBefore'], 'fill': m['fill'], 'ok': m['ok'],
                               'overToday': m['fillBefore'] > 100, **({'test': True, 'note': 'test card: point it at the survivor; budget not applied'} if ci[m['id']].get('test') else {})} for m in mv]
        else:
            entry['cards'] = [dict({'id': i, 'name': ci[i]['name'], 'where': tagOf(i), 'note': 'card change not priced (engine move)'}, **({'test': True, 'note': 'test card: point it at the survivor or delete it'} if ci[i].get('test') else {})) for i in after]
    if k == 'quick':
        entry.setdefault('cards', []).append({'id': 'cottontail', 'name': 'Cottontail', 'where': tagOf('cottontail'), 'from': {'levelSkills.1': {'quick': True}}, 'to': {'levelSkills.1': {}},
                                              'note': 'a Map 0 starter: drop its Level 1 Quick (Swift is New! on Map 3); a 3/1 stays within budget', 'ok': True})
    skills.append(entry)

pairs = []
for p, cs in sorted(inv['trig'].items()):
    v = PAIRS_V.get(p, ('keep', None, 'a trigger-action line on cards'))
    pairs.append({'pair': p, 'cards': sorted(set(inv['trig3'].get(p, []))), 'verdict': v[0], 'into': v[1], 'why': v[2]})
for p in ['onSpawn>spawnCard']:
    if p not in inv['trig']: pairs.append({'pair': p, 'cards': [], 'verdict': 'keep', 'into': None, 'why': PAIRS_V[p][2]})
trig_list = [{'key': t, 'verdict': 'keep'} for t in sorted(TRIGGERS)] + [{'key': 'onCharge', 'verdict': 'keep', 'why': 'takes Charge (owner: move it to triggers)'}]
act_list = []
for a in sorted(ACTIONS | {'constrict', 'strangle', 'stench', 'silence', 'stymie', 'exhaust', 'petrify', 'vulnerable', 'exploit', 'disarm', 'arrow', 'revive', 'rebuild', 'shield', 'poison', 'bleed', 'expose'}):
    v = ACT_V.get(a, ('keep', None, ''))
    act_list.append({'key': a, 'verdict': v[0], 'into': v[1], 'why': v[2]})
for a in ['stench', 'silence', 'stymie', 'petrify']:
    for x in act_list:
        if x['key'] == a: x['why'] = 'the action stays (trigger lines can use it); only the on-hit passive goes'

CALLMETA = {'exhaust': ('SKAUD1-1', 'keep (Maps 21+)'), 'pickpocket': ('SKAUD1-2', 'merge disarm into pickpocket (items only)'), 'thanatosis': ('SKAUD1-3', 'keep both')}
for e in skills:
    if e['key'] in CALLMETA: e['decision'], e['default'] = CALLMETA[e['key']]
    if e['key'] == 'disarm': e['why'] += '; SKAUD1-2 may fold it into Pickpocket'
    if e['key'] == 'undead': e['why'] += '; SKAUD1-3 asks about Thanatosis beside it'
counts = collections.Counter(e['verdict'] for e in skills)
out = {'package': 'SKAUD1', 'phase': 1, 'date': '2026-11-17', 'status': 'plan (nothing applied; phase 2 after ENG50 merges)',
       'source': {'owner': 'OWN-1117-3 (11-17 23:41): audit every skill, also off Maps 0-20; remove useless, duplicate or closely overlapping ones; take out Injured',
                  'ranks': 'docs/design/owner-proposal-2026-11-17.xlsx sheet Skills (II = second-pass rank, Comments = first-pass rank and notes)',
                  'mustKeep': "the Proposal sheet's skills, REDESIGN3's Maps 0-20 cards, ENG50's build list",
                  'cards': 'canonical/cards.json with the REDESIGN3 fold applied (docs/design/redesign3-2026-11-17.json fold), map lists canonical/map-pools.json',
                  'budget': 'tools/skill_costs.js budget(card).ok at Level 1; a card over gets the fewest 3A + H points off (never below half)'},
       'counts': {'skills': len(skills), **counts, 'parts': len(parts), 'presets': len(presets), 'pairs': len(pairs)},
       'apply': {'order': 'after ENG50 and the REDESIGN3b fold', 'perMerge': 'cards: write `to` (and newStats); registry: drop the key from PASSIVE_DEFS / SKILL_DEFS, canonical/skill-costs.json, canonical/skill-params.json kinds/params, the engine readers (keep an old-save alias where a save may hold it), texts ui.skn-/ui.sk- in 12 packs, SKILL_ICON, Codex; tests: delete its test-skill-* card or point it at the survivor',
                 'perRemove': 'as merge, no survivor', 'perRename': 'label text only (key unchanged), 12 packs'},
       'skills': skills, 'parts': parts, 'presets': presets, 'pairs': pairs, 'triggers': trig_list, 'actions': act_list,
       'workbookActions': [{'row': k, 'verdict': v[0], 'into': v[1], 'why': v[2]} for k, v in WB_ACT_V.items()],
       'light': [{'key': k, 'verdict': next((e['verdict'] for e in skills if e['key'] == k), 'keep')} for k in LIGHT + FIELD_STATE]}
json.dump(out, open(ROOT + 'docs/design/skaud1-2026-11-17.json', 'w'), indent=1, ensure_ascii=False)
print(dict(counts), 'parts', len(parts), 'presets', len(presets), 'pairs', len(pairs))
