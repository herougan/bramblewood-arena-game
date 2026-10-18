#!/usr/bin/env node
// Emoji scan (2026-10-17): lists every RGI emoji sequence the game's sources use (incl. ZWJ sequences, keycaps, flags and
// variation selectors), so tools/emoji/build_sets.py bundles only those pictures. Prints JSON to stdout:
//   [{seq: "<the emoji as written>", key: "<lowercase hex codepoints joined by '-', FE0F removed>", count, needsVS}]
// needsVS = the base is text-presentation by default, so the game only draws it as a picture when FE0F follows it
// (the same rule the browser uses). Usage: node tools/emoji/scan_emoji.js > tools/emoji/used.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const files = [];
for (const f of fs.readdirSync(ROOT)) if (/^(arena_app\.js|arena_template\.html|assemble_arena\.py|bramblewood-.*\.js)$/.test(f)) files.push(path.join(ROOT, f));
// 2026-10-18: lang/cards and lang/ui too (the card-name and UI packs), so a pack's emoji can't be missed
for (const dir of ['canonical', 'lang', 'lang/cards', 'lang/ui']) if (fs.existsSync(path.join(ROOT, dir))) for (const f of fs.readdirSync(path.join(ROOT, dir))) if (f.endsWith('.json')) files.push(path.join(ROOT, dir, f));
const RE = /\p{RGI_Emoji}/gv;
// A text-presentation symbol written WITHOUT FE0F (the game writes "⚔", "❤", "🛡" bare in many places) is still drawn as a
// picture when it is pictorial: U+2600–27BF (misc symbols, dingbats) and U+1F000+, minus the marks the UI uses as plain text
// (✔ ✖ ➡). Arrows, ▶ ◀ ▪ and the ⏸ ⏭ media marks stay text unless FE0F follows them. Same rule in arena_app.js EmojiStyle.
const BARE_OK = c => { const n = c.codePointAt(0); return (n >= 0x1f000 || (n >= 0x2600 && n <= 0x27bf)) && !/[✔✖➡]/u.test(c); };
const BARE_RE = /(?<![‍])(?![0-9#*])\p{Emoji}(?![️‍⃣])/gu;
const seen = new Map();
for (const fp of files) {
  let txt = fs.readFileSync(fp, 'utf8');
  // \u{...} / \uXXXX escapes in JS source become their characters for the scan
  // (2026-10-18: \ufe0f too: cards.json writes 🐻‍❄️ as \ud83d\udc3b\u200d\u2744\ufe0f, and without its FE0F the ZWJ sequence was missed)
  txt = txt.replace(/\\u\{([0-9a-fA-F]{4,6})\}/g, (m, h) => String.fromCodePoint(parseInt(h, 16)))
           .replace(/(\\u[dD][89abAB][0-9a-fA-F]{2}\\u[dD][c-fC-F][0-9a-fA-F]{2})|\\u(2[0-9a-fA-F]{3}|3[0-2][0-9a-fA-F]{2}|[fF][eE]0[fF])/g, m => { try { return JSON.parse('"' + m + '"'); } catch (e) { return m; } });
  for (const m of txt.matchAll(RE)) {
    const seq = m[0];
    const cps = [...seq].map(c => c.codePointAt(0).toString(16));
    const key = cps.filter(c => c !== 'fe0f').join('-');
    const base = String.fromCodePoint(parseInt(cps[0], 16));
    const single = cps.filter(c => c !== 'fe0f').length === 1;
    const needsVS = single && !/\p{Emoji_Presentation}/u.test(base) && !BARE_OK(base);
    const e = seen.get(key) || {seq, key, count: 0, needsVS};
    e.count++;
    if (seq.length > e.seq.length) e.seq = seq;
    seen.set(key, e);
  }
  for (const m of txt.matchAll(BARE_RE)) {
    const c = m[0];
    if (/\p{Emoji_Presentation}/u.test(c) || !BARE_OK(c)) continue;
    const key = c.codePointAt(0).toString(16);
    const e = seen.get(key) || {seq: c + '️', key, count: 0, needsVS: false};
    e.count++; e.needsVS = false;
    seen.set(key, e);
  }
}
const out = [...seen.values()].sort((a, b) => a.key < b.key ? -1 : 1);
process.stdout.write(JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{') + '\n');
process.stderr.write(`${out.length} emoji sequences in ${files.length} files\n`);
