#!/usr/bin/env node
// 2026-11-09 (package BAL33): BAL28's tuner (below, its rules and safeguards unchanged) for The Canopy after BAL28-1 a (the CPU's Canopy Bower
// has no ability there) and BAL28-2 b (Dart Frogs and Sloth Boughs swapped slots 14-A-1 / 14-A-3). Output docs/balance/bal33/tune/<code>.json,
// the apply comment dated BAL33. K14 reads the fights at --base (default HEAD: commit the slot swap first).
// 2026-11-08 (package BAL28): BAL27's tuner (below, its rules and safeguards unchanged: the fight's own list, leaders, Shield; no leader outside
// its deck in a challenge fight; CONTENT10 / LIST-1104 copy floors; --seed0) for The Canopy (14-A-*) after CONTENT18's Canopy Bower. Output
// docs/balance/bal28/tune/<code>.json, the apply comment dated BAL28. No card stat, list, field, bramble Health, level or ability is touched.
// 2026-11-08 (package BAL27): BAL26's tuner (below, its rules unchanged) for Maps 0-20 after ENG34 / ENG35 / ENG36. The brief asks for Map 5
// (Gatorback Swamp) and BAL21-1's named fights too, so neither is refused now (--skip-map5 brings the Map 5 refusal back). Output
// docs/balance/bal27/tune/<code>.json, the apply comment dated BAL27.
// 2026-11-07 (package BAL26): BAL21's tuner (below, its rules unchanged: the fight's own list, leaders, Shield; a change kept only when it is
// 2+ points nearer its target at 200 games on the road seeds; the Map reference) after ENG29 / ENG32 / ENG33 (Guardian takes the attempt, Dive,
// Brood's 1/1 copies, Venomous, Thanatosis, Log Walls). Output docs/balance/bal26/tune/<code>.json, the apply comment dated BAL26. Refused:
// Map 5 (the owner is editing it) and BAL21-1's named exceptions (1-3, 1-4, 2-1, 14-1, 14-5, 19-A-7, 19-A-8, The Canopy 14-A-*): this tool
// changes no list, so none of them can be fixed by a list-only change here.
// 2026-11-07 (package BAL21): BAL20's tuner (below) for Maps 0-20 after ENG27 / ENG28 (fire, frost, poison, darkness, arrows after the swings),
// unchanged in its rules; output docs/balance/bal21/tune/<code>.json, the apply comment dated BAL21. Map 5 (Gatorback Swamp and its side
// maps) is refused: the owner is editing that map's cards (brief 11-07). No card stat, skill, list, bramble Health or ability is touched.
// BAL20's header, as it was: 2026-11-06 (package BAL20): BAL19's road tuner (tools/bal19/road_tune_2026_11_06.js, its rules and K14 checks unchanged) for The Canopy
// (14-A-*) and Savanna Reaches (14-*) after ENG26's Acacia Kraal (Lumber 1). One change: at 0-10% a step's reading is flat (BAL19 stopped at
// the start on 14-A-1, 14-A-4, 14-A-5), so the score also counts the rounds your bramble lasts (2 points a round, on every game, wins or not)
// while the fight is more than 25 points too hard; the 200-game keep rule reads the win rate alone. Output docs/balance/bal20/tune/<code>.json.
// BAL19's header, as it was:
// Levers (the brief: "skirmish decks, leaders, bramble"; card stats and skills are not touched):
//   - the deck: tools/content12_lilypad_tune_2026_11_06.js's local search (BAL18's rules: the fight's own list, the road's rarity cap, the
//     theme, no other fight's reward, size and first-clear cards kept, copy caps, K14 (non-map-unique cards 1 copy each, 6 in all) may not get
//     worse; Map 0 is K14-exempt, BAL7-2), moves of 1, 2 or all copies of a card;
//   - the leader: another card of the fight's list (same rules) as its one leader, or none on a skirmish (its leader is hidden there); a
//     fight's namesake leader (a word of the leader's name in the fight's name: The Walrus Icebreaker) is kept;
//   - the bramble: the Shield only, an override between 0 and the rule (BF3, owner 10-19 16:22: no Shield above the rule). Not the bramble's
//     Health (owner 11-04 22:34: "Don't lower bramble health anymore") and not its ability (BAL17-1 b: the owner re-tunes those).
// A step screens every move at 20 games on the tune seeds (7300 + 37g), re-reads the best 4 at 60 (--reread N: 120 where the tune seeds and the road seeds disagree) and keeps the best if it closes the gap
// (with your bramble's damage as the tie-break, as CONTENT12's tool) by 2+ points. The pick then plays 200 games on the road measure's seeds
// (9100 + 37g) against the deck as it stands, and is kept only when it is 2+ points nearer the target there (CONTENT12's rule).
//   node tools/bal19/road_tune_2026_11_06.js run --codes 5-1,2-2 [--steps 6] [--shard 0 --shards 2]  -> docs/balance/bal19/tune/<code>.json
//   node tools/bal19/road_tune_2026_11_06.js apply [--codes ...]   writes the kept picks into arena_app.js with a dated comment (rebuild after)
//   node tools/bal19/road_tune_2026_11_06.js report               -> docs/balance/bal19/tune-2026-11-06.json (every fight: before, after, levers)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const B = require('../lib_bramble.js'), G = B.G, D = B.CARD_DEFS_BASELINE, LP = require('../lib_map_pools.js'), K = require('../bal7_k14_decks_2026_10_28.js');
let TH = null; try { TH = require('../thematic_pass_2026_10_19.js'); } catch (e) {}
const a = process.argv.slice(2), CMD = a[0] || 'run', arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const CODES = (arg('--codes', '') || '').split(',').filter(Boolean), STEPS = +arg('--steps', 6), RE = +arg('--reread', 60), SHARD = +arg('--shard', 0), SHARDS = +arg('--shards', 1);
// 2026-11-08 (BAL27 round 3): --seed0 picks the tune seeds (default 7300). On 7-5, 8-8 and 2-B-4 the 7300 seeds read 7-15 points off the
// road seeds (9100), so the search stopped at its start; round 3 screens on a third set (11300) and re-reads at 120 games
const SEED0 = +arg('--seed0', 7300);
const OUTDIR = path.join(ROOT, 'docs', 'balance', 'bal35', arg('--dir', 'tune')); // --dir tune-r2: a second round from the applied first
const ENG = require(path.join(ROOT, 'bramblewood-engine.js'));
const BASE_SRC =require('child_process').execSync(`git show ${arg('--base', 'HEAD')}:arena_app.js`, { cwd: ROOT, maxBuffer: 1 << 28 }).toString();
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
const size = d => Object.values(d).reduce((t, k) => t + k, 0);
const keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');

