# Translations for package HB2's card (2026-10-21): the Swordbill Challenger's name (lang/cards/<code>.json) and flavour (lang/ui/<code>.json,
# where the other cards' flavour lines live). Keys are the English text; new keys go at the end, as the earlier packages did.
import json
NAME = "Swordbill Challenger"
FLAVOUR = "Its bill is longer than its body. It bows first, then asks who would like to try it."
T = {
 'de': ("Schwertschnabel-Herausforderer", "Sein Schnabel ist länger als sein Körper. Es verneigt sich zuerst und fragt dann, wer es versuchen möchte."),
 'es': ("Retador Picoespada", "Su pico es más largo que su cuerpo. Primero hace una reverencia y luego pregunta quién quiere probar."),
 'fr': ("Défieur Bec-épée", "Son bec est plus long que son corps. Il salue d'abord, puis demande qui veut tenter sa chance."),
 'id': ("Penantang Paruh Pedang", "Paruhnya lebih panjang daripada tubuhnya. Ia membungkuk dulu, lalu bertanya siapa yang mau mencoba."),
 'it': ("Sfidante Beccospada", "Il suo becco è più lungo del suo corpo. Prima si inchina, poi chiede chi voglia provare."),
 'ja': ("ソードビルの挑戦者", "くちばしは体より長い。まず一礼し、それから「お手合わせ願えるのはどなた？」と尋ねる。"),
 'ko': ("칼부리 도전자", "부리가 몸보다 길다. 먼저 고개를 숙여 인사하고, 누가 겨뤄 보겠느냐고 묻는다."),
 'pt': ("Desafiante Bico-de-Espada", "O bico é mais longo do que o corpo. Ele faz uma reverência primeiro e depois pergunta quem quer tentar."),
 'ta': ("வாள்அலகு சவாலர்", "அதன் அலகு உடலை விட நீளமானது. முதலில் வணங்கும்; பிறகு யார் முயன்று பார்க்க விரும்புகிறார் என்று கேட்கும்."),
 'tl': ("Tagahamon na Tukang-Espada", "Mas mahaba ang tuka nito kaysa sa katawan. Yuyuko muna ito, saka itatanong kung sino ang gustong sumubok."),
 'zh-Hans': ("剑喙挑战者", "它的喙比身体还长。它先鞠躬行礼，再问谁想来试试。"),
 'zh-Hant': ("劍喙挑戰者", "牠的喙比身體還長。牠先鞠躬行禮，再問誰想來試試。"),
}
for code, (name, flavour) in T.items():
    for folder, key, val in (('cards', NAME, name), ('ui', FLAVOUR, flavour)):
        p = f'lang/{folder}/{code}.json'
        d = json.load(open(p, encoding='utf-8'))
        d[key] = val
        open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('Swordbill Challenger name and flavour translated into', len(T), 'packs')
