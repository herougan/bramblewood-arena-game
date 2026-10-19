#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package BF (the Forge level curve; owner 09:52: "majors to 4, 7, 10, minor to 2. Then divvy out
strength updates at all levels"): the anvil's "What each level gives" strip (title, help, the big / small step tags, "no change",
its screen-reader label); BF2 (13:57 / 14:07): the budget panel of the card editor and the Test Lab. Keys are the English with the leading emoji peeled, as the page translator sees them; every {placeholder}
is kept. Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_bf.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"What each level gives": [
  "Ce que donne chaque niveau", "Was jede Stufe bringt", "Lo que da cada nivel", "Cosa dà ogni livello", "O que cada nível dá", "Ang ibinibigay ng bawat level",
  "ஒவ்வொரு நிலையும் தருவது", "Yang diberikan tiap level", "每级提升", "每級提升", "各レベルで上がる分", "레벨마다 오르는 능력치"],
"Each level adds what this card's stat budget grows by. Levels 4, 7 and 10 are the big steps, Level 2 a smaller one; some levels add nothing.": [
  "Chaque niveau ajoute ce dont grandit le budget de stats de cette carte. Les niveaux 4, 7 et 10 sont les grands paliers, le niveau 2 un plus petit ; certains niveaux n'ajoutent rien.",
  "Jede Stufe fügt hinzu, um wie viel das Wertebudget dieser Karte wächst. Stufen 4, 7 und 10 sind die großen Schritte, Stufe 2 ein kleinerer; manche Stufen bringen nichts.",
  "Cada nivel suma lo que crece el presupuesto de estadísticas de esta carta. Los niveles 4, 7 y 10 son los saltos grandes, el nivel 2 uno menor; algunos niveles no suman nada.",
  "Ogni livello aggiunge quanto cresce il budget di statistiche di questa carta. I livelli 4, 7 e 10 sono i salti grandi, il livello 2 uno più piccolo; alcuni livelli non aggiungono nulla.",
  "Cada nível soma o que o orçamento de atributos desta carta cresce. Os níveis 4, 7 e 10 são os saltos grandes, o nível 2 um menor; alguns níveis não somam nada.",
  "Idinadagdag ng bawat level ang paglaki ng stat budget ng card na ito. Ang Level 4, 7 at 10 ang malalaking hakbang, ang Level 2 ay mas maliit; may mga level na walang dagdag.",
  "ஒவ்வொரு நிலையும் இந்த அட்டையின் புள்ளி வரவு எவ்வளவு வளர்கிறதோ அதைச் சேர்க்கும். நிலைகள் 4, 7, 10 பெரிய படிகள், நிலை 2 சிறியது; சில நிலைகள் எதையும் சேர்க்காது.",
  "Tiap level menambah sebesar pertumbuhan anggaran stat kartu ini. Level 4, 7, dan 10 adalah langkah besar, Level 2 yang lebih kecil; beberapa level tidak menambah apa-apa.",
  "每升一级，增加的是这张卡属性预算的增长量。4、7、10级是大幅提升，2级是小幅提升；有些等级没有变化。",
  "每升一級，增加的是這張卡屬性預算的增長量。4、7、10級是大幅提升，2級是小幅提升；有些等級沒有變化。",
  "各レベルで、このカードのステータス予算が増えた分だけ上がる。レベル4・7・10が大きな上昇、レベル2が小さな上昇。何も上がらないレベルもある。",
  "레벨마다 이 카드의 능력치 예산이 늘어난 만큼 오릅니다. 레벨 4, 7, 10이 큰 상승, 레벨 2가 작은 상승이며, 오르지 않는 레벨도 있습니다."],
"big step": [
  "grand palier", "großer Schritt", "salto grande", "salto grande", "salto grande", "malaking hakbang", "பெரிய படி", "langkah besar", "大幅提升", "大幅提升", "大きな上昇", "큰 상승"],
"small step": [
  "petit palier", "kleiner Schritt", "salto pequeño", "salto piccolo", "salto pequeno", "maliit na hakbang", "சிறிய படி", "langkah kecil", "小幅提升", "小幅提升", "小さな上昇", "작은 상승"],
"no change": [
  "aucun changement", "keine Änderung", "sin cambio", "nessun cambiamento", "sem mudança", "walang pagbabago", "மாற்றம் இல்லை", "tidak berubah", "无变化", "無變化", "変化なし", "변화 없음"],
