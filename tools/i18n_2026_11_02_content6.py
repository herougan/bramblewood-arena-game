#!/usr/bin/env python3
"""Package CONTENT6 (2026-11-02; owner 14:10 "Don't let there be any pure elementals. They have to have an animal-affinity like bear or
something"): the twelve renamed elemental / spirit / ghost / construct / fiend cards and three flavour lines, in all 12 languages.
New card names go to lang/cards/<code>.json, the new flavour lines to lang/ui/<code>.json (where the old ones were). The old English
keys (the old names and flavours) are removed from every pack, so no stale name shows. Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_02_content6.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

# (old English, new English, [fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko])
NAMES = [
 ('Ember Wisp', 'Ember Firefly', ['Luciole de braise', 'Glutglühwürmchen', 'Luciérnaga de brasa', 'Lucciola di Brace', 'Vaga-lume de Brasa', 'Alitaptap ng Baga',
   'தணல் மின்மினி', 'Kunang-kunang Bara', '余烬萤火虫', '餘燼螢火蟲', '残り火ホタル', '잿불 반딧불이']),
 ('Tide Spirit', 'Tide Seahorse', ['Hippocampe des marées', 'Gezeiten-Seepferdchen', 'Caballito de la marea', 'Cavalluccio della Marea', 'Cavalo-marinho da Maré',
   'Kabayong-dagat ng Taog', 'ஓதக் கடற்குதிரை', 'Kuda Laut Pasang', '潮汐海马', '潮汐海馬', '潮のタツノオトシゴ', '조류 해마']),
 ('Stoneheart Golem', 'Stoneheart Tortoise', ['Tortue Cœur-de-Pierre', 'Steinherz-Schildkröte', 'Tortuga Corazón de Piedra', 'Testuggine Cuordipietra',
   'Tartaruga Coração-de-Pedra', 'Pagong na Pusong-Bato', 'கல்நெஞ்சு ஆமை', 'Kura-kura Hati Batu', '石心陆龟', '石心陸龜', '石心リクガメ', '돌심장 육지거북']),
 ('Stormcaller', 'Stormcaller Owl', ['Chouette mande-tempête', 'Sturmrufer-Eule', 'Búho invocatormentas', 'Gufo Evocatempeste', 'Coruja Clama-Tormentas',
   'Kuwagong Tagatawag ng Bagyo', 'புயல் அழைக்கும் ஆந்தை', 'Burung Hantu Pemanggil Badai', '唤雷鸮', '喚雷鴞', '嵐呼びのフクロウ', '폭풍 부르는 올빼미']),
 ('Stalactite Golem', 'Stalactite Pill Bug', ['Cloporte de stalactite', 'Stalaktiten-Rollassel', 'Cochinilla de estalactita', 'Porcellino di Stalattite',
   'Tatuzinho de Estalactite', 'Kuto-kuto ng Stalaktita', 'ஸ்டாலக்டைட் உருளை வண்டு', 'Kutu Bola Stalaktit', '钟乳石球潮虫', '鐘乳石球潮蟲', '鍾乳石ダンゴムシ', '종유석 공벌레']),
 ('Magma Titan', 'Magma Rhino', ['Rhinocéros de magma', 'Magma-Nashorn', 'Rinoceronte de magma', 'Rinoceronte di Magma', 'Rinoceronte de Magma',
   'Rinoseronte ng Magma', 'மாக்மா காண்டாமிருகம்', 'Badak Magma', '熔岩犀牛', '熔岩犀牛', 'マグマサイ', '마그마 코뿔소']),
 ('Rimeheart Colossus', 'Rimeheart Mammoth', ['Mammouth Cœur-de-Givre', 'Reifherz-Mammut', 'Mamut Corazón de Escarcha', 'Mammut Cuordibrina',
   'Mamute Coração-de-Geada', 'Mamut na Pusong-Yelo', 'பனிநெஞ்சு மாமூத்', 'Mamut Hati Beku', '霜心猛犸', '霜心猛獁', '霜心マンモス', '서리심장 매머드']),
 ('Marsh Wisp', 'Wisp Newt', ['Triton follet', 'Irrlicht-Molch', 'Tritón fatuo', 'Tritone Fatuo', 'Tritão Fátuo', 'Newt na Santelmo', 'ஆவி நியூட்',
   'Kadal Air Roh', '鬼火蝾螈', '鬼火蠑螈', '鬼火イモリ', '도깨비불 영원']),
 ('Bog Revenant', 'Revenant Bog Turtle', ['Tortue des tourbières revenante', 'Wiedergänger-Moorschildkröte', 'Tortuga de pantano aparecida',
   'Tartaruga di Palude Rediviva', 'Tartaruga-do-brejo Assombrada', 'Multong Pagong ng Lusak', 'மீளாவி சதுப்பு ஆமை', 'Arwah Kura-kura Rawa',
   '亡魂沼泽龟', '亡魂沼澤龜', '亡霊ヌマガメ', '망령 늪거북']),
 ('The Unremembered', 'Unremembered Heron', ['Héron oublié', 'Vergessener Reiher', 'Garza olvidada', 'Airone Obliato', 'Garça Esquecida', 'Nakalimutang Tagak',
   'மறக்கப்பட்ட நாரை', 'Bangau yang Terlupakan', '被遗忘的苍鹭', '被遺忘的蒼鷺', '忘れられしサギ', '잊혀진 왜가리']),
 ('Blackmass Acolyte', 'Blackmass Rat', ['Rat de la messe noire', 'Schwarzmessen-Ratte', 'Rata de la misa negra', 'Ratto della Messa Nera', 'Rato da Missa Negra',
   'Daga ng Itim na Misa', 'கருந்திருப்பலி எலி', 'Tikus Misa Hitam', '黑弥撒鼠', '黑彌撒鼠', '黒ミサのネズミ', '흑미사 쥐']),
 ('Iron Warden', 'Iron Badger', ['Blaireau de fer', 'Eisendachs', 'Tejón de hierro', 'Tasso di Ferro', 'Texugo de Ferro', 'Badger na Bakal', 'இரும்புப் பேட்ஜர்',
   'Luak Besi', '钢铁獾', '鋼鐵獾', '鉄のアナグマ', '강철 오소리']),
]
FLAVOR = [
 ('Barely more than a floating spark, and everything standing next to it gets singed.',
  'Barely more than a spark with wings, and everything standing next to it gets singed.', [
  'À peine plus qu’une étincelle ailée, et tout ce qui est à côté est roussi.', 'Kaum mehr als ein Funke mit Flügeln, und alles neben ihm wird angesengt.',
  'Apenas una chispa con alas, y todo lo que tiene al lado se chamusca.', 'Poco più di una scintilla con le ali, e tutto ciò che le sta accanto si strina.',
  'Pouco mais que uma faísca com asas, e tudo o que está ao lado fica chamuscado.', 'Halos isang kislap lang na may pakpak, at napapaso ang lahat ng nasa tabi nito.',
  'இறக்கை கொண்ட ஒரு தீப்பொறிக்கு மேல் இல்லை; அருகில் நிற்கும் எல்லாமே கருகும்.', 'Tak lebih dari percikan api bersayap, dan semua yang berdiri di sebelahnya hangus.',
  '不过是一点长了翅膀的火花，站在它旁边的一切都会被烤焦。', '不過是一點長了翅膀的火花，站在它旁邊的一切都會被烤焦。',
  '羽の生えた火花とほとんど変わらないのに、隣に立つものはみんな焦げる。', '날개 달린 불티에 불과하지만, 곁에 선 것은 모두 그을린다.']),
 ('Formless, patient, and impossible to properly hit.', 'Half wave, half seahorse: patient, and impossible to properly hit.', [
  'Moitié vague, moitié hippocampe : patient, et impossible à frapper correctement.', 'Halb Welle, halb Seepferdchen: geduldig und unmöglich richtig zu treffen.',
  'Mitad ola, mitad caballito de mar: paciente e imposible de golpear como es debido.', 'Metà onda, metà cavalluccio marino: paziente, e impossibile da colpire davvero.',
  'Metade onda, metade cavalo-marinho: paciente, e impossível de acertar direito.', 'Kalahating alon, kalahating kabayong-dagat: matiyaga, at imposibleng matamaan nang maayos.',
  'பாதி அலை, பாதி கடற்குதிரை: பொறுமையானது, சரியாக அடிக்கவே முடியாது.', 'Setengah ombak, setengah kuda laut: sabar, dan mustahil dipukul dengan benar.',
  '一半是浪，一半是海马：耐心，根本打不中。', '一半是浪，一半是海馬：耐心，根本打不中。', '半分は波、半分はタツノオトシゴ。辛抱強く、まともに当てるのは不可能。',
  '반은 파도, 반은 해마. 끈기 있고, 제대로 맞히기란 불가능하다.']),
 ('Assembled from castle rubble and something that might be actual magic. Nothing soaks in.',
  'A tortoise of castle rubble and something that might be actual magic. Nothing soaks in.', [
  'Une tortue de gravats du château et de quelque chose qui pourrait être de la vraie magie. Rien ne pénètre.',
  'Eine Schildkröte aus Burgschutt und etwas, das echte Magie sein könnte. Nichts dringt ein.',
  'Una tortuga de escombros del castillo y algo que podría ser magia de verdad. Nada le cala.',
  'Una testuggine di macerie del castello e di qualcosa che potrebbe essere vera magia. Niente penetra.',
  'Uma tartaruga de entulho do castelo e de algo que pode ser magia de verdade. Nada penetra.',
  'Isang pagong na gawa sa guho ng kastilyo at sa isang bagay na baka tunay na mahika. Walang tumatagos.',
  'கோட்டை இடிபாடுகளாலும் உண்மையான மாயமாக இருக்கக்கூடிய ஏதோ ஒன்றாலும் ஆன ஆமை. எதுவும் உள்ளே இறங்காது.',
  'Kura-kura dari puing kastel dan sesuatu yang mungkin sihir sungguhan. Tak ada yang meresap.',
  '一只用城堡瓦砾和某种可能是真魔法的东西拼成的陆龟。什么都渗不进去。', '一隻用城堡瓦礫和某種可能是真魔法的東西拼成的陸龜。什麼都滲不進去。',
  'お城のがれきと、本物の魔法かもしれない何かでできたリクガメ。何もしみこまない。', '성의 잔해와 진짜 마법일지도 모르는 무언가로 빚은 거북. 아무것도 스며들지 않는다.']),
]


def load(p):
    return json.load(open(p, encoding='utf-8'))


def dump(p, d):
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def main():
    for rows in (NAMES, FLAVOR):
        for old, new, tr in rows:
            assert len(tr) == 12, new
    stats = {}
    for i, code in enumerate(CODES):
        paths = {w: os.path.join(ROOT, 'lang', *(([w] if w else []) + [code + '.json'])) for w in ('', 'cards', 'ui')}
        packs = {w: load(p) for w, p in paths.items()}
        dropped = added = 0
        for rows, where in ((NAMES, 'cards'), (FLAVOR, 'ui')):
            for old, new, tr in rows:
                for w in packs:
                    if old in packs[w]: del packs[w][old]; dropped += 1
                if new not in packs[where]: added += 1
                packs[where][new] = tr[i]
        for w, p in paths.items(): dump(p, packs[w])
        stats[code] = (added, dropped)
    print('ok: (added, old keys dropped) per language:', stats)


if __name__ == '__main__':
    main()
