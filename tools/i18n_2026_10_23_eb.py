#!/usr/bin/env python3
"""Game texts added on 2026-10-23 by package EB (owner 01:57 notes 8 and 9): where field-kit items come from now (2% a Conquest win for each
Energy it used, at most 3 a day), and the first-clear Energy capsule (+8) and Raid Ticket chips on the results. Same rules as
i18n_2026_10_23_pg.py: keys are the English as the page translator sees it, every {placeholder} is kept, a row a pack already has is left as
the pack has it. Tagalog, Tamil, Japanese and Korean deserve a native read.

    python3 tools/i18n_2026_10_23_eb.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Found on the road: {pct}% a Conquest win for each ⚡ it used, up to {n} a day.": [
  "Trouvés en chemin : {pct} % par victoire de Conquête pour chaque ⚡ dépensé, jusqu’à {n} par jour.",
  "Unterwegs gefunden: {pct} % pro Eroberungssieg für jedes verbrauchte ⚡, bis zu {n} am Tag.",
  "Encontrados en el camino: {pct} % por victoria de Conquista por cada ⚡ gastado, hasta {n} al día.",
  "Trovati lungo la strada: {pct}% a vittoria di Conquista per ogni ⚡ usato, fino a {n} al giorno.",
  "Encontrados pelo caminho: {pct}% por vitória de Conquista por cada ⚡ gasto, até {n} por dia.",
  "Nakukuha sa daan: {pct}% bawat panalo sa Conquest sa bawat ⚡ na nagamit, hanggang {n} bawat araw.",
  "வழியில் கிடைப்பவை: ஒவ்வொரு வெற்றி சண்டையிலும் பயன்படுத்திய ஒவ்வொரு ⚡ க்கும் {pct}%, ஒரு நாளில் அதிகபட்சம் {n}.",
  "Ditemukan di jalan: {pct}% per kemenangan Penaklukan untuk tiap ⚡ yang dipakai, sampai {n} sehari.",
  "路上拾得：每场征服胜利每消耗 1 ⚡ 有 {pct}% 机会，每天最多 {n} 个。",
  "路上拾得：每場征服勝利每消耗 1 ⚡ 有 {pct}% 機會，每天最多 {n} 個。",
  "道中で見つかる：征服の勝利ごとに使った⚡1につき{pct}%、1日{n}個まで。",
  "길에서 발견: 정복 승리마다 사용한 ⚡ 1당 {pct}%, 하루 최대 {n}개."],
"{n} left today": ["encore {n} aujourd’hui", "heute noch {n}", "quedan {n} hoy", "ancora {n} oggi", "faltam {n} hoje", "{n} pa ngayong araw",
  "இன்று இன்னும் {n}", "sisa {n} hari ini", "今天还剩 {n} 个", "今天還剩 {n} 個", "今日はあと{n}個", "오늘 {n}개 남음"],
"done for today": ["fini pour aujourd’hui", "für heute erledigt", "listo por hoy", "finito per oggi", "terminado por hoje", "tapos na ngayong araw",
  "இன்றைக்கு முடிந்தது", "selesai untuk hari ini", "今天已满", "今天已滿", "今日はもう終わり", "오늘은 끝"],
"A notices and above · finished weekly tiers": [
  "Avis A et plus · paliers hebdomadaires terminés", "Aushänge ab A · abgeschlossene Wochenstufen", "Avisos A o más · niveles semanales completados",
  "Avvisi A e superiori · livelli settimanali completati", "Avisos A ou mais · níveis semanais concluídos", "Mga paskil na A pataas · natapos na lingguhang antas",
  "A மற்றும் மேல் அறிவிப்புகள் · முடித்த வாராந்திர நிலைகள்", "Pengumuman A ke atas · tingkat mingguan yang selesai", "A 级及以上告示 · 完成的每周阶段",
  "A 級及以上告示 · 完成的每週階段", "Aランク以上の掲示 · 達成した週間段階", "A등급 이상 공고 · 완료한 주간 단계"],
"Energy capsule (+{n} ⚡)": ["Capsule d’énergie (+{n} ⚡)", "Energiekapsel (+{n} ⚡)", "Cápsula de energía (+{n} ⚡)", "Capsula di energia (+{n} ⚡)",
  "Cápsula de energia (+{n} ⚡)", "Energy capsule (+{n} ⚡)", "ஆற்றல் குப்பி (+{n} ⚡)", "Kapsul energi (+{n} ⚡)", "能量胶囊（+{n} ⚡）", "能量膠囊（+{n} ⚡）",
  "エネルギーカプセル（+{n} ⚡）", "에너지 캡슐 (+{n} ⚡)"],
"An Energy capsule gives {n} Energy. Tap ⚡ Energy to use it.": [
  "Une capsule d’énergie donne {n} d’énergie. Touchez ⚡ Énergie pour l’utiliser.", "Eine Energiekapsel gibt {n} Energie. Tippe auf ⚡ Energie, um sie zu nutzen.",
  "Una cápsula de energía da {n} de energía. Toca ⚡ Energía para usarla.", "Una capsula di energia dà {n} di energia. Tocca ⚡ Energia per usarla.",
  "Uma cápsula de energia dá {n} de energia. Toca em ⚡ Energia para a usar.", "Nagbibigay ang Energy capsule ng {n} Energy. I-tap ang ⚡ Energy para gamitin ito.",
  "ஒரு ஆற்றல் குப்பி {n} ஆற்றல் தரும். பயன்படுத்த ⚡ ஆற்றலைத் தட்டவும்.", "Kapsul energi memberi {n} Energi. Ketuk ⚡ Energi untuk memakainya.",
  "能量胶囊提供 {n} 点能量。点击 ⚡ 能量即可使用。", "能量膠囊提供 {n} 點能量。點擊 ⚡ 能量即可使用。",
  "エネルギーカプセルはエネルギーを{n}回復します。⚡エネルギーをタップして使います。", "에너지 캡슐은 에너지를 {n} 줍니다. ⚡ 에너지를 눌러 사용하세요."],
"A Raid Ticket: one more Raid attempt.": ["Un ticket de raid : une tentative de raid de plus.", "Ein Raid-Ticket: ein Raid-Versuch mehr.",
  "Un boleto de incursión: un intento de incursión más.", "Un biglietto raid: un tentativo di raid in più.", "Um bilhete de raide: mais uma tentativa de raide.",
  "Isang Raid Ticket: isa pang subok sa Raid.", "ஒரு ரெய்டு சீட்டு: இன்னும் ஒரு ரெய்டு முயற்சி.", "Tiket Raid: satu kesempatan Raid lagi.",
  "突袭券：多一次突袭机会。", "突襲券：多一次突襲機會。", "レイドチケット：レイドにもう1回挑戦できます。", "레이드 티켓: 레이드 도전 1회 추가."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        for en, row in T.items():
            if en in pack or en in uipack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
