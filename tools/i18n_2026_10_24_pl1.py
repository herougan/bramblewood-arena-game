#!/usr/bin/env python3
"""Game texts added on 2026-10-24 by package PL1 (owner playtest 10-24): the pack opener's count and its page of every card, and the
selfish boons' short words (the Environment card's "11/17 Reptile", the detail's one-line effect and "Theirs: half their deck Reptile").
The boons' one-line effects are each pack's own translation of the DF3 sentence, cut where its "Theirs only:" part begins (so the
wording stays the one already reviewed); the theme words and the three pack lines are new. Tagalog, Tamil, Japanese and Korean deserve
a native read.   python3 tools/i18n_2026_10_24_pl1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
BOONS = ['blindFury', 'hiveChorus', 'risingTide', 'secondBurrow', 'wildRage', 'snowVeil', 'sandVeil', 'restlessDead', 'emberBorn', 'siegeTrain', 'venomGlands', 'skyAmbush']
# where each pack's "Theirs only:" part begins
MARK = {'fr': ' Pour eux seuls', 'de': ' Nur für sie:', 'es': ' Solo para ellos:', 'it': ' Solo per loro:', 'pt': ' Só para eles:', 'tl': ' Para sa kanila lang:',
        'ta': ' அவர்களுக்கு மட்டும்:', 'id': ' Hanya untuk mereka:', 'zh-Hans': '仅限对方：', 'zh-Hant': '僅限對方：', 'ja': '相手専用：', 'ko': ' 상대 전용:'}
THEME = {
 'Cave':                   ['Caverne', 'Höhle', 'Cueva', 'Grotta', 'Caverna', 'Kuweba', 'குகை', 'Gua', '洞穴', '洞穴', '洞窟', '동굴'],
 'Insect':                 ['Insecte', 'Insekt', 'Insecto', 'Insetto', 'Inseto', 'Insekto', 'பூச்சி', 'Serangga', '昆虫', '昆蟲', '昆虫', '곤충'],
 'Tide':                   ['Marée', 'Flut', 'Marea', 'Marea', 'Maré', 'Alon', 'அலை', 'Pasang', '潮汐', '潮汐', '潮', '물결'],
 'burrowers':              ['fouisseurs', 'Gräber', 'excavadores', 'scavatori', 'escavadores', 'humuhukay', 'வளை தோண்டிகள்', 'penggali', '穴居者', '穴居者', '穴掘り', '굴파기'],
 'Rage or Berserk':        ['Rage ou Berserk', 'Raserei oder Berserker', 'Furia o Berserker', 'Furia o Berserker', 'Fúria ou Berserker', 'Galit o Berserk', 'ஆவேசம் அல்லது வெறி', 'Amukan atau Berserk', '狂怒或狂战士', '狂怒或狂戰士', '激怒か狂戦士', '분노 또는 광전사'],
 'Tundra, Taiga or Frost': ['Toundra, Taïga ou Givre', 'Tundra, Taiga oder Frost', 'Tundra, Taiga o Escarcha', 'Tundra, Taiga o Gelo', 'Tundra, Taiga ou Geada', 'Tundra, Taiga o Hamog na Yelo', 'டன்ட்ரா, டைகா அல்லது உறைபனி', 'Tundra, Taiga atau Beku', '苔原、针叶林或霜寒', '苔原、針葉林或霜寒', 'ツンドラ・タイガ・霜', '툰드라, 타이가 또는 서리'],
 'Desert':                 ['Désert', 'Wüste', 'Desierto', 'Deserto', 'Deserto', 'Disyerto', 'பாலைவனம்', 'Gurun', '沙漠', '沙漠', '砂漠', '사막'],
 'Undead':                 ['Mort-vivant', 'Untot', 'No muerto', 'Non morto', 'Morto-vivo', 'Undead', 'இறவாதது', 'Mayat Hidup', '亡灵', '亡靈', 'アンデッド', '언데드'],
 'Volcanic':               ['Volcanique', 'Vulkanisch', 'Volcánico', 'Vulcanico', 'Vulcânico', 'Bulkaniko', 'எரிமலை', 'Vulkanik', '火山', '火山', '火山', '화산'],
 'Siege':                  ['Siège', 'Belagerung', 'Asedio', 'Assedio', 'Cerco', 'Pagkubkob', 'முற்றுகை', 'Pengepungan', '攻城', '攻城', '攻城', '공성'],
 'Reptile':                ['Reptile', 'Reptil', 'Reptil', 'Rettile', 'Réptil', 'Reptilya', 'ஊர்வன', 'Reptil', '爬行动物', '爬行動物', '爬虫類', '파충류'],
 'Flying':                 ['Vol', 'Fliegend', 'Vuelo', 'Volo', 'Voo', 'Lumilipad', 'பறக்கும்', 'Terbang', '飞行', '飛行', '飛行', '비행'],
}
T = {
 'Next pack ({n} left)': ['Pack suivant ({n} restants)', 'Nächstes Pack (noch {n})', 'Siguiente sobre (quedan {n})', 'Prossima bustina (ne restano {n})', 'Próximo pacote (faltam {n})', 'Susunod na pack ({n} pa)',
                          'அடுத்த பொதி (இன்னும் {n})', 'Paket berikutnya (sisa {n})', '下一包（还剩 {n} 包）', '下一包（還剩 {n} 包）', '次のパック（残り{n}）', '다음 팩 ({n}개 남음)'],
 'All {n} packs': ['Les {n} packs', 'Alle {n} Packs', 'Los {n} sobres', 'Tutte le {n} bustine', 'Os {n} pacotes', 'Lahat ng {n} pack', 'எல்லா {n} பொதிகளும்', 'Semua {n} paket', '全部 {n} 包', '全部 {n} 包', '{n}パックすべて', '{n}팩 전부'],
 '{n} packs opened': ['{n} packs ouverts', '{n} Packs geöffnet', '{n} sobres abiertos', '{n} bustine aperte', '{n} pacotes abertos', '{n} pack ang nabuksan', '{n} பொதிகள் திறக்கப்பட்டன', '{n} paket dibuka', '已开 {n} 包', '已開 {n} 包', '{n}パック開封', '{n}팩 개봉'],
 'Theirs: half their deck {theme}': ['Pour eux : la moitié de leur deck {theme}', 'Nur sie: die Hälfte ihres Decks {theme}', 'Suyo: la mitad de su mazo {theme}', 'Loro: metà del loro mazzo {theme}', 'Deles: metade do baralho {theme}',
                                     'Kanila: kalahati ng deck nila ay {theme}', 'அவர்களுடையது: அடுக்கில் பாதி {theme}', 'Milik mereka: setengah dek mereka {theme}', '对方专属：牌组一半是{theme}', '對方專屬：牌組一半是{theme}', '相手専用：デッキの半分が{theme}', '상대 전용: 덱의 절반이 {theme}'],
}
for en, row in THEME.items(): T[en] = row
src = open(os.path.join(ROOT, 'bramblewood-texts.js'), encoding='utf-8').read()
full = dict(re.findall(r'"(ui\.df3-[a-zA-Z]+)": "([^"]*)"', src))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T.items():
        assert ph(en) == ph(row[i]), (code, en)
        pack[en] = row[i]
    for b in BOONS:
        en_full = full['ui.df3-' + b]; en_eff = en_full.split(' Theirs only:')[0]
        tr = pack.get(en_full); assert tr and MARK[code] in tr, (code, b, tr)
        pack[en_eff] = tr.split(MARK[code])[0].rstrip()
    dump(path, pack)
    # the opener's old literal "Next pack (N left)" is a TX key now (ui.pl1-next-pack): its stale lang/ui row goes
    upath = os.path.join(ROOT, 'lang', 'ui', code + '.json'); ui = json.load(open(upath, encoding='utf-8'))
    if ui.pop('Next pack ({v1} left)', None) is not None: dump(upath, ui)
print('wrote', len(CODES), 'packs:', len(T) + len(BOONS), 'texts each')
