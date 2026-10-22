#!/usr/bin/env python3
"""Game texts added on 2026-10-23 by package RW3 (owner answers of 00:10): the Shop's Raid Ticket stock (in stock / sold out / not today)
and the one-time note that card levels are per copy again (the Forge). Same rules as i18n_2026_10_23_tu2.py: keys are the English as the
page translator sees it, every {placeholder} is kept, a row a pack already has is left as the pack has it. Tagalog, Tamil, Japanese and
Korean deserve a native read.

    python3 tools/i18n_2026_10_23_rw3.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Sold out": ["Épuisé", "Ausverkauft", "Agotado", "Esaurito", "Esgotado", "Ubos na", "விற்றுத் தீர்ந்தது", "Habis", "已售罄", "已售罄", "売り切れ", "품절"],
"Not today": ["Pas aujourd’hui", "Heute nicht", "Hoy no", "Non oggi", "Hoje não", "Wala ngayon", "இன்று இல்லை", "Tidak hari ini", "今天没有", "今天沒有", "今日はなし", "오늘은 없음"],
"In stock: {n}": ["En stock : {n}", "Vorrätig: {n}", "En existencias: {n}", "Disponibili: {n}", "Em stock: {n}", "May stock: {n}", "கையிருப்பு: {n}", "Stok: {n}", "库存：{n}", "庫存：{n}", "在庫：{n}", "재고: {n}"],
"Sold out. The cart has a Raid Ticket only on some days, one at a time.": [
  "Épuisé. La charrette n’a un ticket de raid que certains jours, un seul à la fois.",
  "Ausverkauft. Der Karren hat nur an manchen Tagen ein Raid-Ticket, immer nur eins.",
  "Agotado. El carro solo tiene un boleto de incursión algunos días, uno cada vez.",
  "Esaurito. Il carretto ha un biglietto per l’incursione solo in certi giorni, uno alla volta.",
  "Esgotado. A carroça só tem um bilhete de incursão em alguns dias, um de cada vez.",
  "Ubos na. May Raid Ticket ang kariton sa ilang araw lang, isa-isa.",
  "விற்றுத் தீர்ந்தது. வண்டியில் சில நாட்களில் மட்டுமே ஒரு ரெய்டு டிக்கெட் இருக்கும், ஒரு நேரத்தில் ஒன்று.",
  "Habis. Gerobak hanya punya Tiket Raid pada hari-hari tertentu, satu per satu.",
  "已售罄。货车只在某些日子有突袭券，每次一张。", "已售罄。貨車只在某些日子有突襲券，每次一張。",
  "売り切れ。荷車にレイドチケットがあるのは一部の日だけで、一度に1枚です。", "품절. 수레에는 레이드 티켓이 어떤 날에만, 한 번에 한 장씩 있어요."],
"Not in stock today. Admin Mode shows it anyway.": [
  "Pas en stock aujourd’hui. Le mode admin l’affiche quand même.", "Heute nicht vorrätig. Der Admin-Modus zeigt es trotzdem.",
  "Hoy no hay existencias. El modo administrador lo muestra igualmente.", "Oggi non disponibile. La modalità admin lo mostra comunque.",
  "Hoje não há stock. O modo de administrador mostra-o na mesma.", "Walang stock ngayon. Ipinapakita pa rin ito ng Admin Mode.",
  "இன்று கையிருப்பில் இல்லை. நிர்வாகப் பயன்முறை இருந்தாலும் காட்டும்.", "Hari ini tidak ada stok. Mode Admin tetap menampilkannya.",
  "今天没有库存。管理员模式仍会显示。", "今天沒有庫存。管理員模式仍會顯示。", "今日は在庫がありません。管理者モードでは表示されます。", "오늘은 재고가 없어요. 관리자 모드에서는 그래도 보여요."],
"Each copy of a card has its own level again. Every copy kept the level it had; the Forge now works on one copy at a time.": [
  "Chaque exemplaire d’une carte a de nouveau son propre niveau. Chaque exemplaire a gardé son niveau ; la Forge travaille maintenant un exemplaire à la fois.",
  "Jede Kopie einer Karte hat wieder ihre eigene Stufe. Jede Kopie hat ihre Stufe behalten; die Schmiede bearbeitet jetzt eine Kopie nach der anderen.",
  "Cada copia de una carta vuelve a tener su propio nivel. Todas las copias conservan el nivel que tenían; la Forja trabaja ahora una copia cada vez.",
  "Ogni copia di una carta ha di nuovo il suo livello. Ogni copia ha mantenuto il livello che aveva; la Forgia ora lavora una copia alla volta.",
  "Cada cópia de uma carta volta a ter o seu próprio nível. Todas as cópias mantiveram o nível que tinham; a Forja trabalha agora uma cópia de cada vez.",
  "May sariling antas na ulit ang bawat kopya ng card. Naitago ng bawat kopya ang antas nito; isa-isang kopya na ang ginagawa ng Forge.",
  "ஒவ்வொரு அட்டைப் பிரதிக்கும் மீண்டும் தனி நிலை உண்டு. ஒவ்வொரு பிரதியும் தன் நிலையை வைத்துக்கொண்டது; பட்டறை இப்போது ஒரு நேரத்தில் ஒரு பிரதியில் வேலை செய்யும்.",
  "Setiap salinan kartu kembali punya levelnya sendiri. Setiap salinan tetap di levelnya; Tempa kini mengerjakan satu salinan sekaligus.",
  "每张卡牌的每个副本又有各自的等级了。每个副本都保留了原来的等级；锻造炉现在一次处理一个副本。",
  "每張卡牌的每個副本又有各自的等級了。每個副本都保留了原來的等級；鍛造爐現在一次處理一個副本。",
  "カードのコピーはそれぞれ自分のレベルに戻りました。どのコピーも元のレベルのままです。鍛冶場は一度に1枚ずつ鍛えます。",
  "카드의 사본마다 다시 각자의 레벨이 있어요. 모든 사본은 원래 레벨을 유지했고, 이제 대장간은 한 번에 사본 하나씩 다뤄요."],
}
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
        for en, row in T.items():
            if en in pack or en in uipack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
