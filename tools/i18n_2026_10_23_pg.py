#!/usr/bin/env python3
"""Game texts added on 2026-10-23 by package PG (owner items 6, 8, 9, 10, 13): the deck copy limits (the "2/3" chip's tip, the fight
gate's two lines, the import note), why a map is locked (the signpost's toast and the locked map's notice), and Map 0's signpost now
naming Thistlewood (its old line named Clovermead and is retired from lang/ui). Same rules as
i18n_2026_10_21_ar.py: keys are the English as the page translator sees it, every {placeholder} is kept, a row a pack already has is left
as the pack has it. Tagalog, Tamil, Japanese and Korean deserve a native read.

    python3 tools/i18n_2026_10_23_pg.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"{n} in this deck, at most {cap} per deck ({rarity}). You own {owned}.": [
  "{n} dans ce deck, {cap} au plus par deck ({rarity}). Vous en possédez {owned}.",
  "{n} in diesem Deck, höchstens {cap} pro Deck ({rarity}). Du besitzt {owned}.",
  "{n} en este mazo, como máximo {cap} por mazo ({rarity}). Tienes {owned}.",
  "{n} in questo mazzo, al massimo {cap} per mazzo ({rarity}). Ne possiedi {owned}.",
  "{n} neste baralho, no máximo {cap} por baralho ({rarity}). Tens {owned}.",
  "{n} sa deck na ito, hanggang {cap} lang bawat deck ({rarity}). May {owned} ka.",
  "இந்த அடுக்கில் {n}, ஒரு அடுக்கில் அதிகபட்சம் {cap} ({rarity}). உங்களிடம் {owned} உள்ளது.",
  "{n} di dek ini, paling banyak {cap} per dek ({rarity}). Kamu punya {owned}.",
  "此卡组中 {n} 张，每副卡组最多 {cap} 张（{rarity}）。你拥有 {owned} 张。",
  "此牌組中 {n} 張，每副牌組最多 {cap} 張（{rarity}）。你擁有 {owned} 張。",
  "このデッキに{n}枚、1デッキ最大{cap}枚（{rarity}）。所持数：{owned}枚。",
  "이 덱에 {n}장, 덱당 최대 {cap}장({rarity}). 보유: {owned}장."],
"Your deck has {n} {name}. A {rarity} card may have at most {cap} copies in a deck.": [
  "Votre deck contient {n} {name}. Une carte {rarity} peut avoir au plus {cap} exemplaires par deck.",
  "Dein Deck hat {n}× {name}. Eine {rarity}-Karte darf höchstens {cap}-mal in einem Deck sein.",
  "Tu mazo tiene {n} {name}. Una carta {rarity} puede tener como máximo {cap} copias en un mazo.",
  "Il tuo mazzo ha {n} {name}. Una carta {rarity} può avere al massimo {cap} copie in un mazzo.",
  "O teu baralho tem {n} {name}. Uma carta {rarity} pode ter no máximo {cap} cópias num baralho.",
  "May {n} {name} ang deck mo. Hanggang {cap} kopya lang ng {rarity} na card ang puwede sa isang deck.",
  "உங்கள் அடுக்கில் {n} {name} உள்ளன. ஒரு {rarity} அட்டை ஒரு அடுக்கில் அதிகபட்சம் {cap} பிரதிகள் மட்டுமே இருக்கலாம்.",
  "Dekmu berisi {n} {name}. Kartu {rarity} paling banyak {cap} salinan dalam satu dek.",
  "你的卡组有 {n} 张{name}。{rarity}卡牌每副卡组最多 {cap} 张。",
  "你的牌組有 {n} 張{name}。{rarity}卡牌每副牌組最多 {cap} 張。",
  "デッキに{name}が{n}枚あります。{rarity}のカードは1デッキに最大{cap}枚までです。",
  "덱에 {name}이(가) {n}장 있어요. {rarity} 카드는 덱에 최대 {cap}장까지예요."],
"Your deck has {n} {name}, but you own {owned}.": [
  "Votre deck contient {n} {name}, mais vous n’en possédez que {owned}.",
  "Dein Deck hat {n}× {name}, aber du besitzt nur {owned}.",
  "Tu mazo tiene {n} {name}, pero solo tienes {owned}.",
  "Il tuo mazzo ha {n} {name}, ma ne possiedi solo {owned}.",
  "O teu baralho tem {n} {name}, mas só tens {owned}.",
  "May {n} {name} ang deck mo, pero {owned} lang ang hawak mo.",
  "உங்கள் அடுக்கில் {n} {name} உள்ளன, ஆனால் உங்களிடம் {owned} மட்டுமே உள்ளது.",
  "Dekmu berisi {n} {name}, tapi kamu hanya punya {owned}.",
  "你的卡组有 {n} 张{name}，但你只拥有 {owned} 张。",
  "你的牌組有 {n} 張{name}，但你只擁有 {owned} 張。",
  "デッキに{name}が{n}枚ありますが、所持数は{owned}枚です。",
  "덱에 {name}이(가) {n}장 있지만 보유한 건 {owned}장이에요."],
"Imported. {n} copies over the deck limits were left out: {list}": [
  "Importé. {n} exemplaires au-delà des limites du deck ont été laissés de côté : {list}",
  "Importiert. {n} Exemplare über den Deck-Limits wurden weggelassen: {list}",
  "Importado. Se dejaron fuera {n} copias que superaban los límites del mazo: {list}",
  "Importato. {n} copie oltre i limiti del mazzo sono state escluse: {list}",
  "Importado. {n} cópias acima dos limites do baralho ficaram de fora: {list}",
  "Na-import. Hindi isinama ang {n} kopyang lampas sa limit ng deck: {list}",
  "இறக்கப்பட்டது. அடுக்கு வரம்பை மீறிய {n} பிரதிகள் விடப்பட்டன: {list}",
  "Diimpor. {n} salinan yang melebihi batas dek tidak dimasukkan: {list}",
  "已导入。超出卡组上限的 {n} 张未加入：{list}",
  "已匯入。超出牌組上限的 {n} 張未加入：{list}",
  "インポートしました。デッキの上限を超えた{n}枚は外しました：{list}",
  "가져왔어요. 덱 한도를 넘는 {n}장은 빼 두었어요: {list}"],
"Map {n}": ["Carte {n}", "Karte {n}", "Mapa {n}", "Mappa {n}", "Mapa {n}", "Mapa {n}", "வரைபடம் {n}", "Peta {n}", "地图 {n}", "地圖 {n}", "マップ{n}", "맵 {n}"],
"{map} is coming soon.": [
  "{map} arrive bientôt.", "{map} kommt bald.", "{map} llegará pronto.", "{map} arriverà presto.", "{map} chega em breve.", "Malapit nang dumating ang {map}.",
  "{map} விரைவில் வரும்.", "{map} segera hadir.", "{map}即将推出。", "{map}即將推出。", "{map}は近日公開です。", "{map}은(는) 곧 열려요."],
"{map} opens later. First reach {parent}.": [
  "{map} s’ouvrira plus tard. Atteignez d’abord {parent}.", "{map} öffnet sich später. Erreiche zuerst {parent}.", "{map} se abre más adelante. Primero llega a {parent}.",
  "{map} si apre più avanti. Prima raggiungi {parent}.", "{map} abre mais tarde. Primeiro chega a {parent}.", "Magbubukas ang {map} mamaya. Abutin muna ang {parent}.",
  "{map} பின்னர் திறக்கும். முதலில் {parent} ஐ அடையுங்கள்.", "{map} terbuka nanti. Capai {parent} dulu.", "{map}稍后开放。先到达{parent}。", "{map}稍後開放。先到達{parent}。",
  "{map}はあとで開きます。まず{parent}にたどり着きましょう。", "{map}은(는) 나중에 열려요. 먼저 {parent}에 가세요."],
"{map} opens when its quest is done.": [
  "{map} s’ouvre une fois sa quête accomplie.", "{map} öffnet sich, wenn seine Quest erledigt ist.", "{map} se abre cuando completas su misión.",
  "{map} si apre quando completi la sua missione.", "{map} abre quando completares a sua missão.", "Magbubukas ang {map} kapag tapos na ang quest nito.",
  "அதன் பணி முடிந்ததும் {map} திறக்கும்.", "{map} terbuka setelah misinya selesai.", "完成其任务后，{map}开放。", "完成其任務後，{map}開放。",
  "クエストを終えると{map}が開きます。", "퀘스트를 마치면 {map}이(가) 열려요."],
"{map} opens once you clear {other}.": [
  "{map} s’ouvre une fois {other} terminée.", "{map} öffnet sich, sobald du {other} abgeschlossen hast.", "{map} se abre cuando completas {other}.",
  "{map} si apre quando completi {other}.", "{map} abre quando concluíres {other}.", "Magbubukas ang {map} kapag natapos mo ang {other}.",
  "{other} ஐ முடித்ததும் {map} திறக்கும்.", "{map} terbuka setelah kamu menuntaskan {other}.", "通关{other}后，{map}开放。", "通關{other}後，{map}開放。",
  "{other}をクリアすると{map}が開きます。", "{other}을(를) 클리어하면 {map}이(가) 열려요."],
"{map} opens once you beat {code} {fight}.": [
  "{map} s’ouvre une fois {code} {fight} remporté.", "{map} öffnet sich, sobald du {code} {fight} gewonnen hast.", "{map} se abre cuando ganas {code} {fight}.",
  "{map} si apre quando vinci {code} {fight}.", "{map} abre quando venceres {code} {fight}.", "Magbubukas ang {map} kapag natalo mo ang {code} {fight}.",
  "{code} {fight} ஐ வென்றதும் {map} திறக்கும்.", "{map} terbuka setelah kamu memenangkan {code} {fight}.", "赢下 {code} {fight} 后，{map}开放。", "贏下 {code} {fight} 後，{map}開放。",
  "{code} {fight}に勝つと{map}が開きます。", "{code} {fight}에서 이기면 {map}이(가) 열려요."],
"{map} opens once you clear {prev}. Still to win: {codes}.": [
  "{map} s’ouvre une fois {prev} terminée. Encore à gagner : {codes}.", "{map} öffnet sich, sobald du {prev} abgeschlossen hast. Noch zu gewinnen: {codes}.",
  "{map} se abre cuando completas {prev}. Aún por ganar: {codes}.", "{map} si apre quando completi {prev}. Ancora da vincere: {codes}.",
  "{map} abre quando concluíres {prev}. Ainda por vencer: {codes}.", "Magbubukas ang {map} kapag natapos mo ang {prev}. Kailangan pang ipanalo: {codes}.",
  "{prev} ஐ முடித்ததும் {map} திறக்கும். இன்னும் வெல்ல வேண்டியவை: {codes}.", "{map} terbuka setelah kamu menuntaskan {prev}. Masih harus dimenangkan: {codes}.",
  "通关{prev}后，{map}开放。还需赢下：{codes}。", "通關{prev}後，{map}開放。還需贏下：{codes}。",
  "{prev}をクリアすると{map}が開きます。残り：{codes}。", "{prev}을(를) 클리어하면 {map}이(가) 열려요. 남은 전투: {codes}."],
"{map} is not open yet.": [
  "{map} n’est pas encore ouverte.", "{map} ist noch nicht offen.", "{map} aún no está abierto.", "{map} non è ancora aperta.", "{map} ainda não está aberto.", "Hindi pa bukas ang {map}.",
  "{map} இன்னும் திறக்கவில்லை.", "{map} belum terbuka.", "{map}尚未开放。", "{map}尚未開放。", "{map}はまだ開いていません。", "{map}은(는) 아직 열리지 않았어요."],
"Thistlewood is the next one along. Want to see where it sits?": [
  "Bois-Chardon est la prochaine. Vous voulez voir où elle se trouve ?", "Distelwald ist der nächste. Willst du sehen, wo er liegt?",
  "Bosque de Cardos es el siguiente. ¿Quieres ver dónde está?", "Bosco dei Cardi è il prossimo. Vuoi vedere dove si trova?",
  "Bosque dos Cardos é o próximo. Queres ver onde fica?", "Gubat ng Dawag ang susunod. Gusto mong makita kung nasaan ito?",
  "அடுத்தது முட்செடிக் காடு. அது எங்கே இருக்கிறது என்று பார்க்கலாமா?", "Hutan Duri yang berikutnya. Mau lihat letaknya?",
  "下一个是蓟木林。要看看它在哪儿吗？", "下一個是薊木林。要看看它在哪兒嗎？", "次はアザミの森だ。どこにあるか見てみる？", "다음은 엉겅퀴 숲이에요. 어디 있는지 볼래요?"],
"Back to {map}": ["Retour à {map}", "Zurück zu {map}", "Volver a {map}", "Torna a {map}", "Voltar a {map}", "Bumalik sa {map}", "{map} க்குத் திரும்பு", "Kembali ke {map}", "返回{map}", "返回{map}", "{map}に戻る", "{map}(으)로 돌아가기"],
}
RETIRED_UI = ["Clovermead is the next one along. Want to see where it sits?"]
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        uichanged = False
        for en in RETIRED_UI:  # the signpost's old line (it named Clovermead); its literal row lives in lang/ui
            if en in uipack: uipack.pop(en); uichanged = True
        if uichanged:
            with open(ui, 'w', encoding='utf-8') as fh:
                json.dump(uipack, fh, ensure_ascii=False, indent=1); fh.write('\n')
        for en, row in T.items():
            if en in pack or en in uipack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
