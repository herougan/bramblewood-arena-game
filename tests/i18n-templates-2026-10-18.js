#!/usr/bin/env node
// 2026-10-18 (package I1): the 159 game texts with {placeholders} were English in every language, since TX() fills them in
// English and the filled string never matched a pack key. bramblewood-i18n.js now compiles pack keys with {placeholders} into
// templates. Covers, for every pack in lang/*.json: each template compiles; placeholder integrity (every placeholder of the key is
// in the translation, except English plural endings; none added; side-by-side placeholders stay side by side); every TX text with
// a placeholder, filled with sample values, comes out translated with the values in it (texts that are HTML: their pieces);
// leading emoji kept; empty optional values; values that are themselves pack keys translated; no match on unrelated text; the
// exact lookup unchanged. Then a timing run on a long list of strings (the translator runs on the MutationObserver).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const {createTranslator, compileTemplate, phKind} = require(path.join(ROOT, 'bramblewood-i18n.js'));
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; if(fail < 60) console.log('  ✗', m); } };

const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const PH = /\{(\w+)\}/g;
const PLURAL = /^\{(s\d?|plural_\w+)\}$/;
// keep in step with tools/i18n_refresh.py
const PLURAL_EXTRA = {'This pack has only {v1} card{v2} you can get right now — more are coming soon.': ['{v2}']};
const HTML_VALUED = {'results.maple-leaves': ['{mapleLeafIconHTML}', '{v2}'], 'results.dust': ['{v1}'], 'results.metal': ['{v1}'],
  'results.laurels': ['{v1}'], 'results.cards-opens-next': ['{v1}', '{name}'], 'results.opens-with-the-armoury': ['{v1}', '{name}'],
  'results.dealt': ['{dealt}'], 'results.taken': ['{taken}'], 'results.best-hit': ['{biggestHit}']};
const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u;
const core = s=>{ const t = s.trim(); return t.slice((t.match(LEAD) || [''])[0].length).replace(/[\s:]+$/, ''); };
const phs = s=> s.match(PH) || [];

// sample values: distinct, untranslatable, of the right shape for each placeholder's kind
const WORDS = ['Zorblax', 'Quimby', 'Vantor', 'Pellix', 'Murrow', 'Tazzle', 'Okkam', 'Brindel'];
// (a free-text value glued to a word is, in the game, a tail like " · MVP ..." or "Standard ": give it the space it has there)
function samples(text){
  const v = Object.create(null); let w = 0, num = 7;
  text.replace(/(\p{L})?\{(\w+)\}(?=(\p{L})?)/gu, (m, before, k, after)=>{
    if(k in v) return m;
    const kind = phKind(k);
    v[k] = kind === 'num' ? String(num += 5) : kind === 'plural' ? (k === 'plural_ies' ? 'ies' : k.startsWith('plural_') ? 'them' : 's') : kind === 'rank' ? 'A'
      : (before ? ' · ' : '') + WORDS[w++ % WORDS.length] + (after ? ' ' : '');
    return m;
  });
  return v;
}
const fillEn = (s, v)=> s.replace(PH, (m, k)=> k in v ? v[k] : m);
const literalChunks = s=> s.split(/\{\w+\}/).map(x=> x.trim()).filter(x=> /\p{L}/u.test(x));

const templatesEn = Object.entries(TEXT).filter(([, v])=> /\{\w+\}/.test(v));
ok(templatesEn.length >= 150, `the TEXT table has its placeholder texts (${templatesEn.length})`);

