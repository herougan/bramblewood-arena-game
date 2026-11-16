#!/usr/bin/env node
// 2026-11-16 (package CHEAT2, owner 11-16 23:53: "upgrade cheat-detection"). The CHEAT2 block of arena_app.js (cheat signals that flag, never
// block) runs in a sandbox with the game's own saveCurrencies / grantCurrency / saveCardCopies and a fake localStorage and clock:
//   1. normal play (grants, spends, a cloud load, a fight, a reload) raises no flag
//   2. a save edited outside the game (wallet, card copies) is flagged at the next load, once
//   3. a console jump, an impossible wallet, too many copies are flagged; Admin Mode and the cloud load are not
//   4. fights: too fast, impossible rounds, a win streak, an unowned card flag; a normal win, a loss, an admin test / Admin win don't
//   5. the clock: going back an hour, 15+ minutes off the server; a small drift is fine
//   6. the fight record (seed, deck, copy levels, build, card hash) is compact
//   7. reporting: guests never; signed in: report_cheat_flags, else one batched feedback row a day that fits the feedback table
//   8. wiring: the hooks in the app, the proposed SQL (not applied), the decision, the CHANGELOG, run-all.sh
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('no block ' + a); return src.slice(i, j + b.length); };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), _m: m}; };
const BLOCK = between('// CHEAT2:BEGIN', '// CHEAT2:END');
const APP = ['saveCurrencies', 'grantCurrency', 'saveCardCopies'].map(fnSrc).join('\n');
const T0 = Date.parse('2026-11-16T12:00:00Z');

// One page load: a fresh sandbox over the same storage (a reload keeps localStorage, loses memory).
function load(ls, opts){
  opts = opts || {};
  const clock = {now: opts.now || T0};
  class FakeDate extends Date { constructor(...a){ super(...(a.length ? a : [clock.now])); } static now(){ return clock.now; } }
  const calls = {rpc: [], insert: []}, timers = [];
  const ctx = {localStorage: ls, Date: FakeDate, Math, JSON, Number, Object, Array, Set, String, isFinite, console,
    setTimeout: (fn, ms)=>{ timers.push({fn, ms}); return timers.length; },
    CURRENCY_META: {gold: {}, gems: {}, dust: {}, metal: {}, kibble: {}}, KROONI_RETIRED: false,
    cloudPushCurrencies(){}, soonCheckMilestones(){}, CARD_DUPS_LIFETIME_KEY: 'bramblewood_card_dups_lifetime_v1', myCardDupsLifetime: {},
    myCurrencies: null, myCardCopies: {}, adminModeEnabled: false, adminAllowed: ()=> true, HERO_ID: 'hero', BUILD_ID: 'b1234',
    currentMatchSeed: 123456789, currentCardDataHash: ()=> 'h'.repeat(64), getCardDefs: ()=> ({fox: {}, owl: {}, wolf: {}, dragon: {}}),
    ownedCopiesOf: id=> ({fox: 3, owl: 2, wolf: 1}[id] || 0), isUnlimitedCard: ()=> false, deckCopyEntries: (id, k)=> Array.from({length: k}, (_, i)=> ({L: 5 - i, gem: null})),
    sbClient: null, signedIn: false, isSignedIn(){ return ctx.signedIn; }, cloudUserId: null, rpcMissing: e=> !!e && (e.code === 'PGRST202' || e.code === '42883')};
  vm.createContext(ctx);
  vm.runInContext(BLOCK + '\n' + APP + '\nthis.__t = {cheat2Boot, cheat2Flags, cheat2Flag, cheat2Rebase, cheat2FightStart, cheat2FightEnd, cheat2FightRecord, cheat2Clock, cheat2Report, cheat2State, cheat2Mem, CHEAT2_KEY};', ctx);
  const raw = ls.getItem('bramblewood_arena_currencies');
  ctx.myCurrencies = raw ? JSON.parse(raw) : {gold: 200, gems: 20, dust: 60, metal: 0, raidPoints: 5, kibble: 4}; // loadCurrencies' first-run seed
  const rawC = ls.getItem('bramblewood_arena_card_copies'); ctx.myCardCopies = rawC ? JSON.parse(rawC) : {};
  ctx.__t.cheat2Boot();
  return {ctx, t: ctx.__t, clock, calls, timers, run: code=> vm.runInContext(code, ctx), kinds: ()=> ctx.__t.cheat2Flags().map(f=> f.k)};
}
const copies = k=> Array.from({length: k}, (_, i)=> ({u: 'c' + i, l: 1}));

