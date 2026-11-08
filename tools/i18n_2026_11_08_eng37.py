# 2026-11-08 (package ENG37, owner 09:27 #1 Reach rework; 11:03 Armoured Shield and Shell after attacking).
#   python3 tools/i18n_2026_11_08_eng37.py   add the new keys to bramblewood-texts.js and their rows to lang/<code>.json (keyed by English text,
#                                            order kept, new rows at the end). Safe to run again. Does not run keyify.
import json, re
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
def T(en, fr, de, es, it, pt, tl, ta, id_, zhs, zht, ja, ko):
    return (en, dict(zip(CODES, [fr, de, es, it, pt, tl, ta, id_, zhs, zht, ja, ko])))
NEW = {
 'ui.sk-reach': T("Flying can't dodge it. With no foe opposite, it strikes a foe in the lane beside it instead of the bramble.",
   "Le Vol ne l'esquive pas. Sans ennemi en face, il frappe un ennemi du couloir voisin au lieu de la ronce.",
   "Fliegen weicht ihm nicht aus. Ohne Gegner gegenüber trifft es einen Gegner in der Nachbarbahn statt des Dornwalls.",
   "Volar no lo esquiva. Sin enemigo enfrente, golpea a un enemigo del carril de al lado en vez de la zarza.",
   "Il Volo non lo schiva. Senza nemici di fronte, colpisce un nemico nella corsia accanto invece del rovo.",
   "Voar não se esquiva dele. Sem inimigo à frente, golpeia um inimigo da faixa ao lado em vez da sarça.",
   "Hindi ito maiiwasan ng Flying. Kapag walang kalaban sa harap, tinatamaan nito ang kalaban sa katabing linya sa halip na ang bramble.",
   "பறப்பவை இதைத் தவிர்க்க முடியாது. எதிரே எதிரி இல்லையெனில், முட்புதருக்குப் பதிலாக அடுத்த வரிசையிலுள்ள எதிரியைத் தாக்கும்.",
   "Terbang tidak bisa menghindarinya. Tanpa lawan di depan, ia menyerang lawan di jalur sebelah, bukan semak duri.",
   "飞行无法闪避它。正对面没有敌人时，它攻击相邻线路的敌人，而不是荆棘。",
   "飛行無法閃避它。正對面沒有敵人時，它攻擊相鄰線路的敵人，而不是荊棘。",
   "飛行では回避できない。正面に敵がいなければ、いばらの代わりに隣のレーンの敵を攻撃する。",
   "비행으로 피할 수 없습니다. 맞은편에 적이 없으면 가시덤불 대신 옆 라인의 적을 공격합니다."),
 'ui.sk-reach-codex': T("Its swing counts as Flying 1: a Flyer never dodges it, a Mach unit 1 in 2. With its own lane empty it strikes an enemy in a lane beside it (the one with less Health; a tie, a coin flip) and hits the bramble only when neither lane has one. Taunt still draws it.",
   "Son coup compte comme Vol 1 : un volant ne l'esquive jamais, une unité Mach 1 fois sur 2. Si son couloir est vide, il frappe un ennemi d'un couloir voisin (celui qui a le moins de Santé ; à égalité, pile ou face) et ne touche la ronce que si aucun des deux n'en a. La Provocation l'attire toujours.",
   "Sein Schlag zählt als Fliegen 1: Ein Flieger weicht nie aus, eine Mach-Einheit 1 von 2. Ist seine Bahn leer, trifft es einen Gegner in einer Nachbarbahn (den mit weniger Leben; bei Gleichstand Münzwurf) und trifft den Dornwall nur, wenn keine der beiden einen hat. Spott zieht es weiterhin an.",
   "Su golpe cuenta como Volar 1: un volador nunca lo esquiva, una unidad Mach 1 de cada 2. Con su carril vacío, golpea a un enemigo de un carril vecino (el de menos Salud; si empatan, a cara o cruz) y solo golpea la zarza si ninguno tiene. Provocar aún lo atrae.",
   "Il suo colpo conta come Volo 1: un volante non lo schiva mai, un'unità Mach 1 volta su 2. Con la sua corsia vuota colpisce un nemico in una corsia accanto (quello con meno Salute; a parità, testa o croce) e colpisce il rovo solo se nessuna delle due ne ha. Provocazione lo attira ancora.",
   "Seu golpe conta como Voar 1: um voador nunca se esquiva, uma unidade Mach 1 em 2. Com sua faixa vazia, golpeia um inimigo de uma faixa ao lado (o de menos Vida; empate, cara ou coroa) e só atinge a sarça se nenhuma das duas tiver. Provocar ainda o atrai.",
   "Ang hampas nito ay bilang Flying 1: hindi ito naiiwasan ng lumilipad, at ng Mach na yunit 1 sa 2. Kapag walang laman ang sarili nitong linya, tinatamaan nito ang kalaban sa katabing linya (ang may mas kaunting Health; kung tabla, hagis-barya) at tatamaan lang ang bramble kapag wala sa dalawa. Naaakit pa rin ito ng Taunt.",
   "இதன் தாக்குதல் பறத்தல் 1 எனக் கணக்கிடப்படும்: பறப்பவை ஒருபோதும் தவிர்க்காது, Mach அலகு 2-இல் 1 முறை. தன் வரிசை காலியானால், அருகிலுள்ள வரிசையின் எதிரியைத் தாக்கும் (குறைந்த உயிர் உள்ளதை; சமமானால் நாணயச் சுண்டல்); இரண்டிலும் இல்லையெனில் மட்டுமே முட்புதரைத் தாக்கும். Taunt இன்னும் இழுக்கும்.",
   "Serangannya dihitung sebagai Terbang 1: penerbang tak pernah menghindarinya, unit Mach 1 dari 2. Bila jalurnya kosong, ia menyerang lawan di jalur sebelah (yang Darahnya lebih sedikit; seri, lempar koin) dan hanya mengenai semak duri bila keduanya kosong. Ejekan tetap menariknya.",
   "它的攻击算作飞行1：飞行单位永远无法闪避，音速单位有一半几率闪避。自身线路为空时，它攻击相邻线路的敌人（生命较少者；相同则掷硬币），两侧都没有敌人时才攻击荆棘。嘲讽仍会吸引它。",
   "它的攻擊算作飛行1：飛行單位永遠無法閃避，音速單位有一半機率閃避。自身線路為空時，它攻擊相鄰線路的敵人（生命較少者；相同則擲硬幣），兩側都沒有敵人時才攻擊荊棘。嘲諷仍會吸引它。",
   "攻撃は飛行1として扱う：飛行ユニットは回避できず、マッハは2回に1回回避する。自分のレーンが空なら隣のレーンの敵を攻撃し（体力の少ない方、同じならコイントス）、どちらにもいない時だけいばらを攻撃する。挑発には引き寄せられる。",
   "공격은 비행 1로 취급됩니다: 비행 유닛은 절대 피할 수 없고, 마하 유닛은 2번에 1번 피합니다. 자기 라인이 비면 옆 라인의 적을 공격하며(체력이 적은 쪽, 같으면 동전 던지기), 양쪽 모두 없을 때만 가시덤불을 공격합니다. 도발에는 여전히 끌립니다."),
 'ui.eng37-log-reach': T('{a} reaches into the next lane and strikes {t}.', '{a} frappe dans le couloir voisin et touche {t}.', '{a} greift in die Nachbarbahn und trifft {t}.', '{a} alcanza el carril vecino y golpea a {t}.', '{a} arriva nella corsia accanto e colpisce {t}.', '{a} alcança a faixa ao lado e golpeia {t}.', 'Umabot si {a} sa katabing linya at tinamaan si {t}.', '{a} அடுத்த வரிசைக்கு நீண்டு {t}-ஐத் தாக்குகிறது.', '{a} menjangkau jalur sebelah dan menyerang {t}.', '{a} 探向相邻线路，攻击了 {t}。', '{a} 探向相鄰線路，攻擊了 {t}。', '{a} は隣のレーンへ届き、{t} を攻撃した。', '{a}이(가) 옆 라인까지 닿아 {t}을(를) 공격합니다.'),
 'ui.eng37-reach-fl': T('↗ Reach', '↗ Allonge', '↗ Reichweite', '↗ Alcance', '↗ Portata', '↗ Alcance', '↗ Abot', '↗ நீட்சி', '↗ Jangkauan', '↗ 长臂', '↗ 長臂', '↗ リーチ', '↗ 리치'),
 'ui.skn-shield-armor': T('Shield: Armor', 'Bouclier : Armure', 'Schild: Rüstung', 'Escudo: Armadura', 'Scudo: Armatura', 'Escudo: Armadura', 'Shield: Armor', 'கேடயம்: கவசம்', 'Perisai: Zirah', '护盾：护甲', '護盾：護甲', 'シールド：アーマー', '보호막: 방어구'),
 'ui.sk-shield-armor': T('Arrives with {n} Shield; +{m} Armor while any of it remains.', 'Arrive avec {n} Bouclier ; +{m} Armure tant qu\'il en reste.', 'Kommt mit {n} Schild; +{m} Rüstung, solange davon etwas übrig ist.', 'Llega con {n} de Escudo; +{m} de Armadura mientras le quede algo.', 'Arriva con {n} Scudo; +{m} Armatura finché ne resta.', 'Chega com {n} de Escudo; +{m} de Armadura enquanto restar algum.', 'Dumarating na may {n} Shield; +{m} Armor habang may natitira pa rito.', '{n} கேடயத்துடன் வரும்; அதில் சிறிதளவு இருக்கும் வரை +{m} கவசம்.', 'Datang dengan {n} Perisai; +{m} Zirah selama masih tersisa.', '登场时带 {n} 护盾；只要护盾尚存，+{m} 护甲。', '登場時帶 {n} 護盾；只要護盾尚存，+{m} 護甲。', '{n} シールドを持って登場。シールドが残る間、アーマー+{m}。', '보호막 {n}을(를) 갖고 등장합니다. 보호막이 남아 있는 동안 방어구 +{m}.'),
 'ui.sk-shield-armor-desc': T('+{m} Armor while any of its Shield remains; gone when the Shield breaks.', '+{m} Armure tant qu\'il reste du Bouclier ; disparaît quand le Bouclier se brise.', '+{m} Rüstung, solange Schild übrig ist; weg, wenn der Schild bricht.', '+{m} de Armadura mientras le quede Escudo; desaparece cuando el Escudo se rompe.', '+{m} Armatura finché resta Scudo; sparisce quando lo Scudo si rompe.', '+{m} de Armadura enquanto restar Escudo; some quando o Escudo quebra.', '+{m} Armor habang may natitirang Shield; mawawala kapag nabasag ang Shield.', 'கேடயம் சிறிதளவு இருக்கும் வரை +{m} கவசம்; கேடயம் உடைந்ததும் போய்விடும்.', '+{m} Zirah selama Perisai masih tersisa; hilang saat Perisai pecah.', '只要护盾尚存，+{m} 护甲；护盾破碎时消失。', '只要護盾尚存，+{m} 護甲；護盾破碎時消失。', 'シールドが残る間アーマー+{m}。シールドが壊れると消える。', '보호막이 남아 있는 동안 방어구 +{m}; 보호막이 깨지면 사라집니다.'),
 'ui.skn-shell-when': T('Shell: when', 'Carapace : quand', 'Panzer: wann', 'Caparazón: cuándo', 'Guscio: quando', 'Casco: quando', 'Shell: kailan', 'ஓடு: எப்போது', 'Cangkang: kapan', '甲壳：时机', '甲殼：時機', '甲羅：タイミング', '껍데기: 시점'),
 'ui.sk-shell-after': T('After it attacks: +{n} Armor until the round ends.', 'Après son attaque : +{n} Armure jusqu\'à la fin du tour.', 'Nach seinem Angriff: +{n} Rüstung bis zum Rundenende.', 'Tras atacar: +{n} de Armadura hasta el final de la ronda.', 'Dopo aver attaccato: +{n} Armatura fino a fine round.', 'Depois de atacar: +{n} de Armadura até o fim da rodada.', 'Pagkatapos umatake: +{n} Armor hanggang matapos ang round.', 'தாக்கிய பின்: சுற்று முடியும் வரை +{n} கவசம்.', 'Setelah menyerang: +{n} Zirah sampai ronde berakhir.', '攻击之后：+{n} 护甲，直到本回合结束。', '攻擊之後：+{n} 護甲，直到本回合結束。', '攻撃した後：ラウンド終了までアーマー+{n}。', '공격한 뒤: 라운드가 끝날 때까지 방어구 +{n}.'),
 'ui.shell-when-hit': T('When first hit (default)', 'Au premier coup reçu (par défaut)', 'Beim ersten Treffer (Standard)', 'Al recibir el primer golpe (por defecto)', 'Al primo colpo subito (predefinito)', 'Ao levar o primeiro golpe (padrão)', 'Kapag unang natamaan (default)', 'முதலில் தாக்கப்படும்போது (இயல்பு)', 'Saat pertama kena (bawaan)', '首次被击中时（默认）', '首次被擊中時（預設）', '最初に攻撃を受けた時（既定）', '처음 맞았을 때 (기본)'),
 'ui.shell-when-after': T('After it attacks', 'Après son attaque', 'Nach seinem Angriff', 'Tras atacar', 'Dopo aver attaccato', 'Depois de atacar', 'Pagkatapos umatake', 'தாக்கிய பின்', 'Setelah menyerang', '攻击之后', '攻擊之後', '攻撃した後', '공격한 뒤'),
 'ui.sk-shell-when-desc': T("When Shell's Armor comes up: when first hit each round (default), or after its own attack (a foe that strikes first meets no Armor).", "Quand l'Armure de la Carapace s'active : au premier coup reçu chaque tour (par défaut), ou après sa propre attaque (un ennemi qui frappe avant ne rencontre aucune Armure).", 'Wann die Panzer-Rüstung kommt: beim ersten Treffer jeder Runde (Standard) oder nach seinem eigenen Angriff (ein Gegner, der zuerst zuschlägt, trifft keine Rüstung).', 'Cuándo aparece la Armadura del Caparazón: al recibir el primer golpe de cada ronda (por defecto), o tras su propio ataque (un enemigo que golpea primero no encuentra Armadura).', "Quando si alza l'Armatura del Guscio: al primo colpo subito ogni round (predefinito), o dopo il suo attacco (un nemico che colpisce prima non trova Armatura).", 'Quando a Armadura do Casco surge: ao levar o primeiro golpe de cada rodada (padrão), ou depois do próprio ataque (um inimigo que golpeia antes não encontra Armadura).', 'Kailan lalabas ang Armor ng Shell: kapag unang natamaan bawat round (default), o pagkatapos ng sarili nitong atake (walang Armor na sasalubong sa kalabang naunang tumama).', 'ஓட்டின் கவசம் எப்போது எழும்: ஒவ்வொரு சுற்றிலும் முதலில் தாக்கப்படும்போது (இயல்பு), அல்லது தன் தாக்குதலுக்குப் பின் (முதலில் தாக்கும் எதிரி கவசத்தைச் சந்திக்க மாட்டான்).', 'Kapan Zirah Cangkang muncul: saat pertama kena tiap ronde (bawaan), atau setelah serangannya sendiri (lawan yang menyerang lebih dulu tak bertemu Zirah).', '甲壳护甲何时出现：每回合首次被击中时（默认），或在自身攻击之后（先出手的敌人碰不到护甲）。', '甲殼護甲何時出現：每回合首次被擊中時（預設），或在自身攻擊之後（先出手的敵人碰不到護甲）。', '甲羅のアーマーが出る時：各ラウンド最初に攻撃を受けた時（既定）、または自分の攻撃の後（先に攻撃した敵はアーマーに当たらない）。', '껍데기 방어구가 생기는 시점: 매 라운드 처음 맞았을 때(기본), 또는 자신의 공격 뒤(먼저 공격한 적은 방어구를 만나지 않음).'),
}
LEAD = re.compile(r'^[\s \U0001F000-\U0001FAFF☀-➿️‍↗]+')
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

