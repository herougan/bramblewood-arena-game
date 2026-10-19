#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package SY (cross-device deck sync, owner 10:55: "im using the same account in mobile AND web.
They don't see each other's decks!"): the small sync indicator next to the account chip (Synced / Syncing / Offline, with their
tooltips) and the toast for a deck deleted on another device. Same rules as i18n_2026_10_19_nf.py (every {placeholder} kept, an
emoji or mark inside a key kept). Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_sy.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Synced ✓": [
  "Synchronisé ✓", "Synchronisiert ✓", "Sincronizado ✓", "Sincronizzato ✓", "Sincronizado ✓", "Naka-sync ✓",
  "ஒத்திசைந்தது ✓", "Tersinkron ✓", "已同步 ✓", "已同步 ✓", "同期済み ✓", "동기화됨 ✓"],
"Syncing…": [
  "Synchronisation…", "Wird synchronisiert…", "Sincronizando…", "Sincronizzazione…", "A sincronizar…", "Nagsi-sync…",
  "ஒத்திசைக்கிறது…", "Menyinkronkan…", "同步中…", "同步中…", "同期中…", "동기화 중…"],
"Offline": [
  "Hors ligne", "Offline", "Sin conexión", "Offline", "Offline", "Offline",
  "இணைப்பில் இல்லை", "Offline", "离线", "離線", "オフライン", "오프라인"],
"Your decks are saved to your account and show on every device you sign in on.": [
  "Vos decks sont enregistrés sur votre compte et apparaissent sur chaque appareil où vous vous connectez.",
  "Deine Decks sind in deinem Konto gespeichert und erscheinen auf jedem Gerät, auf dem du dich anmeldest.",
  "Tus mazos se guardan en tu cuenta y aparecen en cada dispositivo en el que inicies sesión.",
  "I tuoi mazzi sono salvati nel tuo account e compaiono su ogni dispositivo in cui accedi.",
  "Os teus baralhos ficam guardados na tua conta e aparecem em todos os dispositivos onde entrares.",
  "Naka-save ang mga deck mo sa account mo at lumalabas sa bawat device na pinag-sign-in-an mo.",
  "உங்கள் அடுக்குகள் உங்கள் கணக்கில் சேமிக்கப்பட்டு, நீங்கள் உள்நுழையும் ஒவ்வொரு சாதனத்திலும் தெரியும்.",
  "Dek-dekmu tersimpan di akunmu dan muncul di setiap perangkat tempat kamu masuk.",
  "你的卡组已保存到你的账号，在你登录的每台设备上都能看到。",
  "你的牌組已儲存到你的帳號，在你登入的每台裝置上都看得到。",
  "デッキはアカウントに保存され、サインインしたすべての端末に表示されます。",
  "덱은 계정에 저장되어 로그인한 모든 기기에 표시돼요."],
"Saving your decks to your account…": [
  "Enregistrement de vos decks sur votre compte…", "Deine Decks werden in deinem Konto gespeichert…", "Guardando tus mazos en tu cuenta…",
  "Salvataggio dei tuoi mazzi nel tuo account…", "A guardar os teus baralhos na tua conta…", "Sine-save ang mga deck mo sa account mo…",
  "உங்கள் அடுக்குகளை உங்கள் கணக்கில் சேமிக்கிறது…", "Menyimpan dek-dekmu ke akunmu…", "正在把你的卡组保存到账号…",
  "正在把你的牌組儲存到帳號…", "デッキをアカウントに保存しています…", "덱을 계정에 저장하는 중…"],
"Can't reach the server. Your decks are safe on this device and will sync when you're back online.": [
  "Impossible de joindre le serveur. Vos decks sont en sécurité sur cet appareil et se synchroniseront dès votre retour en ligne.",
  "Der Server ist nicht erreichbar. Deine Decks sind auf diesem Gerät sicher und werden synchronisiert, sobald du wieder online bist.",
  "No se puede conectar con el servidor. Tus mazos están a salvo en este dispositivo y se sincronizarán cuando vuelvas a estar en línea.",
  "Impossibile raggiungere il server. I tuoi mazzi sono al sicuro su questo dispositivo e si sincronizzeranno quando tornerai online.",
  "Não foi possível contactar o servidor. Os teus baralhos estão seguros neste dispositivo e vão sincronizar quando voltares a estar online.",
  "Hindi maabot ang server. Ligtas ang mga deck mo sa device na ito at magsi-sync pagbalik mo online.",
  "சேவையகத்தை அடைய முடியவில்லை. உங்கள் அடுக்குகள் இந்தச் சாதனத்தில் பாதுகாப்பாக உள்ளன; மீண்டும் இணைந்ததும் ஒத்திசைக்கப்படும்.",
  "Server tidak bisa dihubungi. Dek-dekmu aman di perangkat ini dan akan tersinkron saat kamu online lagi.",
  "无法连接服务器。你的卡组在这台设备上很安全，恢复联网后会自动同步。",
  "無法連線到伺服器。你的牌組在這台裝置上很安全，恢復連線後會自動同步。",
  "サーバーに接続できません。デッキはこの端末に安全に保存されていて、オンラインに戻ると同期されます。",
  "서버에 연결할 수 없어요. 덱은 이 기기에 안전하게 있고, 다시 온라인이 되면 동기화돼요."],
"The deck “{name}” was deleted on another device, so it's gone from here too.": [
  "Le deck « {name} » a été supprimé sur un autre appareil, il disparaît donc aussi d’ici.",
  "Das Deck „{name}“ wurde auf einem anderen Gerät gelöscht und ist deshalb auch hier weg.",
  "El mazo «{name}» se borró en otro dispositivo, así que también desaparece de aquí.",
  "Il mazzo «{name}» è stato eliminato su un altro dispositivo, quindi sparisce anche da qui.",
  "O baralho «{name}» foi apagado noutro dispositivo, por isso também desaparece daqui.",
  "Binura ang deck na “{name}” sa ibang device, kaya wala na rin ito rito.",
  "“{name}” அடுக்கு வேறொரு சாதனத்தில் நீக்கப்பட்டது, அதனால் இங்கிருந்தும் போய்விட்டது.",
  "Dek “{name}” dihapus di perangkat lain, jadi di sini juga sudah tidak ada.",
  "卡组“{name}”已在另一台设备上删除，所以这里也没有了。",
  "牌組「{name}」已在另一台裝置上刪除，所以這裡也沒有了。",
  "デッキ「{name}」は別の端末で削除されたため、ここからもなくなりました。",
  "덱 “{name}”이(가) 다른 기기에서 삭제되어 여기서도 사라졌어요."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
assert all(('✓' in t) for t in T["Synced ✓"])
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # the pack's own order, new rows at the end
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
