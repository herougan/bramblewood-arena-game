#!/usr/bin/env python3
"""Package CONTENT18 (2026-11-08, owner 10:52 rows 8, 12, 14): the five new cards' names (lang/cards/<code>.json) and flavour lines
(lang/ui/<code>.json), and the new texts (lang/<code>.json, keyed by the English text of the TX keys 'ui.c18-*' in bramblewood-texts.js,
plus the two habitat names the Canopy Bower's line reads through _t). One row per English text; rows that exist are kept, new rows are
appended, nothing is sorted. Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_08_content18.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

UI = [
 ('{kin} units played: +{a} ⚔ +{h} ❤', ['Unités {kin} jouées : +{a} ⚔ +{h} ❤', 'Gespielte {kin}-Einheiten: +{a} ⚔ +{h} ❤', 'Unidades de {kin} jugadas: +{a} ⚔ +{h} ❤', 'Unità {kin} giocate: +{a} ⚔ +{h} ❤', 'Unidades de {kin} jogadas: +{a} ⚔ +{h} ❤', 'Mga unit na {kin} na nilaro: +{a} ⚔ +{h} ❤', 'விளையாடிய {kin} அலகுகள்: +{a} ⚔ +{h} ❤', 'Unit {kin} yang dimainkan: +{a} ⚔ +{h} ❤', '打出的{kin}单位：+{a} ⚔ +{h} ❤', '打出的{kin}單位：+{a} ⚔ +{h} ❤', '出した{kin}のユニット：+{a} ⚔ +{h} ❤', '낸 {kin} 유닛: +{a} ⚔ +{h} ❤']),
 ('Habitat units', ['Unités d’un habitat', 'Lebensraum-Einheiten', 'Unidades de hábitat', 'Unità di un habitat', 'Unidades de habitat', 'Mga unit ng tirahan', 'வாழிட அலகுகள்', 'Unit habitat', '栖息地单位', '棲息地單位', '生息地のユニット', '서식지 유닛']),
 ('Star path: {path} (Wildpaths)', ['Chemin d’étoiles : {path} (Sentiers sauvages)', 'Sternenpfad: {path} (Wildpfade)', 'Senda estelar: {path} (Sendas salvajes)', 'Sentiero stellare: {path} (Sentieri selvaggi)', 'Trilha estelar: {path} (Trilhas selvagens)', 'Landas ng bituin: {path} (Mga Ligaw na Landas)', 'நட்சத்திரப் பாதை: {path} (காட்டுப் பாதைகள்)', 'Jalur bintang: {path} (Jalur Liar)', '星之路：{path}（荒野小径）', '星之路：{path}（荒野小徑）', '星の道：{path}（ワイルドパス）', '별의 길: {path} (야생의 길)']),
 ('Star path', ['Chemin d’étoiles', 'Sternenpfad', 'Senda estelar', 'Sentiero stellare', 'Trilha estelar', 'Landas ng bituin', 'நட்சத்திரப் பாதை', 'Jalur bintang', '星之路', '星之路', '星の道', '별의 길']),
 ('Cards that only a star path gives', ['Cartes que seul un chemin d’étoiles donne', 'Karten, die nur ein Sternenpfad gibt', 'Cartas que solo da una senda estelar', 'Carte che dà solo un sentiero stellare', 'Cartas que só uma trilha estelar dá', 'Mga card na tanging landas ng bituin ang nagbibigay', 'நட்சத்திரப் பாதை மட்டுமே தரும் அட்டைகள்', 'Kartu yang hanya diberikan jalur bintang', '只有星之路给的卡', '只有星之路給的卡', '星の道だけがくれるカード', '별의 길에서만 얻는 카드']),
 ('Card: {name}', ['Carte : {name}', 'Karte: {name}', 'Carta: {name}', 'Carta: {name}', 'Carta: {name}', 'Card: {name}', 'அட்டை: {name}', 'Kartu: {name}', '卡牌：{name}', '卡牌：{name}', 'カード：{name}', '카드: {name}']),
 ('Unlocks {name}. Only this star path gives it.', ['Débloque {name}. Seul ce chemin d’étoiles la donne.', 'Schaltet {name} frei. Nur dieser Sternenpfad gibt sie.', 'Desbloquea {name}. Solo esta senda estelar la da.', 'Sblocca {name}. Solo questo sentiero stellare la dà.', 'Desbloqueia {name}. Só esta trilha estelar a dá.', 'Binubuksan ang {name}. Tanging ang landas ng bituing ito ang nagbibigay nito.', '{name} திறக்கும். இந்த நட்சத்திரப் பாதை மட்டுமே இதைத் தரும்.', 'Membuka {name}. Hanya jalur bintang ini yang memberikannya.', '解锁{name}。只有这条星之路会给。', '解鎖{name}。只有這條星之路會給。', '{name}を解放する。この星の道でしか手に入らない。', '{name} 해금. 이 별의 길에서만 얻는다.']),
 ('Starpath-only card', ['Carte exclusive au chemin d’étoiles', 'Nur-Sternenpfad-Karte', 'Carta exclusiva de senda estelar', 'Carta esclusiva del sentiero stellare', 'Carta exclusiva da trilha estelar', 'Card ng landas ng bituin lamang', 'நட்சத்திரப் பாதைக்கு மட்டுமான அட்டை', 'Kartu khusus jalur bintang', '星之路专属卡', '星之路專屬卡', '星の道限定カード', '별의 길 전용 카드']),
 ('Rainforest', ['Forêt tropicale', 'Regenwald', 'Selva', 'Foresta pluviale', 'Floresta tropical', 'Rainforest', 'மழைக்காடு', 'Hutan hujan', '雨林', '雨林', '熱帯雨林', '열대우림']),
 ('Savanna', ['Savane', 'Savanne', 'Sabana', 'Savana', 'Savana', 'Sabana', 'புல்வெளி', 'Sabana', '草原', '草原', 'サバンナ', '사바나']),
]

NAMES = [
 ('Adder', ['Vipère', 'Kreuzotter', 'Víbora', 'Vipera', 'Víbora', 'Ulupong', 'விரியன் பாம்பு', 'Ular Beludak', '蝰蛇', '蝰蛇', 'クサリヘビ', '살무사']),
 ('Elephant', ['Éléphant', 'Elefant', 'Elefante', 'Elefante', 'Elefante', 'Elepante', 'யானை', 'Gajah', '大象', '大象', 'ゾウ', '코끼리']),
 ('Fruit Bat', ['Roussette', 'Flughund', 'Murciélago frugívoro', 'Pipistrello della frutta', 'Morcego-da-fruta', 'Kabag-prutas', 'பழந்தின்னி வௌவால்', 'Kalong', '果蝠', '果蝠', 'オオコウモリ', '과일박쥐']),
 ('Glow-worm', ['Ver luisant', 'Glühwürmchen', 'Luciérnaga', 'Lucciola', 'Vaga-lume', 'Uod na Kumikinang', 'மின்மினிப் புழு', 'Cacing Bercahaya', '萤火虫幼虫', '螢火蟲幼蟲', 'ツチボタル', '반딧불이 애벌레']),
 ('Bumblebee Queen', ['Reine bourdon', 'Hummelkönigin', 'Reina abejorro', 'Regina dei bombi', 'Rainha-mamangava', 'Reyna ng Bumblebee', 'வண்டுத் தேனீ ராணி', 'Ratu Lebah Tanah', '熊蜂女王', '熊蜂女王', 'マルハナバチの女王', '뒤영벌 여왕']),
]

FLAVOR = [
 ('It lies coiled on a warm stone and spits at anything that steps too close. It is not sorry.', [
   'Elle se love sur une pierre chaude et crache sur tout ce qui approche de trop près. Elle ne s’en excuse pas.',
   'Sie liegt zusammengerollt auf einem warmen Stein und spuckt alles an, was zu nah kommt. Es tut ihr nicht leid.',
   'Se enrosca sobre una piedra caliente y escupe a todo lo que se acerca demasiado. No lo siente.',
   'Se ne sta arrotolata su una pietra calda e sputa a chiunque si avvicini troppo. Non le dispiace.',
   'Fica enrolada numa pedra quente e cospe em tudo o que chega perto demais. Não pede desculpa.',
   'Nakapulupot ito sa mainit na bato at dinuduraan ang anumang lumapit nang sobra. Hindi ito nagsisisi.',
   'சூடான கல்லின் மேல் சுருண்டு கிடந்து, மிக அருகில் வருவதன் மேல் துப்புகிறது. அதற்கு வருத்தமில்லை.',
   'Ia melingkar di atas batu hangat dan meludahi apa pun yang terlalu dekat. Ia tidak menyesal.',
   '它盘在温暖的石头上，朝任何靠得太近的东西吐口水。它可不觉得抱歉。',
   '牠盤在溫暖的石頭上，朝任何靠得太近的東西吐口水。牠可不覺得抱歉。',
   '温かい石の上でとぐろを巻き、近づきすぎたものには何にでも唾を吐く。悪いとは思っていない。',
   '따뜻한 돌 위에 똬리를 틀고, 너무 가까이 오는 것에는 무엇이든 침을 뱉는다. 미안해하지도 않는다.']),
 ('It fills its trunk at the waterhole and gives the whole herd a shower. Then it turns around and gives you one.', [
   'Il remplit sa trompe au point d’eau et douche tout le troupeau. Puis il se retourne et vous en offre une.',
   'Er füllt seinen Rüssel am Wasserloch und duscht die ganze Herde. Dann dreht er sich um und duscht dich.',
   'Llena la trompa en la charca y le da una ducha a toda la manada. Luego se da la vuelta y te da una a ti.',
   'Riempie la proboscide alla pozza e fa la doccia a tutto il branco. Poi si gira e la fa anche a te.',
   'Enche a tromba no bebedouro e dá um banho na manada toda. Depois vira-se e dá um em você.',
   'Pinupuno nito ang nguso sa lawa at pinapaliguan ang buong kawan. Saka ito lumilingon at ikaw naman ang pinapaliguan.',
   'நீர்நிலையில் துதிக்கையை நிரப்பி மந்தை முழுவதையும் குளிப்பாட்டுகிறது. பிறகு திரும்பி உன்னையும் குளிப்பாட்டுகிறது.',
   'Ia mengisi belalainya di kubangan dan memandikan seluruh kawanan. Lalu ia berbalik dan memandikanmu.',
   '它在水塘边吸满一鼻子水，给整个象群冲个澡。然后转过身，也给你冲一个。',
   '牠在水塘邊吸滿一鼻子水，給整個象群沖個澡。然後轉過身，也給你沖一個。',
   '水場で鼻いっぱいに水を吸い、群れ全員にシャワーを浴びせる。それから振り向いて、あなたにも。',
   '물웅덩이에서 코에 물을 가득 채워 무리 전체에 샤워를 시켜 준다. 그러고는 돌아서서 당신에게도 한 번.']),
 ('It eats the best half of every fig. The other half, long gone soft, it drops on whoever is below.', [
   'Elle mange la meilleure moitié de chaque figue. L’autre moitié, bien ramollie, elle la lâche sur qui se trouve en dessous.',
   'Er frisst die beste Hälfte jeder Feige. Die andere, längst matschige Hälfte lässt er auf den fallen, der unten steht.',
   'Se come la mejor mitad de cada higo. La otra mitad, ya bien blanda, la deja caer sobre quien esté debajo.',
   'Mangia la metà migliore di ogni fico. L’altra metà, ormai molle, la lascia cadere su chi sta sotto.',
   'Come a melhor metade de cada figo. A outra metade, já bem mole, deixa cair em quem estiver embaixo.',
   'Kinakain nito ang pinakamasarap na kalahati ng bawat igos. Ang kabilang kalahati, na malambot na, ay ibinabagsak nito sa sinumang nasa ibaba.',
   'ஒவ்வொரு அத்திப்பழத்தின் சிறந்த பாதியைத் தின்கிறது. நெடுநாள் கனிந்து போன மறுபாதியைக் கீழே இருப்பவர் மேல் போடுகிறது.',
   'Ia memakan separuh terbaik dari setiap buah ara. Separuh lainnya, yang sudah lama lembek, ia jatuhkan ke siapa pun di bawah.',
   '每个无花果它都吃掉最好的那一半。另一半早就软烂了，它就丢给下面的人。',
   '每個無花果牠都吃掉最好的那一半。另一半早就軟爛了，牠就丟給下面的人。',
   'イチジクはいちばんおいしい半分だけ食べる。とうに柔らかくなった残り半分は、下にいる誰かに落とす。',
   '무화과마다 제일 맛있는 반쪽만 먹는다. 진작 물러 버린 나머지 반쪽은 아래에 있는 누군가에게 떨어뜨린다.']),
 ('A hundred of them light the cave roof like stars. One of them has learned to throw its light.', [
   'Une centaine d’entre eux éclairent la voûte de la grotte comme des étoiles. L’un d’eux a appris à lancer sa lumière.',
   'Hundert von ihnen erleuchten die Höhlendecke wie Sterne. Eines hat gelernt, sein Licht zu werfen.',
   'Cien de ellas iluminan el techo de la cueva como estrellas. Una ha aprendido a lanzar su luz.',
   'Cento di loro illuminano la volta della grotta come stelle. Una ha imparato a lanciare la propria luce.',
   'Cem deles iluminam o teto da caverna como estrelas. Um aprendeu a atirar a sua luz.',
   'Isandaang ganito ang nagpapailaw sa bubong ng kuweba na parang mga bituin. Natuto ang isa na ihagis ang liwanag nito.',
   'நூறு புழுக்கள் குகைக் கூரையை நட்சத்திரங்களைப் போல ஒளிரச் செய்கின்றன. அவற்றில் ஒன்று தன் ஒளியை வீசக் கற்றுக்கொண்டது.',
   'Seratus ekor menerangi langit-langit gua seperti bintang. Salah satunya sudah belajar melempar cahayanya.',
   '上百只把洞顶点亮得像星空。其中一只学会了把自己的光扔出去。',
   '上百隻把洞頂點亮得像星空。其中一隻學會了把自己的光扔出去。',
   '百匹が洞窟の天井を星のように照らす。そのうちの一匹は、自分の光を投げることを覚えた。',
   '백 마리가 동굴 천장을 별처럼 밝힌다. 그중 한 마리는 자기 빛을 던지는 법을 배웠다.']),
 ('She wakes first in spring and builds the whole colony from one ball of pollen. Every flower she visits remembers her.', [
   'Elle s’éveille la première au printemps et bâtit toute la colonie à partir d’une boule de pollen. Chaque fleur qu’elle visite se souvient d’elle.',
   'Sie erwacht im Frühling als Erste und baut das ganze Volk aus einer einzigen Pollenkugel. Jede Blüte, die sie besucht, erinnert sich an sie.',
   'Despierta la primera en primavera y construye toda la colonia a partir de una bola de polen. Cada flor que visita la recuerda.',
   'Si sveglia per prima in primavera e costruisce l’intera colonia da una pallina di polline. Ogni fiore che visita si ricorda di lei.',
   'Acorda primeiro na primavera e constrói a colônia inteira a partir de uma bola de pólen. Cada flor que visita lembra-se dela.',
   'Siya ang unang nagigising tuwing tagsibol at itinatayo ang buong kolonya mula sa isang bola ng polen. Naaalala siya ng bawat bulaklak na dinadalaw niya.',
   'இளவேனிலில் முதலில் விழித்து, ஒரே ஒரு மகரந்த உருண்டையிலிருந்து முழுக் கூட்டத்தையும் கட்டுகிறாள். அவள் செல்லும் ஒவ்வொரு பூவும் அவளை நினைவில் வைத்திருக்கிறது.',
   'Ia bangun pertama di musim semi dan membangun seluruh koloni dari satu bola serbuk sari. Setiap bunga yang ia kunjungi mengingatnya.',
   '春天她最先醒来，用一团花粉建起整个蜂群。她拜访过的每一朵花都记得她。',
   '春天她最先醒來，用一團花粉建起整個蜂群。她拜訪過的每一朵花都記得她。',
   '春いちばんに目覚め、花粉の玉ひとつからコロニーをまるごと築く。訪れた花はみな彼女を覚えている。',
   '봄에 가장 먼저 깨어나 꽃가루 한 덩이로 군락 전체를 일군다. 그녀가 찾아간 꽃은 모두 그녀를 기억한다.']),
]


def load(p):
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


def dump(p, d):
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def main():
    stats = {}
    for i, code in enumerate(CODES):
        added = 0
        for rel, rows in ((os.path.join('lang', code + '.json'), UI), (os.path.join('lang', 'cards', code + '.json'), NAMES), (os.path.join('lang', 'ui', code + '.json'), FLAVOR)):
            p = os.path.join(ROOT, rel); pack = load(p)
            for en, tr in rows:
                assert len(tr) == 12, en
                if en not in pack: pack[en] = tr[i]; added += 1
            dump(p, pack)
        stats[code] = added
    print('ok: rows added per language:', stats)


if __name__ == '__main__':
    main()