const KEEP_MIN = { '2-2': { 'rock-pool-starfish': 2 }, '2-5': { 'rock-pool-starfish': 2 } }; // 2026-11-08 (BAL27 round 3): round 1 cut 2-2's Starfish to 1
const BAL21_1 = ['1-3', '1-4', '2-1', '14-1', '14-5', '19-A-7', '19-A-8']; // BAL26: + The Canopy (14-A-*)
function fightOf(code) {
  for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower || m.endless) continue; const n = (m.nodes || []).find(x => x.key === code); if (n && n.deck) return { m, n }; }
  throw new Error('no fight ' + code);
}
function setup(code) {
  const { m, n: node0 } = fightOf(code), MAP = m.id, mapNo = G.mapNumberOf(MAP), kind = node0.kind || 'skirmish';
  if (mapNo === 5 && a.includes('--skip-map5')) throw new Error(code + ': Map 5 (Gatorback Swamp) skipped (--skip-map5)'); // BAL27: the brief tunes Map 5 and BAL21_1's fights
  // K14 is read with the fight's leaders as they were at --base (default HEAD): a leader this package gave a fight exempts nothing (a
  // round-2 move must not pile copies onto a round-1 leader)
  const baseLine = (BASE_SRC.match(new RegExp(`^\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*$`, 'm')) || [''])[0], baseL = (baseLine.match(/leaders:(\[[^\]]*\])/) || [0, null])[1];
  const nK = Object.assign({}, node0); delete nK.leaders; if (baseL) nK.leaders = JSON.parse(baseL);
  const fK = { map: MAP, mapNo, side: !!m.sub, key: code, kind, name: node0.name, m, n: nK }, k14Exempt = MAP === 'm1' || /^T-/.test(code); // BAL7-2
  const list = LP.fightPool(pools, MAP, m.sub ? m.parent : null) || new Set();
  const first = new Set((G.nodeFirstClearCardIds || G.nodeRewardCardIds)(MAP, code) || []);
  const n0 = Object.keys(node0.deck).length, S0 = size(node0.deck);
  const cap = id => Math.max(node0.deck[id] || 0, Math.min(4, G.maxCopiesForRarity(D[id].rarity)));
  const otherReward = id => { const s = (D[id] || {}).source; return !!(s && s.kind === 'map' && s.node && !(s.id === MAP && s.node === code)); };
  const inOk = id => D[id] && !D[id].token && !D[id].test && D[id].kind !== 'baby' && !/^egg-/.test(id) && !(D[id].effects || {}).leader && G.roadRarityOk(D[id].rarity, mapNo, kind)
    && !otherReward(id) && !(TH && TH.offThemeFor(MAP, node0, id));
  const ins = [...new Set([...list].filter(inOk).concat(Object.keys(node0.deck)))].sort();
  const k14 = d => k14Exempt ? 0 : K.violations(fK, d).length, K0 = k14(node0.deck); // K14 read with the fight's own leaders (a new leader exempts nothing)
  // K14 per card (BAL19 fix, 2026-11-06): against the deck at --base, a non-map-unique card keeps at most max(1, its copies there) and those
  // cards at most max(6, their total there); a card is exempt as a leader only while it leads both at --base and in the variant (a leader
  // swapped out loses its exemption; skirmish_pass.js curve --strict counts violations only, which let Beaver Lumberjack go x3 -> x4)
  const baseDeck = JSON.parse((baseLine.match(/deck:(\{[^}]*\})/) || [0, JSON.stringify(node0.deck)])[1]), U = k14Exempt ? null : K.uniqueOf(MAP), Lbase = baseL ? JSON.parse(baseL) : (() => { const n = Object.assign({}, nK, { deck: baseDeck }); G.NODE_MAP_HINT.set(n, MAP); return G.skirmishLeadersOf(n, MAP) || []; })();
  // with no explicit leaders a skirmish is led by its deck's showcase (nodeShowcaseId: the rarest, strongest card), so a deck move can change it
  const leadOf = (d, leaders) => { if (leaders) return leaders; const n = Object.assign({}, node0, { deck: d }); G.NODE_MAP_HINT.set(n, MAP); try { return G.skirmishLeadersOf(n, MAP) || []; } catch (e) { return []; } };
  const k14Ok = (d, leaders) => { if (k14Exempt) return true; const L = new Set(leadOf(d, leaders).filter(id => Lbase.includes(id))), nu = id => !U.has(id) && !L.has(id), nuB = id => !U.has(id) && !Lbase.includes(id);
    const tot = (x, p) => Object.keys(x).filter(p).reduce((t, id) => t + x[id], 0); // a card exempt at --base as the leader is held to 1 once it no longer leads
    return Object.keys(d).filter(nu).every(id => d[id] <= (nuB(id) ? Math.max(1, baseDeck[id] || 0) : 1)) && tot(d, nu) <= Math.max(6, tot(baseDeck, nuB)); };
  const dMax = kind === 'skirmish' ? Math.max(6, n0) : Math.max(8, n0), dMin = Math.min(5, n0);
  const legal = (d, leaders) => size(d) === S0 && Object.keys(d).length >= dMin && Object.keys(d).length <= dMax && Object.entries(d).every(([id, k]) => k >= 1 && k <= cap(id))
    && [...first].every(id => !node0.deck[id] || d[id]) && k14(d) <= K0 && k14Ok(d, leaders)
    && !(node0.rules && node0.rules.boon && !ENG.selfishBoonCount(D, d, node0.rules.boon).on) // a challenge deck keeps its selfish boon on (DF3)
    && !(node0.challenge && leaders && leaders.some(id => !d[id]))
    && Object.entries(KEEP_MIN[code] || {}).every(([id, k]) => (d[id] || 0) >= k); // 2026-11-08 (BAL27 round 3): CONTENT10 / LIST-1104 slots (tests/content10-2026-11-05.js 3) // 2026-11-08 (BAL27 round 3): a challenge skirmish leads with a card of its deck (tests/df3-2026-10-24.js 3; round 1 gave 5-3 an off-deck leader)
  let leaders0 = []; try { leaders0 = G.skirmishLeadersOf(node0, MAP) || []; } catch (e) {}
  const words = s => String(s || '').toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length >= 4 && !['the', 'king', 'queen'].includes(w));
  const fw = new Set(words(node0.name)), namesake = leaders0.some(id => words((D[id] || {}).name).some(w => fw.has(w)));
  const leaderCands = namesake || !leaders0.length ? [] : // a fight with no leader gets none (Maps 0-1's skirmishes have none, SKIRMISH_LEADER_FROM_MAP)
    ins.filter(id => !leaders0.includes(id)).concat(kind === 'skirmish' && leaders0.length ? [null] : []);
  G.NODE_MAP_HINT.set(node0, MAP);
  // 2026-11-08 (BAL27): a challenge skirmish (node.challenge, DF3-1) aims 10 points under its curve target, as skirmish_pass.js measure
  // reads it (CHALLENGE_DROP); BAL19-26's tuner aimed it at the plain curve target, 10 points too easy
  const band0 = G.skirmishTargetBand(MAP, node0), drop = node0.challenge && band0.curve ? 0.10 : 0;
  const band = Object.assign({}, band0, drop ? { t: band0.t - drop, lo: band0.t - drop - 0.08, hi: band0.t - drop + 0.08 } : {}), want = band.t * 100, lo = band.lo * 100, hi = band.hi * 100;
  const rule = G.ruleShieldOf(node0), ov0 = node0.shieldOverride == null || node0.shieldOverride === '' ? null : +node0.shieldOverride;
  return { code, MAP, m, node0, mapNo, kind, ins, first: [...first], K0, k14, k14Ok, legal, leaders0, namesake, leaderCands, want, lo, hi, rule, ov0, cap };
}
// a variant: {deck, leaders (null = as the fight has it, [] none, [id]), shield (null = as it has it, else the override)}
function nodeOf(F, v) {
  const nn = Object.assign({}, F.node0, { deck: v.deck });
  if (v.leaders) nn.leaders = v.leaders.slice();
  if (v.shield != null) nn.shieldOverride = v.shield;
  G.NODE_MAP_HINT.set(nn, F.MAP); return nn;
}
// BAL20: simulateReferenceFight's games (referenceFightSetup + playReferenceGame, the same seeds), with the mean rounds over every game
function measure(F, v, games, seed0) { const ctx = G.referenceFightSetup(F.MAP, nodeOf(F, v), { seed0 }); let wins = 0, lost = 0, rounds = 0;
  for (let g = 0; g < games; g++) { const r = G.playReferenceGame(ctx, g); rounds += r.rounds; if (r.win) { wins++; lost += 1 - r.hpLeft; } else lost += 1; }
  return { win: Math.round(wins / games * 1000) / 10, hpLost: Math.round(lost / games * 1000) / 10, rounds: Math.round(rounds / games * 100) / 100, shield: ctx.sc.shield }; }
