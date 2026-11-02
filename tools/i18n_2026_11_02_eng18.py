#!/usr/bin/env python3
"""2026-11-02 (package ENG18, owner 19:56: "Adjacent in front, behind, left, right. Surrounding includes corners."): the adjacency
wording audit (docs/eng18-adjacency-2026-11-02.md). Texts reworded to say what the engine does, and the Codex term Adjacent as a TX key:
  new  ui.eng18-term-adjacent  (inserted after ui.term-surrounding; was a hard-coded English string in arena_app.js KEYWORD_TERMS, whose
                                old lang/ui row is dropped)
  reworded  ui.term-surrounding, ui.eng9-guardian, ui.sk3-spawner, ui.sk3-spawner-codex, ui.sk3-stench, ui.eq2-strike-desc
In the 12 lang/<code>.json packs (keyed by English text) a reworded row keeps its place (renamed in place, key order kept, never
sorted); the new row goes at the end. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_11_02_eng18.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
NEW = [
 ('ui.eng18-term-adjacent', 'directly left, right, in front or behind (in front / behind: raids and group dungeons only).',
  ["juste à gauche, à droite, devant ou derrière (devant / derrière : seulement en raid et en donjon de groupe).",
   'direkt links, rechts, davor oder dahinter (davor / dahinter: nur im Raid und im Gruppen-Dungeon).',
   'justo a la izquierda, a la derecha, delante o detrás (delante / detrás: solo en incursiones y mazmorras de grupo).',
   'subito a sinistra, a destra, davanti o dietro (davanti / dietro: solo nei raid e nei dungeon di gruppo).',
   'logo à esquerda, à direita, à frente ou atrás (frente / trás: só em incursões e masmorras em grupo).',
   'mismong kaliwa, kanan, harap o likod (harap / likod: sa raid at group dungeon lang).',
   'உடனடி இடம், வலம், முன் அல்லது பின் (முன் / பின்: ரெய்டு, குழு நிலவறையில் மட்டும்).',
   'tepat di kiri, kanan, depan, atau belakang (depan / belakang: hanya di raid dan dungeon grup).',
   '紧挨在左、右、前或后（前后只在突袭和组队地下城中算）。',
   '緊挨在左、右、前或後（前後只在突襲和組隊地下城中算）。',
   'すぐ左・右・前・後ろ（前後はレイドとグループダンジョンのみ）。',
   '바로 왼쪽, 오른쪽, 앞 또는 뒤 (앞뒤는 레이드와 그룹 던전에서만).']),
]
# key, new English, [12 translations] (a whole new row) or ('sub', [(old, new) per language]) (an edit of the existing translation)
REWORD = [
 ('ui.term-surrounding', "the 8 places around it: adjacent plus the 4 diagonals (raid and group-dungeon rows too).",
  ["les 8 places autour d'elle : les adjacentes plus les 4 diagonales (et les rangées d'un raid ou d'un donjon de groupe).",
   'die 8 Plätze ringsum: die angrenzenden und die 4 Diagonalen (auch die Reihen von Raid und Gruppen-Dungeon).',
   'los 8 lugares a su alrededor: los adyacentes y las 4 diagonales (también las filas de incursiones y mazmorras de grupo).',
   'gli 8 posti intorno: gli adiacenti più le 4 diagonali (anche le file di raid e dungeon di gruppo).',
   'os 8 lugares à volta: os adjacentes mais as 4 diagonais (também as filas de incursões e masmorras em grupo).',
   'ang 8 puwesto sa paligid nito: ang mga katabi at ang 4 na pahilis (pati ang mga hanay ng raid at group dungeon).',
   'அதைச் சுற்றியுள்ள 8 இடங்கள்: அடுத்துள்ளவையும் 4 மூலைவிட்டங்களும் (ரெய்டு, குழு நிலவறை வரிசைகளும்).',
   '8 tempat di sekelilingnya: yang bersebelahan ditambah 4 diagonal (juga baris raid dan dungeon grup).',
   '它周围的 8 个位置：相邻位置加 4 个斜角（突袭和组队地下城的各排也算）。',
   '它周圍的 8 個位置：相鄰位置加 4 個斜角（突襲和組隊地下城的各排也算）。',
   '周りの8か所：隣接する4か所と斜め4方向（レイドやグループダンジョンの列も）。',
   '주위 8칸: 인접한 칸과 대각선 4칸 (레이드와 그룹 던전의 줄도 포함).']),
 ('ui.eng9-guardian', "While Ready, steps in front of an adjacent ally (beside it; in a raid or group dungeon, in front or behind too) and takes the plain attacks and counter-attacks aimed at it. Skills and area hits don't, and it never guards the bramble or an ally with Thorns. Not while Waiting, Stunned, Frozen, Asleep or Bound.",
  ('sub', [('(à côté ; en raid, devant ou derrière)', '(à côté ; en raid ou en donjon de groupe, aussi devant ou derrière)'),
           ('(daneben; im Überfall davor oder dahinter)', '(daneben; im Überfall oder Gruppen-Dungeon auch davor oder dahinter)'),
           ('(a su lado; en una incursión, delante o detrás)', '(a su lado; en una incursión o mazmorra de grupo, también delante o detrás)'),
           ('(accanto; in un raid, davanti o dietro)', '(accanto; in un raid o dungeon di gruppo, anche davanti o dietro)'),
           ('(ao lado; numa incursão, à frente ou atrás)', '(ao lado; numa incursão ou masmorra em grupo, também à frente ou atrás)'),
           ('(sa tabi; sa raid, sa harap o likod)', '(sa tabi; sa raid o group dungeon, pati sa harap o likod)'),
           ('(பக்கத்தில்; தாக்குதலில் முன்னோ பின்னோ)', '(பக்கத்தில்; ரெய்டு அல்லது குழு நிலவறையில் முன்னும் பின்னும்)'),
           ('(di samping; dalam serbuan, di depan atau belakang)', '(di samping; dalam serbuan atau dungeon grup, juga di depan atau belakang)'),
           ('（旁边；突袭中为前后）', '（旁边；突袭或组队地下城中也包括前后）'),
           ('（旁邊；突襲中為前後）', '（旁邊；突襲或組隊地下城中也包括前後）'),
           ('（横。レイドでは前後も）', '（横。レイドやグループダンジョンでは前後も）'),
           ('(옆; 레이드에서는 앞뒤도)', '(옆; 레이드나 그룹 던전에서는 앞뒤도)')])),
 ('ui.sk3-spawner', 'While Ready, it spawns {card} into the free slot nearest it every turn.',
  ['Tant qu’elle est prête, elle fait apparaître {card} dans la case libre la plus proche, à chaque tour.',
   'Solange sie bereit ist, erscheint jede Runde {card} auf dem nächsten freien Feld.',
   'Mientras está lista, genera {card} en la casilla libre más cercana cada turno.',
   'Finché è pronta, genera {card} nella casella libera più vicina, ogni turno.',
   'Enquanto está pronta, gera {card} na casa livre mais próxima, a cada turno.',
   'Habang Handa, naglalabas ito ng {card} sa pinakamalapit na bakanteng puwesto bawat turno.',
   'தயாராக இருக்கும்போது, ஒவ்வொரு சுற்றிலும் அதற்கு மிக அருகிலுள்ள காலியிடத்தில் {card} பிறக்கும்.',
   'Selama Siap, ia memunculkan {card} di petak kosong terdekat tiap giliran.',
   '就绪时，每回合在离它最近的空格生成{card}。',
   '就緒時，每回合在離它最近的空格生成{card}。',
   '準備完了の間、毎ターン最も近い空きマスに{card}を生み出す。',
   '준비된 동안 매 턴 가장 가까운 빈칸에 {card}을(를) 낳아요.']),
 ('ui.sk3-spawner-codex', 'An On Turn Start trigger: off while it is Waiting, Stunned, Frozen or Asleep. No free slot left, no spawn.',
  ('sub', [('Sans case libre à côté, rien n’apparaît.', 'Sans case libre, rien n’apparaît.'),
           ('Kein freies Feld daneben, nichts erscheint.', 'Kein freies Feld mehr, nichts erscheint.'),
           ('Sin casilla libre al lado, nada aparece.', 'Sin casillas libres, nada aparece.'),
           ('Senza casella libera accanto, niente appare.', 'Senza caselle libere, niente appare.'),
           ('Sem casa livre ao lado, nada aparece.', 'Sem casas livres, nada aparece.'),
           ('Walang bakanteng puwesto sa tabi, walang lalabas.', 'Walang bakanteng puwesto, walang lalabas.'),
           ('அருகில் காலியிடம் இல்லையெனில் எதுவும் பிறக்காது.', 'காலியிடம் இல்லையெனில் எதுவும் பிறக்காது.'),
           ('Tanpa petak kosong di samping, tak ada yang muncul.', 'Tanpa petak kosong, tak ada yang muncul.'),
           ('身旁没有空格就不生成。', '没有空格就不生成。'),
           ('身旁沒有空格就不生成。', '沒有空格就不生成。'),
           ('隣に空きマスがなければ何も出ない。', '空きマスがなければ何も出ない。'),
           ('옆에 빈칸이 없으면 아무것도 안 나와요.', '빈칸이 없으면 아무것도 안 나와요.')])),
 ('ui.sk3-stench', 'When played, {n} Stench on the enemy facing it and the units adjacent to that one.',
  ['Une fois jouée, {n} Puanteur sur l’ennemi en face et les unités adjacentes à celui-ci.',
   'Wenn gespielt, {n} Gestank auf den Gegner gegenüber und die Einheiten, die an ihn angrenzen.',
   'Al jugarse, {n} de Hedor en el enemigo de enfrente y las unidades adyacentes a él.',
   'Quando giocata, {n} Fetore sul nemico di fronte e sulle unità adiacenti a lui.',
   'Ao ser jogada, {n} de Fedor no inimigo em frente e nas unidades adjacentes a ele.',
   'Kapag nilaro, {n} Baho sa kalabang kaharap nito at sa mga yunit na katabi niyon.',
   'விளையாடும்போது, எதிரே உள்ள எதிரிக்கும் அதை அடுத்துள்ள அலகுகளுக்கும் {n} நாற்றம்.',
   'Saat dimainkan, {n} Bau Busuk pada musuh di depannya dan unit yang bersebelahan dengannya.',
   '打出时，对面的敌人及与其相邻的单位获得{n}层恶臭。',
   '打出時，對面的敵人及與其相鄰的單位獲得{n}層惡臭。',
   'プレイ時、正面の敵とそれに隣接するユニットに悪臭{n}。',
   '낼 때 맞은편 적과 그에 인접한 유닛에 악취 {n}.']),
 ('ui.eq2-strike-desc', '{name}: {dmg} damage to your unit with the most Attack, every {every} turns. A Guardian adjacent to it takes the blow instead.',
  ('sub', [('Un Gardien à côté encaisse le coup à sa place.', 'Un Gardien adjacent encaisse le coup à sa place.'),
           ('Ein Wächter daneben fängt den Schlag ab.', 'Ein angrenzender Wächter fängt den Schlag ab.'),
           ('Un Guardián a su lado recibe el golpe en su lugar.', 'Un Guardián adyacente recibe el golpe en su lugar.'),
           ('Un Guardiano accanto prende il colpo al suo posto.', 'Un Guardiano adiacente prende il colpo al suo posto.'),
           ('Um Guardião ao lado leva o golpe no lugar dela.', 'Um Guardião adjacente leva o golpe no lugar dela.'),
           ('Ang katabing Guardian ang sasalo ng tama.', 'Ang katabing Guardian (kaliwa, kanan, harap o likod) ang sasalo ng tama.'),
           ('பக்கத்திலுள்ள காவலர் அந்த அடியை ஏற்பார்.', 'அதை அடுத்துள்ள காவலர் அந்த அடியை ஏற்பார்.'),
           ('Penjaga di sebelahnya menerima pukulan itu.', 'Penjaga yang bersebelahan dengannya menerima pukulan itu.'),
           ('旁边的守护者会代为承受。', '相邻的守护者会代为承受。'),
           ('旁邊的守護者會代為承受。', '相鄰的守護者會代為承受。'),
           ('隣の守護者が代わりに受ける。', '隣接する守護者が代わりに受ける。'),
           ('옆의 수호자가 대신 맞아요.', '인접한 수호자가 대신 맞아요.')])),
 # 2026-11-02 20:19 (owner on BASELVL-1: "Baby cards start at level 0"): Hatchling is a Level 0 skill now
 ('ui.sk-hatchling', 'A young one an evolute can grow from: an evolute played onto it gains +1/+2. From Level 0.',
  ('sub', [('Dès le niveau 1.', 'Dès le niveau 0.'), ('Ab Stufe 1.', 'Ab Stufe 0.'), ('Desde el nivel 1.', 'Desde el nivel 0.'), ('Dal livello 1.', 'Dal livello 0.'),
           ('Desde o nível 1.', 'Desde o nível 0.'), ('Mula Level 1.', 'Mula Level 0.'), ('நிலை 1 முதல்.', 'நிலை 0 முதல்.'), ('Sejak Level 1.', 'Sejak Level 0.'),
           ('1 级起。', '0 级起。'), ('1 級起。', '0 級起。'), ('レベル1から。', 'レベル0から。'), ('레벨 1부터.', '레벨 0부터.')])),
 ('ui.sk-hatchling-codex', "Every Baby card has it from Level 0. It only matters when you play an Evomax evolute (Evolute) onto it; it is not the egg's Hatch or Stay.",
  ('sub', [('dès le niveau 1', 'dès le niveau 0'), ('ab Stufe 1', 'ab Stufe 0'), ('desde el nivel 1', 'desde el nivel 0'), ('dal livello 1', 'dal livello 0'),
           ('desde o nível 1', 'desde o nível 0'), ('mula Level 1', 'mula Level 0'), ('நிலை 1 முதல்', 'நிலை 0 முதல்'), ('sejak Level 1', 'sejak Level 0'),
           ('从 1 级起', '从 0 级起'), ('從 1 級起', '從 0 級起'), ('レベル1から', 'レベル0から'), ('레벨 1부터', '레벨 0부터')])),
]
# lang/ui rows of English strings that left arena_app.js (now TX keys above)
UI_DROP = ["directly left or right; in a raid, also directly in front or behind."]

def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
def rename_in_place(pack, old, new, val):
    if old not in pack: pack[new] = val; return pack
    out = {}
    for k, v in pack.items():
        if k == old: out[new] = val
        elif k == new: continue
        else: out[k] = v
    return out

tp = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(tp, encoding='utf-8').read()
olds = {}
for k, en, _ in REWORD:
    m = re.search(r'^  "%s": (".*?"),\n' % re.escape(k), src, re.M); assert m, k
    olds[k] = json.loads(m.group(1))
    src = src.replace(m.group(0), '  "%s": %s,\n' % (k, json.dumps(en, ensure_ascii=False)))
anchor = re.search(r'^  "ui\.term-surrounding": .*\n', src, re.M).group(0)
add = ''.join('  "%s": %s,\n' % (k, json.dumps(en, ensure_ascii=False)) for k, en, _ in NEW if ('"%s":' % k) not in src)
src = src.replace(anchor, anchor + add)
open(tp, 'w', encoding='utf-8').write(src)
used_elsewhere = lambda en: ('": ' + json.dumps(en, ensure_ascii=False) + ',') in src
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for k, en, row in REWORD:
        old = olds[k]
        if old == en: continue
        if isinstance(row, tuple):
            a, b = row[1][i]; cur = pack.get(old) if old in pack else pack.get(en)
            assert cur is not None and (a in cur or b in cur), (code, k, cur)
            val = cur.replace(a, b)
        else:
            assert len(row) == 12, k; val = row[i]
        if used_elsewhere(old): pack[en] = val # another key still shows the old English: keep its row, add this one
        else: pack = rename_in_place(pack, old, en, val)
    for k, en, row in NEW:
        assert len(row) == 12, k
        pack[en] = row[i]
    dump(path, pack)
    upath = os.path.join(ROOT, 'lang', 'ui', code + '.json'); up = json.load(open(upath, encoding='utf-8'))
    if any(s in up for s in UI_DROP):
        for s in UI_DROP: up.pop(s, None)
        dump(upath, up)
print('ok', len(NEW), 'new,', len(REWORD), 'reworded')