"Stat gains from level {from} to level {to}": [
  "Gains de stats du niveau {from} au niveau {to}", "Wertezuwächse von Stufe {from} bis Stufe {to}", "Mejoras de estadísticas del nivel {from} al {to}",
  "Aumenti di statistiche dal livello {from} al {to}", "Ganhos de atributos do nível {from} ao {to}", "Dagdag na stat mula level {from} hanggang level {to}",
  "நிலை {from} முதல் நிலை {to} வரை புள்ளி உயர்வுகள்", "Kenaikan stat dari level {from} sampai level {to}", "从 {from} 级到 {to} 级的属性提升",
  "從 {from} 級到 {to} 級的屬性提升", "レベル {from} から {to} までのステータス上昇", "레벨 {from}부터 {to}까지의 능력치 상승"],
# 2026-10-19 (package BF2, owner 13:57 / 14:07): the card editor's budget panel and the Test Lab's budget lines
"Within budget · N = {n} (Base = {base})": [
  "Dans le budget · N = {n} (Base = {base})", "Im Budget · N = {n} (Basis = {base})", "Dentro del presupuesto · N = {n} (Base = {base})", "Nel budget · N = {n} (Base = {base})",
  "Dentro do orçamento · N = {n} (Base = {base})", "Pasok sa budget · N = {n} (Base = {base})", "வரவுக்குள் · N = {n} (அடிப்படை = {base})", "Dalam anggaran · N = {n} (Dasar = {base})",
  "在预算内 · N = {n}（基数 = {base}）", "在預算內 · N = {n}（基數 = {base}）", "予算内 · N = {n}（基礎 = {base}）", "예산 안 · N = {n} (기본 = {base})"],
"Over budget · N = {n} (Base = {base})": [
  "Hors budget · N = {n} (Base = {base})", "Über Budget · N = {n} (Basis = {base})", "Fuera del presupuesto · N = {n} (Base = {base})", "Fuori budget · N = {n} (Base = {base})",
  "Acima do orçamento · N = {n} (Base = {base})", "Lampas sa budget · N = {n} (Base = {base})", "வரவைத் தாண்டியது · N = {n} (அடிப்படை = {base})", "Melebihi anggaran · N = {n} (Dasar = {base})",
  "超出预算 · N = {n}（基数 = {base}）", "超出預算 · N = {n}（基數 = {base}）", "予算オーバー · N = {n}（基礎 = {base}）", "예산 초과 · N = {n} (기본 = {base})"],
"Well under budget · N = {n} (Base = {base})": [
  "Bien sous le budget · N = {n} (Base = {base})", "Deutlich unter Budget · N = {n} (Basis = {base})", "Muy por debajo del presupuesto · N = {n} (Base = {base})", "Ben sotto il budget · N = {n} (Base = {base})",
  "Bem abaixo do orçamento · N = {n} (Base = {base})", "Malayo sa budget · N = {n} (Base = {base})", "வரவுக்கு மிகக் கீழ் · N = {n} (அடிப்படை = {base})", "Jauh di bawah anggaran · N = {n} (Dasar = {base})",
  "远低于预算 · N = {n}（基数 = {base}）", "遠低於預算 · N = {n}（基數 = {base}）", "予算を大きく下回る · N = {n}（基礎 = {base}）", "예산보다 한참 아래 · N = {n} (기본 = {base})"],
"Level {level} · {rarity} · Wait {wait} · Lumber {lumber}": [
  "Niveau {level} · {rarity} · Attente {wait} · Bois {lumber}", "Stufe {level} · {rarity} · Warten {wait} · Holz {lumber}", "Nivel {level} · {rarity} · Espera {wait} · Madera {lumber}", "Livello {level} · {rarity} · Attesa {wait} · Legno {lumber}",
  "Nível {level} · {rarity} · Espera {wait} · Madeira {lumber}", "Level {level} · {rarity} · Hintay {wait} · Kahoy {lumber}", "நிலை {level} · {rarity} · காத்திருப்பு {wait} · மரம் {lumber}", "Level {level} · {rarity} · Tunggu {wait} · Kayu {lumber}",
  "等级 {level} · {rarity} · 等待 {wait} · 木材 {lumber}", "等級 {level} · {rarity} · 等待 {wait} · 木材 {lumber}", "レベル {level} · {rarity} · 待機 {wait} · 木材 {lumber}", "레벨 {level} · {rarity} · 대기 {wait} · 목재 {lumber}"],
