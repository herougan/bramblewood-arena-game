#!/usr/bin/env python3
"""Package ENG39 (2026-11-09, owner decision DES2-3 a: "rename Exploit to Vulnerable"): Exploit's tokens are shown as Vulnerable and the SK3
status action formerly shown as Vulnerable reads Shock (its log line: "is Shocked"); the card editor's Version field (a family's kinds).
lang/<code>.json rows keyed by the English text of the TX keys in bramblewood-texts.js (a leading emoji is not part of the key: the battle log lines). Each translation reuses the pack's own word for
Vulnerable / Shock. One row per English text; rows that exist are kept, new rows are appended, nothing is sorted.
Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_09_eng39.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

UI = [
 ('{name} is Shocked for {n} rounds.', [
   '{name} est sous le Choc pendant {n} manches.', '{name} steht {n} Runden unter Schock.', '{name} queda en Choque durante {n} rondas.',
   '{name} è sotto Shock per {n} round.', '{name} fica em Choque durante {n} rondas.', 'Na-Shock si {name} sa loob ng {n} round.',
   '{name} {n} சுற்றுகளுக்கு அதிர்ச்சியில் உள்ளது.', '{name} terkena Kejut selama {n} ronde.', '{name}受到震慑{n}回合。', '{name}受到震懾{n}回合。',
   '{name}は{n}ラウンドショック状態になる。', '{name}이(가) {n}라운드 동안 충격 상태예요.']),
 ('Its hits put {n} Vulnerable tokens on the target: each later hit on it deals 1 more.', [
   'Ses coups posent {n} jetons Vulnérable sur la cible : chaque coup suivant lui inflige 1 de plus.',
   'Ihre Treffer legen {n} Verwundbar-Marken auf das Ziel: Jeder spätere Treffer macht 1 mehr.',
   'Sus golpes ponen {n} fichas de Vulnerable en el objetivo: cada golpe posterior hace 1 más.',
   'I suoi colpi mettono {n} segnalini Vulnerabile sul bersaglio: ogni colpo successivo infligge 1 in più.',
   'Os seus golpes põem {n} fichas de Vulnerável no alvo: cada golpe seguinte causa mais 1.',
   'Naglalagay ang mga tama nito ng {n} Bulnerable token sa target: dagdag na 1 sa bawat susunod na tama.',
   'இதன் தாக்குதல்கள் இலக்கில் {n} பாதிப்பு வில்லைகளை வைக்கும்: அடுத்த ஒவ்வொரு தாக்குதலும் 1 அதிகம்.',
   'Serangannya memasang {n} token Rentan pada target: tiap serangan berikutnya memberi 1 lebih.',
   '它的攻击在目标身上放{n}个易伤标记：之后每次命中多造成1点伤害。', '它的攻擊在目標身上放{n}個易傷標記：之後每次命中多造成1點傷害。',
   'その攻撃は対象に脆弱化トークンを{n}個置く：以後の命中ごとに1多く与える。', '공격이 대상에게 취약 토큰 {n}개를 놓아요: 이후 명중마다 1 더 줘요.']),
 ("On Hit: Vulnerable N. Each hit uses one token, shots too; Venom and Bleed ticks don't. Armor still counts.", [
   'Au coup : Vulnérable N. Chaque coup use un jeton, les tirs aussi ; pas les tics de Venin ou de Saignement. L’Armure compte encore.',
   'Bei Treffer: Verwundbar N. Jeder Treffer verbraucht eine Marke, Schüsse auch; Gift- und Blutungsticks nicht. Rüstung zählt weiter.',
   'Al golpear: Vulnerable N. Cada golpe gasta una ficha, también los disparos; los tics de Veneno y Sangrado no. La Armadura sigue contando.',
   'Al colpo: Vulnerabile N. Ogni colpo usa un segnalino, anche i tiri; i tick di Veleno e Sanguinamento no. L’Armatura conta ancora.',
   'Ao acertar: Vulnerável N. Cada golpe gasta uma ficha, os disparos também; os tiques de Veneno e Sangramento não. A Armadura ainda conta.',
   'Sa Tama: Bulnerable N. Bawat tama ay gumagamit ng isang token, pati tira; hindi ang tik ng Lason at Pagdurugo. Bilang pa rin ang Baluti.',
   'தாக்கும்போது: பாதிப்பு N. ஒவ்வொரு தாக்குதலும், எய்தலும், ஒரு வில்லையைச் செலவழிக்கும்; நஞ்சு, இரத்தக் கசிவு துடிப்புகள் அல்ல. கவசம் இன்னும் கணக்கில்.',
   'Saat Kena: Rentan N. Tiap serangan memakai satu token, tembakan juga; detak Racun dan Pendarahan tidak. Zirah tetap dihitung.',
   '命中时：易伤N。每次命中（射击也算）消耗一个标记；中毒和流血的跳伤不算。护甲照常生效。',
   '命中時：易傷N。每次命中（射擊也算）消耗一個標記；中毒和流血的跳傷不算。護甲照常生效。',
   '命中時：脆弱化N。命中（射撃も）ごとに1個消費。毒と出血の継続ダメージは消費しない。装甲は有効。',
   '명중 시: 취약 N. 명중(사격 포함)마다 토큰 1개 소모; 독·출혈 피해는 아니에요. 방어구는 그대로 적용돼요.']),
 ('Vulnerable {n}: its next {n} hit{s} deal 1 more each.', [
   'Vulnérable {n} : ses {n} prochains coups reçus infligent 1 de plus chacun.',
   'Verwundbar {n}: die nächsten {n} Treffer auf sie machen je 1 mehr.',
   'Vulnerable {n}: sus próximos {n} golpes recibidos hacen 1 más cada uno.',
   'Vulnerabile {n}: i prossimi {n} colpi subiti infliggono 1 in più ciascuno.',
   'Vulnerável {n}: os próximos {n} golpes que sofre causam mais 1 cada.',
   'Bulnerable {n}: dagdag na 1 ang bawat isa sa susunod na {n} tama rito.',
   'பாதிப்பு {n}: அதன் மீதான அடுத்த {n} தாக்குதல்கள் ஒவ்வொன்றும் 1 அதிகம்.',
   'Rentan {n}: {n} serangan berikutnya padanya masing-masing memberi 1 lebih.',
   '易伤{n}：接下来{n}次命中它各多造成1点伤害。', '易傷{n}：接下來{n}次命中它各多造成1點傷害。',
   '脆弱化{n}：次の{n}回の命中はそれぞれ1多い。', '취약 {n}: 다음 {n}번의 명중은 각각 1 더 줘요.']),
 ('Put N Vulnerable tokens on a chosen target: each later hit on it deals 1 more and uses one.', [
   'Pose N jetons Vulnérable sur une cible choisie : chaque coup suivant lui inflige 1 de plus et en use un.',
   'Lege N Verwundbar-Marken auf ein gewähltes Ziel: jeder spätere Treffer macht 1 mehr und verbraucht eine.',
   'Pon N fichas de Vulnerable en un objetivo elegido: cada golpe posterior hace 1 más y gasta una.',
   'Metti N segnalini Vulnerabile su un bersaglio scelto: ogni colpo successivo infligge 1 in più e ne usa uno.',
   'Põe N fichas de Vulnerável num alvo escolhido: cada golpe seguinte causa mais 1 e gasta uma.',
   'Maglagay ng N Bulnerable token sa napiling target: dagdag na 1 sa bawat susunod na tama at gumagamit ng isa.',
   'தேர்ந்த இலக்கில் N பாதிப்பு வில்லைகளை வை: அடுத்த ஒவ்வொரு தாக்குதலும் 1 அதிகம் தந்து ஒன்றைச் செலவழிக்கும்.',
   'Pasang N token Rentan pada target pilihan: tiap serangan berikutnya memberi 1 lebih dan memakai satu.',
   '在所选目标身上放N个易伤标记：之后每次命中多造成1点伤害并消耗一个。', '在所選目標身上放N個易傷標記：之後每次命中多造成1點傷害並消耗一個。',
   '選んだ対象に脆弱化トークンをN個置く：以後の命中ごとに1多く与え、1個使う。', '고른 대상에게 취약 토큰 N개를 놓아요: 이후 명중마다 1 더 주고 하나를 써요.']),
 ('Remove up to N physical debuffs from a chosen target (this card by default): Bleed, Scar, Corrosion, Brittle, Exposed, Vulnerable, Shocked, Staggered, shredded Armor, Daunt. Empty: all. Not Venom, Freeze or Stun.', [
   'Retire jusqu’à N affaiblissements physiques d’une cible choisie (cette carte par défaut) : Saignement, Cicatrice, Corrosion, Fragile, Exposé, Vulnérable, Choc, Chancelant, Armure déchirée, Intimidation. Vide : tous. Pas le Venin, le Gel ni l’Étourdissement.',
   'Entfernt bis zu N körperliche Schwächungen von einem gewählten Ziel (standardmäßig diese Karte): Blutung, Narbe, Korrosion, Spröde, Entblößt, Verwundbar, Schock, Taumeln, zerfetzte Rüstung, Einschüchterung. Leer: alle. Nicht Gift, Frost oder Betäubung.',
   'Quita hasta N debilitaciones físicas de un objetivo elegido (esta carta por defecto): Sangrado, Cicatriz, Corrosión, Quebradizo, Expuesto, Vulnerable, Choque, Tambaleo, Armadura rota, Intimidación. Vacío: todas. No Veneno, Congelación ni Aturdimiento.',
   'Rimuove fino a N indebolimenti fisici da un bersaglio scelto (questa carta di base): Sanguinamento, Cicatrice, Corrosione, Fragile, Esposto, Vulnerabile, Shock, Barcollo, Armatura lacerata, Intimidazione. Vuoto: tutti. Non Veleno, Gelo né Stordimento.',
   'Remove até N enfraquecimentos físicos de um alvo escolhido (esta carta por defeito): Sangramento, Cicatriz, Corrosão, Quebradiço, Exposto, Vulnerável, Choque, Cambaleio, Armadura rasgada, Intimidação. Vazio: todos. Não Veneno, Congelamento nem Atordoamento.',
   'Alisin ang hanggang N pisikal na debuff ng napiling target (ang kard na ito kung wala): Pagdurugo, Peklat, Kalawang, Marupok, Nalantad, Bulnerable, Kuryente, Pagsuray, punit na Baluti, Pananakot. Walang laman: lahat. Hindi Lason, Yelo o Pagkatigil.',
   'தேர்ந்த இலக்கிலிருந்து (இயல்பாக இந்த அட்டை) N வரை உடல் பலவீனங்களை நீக்கும்: இரத்தக் கசிவு, தழும்பு, அரிப்பு, நொறுங்கல், வெளிப்பாடு, பாதிப்பு, மின்னதிர்ச்சி, தடுமாற்றம், கிழிந்த கவசம், அச்சுறுத்தல். காலியெனில்: அனைத்தும். நஞ்சு, உறைவு, திகைப்பு அல்ல.',
   'Hapus hingga N pelemahan fisik dari target pilihan (kartu ini secara bawaan): Pendarahan, Luka, Korosi, Rapuh, Terungkap, Rentan, Sengatan, Terhuyung, Zirah koyak, Gentar. Kosong: semua. Bukan Racun, Beku, atau Pingsan.',
   '移除所选目标（默认此卡）至多N个物理减益：流血、伤疤、腐蚀、易碎、暴露、易伤、感电、踉跄、破损护甲、威吓。留空：全部。不含中毒、冰冻和眩晕。',
   '移除所選目標（預設此卡）至多N個物理減益：流血、傷疤、腐蝕、易碎、暴露、易傷、感電、踉蹌、破損護甲、威嚇。留空：全部。不含中毒、冰凍和暈眩。',
   '選んだ対象（既定はこのカード）の物理的な弱体を最大N個消す：出血、傷跡、腐食、もろい、暴露、脆弱化、感電、よろめき、裂けた装甲、威圧。空欄：すべて。毒・凍結・スタンは除く。',
   '고른 대상(기본은 이 카드)의 물리 약화를 최대 N개 제거: 출혈, 흉터, 부식, 취약, 노출, 약점 공략, 감전, 비틀거림, 찢긴 방어구, 위협. 비우면 전부. 독·빙결·기절은 제외.'.replace('약점 공략', '취약 토큰')]),
 ('{att} puts {n} Vulnerable token{s} on {name}.', [
   '{att} pose {n} jeton(s) Vulnérable sur {name}.', '{att} legt {n} Verwundbar-Marke(n) auf {name}.', '{att} pone {n} ficha(s) de Vulnerable en {name}.',
   '{att} mette {n} segnalino/i Vulnerabile su {name}.', '{att} põe {n} ficha(s) de Vulnerável em {name}.', 'Naglagay ang {att} ng {n} Bulnerable token sa {name}.',
   '{att} {name} மீது {n} பாதிப்பு வில்லைகளை வைக்கிறது.', '{att} memasang {n} token Rentan pada {name}.', '{att}在{name}身上放了{n}个易伤标记。',
   '{att}在{name}身上放了{n}個易傷標記。', '{att}が{name}に脆弱化トークンを{n}個置く。', '{att}이(가) {name}에게 취약 토큰 {n}개를 놓아요.']),
 ('{name} is Vulnerable: +{b} damage ({n} left).', [
   '{name} est vulnérable : +{b} dégâts ({n} restant(s)).', '{name} ist verwundbar: +{b} Schaden ({n} übrig).', '{name} es vulnerable: +{b} de daño (quedan {n}).',
   '{name} è vulnerabile: +{b} danni ({n} rimasti).', '{name} está vulnerável: +{b} de dano (restam {n}).', 'Bulnerable ang {name}: +{b} pinsala ({n} natitira).',
   '{name} பாதிக்கப்படக்கூடியது: +{b} சேதம் ({n} மீதம்).', '{name} rentan: +{b} kerusakan (sisa {n}).', '{name}易伤：+{b}伤害（剩{n}个）。',
   '{name}易傷：+{b}傷害（剩{n}個）。', '{name}は脆弱化：+{b}ダメージ（残り{n}）。', '{name}이(가) 취약해요: 피해 +{b} (남은 {n}).']),
 ('No enemy units left to strike {name}: its Vulnerable tokens fade.', [
   'Plus aucune unité ennemie pour frapper {name} : ses jetons Vulnérable s’effacent.', 'Keine feindliche Einheit mehr, die {name} trifft: ihre Verwundbar-Marken verblassen.',
   'No quedan unidades enemigas para golpear a {name}: sus fichas de Vulnerable se desvanecen.', 'Nessuna unità nemica può colpire {name}: i suoi segnalini Vulnerabile svaniscono.',
   'Não restam unidades inimigas para atingir {name}: as suas fichas de Vulnerável desvanecem.', 'Wala nang kaaway na tatama sa {name}: naglalaho ang mga Bulnerable token nito.',
   '{name}-ஐத் தாக்க எதிரி அலகுகள் இல்லை: அதன் பாதிப்பு வில்லைகள் மறைகின்றன.', 'Tak ada unit musuh tersisa untuk menyerang {name}: token Rentannya memudar.',
   '已没有敌方单位能攻击{name}：它的易伤标记消散了。', '已沒有敵方單位能攻擊{name}：它的易傷標記消散了。', '{name}を打つ敵ユニットがいない：脆弱化トークンが消える。',
   '{name}을(를) 칠 적 유닛이 없어요: 취약 토큰이 사라져요.']),
 ('Version', ['Version', 'Version', 'Versión', 'Versione', 'Versão', 'Bersyon', 'பதிப்பு', 'Versi', '版本', '版本', 'バージョン', '버전']),
]


def main():
    for i, code in enumerate(CODES):
        p = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(p, encoding='utf-8'))
        added = 0
        for en, tr in UI:
            assert len(tr) == len(CODES), en
            if en not in pack:
                pack[en] = tr[i]
                added += 1
        open(p, 'w', encoding='utf-8').write(json.dumps(pack, ensure_ascii=False, indent=1) + '\n')
        print(code, 'added', added)


if __name__ == '__main__':
    main()
