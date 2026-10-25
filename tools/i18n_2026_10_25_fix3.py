#!/usr/bin/env python3
"""Game texts added or changed on 2026-10-25 by package FIX3: the pack opener's last button ("View all", was "All {n} packs", F6), the overall
raid rank's caption on the raid reward screen (G21), Map 0's well as a short tip after Map 10 (G20), the rescued baby's line on the results
(G13, the same type and icon as its toast) and the email-confirmation note after an email sign-up (G7). {type} is the Nest type's name.
Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_25_fix3.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
 'View all': ['Tout voir', 'Alle ansehen', 'Ver todo', 'Vedi tutto', 'Ver tudo', 'Tingnan lahat', 'அனைத்தையும் காண்', 'Lihat semua', '查看全部', '查看全部', 'すべて見る', '모두 보기'],
 'Overall raid rank': ['Rang de raid global', 'Gesamter Raid-Rang', 'Rango de incursión total', 'Grado raid complessivo', 'Classificação geral da incursão', 'Kabuuang ranggo sa raid',
                       'மொத்த ரெய்டு தரம்', 'Peringkat raid keseluruhan', '团战总评级', '團戰總評級', 'レイド総合ランク', '레이드 종합 등급'],
 'An old well': ['Un vieux puits', 'Ein alter Brunnen', 'Un pozo viejo', 'Un vecchio pozzo', 'Um poço antigo', 'Isang lumang balon', 'ஒரு பழைய கிணறு', 'Sebuah sumur tua', '一口老井', '一口老井', '古い井戸', '오래된 우물'],
 'Rescued a {type} baby': ['Bébé {type} sauvé', 'Ein {type}-Junges gerettet', 'Cría de {type} rescatada', 'Cucciolo {type} salvato', 'Filhote {type} resgatado', 'Nailigtas ang isang {type} na sanggol',
                           '{type} குட்டி மீட்கப்பட்டது', 'Bayi {type} diselamatkan', '救下了一只{type}幼崽', '救下了一隻{type}幼崽', '{type}の赤ちゃんを救出', '{type} 아기를 구출'],
 "Almost there: open the link in the email we just sent. It brings you back here signed in, and this device's progress and decks go to your new account.": [
   "Presque fini : ouvrez le lien de l'e-mail que nous venons d'envoyer. Il vous ramène ici connecté, et la progression et les decks de cet appareil passent sur votre nouveau compte.",
   "Fast geschafft: Öffne den Link in der E-Mail, die wir gerade geschickt haben. Er bringt dich angemeldet hierher zurück, und Fortschritt und Decks dieses Geräts gehen auf dein neues Konto.",
   "Casi listo: abre el enlace del correo que acabamos de enviar. Te trae de vuelta aquí con la sesión iniciada, y el progreso y los mazos de este dispositivo pasan a tu nueva cuenta.",
   "Ci siamo quasi: apri il link nell'email che ti abbiamo appena inviato. Ti riporta qui già connesso, e i progressi e i mazzi di questo dispositivo passano al tuo nuovo account.",
   "Quase lá: abra o link no e-mail que acabámos de enviar. Ele traz-te de volta aqui com sessão iniciada, e o progresso e os baralhos deste dispositivo passam para a tua nova conta.",
   "Malapit na: buksan ang link sa email na kapapadala namin. Ibabalik ka nito rito na naka-sign in, at mapupunta sa bago mong account ang progreso at mga deck ng device na ito.",
   "கிட்டத்தட்ட முடிந்தது: நாங்கள் இப்போது அனுப்பிய மின்னஞ்சலில் உள்ள இணைப்பைத் திறக்கவும். அது உங்களை உள்நுழைந்த நிலையில் இங்கே திருப்பி அழைத்து வரும்; இந்தச் சாதனத்தின் முன்னேற்றமும் அடுக்குகளும் உங்கள் புதிய கணக்கிற்குச் செல்லும்.",
   "Hampir selesai: buka tautan di email yang baru kami kirim. Tautan itu membawamu kembali ke sini dalam keadaan masuk, dan progres serta dek di perangkat ini pindah ke akun barumu.",
   "就快好了：打开我们刚发送的邮件中的链接。它会带你登录后回到这里，此设备上的进度和卡组会转到你的新账号。",
   "就快好了：打開我們剛寄出的郵件中的連結。它會帶你登入後回到這裡，此裝置上的進度和牌組會轉到你的新帳號。",
   "あと少し：今送ったメールのリンクを開いてください。サインインした状態でここに戻り、この端末の進行状況とデッキが新しいアカウントに移ります。",
   "거의 다 됐어요: 방금 보낸 이메일의 링크를 여세요. 로그인된 상태로 여기로 돌아오며, 이 기기의 진행 상황과 덱이 새 계정으로 옮겨집니다."],
}
STALE = ['All {n} packs']  # F6: the button's old words, no longer a TX text
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
src = open(os.path.join(ROOT, 'bramblewood-texts.js'), encoding='utf-8').read()
for en in T: assert json.dumps(en, ensure_ascii=False) in src, en  # every one is a TX text
for en in STALE: assert json.dumps(en, ensure_ascii=False) not in src, en
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T.items():
        assert len(row) == len(CODES) and ph(en) == ph(row[i]), (code, en)
        if en in pack and en == 'An old well': continue  # an older, reviewed row wins
        pack[en] = row[i]
    for en in STALE: pack.pop(en, None)
    dump(path, pack)
# G7: the old sign-up note was a literal in arena_app.js (lang/ui); it is the TX text above now
UI_STALE = ['Almost there — check your inbox to confirm your email, then Login.']
code_src = open(os.path.join(ROOT, 'arena_app.js'), encoding='utf-8').read()
for en in UI_STALE: assert en not in code_src, en
for code in CODES:
    path = os.path.join(ROOT, 'lang', 'ui', code + '.json')
    if not os.path.exists(path): continue
    pack = json.load(open(path, encoding='utf-8')); n0 = len(pack)
    for en in UI_STALE: pack.pop(en, None)
    if len(pack) != n0: dump(path, pack)
print('wrote', len(CODES), 'packs:', len(T), 'texts each')
