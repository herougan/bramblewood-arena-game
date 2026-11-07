# 2026-11-08 (package ENG36, owner 11-07 notes): status resistances, Constrict / Strangle actions, Hoard N, the Thanatosis rework.
#   python3 tools/i18n_2026_11_08_eng36.py   add the new keys to bramblewood-texts.js, reword the changed ones, and add their rows to
#                                            lang/<code>.json (keyed by English text, order kept, new rows at the end). Safe to run again.
import json, re
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
def T(en, fr, de, es, it, pt, tl, ta, id_, zhs, zht, ja, ko):
    return (en, dict(zip(CODES, [fr, de, es, it, pt, tl, ta, id_, zhs, zht, ja, ko])))
NEW = {
 'ui.eng36-statuses': T('+ Statuses', '+ États', '+ Zustände', '+ Estados', '+ Stati', '+ Estados', '+ Mga status', '+ நிலைகள்', '+ Status', '+ 状态', '+ 狀態', '+ 状態異常', '+ 상태'),
 'ui.eng36-status-of': T('{name} (status)', '{name} (état)', '{name} (Zustand)', '{name} (estado)', '{name} (stato)', '{name} (estado)', '{name} (status)', '{name} (நிலை)', '{name} (status)', '{name}（状态）', '{name}（狀態）', '{name}（状態異常）', '{name} (상태)'),
 'ui.eng36-status-sel-title': T('Add a status. Resistance: half its damage ticks, or 50 points off its chance to land. Weakness: double ticks, or +50 points. Immune: it never lands.',
   'Ajouter un état. Résistance : moitié des dégâts par tour, ou 50 points de moins de chances de toucher. Faiblesse : dégâts doublés, ou +50 points. Immunité : il ne touche jamais.',
   'Zustand hinzufügen. Resistenz: halber Schaden pro Runde oder 50 Punkte weniger Trefferchance. Schwäche: doppelter Schaden oder +50 Punkte. Immun: er wirkt nie.',
   'Añade un estado. Resistencia: mitad de daño por turno, o 50 puntos menos de probabilidad. Debilidad: daño doble, o +50 puntos. Inmune: nunca se aplica.',
   'Aggiungi uno stato. Resistenza: metà danni per turno, o 50 punti in meno di probabilità. Debolezza: danni doppi, o +50 punti. Immune: non ha mai effetto.',
   'Adicione um estado. Resistência: metade do dano por rodada, ou 50 pontos a menos de chance. Fraqueza: dano dobrado, ou +50 pontos. Imune: nunca pega.',
   'Magdagdag ng status. Resistance: kalahati ng pinsala bawat tik, o bawas 50 puntos sa tsansa. Weakness: doble, o +50 puntos. Immune: hindi kailanman tatama.',
   'ஒரு நிலையைச் சேர்க்கவும். எதிர்ப்பு: ஒவ்வொரு சுற்றுச் சேதமும் பாதி, அல்லது வாய்ப்பில் 50 புள்ளிகள் குறைவு. பலவீனம்: இரட்டிப்பு, அல்லது +50 புள்ளிகள். நோயெதிர்ப்பு: ஒருபோதும் பிடிக்காது.',
   'Tambah status. Tahan: separuh kerusakan per giliran, atau peluang kena turun 50 poin. Lemah: kerusakan ganda, atau +50 poin. Kebal: tidak pernah kena.',
   '添加状态。抗性：每回合伤害减半，或命中几率降低50点。弱点：伤害加倍，或+50点。免疫：永不生效。',
   '新增狀態。抗性：每回合傷害減半，或命中機率降低50點。弱點：傷害加倍，或+50點。免疫：永不生效。',
   '状態異常を追加。耐性：継続ダメージ半減、または付与率-50ポイント。弱点：継続ダメージ2倍、または+50ポイント。無効：決してかからない。',
   '상태를 추가합니다. 저항: 지속 피해 절반, 또는 적용 확률 50포인트 감소. 약점: 지속 피해 2배, 또는 +50포인트. 면역: 절대 걸리지 않음.'),
 'ui.eng36-st-venom': T('Venom', 'Venin', 'Gift', 'Veneno', 'Veleno', 'Veneno', 'Kamandag', 'நஞ்சு', 'Bisa', '毒液', '毒液', '毒', '독'),
 'ui.eng36-st-toxin': T('Toxin', 'Toxine', 'Toxin', 'Toxina', 'Tossina', 'Toxina', 'Toxin', 'நச்சுப்பொருள்', 'Toksin', '毒素', '毒素', '毒素', '독소'),
 'ui.eng36-st-bleed': T('Bleed', 'Saignement', 'Blutung', 'Sangrado', 'Sanguinamento', 'Sangramento', 'Pagdurugo', 'இரத்தப்போக்கு', 'Pendarahan', '流血', '流血', '出血', '출혈'),
 'ui.eng36-st-burn': T('Burn', 'Brûlure', 'Brand', 'Quemadura', 'Bruciatura', 'Queimadura', 'Paso', 'தீக்காயம்', 'Terbakar', '灼烧', '灼燒', '炎上', '화상'),
 'ui.eng36-st-decay': T('Decay', 'Pourriture', 'Verfall', 'Descomposición', 'Decomposizione', 'Decomposição', 'Pagkabulok', 'அழுகல்', 'Pembusukan', '腐朽', '腐朽', '腐敗', '부패'),
 'ui.eng36-st-strangle': T('Squeeze', 'Étreinte', 'Würgen', 'Estrujón', 'Stretta', 'Aperto', 'Pagpiga', 'நெரிப்பு', 'Cekikan', '绞勒', '絞勒', '締め付け', '조르기'),
 'ui.eng36-st-wither': T('Wither', 'Flétrissure', 'Welken', 'Marchitez', 'Avvizzimento', 'Murchar', 'Pagkalanta', 'வாடல்', 'Layu', '枯萎', '枯萎', '衰弱', '시듦'),
 'ui.eng36-st-freeze': T('Freeze', 'Gel', 'Frost', 'Congelación', 'Congelamento', 'Congelamento', 'Pagyeyelo', 'உறைவு', 'Beku', '冰冻', '冰凍', '凍結', '빙결'),
 'ui.eng36-st-sleep': T('Sleep', 'Sommeil', 'Schlaf', 'Sueño', 'Sonno', 'Sono', 'Tulog', 'உறக்கம்', 'Tidur', '睡眠', '睡眠', '睡眠', '수면'),
 'ui.eng36-st-paralyze': T('Paralyze', 'Paralysie', 'Lähmung', 'Parálisis', 'Paralisi', 'Paralisia', 'Pagkaparalisa', 'முடக்கம்', 'Lumpuh', '麻痹', '麻痺', '麻痺', '마비'),
 'ui.eng36-st-stun': T('Stun', 'Étourdissement', 'Betäubung', 'Aturdimiento', 'Stordimento', 'Atordoamento', 'Pagkahilo', 'மயக்கம்', 'Pingsan', '眩晕', '暈眩', 'スタン', '기절'),
 'ui.eng36-st-blind': T('Blind', 'Cécité', 'Blindheit', 'Ceguera', 'Cecità', 'Cegueira', 'Pagkabulag', 'குருடு', 'Buta', '致盲', '致盲', '暗闇', '실명'),
 'ui.eng36-st-tipsy': T('Tipsy', 'Pompette', 'Beschwipst', 'Achispado', 'Brillo', 'Alegre', 'Lasing', 'போதை', 'Mabuk', '微醺', '微醺', 'ほろ酔い', '취기'),
 'ui.eng36-st-confuse': T('Confuse', 'Confusion', 'Verwirrung', 'Confusión', 'Confusione', 'Confusão', 'Pagkalito', 'குழப்பம்', 'Bingung', '混乱', '混亂', '混乱', '혼란'),
 'ui.eng36-st-shock': T('Shock', 'Choc', 'Schock', 'Choque', 'Shock', 'Choque', 'Shock', 'அதிர்ச்சி', 'Kejut', '震慑', '震懾', 'ショック', '충격'),
 'ui.eng36-st-stagger': T('Stagger', 'Vacillement', 'Taumeln', 'Tambaleo', 'Barcollamento', 'Cambaleio', 'Pagsuray', 'தடுமாற்றம்', 'Terhuyung', '踉跄', '踉蹌', 'よろめき', '비틀거림'),
 'ui.eng36-st-silence': T('Silence', 'Silence', 'Stille', 'Silencio', 'Silenzio', 'Silêncio', 'Katahimikan', 'மௌனம்', 'Bungkam', '沉默', '沉默', '沈黙', '침묵'),
 'ui.eng36-st-stymie': T('Stymie', 'Entrave', 'Behinderung', 'Estorbo', 'Intralcio', 'Entrave', 'Hadlang', 'தடை', 'Hambatan', '阻滞', '阻滯', '足止め', '방해'),
 'ui.eng36-st-exhaust': T('Exhaust', 'Épuisement', 'Erschöpfung', 'Agotamiento', 'Sfinimento', 'Exaustão', 'Pagod', 'சோர்வு', 'Lelah', '疲惫', '疲憊', '疲労', '탈진'),
 'ui.eng36-st-petrify': T('Petrify', 'Pétrification', 'Versteinerung', 'Petrificación', 'Pietrificazione', 'Petrificação', 'Pagkabato', 'கல்லாக்கம்', 'Membatu', '石化', '石化', '石化', '석화'),
 'ui.eng36-st-stench': T('Stench', 'Puanteur', 'Gestank', 'Hedor', 'Fetore', 'Fedor', 'Baho', 'துர்நாற்றம்', 'Bau busuk', '恶臭', '惡臭', '悪臭', '악취'),
 'ui.eng36-st-web': T('Web', 'Toile', 'Netz', 'Telaraña', 'Ragnatela', 'Teia', 'Sapot', 'வலை', 'Jaring', '蛛网', '蛛網', 'クモの巣', '거미줄'),
 'ui.eng36-st-brittle': T('Brittle', 'Fragilité', 'Spröde', 'Quebradizo', 'Fragile', 'Quebradiço', 'Marupok', 'நொறுங்கும்', 'Rapuh', '易碎', '易碎', '脆化', '취약'),
 'ui.eng36-st-daunt': T('Daunt', 'Intimidation', 'Einschüchterung', 'Intimidación', 'Intimidazione', 'Intimidação', 'Pananakot', 'அச்சுறுத்தல்', 'Gentar', '震慑', '震懾', '威圧', '위압'),
 'ui.eng36-st-scar': T('Scar', 'Cicatrice', 'Narbe', 'Cicatriz', 'Cicatrice', 'Cicatriz', 'Peklat', 'தழும்பு', 'Bekas luka', '伤疤', '傷疤', '傷跡', '흉터'),
 'ui.eng36-st-corrode': T('Corrode', 'Corrosion', 'Korrosion', 'Corrosión', 'Corrosione', 'Corrosão', 'Kalawang', 'அரிப்பு', 'Korosi', '腐蚀', '腐蝕', '腐食', '부식'),
 'ui.eng36-st-tangle': T('Tangle', 'Enchevêtrement', 'Verstrickung', 'Enredo', 'Groviglio', 'Emaranhado', 'Pagkakabuhol', 'சிக்கல்', 'Kusut', '缠绕', '纏繞', '絡みつき', '얽힘'),
 'ui.eng36-st-bound': T('Bound', 'Ligoté', 'Gefesselt', 'Atado', 'Legato', 'Amarrado', 'Nakagapos', 'கட்டப்பட்டது', 'Terikat', '束缚', '束縛', '拘束', '속박'),
 'ui.eng36-st-constrict': T('Constrict', 'Constriction', 'Umschlingen', 'Constricción', 'Costrizione', 'Constrição', 'Pagpulupot', 'சுற்றிநெரித்தல்', 'Lilitan', '缠勒', '纏勒', '巻き締め', '휘감기'),
 'ui.eng36-st-soak': T('Soak', 'Trempage', 'Durchnässung', 'Empapado', 'Inzuppato', 'Encharcado', 'Pagkabasa', 'நனைவு', 'Basah kuyup', '浸湿', '浸濕', 'ずぶ濡れ', '흠뻑 젖음'),
 'ui.eng36-log-resist': T('🛡️ {name} shrugs off {status}.', '🛡️ {name} résiste à : {status}.', '🛡️ {name} widersteht: {status}.', '🛡️ {name} resiste: {status}.', '🛡️ {name} resiste: {status}.', '🛡️ {name} resiste: {status}.', '🛡️ Hindi tinablan si {name} ng {status}.', '🛡️ {name} {status}-ஐத் தாங்கிக்கொள்கிறது.', '🛡️ {name} menahan {status}.', '🛡️ {name}抵挡了{status}。', '🛡️ {name}抵擋了{status}。', '🛡️ {name}は{status}を耐えた。', '🛡️ {name}이(가) {status}을(를) 버텨냅니다.'),
 'ui.eng36-log-immune': T('🛡️ {name} is immune to {status}.', '🛡️ {name} est immunisé : {status}.', '🛡️ {name} ist immun: {status}.', '🛡️ {name} es inmune: {status}.', '🛡️ {name} è immune: {status}.', '🛡️ {name} é imune: {status}.', '🛡️ Immune si {name} sa {status}.', '🛡️ {name} {status}-க்கு நோயெதிர்ப்புள்ளது.', '🛡️ {name} kebal terhadap {status}.', '🛡️ {name}免疫{status}。', '🛡️ {name}免疫{status}。', '🛡️ {name}は{status}無効。', '🛡️ {name}은(는) {status}에 면역입니다.'),
 'ui.eng36-constrict-name': T('Constrict', 'Constriction', 'Umschlingen', 'Constricción', 'Costrizione', 'Constrição', 'Pulupot', 'சுற்றிநெரி', 'Lilit', '缠勒', '纏勒', '巻き締め', '휘감기'),
 'ui.eng36-strangle-name': T('Strangle', 'Étranglement', 'Würgen', 'Estrangular', 'Strangolare', 'Estrangular', 'Sakal', 'நெரி', 'Cekik', '绞杀', '絞殺', '絞め付け', '조르기'),
 'ui.eng36-constrict': T('Its hits Constrict the target for a round: it does nothing and is squeezed for {n}.',
   'Ses coups enserrent la cible pour un tour : elle ne fait rien et subit {n} d’étreinte.',
   'Seine Treffer umschlingen das Ziel für eine Runde: Es tut nichts und wird um {n} gewürgt.',
   'Sus golpes constriñen al objetivo una ronda: no hace nada y recibe {n} de estrujón.',
   'I suoi colpi stringono il bersaglio per un turno: non fa nulla e subisce {n} di stretta.',
   'Seus golpes constringem o alvo por uma rodada: ele não faz nada e é apertado em {n}.',
   'Pinupulupot ng tama nito ang target nang isang round: wala itong magagawa at pipigain ng {n}.',
   'அதன் தாக்குதல்கள் இலக்கை ஒரு சுற்றுக்குச் சுற்றிநெரிக்கும்: அது எதுவும் செய்யாது, {n} நெரிப்பைப் பெறும்.',
   'Serangannya melilit target selama satu ronde: target tidak bisa apa-apa dan diremas {n}.',
   '其攻击会缠勒目标一回合：目标无法行动，并受到{n}点绞勒。',
   '其攻擊會纏勒目標一回合：目標無法行動，並受到{n}點絞勒。',
   '攻撃が当たると対象を1ラウンド巻き締める：対象は何もできず、{n}の締め付けを受ける。',
   '공격이 대상을 1라운드 동안 휘감습니다: 대상은 아무것도 못 하고 {n}만큼 조여집니다.'),
 'ui.eng36-constrict-codex': T('An advanced Strangle: the held unit is Bound, its skills and triggers are off, and it skips its turn. The squeeze lands at the start of the round it is held. It wears off after a round.',
   'Un Étranglement avancé : l’unité tenue est ligotée, ses capacités et déclencheurs sont coupés et elle passe son tour. L’étreinte frappe au début du tour où elle est tenue. Cela dure un tour.',
   'Ein verstärktes Würgen: Die gehaltene Einheit ist gefesselt, ihre Fähigkeiten und Auslöser sind aus, und sie setzt aus. Das Würgen trifft zu Beginn der Runde, in der sie gehalten wird. Es endet nach einer Runde.',
   'Un Estrangular avanzado: la unidad atrapada queda atada, sin habilidades ni activadores, y pierde su turno. El estrujón llega al inicio de la ronda en que está atrapada. Dura una ronda.',
   'Uno Strangolare avanzato: l’unità tenuta è legata, abilità e attivatori sono spenti e salta il turno. La stretta arriva all’inizio del turno in cui è tenuta. Dura un turno.',
   'Um Estrangular avançado: a unidade presa fica amarrada, sem habilidades nem gatilhos, e perde o turno. O aperto vem no início da rodada em que está presa. Dura uma rodada.',
   'Mas malakas na Sakal: nakagapos ang nahuling unit, patay ang mga skill at trigger nito, at lalaktawan ang turn nito. Ang piga ay tatama sa simula ng round na hawak ito. Tatagal nang isang round.',
   'மேம்பட்ட நெரி: பிடிக்கப்பட்ட அலகு கட்டப்படும், அதன் திறன்களும் தூண்டுதல்களும் நின்றுவிடும், அது தன் முறையை இழக்கும். பிடிக்கப்பட்ட சுற்றின் தொடக்கத்தில் நெரிப்பு விழும். ஒரு சுற்றுக்குப் பின் நீங்கும்.',
   'Cekik tingkat lanjut: unit yang dililit terikat, kemampuan dan pemicunya mati, dan gilirannya hilang. Remasan mengenai di awal ronde ia dililit. Hilang setelah satu ronde.',
   '进阶绞杀：被缠住的单位受束缚，技能与触发失效，并跳过其回合。绞勒在被缠住那回合开始时生效。一回合后解除。',
   '進階絞殺：被纏住的單位受束縛，技能與觸發失效，並跳過其回合。絞勒在被纏住那回合開始時生效。一回合後解除。',
   '強化版の絞め付け：捕まったユニットは拘束され、スキルと誘発が止まり、手番を飛ばす。締め付けは捕まったラウンドの開始時に入る。1ラウンドで解ける。',
   '강화된 조르기: 붙잡힌 유닛은 속박되고 스킬과 발동이 꺼지며 차례를 건너뜁니다. 조이기 피해는 붙잡힌 라운드 시작에 들어갑니다. 1라운드 뒤 풀립니다.'),
 'ui.eng36-act-strangle-desc': T('Strangle a target: Bound for a round (half-damage swings, no moving), squeezed for Amount at the next round\'s start.',
   'Étrangle une cible : ligotée un tour (coups à moitié dégâts, pas de déplacement), étreinte de Montant au début du tour suivant.',
   'Würgt ein Ziel: eine Runde gefesselt (halber Schaden, keine Bewegung), zu Beginn der nächsten Runde um Menge gewürgt.',
   'Estrangula a un objetivo: atado una ronda (golpes a mitad de daño, sin moverse) y estrujado por Cantidad al inicio de la siguiente.',
   'Strangola un bersaglio: legato per un turno (colpi a metà danno, niente movimento), stretta di Quantità all’inizio del turno dopo.',
   'Estrangula um alvo: amarrado por uma rodada (golpes com metade do dano, sem mover), apertado em Quantidade no início da próxima.',
   'Sakalin ang target: nakagapos nang isang round (kalahating pinsala, hindi makagalaw), pipigain ng Halaga sa simula ng susunod na round.',
   'ஒரு இலக்கை நெரி: ஒரு சுற்றுக்குக் கட்டப்படும் (பாதி சேதத் தாக்குதல், நகர முடியாது), அடுத்த சுற்றின் தொடக்கத்தில் அளவு நெரிப்பு.',
   'Cekik target: terikat satu ronde (serangan setengah kerusakan, tak bisa bergerak), diremas sebesar Jumlah di awal ronde berikutnya.',
   '绞杀一个目标：束缚一回合（攻击伤害减半，无法移动），下回合开始时受到数量点绞勒。',
   '絞殺一個目標：束縛一回合（攻擊傷害減半，無法移動），下回合開始時受到數量點絞勒。',
   '対象を絞め付ける：1ラウンド拘束（攻撃は半減、移動不可）、次のラウンド開始時に数値分の締め付け。',
   '대상을 조릅니다: 1라운드 속박(공격 피해 절반, 이동 불가), 다음 라운드 시작에 수치만큼 조이기.'),
 'ui.eng36-act-constrict-desc': T('Constrict a target: for a round it does nothing (no attack, skills or triggers) and is squeezed for Amount.',
   'Enserre une cible : pendant un tour elle ne fait rien (ni attaque, ni capacité, ni déclencheur) et subit une étreinte de Montant.',
   'Umschlingt ein Ziel: Eine Runde lang tut es nichts (kein Angriff, keine Fähigkeiten oder Auslöser) und wird um Menge gewürgt.',
   'Constriñe a un objetivo: durante una ronda no hace nada (ni ataque, ni habilidades, ni activadores) y es estrujado por Cantidad.',
   'Stringe un bersaglio: per un turno non fa nulla (niente attacco, abilità o attivatori) e subisce una stretta di Quantità.',
   'Constringe um alvo: por uma rodada ele não faz nada (sem ataque, habilidades ou gatilhos) e é apertado em Quantidade.',
   'Pulupotan ang target: wala itong magagawa nang isang round (walang atake, skill o trigger) at pipigain ng Halaga.',
   'ஒரு இலக்கைச் சுற்றிநெரி: ஒரு சுற்றுக்கு அது எதுவும் செய்யாது (தாக்குதல், திறன், தூண்டுதல் இல்லை), அளவு நெரிப்பைப் பெறும்.',
   'Lilit target: selama satu ronde ia tidak bisa apa-apa (tanpa serangan, kemampuan, atau pemicu) dan diremas sebesar Jumlah.',
   '缠勒一个目标：一回合内它无法行动（不能攻击、使用技能或触发），并受到数量点绞勒。',
   '纏勒一個目標：一回合內它無法行動（不能攻擊、使用技能或觸發），並受到數量點絞勒。',
   '対象を巻き締める：1ラウンド何もできず（攻撃・スキル・誘発なし）、数値分の締め付けを受ける。',
   '대상을 휘감습니다: 1라운드 동안 아무것도 못 하고(공격·스킬·발동 불가) 수치만큼 조여집니다.'),
 'ui.eng36-log-constrict': T('{a} coils around {t}: Constricted, squeezed for {n} next round 🐍', '{a} s’enroule autour de {t} : enserré, étreinte de {n} au prochain tour 🐍', '{a} umschlingt {t}: gefesselt, nächste Runde um {n} gewürgt 🐍', '{a} se enrosca en {t}: constreñido, estrujón de {n} la próxima ronda 🐍', '{a} si avvolge attorno a {t}: stretto, {n} di stretta il prossimo turno 🐍', '{a} se enrola em {t}: constrito, aperto de {n} na próxima rodada 🐍', 'Pinulupot ni {a} si {t}: pipigain ng {n} sa susunod na round 🐍', '{a} {t}-ஐச் சுற்றிக்கொள்கிறது: அடுத்த சுற்றில் {n} நெரிப்பு 🐍', '{a} melilit {t}: diremas {n} ronde berikutnya 🐍', '{a}缠住了{t}：被缠勒，下回合受到{n}点绞勒 🐍', '{a}纏住了{t}：被纏勒，下回合受到{n}點絞勒 🐍', '{a}が{t}に巻きついた：次のラウンドに{n}の締め付け 🐍', '{a}이(가) {t}을(를) 휘감았습니다: 다음 라운드에 {n} 조이기 🐍'),
 'ui.eng36-log-constricted-skip': T('is Constricted and can\'t act. 🐍', 'est enserré et ne peut pas agir. 🐍', 'ist umschlungen und kann nicht handeln. 🐍', 'está constreñido y no puede actuar. 🐍', 'è stretto e non può agire. 🐍', 'está constrito e não pode agir. 🐍', 'ay napulupot at hindi makakilos. 🐍', 'சுற்றிநெரிக்கப்பட்டு செயல்பட முடியாது. 🐍', 'terlilit dan tidak bisa bertindak. 🐍', '被缠勒，无法行动。🐍', '被纏勒，無法行動。🐍', 'は巻き締められて動けない。🐍', '휘감겨서 행동할 수 없습니다. 🐍'),
 'ui.eng36-constricted-pip': T('Constricted: it can\'t attack or use skills this round.', 'Enserré : il ne peut ni attaquer ni utiliser de capacités ce tour.', 'Umschlungen: Es kann diese Runde weder angreifen noch Fähigkeiten nutzen.', 'Constreñido: no puede atacar ni usar habilidades esta ronda.', 'Stretto: non può attaccare né usare abilità questo turno.', 'Constrito: não pode atacar nem usar habilidades nesta rodada.', 'Napulupot: hindi makaatake o makagamit ng skill ngayong round.', 'சுற்றிநெரிக்கப்பட்டது: இந்தச் சுற்றில் தாக்கவோ திறன்களைப் பயன்படுத்தவோ முடியாது.', 'Terlilit: tidak bisa menyerang atau memakai kemampuan ronde ini.', '被缠勒：本回合无法攻击或使用技能。', '被纏勒：本回合無法攻擊或使用技能。', '巻き締め中：このラウンドは攻撃もスキルも使えない。', '휘감김: 이번 라운드에 공격하거나 스킬을 쓸 수 없습니다.'),
 'ui.eng36-hoard': T('+{n}/+{n} for each Lumber you hold (rounded down).', '+{n}/+{n} par Bois que vous avez (arrondi à l’inférieur).', '+{n}/+{n} für jedes Holz, das du hast (abgerundet).', '+{n}/+{n} por cada Madera que tengas (redondeado hacia abajo).', '+{n}/+{n} per ogni Legname che hai (arrotondato per difetto).', '+{n}/+{n} para cada Madeira que você tem (arredondado para baixo).', '+{n}/+{n} sa bawat Kahoy na hawak mo (pababa ang pag-round).', 'உங்களிடம் உள்ள ஒவ்வொரு மரத்துக்கும் +{n}/+{n} (கீழ்நோக்கி முழுமையாக்கப்படும்).', '+{n}/+{n} untuk setiap Kayu yang kamu punya (dibulatkan ke bawah).', '你每持有1木材+{n}/+{n}（向下取整）。', '你每持有1木材+{n}/+{n}（無條件捨去）。', '所持している木材1つにつき+{n}/+{n}（端数切り捨て）。', '보유한 목재 1개마다 +{n}/+{n} (내림).'),
}
REWORD = {
 'ui.eng33-thanatosis': T('First time at 0 Health it plays dead: grey for a round, then floats up at 1 Health.',
   'La première fois à 0 PV, il fait le mort : gris un tour, puis se relève à 1 PV.',
   'Beim ersten Mal auf 0 Gesundheit stellt es sich tot: eine Runde grau, dann schwebt es mit 1 Gesundheit hoch.',
   'La primera vez a 0 de Salud se hace el muerto: gris una ronda, luego se eleva con 1 de Salud.',
   'La prima volta a 0 Salute si finge morto: grigio per un turno, poi si rialza con 1 Salute.',
   'Na primeira vez com 0 de Vida, finge-se de morto: cinza por uma rodada, depois se ergue com 1 de Vida.',
   'Sa unang 0 na Buhay, nagpapanggap itong patay: abo nang isang round, saka aangat na may 1 Buhay.',
   'முதல் முறை 0 உயிரில் இறந்ததுபோல் நடிக்கும்: ஒரு சுற்றுக்குச் சாம்பல், பிறகு 1 உயிருடன் மிதந்து எழும்.',
   'Pertama kali Nyawa 0, ia pura-pura mati: abu-abu satu ronde, lalu melayang bangkit dengan 1 Nyawa.',
   '第一次生命降至0时装死：变灰一回合，然后以1点生命浮起。',
   '第一次生命降至0時裝死：變灰一回合，然後以1點生命浮起。',
   '初めて体力0になると死んだふり：1ラウンド灰色、その後体力1で浮かび上がる。',
   '처음 체력이 0이 되면 죽은 척합니다: 1라운드 회색, 그 뒤 체력 1로 떠오릅니다.'),
 'ui.eng33-thanatosis-codex': T('Once a fight. No death happens: no On Death, no kill for the attacker. While it plays dead it can\'t act, swings pass through it to its bramble and aimed skills can\'t find it; a random shot or a skill that hits every unit still can, and at 0 again it dies. At its next round\'s start it floats up with 1 Health, keeping its max Health, Attack and skills; Thanatosis is then spent.',
   'Une fois par combat. Aucune mort : pas de À la mort, pas de victime pour l’attaquant. Pendant qu’il fait le mort, il ne peut pas agir, les coups le traversent jusqu’à sa ronce et les capacités ciblées ne le trouvent pas ; un tir au hasard ou une capacité qui touche toutes les unités le peut encore, et à 0 de nouveau il meurt. Au début de son tour suivant, il se relève avec 1 PV, en gardant ses PV max, son Attaque et ses capacités ; Thanatose est alors utilisée.',
   'Einmal pro Kampf. Es gibt keinen Tod: kein Beim Tod, kein Kill für den Angreifer. Solange es sich tot stellt, kann es nicht handeln, Schläge gehen durch es hindurch auf seine Dornenburg und gezielte Fähigkeiten finden es nicht; ein zufälliger Schuss oder eine Fähigkeit gegen alle Einheiten trifft es noch, und bei erneut 0 stirbt es. Zu Beginn seiner nächsten Runde schwebt es mit 1 Gesundheit hoch und behält maximale Gesundheit, Angriff und Fähigkeiten; Thanatose ist dann verbraucht.',
   'Una vez por combate. No hay muerte: ni Al morir, ni baja para el atacante. Mientras se hace el muerto no puede actuar, los golpes lo atraviesan hasta su zarza y las habilidades dirigidas no lo encuentran; un disparo al azar o una habilidad que golpea a todas las unidades sí, y a 0 otra vez muere. Al inicio de su siguiente ronda se eleva con 1 de Salud, conservando su Salud máxima, Ataque y habilidades; Tanatosis queda gastada.',
   'Una volta per combattimento. Nessuna morte: niente Alla morte, nessuna uccisione per l’attaccante. Mentre si finge morto non può agire, i colpi lo attraversano fino al suo rovo e le abilità mirate non lo trovano; un tiro a caso o un’abilità che colpisce tutte le unità sì, e a 0 di nuovo muore. All’inizio del suo turno seguente si rialza con 1 Salute, mantenendo Salute massima, Attacco e abilità; Tanatosi è poi consumata.',
   'Uma vez por combate. Não há morte: nada de Ao morrer, nenhum abate para o atacante. Enquanto finge de morto não pode agir, os golpes passam por ele até a sua sarça e habilidades direcionadas não o encontram; um tiro aleatório ou uma habilidade que atinge todas as unidades ainda o atinge, e com 0 de novo ele morre. No início da próxima rodada ele se ergue com 1 de Vida, mantendo Vida máxima, Ataque e habilidades; Tanatose fica gasta.',
   'Isang beses bawat laban. Walang kamatayan: walang On Death, walang patay para sa umatake. Habang nagpapanggap na patay, hindi ito makakilos, lumulusot ang mga tama papunta sa bramble nito at hindi ito mahanap ng mga nakatutok na skill; maaabot pa rin ito ng random na tira o skill na tumatama sa lahat, at sa 0 muli ay mamamatay ito. Sa simula ng susunod nitong round, aangat ito na may 1 Buhay, hawak pa rin ang max na Buhay, Atake at mga skill; ubos na ang Thanatosis.',
   'ஒரு சண்டைக்கு ஒருமுறை. இறப்பு நிகழாது: மரணத்தின்போது இல்லை, தாக்குபவருக்குக் கொலை இல்லை. இறந்ததுபோல் நடிக்கும்போது செயல்பட முடியாது, தாக்குதல்கள் அதைக் கடந்து அதன் முட்புதருக்குச் செல்லும், குறிவைத்த திறன்கள் அதைக் காணாது; சீரற்ற எய்தலோ அனைத்து அலகுகளையும் தாக்கும் திறனோ இன்னும் தாக்கலாம், மீண்டும் 0-இல் அது இறக்கும். அடுத்த சுற்றின் தொடக்கத்தில் 1 உயிருடன் மிதந்து எழும், அதிகபட்ச உயிர், தாக்குதல், திறன்கள் அப்படியே; தானட்டோசிஸ் பின்னர் பயன்படுத்தப்பட்டதாகும்.',
   'Sekali per pertarungan. Tidak ada kematian: tanpa Saat Mati, tanpa kill bagi penyerang. Selama pura-pura mati ia tak bisa bertindak, serangan menembusnya ke semaknya dan kemampuan terarah tak menemukannya; tembakan acak atau kemampuan yang mengenai semua unit masih bisa, dan di 0 lagi ia mati. Di awal ronde berikutnya ia melayang bangkit dengan 1 Nyawa, tetap dengan Nyawa maks, Serangan, dan kemampuannya; Thanatosis lalu terpakai.',
   '每场战斗一次。不会死亡：不触发阵亡时，攻击者也不算击杀。装死期间它无法行动，攻击会穿过它打到其荆棘堡，指向性技能找不到它；随机射击或命中所有单位的技能仍可命中，再次降至0则死亡。在其下回合开始时它以1点生命浮起，保留最大生命、攻击和技能；之后假死已用尽。',
   '每場戰鬥一次。不會死亡：不觸發陣亡時，攻擊者也不算擊殺。裝死期間它無法行動，攻擊會穿過它打到其荊棘堡，指向性技能找不到它；隨機射擊或命中所有單位的技能仍可命中，再次降至0則死亡。在其下回合開始時它以1點生命浮起，保留最大生命、攻擊和技能；之後假死已用盡。',
   '1回の戦闘につき1度。死亡は起こらない：死亡時は誘発せず、攻撃者のキルにもならない。死んだふりの間は行動できず、攻撃はすり抜けてイバラに向かい、対象指定スキルは見つけられない。ランダムな射撃や全ユニットへのスキルは当たり、再び0になると死ぬ。次のラウンド開始時に体力1で浮かび上がり、最大体力・攻撃力・スキルはそのまま。タナトーシスは使用済みになる。',
   '전투당 한 번. 죽음이 일어나지 않습니다: 사망 시 발동 없음, 공격자의 처치 없음. 죽은 척하는 동안 행동할 수 없고, 공격은 그것을 지나쳐 가시덤불로 가며, 대상 지정 스킬은 찾지 못합니다. 무작위 사격이나 모든 유닛을 맞히는 스킬은 여전히 맞힐 수 있고, 다시 0이 되면 죽습니다. 다음 라운드 시작에 체력 1로 떠오르며 최대 체력, 공격력, 스킬은 그대로입니다. 그 후 타나토시스는 소모됩니다.'),
 'ui.eng33-playing-dead': T('Playing dead: swings pass through to the bramble. It floats up with 1 Health at the start of the next round.',
   'Fait le mort : les coups passent jusqu’à la ronce. Il se relève avec 1 PV au début du tour suivant.',
   'Stellt sich tot: Schläge gehen auf die Dornenburg durch. Zu Beginn der nächsten Runde schwebt es mit 1 Gesundheit hoch.',
   'Haciéndose el muerto: los golpes pasan a la zarza. Se eleva con 1 de Salud al inicio de la siguiente ronda.',
   'Si finge morto: i colpi passano al rovo. Si rialza con 1 Salute all’inizio del turno seguente.',
   'Fingindo-se de morto: os golpes passam para a sarça. Ergue-se com 1 de Vida no início da próxima rodada.',
   'Nagpapanggap na patay: lumulusot ang mga tama papunta sa bramble. Aangat ito na may 1 Buhay sa simula ng susunod na round.',
   'இறந்ததுபோல் நடிக்கிறது: தாக்குதல்கள் முட்புதருக்குச் செல்லும். அடுத்த சுற்றின் தொடக்கத்தில் 1 உயிருடன் மிதந்து எழும்.',
   'Pura-pura mati: serangan tembus ke semak. Ia melayang bangkit dengan 1 Nyawa di awal ronde berikutnya.',
   '装死中：攻击会穿过它打到荆棘堡。下回合开始时以1点生命浮起。',
   '裝死中：攻擊會穿過它打到荊棘堡。下回合開始時以1點生命浮起。',
   '死んだふり中：攻撃はすり抜けてイバラへ。次のラウンド開始時に体力1で浮かび上がる。',
   '죽은 척하는 중: 공격이 가시덤불로 지나갑니다. 다음 라운드 시작에 체력 1로 떠오릅니다.'),
 'ui.eng33-log-wake': T('😵 {name} floats back up ({n} Health).', '😵 {name} se relève en flottant ({n} PV).', '😵 {name} schwebt wieder hoch ({n} Gesundheit).', '😵 {name} se eleva de nuevo ({n} de Salud).', '😵 {name} si rialza fluttuando ({n} Salute).', '😵 {name} se ergue de novo ({n} de Vida).', '😵 Umangat muli si {name} ({n} Buhay).', '😵 {name} மீண்டும் மிதந்து எழுகிறது ({n} உயிர்).', '😵 {name} melayang bangkit lagi ({n} Nyawa).', '😵 {name}重新浮起（{n}点生命）。', '😵 {name}重新浮起（{n}點生命）。', '😵 {name}がふわりと起き上がった（体力{n}）。', '😵 {name}이(가) 다시 떠오릅니다 (체력 {n}).'),
}
OBSOLETE = [
 'First time at 0 Health: it plays dead instead of dying, then gets up next round with 1 Health.',
 "Once a fight. No death happens: no On Death, no kill for the attacker. While it plays dead it can't act, and single-target attacks and skills can't find it; skills that hit every unit still can, and at 0 again it dies. Its statuses are cleared.",
 'Playing dead: it gets up with 1 Health at the start of the next round.',
 'First time at 0 Health it plays dead instead of dying: greyed out for a round, then it floats up with 1 Health.',
 'Its hits Constrict the target for a round: it does nothing (no attack, no skills) and is squeezed for {n}.',
]
LEAD = re.compile(r'^[\s\u00a0\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200D]+')
def core(t): return LEAD.sub('', t.strip())
TX_LINE = re.compile(r'^(\s*)"([^"]+)":\s*"((?:[^"\\]|\\.)*)"(,?)\s*$')
def jdump(s): return json.dumps(s, ensure_ascii=False)[1:-1]
path = 'bramblewood-texts.js'; L = open(path, encoding='utf-8').read().split('\n')
reworded = 0
for i, l in enumerate(L):
    m = TX_LINE.match(l)
    ALLK = dict(NEW, **REWORD)
    if m and m.group(2) in ALLK:
        new = '%s"%s": "%s"%s' % (m.group(1), m.group(2), jdump(ALLK[m.group(2)][0]), m.group(4))
        if new != l: L[i] = new; reworded += 1
