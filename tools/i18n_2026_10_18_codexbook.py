#!/usr/bin/env python3
"""Package C texts (2026-10-18, owner 20:31/20:36): the Codex's card album, the skills book and the collection score, in the 12 packs.
The English is the TX table's (bramblewood-texts.js, keys ui.codex-*, ui.book-*, ui.score-*); the packs are keyed by that English.
Same rules as i18n_2026_10_18t.py (every {placeholder} kept). tests/codex-book-2026-10-19.js and tests/i18n-templates-2026-10-18.js
check every pack.

    python3 tools/i18n_2026_10_18_codexbook.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"View: Album": ["Vue : Album", "Ansicht: Album", "Vista: Álbum", "Vista: Album", "Vista: Álbum", "Tingnan: Album", "காட்சி: ஆல்பம்", "Tampilan: Album", "视图：卡册", "檢視：卡冊", "表示：アルバム", "보기: 앨범"],
"All rarities": ["Toutes les raretés", "Alle Seltenheiten", "Todas las rarezas", "Tutte le rarità", "Todas as raridades", "Lahat ng rarity", "எல்லா அரிதுத்தன்மைகளும்", "Semua kelangkaan", "所有稀有度", "所有稀有度", "すべてのレア度", "모든 희귀도"],
"Card album": ["Album de cartes", "Kartenalbum", "Álbum de cartas", "Album delle carte", "Álbum de cartas", "Album ng card", "அட்டை ஆல்பம்", "Album kartu", "卡册", "卡冊", "カードアルバム", "카드 앨범"],
"(cont.)": ["(suite)", "(Forts.)", "(cont.)", "(segue)", "(cont.)", "(karugtong)", "(தொடர்ச்சி)", "(lanj.)", "（续）", "（續）", "（続き）", "(계속)"],
"Page {n} of {total}": ["Page {n} sur {total}", "Seite {n} von {total}", "Página {n} de {total}", "Pagina {n} di {total}", "Página {n} de {total}", "Pahina {n} ng {total}", "பக்கம் {n} / {total}", "Halaman {n} dari {total}", "第 {n} 页，共 {total} 页", "第 {n} 頁，共 {total} 頁", "{total} ページ中 {n} ページ", "{total}쪽 중 {n}쪽"],
"Pages {n}–{to} of {total}": ["Pages {n}–{to} sur {total}", "Seiten {n}–{to} von {total}", "Páginas {n}–{to} de {total}", "Pagine {n}–{to} di {total}", "Páginas {n}–{to} de {total}", "Pahina {n}–{to} ng {total}", "பக்கங்கள் {n}–{to} / {total}", "Halaman {n}–{to} dari {total}", "第 {n}–{to} 页，共 {total} 页", "第 {n}–{to} 頁，共 {total} 頁", "{total} ページ中 {n}–{to} ページ", "{total}쪽 중 {n}–{to}쪽"],
"Previous page": ["Page précédente", "Vorherige Seite", "Página anterior", "Pagina precedente", "Página anterior", "Nakaraang pahina", "முந்தைய பக்கம்", "Halaman sebelumnya", "上一页", "上一頁", "前のページ", "이전 쪽"],
"Next page": ["Page suivante", "Nächste Seite", "Página siguiente", "Pagina successiva", "Página seguinte", "Susunod na pahina", "அடுத்த பக்கம்", "Halaman berikutnya", "下一页", "下一頁", "次のページ", "다음 쪽"],
"Turn the page": ["Tourner la page", "Umblättern", "Pasar página", "Gira pagina", "Virar a página", "Ilipat ang pahina", "பக்கத்தைப் புரட்டு", "Balik halaman", "翻页", "翻頁", "ページをめくる", "쪽 넘기기"],
"Go to section…": ["Aller à la section…", "Zum Abschnitt…", "Ir a la sección…", "Vai alla sezione…", "Ir para a secção…", "Pumunta sa seksiyon…", "பிரிவுக்குச் செல்…", "Ke bagian…", "前往分区…", "前往分區…", "セクションへ移動…", "구역으로 이동…"],
"{n} seen · {count} owned": ["{n} vues · {count} possédées", "{n} gesehen · {count} im Besitz", "{n} vistas · {count} tuyas", "{n} viste · {count} possedute", "{n} vistas · {count} tuas", "{n} nakita · {count} pag-aari", "{n} பார்த்தவை · {count} உங்களுடையவை", "{n} dilihat · {count} dimiliki", "见过 {n} · 拥有 {count}", "見過 {n} · 擁有 {count}", "{n} 枚発見 · {count} 枚所持", "{n}장 발견 · {count}장 보유"],
"No cards in this view yet.": ["Aucune carte dans cette vue pour l’instant.", "In dieser Ansicht gibt es noch keine Karten.", "Todavía no hay cartas en esta vista.", "Ancora nessuna carta in questa vista.", "Ainda não há cartas nesta vista.", "Wala pang card sa view na ito.", "இந்தக் காட்சியில் இன்னும் அட்டைகள் இல்லை.", "Belum ada kartu di tampilan ini.", "此视图中还没有卡。", "此檢視中還沒有卡。", "この表示にはまだカードがありません。", "이 보기에는 아직 카드가 없어요."],
"Skills": ["Compétences", "Fähigkeiten", "Habilidades", "Abilità", "Habilidades", "Mga Kakayahan", "திறன்கள்", "Keahlian", "技能", "技能", "スキル", "스킬"],
"Field effects": ["Effets de terrain", "Feldeffekte", "Efectos de campo", "Effetti del campo", "Efeitos de campo", "Mga epekto sa larangan", "கள விளைவுகள்", "Efek medan", "场地效果", "場地效果", "フィールド効果", "필드 효과"],
"Contents": ["Sommaire", "Inhalt", "Índice", "Indice", "Índice", "Nilalaman", "உள்ளடக்கம்", "Daftar isi", "目录", "目錄", "目次", "차례"],
"A to Z": ["De A à Z", "A bis Z", "De la A a la Z", "Dalla A alla Z", "De A a Z", "A hanggang Z", "A முதல் Z வரை", "A sampai Z", "A 到 Z", "A 到 Z", "A から Z", "A부터 Z까지"],
"{n} seen": ["{n} vus", "{n} gesehen", "{n} vistos", "{n} visti", "{n} vistos", "{n} nakita", "{n} பார்த்தவை", "{n} dilihat", "见过 {n}", "見過 {n}", "{n} 件発見", "{n}개 발견"],
"Every skill and field effect you've seen: what it does, and what answers it. A basic skill shows as ? once you reach its map.": [
  "Chaque compétence et effet de terrain que vous avez vus : ce qu’ils font et ce qui les contre. Une compétence de base apparaît en ? dès que vous atteignez sa carte.",
  "Jede Fähigkeit und jeder Feldeffekt, den du gesehen hast: was sie tun und was sie kontert. Eine Grundfähigkeit erscheint als ?, sobald du ihre Karte erreichst.",
  "Cada habilidad y efecto de campo que has visto: qué hace y qué lo contrarresta. Una habilidad básica aparece como ? en cuanto llegas a su mapa.",
  "Ogni abilità ed effetto del campo che hai visto: cosa fa e cosa lo contrasta. Un’abilità di base appare come ? appena raggiungi la sua mappa.",
  "Cada habilidade e efeito de campo que já viste: o que faz e o que o contraria. Uma habilidade básica aparece como ? assim que chegas ao seu mapa.",
  "Bawat kakayahan at epekto sa larangan na nakita mo: ano ang ginagawa nito at ano ang sumasagot dito. Lilitaw na ? ang isang batayang kakayahan pagdating mo sa mapa nito.",
  "நீங்கள் பார்த்த ஒவ்வொரு திறனும் கள விளைவும்: அது என்ன செய்கிறது, அதை எது எதிர்க்கிறது. ஓர் அடிப்படைத் திறன், அதன் வரைபடத்தை அடைந்ததும் ? ஆகக் காட்டும்.",
  "Setiap keahlian dan efek medan yang sudah kamu lihat: apa gunanya dan apa penangkalnya. Keahlian dasar tampil sebagai ? begitu kamu mencapai petanya.",
  "你见过的每个技能和场地效果：它们的作用，以及什么能克制它们。基础技能在你到达它的地图后显示为 ?。",
  "你見過的每個技能和場地效果：它們的作用，以及什麼能克制它們。基礎技能在你到達它的地圖後顯示為 ?。",
  "これまでに見たすべてのスキルとフィールド効果：その働きと、対抗手段。基本スキルは、そのマップに着くと ? で表示されます。",
  "지금까지 본 모든 스킬과 필드 효과: 하는 일과 대응 수단. 기본 스킬은 그 맵에 도착하면 ?로 표시돼요."],
"Admin: every skill and field effect.": ["Admin : toutes les compétences et tous les effets de terrain.", "Admin: alle Fähigkeiten und Feldeffekte.", "Admin: todas las habilidades y efectos de campo.", "Admin: tutte le abilità e gli effetti del campo.", "Admin: todas as habilidades e efeitos de campo.", "Admin: lahat ng kakayahan at epekto sa larangan.", "நிர்வாகி: எல்லாத் திறன்களும் கள விளைவுகளும்.", "Admin: semua keahlian dan efek medan.", "管理员：所有技能和场地效果。", "管理員：所有技能和場地效果。", "管理者：すべてのスキルとフィールド効果。", "관리자: 모든 스킬과 필드 효과."],
"Filter skills…": ["Filtrer les compétences…", "Fähigkeiten filtern…", "Filtrar habilidades…", "Filtra abilità…", "Filtrar habilidades…", "I-filter ang mga kakayahan…", "திறன்களை வடிகட்டு…", "Saring keahlian…", "筛选技能…", "篩選技能…", "スキルを絞り込む…", "스킬 필터…"],
"{n} of {total} match": ["{n} sur {total} correspondent", "{n} von {total} passen", "{n} de {total} coinciden", "{n} su {total} corrispondono", "{n} de {total} correspondem", "{n} sa {total} ang tugma", "{total} இல் {n} பொருந்துகின்றன", "{n} dari {total} cocok", "{total} 个中有 {n} 个匹配", "{total} 個中有 {n} 個相符", "{total} 件中 {n} 件が一致", "{total}개 중 {n}개 일치"],
"No skill matches that.": ["Aucune compétence ne correspond.", "Keine Fähigkeit passt dazu.", "Ninguna habilidad coincide.", "Nessuna abilità corrisponde.", "Nenhuma habilidade corresponde.", "Walang kakayahang tugma diyan.", "அதற்குப் பொருந்தும் திறன் இல்லை.", "Tidak ada keahlian yang cocok.", "没有匹配的技能。", "沒有相符的技能。", "一致するスキルはありません。", "일치하는 스킬이 없어요."],
"Nothing here yet. Skills and field effects appear once you've seen them.": [
  "Rien pour l’instant. Les compétences et effets de terrain apparaissent une fois vus.",
  "Noch nichts hier. Fähigkeiten und Feldeffekte erscheinen, sobald du sie gesehen hast.",
  "Aún no hay nada. Las habilidades y los efectos de campo aparecen cuando los has visto.",
  "Ancora niente. Abilità ed effetti del campo compaiono quando li hai visti.",
  "Ainda nada aqui. As habilidades e os efeitos de campo aparecem depois de os veres.",
  "Wala pa rito. Lilitaw ang mga kakayahan at epekto sa larangan kapag nakita mo na.",
  "இங்கே இன்னும் எதுவும் இல்லை. திறன்களும் கள விளைவுகளும் நீங்கள் பார்த்ததும் தோன்றும்.",
  "Belum ada apa-apa. Keahlian dan efek medan muncul setelah kamu melihatnya.",
  "这里还没有内容。技能和场地效果在你见过之后出现。",
  "這裡還沒有內容。技能和場地效果在你見過之後出現。",
  "まだ何もありません。スキルとフィールド効果は、一度見ると載ります。",
  "아직 아무것도 없어요. 스킬과 필드 효과는 한 번 보면 나타나요."],
"You'll meet this one on the road soon.": ["Vous la rencontrerez bientôt en chemin.", "Dieser begegnest du bald unterwegs.", "Pronto la encontrarás por el camino.", "La incontrerai presto lungo la strada.", "Vais encontrá-la em breve pelo caminho.", "Makikita mo ito sa daan sa lalong madaling panahon.", "இதை விரைவில் வழியில் சந்திப்பீர்கள்.", "Kamu akan segera menemuinya di perjalanan.", "你很快会在路上遇到它。", "你很快會在路上遇到它。", "もうすぐ道中で出会います。", "곧 길에서 만나게 될 거예요."],
"Go to page {n}": ["Aller à la page {n}", "Zu Seite {n}", "Ir a la página {n}", "Vai a pagina {n}", "Ir para a página {n}", "Pumunta sa pahina {n}", "பக்கம் {n} க்குச் செல்", "Ke halaman {n}", "前往第 {n} 页", "前往第 {n} 頁", "{n} ページへ", "{n}쪽으로 이동"],
"Collection score": ["Score de collection", "Sammlungswert", "Puntuación de colección", "Punteggio collezione", "Pontuação da coleção", "Iskor ng koleksiyon", "சேகரிப்பு மதிப்பெண்", "Skor koleksi", "收藏分数", "收藏分數", "コレクションスコア", "컬렉션 점수"],
"Every card you own, added up by its level": ["Chaque carte que vous possédez, additionnée selon son niveau", "Jede Karte in deinem Besitz, nach ihrer Stufe zusammengezählt", "Cada carta que tienes, sumada por su nivel", "Ogni carta che possiedi, sommata per il suo livello", "Cada carta que tens, somada pelo seu nível", "Bawat card na pag-aari mo, pinagsama ayon sa level nito", "உங்களிடமுள்ள ஒவ்வோர் அட்டையும், அதன் நிலைப்படி கூட்டப்பட்டது", "Setiap kartu milikmu, dijumlahkan menurut levelnya", "你拥有的每张卡，按等级相加", "你擁有的每張卡，按等級相加", "所持カードすべてのレベルの合計", "보유한 모든 카드의 레벨 합계"],
"{n} of {total} cards": ["{n} cartes sur {total}", "{n} von {total} Karten", "{n} de {total} cartas", "{n} carte su {total}", "{n} de {total} cartas", "{n} sa {total} card", "{total} இல் {n} அட்டைகள்", "{n} dari {total} kartu", "{total} 张卡中的 {n} 张", "{total} 張卡中的 {n} 張", "{total} 枚中 {n} 枚", "카드 {total}장 중 {n}장"],
"{n} of {total} brambles": ["{n} ronces sur {total}", "{n} von {total} Dornenhecken", "{n} de {total} zarzas", "{n} rovi su {total}", "{n} de {total} silvas", "{n} sa {total} dawag", "{total} இல் {n} முட்புதர்கள்", "{n} dari {total} semak", "{total} 个荆棘中的 {n} 个", "{total} 個荊棘中的 {n} 個", "{total} 個中 {n} 個のいばら", "덤불 {total}개 중 {n}개"],
"{n} of {total} achievements": ["{n} succès sur {total}", "{n} von {total} Erfolgen", "{n} de {total} logros", "{n} obiettivi su {total}", "{n} de {total} conquistas", "{n} sa {total} tagumpay", "{total} இல் {n} சாதனைகள்", "{n} dari {total} pencapaian", "{total} 个成就中的 {n} 个", "{total} 個成就中的 {n} 個", "実績 {total} 件中 {n} 件", "업적 {total}개 중 {n}개"],
"{n} ready to claim": ["{n} à réclamer", "{n} zum Abholen bereit", "{n} listos para reclamar", "{n} da riscuotere", "{n} prontos a reclamar", "{n} handang kunin", "{n} பெறத் தயார்", "{n} siap diklaim", "{n} 个可领取", "{n} 個可領取", "{n} 件受け取れます", "{n}개 받을 수 있어요"],
"Open the Codex": ["Ouvrir le Codex", "Kodex öffnen", "Abrir el Códice", "Apri il Codex", "Abrir o Códice", "Buksan ang Codex", "குறியேட்டைத் திற", "Buka Kodeks", "打开图鉴", "打開圖鑑", "図鑑を開く", "도감 열기"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        # each new row goes in front of the first key that sorts after it; the rows already there keep their order (fewer merge clashes)
        items = [(k, v) for k, v in pack.items() if k not in T]
        for en, row in T.items():
            at = next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items))
            items.insert(at, (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
