#!/usr/bin/env python3
# 2026-11-19 (package REL2): the first-visit PvP line. Run: python3 tools/i18n_add.py tools/i18n_2026-11-19_rel2b.py --no-export
L = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
def t(en, *tr):
    assert len(tr) == 12, en
    return dict(zip(['en'] + L, (en,) + tr))
TABLE = {'tx': {
 'ui.rel2-pvp-note': t('Win to climb the ranks: your rating picks who you face, and each match uses one 🎟️ ticket.',
   'Gagne pour grimper : ta cote choisit tes adversaires, et chaque match utilise un ticket 🎟️.',
   'Gewinne, um aufzusteigen: deine Wertung bestimmt deine Gegner, und jedes Match kostet ein 🎟️ Ticket.',
   'Gana para subir de rango: tu puntuación elige a tus rivales y cada partida usa un ticket 🎟️.',
   'Vinci per salire di grado: il tuo punteggio sceglie gli avversari e ogni partita usa un biglietto 🎟️.',
   'Vença para subir de nível: sua pontuação escolhe seus rivais e cada partida usa um bilhete 🎟️.',
   'Manalo para umangat: ang rating mo ang pipili ng makakalaban, at bawat laban ay gumagamit ng isang 🎟️ tiket.',
   'ரேங்கில் உயர வெல்லுங்கள்: உங்கள் மதிப்பீடு எதிராளியைத் தீர்மானிக்கும்; ஒவ்வொரு ஆட்டமும் ஒரு 🎟️ டிக்கெட்டைப் பயன்படுத்தும்.',
   'Menanglah untuk naik peringkat: ratingmu menentukan lawan, dan setiap pertandingan memakai satu tiket 🎟️.',
   '获胜即可升级排名：你的评分决定对手，每场对战消耗一张 🎟️ 门票。',
   '獲勝即可升級排名：你的評分決定對手，每場對戰消耗一張 🎟️ 門票。',
   '勝ってランクを上げよう。レーティングで相手が決まり、1試合ごとに 🎟️ チケットを1枚使います。',
   '이겨서 순위를 올리세요. 레이팅이 상대를 정하고, 한 판마다 🎟️ 티켓이 한 장 들어요.'),
}}