const packs = {};
for(const code of CODES){
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
  packs[code] = pack;
  const misses = [];
  const tr = createTranslator(pack, m=> misses.push(m));
  // compile + integrity, every template key in the pack
  for(const [k, val] of Object.entries(pack)){
    if(!/\{\w+\}/.test(k)) continue;
    ok(compileTemplate(k, val), `${code}: compiles ${k}`);
    const kp = phs(k), vp = phs(val), opt = new Set(kp.filter(p=> PLURAL.test(p)).concat(PLURAL_EXTRA[k] || []));
    kp.forEach(p=> ok(opt.has(p) || vp.includes(p), `${code}: ${p} kept in "${val}" (${k})`));
    vp.forEach(p=> ok(kp.includes(p), `${code}: no unknown ${p} in "${val}"`));
    (k.match(/(?:\{\w+\}){2,}/g) || []).forEach(run=>{ const kept = phs(run).filter(p=> vp.includes(p)).join('');
      ok(phs(kept).length < 2 || val.includes(kept), `${code}: ${run} stays side by side in "${val}"`); });
  }
  // every placeholder text of the game, filled, comes out translated
  for(const [key, en] of templatesEn){
    const cut = HTML_VALUED[key];
    if(cut || en.includes('<')){
      // reaches the page in pieces: each piece with letters is a key (or a template) of its own
      const re = new RegExp('<[^>]+>' + (cut || []).map(p=> '|' + p.replace(/[{}]/g, '\\$&')).join(''));
      en.split(re).filter(b=> /\p{L}/u.test(b.replace(PH, ''))).forEach(b=>{
        const s = fillEn(b, samples(b)), out = tr(s), same = pack[core(b)] === core(b);   // (es "Metal" is "Metal")
        ok(out && (out !== s || same), `${code}: piece "${b}" of ${key} translates (${out})`);
      });
      continue;
    }
    const v = samples(en), s = fillEn(en, v), out = tr(s), tk = core(en);
    ok(pack[tk], `${code}: has the template ${tk}`);
    if(!pack[tk]) continue;
    ok(out && (out !== s || pack[tk] === tk), `${code}: ${key} translates: ${s} -> ${out}`);
    if(!out) continue;
    const tv = pack[tk];
    phs(tv).forEach(p=>{ const k = p.slice(1, -1); if(phKind(k) !== 'plural') ok(out.includes(v[k]), `${code}: ${key} keeps ${p}=${v[k]} in "${out}"`); });
    literalChunks(tv).forEach(c=> ok(out.includes(c.replace(/\s+/g, ' ')), `${code}: ${key} reads "${c}" in "${out}"`));
    const lead = (s.trim().match(LEAD) || [''])[0].trim();
    if(lead && !tk.startsWith('{')) ok(out.trim().startsWith(lead), `${code}: ${key} keeps its leading "${lead}": ${out}`);
  }
  // the exact lookup is unchanged
  let exact = 0;
  for(const [k, val] of Object.entries(pack)){ if(/\{\w+\}/.test(k) || exact > 300) continue; exact++; ok(tr(k) === val, `${code}: exact ${k}`); }
  // values: a map name inside an errand, an English tail after two side-by-side placeholders, an empty value, a leading emoji value
  const map = 'The Old Bramble';
  ok(pack[map] && (tr(`📜 Errand: ${map} — 2/5`) || '').includes(pack[map]), `${code}: a value that is a key translates: ${tr(`📜 Errand: ${map} — 2/5`)}`);
  ok((tr('🔗 It now appears after Zorblax · published') || '').includes(pack['published']), `${code}: "· published" after {v1}{v2}: ${tr('🔗 It now appears after Zorblax · published')}`);
  const bday = tr('🎂 Happy birthday! The Bramblewood left you 300 Gold and 5 Gold Leaves.');
  ok(bday && bday.includes('300') && bday.includes('5') && !/\{\w+\}/.test(bday), `${code}: empty {v1}: ${bday}`);
  const egg = tr('🥚 You found a Ember Egg (Ember Nest)! Set it in a nest in the Nest to warm it.');
  ok(egg && egg.startsWith('🥚') && egg.includes('Ember Egg') && !/\{\w+\}/.test(egg), `${code}: emoji {v1} kept: ${egg}`);
  ok(!/  /.test(tr('Learned Zorblax.') || 'x'), `${code}: no double spaces`);
  // nothing for text no template fits
  ['Rankle the Bold', 'Errand list', 'Welcome to the jungle', 'Melted cheese 4 you', '12 / 30', '', '   '].forEach(s=>
    ok(tr(s) == null || pack[s.trim()], `${code}: "${s}" left alone (${tr(s)})`));
  ok(misses.includes('Welcome to the jungle'), `${code}: an untranslated text is reported as a miss`);
}

