#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package E (the Prayer rework; owner: "prayer cards give prayer per turn and it gets added as
tokens onto it ... Your Prayer value = number of tokens on the field" and the Ecclesia death skill, named Relic): the Prayer skill's
Codex and card text, the Prayer need line, the Prayer pill's tooltip and "+N a turn", the offering picker, the token badge's tip,
the offering's log line, and Relic's Codex text, card text, Codex note, the "<Card> Relic" name and its log line, plus the skill's
name. Keys are the English with the leading emoji peeled, as the page translator sees them; every {placeholder} is kept. The
Prayer / Removal Zone / keyword words follow the packs (Prière, Gebet, 祈り, Zone de retrait ...). It also drops the pack keys of
the old Prayer texts this package replaced (DROP), wherever a pack has them.
Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_prayer.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
DROP = [
    "Prayer 🙏 — every Prayer on your board + the cards in your Removal Zone. Ecclesia cards need a Prayer value to be played; it is never spent. Once a turn, when you summon an Ecclesia card, you may exile a card from your hand for +1 (it stays counted: it is in your Removal Zone).",
    "While on your board, adds {v1} to your Prayer value (your Prayer = every Prayer on your board + the cards in your Removal Zone).",
    "Adds {v1} to your Prayer while it's on your board.",
    "Needs Prayer {v1} 🙏 to play (not spent). Your Prayer = every Prayer on your board + the cards in your Removal Zone. Once a turn, when you summon an Ecclesia card, you may exile a card from your hand for +1.",
    "{v1} needs Prayer {v2}; you have {v3}. Exile one card from your hand to your Removal Zone for +1 Prayer (it stays counted). Once a turn.",
]
T = {
"+{n} a turn": [
  "+{n} par tour",
  "+{n} pro Zug",
  "+{n} por turno",
  "+{n} a turno",
  "+{n} por turno",
  "+{n} bawat turn",
  "ஒரு முறைக்கு +{n}",
  "+{n} tiap giliran",
  "每回合 +{n}",
  "每回合 +{n}",
  "毎ターン +{n}",
  "턴마다 +{n}"],
"{n} Prayer tokens: they count toward your Prayer while this unit is on the field.": [
  "{n} jetons de Prière : ils comptent dans votre Prière tant que cette unité est sur le terrain.",
  "{n} Gebetsmarken: Sie zählen zu deinem Gebet, solange diese Einheit auf dem Feld ist.",
  "{n} fichas de Oración: cuentan para tu Oración mientras esta unidad esté en el campo.",
  "{n} segnalini Preghiera: contano per la tua Preghiera finché questa unità è in campo.",
  "{n} fichas de Oração: contam para a tua Oração enquanto esta unidade estiver em campo.",
  "{n} Prayer token: bilang ang mga ito sa Panalangin mo habang nasa field ang unit na ito.",
  "{n} பிரார்த்தனை டோக்கன்கள்: இந்த அலகு களத்தில் இருக்கும்வரை அவை உங்கள் பிரார்த்தனையில் சேரும்.",
  "{n} token Doa: dihitung untuk Doamu selama unit ini ada di arena.",
  "{n} 个祈祷标记：这个单位在场时计入你的祈祷值。",
  "{n} 個祈禱標記：這個單位在場時計入你的祈禱值。",
  "祈りトークン{n}個：このユニットが場にいる間、あなたの祈りに数えられる。",
  "기도 토큰 {n}개: 이 유닛이 필드에 있는 동안 내 기도에 더해집니다."],
"{name} Relic": [
  "Relique : {name}",
  "{name}-Reliquie",
  "Reliquia de {name}",
  "Reliquia di {name}",
  "Relíquia de {name}",
  "Relikya ng {name}",
  "{name} புனிதச்சின்னம்",
  "Relikui {name}",
  "{name}圣物",
  "{name}聖物",
  "{name}の聖遺物",
  "{name} 성유물"],
"{name} remains where it fell.": [
  "{name} demeure là où elle est tombée.",
  "{name} bleibt, wo sie fiel.",
  "{name} permanece donde cayó.",
  "{name} resta dove è caduta.",
  "{name} permanece onde caiu.",
  "Nananatili ang {name} kung saan ito bumagsak.",
  "{name} அது விழுந்த இடத்திலேயே நிலைத்திருக்கிறது.",
  "{name} tetap di tempat ia gugur.",
  "{name}留在它倒下的地方。",
  "{name}留在它倒下的地方。",
  "{name}は倒れた場所に残る。",
  "{name}이(가) 쓰러진 자리에 남습니다."],
"Relic": [
  "Relique",
  "Reliquie",
  "Reliquia",
  "Reliquia",
  "Relíquia",
  "Relikya",
  "புனிதச்சின்னம்",
  "Relikui",
  "圣物",
  "聖物",
  "聖遺物",
  "성유물"],
"Gains {n} 📿 Prayer a turn as tokens, none on arrival. They go when it leaves the field.": [
  "Gagne {n} Prière 📿 par tour en jetons, aucun à l'arrivée. Ils partent quand elle quitte le terrain.",
  "Erhält {n} 📿 Gebet pro Zug als Marken, keine beim Ankommen. Sie gehen, wenn sie das Feld verlässt.",
  "Gana {n} de Oración 📿 por turno en fichas, ninguna al llegar. Se van cuando sale del campo.",
  "Ottiene {n} Preghiera 📿 a turno in segnalini, nessuno all'arrivo. Se ne vanno quando lascia il campo.",
  "Ganha {n} de Oração 📿 por turno em fichas, nenhuma ao chegar. Vão-se quando sai do campo.",
  "Nagkakaroon ng {n} 📿 Panalangin bawat turn bilang token, wala pagdating. Mawawala ang mga ito kapag umalis ito sa field.",
  "ஒவ்வொரு முறையும் {n} 📿 பிரார்த்தனையை டோக்கன்களாகப் பெறும், வரும்போது இல்லை. களத்தை விட்டுப் போனால் அவை போகும்.",
  "Mendapat {n} 📿 Doa tiap giliran sebagai token, tanpa token saat datang. Token hilang saat ia meninggalkan arena.",
  "每回合获得 {n} 点 📿 祈祷标记，入场时没有。它离开场地时标记消失。",
  "每回合獲得 {n} 點 📿 祈禱標記，入場時沒有。它離開場地時標記消失。",
  "毎ターン 📿 祈り{n}をトークンで得る（登場時は0）。場を離れると失われる。",
  "매 턴 📿 기도 {n}을(를) 토큰으로 얻습니다 (등장 시 없음). 필드를 떠나면 사라집니다."],
"Your Prayer is every 📿 Prayer token you have: those on your units on the field plus your own. A unit with Prayer N gains N tokens at the start of each of your turns (from the turn after it arrives); when it dies or leaves the field, its tokens are gone. Once a turn, when you summon an Ecclesia card, you may offer a hand card instead of pitching: it goes to your Removal Zone and you gain 1 Prayer token of your own, which no death can take. Prayer is never spent.": [
  "Votre Prière, c'est chaque jeton de Prière 📿 que vous avez : ceux sur vos unités sur le terrain plus les vôtres. Une unité avec Prière N gagne N jetons au début de chacun de vos tours (à partir du tour qui suit son arrivée) ; quand elle meurt ou quitte le terrain, ses jetons disparaissent. Une fois par tour, quand vous invoquez une carte Ecclesia, vous pouvez offrir une carte de votre main au lieu de défausser : elle va dans votre Zone de retrait et vous gagnez 1 jeton de Prière à vous, qu'aucune mort ne peut prendre. La Prière n'est jamais dépensée.",
  "Dein Gebet sind alle 📿 Gebetsmarken, die du hast: die auf deinen Einheiten auf dem Feld plus deine eigenen. Eine Einheit mit Gebet N erhält zu Beginn jedes deiner Züge N Marken (ab dem Zug nach ihrer Ankunft); stirbt sie oder verlässt sie das Feld, sind ihre Marken weg. Einmal pro Zug, wenn du eine Ecclesia-Karte beschwörst, darfst du statt abzuwerfen eine Handkarte opfern: Sie geht in deine Entfernungszone, und du erhältst 1 eigene Gebetsmarke, die kein Tod nehmen kann. Gebet wird nie verbraucht.",
  "Tu Oración es cada ficha de Oración 📿 que tienes: las de tus unidades en el campo más las tuyas. Una unidad con Oración N gana N fichas al inicio de cada uno de tus turnos (desde el turno siguiente a su llegada); cuando muere o sale del campo, sus fichas desaparecen. Una vez por turno, al invocar una carta Ecclesia, puedes ofrecer una carta de tu mano en lugar de descartar: va a tu Zona de retiro y ganas 1 ficha de Oración propia, que ninguna muerte puede quitar. La Oración nunca se gasta.",
  "La tua Preghiera è ogni segnalino Preghiera 📿 che hai: quelli sulle tue unità in campo più i tuoi. Un'unità con Preghiera N ottiene N segnalini all'inizio di ogni tuo turno (dal turno dopo il suo arrivo); quando muore o lascia il campo, i suoi segnalini spariscono. Una volta per turno, quando evochi una carta Ecclesia, puoi offrire una carta dalla mano invece di scartare: va nella tua Zona di rimozione e ottieni 1 segnalino Preghiera tuo, che nessuna morte può togliere. La Preghiera non si spende mai.",
  "A tua Oração é cada ficha de Oração 📿 que tens: as das tuas unidades em campo mais as tuas. Uma unidade com Oração N ganha N fichas no início de cada um dos teus turnos (a partir do turno seguinte à sua chegada); quando morre ou sai do campo, as fichas desaparecem. Uma vez por turno, ao invocares uma carta Ecclesia, podes oferecer uma carta da mão em vez de descartar: vai para a tua Zona de remoção e ganhas 1 ficha de Oração tua, que nenhuma morte pode tirar. A Oração nunca se gasta.",
  "Ang Panalangin mo ay bawat 📿 Prayer token na hawak mo: ang mga nasa unit mo sa field at ang sarili mo. Ang unit na may Panalangin N ay nagkakaroon ng N token sa simula ng bawat turn mo (mula sa turn pagkatapos nitong dumating); kapag namatay ito o umalis sa field, mawawala ang mga token nito. Isang beses bawat turn, kapag nagpatawag ka ng Ecclesia card, puwede kang mag-alay ng card mula sa kamay mo sa halip na mag-pitch: mapupunta ito sa Sona ng Pag-alis at magkakaroon ka ng 1 sariling Prayer token, na hindi makukuha ng anumang kamatayan. Hindi kailanman nagagastos ang Panalangin.",
  "உங்கள் பிரார்த்தனை என்பது உங்களிடம் உள்ள ஒவ்வொரு 📿 பிரார்த்தனை டோக்கனும்: களத்திலுள்ள உங்கள் அலகுகளின் மேலுள்ளவையும் உங்களுடையவையும். பிரார்த்தனை N உள்ள அலகு உங்கள் ஒவ்வொரு முறையின் தொடக்கத்திலும் N டோக்கன்களைப் பெறும் (அது வந்த அடுத்த முறையிலிருந்து); அது இறந்தாலோ களத்தை விட்டுப் போனாலோ அதன் டோக்கன்கள் போய்விடும். ஒரு முறைக்கு ஒருமுறை, ஓர் எக்லீசியா அட்டையை அழைக்கும்போது, கைவிடுவதற்குப் பதிலாகக் கையிலுள்ள ஓர் அட்டையைக் காணிக்கையாக்கலாம்: அது நீக்கப் பகுதிக்குச் செல்லும், உங்களுக்குச் சொந்தமான 1 பிரார்த்தனை டோக்கன் கிடைக்கும், எந்த மரணமும் அதைப் பறிக்காது. பிரார்த்தனை ஒருபோதும் செலவாகாது.",
  "Doamu adalah setiap token Doa 📿 yang kamu punya: yang ada di unit-unitmu di arena ditambah milikmu sendiri. Unit dengan Doa N mendapat N token di awal setiap giliranmu (mulai giliran setelah ia datang); saat ia mati atau meninggalkan arena, tokennya hilang. Sekali tiap giliran, saat memanggil kartu Ecclesia, kamu boleh mempersembahkan kartu dari tangan sebagai ganti membuang: kartu itu masuk Zona Pembuangan dan kamu mendapat 1 token Doa milikmu sendiri, yang tak bisa diambil kematian apa pun. Doa tidak pernah terpakai.",
  "你的祈祷值是你拥有的每个 📿 祈祷标记：你场上单位身上的，加上你自己的。拥有祈祷 N 的单位在你每个回合开始时获得 N 个标记（从入场后的下一回合起）；它阵亡或离开场地时，标记随之消失。每回合一次，召唤 Ecclesia 卡时，你可以献出一张手牌来代替弃牌：它进入移除区，你获得 1 个属于你自己的祈祷标记，任何阵亡都拿不走它。祈祷值从不消耗。",
  "你的祈禱值是你擁有的每個 📿 祈禱標記：你場上單位身上的，加上你自己的。擁有祈禱 N 的單位在你每個回合開始時獲得 N 個標記（從入場後的下一回合起）；它陣亡或離開場地時，標記隨之消失。每回合一次，召喚 Ecclesia 卡時，你可以獻出一張手牌來代替棄牌：它進入移除區，你獲得 1 個屬於你自己的祈禱標記，任何陣亡都拿不走它。祈禱值從不消耗。",
  "あなたの祈りは持っている 📿 祈りトークンすべて：場にいる自分のユニットのものと、あなた自身のもの。祈りNを持つユニットは自分のターンの開始ごとにトークンをN個得る（登場した次のターンから）。倒れるか場を離れると、そのトークンは失われる。1ターンに1回、Ecclesiaカードを召喚するとき、ピッチの代わりに手札を1枚捧げられる：そのカードは除外ゾーンへ行き、あなた自身の祈りトークンを1個得る。これはどの死でも失われない。祈りは消費されない。",
  "내 기도는 내가 가진 모든 📿 기도 토큰입니다: 필드에 있는 내 유닛들의 토큰과 내 자신의 토큰. 기도 N을 가진 유닛은 내 턴이 시작될 때마다 토큰 N개를 얻고 (등장한 다음 턴부터), 죽거나 필드를 떠나면 그 토큰은 사라집니다. 턴마다 한 번, Ecclesia 카드를 소환할 때 피치 대신 손패 한 장을 바칠 수 있습니다: 그 카드는 제거 구역으로 가고, 나는 어떤 죽음으로도 잃지 않는 내 기도 토큰 1개를 얻습니다. 기도는 소모되지 않습니다."],
"Gains {n} 📿 Prayer a turn as tokens; they go if it leaves the field.": [
  "Gagne {n} Prière 📿 par tour en jetons ; ils partent si elle quitte le terrain.",
  "Erhält {n} 📿 Gebet pro Zug als Marken; sie gehen, wenn sie das Feld verlässt.",
  "Gana {n} de Oración 📿 por turno en fichas; se van si sale del campo.",
  "Ottiene {n} Preghiera 📿 a turno in segnalini; se ne vanno se lascia il campo.",
  "Ganha {n} de Oração 📿 por turno em fichas; vão-se se sair do campo.",
  "Nagkakaroon ng {n} 📿 Panalangin bawat turn bilang token; mawawala kapag umalis ito sa field.",
  "ஒவ்வொரு முறையும் {n} 📿 பிரார்த்தனை டோக்கன்கள்; களத்தை விட்டுப் போனால் அவை போகும்.",
  "Mendapat {n} 📿 Doa tiap giliran sebagai token; hilang jika ia meninggalkan arena.",
  "每回合获得 {n} 个 📿 祈祷标记；离开场地即消失。",
  "每回合獲得 {n} 個 📿 祈禱標記；離開場地即消失。",
  "毎ターン 📿 祈りトークンを{n}個得る。場を離れると失われる。",
  "매 턴 📿 기도 토큰 {n}개를 얻습니다. 필드를 떠나면 사라집니다."],
"Needs Prayer {n} 🙏 to play (not spent).": [
  "Demande Prière {n} 🙏 pour être jouée (non dépensée).",
  "Braucht Gebet {n} 🙏 zum Ausspielen (wird nicht verbraucht).",
  "Necesita Oración {n} 🙏 para jugarse (no se gasta).",
  "Richiede Preghiera {n} 🙏 per essere giocata (non si spende).",
  "Precisa de Oração {n} 🙏 para ser jogada (não se gasta).",
  "Kailangan ng Panalangin {n} 🙏 para malaro (hindi nagagastos).",
  "விளையாட பிரார்த்தனை {n} 🙏 தேவை (செலவாகாது).",
  "Butuh Doa {n} 🙏 untuk dimainkan (tidak terpakai).",
  "需要祈祷 {n} 🙏 才能打出（不消耗）。",
  "需要祈禱 {n} 🙏 才能打出（不消耗）。",
  "プレイに祈り{n} 🙏が必要（消費しない）。",
  "내려면 기도 {n} 🙏 필요 (소모되지 않음)."],
"Prayer 🙏: your 📿 Prayer tokens, those on your units on the field plus your own. A unit with Prayer N gains N at the start of each of your turns; its tokens go when it dies or leaves the field. Ecclesia cards need a Prayer value to be played; it is never spent. Once a turn, as your pitch, when you summon an Ecclesia card you may exile a hand card for 1 Prayer token of your own, which you keep.": [
  "Prière 🙏 : vos jetons de Prière 📿, ceux sur vos unités sur le terrain plus les vôtres. Une unité avec Prière N en gagne N au début de chacun de vos tours ; ses jetons partent quand elle meurt ou quitte le terrain. Les cartes Ecclesia demandent une valeur de Prière pour être jouées ; elle n'est jamais dépensée. Une fois par tour, comme défausse du tour, quand vous invoquez une carte Ecclesia vous pouvez exiler une carte de votre main pour 1 jeton de Prière à vous, que vous gardez.",
  "Gebet 🙏: deine 📿 Gebetsmarken, die auf deinen Einheiten auf dem Feld plus deine eigenen. Eine Einheit mit Gebet N erhält zu Beginn jedes deiner Züge N; ihre Marken gehen, wenn sie stirbt oder das Feld verlässt. Ecclesia-Karten brauchen zum Ausspielen einen Gebetswert; er wird nie verbraucht. Einmal pro Zug, als dein Abwurf, darfst du beim Beschwören einer Ecclesia-Karte eine Handkarte verbannen für 1 eigene Gebetsmarke, die du behältst.",
  "Oración 🙏: tus fichas de Oración 📿, las de tus unidades en el campo más las tuyas. Una unidad con Oración N gana N al inicio de cada uno de tus turnos; sus fichas se van cuando muere o sale del campo. Las cartas Ecclesia necesitan un valor de Oración para jugarse; nunca se gasta. Una vez por turno, como tu descarte, al invocar una carta Ecclesia puedes exiliar una carta de tu mano por 1 ficha de Oración propia, que conservas.",
  "Preghiera 🙏: i tuoi segnalini Preghiera 📿, quelli sulle tue unità in campo più i tuoi. Un'unità con Preghiera N ne ottiene N all'inizio di ogni tuo turno; i suoi segnalini se ne vanno quando muore o lascia il campo. Le carte Ecclesia richiedono un valore di Preghiera per essere giocate; non si spende mai. Una volta per turno, come tuo scarto, quando evochi una carta Ecclesia puoi esiliare una carta dalla mano per 1 segnalino Preghiera tuo, che tieni.",
  "Oração 🙏: as tuas fichas de Oração 📿, as das tuas unidades em campo mais as tuas. Uma unidade com Oração N ganha N no início de cada um dos teus turnos; as fichas vão-se quando morre ou sai do campo. As cartas Ecclesia precisam de um valor de Oração para serem jogadas; nunca se gasta. Uma vez por turno, como o teu descarte, ao invocares uma carta Ecclesia podes exilar uma carta da mão por 1 ficha de Oração tua, que guardas.",
  "Panalangin 🙏: ang mga 📿 Prayer token mo, ang mga nasa unit mo sa field at ang sarili mo. Ang unit na may Panalangin N ay nagkakaroon ng N sa simula ng bawat turn mo; mawawala ang mga token nito kapag namatay ito o umalis sa field. Kailangan ng Ecclesia card ng halaga ng Panalangin para malaro; hindi ito nagagastos. Isang beses bawat turn, bilang pitch mo, kapag nagpatawag ka ng Ecclesia card puwede mong i-exile ang isang card mula sa kamay para sa 1 sariling Prayer token, na iyo na.",
  "பிரார்த்தனை 🙏: உங்கள் 📿 பிரார்த்தனை டோக்கன்கள், களத்திலுள்ள உங்கள் அலகுகளின் மேலுள்ளவையும் உங்களுடையவையும். பிரார்த்தனை N உள்ள அலகு உங்கள் ஒவ்வொரு முறையின் தொடக்கத்திலும் N பெறும்; அது இறந்தாலோ களத்தை விட்டுப் போனாலோ அதன் டோக்கன்கள் போகும். எக்லீசியா அட்டைகளை விளையாட ஒரு பிரார்த்தனை மதிப்பு தேவை; அது ஒருபோதும் செலவாகாது. ஒரு முறைக்கு ஒருமுறை, உங்கள் கைவிடலாக, ஓர் எக்லீசியா அட்டையை அழைக்கும்போது கையிலுள்ள ஓர் அட்டையை நாடுகடத்தி உங்களுக்குச் சொந்தமான 1 பிரார்த்தனை டோக்கனைப் பெறலாம், அது உங்களிடமே இருக்கும்.",
  "Doa 🙏: token Doa 📿 milikmu, yang ada di unit-unitmu di arena ditambah milikmu sendiri. Unit dengan Doa N mendapat N di awal setiap giliranmu; tokennya hilang saat ia mati atau meninggalkan arena. Kartu Ecclesia butuh nilai Doa untuk dimainkan; nilai itu tidak pernah terpakai. Sekali tiap giliran, sebagai buanganmu, saat memanggil kartu Ecclesia kamu boleh mengasingkan kartu dari tangan untuk 1 token Doa milikmu sendiri, yang tetap kamu simpan.",
  "祈祷 🙏：你的 📿 祈祷标记，包括你场上单位身上的和你自己的。拥有祈祷 N 的单位在你每个回合开始时获得 N 个；它阵亡或离开场地时，标记随之消失。Ecclesia 卡需要一定的祈祷值才能打出；祈祷值从不消耗。每回合一次，作为你的弃牌，召唤 Ecclesia 卡时你可以放逐一张手牌，换取 1 个属于你自己的祈祷标记，并一直保留。",
  "祈禱 🙏：你的 📿 祈禱標記，包括你場上單位身上的和你自己的。擁有祈禱 N 的單位在你每個回合開始時獲得 N 個；它陣亡或離開場地時，標記隨之消失。Ecclesia 卡需要一定的祈禱值才能打出；祈禱值從不消耗。每回合一次，作為你的棄牌，召喚 Ecclesia 卡時你可以放逐一張手牌，換取 1 個屬於你自己的祈禱標記，並一直保留。",
  "祈り 🙏：あなたの 📿 祈りトークン。場にいる自分のユニットのものと、あなた自身のもの。祈りNを持つユニットは自分のターンの開始ごとにN個得る。倒れるか場を離れると、そのトークンは失われる。Ecclesiaカードのプレイには祈りの値が必要（消費しない）。1ターンに1回、ピッチとして、Ecclesiaカードを召喚するとき手札を1枚除外して、あなた自身の祈りトークンを1個得られる（ずっと残る）。",
  "기도 🙏: 내 📿 기도 토큰. 필드에 있는 내 유닛들의 토큰과 내 자신의 토큰. 기도 N을 가진 유닛은 내 턴이 시작될 때마다 N개를 얻고, 죽거나 필드를 떠나면 그 토큰은 사라집니다. Ecclesia 카드를 내려면 기도 수치가 필요하며, 소모되지 않습니다. 턴마다 한 번, 피치로서 Ecclesia 카드를 소환할 때 손패 한 장을 추방해 계속 남는 내 기도 토큰 1개를 얻을 수 있습니다."],
"{name} needs Prayer {need}; you have {have}. Exile a hand card to your Removal Zone for 1 Prayer token of your own, kept all fight. It is your pitch this turn.": [
  "{name} demande Prière {need} ; vous en avez {have}. Exilez une carte de votre main dans votre Zone de retrait pour 1 jeton de Prière à vous, gardé tout le combat. C'est votre défausse de ce tour.",
  "{name} braucht Gebet {need}; du hast {have}. Verbanne eine Handkarte in deine Entfernungszone für 1 eigene Gebetsmarke, die den ganzen Kampf bleibt. Das ist dein Abwurf in diesem Zug.",
  "{name} necesita Oración {need}; tienes {have}. Exilia una carta de tu mano a tu Zona de retiro por 1 ficha de Oración propia, que dura todo el combate. Es tu descarte de este turno.",
  "{name} richiede Preghiera {need}; ne hai {have}. Esilia una carta dalla mano nella tua Zona di rimozione per 1 segnalino Preghiera tuo, che resta per tutto lo scontro. È il tuo scarto di questo turno.",
  "{name} precisa de Oração {need}; tens {have}. Exila uma carta da mão para a tua Zona de remoção por 1 ficha de Oração tua, que fica todo o combate. É o teu descarte deste turno.",
  "Kailangan ng {name} ng Panalangin {need}; may {have} ka. I-exile ang isang card mula sa kamay papunta sa Sona ng Pag-alis para sa 1 sariling Prayer token, na iyo buong laban. Ito ang pitch mo sa turn na ito.",
  "{name} க்குப் பிரார்த்தனை {need} தேவை; உங்களிடம் {have} உள்ளது. கையிலுள்ள ஓர் அட்டையை நீக்கப் பகுதிக்கு நாடுகடத்தி, சண்டை முழுவதும் இருக்கும் உங்களுக்குச் சொந்தமான 1 பிரார்த்தனை டோக்கனைப் பெறுங்கள். இதுவே இந்த முறையின் உங்கள் கைவிடல்.",
  "{name} butuh Doa {need}; kamu punya {have}. Asingkan satu kartu dari tangan ke Zona Pembuangan untuk 1 token Doa milikmu sendiri, bertahan sepanjang pertarungan. Ini buanganmu giliran ini.",
  "{name} 需要祈祷 {need}；你有 {have}。从手牌放逐一张卡到移除区，换取 1 个属于你自己的祈祷标记，整场战斗都保留。这算作你本回合的弃牌。",
  "{name} 需要祈禱 {need}；你有 {have}。從手牌放逐一張卡到移除區，換取 1 個屬於你自己的祈禱標記，整場戰鬥都保留。這算作你本回合的棄牌。",
  "{name}には祈り{need}が必要。あなたは{have}。手札のカードを1枚除外ゾーンへ除外して、あなた自身の祈りトークンを1個得る（戦闘中ずっと残る）。これがこのターンのピッチになる。",
  "{name}에는 기도 {need}이(가) 필요합니다. 현재 {have}. 손패 한 장을 제거 구역으로 추방해 전투 내내 남는 내 기도 토큰 1개를 얻습니다. 이번 턴의 피치가 됩니다."],
"An offering for {name}: +1 Prayer token, kept by its player.": [
  "Une offrande pour {name} : +1 jeton de Prière, gardé par son joueur.",
  "Ein Opfer für {name}: +1 Gebetsmarke, die sein Spieler behält.",
  "Una ofrenda por {name}: +1 ficha de Oración, para su jugador.",
  "Un'offerta per {name}: +1 segnalino Preghiera, tenuto dal suo giocatore.",
  "Uma oferenda por {name}: +1 ficha de Oração, guardada pelo seu jogador.",
  "Isang alay para sa {name}: +1 Prayer token, hawak ng manlalaro nito.",
  "{name} க்கான காணிக்கை: +1 பிரார்த்தனை டோக்கன், அதன் ஆட்டக்காரரிடம் இருக்கும்.",
  "Persembahan untuk {name}: +1 token Doa, disimpan pemainnya.",
  "为 {name} 献祭：+1 祈祷标记，归其玩家所有。",
  "為 {name} 獻祭：+1 祈禱標記，歸其玩家所有。",
  "{name}のための捧げ物：祈りトークン+1（そのプレイヤーのもの）。",
  "{name}을(를) 위한 봉헌: 기도 토큰 +1, 그 플레이어가 보유."],
"When it dies, leaves a 1/1 in its slot keeping only its plain keywords: no skills, Prayer or buffs.": [
  "À sa mort, laisse un 1/1 à sa place qui ne garde que ses mots-clés simples : ni compétences, ni Prière, ni bonus.",
  "Stirbt sie, bleibt auf ihrem Platz eine 1/1 mit nur ihren einfachen Schlüsselwörtern: keine Fähigkeiten, kein Gebet, keine Verstärkungen.",
  "Al morir, deja un 1/1 en su casilla con solo sus palabras clave simples: sin habilidades, Oración ni mejoras.",
  "Quando muore, lascia al suo posto un 1/1 con le sole parole chiave semplici: niente abilità, Preghiera o potenziamenti.",
  "Ao morrer, deixa no seu lugar um 1/1 só com as palavras-chave simples: sem habilidades, Oração ou bónus.",
  "Kapag namatay, nag-iiwan ng 1/1 sa puwesto nito na dala lang ang mga simpleng keyword: walang skill, Panalangin o buff.",
  "இறக்கும்போது, தன் எளிய முக்கியச்சொற்களை மட்டும் கொண்ட 1/1 ஐத் தன் இடத்தில் விடும்: திறன்களோ பிரார்த்தனையோ வலுவூட்டல்களோ இல்லை.",
  "Saat mati, meninggalkan 1/1 di tempatnya yang hanya menyimpan kata kunci sederhananya: tanpa skill, Doa, atau penguat.",
  "阵亡时在原位留下一个只带基础关键词的 1/1：没有技能、祈祷或增益。",
  "陣亡時在原位留下一個只帶基礎關鍵詞的 1/1：沒有技能、祈禱或增益。",
  "倒れるとその場に基本キーワードだけの1/1を残す（スキル・祈り・強化なし）。",
  "죽으면 기본 키워드만 지닌 1/1을 그 자리에 남깁니다: 스킬, 기도, 강화 없음."],
"When it dies, leaves a 1/1 Relic in its slot with its plain keywords.": [
  "À sa mort, laisse une Relique 1/1 à sa place, avec ses mots-clés simples.",
  "Stirbt sie, bleibt eine 1/1-Reliquie mit ihren einfachen Schlüsselwörtern auf ihrem Platz.",
  "Al morir, deja una Reliquia 1/1 en su casilla con sus palabras clave simples.",
  "Quando muore, lascia una Reliquia 1/1 al suo posto con le parole chiave semplici.",
  "Ao morrer, deixa uma Relíquia 1/1 no seu lugar com as palavras-chave simples.",
  "Kapag namatay, nag-iiwan ng 1/1 na Relikya sa puwesto nito na may mga simpleng keyword.",
  "இறக்கும்போது, எளிய முக்கியச்சொற்களுடன் 1/1 புனிதச்சின்னத்தைத் தன் இடத்தில் விடும்.",
  "Saat mati, meninggalkan Relikui 1/1 di tempatnya dengan kata kunci sederhananya.",
  "阵亡时在原位留下一个带基础关键词的 1/1 圣物。",
  "陣亡時在原位留下一個帶基礎關鍵詞的 1/1 聖物。",
  "倒れるとその場に基本キーワードを持つ1/1の聖遺物を残す。",
  "죽으면 기본 키워드를 지닌 1/1 성유물을 그 자리에 남깁니다."],
"An Ecclesia skill. The Relic appears the moment the unit dies, in its slot, with the card's art faded. It keeps keywords such as Flying, Guardian, Swimmer, Pierce, Reach, Evasive, Stealth and Nocturnal, and none of the card's other skills, Prayer, tokens, counters or buffs. It never has Relic itself, so it can't leave a Relic of its own.": [
  "Une compétence Ecclesia. La Relique apparaît à l'instant où l'unité meurt, à sa place, avec l'illustration de la carte estompée. Elle garde des mots-clés comme Vol, Gardien, Nageuse, Perforation, Allonge, Insaisissable, Furtivité et Nocturne, et aucune autre compétence de la carte, ni Prière, jetons, marqueurs ou bonus. Elle n'a jamais Relique, donc elle ne peut pas laisser de Relique à son tour.",
  "Eine Ecclesia-Fähigkeit. Die Reliquie erscheint im Moment, in dem die Einheit stirbt, auf ihrem Platz, mit verblasstem Kartenbild. Sie behält Schlüsselwörter wie Fliegend, Wächter, Schwimmer, Durchbohren, Reichweite, Ausweichend, Tarnung und Nachtaktiv, aber keine anderen Fähigkeiten der Karte, kein Gebet, keine Marken, Zähler oder Verstärkungen. Sie hat selbst nie Reliquie, kann also keine eigene Reliquie hinterlassen.",
  "Una habilidad Ecclesia. La Reliquia aparece en el momento en que la unidad muere, en su casilla, con la ilustración de la carta desvaída. Conserva palabras clave como Volador, Guardián, Nadadora, Perforar, Alcance, Evasiva, Sigilo y Nocturna, y ninguna otra habilidad de la carta, ni Oración, fichas, contadores o mejoras. Nunca tiene Reliquia, así que no puede dejar una Reliquia propia.",
  "Un'abilità Ecclesia. La Reliquia appare nell'istante in cui l'unità muore, al suo posto, con l'illustrazione della carta sbiadita. Conserva parole chiave come Volante, Guardiano, Nuotatore, Perforazione, Portata, Evasivo, Furtività e Notturno, e nessun'altra abilità della carta, né Preghiera, segnalini, contatori o potenziamenti. Non ha mai Reliquia, quindi non può lasciare una Reliquia propria.",
  "Uma habilidade Ecclesia. A Relíquia aparece no instante em que a unidade morre, no seu lugar, com a ilustração da carta desbotada. Mantém palavras-chave como Voador, Guardião, Nadador, Perfurar, Alcance, Evasivo, Furtividade e Noturno, e nenhuma outra habilidade da carta, nem Oração, fichas, marcadores ou bónus. Nunca tem Relíquia, por isso não pode deixar uma Relíquia sua.",
  "Isang Ecclesia skill. Lumilitaw ang Relikya sa sandaling mamatay ang unit, sa puwesto nito, na kupas ang larawan ng card. Pinananatili nito ang mga keyword gaya ng Lumilipad, Tagabantay, Manlalangoy, Pierce, Abot, Mailap, Palihim at Panggabi, at wala sa iba pang skill ng card, Panalangin, token, counter o buff. Wala itong Relikya kailanman, kaya hindi ito makapag-iiwan ng sarili nitong Relikya.",
  "ஓர் எக்லீசியா திறன். அலகு இறக்கும் கணமே, அதன் இடத்தில், மங்கிய அட்டை ஓவியத்துடன் புனிதச்சின்னம் தோன்றும். அது பறக்கும், காவலர், நீச்சல், துளை, எட்டல், தப்பித்தல், மறைவு, இரவு போன்ற முக்கியச்சொற்களை வைத்திருக்கும்; அட்டையின் மற்ற திறன்கள், பிரார்த்தனை, டோக்கன்கள், கவுண்டர்கள், வலுவூட்டல்கள் எதுவும் இல்லை. அதற்குத் தானே புனிதச்சின்னம் ஒருபோதும் இல்லை, எனவே அது தன் சொந்தப் புனிதச்சின்னத்தை விட்டுச் செல்ல முடியாது.",
  "Skill Ecclesia. Relikui muncul saat unit itu mati, di tempatnya, dengan gambar kartu yang memudar. Ia menyimpan kata kunci seperti Terbang, Penjaga, Perenang, Tembus, Jangkauan, Mengelak, Siluman, dan Nokturnal, tanpa skill kartu lainnya, Doa, token, penghitung, atau penguat. Ia sendiri tidak pernah punya Relikui, jadi tidak bisa meninggalkan Relikui sendiri.",
  "Ecclesia 技能。单位阵亡的那一刻，圣物就出现在它的原位，卡面图像褪色。它保留飞行、守护者、游泳者、穿刺、射程、闪避、潜行、夜行等关键词，不保留卡牌的其他技能、祈祷、标记、计数器或增益。它自身永远没有圣物，所以不会再留下自己的圣物。",
  "Ecclesia 技能。單位陣亡的那一刻，聖物就出現在它的原位，卡面圖像褪色。它保留飛行、守護者、游泳者、穿刺、射程、閃避、潛行、夜行等關鍵詞，不保留卡牌的其他技能、祈禱、標記、計數器或增益。它自身永遠沒有聖物，所以不會再留下自己的聖物。",
  "Ecclesiaのスキル。ユニットが倒れたその瞬間、その場に聖遺物が現れる（カードの絵は色あせる）。飛行、守護者、スイマー、貫通、リーチ、回避、隠密、夜行性などのキーワードを保ち、カードのほかのスキル、祈り、トークン、カウンター、強化は持たない。聖遺物自身は聖遺物を持たないので、さらに聖遺物を残すことはない。",
  "Ecclesia 스킬. 유닛이 죽는 순간 그 자리에 카드 그림이 바랜 성유물이 나타납니다. 비행, 수호자, 수영, 관통, 사거리, 회피, 은신, 야행성 같은 키워드를 유지하며, 카드의 다른 스킬, 기도, 토큰, 카운터, 강화는 없습니다. 성유물 자신은 성유물을 갖지 않으므로 또 다른 성유물을 남기지 않습니다."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
PLURAL = re.compile(r'^\{(s\d?|plural_\w+)\}$')
ph = lambda s: sorted(set(p for p in re.findall(r'\{\w+\}', s) if not PLURAL.match(p)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
assert all(run in t for k, v in T.items() for run in re.findall(r'(?:\{\w+\}){2,}', k) for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en in DROP: pack.pop(en, None)
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
        upath = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        if os.path.exists(upath):
            up = json.load(open(upath, encoding='utf-8')); n0 = len(up)
            for en in DROP: up.pop(en, None)
            if len(up) != n0:
                with open(upath, 'w', encoding='utf-8') as fh:
                    json.dump(up, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each, dropped', len(DROP))
