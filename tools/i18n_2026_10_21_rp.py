# Translations for package RP's text keys (2026-10-21, merge of RP: the package shipped them untranslated).
# Packs hold the text without its leading emoji, like the rest.
import json
K1 = "Faction rewards: earned through skirmish progress and achievements, never from packs"
K2 = "A faction reward: earned through skirmish progress (elites, bosses, every few wins) and some achievements, never from packs"
K3 = "Faction cards +{n}"
K4 = "Faction reward: {names}"
T = {
 'de': ["Fraktionsbelohnungen: durch Gefechtsfortschritt und Erfolge verdient, nie aus Packs", "Eine Fraktionsbelohnung: durch Gefechtsfortschritt (Elite, Bosse, alle paar Siege) und einige Erfolge verdient, nie aus Packs", "Fraktionskarten +{n}", "Fraktionsbelohnung: {names}"],
 'es': ["Recompensas de facción: se ganan con el progreso en escaramuzas y los logros, nunca en sobres", "Una recompensa de facción: se gana con el progreso en escaramuzas (élites, jefes, cada pocas victorias) y algunos logros, nunca en sobres", "Cartas de facción +{n}", "Recompensa de facción: {names}"],
 'fr': ["Récompenses de faction : gagnées par la progression en escarmouche et les succès, jamais dans les paquets", "Une récompense de faction : gagnée par la progression en escarmouche (élites, boss, toutes les quelques victoires) et certains succès, jamais dans les paquets", "Cartes de faction +{n}", "Récompense de faction : {names}"],
 'id': ["Hadiah faksi: didapat dari kemajuan pertempuran dan pencapaian, tak pernah dari paket", "Hadiah faksi: didapat dari kemajuan pertempuran (elite, bos, setiap beberapa kemenangan) dan beberapa pencapaian, tak pernah dari paket", "Kartu faksi +{n}", "Hadiah faksi: {names}"],
 'it': ["Ricompense di fazione: si ottengono con i progressi negli scontri e con gli obiettivi, mai dai pacchetti", "Una ricompensa di fazione: si ottiene con i progressi negli scontri (élite, boss, ogni poche vittorie) e alcuni obiettivi, mai dai pacchetti", "Carte di fazione +{n}", "Ricompensa di fazione: {names}"],
 'ja': ["勢力報酬：小競り合いの進行と実績で手に入り、パックからは出ません", "勢力報酬：小競り合いの進行（エリート、ボス、数勝ごと）と一部の実績で手に入り、パックからは出ません", "勢力カード +{n}", "勢力報酬：{names}"],
 'ko': ["세력 보상: 전투 진행과 업적으로 얻으며, 팩에서는 나오지 않습니다", "세력 보상: 전투 진행(엘리트, 보스, 몇 번의 승리마다)과 일부 업적으로 얻으며, 팩에서는 나오지 않습니다", "세력 카드 +{n}", "세력 보상: {names}"],
 'pt': ["Recompensas de facção: obtidas com o progresso nas escaramuças e com conquistas, nunca em pacotes", "Uma recompensa de facção: obtida com o progresso nas escaramuças (elites, chefes, a cada poucas vitórias) e algumas conquistas, nunca em pacotes", "Cartas de facção +{n}", "Recompensa de facção: {names}"],
 'ta': ["பிரிவு வெகுமதிகள்: சண்டை முன்னேற்றம் மற்றும் சாதனைகள் மூலம் பெறப்படும், பொதிகளில் வராது", "ஒரு பிரிவு வெகுமதி: சண்டை முன்னேற்றம் (சிறப்பு வீரர்கள், தலைவர்கள், சில வெற்றிகளுக்கு ஒருமுறை) மற்றும் சில சாதனைகள் மூலம் பெறப்படும், பொதிகளில் வராது", "பிரிவு அட்டைகள் +{n}", "பிரிவு வெகுமதி: {names}"],
 'tl': ["Gantimpala ng paksiyon: nakukuha sa pag-usad sa labanan at mga tagumpay, hindi kailanman sa pack", "Gantimpala ng paksiyon: nakukuha sa pag-usad sa labanan (elite, boss, bawat ilang panalo) at ilang tagumpay, hindi kailanman sa pack", "Mga card ng paksiyon +{n}", "Gantimpala ng paksiyon: {names}"],
 'zh-Hans': ["阵营奖励：通过遭遇战进度和成就获得，从不出自卡包", "阵营奖励：通过遭遇战进度（精英、首领、每隔几场胜利）和部分成就获得，从不出自卡包", "阵营卡牌 +{n}", "阵营奖励：{names}"],
 'zh-Hant': ["陣營獎勵：透過遭遇戰進度和成就獲得，從不出自卡包", "陣營獎勵：透過遭遇戰進度（精英、首領、每隔幾場勝利）和部分成就獲得，從不出自卡包", "陣營卡牌 +{n}", "陣營獎勵：{names}"],
}
for code, vals in T.items():
    p = f'lang/{code}.json'; d = json.load(open(p, encoding='utf-8'))
    for k, v in zip([K1, K2, K3, K4], vals): d[k] = v
    open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('RP texts translated into', len(T), 'packs')
