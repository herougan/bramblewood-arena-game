#!/usr/bin/env python3
"""Game texts added or changed on 2026-10-23 by package BL (owner 11:23 Bloom and Nectar Vintner; 17:34 #3 "Bloom hasn't changed", #14 Bleed's
fade): Bloom – {conditions} (its name, short line, description, codex note, log lines, the Sunny / Killed an enemy conditions), Bleed's fade rule
said plainly, Pollen Drift on Healing, and the new Pond Algae card (name and flavour).
Same rules as tools/i18n_2026_10_23_en2.py: keys are the English as the page translator sees it (the TX English), every {placeholder} is kept;
the replaced English rows are dropped. A leading emoji is not part of a key (the translator peels it off first). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_23_bl.py"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
DEAD = [
 "{name} blooms for {n} Lumber: +1/+1, and a copy of it grows beside it.",
 "{name} blooms: +1/+1, and a copy of it grows beside it.",
 "Once, at the start of the first round its conditions hold ({when}) and you have {n} Lumber: it pays the Lumber, gains +1/+1, and a copy of it grows in a free slot beside it, with its damage and its stat changes but none of its counters. The copy can't bloom.",
 "Once, at the start of the first round its conditions hold ({when}): +1/+1, and a copy of it grows in a free slot beside it, with its damage and its stat changes but none of its counters. The copy can't bloom.",
 "Once its conditions hold, it pays {n} Lumber: +1/+1, and a copy of it grows beside it.",
 "Once its conditions hold: +1/+1, and a copy of it grows beside it.",
 "hurts by its stacks whenever it attacks or uses a skill; −1 stack a round. Heals remove it.",
 "takes {n} damage whenever it attacks or uses a skill; −1 stack a round. Heals remove it.",
 "🩸 Bleeding: this card takes damage every time it attacks or uses a skill. The stack drops by 1 each round; heals remove it.",
 "Bloom heals 1 more.",
 "🌸 {name} blooms: +1/+1, and a copy of it grows beside it.",
 "🌸 {name} blooms for {n} Lumber: +1/+1, and a copy of it grows beside it.",
 "hurts by its stacks whenever it attacks or uses a skill. At the start of each round the stack drops by 1, whether it bled or not. Cleanse removes it.",
 "takes {n} damage whenever it attacks or uses a skill. At the start of each round the stack drops by 1, whether it bled or not. Cleanse removes it.",
]
T = {
"Bloom ({when})": ["Floraison ({when})", "Blüte ({when})", "Floración ({when})", "Fioritura ({when})", "Floração ({when})", "Pamumulaklak ({when})",
 "மலர்ச்சி ({when})", "Mekar ({when})", "花开（{when}）", "花開（{when}）", "開花（{when}）", "개화 ({when})"],
"Killed an enemy": ["A tué un ennemi", "Hat einen Gegner getötet", "Mató a un enemigo", "Ha ucciso un nemico", "Matou um inimigo", "Nakapatay ng kalaban",
 "ஒரு எதிரியைக் கொன்றது", "Membunuh musuh", "击杀过敌人", "擊殺過敵人", "敵を倒した", "적을 처치함"],
"Sunny": ["Ensoleillé", "Sonnig", "Soleado", "Soleggiato", "Ensolarado", "Maaraw", "வெயில்", "Cerah", "晴朗", "晴朗", "晴れ", "맑음"],
"Once its conditions hold: a copy of it grows beside it, with +1/+1.": [
 "Une fois ses conditions réunies : une copie d'elle pousse à côté, avec +1/+1.",
 "Sobald ihre Bedingungen erfüllt sind: Eine Kopie von ihr wächst daneben, mit +1/+1.",
 "Una vez se cumplen sus condiciones: una copia suya crece a su lado, con +1/+1.",
 "Una volta soddisfatte le sue condizioni: una sua copia cresce accanto, con +1/+1.",
 "Quando as suas condições se cumprem: uma cópia dela cresce ao lado, com +1/+1.",
 "Kapag natupad ang mga kondisyon nito: may kopya nitong tutubo sa tabi nito, may +1/+1.",
 "அதன் நிபந்தனைகள் நிறைவேறியதும்: அதன் ஒரு நகல் அருகில் +1/+1 உடன் வளரும்.",
 "Begitu syaratnya terpenuhi: salinannya tumbuh di sampingnya, dengan +1/+1.",
 "条件一旦满足：在旁边长出一个它的复制体，复制体 +1/+1。",
 "條件一旦滿足：在旁邊長出一個它的複製體，複製體 +1/+1。",
 "条件がそろうと：隣に自分のコピーが生える（コピーは+1/+1）。",
 "조건이 갖춰지면: 옆에 그 복제가 +1/+1로 자라납니다."],
"Once its conditions hold, it pays {n} Lumber: a copy of it grows beside it, with +1/+1.": [
 "Une fois ses conditions réunies, elle paie {n} Bois : une copie d'elle pousse à côté, avec +1/+1.",
 "Sobald ihre Bedingungen erfüllt sind, zahlt sie {n} Holz: Eine Kopie von ihr wächst daneben, mit +1/+1.",
 "Una vez se cumplen sus condiciones, paga {n} de Madera: una copia suya crece a su lado, con +1/+1.",
 "Una volta soddisfatte le sue condizioni, paga {n} Legno: una sua copia cresce accanto, con +1/+1.",
 "Quando as suas condições se cumprem, paga {n} de Madeira: uma cópia dela cresce ao lado, com +1/+1.",
 "Kapag natupad ang mga kondisyon nito, magbabayad ito ng {n} Kahoy: may kopya nitong tutubo sa tabi nito, may +1/+1.",
 "அதன் நிபந்தனைகள் நிறைவேறியதும், {n} மரம் செலுத்தும்: அதன் ஒரு நகல் அருகில் +1/+1 உடன் வளரும்.",
 "Begitu syaratnya terpenuhi, ia membayar {n} Kayu: salinannya tumbuh di sampingnya, dengan +1/+1.",
 "条件一旦满足，支付 {n} 木材：在旁边长出一个它的复制体，复制体 +1/+1。",
 "條件一旦滿足，支付 {n} 木材：在旁邊長出一個它的複製體，複製體 +1/+1。",
 "条件がそろうと木材を{n}払う：隣に自分のコピーが生える（コピーは+1/+1）。",
 "조건이 갖춰지면 목재 {n}을 냅니다: 옆에 그 복제가 +1/+1로 자라납니다."],
"Once, at the start of the first round its conditions hold ({when}): a copy of it grows in a free slot beside it, with +1/+1, its damage and its stat changes but none of its counters. The unit itself is unchanged; the copy can't bloom.": [
 "Une seule fois, au début de la première manche où ses conditions sont réunies ({when}) : une copie d'elle pousse dans un emplacement libre à côté, avec +1/+1, ses dégâts et ses changements de stats mais aucun de ses marqueurs. L'unité elle-même ne change pas ; la copie ne peut pas fleurir.",
 "Einmal, zu Beginn der ersten Runde, in der ihre Bedingungen erfüllt sind ({when}): Eine Kopie von ihr wächst auf einem freien Platz daneben, mit +1/+1, ihrem Schaden und ihren Wertänderungen, aber ohne ihre Marker. Die Einheit selbst bleibt gleich; die Kopie kann nicht blühen.",
 "Una vez, al inicio de la primera ronda en que se cumplen sus condiciones ({when}): una copia suya crece en un hueco libre a su lado, con +1/+1, su daño y sus cambios de estadísticas pero sin ninguno de sus contadores. La unidad no cambia; la copia no puede florecer.",
 "Una volta, all'inizio del primo turno in cui le sue condizioni sono soddisfatte ({when}): una sua copia cresce in uno spazio libero accanto, con +1/+1, i suoi danni e le sue modifiche alle statistiche ma senza i suoi segnalini. L'unità resta com'è; la copia non può fiorire.",
 "Uma vez, no início da primeira ronda em que as suas condições se cumprem ({when}): uma cópia dela cresce num espaço livre ao lado, com +1/+1, o seu dano e as suas alterações de atributos mas sem nenhum dos seus marcadores. A unidade não muda; a cópia não pode florescer.",
 "Minsan, sa simula ng unang round na natupad ang mga kondisyon nito ({when}): may kopya nitong tutubo sa bakanteng puwesto sa tabi nito, may +1/+1, dala ang pinsala at mga pagbabago sa stats nito pero wala ni isa sa mga counter nito. Hindi nagbabago ang unit mismo; hindi makakapamulaklak ang kopya.",
 "ஒருமுறை, அதன் நிபந்தனைகள் நிறைவேறும் முதல் சுற்றின் தொடக்கத்தில் ({when}): அருகிலுள்ள காலியிடத்தில் அதன் நகல் +1/+1 உடன் வளரும்; அதன் சேதமும் புள்ளி மாற்றங்களும் வரும், அடையாளங்கள் எதுவும் வராது. அலகு அப்படியே இருக்கும்; நகல் மலராது.",
 "Sekali, di awal ronde pertama syaratnya terpenuhi ({when}): salinannya tumbuh di petak kosong di sampingnya, dengan +1/+1, kerusakan dan perubahan statnya tetapi tanpa satu pun penandanya. Unit itu sendiri tidak berubah; salinannya tidak bisa mekar.",
 "仅一次：在条件首次满足的回合开始时（{when}）：在旁边的空位长出一个它的复制体，复制体 +1/+1，带着它受到的伤害和属性变化，但不带任何标记。本体不变；复制体不能花开。",
 "僅一次：在條件首次滿足的回合開始時（{when}）：在旁邊的空位長出一個它的複製體，複製體 +1/+1，帶著它受到的傷害和屬性變化，但不帶任何標記。本體不變；複製體不能花開。",
 "一度だけ、条件が初めてそろったラウンドの開始時（{when}）：隣の空きマスに自分のコピーが生え、コピーは+1/+1。受けたダメージと能力値の変化は引き継ぎ、カウンターは引き継がない。本体は変わらず、コピーは開花しない。",
 "한 번만, 조건이 처음 갖춰진 라운드 시작에 ({when}): 옆 빈칸에 그 복제가 +1/+1로 자라납니다. 받은 피해와 능력치 변화는 이어받고 카운터는 이어받지 않습니다. 본체는 그대로이고, 복제는 개화하지 못합니다."],
"Once, at the start of the first round its conditions hold ({when}) and you have {n} Lumber: it pays the Lumber and a copy of it grows in a free slot beside it, with +1/+1, its damage and its stat changes but none of its counters. The unit itself is unchanged; the copy can't bloom.": [
 "Une seule fois, au début de la première manche où ses conditions sont réunies ({when}) et où vous avez {n} Bois : elle paie le Bois et une copie d'elle pousse dans un emplacement libre à côté, avec +1/+1, ses dégâts et ses changements de stats mais aucun de ses marqueurs. L'unité elle-même ne change pas ; la copie ne peut pas fleurir.",
 "Einmal, zu Beginn der ersten Runde, in der ihre Bedingungen erfüllt sind ({when}) und du {n} Holz hast: Sie zahlt das Holz und eine Kopie von ihr wächst auf einem freien Platz daneben, mit +1/+1, ihrem Schaden und ihren Wertänderungen, aber ohne ihre Marker. Die Einheit selbst bleibt gleich; die Kopie kann nicht blühen.",
 "Una vez, al inicio de la primera ronda en que se cumplen sus condiciones ({when}) y tienes {n} de Madera: paga la Madera y una copia suya crece en un hueco libre a su lado, con +1/+1, su daño y sus cambios de estadísticas pero sin ninguno de sus contadores. La unidad no cambia; la copia no puede florecer.",
 "Una volta, all'inizio del primo turno in cui le sue condizioni sono soddisfatte ({when}) e hai {n} Legno: paga il Legno e una sua copia cresce in uno spazio libero accanto, con +1/+1, i suoi danni e le sue modifiche alle statistiche ma senza i suoi segnalini. L'unità resta com'è; la copia non può fiorire.",
 "Uma vez, no início da primeira ronda em que as suas condições se cumprem ({when}) e tens {n} de Madeira: paga a Madeira e uma cópia dela cresce num espaço livre ao lado, com +1/+1, o seu dano e as suas alterações de atributos mas sem nenhum dos seus marcadores. A unidade não muda; a cópia não pode florescer.",
 "Minsan, sa simula ng unang round na natupad ang mga kondisyon nito ({when}) at may {n} Kahoy ka: babayaran nito ang Kahoy at may kopya nitong tutubo sa bakanteng puwesto sa tabi nito, may +1/+1, dala ang pinsala at mga pagbabago sa stats nito pero wala ni isa sa mga counter nito. Hindi nagbabago ang unit mismo; hindi makakapamulaklak ang kopya.",
 "ஒருமுறை, அதன் நிபந்தனைகள் நிறைவேறும் முதல் சுற்றின் தொடக்கத்தில் ({when}) உங்களிடம் {n} மரம் இருந்தால்: அது மரத்தைச் செலுத்தும், அருகிலுள்ள காலியிடத்தில் அதன் நகல் +1/+1 உடன் வளரும்; அதன் சேதமும் புள்ளி மாற்றங்களும் வரும், அடையாளங்கள் எதுவும் வராது. அலகு அப்படியே இருக்கும்; நகல் மலராது.",
 "Sekali, di awal ronde pertama syaratnya terpenuhi ({when}) dan kamu punya {n} Kayu: ia membayar Kayu itu dan salinannya tumbuh di petak kosong di sampingnya, dengan +1/+1, kerusakan dan perubahan statnya tetapi tanpa satu pun penandanya. Unit itu sendiri tidak berubah; salinannya tidak bisa mekar.",
 "仅一次：在条件首次满足（{when}）且你有 {n} 木材的回合开始时：支付木材，在旁边的空位长出一个它的复制体，复制体 +1/+1，带着它受到的伤害和属性变化，但不带任何标记。本体不变；复制体不能花开。",
 "僅一次：在條件首次滿足（{when}）且你有 {n} 木材的回合開始時：支付木材，在旁邊的空位長出一個它的複製體，複製體 +1/+1，帶著它受到的傷害和屬性變化，但不帶任何標記。本體不變；複製體不能花開。",
 "一度だけ、条件が初めてそろい（{when}）木材が{n}あるラウンドの開始時：木材を払い、隣の空きマスに自分のコピーが生え、コピーは+1/+1。受けたダメージと能力値の変化は引き継ぎ、カウンターは引き継がない。本体は変わらず、コピーは開花しない。",
 "한 번만, 조건이 처음 갖춰지고 ({when}) 목재가 {n} 있는 라운드 시작에: 목재를 내고 옆 빈칸에 그 복제가 +1/+1로 자라납니다. 받은 피해와 능력치 변화는 이어받고 카운터는 이어받지 않습니다. 본체는 그대로이고, 복제는 개화하지 못합니다."],
"Conditions: Wet (rain, the Tide in, or a beach, river or sea map), Sunny (day or Twilight, with no Rain, Fog or darkness), Killed an enemy (this unit has killed an enemy unit), and Tide, Ebb, Night, Day, Twilight, Wind, Dark, Heat, Frost, Full Moon, Rain. With no free slot beside it, it waits and tries again next round. The copy arrives with its printed Wait and leaves no card behind when it dies.": [
 "Conditions : Mouillée (pluie, Marée montante, ou carte de plage, de rivière ou de mer), Ensoleillé (jour ou crépuscule, sans Pluie, Brouillard ni ténèbres), A tué un ennemi (cette unité a tué une unité ennemie), et Marée, Reflux, Nuit, Jour, Crépuscule, Vent, Sombre, Chaleur, Givre, Pleine lune, Pluie. Sans emplacement libre à côté, elle attend et réessaie la manche suivante. La copie arrive avec son Attente imprimée et ne laisse aucune carte en mourant.",
 "Bedingungen: Nass (Regen, die Flut ist da, oder eine Strand-, Fluss- oder Meereskarte), Sonnig (Tag oder Dämmerung, ohne Regen, Nebel oder Dunkelheit), Hat einen Gegner getötet (diese Einheit hat eine gegnerische Einheit getötet), und Flut, Ebbe, Nacht, Tag, Dämmerung, Wind, Dunkel, Hitze, Frost, Vollmond, Regen. Ohne freien Platz daneben wartet sie und versucht es nächste Runde erneut. Die Kopie kommt mit ihrem aufgedruckten Warten und hinterlässt beim Tod keine Karte.",
 "Condiciones: Mojada (lluvia, la Marea alta, o un mapa de playa, río o mar), Soleado (día o crepúsculo, sin Lluvia, Niebla ni oscuridad), Mató a un enemigo (esta unidad ha matado a una unidad enemiga), y Marea, Bajamar, Noche, Día, Crepúsculo, Viento, Oscuro, Calor, Escarcha, Luna llena, Lluvia. Sin hueco libre a su lado, espera y lo intenta de nuevo la ronda siguiente. La copia llega con su Espera impresa y no deja ninguna carta al morir.",
 "Condizioni: Bagnata (pioggia, la Marea alta, o una mappa di spiaggia, fiume o mare), Soleggiato (giorno o crepuscolo, senza Pioggia, Nebbia né oscurità), Ha ucciso un nemico (questa unità ha ucciso un'unità nemica), e Marea, Riflusso, Notte, Giorno, Crepuscolo, Vento, Buio, Caldo, Brina, Luna piena, Pioggia. Senza uno spazio libero accanto, aspetta e riprova il turno dopo. La copia arriva con la sua Attesa stampata e non lascia alcuna carta quando muore.",
 "Condições: Molhada (chuva, a Maré cheia, ou um mapa de praia, rio ou mar), Ensolarado (dia ou crepúsculo, sem Chuva, Nevoeiro nem escuridão), Matou um inimigo (esta unidade matou uma unidade inimiga), e Maré, Vazante, Noite, Dia, Crepúsculo, Vento, Escuro, Calor, Geada, Lua cheia, Chuva. Sem espaço livre ao lado, espera e tenta de novo na ronda seguinte. A cópia chega com a sua Espera impressa e não deixa nenhuma carta ao morrer.",
 "Mga kondisyon: Basa (ulan, pagtaas ng Alon, o mapa ng dalampasigan, ilog o dagat), Maaraw (araw o takipsilim, walang Ulan, Hamog o dilim), Nakapatay ng kalaban (nakapatay na ang unit na ito ng kalabang unit), at Alon, Kati, Gabi, Araw, Takipsilim, Hangin, Madilim, Init, Hamog na Yelo, Kabilugan ng buwan, Ulan. Kapag walang bakanteng puwesto sa tabi nito, maghihintay ito at susubok muli sa susunod na round. Darating ang kopya na may nakalimbag na Hintay at walang iiwang card kapag namatay.",
 "நிபந்தனைகள்: நனைந்தது (மழை, அலை ஏற்றம், அல்லது கடற்கரை, ஆறு அல்லது கடல் வரைபடம்), வெயில் (பகல் அல்லது அந்தி, மழை, மூடுபனி, இருள் இல்லாமல்), ஒரு எதிரியைக் கொன்றது (இந்த அலகு ஒரு எதிரி அலகைக் கொன்றுள்ளது), மேலும் அலை, இறக்கம், இரவு, பகல், அந்தி, காற்று, இருள், வெப்பம், பனிப்படலம், முழு நிலவு, மழை. அருகில் காலியிடம் இல்லையெனில் காத்திருந்து அடுத்த சுற்றில் மீண்டும் முயலும். நகல் அச்சிட்ட காத்திருப்புடன் வரும், இறக்கும்போது எந்த அட்டையையும் விட்டுச் செல்லாது.",
 "Syarat: Basah (hujan, Pasang naik, atau peta pantai, sungai, atau laut), Cerah (siang atau senja, tanpa Hujan, Kabut, atau kegelapan), Membunuh musuh (unit ini telah membunuh unit musuh), dan Pasang, Surut, Malam, Siang, Senja, Angin, Gelap, Panas, Embun Beku, Bulan purnama, Hujan. Tanpa petak kosong di sampingnya, ia menunggu dan mencoba lagi ronde berikutnya. Salinan datang dengan Tunggu tercetaknya dan tidak meninggalkan kartu saat mati.",
 "条件：潮湿（下雨、涨潮，或海滩、河流、海洋地图）、晴朗（白天或黄昏，且没有雨、雾或黑暗）、击杀过敌人（这个单位击杀过敌方单位），以及潮汐、退潮、夜晚、白天、黄昏、风、黑暗、炎热、霜、满月、雨天。旁边没有空位时，它会等待，下回合再试。复制体以卡面上的等待入场，死亡时不会留下卡牌。",
 "條件：潮溼（下雨、漲潮，或海灘、河流、海洋地圖）、晴朗（白天或黃昏，且沒有雨、霧或黑暗）、擊殺過敵人（這個單位擊殺過敵方單位），以及潮汐、退潮、夜晚、白天、黃昏、風、黑暗、炎熱、霜、滿月、雨天。旁邊沒有空位時，它會等待，下回合再試。複製體以卡面上的等待入場，死亡時不會留下卡牌。",
 "条件：濡れ（雨、満ち潮、または浜辺・川・海のマップ）、晴れ（昼か黄昏で、雨・霧・闇がない）、敵を倒した（このユニットが敵ユニットを倒した）、ほかに潮、引き潮、夜、昼、黄昏、風、闇、暑さ、霜、満月、雨。隣に空きマスがなければ待ち、次のラウンドにもう一度試す。コピーは印刷された待機で現れ、倒れてもカードを残さない。",
 "조건: 젖음 (비, 밀물, 또는 해변·강·바다 지도), 맑음 (낮이나 황혼, 비·안개·어둠 없음), 적을 처치함 (이 유닛이 적 유닛을 처치함), 그리고 물결, 썰물, 밤, 낮, 황혼, 바람, 어둠, 더위, 서리, 보름달, 비. 옆에 빈칸이 없으면 기다렸다가 다음 라운드에 다시 시도합니다. 복제는 카드에 적힌 대기로 들어오며, 죽어도 카드를 남기지 않습니다."],
"copy": ["copie", "Kopie", "copia", "copia", "cópia", "kopya", "நகல்", "salinan", "复制体", "複製體", "コピー", "복제"],
"bloomed": ["a fleuri", "erblüht", "florecida", "fiorita", "floresceu", "namulaklak na", "மலர்ந்தது", "sudah mekar", "已花开", "已花開", "開花済み", "개화함"],
"{name} blooms: a copy of it grows beside it, with +1/+1.": [
 "{name} fleurit : une copie d'elle pousse à côté, avec +1/+1.",
 "{name} blüht: Eine Kopie wächst daneben, mit +1/+1.",
 "{name} florece: una copia suya crece a su lado, con +1/+1.",
 "{name} fiorisce: una sua copia cresce accanto, con +1/+1.",
 "{name} floresce: uma cópia cresce ao lado, com +1/+1.",
 "Namulaklak ang {name}: may kopya nitong tumubo sa tabi, may +1/+1.",
 "{name} மலர்கிறது: அதன் நகல் அருகில் +1/+1 உடன் வளர்கிறது.",
 "{name} mekar: salinannya tumbuh di sampingnya, dengan +1/+1.",
 "{name} 花开了：旁边长出一个复制体，复制体 +1/+1。",
 "{name} 花開了：旁邊長出一個複製體，複製體 +1/+1。",
 "{name}が開花：隣にコピーが生えた（コピーは+1/+1）。",
 "{name} 개화: 옆에 복제가 +1/+1로 자라납니다."],
"{name} blooms for {n} Lumber: a copy of it grows beside it, with +1/+1.": [
 "{name} fleurit pour {n} Bois : une copie d'elle pousse à côté, avec +1/+1.",
 "{name} blüht für {n} Holz: Eine Kopie wächst daneben, mit +1/+1.",
 "{name} florece por {n} de Madera: una copia suya crece a su lado, con +1/+1.",
 "{name} fiorisce per {n} Legno: una sua copia cresce accanto, con +1/+1.",
 "{name} floresce por {n} de Madeira: uma cópia cresce ao lado, com +1/+1.",
 "Namulaklak ang {name} kapalit ng {n} Kahoy: may kopya nitong tumubo sa tabi, may +1/+1.",
 "{name} {n} மரம் செலுத்தி மலர்கிறது: அதன் நகல் அருகில் +1/+1 உடன் வளர்கிறது.",
 "{name} mekar dengan {n} Kayu: salinannya tumbuh di sampingnya, dengan +1/+1.",
 "{name} 支付 {n} 木材花开了：旁边长出一个复制体，复制体 +1/+1。",
 "{name} 支付 {n} 木材花開了：旁邊長出一個複製體，複製體 +1/+1。",
 "{name}が木材{n}で開花：隣にコピーが生えた（コピーは+1/+1）。",
 "{name} 목재 {n}으로 개화: 옆에 복제가 +1/+1로 자라납니다."],
"🩸 Bleeding: this card takes damage every time it attacks or uses a skill. At the start of each round the stack drops by 1, whether it bled or not; Cleanse removes it.": [
 "🩸 Saignement : cette carte subit des dégâts chaque fois qu'elle attaque ou utilise une compétence. Au début de chaque manche, le cumul baisse de 1, qu'elle ait saigné ou non ; Purger l'enlève.",
 "🩸 Blutung: Diese Karte nimmt jedes Mal Schaden, wenn sie angreift oder eine Fähigkeit nutzt. Zu Beginn jeder Runde sinkt der Stapel um 1, ob sie geblutet hat oder nicht; Reinigen entfernt sie.",
 "🩸 Sangrado: esta carta recibe daño cada vez que ataca o usa una habilidad. Al inicio de cada ronda la acumulación baja en 1, haya sangrado o no; Limpiar lo quita.",
 "🩸 Sanguinamento: questa carta subisce danni ogni volta che attacca o usa un'abilità. All'inizio di ogni turno l'accumulo scende di 1, che abbia sanguinato o no; Purificare lo toglie.",
 "🩸 Sangramento: esta carta sofre dano sempre que ataca ou usa uma habilidade. No início de cada ronda a acumulação desce 1, quer tenha sangrado ou não; Purificar remove-o.",
 "🩸 Dumudugo: napipinsala ang card na ito tuwing aatake o gagamit ng kakayahan. Sa simula ng bawat round, bumababa nang 1 ang patong, dumugo man o hindi; inaalis ito ng Paglilinis.",
 "🩸 இரத்தக்கசிவு: இந்த அட்டை தாக்கும்போதும் திறனைப் பயன்படுத்தும்போதும் சேதம் அடையும். ஒவ்வொரு சுற்றின் தொடக்கத்திலும், கசிந்தாலும் கசியாவிட்டாலும், அடுக்கு 1 குறையும்; தூய்மையாக்கல் நீக்கும்.",
 "🩸 Berdarah: kartu ini menerima kerusakan setiap kali menyerang atau memakai kemampuan. Di awal setiap ronde tumpukannya turun 1, berdarah atau tidak; Pembersihan menghapusnya.",
 "🩸 流血：这张卡每次攻击或使用技能都会受伤。每回合开始时层数减 1，无论本回合是否流过血；净化可移除。",
 "🩸 流血：這張卡每次攻擊或使用技能都會受傷。每回合開始時層數減 1，無論本回合是否流過血；淨化可移除。",
 "🩸 出血：このカードは攻撃やスキル使用のたびにダメージを受ける。各ラウンドの開始時、出血したかどうかにかかわらず重ねが1減る。浄化で消える。",
 "🩸 출혈: 이 카드는 공격하거나 스킬을 쓸 때마다 피해를 받습니다. 매 라운드 시작에 피를 흘렸든 아니든 중첩이 1 줄어듭니다. 정화로 없앱니다."],
"hurts by its stacks as it attacks or uses skills; −1 stack each round start, bled or not.": [
 "perd de la Santé selon ses cumuls quand elle attaque ou utilise des compétences ; −1 cumul à chaque début de manche, saignement ou non.",
 "verliert Leben in Höhe ihrer Stapel, wenn sie angreift oder Fähigkeiten nutzt; −1 Stapel zu jedem Rundenbeginn, ob sie blutete oder nicht.",
 "pierde Salud según sus acumulaciones al atacar o usar habilidades; −1 acumulación al inicio de cada ronda, haya sangrado o no.",
 "perde Salute pari ai suoi accumuli quando attacca o usa abilità; −1 accumulo a ogni inizio turno, che abbia sanguinato o no.",
 "perde Vida igual às acumulações ao atacar ou usar habilidades; −1 acumulação no início de cada ronda, quer tenha sangrado ou não.",
 "nasasaktan ayon sa patong nito kapag umaatake o gumagamit ng kakayahan; −1 patong sa simula ng bawat round, dumugo man o hindi.",
 "தாக்கும்போதும் திறன்களைப் பயன்படுத்தும்போதும் அடுக்குகளுக்கு ஏற்பக் காயம்; ஒவ்வொரு சுற்றின் தொடக்கத்திலும் −1 அடுக்கு, கசிந்தாலும் இல்லாவிட்டாலும்.",
 "terluka sebesar tumpukannya saat menyerang atau memakai kemampuan; −1 tumpukan tiap awal ronde, berdarah atau tidak.",
 "攻击或使用技能时按层数受伤；每回合开始时 −1 层，无论是否流过血。",
 "攻擊或使用技能時按層數受傷；每回合開始時 −1 層，無論是否流過血。",
 "攻撃やスキル使用のたび重なった数だけ傷つく。各ラウンド開始時に −1（出血の有無にかかわらず）。",
 "공격하거나 스킬을 쓸 때마다 중첩 수만큼 다친다. 매 라운드 시작에 −1 (피를 흘렸든 아니든)."],
"takes {n} damage as it attacks or uses skills; −1 stack each round start, bled or not.": [
 "subit {n} dégâts quand elle attaque ou utilise des compétences ; −1 cumul à chaque début de manche, saignement ou non.",
 "nimmt {n} Schaden, wenn sie angreift oder Fähigkeiten nutzt; −1 Stapel zu jedem Rundenbeginn, ob sie blutete oder nicht.",
 "recibe {n} de daño al atacar o usar habilidades; −1 acumulación al inicio de cada ronda, haya sangrado o no.",
 "subisce {n} danni quando attacca o usa abilità; −1 accumulo a ogni inizio turno, che abbia sanguinato o no.",
 "sofre {n} de dano ao atacar ou usar habilidades; −1 acumulação no início de cada ronda, quer tenha sangrado ou não.",
 "tumatanggap ng {n} pinsala kapag umaatake o gumagamit ng kakayahan; −1 patong sa simula ng bawat round, dumugo man o hindi.",
 "தாக்கும்போதும் திறன்களைப் பயன்படுத்தும்போதும் {n} சேதம்; ஒவ்வொரு சுற்றின் தொடக்கத்திலும் −1 அடுக்கு, கசிந்தாலும் இல்லாவிட்டாலும்.",
 "menerima {n} kerusakan saat menyerang atau memakai kemampuan; −1 tumpukan tiap awal ronde, berdarah atau tidak.",
 "攻击或使用技能时受到 {n} 点伤害；每回合开始时 −1 层，无论是否流过血。",
 "攻擊或使用技能時受到 {n} 點傷害；每回合開始時 −1 層，無論是否流過血。",
 "攻撃やスキル使用のたび {n} ダメージ。各ラウンド開始時に −1（出血の有無にかかわらず）。",
 "공격하거나 스킬을 쓸 때마다 피해 {n}. 매 라운드 시작에 −1 (피를 흘렸든 아니든)."],
"Healing heals 1 more.": ["Guérison soigne 1 de plus.", "Heilung heilt 1 mehr.", "Curación cura 1 más.", "La Cura cura 1 in più.", "A Cura cura mais 1.", "Mas magpapagaling nang 1 ang Paggaling.",
 "குணமாக்கல் 1 கூடுதலாகக் குணப்படுத்தும்.", "Penyembuhan memulihkan 1 lebih banyak.", "治疗多回复 1。", "治療多回復 1。", "回復の回復量+1。", "회복이 1 더 회복해요."],
"Healing {v1}": ["Guérison {v1}", "Heilung {v1}", "Curación {v1}", "Cura {v1}", "Cura {v1}", "Paggaling {v1}", "குணமாக்கல் {v1}", "Penyembuhan {v1}", "治疗 {v1}", "治療 {v1}", "回復 {v1}", "회복 {v1}"],
}
CARD_NAME = "Pond Algae"
CARD_FLAVOUR = "A green film on still water. Give it sun and a wet day, and by evening there are two."
CARD = {
 'fr': ("Algues de mare", "Une pellicule verte sur l'eau dormante. Donnez-lui du soleil et un jour humide, et le soir elles sont deux."),
 'de': ("Teichalgen", "Ein grüner Film auf stillem Wasser. Gib ihm Sonne und einen nassen Tag, und am Abend sind es zwei."),
 'es': ("Algas de charca", "Una película verde sobre el agua quieta. Dale sol y un día húmedo, y al anochecer ya son dos."),
 'it': ("Alghe di stagno", "Una patina verde sull'acqua ferma. Dagli sole e una giornata bagnata, e a sera sono due."),
 'pt': ("Algas do charco", "Uma película verde sobre a água parada. Dá-lhe sol e um dia molhado, e ao fim da tarde já são duas."),
 'tl': ("Lumot ng Lawa", "Isang berdeng sapin sa tahimik na tubig. Bigyan ito ng araw at basang maghapon, at pagsapit ng gabi ay dalawa na."),
 'ta': ("குளப் பாசி", "அசையாத நீரின் மேல் ஒரு பச்சைப் படலம். வெயிலும் ஈரமான நாளும் கொடுத்தால், மாலைக்குள் இரண்டாகிவிடும்."),
 'id': ("Ganggang Kolam", "Selapis hijau di atas air yang tenang. Beri ia matahari dan hari yang basah, dan menjelang sore jumlahnya jadi dua."),
 'zh-Hans': ("池塘藻", "静水上的一层绿膜。给它阳光和一个潮湿的日子，到傍晚就变成两片了。"),
 'zh-Hant': ("池塘藻", "靜水上的一層綠膜。給它陽光和一個潮溼的日子，到傍晚就變成兩片了。"),
 'ja': ("池のアオミドロ", "よどんだ水に張る緑の膜。日差しと雨の一日を与えれば、夕方には二つになっている。"),
 'ko': ("연못 녹조", "고인 물 위의 초록 막. 햇빛과 젖은 하루를 주면, 저녁엔 둘이 되어 있다."),
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
    pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8'))
    for old in DEAD: pack.pop(old, None); uipack.pop(old, None)
    for en, row in T.items(): uipack.pop(en, None); pack[en] = row[i]
    uipack[CARD_FLAVOUR] = CARD[code][1]
    dump(path, pack); dump(ui, uipack)
    cp = os.path.join(ROOT, 'lang', 'cards', code + '.json'); cards = json.load(open(cp, encoding='utf-8')); cards[CARD_NAME] = CARD[code][0]; dump(cp, cards)
print('wrote', len(CODES), 'packs,', len(T), 'strings each; the Pond Algae name and flavour')
