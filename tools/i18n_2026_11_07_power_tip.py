# 2026-11-07: card power tip reworded after centring the number on the median card (owner 11-06 23:35 #7: "0 means average").
# Renames the English key in place in each lang/<code>.json (order kept) with the new translation.
import re
OLD = "Win rate in the card power test, minus 50. 0 is average (it wins half its fights); above 0 is stronger, below 0 is weaker."
NEW = "Card power test: how much better or worse this card does than the average card. 0 is average; above 0 is stronger, below 0 is weaker."
TR = {
 "fr": "Test de puissance : à quel point cette carte fait mieux ou moins bien que la carte moyenne. 0 = moyenne ; au-dessus de 0, plus forte ; en dessous, plus faible.",
 "de": "Kartenstärke-Test: wie viel besser oder schlechter diese Karte abschneidet als die Durchschnittskarte. 0 ist Durchschnitt; über 0 stärker, unter 0 schwächer.",
 "es": "Prueba de poder: cuánto mejor o peor rinde esta carta que la carta media. 0 es la media; por encima de 0, más fuerte; por debajo, más débil.",
 "it": "Test di potenza: quanto questa carta fa meglio o peggio della carta media. 0 è la media; sopra 0 più forte, sotto 0 più debole.",
 "pt": "Teste de poder: quanto esta carta se sai melhor ou pior que a carta média. 0 é a média; acima de 0, mais forte; abaixo, mais fraca.",
 "tl": "Pagsubok sa lakas: gaano kahusay o kahina ang kard na ito kumpara sa karaniwang kard. 0 ang karaniwan; lampas sa 0 ay mas malakas, mas mababa sa 0 ay mas mahina.",
 "ta": "அட்டை வலிமைச் சோதனை: சராசரி அட்டையை விட இந்த அட்டை எவ்வளவு சிறப்பாக அல்லது மோசமாகச் செயல்படுகிறது. 0 சராசரி; 0க்கு மேல் வலிமையானது, 0க்குக் கீழ் பலவீனமானது.",
 "id": "Uji kekuatan kartu: seberapa jauh kartu ini lebih baik atau lebih buruk daripada kartu rata-rata. 0 berarti rata-rata; di atas 0 lebih kuat, di bawah 0 lebih lemah.",
 "zh-Hans": "卡牌强度测试：这张卡比平均卡牌表现好多少或差多少。0 为平均；高于 0 更强，低于 0 更弱。",
 "zh-Hant": "卡牌強度測試：這張卡比平均卡牌表現好多少或差多少。0 為平均；高於 0 更強，低於 0 更弱。",
 "ja": "カードパワーテスト：平均的なカードと比べてどれだけ強いか弱いか。0 が平均、0 より上は強く、下は弱い。",
 "ko": "카드 파워 테스트: 평균 카드보다 이 카드가 얼마나 더 잘하거나 못하는지. 0이 평균이며, 0보다 높으면 강하고 낮으면 약합니다.",
}
for code, tr in TR.items():
    p = f"lang/{code}.json"; L = open(p, encoding="utf-8").read().split("\n")
    for i, l in enumerate(L):
        if l.startswith(' "' + OLD + '":'):
            L[i] = ' ' + __import__("json").dumps(NEW, ensure_ascii=False) + ': ' + __import__("json").dumps(tr, ensure_ascii=False) + (',' if l.rstrip().endswith(',') else '')
    open(p, "w", encoding="utf-8").write("\n".join(L))
s = open("bramblewood-texts.js", encoding="utf-8").read()
open("bramblewood-texts.js", "w", encoding="utf-8").write(s.replace(OLD, NEW))
