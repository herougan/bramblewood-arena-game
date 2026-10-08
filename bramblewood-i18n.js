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
if(typeof window === 'undefined' || typeof document === 'undefined'){
  const passthrough = (s, v)=> v ? String(s).replace(/\{(\w+)\}/g, (m, k)=> v[k] != null ? v[k] : m) : s;
  if(typeof module !== 'undefined' && module.exports) module.exports = {i18: passthrough};
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
// Translate a visible string: exact match first, then with leading emoji/symbols and trailing
// spaces/colons peeled off and put back.
const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u;
function translateText(s){
  if(!pack || !s) return null;
  const trimmed = s.trim(); if(!trimmed) return null;
  if(pack[trimmed]) return s.replace(trimmed, pack[trimmed]);
  const lead = (trimmed.match(LEAD) || [''])[0];
  const core = trimmed.slice(lead.length).replace(/[\s:]+$/, '');
  if(core && pack[core]) return s.replace(core, pack[core]);
  if(core && /\p{L}{2}/u.test(core) && core.length < 120) misses.add(core);
  return null;
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
  _boot(){ const c = load(); if(c !== 'en') set(c); else document.documentElement.lang = 'en'; },
};
root.BramblewoodI18n = api;
root.i18 = i18;
})(typeof window !== 'undefined' ? window : globalThis);