# the new Gannet Cliffs card (item 2): its name (lang/cards/<code>.json) and flavour line (lang/ui/<code>.json), keyed by the English text
CARD_ROWS = [
 ('lang/cards', 'Cormorant', ['Cormoran', 'Kormoran', 'Cormorán', 'Cormorano', 'Corvo-marinho', 'Kormoran', 'நீர்க்காகம்', 'Kormoran', '鸬鹚', '鸕鷀', 'ウミウ', '가마우지']),
 ('lang/ui', 'It dries its wings on the ledge with a long sharpened stick from the nest close by. Whatever glides past gets a poke.',
  ['Il sèche ses ailes sur la corniche, un long bâton taillé du nid tout près. Tout ce qui passe en planant reçoit un coup.',
   'Er trocknet seine Flügel auf dem Sims, einen langen, angespitzten Stock aus dem Nest griffbereit. Was vorbeigleitet, bekommt einen Stups.',
   'Seca sus alas en la cornisa con un palo largo y afilado del nido al lado. Lo que pase planeando se lleva un pinchazo.',
   "Asciuga le ali sulla cengia con un lungo bastone appuntito del nido lì accanto. Chi passa planando si prende un colpetto.",
   'Seca as asas na saliência com um graveto longo e afiado do ninho ao lado. O que passar planando leva uma cutucada.',
   'Pinatutuyo nito ang mga pakpak sa gilid ng bangin, may mahabang tinulisang patpat mula sa pugad sa tabi. Anumang dumaan nang palutang ay masusundot.',
   'பாறை விளிம்பில் சிறகுகளை உலர்த்துகிறது; கூட்டிலிருந்து எடுத்த நீண்ட கூர் குச்சி அருகிலேயே. மிதந்து கடப்பது எதுவாயினும் ஒரு குத்து வாங்கும்.',
   'Ia menjemur sayap di tebing dengan tongkat panjang runcing dari sarang di dekatnya. Apa pun yang melayang lewat kena tusuk.',
   '它在崖边晾翅，身旁放着一根从巢里取来的削尖长棍。滑翔经过的，都会被戳一下。',
   '它在崖邊晾翅，身旁放著一根從巢裡取來的削尖長棍。滑翔經過的，都會被戳一下。',
   '崖の岩棚で翼を干し、巣から持ってきた尖った長い枝をそばに置く。滑空して通るものは、つつかれる。',
   '절벽 턱에서 날개를 말리며, 둥지에서 가져온 길고 뾰족한 막대를 곁에 둔다. 활공해 지나가는 것은 한 번 찔린다.']),
]
for rel, en, trs in CARD_ROWS:
    assert len(trs) == 12, en
    for i, code in enumerate(CODES):
        p = '%s/%s.json' % (rel, code); d = json.load(open(p, encoding='utf-8'))
        if en not in d: d[en] = trs[i]
        open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('card rows: done')
