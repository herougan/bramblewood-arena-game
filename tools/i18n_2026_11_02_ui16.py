#!/usr/bin/env python3
"""Game texts added on 2026-11-02 by package UI16 (the rival card's Leader / Bramble captions; the player card editor: background, border, font,
the words before and after your name, and what opens each). 42 new TX keys (ui.ui16-*), one row per English text in lang/<code>.json (rows that
already exist are kept as they are; new rows are appended, nothing is sorted). The words before and after a name are written to sit around a
name in each language (CJK: the prefix ends in 的 / の / 의-free adjectives, the suffix is set off with a middle dot). Tagalog, Tamil, Japanese and
Korean deserve a native read; the gendered languages use the masculine / common form.
    python3 tools/i18n_2026_11_02_ui16.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Leader', ['Chef', 'Anführer', 'Líder', 'Capo', 'Líder', 'Pinuno', 'தலைவர்', 'Pemimpin', '领袖', '領袖', 'リーダー', '리더']),
 ('Bramble', ['Ronce', 'Dornburg', 'Zarzal', 'Rovo', 'Silvado', 'Bramble', 'முட்புதர்', 'Semak Duri', '荆棘堡', '荊棘堡', 'ブランブル', '가시덤불']),
 ('Edit your player card', ['Modifier ta carte de joueur', 'Spielerkarte bearbeiten', 'Editar tu carta de jugador', 'Modifica la tua carta giocatore', 'Editar o teu cartão de jogador', 'I-edit ang iyong player card', 'உங்கள் வீரர் அட்டையைத் திருத்து', 'Ubah kartu pemainmu', '编辑你的玩家名片', '編輯你的玩家名片', 'プレイヤーカードを編集', '플레이어 카드 편집']),
 ('More looks unlock as you clear maps and level up.', ['D’autres styles se débloquent en terminant des cartes et en montant de niveau.', 'Weitere Looks schaltest du frei, indem du Karten abschließt und aufsteigst.', 'Más estilos se desbloquean al completar mapas y subir de nivel.', 'Altri stili si sbloccano completando mappe e salendo di livello.', 'Mais visuais desbloqueiam ao completar mapas e subir de nível.', 'May mabubuksang bagong itsura habang tinatapos mo ang mga mapa at tumataas ang level mo.', 'வரைபடங்களை முடித்து நிலை உயரும்போது மேலும் தோற்றங்கள் திறக்கும்.', 'Tampilan lain terbuka saat kamu menuntaskan peta dan naik level.', '通关地图、提升等级可解锁更多样式。', '通關地圖、提升等級可解鎖更多樣式。', 'マップをクリアしてレベルを上げると、見た目が増えます。', '맵을 클리어하고 레벨을 올리면 더 많은 꾸미기가 열려요.']),
 ('Background', ['Fond', 'Hintergrund', 'Fondo', 'Sfondo', 'Fundo', 'Background', 'பின்னணி', 'Latar', '背景', '背景', '背景', '배경']),
 ('Border', ['Bordure', 'Rahmen', 'Borde', 'Bordo', 'Moldura', 'Border', 'விளிம்பு', 'Bingkai', '边框', '邊框', '枠', '테두리']),
 ('Font', ['Police', 'Schrift', 'Fuente', 'Carattere', 'Fonte', 'Font', 'எழுத்துரு', 'Fon', '字体', '字體', 'フォント', '글꼴']),
 ('Before your name', ['Avant ton nom', 'Vor deinem Namen', 'Antes de tu nombre', 'Prima del tuo nome', 'Antes do teu nome', 'Bago ang pangalan mo', 'உங்கள் பெயருக்கு முன்', 'Sebelum namamu', '名字前', '名字前', '名前の前', '이름 앞']),
 ('After your name', ['Après ton nom', 'Nach deinem Namen', 'Después de tu nombre', 'Dopo il tuo nome', 'Depois do teu nome', 'Pagkatapos ng pangalan mo', 'உங்கள் பெயருக்குப் பின்', 'Sesudah namamu', '名字后', '名字後', '名前の後', '이름 뒤']),
 ('Everyone has this', ['Tout le monde l’a', 'Hat jeder', 'Todos lo tienen', 'Ce l’hanno tutti', 'Todos têm', 'Mayroon nito ang lahat', 'எல்லோருக்கும் உண்டு', 'Semua orang punya', '人人都有', '人人都有', '全員が持っています', '모두가 가지고 있어요']),
 ('Clear {map}', ['Terminer {map}', '{map} abschließen', 'Completa {map}', 'Completa {map}', 'Completa {map}', 'Tapusin ang {map}', '{map} ஐ முடி', 'Tuntaskan {map}', '通关{map}', '通關{map}', '{map}をクリア', '{map} 클리어']),
 ('Reach player level {n}', ['Atteindre le niveau de joueur {n}', 'Erreiche Spielerstufe {n}', 'Alcanza el nivel de jugador {n}', 'Raggiungi il livello giocatore {n}', 'Alcança o nível de jogador {n}', 'Umabot sa player level {n}', 'வீரர் நிலை {n} ஐ அடை', 'Capai level pemain {n}', '玩家等级达到 {n}', '玩家等級達到 {n}', 'プレイヤーレベル{n}に到達', '플레이어 레벨 {n} 달성']),
 ('Win your first Conquest fight', ['Gagner ton premier combat de Conquête', 'Gewinne deinen ersten Eroberungskampf', 'Gana tu primer combate de Conquista', 'Vinci la tua prima battaglia di Conquista', 'Vence o teu primeiro combate de Conquista', 'Manalo sa una mong laban sa Conquest', 'உங்கள் முதல் வெற்றிப் போரில் வெல்லுங்கள்', 'Menangi pertarungan Penaklukan pertamamu', '赢得你的第一场征服之战', '贏得你的第一場征服之戰', '初めての征服バトルに勝つ', '첫 정복 전투에서 승리']),
 ('Own {n} different cards', ['Posséder {n} cartes différentes', 'Besitze {n} verschiedene Karten', 'Ten {n} cartas distintas', 'Possiedi {n} carte diverse', 'Possui {n} cartas diferentes', 'Magkaroon ng {n} magkakaibang baraha', '{n} வெவ்வேறு அட்டைகளை வைத்திருங்கள்', 'Miliki {n} kartu berbeda', '拥有 {n} 张不同的卡牌', '擁有 {n} 張不同的卡牌', '{n}種類のカードを持つ', '서로 다른 카드 {n}장 보유']),
 ('Meadow', ['Prairie', 'Wiese', 'Pradera', 'Prato', 'Prado', 'Parang', 'புல்வெளி', 'Padang', '草甸', '草甸', '草原', '초원']),
 ('Dusk', ['Crépuscule', 'Dämmerung', 'Anochecer', 'Crepuscolo', 'Crepúsculo', 'Takipsilim', 'அந்தி', 'Senja', '黄昏', '黃昏', '黄昏', '황혼']),
 ('Tide', ['Marée', 'Gezeiten', 'Marea', 'Marea', 'Maré', 'Taog', 'அலை', 'Pasang', '潮汐', '潮汐', '潮', '물결']),
 ('Ember', ['Braise', 'Glut', 'Brasa', 'Brace', 'Brasa', 'Baga', 'தணல்', 'Bara', '余烬', '餘燼', '残り火', '불씨']),
 ('Frost', ['Givre', 'Frost', 'Escarcha', 'Brina', 'Geada', 'Hamog na Yelo', 'உறைபனி', 'Embun Beku', '霜', '霜', '霜', '서리']),
 ('Starlight', ['Lumière d’étoiles', 'Sternenlicht', 'Luz estelar', 'Luce stellare', 'Luz das estrelas', 'Liwanag ng Bituin', 'நட்சத்திர ஒளி', 'Cahaya Bintang', '星光', '星光', '星明かり', '별빛']),
 ('Plain', ['Simple', 'Schlicht', 'Sencillo', 'Semplice', 'Simples', 'Payak', 'எளிய', 'Polos', '朴素', '樸素', 'シンプル', '기본']),
 ('Vine', ['Liane', 'Ranke', 'Enredadera', 'Rampicante', 'Trepadeira', 'Baging', 'கொடி', 'Sulur', '藤蔓', '藤蔓', 'つる', '덩굴']),
 ('Bark', ['Écorce', 'Rinde', 'Corteza', 'Corteccia', 'Casca', 'Balat ng Puno', 'மரப்பட்டை', 'Kulit Kayu', '树皮', '樹皮', '樹皮', '나무껍질']),
 ('Silver', ['Argent', 'Silber', 'Plata', 'Argento', 'Prata', 'Pilak', 'வெள்ளி', 'Perak', '银', '銀', 'シルバー', '은']),
 ('Gold', ['Or', 'Gold', 'Oro', 'Oro', 'Ouro', 'Ginto', 'தங்கம்', 'Emas', '金', '金', 'ゴールド', '금']),
 ('Classic', ['Classique', 'Klassisch', 'Clásica', 'Classico', 'Clássica', 'Klasiko', 'பாரம்பரிய', 'Klasik', '经典', '經典', 'クラシック', '클래식']),
 ('Poster', ['Affiche', 'Plakat', 'Cartel', 'Manifesto', 'Cartaz', 'Poster', 'சுவரொட்டி', 'Poster', '海报', '海報', 'ポスター', '포스터']),
 ('Old Kingdom', ['Vieux Royaume', 'Altes Königreich', 'Viejo Reino', 'Antico Regno', 'Velho Reino', 'Lumang Kaharian', 'பழைய இராச்சியம்', 'Kerajaan Lama', '古王国', '古王國', '古の王国', '옛 왕국']),
 ('Handwritten', ['Manuscrite', 'Handschrift', 'Manuscrita', 'A mano', 'Manuscrita', 'Sulat-kamay', 'கையெழுத்து', 'Tulisan Tangan', '手写', '手寫', '手書き', '손글씨']),
 ('None', ['Aucun', 'Keins', 'Ninguno', 'Nessuno', 'Nenhum', 'Wala', 'இல்லை', 'Tidak ada', '无', '無', 'なし', '없음']),
 ('Brave', ['Brave', 'Tapfere', 'Valiente', 'Coraggioso', 'Bravo', 'Matapang na', 'துணிச்சலான', 'Pemberani', '勇敢的', '勇敢的', '勇敢な', '용감한']),
 ('Mossy', ['Moussu', 'Moosige', 'Musgoso', 'Muschioso', 'Musgoso', 'Lumot na', 'பாசி படர்ந்த', 'Berlumut', '覆苔的', '覆苔的', '苔むした', '이끼 낀']),
 ('Swift', ['Rapide', 'Flinke', 'Veloz', 'Rapido', 'Veloz', 'Mabilis na', 'விரைவான', 'Gesit', '迅捷的', '迅捷的', '俊足の', '날쌘']),
 ('Ancient', ['Ancien', 'Uralte', 'Antiguo', 'Antico', 'Ancião', 'Sinaunang', 'பழம்பெரும்', 'Purba', '远古的', '遠古的', 'いにしえの', '고대의']),
 ('Golden', ['Doré', 'Goldene', 'Dorado', 'Dorato', 'Dourado', 'Gintong', 'பொன்னான', 'Keemasan', '金色的', '金色的', '黄金の', '황금빛']),
 ('the Bold', ['l’Audacieux', 'der Kühne', 'el Audaz', 'l’Audace', 'o Audaz', 'ang Matapang', 'துணிவாளர்', 'si Berani', '·无畏者', '·無畏者', '・豪胆なる者', '· 대담한 자']),
 ('of the Glade', ['de la Clairière', 'von der Lichtung', 'del Claro', 'della Radura', 'da Clareira', 'ng Parang', 'புல்வெளியின்', 'dari Lapangan Hutan', '·林间之人', '·林間之人', '・森の空き地の', '· 숲속 빈터의']),
 ('the Wanderer', ['le Vagabond', 'der Wanderer', 'el Errante', 'il Viandante', 'o Andarilho', 'ang Manlalakbay', 'நாடோடி', 'si Pengembara', '·流浪者', '·流浪者', '・さすらい人', '· 방랑자']),
 ('the Collector', ['le Collectionneur', 'der Sammler', 'el Coleccionista', 'il Collezionista', 'o Colecionador', 'ang Kolektor', 'சேகரிப்பாளர்', 'si Kolektor', '·收藏家', '·收藏家', '・収集家', '· 수집가']),
 ('the Unbroken', ['l’Invaincu', 'der Ungebrochene', 'el Inquebrantable', 'l’Indomito', 'o Inquebrável', 'ang Di-matitinag', 'உடையாதவர்', 'si Tak Terpatahkan', '·不屈者', '·不屈者', '・不屈の者', '· 꺾이지 않는 자']),
]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T:
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
    dump(path, pack)
print('ok: %d rows added across %d packs' % (added, len(CODES)))
# the two literals UI16 replaced with TX keys (the profile avatar button's title, the editor's foot line) leave lang/ui (tests/i18n-ui-2026-10-18.js)
STALE = ['Edit your character ({v1})', 'More characters and titles unlock as you win. Outfits are on the way.']
gone = 0
for code in CODES:
    path = os.path.join(ROOT, 'lang', 'ui', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for k in STALE:
        if k in pack: del pack[k]; gone += 1
    dump(path, pack)
print('ok: %d stale lang/ui rows removed' % gone)
