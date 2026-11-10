#!/usr/bin/env node
// Package BAL19 (2026-11-06): road fights retuned toward the road curve after CONTENT12's fold (decks, leaders, the Shield), each change
// confirmed at 200 games on the road seeds (docs/balance/bal19/confirm-2026-11-06-*.json). Checks the rules the retune had to keep, on the
// decks as they are in arena_app.js now (no games played):
//   - every changed fight is in arena_app.js as the confirm file kept it, and carries a dated BAL19 comment; a reverted one is as it was;
//   - each kept change is 2+ points nearer its target at 200 games;
//   - no card new to a deck is off the fight's own list (or another fight's reward card, or over the road's rarity cap);
//   - K14 is no worse (BAL7; Map 0 exempt), the deck keeps its size and first-clear cards;
//   - no Shield override above the rule (BF3), no new or lower hqHp (owner 11-04: no lower bramble Health), no leader on a fight that had none,
//     a namesake leader kept;
//   - cards.json and skill-costs.json carry no BAL19 edit (card stats are the owner's / CONTENT12's).
//   node tests/bal19-2026-11-06.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), K = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js'));
const ENG = require(path.join(ROOT, 'bramblewood-engine.js'));
const pools = J('canonical/map-pools.json'), src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const dir = path.join(ROOT, 'docs', 'balance', 'bal19');
const rows = fs.readdirSync(dir).filter(f => /^confirm-2026-11-06-\d+\.json$/.test(f)).flatMap(f => J('docs/balance/bal19/' + f).rows);
ok(rows.length >= 40, 'the confirm files list the changed fights: ' + rows.length);
const lineOf = code => (src.match(new RegExp(`^\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*$`, 'm')) || [''])[0];
const fields = l => ({ deck: JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]), leaders: (l.match(/leaders:(\[[^\]]*\])/) || [0, null])[1], shield: (l.match(/shieldOverride:(\d+)/) || [0, null])[1], hqHp: (l.match(/hqHp:(\d+)/) || [0, null])[1] });
const size = d => Object.values(d).reduce((t, k) => t + k, 0);
const find = code => { for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower || m.endless) continue; const n = (m.nodes || []).find(x => x.key === code && x.deck); if (n) return { m, n }; } return null; };
let kept = 0;
for (const r of rows) {
  const l = lineOf(r.code), now = fields(l), f = find(r.code); ok(l && f, r.code + ': in arena_app.js'); if (!l || !f) continue;
  // FIX12 (2026-11-10): a fight a newer package retuned again (or moved) is checked and pinned by that package's test, K14 against the deck it
  // started from (tests/bal33 / bal35 / bal37 / bal39); BAL19's snapshot (its decks, leaders, deck size) no longer applies. The current decks
  // pass the K14 rule itself (tools/bal7_k14_decks_2026_10_28.js: the high counts are the fights' leaders).
  // 2026-11-11 (SKIR1): a fight SKIR1 rebuilt from its map's new list is checked by tests/skir1-2026-11-11.js (list, rarity, K14, leaders)
  if (/2026-11-09 \(BAL33\)|2026-11-10 \(BAL3[5-9]|BAL4[0-2]\): retuned|\(SKIR1( fit| repair)?\): /.test(l)) { if (r.keep) kept++; continue; } // 2026-11-10 (BAL42): + BAL40-42 (7-5, 7-6, 18-4 BAL42; 17-2 BAL41, whose K14 reads its leader); tests/bal40-42 check and pin them
  if (!r.keep) { ok(JSON.stringify(now.deck) === JSON.stringify(r.was.deck) && now.leaders === r.was.leaders && now.shield === r.was.shield, r.code + ': reverted to the fight as it was'); continue; }
  kept++;
  ok(Math.abs(r.after200 - r.target) + 2 <= Math.abs(r.before200 - r.target), `${r.code}: 2+ points nearer the target (${r.before200} -> ${r.after200}, target ${r.target})`);
  ok(/2026-11-06 \(BAL19\)/.test(l), r.code + ': dated BAL19 comment');
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
    // 2026-11-07 (BAL21): a fight BAL21 retuned again is held to K14 against the deck BAL21 started from (tests/bal21-2026-11-07.js), not BAL19's
    if (!/2026-11-07 \(BAL21\)/.test(l)) Object.keys(d).filter(nu).forEach(id => ok(d[id] <= (nuW(id) ? Math.max(1, was[id] || 0) : 1), `${r.code}: K14 ${id} x${d[id]} (was x${was[id] || 0}${nuW(id) ? '' : ', then exempt as the leader'})`));
    ok(tot(d, nu) <= Math.max(6, tot(was, nuW)), `${r.code}: K14 non-unique copies ${tot(was, nuW)} -> ${tot(d, nu)}`); }
  if (f.n.rules && f.n.rules.boon) ok(ENG.selfishBoonCount(D, d, f.n.rules.boon).on, `${r.code}: the challenge's boon ${f.n.rules.boon} stays on`);
  const rule = G.ruleShieldOf(f.n);
  ok(now.shield == null || +now.shield <= Math.max(rule, r.was.shield == null ? 0 : +r.was.shield), `${r.code}: Shield override ${now.shield} not above the rule ${rule}`);
  ok(now.hqHp === r.was.hqHp || (r.was.hqHp == null && now.hqHp == null) || (now.hqHp == null), `${r.code}: bramble Health not lowered (hqHp ${r.was.hqHp} -> ${now.hqHp})`);
  if (r.was.leaders == null && now.leaders != null) {
    const n0 = Object.assign({}, f.n, { deck: was }); delete n0.leaders; G.NODE_MAP_HINT.set(n0, MAP);
    ok((G.skirmishLeadersOf(n0, MAP) || []).length > 0, `${r.code}: a leader only where the fight had one`); }
}
ok(kept >= 35, 'kept changes: ' + kept);
// the namesake bosses keep their leaders
[['17-8', 'walrus-icebreaker']].forEach(([code, id]) => { const f = find(code); ok(f && (G.skirmishLeadersOf(f.n, f.m.id) || []).includes(id), `${code} keeps its namesake leader ${id}`); });
// no BAL19 edit in the card data
['canonical/cards.json', 'canonical/skill-costs.json'].forEach(p => ok(!/BAL19/.test(fs.readFileSync(path.join(ROOT, p), 'utf8')), p + ': no BAL19 edit'));
// the road totals
const T = J('docs/balance/bal19/road-totals-2026-11-06.json'), b = T['bal19-before'], a = T['bal19-final'] || T['bal19-after'];
ok(b.fights === 226 && a.fights === 226, 'road totals: 226 fights each');
ok(a.green > b.green && a.beyond20 < b.beyond20, `road totals: more in band (${b.green} -> ${a.green}), fewer beyond 20 (${b.beyond20} -> ${a.beyond20})`);
console.log(`bal19-2026-11-06: ${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
