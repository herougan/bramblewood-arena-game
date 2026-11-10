# 2026-11-10 (package ENG42, owner 11-10 11:31: "Thematic wise - don't care about the skills first ... just focus on art description and
# name."): Rising Tide, Wild Rage, Siege Train and Sky Ambush count creature types now, not a skill, so their texts name the creatures.
#   python3 tools/eng42/i18n_2026_11_10.py   rewrite the changed values in bramblewood-texts.js and add their rows to lang/<code>.json (keyed
#                                            by English text, new rows at the end); an old long row (the "Theirs only" sentence) is dropped
#                                            when no TX value still reads it; the old short rows ("Tide", "Siege", "Flying", "Rage or Berserk")
#                                            stay: they are skill names, and the merged pack translates any English it meets. Run once.
import json, re
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# the "Theirs only: on while at least half their deck are {x}." clause, as each pack words it for Second Burrow
MARK = {'fr': 'Pour eux seuls', 'de': 'Nur für sie', 'es': 'Solo para ellos', 'it': 'Solo per loro', 'pt': 'Só para eles', 'tl': 'Para sa kanila lang',
        'ta': 'அவர்களுக்கு மட்டும்', 'id': 'Hanya untuk mereka', 'zh-Hans': '仅限对方', 'zh-Hant': '僅限對方', 'ja': '相手専用', 'ko': '상대 전용'}
CLAUSE = {'fr': 'Pour eux seuls : actif tant qu’au moins la moitié de leur deck sont des {x}.',
          'de': 'Nur für sie: aktiv, solange mindestens die Hälfte ihres Decks {x} sind.',
          'es': 'Solo para ellos: activo mientras al menos la mitad de su mazo sean {x}.',
          'it': 'Solo per loro: attivo finché almeno metà del loro mazzo sono {x}.',
          'pt': 'Só para eles: ativo enquanto pelo menos metade do baralho deles forem {x}.',
          'tl': 'Para sa kanila lang: bukas habang kalahati man lang ng deck nila ay {x}.',
          'ta': 'அவர்களுக்கு மட்டும்: அவர்கள் அடுக்கில் குறைந்தது பாதி {x} என்றால் இயங்கும்.',
          'id': 'Hanya untuk mereka: aktif selama setidaknya setengah dek mereka adalah {x}.',
          'zh-Hans': '仅限对方：只要他们的牌组至少一半是{x}就生效。', 'zh-Hant': '僅限對方：只要他們的牌組至少一半是{x}就生效。',
          'ja': '相手専用：デッキの半分以上が{x}の間だけ有効。', 'ko': '상대 전용: 덱의 절반 이상이 {x}인 동안 켜져요.'}
