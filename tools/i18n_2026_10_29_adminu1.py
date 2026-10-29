#!/usr/bin/env python3
"""Game texts added on 2026-10-29 by package ADMINU1 (Admin -> Players overlay; owner 10-28 23:35 / 10-29 19:14). 26 new TX keys (ui.adminu1-*),
one row per English text in lang/<code>.json (rows that already exist, such as Cards / Close / Level, are kept as they are).
The "owner: 'apply it'" phrase and the SQL path stay in English on purpose (the owner types "apply it"). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_29_adminu1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
SQL = 'supabase/proposed/20261029_admin_user_list.sql'
T = [  # English, then the 12 translations in CODES order
 ('Players', ['Joueurs', 'Spieler', 'Jugadores', 'Giocatori', 'Jogadores', 'Mga manlalaro', 'வீரர்கள்', 'Pemain', '玩家', '玩家', 'プレイヤー', '플레이어']),
 ('Open the player list', ['Ouvrir la liste des joueurs', 'Spielerliste öffnen', 'Abrir la lista de jugadores', "Apri l'elenco dei giocatori", 'Abrir a lista de jogadores', 'Buksan ang listahan ng mga manlalaro', 'வீரர் பட்டியலைத் திற', 'Buka daftar pemain', '打开玩家列表', '開啟玩家列表', 'プレイヤー一覧を開く', '플레이어 목록 열기']),
 ('Everyone with a profile: level, highest map, cards, fights and when they were last seen.', [
  "Tous ceux qui ont un profil : niveau, carte la plus avancée, cartes, combats et dernière connexion.",
  'Alle mit einem Profil: Level, höchste Karte, Karten, Kämpfe und wann sie zuletzt gesehen wurden.',
  'Todos los que tienen perfil: nivel, mapa más alto, cartas, combates y cuándo se les vio por última vez.',
  "Tutti quelli con un profilo: livello, mappa più avanzata, carte, scontri e ultimo accesso.",
  'Todos com perfil: nível, mapa mais avançado, cartas, combates e quando foram vistos pela última vez.',
  'Lahat ng may profile: antas, pinakamataas na mapa, mga baraha, mga laban, at kung kailan huling nakita.',
  'சுயவிவரம் உள்ள அனைவரும்: நிலை, உயர்ந்த வரைபடம், அட்டைகள், சண்டைகள், கடைசியாகப் பார்த்த நேரம்.',
  'Semua yang punya profil: level, peta tertinggi, kartu, pertarungan, dan kapan terakhir terlihat.',
  '所有有档案的人：等级、最高地图、卡牌、战斗，以及最后上线时间。',
  '所有有檔案的人：等級、最高地圖、卡牌、戰鬥，以及最後上線時間。',
  'プロフィールを持つ全員：レベル、最高到達マップ、カード、戦闘、最終ログイン。',
  '프로필이 있는 모든 사람: 레벨, 최고 맵, 카드, 전투, 마지막 접속.']),
 ('Search by name', ['Rechercher par nom', 'Nach Namen suchen', 'Buscar por nombre', 'Cerca per nome', 'Pesquisar por nome', 'Maghanap ayon sa pangalan', 'பெயரால் தேடு', 'Cari berdasarkan nama', '按名称搜索', '依名稱搜尋', '名前で検索', '이름으로 검색']),
 ('{shown} of {total} players', ['{shown} joueurs sur {total}', '{shown} von {total} Spielern', '{shown} de {total} jugadores', '{shown} giocatori su {total}', '{shown} de {total} jogadores', '{shown} sa {total} manlalaro', '{total} வீரர்களில் {shown}', '{shown} dari {total} pemain', '{total} 名玩家中的 {shown} 名', '{total} 名玩家中的 {shown} 名', '{total}人中{shown}人', '{total}명 중 {shown}명']),
 ('Refresh', ['Actualiser', 'Aktualisieren', 'Actualizar', 'Aggiorna', 'Atualizar', 'I-refresh', 'புதுப்பி', 'Segarkan', '刷新', '重新整理', '更新', '새로고침']),
 ('Close', None),
 ('Loading players…', ['Chargement des joueurs…', 'Spieler werden geladen…', 'Cargando jugadores…', 'Caricamento dei giocatori…', 'A carregar jogadores…', 'Nilo-load ang mga manlalaro…', 'வீரர்களை ஏற்றுகிறது…', 'Memuat pemain…', '正在加载玩家…', '正在載入玩家…', 'プレイヤーを読み込み中…', '플레이어 불러오는 중…']),
 ('No players match.', ['Aucun joueur ne correspond.', 'Kein Spieler passt.', 'Ningún jugador coincide.', 'Nessun giocatore corrisponde.', 'Nenhum jogador corresponde.', 'Walang tugmang manlalaro.', 'பொருந்தும் வீரர்கள் இல்லை.', 'Tidak ada pemain yang cocok.', '没有匹配的玩家。', '沒有符合的玩家。', '一致するプレイヤーはいません。', '일치하는 플레이어가 없어요.']),
 ('(no name)', ['(sans nom)', '(kein Name)', '(sin nombre)', '(senza nome)', '(sem nome)', '(walang pangalan)', '(பெயர் இல்லை)', '(tanpa nama)', '（无名）', '（無名）', '（名前なし）', '(이름 없음)']),
 ('Name', ['Nom', 'Name', 'Nombre', 'Nome', 'Nome', 'Pangalan', 'பெயர்', 'Nama', '名称', '名稱', '名前', '이름']),
 ('Level', None),
 ('Highest map', ['Carte la plus avancée', 'Höchste Karte', 'Mapa más alto', 'Mappa più avanzata', 'Mapa mais avançado', 'Pinakamataas na mapa', 'உயர்ந்த வரைபடம்', 'Peta tertinggi', '最高地图', '最高地圖', '最高マップ', '최고 맵']),
 ('Cards', None),
 ('Fights', ['Combats', 'Kämpfe', 'Combates', 'Scontri', 'Combates', 'Mga laban', 'சண்டைகள்', 'Pertarungan', '战斗', '戰鬥', '戦闘', '전투']),
 ('Last seen', ['Dernière connexion', 'Zuletzt gesehen', 'Visto por última vez', 'Ultimo accesso', 'Visto por último', 'Huling nakita', 'கடைசியாகப் பார்த்தது', 'Terakhir terlihat', '最后上线', '最後上線', '最終ログイン', '마지막 접속']),
 ('Joined', ['Inscrit le', 'Beigetreten', 'Se unió', 'Iscritto il', 'Entrou em', 'Sumali noong', 'சேர்ந்த நாள்', 'Bergabung', '加入时间', '加入時間', '登録日', '가입일']),
 ('never', ['jamais', 'nie', 'nunca', 'mai', 'nunca', 'hindi pa', 'ஒருபோதும் இல்லை', 'belum pernah', '从未', '從未', 'なし', '없음']),
 ('just now', ["à l'instant", 'gerade eben', 'ahora mismo', 'proprio ora', 'agora mesmo', 'ngayon lang', 'இப்போது தான்', 'baru saja', '刚刚', '剛剛', 'たった今', '방금']),
 ('{n} min ago', ['il y a {n} min', 'vor {n} Min.', 'hace {n} min', '{n} min fa', 'há {n} min', '{n} min ang nakalipas', '{n} நிமிடம் முன்', '{n} mnt lalu', '{n} 分钟前', '{n} 分鐘前', '{n}分前', '{n}분 전']),
 ('{n} h ago', ['il y a {n} h', 'vor {n} Std.', 'hace {n} h', '{n} h fa', 'há {n} h', '{n} oras ang nakalipas', '{n} மணி முன்', '{n} jam lalu', '{n} 小时前', '{n} 小時前', '{n}時間前', '{n}시간 전']),
 ('{n} d ago', ['il y a {n} j', 'vor {n} T.', 'hace {n} d', '{n} g fa', 'há {n} d', '{n} araw ang nakalipas', '{n} நாள் முன்', '{n} hari lalu', '{n} 天前', '{n} 天前', '{n}日前', '{n}일 전']),
 ('Sign in with an admin account to see players.', ['Connectez-vous avec un compte admin pour voir les joueurs.', 'Melde dich mit einem Admin-Konto an, um Spieler zu sehen.', 'Inicia sesión con una cuenta de administrador para ver a los jugadores.', 'Accedi con un account amministratore per vedere i giocatori.', 'Inicia sessão com uma conta de administrador para ver os jogadores.', 'Mag-sign in gamit ang admin account para makita ang mga manlalaro.', 'வீரர்களைப் பார்க்க நிர்வாகி கணக்கில் உள்நுழை.', 'Masuk dengan akun admin untuk melihat pemain.', '请使用管理员账号登录以查看玩家。', '請使用管理員帳號登入以查看玩家。', 'プレイヤーを見るには管理者アカウントでログインしてください。', '플레이어를 보려면 관리자 계정으로 로그인하세요.']),
 ("The player list needs the database function from " + SQL + " (owner: 'apply it').", [
  "La liste des joueurs a besoin de la fonction de base de données de " + SQL + " (propriétaire : 'apply it').",
  "Die Spielerliste braucht die Datenbankfunktion aus " + SQL + " (Besitzer: 'apply it').",
  "La lista de jugadores necesita la función de base de datos de " + SQL + " (propietario: 'apply it').",
  "L'elenco dei giocatori richiede la funzione del database in " + SQL + " (proprietario: 'apply it').",
  "A lista de jogadores precisa da função de base de dados de " + SQL + " (dono: 'apply it').",
  "Kailangan ng listahan ng mga manlalaro ang database function mula sa " + SQL + " (may-ari: 'apply it').",
  "வீரர் பட்டியலுக்கு " + SQL + " இலிருந்து தரவுத்தள செயல்பாடு தேவை (உரிமையாளர்: 'apply it').",
  "Daftar pemain memerlukan fungsi database dari " + SQL + " (pemilik: 'apply it').",
  "玩家列表需要 " + SQL + " 中的数据库函数（所有者：'apply it'）。",
  "玩家列表需要 " + SQL + " 中的資料庫函式（擁有者：'apply it'）。",
  "プレイヤー一覧には " + SQL + " のデータベース関数が必要です（オーナー：'apply it'）。",
  "플레이어 목록에는 " + SQL + " 의 데이터베이스 함수가 필요해요 (소유자: 'apply it')."]),
 ('Only admin accounts can open the player list.', ['Seuls les comptes admin peuvent ouvrir la liste des joueurs.', 'Nur Admin-Konten können die Spielerliste öffnen.', 'Solo las cuentas de administrador pueden abrir la lista de jugadores.', "Solo gli account amministratore possono aprire l'elenco dei giocatori.", 'Só contas de administrador podem abrir a lista de jogadores.', 'Admin account lang ang makakabukas ng listahan ng mga manlalaro.', 'நிர்வாகி கணக்குகள் மட்டுமே வீரர் பட்டியலைத் திறக்க முடியும்.', 'Hanya akun admin yang bisa membuka daftar pemain.', '只有管理员账号才能打开玩家列表。', '只有管理員帳號才能開啟玩家列表。', '管理者アカウントだけがプレイヤー一覧を開けます。', '관리자 계정만 플레이어 목록을 열 수 있어요.']),
 ('Could not load players: {msg}', ['Impossible de charger les joueurs : {msg}', 'Spieler konnten nicht geladen werden: {msg}', 'No se pudieron cargar los jugadores: {msg}', 'Impossibile caricare i giocatori: {msg}', 'Não foi possível carregar os jogadores: {msg}', 'Hindi ma-load ang mga manlalaro: {msg}', 'வீரர்களை ஏற்ற முடியவில்லை: {msg}', 'Tidak bisa memuat pemain: {msg}', '无法加载玩家：{msg}', '無法載入玩家：{msg}', 'プレイヤーを読み込めませんでした：{msg}', '플레이어를 불러올 수 없어요: {msg}']),
]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T:
        if row is None:
            assert en in pack, (code, en)  # reuses the pack's own row
            continue
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
    dump(path, pack)
print('ok: %d rows added across %d packs' % (added, len(CODES)))
