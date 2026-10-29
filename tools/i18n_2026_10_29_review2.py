#!/usr/bin/env python3
"""Game texts added on 2026-10-29 by package REVIEW2 (owner 10-29 19:14: pills, the Copy my picks tooltip and the "X/N new cards, Y/M carried cards" line in the
Map cards overlay; the Ambush that lies on its road). Adds the English rows to bramblewood-texts.js and the translations to the 12 packs in lang/ (an older,
reviewed row wins). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_29_review2.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
ROWS = [
 ('ui.rv2-tag-skirmish', 'Skirmish', ['Escarmouche', 'Gefecht', 'Escaramuza', 'Schermaglia', 'Escaramuça', 'Labanan', 'சண்டை', 'Pertempuran', '遭遇战', '遭遇戰', 'スカーミッシュ', '전초전']),
 ('ui.rv2-tag-carried', 'Carried', ['Reportée', 'Übernommen', 'Heredada', 'Riportata', 'Herdada', 'Dala', 'எடுத்துச்சென்றது', 'Dibawa', '沿用', '沿用', '持ち越し', '이월']),
 ('ui.rv2-tag-unique', 'Unique', ['Propre', 'Eigen', 'Propia', 'Esclusiva', 'Própria', 'Natatangi', 'தனித்துவம்', 'Khas', '专属', '專屬', '固有', '고유']),
 ('ui.rv2-tag-owner', 'Your note', ['Ta note', 'Deine Notiz', 'Tu nota', 'La tua nota', 'Sua nota', 'Iyong tala', 'உங்கள் குறிப்பு', 'Catatanmu', '你的备注', '你的備註', 'あなたのメモ', '내 메모']),
 ('ui.rv2-tag-claude', "Claude's pick", ['Choix de Claude', 'Claudes Wahl', 'Elección de Claude', 'Scelta di Claude', 'Escolha do Claude', 'Pinili ni Claude', 'Claude-இன் தேர்வு', 'Pilihan Claude', 'Claude 的选择', 'Claude 的選擇', 'Claudeの選択', 'Claude의 선택']),
 ('ui.rv2-tip-owner', 'You asked for this card (or this cut) in one of your notes.', ['Tu as demandé cette carte (ou cette coupe) dans l\'une de tes notes.', 'Du hast diese Karte (oder diesen Schnitt) in einer deiner Notizen verlangt.', 'Pediste esta carta (o este recorte) en una de tus notas.', 'Hai chiesto questa carta (o questo taglio) in una delle tue note.', 'Você pediu esta carta (ou este corte) em uma das suas notas.', 'Hiniling mo ang kard na ito (o ang pagtanggal na ito) sa isa sa mga tala mo.', 'இந்த அட்டையை (அல்லது இந்த நீக்கத்தை) உங்கள் குறிப்புகளில் ஒன்றில் கேட்டீர்கள்.', 'Kamu meminta kartu ini (atau pencoretan ini) di salah satu catatanmu.', '你在备注里要求了这张卡牌（或这次剔除）。', '你在備註裡要求了這張卡牌（或這次剔除）。', 'このカード（またはこのカット）はあなたのメモで求められたものです。', '이 카드(또는 이 제외)는 내 메모에서 요청한 것입니다.']),
 ('ui.rv2-tip-claude', 'Claude chose this one; you did not ask for it.', ['Claude a choisi celle-ci ; tu ne l\'avais pas demandée.', 'Claude hat diese gewählt; du hast sie nicht verlangt.', 'Claude eligió esta; tú no la pediste.', 'Claude ha scelto questa; non l\'avevi chiesta.', 'O Claude escolheu esta; você não pediu.', 'Si Claude ang pumili nito; hindi mo ito hiniling.', 'இதை Claude தேர்ந்தெடுத்தது; நீங்கள் கேட்கவில்லை.', 'Claude yang memilih ini; kamu tidak memintanya.', '这张由 Claude 选择，不是你要求的。', '這張由 Claude 選擇，不是你要求的。', 'これはClaudeが選びました。あなたの指定ではありません。', '이 카드는 Claude가 골랐습니다. 내가 요청한 것이 아닙니다.']),
 ('ui.rv2-copy-tip', 'Copies your Cut/Keep choices as text, ready to paste to Claude', ['Copie tes choix Écarter/Garder en texte, prêt à coller à Claude', 'Kopiert deine Streichen/Behalten-Wahl als Text, bereit zum Einfügen bei Claude', 'Copia tus elecciones de Recortar/Conservar como texto, listo para pegar a Claude', 'Copia le tue scelte Taglia/Tieni come testo, pronto da incollare a Claude', 'Copia suas escolhas de Cortar/Manter como texto, pronto para colar no Claude', 'Kinokopya ang mga napili mong Tanggalin/Panatilihin bilang teksto, handa nang i-paste kay Claude', 'உங்கள் நீக்கு/வை தேர்வுகளை உரையாக நகலெடுக்கிறது, Claude-இடம் ஒட்டத் தயார்', 'Menyalin pilihan Coret/Simpan-mu sebagai teks, siap ditempel ke Claude', '将你的剔除/保留选择复制为文本，可直接粘贴给 Claude', '將你的剔除/保留選擇複製為文字，可直接貼給 Claude', 'カット/残すの選択をテキストとしてコピーします。そのままClaudeに貼り付けられます', '제외/유지 선택을 텍스트로 복사합니다. 바로 Claude에게 붙여넣을 수 있습니다']),
 ('ui.rv2-count', '{x}/{n} new cards, {y}/{m} carried cards', ['{x}/{n} cartes nouvelles, {y}/{m} cartes reportées', '{x}/{n} neue Karten, {y}/{m} übernommene Karten', '{x}/{n} cartas nuevas, {y}/{m} cartas heredadas', '{x}/{n} carte nuove, {y}/{m} carte riportate', '{x}/{n} cartas novas, {y}/{m} cartas herdadas', '{x}/{n} bagong kard, {y}/{m} dalang kard', '{x}/{n} புதிய அட்டைகள், {y}/{m} எடுத்துச்சென்ற அட்டைகள்', '{x}/{n} kartu baru, {y}/{m} kartu terbawa', '{x}/{n} 张新卡，{y}/{m} 张沿用卡', '{x}/{n} 張新卡，{y}/{m} 張沿用卡', '新カード {x}/{n}、持ち越しカード {y}/{m}', '새 카드 {x}/{n}, 이월 카드 {y}/{m}']),
 ('ui.rv2-count-new', '{x}/{n} new cards', ['{x}/{n} cartes nouvelles', '{x}/{n} neue Karten', '{x}/{n} cartas nuevas', '{x}/{n} carte nuove', '{x}/{n} cartas novas', '{x}/{n} bagong kard', '{x}/{n} புதிய அட்டைகள்', '{x}/{n} kartu baru', '{x}/{n} 张新卡', '{x}/{n} 張新卡', '新カード {x}/{n}', '새 카드 {x}/{n}']),
 ('ui.rv2-count-free', '{x} new cards, {y} carried cards', ['{x} cartes nouvelles, {y} cartes reportées', '{x} neue Karten, {y} übernommene Karten', '{x} cartas nuevas, {y} cartas heredadas', '{x} carte nuove, {y} carte riportate', '{x} cartas novas, {y} cartas herdadas', '{x} bagong kard, {y} dalang kard', '{x} புதிய அட்டைகள், {y} எடுத்துச்சென்ற அட்டைகள்', '{x} kartu baru, {y} kartu terbawa', '{x} 张新卡，{y} 张沿用卡', '{x} 張新卡，{y} 張沿用卡', '新カード {x}、持ち越しカード {y}', '새 카드 {x}, 이월 카드 {y}']),
 ('ui.rv2-ambush-fixed', "The Ambush lies in the middle of its road: it can't be moved or linked.", ["L'embuscade se trouve au milieu de sa route : on ne peut ni la déplacer ni la relier.", 'Der Hinterhalt liegt mitten auf seiner Straße: Er lässt sich weder verschieben noch verbinden.', 'La emboscada está en medio de su camino: no se puede mover ni enlazar.', "L'imboscata si trova a metà della sua strada: non si può spostare né collegare.", 'A emboscada fica no meio da sua estrada: não pode ser movida nem ligada.', 'Nasa gitna ng daan nito ang Ambush: hindi ito maaaring ilipat o ikabit.', 'பதுங்குத் தாக்குதல் அதன் சாலையின் நடுவில் உள்ளது: நகர்த்தவோ இணைக்கவோ முடியாது.', 'Penyergapan berada di tengah jalannya: tidak bisa dipindah atau ditautkan.', '伏击位于其道路正中：不能移动，也不能连线。', '伏擊位於其道路正中：不能移動，也不能連線。', '待ち伏せは道の真ん中にあります。移動もリンクもできません。', '매복은 길 한가운데에 있습니다. 옮기거나 연결할 수 없습니다.']),
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
        if en in pack: continue
        pack[en] = row[i]
    dump(path, pack)
print('texts: %d new keys; wrote %d packs, %d texts each' % (len(add), len(CODES), len(ROWS)))