SHORT = {
 'risingTide': ('sea, shore or river creatures', {'fr': 'créatures de la mer, du rivage ou des rivières', 'de': 'Meeres-, Küsten- oder Flusstiere', 'es': 'criaturas del mar, la costa o los ríos',
   'it': 'creature di mare, di costa o di fiume', 'pt': 'criaturas do mar, da costa ou dos rios', 'tl': 'nilalang ng dagat, baybayin o ilog', 'ta': 'கடல், கரை அல்லது ஆற்று உயிரினங்கள்',
   'id': 'makhluk laut, pantai, atau sungai', 'zh-Hans': '海洋、海岸或河流生物', 'zh-Hant': '海洋、海岸或河流生物', 'ja': '海・浜・川の生き物', 'ko': '바다·해안·강의 생물'}),
 'wildRage': ('fierce beasts', {'fr': 'bêtes féroces', 'de': 'wilde Bestien', 'es': 'bestias feroces', 'it': 'bestie feroci', 'pt': 'feras', 'tl': 'mababangis na hayop',
   'ta': 'கொடிய விலங்குகள்', 'id': 'binatang buas', 'zh-Hans': '凶猛野兽', 'zh-Hant': '兇猛野獸', 'ja': '猛獣', 'ko': '사나운 짐승'}),
 'siegeTrain': ('builders or war beasts', {'fr': 'bâtisseurs ou bêtes de guerre', 'de': 'Baumeister oder Kriegstiere', 'es': 'constructores o bestias de guerra', 'it': 'costruttori o bestie da guerra',
   'pt': 'construtores ou bestas de guerra', 'tl': 'tagapagtayo o hayop pandigma', 'ta': 'கட்டுநர்கள் அல்லது போர் விலங்குகள்', 'id': 'pembangun atau hewan perang',
   'zh-Hans': '建造者或战兽', 'zh-Hant': '建造者或戰獸', 'ja': '建築家か軍獣', 'ko': '건축가나 전쟁 짐승'}),
 'skyAmbush': ('winged', {'fr': 'ailés', 'de': 'geflügelt', 'es': 'alados', 'it': 'alati', 'pt': 'alados', 'tl': 'may pakpak', 'ta': 'சிறகுள்ளவை', 'id': 'bersayap',
   'zh-Hans': '有翼生物', 'zh-Hant': '有翼生物', 'ja': '翼を持つもの', 'ko': '날개 달린 생물'}),
}
# the "are {x}" noun phrase of the long text, with the creatures it counts
LONG = {
 'risingTide': ('sea, shore or river creatures (fish, crabs, seals, sea and snapping turtles, crocodiles, otters, beavers)', {
   'fr': 'créatures de la mer, du rivage ou des rivières (poissons, crabes, phoques, tortues marines et serpentines, crocodiles, loutres, castors)',
   'de': 'Meeres-, Küsten- oder Flusstiere (Fische, Krabben, Robben, Meeres- und Schnappschildkröten, Krokodile, Otter, Biber)',
   'es': 'criaturas del mar, la costa o los ríos (peces, cangrejos, focas, tortugas marinas y mordedoras, cocodrilos, nutrias, castores)',
   'it': 'creature di mare, di costa o di fiume (pesci, granchi, foche, tartarughe marine e azzannatrici, coccodrilli, lontre, castori)',
   'pt': 'criaturas do mar, da costa ou dos rios (peixes, caranguejos, focas, tartarugas-marinhas e tartarugas-mordedoras, crocodilos, lontras, castores)',
   'tl': 'nilalang ng dagat, baybayin o ilog (isda, alimango, seal, pawikan at snapping turtle, buwaya, otter, beaver)',
   'ta': 'கடல், கரை அல்லது ஆற்று உயிரினங்கள் (மீன்கள், நண்டுகள், சீல்கள், கடல் ஆமைகள், கடிக்கும் ஆமைகள், முதலைகள், நீர்நாய்கள், பீவர்கள்)',
   'id': 'makhluk laut, pantai, atau sungai (ikan, kepiting, anjing laut, penyu dan kura-kura penyambar, buaya, berang-berang, beaver)',
   'zh-Hans': '海洋、海岸或河流生物（鱼、蟹、海豹、海龟与鳄龟、鳄鱼、水獭、河狸）', 'zh-Hant': '海洋、海岸或河流生物（魚、蟹、海豹、海龜與鱷龜、鱷魚、水獺、河狸）',
   'ja': '海・浜・川の生き物（魚、カニ、アザラシ、ウミガメやカミツキガメ、ワニ、カワウソ、ビーバー）', 'ko': '바다·해안·강의 생물(물고기, 게, 물범, 바다거북과 늑대거북, 악어, 수달, 비버)'}),
 'wildRage': ('fierce beasts (boars, bears, wolves, wolverines, honey badgers, Tasmanian devils, hyenas, big cats)', {
   'fr': 'bêtes féroces (sangliers, ours, loups, gloutons, ratels, diables de Tasmanie, hyènes, grands félins)',
   'de': 'wilde Bestien (Keiler, Bären, Wölfe, Vielfraße, Honigdachse, Beutelteufel, Hyänen, Großkatzen)',
   'es': 'bestias feroces (jabalíes, osos, lobos, glotones, tejones de miel, demonios de Tasmania, hienas, grandes felinos)',
   'it': 'bestie feroci (cinghiali, orsi, lupi, ghiottoni, tassi del miele, diavoli della Tasmania, iene, grandi felini)',
   'pt': 'feras (javalis, ursos, lobos, glutões, texugos-do-mel, diabos-da-tasmânia, hienas, grandes felinos)',
   'tl': 'mababangis na hayop (baboy-ramo, oso, lobo, wolverine, honey badger, Tasmanian devil, hyena, malalaking pusa)',
   'ta': 'கொடிய விலங்குகள் (காட்டுப்பன்றிகள், கரடிகள், ஓநாய்கள், வால்வரின்கள், தேன் வளைக்கரடிகள், டாஸ்மேனியன் டெவில்கள், கழுதைப்புலிகள், பெரும் பூனைகள்)',
   'id': 'binatang buas (babi hutan, beruang, serigala, wolverine, musang madu, tasmanian devil, hiena, kucing besar)',
   'zh-Hans': '凶猛野兽（野猪、熊、狼、狼獾、蜜獾、袋獾、鬣狗、大型猫科）', 'zh-Hant': '兇猛野獸（野豬、熊、狼、狼獾、蜜獾、袋獾、鬣狗、大型貓科）',
   'ja': '猛獣（イノシシ、クマ、オオカミ、クズリ、ラーテル、タスマニアデビル、ハイエナ、大型ネコ）', 'ko': '사나운 짐승(멧돼지, 곰, 늑대, 울버린, 벌꿀오소리, 태즈메이니아데빌, 하이에나, 대형 고양잇과)'}),
 'siegeTrain': ('builders or war beasts (beavers, termites, badgers, moles, Structures, elephants, rhinos, oxen, horses)', {
   'fr': 'bâtisseurs ou bêtes de guerre (castors, termites, blaireaux, taupes, Structures, éléphants, rhinocéros, bœufs, chevaux)',
   'de': 'Baumeister oder Kriegstiere (Biber, Termiten, Dachse, Maulwürfe, Bauwerke, Elefanten, Nashörner, Ochsen, Pferde)',
   'es': 'constructores o bestias de guerra (castores, termitas, tejones, topos, Estructuras, elefantes, rinocerontes, bueyes, caballos)',
   'it': 'costruttori o bestie da guerra (castori, termiti, tassi, talpe, Strutture, elefanti, rinoceronti, buoi, cavalli)',
   'pt': 'construtores ou bestas de guerra (castores, cupins, texugos, toupeiras, Estruturas, elefantes, rinocerontes, bois, cavalos)',
   'tl': 'tagapagtayo o hayop pandigma (beaver, anay, badger, nunal, Istruktura, elepante, rhino, baka, kabayo)',
   'ta': 'கட்டுநர்கள் அல்லது போர் விலங்குகள் (பீவர்கள், கறையான்கள், பேட்ஜர்கள், மோல்கள், கட்டடங்கள், யானைகள், காண்டாமிருகங்கள், எருதுகள், குதிரைகள்)',
   'id': 'pembangun atau hewan perang (beaver, rayap, luak, tikus tanah, Bangunan, gajah, badak, lembu, kuda)',
   'zh-Hans': '建造者或战兽（河狸、白蚁、獾、鼹鼠、建筑、大象、犀牛、牛、马）', 'zh-Hant': '建造者或戰獸（河狸、白蟻、獾、鼴鼠、建築、大象、犀牛、牛、馬）',
   'ja': '建築家か軍獣（ビーバー、シロアリ、アナグマ、モグラ、建造物、ゾウ、サイ、ウシ、ウマ）', 'ko': '건축가나 전쟁 짐승(비버, 흰개미, 오소리, 두더지, 건축물, 코끼리, 코뿔소, 소, 말)'}),
 'skyAmbush': ('winged (birds, bats, butterflies, moths, bees, wasps, flies)', {
   'fr': 'créatures ailées (oiseaux, chauves-souris, papillons, papillons de nuit, abeilles, guêpes, mouches)',
   'de': 'geflügelte Tiere (Vögel, Fledermäuse, Schmetterlinge, Motten, Bienen, Wespen, Fliegen)',
   'es': 'criaturas aladas (aves, murciélagos, mariposas, polillas, abejas, avispas, moscas)',
   'it': 'creature alate (uccelli, pipistrelli, farfalle, falene, api, vespe, mosche)',
   'pt': 'criaturas aladas (aves, morcegos, borboletas, mariposas, abelhas, vespas, moscas)',
   'tl': 'may pakpak (ibon, paniki, paruparo, gamugamo, bubuyog, putakti, langaw)',
   'ta': 'சிறகுள்ளவை (பறவைகள், வௌவால்கள், வண்ணத்துப்பூச்சிகள், அந்துப்பூச்சிகள், தேனீக்கள், குளவிகள், ஈக்கள்)',
   'id': 'makhluk bersayap (burung, kelelawar, kupu-kupu, ngengat, lebah, tawon, lalat)',
   'zh-Hans': '有翼生物（鸟、蝙蝠、蝴蝶、蛾、蜜蜂、黄蜂、苍蝇）', 'zh-Hant': '有翼生物（鳥、蝙蝠、蝴蝶、蛾、蜜蜂、黃蜂、蒼蠅）',
   'ja': '翼を持つもの（鳥、コウモリ、チョウ、ガ、ハチ、スズメバチ、ハエ）', 'ko': '날개 달린 생물(새, 박쥐, 나비, 나방, 벌, 말벌, 파리)'}),
}
EN_HEAD = {'risingTide': 'Their Tide units are Quick and have +1 Attack while the tide is in.', 'wildRage': 'Their Rage wakes below 3/4 Health, not 1/2.',
           'siegeTrain': 'Their Siege counts double.', 'skyAmbush': 'Their Flyers are Quick.'}
