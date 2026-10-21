#!/usr/bin/env node
// chips_inventory.js: the inventory of every chip and effect the game can show on a card or unit, read from the source.
// 2026-10-21 (package HC, owner: "Status chips: in Master Hub, let me know all the status chips and context chips (e.g. flying)
// available and context fx (like blind) available. Maybe we can drop some of them.").
//
//   node tools/hub/chips_inventory.js            writes docs/chips-inventory.json (the hub's "Chips & FX" tab reads it)
//   node tools/hub/chips_inventory.js --check    exits 1 when the committed JSON is out of date (ignores the date)
//   node tools/hub/chips_inventory.js --print    prints a short table instead of writing
//
// Nothing here is typed by hand: arena_app.js is read as text, and the tables that define the chips (STATUS_KEYWORDS,
// LIVE_STATUS_ROWS, SKILL_ICON, PASSIVE_DEFS / SKILL_DEFS, SKILL_TEXT ...) are run in a sandbox (node:vm) so their words and
// icons are the game's own. The chip code (the abadge pushes, abilityBadges, boardCardHTML) is read with a small JS-aware
// scanner. Card counts come from canonical/cards.json. Three kinds:
//   status   what a unit on the board is suffering or carrying right now (the pills along the top edge of a board card, the
//            live-status lines under its skills, the coloured keyword glossary words)
//   chip     a skill or ability mark on the card face (the strip along its bottom edge: Flying, Tide, Poison ...)
//   fx       a visual state on a unit or the battlefield (tint classes, status overlays, plates, wings, darkness ...)
// "Cards" = cards in canonical/cards.json (not test cards, not tokens) that carry the skill (or trigger action) that causes it.
// A status counts the cards with a skill whose name the status word matches ("Poison" -> Poison, Poison Bolt, Poison Gas);
// statuses that field cards, weather or other statuses give are not counted (cards: 0 there means "no card names it").
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'docs', 'chips-inventory.json');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const APP = read('arena_app.js'), TPL = read('arena_template.html');
const lineOf = (s, i) => { let n = 1; for (let k = s.indexOf('\n'); k !== -1 && k < i; k = s.indexOf('\n', k + 1)) n++; return n; };
const L = i => lineOf(APP, i);
const warnings = [];

