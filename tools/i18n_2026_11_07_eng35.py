# 2026-11-07 (package ENG35, owner 21:13: "Hovering over the skill 'cards' on the map cards window shows a tooltip window of what that skill does.
# Include what params it can take"): the hover window's labels.
#   python3 tools/i18n_2026_11_07_eng35.py   add the new keys to bramblewood-texts.js and their rows to lang/<code>.json (keyed by English text,
#                                            order kept, new rows at the end). Safe to run again.
import json, re
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
NEW = {
 'ui.eng35-default': ('Default', {'fr': 'Par défaut', 'de': 'Standard', 'es': 'Por defecto', 'it': 'Predefinito', 'pt': 'Padrão', 'tl': 'Default', 'ta': 'இயல்புநிலை', 'id': 'Bawaan', 'zh-Hans': '默认', 'zh-Hant': '預設', 'ja': '既定', 'ko': '기본값'}),
 'ui.eng35-number': ('Number', {'fr': 'Nombre', 'de': 'Zahl', 'es': 'Número', 'it': 'Numero', 'pt': 'Número', 'tl': 'Numero', 'ta': 'எண்', 'id': 'Angka', 'zh-Hans': '数值', 'zh-Hant': '數值', 'ja': '数値', 'ko': '수치'}),
 'ui.eng35-stat': ('Stat version', {'fr': 'Version stats', 'de': 'Werte-Version', 'es': 'Versión de estadísticas', 'it': 'Versione statistiche', 'pt': 'Versão de atributos', 'tl': 'Bersyong stat', 'ta': 'புள்ளிவிவரப் பதிப்பு', 'id': 'Versi statistik', 'zh-Hans': '属性版', 'zh-Hant': '屬性版', 'ja': 'ステータス版', 'ko': '능력치 버전'}),
 'ui.eng35-ability': ('Ability version', {'fr': 'Version capacités', 'de': 'Fähigkeiten-Version', 'es': 'Versión de habilidades', 'it': 'Versione abilità', 'pt': 'Versão de habilidades', 'tl': 'Bersyong kakayahan', 'ta': 'திறன் பதிப்பு', 'id': 'Versi kemampuan', 'zh-Hans': '技能版', 'zh-Hant': '技能版', 'ja': 'スキル版', 'ko': '스킬 버전'}),
 'ui.eng35-params': ('Parameters', {'fr': 'Paramètres', 'de': 'Parameter', 'es': 'Parámetros', 'it': 'Parametri', 'pt': 'Parâmetros', 'tl': 'Mga parameter', 'ta': 'அளவுருக்கள்', 'id': 'Parameter', 'zh-Hans': '参数', 'zh-Hant': '參數', 'ja': 'パラメータ', 'ko': '매개변수'}),
 'ui.eng35-one-value': ('One value, no parts', {'fr': 'Une seule valeur, sans parties', 'de': 'Ein Wert, keine Teile', 'es': 'Un solo valor, sin partes', 'it': 'Un solo valore, nessuna parte', 'pt': 'Um só valor, sem partes', 'tl': 'Isang halaga, walang bahagi', 'ta': 'ஒரே மதிப்பு, பகுதிகள் இல்லை', 'id': 'Satu nilai, tanpa bagian', 'zh-Hans': '单一数值，无分项', 'zh-Hant': '單一數值，無分項', 'ja': '値は1つ、内訳なし', 'ko': '값 하나, 세부 항목 없음'}),
 'ui.eng35-none': ('none', {'fr': 'aucune', 'de': 'keine', 'es': 'ninguna', 'it': 'nessuna', 'pt': 'nenhuma', 'tl': 'wala', 'ta': 'இல்லை', 'id': 'tidak ada', 'zh-Hans': '无', 'zh-Hant': '無', 'ja': 'なし', 'ko': '없음'}),
 'ui.eng35-delivery': ('Delivery', {'fr': 'Portée', 'de': 'Reichweite', 'es': 'Alcance', 'it': 'Portata', 'pt': 'Alcance', 'tl': 'Abot', 'ta': 'தாக்கு வகை', 'id': 'Jangkauan', 'zh-Hans': '攻击方式', 'zh-Hant': '攻擊方式', 'ja': '攻撃方式', 'ko': '공격 방식'}),
 'ui.eng35-dl-melee': ('Melee', {'fr': 'Mêlée', 'de': 'Nahkampf', 'es': 'Cuerpo a cuerpo', 'it': 'Mischia', 'pt': 'Corpo a corpo', 'tl': 'Malapitan', 'ta': 'நெருக்கத் தாக்குதல்', 'id': 'Jarak dekat', 'zh-Hans': '近战', 'zh-Hant': '近戰', 'ja': '近接', 'ko': '근접'}),
 'ui.eng35-dl-ranged': ('Ranged', {'fr': 'À distance', 'de': 'Fernkampf', 'es': 'A distancia', 'it': 'A distanza', 'pt': 'À distância', 'tl': 'Malayuan', 'ta': 'தொலைவுத் தாக்குதல்', 'id': 'Jarak jauh', 'zh-Hans': '远程', 'zh-Hant': '遠程', 'ja': '遠隔', 'ko': '원거리'}),
 'ui.eng35-dl-none': ('No hit of its own', {'fr': 'Aucun coup propre', 'de': 'Kein eigener Treffer', 'es': 'Sin golpe propio', 'it': 'Nessun colpo proprio', 'pt': 'Sem golpe próprio', 'tl': 'Walang sariling tama', 'ta': 'சொந்த தாக்குதல் இல்லை', 'id': 'Tanpa serangan sendiri', 'zh-Hans': '自身不造成攻击', 'zh-Hant': '自身不造成攻擊', 'ja': '自身の攻撃なし', 'ko': '자체 공격 없음'}),
 'ui.eng35-leech-n': ('Each of its hits that lands heals it {n} (bramble hits too), up to its max Health.', {'fr': 'Chaque coup qui porte le soigne de {n} (coups sur la ronce compris), jusqu’à ses PV max.', 'de': 'Jeder Treffer, der sitzt, heilt es um {n} (auch Treffer auf die Dornenburg), bis zu seiner maximalen Gesundheit.', 'es': 'Cada golpe que acierta lo cura {n} (también los golpes a la zarza), hasta su Salud máxima.', 'it': 'Ogni colpo a segno lo cura di {n} (anche i colpi al rovo), fino alla sua Salute massima.', 'pt': 'Cada golpe que acerta o cura em {n} (golpes na sarça também), até a sua Vida máxima.', 'tl': 'Bawat tamang tama nito ay nagpapagaling dito ng {n} (kasama ang tama sa bramble), hanggang sa max na Buhay nito.', 'ta': 'அதன் ஒவ்வொரு வெற்றித் தாக்குதலும் அதை {n} குணப்படுத்தும் (முட்புதர் தாக்குதல்களும்), அதிகபட்ச உயிர் வரை.', 'id': 'Setiap serangannya yang kena memulihkannya {n} (serangan ke semak juga), sampai Nyawa maksimalnya.', 'zh-Hans': '每次命中都为其恢复{n}点（命中荆棘堡也算），不超过最大生命。', 'zh-Hant': '每次命中都為其恢復{n}點（命中荊棘堡也算），不超過最大生命。', 'ja': '命中するたびに{n}回復する（イバラへの命中も含む）。最大体力まで。', 'ko': '공격이 적중할 때마다 {n} 회복합니다(가시덤불 적중 포함). 최대 체력까지.'}),
 'ui.eng35-leech-n-short': ('Each hit heals it {n}.', {'fr': 'Chaque coup le soigne de {n}.', 'de': 'Jeder Treffer heilt es um {n}.', 'es': 'Cada golpe lo cura {n}.', 'it': 'Ogni colpo lo cura di {n}.', 'pt': 'Cada golpe o cura em {n}.', 'tl': 'Bawat tama ay nagpapagaling dito ng {n}.', 'ta': 'ஒவ்வொரு தாக்குதலும் அதை {n} குணப்படுத்தும்.', 'id': 'Setiap serangan memulihkannya {n}.', 'zh-Hans': '每次命中恢复{n}点。', 'zh-Hant': '每次命中恢復{n}點。', 'ja': '命中ごとに{n}回復。', 'ko': '적중할 때마다 {n} 회복.'}),
 'ui.eng35-leech-blank': ('Blank = heals the damage dealt', {'fr': 'Vide = soigne les dégâts infligés', 'de': 'Leer = heilt den verursachten Schaden', 'es': 'Vacío = cura el daño infligido', 'it': 'Vuoto = cura i danni inflitti', 'pt': 'Vazio = cura o dano causado', 'tl': 'Blangko = nagpapagaling ng naibigay na pinsala', 'ta': 'காலி = ஏற்படுத்திய சேதத்தை குணப்படுத்தும்', 'id': 'Kosong = memulihkan sebesar kerusakan', 'zh-Hans': '留空 = 恢复造成的伤害', 'zh-Hant': '留空 = 恢復造成的傷害', 'ja': '空欄 = 与えたダメージ分回復', 'ko': '비우면 = 준 피해만큼 회복'}),
}
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
        en = NEW[k][0]
        if en not in d: d[en] = NEW[k][1][code]
    open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('texts: %d keys added' % len(add))
