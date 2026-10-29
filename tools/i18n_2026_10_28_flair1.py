#!/usr/bin/env python3
"""Game texts added on 2026-10-28 by package FLAIR1 (owner 23:06: the Dragon Lair, the 0-20 road's final boss, gets its own flair): the opener
banner, the title card and the victory banner. Adds the English rows to bramblewood-texts.js (before the table's end) and the translations to
the 12 packs in lang/. An older, reviewed pack row wins. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_28_flair1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# key, English, [12 translations in CODES order]
ROWS = [
 ('ui.fl1-kicker', 'Final boss of the road', [
   'Boss final de la route', 'Endboss der Straße', 'Jefe final del camino', 'Boss finale della strada', 'Chefe final da estrada', 'Huling boss ng daan',
   'பாதையின் இறுதி முதலாளி', 'Bos terakhir jalan ini', '这条路的最终首领', '這條路的最終首領', '道の最後のボス', '이 길의 최종 보스']),
 ('ui.fl1-title', "The Dragon's Lair", [
   'Le repaire du dragon', 'Die Drachenhöhle', 'La guarida del dragón', 'La tana del drago', 'A toca do dragão', 'Ang Lungga ng Dragon',
   'டிராகனின் குகை', 'Sarang Naga', '巨龙之巢', '巨龍之巢', 'ドラゴンの巣', '용의 둥지']),
 ('ui.fl1-sub', "Something vast sleeps where the mountain's fire is born. It is awake.", [
   'Quelque chose de colossal dort là où naît le feu de la montagne. Il est réveillé.',
   'Etwas Gewaltiges schläft dort, wo das Feuer des Berges geboren wird. Es ist erwacht.',
   'Algo inmenso duerme donde nace el fuego de la montaña. Ya está despierto.',
   'Qualcosa di immenso dorme dove nasce il fuoco della montagna. Ora è sveglio.',
   'Algo imenso dorme onde nasce o fogo da montanha. Já despertou.',
   'May isang napakalaking natutulog kung saan isinisilang ang apoy ng bundok. Gising na ito.',
   'மலையின் நெருப்பு பிறக்கும் இடத்தில் பிரம்மாண்டமான ஒன்று உறங்குகிறது. அது விழித்துவிட்டது.',
   'Sesuatu yang sangat besar tidur di tempat api gunung lahir. Kini ia sudah terjaga.',
   '山火诞生之处沉睡着某种庞然大物。它已经醒了。',
   '山火誕生之處沉睡著某種龐然大物。它已經醒了。',
   '山の炎が生まれる場所に、巨大な何かが眠っている。それは目覚めている。',
   '산의 불이 태어나는 곳에 거대한 무언가가 잠들어 있다. 그것은 깨어 있다.']),
 ('ui.fl1-win', 'THE DRAGON FALLS', [
   'LE DRAGON TOMBE', 'DER DRACHE FÄLLT', 'EL DRAGÓN CAE', 'IL DRAGO CADE', 'O DRAGÃO CAI', 'BUMAGSAK ANG DRAGON',
   'டிராகன் வீழ்ந்தது', 'NAGA TUMBANG', '巨龙倒下了', '巨龍倒下了', 'ドラゴン、倒れる', '용이 쓰러졌다']),
 ('ui.fl1-win-first', 'The road from Map 0 to Map 20 is walked to its end.', [
   'La route de la Carte 0 à la Carte 20 est parcourue jusqu’au bout.',
   'Die Straße von Karte 0 bis Karte 20 ist bis zum Ende gegangen.',
   'El camino del Mapa 0 al Mapa 20 se ha recorrido hasta el final.',
   'La strada dalla Mappa 0 alla Mappa 20 è percorsa fino alla fine.',
   'A estrada do Mapa 0 ao Mapa 20 foi percorrida até o fim.',
   'Natapos na ang daan mula Mapa 0 hanggang Mapa 20.',
   'வரைபடம் 0 முதல் வரைபடம் 20 வரையிலான பாதை முடிவு வரை நடந்து முடிந்தது.',
   'Jalan dari Peta 0 sampai Peta 20 sudah ditempuh sampai ujung.',
   '从地图0到地图20的道路已走到尽头。',
   '從地圖0到地圖20的道路已走到盡頭。',
   'マップ0からマップ20までの道を歩き終えた。',
   '지도 0에서 지도 20까지의 길을 끝까지 걸었다.']),
 ('ui.fl1-win-again', 'The lair falls quiet once more.', [
   'Le repaire retombe dans le silence.', 'Die Höhle wird wieder still.', 'La guarida vuelve a quedar en silencio.', 'La tana torna in silenzio.',
   'A toca volta a ficar em silêncio.', 'Muling tumahimik ang lungga.', 'குகை மீண்டும் அமைதியாகிறது.', 'Sarang itu kembali sunyi.',
   '巢穴再次归于寂静。', '巢穴再次歸於寂靜。', '巣はふたたび静まり返った。', '둥지가 다시 고요해졌다.']),
]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
TP = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(TP, encoding='utf-8').read()
end = src.index('\n}/*TEXT-TABLE-END*/')
add = [(k, en) for k, en, _ in ROWS if ('"%s":' % k) not in src]
if add:
    src = src[:end] + ',\n' + ',\n'.join('  %s: %s' % (json.dumps(k), json.dumps(en, ensure_ascii=False)) for k, en in add) + src[end:]
    open(TP, 'w', encoding='utf-8').write(src)
for k, en, row in ROWS: assert json.dumps(en, ensure_ascii=False) in src, en
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for k, en, row in ROWS:
        assert len(row) == len(CODES) and ph(en) == ph(row[i]), (code, en)
        if en in pack: continue  # an older, reviewed row wins
        pack[en] = row[i]
    dump(path, pack)
print('texts: %d new keys; wrote %d packs, %d texts each' % (len(add), len(CODES), len(ROWS)))
