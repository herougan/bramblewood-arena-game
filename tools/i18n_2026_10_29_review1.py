#!/usr/bin/env python3
"""Game texts added on 2026-10-29 by package REVIEW1 (owner 10-29 00:13: Chosen / Cut cards / Maybe in the Map cards overlay). Adds the English rows
to bramblewood-texts.js and the translations to the 12 packs in lang/ (an older, reviewed row wins). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_29_review1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
ROWS = [
 ('ui.rv1-chosen', 'Chosen', ['Retenues', 'Gewählt', 'Elegidas', 'Scelte', 'Escolhidas', 'Napili', 'தேர்ந்தவை', 'Dipilih', '入选', '入選', '選出', '선택됨']),
 ('ui.rv1-cut', 'Cut cards', ['Cartes écartées', 'Gestrichene Karten', 'Cartas recortadas', 'Carte tagliate', 'Cartas cortadas', 'Mga tinanggal na kard', 'நீக்கிய அட்டைகள்', 'Kartu dicoret', '剔除的卡牌', '剔除的卡牌', 'カットしたカード', '제외된 카드']),
 ('ui.rv1-maybe', 'Maybe', ['Peut-être', 'Vielleicht', 'Quizás', 'Forse', 'Talvez', 'Baka', 'ஒருவேளை', 'Mungkin', '备选', '備選', '候補', '후보']),
 ('ui.rv1-none', 'No review yet', ['Pas encore de revue', 'Noch keine Prüfung', 'Aún sin revisión', 'Nessuna revisione ancora', 'Ainda sem revisão', 'Wala pang pagsusuri', 'இன்னும் மதிப்பாய்வு இல்லை', 'Belum ada tinjauan', '尚未评审', '尚未評審', 'まだレビューなし', '아직 검토 없음']),
 ('ui.rv1-by-owner', 'owner', ['propriétaire', 'Besitzer', 'dueño', 'proprietario', 'dono', 'may-ari', 'உரிமையாளர்', 'pemilik', '主人', '主人', 'オーナー', '소유자']),
 ('ui.rv1-by-claude', 'Claude', ['Claude'] * 12),
 ('ui.rv1-by-kept', 'kept', ['conservée', 'behalten', 'conservada', 'mantenuta', 'mantida', 'pinanatili', 'தக்கவைத்தது', 'dipertahankan', '保留', '保留', '据え置き', '유지']),
 ('ui.rv1-act-cut', '✂ Cut', ['✂ Écarter', '✂ Streichen', '✂ Recortar', '✂ Taglia', '✂ Cortar', '✂ Tanggalin', '✂ நீக்கு', '✂ Coret', '✂ 剔除', '✂ 剔除', '✂ カット', '✂ 제외']),
 ('ui.rv1-act-keep', '↩ Keep', ['↩ Garder', '↩ Behalten', '↩ Conservar', '↩ Tieni', '↩ Manter', '↩ Panatilihin', '↩ வை', '↩ Simpan', '↩ 保留', '↩ 保留', '↩ 残す', '↩ 유지']),
 ('ui.rv1-undo', 'Undo', ['Annuler', 'Rückgängig', 'Deshacer', 'Annulla', 'Desfazer', 'I-undo', 'செயல்தவிர்', 'Urungkan', '撤销', '復原', '元に戻す', '실행 취소']),
 ('ui.rv1-copy', 'Copy my picks', ['Copier mes choix', 'Meine Wahl kopieren', 'Copiar mis elecciones', 'Copia le mie scelte', 'Copiar minhas escolhas', 'Kopyahin ang mga napili ko', 'என் தேர்வுகளை நகலெடு', 'Salin pilihan saya', '复制我的选择', '複製我的選擇', '選択をコピー', '내 선택 복사']),
 ('ui.rv1-copied', 'Copied: paste it to Claude', ['Copié : colle-le à Claude', 'Kopiert: an Claude einfügen', 'Copiado: pégalo a Claude', 'Copiato: incollalo a Claude', 'Copiado: cole para o Claude', 'Nakopya: i-paste kay Claude', 'நகலெடுத்தது: Claude-இடம் ஒட்டவும்', 'Tersalin: tempel ke Claude', '已复制：粘贴给 Claude', '已複製：貼給 Claude', 'コピーしました：Claudeに貼り付けてください', '복사됨: Claude에게 붙여넣으세요']),
 ('ui.rv1-copy-none', 'Nothing changed yet', ['Rien de changé', 'Noch nichts geändert', 'Nada cambiado aún', 'Nessuna modifica', 'Nada alterado ainda', 'Wala pang nabago', 'இன்னும் மாற்றம் இல்லை', 'Belum ada perubahan', '尚未更改', '尚未更改', 'まだ変更なし', '아직 변경 없음']),
]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
TP = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(TP, encoding='utf-8').read()
end = src.index('\n}/*TEXT-TABLE-END*/')
add = [(k, en) for k, en, _ in ROWS if ('"%s":' % k) not in src]
if add:
    src = src[:end] + ',\n' + ',\n'.join('  %s: %s' % (json.dumps(k), json.dumps(en, ensure_ascii=False)) for k, en in add) + src[end:]
    open(TP, 'w', encoding='utf-8').write(src)
for k, en, row in ROWS: assert json.dumps(en, ensure_ascii=False) in src, en
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for k, en, row in ROWS:
        assert len(row) == len(CODES) and ph(en) == ph(row[i]), (code, en)
        if en in pack: continue
        pack[en] = row[i]
    dump(path, pack)
print('texts: %d new keys; wrote %d packs, %d texts each' % (len(add), len(CODES), len(ROWS)))
