#!/usr/bin/env node
// 2026-11-02 (package BAL10): the guard between tools/skirmish_pass.js curve and its apply. The curve search keeps leaders, first-clear cards
// and deck sizes (--keep-leaders --keep-first --keep-size), but it does not know two later rules, so this step checks every proposed fix:
//   - the cut-card rule (BAL9, JJ24): a card coming in must be on that fight's own list (tools/lib_map_pools.js fightPool: a main map's
//     MAP + SPECIAL, a side map's SUBMAP + SPECIAL);
//   - BAL7's K14 rule (a card not unique to the map at most 1 copy, 6 such copies in all): a fix may not add a K14 problem
//     (tools/bal7_k14_decks_2026_10_28.js violations, compared before / after);
//   - the gap: the fix must bring the fight at least 2 points closer to its target (docs/evaluation-protocol.md, the retune row).
// A rejected fix gets "apply": false and "rejected": [why] (skirmish_pass.js apply skips it). `apply` then writes the accepted decks into
// arena_app.js with a dated comment after the deck (skirmish_pass.js apply writes none).
//   node tools/bal9/road_fix_2026_11_02.js filter --fixes=<name>   (docs/balance/<name>.jsonl, rewritten in place)
//   node tools/bal9/road_fix_2026_11_02.js apply --fixes=<name> [--note="..."]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const argv = process.argv.slice(2), CMD = argv[0];
const opt = (k, d) => { const a = argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const FILE = path.join(ROOT, 'docs', 'balance', opt('fixes', 'bal10-fixes') + '.jsonl'), APP = path.join(ROOT, 'arena_app.js');
const rows = fs.readFileSync(FILE, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
if (CMD === 'filter') {
  const K = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js')), LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
  const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
  const F = {}; K.fights().forEach(f => { F[f.key] = f; });
  let ok = 0, no = 0;
  rows.forEach(x => {
    delete x.rejected; delete x.apply;
    if (!x.deck) return;
    const f = F[x.key], why = [];
    if (!f) why.push('not a K14 fight (tutorial / exempt)');
    else {
      const old = f.n.deck, pool = LP.fightPool(pools, f.map, f.m.sub ? f.m.parent : null) || new Set();
      Object.keys(x.deck).filter(id => !old[id] && !pool.has(id)).forEach(id => why.push(`${id} is not on the fight's list`));
      // 2026-11-02 (BAL11): each deck with its own leaders (an Auto leader moves with the deck and is exempt from K14)
      const VV = d => K.violations(Object.assign({}, f, { n: Object.assign({}, f.n, { deck: d }) }), d);
      const v0 = VV(old).length, v1 = VV(x.deck).length; if (v1 > v0) why.push(`K14: ${v0} -> ${v1} problems (${VV(x.deck).join('; ')})`);
      // 2026-11-02 (BAL11): nor more non-unique copies (a deck already over 6 may not add one), and a challenge deck keeps its selfish boon on
      const nu = d => { const m = VV(d).map(s => /^(\d+) non-unique copies$/.exec(s)).find(Boolean); return m ? +m[1] : 0; };
      if (nu(x.deck) > Math.max(6, nu(old))) why.push(`K14: ${nu(old)} -> ${nu(x.deck)} non-unique copies`);
      const E = require(path.join(ROOT, 'bramblewood-engine.js')), D = require(path.join(ROOT, 'tools', 'lib_bramble.js')).CARD_DEFS_BASELINE, bn = f.n.rules && f.n.rules.boon;
      if (bn && E.selfishBoonCount && E.selfishBoonCount(D, old, bn).on && !E.selfishBoonCount(D, x.deck, bn).on) why.push(`its ${bn} boon goes off`);
    }
    const before = x.before, after = x.after && x.after.win, t = x.target;
    if (after == null || Math.abs(after - t) > Math.abs(before - t) - 2) why.push(`gap ${Math.round(Math.abs(before - t))} -> ${after == null ? '?' : Math.round(Math.abs(after - t))} (needs 2+ points closer)`);
    if (why.length) { x.apply = false; x.rejected = why; no++; } else ok++;
  });
  fs.writeFileSync(FILE, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
  console.log(`accepted ${ok}, rejected ${no}`); rows.filter(r => r.rejected).forEach(r => console.log('  ' + r.key + ': ' + r.rejected.join('; ')));
} else if (CMD === 'apply') {
  const note = opt('note', 'road retune toward the road curve, swaps only');
  let s = fs.readFileSync(APP, 'utf8'), n = 0;
  const a = s.indexOf('const CONQUEST_MAPS = ['), b = s.indexOf('\n];', a); let body = s.slice(a, b);
  rows.filter(x => x.deck && x.apply !== false).forEach(x => {
    const re = new RegExp(`(\\{ ?key:\\s*['"]${x.key.replace(/[-]/g, '\\-')}['"],[^\\n]*)`), mm = body.match(re); if (!mm) { console.log('not found', x.key); return; }
    // 2026-11-02 (BAL11): a fix from `skirmish_pass.js weak` (tool: 'weak') gets its own comment: the deck rebuilt from the fight's list, weaker cards
    const c = x.tool === 'weak'
      ? `/* 2026-11-02 (BAL11, owner on BAL10-6): ${note}, ${x.before}% -> ${x.after.win}% at 40 tune games, target ${x.target} (tools/skirmish_pass.js weak: rebuilt from the fight's own list, no Baby card, leaders / first-clear cards / size kept; checked by tools/bal9/road_fix_2026_11_02.js: list, K14) */`
      : `/* 2026-11-02 (BAL10): ${note}, ${x.before}% -> ${x.after.win}% at 40-50 tune games, target ${x.target} (tools/skirmish_pass.js curve --decks-only --keep-leaders --keep-first --keep-size --pool --distinct; checked by tools/bal9/road_fix_2026_11_02.js: list, K14) */`;
    const line = mm[1].replace(/deck:\{[^}]*\}/, m => 'deck:' + JSON.stringify(x.deck) + ' ' + c);
    body = body.replace(mm[1], line); n++;
  });
  s = s.slice(0, a) + body + s.slice(b); fs.writeFileSync(APP, s); console.log('applied', n, 'fixes to arena_app.js');
} else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 13).join('\n'));
