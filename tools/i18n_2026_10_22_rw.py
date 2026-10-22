#!/usr/bin/env python3
"""Game texts changed on 2026-10-22 by package RW (owner N22-4..N22-6, and the six budget strings BF7 left describing the old rule).

  * the fight panel's drop line ("Possible drops: 🥚 2% · 🃏 7%") and its screen-reader labels, the rank wording that now only lives in aria-labels
    ("Needs rank {rank} or better"), the reward card that waits for a better win, and the rank words taken off the screen (the owner: "dont ever write
    rank B. it should be an emblem": the coach tip, the S-rank find tooltips, the Dragon Scale trail, the auto-play and notice tooltips);
  * the six budget strings reworded for BF7's rule: f x ((2A+H) x m + S) <= N and f x (A*H x m + S*|S|) <= (N/3)^2.

Same rules as i18n_2026_10_22_dv2.py (every {placeholder} kept; a row a pack already has is left as the pack has it). Same caveats as i18n_core.py
(Tagalog, Tamil, Japanese and Korean deserve a native read). The keys are the English game texts exactly (leading emoji and trailing colon kept; the
page translator tries the exact text first). The rows the old wording used (and nothing else uses) are pruned.

    python3 tools/i18n_2026_10_22_rw.py && python3 tools/i18n_refresh.py --write && python3 tools/i18n_ui.py --write
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
# --- the budget strings (BF7's rule) ---
"Stats: {f}((2×{a} + {h}){m} + {s} skills) = {x} {op} N = {n} {mark}": [
 "Stats : {f}((2×{a} + {h}){m} + {s} compétences) = {x} {op} N = {n} {mark}",
 "Werte: {f}((2×{a} + {h}){m} + {s} Fähigkeiten) = {x} {op} N = {n} {mark}",
 "Estadísticas: {f}((2×{a} + {h}){m} + {s} habilidades) = {x} {op} N = {n} {mark}",
 "Statistiche: {f}((2×{a} + {h}){m} + {s} abilità) = {x} {op} N = {n} {mark}",
 "Atributos: {f}((2×{a} + {h}){m} + {s} habilidades) = {x} {op} N = {n} {mark}",
 "Stats: {f}((2×{a} + {h}){m} + {s} skill) = {x} {op} N = {n} {mark}",
 "புள்ளிகள்: {f}((2×{a} + {h}){m} + {s} திறன்கள்) = {x} {op} N = {n} {mark}",
 "Stat: {f}((2×{a} + {h}){m} + {s} skill) = {x} {op} N = {n} {mark}",
 "属性：{f}((2×{a} + {h}){m} + {s} 技能) = {x} {op} N = {n} {mark}",
 "屬性：{f}((2×{a} + {h}){m} + {s} 技能) = {x} {op} N = {n} {mark}",
 "ステータス：{f}((2×{a} + {h}){m} + {s} スキル) = {x} {op} N = {n} {mark}",
 "능력치: {f}((2×{a} + {h}){m} + {s} 스킬) = {x} {op} N = {n} {mark}"],
"Product: {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}": [
 "Produit : {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "Produkt: {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "Producto: {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "Prodotto: {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "Produto: {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "Product: {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "பெருக்கம்: {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "Hasil kali: {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "乘积：{f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "乘積：{f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "積：{f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}",
 "곱: {f}({a}×{h}{m} + {s}×|{s}|) = {x} {op} (N/3)² = {n2} {mark}"],
"Fragile: both scores × {k} (more stats for a card that takes double damage).": [
 "Fragile : les deux scores × {k} (plus de stats pour une carte qui subit des dégâts doublés).",
 "Zerbrechlich: beide Werte × {k} (mehr Werte für eine Karte, die doppelten Schaden nimmt).",
 "Frágil: ambas puntuaciones × {k} (más estadísticas para una carta que recibe el doble de daño).",
 "Fragile: entrambi i punteggi × {k} (più statistiche per una carta che subisce danno doppio).",
 "Frágil: ambas as pontuações × {k} (mais atributos para uma carta que sofre dano em dobro).",
 "Marupok: parehong score × {k} (mas maraming stats para sa card na doble ang natatanggap na pinsala).",
 "நொறுங்கக்கூடியது: இரு மதிப்பெண்களும் × {k} (இரட்டிப்புச் சேதம் அடையும் அட்டைக்கு அதிகப் புள்ளிகள்).",
 "Rapuh: kedua skor × {k} (stat lebih banyak untuk kartu yang menerima kerusakan dua kali lipat).",
 "易碎：两项分数都 × {k}（受到双倍伤害的卡牌可以有更多属性）。",
 "易碎：兩項分數都 × {k}（受到雙倍傷害的卡牌可以有更多屬性）。",
 "もろい：両方の値を × {k}（ダメージが2倍になるカードは、その分ステータスを多くできる）。",
 "연약함: 두 점수 모두 × {k} (피해를 두 배로 받는 카드는 능력치를 더 가질 수 있어요)."],
"m: each skill that makes about half the attacks at a card miss ({skills}) multiplies the Attack and Health terms by {m}, not the skills; those skills cost 0.": [
 "m : chaque compétence qui fait rater environ la moitié des attaques contre la carte ({skills}) multiplie par {m} les termes d’Attaque et de PV, pas les compétences ; ces compétences coûtent 0.",
 "m: Jede Fähigkeit, die etwa die Hälfte der Angriffe auf die Karte danebengehen lässt ({skills}), multipliziert die Angriffs- und Lebenswerte mit {m}, nicht die Fähigkeiten; diese Fähigkeiten kosten 0.",
 "m: cada habilidad que hace fallar más o menos la mitad de los ataques contra la carta ({skills}) multiplica por {m} los términos de Ataque y Vida, no las habilidades; esas habilidades cuestan 0.",
 "m: ogni abilità che fa mancare circa metà degli attacchi contro la carta ({skills}) moltiplica per {m} i termini di Attacco e Salute, non le abilità; quelle abilità costano 0.",
 "m: cada habilidade que faz falhar cerca de metade dos ataques contra a carta ({skills}) multiplica por {m} os termos de Ataque e Vida, não as habilidades; essas habilidades custam 0.",
 "m: bawat skill na nagpapasablay sa halos kalahati ng mga atake sa card ({skills}) ay nagmu-multiply ng {m} sa Atake at Buhay, hindi sa mga skill; 0 ang halaga ng mga skill na iyon.",
 "m: அட்டை மீதான தாக்குதல்களில் பாதியைத் தவறச் செய்யும் ஒவ்வொரு திறனும் ({skills}) தாக்குதல், உயிர் மதிப்புகளை {m} ஆல் பெருக்கும், திறன்களை அல்ல; அத்திறன்களுக்குச் செலவு 0.",
 "m: tiap skill yang membuat sekitar separuh serangan ke kartu meleset ({skills}) mengalikan suku Serangan dan Nyawa dengan {m}, bukan skill-nya; skill itu berbiaya 0.",
 "m：每有一个让约一半攻击该卡的攻击落空的技能（{skills}），攻击与生命这两项乘以 {m}，技能分数不乘；这些技能本身计 0。",
 "m：每有一個讓約一半攻擊該卡的攻擊落空的技能（{skills}），攻擊與生命這兩項乘以 {m}，技能分數不乘；這些技能本身計 0。",
 "m：カードへの攻撃の約半分を外させるスキル（{skills}）1つごとに、攻撃と体力の項を {m} 倍します（スキルの値は倍にしません）。そのスキル自体のコストは0。",
 "m: 카드를 노린 공격의 절반쯤을 빗나가게 하는 스킬({skills})마다 공격력과 체력 항을 {m}배 하고, 스킬 값은 곱하지 않아요. 그 스킬 자체는 0입니다."],
"N multipliers: no abilities × {plain}, only light abilities × {light}. Fragile is not one: it multiplies both scores by {fragile} instead.": [
 "Multiplicateurs de N : aucune capacité × {plain}, seulement des capacités légères × {light}. Fragile n’en est pas un : il multiplie plutôt les deux scores par {fragile}.",
 "N-Faktoren: keine Fähigkeiten × {plain}, nur leichte Fähigkeiten × {light}. Zerbrechlich gehört nicht dazu: Es multipliziert stattdessen beide Werte mit {fragile}.",
 "Multiplicadores de N: sin habilidades × {plain}, solo habilidades ligeras × {light}. Frágil no es uno: multiplica ambas puntuaciones por {fragile}.",
 "Moltiplicatori di N: nessuna abilità × {plain}, solo abilità leggere × {light}. Fragile non lo è: moltiplica invece entrambi i punteggi per {fragile}.",
 "Multiplicadores de N: sem habilidades × {plain}, só habilidades leves × {light}. Frágil não é um: multiplica as duas pontuações por {fragile}.",
 "Mga multiplier ng N: walang kakayahan × {plain}, magagaan lang × {light}. Hindi kasama ang Marupok: pinararami nito ang parehong score ng {fragile}.",
 "N பெருக்கிகள்: திறன்கள் இல்லை × {plain}, இலகுவானவை மட்டும் × {light}. நொறுங்கக்கூடியது இதில் சேராது: அது இரு மதிப்பெண்களையும் {fragile} ஆல் பெருக்கும்.",
 "Pengali N: tanpa kemampuan × {plain}, hanya kemampuan ringan × {light}. Rapuh bukan salah satunya: ia mengalikan kedua skor dengan {fragile}.",
 "N 的倍率：没有能力 × {plain}，只有轻型能力 × {light}。易碎不在其中：它改为把两项分数都乘以 {fragile}。",
 "N 的倍率：沒有能力 × {plain}，只有輕型能力 × {light}。易碎不在其中：它改為把兩項分數都乘以 {fragile}。",
 "N の倍率：能力なし × {plain}、軽い能力のみ × {light}。もろいはここに含まれず、代わりに両方の値を {fragile} 倍します。",
 "N 배율: 능력 없음 × {plain}, 가벼운 능력만 × {light}. 연약함은 여기에 없고, 대신 두 점수에 모두 {fragile}배를 곱해요."],
"A card passes when both hold: f × ((2×Attack + Health) × m + Skills) ≤ N and f × (Attack × Health × m + Skills × |Skills|) ≤ (N/3)². Here m is the half-miss multiplier (on Attack and Health only) and f is the Fragile factor (1 for other cards). Level is the level the card starts at (Base and quest cards 0, rewards 1).": [
 "Une carte passe si les deux conditions tiennent : f × ((2×Attaque + PV) × m + Compétences) ≤ N et f × (Attaque × PV × m + Compétences × |Compétences|) ≤ (N/3)². Ici m est le multiplicateur de demi-esquive (sur l’Attaque et les PV seulement) et f le facteur Fragile (1 pour les autres cartes). Le niveau est celui de départ de la carte (cartes de base et de quête 0, récompenses 1).",
 "Eine Karte besteht, wenn beides gilt: f × ((2×Angriff + Leben) × m + Fähigkeiten) ≤ N und f × (Angriff × Leben × m + Fähigkeiten × |Fähigkeiten|) ≤ (N/3)². Dabei ist m der Faktor für „halbe Fehlschläge“ (nur auf Angriff und Leben) und f der Zerbrechlich-Faktor (1 bei anderen Karten). Die Stufe ist die Startstufe der Karte (Basis- und Questkarten 0, Belohnungen 1).",
 "Una carta pasa si se cumplen ambas: f × ((2×Ataque + Vida) × m + Habilidades) ≤ N y f × (Ataque × Vida × m + Habilidades × |Habilidades|) ≤ (N/3)². Aquí m es el multiplicador de medio fallo (solo en Ataque y Vida) y f el factor Frágil (1 para las demás cartas). El nivel es el inicial de la carta (cartas base y de misión 0, recompensas 1).",
 "Una carta passa se valgono entrambe: f × ((2×Attacco + Salute) × m + Abilità) ≤ N e f × (Attacco × Salute × m + Abilità × |Abilità|) ≤ (N/3)². Qui m è il moltiplicatore del mezzo mancato (solo su Attacco e Salute) e f il fattore Fragile (1 per le altre carte). Il livello è quello iniziale della carta (carte base e missione 0, ricompense 1).",
 "Uma carta passa quando ambas valem: f × ((2×Ataque + Vida) × m + Habilidades) ≤ N e f × (Ataque × Vida × m + Habilidades × |Habilidades|) ≤ (N/3)². Aqui m é o multiplicador de meia falha (só em Ataque e Vida) e f o fator Frágil (1 para as outras cartas). O nível é o inicial da carta (cartas base e de missão 0, recompensas 1).",
 "Pasado ang card kapag totoo ang dalawa: f × ((2×Atake + Buhay) × m + Skill) ≤ N at f × (Atake × Buhay × m + Skill × |Skill|) ≤ (N/3)². Dito, ang m ay ang multiplier ng half-miss (sa Atake at Buhay lang) at ang f ay ang factor ng Marupok (1 para sa ibang card). Ang Level ay ang simulang level ng card (Base at quest card 0, gantimpala 1).",
 "இரண்டும் உண்மையானால் அட்டை தேறும்: f × ((2×தாக்குதல் + உயிர்) × m + திறன்கள்) ≤ N, f × (தாக்குதல் × உயிர் × m + திறன்கள் × |திறன்கள்|) ≤ (N/3)². இங்கே m என்பது பாதி-தவறல் பெருக்கி (தாக்குதல், உயிருக்கு மட்டும்), f என்பது நொறுங்கக்கூடியதற்கான காரணி (மற்ற அட்டைகளுக்கு 1). நிலை என்பது அட்டை தொடங்கும் நிலை (அடிப்படை, தேடல் அட்டைகள் 0, பரிசுகள் 1).",
 "Kartu lolos bila keduanya terpenuhi: f × ((2×Serangan + Nyawa) × m + Skill) ≤ N dan f × (Serangan × Nyawa × m + Skill × |Skill|) ≤ (N/3)². Di sini m adalah pengali setengah-meleset (hanya pada Serangan dan Nyawa) dan f adalah faktor Rapuh (1 untuk kartu lain). Level adalah level awal kartu (kartu dasar dan misi 0, hadiah 1).",
 "两项都满足时卡牌通过：f × ((2×攻击 + 生命) × m + 技能) ≤ N，f × (攻击 × 生命 × m + 技能 × |技能|) ≤ (N/3)²。其中 m 是“半数落空”倍率（只作用于攻击和生命），f 是易碎系数（其他卡为 1）。等级为卡牌的起始等级（基础卡和任务卡为 0，奖励卡为 1）。",
 "兩項都滿足時卡牌通過：f × ((2×攻擊 + 生命) × m + 技能) ≤ N，f × (攻擊 × 生命 × m + 技能 × |技能|) ≤ (N/3)²。其中 m 是「半數落空」倍率（只作用於攻擊和生命），f 是易碎係數（其他卡為 1）。等級為卡牌的起始等級（基礎卡和任務卡為 0，獎勵卡為 1）。",
 "両方を満たせば合格：f × ((2×攻撃 + 体力) × m + スキル) ≤ N、f × (攻撃 × 体力 × m + スキル × |スキル|) ≤ (N/3)²。ここで m は「半分外れる」倍率（攻撃と体力のみ）、f はもろいの係数（他のカードは1）。レベルはカードの開始レベル（ベース・クエストカードは0、報酬は1）。",
 "둘 다 맞으면 통과: f × ((2×공격 + 체력) × m + 스킬) ≤ N, f × (공격 × 체력 × m + 스킬 × |스킬|) ≤ (N/3)². 여기서 m은 절반 빗나감 배율(공격과 체력에만), f는 연약함 계수(다른 카드는 1)입니다. 레벨은 카드의 시작 레벨입니다 (기본·퀘스트 카드 0, 보상 1)."],
# --- the drop line, the waiting card, the rank words off the screen ---
"Needs rank {rank} or better": [
 "Demande le rang {rank} ou mieux", "Erfordert Rang {rank} oder besser", "Requiere rango {rank} o mejor", "Richiede grado {rank} o migliore",
 "Exige rank {rank} ou melhor", "Kailangan ng ranggong {rank} o mas mataas", "தரம் {rank} அல்லது அதற்கு மேல் தேவை", "Perlu peringkat {rank} atau lebih baik",
 "需要 {rank} 或更高评级", "需要 {rank} 或更高評級", "ランク{rank}以上が必要", "{rank} 랭크 이상 필요"],
"Possible drops:": [
 "Butins possibles :", "Mögliche Drops:", "Posibles botines:", "Possibili bottini:", "Possíveis ganhos:", "Posibleng makuha:", "கிடைக்கக்கூடியவை:",
 "Kemungkinan drop:", "可能掉落：", "可能掉落：", "ドロップの可能性：", "드롭 가능:"],
"Egg drop chance: {p}": [
 "Chance d’œuf : {p}", "Ei-Chance: {p}", "Probabilidad de huevo: {p}", "Probabilità di uovo: {p}", "Probabilidade de ovo: {p}", "Tsansa ng itlog: {p}",
 "முட்டை கிடைக்கும் வாய்ப்பு: {p}", "Peluang telur: {p}", "获得蛋的概率：{p}", "獲得蛋的機率：{p}", "卵が出る確率：{p}", "알이 나올 확률: {p}"],
"Card drop chance: {p}": [
 "Chance de carte : {p}", "Karten-Chance: {p}", "Probabilidad de carta: {p}", "Probabilità di carta: {p}", "Probabilidade de carta: {p}", "Tsansa ng card: {p}",
 "அட்டை கிடைக்கும் வாய்ப்பு: {p}", "Peluang kartu: {p}", "获得卡牌的概率：{p}", "獲得卡牌的機率：{p}", "カードが出る確率：{p}", "카드가 나올 확률: {p}"],
"A reward card is waiting. Win this fight again with a higher rank to take it.": [
 "Une carte récompense vous attend. Regagnez ce combat avec un rang plus élevé pour la prendre.",
 "Eine Belohnungskarte wartet. Gewinne diesen Kampf noch einmal mit höherem Rang, um sie zu bekommen.",
 "Una carta de recompensa te espera. Vuelve a ganar esta pelea con un rango más alto para llevártela.",
 "Una carta ricompensa ti aspetta. Vinci di nuovo questo scontro con un grado più alto per prenderla.",
 "Uma carta de recompensa está à tua espera. Ganha esta luta outra vez com um rank mais alto para a levares.",
 "May naghihintay na reward card. Ipanalo muli ang labang ito sa mas mataas na ranggo para makuha ito.",
 "ஒரு பரிசு அட்டை காத்திருக்கிறது. அதைப் பெற இந்தச் சண்டையை உயர்ந்த தரத்தில் மீண்டும் வெல்லுங்கள்.",
 "Ada kartu hadiah yang menunggu. Menangkan pertarungan ini lagi dengan peringkat lebih tinggi untuk mengambilnya.",
 "有一张奖励卡在等着你。以更高的评级再次赢下这场战斗，就能拿到它。",
 "有一張獎勵卡在等著你。以更高的評級再次贏下這場戰鬥，就能拿到它。",
 "報酬のカードが待っています。もっと高いランクでこの戦いにもう一度勝つと手に入ります。",
 "보상 카드가 기다리고 있어요. 더 높은 랭크로 이 전투를 다시 이기면 얻을 수 있어요."],
"You have cleared this fight with a top rank: let your side play itself": [
 "Vous avez réussi ce combat avec un rang élevé : laissez votre camp jouer tout seul",
 "Du hast diesen Kampf mit hohem Rang geschafft: Lass deine Seite von allein spielen",
 "Has superado esta pelea con un rango alto: deja que tu bando juegue solo",
 "Hai superato questo scontro con un grado alto: lascia che il tuo lato giochi da solo",
 "Venceste esta luta com um rank alto: deixa o teu lado jogar sozinho",
 "Natapos mo na ang labang ito nang mataas ang ranggo: hayaang maglaro nang mag-isa ang panig mo",
 "இந்தப் போரை உயர் தரத்தில் முடித்துவிட்டாய்: உன் பக்கம் தானே ஆடட்டும்",
 "Kamu sudah menyelesaikan pertarungan ini dengan peringkat tinggi: biarkan sisimu bermain sendiri",
 "你已以高评级通关此战：让你这方自动作战吧", "你已以高評級通關此戰：讓你這方自動作戰吧",
 "この戦いを高いランクで制覇済み：自陣に自動で戦わせよう", "이 전투를 높은 랭크로 클리어했어요: 내 쪽이 알아서 플레이하게 해요"],
"Something glints here. A top rank might find it.": [
 "Quelque chose brille ici. Un rang élevé pourrait le trouver.", "Hier glitzert etwas. Ein hoher Rang könnte es finden.",
 "Aquí brilla algo. Un rango alto podría encontrarlo.", "Qualcosa luccica qui. Un grado alto potrebbe trovarlo.",
 "Algo brilha aqui. Um rank alto talvez o encontre.", "May kumikislap dito. Baka mahanap ito ng mataas na ranggo.",
 "இங்கே ஏதோ மின்னுகிறது. உயர் தரம் அதைக் கண்டுபிடிக்கலாம்.", "Ada yang berkilau di sini. Peringkat tinggi mungkin bisa menemukannya.",
 "这里有东西在闪光。高评级也许能找到它。", "這裡有東西在閃光。高評級也許能找到它。", "何かがきらりと光った。高いランクなら見つけられるかも。",
 "여기서 뭔가 반짝여요. 높은 랭크라면 찾을지도 몰라요."],
"A rare notice": [
 "Une annonce rare", "Ein seltener Aushang", "Un aviso raro", "Un raro avviso", "Um aviso raro", "Isang bihirang paunawa", "ஒரு அரிய அறிவிப்பு",
 "Pengumuman langka", "一张稀有公告", "一張稀有公告", "珍しいお知らせ", "희귀한 공지"],
"A win at {emblem} or better in the right fight finds a scale, once.": [
 "Une victoire à {emblem} ou mieux dans le bon combat trouve une écaille, une fois.",
 "Ein Sieg mit {emblem} oder besser im richtigen Kampf findet eine Schuppe, einmal.",
 "Una victoria con {emblem} o mejor en la pelea adecuada encuentra una escama, una vez.",
 "Una vittoria con {emblem} o migliore nello scontro giusto trova una scaglia, una volta.",
 "Uma vitória com {emblem} ou melhor na luta certa encontra uma escama, uma vez.",
 "Ang panalo na may {emblem} o mas mataas sa tamang laban ay nakakahanap ng kaliskis, isang beses.",
 "சரியான போரில் {emblem} அல்லது அதற்கு மேல் வென்றால் ஒருமுறை ஒரு செதிலைக் கண்டுபிடிக்கலாம்.",
 "Kemenangan dengan {emblem} atau lebih baik di pertarungan yang tepat menemukan sebuah sisik, sekali.",
 "在正确的战斗中以 {emblem} 或更高评级获胜，就能找到一片鳞，仅一次。",
 "在正確的戰鬥中以 {emblem} 或更高評級獲勝，就能找到一片鱗，僅一次。",
 "正しい戦いで{emblem}以上で勝つと、鱗が一度だけ見つかる。",
 "알맞은 전투에서 {emblem} 이상으로 이기면 비늘을 한 번 찾아요."],
"A trail of Dragon Scales runs along the road. Each one waits in a single fight for a win at {emblem} or better.": [
 "Une piste d’Écailles de dragon longe la route. Chacune attend dans un seul combat une victoire à {emblem} ou mieux.",
 "Eine Spur aus Drachenschuppen zieht sich die Straße entlang. Jede wartet in einem einzigen Kampf auf einen Sieg mit {emblem} oder besser.",
 "Un rastro de Escamas de dragón recorre el camino. Cada una espera en una sola pelea una victoria con {emblem} o mejor.",
 "Lungo la strada corre una pista di Scaglie di drago. Ognuna aspetta in un solo scontro una vittoria con {emblem} o migliore.",
 "Um rasto de Escamas de Dragão corre ao longo da estrada. Cada uma espera numa só luta por uma vitória com {emblem} ou melhor.",
 "May landas ng mga Kaliskis ng Dragon sa kahabaan ng daan. Bawat isa ay naghihintay sa iisang laban para sa panalong may {emblem} o mas mataas.",
 "சாலை நெடுகிலும் டிராகன் செதில்களின் தடம் ஓடுகிறது. ஒவ்வொன்றும் ஒரே போரில் {emblem} அல்லது அதற்கு மேல் வெற்றிக்காகக் காத்திருக்கிறது.",
 "Jejak Sisik Naga membentang di sepanjang jalan. Masing-masing menunggu di satu pertarungan untuk kemenangan dengan {emblem} atau lebih baik.",
 "一串龙鳞沿着道路散落。每一片都在某一场战斗中等待以 {emblem} 或更高评级获胜的人。",
 "一串龍鱗沿著道路散落。每一片都在某一場戰鬥中等待以 {emblem} 或更高評級獲勝的人。",
 "ドラゴンの鱗の跡が道に沿って続いている。それぞれ一つの戦いで、{emblem}以上での勝利を待っている。",
 "길을 따라 용의 비늘 흔적이 이어져요. 하나하나가 한 전투에서 {emblem} 이상으로 이기기를 기다려요."],
"🛡️ The less health your Bramble loses, the higher your rank. Some card rewards need a high rank.": [
 "🛡️ Moins votre Roncier perd de santé, plus votre rang est élevé. Certaines cartes récompenses demandent un rang élevé.",
 "🛡️ Je weniger Leben deine Dornenhecke verliert, desto höher dein Rang. Manche Kartenbelohnungen setzen einen hohen Rang voraus.",
 "🛡️ Cuanta menos salud pierda tu Zarzal, mayor será tu rango. Algunas cartas de recompensa exigen un rango alto.",
 "🛡️ Meno salute perde il tuo Rovo, più alto è il grado. Alcune carte ricompensa richiedono un grado alto.",
 "🛡️ Quanto menos vida o teu Silvado perder, maior o teu rank. Algumas cartas de recompensa pedem um rank alto.",
 "🛡️ Habang mas kaunti ang nawawalang buhay ng Dawag mo, mas mataas ang ranggo mo. May mga card reward na nangangailangan ng mataas na ranggo.",
 "🛡️ உங்கள் முட்புதர் குறைவான உயிர் இழந்தால் உங்கள் தரம் உயரும். சில அட்டைப் பரிசுகளுக்கு உயர் தரம் தேவை.",
 "🛡️ Makin sedikit nyawa Semakmu yang hilang, makin tinggi peringkatmu. Beberapa hadiah kartu butuh peringkat tinggi.",
 "🛡️ 荆棘丛损失的生命越少，评级越高。有些卡牌奖励需要较高的评级。", "🛡️ 荊棘叢損失的生命越少，評級越高。有些卡牌獎勵需要較高的評級。",
 "🛡️ いばらの体力を失わないほどランクが上がります。高いランクが必要なカード報酬もあります。",
 "🛡️ 덤불이 잃는 체력이 적을수록 랭크가 높아요. 높은 랭크가 필요한 카드 보상도 있어요."],
"A top-rank win on this map turned up a card (once per map)": [
 "Une victoire à un rang élevé sur cette carte a fait apparaître une carte (une fois par carte)",
 "Ein Sieg mit hohem Rang auf dieser Karte hat eine Karte zutage gebracht (einmal pro Karte)",
 "Una victoria con rango alto en este mapa trajo una carta (una vez por mapa)",
 "Una vittoria con grado alto su questa mappa ha fatto uscire una carta (una volta per mappa)",
 "Uma vitória com rank alto neste mapa trouxe uma carta (uma vez por mapa)",
 "May lumabas na card sa panalong mataas ang ranggo sa mapang ito (isang beses bawat mapa)",
 "இந்த வரைபடத்தில் உயர் தர வெற்றி ஒரு அட்டையைக் கொண்டு வந்தது (ஒரு வரைபடத்துக்கு ஒருமுறை)",
 "Kemenangan berperingkat tinggi di peta ini memunculkan sebuah kartu (sekali per peta)",
 "在这张地图以高评级获胜，获得了一张卡（每张地图一次）", "在這張地圖以高評級獲勝，獲得了一張卡（每張地圖一次）",
 "このマップで高いランクで勝利したため、カードが見つかりました（マップごとに1回）",
 "이 지도에서 높은 랭크로 이겨 카드가 나왔어요 (지도마다 한 번)"],
"A rare find for a top-rank win on this map (once per map)": [
 "Une trouvaille rare pour une victoire à un rang élevé sur cette carte (une fois par carte)",
 "Ein seltener Fund für einen Sieg mit hohem Rang auf dieser Karte (einmal pro Karte)",
 "Un hallazgo raro por una victoria con rango alto en este mapa (una vez por mapa)",
 "Un ritrovamento raro per una vittoria con grado alto su questa mappa (una volta per mappa)",
 "Um achado raro por uma vitória com rank alto neste mapa (uma vez por mapa)",
 "Bihirang tuklas para sa panalong mataas ang ranggo sa mapang ito (isang beses bawat mapa)",
 "இந்த வரைபடத்தில் உயர் தர வெற்றிக்கு ஓர் அரிய கண்டுபிடிப்பு (ஒரு வரைபடத்துக்கு ஒருமுறை)",
 "Temuan langka untuk kemenangan berperingkat tinggi di peta ini (sekali per peta)",
 "在这张地图以高评级获胜的稀有发现（每张地图一次）", "在這張地圖以高評級獲勝的稀有發現（每張地圖一次）",
 "このマップで高いランクで勝利したときのレアな発見（マップごとに1回）",
 "이 지도에서 높은 랭크 승리로 얻는 희귀한 발견 (지도마다 한 번)"],
}
# rows the old wording used and nothing else uses now (the page translator and i18n_refresh would flag them as dead anyway)
STALE = [
 "Stats: (2×{a} + {h} + {s} skills){m} = {x} {op} N = {n} {mark}", "Product: ({a}×{h} + {s}×|{s}|){m} = {x} {op} (N/3)² = {n2} {mark}", "Fragile: N × {k}.",
 "Both scores × {m} for each skill that makes about half the attacks at a card miss ({skills}); those skills cost 0.",
 "N multipliers: no abilities × {plain}, only light abilities × {light}, Fragile × {fragile}.",
 "Win this fight at rank {conquestCardsNeedRank} or better to take its card", "🔒 Card at rank {conquestCardsNeedRank}+", "Card at rank {conquestCardsNeedRank}+",
 "The less health your Bramble loses, the higher your rank. Some card rewards only unlock at rank S.",
 "An S-rank win on this map turned up a card (once per map)", "A rare find for an S-rank win on this map (once per map)",
 "A rare Rank {v1} notice", "Something glints here. An S rank might find it.", "You have cleared this fight at rank S or better: let your side play itself",
 "An S rank or better in the right fight finds a scale, once.", "A trail of Dragon Scales runs along the road. Each one waits in a single fight for an S rank or better.",
]
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
if __name__ == '__main__':
    added = pruned = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8'))
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        for en, row in T.items():
            pack[en] = row[i]; added += 1
        for en in STALE:
            if en in pack: del pack[en]; pruned += 1
            if en in uipack: del uipack[en]; pruned += 1
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
        with open(ui, 'w', encoding='utf-8') as fh:
            json.dump(uipack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs;', len(T), 'strings each;', added, 'rows written;', pruned, 'stale rows pruned')
