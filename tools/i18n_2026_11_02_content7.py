#!/usr/bin/env python3
"""Package CONTENT7 (2026-11-02; owner 19:56 "OK go do, + art", IDEA-11-02, CONTENT6-2 b): the nine new creature cards and the two renames
(Gale Sprite -> Whirlwind Swift, Alpine Avalanche -> Avalanche Bear), names and flavour lines, in all 12 languages.
Names go to lang/cards/<code>.json, flavour lines to lang/ui/<code>.json (as tools/i18n_2026_11_02_content6.py). The old English keys of the two
renamed cards (name and flavour) are removed from every pack. Key order is kept (new keys are appended, nothing is sorted).
Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_02_content7.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

# (old English or None, new English, [fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko])
NAMES = [
 (None, 'Bloodworm', ['Ver sanguin', 'Blutwurm', 'Gusano sanguíneo', 'Verme Sanguigno', 'Verme-de-sangue', 'Uod na Dugo', 'இரத்தப் புழு', 'Cacing Darah', '血虫', '血蟲', 'ブラッドワーム', '블러드웜']),
 (None, 'Bright Night Algae', ['Algue lumineuse de nuit', 'Leuchtende Nachtalge', 'Alga brillante nocturna', 'Alga Luminosa Notturna', 'Alga Luminosa Noturna', 'Maliwanag na Alga sa Gabi', 'இரவு ஒளிர் பாசி', 'Alga Malam Bercahaya', '夜光藻', '夜光藻', '夜に輝く藻', '밤빛 조류']),
 (None, 'Bobbit Worm', ['Ver de Bobbit', 'Bobbit-Wurm', 'Gusano de Bobbit', 'Verme di Bobbit', 'Verme-de-Bobbit', 'Uod na Bobbit', 'பாபிட் புழு', 'Cacing Bobbit', '博比特虫', '博比特蟲', 'ボビットワーム', '보빗벌레']),
 (None, "Man o' War", ['Galère portugaise', 'Portugiesische Galeere', 'Carabela portuguesa', 'Caravella Portoghese', 'Caravela-portuguesa', 'Portuges na Dikya', 'போர்த்துகீசிய கடற்கலம்', 'Ubur-ubur Man o’ War', '僧帽水母', '僧帽水母', 'カツオノエボシ', '고깔해파리']),
 (None, 'Nautiloid', ['Nautiloïde', 'Nautiloide', 'Nautiloideo', 'Nautiloide', 'Nautiloide', 'Nautiloid', 'நாட்டிலாய்டு', 'Nautiloid', '鹦鹉螺类', '鸚鵡螺類', 'ノーチロイド', '앵무조개류']),
 (None, 'Pistol Shrimp', ['Crevette-pistolet', 'Pistolenkrebs', 'Camarón pistola', 'Gambero Pistola', 'Camarão-pistola', 'Hipong Pistola', 'துப்பாக்கி இறால்', 'Udang Pistol', '枪虾', '槍蝦', 'テッポウエビ', '딱총새우']),
 (None, 'Unicorn', ['Licorne', 'Einhorn', 'Unicornio', 'Unicorno', 'Unicórnio', 'Unikornyo', 'யூனிகார்ன்', 'Unicorn', '独角兽', '獨角獸', 'ユニコーン', '유니콘']),
 (None, 'Sphinx', ['Sphinx', 'Sphinx', 'Esfinge', 'Sfinge', 'Esfinge', 'Sphinx', 'ஸ்பிங்க்ஸ்', 'Sphinx', '斯芬克斯', '斯芬克斯', 'スフィンクス', '스핑크스']),
 (None, 'Griffin', ['Griffon', 'Greif', 'Grifo', 'Grifone', 'Grifo', 'Griffin', 'கிரிஃபின்', 'Griffin', '狮鹫', '獅鷲', 'グリフォン', '그리핀']),
 ('Gale Sprite', 'Whirlwind Swift', ['Martinet tourbillon', 'Wirbelwind-Segler', 'Vencejo torbellino', 'Rondone Vorticoso', 'Andorinhão Redemoinho', 'Ipu-ipong Layang-layang', 'சுழற்காற்று உழவாரன்', 'Walet Pusaran', '旋风雨燕', '旋風雨燕', '旋風アマツバメ', '회오리 칼새']),
 ('Alpine Avalanche', 'Avalanche Bear', ['Ours avalanche', 'Lawinenbär', 'Oso alud', 'Orso Valanga', 'Urso Avalanche', 'Oso ng Avalanche', 'பனிச்சரிவு கரடி', 'Beruang Longsor', '雪崩熊', '雪崩熊', '雪崩グマ', '눈사태 곰']),
]
FLAVOR = [
 (None, 'Four black jaws fold out of a pink body, and the tide flats suddenly feel very wide.', [
  'Quatre mâchoires noires jaillissent d’un corps rose, et l’estran paraît soudain très vaste.', 'Vier schwarze Kiefer klappen aus einem rosa Körper, und das Watt wirkt plötzlich sehr weit.',
  'Cuatro mandíbulas negras se despliegan de un cuerpo rosado, y la marisma parece de pronto muy grande.', 'Quattro mascelle nere si aprono da un corpo rosa, e la battigia sembra all’improvviso molto ampia.',
  'Quatro mandíbulas negras saem de um corpo rosado, e a maré vazia de repente parece enorme.', 'Apat na itim na panga ang lumalabas sa kulay-rosas na katawan, at biglang napakalawak ng baybayin.',
  'இளஞ்சிவப்பு உடலிலிருந்து நான்கு கருப்பு தாடைகள் விரிகின்றன; ஓதச் சமவெளி திடீரென மிக விசாலமாகத் தோன்றுகிறது.', 'Empat rahang hitam terbuka dari tubuh merah muda, dan hamparan pasang surut mendadak terasa sangat luas.',
  '四副黑色的颚从粉色的身体里展开，潮滩一下子显得无比空旷。', '四副黑色的顎從粉色的身體裡展開，潮灘一下子顯得無比空曠。',
  'ピンク色の体から四つの黒い顎が開き、干潟が急にとても広く感じられる。', '분홍빛 몸에서 검은 턱 네 개가 펼쳐지면, 갯벌이 갑자기 아주 넓게 느껴진다.']),
 (None, 'A glowing bacterium, blown up to the size of a barrel. Come dark, the bay lights up and there are two.', [
  'Une bactérie lumineuse, gonflée à la taille d’un tonneau. À la nuit, la baie s’illumine et il y en a deux.', 'Ein leuchtendes Bakterium, aufgeblasen auf Fassgröße. Bei Dunkelheit leuchtet die Bucht, und es sind zwei.',
  'Una bacteria luminosa, hinchada hasta el tamaño de un barril. Al oscurecer, la bahía se enciende y hay dos.', 'Un batterio luminoso, gonfiato fino a diventare grande come una botte. Quando fa buio la baia si illumina e ce ne sono due.',
  'Uma bactéria luminosa, inchada até o tamanho de um barril. Ao escurecer, a baía se ilumina e passam a ser duas.', 'Isang kumikinang na bakterya, pinalaki hanggang sa laki ng bariles. Paglubog ng araw, nagliliwanag ang look at dalawa na ito.',
  'பீப்பாய் அளவுக்கு ஊதிப் பெருத்த ஒளிரும் பாக்டீரியா. இருட்டியதும் வளைகுடா ஒளிர்கிறது; இப்போது இரண்டு.', 'Bakteri bercahaya yang menggembung sebesar tong. Saat gelap, teluk menyala dan jumlahnya jadi dua.',
  '一只发光的细菌，被吹胀到木桶那么大。天一黑，海湾亮起来，它就变成了两只。', '一隻發光的細菌，被吹脹到木桶那麼大。天一黑，海灣亮起來，牠就變成了兩隻。',
  '樽ほどの大きさに膨らんだ、光るバクテリア。日が暮れると入り江が輝き、二匹になる。', '통만 하게 부풀어 오른 빛나는 세균. 어두워지면 만이 환해지고, 둘이 된다.']),
 (None, 'It lies buried in the sand with one feeler out. The snap is over before the sand settles.', [
  'Il reste enfoui dans le sable, une antenne dehors. Le claquement est fini avant que le sable retombe.', 'Es liegt im Sand vergraben, nur ein Fühler schaut heraus. Der Biss ist vorbei, bevor sich der Sand legt.',
  'Yace enterrado en la arena con una antena fuera. El chasquido termina antes de que la arena se asiente.', 'Giace sepolto nella sabbia con una sola antenna fuori. Lo scatto è finito prima che la sabbia si posi.',
  'Fica enterrado na areia com uma antena de fora. O bote termina antes de a areia assentar.', 'Nakabaon ito sa buhangin, may isang galamay na nakalabas. Tapos na ang kagat bago pa tumigil ang buhangin.',
  'ஒரு உணர்கொம்பு மட்டும் வெளியே தெரிய, மணலில் புதைந்து கிடக்கும். மணல் அடங்குவதற்குள் கடி முடிந்துவிடும்.', 'Ia terkubur di pasir dengan satu sungut mencuat. Sambaran selesai sebelum pasir mengendap.',
  '它埋在沙里，只露出一根触须。沙子还没落定，一口就咬完了。', '牠埋在沙裡，只露出一根觸鬚。沙子還沒落定，一口就咬完了。',
  '砂に潜り、触角を一本だけ出している。砂が落ち着く前に、噛みつきは終わっている。', '모래에 묻혀 더듬이 하나만 내놓고 있다. 모래가 가라앉기도 전에 낚아채기는 끝나 있다.']),
 (None, 'Not one animal but many, sailing on one blue bubble. Its streamers outrun the ship that sees it.', [
  'Pas un animal mais beaucoup, voguant sur une seule bulle bleue. Ses filaments distancent le navire qui l’aperçoit.', 'Kein Tier, sondern viele, die auf einer blauen Blase segeln. Seine Fäden überholen das Schiff, das es sichtet.',
  'No es un animal sino muchos, navegando en una sola burbuja azul. Sus tentáculos superan al barco que lo ve.', 'Non un animale ma molti, che navigano su un’unica bolla azzurra. I suoi filamenti superano la nave che li avvista.',
  'Não é um animal, mas muitos, navegando numa só bolha azul. Seus filamentos ultrapassam o navio que os avista.', 'Hindi isang hayop kundi marami, naglalayag sa iisang asul na bula. Nahihigitan ng mga galamay nito ang barkong nakakakita rito.',
  'ஒரே விலங்கு அல்ல, பல; ஒரே நீல நீர்க்குமிழியில் பயணிக்கின்றன. அதைக் காணும் கப்பலையே அதன் இழைகள் முந்திவிடும்.', 'Bukan satu hewan, melainkan banyak, berlayar di atas satu gelembung biru. Tentakelnya mengungguli kapal yang melihatnya.',
  '它不是一只动物，而是许多只，乘着一个蓝色气囊航行。它的触须比看见它的船还快。', '牠不是一隻動物，而是許多隻，乘著一個藍色氣囊航行。牠的觸鬚比看見牠的船還快。',
  '一匹ではなく、多くの生き物が青い浮き袋ひとつで帆走する。その触手は、見つけた船さえ追い越す。', '한 마리가 아니라 여러 마리가 파란 부레 하나로 항해한다. 그 촉수는 자신을 본 배보다 빠르다.']),
 (None, 'Its shell was a straight spear long before shells learned to curl. The oldest hunter in the Current.', [
  'Sa coquille était une lance droite bien avant que les coquilles apprennent à s’enrouler. Le plus vieux chasseur du Courant.', 'Seine Schale war ein gerader Speer, lange bevor Schalen lernten, sich zu rollen. Der älteste Jäger der Strömung.',
  'Su concha era una lanza recta mucho antes de que las conchas aprendieran a enroscarse. El cazador más antiguo de la Corriente.', 'Il suo guscio era una lancia dritta molto prima che i gusci imparassero ad arrotolarsi. Il più antico cacciatore della Corrente.',
  'Sua concha era uma lança reta muito antes de as conchas aprenderem a se enrolar. O caçador mais antigo da Corrente.', 'Tuwid na sibat ang kabibe nito bago pa natutong pumulupot ang mga kabibe. Ang pinakamatandang mangangaso sa Agos.',
  'சங்குகள் சுருள கற்றுக்கொள்வதற்கு வெகு முன்பே, இதன் ஓடு நேரான ஈட்டியாக இருந்தது. நீரோட்டத்தின் மிகப் பழைய வேட்டைக்காரன்.', 'Cangkangnya adalah tombak lurus jauh sebelum cangkang belajar menggulung. Pemburu tertua di Arus.',
  '早在贝壳学会卷曲之前，它的壳就是一支笔直的长矛。洋流中最古老的猎手。', '早在貝殼學會捲曲之前，牠的殼就是一支筆直的長矛。洋流中最古老的獵手。',
  '殻が渦を巻くことを覚えるずっと前から、その殻は真っ直ぐな槍だった。潮流で最も古い狩人。', '껍데기가 말리는 법을 배우기 훨씬 전부터 그 껍데기는 곧은 창이었다. 해류에서 가장 오래된 사냥꾼.']),
 (None, 'One claw snaps shut so fast the water boils. What was in front of it sits down for a while.', [
  'Une pince claque si vite que l’eau bout. Ce qui se trouvait devant elle s’assoit un moment.', 'Eine Schere schnappt so schnell zu, dass das Wasser kocht. Was davor stand, setzt sich erst mal hin.',
  'Una pinza se cierra tan rápido que el agua hierve. Lo que tenía delante se sienta un rato.', 'Una chela scatta così veloce che l’acqua bolle. Ciò che le stava davanti si siede per un po’.',
  'Uma pinça se fecha tão rápido que a água ferve. O que estava à frente senta um pouco.', 'Isang sipit ang sumasara nang napakabilis na kumukulo ang tubig. Ang nasa harap nito ay uupo muna sandali.',
  'ஒரு கொடுக்கு தண்ணீர் கொதிக்கும் வேகத்தில் மூடுகிறது. அதன் முன்னால் இருந்தது சிறிது நேரம் உட்கார்ந்துவிடும்.', 'Satu capit menjepit begitu cepat hingga air mendidih. Apa pun di depannya terduduk sebentar.',
  '一只钳子合拢得太快，连水都沸腾了。站在它面前的东西得坐下歇一会儿。', '一隻鉗子合攏得太快，連水都沸騰了。站在牠面前的東西得坐下歇一會兒。',
  'ハサミが速すぎて水が沸き立つ。目の前にいたものは、しばらく座り込む。', '집게 하나가 너무 빨리 닫혀 물이 끓는다. 그 앞에 있던 것은 한동안 주저앉는다.']),
 (None, 'Where it steps, the grass stands up again. Where it is struck, nothing stays wounded for long.', [
  'Là où elle pose le sabot, l’herbe se redresse. Là où elle est frappée, aucune blessure ne dure.', 'Wo es hintritt, richtet sich das Gras wieder auf. Wo es getroffen wird, bleibt keine Wunde lange.',
  'Donde pisa, la hierba se vuelve a erguir. Donde la hieren, ninguna herida dura mucho.', 'Dove posa lo zoccolo, l’erba si rialza. Dove viene colpito, nessuna ferita dura a lungo.',
  'Onde pisa, a grama se levanta de novo. Onde é atingido, nenhuma ferida dura muito.', 'Saan man ito tumapak, muling tumatayo ang damo. Saan man ito tamaan, walang sugat na tumatagal.',
  'அது கால் வைக்கும் இடத்தில் புல் மீண்டும் எழுகிறது. அது தாக்கப்படும் இடத்தில் எந்தக் காயமும் நீடிப்பதில்லை.', 'Di mana ia melangkah, rumput kembali tegak. Di mana ia terpukul, tak ada luka yang bertahan lama.',
  '它踏过的地方，青草重新挺立；它受伤的地方，伤口很快就愈合。', '牠踏過的地方，青草重新挺立；牠受傷的地方，傷口很快就癒合。',
  '踏んだところで草が再び立ち上がる。打たれても、傷はすぐに癒える。', '발길이 닿는 곳마다 풀이 다시 일어선다. 맞아도 상처는 오래가지 않는다.']),
 (None, 'It asks one question. Answering is not the dangerous part.', [
  'Elle ne pose qu’une question. Y répondre n’est pas le plus dangereux.', 'Es stellt eine einzige Frage. Sie zu beantworten ist nicht der gefährliche Teil.',
  'Hace una sola pregunta. Responderla no es lo peligroso.', 'Fa una sola domanda. Rispondere non è la parte pericolosa.',
  'Faz uma única pergunta. Responder não é a parte perigosa.', 'Isang tanong lang ang ibinibigay nito. Hindi ang pagsagot ang mapanganib.',
  'அது ஒரே ஒரு கேள்வி கேட்கும். பதில் சொல்வது ஆபத்தான பகுதி அல்ல.', 'Ia hanya mengajukan satu pertanyaan. Menjawabnya bukan bagian yang berbahaya.',
  '它只问一个问题。回答并不是最危险的部分。', '牠只問一個問題。回答並不是最危險的部分。',
  '問いはひとつだけ。答えることは、危険な部分ではない。', '질문은 단 하나. 대답하는 것은 위험한 부분이 아니다.']),
 (None, 'Half eagle, half lion, and it never once chose between the two.', [
  'Moitié aigle, moitié lion, et il n’a jamais choisi entre les deux.', 'Halb Adler, halb Löwe, und es hat sich nie für eines von beiden entschieden.',
  'Mitad águila, mitad león, y nunca eligió entre los dos.', 'Metà aquila, metà leone, e non ha mai scelto tra i due.',
  'Metade águia, metade leão, e nunca escolheu entre os dois.', 'Kalahating agila, kalahating leon, at hindi ito kailanman pumili sa dalawa.',
  'பாதி கழுகு, பாதி சிங்கம்; இரண்டில் ஒன்றையும் அது ஒருபோதும் தேர்ந்தெடுக்கவில்லை.', 'Setengah elang, setengah singa, dan ia tak pernah memilih salah satunya.',
  '一半是鹰，一半是狮，它从未在两者之间做过选择。', '一半是鷹，一半是獅，牠從未在兩者之間做過選擇。',
  '半分は鷲、半分は獅子。どちらかを選んだことは一度もない。', '반은 독수리, 반은 사자. 둘 중 하나를 고른 적은 한 번도 없다.']),
 ('You hear it before you see it. Mostly you just hear it.', 'You hear the whirlwind before you see the swift. Mostly you just hear it.', [
  'On entend le tourbillon avant de voir le martinet. Surtout, on l’entend.', 'Man hört den Wirbelwind, bevor man den Segler sieht. Meistens hört man ihn nur.',
  'Oyes el torbellino antes de ver al vencejo. Sobre todo, lo oyes.', 'Si sente il vortice prima di vedere il rondone. Per lo più si sente soltanto.',
  'Ouve-se o redemoinho antes de ver o andorinhão. Quase sempre, só se ouve.', 'Maririnig mo ang ipu-ipo bago mo makita ang layang-layang. Madalas, naririnig mo lang.',
  'உழவாரனைப் பார்க்கும் முன்பே சுழற்காற்றைக் கேட்பீர்கள். பெரும்பாலும் கேட்பது மட்டுமே.', 'Anda mendengar pusaran sebelum melihat waletnya. Kebanyakan hanya mendengarnya.',
  '你先听到旋风，才看到雨燕。多数时候，你只听得到。', '你先聽到旋風，才看到雨燕。多數時候，你只聽得到。',
  '姿を見る前に旋風の音が聞こえる。たいてい、聞こえるだけだ。', '칼새를 보기 전에 회오리 소리부터 들린다. 대개는 소리만 들린다.']),
 ('Started as a pebble. Nobody agrees on whose fault that was.', 'Started as a snowball. Nobody agrees on whose fault that was, least of all the bear.', [
  'Cela a commencé par une boule de neige. Personne ne s’accorde sur le responsable, surtout pas l’ours.', 'Es fing als Schneeball an. Niemand ist sich einig, wer schuld war, am wenigsten der Bär.',
  'Empezó como una bola de nieve. Nadie se pone de acuerdo sobre de quién fue la culpa, y menos que nadie el oso.', 'È cominciata come una palla di neve. Nessuno è d’accordo su di chi sia la colpa, tantomeno l’orso.',
  'Começou como uma bola de neve. Ninguém concorda sobre de quem foi a culpa, muito menos o urso.', 'Nagsimula ito bilang snowball. Walang magkasundo kung kaninong kasalanan iyon, lalo na ang oso.',
  'இது ஒரு பனிப்பந்தாகத் தொடங்கியது. யார் தவறு என்பதில் யாருக்கும் உடன்பாடு இல்லை; கரடிக்கே இல்லை.', 'Awalnya hanya bola salju. Tak ada yang sepakat itu salah siapa, apalagi si beruang.',
  '一开始只是个雪球。到底是谁的错，没人说得清，熊自己更说不清。', '一開始只是個雪球。到底是誰的錯，沒人說得清，熊自己更說不清。',
  '始まりは雪玉ひとつ。誰のせいかは誰にも分からない、クマ本人にも。', '시작은 눈덩이 하나였다. 누구 탓인지 아무도 모르고, 곰 자신은 더더욱 모른다.']),
]


def load(p):
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


def dump(p, d):
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def main():
    for rows in (NAMES, FLAVOR):
        for old, new, tr in rows:
            assert len(tr) == 12, new
    stats = {}
    for i, code in enumerate(CODES):
        paths = {w: os.path.join(ROOT, 'lang', *(([w] if w else []) + [code + '.json'])) for w in ('', 'cards', 'ui')}
        packs = {w: load(p) for w, p in paths.items()}
        dropped = added = 0
        for rows, where in ((NAMES, 'cards'), (FLAVOR, 'ui')):
            for old, new, tr in rows:
                if old:
                    for w in packs:
                        if old in packs[w]: del packs[w][old]; dropped += 1
                if new not in packs[where]: added += 1
                packs[where][new] = tr[i]
        for w, p in paths.items(): dump(p, packs[w])
        stats[code] = (added, dropped)
    print('ok: (added, old keys dropped) per language:', stats)


if __name__ == '__main__':
    main()
