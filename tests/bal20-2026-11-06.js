#!/usr/bin/env node
// Package BAL20 (2026-11-06): The Canopy (14-A-*) and Savanna Reaches (14-*) retuned after ENG26's Acacia Kraal (decks and leaders; no Shield,
// level, card, list or bramble change), each change confirmed at 200 games on the road seeds (docs/balance/bal20/confirm-2026-11-06.json).
// BAL19's checks (tests/bal19-2026-11-06.js) on the decks as they are in arena_app.js now (no games played): the line as the confirm file kept
// it with a dated BAL20 comment, 2+ points nearer the target, the fight's own list, rarity cap, no other fight's reward, K14 no worse per card,
// size and first-clear cards kept, Shield not above the rule, no lower bramble Health, a leader only where the fight had one; the enemy level
// still the schedule's (no enemyLevel on Maps 14 / 14-A); cards.json and skill-costs.json untouched; the road totals no worse.
//   node tests/bal20-2026-11-06.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), K = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js'));
const ENG = require(path.join(ROOT, 'bramblewood-engine.js'));
const pools = J('canonical/map-pools.json'), src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const rows = J('docs/balance/bal20/confirm-2026-11-06.json').rows;
ok(rows.length >= 4, 'the confirm file lists the changed fights: ' + rows.length);
ok(rows.every(r => /^14-/.test(r.code)), 'only Savanna Reaches and The Canopy changed');
const lineOf = code => (src.match(new RegExp(`^\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*$`, 'm')) || [''])[0];
const fields = l => ({ deck: JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]), leaders: (l.match(/leaders:(\[[^\]]*\])/) || [0, null])[1], shield: (l.match(/shieldOverride:(\d+)/) || [0, null])[1], hqHp: (l.match(/hqHp:(\d+)/) || [0, null])[1] });
const size = d => Object.values(d).reduce((t, k) => t + k, 0);
const find = code => { for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower || m.endless) continue; const n = (m.nodes || []).find(x => x.key === code && x.deck); if (n) return { m, n }; } return null; };
let kept = 0;
for (const r of rows) {
  const l = lineOf(r.code), now = fields(l), f = find(r.code); ok(l && f, r.code + ': in arena_app.js'); if (!l || !f) continue;
  if (/2026-11-10 \(BAL35\): retuned/.test(l)) { if (r.keep) kept++; continue; } // 2026-11-10 (BAL35): retuned again (the worst road maps); tests/bal35-2026-11-10.js checks and pins it now
  if (/2026-11-09 \(BAL33\)/.test(l)) { if (r.keep) kept++; continue; } // 2026-11-09 (BAL33): a Canopy fight BAL33 moved (BAL28-2 b) or retuned; tests/bal33-2026-11-09.js checks it
  if (!r.keep) { ok(JSON.stringify(now.deck) === JSON.stringify(r.was.deck) && now.leaders === r.was.leaders && now.shield === r.was.shield, r.code + ': reverted to the fight as it was'); continue; }
  kept++;
  ok(Math.abs(r.after200 - r.target) + 2 <= Math.abs(r.before200 - r.target), `${r.code}: 2+ points nearer the target (${r.before200} -> ${r.after200}, target ${r.target})`);
  ok(/2026-11-06 \(BAL20\)/.test(l), r.code + ': dated BAL20 comment');
  ok(!/enemyLevel:/.test(l), r.code + ': no Enemy level override (the schedule, BAL2-1)');
  const MAP = f.m.id, mapNo = G.mapNumberOf(MAP), kind = f.n.kind || 'skirmish', was = r.was.deck, d = now.deck;
  const list = LP.fightPool(pools, MAP, f.m.sub ? f.m.parent : null) || new Set();
  Object.keys(d).filter(id => !was[id]).forEach(id => {
    const s = (D[id] || {}).source;
    ok(D[id] && list.has(id), `${r.code}: ${id} is on the fight's list`);
    ok(D[id] && G.roadRarityOk(D[id].rarity, mapNo, kind), `${r.code}: ${id} within the road's rarity cap`);
    ok(!(s && s.kind === 'map' && s.node && !(s.id === MAP && s.node === r.code)), `${r.code}: ${id} is not another fight's reward card`); });
  ok(size(d) === size(was), `${r.code}: deck size kept (${size(was)} -> ${size(d)})`);
  const first = (G.nodeFirstClearCardIds || G.nodeRewardCardIds)(MAP, r.code) || [];
  first.filter(id => was[id]).forEach(id => ok(d[id] > 0, `${r.code}: first-clear card ${id} kept`));
  if (MAP !== 'm1') { const fK = { map: MAP, key: r.code, n: Object.assign({}, f.n, { leaders: r.was.leaders ? JSON.parse(r.was.leaders) : undefined }) };
    if (!r.was.leaders) delete fK.n.leaders;
    ok(K.violations(fK, d).length <= K.violations(fK, was).length, `${r.code}: K14 no worse`);
    // per card: a non-map-unique card at most max(1, its copies before), those cards at most max(6, their total before); a leader is exempt
    // only while it leads both before and now
    const U = K.uniqueOf(MAP), Lw = r.was.leaders ? JSON.parse(r.was.leaders) : (() => { const n0 = Object.assign({}, f.n, { deck: was }); delete n0.leaders; G.NODE_MAP_HINT.set(n0, MAP); return G.skirmishLeadersOf(n0, MAP) || []; })();
    const Ln = G.skirmishLeadersOf(f.n, MAP) || [], L = new Set(Lw.filter(id => Ln.includes(id))), nu = id => !U.has(id) && !L.has(id), nuW = id => !U.has(id) && !Lw.includes(id);
    const tot = (x, p) => Object.keys(x).filter(p).reduce((t, id) => t + x[id], 0);
    Object.keys(d).filter(nu).forEach(id => ok(d[id] <= (nuW(id) ? Math.max(1, was[id] || 0) : 1), `${r.code}: K14 ${id} x${d[id]} (was x${was[id] || 0}${nuW(id) ? '' : ', then exempt as the leader'})`));
    ok(tot(d, nu) <= Math.max(6, tot(was, nuW)), `${r.code}: K14 non-unique copies ${tot(was, nuW)} -> ${tot(d, nu)}`); }
  if (f.n.rules && f.n.rules.boon) ok(ENG.selfishBoonCount(D, d, f.n.rules.boon).on, `${r.code}: the challenge's boon ${f.n.rules.boon} stays on`);
  const rule = G.ruleShieldOf(f.n);
  ok(now.shield == null || +now.shield <= Math.max(rule, r.was.shield == null ? 0 : +r.was.shield), `${r.code}: Shield override ${now.shield} not above the rule ${rule}`);
  ok(now.hqHp === r.was.hqHp || (r.was.hqHp == null && now.hqHp == null) || (now.hqHp == null), `${r.code}: bramble Health not lowered (hqHp ${r.was.hqHp} -> ${now.hqHp})`);
  if (r.was.leaders == null && now.leaders != null) {
    const n0 = Object.assign({}, f.n, { deck: was }); delete n0.leaders; G.NODE_MAP_HINT.set(n0, MAP);
    ok((G.skirmishLeadersOf(n0, MAP) || []).length > 0, `${r.code}: a leader only where the fight had one`); }
}
ok(kept >= 4, 'kept changes: ' + kept);
// Acacia Kraal as the owner set it (ENG26: start Lumber 1, first unit +3 Attack)
{ const K = B.CHARACTER_DEFS['acacia-kraal']; ok(K && K.effects.startGold === 1 && K.effects.firstUnitAtkBonus === 3, 'Acacia Kraal unchanged (Lumber 1, first unit +3)'); }
// no BAL20 edit in the card data
['canonical/cards.json', 'canonical/skill-costs.json'].forEach(p => ok(!/BAL20/.test(fs.readFileSync(path.join(ROOT, p), 'utf8')), p + ': no BAL20 edit'));
// the road totals
const T = J('docs/balance/bal20/road-totals-2026-11-06.json'), b = T['bal20-before'], a = T['bal20-final'];
ok(b.fights === 226 && a.fights === 226, 'road totals: 226 fights each');
ok(a.green >= b.green && a.beyond20 <= b.beyond20, `road totals: more in band (${b.green} -> ${a.green}), fewer beyond 20 (${b.beyond20} -> ${a.beyond20})`);
console.log(`bal20-2026-11-06: ${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
