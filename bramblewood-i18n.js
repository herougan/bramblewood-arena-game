// Translation layer (2026-10-05, "support the major European languages, Tagalog, Tamil, Bahasa,
// Chinese (both), Japanese and Korean"). English is the source language and the fallback.
//
// Two ways text gets translated:
//  • i18(english, vars) in code — for sentences with numbers or names in them:
//      i18('Need {n} more 🍁', {n: 3})
//  • A page-level translator — while a non-English language is active it watches the page and
//    swaps any text node, title, aria-label or placeholder whose English text (ignoring leading
//    emoji/symbols and surrounding spaces) is in the language pack. Labels and buttons therefore
//    translate without touching the code that renders them. Anything inside [translate="no"],
//    inputs and textareas is left alone. Card names (.nm) translate too since 2026-10-08 (user: "Translate card names").
//
// Packs: lang/<code>.json, {"English text": "translation"}. The build turns each into
// assets/lang/<code>.js (loaded on demand) or inlines them all with BW_INLINE=1. Missing strings
// stay English; window.BramblewoodI18n.misses() lists what was seen but not translated.
(function(root){
'use strict';
// Translate a visible string: exact match first, then with leading emoji/symbols and trailing
// spaces/colons peeled off and put back.
const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u;

// Templates (2026-10-18, package I1: the 159 game texts with a {placeholder} stayed English in every language. TX() fills
// them in English before they reach the page, and "Errand: Fox Hunt — 2/5" never matches the pack key "Errand: {title} — {v}/{g}").
// Every pack key with a {placeholder} is compiled once per pack into an anchored regex: the literal text escaped, each {x} a
// lazy capture (digits only for counts, a few letters for English plural endings, a capital-letter grade for ranks; a repeated
// {x} is a back-reference). A text the exact lookup misses is tried against only the templates whose rarest literal word it
// contains (a Map lookup per word, so it stays cheap on the MutationObserver), first on its core (leading emoji peeled, as the
// packs' keys are), then whole. A match fills the translated template with the captured values, and each value is looked up on
// its own as well, so a card, map or item name inside the sentence translates too. Results are cached per string.
// Plain functions, no DOM, so tests/i18n-templates-2026-10-18.js runs the same code in node.
const PH = /\{(\w+)\}/g;
const NUM_PH = new Set(('n max count copies cards index total step length floor best dust gold gems cap open played wins losses e v g of nth ' +
  'after to price net sellPrice dealt taken biggestHit rounds energyMax mvpDamage raidPoints currentRaidPoints currentEnergy hqHp ' +
  'pvpTicketsLeft raidRemainingAfter raidInk raidMinDamage raidRatingDelta pvpRatingDelta liveRatingDelta gauntletBestAfter ' +
  'gauntletStreakAfter dungeonStageReached dungeonStageAfter dungeonDeckLeft dungeonTicketsLeft conquestKibbleEarned ' +
  'conquestFoodEarned toLocaleString').split(' '));
function phKind(k){
  if(/^s\d?$|^plural_/.test(k)) return 'plural';                  // English plural endings: s, ies, them, were
  if(/Rank/.test(k)) return 'rank';                                 // S, A, B, F, FF...
  return NUM_PH.has(k) || /^[A-Z][A-Z0-9_]+$/.test(k) ? 'num' : 'any';  // counts and the game's constants (DECK_SIZE...)
}
const PH_PAT = {num:'([+\\-−]?\\d(?:[\\d,.\'\\u00a0\\u202f]*\\d)?)', plural:'(\\p{L}{0,4})', rank:'([A-Z][A-Z+]{0,3})', any:'([^]*?)'};
const WORD = /\p{L}+/gu;
const reEsc = s=> s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
function compileTemplate(key, value){
  const parts = key.split(/(\{\w+\})/);   // even: literal text, odd: {placeholder}
  const names = [], group = Object.create(null);   // (not {}: a placeholder can be called {toLocaleString})
  let src = '^', lit = 0, anchor = '', glued = '';
  for(let i = 0; i < parts.length; i++){
    const p = parts[i];
    if(i % 2){
      const k = p.slice(1, -1);
      if(group[k]) src += '\\' + group[k];
      else { names.push(k); group[k] = names.length; src += '\u0000' + phKind(k) + '\u0001'; }
      continue;
    }
    if(!p) continue;
    const prevPh = i > 0, nextPh = i < parts.length - 1;
    // spaces: any run of whitespace; next to a placeholder optional, since the value may be empty ("{v1} You found...")
    src += p.split(/(\s+)/).map((t, j, a)=> j % 2 ? (((j === 1 && !a[0] && prevPh) || (j === a.length - 2 && !a[a.length - 1] && nextPh)) ? '\\s*' : '\\s+') : reEsc(t)).join('');
    lit += p.replace(/\s+/g, '').length;
    // the anchor: the longest literal word not glued to a placeholder ("card{s}" is no anchor: on screen it reads "cards").
    // A template with only glued words ("{rounds} rounds{v2}{v3}") takes one anyway: its values start with a space or are empty.
    let m; WORD.lastIndex = 0;
    while((m = WORD.exec(p))){
      const g = (m.index === 0 && prevPh) || (m.index + m[0].length === p.length && nextPh);
      if(g){ if(m[0].length > glued.length) glued = m[0]; }
      else if(m[0].length > anchor.length) anchor = m[0];
    }
  }
  anchor = anchor || glued;
  if(!anchor || !names.length) return null;
  // a template with little text of its own ("vs {liveOpponentName}") takes only a name-sized value, not any sentence starting "vs "
  src = src.replace(/\u0000(\w+)\u0001/g, (m, kind)=> kind === 'any' && lit < 6 ? '([^]{0,32}?)' : PH_PAT[kind]);
  try{ return {key, value, names, re: new RegExp(src + '$', 'u'), anchor, lit}; }catch(e){ return null; }
}
// 2026-10-23 (package SX, owner I2 "Template change"): opts.locale (the pack's language) makes the templates number-aware: a count
// written the English way with a thousands comma or a decimal point ("4,000", "2.5") is filled into the translation the language's
// own way (Intl.NumberFormat: "4 000", "4.000", "2,5"). Plain counts ("12") are left as they are. Without a locale nothing changes.
function localNum(v, locale){
  if(!locale || typeof Intl === 'undefined') return v;
  const m = /^([+\-−]?)(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+)$/.exec(v); if(!m) return v;
  const dec = (m[2].split('.')[1] || '').length;
  try{ return m[1] + new Intl.NumberFormat(locale, {maximumFractionDigits: dec, minimumFractionDigits: dec}).format(Number(m[2].replace(/,/g, ''))); }catch(e){ return v; }
}
function createTranslator(pack, onMiss, opts){
  const index = new Map(), cache = new Map(), locale = opts && opts.locale || null;
  let count = 0;
  for(const key in pack){
    if(key.indexOf('{') < 0 || typeof pack[key] !== 'string') continue;
    const t = compileTemplate(key, pack[key]); if(!t) continue;
    let arr = index.get(t.anchor); if(!arr) index.set(t.anchor, arr = []);
    arr.push(t); count++;
  }
  const get = k=>{ const v = pack[k]; return typeof v === 'string' ? v : null; };   // (pack is a plain object: no "constructor")
  // a captured value: a card, map or item name, or an English tail such as " · published" or ". Journey complete!"
  function piece(v, deep){
    if(!v || !/\p{L}/u.test(v)) return v;
    if(get(v)) return get(v);
    const lead = v.match(/^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍·•—–,.:;+]*/u)[0];
    const core = v.slice(lead.length).replace(/\s+$/, '');
    if(core && get(core)) return lead + get(core) + v.slice(lead.length + core.length);
    // one level down: a value that is itself a filled game text ("{rounds} rounds{v2}" holds " · MVP 🦊 Fox (30 damage)")
    const t = deep && core ? viaTemplates(core, false) : null;
    return t != null ? lead + t + v.slice(lead.length + core.length) : null;
  }
  // two placeholders side by side ("after {v1}{v2}") can't be told apart, so the last one may hold "Fox · published":
  // a value that isn't a key as a whole is tried piece by piece between separators
  function value(v, deep){
    const w = piece(v, deep); if(w != null) return w;
    const bits = v.split(/(\s[·—–]\s|[.!?,;:]\s)/);
    return bits.length > 1 ? bits.map((b, i)=> i % 2 ? b : (piece(b, deep) || b)).join('') : v;
  }
  function viaTemplates(str, deep){
    if(!count || str.length > 400) return null;
    const words = str.match(WORD); if(!words) return null;
    let best = null, bestM = null; const seen = new Set();
    for(const w of words){
      const arr = index.get(w); if(!arr) continue;
      for(const t of arr){
        if(seen.has(t)) continue; seen.add(t);
        if(best && (t.lit < best.lit || (t.lit === best.lit && t.names.length >= best.names.length))) continue;
        const m = t.re.exec(str); if(m){ best = t; bestM = m; }
      }
    }
    if(!best) return null;
    const vals = Object.create(null); best.names.forEach((k, i)=>{ vals[k] = bestM[i + 1]; });
    return best.value.replace(PH, (m, k)=> k in vals ? (phKind(k) === 'plural' ? vals[k] : phKind(k) === 'num' ? localNum(vals[k], locale) /* SX */ : value(vals[k], deep)) : m).replace(/ {2,}/g, ' ').trim();
  }
  return function translate(s){
    if(!s) return null;
    const trimmed = s.trim(); if(!trimmed) return null;
    if(get(trimmed)) return s.replace(trimmed, get(trimmed));
    const lead = (trimmed.match(LEAD) || [''])[0];
    const core = trimmed.slice(lead.length).replace(/[\s:]+$/, '');
    if(core && get(core)) return s.replace(core, get(core));
    if(!core) return null;
    let out = cache.get(s);
    if(out === undefined){
      let t = viaTemplates(core, true), part = core;
      if(t == null && core !== trimmed){ t = viaTemplates(trimmed, true); part = trimmed; }
      out = t == null ? null : s.replace(part, ()=> t);
      if(cache.size > 5000) cache.clear();
      cache.set(s, out);
    }
    if(out == null && onMiss && /\p{L}{2}/u.test(core) && core.length < 120) onMiss(core);
    return out;
  };
}

if(typeof window === 'undefined' || typeof document === 'undefined'){
  const passthrough = (s, v)=> v ? String(s).replace(/\{(\w+)\}/g, (m, k)=> v[k] != null ? v[k] : m) : s;
  if(typeof module !== 'undefined' && module.exports) module.exports = {i18: passthrough, createTranslator, compileTemplate, phKind, localNum};
  return;
}

const LANGS = [
  {code:'en', name:'English', native:'English', flag:'🇬🇧'},
  {code:'fr', name:'French', native:'Français', flag:'🇫🇷'},
  {code:'de', name:'German', native:'Deutsch', flag:'🇩🇪'},
  {code:'es', name:'Spanish', native:'Español', flag:'🇪🇸'},
  {code:'it', name:'Italian', native:'Italiano', flag:'🇮🇹'},
  {code:'pt', name:'Portuguese', native:'Português', flag:'🇵🇹'},
  {code:'tl', name:'Tagalog', native:'Tagalog', flag:'🇵🇭'},
  {code:'ta', name:'Tamil', native:'தமிழ்', flag:'🇮🇳'},
  {code:'id', name:'Indonesian', native:'Bahasa Indonesia', flag:'🇮🇩'},
  {code:'zh-Hans', name:'Chinese (Simplified)', native:'简体中文', flag:'🇨🇳'},
  {code:'zh-Hant', name:'Chinese (Traditional)', native:'繁體中文', flag:'🇹🇼'},
  {code:'ja', name:'Japanese', native:'日本語', flag:'🇯🇵'},
  {code:'ko', name:'Korean', native:'한국어', flag:'🇰🇷'},
];
// Script fonts, fetched only when that language is picked. Google Fonts serves CJK in small
// unicode-range slices, so only the characters actually on screen are downloaded.
const FONTS = {
  'ta': {css:'https://fonts.googleapis.com/css2?family=Baloo+Thambi+2:wght@500;700;800&display=swap', stack:"'Baloo Thambi 2','Baloo 2','Noto Sans Tamil','Latha',system-ui,sans-serif"},
  'zh-Hans': {css:'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@500;700;800&display=swap', stack:"'Baloo 2','Noto Sans SC','PingFang SC','Microsoft YaHei',system-ui,sans-serif"},
  'zh-Hant': {css:'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;700;800&display=swap', stack:"'Baloo 2','Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif"},
  'ja': {css:'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700;800&display=swap', stack:"'Baloo 2','Noto Sans JP','Hiragino Sans','Yu Gothic',system-ui,sans-serif"},
  'ko': {css:'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500;700;800&display=swap', stack:"'Baloo 2','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif"},
};
// 2026-10-18 (roadmap P6): the desktop build ships these fonts (electron/fonts → fonts/script/<code>.css, subset to the
// packs' characters) so they work offline. The website keeps Google Fonts, so it gains no bytes. If the local CSS is
// missing (an unstaged dev copy), the link swaps to the Google URL.
if(location.protocol === 'app:' || /\bElectron\//.test(navigator.userAgent || '')){
  for(const c in FONTS){ FONTS[c].web = FONTS[c].css; FONTS[c].css = 'fonts/script/' + c + '.css'; }
  document.addEventListener('error', e=>{ const l = e.target, f = l && l.dataset && FONTS[l.dataset.langFont];
    if(l.tagName === 'LINK' && f && l.href.indexOf(f.web) < 0) l.href = f.web; }, true);
}
const KEY = 'bramblewood_lang_v1';
const PACK_URLS = (()=>{ try{ return JSON.parse('__LANG_PACK_URLS__'); }catch(e){ return {}; } })();
window.BW_LANG_PACKS = window.BW_LANG_PACKS || {};

let lang = 'en', pack = null;
const misses = new Set();
const originals = new WeakMap();   // text node / element -> {text|attrs} in English
const wroteAttr = new WeakMap();
const wrote = new WeakMap();       // text node -> the value this module itself last wrote (so its own edits aren't mistaken for new English)
function load(){ try{ const v = localStorage.getItem(KEY); return LANGS.some(l=> l.code===v) ? v : 'en'; }catch(e){ return 'en'; } }

function fill(s, vars){ return vars ? String(s).replace(/\{(\w+)\}/g, (m, k)=> vars[k] != null ? vars[k] : m) : s; }
function i18(english, vars){
  if(lang !== 'en' && pack){
    const hit = pack[english];
    if(hit) return fill(hit, vars);
    misses.add(english);
  }
  return fill(english, vars);
}
// The lookups (exact, core, templates) live in createTranslator() above; one translator per loaded pack (2026-10-18, I1).
let tr = null, trPack = null;
function translateText(s){
  if(!pack || !s) return null;
  if(trPack !== pack){ trPack = pack; tr = createTranslator(pack, c=> misses.add(c), {locale: lang}); } // + locale: numbers the language's way (SX)
  return tr(s);
}
const ATTRS = ['title', 'aria-label', 'placeholder', 'data-tip'];
function skip(el){ return !el || el.closest && el.closest('[translate="no"], input, textarea, script, style, .no-i18n'); }
function walk(rootNode){
  if(!rootNode) return;
  const els = rootNode.nodeType === 1 ? [rootNode, ...rootNode.querySelectorAll('*')] : [];
  // text nodes
  const tw = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
  let n; while((n = tw.nextNode())){
    if(skip(n.parentElement)) continue;
    let orig = originals.get(n);
    // first sight, or the game rewrote it since we last did: what's there now is the English
    if(orig == null || (wrote.has(n) ? wrote.get(n) !== n.nodeValue : orig !== n.nodeValue && lang === 'en')){ orig = n.nodeValue; originals.set(n, orig); }
    const out = lang === 'en' ? orig : (translateText(orig) || orig);
    if(n.nodeValue !== out){ n.nodeValue = out; wrote.set(n, out); }
  }
  els.forEach(el=>{
    if(skip(el)) return;
    ATTRS.forEach(a=>{
      if(!el.hasAttribute(a)) return;
      let o = originals.get(el); if(!o){ o = {}; originals.set(el, o); }
      let w = wroteAttr.get(el); if(!w){ w = {}; wroteAttr.set(el, w); }
      const now = el.getAttribute(a);
      if(!(a in o) || (a in w ? w[a] !== now : o[a] !== now)) o[a] = now;
      const out = lang === 'en' ? o[a] : (translateText(o[a]) || o[a]);
      if(now !== out){ el.setAttribute(a, out); w[a] = out; } else if(a in w) w[a] = now;
    });
  });
}
let observer = null, applying = false;
function observe(){
  if(observer) return;
  observer = new MutationObserver(muts=>{
    if(applying || lang === 'en') return;
    applying = true;
    try{
      muts.forEach(m=>{
        const fresh = nd=>{ // a text node the game just wrote (not one we translated)
          if(skip(nd.parentElement) || wrote.get(nd) === nd.nodeValue) return;
          originals.set(nd, nd.nodeValue); const o = translateText(nd.nodeValue); if(o){ nd.nodeValue = o; wrote.set(nd, o); }
        };
        if(m.type === 'childList') m.addedNodes.forEach(nd=>{ if(nd.nodeType === 1) walk(nd); else if(nd.nodeType === 3) fresh(nd); });
        else if(m.type === 'characterData' && m.target.nodeType === 3) fresh(m.target);
      });
    } finally { applying = false; }
  });
  observer.observe(document.body, {childList:true, subtree:true, characterData:true});
}
function setFont(code){
  const f = FONTS[code];
  let st = document.getElementById('bwLangFont');
  if(!f){ if(st) st.remove(); return; }
  if(!document.querySelector(`link[data-lang-font="${code}"]`)){
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = f.css; l.dataset.langFont = code; document.head.appendChild(l);
  }
  if(!st){ st = document.createElement('style'); st.id = 'bwLangFont'; document.head.appendChild(st); }
  // Every element gets the script font as a fallback after its Latin face, so Latin keeps its look.
  st.textContent = `html[lang="${code}"] body, html[lang="${code}"] body *:not(.card-art-img){font-family:${f.stack} !important;}`;
}
function loadPack(code){
  return new Promise(res=>{
    if(code === 'en' || window.BW_LANG_PACKS[code]) return res(window.BW_LANG_PACKS[code] || null);
    const url = PACK_URLS[code]; if(!url) return res(null);
    const s = document.createElement('script'); s.src = url; s.async = true;
    s.onload = ()=> res(window.BW_LANG_PACKS[code] || null); s.onerror = ()=> res(null);
    document.head.appendChild(s);
  });
}
const listeners = [];
async function set(code){
  if(!LANGS.some(l=> l.code === code)) code = 'en';
  const p = await loadPack(code);
  lang = (code === 'en' || p) ? code : 'en'; pack = lang === 'en' ? null : p;
  try{ localStorage.setItem(KEY, lang); }catch(e){}
  document.documentElement.lang = lang;
  setFont(lang);
  applying = true; try{ walk(document.body); } finally { applying = false; }
  if(lang !== 'en') observe();
  listeners.forEach(fn=>{ try{ fn(lang); }catch(e){} });
  return lang;
}
const api = {
  LANGS, i18, set, current: ()=> lang, onChange: fn=> listeners.push(fn),
  misses: ()=> [...misses].sort(), translateNow: ()=>{ applying = true; try{ walk(document.body); } finally { applying = false; } },
  // 2026-10-18 (package I3): for code that splits a text before the page sees it whole — keyword marking (<b class="kw">) in card
  // ability lines and emoji pictures (<img class="tw-emoji">) in the middle of a sentence leave pieces no pack key matches.
  // translate(s): the translation of one visible string, or null (English, or no key). translateTextNode(n): translate a text
  // node in place now, remembering its English as the observer would, so splitting it afterwards keeps the translation.
  translate: s=> lang === 'en' ? null : translateText(s),
  translateTextNode(n){
    if(lang === 'en' || !n || n.nodeType !== 3 || skip(n.parentElement) || wrote.get(n) === n.nodeValue) return;
    originals.set(n, n.nodeValue); const o = translateText(n.nodeValue); if(o){ n.nodeValue = o; wrote.set(n, o); }
  },
  _boot(){ const c = load(); if(c !== 'en') set(c); else document.documentElement.lang = 'en'; },
};
root.BramblewoodI18n = api;
root.i18 = i18;
})(typeof window !== 'undefined' ? window : globalThis);
