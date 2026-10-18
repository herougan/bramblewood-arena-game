#!/usr/bin/env python3
"""Bug Hunters texts (2026-10-18, owner 21:57: "In the comments programme, add a text about a bug-hunter programme with incentives."):
the box in the feedback window. Same rules as i18n_2026_10_18t.py.

    python3 tools/i18n_2026_10_19_bughunt.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"🐞 Bug Hunters": ["🐞 Chasseurs de bugs", "🐞 Bugjäger", "🐞 Cazadores de bugs", "🐞 Cacciatori di bug", "🐞 Caçadores de bugs", "🐞 Mga Bug Hunter", "🐞 பிழை வேட்டையர்", "🐞 Pemburu Bug", "🐞 漏洞猎人", "🐞 漏洞獵人", "🐞 バグハンター", "🐞 버그 헌터"],
"Found a bug? Pick 🐞 Bug and say what happened and how to make it happen again.": [
  "Un bug ? Choisissez 🐞 Bug et dites ce qui s’est passé et comment le reproduire.",
  "Einen Bug gefunden? Wähle 🐞 Bug und schreib, was passiert ist und wie man es wiederholt.",
  "¿Un bug? Elige 🐞 Bug y cuenta qué pasó y cómo repetirlo.",
  "Trovato un bug? Scegli 🐞 Bug e racconta cosa è successo e come ripeterlo.",
  "Encontraste um bug? Escolhe 🐞 Bug e diz o que aconteceu e como o repetir.",
  "May nakitang bug? Piliin ang 🐞 Bug at sabihin ang nangyari at paano ito mauulit.",
  "பிழை கண்டீர்களா? 🐞 பிழை என்பதைத் தேர்ந்தெடுத்து, என்ன நடந்தது, மீண்டும் எப்படி நிகழ்த்துவது என்று சொல்லுங்கள்.",
  "Menemukan bug? Pilih 🐞 Bug dan ceritakan apa yang terjadi serta cara mengulanginya.",
  "发现漏洞？选择 🐞 漏洞，说说发生了什么，以及怎样让它再次出现。",
  "發現漏洞？選擇 🐞 漏洞，說說發生了什麼，以及怎樣讓它再次出現。",
  "バグを見つけた？ 🐞 バグを選んで、何が起きたか、どうすればまた起きるかを書いてください。",
  "버그를 찾았나요? 🐞 버그를 고르고 무슨 일이 있었는지, 어떻게 다시 일어나는지 알려 주세요."],
"The first report of each bug we confirm earns 🍁 Maple Leaves. Big finds earn more.": [
  "Le premier signalement de chaque bug confirmé rapporte des 🍁 Feuilles d’érable. Les grosses trouvailles rapportent plus.",
  "Die erste Meldung jedes bestätigten Bugs bringt 🍁 Ahornblätter. Große Funde bringen mehr.",
  "El primer aviso de cada bug confirmado gana 🍁 Hojas de arce. Los grandes hallazgos ganan más.",
  "La prima segnalazione di ogni bug confermato vale 🍁 Foglie d’acero. Le grandi scoperte valgono di più.",
  "O primeiro aviso de cada bug confirmado ganha 🍁 Folhas de ácer. Grandes descobertas ganham mais.",
  "Ang unang ulat ng bawat bug na makumpirma namin ay may 🍁 Maple Leaves. Mas malaki ang gantimpala sa malalaking tuklas.",
  "நாங்கள் உறுதிசெய்யும் ஒவ்வொரு பிழையின் முதல் அறிக்கைக்கும் 🍁 மேப்பிள் இலைகள் கிடைக்கும். பெரிய கண்டுபிடிப்புகளுக்கு அதிகம்.",
  "Laporan pertama tiap bug yang kami pastikan mendapat 🍁 Daun Maple. Temuan besar mendapat lebih banyak.",
  "每个经我们确认的漏洞，第一位报告者可获得 🍁 枫叶。重大发现奖励更多。",
  "每個經我們確認的漏洞，第一位回報者可獲得 🍁 楓葉。重大發現獎勵更多。",
  "確認されたバグの最初の報告者には 🍁 メープルリーフ。大きな発見ほど多くもらえます。",
  "저희가 확인한 버그를 처음 알려 주면 🍁 단풍잎을 드려요. 큰 발견일수록 더 많이 드려요."],
"Top hunters earn the 🐞 Bug Hunter title.": [
  "Les meilleurs chasseurs gagnent le titre 🐞 Chasseur de bugs.",
  "Die besten Jäger erhalten den Titel 🐞 Bugjäger.",
  "Los mejores cazadores ganan el título 🐞 Cazador de bugs.",
  "I migliori cacciatori ottengono il titolo 🐞 Cacciatore di bug.",
  "Os melhores caçadores ganham o título 🐞 Caçador de bugs.",
  "Makukuha ng pinakamahuhusay ang titulong 🐞 Bug Hunter.",
  "சிறந்த வேட்டையர்களுக்கு 🐞 பிழை வேட்டையர் பட்டம் கிடைக்கும்.",
  "Pemburu terbaik mendapat gelar 🐞 Pemburu Bug.",
  "顶尖猎人可获得 🐞 漏洞猎人称号。",
  "頂尖獵人可獲得 🐞 漏洞獵人稱號。",
  "トップハンターには 🐞 バグハンターの称号。",
  "최고의 헌터에게는 🐞 버그 헌터 칭호를 드려요."],
}
assert all(len(v) == len(CODES) for v in T.values())
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        items = [(k, v) for k, v in pack.items() if k not in T]
        for en, row in T.items():
            at = next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items))
            items.insert(at, (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