// ---------------------------------------------------------------- 1. normal play
const ls = fakeStorage();
let P = load(ls);
P.run(`saveCurrencies(); grantCurrency('gold', 1500); grantCurrency('gold', 1500); grantCurrency('dust', 2600); grantCurrency('gems', 30);`);
P.run(`myCurrencies.gold -= 2000; saveCurrencies(); myCurrencies.dust = (myCurrencies.dust||0) + 40; saveCurrencies();`); // a spend; the starter gift (+40 Dust, not through grantCurrency)
P.run(`grantCurrency('metal', 3); myCardCopies = {fox: ${JSON.stringify(copies(3))}, owl: ${JSON.stringify(copies(2))}}; saveCardCopies();`);
// a cloud load: the server's (richer) wallet replaces this one, then settleRaidPoints saves it the normal way
P.t.cheat2Rebase({gold: 90000, gems: 900, dust: 70000, metal: 40}); P.run(`myCurrencies = {gold: 90000, gems: 900, dust: 70000, metal: 40, raidPoints: 5}; saveCurrencies(true); saveCurrencies();`);
P.t.cheat2FightStart({fox: 3, owl: 2, hero: 1});
P.clock.now += 95e3;
let ks = P.t.cheat2FightEnd({mode: 'conquest', winner: 1, round: 9, conquestNode: {mapId: 'm3', nodeId: '3-2'}, transcript: []});
ok(ks.length === 0, 'a normal 95 s win raises nothing: ' + ks);
P.t.cheat2FightStart({fox: 3}); P.clock.now += 40e3; P.t.cheat2FightEnd({mode: 'conquest', winner: 2, round: 6});
P.t.cheat2Clock(P.clock.now + 40e3); // the server 40 s ahead: fine
ok(P.kinds().length === 0, 'normal play: no flag (' + P.kinds().join(', ') + ')');
P = load(ls, {now: T0 + 3600e3});
ok(P.kinds().length === 0, 'a reload after normal play: no flag (' + P.kinds().join(', ') + ')');
ok(P.t.cheat2Mem.last && P.t.cheat2Mem.last.gold === 90000, 'the wallet as loaded is the starting point');
P.run(`grantCurrency('gold', 1800); myCurrencies.gold -= 50; saveCurrencies();`);
ok(P.kinds().length === 0, 'play after the reload: still no flag');
// a save from before CHEAT2 (no seal): sealed, not flagged
const old = fakeStorage(); old.setItem('bramblewood_arena_currencies', JSON.stringify({gold: 4321, gems: 9, dust: 5, metal: 0}));
P = load(old); ok(P.kinds().length === 0, 'a save from before CHEAT2 is sealed, not flagged');

