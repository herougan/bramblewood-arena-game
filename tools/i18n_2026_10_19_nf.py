#!/usr/bin/env python3
"""Game texts added on 2026-10-18 by package NF (owner 23:37): every copy of a card has its own level (the Forge's copy picker, its
credit line and refine note, the Fuse all extras sheet and tooltip, the one-time note after the move), the Nest's "that nest is taken /
isn't built / every nest is full" lines, and the line the Max Energy effect pops. The rules for a template row are those of
i18n_2026_10_18d.py (every {placeholder} kept, side-by-side placeholders kept side by side and in order, an emoji inside a key kept).
Keys are the English with the leading emoji peeled, as the page translator sees them. "Lv {n}" and "Plain" were already in the packs.
The words follow the packs (exemplaire / Exemplar / copia / cópia / kopya / பிரதி / salinan / 张 / 張 / 枚 / 사본; Chatoyante /
Schimmernd / Brillante ... for Shiny). It also drops the pack row of the refine note this package replaced.
Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_nf.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
DROP = ["Refines your best copy (of {n})."]
# the old inline lines these texts replaced (lang/ui rows; "Every nest is full" is a game text now, in the main packs)
DROP_UI = [
  "Every copy beyond what a deck can hold feeds its own card: it becomes Forge credit on that card, spent before your wallet the next time you temper it. Foil, Shiny and skinned copies are kept.",
  "Feeds every copy beyond what a deck can hold into its own card's credit. Foil, shiny and skinned copies are kept.",
  "Every nest is full",
]
T = {
"Each copy of a card now has its own level: the Forge raises only the copy you pick. Your copies kept the level they had.": [
  "Chaque exemplaire d’une carte a maintenant son propre niveau : la Forge n’améliore que l’exemplaire choisi. Vos exemplaires ont gardé leur niveau.",
  "Jedes Exemplar einer Karte hat jetzt seine eigene Stufe: Die Schmiede verbessert nur das Exemplar, das du wählst. Deine Exemplare haben ihre Stufe behalten.",
  "Cada copia de una carta tiene ahora su propio nivel: la Forja solo mejora la copia que elijas. Tus copias conservaron su nivel.",
  "Ogni copia di una carta ora ha il proprio livello: la Fucina potenzia solo la copia che scegli. Le tue copie hanno mantenuto il loro livello.",
  "Cada cópia de uma carta tem agora o seu próprio nível: a Forja só melhora a cópia que escolheres. As tuas cópias mantiveram o nível.",
  "May sariling antas na ang bawat kopya ng isang card: ang kopyang pipiliin mo lang ang pinapalakas ng Pandayan. Nanatili ang antas ng mga kopya mo.",
  "ஒரு அட்டையின் ஒவ்வொரு பிரதிக்கும் இப்போது தனி நிலை உண்டு: நீங்கள் தேர்ந்தெடுக்கும் பிரதியை மட்டுமே உலைக்கூடம் உயர்த்தும். உங்கள் பிரதிகள் தங்கள் நிலையை வைத்துக்கொண்டன.",
  "Setiap salinan kartu kini punya levelnya sendiri: Bengkel Tempa hanya menaikkan salinan yang kamu pilih. Salinanmu tetap di level yang sama.",
  "现在每张卡牌的每一张都有自己的等级：锻造坊只强化你选中的那一张。你的卡保留了原来的等级。",
  "現在每張卡牌的每一張都有自己的等級：鍛造坊只強化你選中的那一張。你的卡保留了原來的等級。",
  "カードは1枚ごとに自分のレベルを持つようになりました。鍛冶場は選んだ1枚だけを強化します。手持ちのカードはレベルをそのまま保っています。",
  "이제 카드의 사본마다 레벨이 따로 있어요. 대장간은 고른 사본만 강화해요. 가지고 있던 사본들은 레벨을 그대로 유지했어요."],
"Every copy beyond what a deck can hold feeds your best copy of its card (the highest level, then the finest foil, then the oldest): it becomes Forge credit on that copy, spent before your wallet the next time you temper it. Foil, Shiny and skinned copies are kept.": [
  "Chaque exemplaire en trop pour un deck nourrit votre meilleur exemplaire de la carte (le plus haut niveau, puis la plus belle brillance, puis le plus ancien) : il devient un crédit de Forge sur cet exemplaire, dépensé avant votre bourse au prochain trempage. Les exemplaires brillants, chatoyants ou habillés sont gardés.",
  "Jedes Exemplar, das über das hinausgeht, was ein Deck fassen kann, füttert dein bestes Exemplar dieser Karte (höchste Stufe, dann die feinste Folie, dann das älteste): Es wird zu Schmiedeguthaben auf diesem Exemplar, das beim nächsten Härten vor deiner Börse ausgegeben wird. Folien-, schimmernde und eingekleidete Exemplare bleiben.",
  "Cada copia que sobra en un mazo alimenta tu mejor copia de esa carta (el nivel más alto, luego el mejor brillo, luego la más antigua): se convierte en crédito de Forja en esa copia, que se gasta antes que tu bolsa la próxima vez que la temples. Las copias con brillo, Brillantes o con aspecto se conservan.",
  "Ogni copia oltre quelle che un mazzo può contenere nutre la tua copia migliore di quella carta (il livello più alto, poi la lamina più pregiata, poi la più vecchia): diventa credito della Fucina su quella copia, speso prima del tuo borsellino alla prossima tempra. Le copie laminate, Brillanti o con aspetto restano.",
  "Cada cópia a mais do que um baralho aguenta alimenta a tua melhor cópia dessa carta (o nível mais alto, depois o melhor brilho, depois a mais antiga): torna-se crédito da Forja nessa cópia, gasto antes da tua bolsa na próxima vez que a temperares. As cópias brilhantes, Brilhantes ou com visual ficam.",
  "Ang bawat kopyang lampas sa kaya ng isang deck ay ipapakain sa pinakamagaling mong kopya ng card na iyon (pinakamataas na antas, saka ang pinakamagandang foil, saka ang pinakaluma): nagiging Forge credit ito sa kopyang iyon, nagagamit bago ang pitaka mo sa susunod na pagpapatibay. Naiiwan ang mga foil, Shiny at may skin na kopya.",
  "ஒரு அடுக்கில் கொள்ளக்கூடியதை விட அதிகமான ஒவ்வொரு பிரதியும் அந்த அட்டையின் உங்கள் சிறந்த பிரதிக்கு உணவாகும் (உயர்ந்த நிலை, பிறகு சிறந்த மினுமினுப்பு, பிறகு பழையது): அது அந்தப் பிரதியில் உலைக்கூடக் கடனாகி, அடுத்த முறை வலுப்படுத்தும்போது உங்கள் பணப்பைக்கு முன் செலவாகும். மினுமினுப்பு, மின்னும் மற்றும் தோற்றம் கொண்ட பிரதிகள் வைக்கப்படும்.",
  "Setiap salinan yang melebihi isi dek memberi makan salinan terbaikmu dari kartu itu (level tertinggi, lalu foil terbaik, lalu yang tertua): menjadi kredit Tempa pada salinan itu, dipakai sebelum dompetmu saat kamu menempanya lagi. Salinan foil, Berkilau, dan berskin tetap disimpan.",
  "超出卡组上限的每一张都会喂给这张卡你最好的那一张（等级最高，其次闪卡最好，再次最早获得）：成为那一张的锻造额度，下次锻造时先于你的钱包使用。闪卡、闪亮和换装的卡会保留。",
  "超出牌組上限的每一張都會餵給這張卡你最好的那一張（等級最高，其次閃卡最好，再次最早獲得）：成為那一張的鍛造額度，下次鍛造時先於你的錢包使用。閃卡、閃亮和換裝的卡會保留。",
  "デッキに入りきらない分の1枚1枚は、そのカードで一番良い1枚に注がれます（レベルが最も高いもの、次にフォイルが最上のもの、次に最も古いもの）。その1枚の鍛冶クレジットになり、次に鍛えるとき財布より先に使われます。フォイル、シャイニー、スキン付きのカードは残ります。",
  "덱에 넣을 수 있는 수를 넘는 사본은 모두 그 카드의 가장 좋은 사본에게 먹여요(레벨이 가장 높은 것, 다음은 가장 좋은 포일, 다음은 가장 오래된 것). 그 사본의 대장간 크레딧이 되어 다음에 단련할 때 지갑보다 먼저 쓰여요. 포일, 샤이니, 스킨 사본은 남겨요."],
"Feeds every copy beyond what a deck can hold into your best copy of that card: the highest level first, then the finest foil. Foil, Shiny and skinned copies are kept.": [
  "Donne chaque exemplaire en trop pour un deck à votre meilleur exemplaire de la carte : le plus haut niveau d’abord, puis la plus belle brillance. Les exemplaires brillants, chatoyants ou habillés sont gardés.",
  "Füttert jedes Exemplar über die Deckgrenze in dein bestes Exemplar dieser Karte: zuerst die höchste Stufe, dann die feinste Folie. Folien-, schimmernde und eingekleidete Exemplare bleiben.",
  "Da cada copia que sobra en un mazo a tu mejor copia de esa carta: primero el nivel más alto, luego el mejor brillo. Las copias con brillo, Brillantes o con aspecto se conservan.",
  "Dà ogni copia oltre il limite del mazzo alla tua copia migliore di quella carta: prima il livello più alto, poi la lamina più pregiata. Le copie laminate, Brillanti o con aspetto restano.",
  "Dá cada cópia a mais do que um baralho aguenta à tua melhor cópia dessa carta: primeiro o nível mais alto, depois o melhor brilho. As cópias brilhantes, Brilhantes ou com visual ficam.",
  "Ipinapakain ang bawat kopyang lampas sa kaya ng deck sa pinakamagaling mong kopya ng card na iyon: una ang pinakamataas na antas, saka ang pinakamagandang foil. Naiiwan ang mga foil, Shiny at may skin na kopya.",
  "அடுக்கின் வரம்புக்கு மேலான ஒவ்வொரு பிரதியையும் அந்த அட்டையின் உங்கள் சிறந்த பிரதிக்கு ஊட்டும்: முதலில் உயர்ந்த நிலை, பிறகு சிறந்த மினுமினுப்பு. மினுமினுப்பு, மின்னும் மற்றும் தோற்றம் கொண்ட பிரதிகள் வைக்கப்படும்.",
  "Memberikan setiap salinan yang melebihi isi dek ke salinan terbaikmu dari kartu itu: level tertinggi dulu, lalu foil terbaik. Salinan foil, Berkilau, dan berskin tetap disimpan.",
  "把超出卡组上限的每一张喂给这张卡你最好的那一张：先看等级最高，再看闪卡最好。闪卡、闪亮和换装的卡会保留。",
  "把超出牌組上限的每一張餵給這張卡你最好的那一張：先看等級最高，再看閃卡最好。閃卡、閃亮和換裝的卡會保留。",
  "デッキに入りきらない分を、そのカードで一番良い1枚に注ぎます。まずレベルが最も高いもの、次にフォイルが最上のもの。フォイル、シャイニー、スキン付きのカードは残ります。",
  "덱 한도를 넘는 사본을 모두 그 카드의 가장 좋은 사본에게 먹여요. 먼저 레벨이 가장 높은 것, 다음은 가장 좋은 포일. 포일, 샤이니, 스킨 사본은 남겨요."],
"The copy they feed": [
  "L’exemplaire qu’ils nourrissent", "Das Exemplar, das sie füttern", "La copia que alimentan", "La copia che nutrono", "A cópia que alimentam",
  "Ang kopyang pinapakain nila", "அவை ஊட்டும் பிரதி", "Salinan yang mereka beri makan", "它们喂给的那一张", "它們餵給的那一張", "注がれる1枚", "먹이를 받는 사본"],
"Shiny": [
  "Chatoyante", "Schimmernd", "Brillante", "Brillante", "Brilhante", "Shiny", "மின்னும்", "Berkilau", "闪亮", "閃亮", "シャイニー", "샤이니"],
"Your main deck fights with this copy": [
  "Votre deck principal combat avec cet exemplaire", "Dein Hauptdeck kämpft mit diesem Exemplar", "Tu mazo principal lucha con esta copia",
  "Il tuo mazzo principale combatte con questa copia", "O teu baralho principal luta com esta cópia", "Ito ang kopyang ginagamit ng main deck mo sa laban",
  "உங்கள் முதன்மை அடுக்கு இந்தப் பிரதியுடன் போரிடும்", "Dek utamamu bertarung dengan salinan ini", "你的主卡组用这一张出战", "你的主牌組用這一張出戰",
  "メインデッキはこの1枚で戦います", "메인 덱은 이 사본으로 싸워요"],
"This copy has duplicate credit": [
  "Cet exemplaire a un crédit de doublons", "Dieses Exemplar hat Duplikat-Guthaben", "Esta copia tiene crédito de duplicados", "Questa copia ha credito di doppioni",
  "Esta cópia tem crédito de duplicados", "May duplicate credit ang kopyang ito", "இந்தப் பிரதிக்கு நகல் கடன் உள்ளது", "Salinan ini punya kredit duplikat",
  "这一张有重复卡额度", "這一張有重複卡額度", "この1枚には重複クレジットがあります", "이 사본에는 중복 크레딧이 있어요"],
"Your copies": [
  "Vos exemplaires", "Deine Exemplare", "Tus copias", "Le tue copie", "As tuas cópias", "Mga kopya mo", "உங்கள் பிரதிகள்", "Salinanmu", "你的卡", "你的卡", "手持ちの1枚1枚", "내 사본"],
"Each copy is its own card: the Forge works only on the one you pick.": [
  "Chaque exemplaire est une carte à part : la Forge ne travaille que celui que vous choisissez.",
  "Jedes Exemplar ist eine eigene Karte: Die Schmiede bearbeitet nur das, das du wählst.",
  "Cada copia es una carta propia: la Forja solo trabaja la que elijas.",
  "Ogni copia è una carta a sé: la Fucina lavora solo quella che scegli.",
  "Cada cópia é uma carta à parte: a Forja só trabalha a que escolheres.",
  "Sariling card ang bawat kopya: ang pipiliin mo lang ang pinapanday ng Pandayan.",
  "ஒவ்வொரு பிரதியும் தனி அட்டை: நீங்கள் தேர்ந்தெடுப்பதில் மட்டுமே உலைக்கூடம் வேலை செய்யும்.",
  "Setiap salinan adalah kartu tersendiri: Bengkel Tempa hanya menempa yang kamu pilih.",
  "每一张都是独立的卡：锻造坊只处理你选中的那一张。", "每一張都是獨立的卡：鍛造坊只處理你選中的那一張。",
  "1枚1枚が別々のカードです。鍛冶場は選んだ1枚だけを鍛えます。", "사본마다 각자 다른 카드예요. 대장간은 고른 사본만 다뤄요."],
"Duplicate credit on this copy: ✨ {dust} and {gold} Maple Leaves. It pays for this copy's next levels first.": [
  "Crédit de doublons sur cet exemplaire : ✨ {dust} et {gold} Feuilles d’érable. Il paie d’abord les prochains niveaux de cet exemplaire.",
  "Duplikat-Guthaben auf diesem Exemplar: ✨ {dust} und {gold} Ahornblätter. Es bezahlt zuerst die nächsten Stufen dieses Exemplars.",
  "Crédito de duplicados en esta copia: ✨ {dust} y {gold} Hojas de arce. Paga primero los próximos niveles de esta copia.",
  "Credito di doppioni su questa copia: ✨ {dust} e {gold} Foglie d’acero. Paga prima i prossimi livelli di questa copia.",
  "Crédito de duplicados nesta cópia: ✨ {dust} e {gold} Folhas de ácer. Paga primeiro os próximos níveis desta cópia.",
  "Duplicate credit sa kopyang ito: ✨ {dust} at {gold} Dahon ng Maple. Ito muna ang ipambabayad sa mga susunod na antas ng kopyang ito.",
  "இந்தப் பிரதியில் நகல் கடன்: ✨ {dust} மற்றும் {gold} மேப்பிள் இலைகள். இந்தப் பிரதியின் அடுத்த நிலைகளுக்கு இது முதலில் செலுத்தும்.",
  "Kredit duplikat pada salinan ini: ✨ {dust} dan {gold} Daun Maple. Kredit ini membayar level berikutnya salinan ini lebih dulu.",
  "这一张的重复卡额度：✨ {dust} 和 {gold} 枫叶。会先用来支付这一张接下来的等级。",
  "這一張的重複卡額度：✨ {dust} 和 {gold} 楓葉。會先用來支付這一張接下來的等級。",
  "この1枚の重複クレジット：✨ {dust} と カエデの葉 {gold}。この1枚の次のレベルに先に使われます。",
  "이 사본의 중복 크레딧: ✨ {dust}, 단풍잎 {gold}. 이 사본의 다음 레벨에 먼저 쓰여요."],
"Refines the copy you picked (you have {n}).": [
  "Affine l’exemplaire choisi (vous en avez {n}).", "Veredelt das gewählte Exemplar (du hast {n}).", "Refina la copia que elegiste (tienes {n}).",
  "Raffina la copia che hai scelto (ne hai {n}).", "Refina a cópia que escolheste (tens {n}).", "Pinupino ang kopyang pinili mo (may {n} ka).",
  "நீங்கள் தேர்ந்தெடுத்த பிரதியை மெருகேற்றும் (உங்களிடம் {n}).", "Memurnikan salinan yang kamu pilih (kamu punya {n}).",
  "精炼你选中的那一张（你有 {n} 张）。", "精煉你選中的那一張（你有 {n} 張）。", "選んだ1枚を精錬します（{n}枚所持）。", "고른 사본을 정제해요({n}장 보유)."],
"That nest is taken. Tap an empty one.": [
  "Ce nid est occupé. Touchez un nid vide.", "Dieses Nest ist belegt. Tippe auf ein leeres.", "Ese nido está ocupado. Toca uno vacío.",
  "Quel nido è occupato. Tocca un nido vuoto.", "Esse ninho está ocupado. Toca num vazio.", "May laman na ang pugad na iyan. Pumili ng bakante.",
  "அந்தக் கூடு நிரம்பியுள்ளது. ஒரு காலியான கூட்டைத் தட்டுங்கள்.", "Sarang itu sudah terisi. Ketuk yang kosong.",
  "这个巢已经有东西了。点一个空巢。", "這個巢已經有東西了。點一個空巢。", "その巣箱はふさがっています。空いている巣箱をタップしてください。", "그 보금자리는 차 있어요. 빈 곳을 눌러 주세요."],
"That nest isn't built yet.": [
  "Ce nid n’est pas encore construit.", "Dieses Nest ist noch nicht gebaut.", "Ese nido aún no está construido.", "Quel nido non è ancora costruito.",
  "Esse ninho ainda não foi construído.", "Hindi pa naitatayo ang pugad na iyan.", "அந்தக் கூடு இன்னும் கட்டப்படவில்லை.", "Sarang itu belum dibangun.",
  "这个巢还没建好。", "這個巢還沒建好。", "その巣箱はまだできていません。", "그 보금자리는 아직 짓지 않았어요."],
"Every nest is full": [
  "Tous les nids sont pleins", "Alle Nester sind voll", "Todos los nidos están llenos", "Tutti i nidi sono pieni", "Todos os ninhos estão cheios",
  "Puno na ang lahat ng pugad", "எல்லாக் கூடுகளும் நிரம்பியுள்ளன", "Semua sarang penuh", "所有巢都满了", "所有巢都滿了", "巣箱はすべて埋まっています", "보금자리가 모두 찼어요"],
"Max Energy {n}!": [
  "Énergie max : {n} !", "Maximale Energie: {n}!", "¡Energía máxima {n}!", "Energia massima {n}!", "Energia máxima {n}!", "Pinakamataas na Enerhiya: {n}!",
  "அதிகபட்ச ஆற்றல் {n}!", "Energi maksimal {n}!", "能量上限 {n}！", "能量上限 {n}！", "最大エネルギー{n}！", "최대 에너지 {n}!"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
PLURAL = re.compile(r'^\{(s\d?|plural_\w+)\}$')
ph = lambda s: sorted(set(p for p in re.findall(r'\{\w+\}', s) if not PLURAL.match(p)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
assert all(run in t for k, v in T.items() for run in re.findall(r'(?:\{\w+\}){2,}', k) for t in v)
EMO = re.compile(r'[☀-➿\U0001F300-\U0001FAFF]')
assert all(all(e in t for e in EMO.findall(k)) for k, v in T.items() for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en in DROP: pack.pop(en, None)
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # the pack's own order, new rows at the end (fewer merge clashes)
        upath = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        if os.path.exists(upath):
            ui = json.load(open(upath, encoding='utf-8')); n0 = len(ui)
            for en in DROP_UI: ui.pop(en, None)
            if len(ui) != n0:
                with open(upath, 'w', encoding='utf-8') as fh:
                    json.dump(ui, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each, dropped', len(DROP), '(+', len(DROP_UI), 'lang/ui rows)')
