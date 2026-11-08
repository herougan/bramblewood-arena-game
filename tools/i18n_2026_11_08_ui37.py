# 2026-11-08 (package UI37, owner 17:22 #1-#4: the Map cards window's Prospects view, Yes / No flags, NEW! / Carried counters).
#   python3 tools/i18n_2026_11_08_ui37.py   add the new keys to bramblewood-texts.js and their rows to lang/<code>.json (keyed by English text,
#                                           order kept, new rows at the end). Safe to run again. Does not run keyify.
import json, re
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
def T(en, *tr):
    assert len(tr) == 12, en
    return (en, dict(zip(CODES, tr)))
NEW = {
 'ui.ui37-view-lists': T('Lists', 'Listes', 'Listen', 'Listas', 'Liste', 'Listas', 'Mga listahan', 'பட்டியல்கள்', 'Daftar', '列表', '列表', 'リスト', '목록'),
 'ui.ui37-view-pros': T('Prospects', 'Candidates', 'Kandidaten', 'Candidatas', 'Candidate', 'Candidatas', 'Mga kandidato', 'வேட்பாளர்கள்', 'Kandidat', '候选卡', '候選卡', '候補', '후보'),
 'ui.ui37-sub': T("Every card that could fit this map: its list, Claude's picks and your picks. Flag each Yes or No. NEW! means no earlier main map gives it; a Yes on an earlier map makes a card Carried here. Side-map cards are not shown.",
   "Toutes les cartes qui pourraient aller sur cette carte : sa liste, les choix de Claude et les tiens. Marque chacune Oui ou Non. NOUVEAU ! signifie qu'aucune carte principale précédente ne la donne ; un Oui sur une carte précédente la rend Reportée ici. Les cartes des cartes annexes ne sont pas montrées.",
   'Jede Karte, die zu dieser Karte passen könnte: ihre Liste, Claudes Vorschläge und deine Wahl. Markiere jede mit Ja oder Nein. NEU! heißt: keine frühere Hauptkarte gibt sie; ein Ja auf einer früheren Karte macht sie hier zu Übernommen. Karten von Nebenkarten werden nicht gezeigt.',
   'Todas las cartas que podrían encajar en este mapa: su lista, las elecciones de Claude y las tuyas. Marca cada una Sí o No. ¡NUEVA! significa que ningún mapa principal anterior la da; un Sí en un mapa anterior la vuelve Arrastrada aquí. No se muestran las cartas de mapas secundarios.',
   "Ogni carta che potrebbe andare su questa mappa: la sua lista, le scelte di Claude e le tue. Segna ciascuna Sì o No. NUOVA! significa che nessuna mappa principale precedente la dà; un Sì su una mappa precedente la rende Portata qui. Le carte delle mappe secondarie non sono mostrate.",
   'Todas as cartas que poderiam caber neste mapa: a lista dele, as escolhas do Claude e as suas. Marque cada uma Sim ou Não. NOVA! significa que nenhum mapa principal anterior a dá; um Sim num mapa anterior a torna Trazida aqui. Cartas de mapas secundários não aparecem.',
   'Bawat card na puwedeng bagay sa mapang ito: ang listahan nito, ang mga pili ni Claude at ang mga pili mo. Markahan ng Oo o Hindi. Ang BAGO! ay walang naunang pangunahing mapa na nagbibigay nito; ang Oo sa naunang mapa ay ginagawa itong Dala rito. Hindi ipinapakita ang mga card ng side map.',
   'இந்த வரைபடத்துக்குப் பொருந்தக்கூடிய ஒவ்வொரு அட்டையும்: அதன் பட்டியல், Claude-இன் தேர்வுகள், உங்கள் தேர்வுகள். ஒவ்வொன்றையும் ஆம் அல்லது இல்லை எனக் குறிக்கவும். புதியது! என்றால் முந்தைய முதன்மை வரைபடம் எதுவும் அதைத் தரவில்லை; முந்தைய வரைபடத்தில் ஆம் என்றால் இங்கே அது கொண்டுவரப்பட்டது. பக்க வரைபட அட்டைகள் காட்டப்படாது.',
   'Setiap kartu yang bisa cocok untuk peta ini: daftarnya, pilihan Claude, dan pilihanmu. Tandai Ya atau Tidak. BARU! berarti tidak ada peta utama sebelumnya yang memberinya; Ya di peta sebelumnya membuatnya Terbawa di sini. Kartu peta samping tidak ditampilkan.',
   '所有可能适合此地图的卡牌：它的列表、Claude 的推荐和你的选择。逐一标记“是”或“否”。新！表示之前的主地图都不给这张卡；在之前的地图标记“是”会让它在这里成为“沿用”。不显示支线地图的卡牌。',
   '所有可能適合此地圖的卡牌：它的列表、Claude 的推薦和你的選擇。逐一標記「是」或「否」。新！表示之前的主地圖都不給這張卡；在之前的地圖標記「是」會讓它在這裡成為「沿用」。不顯示支線地圖的卡牌。',
   'このマップに合いそうな全カード：マップのリスト、Claude のおすすめ、あなたの選択。それぞれ「はい」か「いいえ」を付けます。NEW! は以前のメインマップで手に入らないカード。以前のマップで「はい」にしたカードはここでは持ち越しになります。サイドマップのカードは出ません。',
   '이 맵에 어울릴 수 있는 모든 카드: 맵 목록, Claude의 추천, 당신의 선택. 각각 예 또는 아니오로 표시하세요. NEW!는 이전 메인 맵에서 얻을 수 없는 카드입니다. 이전 맵에서 예로 표시한 카드는 여기서 이월이 됩니다. 사이드 맵 카드는 표시되지 않습니다.'),
 'ui.ui37-new': T('NEW!', 'NOUVEAU !', 'NEU!', '¡NUEVA!', 'NUOVA!', 'NOVA!', 'BAGO!', 'புதியது!', 'BARU!', '新！', '新！', 'NEW!', 'NEW!'),
 'ui.ui37-carried': T('Carried', 'Reportées', 'Übernommen', 'Arrastradas', 'Portate', 'Trazidas', 'Dala', 'கொண்டுவரப்பட்டவை', 'Terbawa', '沿用', '沿用', '持ち越し', '이월'),
 'ui.ui37-flagged-new': T('NEW! flagged', 'NOUVEAU ! marquées', 'NEU! markiert', '¡NUEVA! marcadas', 'NUOVA! segnate', 'NOVA! marcadas', 'BAGO! na may marka', 'புதியது! குறித்தவை', 'BARU! ditandai', '新！已标记', '新！已標記', 'NEW! 選択', 'NEW! 표시'),
 'ui.ui37-flagged-carried': T('Carried flagged', 'Reportées marquées', 'Übernommen markiert', 'Arrastradas marcadas', 'Portate segnate', 'Trazidas marcadas', 'Dala na may marka', 'கொண்டுவரப்பட்டவை குறித்தவை', 'Terbawa ditandai', '沿用已标记', '沿用已標記', '持ち越し 選択', '이월 표시'),
 'ui.ui37-target-tip': T('Target for Map {n}: {t} (decision THEME6-1). Change it for this map; clear it to go back.', 'Objectif pour la carte {n} : {t} (décision THEME6-1). Modifie-le pour cette carte ; vide-le pour revenir.', 'Ziel für Karte {n}: {t} (Entscheidung THEME6-1). Für diese Karte ändern; leeren setzt zurück.', 'Objetivo del mapa {n}: {t} (decisión THEME6-1). Cámbialo para este mapa; bórralo para volver.', 'Obiettivo per la mappa {n}: {t} (decisione THEME6-1). Cambialo per questa mappa; svuotalo per tornare.', 'Meta do mapa {n}: {t} (decisão THEME6-1). Mude-a para este mapa; apague para voltar.', 'Target para sa Mapa {n}: {t} (desisyon THEME6-1). Palitan para sa mapang ito; burahin para bumalik.', 'வரைபடம் {n}-க்கான இலக்கு: {t} (முடிவு THEME6-1). இந்த வரைபடத்துக்கு மாற்றவும்; அழித்தால் பழையது.', 'Target Peta {n}: {t} (keputusan THEME6-1). Ubah untuk peta ini; kosongkan untuk kembali.', '地图 {n} 的目标：{t}（决定 THEME6-1）。可为此地图修改；清空则恢复。', '地圖 {n} 的目標：{t}（決定 THEME6-1）。可為此地圖修改；清空則恢復。', 'マップ {n} の目標：{t}（決定 THEME6-1）。このマップ用に変更可。空にすると戻ります。', '맵 {n} 목표: {t} (결정 THEME6-1). 이 맵에서 바꿀 수 있고, 지우면 되돌아갑니다.'),
 'ui.ui37-yes': T('Yes', 'Oui', 'Ja', 'Sí', 'Sì', 'Sim', 'Oo', 'ஆம்', 'Ya', '是', '是', 'はい', '예'),
 'ui.ui37-no': T('No', 'Non', 'Nein', 'No', 'No', 'Não', 'Hindi', 'இல்லை', 'Tidak', '否', '否', 'いいえ', '아니오'),
 'ui.ui37-flag-label': T('Flag {name}', 'Marquer {name}', '{name} markieren', 'Marcar {name}', 'Segna {name}', 'Marcar {name}', 'Markahan ang {name}', '{name} குறி', 'Tandai {name}', '标记 {name}', '標記 {name}', '{name} を選択', '{name} 표시'),
 'ui.ui37-src-list': T('On list', 'Sur la liste', 'Auf der Liste', 'En la lista', 'In lista', 'Na lista', 'Nasa listahan', 'பட்டியலில்', 'Di daftar', '在列表中', '在列表中', 'リスト内', '목록에 있음'),
 'ui.ui37-src-maybe': T('Maybe', 'Peut-être', 'Vielleicht', 'Quizá', 'Forse', 'Talvez', 'Siguro', 'இருக்கலாம்', 'Mungkin', '待定', '待定', '保留', '보류'),
 'ui.ui37-src-claude': T("Claude's pick", 'Choix de Claude', 'Claudes Vorschlag', 'Elección de Claude', 'Scelta di Claude', 'Escolha do Claude', 'Pili ni Claude', 'Claude-இன் தேர்வு', 'Pilihan Claude', 'Claude 推荐', 'Claude 推薦', 'Claude のおすすめ', 'Claude 추천'),
 'ui.ui37-src-newcard': T('New card', 'Nouvelle carte', 'Neue Karte', 'Carta nueva', 'Carta nuova', 'Carta nova', 'Bagong card', 'புதிய அட்டை', 'Kartu baru', '新卡', '新卡', '新カード', '새 카드'),
 'ui.ui37-src-flag': T('Your pick', 'Ton choix', 'Deine Wahl', 'Tu elección', 'Tua scelta', 'Sua escolha', 'Pili mo', 'உங்கள் தேர்வு', 'Pilihanmu', '你的选择', '你的選擇', 'あなたの選択', '내 선택'),
 'ui.ui37-src-earlier': T('Yes earlier', 'Oui avant', 'Früher Ja', 'Sí antes', 'Sì prima', 'Sim antes', 'Oo dati', 'முன்பு ஆம்', 'Ya sebelumnya', '之前选“是”', '之前選「是」', '以前に「はい」', '이전에 예'),
 'ui.ui37-from': T('Map {n}', 'Carte {n}', 'Karte {n}', 'Mapa {n}', 'Mappa {n}', 'Mapa {n}', 'Mapa {n}', 'வரைபடம் {n}', 'Peta {n}', '地图 {n}', '地圖 {n}', 'マップ {n}', '맵 {n}'),
 'ui.ui37-from-tip': T('Available from Map {n}', 'Disponible dès la carte {n}', 'Verfügbar ab Karte {n}', 'Disponible desde el mapa {n}', 'Disponibile dalla mappa {n}', 'Disponível desde o mapa {n}', 'Makukuha mula Mapa {n}', 'வரைபடம் {n} முதல் கிடைக்கும்', 'Tersedia sejak Peta {n}', '自地图 {n} 起可获得', '自地圖 {n} 起可獲得', 'マップ {n} から入手可能', '맵 {n}부터 얻을 수 있음'),
 'ui.ui37-earlier': T('More cards from earlier maps', 'Autres cartes des cartes précédentes', 'Weitere Karten früherer Karten', 'Más cartas de mapas anteriores', 'Altre carte dalle mappe precedenti', 'Mais cartas de mapas anteriores', 'Iba pang card mula sa mga naunang mapa', 'முந்தைய வரைபடங்களின் மேலும் அட்டைகள்', 'Kartu lain dari peta sebelumnya', '之前地图的更多卡牌', '之前地圖的更多卡牌', '以前のマップのほかのカード', '이전 맵의 다른 카드'),
 'ui.ui37-export': T('Export picks', 'Exporter les choix', 'Auswahl exportieren', 'Exportar elecciones', 'Esporta scelte', 'Exportar escolhas', 'I-export ang mga pili', 'தேர்வுகளை ஏற்றுமதி', 'Ekspor pilihan', '导出选择', '匯出選擇', '選択を書き出す', '선택 내보내기'),
 'ui.ui37-export-tip': T("Every map's Yes / No flags as a file.", 'Les Oui / Non de toutes les cartes, en fichier.', 'Die Ja / Nein-Markierungen aller Karten als Datei.', 'Los Sí / No de todos los mapas, en un archivo.', 'I Sì / No di tutte le mappe, in un file.', 'Os Sim / Não de todos os mapas, num arquivo.', 'Ang Oo / Hindi ng bawat mapa bilang file.', 'எல்லா வரைபடங்களின் ஆம் / இல்லை குறிகள் ஒரு கோப்பாக.', 'Tanda Ya / Tidak semua peta sebagai file.', '所有地图的“是/否”标记，导出为文件。', '所有地圖的「是/否」標記，匯出為檔案。', '全マップの「はい / いいえ」をファイルで。', '모든 맵의 예 / 아니오 표시를 파일로.'),
 'ui.ui37-saved-cloud': T('Saved online', 'Enregistré en ligne', 'Online gespeichert', 'Guardado en línea', 'Salvato online', 'Salvo online', 'Naka-save online', 'இணையத்தில் சேமிக்கப்பட்டது', 'Tersimpan daring', '已在线保存', '已線上儲存', 'オンラインに保存', '온라인에 저장됨'),
 'ui.ui37-saved-local': T('Saved in this browser', 'Enregistré dans ce navigateur', 'In diesem Browser gespeichert', 'Guardado en este navegador', 'Salvato in questo browser', 'Salvo neste navegador', 'Naka-save sa browser na ito', 'இந்த உலாவியில் சேமிக்கப்பட்டது', 'Tersimpan di peramban ini', '已保存在此浏览器', '已儲存在此瀏覽器', 'このブラウザに保存', '이 브라우저에 저장됨'),
 'ui.ui37-prev': T('Previous map', 'Carte précédente', 'Vorherige Karte', 'Mapa anterior', 'Mappa precedente', 'Mapa anterior', 'Naunang mapa', 'முந்தைய வரைபடம்', 'Peta sebelumnya', '上一张地图', '上一張地圖', '前のマップ', '이전 맵'),
 'ui.ui37-next': T('Next map', 'Carte suivante', 'Nächste Karte', 'Mapa siguiente', 'Mappa successiva', 'Próximo mapa', 'Susunod na mapa', 'அடுத்த வரைபடம்', 'Peta berikutnya', '下一张地图', '下一張地圖', '次のマップ', '다음 맵'),
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