const vkey = v => keyOf(v.deck) + '|L' + (v.leaders ? v.leaders.join('+') || '-' : '=') + '|S' + (v.shield == null ? '=' : v.shield);
const desc = (F, v) => ({ deck: v.deck, leaders: v.leaders || F.leaders0, shieldOverride: v.shield == null ? F.ov0 : v.shield });

function tune(code) {
  const F = setup(code), t0 = Date.now();
  const P = r => Math.abs(r.win - F.want) + 10 * (r.win > F.want ? 1 - r.hpLost / 100 : r.hpLost / 100) - (r.win < F.want - 25 ? 2 * r.rounds : 0); // BAL20: + the rounds term
  const cache = new Map(), T = (v, g) => { const k = vkey(v) + '#' + g; if (!cache.has(k)) cache.set(k, measure(F, v, g, SEED0)); return cache.get(k); };
  let cur = { deck: Object.assign({}, F.node0.deck), leaders: null, shield: null }, r = T(cur, RE); const trail = [{ move: 'start', win: r.win, hpLost: r.hpLost, rounds: r.rounds }];
  const curShieldRaw = v => v.shield != null ? v.shield : F.ov0 != null ? F.ov0 : F.rule;
  for (let step = 0; step < STEPS; step++) {
    if (Math.abs(r.win - F.want) <= 4) break;
    const easy = r.win > F.want, cands = [];
    for (const out of Object.keys(cur.deck)) for (const inn of F.ins) { if (inn === out) continue;
      const have = cur.deck[out]; for (const k of [...new Set([1, 2, have])].filter(k => k <= have)) {
        const d = Object.assign({}, cur.deck); d[out] -= k; if (!d[out]) delete d[out]; d[inn] = (d[inn] || 0) + k; if (!F.legal(d, cur.leaders)) continue;
        cands.push({ v: Object.assign({}, cur, { deck: d }), mv: `${out} -${k} -> ${inn}` }); } }
    if (!cur.leaders) for (const id of F.leaderCands) if (F.legal(cur.deck, id ? [id] : [])) cands.push({ v: Object.assign({}, cur, { leaders: id ? [id] : [] }), mv: 'leader ' + (F.leaders0.join('+') || '-') + ' -> ' + (id || 'none') });
    const sNow = F.MAP === 'mpd' ? -1 : curShieldRaw(cur); // the Pale Desert keeps its bramble by rule (tests/pale-desert-2026-10-19.js 3)
    if (!easy && sNow > 0) for (const s of [...new Set([0, Math.floor(sNow / 4), Math.floor(sNow / 2), Math.floor(sNow * 3 / 4)])].filter(s => s < sNow)) cands.push({ v: Object.assign({}, cur, { shield: s }), mv: 'shield ' + sNow + ' -> ' + s });
    if (easy && sNow >= 0 && sNow < F.rule) for (const s of [...new Set([F.rule, Math.ceil((sNow + F.rule) / 2)])].filter(s => s > sNow)) cands.push({ v: Object.assign({}, cur, { shield: s }), mv: 'shield ' + sNow + ' -> ' + s });
    const screened = cands.map(c => Object.assign(c, { r20: T(c.v, 20) })).sort((p, q) => P(p.r20) - P(q.r20)).slice(0, 4);
    const best = screened.map(c => Object.assign(c, { r60: T(c.v, RE) })).sort((p, q) => P(p.r60) - P(q.r60))[0];
    if (!best || P(best.r60) > P(r) - 2) break;
    cur = best.v; r = best.r60; trail.push({ move: best.mv, win: r.win, hpLost: r.hpLost, rounds: r.rounds, trials: cands.length });
    console.log(code, step + 1, best.mv, r.win, r.rounds);
  }
  const orig = { deck: F.node0.deck, leaders: null, shield: null };
  const was200 = measure(F, orig, 200, 9100), changed = vkey(cur) !== vkey(orig), now200 = changed ? measure(F, cur, 200, 9100) : was200;
  const gap = x => Math.abs(x - F.want), keep = changed && gap(now200.win) + 2 <= gap(was200.win);
  const res = { about: 'BAL35 road retune (tools/bal35/road_tune_2026_11_10.js)', code, map: F.MAP, mapName: F.m.name, kind: F.kind, name: F.node0.name,
    band: { lo: F.lo, hi: F.hi, target: F.want }, list: F.ins, firstClear: F.first, k14Before: F.K0, leaders: F.leaders0, namesake: F.namesake, shieldRule: F.rule, shieldOverride: F.ov0,
    before: Object.assign(desc(F, orig), { win200: was200.win, shown: was200.shield }), pick: Object.assign(desc(F, cur), { win200: now200.win, shown: now200.shield, tune60: r.win }),
    keep, k14After: F.k14(cur.deck), trail, trials: cache.size, sec: Math.round((Date.now() - t0) / 1000) };
  fs.mkdirSync(OUTDIR, { recursive: true }); fs.writeFileSync(path.join(OUTDIR, code + '.json'), JSON.stringify(res, null, 1) + '\n');
  console.log(code, 'target', F.want, '| 200 games:', was200.win, '->', now200.win, keep ? 'KEEP' : 'no', '|', trail.map(t => t.move).join('; '), '|', res.sec + 's');
  return res;
}

