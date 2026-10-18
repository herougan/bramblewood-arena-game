#!/usr/bin/env node
// 2026-10-18 (package I3, UI translations): after I1/I2 the packs covered every TX() text and card name, but most fixed UI text,
// the NPC lines, errands, card flavour and skill texts stayed English. Their translations live in lang/ui/<code>.json (harvested by
// tools/i18n_ui.py), merged into each built pack by assemble_arena.py (lang/cards and the main pack win a clash). Covers:
//   1. a lang/ui file for each of the 12 languages; each parses and is a flat {"English": "translation"} of non-empty strings;
//   2. placeholders intact: every {x} of the key is in the translation (English plural endings {s}, {s2}... may go), none added,
//      side-by-side placeholders stay side by side; emoji in the key are kept in the translation;
//   3. no key that isn't in the source: each literal piece of a key (between placeholders) is in arena_app.js or a card's flavour;
//   4. the build merges them (assemble_arena.py reads lang/ui; each built assets/lang/<code>.js has the ui keys, main pack winning);
//   5. the page translator turns a filled-in UI text into its translation (keys with placeholders, as templates);
//   6. the hooks for text that is cut up before the page sees it: BramblewoodI18n.translate / translateTextNode, and arena_app.js
//      calls them from keywordizeHTML, EmojiStyle (swapText, htmlBlock) through i18nHtmlText; the Codex tile cache keys on the language.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const {createTranslator, phKind} = require(path.join(ROOT, 'bramblewood-i18n.js'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; if(fail < 60) console.log('  ✗', m); } };
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readJSON = rel=> JSON.parse(read(rel));
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
const PH = /\{\w+\}/g, phs = s=> s.match(PH) || [];
const OPTIONAL = /^\{s\d*\}$/;
const EMOJI = /\p{Extended_Pictographic}/gu;