// ---------- a JS-aware scanner: the end of the statement that starts at i (a ';' at depth 0, or a bare block's closing brace) ----------
function stmtEnd(s, i){
  const stack = []; let k = i; const n = s.length;
  const prevSig = () => { let j = k - 1; while (j >= i && /\s/.test(s[j])) j--; return j >= i ? s[j] : ''; };
  const readStr = q => { k++; while (k < n){ if (s[k] === '\\'){ k += 2; continue; } if (s[k] === q){ k++; return; } k++; } };
  const readTpl = () => { k++; while (k < n){ const c = s[k]; if (c === '\\'){ k += 2; continue; } if (c === '`'){ k++; return; }
    if (c === '$' && s[k + 1] === '{'){ k += 2; let d = 1; while (k < n && d){ const x = s[k]; if (x === '`'){ readTpl(); continue; } if (x === "'" || x === '"'){ readStr(x); continue; } if (x === '{') d++; else if (x === '}') d--; k++; } continue; } k++; } };
  while (k < n){
    const c = s[k];
    if (c === '/' && s[k + 1] === '/'){ while (k < n && s[k] !== '\n') k++; continue; }
    if (c === '/' && s[k + 1] === '*'){ k = s.indexOf('*/', k + 2) + 2; continue; }
    if (c === "'" || c === '"'){ readStr(c); continue; }
    if (c === '`'){ readTpl(); continue; }
    if (c === '/'){ const p = prevSig();
      if (p === '' || /[(,=:\[!&|?{};>+\-*%<~^]/.test(p) || /(?:return|typeof)$/.test(s.slice(Math.max(i, k - 8), k).trim())){
        k++; let cls = false; while (k < n){ const x = s[k]; if (x === '\\'){ k += 2; continue; } if (x === '[') cls = true; else if (x === ']') cls = false; else if (x === '/' && !cls){ k++; break; } k++; }
        while (/[a-z]/i.test(s[k] || '')) k++; continue; } }
    if (c === '(' || c === '[' || c === '{'){ stack.push(c); k++; continue; }
    if (c === ')' || c === ']' || c === '}'){ stack.pop(); k++; if (!stack.length && c === '}' && s[i] === '{') return k; continue; }
    if (c === ';' && !stack.length) return k + 1;
    k++;
  }
  return n;
}
// the nearest enclosing `if(...)` condition text before index i of s (looks back at most 700 characters)
function condBefore(s, i){
  const from = Math.max(0, i - 700), back = s.slice(from, i), ifs = [...back.matchAll(/\bif\s*\(/g)];
  if (!ifs.length) return '';
  const last = ifs[ifs.length - 1], st = from + last.index + last[0].length;
  let depth = 0, q = st; for (; q < i; q++){ if (s[q] === '(') depth++; else if (s[q] === ')'){ if (depth === 0) break; depth--; } }
  return s.slice(st, q);
}
const funcNameAt = i => { const re = /^(?:async )?function (\w+)/gm; let name = '', m; const head = APP.slice(0, i); while ((m = re.exec(head))) name = m[1]; return name; };

// ---------- 1) the game's own tables, run in a sandbox ----------
const NAMES = 'STATUS_KEYWORDS|LIVE_STATUS_ROWS|LIVE_STATUS_ROUNDS|SKILL_ICON_HTML|SKILL_ICON|ICON_ART|PASSIVE_DEFS|SKILL_DEFS|SKILL_TEXT|CHIP_FALLBACK_SKILLS|SKILL_REVEAL_MAP|TRIGGER_DEFS|\\w+_LINE';
const starter = new RegExp('^(?:const (?:' + NAMES + ') =|(?:' + NAMES + ')[.\\[]|Object\\.assign\\((?:' + NAMES + ')[,)]|\\{ const ex = LIVE_STATUS_ROWS|\\[[^\\n]*\\]\\.forEach\\(k=> LIVE_STATUS_ROUNDS)', 'gm');
const dummy = new Proxy(function(){}, {get: (t, p) => p === Symbol.toPrimitive ? () => 'N' : p === 'toString' || p === 'valueOf' ? () => 'N' : p === 'then' ? undefined : dummy, apply: () => dummy, construct: () => dummy, has: () => true});
// a helper the tables call (sk3Rounds, numOr, the tip functions ...) is loaded from its `function NAME(` declaration the first time it is read
const FN_AT = {}; { const re = /^(?:async )?function (\w+)\(/gm; let m; while ((m = re.exec(APP))) if (!(m[1] in FN_AT)) FN_AT[m[1]] = m.index; }
const loading = new Set();
function loadFn(t, name){
  if (!(name in FN_AT) || loading.has(name)) return false; loading.add(name);
  try { const at = FN_AT[name]; let k = APP.indexOf('(', at), d = 0; for (; k < APP.length; k++) { if (APP[k] === '(') d++; else if (APP[k] === ')') { d--; if (!d) break; } }
    const b = APP.indexOf('{', k); vm.runInContext(APP.slice(at, stmtEnd(APP, b)), ctx, {timeout: 2000}); return name in t; } catch (e) { return false; } finally { loading.delete(name); }
}
const sandbox = new Proxy({}, {
  has: (t, p) => typeof p === 'string' && !(p in t) && !['undefined', 'NaN', 'Infinity'].includes(p) && !(p in globalThis) ? true : p in t,
  get: (t, p) => p in t ? t[p] : (typeof p === 'string' && loadFn(t, p) ? t[p] : (p in globalThis ? globalThis[p] : dummy)), set: (t, p, v) => { t[p] = v; return true; } });
const {TX, TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
const quietTX = (k, v) => { if (!Object.prototype.hasOwnProperty.call(TEXT, k)) return k; return TX(k, v); };
sandbox.TX = quietTX; sandbox.window = sandbox; sandbox.document = dummy; sandbox.localStorage = dummy;
const ctx = vm.createContext(sandbox);
{ let m; starter.lastIndex = 0;
  while ((m = starter.exec(APP))){ const e = stmtEnd(APP, m.index); starter.lastIndex = e;
    try { vm.runInContext(APP.slice(m.index, e), ctx, {timeout: 3000}); } catch (err) { warnings.push('table statement at arena_app.js:' + L(m.index) + ' did not run: ' + String(err.message).slice(0, 80)); } } }
const G = name => { try { return vm.runInContext(name, ctx); } catch (e) { return undefined; } };
const STATUS_KEYWORDS = G('STATUS_KEYWORDS') || [], LIVE_ROWS = G('LIVE_STATUS_ROWS') || [], SKILL_ICON = G('SKILL_ICON') || {}, SKILL_ICON_HTML = G('SKILL_ICON_HTML') || {};
const SKILL_DEFS = G('SKILL_DEFS') || [], SKILL_TEXT = G('SKILL_TEXT') || {}, CHIP_FALLBACK = G('CHIP_FALLBACK_SKILLS') || [], REVEAL = G('SKILL_REVEAL_MAP') || {}, ICON_ART = G('ICON_ART') || {};
const DEF = {}; SKILL_DEFS.forEach(d => { DEF[d.key] = d; });
const clean = s => String(s == null ? '' : s).replace(/\bNaN\b|\bundefined\b/g, 'N').replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|#39);/g, m => ({'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'"})[m]).replace(/\s+/g, ' ').trim();
const call = (f, ...a) => { try { const r = f(...a); return typeof r === 'string' ? r : ''; } catch (e) { return ''; } };
// the one-line meaning of a skill: the card line the game writes (SKILL_TEXT), else the skill's own description
function skillMeaning(key){
  let t = '';
  if (typeof SKILL_TEXT[key] === 'function') t = call(SKILL_TEXT[key], dummy, dummy, {}) || call(SKILL_TEXT[key], [dummy, dummy], dummy, {});
  const d = DEF[key]; if (!t && d && typeof d.desc === 'function') t = call(d.desc, dummy, dummy, {}) || call(d.desc, [dummy, dummy], dummy, {});
  return clean(t);
}
const kebabToKey = {}; // iconHTML ids are kebab case ("lone-wolf"); skill keys are camel case
Object.keys(DEF).concat(Object.keys(SKILL_ICON)).forEach(k => { kebabToKey[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = k; });
const keyOfId = id => kebabToKey[String(id).toLowerCase().replace(/[^a-z0-9]/g, '')] || null;
const pretty = k => String(k).replace(/^(sk\d-|unit-)/, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase());
const norm = s => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
const stem = s => norm(s).replace(/(?:ing|ed|es|s|d)$/, '');
const iconNorm = s => String(s || '').replace(/[\uFE0E\uFE0F\u200D]/g, '').trim();

// ---------- 2) cards ----------
const CARDS = JSON.parse(read('canonical/cards.json'));
const live = CARDS.filter(c => !c.test && !c.token);
const effectCount = {}, effectCards = {}, trigDo = {}, trigCards = {}, topCount = {};
live.forEach(c => { const e = c.effects || {};
  Object.keys(e).forEach(k => { const v = e[k]; if (v === false || v == null || v === 0 || k === 'triggers') return; (effectCards[k] = effectCards[k] || []).push(c.name || c.id); });
  (Array.isArray(e.triggers) ? e.triggers : []).forEach(t => { if (!t || !t.do) return; (trigCards[t.do] = trigCards[t.do] || new Set()).add(c.name || c.id); });
  ['stoneCost', 'metalCost', 'uraniumCost', 'graceCost', 'exileCost', 'hatchInto'].forEach(f => { if (c[f]) (topCount[f] = topCount[f] || []).push(c.name || c.id); });
});
const cardsWithKeys = keys => { const set = new Set(); keys.forEach(k => (effectCards[k] || []).forEach(n => set.add(n))); return [...set]; };
const sample = names => names.slice(0, 3);

const entries = []; const byId = {};
const add = e => { if (byId[e.id]) { warnings.push('duplicate id ' + e.id); return byId[e.id]; } e.shows = e.shows || []; e.source = e.source || []; entries.push(e); byId[e.id] = e; return e; };

// ---------- 3) context chips: abilityBadges() ----------
const abStart = APP.indexOf('function abilityBadges('), abEnd = APP.indexOf('\n}\n', abStart), AB = APP.slice(abStart, abEnd);
const chipRaw = []; // {keys, cond, payload, at}
{ const re = /out\.push\(/g; let m;
  while ((m = re.exec(AB))){ const end = stmtEnd(AB, m.index), payload = AB.slice(m.index, end); chipRaw.push({cond: condBefore(AB, m.index), payload, at: abStart + m.index}); } }
const chipIconOf = (payload, key) => { // the glyph the card face really draws: iconHTML's fallback emoji, else a literal one
  const f = [...payload.matchAll(/iconHTML\('([^']+)',\s*(?:'([^']*)'|SKILL_ICON\[(\w+)\])/g)];
  if (f.length) { const a = f[0]; if (a[2]) return {id: a[1], icon: a[2]}; return {id: a[1], icon: SKILL_ICON[key] || ''}; }
  const lit = payload.match(/[\p{Extended_Pictographic}★✦⇔↺][\uFE0F]?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*/u); return {id: '', icon: lit ? lit[0] : ''};
};
// a tooltip string as the game builds it: TX('key', {...}) calls and tip helpers resolved, other ${...} parts shown as N
const allN = new Proxy({}, {get: () => 'N'});
const resolveCalls = str => {
  let out = str, guard = 0;
  while (guard++ < 12){
    const m = out.match(/\$\{escapeAttr\((TX\('([^']+)'|(\w+)\()/); if (!m) break;
    const callOpen = m.index + '${escapeAttr('.length + (m[2] ? 2 : m[3].length); // index of the call's "("
    let d = 0, k = callOpen; for (; k < out.length; k++){ if (out[k] === '(') d++; else if (out[k] === ')'){ d--; if (!d) break; } }
    let end = out.indexOf('}', k); if (end < 0) end = k;
    const repl = m[2] ? quietTX(m[2], allN) : call(G(m[3]), dummy, dummy);
    out = out.slice(0, m.index) + (repl || 'N') + out.slice(end + 1);
  }
  return out;
};
const titleOf = payload => { const t = payload.match(/title="((?:[^"\\]|\\.)*)"/); if (!t) return ''; let s = resolveCalls(t[1]); s = s.replace(/\$\{[^}]*\}/g, 'N'); return clean(s); };
const seenChipKey = new Set();
function addChip(key, o){
  const id = 'chip:' + key; if (byId[id]) { (byId[id].source = byId[id].source || []).push(o.where); return byId[id]; }
  const d = DEF[key], names = o.keys || [key];
  const cards = o.cardsFn ? o.cardsFn() : cardsWithKeys(names);
  const title = o.title ? o.title.replace(/^(\w[\w' -]{1,24}?)( N)?:.*$/, '$1') : '';
  const e = add({id, kind: 'chip', key, icon: iconNorm(o.icon), drawn: !!(ICON_ART[(o.iconId || '').toLowerCase()] && ICON_ART[(o.iconId || '').toLowerCase()].html), name: (d && d.label) || title || pretty(key),
    meaning: skillMeaning(key) || (o.title && o.title.includes(':') ? o.title.replace(/^[^:]*:\s*/, '') : ''), shows: ['hand', 'board', 'raid', 'codex'],
    cards: cards.length, examples: sample(cards), causedBy: names.filter(k => effectCards[k]), source: [o.where]});
  if (d && d.retired) e.retired = true;
  if (d && (d.hidden || d.reserved)) e.hidden = true;
  if (REVEAL[key]) e.note = 'Shows as "?" until Map ' + REVEAL[key].from + (REVEAL[key].tutorials ? ' (as itself in tutorial fights)' : '') + '.';
  return e;
}
chipRaw.forEach(r => {
  const keys = [...new Set([...r.cond.matchAll(/\be\.(\w+)/g)].map(m => m[1]))].filter(k => !['triggers'].includes(k));
  const dkeys = [...new Set([...r.cond.matchAll(/\bd\.(\w+)/g)].map(m => m[1]))];
  const where = 'abilityBadges() arena_app.js:' + L(r.at);
  if (/^\s*k === 'magic'/.test(r.cond) || /triggerBadges\(/.test(r.payload) || /skillQChipHTML/.test(r.payload)) return; // handled below
  if (/\bek\b|e\[k\]/.test(r.payload) && /\$\{k\.toLowerCase/.test(r.payload)) return; // the two array-driven lists, below
  if (!keys.length && dkeys.length){ // cost chips and the egg (fields of the card, not skills)
    const f = dkeys[0], c = r.payload.match(/iconHTML\('([^']+)',\s*'([^']*)'/); const nm = {stoneCost: 'Stone cost', metalCost: 'Metal cost', uraniumCost: 'Uranium cost', graceCost: 'Grace cost', exileCost: 'Exile cost', hatchInto: 'Egg'}[f] || pretty(f);
    const e = add({id: 'chip:' + f, kind: 'chip', key: f, icon: iconNorm(c ? c[2] : ''), name: nm, meaning: titleOf(r.payload).replace(/^[^:]*:\s*/, '') || (f === 'graceCost' ? 'costs Grace to play' : f === 'exileCost' ? 'costs Exile to play' : ''), shows: ['hand', 'board', 'raid', 'codex'],
      cards: (topCount[f] || []).length, examples: sample(topCount[f] || []), causedBy: [f], source: [where]}); return; }
  let key = keys[0];
  if (!key){ const cl = r.payload.match(/class="ab-(\w+)/); if (cl) key = cl[1]; }
  if (!key) { warnings.push('chip at ' + where + ' has no key'); return; }
  const ic = chipIconOf(r.payload, key);
  let title = titleOf(r.payload);
  addChip(key, {keys: keys.length ? keys : [key], icon: ic.icon || SKILL_ICON[key] || '', iconId: ic.id, title, where});
});
// the two array-driven lists in abilityBadges: [[key, name, default], ...].forEach(([k, nm, dv]) => ...)
for (const m of AB.matchAll(/\[(\[\s*'\w+'[\s\S]*?\])\]\.forEach\(\(\[k, nm, dv\]\)/g)){
  const at = abStart + m.index;
  for (const it of m[1].matchAll(/\[\s*'(\w+)',\s*'([^']+)',\s*(\d+)\s*\]/g)) addChip(it[1], {keys: [it[1]], icon: SKILL_ICON[it[1]] || '', iconId: it[1], title: it[2], where: 'abilityBadges() list, arena_app.js:' + L(at)});
}
// CHIP_FALLBACK_SKILLS: a generic chip (the skill's SKILL_ICON, with its number when more than 1)
CHIP_FALLBACK.forEach(k => { if (k === 'magic') return; // BX: not drawn
  addChip(k, {keys: [k], icon: SKILL_ICON[k] || '✦', iconId: k, title: '', where: 'CHIP_FALLBACK_SKILLS arena_app.js:' + L(APP.indexOf("'" + k + "'", APP.indexOf('const CHIP_FALLBACK_SKILLS')) >= 0 ? APP.indexOf("'" + k + "'", APP.indexOf('const CHIP_FALLBACK_SKILLS')) : APP.indexOf('const CHIP_FALLBACK_SKILLS'))}); });
// "?" chip for a skill the player has not met yet, and the Speed chip (a live number, not a plain skill)
{ const q = APP.indexOf('function skillQChipHTML'); if (q >= 0) add({id: 'chip:hidden', kind: 'chip', key: 'hidden', icon: '?', name: 'Hidden skill', meaning: 'a skill the player has not met yet (SKILL_REVEAL_MAP): shown as a "?" chip until its map is reached', shows: ['hand', 'board', 'raid', 'codex'], cards: cardsWithKeys(Object.keys(REVEAL)).length, examples: sample(cardsWithKeys(Object.keys(REVEAL))), causedBy: Object.keys(REVEAL), source: ['skillQChipHTML() arena_app.js:' + L(q)]}); }
// trigger chips: "lead -> action emoji" for each custom trigger a card has
{ const t0 = APP.indexOf('function triggerActionEmoji('), t1 = APP.indexOf('\n}\n', t0), TA = APP.slice(t0, t1), seen = {};
  const groups = []; let cur = null;
  for (const line of TA.split('\n')){ const cases = [...line.matchAll(/case '(\w+)':/g)].map(m => m[1]); const ret = line.match(/return\s+(.+?);(?:\s*\/\/.*)?$/);
    if (cases.length){ cur = cur || {cases: [], at: t0 + TA.indexOf(line)}; cur.cases.push(...cases); }
    if (ret && cur){ cur.ret = ret[1]; groups.push(cur); cur = null; } }
  groups.forEach(g => { const icons = [...g.ret.matchAll(/'([^']+)'/g)].map(m => m[1]).filter(s => !/^(enemy|random|self|lumber|grace|stone|devilry)$/.test(s));
    const icon = icons[0] || '🂠', doKeys = g.cases;
    const cs = new Set(); doKeys.forEach(k => (trigCards[k] || new Set()).forEach(n => cs.add(n)));
    const name = 'Trigger: ' + pretty(doKeys[0]) + (doKeys.length > 1 ? ' (+' + (doKeys.length - 1) + ' alike)' : '');
    add({id: 'chip:trg-' + doKeys[0], kind: 'chip', key: 'trg-' + doKeys[0], icon: iconNorm(icon), name, meaning: 'a custom trigger that does: ' + doKeys.join(', ') + '. The chip reads "trigger glyph, arrow, ' + icon + '"', shows: ['hand', 'board', 'raid', 'codex'],
      cards: cs.size, examples: sample([...cs]), causedBy: doKeys, source: ['triggerActionEmoji() arena_app.js:' + L(g.at)]}); });
  const tb = APP.indexOf('function triggerBadges('); const lead = APP.indexOf("const clock = t.on === 'onRoundStart'", tb);
  [['⚡', 'a custom trigger fires on an event (grey while the card Waits)', null], ['🕐', 'a trigger that fires every round', ['onRoundStart', 'perTurn']], ['🦷', 'a trigger on Sacrifice', ['onSacrifice']], ['♻️', 'a trigger on Pitch', ['onPitch']]].forEach(([g, mean, ons]) => {
    const cs = live.filter(c => ((c.effects || {}).triggers || []).some(t => ons ? ons.includes(t.on) : true)).map(c => c.name);
    add({id: 'chip:lead-' + (ons ? ons[0] : 'any'), kind: 'chip', key: 'lead-' + (ons ? ons[0] : 'any'), icon: g, name: ons ? 'Trigger lead: ' + pretty(ons[0]) : 'Trigger lead: any event', meaning: mean, shows: ['hand', 'board', 'raid', 'codex'], cards: cs.length, examples: sample(cs), causedBy: ons || ['triggers'], source: ['triggerBadges() arena_app.js:' + L(lead > 0 ? lead : tb)]}); }); }
// other marks that sit on a card face outside the strip
{ const p = APP.indexOf('function poisonTagHTML'); if (p > 0) add({id: 'chip:poison-tag', kind: 'chip', key: 'poison-tag', icon: '☠', name: 'Poison tag', meaning: 'poisons on hit: the bottom-centre pill with the Poison number (the strip also carries a Poison chip)', shows: ['hand', 'board', 'raid', 'codex'], cards: (effectCards.poison || []).length, examples: sample(effectCards.poison || []), causedBy: ['poison'], source: ['poisonTagHTML() arena_app.js:' + L(p)]});
  const y = APP.indexOf('function pitchYieldBadgeHTML'); if (y > 0) add({id: 'chip:pitch-bonus', kind: 'chip', key: 'pitch-bonus', icon: '🏆', name: 'Pitch bonus', meaning: 'discarding the card gives more than the plain 1 Lumber (the same trophy as Bounty)', shows: ['hand', 'codex'], cards: null, examples: [], causedBy: [], source: ['pitchYieldBadgeHTML() arena_app.js:' + L(y)]}); }

// ---------- 4) status chips ----------
// the pills: badges.push(`<span class="abadge CLS" ...>ICON...</span>`) anywhere in the file
const pills = {}; // cls -> {cls, field, icon, title, where[]}
{ const re = /badges\.push\(`<span class="abadge ([\w-]+)"/g; let m;
  while ((m = re.exec(APP))){ const end = stmtEnd(APP, m.index), payload = APP.slice(m.index, end), cls = m[1];
    const cond = condBefore(APP, m.index), f = cond.match(/\bc\.(\w+)/); const head = payload.match(/>([^<$]*)/);
    const icon = iconNorm(head ? head[1].replace(/[+\d\s−-]+$/, '') : '');
    const title = titleOf(payload); const fn = funcNameAt(m.index);
    const p = pills[cls] = pills[cls] || {cls, field: f ? f[1] : '', icon, title: '', where: []};
    if (!p.title && title) p.title = title; if (!p.icon && icon) p.icon = icon;
    p.where.push(fn + '() arena_app.js:' + L(m.index)); } }
const lineOfIn = (needle, from) => { const i = APP.indexOf(needle, from || 0); return i < 0 ? 0 : L(i); };
const rowStart = APP.indexOf('const LIVE_STATUS_ROWS = [');
const kwStart = APP.indexOf('const STATUS_KEYWORDS = [');
const statuses = []; const usedPill = new Set(), usedKw = new Set();
const kwByK = {}; STATUS_KEYWORDS.forEach(k => { kwByK[k.k] = k; });
LIVE_ROWS.forEach(r => { const [field, k, name, text, showN] = r; const kw = k ? kwByK[k] : null; if (kw) usedKw.add(kw.k);
  let pill = Object.values(pills).find(p => p.field === field && !usedPill.has(p.cls));
  if (!pill) pill = Object.values(pills).find(p => !usedPill.has(p.cls) && [field, k, name].some(x => x && norm(x).length >= 5 && (norm(p.cls.replace(/^sk\d-/, '')).startsWith(norm(x).slice(0, 5)) || norm(x).startsWith(norm(p.cls.replace(/^sk\d-/, '')).slice(0, 5)))));
  if (pill) usedPill.add(pill.cls);
  statuses.push({field, k: k || '', name: clean(name), kw, row: r, pill, rowLine: lineOfIn("['" + field + "'", rowStart) || lineOfIn("['" + field + "'", 0)}); });
STATUS_KEYWORDS.forEach(kw => { if (usedKw.has(kw.k)) return; const pill = Object.values(pills).find(p => !usedPill.has(p.cls) && (p.field === kw.k || norm(p.cls.replace(/^sk\d-/, '')) === norm(kw.k)));
  if (pill) usedPill.add(pill.cls); statuses.push({field: '', k: kw.k, name: clean(kw.name), kw, row: null, pill, rowLine: 0}); });
Object.values(pills).forEach(p => { if (usedPill.has(p.cls)) return; const head = p.title.split(/[:(.]/)[0].trim();
  const tidy = head.replace(/\bN\b(?: of)?\s*/g, '').trim(); // "N Prayer tokens" -> "Prayer tokens"
  statuses.push({field: p.field, k: '', name: /^[A-Za-z][A-Za-z' -]{2,30}$/.test(tidy) ? tidy.replace(/^./, c => c.toUpperCase()) : pretty(p.cls), kw: null, row: null, pill: p, rowLine: 0}); });
// skills whose name a status word matches (the way the card counts "can cause it")
const skillKeysAll = Object.keys(DEF);
const reOf = kw => kw ? new RegExp(kw.re.source, kw.re.flags.replace('g', '')) : null;
function statusCauses(s){
  const res = []; const kre = reOf(s.kw);
  const nameRe = !kre ? new RegExp('\\b' + stem(s.name).replace(/[^a-z]/g, '') + '(?:e|es|ed|s|ing)?\\b', 'i') : null;
  const match = str => (kre ? kre.test(str) : nameRe.test(str));
  skillKeysAll.forEach(k => { const d = DEF[k]; if (!effectCards[k]) return; if (match(d.label || '') || match(k.replace(/([a-z])([A-Z])/g, '$1 $2'))) res.push(k); });
  const doKeys = Object.keys(trigCards).filter(k => match(k.replace(/([a-z])([A-Z])/g, '$1 $2')));
  return {keys: res, doKeys};
}
statuses.forEach(s => {
  const id = 'st:' + (s.field || s.k || s.pill.cls); if (byId[id]) return;
  const c = statusCauses(s); const names = new Set(cardsWithKeys(c.keys)); c.doKeys.forEach(k => trigCards[k].forEach(n => names.add(n)));
  let meaning = '';
  if (s.row && typeof s.row[3] === 'function') meaning = clean(call(s.row[3], dummy, {}));
  if (!meaning && s.kw) meaning = clean(s.kw.text);
  if (!meaning && s.pill) meaning = s.pill.title.replace(/^[^:]*:\s*/, '');
  const shows = []; if (s.kw) shows.push('hand', 'codex'); if (s.pill || s.row) shows.push('board', 'raid');
  const src = []; if (s.kw) src.push('STATUS_KEYWORDS ' + s.kw.k + ' arena_app.js:' + (lineOfIn('k:\'' + s.kw.k + '\'', kwStart) || L(kwStart)));
  if (s.row) src.push('LIVE_STATUS_ROWS ' + s.row[0] + ' arena_app.js:' + (s.rowLine || L(rowStart))); if (s.pill) s.pill.where.forEach((w, i) => { if (i < 2) src.push('pill ' + s.pill.cls + ' in ' + w); });
  add({id, kind: 'status', key: s.field || s.k || s.pill.cls, icon: s.pill ? s.pill.icon : '', name: s.name || pretty(s.k), meaning, color: s.kw && s.kw.c || '', shows: [...new Set(shows)],
    parts: {pill: !!s.pill, liveLine: !!s.row, keyword: !!s.kw, rounds: !!(s.row && G('LIVE_STATUS_ROUNDS') && G('LIVE_STATUS_ROUNDS').has(s.row[0]))},
    cards: names.size, examples: sample([...names]), causedBy: c.keys.concat(c.doKeys), source: src, field: s.field});
});

// ---------- 5) context FX ----------
const CSS_FILES = ['arena_template.html', 'arena_app.js'].concat(fs.readdirSync(ROOT).filter(f => /^bramblewood-.*\.js$/.test(f)));
const CSS_TEXT = CSS_FILES.map(f => read(f)).join('\n');
const cssHas = cls => { const t = cls.trim().split(/\s+/)[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); return new RegExp('\\.' + t + '(?![\\w-])').test(CSS_TEXT); };
const bs = APP.indexOf('function boardCardHTML('), be = APP.indexOf('\n}\n', bs), BC = APP.slice(bs, be);
const statusByField = {}; entries.filter(e => e.kind === 'status' && e.field).forEach(e => { statusByField[e.field] = e; });
const effKeyOf = expr => { const m = expr.match(/effects\s*\|\|\s*\{\}\)\.(\w+)/) || expr.match(/\be\.(\w+)/); return m ? m[1] : ''; };
const fxCards = (field, effKey) => { if (effKey) { const c = cardsWithKeys([effKey]); return {n: c.length, ex: sample(c), by: [effKey]}; }
  const st = field && statusByField[field]; if (st) return {n: st.cards, ex: st.examples, by: st.causedBy}; return {n: null, ex: [], by: []}; };
// a) the tint classes on a board card (statusClasses)
{ const a = BC.indexOf('const statusClasses = ['), b = BC.indexOf('].filter(Boolean)', a);
  BC.slice(a, b).split('\n').forEach(line => { const m = line.match(/^\s*(.+?)\s*\?\s*\(?'([\w -]+)'/); if (!m) return; let cond = m[1].replace(/^[,\s]+/, '').replace(/\/\/.*$/, '');
    const cls = m[2].trim().split(/\s+/)[0]; const f = cond.match(/\bc\.(\w+)/); const eff = cond.match(/\.effects\s*\|\|\s*\{\}\)\.(\w+)/);
    const st = f && statusByField[f[1]]; const cs = fxCards(f ? f[1] : '', eff ? eff[1] : '');
    const simple = /^c\.\w+(?:\s*>\s*0)?$/.test(cond.trim()), what = simple ? 'c.' + f[1] : cond.replace(/[\s()]+/g, ' ').trim().slice(0, 60);
    add({id: 'fx:' + cls, kind: 'fx', key: cls, icon: st ? st.icon : '', name: st ? st.name + ' tint' : pretty(cls.replace(/^is-/, '')) + ' look', tint: true, meaning: (st ? 'the card frame is tinted while ' : 'a look on the card (class ' + cls + ') while ') + what + ' is on' + (cssHas(cls) ? '' : ' (no CSS rule found)'),
      shows: ['board', 'raid'], cards: cs.n, examples: cs.ex, causedBy: cs.by, source: ['boardCardHTML() statusClasses arena_app.js:' + L(bs + BC.indexOf(line))], css: cssHas(cls), link: st ? st.id : ''}); }); }
// b) the overlays on a board card
for (const m of BC.matchAll(/\$\{c\.(\w+)\s*(?:>\s*0)?\s*\?\s*`<div class="status-overlay ([\w -]+)"[^>]*>([^<]*)</g)){
  const cls = m[2].trim().split(/\s+/).pop(), st = statusByField[m[1]]; const cs = fxCards(m[1], '');
  add({id: 'fx:' + cls, kind: 'fx', key: cls, icon: (/[$\{]/.test(m[3]) ? '' : iconNorm(m[3])) || (st ? st.icon : ''), name: (st ? st.name : pretty(m[1])) + ' overlay', meaning: 'a glyph or animation drawn over the card art while ' + (st ? st.name : 'c.' + m[1]) + ' lasts' + (cssHas(cls) ? '' : ' (no CSS rule found)'),
    shows: ['board', 'raid'], cards: cs.n, examples: cs.ex, causedBy: cs.by, source: ['boardCardHTML() overlaysHTML arena_app.js:' + L(bs + m.index)], css: cssHas(cls), link: st ? st.id : ''}); }
{ const ff = BC.indexOf('FROST_FLAKES_HTML'); const st = statusByField.frozen; const cs = fxCards('frozen', ''); if (ff > 0) add({id: 'fx:frost-flakes', kind: 'fx', key: 'frost-flakes', icon: '❄️', name: 'Frozen flakes', meaning: 'falling frost flakes over the card while it is Frozen', shows: ['board', 'raid'], cards: cs.n, examples: cs.ex, causedBy: cs.by, source: ['boardCardHTML() FROST_FLAKES_HTML arena_app.js:' + L(bs + ff)], css: true, link: st ? st.id : ''}); }
// c) the other conditional marks in the board card template
{ const vars = {}; for (const m of BC.matchAll(/\bconst (\w+)\s*=\s*([^;\n]+)/g)) vars[m[1]] = m[2];
  const deco = [['shell-up', 'Shell plates', 'the plates of Shell (armour and temporary Health until the end of next round)'], ['rage-shield', 'Rage shield', 'Raging: Attack doubled, half damage taken (a Rage unit below half Health)'], ['heat-haze', 'Heat haze', 'a heat shimmer over a fiery card'],
    ['cage-bars', 'Cage', 'the cage round a caged leader (Caged Fight)'], ['guard-plates', 'Guardian plates', 'metal plates either side of a Guardian unit'], ['unit-light', 'Unit light', 'a pool of light under a leader, a Light Aura (Illuminate) or Immolation unit; shows at night and in the dark'],
    ['angel-wings', 'Angel wings', 'wings and halo on a Revive unit that is an Angel'], ['revive-mark', 'Phoenix mark', 'an ember ring and flame feather on a Revive unit that is not an Angel; goes once the revive is spent'], ['fuse-badge', 'Dynamite fuse', 'the lit fuse counting down on a Dynamite unit'],
    ['fly-shadow', 'Flyer shadow', 'a shadow under a flying (or floating Tide) unit as it hovers'], ['seen-new', 'NEW! flash', 'the first time the player sees this card in a fight'], ['phase-spores', 'Phase spores', 'a glow while a unit holds a day/night phase bonus']];
  deco.forEach(([cls, name, mean]) => { const i = BC.indexOf('class="' + cls); if (i < 0) { warnings.push('fx ' + cls + ' not found in boardCardHTML'); return; }
    const before = BC.slice(Math.max(0, i - 160), i); const cm = before.match(/(\w[\w.()| ]*?)\s*\?\s*[`'(]?\s*(?:<[^>]*>)?\s*$/) || before.match(/\$\{\s*([\w.]+)[^?]*\?\s*`?\s*$/);
    let v = cm ? cm[1].trim() : ''; const cmo = before.match(/(\w+)\s*\?\s*[`'][^`']*$/); if (cmo) v = cmo[1];
    let eff = '', field = ''; const ex = vars[v] || v;
    if (v === 'lightKind') eff = ''; else { eff = effKeyOf(ex); const fm = (ex || '').match(/\bc\.(\w+)/) || before.match(/\$\{c\.(\w+)/); field = fm ? fm[1] : ''; }
    if (cls === 'unit-light') { const c = cardsWithKeys(['illuminate', 'lantern', 'immolation']); eff = ''; field = ''; var lightCards = c; }
    if (cls === 'fly-shadow') eff = 'flying';
    if (cls === 'rage-shield') eff = 'rage';
    if (cls === 'fuse-badge') eff = 'dynamite';
    if (cls === 'shell-up') eff = 'shell';
    if (cls === 'cage-bars') { eff = ''; field = ''; }
    const cs = cls === 'unit-light' ? {n: lightCards.length, ex: sample(lightCards), by: ['illuminate', 'immolation']} : fxCards(field, eff);
    add({id: 'fx:' + cls, kind: 'fx', key: cls, icon: '', name, meaning: mean + (cssHas(cls) ? '' : ' (no CSS rule found)'), shows: ['board', 'raid'], cards: cs.n, examples: cs.ex, causedBy: cs.by, source: ['boardCardHTML() arena_app.js:' + L(bs + i)], css: cssHas(cls), link: ''}); }); }
// d) battlefield (scene) states: darkness, night, wind, rain, sudden death ...
{ const tpl = APP.indexOf('<div class="battlefield ${'); const line = APP.slice(tpl, APP.indexOf('\n', tpl));
  const scene = []; for (const m of line.matchAll(/\$\{([^{}$]*?)\?\s*'([\w -]+?)(?:'\s*\+[^:]*)?'\s*:\s*''\}/g)) scene.push({cond: m[1].trim(), cls: m[2].trim()});
  const dv = line.match(/matchDarkLevel\(m\) === 'pitch' \|\| matchDarkLevel\(m\) === 'absolute' \? '([\w -]+?)'/); if (dv && !scene.find(s => s.cls.startsWith('bf-lantern'))) scene.push({cond: "matchDarkLevel(m) is 'pitch' or 'absolute'", cls: dv[1]});
  if (/terrain-on/.test(line)) scene.push({cond: 'terrainOfMatch(m)', cls: 'terrain-on'}); if (/volcanic/.test(line)) scene.push({cond: 'terrain eruption rules', cls: 'volcanic'});
  for (const m of APP.matchAll(/\bbf\.classList\.toggle\('([\w-]+)',/g)) scene.push({cond: 'bf.classList.toggle', cls: m[1], at: m.index});
  const nice = {'bf-lantern': ['Pitch-black darkness', 'Pitch Black / Absolute darkness: the battlefield goes dark and only lit units show (the pointer is a lantern)'], 'is-dark-scene': ['Dark scene', 'night or darkness: the battlefield is dimmed and Darkness / Blind rules apply'], 'bf-night-cursor': ['Night pointer light', 'at night the pointer carries a soft light'],
    'is-windy': ['Windy', 'a strong wind blows: Flyers\' wings light up (Tailwind / Headwind) and the wind layer shows'], 'is-raining': ['Raining', 'rain falls on the battlefield (Wet rules)'], 'sudden-death': ['Sudden death sky', 'the late-round red sky of sudden death'], 'wet-field': ['Wet field', 'the field is wet (a Flood or rain)'],
    'terrain-on': ['Terrain', 'the battlefield shows its biome terrain'], 'volcanic': ['Volcanic terrain', 'an erupting biome terrain']};
  const seenS = new Set(); scene.forEach(s => { const cls = s.cls.split(/\s+/)[0]; if (seenS.has(cls)) return; seenS.add(cls); const nm = nice[cls] || [pretty(cls), 'battlefield state: ' + s.cond];
    add({id: 'fx:scene-' + cls, kind: 'fx', key: cls, icon: '', name: nm[0], meaning: nm[1] + (cssHas(cls) ? '' : ' (no CSS rule found)'), shows: ['board', 'raid'], scene: true, cards: null, examples: [], causedBy: [], source: ['battlefield class, arena_app.js:' + (s.at ? L(s.at) : L(tpl))], css: cssHas(cls), link: ''}); }); }
// links from a status to its fx; a status with no pill of its own shows the glyph of its overlay or skill, dimmed (altIcon)
entries.filter(e => e.kind === 'fx' && e.link && byId[e.link]).forEach(f => { const s = byId[f.link]; (s.fx = s.fx || []).push(f.id); });
entries.filter(e => e.kind === 'status' && !e.icon).forEach(s => {
  const fxIcon = (s.fx || []).map(i => byId[i].icon).find(Boolean); const sk = (s.causedBy || []).map(k => SKILL_ICON[k]).find(Boolean);
  if (fxIcon || sk) s.altIcon = iconNorm(fxIcon || sk); });

// ---------- 6) near-duplicate groups ----------
// "pair": one word seen as a status, the skill that gives it and its look (Poison / Poison chip / Poison tint): the same thing,
//         shown in its three places, not a duplicate.
// "sameIcon": different things that draw the same glyph (a player cannot tell them apart by the picture).
// "similarMeaning": different things whose one-line meanings share most of their words.
const words = s => new Set(clean(s).toLowerCase().replace(/\b(n|a|an|the|of|to|it|its|is|and|or|in|on|at|by|for|with|that|this|from|as|be|each|every|one|per|your|you|his|her|their)\b/g, ' ').split(/[^a-z0-9]+/).filter(w => w.length > 2));
const jacc = (a, b) => { let i = 0; a.forEach(w => { if (b.has(w)) i++; }); return i / (a.size + b.size - i || 1); };
const groups = []; let gn = 0;
const mk = (reason, label, members, note) => { if (members.length < 2) return null; const g = {id: 'G' + (++gn), reason, label, members, note}; groups.push(g); return g; };
const baseName = e => e.name.replace(/^Trigger: /, '').replace(/ \(\+\d+ alike\)$/, '').replace(/ (tint|overlay|tag|flakes)$/, '');
const parent = {}; const find = x => { if (parent[x] === undefined) parent[x] = x; return parent[x] === x ? x : (parent[x] = find(parent[x])); }; const union = (a, b) => { parent[find(a)] = find(b); };
{ // pairs first: a status with the skill chips its word matches, the triggers that do it and its fx
  entries.filter(e => e.kind === 'status').forEach(s => {
    const kw = STATUS_KEYWORDS.find(k => (s.parts && s.parts.keyword) && (k.k === s.key || clean(k.name) === s.name));
    const hit = e => (kw ? reOf(kw).test(baseName(e)) && baseName(e).split(' ').length <= 2 : stem(baseName(e)) === stem(s.name)) || stem(baseName(e)) === stem(s.name);
    const chips = entries.filter(e => e.kind === 'chip' && hit(e));
    const mem = [s.id].concat(chips.map(c => c.id), s.fx || []);
    if (mem.length >= 2){ mk('pair', s.name + ': status, skill, look', mem, 'the same word seen in its places: what gives it, what it is, how it looks'); mem.forEach(m => union(mem[0], m)); } });
  // a chip with the same word as a skill-status chip pair that has no status of its own (Daunt / Daunted, Toxin) is caught above by stem; fx without a status link stay single
}
{ // the same word with a different ending (Creative / Creativity, Stymie / Stymied, Prayer / Prayer tokens) is one family too
  for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++){ const a = norm(baseName(entries[i])), b = norm(baseName(entries[j]));
    if (a.length >= 6 && b.length >= 6 && a.slice(0, 6) === b.slice(0, 6)) union(entries[i].id, entries[j].id); } }
{ const byIcon = {}; entries.forEach(e => { const k = iconNorm(e.icon); if (k && !e.drawn) (byIcon[k] = byIcon[k] || []).push(e); });
  Object.keys(byIcon).forEach(k => { const mem = byIcon[k]; if (mem.length < 2) return;
    const roots = new Set(mem.map(e => find(e.id))); const stems = new Set(mem.map(e => stem(baseName(e))));
    if (roots.size < 2 || stems.size < 2) return; // all one family
    mk('sameIcon', 'Same icon ' + k, mem.map(e => e.id), roots.size + ' different things draw ' + k); }); }
{ const cand = entries.filter(e => e.meaning && !e.tint && words(e.meaning).size >= 4 && !/\(no CSS rule found\)$/.test(e.meaning)); const W = new Map(cand.map(e => [e.id, words(e.meaning)]));
  const par = {}; const f2 = x => (par[x] === undefined || par[x] === x ? (par[x] = x) : (par[x] = f2(par[x])));
  const hit = [];
  for (let i = 0; i < cand.length; i++) for (let j = i + 1; j < cand.length; j++){ const a = cand[i], b = cand[j];
    if (find(a.id) === find(b.id)) continue; if (stem(baseName(a)) === stem(baseName(b))) continue; if (a.link === b.id || b.link === a.id) continue;
    const s = jacc(W.get(a.id), W.get(b.id)); if (s >= 0.6){ par[f2(a.id)] = f2(b.id); hit.push(a.id, b.id); } }
  const cl = {}; [...new Set(hit)].forEach(x => { (cl[f2(x)] = cl[f2(x)] || []).push(x); });
  Object.values(cl).forEach(mem => { if (mem.length >= 2 && mem.length <= 6) mk('similarMeaning', 'Similar meaning: ' + mem.map(i => byId[i].name).slice(0, 3).join(' / '), mem, 'their one-line meanings share most of their words'); }); }
entries.forEach(e => { e.groups = groups.filter(g => g.members.includes(e.id)).map(g => g.id); });

// ---------- 7) output ----------
const SOURCES = ['arena_app.js', 'arena_template.html', 'bramblewood-texts.js', 'canonical/cards.json'];
const hash = crypto.createHash('sha1'); SOURCES.forEach(f => hash.update(read(f)));
const totals = {status: 0, chip: 0, fx: 0}; entries.forEach(e => { totals[e.kind]++; });
const out = {
  generated: new Date().toISOString().slice(0, 10), sourceHash: hash.digest('hex').slice(0, 12), generator: 'tools/hub/chips_inventory.js', sources: SOURCES,
  scope: 'status: board pills, live-status lines and keyword glossary words. chip: skill/ability marks on the card face (abilityBadges, CHIP_FALLBACK_SKILLS, trigger chips). fx: tint classes, overlays, decorative plates/wings/light and battlefield states on a board card. Transient hit/skill animations (renderVfxForEvent and the fx files) are not listed: they are one-off events, not states.',
  cardCount: live.length, totals, groups: groups.map(g => ({id: g.id, reason: g.reason, label: g.label, note: g.note, members: g.members})), warnings,
  entries: entries.map(e => { const o = Object.assign({}, e); delete o.field; delete o.key2; return o; }),
};
const json = JSON.stringify(out, null, 1) + '\n';
if (process.argv.includes('--check')){
  let cur = null; try { cur = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) {}
  if (!cur || cur.sourceHash !== out.sourceHash) { console.error('docs/chips-inventory.json is out of date: run node tools/hub/chips_inventory.js'); process.exit(1); }
  console.log('chips inventory is current (' + out.sourceHash + ')'); process.exit(0);
}
if (process.argv.includes('--print')){
  entries.forEach(e => console.log(e.kind.padEnd(6), (e.icon || '').padEnd(6), e.name.padEnd(28), String(e.cards).padStart(4), (e.groups || []).join(','), '|', (e.meaning || '').slice(0, 70)));
  console.log(totals, 'groups', groups.length, 'warnings', warnings.length); warnings.forEach(w => console.log(' !', w)); process.exit(0);
}
fs.writeFileSync(OUT, json);
console.log('wrote docs/chips-inventory.json:', totals.status, 'status,', totals.chip, 'chips,', totals.fx, 'fx,', groups.length, 'groups,', warnings.length, 'warnings');
warnings.forEach(w => console.log(' !', w));
