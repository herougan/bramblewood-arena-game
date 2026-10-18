#!/usr/bin/env node
// 2026-10-18 (emoji speed): every emoji was its own little SVG document (about 8 per card) that the browser laid out, painted and
// re-rasterised; now each emoji set also ships as one sprite sheet (tools/emoji/build_atlas.py -> tools/emoji/atlas/<set>.webp +
// .json, put into the build by assemble_arena.py's emoji_atlases(), drawn by EmojiStyle in arena_app.js).
// Covers, without a browser:
//   - the built page: EMOJI_ATLAS has a sheet for every set, holding exactly the set's emoji, none missed, its geometry adds up,
//     and the sheet file it points at exists with those pixel sizes (read from the WebP header); the sheet is current (its hash
//     matches the set, so the next build won't redraw it);
//   - EmojiStyle run in a stub DOM: with a sheet, html() / htmlBlock() write <img class="... emo e-<key>" alt="<emoji>"> with the
//     shared 1x1 src (attributes and <svg> left alone, FE0F-only symbols only with FE0F), the stylesheet places every emoji so a
//     box of any size shows exactly its own cell, and System removes the stylesheet; with no sheet (or a sheet that fails to
//     load) the old SVG <img> path draws instead.
//   - the CSS rule for img.tw-emoji.emo is in the template.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const grab = name=>{ const m = new RegExp('var ' + name + ' = (\\{.*?\\});\\n').exec(html); return m ? JSON.parse(m[1]) : null; };
const ATLAS = grab('EMOJI_ATLAS'), SETURLS = grab('EMOJI_SET_URLS');
ok(ATLAS && SETURLS, 'index.html carries EMOJI_ATLAS and EMOJI_SET_URLS (rebuild with assemble_arena.py)');

