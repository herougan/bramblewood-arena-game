#!/usr/bin/env python3
"""Game texts of package ENG27 (2026-11-06, owner items 10, 11, 14, 20-22, 32, 36): Fortify's short form and Unfortify, Blitz / Mach /
Anti-air, Inspiration +1, Double Time, Encore, Grant, Hype, Rage (N%), the helmet that falls off, the +Attack bramble. Adds the TX keys to
bramblewood-texts.js (before the table's end, once), changes five English texts (their pack rows are re-keyed to the new English) and moves
Bola's and Lasso's "Speed 1" to "Speed 0" (arrow-likes act at Speed 0 now) in English and every pack. One row per English text in
lang/<code>.json (rows that already exist are kept; new rows appended). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_11_06_eng27.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [
 ('ui.eng27-fp-armor', 'Armor {n}', ['Armure {n}', 'Rüstung {n}', 'Armadura {n}', 'Armatura {n}', 'Armadura {n}', 'Baluti {n}', 'கவசம் {n}', 'Zirah {n}', '护甲 {n}', '護甲 {n}', 'アーマー{n}', '방어구 {n}']),
 ('ui.eng27-fp-vulnerable', 'Vulnerable {n}', ['Vulnérable {n}', 'Verwundbar {n}', 'Vulnerable {n}', 'Vulnerabile {n}', 'Vulnerável {n}', 'Bulnerable {n}', 'பலவீனம் {n}', 'Rentan {n}', '易伤 {n}', '易傷 {n}', '脆弱{n}', '취약 {n}']),
 ('ui.eng27-fp-minus-health', '-{n} Health', ['-{n} Santé', '-{n} Leben', '-{n} Salud', '-{n} Salute', '-{n} Vida', '-{n} Buhay', '-{n} உயிர்', '-{n} Nyawa', '-{n} 生命', '-{n} 生命', '体力-{n}', '체력 -{n}']),
 ('ui.eng27-unfortify-name', 'Unfortify', ['Défortifier', 'Entfestigen', 'Desfortificar', 'Sfortificare', 'Desfortificar', 'Pahinain', 'பலவீனமாக்கு', 'Lemahkan', '拆防', '拆防', '補強解除', '보강 해제']),
 ('ui.eng27-unfortify-head', 'Unfortify ({x})', ['Défortifier ({x})', 'Entfestigen ({x})', 'Desfortificar ({x})', 'Sfortificare ({x})', 'Desfortificar ({x})', 'Pahinain ({x})', 'பலவீனமாக்கு ({x})', 'Lemahkan ({x})', '拆防（{x}）', '拆防（{x}）', '補強解除（{x}）', '보강 해제 ({x})']),
 ('ui.eng27-unfortify', 'A drawback: on play, your own bramble gets {x} for the fight.', [
   'Un défaut : en jeu, votre propre roncier reçoit {x} pour le combat.', 'Ein Nachteil: Beim Ausspielen erhält deine eigene Ranke {x} für den Kampf.',
   'Una desventaja: al jugarla, tu propia zarza recibe {x} durante el combate.', 'Uno svantaggio: in gioco, il tuo rovo riceve {x} per lo scontro.',
   'Uma desvantagem: ao jogar, a tua própria sarça recebe {x} durante o combate.', 'Isang kahinaan: paglaro, ang sarili mong bramble ay may {x} sa buong laban.',
   'ஒரு குறை: விளையாடும்போது, உங்கள் சொந்த முட்புதர் போர் முழுவதும் {x} பெறுகிறது.', 'Kelemahan: saat dimainkan, semak milikmu sendiri mendapat {x} selama pertarungan.',
   '代价：登场时，你自己的荆棘本场获得{x}。', '代價：登場時，你自己的荊棘本場獲得{x}。', 'デメリット：登場時、自分のイバラがこの戦いの間{x}を得る。', '단점: 등장 시 자신의 가시덤불이 전투 동안 {x}을(를) 얻습니다.']),
 ('ui.eng27-blitz-name', 'Blitz', ['Blitz', 'Blitz', 'Blitz', 'Blitz', 'Blitz', 'Blitz', 'பிளிட்ஸ்', 'Blitz', '闪击', '閃擊', 'ブリッツ', '블리츠']),
 ('ui.eng27-blitz', 'Its swing and its shots act at Speed 10.', [
   'Son coup et ses tirs agissent à Vitesse 10.', 'Sein Hieb und seine Schüsse handeln mit Tempo 10.', 'Su golpe y sus disparos actúan a Velocidad 10.',
   'Il suo colpo e i suoi tiri agiscono a Velocità 10.', 'O seu golpe e os seus disparos agem a Velocidade 10.', 'Ang hampas at mga tira nito ay kumikilos sa Bilis 10.',
   'அதன் அடியும் எய்தல்களும் வேகம் 10-இல் செயல்படும்.', 'Ayunan dan tembakannya bertindak pada Kecepatan 10.', '它的攻击和射击以速度 10 行动。', '它的攻擊和射擊以速度 10 行動。',
   'その攻撃と射撃は速度10で行動する。', '그 공격과 사격은 속도 10으로 행동합니다.']),
 ('ui.eng27-mach-name', 'Mach', ['Mach', 'Mach', 'Mach', 'Mach', 'Mach', 'Mach', 'மாக்', 'Mach', '音速', '音速', 'マッハ', '마하']),
 ('ui.eng27-mach', 'Flying. Ground swings always miss it; flying and ranged attacks miss half the time.', [
   'Vol. Les coups au sol le ratent toujours ; les attaques volantes et à distance ratent une fois sur deux.',
   'Fliegend. Bodenhiebe verfehlen es immer; fliegende und Fernangriffe verfehlen es zur Hälfte.',
   'Vuela. Los golpes en tierra siempre fallan; los ataques voladores y a distancia fallan la mitad de las veces.',
   'Vola. I colpi da terra lo mancano sempre; gli attacchi in volo e a distanza lo mancano metà delle volte.',
   'Voa. Os golpes em terra falham sempre; os ataques voadores e à distância falham metade das vezes.',
   'Lumilipad. Laging sablay ang hampas mula sa lupa; kalahati ng lumilipad at malayong atake ay sablay.',
   'பறக்கும். தரை அடிகள் எப்போதும் தவறும்; பறக்கும், தொலைவு தாக்குதல்கள் பாதி நேரம் தவறும்.',
   'Terbang. Ayunan darat selalu meleset; serangan terbang dan jarak jauh meleset separuh waktu.',
   '飞行。地面攻击总是落空；飞行和远程攻击一半落空。', '飛行。地面攻擊總是落空；飛行和遠程攻擊一半落空。',
   '飛行。地上の攻撃は必ず外れ、飛行と遠隔の攻撃は半分外れる。', '비행. 지상 공격은 항상 빗나가고, 비행·원거리 공격은 절반이 빗나갑니다.']),
 ('ui.eng27-antiair-name', 'Anti-air', ['Antiaérien', 'Flugabwehr', 'Antiaéreo', 'Antiaereo', 'Antiaéreo', 'Kontra-himpapawid', 'வான் எதிர்ப்பு', 'Antiudara', '防空', '防空', '対空', '대공']),
 ('ui.eng27-antiair', 'Its swings hit only Flying or Mach units and the bramble, never ground units.', [
   'Ses coups ne touchent que les unités volantes ou Mach et le roncier, jamais au sol.',
   'Seine Hiebe treffen nur fliegende oder Mach-Einheiten und die Ranke, nie Bodeneinheiten.',
   'Sus golpes solo alcanzan unidades voladoras o Mach y la zarza, nunca de tierra.',
   'I suoi colpi colpiscono solo unità in volo o Mach e il rovo, mai a terra.',
   'Os seus golpes só atingem unidades voadoras ou Mach e a sarça, nunca de terra.',
   'Tumatama lang ang hampas nito sa lumilipad o Mach at sa bramble, hindi sa nasa lupa.',
   'அதன் அடிகள் பறக்கும் அல்லது மாக் அலகுகளையும் முட்புதரையும் மட்டும் தாக்கும்; தரை அலகுகளை ஒருபோதும் இல்லை.',
   'Ayunannya hanya mengenai unit terbang atau Mach dan semak, tidak pernah unit darat.',
   '它的攻击只命中飞行或音速单位和荆棘，从不命中地面单位。', '它的攻擊只命中飛行或音速單位和荊棘，從不命中地面單位。',
   'その攻撃は飛行・マッハのユニットとイバラにだけ当たり、地上には当たらない。', '그 공격은 비행·마하 유닛과 가시덤불에만 맞고 지상 유닛에는 맞지 않습니다.']),
 ('ui.eng27-double-time-name', 'Double Time', ['Temps double', 'Doppeltakt', 'Doble tiempo', 'Tempo doppio', 'Tempo duplo', 'Dobleng Oras', 'இரட்டை நேரம்', 'Waktu Ganda', '双倍时间', '雙倍時間', 'ダブルタイム', '더블 타임']),
 ('ui.eng27-double-time', 'It performs its actions twice: two swings, and its shots twice.', [
   'Il agit deux fois : deux coups, et ses tirs deux fois.', 'Es handelt doppelt: zwei Hiebe und seine Schüsse zweimal.', 'Actúa dos veces: dos golpes y sus disparos dos veces.',
   'Agisce due volte: due colpi e i suoi tiri due volte.', 'Age duas vezes: dois golpes e os seus disparos duas vezes.', 'Dalawang beses itong kumikilos: dalawang hampas, at dalawang beses ang tira.',
   'அது தன் செயல்களை இருமுறை செய்யும்: இரண்டு அடிகள், எய்தல்களும் இருமுறை.', 'Ia bertindak dua kali: dua ayunan, dan tembakannya dua kali.',
   '它的行动执行两次：攻击两次，射击也两次。', '它的行動執行兩次：攻擊兩次，射擊也兩次。', '行動を2回行う：攻撃2回、射撃も2回。', '행동을 두 번 합니다: 공격 두 번, 사격도 두 번.']),
 ('ui.eng27-encore-name', 'Encore', ['Rappel', 'Zugabe', 'Bis', 'Bis', 'Bis', 'Encore', 'மீண்டும்', 'Encore', '再来', '再來', 'アンコール', '앙코르']),
 ('ui.eng27-encore-head', 'Encore ({x})', ['Rappel ({x})', 'Zugabe ({x})', 'Bis ({x})', 'Bis ({x})', 'Bis ({x})', 'Encore ({x})', 'மீண்டும் ({x})', 'Encore ({x})', '再来（{x}）', '再來（{x}）', 'アンコール（{x}）', '앙코르 ({x})']),
 ('ui.eng27-encore', 'Once a round, if {x} holds after its swing, it swings again.', [
   'Une fois par manche, si {x} est vrai après son coup, il frappe encore.', 'Einmal pro Runde: Gilt nach seinem Hieb {x}, schlägt es erneut zu.',
   'Una vez por ronda, si se cumple {x} tras su golpe, golpea otra vez.', 'Una volta per round, se vale {x} dopo il colpo, colpisce ancora.',
   'Uma vez por ronda, se {x} se cumprir após o golpe, golpeia de novo.', 'Minsan bawat round, kung totoo ang {x} pagkatapos ng hampas, hahampas ulit.',
   'சுற்றுக்கு ஒருமுறை, அடிக்குப் பின் {x} நிலைத்தால், மீண்டும் அடிக்கும்.', 'Sekali per ronde, jika {x} berlaku setelah ayunannya, ia mengayun lagi.',
   '每回合一次：攻击后若满足{x}，再攻击一次。', '每回合一次：攻擊後若滿足{x}，再攻擊一次。', '各ラウンド1回、攻撃後に{x}なら、もう一度攻撃する。', '라운드당 한 번, 공격 후 {x}이면 다시 공격합니다.']),
 ('ui.eng27-grant-name', 'Grant', ['Octroi', 'Verleihen', 'Otorgar', 'Concedere', 'Conceder', 'Ipagkaloob', 'வழங்கு', 'Anugerah', '赋予', '賦予', '付与', '부여']),
 ('ui.eng27-grant-head', 'Grant ({x}) {n}', ['Octroi ({x}) {n}', 'Verleihen ({x}) {n}', 'Otorgar ({x}) {n}', 'Concedere ({x}) {n}', 'Conceder ({x}) {n}', 'Ipagkaloob ({x}) {n}', 'வழங்கு ({x}) {n}', 'Anugerah ({x}) {n}', '赋予（{x}）{n}', '賦予（{x}）{n}', '付与（{x}）{n}', '부여 ({x}) {n}']),
 ('ui.eng27-grant', 'On play, the {n} nearest allies gain {x} for the fight.', [
   'En jeu, les {n} alliés les plus proches gagnent {x} pour le combat.', 'Beim Ausspielen erhalten die {n} nächsten Verbündeten {x} für den Kampf.',
   'Al jugarla, los {n} aliados más cercanos obtienen {x} durante el combate.', 'In gioco, i {n} alleati più vicini ottengono {x} per lo scontro.',
   'Ao jogar, os {n} aliados mais próximos ganham {x} durante o combate.', 'Paglaro, ang {n} pinakamalapit na kakampi ay makakakuha ng {x} sa buong laban.',
   'விளையாடும்போது, அருகிலுள்ள {n} கூட்டாளிகள் போர் முழுவதும் {x} பெறுவர்.', 'Saat dimainkan, {n} sekutu terdekat mendapat {x} selama pertarungan.',
   '登场时，最近的 {n} 名友军本场获得{x}。', '登場時，最近的 {n} 名友軍本場獲得{x}。', '登場時、最も近い味方{n}体がこの戦いの間{x}を得る。', '등장 시 가장 가까운 아군 {n}명이 전투 동안 {x}을(를) 얻습니다.']),
 ('ui.eng27-hype-name', 'Hype', ['Ferveur', 'Anheizen', 'Euforia', 'Carica', 'Euforia', 'Sigla', 'உற்சாகம்', 'Semangat', '鼓舞', '鼓舞', 'ハイプ', '열광']),
 ('ui.eng27-hype', 'On play, {n} ready allies with the most Attack act again right away.', [
   'En jeu, {n} alliés prêts avec le plus d’Attaque agissent de nouveau tout de suite.', 'Beim Ausspielen handeln {n} bereite Verbündete mit dem meisten Angriff sofort erneut.',
   'Al jugarla, {n} aliados listos con más Ataque actúan de nuevo enseguida.', 'In gioco, {n} alleati pronti con più Attacco agiscono subito di nuovo.',
   'Ao jogar, {n} aliados prontos com mais Ataque agem de novo de imediato.', 'Paglaro, {n} handang kakampi na may pinakamataas na Atake ay kikilos ulit agad.',
   'விளையாடும்போது, அதிக தாக்குதல் கொண்ட {n} தயார் கூட்டாளிகள் உடனே மீண்டும் செயல்படுவர்.', 'Saat dimainkan, {n} sekutu siap dengan Serangan tertinggi langsung bertindak lagi.',
   '登场时，攻击最高的 {n} 名就绪友军立即再行动一次。', '登場時，攻擊最高的 {n} 名就緒友軍立即再行動一次。', '登場時、攻撃が最も高い準備済みの味方{n}体がすぐもう一度行動する。', '등장 시 공격이 가장 높은 준비된 아군 {n}명이 즉시 다시 행동합니다.']),
 ('ui.eng27-rage-at-name', 'Rage (N%)', ['Rage (N %)', 'Raserei (N %)', 'Furia (N%)', 'Furia (N%)', 'Fúria (N%)', 'Galit (N%)', 'சீற்றம் (N%)', 'Amuk (N%)', '狂怒（N%）', '狂怒（N%）', '激怒（N%）', '분노 (N%)']),
 ('ui.eng27-rage-at', 'Rages below {n}% Health instead of below half.', [
   'Enrage sous {n} % de Santé au lieu de la moitié.', 'Rast unter {n} % Leben statt unter der Hälfte.', 'Se enfurece por debajo del {n}% de Salud en vez de la mitad.',
   'Si infuria sotto il {n}% di Salute invece che sotto la metà.', 'Enfurece abaixo de {n}% de Vida em vez de metade.', 'Nagagalit sa ilalim ng {n}% Buhay sa halip na kalahati.',
   'பாதிக்குப் பதில் {n}% உயிருக்குக் கீழே சீறும்.', 'Mengamuk di bawah {n}% Nyawa, bukan di bawah separuh.', '生命低于 {n}% 时狂怒，而非低于一半。', '生命低於 {n}% 時狂怒，而非低於一半。',
   '体力が半分ではなく{n}%未満で激怒する。', '체력이 절반이 아니라 {n}% 미만일 때 분노합니다.']),
 ('ui.eng27-unit-atk-desc', 'Every unit played: +{n} ⚔', ['Chaque unité jouée : +{n} ⚔', 'Jede gespielte Einheit: +{n} ⚔', 'Cada unidad jugada: +{n} ⚔', 'Ogni unità giocata: +{n} ⚔', 'Cada unidade jogada: +{n} ⚔', 'Bawat unit na nilaro: +{n} ⚔', 'விளையாடிய ஒவ்வொரு அலகும்: +{n} ⚔', 'Setiap unit yang dimainkan: +{n} ⚔', '每个打出的单位：+{n} ⚔', '每個打出的單位：+{n} ⚔', '出したユニットすべて：+{n} ⚔', '낸 모든 유닛: +{n} ⚔']),
 ('ui.eng27-fx-unit-atk', 'Attack for every unit', ['Attaque pour chaque unité', 'Angriff für jede Einheit', 'Ataque para cada unidad', 'Attacco per ogni unità', 'Ataque para cada unidade', 'Atake sa bawat unit', 'ஒவ்வொரு அலகுக்கும் தாக்குதல்', 'Serangan untuk setiap unit', '每个单位加攻击', '每個單位加攻擊', '全ユニットに攻撃', '모든 유닛 공격력']),
 ('ui.eng27-fort-label', 'Fortify on this bramble', ['Fortifications de ce roncier', 'Befestigung dieser Ranke', 'Fortificación de esta zarza', 'Fortificazione di questo rovo', 'Fortificação desta sarça', 'Fortify sa bramble na ito', 'இந்த முட்புதரின் கோட்டை', 'Benteng pada semak ini', '这片荆棘的加固', '這片荊棘的加固', 'このイバラの強化', '이 가시덤불의 요새화']),
 ('ui.eng27-log-unfortify', '💔 {name} weakens its own bramble: {x}.', [
   '💔 {name} affaiblit son propre roncier : {x}.', '💔 {name} schwächt die eigene Ranke: {x}.', '💔 {name} debilita su propia zarza: {x}.', '💔 {name} indebolisce il proprio rovo: {x}.',
   '💔 {name} enfraquece a própria sarça: {x}.', '💔 Pinahina ng {name} ang sarili nitong bramble: {x}.', '💔 {name} தன் முட்புதரை பலவீனமாக்குகிறது: {x}.', '💔 {name} melemahkan semaknya sendiri: {x}.',
   '💔 {name} 削弱了自己的荆棘：{x}。', '💔 {name} 削弱了自己的荊棘：{x}。', '💔 {name}が自分のイバラを弱める：{x}。', '💔 {name}이(가) 자신의 가시덤불을 약화: {x}.']),
 ('ui.eng27-log-fort-armor', '🛡️ The fortified bramble blocks {n}.', [
   '🛡️ Le roncier fortifié bloque {n}.', '🛡️ Die befestigte Ranke blockt {n}.', '🛡️ La zarza fortificada bloquea {n}.', '🛡️ Il rovo fortificato blocca {n}.', '🛡️ A sarça fortificada bloqueia {n}.',
   '🛡️ Humarang ng {n} ang pinatibay na bramble.', '🛡️ வலுவூட்டிய முட்புதர் {n} தடுக்கிறது.', '🛡️ Semak yang diperkuat menahan {n}.', '🛡️ 加固的荆棘挡下 {n}。', '🛡️ 加固的荊棘擋下 {n}。', '🛡️ 強化されたイバラが{n}防ぐ。', '🛡️ 요새화된 가시덤불이 {n} 막습니다.']),
 ('ui.eng27-log-vulnerable', '💔 The vulnerable bramble takes {n} more.', [
   '💔 Le roncier vulnérable subit {n} de plus.', '💔 Die verwundbare Ranke nimmt {n} mehr.', '💔 La zarza vulnerable recibe {n} más.', '💔 Il rovo vulnerabile subisce {n} in più.', '💔 A sarça vulnerável sofre mais {n}.',
   '💔 Tumanggap ng {n} pa ang bulnerableng bramble.', '💔 பலவீனமான முட்புதர் {n} அதிகம் பெறுகிறது.', '💔 Semak yang rentan menerima {n} lebih.', '💔 易伤的荆棘多受 {n}。', '💔 易傷的荊棘多受 {n}。', '💔 脆弱なイバラが{n}多く受ける。', '💔 취약한 가시덤불이 {n} 더 받습니다.']),
 ('ui.eng27-log-mach', '💨 {name} is too fast: {att} misses.', [
   '💨 {name} est trop rapide : {att} rate.', '💨 {name} ist zu schnell: {att} verfehlt.', '💨 {name} es demasiado rápido: {att} falla.', '💨 {name} è troppo veloce: {att} manca.', '💨 {name} é rápido demais: {att} falha.',
   '💨 Masyadong mabilis ang {name}: sablay ang {att}.', '💨 {name} மிக வேகம்: {att} தவறுகிறது.', '💨 {name} terlalu cepat: {att} meleset.', '💨 {name} 太快了：{att} 落空。', '💨 {name} 太快了：{att} 落空。', '💨 {name}は速すぎる：{att}の攻撃は外れた。', '💨 {name}이(가) 너무 빠름: {att} 빗나감.']),
 ('ui.eng27-log-antiair', "📡 {att} can't hit {name}: it only hits flyers.", [
   '📡 {att} ne peut pas toucher {name} : il ne touche que les volants.', '📡 {att} kann {name} nicht treffen: Es trifft nur Flieger.', '📡 {att} no puede golpear a {name}: solo alcanza voladores.',
   '📡 {att} non può colpire {name}: colpisce solo i volanti.', '📡 {att} não consegue atingir {name}: só atinge voadores.', '📡 Hindi matamaan ng {att} ang {name}: lumilipad lang ang tinatamaan nito.',
   '📡 {att} {name}-ஐத் தாக்க முடியாது: அது பறப்பவற்றை மட்டும் தாக்கும்.', '📡 {att} tidak bisa mengenai {name}: ia hanya mengenai yang terbang.', '📡 {att} 打不中 {name}：它只能命中飞行单位。', '📡 {att} 打不中 {name}：它只能命中飛行單位。',
   '📡 {att}は{name}に当たらない：飛行ユニットにしか当たらない。', '📡 {att}은(는) {name}을(를) 못 맞힘: 비행 유닛만 맞힙니다.']),
 ('ui.eng27-log-encore', '🔁 {name} goes again: Encore!', [
   '🔁 {name} recommence : Rappel !', '🔁 {name} legt nach: Zugabe!', '🔁 {name} repite: ¡Bis!', '🔁 {name} ripete: Bis!', '🔁 {name} repete: Bis!', '🔁 Uulit ang {name}: Encore!',
   '🔁 {name} மீண்டும் செல்கிறது: மீண்டும்!', '🔁 {name} beraksi lagi: Encore!', '🔁 {name} 再来一次：再来！', '🔁 {name} 再來一次：再來！', '🔁 {name}がもう一度：アンコール！', '🔁 {name} 한 번 더: 앙코르!']),
 ('ui.eng27-log-grant', '🎁 {name} grants {x} to {n} allies.', [
   '🎁 {name} octroie {x} à {n} alliés.', '🎁 {name} verleiht {n} Verbündeten {x}.', '🎁 {name} otorga {x} a {n} aliados.', '🎁 {name} concede {x} a {n} alleati.', '🎁 {name} concede {x} a {n} aliados.',
   '🎁 Ipinagkaloob ng {name} ang {x} sa {n} kakampi.', '🎁 {name} {n} கூட்டாளிகளுக்கு {x} வழங்குகிறது.', '🎁 {name} memberi {x} kepada {n} sekutu.', '🎁 {name} 赋予 {n} 名友军{x}。', '🎁 {name} 賦予 {n} 名友軍{x}。', '🎁 {name}が味方{n}体に{x}を付与。', '🎁 {name}이(가) 아군 {n}명에게 {x} 부여.']),
 ('ui.eng27-log-hype', '📣 {name} hypes {ally}: it acts again!', [
   '📣 {name} galvanise {ally} : il agit de nouveau !', '📣 {name} heizt {ally} an: Es handelt erneut!', '📣 {name} enardece a {ally}: ¡actúa de nuevo!', '📣 {name} carica {ally}: agisce di nuovo!', '📣 {name} anima {ally}: age de novo!',
   '📣 Pinasigla ng {name} ang {ally}: kikilos ulit ito!', '📣 {name} {ally}-ஐ உற்சாகப்படுத்துகிறது: அது மீண்டும் செயல்படுகிறது!', '📣 {name} menyemangati {ally}: ia bertindak lagi!', '📣 {name} 鼓舞了 {ally}：它再次行动！', '📣 {name} 鼓舞了 {ally}：它再次行動！', '📣 {name}が{ally}を鼓舞：もう一度行動！', '📣 {name}이(가) {ally}을(를) 열광시킴: 다시 행동!']),
 ('ui.eng27-log-hype-ff', '📣 {name} hypes {ally}: an extra turn next combat.', [
   '📣 {name} galvanise {ally} : un tour de plus au prochain combat.', '📣 {name} heizt {ally} an: ein Extrazug im nächsten Kampf.', '📣 {name} enardece a {ally}: un turno extra en el próximo combate.',
   '📣 {name} carica {ally}: un turno in più al prossimo combattimento.', '📣 {name} anima {ally}: um turno extra no próximo combate.', '📣 Pinasigla ng {name} ang {ally}: dagdag na turn sa susunod na labanan.',
   '📣 {name} {ally}-ஐ உற்சாகப்படுத்துகிறது: அடுத்த மோதலில் கூடுதல் முறை.', '📣 {name} menyemangati {ally}: giliran tambahan di pertempuran berikutnya.', '📣 {name} 鼓舞了 {ally}：下次战斗多一回合。', '📣 {name} 鼓舞了 {ally}：下次戰鬥多一回合。',
   '📣 {name}が{ally}を鼓舞：次の戦闘で追加ターン。', '📣 {name}이(가) {ally}을(를) 열광시킴: 다음 전투에 추가 턴.']),
 ('ui.eng27-log-helmet', "🪖 The shot glances off {name}'s helmet, and the helmet falls off.", [
   '🪖 Le tir ricoche sur le casque de {name}, et le casque tombe.', '🪖 Der Schuss prallt an {name}s Helm ab, und der Helm fällt herunter.', '🪖 El disparo rebota en el casco de {name}, y el casco cae.',
   "🪖 Il tiro rimbalza sull'elmo di {name}, e l'elmo cade.", '🪖 O disparo ressalta no capacete de {name}, e o capacete cai.', '🪖 Tumalbog ang tira sa helmet ng {name}, at nalaglag ang helmet.',
   '🪖 எய்தல் {name}-இன் தலைக்கவசத்தில் பட்டுத் தெறிக்கிறது, கவசம் விழுகிறது.', '🪖 Tembakan memantul dari helm {name}, dan helmnya jatuh.', '🪖 射击被 {name} 的头盔弹开，头盔掉落了。', '🪖 射擊被 {name} 的頭盔彈開，頭盔掉落了。',
   '🪖 射撃は{name}のヘルメットに弾かれ、ヘルメットが外れた。', '🪖 사격이 {name}의 투구에 튕겨 나가고, 투구가 떨어집니다.']),
 ('ui.eng27-float-mach', '💨 Mach', ['💨 Mach', '💨 Mach', '💨 Mach', '💨 Mach', '💨 Mach', '💨 Mach', '💨 மாக்', '💨 Mach', '💨 音速', '💨 音速', '💨 マッハ', '💨 마하']),
 ('ui.eng27-float-antiair', '📡 Flyers only', ['📡 Volants seulement', '📡 Nur Flieger', '📡 Solo voladores', '📡 Solo volanti', '📡 Só voadores', '📡 Lumilipad lang', '📡 பறப்பவை மட்டும்', '📡 Hanya penerbang', '📡 仅限飞行', '📡 僅限飛行', '📡 飛行のみ', '📡 비행만']),
 ('ui.eng27-float-helmet', '🪖 Helmet gone', ['🪖 Casque perdu', '🪖 Helm weg', '🪖 Sin casco', '🪖 Elmo perso', '🪖 Sem capacete', '🪖 Wala nang helmet', '🪖 கவசம் போனது', '🪖 Helm lepas', '🪖 头盔没了', '🪖 頭盔沒了', '🪖 ヘルメット喪失', '🪖 투구 잃음']),
]
# changed English texts: (key, new English, the 12 translations)
CHANGED_T = [
 ('ui.e22-fortify-head', 'Fortify ({x})', ["Fortifier ({x})", "Festigen ({x})", "Fortalecer ({x})", "Rinforzo ({x})", "Reforçar ({x})", "Patibayin ({x})", "வலுப்படுத்து ({x})", "Perkuat ({x})", "加固 ({x})", "加固 ({x})", "補強 ({x})", "보강 ({x})"]),
 ('ui.skn-bramble-armor', 'Fortify (Armor 1), while it lives', ["Fortifier (Armure 1), tant qu’il vit", "Festigen (Rüstung 1), solange es lebt", "Fortalecer (Armadura 1), mientras viva", "Rinforzo (Armatura 1), finché vive", "Reforçar (Armadura 1), enquanto viver", "Patibayin (Baluti 1), habang buhay ito", "வலுப்படுத்து (கவசம் 1), அது உயிருடன் இருக்கும் வரை", "Perkuat (Zirah 1), selama ia hidup", "加固 (护甲 1)，存活期间", "加固 (護甲 1)，存活期間", "補強 (アーマー 1)、生きている間", "보강 (방어구 1), 살아 있는 동안"]),
 ('ui.e22-fortify', 'Your bramble gets it for the fight, even after this unit dies.', [
   'Votre roncier le reçoit pour le combat, même après la mort de cette unité.', 'Deine Ranke erhält es für den Kampf, auch nach dem Tod dieser Einheit.',
   'Tu zarza lo recibe durante el combate, incluso tras morir esta unidad.', 'Il tuo rovo lo riceve per lo scontro, anche dopo la morte di questa unità.',
   'A tua sarça recebe-o durante o combate, mesmo após esta unidade morrer.', 'Makukuha ito ng bramble mo sa buong laban, kahit mamatay ang unit na ito.',
   'இந்த அலகு இறந்த பின்னும், உங்கள் முட்புதர் போர் முழுவதும் அதைப் பெறும்.', 'Semakmu mendapatkannya selama pertarungan, bahkan setelah unit ini mati.',
   '你的荆棘本场获得它，即使此单位死亡。', '你的荊棘本場獲得它，即使此單位死亡。', 'このユニットが倒れても、自分のイバラがこの戦いの間それを得る。', '이 유닛이 죽어도 가시덤불이 전투 동안 그것을 얻습니다.']),
 ('ui.eng24-barmor-head', 'Fortify (Armor {n}), while it lives', ["Fortifier (Armure {n}), tant qu’il vit", "Festigen (Rüstung {n}), solange es lebt", "Fortalecer (Armadura {n}), mientras viva", "Rinforzo (Armatura {n}), finché vive", "Reforçar (Armadura {n}), enquanto viver", "Patibayin (Baluti {n}), habang buhay ito", "வலுப்படுத்து (கவசம் {n}), அது உயிருடன் இருக்கும் வரை", "Perkuat (Zirah {n}), selama ia hidup", "加固 (护甲 {n})，存活期间", "加固 (護甲 {n})，存活期間", "補強 (アーマー {n})、生きている間", "보강 (방어구 {n}), 살아 있는 동안"]),
 ('ui.eng21-sk-inspiring', 'Attacking gives adjacent allies {n} Inspiration: +1 Attack each, spent on their next hit.', [
   'En attaquant, donne {n} Inspiration aux alliés adjacents : +1 Attaque chacune, dépensée à leur prochain coup.',
   'Beim Angriff erhalten benachbarte Verbündete {n} Inspiration: je +1 Angriff, verbraucht beim nächsten Treffer.',
   'Al atacar, da {n} Inspiración a los aliados adyacentes: +1 Ataque cada una, gastada en su próximo golpe.',
   'Attaccando dà {n} Ispirazione agli alleati adiacenti: +1 Attacco ciascuna, spesa al loro prossimo colpo.',
   'Ao atacar, dá {n} Inspiração aos aliados adjacentes: +1 Ataque cada, gasta no próximo golpe.',
   'Sa pag-atake, binibigyan ang katabing kakampi ng {n} Inspirasyon: +1 Atake bawat isa, gagamitin sa susunod na tama.',
   'தாக்கும்போது அருகிலுள்ள கூட்டாளிகளுக்கு {n} ஊக்கம்: ஒவ்வொன்றும் +1 தாக்குதல், அடுத்த அடியில் செலவாகும்.',
   'Saat menyerang, sekutu di sebelahnya mendapat {n} Inspirasi: masing-masing +1 Serangan, terpakai pada serangan berikutnya.',
   '攻击时，相邻友军获得 {n} 层鼓舞：每层 +1 攻击，在其下次命中时消耗。', '攻擊時，相鄰友軍獲得 {n} 層鼓舞：每層 +1 攻擊，在其下次命中時消耗。',
   '攻撃すると隣接する味方が鼓舞{n}を得る：1つにつき攻撃+1、次の命中で消費。', '공격하면 인접 아군이 영감 {n}을 얻습니다: 하나당 공격 +1, 다음 명중 때 소모.']),
 ('ui.e22-fortify-codex', 'Parts: +N Health, Thorns N, Regen N, Bolt N, +N Shield, Armor N. Several add up.', [
   'Éléments : +N Santé, Épines N, Régén N, Trait N, +N Bouclier, Armure N. Ils s’additionnent.', 'Teile: +N Leben, Dornen N, Regen N, Bolzen N, +N Schild, Rüstung N. Mehrere addieren sich.',
   'Partes: +N Salud, Espinas N, Regen N, Virote N, +N Escudo, Armadura N. Se suman.', 'Parti: +N Salute, Spine N, Rigenera N, Dardo N, +N Scudo, Armatura N. Si sommano.',
   'Partes: +N Vida, Espinhos N, Regen N, Virote N, +N Escudo, Armadura N. Somam-se.', 'Mga bahagi: +N Buhay, Tinik N, Regen N, Bolt N, +N Kalasag, Baluti N. Nagsasama-sama.',
   'பகுதிகள்: +N உயிர், முள் N, மீட்பு N, அம்பு N, +N கேடயம், கவசம் N. பல சேர்ந்து கூடும்.', 'Bagian: +N Nyawa, Duri N, Regen N, Baut N, +N Perisai, Zirah N. Bisa dijumlahkan.',
   '部件：+N 生命、荆刺 N、再生 N、弩箭 N、+N 护盾、护甲 N。可叠加。', '部件：+N 生命、荊刺 N、再生 N、弩箭 N、+N 護盾、護甲 N。可疊加。',
   '内容：体力+N、トゲN、再生N、ボルトN、シールド+N、アーマーN。重ねがけ可。', '구성: 체력 +N, 가시 N, 재생 N, 볼트 N, 보호막 +N, 방어구 N. 합산됩니다.']),
]
SPEED_KEYS = ['ui.e14-sk-bola', 'ui.eng15-sk-lasso']  # "at Speed 1" -> "at Speed 0" (ENG27: arrow-likes act at Speed 0)
def ph(t): return sorted(re.findall(r'\{(\w+)\}', t))
LEAD = re.compile(r'^[^\w{(+\-]+')
def core(t): t = t.strip(); return LEAD.sub('', t)
TXP = os.path.join(ROOT, 'bramblewood-texts.js')
src = open(TXP, encoding='utf-8').read()
END = '\n}/*TEXT-TABLE-END*/;'
assert END in src
def en_of(key):
    m = re.search(r'("%s": )("(?:[^"\\]|\\.)*")' % re.escape(key), src); assert m, key
    return m, json.loads(m.group(2))
packs = {c: json.load(open(os.path.join(ROOT, 'lang', c + '.json'), encoding='utf-8')) for c in CODES}
moved = 0
for key, new, row in CHANGED_T:
    m, old = en_of(key)
    if old != new:
        for c in CODES: packs[c].pop(core(old), None)
        src = src[:m.start(2)] + json.dumps(new, ensure_ascii=False) + src[m.end(2):]
for key in SPEED_KEYS:
    m, old = en_of(key)
    if 'at Speed 1' not in old: continue
    new = old.replace('at Speed 1', 'at Speed 0', 1)
    for c in CODES:
        t = packs[c].get(core(old))
        if t is None: continue
        assert len(re.findall(r'1', t)) == 1, (c, key, t)
        packs[c][core(new)] = t.replace('1', '0'); del packs[c][core(old)]; moved += 1
    src = src[:m.start(2)] + json.dumps(new, ensure_ascii=False) + src[m.end(2):]
add = ''
for key, en, _ in T:
    if ('"%s":' % key) not in src: add += ',\n  %s: %s' % (json.dumps(key), json.dumps(en, ensure_ascii=False))
if add:
    i = src.index(END); src = src[:i] + add + src[i:]
open(TXP, 'w', encoding='utf-8').write(src)
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = packs[code]
    for key, en, row in T + CHANGED_T:
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        k, v = core(en), core(row[i])
        if not re.search(r'[^\W\d_]', re.sub(r'\{\w+\}', '', k)): continue
        if k not in pack: added += 1
        pack[k] = v
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
print('ok: %d rows added, %d Speed rows moved, across %d packs' % (added, moved, len(CODES)))
