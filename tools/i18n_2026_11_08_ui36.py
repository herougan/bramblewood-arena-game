# 2026-11-08 (package UI36, owner 10:52 #13: the Achievements page's Card Rewards filter).
#   python3 tools/i18n_2026_11_08_ui36.py   add the new keys to bramblewood-texts.js and their rows to lang/<code>.json (keyed by English text,
#                                           order kept, new rows at the end); renames ui.ui22-claude-title to "Thematic Recommendation". Safe to run again. Does not run keyify.
import json, re
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
def T(en, *tr):
    assert len(tr) == 12, en
    return (en, dict(zip(CODES, tr)))
NEW = {
 'ui.ui36-card-rewards': T('Card Rewards', 'Récompenses de cartes', 'Kartenbelohnungen', 'Recompensas de cartas', 'Ricompense di carte', 'Recompensas de cartas', 'Mga Gantimpalang Card', 'அட்டை பரிசுகள்', 'Hadiah Kartu', '卡牌奖励', '卡牌獎勵', 'カード報酬', '카드 보상'),
 'ui.ui36-n-ready': T('{n} ready', '{n} prêt(s)', '{n} bereit', '{n} listas', '{n} pronte', '{n} prontas', '{n} handa na', '{n} தயார்', '{n} siap', '{n} 个可领取', '{n} 個可領取', '{n} 件受取可', '{n}개 수령 가능'),
 'ui.ui36-cards-prize': T('Card reward x{n}', 'Récompense : cartes x{n}', 'Kartenbelohnung x{n}', 'Recompensa de cartas x{n}', 'Ricompensa di carte x{n}', 'Recompensa de cartas x{n}', 'Gantimpalang card x{n}', 'அட்டை பரிசு x{n}', 'Hadiah kartu x{n}', '卡牌奖励 x{n}', '卡牌獎勵 x{n}', 'カード報酬 x{n}', '카드 보상 x{n}'),
 'ui.ui36-cards-got': T('Cards received x{n}', 'Cartes reçues x{n}', 'Erhaltene Karten x{n}', 'Cartas recibidas x{n}', 'Carte ricevute x{n}', 'Cartas recebidas x{n}', 'Mga natanggap na card x{n}', 'பெற்ற அட்டைகள் x{n}', 'Kartu diterima x{n}', '已获得卡牌 x{n}', '已獲得卡牌 x{n}', '受け取ったカード x{n}', '받은 카드 x{n}'),
 'ui.ui36-next-card': T('Face-down card, likely {rarity}', 'Carte face cachée, probablement {rarity}', 'Verdeckte Karte, wahrscheinlich {rarity}', 'Carta boca abajo, probablemente {rarity}', 'Carta coperta, probabilmente {rarity}', 'Carta virada, provavelmente {rarity}', 'Nakataob na card, malamang {rarity}', 'கவிழ்த்த அட்டை, பெரும்பாலும் {rarity}', 'Kartu tertutup, kemungkinan {rarity}', '背面朝上的卡牌，很可能是{rarity}', '背面朝上的卡牌，很可能是{rarity}', '伏せたカード、おそらく{rarity}', '뒷면 카드, 아마도 {rarity}'),
 'ui.ui36-cards-tip': T('Achievements that give a card. The card is drawn from your faction pool when you claim it.', 'Succès qui donnent une carte. Elle est tirée de ta réserve de faction quand tu la réclames.', 'Erfolge, die eine Karte geben. Sie wird beim Abholen aus deinem Fraktionspool gezogen.', 'Logros que dan una carta. Se saca de tu reserva de facción al reclamarla.', "Obiettivi che danno una carta. Viene estratta dal tuo mazzo fazione quando la riscatti.", 'Conquistas que dão uma carta. Ela sai do seu conjunto de facção ao resgatar.', 'Mga achievement na nagbibigay ng card. Hinuhugot ito sa faction pool mo kapag kinuha mo.', 'அட்டை தரும் சாதனைகள். பெறும்போது உங்கள் பிரிவு தொகுப்பிலிருந்து எடுக்கப்படும்.', 'Pencapaian yang memberi kartu. Kartu diambil dari kumpulan faksi saat diklaim.', '会给卡牌的成就。领取时从你的阵营卡池中抽取。', '會給卡牌的成就。領取時從你的陣營卡池中抽取。', 'カードがもらえる実績。受け取る時に陣営プールから引かれます。', '카드를 주는 업적입니다. 수령할 때 진영 풀에서 뽑습니다.'),
 'ui.ui36-none': T('No card achievements match this filter.', 'Aucun succès avec carte ne correspond à ce filtre.', 'Kein Erfolg mit Karte passt zu diesem Filter.', 'Ningún logro con carta coincide con este filtro.', 'Nessun obiettivo con carta corrisponde a questo filtro.', 'Nenhuma conquista com carta corresponde a este filtro.', 'Walang achievement na may card na tugma sa filter na ito.', 'இந்த வடிகட்டிக்கு பொருந்தும் அட்டை சாதனை இல்லை.', 'Tidak ada pencapaian kartu yang cocok dengan filter ini.', '没有符合此筛选的卡牌成就。', '沒有符合此篩選的卡牌成就。', 'この絞り込みに合うカード実績はありません。', '이 필터에 맞는 카드 업적이 없습니다.'),
}
RENAME = {}
LEAD = re.compile(r'^[\s \U0001F000-\U0001FAFF☀-➿️‍]+')
def core(t): return LEAD.sub('', t.strip())
TX_LINE = re.compile(r'^(\s*)"([^"]+)":\s*"((?:[^"\\]|\\.)*)"(,?)\s*$')
def jdump(s): return json.dumps(s, ensure_ascii=False)[1:-1]
path = 'bramblewood-texts.js'; L = open(path, encoding='utf-8').read().split('\n')
end = next(i for i, l in enumerate(L) if l.startswith('}/*TEXT-TABLE-END*/'))
have = set(TX_LINE.match(l).group(2) for l in L if TX_LINE.match(l))
for k, (old, tr) in RENAME.items():
    for i, l in enumerate(L):
        m = TX_LINE.match(l)
        if m and m.group(2) == k: L[i] = '%s"%s": "%s"%s' % (m.group(1), k, jdump(tr[0]), m.group(4))
add = [k for k in NEW if k not in have]
if add:
    if not L[end - 1].rstrip().endswith(','): L[end - 1] = L[end - 1].rstrip() + ','
    L[end:end] = ['  "%s": "%s"%s' % (k, jdump(NEW[k][0]), ',' if j < len(add) - 1 else '') for j, k in enumerate(add)]
open(path, 'w', encoding='utf-8').write('\n'.join(L))
for code in CODES:
    p = 'lang/%s.json' % code; d = json.load(open(p, encoding='utf-8'))
    for k in NEW:
        en, tr = core(NEW[k][0]), core(NEW[k][1][code])
        if en not in d: d[en] = tr
    for k, (old, tr) in RENAME.items():
        en, t = core(tr[0]), core(tr[1][code])
        if en not in d: d[en] = t
        d.pop(core(old), None)
    open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('texts: %d keys added, %d renamed' % (len(add), len(RENAME)))
