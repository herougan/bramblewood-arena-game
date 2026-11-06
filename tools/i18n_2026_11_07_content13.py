#!/usr/bin/env python3
"""2026-11-07 (package CONTENT13, owner 11-06 23:35 #8): the Drill Grounds, the admin-only side map under the Tutorial: its name, blurb,
two fights and the admin notes. Rows in lang/<code>.json keyed by the English text; existing rows are kept, new rows are added at the end
(a pack kept sorted stays sorted). The faction names follow the packs' own rows ("Rivergate Legion", "Sunfeather Tribes").
Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_07_content13.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
UI = [
 ('The Drill Grounds', ['Le Terrain d’exercice', 'Der Exerzierplatz', 'El Campo de Instrucción', 'La Piazza d’Armi', 'O Campo de Treino',
   'Ang Lugar ng Pagsasanay', 'பயிற்சி மைதானம்', 'Lapangan Latihan', '操练场', '操練場', '練兵場', '훈련장']),
 ('Where the Rivergate Legion and the Sunfeather Tribes drill for war. Test fights for admins: nothing won here counts.', [
   'Là où la Légion de Rivergate et les Tribus de Plume-Soleil s’exercent à la guerre. Combats de test pour les admins : rien de ce qu’on y gagne ne compte.',
   'Hier drillen die Legion von Rivergate und die Sonnenfeder-Stämme für den Krieg. Testkämpfe für Admins: Was man hier gewinnt, zählt nicht.',
   'Donde la Legión de Rivergate y las Tribus Plumasol se entrenan para la guerra. Combates de prueba para admins: nada de lo que se gana aquí cuenta.',
   'Dove la Legione di Rivergate e le Tribù di Piumasole si addestrano alla guerra. Scontri di prova per gli admin: niente di ciò che si vince qui conta.',
   'Onde a Legião de Rivergate e as Tribos Pluma-Sol treinam para a guerra. Lutas de teste para admins: nada do que se ganha aqui conta.',
   'Dito nagsasanay para sa digmaan ang Hukbo ng Rivergate at ang Mga Tribo ng Sunfeather. Mga laban-pagsubok para sa admin: walang napapanalunan dito ang binibilang.',
   'ரிவர்கேட் படையும் சூரியச்சிறகு இனக்குழுக்களும் போருக்குப் பயிற்சி செய்யும் இடம். நிர்வாகிகளுக்கான சோதனைச் சண்டைகள்: இங்கே வெல்வது எதுவும் கணக்கில் வராது.',
   'Tempat Legiun Rivergate dan Suku-Suku Bulu Surya berlatih untuk perang. Pertarungan uji untuk admin: tak ada yang dimenangkan di sini yang dihitung.',
   '河门军团与日羽诸部在此为战争操练。管理员的测试战斗：在这里赢得的一切都不算数。',
   '河門軍團與日羽諸部在此為戰爭操練。管理員的測試戰鬥：在這裡贏得的一切都不算數。',
   'リヴァーゲート軍団と陽羽の部族が戦に備えて訓練する場所。管理者用のテスト戦闘：ここで得たものは何も数えられない。',
   '리버게이트 군단과 햇깃 부족이 전쟁을 위해 훈련하는 곳. 관리자용 시험 전투: 여기서 얻은 것은 아무것도 인정되지 않습니다.']),
 ('Rivergate Century', ['Centurie de Rivergate', 'Rivergate-Centurie', 'Centuria de Rivergate', 'Centuria di Rivergate', 'Centúria de Rivergate',
   'Centuria ng Rivergate', 'ரிவர்கேட் நூற்றுவர் அணி', 'Centuria Rivergate', '河门百人队', '河門百人隊', 'リヴァーゲート百人隊', '리버게이트 백인대']),
 ('Shields up. Hold the line. Advance on my mark.', ['Boucliers levés. Tenez la ligne. Avancez à mon signal.', 'Schilde hoch. Haltet die Linie. Vorrücken auf mein Zeichen.',
   'Escudos arriba. Mantened la línea. Avanzad a mi señal.', 'Scudi alzati. Tenete la linea. Avanzate al mio segnale.', 'Escudos erguidos. Mantenham a linha. Avancem ao meu sinal.',
   'Itaas ang kalasag. Panatilihin ang hanay. Sumulong sa hudyat ko.', 'கேடயங்களை உயர்த்துங்கள். வரிசையைக் காத்திடுங்கள். என் சைகையில் முன்னேறுங்கள்.',
   'Angkat perisai. Jaga barisan. Maju atas aba-abaku.', '举盾。守住阵线。听我号令前进。', '舉盾。守住陣線。聽我號令前進。', '盾を上げよ。戦列を保て。合図で前進せよ。', '방패를 들어라. 전열을 지켜라. 내 신호에 전진하라.']),
 ('Sunfeather War-band', ['Bande de guerre de Plume-Soleil', 'Sonnenfeder-Kriegertrupp', 'Partida de guerra Plumasol', 'Banda di guerra di Piumasole', 'Bando de guerra Pluma-Sol',
   'Pangkat-mandirigma ng Sunfeather', 'சூரியச்சிறகு போர்க்குழு', 'Pasukan Perang Bulu Surya', '日羽战团', '日羽戰團', '陽羽の戦士団', '햇깃 전투단']),
 ('The Bloom sings for us today. Come and hear it.', ['La Floraison chante pour nous aujourd’hui. Venez l’entendre.', 'Die Blüte singt heute für uns. Komm und hör sie dir an.',
   'La Floración canta hoy por nosotros. Ven a oírla.', 'Oggi la Fioritura canta per noi. Vieni ad ascoltarla.', 'A Floração canta por nós hoje. Venha ouvi-la.',
   'Umaawit ang Pamumukadkad para sa amin ngayon. Halika at pakinggan.', 'இன்று மலர்ச்சி நமக்காகப் பாடுகிறது. வந்து கேளுங்கள்.',
   'Sang Mekar bernyanyi untuk kami hari ini. Datang dan dengarkan.', '今日繁花为我们歌唱。来听吧。', '今日繁花為我們歌唱。來聽吧。', '今日、花は我らのために歌う。聞きに来るがいい。', '오늘 꽃이 우리를 위해 노래한다. 와서 들어라.']),
 ('Admin only: players never see this map.', ['Admin uniquement : les joueurs ne voient jamais cette carte.', 'Nur für Admins: Spieler sehen diese Karte nie.',
   'Solo admins: los jugadores nunca ven este mapa.', 'Solo admin: i giocatori non vedono mai questa mappa.', 'Só para admins: os jogadores nunca veem este mapa.',
   'Admin lang: hindi kailanman nakikita ng mga manlalaro ang mapang ito.', 'நிர்வாகிகளுக்கு மட்டும்: வீரர்கள் இந்த வரைபடத்தை ஒருபோதும் பார்ப்பதில்லை.',
   'Khusus admin: pemain tidak pernah melihat peta ini.', '仅限管理员：玩家永远看不到这张地图。', '僅限管理員：玩家永遠看不到這張地圖。', '管理者専用：プレイヤーにこのマップは表示されません。', '관리자 전용: 플레이어는 이 맵을 절대 볼 수 없습니다.']),
 ('🛠️ Admin test fight: free, and it pays nothing.', ['🛠️ Combat de test admin : gratuit, et il ne rapporte rien.', '🛠️ Admin-Testkampf: kostenlos, und er bringt nichts ein.',
   '🛠️ Combate de prueba de admin: gratis, y no da nada.', '🛠️ Scontro di prova admin: gratuito, e non dà nulla.', '🛠️ Luta de teste de admin: grátis, e não paga nada.',
   '🛠️ Laban-pagsubok ng admin: libre, at walang ibinibigay.', '🛠️ நிர்வாகி சோதனைச் சண்டை: இலவசம், எதுவும் தராது.', '🛠️ Pertarungan uji admin: gratis, dan tidak memberi apa-apa.',
   '🛠️ 管理员测试战斗：免费，也没有任何奖励。', '🛠️ 管理員測試戰鬥：免費，也沒有任何獎勵。', '🛠️ 管理者テスト戦闘：無料、報酬なし。', '🛠️ 관리자 시험 전투: 무료이며 보상이 없습니다.']),
]


def main():
    for i, code in enumerate(CODES):
        p = os.path.join(ROOT, 'lang', code + '.json')
        with open(p, encoding='utf-8') as fh: pack = json.load(fh)
        keys = list(pack); was_sorted = keys == sorted(keys)
        for en, tr in UI:
            assert len(tr) == 12, en
            pack.setdefault(en, tr[i])
        if was_sorted: pack = dict(sorted(pack.items()))
        with open(p, 'w', encoding='utf-8') as fh: json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('ok')


if __name__ == '__main__':
    main()
