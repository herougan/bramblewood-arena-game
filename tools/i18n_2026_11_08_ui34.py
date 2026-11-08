# 2026-11-08 (package UI34, owner 23:49: counters in the Map cards window).
#   python3 tools/i18n_2026_11_08_ui34.py   add the new keys to bramblewood-texts.js and their rows to lang/<code>.json (keyed by English text,
#                                           order kept, new rows at the end). Safe to run again. Does not run keyify.
import json, re
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
def T(en, fr, de, es, it, pt, tl, ta, id_, zhs, zht, ja, ko):
    return (en, dict(zip(CODES, [fr, de, es, it, pt, tl, ta, id_, zhs, zht, ja, ko])))
NEW = {
 'ui.ui32-sk-counters': T('Counters to this map\'s cards', 'Contres aux cartes de cette carte', 'Konter für die Karten dieser Karte', 'Contras para las cartas de este mapa', 'Contromisure alle carte di questa mappa', 'Contras para as cartas deste mapa', 'Panlaban sa mga baraha ng mapang ito', 'இந்த வரைபடத்தின் அட்டைகளுக்கு எதிர்ப்புகள்', 'Penangkal kartu peta ini', '针对本地图卡牌的克制', '針對本地圖卡牌的剋制', 'このマップのカードへの対策', '이 맵 카드에 대한 대응'),
 'ui.ui34-counter-ctx': T("Counters {n} of this map's cards: {cards}", 'Contre {n} cartes de cette carte : {cards}', 'Kontert {n} Karten dieser Karte: {cards}', 'Contrarresta {n} cartas de este mapa: {cards}', 'Contrasta {n} carte di questa mappa: {cards}', 'Contra {n} cartas deste mapa: {cards}', 'Panlaban sa {n} baraha ng mapang ito: {cards}', 'இந்த வரைபடத்தின் {n} அட்டைகளுக்கு எதிர்ப்பு: {cards}', 'Menangkal {n} kartu peta ini: {cards}', '克制本地图的 {n} 张卡牌：{cards}', '剋制本地圖的 {n} 張卡牌：{cards}', 'このマップの {n} 枚に対策：{cards}', '이 맵 카드 {n}장에 대응: {cards}'),
 'ui.ui34-resist-of': T('{name} resistance', 'Résistance : {name}', '{name}-Resistenz', 'Resistencia a {name}', 'Resistenza: {name}', 'Resistência a {name}', 'Resistance sa {name}', '{name} எதிர்ப்பு', 'Tahan {name}', '{name}抗性', '{name}抗性', '{name}耐性', '{name} 저항'),
 'ui.ui34-resist-text': T('A Resist or Immune {name} entry in the card editor (Resistance boxes). Resist softens it (half damage a round, or 50 points off its chance to land); Immune never lets it land.', "Une entrée Résistance ou Immunité : {name} dans l'éditeur de carte (cases Résistance). Résistance l'atténue (moitié des dégâts par tour, ou 50 points de moins de chances) ; Immunité l'empêche toujours.", 'Ein Resistenz- oder Immun-Eintrag {name} im Karteneditor (Resistenz-Felder). Resistenz mildert ihn (halber Schaden pro Runde oder 50 Punkte weniger Trefferchance); Immun lässt ihn nie wirken.', 'Una entrada de Resistencia o Inmunidad a {name} en el editor de cartas (casillas de Resistencia). Resistencia lo suaviza (mitad de daño por turno, o 50 puntos menos de probabilidad); Inmune nunca deja que se aplique.', 'Una voce Resistenza o Immunità: {name} nell\'editor delle carte (caselle Resistenza). Resistenza lo attenua (metà danni per turno, o 50 punti in meno di probabilità); Immune non lo lascia mai attecchire.', 'Uma entrada de Resistência ou Imunidade a {name} no editor de cartas (caixas de Resistência). Resistência o suaviza (metade do dano por rodada, ou 50 pontos a menos de chance); Imune nunca deixa pegar.', 'Isang Resist o Immune na {name} sa card editor (mga kahon ng Resistance). Pinapahina ito ng Resist (kalahating pinsala bawat tik, o bawas 50 puntos sa tsansa); hindi ito kailanman tatama sa Immune.', 'அட்டை எடிட்டரில் (எதிர்ப்புப் பெட்டிகள்) {name} க்கான எதிர்ப்பு அல்லது தடுப்பு பதிவு. எதிர்ப்பு அதைக் குறைக்கும் (சுற்றுக்குப் பாதிச் சேதம், அல்லது வாய்ப்பில் 50 புள்ளி குறைவு); தடுப்பு அதை ஒருபோதும் படியவிடாது.', 'Entri Tahan atau Kebal {name} di editor kartu (kotak Resistensi). Tahan melemahkannya (separuh kerusakan per ronde, atau peluang kena turun 50 poin); Kebal tidak pernah membiarkannya kena.', '卡牌编辑器（抗性栏）里的“{name}”抗性或免疫条目。抗性削弱它（每回合伤害减半，或命中几率降低50点）；免疫则永不生效。', '卡牌編輯器（抗性欄）裡的「{name}」抗性或免疫條目。抗性削弱它（每回合傷害減半，或命中機率降低50點）；免疫則永不生效。', 'カードエディタ（耐性欄）の「{name}」耐性／無効の項目。耐性は効果を弱め（毎ラウンドのダメージ半減、または付与率-50ポイント）、無効は決してかからない。', '카드 편집기(저항 칸)의 {name} 저항 또는 면역 항목. 저항은 효과를 약화하고(라운드당 피해 절반, 또는 적용 확률 50포인트 감소) 면역은 절대 걸리지 않습니다.'),
 'ui.ui34-resist-why': T('A {name} Resist or Immune entry softens or stops it.', 'Une entrée Résistance ou Immunité : {name} l\'atténue ou l\'arrête.', 'Ein Resistenz- oder Immun-Eintrag {name} mildert oder stoppt es.', 'Una entrada de Resistencia o Inmunidad a {name} lo suaviza o lo detiene.', 'Una voce Resistenza o Immunità: {name} lo attenua o lo ferma.', 'Uma entrada de Resistência ou Imunidade a {name} o suaviza ou o impede.', 'Pinapahina o hinihinto ito ng Resist o Immune na {name}.', '{name} க்கான எதிர்ப்பு அல்லது தடுப்புப் பதிவு அதைக் குறைக்கும் அல்லது நிறுத்தும்.', 'Entri Tahan atau Kebal {name} melemahkan atau menghentikannya.', '“{name}”抗性或免疫条目可削弱或阻止它。', '「{name}」抗性或免疫條目可削弱或阻止它。', '「{name}」耐性／無効の項目で弱める、または防げる。', '{name} 저항 또는 면역 항목이 이를 약화하거나 막습니다.'),
 'ui.ui34-unsure': T('unsure', 'incertain', 'unsicher', 'dudoso', 'incerto', 'incerto', 'hindi tiyak', 'உறுதியில்லை', 'belum pasti', '未确定', '未確定', '未確認', '불확실'),
 'ui.ui34-cn-tip': T("Answers {n} of this map's cards", 'Répond à {n} cartes de cette carte', 'Antwortet auf {n} Karten dieser Karte', 'Responde a {n} cartas de este mapa', 'Risponde a {n} carte di questa mappa', 'Responde a {n} cartas deste mapa', 'Sumasagot sa {n} baraha ng mapang ito', 'இந்த வரைபடத்தின் {n} அட்டைகளுக்குப் பதில்', 'Menjawab {n} kartu peta ini', '针对本地图的 {n} 张卡牌', '針對本地圖的 {n} 張卡牌', 'このマップの {n} 枚に対応', '이 맵 카드 {n}장에 대응'),
 'ui.ui34-pick-tip': T("Claude's pick {card} carries it (theme: {theme})", '{card}, choix de Claude, l\'a (thème : {theme})', '{card}, Claudes Wahl, hat es (Thema: {theme})', '{card}, elección de Claude, lo tiene (tema: {theme})', '{card}, scelta di Claude, ce l\'ha (tema: {theme})', '{card}, escolha do Claude, tem essa (tema: {theme})', 'Taglay ito ng {card}, pinili ni Claude (tema: {theme})', 'Claude தேர்ந்த {card} இதைக் கொண்டுள்ளது (கருப்பொருள்: {theme})', '{card}, pilihan Claude, memilikinya (tema: {theme})', 'Claude 推荐的 {card} 带有它（主题：{theme}）', 'Claude 推薦的 {card} 帶有它（主題：{theme}）', 'Claude のおすすめ {card} が持つ（テーマ：{theme}）', 'Claude 추천 {card}에 있음 (테마: {theme})'),
}
LEAD = re.compile(r'^[\s \U0001F000-\U0001FAFF☀-➿️‍]+')
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
