#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package SG (owner 23:43: "Stomping Grounds UI fidelity should match the rest."): the
Stomping Grounds' create-screen heading, its loading and error states and the empty hints on the Skills and Materia benches. The
rules for a template row are those of i18n_2026_10_18d.py (every {placeholder} kept). Keys are the English, as the page translator
sees them. A row a pack already has (in lang/<code>.json or lang/ui/<code>.json: "Try again", "Stomping Grounds", the subtitle) is
left as the pack has it. The words follow the packs (Héros / Held / Héroe ..., Materia / Matéria / 魔晶 / マテリア / 마테리아). Same
caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_sg.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Choose your Hero's people": [
  "Choisissez le peuple de votre Héros", "Wähle das Volk deines Helden", "Elige el pueblo de tu Héroe", "Scegli il popolo del tuo Eroe",
  "Escolhe o povo do teu Herói", "Piliin ang lahi ng iyong Bayani", "உங்கள் நாயகனின் இனத்தைத் தேர்ந்தெடுங்கள்", "Pilih bangsa Pahlawanmu",
  "选择你的英雄的族群", "選擇你的英雄的族群", "ヒーローの種族を選ぼう", "영웅의 종족을 고르세요"],
"Raking the training ring…": [
  "On ratisse l’arène d’entraînement…", "Der Trainingsring wird geharkt …", "Rastrillando el ruedo de entrenamiento…", "Si rastrella l’arena di allenamento…",
  "A alisar a arena de treino…", "Sinusuyod ang ruweda ng pagsasanay…", "பயிற்சி வளையம் சீர்செய்யப்படுகிறது…", "Meratakan arena latihan…",
  "正在耙平训练场…", "正在耙平訓練場…", "訓練場をならしています…", "훈련장을 고르는 중…"],
"The Stomping Grounds didn't draw properly.": [
  "Le Terrain de piétinement ne s’est pas affiché correctement.", "Der Stampfplatz wurde nicht richtig angezeigt.", "El Campo de Pisoteo no se mostró bien.",
  "Il Campo di calpestio non si è visualizzato bene.", "O Campo de Treino não apareceu como devia.", "Hindi naipakita nang maayos ang Tapakan.",
  "பயிற்சிக் களம் சரியாகக் காட்டப்படவில்லை.", "Lapangan Latihan tidak tampil dengan benar.", "踩踏场没有正确显示。", "踩踏場沒有正確顯示。",
  "踏み鳴らしの広場がうまく表示されませんでした。", "쿵쿵 훈련장을 제대로 표시하지 못했어요."],
"Your Hero is safe. Try again, or come back in a moment.": [
  "Votre Héros ne risque rien. Réessayez, ou revenez dans un instant.", "Deinem Helden ist nichts passiert. Versuch es nochmal oder komm gleich wieder.",
  "Tu Héroe está a salvo. Vuelve a intentarlo o regresa en un momento.", "Il tuo Eroe è al sicuro. Riprova, o torna tra un momento.",
  "O teu Herói está a salvo. Tenta de novo ou volta daqui a pouco.", "Ligtas ang iyong Bayani. Subukan ulit, o bumalik mamaya.",
  "உங்கள் நாயகன் பாதுகாப்பாக இருக்கிறான். மீண்டும் முயலுங்கள், அல்லது சற்று நேரம் கழித்து வாருங்கள்.", "Pahlawanmu aman. Coba lagi, atau kembali sebentar lagi.",
  "你的英雄安然无恙。再试一次，或者稍后再来。", "你的英雄安然無恙。再試一次，或者稍後再來。", "ヒーローは無事です。もう一度試すか、少ししてから来てください。",
  "영웅은 무사해요. 다시 시도하거나 잠시 후에 다시 오세요."],
"No skills yet. Your first pick comes at Level {n}.": [
  "Pas encore de compétence. Votre premier choix arrive au niveau {n}.", "Noch keine Fähigkeiten. Deine erste Wahl kommt auf Stufe {n}.",
  "Aún no hay habilidades. Tu primera elección llega en el nivel {n}.", "Ancora nessuna abilità. La prima scelta arriva al livello {n}.",
  "Ainda sem habilidades. A tua primeira escolha chega no nível {n}.", "Wala pang kakayahan. Darating ang unang pili mo sa Level {n}.",
  "இன்னும் திறன்கள் இல்லை. முதல் தேர்வு நிலை {n}-இல் வரும்.", "Belum ada keahlian. Pilihan pertamamu datang di Level {n}.",
  "还没有技能。第一次挑选在 {n} 级。", "還沒有技能。第一次挑選在 {n} 級。", "スキルはまだありません。最初の選択はレベル{n}で。", "아직 스킬이 없어요. 첫 선택은 레벨 {n}에서 해요."],
"No crystals yet. Craft your first one below.": [
  "Pas encore de cristal. Fabriquez le premier ci-dessous.", "Noch keine Kristalle. Stell unten deinen ersten her.",
  "Aún no hay cristales. Fabrica el primero aquí abajo.", "Ancora nessun cristallo. Crea il primo qui sotto.",
  "Ainda sem cristais. Cria o primeiro aqui em baixo.", "Wala pang kristal. Gawin ang una mo sa ibaba.",
  "இன்னும் படிகங்கள் இல்லை. முதலாவதைக் கீழே உருவாக்குங்கள்.", "Belum ada kristal. Buat yang pertama di bawah.",
  "还没有晶石。在下面打造你的第一颗吧。", "還沒有晶石。在下面打造你的第一顆吧。", "クリスタルはまだありません。下で最初のひとつを作ろう。", "아직 수정이 없어요. 아래에서 첫 수정을 만들어 보세요."],
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
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # the pack's own order, new rows at the end
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