// ---------------------------------------------------------------- 2. a save edited outside the game
const w = JSON.parse(ls.getItem('bramblewood_arena_currencies')); w.gold = 999999; ls.setItem('bramblewood_arena_currencies', JSON.stringify(w));
P = load(ls, {now: T0 + 7200e3});
ok(P.kinds().includes('save-edited'), 'an edited wallet is flagged at load');
const f0 = P.t.cheat2Flags().find(f=> f.k === 'save-edited');
ok(f0 && f0.d.keys.includes('bramblewood_arena_currencies') && !f0.d.keys.includes('bramblewood_arena_card_copies'), 'the flag names the edited key only');
ok(P.ctx.myCurrencies.gold === 999999, 'the game still loads the edited save (flag, not block)');
P.run(`saveCurrencies();`);
ok(P.kinds().filter(k=> k === 'save-edited').length === 1 && !P.kinds().includes('currency-jump'), 'flagged once; the edit is the new start, not also a jump');
const c = JSON.parse(ls.getItem('bramblewood_arena_card_copies')); c.dragon = copies(3); ls.setItem('bramblewood_arena_card_copies', JSON.stringify(c));
P = load(ls, {now: T0 + 4 * 3600e3});
ok(P.t.cheat2Flags().some(f=> f.k === 'save-edited' && f.d.keys.includes('bramblewood_arena_card_copies')), 'edited card copies are flagged');
P = load(ls, {now: T0 + 6 * 3600e3});
ok(P.t.cheat2Flags().filter(f=> f.k === 'save-edited').length === 2, 'the next clean reload adds nothing');

// ---------------------------------------------------------------- 3. jumps, impossible numbers, admin, the cloud
let L2 = fakeStorage(); P = load(L2);
P.run(`saveCurrencies(); myCurrencies.gold += 50000; saveCurrencies();`);
let fj = P.t.cheat2Flags().find(f=> f.k === 'currency-jump');
ok(fj && fj.d.jump[0].k === 'gold' && fj.d.jump[0].up === 50000, 'a console jump of 50,000 Leaves with no grant is flagged');
P.run(`myCurrencies.gems += 150; myCurrencies.metal += 49; saveCurrencies();`);
ok(P.kinds().filter(k=> k === 'currency-jump').length === 1, 'gains under the per-write cap are not flagged (and one kind once an hour)');
L2 = fakeStorage(); P = load(L2); P.run(`saveCurrencies(); myCurrencies.dust = NaN; saveCurrencies();`);
ok(P.kinds().includes('wallet-impossible'), 'a balance that is not a number is flagged');
L2 = fakeStorage(); P = load(L2); P.run(`saveCurrencies(); myCurrencies.gold = -30; saveCurrencies();`);
ok(P.kinds().includes('wallet-impossible'), 'a negative balance is flagged');
L2 = fakeStorage(); P = load(L2); P.ctx.adminModeEnabled = true; P.run(`saveCurrencies(); myCurrencies.gold = 4000000; myCurrencies.gems = 900000; saveCurrencies();`);
ok(P.kinds().length === 0, 'Admin Mode (allowed) edits are not flagged');
L2 = fakeStorage(); P = load(L2); P.run(`saveCurrencies(); myCurrencies = {gold: 80000, gems: 5000, dust: 9000, metal: 200}; saveCurrencies(true);`);
ok(P.kinds().length === 0, "the cloud load's own save is trusted");
L2 = fakeStorage(); P = load(L2); P.run(`myCardCopies = {fox: ${JSON.stringify(copies(201))}}; saveCardCopies();`);
ok(P.kinds().includes('copies-impossible'), 'more than 200 copies of a card is flagged');
const L3 = fakeStorage(); P = load(L3); P.run(`saveCurrencies();`); const sealBefore = JSON.stringify(P.t.cheat2State().seal);
P.run(`const _s = localStorage.setItem; localStorage.setItem = function(k, v){ if(k === 'bramblewood_arena_currencies') throw new Error('quota'); return _s.call(this, k, v); }; myCurrencies.gold = 777; saveCurrencies();`);
ok(JSON.stringify(P.t.cheat2State().seal) === sealBefore, 'a failed wallet write leaves the seal as it was');
P = load(L3); ok(!P.kinds().includes('save-edited'), '... so the next load is not flagged');

