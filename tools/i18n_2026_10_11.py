#!/usr/bin/env python3
"""UI strings added 2026-10-11: Dungeon waves, faction packs and Food tokens, the pitch reminder, skill counters, the
New skill ribbon and the New achievement banner. Same format and caveats as i18n_core.py (Tagalog, Tamil, Japanese and
Korean deserve a native read). Keys stay sorted case-insensitively.

    python3 tools/i18n_2026_10_11.py
"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
# --- Dungeons ---
'rounds left': ['manches restantes','Runden übrig','rondas restantes','round rimasti','rondas restantes','round na natitira','சுற்றுகள் மீதம்','ronde tersisa','回合剩余','回合剩餘','ラウンド残り','라운드 남음'],
'A new castle rises': ['Un nouveau château se dresse','Eine neue Burg erhebt sich','Se alza un nuevo castillo','Sorge un nuovo castello','Ergue-se um novo castelo','May bagong kastilyong tumayo','புதிய கோட்டை எழுகிறது','Kastil baru berdiri','新的城堡拔地而起','新的城堡拔地而起','新たな城がそびえる','새 성이 솟아오른다'],
'Health carried over': ['PV reportés','Leben übertragen','Vida transferida','Salute trasferita','Vida transferida','Buhay na naipasa','கடத்தப்பட்ட உயிர்','Nyawa dibawa','生命值保留','生命值保留','体力を引き継ぎ','체력 이월'],
# --- faction packs ---
'Your packs': ['Vos paquets','Deine Packs','Tus sobres','I tuoi pacchetti','Os teus pacotes','Iyong mga pack','உங்கள் தொகுப்புகள்','Paketmu','你的卡包','你的卡包','あなたのパック','내 팩'],
'Food tokens': ['Jetons de nourriture','Futtermarken','Fichas de comida','Gettoni cibo','Fichas de comida','Food token','உணவு வில்லைகள்','Token makanan','食物代币','食物代幣','フードトークン','음식 토큰'],
'Bonus card: nothing Uncommon or better, so you get one more': ['Carte bonus : rien de Peu commun ou mieux, alors en voici une de plus','Bonuskarte: nichts Ungewöhnliches oder Besseres, also gibt es eine mehr','Carta extra: nada Poco común o mejor, así que recibes otra','Carta bonus: niente di Non comune o meglio, quindi ne ricevi un’altra','Carta bónus: nada Incomum ou melhor, por isso recebes mais uma','Bonus na card: walang Uncommon pataas, kaya may isa pa','போனஸ் அட்டை: அசாதாரணம் அல்லது மேலானது இல்லை, எனவே இன்னொன்று','Kartu bonus: tidak ada Uncommon atau lebih, jadi dapat satu lagi','奖励卡：没有罕见或以上，所以再送一张','獎勵卡：沒有罕見或以上，所以再送一張','ボーナスカード：アンコモン以上がなかったので、もう1枚','보너스 카드: 언커먼 이상이 없어 한 장 더'],
# --- pitching ---
'Already pitched this turn': ['Déjà défaussé ce tour','Diesen Zug schon abgeworfen','Ya descartaste este turno','Già scartato in questo turno','Já descartaste neste turno','Nakapag-pitch na ngayong turn','இந்த முறை ஏற்கனவே எறிந்தீர்கள்','Sudah dibuang giliran ini','本回合已弃过牌','本回合已棄過牌','このターンは捨て済み','이번 턴에 이미 버림'],
'Already pitched': ['Déjà défaussé','Schon abgeworfen','Ya descartado','Già scartato','Já descartado','Nakapag-pitch na','ஏற்கனவே எறிந்தது','Sudah dibuang','已弃牌','已棄牌','捨て済み','이미 버림'],
# --- skills ---
'Answered by': ['Contré par','Gekontert von','Contrarrestado por','Contrastato da','Contrariado por','Sinasagot ng','இதற்கு எதிர்','Dilawan oleh','克制：','剋制：','対抗手段','대응 수단'],
'New skill': ['Nouvelle compétence','Neue Fähigkeit','Nueva habilidad','Nuova abilità','Nova habilidade','Bagong skill','புதிய திறன்','Skill baru','新技能','新技能','新しいスキル','새 스킬'],
'New skills in this fight': ['Nouvelles compétences dans ce combat','Neue Fähigkeiten in diesem Kampf','Habilidades nuevas en este combate','Nuove abilità in questo scontro','Novas habilidades neste combate','Mga bagong skill sa labang ito','இந்தப் போரில் புதிய திறன்கள்','Skill baru di pertarungan ini','本场战斗的新技能','本場戰鬥的新技能','この戦いの新スキル','이 전투의 새 스킬'],
# --- achievements ---
'New achievement': ['Nouveau succès','Neuer Erfolg','Nuevo logro','Nuovo traguardo','Nova conquista','Bagong achievement','புதிய சாதனை','Pencapaian baru','新成就','新成就','新しい実績','새 업적'],
'New achievements': ['Nouveaux succès','Neue Erfolge','Nuevos logros','Nuovi traguardi','Novas conquistas','Mga bagong achievement','புதிய சாதனைகள்','Pencapaian baru','新成就','新成就','新しい実績','새 업적'],
'Claim it on the Achievements board.': ['Réclamez-le sur le tableau des succès.','Hol ihn dir am Erfolgsbrett ab.','Reclámalo en el tablón de logros.','Riscattalo sulla bacheca dei traguardi.','Reclama-a no quadro de conquistas.','Kunin ito sa Achievements board.','சாதனைப் பலகையில் பெறுங்கள்.','Klaim di papan Pencapaian.','到成就板领取。','到成就板領取。','実績ボードで受け取ろう。','업적 게시판에서 받으세요.'],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json')
    pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    for en, row in T.items(): pack[en] = row[i]
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
print('wrote', len(CODES), 'packs,', len(T), 'strings each')
