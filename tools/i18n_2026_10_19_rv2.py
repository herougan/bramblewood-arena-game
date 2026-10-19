#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package RV2 (the raid played column by column, the boss's 3 plays a turn, the elders' Health, the
allies' plays, the raid fight's rank and the participation tiers): the boss's row-play log lines, an ally's name tag, the rank badge and
its tooltips, the Competent participant (was the Strong contributor) and the new Leading participant, the boss-plays note, the might
line, and the three raid rules lines. Keys are the English with the leading emoji peeled, as the page translator sees them; every
{placeholder} is kept. The words follow the packs (Santé / Leben / Salud ... for Health; the packs' own words for fights and damage).
Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_rv2.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"The boss plays {card} into its middle row.": [
  "Le boss joue {card} dans sa rangée du milieu.", "Der Boss spielt {card} in seine mittlere Reihe.", "El jefe juega {card} en su fila central.",
  "Il boss gioca {card} nella sua fila centrale.", "O chefe joga {card} na sua fila do meio.", "Inilaro ng boss ang {card} sa gitnang hanay nito.",
  "முதலாளி {card} ஐ தன் நடு வரிசையில் இறக்குகிறது.", "Bos memainkan {card} ke baris tengahnya.", "首领将 {card} 打入其中排。", "首領將 {card} 打入其中排。",
  "ボスが{card}を中列に出した。", "보스가 {card}을(를) 가운데 줄에 냅니다."],
"The boss plays {card} into its back row.": [
  "Le boss joue {card} dans sa rangée du fond.", "Der Boss spielt {card} in seine hintere Reihe.", "El jefe juega {card} en su fila trasera.",
  "Il boss gioca {card} nella sua fila posteriore.", "O chefe joga {card} na sua fila de trás.", "Inilaro ng boss ang {card} sa likurang hanay nito.",
  "முதலாளி {card} ஐ தன் பின் வரிசையில் இறக்குகிறது.", "Bos memainkan {card} ke baris belakangnya.", "首领将 {card} 打入其后排。", "首領將 {card} 打入其後排。",
  "ボスが{card}を後列に出した。", "보스가 {card}을(를) 뒷줄에 냅니다."],
"{name} plays {card}": [
  "{name} joue {card}", "{name} spielt {card}", "{name} juega {card}", "{name} gioca {card}", "{name} joga {card}", "Inilaro ni {name} ang {card}",
  "{name} {card} ஐ இறக்குகிறார்", "{name} memainkan {card}", "{name} 打出 {card}", "{name} 打出 {card}", "{name}が{card}を出した", "{name}: {card} 사용"],
"Rank {rank}": [
  "Rang {rank}", "Rang {rank}", "Rango {rank}", "Grado {rank}", "Classe {rank}", "Ranggo {rank}", "தரம் {rank}", "Peringkat {rank}",
  "评级 {rank}", "評級 {rank}", "ランク{rank}", "등급 {rank}"],
"Your rank this fight. A higher rank counts for more raid damage.": [
  "Votre rang dans ce combat. Un meilleur rang compte pour plus de dégâts de raid.",
  "Dein Rang in diesem Kampf. Ein höherer Rang zählt für mehr Raid-Schaden.",
  "Tu rango en este combate. Un rango más alto cuenta como más daño de incursión.",
  "Il tuo grado in questo scontro. Un grado più alto vale più danni da raid.",
  "A tua classe neste combate. Uma classe mais alta conta mais dano de raide.",
  "Ang ranggo mo sa labang ito. Mas mataas na ranggo, mas maraming pinsala sa raid.",
  "இந்தச் சண்டையில் உங்கள் தரம். உயர்ந்த தரம் அதிக ரெய்டு சேதமாகக் கணக்கிடப்படும்.",
  "Peringkatmu di pertarungan ini. Peringkat lebih tinggi dihitung sebagai kerusakan raid lebih besar.",
  "你本场的评级。评级越高，计入的突袭伤害越多。", "你本場的評級。評級越高，計入的突襲傷害越多。",
  "この戦いのランク。ランクが高いほどレイドダメージが多く数えられる。", "이번 전투의 등급. 등급이 높을수록 레이드 피해가 더 많이 계산됩니다."],
"You won this fight: your rank wears its emblem.": [
  "Vous avez gagné ce combat : votre rang porte son emblème.", "Du hast diesen Kampf gewonnen: Dein Rang trägt sein Emblem.",
  "Ganaste este combate: tu rango luce su emblema.", "Hai vinto questo scontro: il tuo grado porta il suo emblema.",
  "Venceste este combate: a tua classe ostenta o seu emblema.", "Nanalo ka sa labang ito: may sagisag ang ranggo mo.",
  "இந்தச் சண்டையை வென்றீர்கள்: உங்கள் தரம் அதன் சின்னத்தை அணிகிறது.", "Kamu memenangkan pertarungan ini: peringkatmu memakai lambangnya.",
  "你赢下了本场：你的评级戴上了徽记。", "你贏下了本場：你的評級戴上了徽記。", "この戦いに勝利：ランクに紋章がつく。", "이 전투에서 이겼습니다: 등급에 문장이 붙습니다."],
"Competent participant": [
  "Participant compétent", "Fähiger Teilnehmer", "Participante competente", "Partecipante competente", "Participante competente", "Mahusay na kalahok",
  "திறமையான பங்கேற்பாளர்", "Peserta cakap", "得力参与者", "得力參與者", "有能な参加者", "유능한 참가자"],
"Leading participant": [
  "Participant de premier plan", "Führender Teilnehmer", "Participante destacado", "Partecipante di punta", "Participante de destaque", "Nangungunang kalahok",
  "முன்னணி பங்கேற்பாளர்", "Peserta terdepan", "领军参与者", "領軍參與者", "トップ参加者", "선두 참가자"],
"Taking part: {fights}+ fights and {damage}+ raid damage in this life of the raid. Competent participant: {sfights}+ fights and {sdamage}+ damage, for {pct}% more of every reward.": [
  "Participation : {fights}+ combats et {damage}+ dégâts de raid dans cette vie du raid. Participant compétent : {sfights}+ combats et {sdamage}+ dégâts, pour {pct} % de plus sur chaque récompense.",
  "Dabei: {fights}+ Kämpfe und {damage}+ Raid-Schaden in diesem Leben des Raids. Fähiger Teilnehmer: {sfights}+ Kämpfe und {sdamage}+ Schaden, für {pct} % mehr von jeder Belohnung.",
  "Participas: {fights}+ combates y {damage}+ daño de incursión en esta vida de la incursión. Participante competente: {sfights}+ combates y {sdamage}+ daño, para un {pct} % más de cada recompensa.",
  "Partecipi: {fights}+ scontri e {damage}+ danni da raid in questa vita del raid. Partecipante competente: {sfights}+ scontri e {sdamage}+ danni, per il {pct}% in più di ogni ricompensa.",
  "A participar: {fights}+ combates e {damage}+ dano de raide nesta vida do raide. Participante competente: {sfights}+ combates e {sdamage}+ dano, para mais {pct}% de cada recompensa.",
  "Kasali: {fights}+ laban at {damage}+ pinsala sa raid sa buhay na ito ng raid. Mahusay na kalahok: {sfights}+ laban at {sdamage}+ pinsala, para sa {pct}% dagdag sa bawat gantimpala.",
  "பங்கேற்பு: இந்த ரெய்டு வாழ்வில் {fights}+ சண்டைகள், {damage}+ ரெய்டு சேதம். திறமையான பங்கேற்பாளர்: {sfights}+ சண்டைகள், {sdamage}+ சேதம், ஒவ்வொரு வெகுமதியிலும் {pct}% அதிகம்.",
  "Ikut serta: {fights}+ pertarungan dan {damage}+ kerusakan raid di nyawa raid ini. Peserta cakap: {sfights}+ pertarungan dan {sdamage}+ kerusakan, untuk {pct}% lebih dari setiap hadiah.",
  "参与：本轮突袭中 {fights}+ 场战斗、{damage}+ 突袭伤害。得力参与者：{sfights}+ 场、{damage}+ 伤害以上为 {sdamage}+，每项奖励多 {pct}%。",
  "參與：本輪突襲中 {fights}+ 場戰鬥、{damage}+ 突襲傷害。得力參與者：{sfights}+ 場、{damage}+ 傷害以上為 {sdamage}+，每項獎勵多 {pct}%。",
  "参加：このレイドの命で{fights}戦以上、レイドダメージ{damage}以上。有能な参加者：{sfights}戦以上、{sdamage}ダメージ以上で、すべての報酬が{pct}%増える。",
  "참여: 이번 레이드 생명에서 {fights}회 이상, 레이드 피해 {damage} 이상. 유능한 참가자: {sfights}회 이상, 피해 {sdamage} 이상이면 모든 보상 {pct}% 증가."],
"Leading participant: {fights}+ fights and {damage}+ damage, for {pct}% more of every reward and an extra raid card.": [
  "Participant de premier plan : {fights}+ combats et {damage}+ dégâts, pour {pct} % de plus sur chaque récompense et une carte de raid en plus.",
  "Führender Teilnehmer: {fights}+ Kämpfe und {damage}+ Schaden, für {pct} % mehr von jeder Belohnung und eine Raid-Karte extra.",
  "Participante destacado: {fights}+ combates y {damage}+ daño, para un {pct} % más de cada recompensa y una carta de incursión extra.",
  "Partecipante di punta: {fights}+ scontri e {damage}+ danni, per il {pct}% in più di ogni ricompensa e una carta raid in più.",
  "Participante de destaque: {fights}+ combates e {damage}+ dano, para mais {pct}% de cada recompensa e uma carta de raide extra.",
  "Nangungunang kalahok: {fights}+ laban at {damage}+ pinsala, para sa {pct}% dagdag sa bawat gantimpala at isang dagdag na raid card.",
  "முன்னணி பங்கேற்பாளர்: {fights}+ சண்டைகள், {damage}+ சேதம், ஒவ்வொரு வெகுமதியிலும் {pct}% அதிகம் மற்றும் ஒரு கூடுதல் ரெய்டு அட்டை.",
  "Peserta terdepan: {fights}+ pertarungan dan {damage}+ kerusakan, untuk {pct}% lebih dari setiap hadiah dan satu kartu raid tambahan.",
  "领军参与者：{fights}+ 场、{damage}+ 伤害，每项奖励多 {pct}%，并多得一张突袭卡。",
  "領軍參與者：{fights}+ 場、{damage}+ 傷害，每項獎勵多 {pct}%，並多得一張突襲卡。",
  "トップ参加者：{fights}戦以上、{damage}ダメージ以上で、すべての報酬が{pct}%増え、レイドカードが1枚増える。",
  "선두 참가자: {fights}회 이상, 피해 {damage} 이상이면 모든 보상 {pct}% 증가와 레이드 카드 1장 추가."],
"Competent participants ({fights}+ fights, {damage}+ damage)": [
  "Participants compétents ({fights}+ combats, {damage}+ dégâts)", "Fähige Teilnehmer ({fights}+ Kämpfe, {damage}+ Schaden)",
  "Participantes competentes ({fights}+ combates, {damage}+ daño)", "Partecipanti competenti ({fights}+ scontri, {damage}+ danni)",
  "Participantes competentes ({fights}+ combates, {damage}+ dano)", "Mahuhusay na kalahok ({fights}+ laban, {damage}+ pinsala)",
  "திறமையான பங்கேற்பாளர்கள் ({fights}+ சண்டைகள், {damage}+ சேதம்)", "Peserta cakap ({fights}+ pertarungan, {damage}+ kerusakan)",
  "得力参与者（{fights}+ 场，{damage}+ 伤害）", "得力參與者（{fights}+ 場，{damage}+ 傷害）", "有能な参加者（{fights}戦以上、{damage}ダメージ以上）", "유능한 참가자 ({fights}회 이상, 피해 {damage} 이상)"],
"Leading participants ({fights}+ fights, {damage}+ damage)": [
  "Participants de premier plan ({fights}+ combats, {damage}+ dégâts)", "Führende Teilnehmer ({fights}+ Kämpfe, {damage}+ Schaden)",
  "Participantes destacados ({fights}+ combates, {damage}+ daño)", "Partecipanti di punta ({fights}+ scontri, {damage}+ danni)",
  "Participantes de destaque ({fights}+ combates, {damage}+ dano)", "Nangungunang kalahok ({fights}+ laban, {damage}+ pinsala)",
  "முன்னணி பங்கேற்பாளர்கள் ({fights}+ சண்டைகள், {damage}+ சேதம்)", "Peserta terdepan ({fights}+ pertarungan, {damage}+ kerusakan)",
  "领军参与者（{fights}+ 场，{damage}+ 伤害）", "領軍參與者（{fights}+ 場，{damage}+ 傷害）", "トップ参加者（{fights}戦以上、{damage}ダメージ以上）", "선두 참가자 ({fights}회 이상, 피해 {damage} 이상)"],
"{pct}% more of every reward, and an extra raid card": [
  "{pct} % de plus sur chaque récompense, et une carte de raid en plus", "{pct} % mehr von jeder Belohnung und eine Raid-Karte extra",
  "Un {pct} % más de cada recompensa y una carta de incursión extra", "Il {pct}% in più di ogni ricompensa e una carta raid in più",
  "Mais {pct}% de cada recompensa e uma carta de raide extra", "{pct}% dagdag sa bawat gantimpala, at isang dagdag na raid card",
  "ஒவ்வொரு வெகுமதியிலும் {pct}% அதிகம், மற்றும் ஒரு கூடுதல் ரெய்டு அட்டை", "{pct}% lebih dari setiap hadiah, dan satu kartu raid tambahan",
  "每项奖励多 {pct}%，并多得一张突袭卡", "每項獎勵多 {pct}%，並多得一張突襲卡", "すべての報酬が{pct}%増え、レイドカードが1枚増える", "모든 보상 {pct}% 증가, 레이드 카드 1장 추가"],
"The boss plays like a CPU enemy: each turn it plays 3 cards at once, one into each of its rows.": [
  "Le boss joue comme un ennemi CPU : à chaque tour, il joue 3 cartes à la fois, une dans chacune de ses rangées.",
  "Der Boss spielt wie ein CPU-Gegner: Jeden Zug spielt er 3 Karten auf einmal, eine in jede seiner Reihen.",
  "El jefe juega como un enemigo de la CPU: cada turno juega 3 cartas a la vez, una en cada una de sus filas.",
  "Il boss gioca come un nemico della CPU: ogni turno gioca 3 carte insieme, una in ciascuna delle sue file.",
  "O chefe joga como um inimigo da CPU: em cada turno joga 3 cartas de uma vez, uma em cada uma das suas filas.",
  "Naglalaro ang boss na parang kalabang CPU: bawat tira, sabay itong naglalaro ng 3 card, isa sa bawat hanay nito.",
  "முதலாளி ஒரு CPU எதிரியைப் போல் விளையாடுகிறது: ஒவ்வொரு முறையும் 3 அட்டைகளை ஒரே நேரத்தில், தன் ஒவ்வொரு வரிசையிலும் ஒன்றாக இறக்குகிறது.",
  "Bos bermain seperti musuh CPU: setiap giliran ia memainkan 3 kartu sekaligus, satu ke setiap barisnya.",
  "首领像电脑对手一样出牌：每回合同时打出 3 张牌，它的每一排各一张。", "首領像電腦對手一樣出牌：每回合同時打出 3 張牌，它的每一排各一張。",
  "ボスはCPUの敵のように動く：毎ターン3枚を同時に出し、各列に1枚ずつ置く。", "보스는 CPU 적처럼 둡니다: 매 턴 카드 3장을 한꺼번에, 각 줄에 한 장씩 냅니다."],
"{name}'s might: its great beasts come in with up to {hp} Health while the raid is fresh, falling to their own Health as it falls (now {pct}%).": [
  "La puissance de {name} : ses grandes bêtes arrivent avec jusqu'à {hp} de Santé tant que le raid est intact, puis retombent à leur propre Santé à mesure qu'il faiblit (maintenant {pct} %).",
  "Die Macht von {name}: Seine großen Bestien kommen mit bis zu {hp} Leben, solange der Raid frisch ist, und fallen auf ihr eigenes Leben, je schwächer er wird (jetzt {pct} %).",
  "El poder de {name}: sus grandes bestias entran con hasta {hp} de Salud mientras la incursión está entera, y bajan a su propia Salud a medida que cae (ahora {pct} %).",
  "La potenza di {name}: le sue grandi bestie entrano con fino a {hp} di Salute finché il raid è intatto, e scendono alla loro Salute man mano che cala (ora {pct}%).",
  "O poder de {name}: as suas grandes bestas entram com até {hp} de Vida enquanto o raide está intacto, descendo até à sua própria Vida à medida que ele cai (agora {pct}%).",
  "Lakas ni {name}: pumapasok ang malalaking halimaw nito na may hanggang {hp} Buhay habang sariwa ang raid, bumababa sa sarili nilang Buhay habang humihina ito (ngayon {pct}%).",
  "{name} இன் வலிமை: ரெய்டு புதிதாக இருக்கும்போது அதன் பெரும் விலங்குகள் {hp} உயிர் வரை கொண்டு வருகின்றன, அது வீழும்போது அவற்றின் சொந்த உயிருக்கு இறங்குகின்றன (இப்போது {pct}%).",
  "Kekuatan {name}: binatang besarnya datang dengan hingga {hp} Nyawa saat raid masih utuh, turun ke Nyawa mereka sendiri seiring raid melemah (sekarang {pct}%).",
  "{name}的威势：突袭完好时，它的巨兽登场时最多有 {hp} 生命，随突袭衰弱降至其本身生命（现在 {pct}%）。",
  "{name}的威勢：突襲完好時，它的巨獸登場時最多有 {hp} 生命，隨突襲衰弱降至其本身生命（現在 {pct}%）。",
  "{name}の威勢：レイドが無傷のうちは巨獣が最大{hp}の体力で現れ、レイドが弱るにつれて本来の体力まで下がる（現在{pct}%）。",
  "{name}의 위세: 레이드가 온전할 때 거대 짐승은 최대 {hp} 체력으로 나오고, 레이드가 약해질수록 본래 체력까지 내려갑니다 (현재 {pct}%)."],
"More raid damage means a bigger share of the rewards.": [
  "Plus de dégâts de raid, c'est une plus grosse part des récompenses.", "Mehr Raid-Schaden heißt ein größerer Anteil an den Belohnungen.",
  "Más daño de incursión significa una parte mayor de las recompensas.", "Più danni da raid significano una quota maggiore delle ricompense.",
  "Mais dano de raide significa uma parte maior das recompensas.", "Mas maraming pinsala sa raid, mas malaking bahagi ng gantimpala.",
  "அதிக ரெய்டு சேதம் என்றால் வெகுமதிகளில் பெரிய பங்கு.", "Kerusakan raid lebih banyak berarti bagian hadiah lebih besar.",
  "突袭伤害越多，分到的奖励越多。", "突襲傷害越多，分到的獎勵越多。", "レイドダメージが多いほど報酬の取り分が大きくなる。", "레이드 피해가 많을수록 보상 몫이 커집니다."],
"Winning a fight counts as {n} raid damage.": [
  "Gagner un combat compte pour {n} dégâts de raid.", "Ein gewonnener Kampf zählt als {n} Raid-Schaden.", "Ganar un combate cuenta como {n} de daño de incursión.",
  "Vincere uno scontro vale {n} danni da raid.", "Vencer um combate conta como {n} de dano de raide.", "Ang pagkapanalo sa laban ay bilang na {n} pinsala sa raid.",
  "ஒரு சண்டையை வெல்வது {n} ரெய்டு சேதமாகக் கணக்கிடப்படும்.", "Memenangkan pertarungan dihitung sebagai {n} kerusakan raid.",
  "赢下一场战斗计为 {n} 突袭伤害。", "贏下一場戰鬥計為 {n} 突襲傷害。", "戦いに勝つとレイドダメージ{n}として数えられる。", "전투에서 이기면 레이드 피해 {n}으로 계산됩니다."],
"A higher rank in a fight counts for more raid damage.": [
  "Un meilleur rang dans un combat compte pour plus de dégâts de raid.", "Ein höherer Rang in einem Kampf zählt für mehr Raid-Schaden.",
  "Un rango más alto en un combate cuenta como más daño de incursión.", "Un grado più alto in uno scontro vale più danni da raid.",
  "Uma classe mais alta num combate conta mais dano de raide.", "Mas mataas na ranggo sa laban, mas maraming bilang na pinsala sa raid.",
  "சண்டையில் உயர்ந்த தரம் அதிக ரெய்டு சேதமாகக் கணக்கிடப்படும்.", "Peringkat lebih tinggi dalam pertarungan dihitung sebagai kerusakan raid lebih besar.",
  "战斗评级越高，计入的突袭伤害越多。", "戰鬥評級越高，計入的突襲傷害越多。", "戦いのランクが高いほどレイドダメージが多く数えられる。", "전투 등급이 높을수록 레이드 피해가 더 많이 계산됩니다."],
}
# the zh lines of the part-rules text: straightened out by hand (the placeholders in their own places)
T["Taking part: {fights}+ fights and {damage}+ raid damage in this life of the raid. Competent participant: {sfights}+ fights and {sdamage}+ damage, for {pct}% more of every reward."][8] = "参与：本轮突袭中 {fights}+ 场战斗、{damage}+ 突袭伤害。得力参与者：{sfights}+ 场、{sdamage}+ 伤害，每项奖励多 {pct}%。"
T["Taking part: {fights}+ fights and {damage}+ raid damage in this life of the raid. Competent participant: {sfights}+ fights and {sdamage}+ damage, for {pct}% more of every reward."][9] = "參與：本輪突襲中 {fights}+ 場戰鬥、{damage}+ 突襲傷害。得力參與者：{sfights}+ 場、{sdamage}+ 傷害，每項獎勵多 {pct}%。"
# the English these replaced (the strong contributor's lines), dropped from the packs
RETIRED = ["Strong contributor", "Strong contributors ({fights}+ fights, {damage}+ damage)",
  "Taking part: {fights}+ fights and {damage}+ raid damage in this life of the raid. Strong contributor: {sfights}+ fights and {sdamage}+ damage, for {pct}% more of every reward."]
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items(): pack[en] = row[i]
        for en in RETIRED: pack.pop(en, None)
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # the pack's own order kept (new keys at the end), so the diff is only these strings
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
