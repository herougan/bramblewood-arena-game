# 2026-11-11 (package UI47): new TX keys + rows in lang/<code>.json (keyed by English text). Run from the repo root. Safe to run again.
import json, re
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
def T(en, *tr):
    assert len(tr) == 12, en
    return (en, dict(zip(CODES, tr)))
NEW = {
 'ui.ui47-suggested': T('Suggested', 'Suggérée', 'Vorgeschlagen', 'Sugerida', 'Suggerita', 'Sugerida', 'Iminumungkahi', 'பரிந்துரை', 'Disarankan', '推荐', '推薦', 'おすすめ', '추천'),
 'ui.ui47-from-tip': T('Flagged Yes on Map {n}', 'Marquée Oui sur la carte {n}', 'Auf Karte {n} mit Ja markiert', 'Marcada Sí en el mapa {n}', 'Segnata Sì sulla mappa {n}', 'Marcada Sim no mapa {n}', 'Minarkahang Oo sa Mapa {n}', 'வரைபடம் {n}-இல் ஆம் எனக் குறிக்கப்பட்டது', 'Ditandai Ya di Peta {n}', '在地图 {n} 标记为“是”', '在地圖 {n} 標記為「是」', 'マップ {n} で「はい」に設定', '맵 {n}에서 예로 표시됨'),
 'ui.ui47-from-tut-tip': T('Given by the tutorial maps (T-1, T-2)', 'Donnée par les cartes du tutoriel (T-1, T-2)', 'Von den Tutorial-Karten gegeben (T-1, T-2)', 'La dan los mapas del tutorial (T-1, T-2)', 'La danno le mappe del tutorial (T-1, T-2)', 'Dada pelos mapas do tutorial (T-1, T-2)', 'Ibinibigay ng mga mapa ng tutorial (T-1, T-2)', 'பயிற்சி வரைபடங்கள் (T-1, T-2) தருகின்றன', 'Diberikan oleh peta tutorial (T-1, T-2)', '由教程地图（T-1、T-2）提供', '由教學地圖（T-1、T-2）提供', 'チュートリアルマップ（T-1、T-2）が与える', '튜토리얼 맵(T-1, T-2)이 주는 카드'),
 'ui.ui47-add': T('Add card', 'Ajouter une carte', 'Karte hinzufügen', 'Añadir carta', 'Aggiungi carta', 'Adicionar carta', 'Magdagdag ng card', 'அட்டை சேர்', 'Tambah kartu', '添加卡牌', '新增卡牌', 'カードを追加', '카드 추가'),
 'ui.ui47-add-ph': T('Search a card by name', 'Chercher une carte par nom', 'Karte nach Namen suchen', 'Buscar una carta por nombre', 'Cerca una carta per nome', 'Procurar uma carta pelo nome', 'Maghanap ng card ayon sa pangalan', 'பெயரால் அட்டையைத் தேடு', 'Cari kartu berdasarkan nama', '按名称搜索卡牌', '依名稱搜尋卡牌', '名前でカードを検索', '이름으로 카드 검색'),
 'ui.ui47-add-none': T('No card matches.', 'Aucune carte ne correspond.', 'Keine Karte passt.', 'Ninguna carta coincide.', 'Nessuna carta corrisponde.', 'Nenhuma carta corresponde.', 'Walang tumutugmang card.', 'பொருந்தும் அட்டை இல்லை.', 'Tidak ada kartu yang cocok.', '没有匹配的卡牌。', '沒有符合的卡牌。', '一致するカードはありません。', '일치하는 카드가 없습니다.'),
 'ui.ui47-add-yes': T('already Yes here', 'déjà Oui ici', 'hier schon Ja', 'ya es Sí aquí', 'già Sì qui', 'já é Sim aqui', 'Oo na rito', 'இங்கே ஏற்கனவே ஆம்', 'sudah Ya di sini', '此处已是“是”', '此處已是「是」', 'ここでは既に「はい」', '여기서 이미 예'),
 'ui.ui47-added': T('Added {name} to {group}.', '{name} ajoutée à {group}.', '{name} zu {group} hinzugefügt.', '{name} añadida a {group}.', '{name} aggiunta a {group}.', '{name} adicionada a {group}.', 'Naidagdag ang {name} sa {group}.', '{name} {group}-இல் சேர்க்கப்பட்டது.', '{name} ditambahkan ke {group}.', '已将 {name} 加入 {group}。', '已將 {name} 加入 {group}。', '{name} を {group} に追加しました。', '{name}을(를) {group}에 추가했습니다.'),
 'ui.ui47-baby-note': T('Baby cards are not counted.', 'Les cartes bébé ne comptent pas.', 'Baby-Karten zählen nicht mit.', 'Las cartas bebé no cuentan.', 'Le carte cucciolo non contano.', 'As cartas bebê não contam.', 'Hindi binibilang ang mga baby card.', 'குட்டி அட்டைகள் கணக்கில் வராது.', 'Kartu bayi tidak dihitung.', '幼崽卡牌不计入。', '幼崽卡牌不計入。', 'ベビーカードは数えません。', '새끼 카드는 세지 않습니다.'),
 'ui.ui47-used-tip': T('Used on {n} main maps: {maps}', 'Utilisée sur {n} cartes principales : {maps}', 'Auf {n} Hauptkarten verwendet: {maps}', 'Usada en {n} mapas principales: {maps}', 'Usata su {n} mappe principali: {maps}', 'Usada em {n} mapas principais: {maps}', 'Ginagamit sa {n} pangunahing mapa: {maps}', '{n} முக்கிய வரைபடங்களில் பயன்பாடு: {maps}', 'Dipakai di {n} peta utama: {maps}', '用于 {n} 张主地图：{maps}', '用於 {n} 張主地圖：{maps}', '{n} 個のメインマップで使用: {maps}', '메인 맵 {n}곳에서 사용: {maps}'),
 'ui.ui47-admin-added': T('Added by Claude', 'Ajoutée par Claude', 'Von Claude hinzugefügt', 'Añadida por Claude', 'Aggiunta da Claude', 'Adicionada pelo Claude', 'Idinagdag ni Claude', 'Claude சேர்த்தது', 'Ditambahkan oleh Claude', 'Claude 添加', 'Claude 追加', 'Claude が追加', 'Claude가 추가함'),
}
LEAD = re.compile(r'^[\s \U0001F000-\U0001FAFF☀-➿️‍]+')
def core(t): return LEAD.sub('', t.strip())
TX_LINE = re.compile(r'^(\s*)"([^"]+)":\s*"((?:[^"\\]|\\.)*)"(,?)\s*$')
def jdump(s): return json.dumps(s, ensure_ascii=False)[1:-1]
path = 'bramblewood-texts.js'; L = open(path, encoding='utf-8').read().split('\n')
end = next(i for i, l in enumerate(L) if l.startswith('}/*TEXT-TABLE-END*/'))
have = set(TX_LINE.match(l).group(2) for l in L if TX_LINE.match(l))
add = [k for k in NEW if k not in have]
if add:
    if not L[end - 1].rstrip().endswith(','): L[end - 1] = L[end - 1].rstrip() + ','
    L[end:end] = ['  "%s": "%s"%s' % (k, jdump(NEW[k][0]), ',' if j < len(add) - 1 else '') for j, k in enumerate(add)]
open(path, 'w', encoding='utf-8').write('\n'.join(L))
for code in CODES:
    p = 'lang/%s.json' % code; d = json.load(open(p, encoding='utf-8'))
    for k in NEW:
        en, tr = core(NEW[k][0]), core(NEW[k][1][code])
        if en not in d: d[en] = tr
    open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('texts: %d keys added' % len(add))
