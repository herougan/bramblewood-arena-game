#!/usr/bin/env python3
"""Package RV texts (2026-10-19, owner 00:19: "Revive is true death, but Rescue no." / "Quiet Contemplation on Map 21's boss: no 2x
and re-enablement effects."): the Quiet Contemplation field (name, card line, short line, Codex line), its battle-log line, the
Revive log line and the Revive skill text, in the 12 packs. The English is the TX table's (bramblewood-texts.js: ui.fx-name-quiet-
contemplation, ui.fx-quiet-contemplation, ui.fx-quiet-contemplation-short, ui.fxx-quiet-contemplation, ui.log-quiet-stills,
ui.log-revive, ui.skill-revive); the packs are keyed by that English (a leading emoji is not part of the key). Same rules as
i18n_2026_10_19_fz.py (every {placeholder} kept).

    python3 tools/i18n_2026_10_19_rv.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
OLD = []
T = {
"Quiet Contemplation": [
  "Contemplation silencieuse", "Stille Besinnung", "Contemplación serena", "Contemplazione silenziosa", "Contemplação serena",
  "Tahimik na Pagninilay", "அமைதியான தியானம்", "Kontemplasi Hening", "静思", "靜思", "静かな瞑想", "고요한 명상"],
"Nothing happens twice: no doubling, no extra turns, no second goes. Both sides.": [
  "Rien n’arrive deux fois : aucun doublement, aucun tour en plus, aucune seconde chance. Pour les deux camps.",
  "Nichts geschieht zweimal: keine Verdopplung, keine Extrazüge, kein zweiter Versuch. Für beide Seiten.",
  "Nada ocurre dos veces: nada se duplica, sin turnos extra ni segundas oportunidades. Ambos bandos.",
  "Niente accade due volte: niente raddoppi, niente turni extra, niente seconde occasioni. Per entrambi i lati.",
  "Nada acontece duas vezes: nada dobra, sem turnos extra nem segundas vezes. Ambos os lados.",
  "Walang nangyayaring dalawang beses: walang pagdodoble, walang dagdag na turno, walang ikalawang tsansa. Parehong panig.",
  "எதுவும் இருமுறை நடக்காது: இரட்டிப்பு இல்லை, கூடுதல் முறை இல்லை, இரண்டாம் வாய்ப்பு இல்லை. இரு பக்கமும்.",
  "Tak ada yang terjadi dua kali: tanpa penggandaan, tanpa giliran tambahan, tanpa kesempatan kedua. Kedua pihak.",
  "任何事都不会发生两次：没有翻倍，没有额外回合，没有第二次机会。双方皆然。",
  "任何事都不會發生兩次：沒有翻倍，沒有額外回合，沒有第二次機會。雙方皆然。",
  "何事も二度は起きない：倍化なし、追加ターンなし、二度目なし。両陣営とも。",
  "무엇도 두 번 일어나지 않아요: 두 배도, 추가 턴도, 두 번째 기회도 없어요. 양쪽 모두."],
"Nothing doubles; no extra turns": [
  "Rien ne double ; pas de tour en plus", "Nichts verdoppelt sich; keine Extrazüge", "Nada se duplica; sin turnos extra",
  "Niente raddoppia; niente turni extra", "Nada dobra; sem turnos extra", "Walang nadodoble; walang dagdag na turno",
  "எதுவும் இரட்டிக்காது; கூடுதல் முறை இல்லை", "Tak ada yang berlipat; tanpa giliran tambahan", "无翻倍；无额外回合", "無翻倍；無額外回合",
  "倍化なし・追加ターンなし", "두 배 없음, 추가 턴 없음"],
"Off here: Headwind, Twin Strike, Frenzy's second swing, Twin Shot's second arrow, Twin, Echoing Wood, Crit, Expose's crit, Rage, Mighty, Tall Grass's double hits, Supreme Tide (plain Tide instead), Double Time, the extra turns of Fast Forward, Tailwind and Quick Attack, and Second Pitch.": [
  "Désactivés ici : Vent de face, Double frappe, le second coup de Frénésie, la seconde flèche de Tir jumelé, Jumeau, Bois en écho, Critique, le critique d’Exposition, Rage, Puissant, les coups doublés des Hautes herbes, Marée suprême (la Marée simple à la place), Temps double, les tours en plus d’Avance rapide, de Vent arrière et d’Attaque rapide, et Second rejet.",
  "Hier aus: Gegenwind, Doppelschlag, der zweite Hieb von Raserei, der zweite Pfeil von Zwillingsschuss, Zwilling, Echowald, Krit, der Krit von Bloßstellen, Wut, Mächtig, die doppelten Treffer im Hohen Gras, Höchste Flut (stattdessen die normale Flut), Doppelzeit, die Extrazüge von Schnellvorlauf, Rückenwind und Schnellangriff, und Zweiter Abwurf.",
  "Desactivado aquí: Viento en contra, Golpe doble, el segundo golpe de Frenesí, la segunda flecha de Disparo gemelo, Gemelo, Bosque del eco, Crítico, el crítico de Exponer, Furia, Poderoso, los golpes dobles de la Hierba alta, Marea suprema (la Marea normal en su lugar), Tiempo doble, los turnos extra de Avance rápido, Viento a favor y Ataque rápido, y Segundo descarte.",
  "Disattivati qui: Vento contrario, Doppio colpo, il secondo colpo di Frenesia, la seconda freccia di Tiro gemello, Gemello, Bosco dell’eco, Critico, il critico di Esporre, Furia, Possente, i colpi doppi dell’Erba alta, Marea suprema (al suo posto la Marea normale), Tempo doppio, i turni extra di Avanti veloce, Vento in poppa e Attacco rapido, e Secondo scarto.",
  "Desligados aqui: Vento contra, Golpe duplo, o segundo golpe de Frenesi, a segunda flecha de Tiro gêmeo, Gêmeo, Bosque do eco, Crítico, o crítico de Expor, Fúria, Poderoso, os golpes dobrados do Capim alto, Maré suprema (a Maré normal no lugar), Tempo duplo, os turnos extra de Avanço rápido, Vento a favor e Ataque rápido, e Segundo descarte.",
  "Patay dito: Headwind, Twin Strike, ang ikalawang hampas ng Frenzy, ang ikalawang palaso ng Twin Shot, Twin, Echoing Wood, Crit, ang crit ng Expose, Rage, Mighty, ang dobleng tama sa Tall Grass, Supreme Tide (karaniwang Tide sa halip), Double Time, ang dagdag na turno ng Fast Forward, Tailwind at Quick Attack, at Second Pitch.",
  "இங்கே இல்லை: எதிர்க்காற்று, இரட்டைத் தாக்குதல், வெறியின் இரண்டாம் அடி, இரட்டை எய்தலின் இரண்டாம் அம்பு, இரட்டை, எதிரொலிக் காடு, கிரிட், வெளிப்படுத்தலின் கிரிட், சினம், வலிமை, உயர்ந்த புல்லின் இரட்டை அடிகள், உச்ச அலை (பதிலாக சாதாரண அலை), இரட்டை நேரம், வேக முன்னோட்டம், பின்காற்று, விரைவுத் தாக்குதலின் கூடுதல் முறைகள், மற்றும் இரண்டாம் வீச்சு.",
  "Mati di sini: Angin Haluan, Serangan Kembar, ayunan kedua Amuk, panah kedua Tembakan Kembar, Kembar, Hutan Gema, Kritis, kritis Ekspos, Murka, Perkasa, serangan ganda Rumput Tinggi, Pasang Agung (Pasang biasa sebagai gantinya), Waktu Ganda, giliran tambahan Maju Cepat, Angin Buritan dan Serangan Cepat, serta Lemparan Kedua.",
  "此处无效：逆风、双重打击、狂乱的第二击、双发射击的第二箭、双生、回声之林、暴击、暴露的暴击、狂怒、强大、高草的双倍伤害、至高潮汐（改为普通潮汐）、双倍时间、快进、顺风与快攻的额外回合，以及第二次弃牌。",
  "此處無效：逆風、雙重打擊、狂亂的第二擊、雙發射擊的第二箭、雙生、回聲之林、暴擊、暴露的暴擊、狂怒、強大、高草的雙倍傷害、至高潮汐（改為普通潮汐）、雙倍時間、快進、順風與快攻的額外回合，以及第二次棄牌。",
  "ここでは無効：向かい風、二連撃、狂乱の二撃目、ツインショットの二本目の矢、双子、こだまの森、クリティカル、露出のクリティカル、激怒、剛力、高い草の二倍ダメージ、至高の潮（代わりに通常の潮）、ダブルタイム、早送り・追い風・クイックアタックの追加ターン、セカンドピッチ。",
  "여기서는 꺼짐: 역풍, 이중 타격, 광란의 두 번째 공격, 쌍둥이 사격의 두 번째 화살, 쌍둥이, 메아리 숲, 치명타, 노출의 치명타, 분노, 강력, 높은 풀의 두 배 공격, 지고의 조수(대신 일반 조수), 더블 타임, 빨리감기·순풍·빠른 공격의 추가 턴, 두 번째 버리기."],
"Quiet Contemplation stills {name}.": [
  "La Contemplation silencieuse apaise {name}.", "Die Stille Besinnung bremst {name}.", "La Contemplación serena calma a {name}.",
  "La Contemplazione silenziosa placa {name}.", "A Contemplação serena acalma {name}.", "Pinatahimik ng Tahimik na Pagninilay si {name}.",
  "அமைதியான தியானம் {name}-ஐ அமைதிப்படுத்துகிறது.", "Kontemplasi Hening menenangkan {name}.", "静思让{name}平静下来。", "靜思讓{name}平靜下來。",
  "静かな瞑想が{name}を鎮める。", "고요한 명상이 {name}을(를) 가라앉혀요."],
"{name} rises again at 1 Health! ✨": [
  "{name} se relève avec 1 Santé ! ✨", "{name} erhebt sich wieder mit 1 Leben! ✨", "¡{name} se alza de nuevo con 1 de Salud! ✨",
  "{name} si rialza con 1 Salute! ✨", "{name} se ergue de novo com 1 de Vida! ✨", "Bumangon muli si {name} na may 1 Health! ✨",
  "{name} 1 உயிருடன் மீண்டும் எழுகிறது! ✨", "{name} bangkit lagi dengan 1 Nyawa! ✨", "{name}以1点生命重新站起！✨", "{name}以1點生命重新站起！✨",
  "{name}がHP1で再び立ち上がる！✨", "{name}이(가) 체력 1로 다시 일어나요! ✨"],
"The first time it dies, it dies in full, then comes back with 1 Health and no statuses.": [
  "La première fois qu’elle meurt, c’est une vraie mort, puis elle revient avec 1 Santé et sans aucun état.",
  "Beim ersten Tod stirbt sie ganz, dann kehrt sie mit 1 Leben und ohne Zustände zurück.",
  "La primera vez que muere, muere del todo; luego vuelve con 1 de Salud y sin estados.",
  "La prima volta che muore, muore del tutto, poi torna con 1 Salute e senza stati.",
  "Na primeira vez que morre, morre de verdade e depois volta com 1 de Vida e sem estados.",
  "Sa unang pagkamatay nito, buo itong namamatay, saka bumabalik na may 1 Health at walang status.",
  "முதல் முறை இறக்கும்போது முழுமையாக இறக்கிறது; பின் 1 உயிருடன், எந்த நிலையுமின்றி திரும்புகிறது.",
  "Saat pertama kali mati, ia benar-benar mati, lalu kembali dengan 1 Nyawa tanpa status.",
  "第一次死亡时，它会完整地死去，然后以1点生命、无任何状态回归。",
  "第一次死亡時，它會完整地死去，然後以1點生命、無任何狀態回歸。",
  "初めて死んだとき、完全に死に、その後HP1・状態なしで戻ってくる。",
  "처음 죽을 때는 완전히 죽고, 그 뒤 체력 1에 상태 없이 돌아와요."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        # each new row goes in front of the first key that sorts after it; the rows already there keep their order (fewer merge clashes)
        items = [(k, v) for k, v in pack.items() if k not in T and k not in OLD]
        for en, row in T.items():
            at = next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items))
            items.insert(at, (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
