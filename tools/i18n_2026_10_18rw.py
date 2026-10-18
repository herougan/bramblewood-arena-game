#!/usr/bin/env python3
"""Game texts added on 2026-10-18 by package RW (and its 23:20 follow-up: the Babel Spire's Victory card) (owner 20:52: "The Raid Claim button → screen should be doubly more exciting than the
skirmish reward screen. btw, the boss reward screen should be more crimsony I think."): the raid claim screen's kicker, title, line
under it, standing (tier) badges, the raid-damage label, the reward labels and its Collect button. The rules for a template row are
those of i18n_2026_10_18d.py (every {placeholder} kept). Keys are the English as the page translator sees it. The raid words follow
the packs (raid / Raid-Boss / asalto / raide / 突袭 / レイド / 레이드 / படையெடுப்பு).
Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_18rw.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Raid reward": [
  "Récompense de raid", "Raid-Belohnung", "Recompensa de asalto", "Ricompensa del raid", "Recompensa de raide", "Gantimpala ng raid",
  "படையெடுப்பு வெகுமதி", "Hadiah raid", "突袭奖励", "突襲獎勵", "レイド報酬", "레이드 보상"],
"{name} has fallen!": [
  "{name} est tombé !", "{name} ist gefallen!", "¡{name} ha caído!", "{name} è caduto!", "{name} caiu!", "Bumagsak si {name}!",
  "{name} வீழ்ந்தது!", "{name} telah tumbang!", "{name}倒下了！", "{name}倒下了！", "{name}を撃破！", "{name} 격파!"],
"{name} survived the week": [
  "{name} a tenu toute la semaine", "{name} hat die Woche überstanden", "{name} resistió la semana", "{name} ha resistito per tutta la settimana",
  "{name} resistiu à semana", "Nakaligtas si {name} sa linggong ito", "{name} இந்த வாரம் தாக்குப்பிடித்தது", "{name} bertahan sepekan",
  "{name}撑过了这一周", "{name}撐過了這一週", "{name}は今週を生き延びた", "{name}이(가) 이번 주를 버텼다"],
"Your share of the spoils, raider.": [
  "Votre part du butin, pillard.", "Dein Anteil an der Beute, Raider.", "Tu parte del botín, asaltante.", "La tua parte del bottino, predone.",
  "A tua parte do saque, raider.", "Ang bahagi mo sa samsam, raider.", "உங்கள் கொள்ளைப் பங்கு, படைவீரரே.", "Bagianmu dari rampasan, raider.",
  "这是你的战利品，突袭者。", "這是你的戰利品，突襲者。", "君の取り分だ、レイダー。", "네 몫의 전리품이다, 레이더."],
"It held on, but every blow counted. Here is your compensation.": [
  "Il a tenu bon, mais chaque coup a compté. Voici votre compensation.", "Es hat durchgehalten, aber jeder Schlag hat gezählt. Hier ist dein Ausgleich.",
  "Resistió, pero cada golpe contó. Aquí tienes tu compensación.", "Ha resistito, ma ogni colpo è contato. Ecco il tuo compenso.",
  "Resistiu, mas cada golpe contou. Aqui está a tua compensação.", "Nakatagal ito, pero bawat tama ay may halaga. Narito ang iyong kabayaran.",
  "அது தாக்குப்பிடித்தது, ஆனால் ஒவ்வொரு அடியும் கணக்கில் வந்தது. இதோ உங்கள் இழப்பீடு.", "Ia bertahan, tapi setiap pukulan berarti. Ini kompensasimu.",
  "它撑住了，但每一击都算数。这是你的补偿。", "它撐住了，但每一擊都算數。這是你的補償。", "耐え抜かれたが、一撃一撃に意味はあった。補填を受け取ろう。",
  "버텨냈지만 모든 공격이 의미 있었다. 보상금을 받아라."],
"Your raid damage": [
  "Vos dégâts de raid", "Dein Raid-Schaden", "Tu daño en el asalto", "I tuoi danni nel raid", "O teu dano no raide", "Ang pinsala mo sa raid",
  "உங்கள் படையெடுப்புச் சேதம்", "Damage raid-mu", "你的突袭伤害", "你的突襲傷害", "あなたのレイドダメージ", "내 레이드 피해량"],
"XP": ["XP", "EP", "XP", "PE", "XP", "XP", "அனுபவப் புள்ளி", "XP", "经验", "經驗", "経験値", "경험치"],
"Raid card": [
  "Carte de raid", "Raid-Karte", "Carta de asalto", "Carta del raid", "Carta de raide", "Raid card", "படையெடுப்பு அட்டை", "Kartu raid",
  "突袭卡牌", "突襲卡牌", "レイドカード", "레이드 카드"],
"New title": [
  "Nouveau titre", "Neuer Titel", "Nuevo título", "Nuovo titolo", "Novo título", "Bagong titulo", "புதிய பட்டம்", "Gelar baru", "新称号", "新稱號", "新しい称号", "새 칭호"],
"Collect": ["Récupérer", "Einsammeln", "Recoger", "Raccogli", "Recolher", "Kunin", "சேகரி", "Ambil", "领取", "領取", "受け取る", "받기"],
"Top 1%": ["Top 1 %", "Top 1 %", "Top 1 %", "Top 1%", "Top 1%", "Top 1%", "முதல் 1%", "1% Teratas", "前 1%", "前 1%", "上位1%", "상위 1%"],
"Top 10%": ["Top 10 %", "Top 10 %", "Top 10 %", "Top 10%", "Top 10%", "Top 10%", "முதல் 10%", "10% Teratas", "前 10%", "前 10%", "上位10%", "상위 10%"],
"Top 50%": ["Top 50 %", "Top 50 %", "Top 50 %", "Top 50%", "Top 50%", "Top 50%", "முதல் 50%", "50% Teratas", "前 50%", "前 50%", "上位50%", "상위 50%"],
"Participant": ["Participant", "Teilnehmer", "Participante", "Partecipante", "Participante", "Kalahok", "பங்கேற்பாளர்", "Peserta", "参与者", "參與者", "参加者", "참가자"],
# 2026-10-18 follow-up (owner 23:20): the Babel Spire's Victory card. The Spire words follow the packs (Flèche, 塔の階 ...).
"Floor {n} cleared → Floor {next}": [
  "Étage {n} vaincu → Étage {next}", "Stockwerk {n} geschafft → Stockwerk {next}", "Piso {n} superado → Piso {next}", "Piano {n} superato → Piano {next}",
  "Andar {n} superado → Andar {next}", "Natapos ang Palapag {n} → Palapag {next}", "தளம் {n} வெல்லப்பட்டது → தளம் {next}", "Lantai {n} ditaklukkan → Lantai {next}",
  "第 {n} 层已攻克 → 第 {next} 层", "第 {n} 層已攻克 → 第 {next} 層", "{n}階クリア → {next}階へ", "{n}층 돌파 → {next}층"],
"Floor {n} cleared: the top of the Spire!": [
  "Étage {n} vaincu : le sommet de la Flèche !", "Stockwerk {n} geschafft: die Spitze des Turms!", "Piso {n} superado: ¡la cima de la Aguja!", "Piano {n} superato: la cima della Guglia!",
  "Andar {n} superado: o topo da Torre!", "Natapos ang Palapag {n}: ang tuktok ng Tore!", "தளம் {n} வெல்லப்பட்டது: கோபுரத்தின் உச்சி!", "Lantai {n} ditaklukkan: puncak Menara!",
  "第 {n} 层已攻克：通天塔之巅！", "第 {n} 層已攻克：通天塔之巔！", "{n}階クリア：塔の頂上だ！", "{n}층 돌파: 탑의 꼭대기!"],
"Your deck climbs to the next tier.": [
  "Votre deck monte d'un palier.", "Dein Deck steigt eine Stufe höher.", "Tu mazo sube al siguiente nivel.", "Il tuo mazzo sale al livello successivo.",
  "O teu baralho sobe ao nível seguinte.", "Umaakyat ang deck mo sa susunod na antas.", "உங்கள் அடுக்கு அடுத்த நிலைக்கு ஏறுகிறது.", "Dekmu naik ke tingkat berikutnya.",
  "你的卡组登上了新的层级。", "你的牌組登上了新的層級。", "デッキが次の段階へ登る。", "덱이 다음 단계로 올라선다."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