// the source text: arena_app.js with its string escapes undone and HTML entities decoded, plus the cards' flavour lines
const app = read('arena_app.js');
const unesc = s=> s.replace(/\\u\{([0-9a-fA-F]+)\}/g, (m, h)=> String.fromCodePoint(parseInt(h, 16))).replace(/\\u([0-9a-fA-F]{4})/g, (m, h)=> String.fromCharCode(parseInt(h, 16)))
  .replace(/\\x([0-9a-fA-F]{2})/g, (m, h)=> String.fromCharCode(parseInt(h, 16))).replace(/\\(['"`\\$])/g, '$1');
const ent = s=> s.replace(/&(amp|lt|gt|quot|#39|#x27|nbsp|middot|mdash|ndash|hellip|times|rarr|larr|minus);/g, (m, e)=> ({amp:'&', lt:'<', gt:'>', quot:'"', '#39':"'", '#x27':"'",
  nbsp:' ', middot:'·', mdash:'—', ndash:'–', hellip:'…', times:'×', rarr:'→', larr:'←', minus:'−'})[e]).replace(/&#(\d+);/g, (m, d)=> String.fromCodePoint(+d));
const flav = readJSON('canonical/cards.json').map(c=> c.flavor || '').join('\n');
const corpus = [app, unesc(app), ent(unesc(app)), flav].join('\n');

const dir = path.join(ROOT, 'lang', 'ui');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f=> f.endsWith('.json')).sort() : [];
ok(CODES.every(c=> files.includes(c + '.json')), `a lang/ui file for each of the 12 languages (${files.join(', ')})`);
ok(files.every(f=> CODES.includes(f.slice(0, -5))), `no stray lang/ui files (${files.join(', ')})`);

const asm = read('assemble_arena.py');
ok(/lang\/ui\/%s\.json/.test(asm), 'assemble_arena.py merges lang/ui/<code>.json');
ok(asm.indexOf('lang/ui/%s.json') < asm.indexOf('lang/cards/%s.json" % _code, SCRATCH + "lang/%s.json'), 'lang/ui merges first (cards and the main pack win a clash)');

const notInSource = new Map();   // key -> 1, checked once across languages
const inSource = k=>{
  if(notInSource.has(k)) return notInSource.get(k);
  const pieces = k.split(/\{\w+\}/).map(p=> p.trim()).filter(p=> /\p{L}{2}/u.test(p));
  const r = pieces.every(p=> corpus.includes(p));
  notInSource.set(k, r); return r;
};
let total = 0;
const packs = {};
for(const code of CODES){
  const f = code + '.json';
  if(!files.includes(f)) continue;
  let ui;
  try{ ui = readJSON('lang/ui/' + f); }catch(e){ ok(false, `lang/ui/${f} parses (${e.message})`); continue; }
  ok(ui && typeof ui === 'object' && !Array.isArray(ui), `lang/ui/${f} is an object`);
  const entries = Object.entries(ui); total += entries.length;
  const empty = entries.filter(([k, v])=> typeof v !== 'string' || !v.trim());
  ok(!empty.length, `lang/ui/${f}: every translation is a non-empty string (${empty.slice(0, 3).map(e=> e[0]).join(' | ')})`);
  const badPh = [], badEmoji = [], stray = [];
  for(const [k, v] of entries){
    if(typeof v !== 'string') continue;
    const kp = new Set(phs(k)), vp = new Set(phs(v));
    const missing = [...kp].filter(p=> !vp.has(p) && !OPTIONAL.test(p)), extra = [...vp].filter(p=> !kp.has(p));
    let split = false;
    for(const run of k.match(/(?:\{\w+\}){2,}/g) || []){ const kept = phs(run).filter(p=> vp.has(p)).join(''); if(kept.split('{').length > 2 && !v.includes(kept)) split = true; }
    if(missing.length || extra.length || split) badPh.push(`${k} => ${v} (${missing.concat(extra).join(' ')}${split ? ' split' : ''})`);
    const ke = (k.match(EMOJI) || []).sort().join(''), ve = (v.match(EMOJI) || []).sort().join('');
    if(ke && ![...new Set(k.match(EMOJI))].every(e=> v.includes(e))) badEmoji.push(`${k} => ${v}`);
    if(!inSource(k)) stray.push(k);
  }
  ok(!badPh.length, `lang/ui/${f}: placeholders intact (${badPh.length}: ${badPh.slice(0, 3).join(' || ')})`);
  ok(!badEmoji.length, `lang/ui/${f}: emoji kept (${badEmoji.length}: ${badEmoji.slice(0, 3).join(' || ')})`);
  ok(!stray.length, `lang/ui/${f}: every key is text from the source (${stray.length}: ${stray.slice(0, 3).join(' | ')})`);
  const main = fs.existsSync(path.join(ROOT, 'lang', f)) ? readJSON('lang/' + f) : {};
  const cards = fs.existsSync(path.join(ROOT, 'lang', 'cards', f)) ? readJSON('lang/cards/' + f) : {};
  packs[code] = Object.assign({}, ui, cards, main);
  // the built pack carries them, main pack winning
  const built = path.join(ROOT, 'assets', 'lang', code + '.js');
  if(fs.existsSync(built)){
    const w = {BW_LANG_PACKS: {}};
    new Function('window', fs.readFileSync(built, 'utf8'))(w);
    const b = w.BW_LANG_PACKS[code] || {};
    const notBuilt = Object.keys(ui).filter(k=> !(k in b));
    ok(!notBuilt.length, `${code}: built pack has every lang/ui key (${notBuilt.length} missing: ${notBuilt.slice(0, 3).join(' | ')}) - rebuild?`);
    const clash = Object.keys(ui).filter(k=> k in main && b[k] !== main[k]);
    ok(!clash.length, `${code}: the main pack wins a clash in the built pack (${clash.slice(0, 3).join(' | ')})`);
  } else ok(false, `assets/lang/${code}.js exists (run the build)`);
}
ok(total > 0, `lang/ui holds translations (${total})`);

// 5. filled-in texts come out translated (a sample of each language's keys with placeholders)
const WORDS = ['Zorblax', 'Quimby', 'Vantor', 'Pellix', 'Murrow', 'Tazzle'];
for(const code of Object.keys(packs)){
  const ui = readJSON('lang/ui/' + code + '.json'), tr = createTranslator(packs[code]);
  const tpl = Object.keys(ui).filter(k=> /\{\w+\}/.test(k) && !/^\{\w+\}$/.test(k.trim()));
  let hit = 0, tried = 0; const misses = [];
  for(const k of tpl.filter((k, i)=> i % 7 === 0)){
    const vals = {}; let w = 0, n = 3;
    phs(k).forEach(p=>{ const nm = p.slice(1, -1); if(nm in vals) return; vals[nm] = OPTIONAL.test(p) ? 's' : phKind(nm) === 'num' ? String(n += 4) : String(n += 4); });
    const filled = k.replace(/\{(\w+)\}/g, (m, nm)=> vals[nm]);
    if(packs[code][filled] != null) continue;   // the filled text is itself a key
    tried++;
    const out = tr(filled);
    const want = ui[k].replace(/\{(\w+)\}/g, (m, nm)=> vals[nm] != null ? vals[nm] : m).replace(/ {2,}/g, ' ').trim();
    if(out != null && out.trim() === want) hit++; else misses.push(`${filled} -> ${out}`);
  }
  // (a template can lose to a longer one that also matches; most must come through)
  ok(!tried || hit / tried >= 0.85, `${code}: filled UI texts translate as templates (${hit}/${tried}; e.g. ${misses.slice(0, 2).join(' || ')})`);
}

// 6. the hooks
const i18nSrc = read('bramblewood-i18n.js');
ok(/translate: s=> lang === 'en' \? null : translateText\(s\)/.test(i18nSrc), 'BramblewoodI18n.translate(s)');
ok(/translateTextNode\(n\)\{/.test(i18nSrc), 'BramblewoodI18n.translateTextNode(n)');
ok(/function i18nHtmlText\(seg\)/.test(app), 'arena_app.js: i18nHtmlText()');
ok(/seg = i18nHtmlText\(seg\);/.test(app.slice(app.indexOf('function keywordizeHTML('), app.indexOf('function keywordizeLines('))), 'keywordizeHTML translates each stretch of text before marking keywords');
const emo = app.slice(app.indexOf('var EmojiStyle = (function(){'), app.indexOf('const textOf = el=>'));
ok(/translateTextNode\(t\)/.test(emo) && /i18nHtmlText\(p\)/.test(emo), 'EmojiStyle translates a sentence before cutting it around emoji pictures (swapText, htmlBlock)');
ok(/tileEnv = [^\n]*BramblewoodI18n\.current\(\)/.test(app), 'the Codex tile cache keys on the language');
// i18nHtmlText round trip with a stub translator
{
  const fnSrc = app.slice(app.indexOf('function i18nHtmlText(seg){'), app.indexOf('// Emoji style (2026-10-14; bundled 2026-10-17)'));
  const win = {BramblewoodI18n: {current: ()=> 'de', translate: s=> s === 'Rock & "Roll" <3' ? 'Fels & „Roll“ <3' : null}};
  const f = new Function('window', fnSrc + '; return i18nHtmlText;')(win);
  ok(f('Rock &amp; &quot;Roll&quot; &lt;3') === 'Fels &amp; „Roll“ &lt;3', `i18nHtmlText unescapes, translates and escapes again (${f('Rock &amp; &quot;Roll&quot; &lt;3')})`);
  ok(f('Nothing here') === 'Nothing here', 'i18nHtmlText leaves a text without a translation alone');
  win.BramblewoodI18n.current = ()=> 'en';
  ok(f('Rock &amp; &quot;Roll&quot; &lt;3') === 'Rock &amp; &quot;Roll&quot; &lt;3', 'i18nHtmlText does nothing in English');
}

console.log(`${checks - fail}/${checks} i18n UI checks passed (${total} translations in lang/ui)`);
process.exit(fail ? 1 : 0);