// ---------------------------------------------------------------- 4. fights
const fight = (P, ms, m)=>{ P.t.cheat2FightStart(m.deck || {fox: 3, owl: 2}); P.clock.now += ms; return P.t.cheat2FightEnd(Object.assign({mode: 'conquest', winner: 1, round: 7, transcript: []}, m)); };
P = load(fakeStorage());
ok(fight(P, 1200, {}).includes('fight-too-fast'), 'a win 1.2 s after its start is flagged');
P = load(fakeStorage());
ok(fight(P, 1200, {adminTest: true}).length === 0 && fight(P, 1200, {adminWin: true}).length === 0 && fight(P, 1200, {winner: 2}).length === 0, 'an admin test, the Admin win button and a loss are not');
ok(fight(P, 60e3, {round: 0}).includes('fight-rounds') && fight(P, 60e3, {round: 400}).includes('fight-rounds'), 'a win at round 0 or 400 is flagged');
P = load(fakeStorage());
ok(fight(P, 60e3, {deck: {fox: 3, dragon: 1, wolf: 1, 'fox~cp3': 1}}).includes('deck-unowned'), 'a won deck with a card never owned is flagged');
ok(P.t.cheat2Flags().find(f=> f.k === 'deck-unowned').d.ids.join() === 'dragon', '... naming that card only');
P = load(fakeStorage()); let streak = [];
for(let i = 0; i < 61; i++) streak = fight(P, 9e3, {});
ok(streak.includes('win-streak'), '61 wins in under 10 minutes is flagged');
P = load(fakeStorage()); streak = [];
for(let i = 0; i < 61; i++) streak = fight(P, 12e3, {}); // 61 wins in 12.2 minutes
ok(!P.kinds().includes('win-streak'), '61 wins spread over 12 minutes is not');
const m1 = {mode: 'conquest', winner: 1, round: 7}; P.t.cheat2FightStart({fox: 1}); P.clock.now += 500;
P.t.cheat2FightEnd(m1); const again = P.t.cheat2FightEnd(m1);
ok(again.length === 0, 'one fight is checked once');

// ---------------------------------------------------------------- 5. the clock
P = load(fakeStorage()); P.t.cheat2Clock(null); P.clock.now -= 2 * 3600e3;
ok(P.t.cheat2Clock(null).includes('clock-back'), 'the clock going back 2 h is flagged');
ok(P.t.cheat2Clock(null).length === 0, '... once, then the new time is the reference');
P = load(fakeStorage());
ok(P.t.cheat2Clock(P.clock.now - 30 * 60e3).includes('time-skew'), 'a device 30 min off the server is flagged');
P = load(fakeStorage());
ok(P.t.cheat2Clock(P.clock.now - 5 * 60e3).length === 0 && P.t.cheat2Clock(NaN).length === 0, '5 min off, or no server time, is fine');
P = load(fakeStorage()); P.t.cheat2Flag('time-skew', {}); P.t.cheat2Flag('time-skew', {}); P.clock.now += 3601e3; P.t.cheat2Flag('time-skew', {});
ok(P.kinds().length === 2, 'one kind at most once an hour');

// ---------------------------------------------------------------- 6. the fight record
P = load(fakeStorage()); P.t.cheat2FightStart({fox: 3, owl: 2, hero: 1}); P.clock.now += 70e3;
const mm = {mode: 'conquest', winner: 1, round: 8, battleMode: 'lanes', leaderDefId: 'owl', conquestNode: {mapId: 'm4', nodeId: '4-1'}, transcript: Array.from({length: 40}, (_, i)=> ({r: i >> 2, a: 'play', uid: i}))};
P.t.cheat2FightEnd(mm); const rec = P.t.cheat2FightRecord(mm);
ok(rec.v === 1 && rec.seed === 123456789 && rec.build === 'b1234' && rec.cardsHash.length === 64 && rec.node === 'm4:4-1', 'the record has the seed, build, card hash and node');
ok(rec.deck.fox === 3 && rec.deck.owl === 2 && rec.lv.fox.join() === '5,4,3' && !rec.lv.hero && rec.leader === 'owl' && rec.bm === 'lanes', 'the deck as it went in, its copy levels and the leader');
ok(rec.ms === 70e3 && rec.round === 8 && rec.winner === 1 && rec.acts === 40 && Array.isArray(rec.flags), 'duration, rounds, winner, move count, flags');
ok(JSON.stringify(rec).length < 2000, 'the record is compact (' + JSON.stringify(rec).length + ' bytes)');