// a placeholder next to plural letters, a repeated placeholder (back-reference), numbers only where counts go
{
  const tr = createTranslator({'{n} card{s} added to your collection.': '{n} carte{s} ajoutée{s}.', '{n} over · take {n} out to play': '{n} en trop · retirez-en {n}', 'Lv {n}': 'Niv. {n}', '{v1} Lv {to}': '{v1} Nv {to}'});
  ok(tr('🎁 1 card added to your collection.') === '🎁 1 carte ajoutée.', 'plural ending empty');
  ok(tr('🎁 3 cards added to your collection.') === '🎁 3 cartes ajoutées.', 'plural ending s');
  ok(tr('3 over · take 3 out to play') === '3 en trop · retirez-en 3', 'repeated {n}');
  ok(tr('3 over · take 4 out to play') == null, 'repeated {n} must be the same value');
  ok(tr('Lv 3') === 'Niv. 3' && tr('Fox Lv 3') === 'Fox Nv 3', 'the most specific template wins');
  ok(tr('Lv many') == null, '{n} only takes a number');
}

// timing: a long list of what a big page holds, in each of the 12 packs, uncached (first sight of each string)
{
  const pack = packs.fr, list = [];
  const plainKeys = Object.keys(pack).filter(k=> !/\{\w+\}/.test(k));
  for(let i = 0; i < 4; i++) plainKeys.forEach(k=> list.push(k + (i ? ' ' + i : '')));     // exact hits, and near misses
  templatesEn.forEach(([, en], i)=>{ for(let j = 0; j < 20; j++) list.push(fillEn(en, Object.fromEntries(phs(en).map((p, x)=> [p.slice(1, -1), String(j * 7 + x + i)])))); });
  const vocab = templatesEn.map(([, en])=> en.replace(PH, '').split(/\s+/)).flat().filter(w=> /\p{L}{3}/u.test(w));
  for(let i = 0; i < 6000; i++){ const w = []; for(let j = 0; j < 4 + i % 9; j++) w.push(vocab[(i * 31 + j * 17) % vocab.length]); list.push(w.join(' ')); }
  let t0 = process.hrtime.bigint();
  const trs = CODES.map(c=> createTranslator(packs[c]));
  const compileMs = Number(process.hrtime.bigint() - t0) / 1e6 / CODES.length;
  t0 = process.hrtime.bigint();
  let hits = 0; for(const s of list) if(trs[0](s)) hits++;
  const firstMs = Number(process.hrtime.bigint() - t0) / 1e6;
  t0 = process.hrtime.bigint();
  for(const s of list) trs[0](s);
  const cachedMs = Number(process.hrtime.bigint() - t0) / 1e6;
  console.log(`  timing: compile ${compileMs.toFixed(1)} ms per pack; ${list.length} strings: ${firstMs.toFixed(0)} ms first sight (${(firstMs * 1000 / list.length).toFixed(1)} µs each, ${hits} translated), ${cachedMs.toFixed(0)} ms again`);
  ok(compileMs < 100, `compiling a pack's templates is quick (${compileMs.toFixed(1)} ms)`);
  ok(firstMs * 1000 / list.length < 100, `under 100 µs a string on first sight (${(firstMs * 1000 / list.length).toFixed(1)})`);
}

console.log(fail ? `i18n templates: ${fail}/${n} FAILED` : `i18n templates: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