// ---- 1. the built sheets
const webpSize = buf=>{ // RIFF....WEBPVP8L / VP8X / VP8
  const fourcc = buf.toString('ascii', 12, 16);
  if(fourcc === 'VP8L'){ const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
  if(fourcc === 'VP8X') return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  if(fourcc === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  return null;
};
for(const set of ['fluent', 'twemoji', 'noto']){
  const a = ATLAS && ATLAS[set];
  ok(!!a, `${set}: has a sprite sheet in the build`); if(!a) continue;
  const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/emoji/sets', set + '.json'), 'utf8'));
  const want = Object.keys(src.emoji).sort();
  ok(JSON.stringify(a.keys) === JSON.stringify(want), `${set}: the sheet holds exactly the set's ${want.length} emoji`);
  ok(Array.isArray(a.miss) && a.miss.length === 0, `${set}: no emoji missed when drawing the sheet: ${a.miss}`);
  ok(JSON.stringify(a.vs) === JSON.stringify(src.vs || []), `${set}: the FE0F-only list is the set's`);
  ok(a.pitch === a.cell + 2 * a.pad && a.w === a.cols * a.pitch && a.h === a.rows * a.pitch && a.rows === Math.ceil(a.keys.length / a.cols), `${set}: geometry adds up`);
  ok(a.cell >= 64, `${set}: cells are at least 64 px (2x of a 32 px emoji): ${a.cell}`);
  const file = path.join(ROOT, String(a.url).split('?')[0]);
  ok(/^assets\/emoji\/[a-z]+-atlas\.webp\?v=/.test(a.url) && fs.existsSync(file), `${set}: the sheet file exists: ${a.url}`);
  if(fs.existsSync(file)){ const wh = webpSize(fs.readFileSync(file)); ok(wh && wh[0] === a.w && wh[1] === a.h, `${set}: the sheet is ${a.w}x${a.h}: ${wh}`); }
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/emoji/atlas', set + '.json'), 'utf8'));
  let cur = null;
  try{ // the hash build_atlas.py's set_hash() gives the set now (what assemble_arena.py compares)
    cur = require('child_process').execFileSync('python3', ['-c', 'import sys, json, importlib.util as u; s = u.spec_from_file_location("ba", sys.argv[1]); m = u.module_from_spec(s); s.loader.exec_module(m); print(m.set_hash(json.load(open(sys.argv[2], encoding="utf-8"))))',
      path.join(ROOT, 'tools/emoji/build_atlas.py'), path.join(ROOT, 'tools/emoji/sets', set + '.json')], {encoding: 'utf8'}).trim();
  }catch(e){ console.log('  (python3 not available: sheet freshness not checked)'); }
  if(cur) ok(meta.hash === cur, `${set}: the sheet is current with its set (hash ${meta.hash} vs ${cur}); run tools/emoji/build_atlas.py`);
}

// ---- 2. EmojiStyle in a stub DOM
const start = app.indexOf('var EMOJI_ATLAS = '), end = app.indexOf("try{ if(EmojiStyle.get() !== 'system')");
ok(start > 0 && end > start, 'EmojiStyle source found in arena_app.js');
const src = app.slice(start, end).replace('__EMOJI_ATLAS__', JSON.stringify(ATLAS)).replace('__EMOJI_SET_URLS__', JSON.stringify(SETURLS)) + '\nthis.EmojiStyle = EmojiStyle; this.EMOJI_ATLAS = EMOJI_ATLAS;';
const fluentSvg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/emoji/sets/fluent.json'), 'utf8'));
function makeCtx(opts){
  const els = {}, head = {children: [], appendChild(e){ this.children.push(e); if(e.id) els[e.id] = e; if(e.tag === 'script') setTimeout(()=>{ ctx.window.BW_EMOJI_SETS = {fluent: {vs: fluentSvg.vs, emoji: fluentSvg.emoji}}; e.onload && e.onload(); }, 0); }};
  const mk = tag=> ({tag, id: '', textContent: '', remove(){ delete els[this.id]; head.children = head.children.filter(x=> x !== this); }});
  const store = {};
  const ctx = {
    window: {}, console, setTimeout, clearTimeout, Promise, Blob: class { constructor(p){ this.p = p; } },
    URL: {createObjectURL: ()=> 'blob:svg-' + (++ctx.__n), revokeObjectURL(){}}, __n: 0,
    localStorage: {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }},
    Image: class { set src(v){ this._s = v; setTimeout(()=> opts.sheetLoads ? this.onload && this.onload() : this.onerror && this.onerror(), 0); } get src(){ return this._s; } decode(){ return Promise.resolve(); } },
    document: {documentElement: {dataset: {}}, head, body: null, getElementById: id=> els[id] || null, createElement: mk, querySelectorAll: ()=> []},
    MutationObserver: undefined, NodeFilter: {SHOW_TEXT: 4},
  };
  ctx.window.BW_EMOJI_SETS = undefined;
  vm.createContext(ctx); vm.runInContext(src, ctx);
  return {ctx, els};
}
(async()=>{
  // with the sheet
  {
    const {ctx, els} = makeCtx({sheetLoads: true}), E = ctx.EmojiStyle;
    ok(E.get() === 'fluent', 'Fluent is the default set');
    const r = await E.apply();
    ok(r === true && E.usesSheet() && E.active() === 'fluent', 'Fluent applies from its sheet');
    const one = E.html('🦦');
    ok(/^<img class="emoji tw-emoji emoji-fluent emo e-1f9a6" alt="🦦" draggable="false" src="data:image\/gif;base64,[^"]+">$/.test(one), `html() writes a sheet picture: ${one}`);
    const blk = E.htmlBlock('<span title="🔥 hot">🔥3 ⚔️</span><svg><text>🔥</text></svg><b>↔ ↔️</b>');
    ok(blk.startsWith('<span title="🔥 hot"><img class="emoji tw-emoji emoji-fluent emo e-1f525" alt="🔥"'), `htmlBlock(): attributes left alone, text swapped: ${blk.slice(0, 120)}`);
    ok(blk.includes('alt="⚔️"') && blk.includes('e-2694'), 'htmlBlock(): ⚔️ (with FE0F) is keyed without the FE0F');
    ok(blk.includes('<svg><text>🔥</text></svg>'), 'htmlBlock(): nothing inside <svg>');
    ok(blk.includes('<b>↔ <img') && blk.includes('alt="↔️"'), 'htmlBlock(): ↔ alone stays text, ↔️ becomes a picture');
    ok((blk.match(/src="data:image\/gif/g) || []).length === 3, 'all sheet pictures share the same 1x1 src');
    const css = els.bwEmojiAtlas && els.bwEmojiAtlas.textContent;
    ok(!!css && css.startsWith('img.emo{background-image:url("assets/emoji/fluent-atlas.webp'), 'the sheet stylesheet is in <head>');
    // every emoji's cell lands exactly in the box, for any box size: offset = (B - Wr) * p, Wr = B * W / cell
    const a = ctx.EMOJI_ATLAS.fluent, size = /background-size:([\d.]+)% ([\d.]+)%/.exec(css);
    let worst = 0, missing = 0;
    a.keys.forEach((k, i)=>{
      const m = new RegExp('\\.e-' + k + '\\{background-position:([\\d.]+)% ([\\d.]+)%\\}').exec(css); if(!m){ missing++; return; }
      for(const B of [12, 18, 41]){
        const Wr = B * parseFloat(size[1]) / 100, Hr = B * parseFloat(size[2]) / 100;
        const ox = (B - Wr) * parseFloat(m[1]) / 100, oy = (B - Hr) * parseFloat(m[2]) / 100;
        const x = (i % a.cols) * a.pitch + a.pad, y = Math.floor(i / a.cols) * a.pitch + a.pad;
        worst = Math.max(worst, Math.abs(ox + x * B / a.cell), Math.abs(oy + y * B / a.cell));
      }
    });
    ok(missing === 0, `every emoji has its position rule (${missing} missing)`);
    ok(worst < 0.02, `every emoji's cell lines up with its box to within 0.02 px at 12/18/41 px (worst ${worst.toFixed(4)})`);
    await E.set('system');
    ok(!E.usesSheet() && !els.bwEmojiAtlas && E.html('🦦') === '🦦', 'System: no sheet, no stylesheet, plain emoji');
  }
  // no sheet in the build: the old SVG path
  for(const how of ['no sheet', 'sheet fails to load']){
    const {ctx} = makeCtx({sheetLoads: how !== 'sheet fails to load'}), E = ctx.EmojiStyle;
    if(how === 'no sheet') delete ctx.EMOJI_ATLAS.fluent;
    const r = await E.apply();
    const one = E.html('🦦');
    ok(r === true && !E.usesSheet() && /^<img class="emoji tw-emoji emoji-fluent" alt="🦦" draggable="false" decoding="sync" src="blob:svg-\d+">$/.test(one), `${how}: the SVG picture draws instead: ${one}`);
  }
  // ---- 2b. nothing the game uses is missing from the sets (2026-10-18, package F: the Dromedary's 🐪 and 8 more were in the
  // game but not in used.json / the sets, so they drew as the system emoji). Every card's emoji (icon, name, flavour, barks,
  // speeches: the card minus its art) and every emoji in the code, texts and lang packs must be in tools/emoji/used.json and in
  // each set. If this fails: node tools/emoji/scan_emoji.js > tools/emoji/used.json && python3 tools/emoji/build_sets.py
  // && python3 tools/emoji/build_atlas.py, then rebuild.
  {
    const keyOf = s=> [...s].map(ch=> ch.codePointAt(0).toString(16)).filter(h=> h !== 'fe0f').join('-');
    const RGI = /\p{RGI_Emoji}/gv, need = new Map();
    const add = (s, where)=>{ for(const m of String(s).matchAll(RGI)){ const k = keyOf(m[0]); if(!need.has(k)) need.set(k, m[0] + ' (' + where + ')'); } };
    const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
    let iconsSeen = 0;
    for(const c of cards){ const o = Object.assign({}, c); delete o.art; delete o.artFull; delete o.artThumb;
      if(c.icon && RGI.test(c.icon)) iconsSeen++; RGI.lastIndex = 0;
      add(JSON.stringify(o, (k, v)=> typeof v === 'string' && v.startsWith('data:') ? '' : v), 'card ' + c.id); }
    ok(iconsSeen > 600, `card icons read from canonical/cards.json (${iconsSeen})`);
    const files = fs.readdirSync(ROOT).filter(f=> /^(arena_app\.js|arena_template\.html|bramblewood-.*\.js)$/.test(f)).map(f=> path.join(ROOT, f));
    for(const d of ['lang', 'lang/cards', 'lang/ui']) if(fs.existsSync(path.join(ROOT, d))) fs.readdirSync(path.join(ROOT, d)).filter(f=> f.endsWith('.json')).forEach(f=> files.push(path.join(ROOT, d, f)));
    for(const fp of files){
      const t = fs.readFileSync(fp, 'utf8').replace(/\\u\{([0-9a-fA-F]{4,6})\}/g, (m, h)=> String.fromCodePoint(parseInt(h, 16)))
        .replace(/\\u[dD][89abAB][0-9a-fA-F]{2}\\u[dD][c-fC-F][0-9a-fA-F]{2}|\\u(2[0-9a-fA-F]{3}|3[0-2][0-9a-fA-F]{2}|[fF][eE]0[fF])/g, m=>{ try{ return JSON.parse('"' + m + '"'); }catch(e){ return m; } });
      add(t, path.relative(ROOT, fp));
    }
    const used = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/emoji/used.json'), 'utf8')).map(e=> e.key));
    const notUsed = [...need].filter(([k])=> !used.has(k)).map(([, v])=> v);
    ok(notUsed.length === 0, `every emoji the game uses is in tools/emoji/used.json (rescan): ${notUsed.slice(0, 12).join(', ')}`);
    for(const set of ['fluent', 'twemoji', 'noto']){
      const sj = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/emoji/sets', set + '.json'), 'utf8'));
      const miss = [...need].filter(([k])=> !(k in sj.emoji)).map(([, v])=> v);
      ok(miss.length === 0, `${set}: every emoji the game uses is in the set (build_sets.py + build_atlas.py): ${miss.slice(0, 12).join(', ')}`);
      ok([...used].every(k=> k in sj.emoji), `${set}: holds every emoji in used.json`);
    }
  }
  // ---- 3. the CSS
  ok(/img\.tw-emoji\.emo\{[^}]*background-repeat:no-repeat/.test(tpl), 'arena_template.html styles img.tw-emoji.emo');
  ok(/def emoji_atlases\(\):/.test(fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8')), 'assemble_arena.py builds the sheets in emoji_atlases()');
  console.log(`emoji-atlas: ${n - fail}/${n} passed`);
  process.exit(fail ? 1 : 0);
})();
