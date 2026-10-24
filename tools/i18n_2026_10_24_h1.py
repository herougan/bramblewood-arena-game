#!/usr/bin/env python3
"""Game texts added on 2026-10-24 by package H1 (owner decision H1: Materia gem sockets on Unique and rarer cards, one per copy,
costs to set and to take out). The gem names (Ember, Tide, Grove, Stone) and the Ember line were already translated.
Tagalog, Tamil, Japanese and Korean deserve a native read.   python3 tools/i18n_2026_10_24_h1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
SAME = ["+2 ❤", "+1 ⚔ +1 ❤", "+3 ❤"]
LEAD = '💎 '
STALE_UI = ["Enchanted", "Enchanted with {v1} {v2}: {v3}. Socketing another crystal replaces it."]
T = {
"Socket": ["Châsse", "Fassung", "Engaste", "Incastonatura", "Engaste", "Socket", "குழி", "Soket", "镶孔", "鑲孔", "ソケット", "소켓"],
"Unique and rarer cards have one gem socket on each copy. Set a Materia gem in it for a lasting bonus. Setting a gem costs, and so does taking it out (the gem comes back). Craft gems from Magic Dust on the bench.": [
 "Les cartes Uniques et plus rares ont une châsse à gemme sur chaque exemplaire. Sertissez-y une gemme de Materia pour un bonus durable. Sertir une gemme coûte, la retirer aussi (la gemme vous revient). Fabriquez des gemmes avec de la Poussière magique à l’établi.",
 "Einzigartige und seltenere Karten haben auf jedem Exemplar eine Edelsteinfassung. Setze einen Materia-Edelstein ein für einen dauerhaften Bonus. Einsetzen kostet, Herausnehmen auch (der Edelstein kommt zurück). Stelle Edelsteine an der Werkbank aus Magiestaub her.",
 "Las cartas Únicas y más raras tienen un engaste para gema en cada copia. Engasta una gema de Materia para un bono duradero. Engastar una gema cuesta, y sacarla también (la gema vuelve). Crea gemas con Polvo mágico en el banco.",
 "Le carte Uniche e più rare hanno un’incastonatura per gemma su ogni copia. Incastona una gemma di Materia per un bonus duraturo. Incastonare costa, e anche toglierla (la gemma torna a te). Crea gemme con la Polvere magica al banco.",
 "Cartas Únicas e mais raras têm um engaste de gema em cada cópia. Engaste uma gema de Matéria para um bônus duradouro. Engastar custa, e retirar também (a gema volta). Crie gemas com Pó Mágico na bancada.",
 "May isang socket ng hiyas ang bawat kopya ng mga Unique at mas bihirang card. Maglagay ng hiyas na Materia para sa pangmatagalang bonus. May bayad ang paglalagay, at ang pag-alis din (bumabalik ang hiyas). Gumawa ng hiyas mula sa Magic Dust sa bangko.",
 "தனித்துவ மற்றும் அதைவிட அரிய அட்டைகளின் ஒவ்வொரு நகலிலும் ஒரு மணிக் குழி உண்டு. நீடித்த போனஸுக்கு ஒரு மெட்டீரியா மணியைப் பதியுங்கள். பதிக்கவும் கட்டணம், எடுக்கவும் கட்டணம் (மணி திரும்ப வரும்). மேசையில் மாயத் தூசியிலிருந்து மணிகளை உருவாக்குங்கள்.",
 "Kartu Unik dan yang lebih langka punya satu soket permata di setiap salinan. Pasang permata Materia untuk bonus permanen. Memasang permata ada biayanya, melepasnya juga (permatanya kembali). Buat permata dari Debu Ajaib di meja kerja.",
 "独特及更稀有的卡牌每张副本都有一个宝石镶孔。镶入一颗魔晶宝石可获得持久加成。镶入要花费，取出也要花费（宝石会退回）。在工作台用魔尘制作宝石。",
 "獨特及更稀有的卡牌每張副本都有一個寶石鑲孔。鑲入一顆魔晶寶石可獲得持久加成。鑲入要花費，取出也要花費（寶石會退回）。在工作台用魔塵製作寶石。",
 "ユニーク以上のカードは、1枚ごとに宝石ソケットを1つ持ちます。マテリアの宝石をはめると、ずっと続くボーナスが付きます。はめるのにも外すのにもコストがかかります（宝石は戻ります）。宝石は作業台で魔法の粉から作れます。",
 "유니크 이상 카드는 사본마다 보석 소켓이 하나 있어요. 마테리아 보석을 끼우면 오래가는 보너스를 받아요. 끼울 때도 뺄 때도 비용이 들어요(보석은 돌아와요). 보석은 작업대에서 마법 가루로 만들어요."],
"Empty socket": ["Châsse vide", "Leere Fassung", "Engaste vacío", "Incastonatura vuota", "Engaste vazio", "Walang laman na socket", "காலியான குழி", "Soket kosong", "空镶孔", "空鑲孔", "空きソケット", "빈 소켓"],
"{gem} in the socket": ["{gem} dans la châsse", "{gem} in der Fassung", "{gem} en el engaste", "{gem} nell’incastonatura", "{gem} no engaste", "{gem} sa socket", "குழியில் {gem}", "{gem} di soket", "镶孔中：{gem}", "鑲孔中：{gem}", "ソケットに{gem}", "소켓에 {gem}"],
"Pick a gem for this copy's socket.": ["Choisissez une gemme pour la châsse de cet exemplaire.", "Wähle einen Edelstein für die Fassung dieses Exemplars.", "Elige una gema para el engaste de esta copia.", "Scegli una gemma per l’incastonatura di questa copia.", "Escolha uma gema para o engaste desta cópia.", "Pumili ng hiyas para sa socket ng kopyang ito.", "இந்த நகலின் குழிக்கு ஒரு மணியைத் தேர்ந்தெடுங்கள்.", "Pilih permata untuk soket salinan ini.", "为这张副本的镶孔选一颗宝石。", "為這張副本的鑲孔選一顆寶石。", "この1枚のソケットにはめる宝石を選んでください。", "이 사본의 소켓에 끼울 보석을 고르세요."],
"One gem per copy: take this one out to set another.": ["Une gemme par exemplaire : retirez celle-ci pour en sertir une autre.", "Ein Edelstein pro Exemplar: nimm diesen heraus, um einen anderen einzusetzen.", "Una gema por copia: saca esta para engastar otra.", "Una gemma per copia: togli questa per incastonarne un’altra.", "Uma gema por cópia: retire esta para engastar outra.", "Isang hiyas bawat kopya: alisin muna ito para maglagay ng iba.", "ஒரு நகலுக்கு ஒரு மணி: வேறொன்றைப் பதிக்க இதை எடுங்கள்.", "Satu permata per salinan: lepas yang ini untuk memasang yang lain.", "每张副本只能镶一颗：取出这颗才能镶另一颗。", "每張副本只能鑲一顆：取出這顆才能鑲另一顆。", "1枚に宝石は1つ：別の宝石をはめるには、これを外してください。", "사본 하나에 보석 하나: 다른 보석을 끼우려면 이것을 빼세요."],
"Take the gem out": ["Retirer la gemme", "Edelstein herausnehmen", "Sacar la gema", "Togli la gemma", "Retirar a gema", "Alisin ang hiyas", "மணியை எடு", "Lepas permata", "取出宝石", "取出寶石", "宝石を外す", "보석 빼기"],
"The gem goes back to your Materia.": ["La gemme retourne dans votre Materia.", "Der Edelstein kommt zurück zu deiner Materia.", "La gema vuelve a tu Materia.", "La gemma torna nella tua Materia.", "A gema volta para a sua Matéria.", "Babalik ang hiyas sa iyong Materia.", "மணி உங்கள் மெட்டீரியாவுக்குத் திரும்பும்.", "Permata kembali ke Materia-mu.", "宝石会回到你的魔晶中。", "寶石會回到你的魔晶中。", "宝石はマテリアに戻ります。", "보석은 마테리아로 돌아가요."],
"The gem breaks when it comes out.": ["La gemme se brise quand on la retire.", "Der Edelstein zerbricht beim Herausnehmen.", "La gema se rompe al sacarla.", "La gemma si rompe quando la togli.", "A gema se quebra ao ser retirada.", "Nababasag ang hiyas kapag inalis.", "எடுக்கும்போது மணி உடைந்துவிடும்.", "Permata pecah saat dilepas.", "宝石取出时会碎裂。", "寶石取出時會碎裂。", "宝石は外すと砕けます。", "보석은 빼면 깨져요."],
"Setting a gem costs": ["Sertir une gemme coûte", "Einen Edelstein einsetzen kostet", "Engastar una gema cuesta", "Incastonare una gemma costa", "Engastar uma gema custa", "Bayad sa paglalagay ng hiyas", "ஒரு மணியைப் பதிக்கும் கட்டணம்", "Biaya memasang permata", "镶入宝石花费", "鑲入寶石花費", "宝石をはめるコスト", "보석 끼우기 비용"],
"Only Unique and rarer cards have a socket.": ["Seules les cartes Uniques et plus rares ont une châsse.", "Nur einzigartige und seltenere Karten haben eine Fassung.", "Solo las cartas Únicas y más raras tienen engaste.", "Solo le carte Uniche e più rare hanno un’incastonatura.", "Só cartas Únicas e mais raras têm engaste.", "Ang mga Unique at mas bihirang card lang ang may socket.", "தனித்துவ மற்றும் அதைவிட அரிய அட்டைகளுக்கு மட்டுமே குழி உண்டு.", "Hanya kartu Unik dan yang lebih langka yang punya soket.", "只有独特及更稀有的卡牌才有镶孔。", "只有獨特及更稀有的卡牌才有鑲孔。", "ソケットがあるのはユニーク以上のカードだけです。", "유니크 이상 카드에만 소켓이 있어요."],
"Gem socket: empty": ["Châsse à gemme : vide", "Edelsteinfassung: leer", "Engaste de gema: vacío", "Incastonatura: vuota", "Engaste de gema: vazio", "Socket ng hiyas: walang laman", "மணிக் குழி: காலி", "Soket permata: kosong", "宝石镶孔：空", "寶石鑲孔：空", "宝石ソケット：空き", "보석 소켓: 비어 있음"],
"Gem socket: {gem}": ["Châsse à gemme : {gem}", "Edelsteinfassung: {gem}", "Engaste de gema: {gem}", "Incastonatura: {gem}", "Engaste de gema: {gem}", "Socket ng hiyas: {gem}", "மணிக் குழி: {gem}", "Soket permata: {gem}", "宝石镶孔：{gem}", "寶石鑲孔：{gem}", "宝石ソケット：{gem}", "보석 소켓: {gem}"],
"{n} empty": ["{n} vide(s)", "{n} leer", "{n} vacío(s)", "{n} vuota/e", "{n} vazio(s)", "{n} walang laman", "{n} காலி", "{n} kosong", "{n} 个空", "{n} 個空", "空き {n}", "빈 소켓 {n}"],
"Set or take out gems in the Forge's 💎 Socket tab.": ["Sertissez ou retirez des gemmes dans l’onglet 💎 Châsse de la Forge.", "Setze Edelsteine im Tab 💎 Fassung der Schmiede ein oder nimm sie heraus.", "Engasta o saca gemas en la pestaña 💎 Engaste de la Forja.", "Incastona o togli gemme nella scheda 💎 Incastonatura della Forgia.", "Engaste ou retire gemas na aba 💎 Engaste da Forja.", "Maglagay o mag-alis ng hiyas sa tab na 💎 Socket ng Forge.", "உலையின் 💎 குழி தாவலில் மணிகளைப் பதியுங்கள் அல்லது எடுங்கள்.", "Pasang atau lepas permata di tab 💎 Soket di Tempa.", "在锻炉的 💎 镶孔页镶入或取出宝石。", "在鍛爐的 💎 鑲孔頁鑲入或取出寶石。", "宝石のはめ外しは鍛冶場の 💎 ソケット タブで。", "보석은 대장간의 💎 소켓 탭에서 끼우거나 빼요."],
"💎 {gem} set in {name} ({fx}).": ["💎 {gem} sertie dans {name} ({fx}).", "💎 {gem} in {name} eingesetzt ({fx}).", "💎 {gem} engastada en {name} ({fx}).", "💎 {gem} incastonata in {name} ({fx}).", "💎 {gem} engastada em {name} ({fx}).", "💎 Nailagay ang {gem} sa {name} ({fx}).", "💎 {name} இல் {gem} பதிக்கப்பட்டது ({fx}).", "💎 {gem} dipasang di {name} ({fx}).", "💎 {gem} 已镶入 {name}（{fx}）。", "💎 {gem} 已鑲入 {name}（{fx}）。", "💎 {name}に{gem}をはめました（{fx}）。", "💎 {name}에 {gem}을(를) 끼웠어요 ({fx})."],
"💎 {gem} taken out of {name}. It is back with your Materia.": ["💎 {gem} retirée de {name}. Elle est de retour dans votre Materia.", "💎 {gem} aus {name} herausgenommen. Er ist zurück bei deiner Materia.", "💎 {gem} sacada de {name}. Ha vuelto a tu Materia.", "💎 {gem} tolta da {name}. È tornata nella tua Materia.", "💎 {gem} retirada de {name}. Voltou para a sua Matéria.", "💎 Inalis ang {gem} sa {name}. Nasa Materia mo na ulit.", "💎 {name} இலிருந்து {gem} எடுக்கப்பட்டது. அது உங்கள் மெட்டீரியாவுக்குத் திரும்பியது.", "💎 {gem} dilepas dari {name}. Kembali ke Materia-mu.", "💎 已从 {name} 取出 {gem}，它回到了你的魔晶中。", "💎 已從 {name} 取出 {gem}，它回到了你的魔晶中。", "💎 {name}から{gem}を外しました。マテリアに戻りました。", "💎 {name}에서 {gem}을(를) 뺐어요. 마테리아로 돌아갔어요."],
"💎 {gem} taken out of {name}. It broke.": ["💎 {gem} retirée de {name}. Elle s’est brisée.", "💎 {gem} aus {name} herausgenommen. Er ist zerbrochen.", "💎 {gem} sacada de {name}. Se rompió.", "💎 {gem} tolta da {name}. Si è rotta.", "💎 {gem} retirada de {name}. Ela se quebrou.", "💎 Inalis ang {gem} sa {name}. Nabasag ito.", "💎 {name} இலிருந்து {gem} எடுக்கப்பட்டது. அது உடைந்தது.", "💎 {gem} dilepas dari {name}. Permatanya pecah.", "💎 已从 {name} 取出 {gem}，它碎了。", "💎 已從 {name} 取出 {gem}，它碎了。", "💎 {name}から{gem}を外しました。砕けました。", "💎 {name}에서 {gem}을(를) 뺐어요. 깨졌어요."],
}
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T.items():
        assert len(row) == len(CODES), en
        assert ph(en) == ph(row[i]), (code, en)
        k, v = en, row[i]
        if k.startswith(LEAD):  # a toast's leading emoji stays outside the pack (the translator keeps it; tests/i18n-templates)
            pack.pop(k, None); k, v = k[len(LEAD):], v[len(LEAD):] if v.startswith(LEAD) else v
        pack[k] = v
    for en in SAME:
        pack.setdefault(en, en)
    dump(path, pack)
    # the old Enchant anvil's literals are gone from arena_app.js (now TX keys): their lang/ui rows go too
    upath = os.path.join(ROOT, 'lang', 'ui', code + '.json'); ui = json.load(open(upath, encoding='utf-8'))
    for en in STALE_UI: ui.pop(en, None)
    dump(upath, ui)
print('wrote', len(CODES), 'packs')