// ---------------------------------------------------------------- 7. reporting
(async ()=>{
  P = load(fakeStorage()); P.t.cheat2Flag('save-edited', {keys: ['bramblewood_arena_currencies']});
  let rpcCalls = 0; P.ctx.sbClient = {rpc: async ()=>{ rpcCalls++; return {data: 1, error: null}; }, from: ()=> ({insert: async ()=> ({error: null})})};
  ok(await P.t.cheat2Report() === 'skip' && rpcCalls === 0, 'a guest is never reported');
  ok(P.timers.length >= 1 && P.timers[0].ms >= 20000, 'a report is scheduled, not sent at once');
  P.ctx.signedIn = true; P.ctx.cloudUserId = 'u1';
  let sent = null; P.ctx.sbClient.rpc = async (name, args)=>{ rpcCalls++; sent = {name, args}; return {data: 1, error: null}; };
  ok(await P.t.cheat2Report() === 'rpc' && sent.name === 'report_cheat_flags' && sent.args.p_flags[0].kind === 'save-edited' && sent.args.p_flags[0].build === 'b1234', 'signed in: report_cheat_flags gets the notes');
  ok(await P.t.cheat2Report() === 'none', 'a note is sent once');
  P.clock.now += 10;
  P.t.cheat2Flag('currency-jump', {jump: [{k: 'gold', up: 50000}]}); P.t.cheat2Flag('fight-too-fast', {ms: 900});
  let fbRow = null, fbN = 0; P.ctx.sbClient.rpc = async ()=> ({data: null, error: {code: 'PGRST202', message: 'Could not find the function'}});
  P.ctx.sbClient.from = t=> ({insert: async row=>{ fbN++; fbRow = {t, row}; return {error: null}; }});
  ok(await P.t.cheat2Report() === 'feedback' && fbN === 1 && fbRow.t === 'feedback', 'before the SQL: one feedback row');
  const r = fbRow.row, ctxSize = Buffer.byteLength(JSON.stringify(r.context));
  ok(['bug', 'idea', 'balance', 'art', 'other'].includes(r.category) && r.text.length >= 1 && r.text.length <= 4000 && ctxSize <= 8192 && r.user_id === 'u1', 'the row fits the feedback table (category, text, context ' + ctxSize + ' bytes)');
  ok(/currency-jump/.test(r.text) && /fight-too-fast/.test(r.text) && r.context.auto === 'cheat2' && r.context.flags.length === 2, 'it lists the notes, batched');
  P.clock.now += 3601e3; P.t.cheat2Flag('time-skew', {min: 40});
  ok(await P.t.cheat2Report() === 'later' && fbN === 1, 'at most one feedback row a day');
  P.ctx.sbClient.rpc = async ()=> ({data: null, error: {code: '500', message: 'boom'}});
  ok(await P.t.cheat2Report() === 'error' && P.t.cheat2State().flags.some(f=> f.k === 'time-skew' && f.at > P.t.cheat2State().sent), 'a failure keeps the note for later');
  P.ctx.sbClient.rpc = async ()=>{ throw new Error('offline'); };
  ok(await P.t.cheat2Report() === 'error', 'offline: no throw');
  for(let i = 0; i < 70; i++){ P.clock.now += 3601e3; P.t.cheat2Flag('clock-back', {}); }
  ok(P.t.cheat2State().flags.length === 50, 'the browser keeps the last 50 notes');

  // ---------------------------------------------------------------- 8. wiring
  const has = (fn, re, m)=> ok(re.test(fnSrc(fn)), m);
  has('saveCurrencies', /cheat2OnWalletSave\(myCurrencies, t, !!skipCloudPush\)/, 'saveCurrencies calls the wallet hook (typeof-guarded)');
  has('grantCurrency', /cheat2NoteGrant\(kind, amount\)/, 'grantCurrency notes its grant');
  has('saveCardCopies', /cheat2OnCopiesSave\(myCardCopies, t\)/, 'saveCardCopies calls the copies hook');
  has('cloudPullState', /cheat2Rebase\(myCurrencies\)[\s\S]*settleRaidPoints\(\)/, 'the cloud load rebases before settleRaidPoints saves');
  has('takeFightTicket', /cheat2FightStart\(/, 'every Conquest start notes the fight');
  has('handInFight', /cheat2FightRecord\(m\)[\s\S]*rec \? \{v:1, actions: m\.transcript \|\| \[\], rec\}/, 'the hand-in carries the record beside the moves');
  has('resolveRoundCore', /cheat2FightEnd\(m\)[\s\S]{0,200}handInFight\(m\)/, 'the fight end checks before the hand-in');
  has('checkGameVersion', /cheat2Flag\('card-hash', \{where: 'page'\}\)[\s\S]*cheat2Clock\(Date\.parse[\s\S]*cheat2Flag\('card-hash', \{where: 'version\.json'\}\)/, 'the version check notes card-hash mismatches and the server clock');
  ok(/const BUILD_ID = [^\n]*\ntry\{ cheat2Boot\(\); \}catch\(e\)\{\}/.test(src), 'the boot runs right after BUILD_ID (before any save)');
  ok(src.indexOf('// CHEAT2:BEGIN') < src.indexOf('let myCurrencies = loadCurrencies()'), 'the block is defined before the wallet loads');
  ok(!/__BUILD_ID__/.test(BLOCK), 'the block does not contain the build stamp placeholder (assemble_arena.py replaces the first one)');
  const sql = fs.readFileSync(path.join(ROOT, 'supabase/proposed/cheat2-2026-11-16.sql'), 'utf8');
  ok(/PROPOSED, NOT APPLIED/.test(sql.split('\n')[0]), 'the SQL says it is not applied');
  ['-- A. ', '-- B. ', '-- C. ', '-- D. ', '-- E. ', '-- F. ', '-- G. ', '-- H. '].forEach(b=> ok(sql.includes(b), 'SQL block ' + b.trim()));
  ok(/create or replace function public\.report_cheat_flags\(p_flags jsonb\)/.test(sql) && /return public\.buy_listing_v2\(p_id\)/.test(sql) && /enable row level security/.test(sql), 'the RPC the client calls, the v1 market fix, RLS on');
  ok(/'save-edited'|kind ~ '\^\[a-z0-9-\]\{1,32\}\$'/.test(sql), 'the kinds the client sends fit the table (a-z0-9-, 32 chars)');
  ok(['save-edited', 'currency-jump', 'wallet-impossible', 'copies-impossible', 'fight-too-fast', 'fight-rounds', 'win-streak', 'deck-unowned', 'card-hash', 'clock-back', 'time-skew'].every(k=> /^[a-z0-9-]{1,32}$/.test(k) && src.includes("'" + k + "'")), 'every client kind is raised in the app and fits');
  ok(!/^\s*update public\.anticheat_settings set strict = true/m.test(sql), 'strict mode is only offered (commented out)');
  ok(fs.existsSync(path.join(ROOT, 'supabase/proposed/cheat2-2026-11-16.md')), 'the notes file is filed');
  const dec = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/decisions.json'), 'utf8')).items.find(x=> x.id === 'CHEAT2-1');
  ok(dec && dec.status === 'YET' && dec.body.split(/\s+/).length < 100 && /apply it/i.test(dec.title), 'decision CHEAT2-1 asks for "apply it" in under 100 words');
  ok(/## 2026-11-1\d \(package CHEAT2/.test(fs.readFileSync(path.join(ROOT, 'docs/CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');
  ok(/tests\/cheat2-2026-11-16\.js/.test(fs.readFileSync(path.join(ROOT, 'tests/run-all.sh'), 'utf8')), 'listed in run-all.sh');

  console.log(fail ? `cheat2: ${fail} of ${n} checks failed` : `cheat2: all ${n} checks passed`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
