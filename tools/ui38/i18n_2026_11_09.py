# 2026-11-09 (package UI38, owner 03:55: the Map cards window's bigger Prospects pool: fit pills, proposed concepts).
#   python3 tools/ui38/i18n_2026_11_09.py   add the new keys to bramblewood-texts.js and their rows to lang/<code>.json (keyed by English text,
#                                           order kept, new rows at the end). Safe to run again. Does not run keyify.
import json, re, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
def T(en, *tr):
    assert len(tr) == 12, en
    return (en, dict(zip(CODES, tr)))
NEW = {
 'ui.ui38-sub': T("A bigger pool for this map. NEW!: its list, cards that fit the map that no earlier main map gives, then proposed new cards (no stats or skills yet). Carried: cards from earlier main maps, best fit first. Flag each Yes or No; a Yes on an earlier map makes a card Carried here. Side maps come later.",
   "Un plus grand choix pour cette carte. NOUVEAU ! : sa liste, les cartes qui vont avec la carte et qu'aucune carte principale précédente ne donne, puis des nouvelles cartes proposées (sans stats ni compétences pour l'instant). Reportées : les cartes des cartes principales précédentes, les mieux adaptées d'abord. Marque chacune Oui ou Non ; un Oui sur une carte précédente la rend Reportée ici. Les cartes annexes viendront plus tard.",
   "Eine größere Auswahl für diese Karte. NEU!: ihre Liste, passende Karten, die keine frühere Hauptkarte gibt, dann vorgeschlagene neue Karten (noch ohne Werte und Fähigkeiten). Übernommen: Karten früherer Hauptkarten, die passendsten zuerst. Markiere jede mit Ja oder Nein; ein Ja auf einer früheren Karte macht sie hier zu Übernommen. Nebenkarten kommen später.",
   "Un grupo más grande para este mapa. ¡NUEVA!: su lista, cartas que encajan en el mapa y que ningún mapa principal anterior da, y luego cartas nuevas propuestas (aún sin estadísticas ni habilidades). Arrastradas: cartas de mapas principales anteriores, las que mejor encajan primero. Marca cada una Sí o No; un Sí en un mapa anterior la vuelve Arrastrada aquí. Los mapas secundarios vendrán después.",
   "Una scelta più ampia per questa mappa. NUOVA!: la sua lista, le carte adatte alla mappa che nessuna mappa principale precedente dà, poi nuove carte proposte (ancora senza statistiche né abilità). Portate: carte delle mappe principali precedenti, le più adatte per prime. Segna ciascuna Sì o No; un Sì su una mappa precedente la rende Portata qui. Le mappe secondarie verranno dopo.",
   "Um grupo maior para este mapa. NOVA!: a lista dele, cartas que combinam com o mapa e que nenhum mapa principal anterior dá, depois novas cartas propostas (ainda sem atributos nem habilidades). Trazidas: cartas de mapas principais anteriores, as que mais combinam primeiro. Marque cada uma Sim ou Não; um Sim num mapa anterior a torna Trazida aqui. Os mapas secundários vêm depois.",
   "Mas malaking pagpipilian para sa mapang ito. BAGO!: ang listahan nito, mga card na bagay sa mapa na walang naunang pangunahing mapa na nagbibigay, saka mga mungkahing bagong card (wala pang stats o skill). Dala: mga card mula sa mga naunang pangunahing mapa, ang pinakabagay muna. Markahan ng Oo o Hindi; ang Oo sa naunang mapa ay ginagawa itong Dala rito. Susunod ang mga side map.",
   "இந்த வரைபடத்துக்கான பெரிய தொகுப்பு. புதியது!: அதன் பட்டியல், முந்தைய முதன்மை வரைபடம் எதுவும் தராத பொருந்தும் அட்டைகள், பிறகு முன்மொழியப்பட்ட புதிய அட்டைகள் (இன்னும் புள்ளிவிவரங்களோ திறன்களோ இல்லை). கொண்டுவரப்பட்டவை: முந்தைய முதன்மை வரைபடங்களின் அட்டைகள், மிகப் பொருந்தியவை முதலில். ஒவ்வொன்றையும் ஆம் அல்லது இல்லை எனக் குறிக்கவும்; முந்தைய வரைபடத்தில் ஆம் என்றால் இங்கே கொண்டுவரப்பட்டது. பக்க வரைபடங்கள் பின்னர் வரும்.",
   "Pilihan yang lebih besar untuk peta ini. BARU!: daftarnya, kartu yang cocok dengan peta dan tidak diberikan peta utama sebelumnya, lalu kartu baru yang diusulkan (belum ada statistik atau skill). Terbawa: kartu dari peta utama sebelumnya, yang paling cocok dulu. Tandai Ya atau Tidak; Ya di peta sebelumnya membuatnya Terbawa di sini. Peta samping menyusul.",
   "此地图的更大候选池。新！：地图列表、符合地图且之前的主地图都不给的卡牌，然后是提议的新卡（暂无数值和技能）。沿用：之前主地图的卡牌，最契合的在前。逐一标记“是”或“否”；在之前的地图标记“是”会让它在这里成为“沿用”。支线地图以后再做。",
   "此地圖的更大候選池。新！：地圖列表、符合地圖且之前的主地圖都不給的卡牌，然後是提議的新卡（暫無數值和技能）。沿用：之前主地圖的卡牌，最契合的在前。逐一標記「是」或「否」；在之前的地圖標記「是」會讓它在這裡成為「沿用」。支線地圖以後再做。",
   "このマップの大きめの候補。NEW!：マップのリスト、以前のメインマップで手に入らないマップに合うカード、そして提案中の新カード（ステータスやスキルはまだなし）。持ち越し：以前のメインマップのカード、合うものから順に。それぞれ「はい」か「いいえ」を付けます。以前のマップで「はい」にしたカードはここでは持ち越しです。サイドマップは後で。",
   "이 맵의 더 큰 후보 풀. NEW!: 맵 목록, 이전 메인 맵에서 얻을 수 없는 맵에 맞는 카드, 그다음 제안된 새 카드(아직 능력치와 스킬 없음). 이월: 이전 메인 맵의 카드, 잘 맞는 순서. 각각 예 또는 아니오로 표시하세요. 이전 맵에서 예로 표시한 카드는 여기서 이월이 됩니다. 사이드 맵은 나중에."),
 'ui.ui38-min': T('at least {n}', 'au moins {n}', 'mindestens {n}', 'al menos {n}', 'almeno {n}', 'pelo menos {n}', 'hindi bababa sa {n}', 'குறைந்தது {n}', 'paling sedikit {n}', '至少 {n}', '至少 {n}', '{n} 以上', '최소 {n}'),
 'ui.ui38-src-fit': T('Fits the map', 'Va avec la carte', 'Passt zur Karte', 'Encaja en el mapa', 'Adatta alla mappa', 'Combina com o mapa', 'Bagay sa mapa', 'வரைபடத்துக்குப் பொருந்தும்', 'Cocok dengan peta', '契合地图', '契合地圖', 'マップに合う', '맵에 맞음'),
 'ui.ui38-src-concept': T('Proposed', 'Proposée', 'Vorgeschlagen', 'Propuesta', 'Proposta', 'Proposta', 'Mungkahi', 'முன்மொழிவு', 'Usulan', '提议', '提議', '提案', '제안'),
 'ui.ui38-concept-tip': T('Proposed new card: {animal}, {element}, suggested {rarity}.', 'Nouvelle carte proposée : {animal}, {element}, rareté suggérée {rarity}.', 'Vorgeschlagene neue Karte: {animal}, {element}, vorgeschlagene Seltenheit {rarity}.', 'Carta nueva propuesta: {animal}, {element}, rareza sugerida {rarity}.', 'Nuova carta proposta: {animal}, {element}, rarità suggerita {rarity}.', 'Nova carta proposta: {animal}, {element}, raridade sugerida {rarity}.', 'Mungkahing bagong card: {animal}, {element}, mungkahing rarity {rarity}.', 'முன்மொழியப்பட்ட புதிய அட்டை: {animal}, {element}, பரிந்துரைக்கப்பட்ட அரிதுநிலை {rarity}.', 'Kartu baru usulan: {animal}, {element}, kelangkaan saran {rarity}.', '提议的新卡：{animal}，{element}，建议稀有度 {rarity}。', '提議的新卡：{animal}，{element}，建議稀有度 {rarity}。', '提案中の新カード：{animal}、{element}、推奨レアリティ {rarity}。', '제안된 새 카드: {animal}, {element}, 추천 희귀도 {rarity}.'),
 'ui.ui38-why-b': T("The map's habitat", 'Habitat de la carte', 'Lebensraum der Karte', 'Hábitat del mapa', 'Habitat della mappa', 'Habitat do mapa', 'Tirahan ng mapa', 'வரைபடத்தின் வாழிடம்', 'Habitat peta', '地图的栖息地', '地圖的棲息地', 'マップの生息地', '맵의 서식지'),
 'ui.ui38-why-k': T('A nearby habitat', 'Un habitat voisin', 'Ein benachbarter Lebensraum', 'Un hábitat cercano', 'Un habitat vicino', 'Um habitat vizinho', 'Kalapit na tirahan', 'அருகிலுள்ள வாழிடம்', 'Habitat terdekat', '相邻的栖息地', '相鄰的棲息地', '近い生息地', '인접한 서식지'),
 'ui.ui38-why-c': T('CONTENT17 pick', 'Choix CONTENT17', 'CONTENT17-Vorschlag', 'Elección CONTENT17', 'Scelta CONTENT17', 'Escolha CONTENT17', 'Pili ng CONTENT17', 'CONTENT17 தேர்வு', 'Pilihan CONTENT17', 'CONTENT17 推荐', 'CONTENT17 推薦', 'CONTENT17 のおすすめ', 'CONTENT17 추천'),
 'ui.ui38-why-t': T('THEME5 pick', 'Choix THEME5', 'THEME5-Vorschlag', 'Elección THEME5', 'Scelta THEME5', 'Escolha THEME5', 'Pili ng THEME5', 'THEME5 தேர்வு', 'Pilihan THEME5', 'THEME5 推荐', 'THEME5 推薦', 'THEME5 のおすすめ', 'THEME5 추천'),
 'ui.ui38-why-s': T('SKILLREC1 pick', 'Choix SKILLREC1', 'SKILLREC1-Vorschlag', 'Elección SKILLREC1', 'Scelta SKILLREC1', 'Escolha SKILLREC1', 'Pili ng SKILLREC1', 'SKILLREC1 தேர்வு', 'Pilihan SKILLREC1', 'SKILLREC1 推荐', 'SKILLREC1 推薦', 'SKILLREC1 のおすすめ', 'SKILLREC1 추천'),
 'ui.ui38-why-g': T("Has the map's signature skill", 'A la compétence phare de la carte', 'Hat die Leitfähigkeit der Karte', 'Tiene la habilidad insignia del mapa', "Ha l'abilità simbolo della mappa", 'Tem a habilidade marcante do mapa', 'May tatak na skill ng mapa', 'வரைபடத்தின் முத்திரைத் திறன் உள்ளது', 'Punya skill khas peta', '有地图的标志技能', '有地圖的標誌技能', 'マップの代表スキルを持つ', '맵의 대표 스킬 보유'),
 'ui.ui38-why-e': T("The map's element", 'Élément de la carte', 'Element der Karte', 'Elemento del mapa', 'Elemento della mappa', 'Elemento do mapa', 'Elemento ng mapa', 'வரைபடத்தின் தனிமம்', 'Elemen peta', '地图的元素', '地圖的元素', 'マップの属性', '맵의 속성'),
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