"Stats: (2×{a} + {h} + {s} skills){m} = {x} {op} N = {n} {mark}": [
  "Stats : (2×{a} + {h} + {s} compétences){m} = {x} {op} N = {n} {mark}", "Werte: (2×{a} + {h} + {s} Fähigkeiten){m} = {x} {op} N = {n} {mark}", "Estadísticas: (2×{a} + {h} + {s} habilidades){m} = {x} {op} N = {n} {mark}", "Statistiche: (2×{a} + {h} + {s} abilità){m} = {x} {op} N = {n} {mark}",
  "Atributos: (2×{a} + {h} + {s} habilidades){m} = {x} {op} N = {n} {mark}", "Stats: (2×{a} + {h} + {s} skill){m} = {x} {op} N = {n} {mark}", "புள்ளிகள்: (2×{a} + {h} + {s} திறன்கள்){m} = {x} {op} N = {n} {mark}", "Stat: (2×{a} + {h} + {s} skill){m} = {x} {op} N = {n} {mark}",
  "属性：(2×{a} + {h} + {s} 技能){m} = {x} {op} N = {n} {mark}", "屬性：(2×{a} + {h} + {s} 技能){m} = {x} {op} N = {n} {mark}", "ステータス：(2×{a} + {h} + {s} スキル){m} = {x} {op} N = {n} {mark}", "능력치: (2×{a} + {h} + {s} 스킬){m} = {x} {op} N = {n} {mark}"],
