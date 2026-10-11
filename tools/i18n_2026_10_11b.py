#!/usr/bin/env python3
"""UI strings added 2026-10-11 (afternoon): Skills along the road (Codex), the Changeling unmask label, Keen Eye, the
Tempering Stone and the Forge's material-gate notes. Same format and caveats as i18n_core.py (Tagalog, Tamil, Japanese
and Korean deserve a native read).

    python3 tools/i18n_2026_10_11b.py
"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
'Skills along the road': ['Les compétences en chemin','Fähigkeiten entlang des Weges','Habilidades a lo largo del camino','Abilità lungo la strada','Habilidades ao longo do caminho','Mga skill sa daan','பாதையில் திறன்கள்','Skill di sepanjang jalan','沿途的技能','沿途的技能','道中のスキル','길을 따라 만나는 스킬'],
"Where each skill first turns up. Hover one you've met to read it again.": ['Où chaque compétence apparaît pour la première fois. Survolez-en une déjà rencontrée pour la relire.','Wo jede Fähigkeit zuerst auftaucht. Fahre über eine bekannte, um sie erneut zu lesen.','Dónde aparece cada habilidad por primera vez. Pasa el cursor sobre una que conozcas para volver a leerla.','Dove compare per la prima volta ogni abilità. Passa sopra una già incontrata per rileggerla.','Onde cada habilidade aparece primeiro. Passa por cima de uma que já conheces para a voltar a ler.','Kung saan unang lumalabas ang bawat skill. I-hover ang nakilala mo na para basahin ulit.','ஒவ்வொரு திறனும் முதலில் தோன்றும் இடம். சந்தித்த ஒன்றின் மேல் வைத்து மீண்டும் படிக்கவும்.','Tempat setiap skill pertama muncul. Arahkan ke skill yang sudah kamu temui untuk membacanya lagi.','每个技能首次出现的地方。将鼠标悬停在已遇到的技能上可再次阅读。','每個技能首次出現的地方。將滑鼠停在已遇到的技能上可再次閱讀。','各スキルが最初に登場する場所。出会ったスキルにカーソルを合わせると説明を読み返せます。','각 스킬이 처음 등장하는 곳. 만난 스킬에 마우스를 올리면 다시 읽을 수 있어요.'],
'Further along the road': ['Plus loin sur la route','Weiter den Weg entlang','Más adelante en el camino','Più avanti lungo la strada','Mais à frente no caminho','Sa unahan pa ng daan','பாதையில் மேலும் முன்னால்','Lebih jauh di jalan','前方的路上','前方的路上','この先の道','길 저편'],
'to find': ['à découvrir','zu entdecken','por descubrir','da scoprire','por descobrir','na hahanapin','கண்டுபிடிக்க','untuk ditemukan','待发现','待發現','未発見','발견할 것'],
'Changeling!': ['Changelin !','Wechselbalg!','¡Cambiante!','Mutaforma!','Metamorfo!','Changeling!','மாறுவேடன்!','Pengubah rupa!','变形者！','變形者！','チェンジリング！','체인질링!'],
'Keen Eye': ['Œil vif','Scharfes Auge','Ojo avizor','Occhio acuto','Olho atento','Matalas na Mata','கூர்மையான கண்','Mata Tajam','锐眼','銳眼','鋭い目','예리한 눈'],
'Tempering Stone': ['Pierre de trempe','Härtestein','Piedra de temple','Pietra di tempra','Pedra de têmpera','Batong Pampatigas','பதப்படுத்தும் கல்','Batu Tempa','淬火石','淬火石','焼き入れ石','담금질 돌'],
'The last levels of an Epic or rarer card need a Tempering Stone: bosses drop them, and the Blacksmith smelts them.': ['Les derniers niveaux d’une carte Épique ou plus rare demandent une Pierre de trempe : les boss en lâchent, et le Forgeron en fond.','Die letzten Stufen einer epischen oder selteneren Karte brauchen einen Härtestein: Bosse lassen ihn fallen, und der Schmied schmilzt ihn.','Los últimos niveles de una carta Épica o más rara necesitan una Piedra de temple: los jefes las sueltan y el Herrero las funde.','Gli ultimi livelli di una carta Epica o più rara richiedono una Pietra di tempra: i boss la lasciano cadere e il Fabbro la fonde.','Os últimos níveis de uma carta Épica ou mais rara precisam de uma Pedra de têmpera: os chefes deixam-nas cair e o Ferreiro funde-as.','Ang huling mga level ng Epic o mas bihirang card ay nangangailangan ng Batong Pampatigas: ibinababa ito ng mga boss, at tinutunaw ito ng Panday.','காவிய அல்லது அரிய அட்டையின் கடைசி நிலைகளுக்கு பதப்படுத்தும் கல் தேவை: தலைவர்கள் அதைக் கைவிடுவார்கள், கொல்லர் அதை உருக்குவார்.','Level terakhir kartu Epic atau yang lebih langka butuh Batu Tempa: bos menjatuhkannya, dan Pandai Besi meleburnya.','史诗或更稀有卡牌的最后几级需要淬火石：首领会掉落，铁匠也能熔炼。','史詩或更稀有卡牌的最後幾級需要淬火石：首領會掉落，鐵匠也能熔煉。','エピック以上のカードの最後のレベルには焼き入れ石が必要です。ボスが落とし、鍛冶屋が精錬します。','에픽 이상 카드의 마지막 레벨에는 담금질 돌이 필요해요. 보스가 떨어뜨리고, 대장장이가 제련해요.'],
'The last level of a Mythic card needs a Dragon Scale.': ['Le dernier niveau d’une carte Mythique demande une Écaille de dragon.','Die letzte Stufe einer mythischen Karte braucht eine Drachenschuppe.','El último nivel de una carta Mítica necesita una Escama de dragón.','L’ultimo livello di una carta Mitica richiede una Scaglia di drago.','O último nível de uma carta Mítica precisa de uma Escama de dragão.','Ang huling level ng Mythic na card ay nangangailangan ng Kaliskis ng Dragon.','புராண அட்டையின் கடைசி நிலைக்கு டிராகன் செதில் தேவை.','Level terakhir kartu Mythic butuh Sisik Naga.','神话卡牌的最后一级需要一片龙鳞。','神話卡牌的最後一級需要一片龍鱗。','ミシックカードの最後のレベルにはドラゴンの鱗が必要です。','신화 카드의 마지막 레벨에는 용의 비늘이 필요해요.'],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json')
    pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    for en, row in T.items(): pack[en] = row[i]
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
print('wrote', len(CODES), 'packs,', len(T), 'strings each')
