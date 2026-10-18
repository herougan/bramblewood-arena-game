#!/usr/bin/env python3
"""Game texts added on 2026-10-18 by package DK (owner 23:54: "Playing a dungeon right now doesn't consume my key. It should. I can't
sweep past the number of keys I have. Forge lets you increase the number of keys to 5 (but requires Strange Materia)."): the daily
dungeons' key lines (keys left, the rule, no keys left, the refill), the Sweep's key cost and the Forge's 🗝️ Key ring; and (owner 00:08) the ⬆️ Upgrades tabs of the Forge, the Nest and the
Tavern, the Nest's build row and the Profile's upgrades summary. The rules
for a template row are those of i18n_2026_10_18d.py (every {placeholder} kept, side-by-side placeholders kept side by side and in
order). Keys are the English with the leading emoji peeled, as the page translator sees them. The dungeon / key / floor / Sweep
words follow the packs (clé de donjon, Verliesschlüssel, llave de mazmorra, 地牢钥匙...). It also drops the pack rows of the texts
this package retired: the 10-16 "key in the lock, a win gives it back" lines (main packs) and the old inline dungeon tab lines
(lang/ui).
Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_dungeon_keys.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
DROP = [
  "No Dungeon keys left. A new one comes tomorrow, and a bonus one every Monday.",
  "Your Dungeon key is in the lock: win and it comes back; lose and it's gone ({dungeonTicketsLeft} left in hand).",
  "A won floor gives your Dungeon key back, so you can keep climbing",
  "+1 Dungeon key ({n} in hand)",
  "Your Dungeon key is lost, and the climb starts again from floor 1 (you fell on floor {floor}; best: floor {best}).",
  "Sweep floor {floor}, your best: the CPU plays it for you. Each run costs {e}⚡; a win pays the clear-again reward.",
]
DROP_UI = [
  "A floor takes a Dungeon key. Win and you get it back; lose or forfeit and it's gone, and the climb starts again from floor 1. One key a day (up to {v1} banked) and a bonus one each Monday.",
  "Dungeon key{s} · one a day (up to {v1}), next in {v2}h · a bonus one every Monday",
  "Endless climbs, a little harder every floor. Each floor takes a key: win and it comes back; lose and it's gone, and the climb starts again from floor 1.",
  "Each floor costs Energy too, like any fight.",
  "Floor {v1}: keep climbing",
  "win and the key comes back",
  "next key in {v1}h",
]
T = {
"Sweep floor {floor}, your best: the CPU plays it for you. Each run costs {e}⚡ and a Dungeon key; a win pays the clear-again reward.": [
  "Balayer l’étage {floor}, votre meilleur : l’ordinateur le joue pour vous. Chaque passage coûte {e}⚡ et une clé de donjon ; une victoire rapporte la récompense de nouvelle victoire.",
  "Etage {floor} durchkämmen, dein bestes: Der Computer spielt es für dich. Jeder Lauf kostet {e}⚡ und einen Verliesschlüssel; ein Sieg bringt die Belohnung für erneutes Abschließen.",
  "Barrer el piso {floor}, tu mejor: la CPU lo juega por ti. Cada pasada cuesta {e}⚡ y una llave de mazmorra; una victoria paga la recompensa de repetición.",
  "Spazza il piano {floor}, il tuo migliore: lo gioca la CPU per te. Ogni giro costa {e}⚡ e una chiave del dungeon; una vittoria paga la ricompensa da ripetizione.",
  "Varrer o piso {floor}, o teu melhor: o CPU joga-o por ti. Cada volta custa {e}⚡ e uma chave da masmorra; uma vitória paga a recompensa de repetição.",
  "I-sweep ang palapag {floor}, ang pinakamataas mo: ang CPU ang maglalaro nito para sa iyo. Bawat takbo ay {e}⚡ at isang Susi ng Piitan; ang panalo ay nagbibigay ng gantimpala sa muling pagtapos.",
  "உங்கள் சிறந்த தளமான {floor} ஐத் துடையுங்கள்: கணினி உங்களுக்காக விளையாடும். ஒவ்வொரு ஓட்டத்துக்கும் {e}⚡ மற்றும் ஒரு நிலவறைச் சாவி; வெற்றி மீண்டும் வென்றதற்கான வெகுமதியைத் தரும்.",
  "Sapu lantai {floor}, yang terbaikmu: CPU memainkannya untukmu. Tiap putaran {e}⚡ dan satu kunci ruang bawah tanah; kemenangan memberi hadiah ulang.",
  "扫荡第 {floor} 层（你的最佳）：电脑替你打。每次消耗 {e}⚡ 和一把地牢钥匙；获胜可得重复通关奖励。",
  "掃蕩第 {floor} 層（你的最佳）：電腦替你打。每次消耗 {e}⚡ 和一把地牢鑰匙；獲勝可得重複通關獎勵。",
  "最高到達の{floor}階をスイープ：CPUが代わりに戦います。1回{e}⚡とダンジョンの鍵1本、勝てば再クリア報酬。",
  "최고 기록인 {floor}층 소탕: CPU가 대신 싸워요. 한 번에 {e}⚡와 던전 열쇠 1개, 이기면 재클리어 보상."],
"Key ring": [
  "Trousseau de clés", "Schlüsselbund", "Llavero", "Portachiavi", "Porta-chaves", "Singsing ng susi", "சாவிக் கொத்து",
  "Gantungan kunci", "钥匙环", "鑰匙環", "キーリング", "열쇠고리"],
"Your Dungeon keys fill up to this many each day.": [
  "Vos clés de donjon se remplissent jusqu’à ce nombre chaque jour.",
  "Deine Verliesschlüssel füllen sich jeden Tag bis zu dieser Zahl auf.",
  "Tus llaves de mazmorra se rellenan hasta este número cada día.",
  "Le tue chiavi del dungeon si ricaricano fino a questo numero ogni giorno.",
  "As tuas chaves da masmorra enchem até este número todos os dias.",
  "Napupuno ang mga Susi ng Piitan mo hanggang sa ganitong dami bawat araw.",
  "உங்கள் நிலவறைச் சாவிகள் ஒவ்வொரு நாளும் இந்த எண்ணிக்கை வரை நிரம்பும்.",
  "Kunci ruang bawah tanahmu terisi sampai sebanyak ini setiap hari.",
  "你的地牢钥匙每天补满到这个数量。",
  "你的地牢鑰匙每天補滿到這個數量。",
  "ダンジョンの鍵は毎日この数まで補充されます。",
  "던전 열쇠가 매일 이만큼까지 채워져요."],
"Holds {cap} Dungeon keys": [
  "Contient {cap} clés de donjon", "Fasst {cap} Verliesschlüssel", "Guarda {cap} llaves de mazmorra", "Contiene {cap} chiavi del dungeon",
  "Guarda {cap} chaves da masmorra", "May lamang na {cap} Susi ng Piitan", "{cap} நிலவறைச் சாவிகளை வைத்திருக்கும்", "Muat {cap} kunci ruang bawah tanah",
  "可存放 {cap} 把地牢钥匙", "可存放 {cap} 把地牢鑰匙", "ダンジョンの鍵を{cap}本まで持てる", "던전 열쇠 {cap}개 보관"],
"Next: holds {cap} keys": [
  "Ensuite : {cap} clés", "Als Nächstes: fasst {cap} Schlüssel", "Siguiente: guarda {cap} llaves", "Prossimo: contiene {cap} chiavi",
  "A seguir: guarda {cap} chaves", "Susunod: may lamang na {cap} susi", "அடுத்து: {cap} சாவிகள்", "Berikutnya: muat {cap} kunci",
  "下一级：可存放 {cap} 把钥匙", "下一級：可存放 {cap} 把鑰匙", "次：鍵を{cap}本まで", "다음: 열쇠 {cap}개 보관"],
"Widen the key ring": [
  "Agrandir le trousseau", "Schlüsselbund erweitern", "Ampliar el llavero", "Allarga il portachiavi", "Alargar o porta-chaves",
  "Palakihin ang singsing ng susi", "சாவிக் கொத்தை விரிவாக்கு", "Perbesar gantungan kunci", "扩大钥匙环", "擴大鑰匙環",
  "キーリングを広げる", "열쇠고리 넓히기"],
"Fully widened: {cap} keys.": [
  "Au maximum : {cap} clés.", "Voll erweitert: {cap} Schlüssel.", "Al máximo: {cap} llaves.", "Al massimo: {cap} chiavi.",
  "No máximo: {cap} chaves.", "Pinakamalaki na: {cap} susi.", "முழுமையாக விரிவாக்கப்பட்டது: {cap} சாவிகள்.", "Sudah maksimal: {cap} kunci.",
  "已扩到最大：{cap} 把钥匙。", "已擴到最大：{cap} 把鑰匙。", "最大まで広げた：鍵{cap}本。", "최대로 넓힘: 열쇠 {cap}개."],
"Not enough for the key ring yet: the button shows what it needs.": [
  "Pas encore assez pour le trousseau : le bouton indique ce qu’il faut.",
  "Noch nicht genug für den Schlüsselbund: Der Knopf zeigt, was fehlt.",
  "Aún no te alcanza para el llavero: el botón muestra lo que necesita.",
  "Non basta ancora per il portachiavi: il pulsante mostra cosa serve.",
  "Ainda não chega para o porta-chaves: o botão mostra o que é preciso.",
  "Kulang pa para sa singsing ng susi: makikita sa button ang kailangan.",
  "சாவிக் கொத்துக்கு இன்னும் போதவில்லை: தேவையானதைப் பொத்தான் காட்டும்.",
  "Belum cukup untuk gantungan kunci: tombolnya menunjukkan yang dibutuhkan.",
  "还不够扩大钥匙环：按钮上写着需要什么。",
  "還不夠擴大鑰匙環：按鈕上寫著需要什麼。",
  "キーリングにはまだ足りません：必要なものはボタンに表示されています。",
  "아직 열쇠고리에 부족해요: 필요한 것은 버튼에 나와 있어요."],
"The key ring now holds {cap} Dungeon keys.": [
  "Le trousseau contient maintenant {cap} clés de donjon.",
  "Der Schlüsselbund fasst jetzt {cap} Verliesschlüssel.",
  "El llavero ahora guarda {cap} llaves de mazmorra.",
  "Il portachiavi ora contiene {cap} chiavi del dungeon.",
  "O porta-chaves agora guarda {cap} chaves da masmorra.",
  "May lamang na ngayong {cap} Susi ng Piitan ang singsing ng susi.",
  "சாவிக் கொத்து இப்போது {cap} நிலவறைச் சாவிகளை வைத்திருக்கும்.",
  "Gantungan kunci kini muat {cap} kunci ruang bawah tanah.",
  "钥匙环现在可存放 {cap} 把地牢钥匙。",
  "鑰匙環現在可存放 {cap} 把地牢鑰匙。",
  "キーリングにダンジョンの鍵が{cap}本まで入るようになった。",
  "이제 열쇠고리에 던전 열쇠를 {cap}개까지 보관해요."],
"No Dungeon keys left. They fill up to {cap} in {h}h.": [
  "Plus de clé de donjon. Elles remontent à {cap} dans {h} h.",
  "Keine Verliesschlüssel mehr. In {h} Std. füllen sie sich auf {cap} auf.",
  "No te quedan llaves de mazmorra. Se rellenan hasta {cap} en {h} h.",
  "Nessuna chiave del dungeon rimasta. Tornano a {cap} tra {h}h.",
  "Já não tens chaves da masmorra. Voltam a {cap} daqui a {h} h.",
  "Wala nang Susi ng Piitan. Mapupuno ulit hanggang {cap} sa loob ng {h}h.",
  "நிலவறைச் சாவிகள் தீர்ந்துவிட்டன. {h} மணி நேரத்தில் {cap} வரை நிரம்பும்.",
  "Kunci ruang bawah tanah habis. Terisi lagi sampai {cap} dalam {h} jam.",
  "地牢钥匙用完了。{h} 小时后补满到 {cap} 把。",
  "地牢鑰匙用完了。{h} 小時後補滿到 {cap} 把。",
  "ダンジョンの鍵がありません。{h}時間後に{cap}本まで補充されます。",
  "던전 열쇠가 없어요. {h}시간 뒤에 {cap}개까지 채워져요."],
"Dungeon keys: {n}/{cap}": [
  "Clés de donjon : {n}/{cap}", "Verliesschlüssel: {n}/{cap}", "Llaves de mazmorra: {n}/{cap}", "Chiavi del dungeon: {n}/{cap}",
  "Chaves da masmorra: {n}/{cap}", "Mga Susi ng Piitan: {n}/{cap}", "நிலவறைச் சாவிகள்: {n}/{cap}", "Kunci ruang bawah tanah: {n}/{cap}",
  "地牢钥匙：{n}/{cap}", "地牢鑰匙：{n}/{cap}", "ダンジョンの鍵：{n}/{cap}", "던전 열쇠: {n}/{cap}"],
"Floor {floor}: keep climbing": [
  "Étage {floor} : continuez de grimper", "Etage {floor}: klettere weiter", "Piso {floor}: sigue subiendo", "Piano {floor}: continua a salire",
  "Piso {floor}: continua a subir", "Palapag {floor}: patuloy na umakyat", "தளம் {floor}: ஏறிக்கொண்டே இரு", "Lantai {floor}: terus mendaki",
  "第 {floor} 层：继续攀登", "第 {floor} 層：繼續攀登", "{floor}階：登り続けよう", "{floor}층: 계속 올라가요"],
"each floor uses a key": [
  "chaque étage coûte une clé", "jede Etage kostet einen Schlüssel", "cada piso gasta una llave", "ogni piano usa una chiave",
  "cada piso gasta uma chave", "bawat palapag ay gumagamit ng isang susi", "ஒவ்வொரு தளமும் ஒரு சாவியைப் பயன்படுத்தும்", "tiap lantai memakai satu kunci",
  "每层消耗一把钥匙", "每層消耗一把鑰匙", "1階ごとに鍵を1本使う", "층마다 열쇠 1개를 써요"],
"best: floor {floor}": [
  "record : étage {floor}", "Bestwert: Etage {floor}", "récord: piso {floor}", "migliore: piano {floor}", "melhor: piso {floor}",
  "pinakamataas: palapag {floor}", "சிறந்தது: தளம் {floor}", "terbaik: lantai {floor}", "最佳：第 {floor} 层", "最佳：第 {floor} 層",
  "最高：{floor}階", "최고: {floor}층"],
"keys refill in {h}h": [
  "clés rechargées dans {h} h", "Schlüssel füllen sich in {h} Std. auf", "las llaves se rellenan en {h} h", "chiavi ricaricate tra {h}h",
  "as chaves voltam daqui a {h} h", "mapupuno ang mga susi sa loob ng {h}h", "{h} மணி நேரத்தில் சாவிகள் நிரம்பும்", "kunci terisi lagi dalam {h} jam",
  "{h} 小时后补满钥匙", "{h} 小時後補滿鑰匙", "{h}時間後に鍵を補充", "{h}시간 뒤 열쇠 충전"],
"Each floor you fight uses a Dungeon key and its Energy, win or lose, and so does each Sweep run. Lose or forfeit a floor and the climb starts again from floor 1. Your keys fill up to {cap} each day, and a bonus one comes every Monday.": [
  "Chaque étage combattu coûte une clé de donjon et son Énergie, victoire ou défaite, tout comme chaque passage de Balayage. Perdez ou abandonnez un étage et l’ascension reprend à l’étage 1. Vos clés remontent à {cap} chaque jour, et une en bonus arrive chaque lundi.",
  "Jede Etage, die du kämpfst, kostet einen Verliesschlüssel und ihre Energie, ob Sieg oder Niederlage, und jeder Durchkämm-Lauf ebenso. Verlierst oder gibst du eine Etage auf, beginnt der Aufstieg wieder bei Etage 1. Deine Schlüssel füllen sich jeden Tag auf {cap} auf, und jeden Montag kommt ein Bonusschlüssel.",
  "Cada piso que peleas gasta una llave de mazmorra y su Energía, ganes o pierdas, y lo mismo cada pasada de Barrido. Si pierdes o abandonas un piso, la subida vuelve a empezar desde el piso 1. Tus llaves se rellenan hasta {cap} cada día, y cada lunes llega una extra.",
  "Ogni piano che combatti usa una chiave del dungeon e la sua Energia, che tu vinca o perda, e così ogni giro di Spazzata. Perdi o abbandoni un piano e la scalata ricomincia dal piano 1. Le tue chiavi tornano a {cap} ogni giorno, e ogni lunedì ne arriva una bonus.",
  "Cada piso que combates gasta uma chave da masmorra e a sua Energia, ganhes ou percas, e o mesmo cada volta de Varrimento. Se perderes ou desistires de um piso, a subida recomeça no piso 1. As tuas chaves voltam a {cap} todos os dias, e todas as segundas-feiras chega uma extra.",
  "Bawat palapag na nilalabanan mo ay gumagamit ng isang Susi ng Piitan at ng Enerhiya nito, manalo man o matalo, at ganoon din ang bawat takbo ng Sweep. Kapag natalo o sumuko ka sa isang palapag, magsisimula ulit ang akyat sa palapag 1. Napupuno ang mga susi mo hanggang {cap} bawat araw, at may bonus tuwing Lunes.",
  "நீங்கள் போரிடும் ஒவ்வொரு தளமும், வென்றாலும் தோற்றாலும், ஒரு நிலவறைச் சாவியையும் அதன் ஆற்றலையும் பயன்படுத்தும்; ஒவ்வொரு துடைப்பு ஓட்டமும் அப்படியே. ஒரு தளத்தில் தோற்றால் அல்லது விலகினால், ஏற்றம் மீண்டும் தளம் 1 இலிருந்து தொடங்கும். உங்கள் சாவிகள் ஒவ்வொரு நாளும் {cap} வரை நிரம்பும், ஒவ்வொரு திங்களும் ஒரு போனஸ் வரும்.",
  "Setiap lantai yang kamu lawan memakai satu kunci ruang bawah tanah dan Energinya, menang atau kalah, begitu juga tiap putaran Sapu. Kalah atau menyerah di satu lantai, pendakian mulai lagi dari lantai 1. Kuncimu terisi sampai {cap} setiap hari, dan ada bonus setiap Senin.",
  "每打一层都会消耗一把地牢钥匙和该层的能量，不论胜负；每次扫荡也一样。输掉或放弃一层，攀登就从第 1 层重新开始。你的钥匙每天补满到 {cap} 把，每周一还有一把额外的。",
  "每打一層都會消耗一把地牢鑰匙和該層的能量，不論勝負；每次掃蕩也一樣。輸掉或放棄一層，攀登就從第 1 層重新開始。你的鑰匙每天補滿到 {cap} 把，每週一還有一把額外的。",
  "戦う階ごとに、勝っても負けてもダンジョンの鍵1本とその階のエネルギーを使います。スイープも1回ごとに同じです。階で負けるか棄権すると、登りは1階からやり直し。鍵は毎日{cap}本まで補充され、毎週月曜にはボーナスで1本届きます。",
  "싸우는 층마다 이기든 지든 던전 열쇠 1개와 그 층의 에너지를 써요. 소탕도 한 번마다 똑같아요. 층에서 지거나 포기하면 등반이 1층부터 다시 시작돼요. 열쇠는 매일 {cap}개까지 채워지고, 매주 월요일엔 보너스 열쇠가 와요."],
"Endless climbs, a little harder every floor. Each floor uses a Dungeon key, win or lose; lose and the climb starts again from floor 1.": [
  "Des ascensions sans fin, un peu plus dures à chaque étage. Chaque étage coûte une clé de donjon, victoire ou défaite ; perdez et l’ascension reprend à l’étage 1.",
  "Endlose Aufstiege, jede Etage ein wenig schwerer. Jede Etage kostet einen Verliesschlüssel, ob Sieg oder Niederlage; verlierst du, beginnt der Aufstieg wieder bei Etage 1.",
  "Subidas sin fin, un poco más difíciles en cada piso. Cada piso gasta una llave de mazmorra, ganes o pierdas; si pierdes, la subida vuelve a empezar desde el piso 1.",
  "Salite infinite, un po’ più difficili a ogni piano. Ogni piano usa una chiave del dungeon, che tu vinca o perda; se perdi, la scalata ricomincia dal piano 1.",
  "Subidas sem fim, um pouco mais difíceis a cada piso. Cada piso gasta uma chave da masmorra, ganhes ou percas; se perderes, a subida recomeça no piso 1.",
  "Walang katapusang akyat, medyo mas mahirap bawat palapag. Bawat palapag ay gumagamit ng isang Susi ng Piitan, manalo man o matalo; kapag natalo, magsisimula ulit ang akyat sa palapag 1.",
  "முடிவில்லா ஏற்றங்கள், ஒவ்வொரு தளமும் சற்று கடினம். வென்றாலும் தோற்றாலும் ஒவ்வொரு தளமும் ஒரு நிலவறைச் சாவியைப் பயன்படுத்தும்; தோற்றால் ஏற்றம் மீண்டும் தளம் 1 இலிருந்து தொடங்கும்.",
  "Pendakian tanpa akhir, sedikit lebih sulit tiap lantai. Tiap lantai memakai satu kunci ruang bawah tanah, menang atau kalah; kalah, dan pendakian mulai lagi dari lantai 1.",
  "无尽的攀登，每层都更难一点。每层消耗一把地牢钥匙，不论胜负；输了就从第 1 层重新开始。",
  "無盡的攀登，每層都更難一點。每層消耗一把地牢鑰匙，不論勝負；輸了就從第 1 層重新開始。",
  "終わりのない登り、1階ごとに少しずつ手強くなる。勝っても負けても1階ごとにダンジョンの鍵を1本使い、負けると1階からやり直し。",
  "끝없는 등반, 층마다 조금씩 어려워져요. 이기든 지든 층마다 던전 열쇠 1개를 쓰고, 지면 1층부터 다시 시작해요."],
"Dungeon keys: {n}/{cap} · they fill up again in {h}h · a bonus one every Monday": [
  "Clés de donjon : {n}/{cap} · elles remontent dans {h} h · une en bonus chaque lundi",
  "Verliesschlüssel: {n}/{cap} · sie füllen sich in {h} Std. wieder auf · jeden Montag ein Bonusschlüssel",
  "Llaves de mazmorra: {n}/{cap} · se rellenan en {h} h · una extra cada lunes",
  "Chiavi del dungeon: {n}/{cap} · si ricaricano tra {h}h · una bonus ogni lunedì",
  "Chaves da masmorra: {n}/{cap} · voltam a encher daqui a {h} h · uma extra todas as segundas-feiras",
  "Mga Susi ng Piitan: {n}/{cap} · mapupuno ulit sa loob ng {h}h · may bonus tuwing Lunes",
  "நிலவறைச் சாவிகள்: {n}/{cap} · {h} மணி நேரத்தில் மீண்டும் நிரம்பும் · ஒவ்வொரு திங்களும் ஒரு போனஸ்",
  "Kunci ruang bawah tanah: {n}/{cap} · terisi lagi dalam {h} jam · bonus setiap Senin",
  "地牢钥匙：{n}/{cap} · {h} 小时后补满 · 每周一额外一把",
  "地牢鑰匙：{n}/{cap} · {h} 小時後補滿 · 每週一額外一把",
  "ダンジョンの鍵：{n}/{cap} · {h}時間後に補充 · 毎週月曜にボーナス1本",
  "던전 열쇠: {n}/{cap} · {h}시간 뒤 다시 채워짐 · 매주 월요일 보너스 1개"],
"{n} left": [
  "{n} restante(s)", "{n} übrig", "quedan {n}", "{n} rimaste", "restam {n}", "{n} na lang", "{n} மீதம்", "sisa {n}",
  "剩 {n} 把", "剩 {n} 把", "残り{n}本", "{n}개 남음"],
"each fight here uses a Dungeon key, win or lose": [
  "chaque combat ici coûte une clé de donjon, victoire ou défaite",
  "jeder Kampf hier kostet einen Verliesschlüssel, ob Sieg oder Niederlage",
  "cada pelea aquí gasta una llave de mazmorra, ganes o pierdas",
  "ogni battaglia qui usa una chiave del dungeon, che tu vinca o perda",
  "cada batalha aqui gasta uma chave da masmorra, ganhes ou percas",
  "bawat laban dito ay gumagamit ng isang Susi ng Piitan, manalo man o matalo",
  "இங்கே ஒவ்வொரு போரும், வென்றாலும் தோற்றாலும், ஒரு நிலவறைச் சாவியைப் பயன்படுத்தும்",
  "tiap pertarungan di sini memakai satu kunci ruang bawah tanah, menang atau kalah",
  "这里每场战斗消耗一把地牢钥匙，不论胜负",
  "這裡每場戰鬥消耗一把地牢鑰匙，不論勝負",
  "ここでは勝っても負けても1戦ごとにダンジョンの鍵を1本使う",
  "여기서는 이기든 지든 전투마다 던전 열쇠 1개를 써요"],
"A Dungeon key used: {n} left.": [
  "Une clé de donjon utilisée : il en reste {n}.", "Ein Verliesschlüssel verbraucht: {n} übrig.", "Una llave de mazmorra gastada: quedan {n}.",
  "Una chiave del dungeon usata: ne restano {n}.", "Uma chave da masmorra gasta: restam {n}.", "Nagamit ang isang Susi ng Piitan: {n} na lang.",
  "ஒரு நிலவறைச் சாவி பயன்படுத்தப்பட்டது: {n} மீதம்.", "Satu kunci ruang bawah tanah terpakai: sisa {n}.", "用掉一把地牢钥匙：还剩 {n} 把。",
  "用掉一把地牢鑰匙：還剩 {n} 把。", "ダンジョンの鍵を1本使った：残り{n}本。", "던전 열쇠 1개 사용: {n}개 남음."],
"1 a run ({n} left)": [
  "1 par passage ({n} restante(s))", "1 pro Lauf ({n} übrig)", "1 por pasada (quedan {n})", "1 a giro ({n} rimaste)", "1 por volta (restam {n})",
  "1 bawat takbo ({n} na lang)", "ஓட்டத்துக்கு 1 ({n} மீதம்)", "1 per putaran (sisa {n})", "每次 1 把（剩 {n} 把）", "每次 1 把（剩 {n} 把）",
  "1回1本（残り{n}本）", "한 번에 1개 ({n}개 남음)"],
"Dungeon keys used: {n} ({left} left)": [
  "Clés de donjon utilisées : {n} ({left} restante(s))", "Verliesschlüssel verbraucht: {n} ({left} übrig)", "Llaves de mazmorra gastadas: {n} (quedan {left})",
  "Chiavi del dungeon usate: {n} ({left} rimaste)", "Chaves da masmorra gastas: {n} (restam {left})", "Nagamit na Susi ng Piitan: {n} ({left} na lang)",
  "பயன்படுத்திய நிலவறைச் சாவிகள்: {n} ({left} மீதம்)", "Kunci ruang bawah tanah terpakai: {n} (sisa {left})", "用掉的地牢钥匙：{n} 把（剩 {left} 把）",
  "用掉的地牢鑰匙：{n} 把（剩 {left} 把）", "使ったダンジョンの鍵：{n}本（残り{left}本）", "사용한 던전 열쇠: {n}개 ({left}개 남음)"],
"Upgrades": [
  "Améliorations", "Verbesserungen", "Mejoras", "Potenziamenti", "Melhorias", "Mga upgrade", "மேம்பாடுகள்", "Peningkatan",
  "升级", "升級", "強化", "강화"],
"Upgrade the Forge itself: its tier (how far it can temper), your max Energy and the Dungeon key ring.": [
  "Améliorez la Forge elle-même : son rang (jusqu’où elle peut tremper), votre Énergie max et le trousseau de clés de donjon.",
  "Verbessere die Schmiede selbst: ihre Stufe (wie weit sie härten kann), deine max. Energie und den Schlüsselbund für Verliesschlüssel.",
  "Mejora la Forja en sí: su nivel (hasta dónde puede templar), tu Energía máx. y el llavero de llaves de mazmorra.",
  "Potenzia la Fucina stessa: il suo grado (fin dove può temprare), la tua Energia massima e il portachiavi delle chiavi del dungeon.",
  "Melhora a própria Forja: o seu nível (até onde pode temperar), a tua Energia máx. e o porta-chaves das chaves da masmorra.",
  "I-upgrade ang Pandayan mismo: ang antas nito (hanggang saan ito makakapagpanday), ang Max na Enerhiya mo at ang singsing ng Susi ng Piitan.",
  "உலைக்கூடத்தையே மேம்படுத்துங்கள்: அதன் நிலை (எவ்வளவு வரை பதப்படுத்தும்), உங்கள் அதிகபட்ச ஆற்றல், நிலவறைச் சாவிக் கொத்து.",
  "Tingkatkan Bengkel Tempa itu sendiri: tingkatnya (seberapa jauh bisa menempa), Energi Maks-mu, dan gantungan kunci ruang bawah tanah.",
  "升级锻造坊本身：它的等级（能锻造到多高）、你的能量上限和地牢钥匙环。",
  "升級鍛造坊本身：它的等級（能鍛造到多高）、你的能量上限和地牢鑰匙環。",
  "鍛冶場そのものを強化：ランク（どこまで鍛えられるか）、最大エネルギー、ダンジョンのキーリング。",
  "대장간 자체를 강화해요: 등급(얼마나 단련할 수 있는지), 최대 에너지, 던전 열쇠고리."],
"Cards and eggs": [
  "Cartes et œufs", "Karten und Eier", "Cartas y huevos", "Carte e uova", "Cartas e ovos", "Mga card at itlog", "அட்டைகளும் முட்டைகளும்",
  "Kartu dan telur", "卡牌和蛋", "卡牌和蛋", "カードとタマゴ", "카드와 알"],
"Recruit": [
  "Recruter", "Anwerben", "Reclutar", "Recluta", "Recrutar", "Mag-recruit", "சேர்", "Rekrut", "招募", "招募", "勧誘", "모집"],
"Nests": [
  "Nids", "Nester", "Nidos", "Nidi", "Ninhos", "Mga pugad", "கூடுகள்", "Sarang", "巢穴", "巢穴", "巣", "둥지"],
"{open} of {max} built": [
  "{open} sur {max} construits", "{open} von {max} gebaut", "{open} de {max} construidos", "{open} su {max} costruiti", "{open} de {max} construídos",
  "{open} sa {max} ang naitayo", "{max} இல் {open} கட்டப்பட்டன", "{open} dari {max} dibangun", "已建 {open}/{max}", "已建 {open}/{max}",
  "{max}個中{open}個建設済み", "{max}개 중 {open}개 지음"],
"The next nest opens at Map {n}": [
  "Le prochain nid s’ouvre à la carte {n}", "Das nächste Nest öffnet sich auf Karte {n}", "El próximo nido se abre en el mapa {n}",
  "Il prossimo nido si apre alla mappa {n}", "O próximo ninho abre no mapa {n}", "Magbubukas ang susunod na pugad sa Mapa {n}",
  "அடுத்த கூடு வரைபடம் {n} இல் திறக்கும்", "Sarang berikutnya terbuka di Peta {n}", "下一个巢穴在地图 {n} 开放", "下一個巢穴在地圖 {n} 開放",
  "次の巣はマップ{n}で開く", "다음 둥지는 지도 {n}에서 열려요"],
"Build the next nest": [
  "Construire le nid suivant", "Das nächste Nest bauen", "Construir el siguiente nido", "Costruisci il prossimo nido", "Construir o próximo ninho",
  "Itayo ang susunod na pugad", "அடுத்த கூட்டைக் கட்டு", "Bangun sarang berikutnya", "建造下一个巢穴", "建造下一個巢穴", "次の巣を建てる", "다음 둥지 짓기"],
"All nests are built.": [
  "Tous les nids sont construits.", "Alle Nester sind gebaut.", "Todos los nidos están construidos.", "Tutti i nidi sono costruiti.",
  "Todos os ninhos estão construídos.", "Naitayo na ang lahat ng pugad.", "எல்லாக் கூடுகளும் கட்டப்பட்டுவிட்டன.", "Semua sarang sudah dibangun.",
  "所有巢穴都建好了。", "所有巢穴都建好了。", "巣はすべて建設済み。", "둥지를 모두 지었어요."],
"Each place keeps its upgrades in its own Upgrades tab.": [
  "Chaque lieu garde ses améliorations dans son propre onglet Améliorations.", "Jeder Ort hat seine Verbesserungen in einem eigenen Tab „Verbesserungen“.",
  "Cada lugar guarda sus mejoras en su propia pestaña Mejoras.", "Ogni luogo tiene i suoi potenziamenti nella propria scheda Potenziamenti.",
  "Cada lugar guarda as suas melhorias no seu próprio separador Melhorias.", "Nasa sariling tab na Mga upgrade ng bawat lugar ang mga upgrade nito.",
  "ஒவ்வொரு இடமும் அதன் மேம்பாடுகளைத் தன் சொந்த மேம்பாடுகள் தாவலில் வைத்திருக்கும்.", "Setiap tempat menyimpan peningkatannya di tab Peningkatan miliknya.",
  "每个地方的升级都在它自己的“升级”页签里。", "每個地方的升級都在它自己的「升級」頁籤裡。", "各施設の強化は、それぞれの「強化」タブにあります。", "각 장소의 강화는 그곳의 강화 탭에 있어요."],
"{n}/{of} upgrades": [
  "{n}/{of} améliorations", "{n}/{of} Verbesserungen", "{n}/{of} mejoras", "{n}/{of} potenziamenti", "{n}/{of} melhorias", "{n}/{of} upgrade",
  "{n}/{of} மேம்பாடுகள்", "{n}/{of} peningkatan", "{n}/{of} 项升级", "{n}/{of} 項升級", "強化 {n}/{of}", "강화 {n}/{of}"],
"one is ready": [
  "une est prête", "eine ist bereit", "hay una lista", "uno è pronto", "há uma pronta", "may handa na", "ஒன்று தயார்", "ada yang siap",
  "有一项可升级", "有一項可升級", "強化できるものがある", "강화할 수 있는 게 있어요"],
"Open its Upgrades tab": [
  "Ouvrir son onglet Améliorations", "Seinen Tab „Verbesserungen“ öffnen", "Abrir su pestaña Mejoras", "Apri la sua scheda Potenziamenti",
  "Abrir o separador Melhorias", "Buksan ang tab na Mga upgrade nito", "அதன் மேம்பாடுகள் தாவலைத் திற", "Buka tab Peningkatan-nya",
  "打开它的“升级”页签", "打開它的「升級」頁籤", "「強化」タブを開く", "강화 탭 열기"],
"The Forge": [
  "La Forge", "Die Schmiede", "La Forja", "La Fucina", "A Forja", "Ang Pandayan", "உலைக்கூடம்", "Bengkel Tempa", "锻造坊", "鍛造坊", "鍛冶場", "대장간"],
"Nest": [
  "Nid", "Nest", "Nido", "Nido", "Ninho", "Pugad", "கூடு", "Sarang", "巢穴", "巢穴", "巣", "둥지"],
"The Tavern": [
  "La Taverne", "Die Taverne", "La Taberna", "La Taverna", "A Taberna", "Ang Taberna", "விடுதி", "Kedai", "酒馆", "酒館", "酒場", "선술집"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
PLURAL = re.compile(r'^\{(s\d?|plural_\w+)\}$')
ph = lambda s: sorted(set(p for p in re.findall(r'\{\w+\}', s) if not PLURAL.match(p)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
# placeholders side by side in the key stay side by side, in order ("{n}{where}")
assert all(run in t for k, v in T.items() for run in re.findall(r'(?:\{\w+\}){2,}', k) for t in v)
# an emoji inside a key stays in each translation (⚡ in the Sweep tip)
EMO = re.compile(r'[☀-➿\U0001F300-\U0001FAFF]')
assert all(all(e in t for e in EMO.findall(k)) for k, v in T.items() for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en in DROP: pack.pop(en, None)
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
        upath = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        if os.path.exists(upath):
            raw = open(upath, encoding='utf-8').read(); ui = json.loads(raw); n0 = len(ui)
            for en in DROP_UI: ui.pop(en, None)
            if len(ui) != n0:
                with open(upath, 'w', encoding='utf-8') as fh:
                    json.dump(ui, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each, dropped', len(DROP), '(+', len(DROP_UI), 'lang/ui rows)')