TX_LINE = re.compile(r'^(\s*)"([^"]+)":\s*"((?:[^"\\]|\\.)*)"(,?)\s*$')
def jload(s): return json.loads('"' + s + '"')
def jdump(s): return json.dumps(s, ensure_ascii=False)[1:-1]
packs = {c: json.load(open('lang/%s.json' % c, encoding='utf-8')) for c in CODES}
path = 'bramblewood-texts.js'; L = open(path, encoding='utf-8').read().split('\n'); vals = {}
for l in L:
    m = TX_LINE.match(l)
    if m: vals[m.group(2)] = jload(m.group(3))
CHANGED = {}
for b in SHORT:
    CHANGED['ui.pl1-boon-theme-' + b] = SHORT[b]
    old = vals['ui.df3-' + b]; head_tr = {}
    for c in CODES:
        t = packs[c][old]; i = t.index(MARK[c]); head_tr[c] = t[:i].rstrip()
    sep = lambda c: '' if c in ('zh-Hans', 'zh-Hant', 'ja') else ' '
    CHANGED['ui.df3-' + b] = (EN_HEAD[b] + ' Theirs only: on while at least half their deck are ' + LONG[b][0] + '.',
                              {c: head_tr[c] + sep(c) + CLAUSE[c].format(x=LONG[b][1][c]) for c in CODES})
renames = {}
for i, l in enumerate(L):
    m = TX_LINE.match(l)
    if not m or m.group(2) not in CHANGED: continue
    ind, key, val, comma = m.groups(); new, tr = CHANGED[key]; old = jload(val)
    if new != old: L[i] = '%s"%s": "%s"%s' % (ind, key, jdump(new), comma); renames[old] = (new, tr); vals[key] = new
open(path, 'w', encoding='utf-8').write('\n'.join(L))
still = set(vals.values())
for c in CODES:
    d = packs[c]; out = {}
    for k, v in d.items():
        if k in renames and k not in still and 'Theirs only' in k: continue
        out[k] = v
    for old, (new, tr) in renames.items():
        if new not in out: out[new] = tr[c]
    open('lang/%s.json' % c, 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
print('texts: %d values changed; old rows kept: %s' % (len(renames), sorted(k for k in renames if k in still or 'Theirs only' not in k)))
