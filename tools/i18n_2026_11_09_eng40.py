#!/usr/bin/env python3
"""Package ENG40 (2026-11-09, owner decisions ENG36-1 and ENG34-3 c): Hoard N reads +N/+N for every 3 Lumber (2 Stone, each Metal); Fletcher
and Weapon Master add to arrows only. lang/<code>.json rows keyed by the English text of the TX keys in bramblewood-texts.js. Each translation
reuses the pack's own words for Lumber / Stone / Metal / arrows (the ENG36 and ENG34 rows). One row per English text; rows that exist are
kept, new rows are appended, nothing is sorted. Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_09_eng40.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

UI = [
 ('+{n}/+{n} for every 3 Lumber you hold.', [
   '+{n}/+{n} par tranche de 3 Bois que vous avez.', '+{n}/+{n} für je 3 Holz, die du hast.', '+{n}/+{n} por cada 3 de Madera que tengas.',
   '+{n}/+{n} ogni 3 Legname che hai.', '+{n}/+{n} para cada 3 de Madeira que você tem.', '+{n}/+{n} sa bawat 3 Kahoy na hawak mo.',
   'உங்களிடம் உள்ள ஒவ்வொரு 3 மரத்துக்கும் +{n}/+{n}.', '+{n}/+{n} untuk setiap 3 Kayu yang kamu punya.', '你每持有3木材+{n}/+{n}。',
   '你每持有3木材+{n}/+{n}。', '所持している木材3つにつき+{n}/+{n}。', '보유한 목재 3개마다 +{n}/+{n}.']),
 ('+{n}/+{n} for every 2 Stone you hold.', [
   '+{n}/+{n} par tranche de 2 Pierre que vous avez.', '+{n}/+{n} für je 2 Stein, die du hast.', '+{n}/+{n} por cada 2 de Piedra que tengas.',
   '+{n}/+{n} ogni 2 Pietra che hai.', '+{n}/+{n} para cada 2 de Pedra que você tem.', '+{n}/+{n} sa bawat 2 Bato na hawak mo.',
   'உங்களிடம் உள்ள ஒவ்வொரு 2 கல்லுக்கும் +{n}/+{n}.', '+{n}/+{n} untuk setiap 2 Batu yang kamu punya.', '你每持有2岩石+{n}/+{n}。',
   '你每持有2岩石+{n}/+{n}。', '所持している石2つにつき+{n}/+{n}。', '보유한 돌 2개마다 +{n}/+{n}.']),
 ('+{n}/+{n} for each Metal you hold.', [
   '+{n}/+{n} par Métal que vous avez.', '+{n}/+{n} für jedes Metall, das du hast.', '+{n}/+{n} por cada Metal que tengas.',
   '+{n}/+{n} per ogni Metallo che hai.', '+{n}/+{n} para cada Metal que você tem.', '+{n}/+{n} sa bawat Metal na hawak mo.',
   'உங்களிடம் உள்ள ஒவ்வொரு உலோகத்துக்கும் +{n}/+{n}.', '+{n}/+{n} untuk setiap Logam yang kamu punya.', '你每持有1金属+{n}/+{n}。',
   '你每持有1金屬+{n}/+{n}。', '所持している金属1つにつき+{n}/+{n}。', '보유한 금속 1개마다 +{n}/+{n}.']),
 ("Your side's arrows deal {n} more; your equipped units get +1/+1.", [
   'Les flèches de votre camp infligent {n} de plus ; vos unités équipées gagnent +1/+1.',
   'Die Pfeile deiner Seite verursachen {n} mehr; deine ausgerüsteten Einheiten erhalten +1/+1.',
   'Las flechas de tu bando infligen {n} más; tus unidades equipadas obtienen +1/+1.',
   'Le frecce della tua parte infliggono {n} in più; le tue unità equipaggiate ottengono +1/+1.',
   'As flechas do seu lado causam {n} a mais; suas unidades equipadas ganham +1/+1.',
   'Ang mga palaso ng panig mo ay {n} na mas malakas; ang mga yunit mong may kagamitan ay +1/+1.',
   'உங்கள் பக்கத்தின் அம்புகள் {n} கூடுதல் சேதம் செய்யும்; உபகரணம் அணிந்த உங்கள் அலகுகள் +1/+1 பெறும்.',
   'Panah pihakmu memberi {n} lebih; unitmu yang berperlengkapan mendapat +1/+1.',
   '你方的箭多造成 {n} 点伤害；你方装备中的单位 +1/+1。', '你方的箭多造成 {n} 點傷害；你方裝備中的單位 +1/+1。',
   '味方の矢のダメージ +{n}。装備した味方ユニットは +1/+1。', '아군의 화살이 {n} 더 피해를 줍니다. 장비한 아군 유닛은 +1/+1.']),
 ("Your units' arrows deal {n} more damage.", [
   'Les flèches de vos unités infligent {n} dégâts de plus.', 'Die Pfeile deiner Einheiten verursachen {n} Schaden mehr.',
   'Las flechas de tus unidades infligen {n} de daño más.', 'Le frecce delle tue unità infliggono {n} danni in più.',
   'As flechas das suas unidades causam {n} de dano a mais.', 'Ang mga palaso ng mga yunit mo ay {n} na mas malakas.',
   'உங்கள் அலகுகளின் அம்புகள் {n} கூடுதல் சேதம் செய்யும்.', 'Panah unitmu memberi {n} kerusakan lebih.',
   '你方单位的箭多造成 {n} 点伤害。', '你方單位的箭多造成 {n} 點傷害。', '味方ユニットの矢のダメージが{n}増える。', '아군 유닛의 화살이 {n} 더 피해를 줘요.']),
 ("While it is on the field, your units' arrows deal {n} more damage (its own too). Bolts, spits and other shots don't.", [
   'Tant qu’il est sur le terrain, les flèches de vos unités infligent {n} dégâts de plus (les siennes aussi). Pas les carreaux, crachats ni autres tirs.',
   'Solange es auf dem Feld ist, verursachen die Pfeile deiner Einheiten {n} Schaden mehr (auch seine eigenen). Geschosse, Spucke und andere Schüsse nicht.',
   'Mientras está en el campo, las flechas de tus unidades infligen {n} de daño más (también las suyas). Los proyectiles, escupitajos y otros disparos no.',
   'Finché è in campo, le frecce delle tue unità infliggono {n} danni in più (anche le sue). Dardi, sputi e altri tiri no.',
   'Enquanto está em campo, as flechas das suas unidades causam {n} de dano a mais (as dele também). Projéteis, cuspes e outros disparos não.',
   'Habang nasa larangan ito, ang mga palaso ng mga yunit mo ay {n} na mas malakas (pati ang sa kanya). Hindi ang bolt, dura at iba pang tira.',
   'அது களத்தில் இருக்கும்வரை, உங்கள் அலகுகளின் அம்புகள் {n} கூடுதல் சேதம் செய்யும் (அதனுடையதும்). எறிகணைகள், உமிழ்வுகள், பிற தாக்குகள் அல்ல.',
   'Selama ia di arena, panah unitmu memberi {n} kerusakan lebih (miliknya juga). Peluru, semburan, dan tembakan lain tidak.',
   '它在场时，你方单位的箭多造成 {n} 点伤害（包括它自己的）。弹、喷吐和其他射击不算。',
   '它在場時，你方單位的箭多造成 {n} 點傷害（包括它自己的）。彈、噴吐和其他射擊不算。',
   '場にいる間、味方ユニットの矢のダメージが{n}増える（自身のものも）。弾や吐きかけ、その他の射撃は対象外。',
   '필드에 있는 동안 아군 유닛의 화살이 {n} 더 피해를 줘요(자신의 것도). 탄, 침, 다른 원거리 공격은 아니에요.']),
]


def main():
    for i, code in enumerate(CODES):
        p = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(p, encoding='utf-8'))
        added = 0
        for en, tr in UI:
            assert len(tr) == len(CODES), en
            if en not in pack:
                pack[en] = tr[i]
                added += 1
        open(p, 'w', encoding='utf-8').write(json.dumps(pack, ensure_ascii=False, indent=1) + '\n')
        print(code, 'added', added)


if __name__ == '__main__':
    main()