end = next(i for i, l in enumerate(L) if l.startswith('}/*TEXT-TABLE-END*/'))
have = set(TX_LINE.match(l).group(2) for l in L if TX_LINE.match(l))
add = [k for k in NEW if k not in have]
if add:
    if not L[end - 1].rstrip().endswith(','): L[end - 1] = L[end - 1].rstrip() + ','
    L[end:end] = ['  "%s": "%s"%s' % (k, jdump(NEW[k][0]), ',' if j < len(add) - 1 else '') for j, k in enumerate(add)]
open(path, 'w', encoding='utf-8').write('\n'.join(L))
tx_now = set(json.loads('"%s"' % TX_LINE.match(l).group(3)) for l in L if TX_LINE.match(l))
for code in CODES:
    p = 'lang/%s.json' % code; d = json.load(open(p, encoding='utf-8'))
    for en in OBSOLETE:
        if en in d and en not in tx_now: del d[en]
    for tab in (NEW, REWORD):
        for k in tab:
            # a pack key is the text without its leading emoji (bramblewood-i18n.js keeps the emoji); the full text is a row too (an exact
            # lookup, as the ENG33 rows have both)
            en, tr = core(tab[k][0]), core(tab[k][1][code])
            if en not in d: d[en] = tr
            if tab[k][0] != en and tab[k][0] not in d: d[tab[k][0]] = tab[k][1][code]
    open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('texts: %d keys added, %d reworded' % (len(add), reworded))