if (CMD === 'run') {
  CODES.filter((c, i) => i % SHARDS === SHARD).forEach(c => { if (a.includes('--resume') && fs.existsSync(path.join(OUTDIR, c + '.json'))) return; tune(c); });
} else if (CMD === 'apply') {
  const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'), n = 0;
  const files = fs.readdirSync(OUTDIR).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(OUTDIR, f), 'utf8'))).filter(x => x.keep && (!CODES.length || CODES.includes(x.code)));
  for (const x of files) {
    const re = new RegExp(`(\\{ ?key:\\s*['"]${x.code.replace(/[-]/g, '\\-')}['"],[^\\n]*)`), mm = s.match(re); if (!mm) throw new Error('node not found ' + x.code);
    let line = mm[1]; const what = [];
    if (keyOf(x.pick.deck) !== keyOf(x.before.deck)) { line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(x.pick.deck)); what.push('deck (was ' + JSON.stringify(x.before.deck) + ')'); }
    if ((x.pick.leaders || []).join('+') !== (x.before.leaders || []).join('+')) {
      const L = 'leaders:' + JSON.stringify(x.pick.leaders || []);
      line = /leaders:\[[^\]]*\]/.test(line) ? line.replace(/leaders:\[[^\]]*\]/, L) : line.replace(/deck:/, L + ', deck:'); what.push('leader ' + (x.before.leaders.join('+') || 'none') + ' -> ' + ((x.pick.leaders || []).join('+') || 'none')); }
    if (x.pick.shieldOverride !== x.before.shieldOverride) {
      line = /shieldOverride:\d+/.test(line) ? line.replace(/shieldOverride:\d+/, 'shieldOverride:' + x.pick.shieldOverride) : line.replace(/deck:/, `shieldOverride:${x.pick.shieldOverride}, deck:`);
      what.push('Shield override ' + (x.before.shieldOverride == null ? 'rule ' + x.shieldRule : x.before.shieldOverride) + ' -> ' + x.pick.shieldOverride); }
    line = line.replace(/(deck:\{[^}]*\})/, `$1 /* 2026-11-10 (BAL35): retuned toward the road curve after ENG38-40 / BAL34 (target ${Math.round(x.band.target * 10) / 10}), ${x.before.win200}% -> ${x.pick.win200}% at 200 games; ${what.join('; ')} */`);
    s = s.replace(mm[1], line); n++; console.log('applied', x.code, x.before.win200, '->', x.pick.win200, what.length);
  }
  fs.writeFileSync(APP, s); console.log('applied', n);
} else if (CMD === 'report') {
  const rows = fs.readdirSync(OUTDIR).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(OUTDIR, f), 'utf8')))
    .map(x => ({ code: x.code, map: x.map, mapName: x.mapName, kind: x.kind, target: x.band.target, before200: x.before.win200, after200: x.keep ? x.pick.win200 : x.before.win200, keep: x.keep,
      moves: x.keep ? x.trail.slice(1).map(t => t.move) : [], tried: x.trail.slice(1).map(t => t.move), pick200: x.pick.win200, k14: [x.k14Before, x.k14After] }));
  const out = path.join(ROOT, 'docs', 'balance', 'bal35', arg('--report', 'tune-2026-11-10.json')); fs.writeFileSync(out, JSON.stringify(rows, null, 1) + '\n');
  rows.forEach(x => console.log(x.code.padEnd(8), 't', x.target, x.before200, '->', x.after200, x.keep ? 'KEEP' : '', x.moves.join('; ')));
}
module.exports = { setup, measure, nodeOf }; // 2026-11-08 (BAL28): tools/bal28/canopy_space_2026_11_08.js walks a fight's whole legal space with these rules