"Product: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}": [
  "Produit : ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "Produkt: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "Producto: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "Prodotto: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}",
  "Produto: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "Product: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "பெருக்கம்: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "Hasil kali: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}",
  "乘积：({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "乘積：({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "積：({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "곱: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}"],
"× {m}: {skills} makes about half the attacks at it miss, so its stats count half again.": [
  "× {m} : avec {skills}, environ la moitié des attaques contre elle ratent, ses stats comptent donc une fois et demie.", "× {m}: {skills} lässt etwa die Hälfte der Angriffe auf sie danebengehen, daher zählen ihre Werte anderthalbfach.", "× {m}: {skills} hace fallar más o menos la mitad de los ataques contra ella, así que sus estadísticas cuentan una vez y media.", "× {m}: {skills} fa mancare circa metà degli attacchi contro di lei, quindi le sue statistiche contano una volta e mezza.",
  "× {m}: {skills} faz falhar cerca de metade dos ataques contra ela, por isso os atributos contam uma vez e meia.", "× {m}: dahil sa {skills}, halos kalahati ng mga atake rito ay sumasablay, kaya isa't kalahati ang bilang ng stats nito.", "× {m}: {skills} அதன் மீதான தாக்குதல்களில் பாதியைத் தவறச் செய்யும்; ஆகவே அதன் புள்ளிகள் ஒன்றரை மடங்கு கணக்கிடப்படும்.", "× {m}: {skills} membuat sekitar separuh serangan ke kartu ini meleset, jadi stat-nya dihitung satu setengah kali.",
  "× {m}：{skills} 使约一半攻击它的攻击落空，所以它的属性按一倍半计算。", "× {m}：{skills} 使約一半攻擊它的攻擊落空，所以它的屬性按一倍半計算。", "× {m}：{skills} で、このカードへの攻撃の約半分が外れる。そのためステータスは1.5倍で数える。", "× {m}: {skills} 때문에 이 카드를 노린 공격의 절반쯤이 빗나가므로 능력치를 1.5배로 셉니다."],
"Base = {parts} = {base}": [
  "Base = {parts} = {base}", "Basis = {parts} = {base}", "Base = {parts} = {base}", "Base = {parts} = {base}", "Base = {parts} = {base}", "Base = {parts} = {base}",
  "அடிப்படை = {parts} = {base}", "Dasar = {parts} = {base}", "基数 = {parts} = {base}", "基數 = {parts} = {base}", "基礎 = {parts} = {base}", "기본 = {parts} = {base}"],
"Wait {v}": ["Attente {v}", "Warten {v}", "Espera {v}", "Attesa {v}", "Espera {v}", "Hintay {v}", "காத்திருப்பு {v}", "Tunggu {v}", "等待 {v}", "等待 {v}", "待機 {v}", "대기 {v}"],
"Lumber {v}": ["Bois {v}", "Holz {v}", "Madera {v}", "Legno {v}", "Madeira {v}", "Kahoy {v}", "மரம் {v}", "Kayu {v}", "木材 {v}", "木材 {v}", "木材 {v}", "목재 {v}"],
"Map {map} × {coef} = {v}": [
  "Carte {map} × {coef} = {v}", "Karte {map} × {coef} = {v}", "Mapa {map} × {coef} = {v}", "Mappa {map} × {coef} = {v}", "Mapa {map} × {coef} = {v}", "Mapa {map} × {coef} = {v}",
  "வரைபடம் {map} × {coef} = {v}", "Peta {map} × {coef} = {v}", "地图 {map} × {coef} = {v}", "地圖 {map} × {coef} = {v}", "マップ {map} × {coef} = {v}", "맵 {map} × {coef} = {v}"],
"Ritual {v}": ["Rituel {v}", "Ritual {v}", "Ritual {v}", "Rituale {v}", "Ritual {v}", "Ritwal {v}", "சடங்கு {v}", "Ritual {v}", "仪式 {v}", "儀式 {v}", "儀式 {v}", "의식 {v}"],
"N = (Base + Level/{lin}) × (1 + Level/{div}); Level 0: Base − {zero}. Base = {base} + Rarity + {w}×Wait + {w2}×Wait² + {l}×Lumber + {l2}×Lumber² + Ritual + {mc}×Map.": [
  "N = (Base + Niveau/{lin}) × (1 + Niveau/{div}) ; niveau 0 : Base − {zero}. Base = {base} + Rareté + {w}×Attente + {w2}×Attente² + {l}×Bois + {l2}×Bois² + Rituel + {mc}×Carte.",
  "N = (Basis + Stufe/{lin}) × (1 + Stufe/{div}); Stufe 0: Basis − {zero}. Basis = {base} + Seltenheit + {w}×Warten + {w2}×Warten² + {l}×Holz + {l2}×Holz² + Ritual + {mc}×Karte.",
  "N = (Base + Nivel/{lin}) × (1 + Nivel/{div}); nivel 0: Base − {zero}. Base = {base} + Rareza + {w}×Espera + {w2}×Espera² + {l}×Madera + {l2}×Madera² + Ritual + {mc}×Mapa.",
  "N = (Base + Livello/{lin}) × (1 + Livello/{div}); livello 0: Base − {zero}. Base = {base} + Rarità + {w}×Attesa + {w2}×Attesa² + {l}×Legno + {l2}×Legno² + Rituale + {mc}×Mappa.",
  "N = (Base + Nível/{lin}) × (1 + Nível/{div}); nível 0: Base − {zero}. Base = {base} + Raridade + {w}×Espera + {w2}×Espera² + {l}×Madeira + {l2}×Madeira² + Ritual + {mc}×Mapa.",
  "N = (Base + Level/{lin}) × (1 + Level/{div}); Level 0: Base − {zero}. Base = {base} + Rarity + {w}×Hintay + {w2}×Hintay² + {l}×Kahoy + {l2}×Kahoy² + Ritwal + {mc}×Mapa.",
  "N = (அடிப்படை + நிலை/{lin}) × (1 + நிலை/{div}); நிலை 0: அடிப்படை − {zero}. அடிப்படை = {base} + அரிதுநிலை + {w}×காத்திருப்பு + {w2}×காத்திருப்பு² + {l}×மரம் + {l2}×மரம்² + சடங்கு + {mc}×வரைபடம்.",
  "N = (Dasar + Level/{lin}) × (1 + Level/{div}); Level 0: Dasar − {zero}. Dasar = {base} + Kelangkaan + {w}×Tunggu + {w2}×Tunggu² + {l}×Kayu + {l2}×Kayu² + Ritual + {mc}×Peta.",
  "N = (基数 + 等级/{lin}) × (1 + 等级/{div})；0 级：基数 − {zero}。基数 = {base} + 稀有度 + {w}×等待 + {w2}×等待² + {l}×木材 + {l2}×木材² + 仪式 + {mc}×地图。",
  "N = (基數 + 等級/{lin}) × (1 + 等級/{div})；0 級：基數 − {zero}。基數 = {base} + 稀有度 + {w}×等待 + {w2}×等待² + {l}×木材 + {l2}×木材² + 儀式 + {mc}×地圖。",
  "N = (基礎 + レベル/{lin}) × (1 + レベル/{div})；レベル0：基礎 − {zero}。基礎 = {base} + レア度 + {w}×待機 + {w2}×待機² + {l}×木材 + {l2}×木材² + 儀式 + {mc}×マップ。",
  "N = (기본 + 레벨/{lin}) × (1 + 레벨/{div}); 레벨 0: 기본 − {zero}. 기본 = {base} + 희귀도 + {w}×대기 + {w2}×대기² + {l}×목재 + {l2}×목재² + 의식 + {mc}×맵."],
"(pink: under {pct}% of N)": [
  "(rose : sous {pct} % de N)", "(rosa: unter {pct} % von N)", "(rosa: por debajo del {pct} % de N)", "(rosa: sotto il {pct}% di N)", "(rosa: abaixo de {pct}% de N)", "(pink: mas mababa sa {pct}% ng N)",
  "(இளஞ்சிவப்பு: N இன் {pct}% க்குக் கீழ்)", "(merah muda: di bawah {pct}% dari N)", "（粉色：低于 N 的 {pct}%）", "（粉色：低於 N 的 {pct}%）", "（ピンク：N の {pct}% 未満）", "(분홍: N의 {pct}% 미만)"],
"Pink: the Stats score is at or below {pct}% of N, so the card has room to grow.": [
  "Rose : le score Stats est à {pct} % de N ou moins, la carte a donc de la marge.", "Rosa: Der Wertescore liegt bei höchstens {pct} % von N, die Karte hat also Luft nach oben.", "Rosa: la puntuación de estadísticas es como mucho el {pct} % de N, así que la carta tiene margen.", "Rosa: il punteggio delle statistiche è al massimo il {pct}% di N, quindi la carta ha margine.",
  "Rosa: a pontuação de atributos é no máximo {pct}% de N, por isso a carta tem margem.", "Pink: ang Stats score ay {pct}% ng N o mas mababa, kaya may puwang pa ang card.", "இளஞ்சிவப்பு: புள்ளி மதிப்பெண் N இன் {pct}% அல்லது குறைவு; அட்டைக்கு வளர இடம் உண்டு.", "Merah muda: skor Stat paling banyak {pct}% dari N, jadi kartu masih punya ruang.",
  "粉色：属性分不超过 N 的 {pct}%，这张卡还有提升空间。", "粉色：屬性分不超過 N 的 {pct}%，這張卡還有提升空間。", "ピンク：ステータス値が N の {pct}% 以下なので、まだ伸ばす余地がある。", "분홍: 능력치 점수가 N의 {pct}% 이하라 카드에 여유가 있습니다."],
"A card passes when both hold: Stats (2×Attack + Health + Skills) < N and Product (Attack × Health + Skills) < (N/3)². Level is the level the card starts at (Base and quest cards 0, rewards 1).": [
  "Une carte passe si les deux tiennent : Stats (2×Attaque + PV + Compétences) < N et Produit (Attaque × PV + Compétences) < (N/3)². Le niveau est celui de départ de la carte (cartes de base et de quête 0, récompenses 1).",
  "Eine Karte besteht, wenn beides gilt: Werte (2×Angriff + Leben + Fähigkeiten) < N und Produkt (Angriff × Leben + Fähigkeiten) < (N/3)². Die Stufe ist die Startstufe der Karte (Basis- und Questkarten 0, Belohnungen 1).",
  "Una carta pasa si se cumplen ambas: Estadísticas (2×Ataque + Vida + Habilidades) < N y Producto (Ataque × Vida + Habilidades) < (N/3)². El nivel es el inicial de la carta (cartas base y de misión 0, recompensas 1).",
  "Una carta passa se valgono entrambe: Statistiche (2×Attacco + Salute + Abilità) < N e Prodotto (Attacco × Salute + Abilità) < (N/3)². Il livello è quello iniziale della carta (carte base e missione 0, ricompense 1).",
  "Uma carta passa quando ambas valem: Atributos (2×Ataque + Vida + Habilidades) < N e Produto (Ataque × Vida + Habilidades) < (N/3)². O nível é o inicial da carta (cartas base e de missão 0, recompensas 1).",
  "Pasado ang card kapag totoo ang dalawa: Stats (2×Atake + Buhay + Skill) < N at Product (Atake × Buhay + Skill) < (N/3)². Ang Level ay ang simulang level ng card (Base at quest card 0, gantimpala 1).",
  "இரண்டும் உண்மையானால் அட்டை தேறும்: புள்ளிகள் (2×தாக்குதல் + உயிர் + திறன்கள்) < N, பெருக்கம் (தாக்குதல் × உயிர் + திறன்கள்) < (N/3)². நிலை என்பது அட்டை தொடங்கும் நிலை (அடிப்படை, தேடல் அட்டைகள் 0, பரிசுகள் 1).",
  "Kartu lolos bila keduanya terpenuhi: Stat (2×Serangan + Nyawa + Skill) < N dan Hasil kali (Serangan × Nyawa + Skill) < (N/3)². Level adalah level awal kartu (kartu dasar dan misi 0, hadiah 1).",
  "两项都满足时卡牌通过：属性 (2×攻击 + 生命 + 技能) < N，乘积 (攻击 × 生命 + 技能) < (N/3)²。等级为卡牌的起始等级（基础卡和任务卡为 0，奖励卡为 1）。",
  "兩項都滿足時卡牌通過：屬性 (2×攻擊 + 生命 + 技能) < N，乘積 (攻擊 × 生命 + 技能) < (N/3)²。等級為卡牌的起始等級（基礎卡和任務卡為 0，獎勵卡為 1）。",
  "両方を満たせば合格：ステータス (2×攻撃 + 体力 + スキル) < N、積 (攻撃 × 体力 + スキル) < (N/3)²。レベルはカードの開始レベル（ベース・クエストカードは0、報酬は1）。",
  "둘 다 맞으면 통과: 능력치 (2×공격 + 체력 + 스킬) < N, 곱 (공격 × 체력 + 스킬) < (N/3)². 레벨은 카드의 시작 레벨입니다 (기본·퀘스트 카드 0, 보상 1)."],
"Both scores × {m} for each skill that makes about half the attacks at a card miss ({skills}); those skills cost 0.": [
  "Les deux scores × {m} pour chaque compétence qui fait rater environ la moitié des attaques contre la carte ({skills}) ; ces compétences coûtent 0.",
  "Beide Werte × {m} für jede Fähigkeit, die etwa die Hälfte der Angriffe auf die Karte danebengehen lässt ({skills}); diese Fähigkeiten kosten 0.",
  "Ambas puntuaciones × {m} por cada habilidad que hace fallar más o menos la mitad de los ataques contra la carta ({skills}); esas habilidades cuestan 0.",
  "Entrambi i punteggi × {m} per ogni abilità che fa mancare circa metà degli attacchi contro la carta ({skills}); quelle abilità costano 0.",
  "Ambas as pontuações × {m} por cada habilidade que faz falhar cerca de metade dos ataques contra a carta ({skills}); essas habilidades custam 0.",
  "Parehong score × {m} sa bawat skill na nagpapasablay sa halos kalahati ng mga atake sa card ({skills}); 0 ang halaga ng mga skill na iyon.",
  "அட்டை மீதான தாக்குதல்களில் பாதியைத் தவறச் செய்யும் ஒவ்வொரு திறனுக்கும் ({skills}) இரு மதிப்பெண்களும் × {m}; அத்திறன்களுக்குச் செலவு 0.",
  "Kedua skor × {m} untuk tiap skill yang membuat sekitar separuh serangan ke kartu meleset ({skills}); skill itu berbiaya 0.",
  "每有一个让约一半攻击该卡的攻击落空的技能（{skills}），两项分数都 × {m}；这些技能本身计 0。",
  "每有一個讓約一半攻擊該卡的攻擊落空的技能（{skills}），兩項分數都 × {m}；這些技能本身計 0。",
  "カードへの攻撃の約半分を外させるスキル（{skills}）1つごとに、両方の値を × {m}。そのスキル自体のコストは0。",
  "카드를 노린 공격의 절반쯤을 빗나가게 하는 스킬({skills})마다 두 점수 모두 × {m}; 그 스킬 자체는 0입니다."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        items = list((json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}).items())
        for en, row in T.items():  # in place, without re-sorting the pack (other packages' lines stay where they are)
            j = next((j for j, (k, _) in enumerate(items) if k == en), None)
            if j is not None: items[j] = (en, row[i]); continue
            items.insert(next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items)), (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
