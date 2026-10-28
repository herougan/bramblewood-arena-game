#!/usr/bin/env node
// 2026-10-19 (package RO, owner 21:48 / 21:49 / 00:22 / 00:29): raid ops. A fallen raid returns 24 h after the kill as a fresh life
// (raidRespawnAt says when); the admin restart (local while the SQL isn't applied, an in-page confirm); the Raid hub lists every raid;
// instance assignment (join order, guild-mates together, the cap) and attempts per instance; the raid editor scrolls and has every
// field; taking part / strong contributor / held-raid reward math; completing a raid opens Auto; raid tickets (cap 10, +1 a day, the
// weekly top-up, 1 ticket + 1-6 Energy a fight, blocked at 0 with the reason); the TX keys in all 12 packs; the proposed SQL.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const R = require(path.join(ROOT, 'bramblewood-raid.js'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
const TXmod = require(path.join(ROOT, 'bramblewood-texts.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const sql = fs.readFileSync(path.join(ROOT, 'supabase', 'migrations', '20261019_raid_ops.sql'), 'utf8');
const goliath = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8'))[0];
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const H = 3600 * 1000, DAY = 24 * H, C = 2900, S = C * R.CYCLE_MS;
const TX = TXmod.TX || ((k, v)=> String(TEXT[k] || k).replace(/\{(\w+)\}/g, (m, x)=> v && v[x] != null ? v[x] : m));
// a whole raid's worth of attempts by `owner`, starting at t0 (10,000 each, 1 ms apart)
function killAll(def, owner, t0, opts){ opts = opts || {}; const out = []; let t = t0;
  def.parts.forEach(p=>{ for(let d = 0; d < R.partTotal(p); d += 10000) out.push({raidId: def.id, part: p.id, cycle: C, owner, contribution: 10000, at: t++, instance: opts.instance}); });
  return out; }
const noStand = Object.assign({}, goliath, {standIns: {perDayPct: 0}});

// ---- 1. Respawn: 24 h after the kill, as a fresh life
{ const at = killAll(noStand, 'me', S + 10 * H), killAt = at[at.length - 1].at;
  const st = R.raidNow(noStand, at, S + 12 * H, {cycle: C});
  ok(st.defeated && st.gen === 0 && st.killAt === killAt, `1. it falls at the attempt that drains it (gen ${st.gen}, kill +${((st.killAt - S) / H).toFixed(3)} h)`);
  ok(st.respawnAt === killAt + DAY, `1. it returns 24 h after the kill (${((st.respawnAt - killAt) / H).toFixed(2)} h)`);
  const st2 = R.raidNow(noStand, at, killAt + DAY + H, {cycle: C});
  ok(st2.gen === 1 && !st2.defeated && st2.remaining === st2.total && st2.genStart === killAt + DAY, `1. after the respawn: a new life at full Health (gen ${st2.gen}, ${st2.remaining}/${st2.total})`);
  const more = at.concat([{raidId: noStand.id, part: 'left', cycle: C, owner: 'me', contribution: 5000, at: killAt + DAY + 2 * H}]);
  ok(R.raidNow(noStand, more, killAt + DAY + 3 * H, {cycle: C}).remaining === st2.total - 5000, '1. attempts after the respawn count against the new life only');
  ok(R.respawnMs({respawnHours: 6}) === 6 * H && R.respawnMs({}) === DAY && R.respawnMs({respawnHours: 999}) === 168 * H, '1. respawnHours (default 24, 1..168)');
  // a kill late in the week returns with the new cycle (never past it)
  const late = killAll(noStand, 'me', S + 6.5 * DAY), stL = R.raidNow(noStand, late, S + 6.6 * DAY, {cycle: C});
  ok(stL.defeated && stL.respawnAt === S + R.CYCLE_MS, '1. a kill on the last day returns at the cycle\'s end (within 24 h)');
  // the stand-ins can finish it too: the kill minute is found between attempts
  const sd = Object.assign({}, goliath, {standIns: {perDayPct: 50}}), stS = R.raidNow(sd, [], S + 3 * DAY, {cycle: C});
  ok(stS.defeated && stS.killAt > S && stS.killAt < S + 3 * DAY && stS.respawnAt === stS.killAt + DAY, `1. a fall by the stand-ins has its minute too (+${((stS.killAt - S) / H).toFixed(1)} h)`);
  // the page's helper
  const page = new Function('RaidM', [B.grab('raidRespawnAt'), 'return {raidRespawnAt};'].join('\n'))(R);
  ok(page.raidRespawnAt(noStand, st) === killAt + DAY, '1. raidRespawnAt returns the state\'s respawnAt');
  ok(page.raidRespawnAt(noStand, {cycle: 7}) === 8 * R.CYCLE_MS, '1. raidRespawnAt without lives (the old weekly boss): the cycle\'s end');
  ok(/RaidM\.raidNow\(def, attempts, now, \{cycle, restarts\}\)/.test(B.grab('currentRaidStateFor')), '1. the raid tab\'s state is the current life (raidNow, with restarts)'); }

// ---- 2. Admin restart (local while the SQL isn't applied)
{ const store = {}; const localStorage = {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }};
  const body = ['let sbClient = null, cloudCardAdmin = false;', B.grab('RAID_RESTARTS_KEY'), B.grab('loadRaidLocalRestarts'), B.grab('liveRaidRestarts'), B.grab('raidRestartsFor'),
    B.grab('liveRefreshRaidRestarts'), B.grab('adminRestartRaid'), 'return {adminRestartRaid, raidRestartsFor};'].join('\n');
  const P = new Function('RaidM', 'localStorage', body)(R, localStorage);
  P.adminRestartRaid(noStand).then(r=>{
    ok(r && r.live === false, '2. no server: the restart is local');
    const cyc = R.cycleOf(Date.now()), rs = P.raidRestartsFor(noStand, cyc, 1);
    ok(rs.length === 1 && Math.abs(rs[0] - r.at) < 5, '2. the local restart is read back for this cycle (every instance)');
    ok(P.raidRestartsFor(noStand, cyc, 3).length === 1, '2. a restart without an instance applies to every instance');
  }).catch(e=> ok(false, '2. adminRestartRaid threw ' + e));
  // a restart of a standing raid: a new life at once, full Health; the old one is over (its held-raid claim)
  const a = [{raidId: noStand.id, part: 'left', cycle: C, owner: 'me', contribution: 9000, at: S + H}];
  const gens = R.raidGenerations(noStand, a, S + 5 * H, {cycle: C, restarts: [S + 2 * H]});
  ok(gens.length === 2 && gens[0].over && gens[0].restartAt === S + 2 * H && gens[1].start === S + 2 * H, '2. a restart ends the life and starts the next at once');
  ok(R.raidNow(noStand, a, S + 5 * H, {cycle: C, restarts: [S + 2 * H]}).remaining === R.raidNow(noStand, [], S + 5 * H, {cycle: C}).total, '2. the new life is at full Health');
  // a restart while it is down brings it back sooner
  const k = killAll(noStand, 'me', S + H), g2 = R.raidGenerations(noStand, k, S + 10 * H, {cycle: C, restarts: [S + 5 * H]});
  ok(g2[0].respawnAt === S + 5 * H && g2.length === 2, '2. a restart while it is down: it returns at the restart');
  const conf = B.grab('confirmAdminRestartRaid');
  ok(/bwConfirm\(/.test(conf) && !/[^w]confirm\(/.test(conf.replace(/bwConfirm\(|confirmAdminRestartRaid\(/g, '')), '2. the restart confirms in-page (bwConfirm), not confirm()');
  ok(/adminModeEnabled/.test(conf) && /data-raid-restart/.test(B.grab('raidPanelHTML')) && /adminModeEnabled \? `<div class="r3-admin">/.test(B.grab('raidPanelHTML')), '2. the Restart raid button is in the raid tab\'s admin row');
  ok(/toast\.raid-restarted-local/.test(conf) && /this browser only/.test(TEXT['toast.raid-restarted-local']), '2. the toast says when it is this browser only');
  ok(/id="reRestart"/.test(B.grab('openRaidEditor')), '2. and in the raid editor'); }

// ---- 3. The Raid hub lists every raid
{ const second = Object.assign(JSON.parse(JSON.stringify(goliath)), {id: 'hydra', name: 'The Hydra', icon: '🐉', standIns: {perDayPct: 0}});
  const defs = [noStand, second], now = Date.now(), cyc = R.cycleOf(now);
  const attempts = {goliath: [], hydra: killAll(second, 'me', R.cycleOf(now) * R.CYCLE_MS + 1).map(a=> Object.assign(a, {cycle: cyc}))};
  // make the Hydra's kill fall within the last few minutes so it is down now
  attempts.hydra.forEach((a, i)=>{ a.at = now - 60000 + i; });
  const esc = s=> String(s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[c]);
  const body = ['const RAID_POINTS_MAX = 10; let playSubTab = "play", matchState = null; const escapeHtml = esc, escapeAttr = esc;',
    'function liveRaidDefs(){ return DEFS; } function currentRaidPoints(){ return 7; } function msUntilNextRaidPointTick(){ return 5 * 3600000; }',
    'function myGhostOwnerId(){ return "me"; } function raidAutoOpen(d){ return d.id === "hydra"; } function raidBossIconHTML(d, f){ return d.icon || f; }',
    'function raidClaimsFor(){ return []; } function liveRefreshRaidParts(){ return Promise.resolve(false); } function raidNoTicketsText(){ return "none"; }',
    // 2026-10-28 (RELFIX2): the hub reads held Raid Tickets (RK / TU2) and the admin row (AR); stand-ins: none held, not admin
    'function raidTicketsHeld(){ return 0; } function raidTicketUseBtnHTML(){ return ""; } const adminModeEnabled = false; function adminRaidTicketsHTML(){ return ""; }',
    'function raidLocale(){ return "en"; }', B.grab('raidTotalRankBadgeHTML'), // 2026-10-28 (RELFIX2): the hub card shows your total raid rank (RK)
    'function currentRaidStateFor(def){ return Object.assign(RaidM.raidNow(def, ATT[def.id], Date.now(), {cycle: RaidM.cycleOf(Date.now())}), {instance: def.id === "hydra" ? 2 : 1}); }',
    B.grab('raidSpanText'), B.grab('raidRespawnAt'), B.grab('raidRespawnHTML'), B.grab('raidTicketChipHTML'), B.grab('raidParticipationText'), B.grab('raidClaimRowHTML'),
    B.grab('raidHubCardHTML'), B.grab('raidHubHTML'), 'return {raidHubHTML};'].join('\n');
  const P = new Function('RaidM', 'TX', 'DEFS', 'ATT', 'esc', body)(R, TX, defs, attempts, esc);
  const html = P.raidHubHTML();
  ok((html.match(/data-raid-open="/g) || []).length === 2 && /data-raid-open="goliath"/.test(html) && /data-raid-open="hydra"/.test(html), '3. the hub has one card per live raid');
  ok(/rh-card is-down[^"]*" data-raid-open="hydra"/.test(html) && html.includes(TX('ui.raid-returns-in', {name: 'The Hydra', span: '1d 0h'}).slice(0, 18)), '3. a fallen raid\'s card says when it returns');
  ok(/data-raid-open="goliath"[\s\S]*?<b>100%<\/b>/.test(html), '3. a standing raid\'s card shows its Health %');
  ok(html.includes('7/10 🎫') && html.includes(TX('ui.raid-ticket-next', {span: '5h 0m'})), '3. your tickets and the next one\'s time sit on top');
  ok(html.includes(TX('ui.raid-instance', {n: 2})) && html.includes(TX('ui.raid-auto-open')), '3. your instance (when not 1) and Auto show on the card');
  ok(html.includes(TX('ui.raid-strong')) || html.includes(TX('ui.raid-leading')), '3. your part in it shows (a Competent or Leading participant in the Hydra; 2026-10-19, RV2)');
  const rt = B.grab('renderRaidSubTab');
  ok(/raidView === 'raid' \? raidPanelHTML\(\) : raidHubHTML\(\)/.test(rt) && /let raidView = 'hub'/.test(src), '3. the Raid tab opens on the hub, a card opens the raid (one raid: still the hub)');
  ok(/data-raid-hub/.test(B.grab('raidPanelHTML')) && /raidView = 'hub'/.test(B.grab('wireRaidPanel')) && /raidView = 'raid'/.test(B.grab('wireRaidHub')), '3. "All raids" goes back, a card goes in'); }

// ---- 4. Instances
{ const cap = 3, m = (o, i, g)=> ({owner: o, instance: i, guild: g});
  ok(R.assignInstance([], 'a', {cap}) === 1, '4. the first player: instance 1');
  ok(R.assignInstance([m('a', 1), m('b', 1)], 'c', {cap}) === 1 && R.assignInstance([m('a', 1), m('b', 1), m('c', 1)], 'd', {cap}) === 2, '4. join order: instance 1 fills to the cap, then 2');
  ok(R.assignInstance([m('a', 1), m('b', 2)], 'a', {cap}) === 1, '4. already placed: stays');
  ok(R.assignInstance([m('a', 1), m('b', 1), m('c', 1), m('d', 2, 'G')], 'e', {cap, guild: 'G'}) === 2, '4. a guild-mate\'s instance with room first');
  ok(R.assignInstance([m('a', 1, 'G'), m('b', 1), m('c', 1)], 'e', {cap, guild: 'G'}) === 2, '4. the guild-mate\'s instance is full: the lowest with room');
  ok(R.assignInstance([m('a', 1), m('b', 1), m('c', 1), m('d', 3)], 'e', {cap}) === 2, '4. a gap (instance 2 empty) is filled');
  ok(R.instanceCap({}) === 250 && R.instanceCap({instanceCap: 5}) === 10 && R.instanceCap({instanceCap: 5000}) === 1000, '4. instanceCap: 250 by default (2026-10-19, package RB: was 100), 10..1000');
  ok(R.partKey('goliath', 'left', 1) === 'goliath:left' && R.partKey('goliath', 'left', 3) === 'goliath:left@3', '4. instance 1 keeps the old boss_id; N > 1 adds @N');
  const k = R.parsePartKey('goliath:core@12'), k1 = R.parsePartKey('goliath:core');
  ok(k.part === 'core' && k.instance === 12 && k1.instance === 1 && k1.part === 'core', '4. parsePartKey reads both');
  // each instance has its own Health
  const att = killAll(noStand, 'x', S + H, {instance: 2});
  ok(R.raidNow(noStand, att.filter(a=> (a.instance || 1) === 1), S + 2 * H, {cycle: C}).remaining > 0 && R.raidNow(noStand, att.filter(a=> (a.instance || 1) === 2), S + 2 * H, {cycle: C}).defeated, '4. instance 2 falls, instance 1 still stands');
  const cra = B.grab('currentRaidAttempts'), rec = B.grab('recordRaidAttempt');
  ok(/\(a\.instance \|\| 1\) === inst/.test(cra) && /RaidM\.partKey\(def\.id, m\.raidPart, inst\)/.test(rec) && /instance: inst/.test(rec), '4. the page reads your instance\'s attempts and writes the instance into boss_id');
  ok(/rpc\('join_raid_instance'/.test(B.grab('liveRaidInstance')) && /liveRaidInstance\(def, st \? st\.cycle/.test(B.grab('payRaidAttempt')), '4. the first fight asks the server to place you');
  ok(/create or replace function public\.join_raid_instance/.test(sql) && /pg_advisory_xact_lock/.test(sql) && /security definer set search_path = ''/.test(sql) && /guild_members/.test(sql), '4. SQL: join_raid_instance (definer, advisory lock, guild-mates)');
  ok(/check_raid_attempt_instance/.test(sql) && /not your raid instance/.test(sql) && /revoke insert, update, delete, truncate on public\.raid_instance_members from anon, authenticated/.test(sql), '4. SQL: attempts only into your own instance; no client writes'); }

// ---- 5. The raid editor scrolls and has every field
{ const ed = B.grab('openRaidEditor');
  const a = ed.indexOf('<div class="se-body">'), b = ed.indexOf('<div class="se-actions">');
  ok(a > 0 && b > a && ed.indexOf('modal-head-row') < a, '5. the content sits in .se-body, between the head and the footer');
  const mid = ed.slice(a, b).replace(/<!--[\s\S]*?-->/g, ''), opens = (mid.match(/<div\b/g) || []).length, closes = (mid.match(/<\/div>/g) || []).length;
  ok(opens === closes, `5. .se-body is closed before the footer (${opens} <div> / ${closes} </div>)`);
  ok(/\.skirmish-editor > \.se-body\{[^}]*overflow:auto/.test(tpl) && /\.skirmish-editor\{display:flex !important; flex-direction:column; overflow:hidden !important;\}/.test(tpl), '5. CSS: the shell hides overflow, .se-body scrolls (why it was cut off)');
  ok(/const keepScroll = \(overlay\.querySelector\('\.se-body'\)/.test(ed) && /sb\.scrollTop = keepScroll/.test(ed), '5. a redraw keeps the scroll place');
  ['reName', 'reArt', 'reRounds', 'reCostRp', 'reCostEn', 'reRespawn', 'reInstCap', 'reBossHpBonus', 'reLeaderCap', 'reMinDmg', 'reTAtk', 'reTHp', 'reTCastle', 'reTAllies', 'reTRfEvery', 'reTRfMax',
    'reRate', 'reCap', 'reOver', 'reStand', 'rePFights', 'rePDmg', 'reSFights', 'reSDmg', 'reSPct', 'reKGold', 'reKDust', 'reKMetal', 'reKXp', 'reKCards', 'reComp', 'reFailSpec', 'reAddAlly', 'reCommonPool']
    .forEach(id=> ok(ed.includes(`id="${id}"`), `5. editor field #${id}`));
  ['data-pf="bars"', 'data-pf="barHp"', 'data-pf="castleHp"', 'data-pf="energy"', 'data-st-energy=', 'data-st-batk=', 'data-al-deck=', 'data-al-name=', 'data-tier-n=', 'data-cur="${k}"', 'data-lock=', 'data-inc=']
    .forEach(f=> ok(ed.includes(f), `5. editor rows: ${f}`));
  ['General', 'Tickets, Energy, respawn and instances', 'Tuning', 'Field effects', 'Parts', 'Stages', 'Scoring &amp; rewards', 'Taking part and rewards', 'Ally decks']
    .forEach(h=> ok(new RegExp('<h3 class="se-h">' + h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(ed), `5. editor group "${h}"`));
  ok(/draft\.respawnHours = /.test(ed) && /draft\.instanceCap = /.test(ed) && /draft\.participation = /.test(ed) && /rw\.failPct = /.test(ed) && /s\.energyAdd = /.test(ed) && /P\.cost = Object\.assign/.test(ed) && /a\.deck = deck/.test(ed), '5. read() writes every new field back');
  ok(/'respawnHours', 'instanceCap', 'participation'/.test(src), '5. an older saved edit still gets the shipped respawn / instances / participation'); }

// ---- 6. Taking part, strong contributor, the held raid
{ const mk = (fights, each)=> Array.from({length: fights}, (_, i)=> ({raidId: noStand.id, part: 'left', cycle: C, owner: 'p', contribution: each, at: S + H + i}));
  const killed = (extra)=> killAll(noStand, 'whale', S + 2 * H).concat(extra);
  const rk = (att)=> R.raidReward(noStand, R.raidNow(noStand, att, S + 3 * H, {cycle: C}), 'p', {});
  ok(rk(killed(mk(2, 2000))) === null, '6. 2 fights: not taking part, no reward');
  ok(rk(killed(mk(3, 166))) === null, '6. 3 fights but 498 damage: not taking part (500 since 2026-10-19, package RB)');
  const full = rk(killed(mk(3, 400)));
  ok(full && full.kind === 'kill' && !full.strong && full.base.gold === 400 && full.base.dust === 60 && full.base.metal === 3 && full.xp === 500 && full.cards === 1, `6. took part in a fall: the full rewards (${JSON.stringify(full && full.base)}, ${full && full.xp} XP, ${full && full.cards} card)`);
  // 2026-10-19 (package RV2, owner 08:46): the Competent participant (was the strong contributor) needs 10,000 now
  const strong = rk(killed(mk(4, 2500)));
  ok(strong && strong.strong && !strong.leading && strong.base.gold === 480 && strong.base.dust === 72 && strong.base.metal === 4 && strong.xp === 600 && strong.cardChance === 0.2, `6. Competent participant (4 fights, 10,000): +20% of everything (${JSON.stringify(strong && strong.base)}, ${strong && strong.xp} XP, +${strong && strong.cardChance} card chance)`);
  ok(rk(killed(mk(4, 450))) && !rk(killed(mk(4, 450))).strong && rk(killed(mk(4, 499))) && !rk(killed(mk(4, 499))).strong, '6. 1,800 and 1,996 damage: not Competent (2,000 since 2026-10-19, package RB)');
  const lead = rk(killed(mk(5, 10000)));
  ok(lead && lead.leading && lead.base.gold === 560 && lead.xp === 700 && lead.cards === full.cards + 1 && lead.cardChance === 0, `6. Leading participant (5 fights, 50,000): +40% of everything and an extra card for certain (${JSON.stringify(lead && lead.base)}, ${lead && lead.cards} cards)`);
  // held: the life ends standing (the cycle ends), barely scratched
  const att = mk(3, 2000), st = R.generationState(noStand, att, R.raidGenerations(noStand, att, S + R.CYCLE_MS + 1, {cycle: C})[0], C, S + R.CYCLE_MS + 1);
  const held = R.raidReward(noStand, st, 'p', {over: true});
  ok(held && held.kind === 'compensation' && held.base.gold === 200 && held.base.dust === 30 && held.base.metal === 2 && held.xp === 250, `6. it held: half the general rewards (${JSON.stringify(held && held.base)}, ${held && held.xp} XP)`);
  ok(held && held.cards === 0 && held.cardChance > 0 && held.cardChance <= 0.1 && Math.abs(held.specMult - 0.1 * (1 - st.fraction)) < 1e-9, `6. raid-specific: a pittance by Health taken (card chance ${held && held.cardChance.toFixed(4)})`);
  ok(R.raidReward(noStand, st, 'p', {}) === null, '6. nothing to claim while that life still stands');
  const fresh = R.raidState(noStand, mk(3, 400), S + 4 * H, {cycle: C});
  ok(R.raidReward(noStand, Object.assign({}, fresh, {fraction: 1}), 'p', {over: true}).specMult === 0, '6. nothing taken off: 0 of the raid-specific rewards');
  // tier extras: kept on a fall, scaled to a pittance when held
  const top = Object.assign(JSON.parse(JSON.stringify(noStand)), {rewards: Object.assign({}, noStand.rewards, {tiers: {participant: {metal: 30, title: 'X'}}})});
  const kt = R.raidReward(top, R.raidNow(top, killed(mk(3, 400)), S + 3 * H, {cycle: C}), 'p', {}), ht = R.raidReward(top, Object.assign({}, st, {raid: top, fraction: 0.05}), 'p', {over: true});
  ok(kt.extra.metal === 30 && kt.extra.title === 'X' && ht.extra.metal === Math.floor(30 * 0.1 * 0.95) && ht.extra.metal === 2 && !ht.extra.title, `6. tier extras: full on a fall, ${ht.extra.metal || 0} when held, no title`);
  const pr = R.participationRules(goliath);
  // 2026-10-19 (package RV2, owner 08:46): the Competent participant (was the strong contributor) at 10,000, the Leading participant at 50,000
  // 2026-10-19 (package RB): rescaled off the x15 scale: 500 / 2,000 / 12,500 (docs/balance/raid-balance-2026-10-19.md)
  ok(pr.fights === 3 && pr.damage === 500 && pr.strongFights === 4 && pr.strongDamage === 2000 && pr.strongPct === 20 && pr.leadFights === 4 && pr.leadDamage === 12500 && pr.leadPct === 40 && pr.leadCards === 1, '6. the Goliath carries the owner\'s numbers');
  ok(/RaidM\.raidReward\(def, st, me, \{over: g\.over \|\| g\.end <= now\}\)/.test(B.grab('raidClaimsFor')), '6. the page claims per life of the raid with raidReward');
  ok(/raidClaimKey\(def, c, g\.gen, inst\)/.test(B.grab('raidClaimsFor')) && B.grab('raidClaimKey').includes("(gen ? ':g' + gen : '')"), '6. a claim per life and instance (life 1, instance 1 keeps the old key)'); }

// ---- 7. Completing a raid opens Auto
{ const store = {}; const localStorage = {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }};
  const body = ['let adminModeEnabled = false; const PROGRESS_KEYS = [], PROGRESS_MERGE_KEYS = {};', B.grab('RAID_AUTO_KEY'), B.grab('raidAutoDone'), B.grab('raidAutoOpen'), B.grab('markRaidCompleted'),
    'function nodeBestRankS(){ return false; } function autoTier(){ return false; }', B.grab('autoplayAllowed'), 'return {raidAutoOpen, markRaidCompleted, autoplayAllowed};'].join('\n');
  const P = new Function('RaidM', 'localStorage', body)(R, localStorage);
  const m = {mode: 'raidOffline', raidFull: true, raidDef: goliath};
  ok(!P.raidAutoOpen(goliath) && !P.autoplayAllowed(m), '7. not completed: no Auto in its fights');
  ok(P.markRaidCompleted(goliath) === true && P.markRaidCompleted(goliath) === false, '7. the first completion is marked once');
  ok(P.raidAutoOpen(goliath) && P.autoplayAllowed(m), '7. completed: Auto is open in its fights');
  ok(!P.autoplayAllowed({mode: 'raidOffline', raidFull: true, raidDef: {id: 'other'}}), '7. only for that raid');
  const cr = B.grab('claimRaidReward');
  ok(/const autoNew = kill && markRaidCompleted\(def\)/.test(cr) && /toast\.raid-auto-unlocked/.test(cr), '7. claiming a fallen raid\'s reward (you took part) marks it completed and says so');
  ok(/PROGRESS_KEYS\.push\(RAID_AUTO_KEY\)/.test(src), '7. the completed raids are in the synced progress'); }

// ---- 8. Raid tickets
{ const r = {cap: 10, regenMs: DAY};
  ok(R.settleTickets({}, S + H, r).n === 10, '8. a new player starts with 10');
  const t0 = {n: 4, at: S + H, cycle: C};
  ok(R.settleTickets(t0, S + H + DAY - 1, r).n === 4 && R.settleTickets(t0, S + H + DAY, r).n === 5 && R.settleTickets(t0, S + H + 3 * DAY + 5, r).n === 7, '8. +1 a day');
  ok(R.settleTickets({n: 9, at: S, cycle: C}, S + 5 * DAY, r).n === 10, '8. capped at 10');
  ok(R.settleTickets({n: 2, at: S + 6 * DAY, cycle: C}, S + R.CYCLE_MS + H, r).n === 10, '8. each new weekly cycle tops up to 10');
  ok(R.settleTickets({n: 12, at: S, cycle: C}, S + H, r).n === 12, '8. tickets above the cap are kept');
  const sp = R.spendTickets({n: 10, at: S, cycle: C}, 1, S + 2 * H, r);
  ok(sp.n === 9 && sp.at === S + 2 * H, '8. spending from a full stack starts the day\'s clock');
  const sp2 = R.spendTickets({n: 6, at: S + H, cycle: C}, 1, S + 5 * H, r);
  ok(sp2.n === 5 && sp2.at === S + H, '8. spending below the cap leaves the clock running');
  ok(R.spendTickets({n: 0, at: S + H, cycle: C}, 1, S + 2 * H, r) === null, '8. 0 tickets: no fight');
  ok(R.nextTicketIn({n: 3, at: S + H, cycle: C}, S + 5 * H, r) === DAY - 4 * H && R.nextTicketIn({n: 10, at: S, cycle: C}, S + H, r) === null, '8. the next ticket\'s time (none when full)');
  ok(R.nextTicketIn({n: 3, at: S + 6.9 * DAY, cycle: C}, S + 6.95 * DAY, r) === Math.round(0.05 * DAY), '8. the weekly top-up counts when it comes first');
  const c = s=> goliath.stages.find(x=> x.name === s);
  ok(R.attemptCost(goliath, 'left', null).energy === 3 && R.attemptCost(goliath, 'core', null).energy === 5 && R.attemptCost(goliath, 'left', null).tickets === 1, '8. 1 ticket + the part\'s Energy (outer parts 3, the Core 5)');
  ok(R.attemptCost(goliath, 'core', c('Thrashing')).energy === 6 && R.attemptCost(goliath, 'left', c('Exposed')).energy === 2, '8. the stage adds (Thrashing +1, Exposed -1)');
  ok(R.attemptCost({cost: {energy: 9}, parts: [{id: 'a'}]}, 'a', null).energy === 6 && R.attemptCost({parts: [{id: 'a', cost: {energy: 0}}]}, 'a', {energyAdd: -3}).energy === 1, '8. kept to 1..6');
  // the page blocks at 0 with the reason
  const toasts = [];
  const body = ['function currentRaidPoints(){ return TK.n; } function msUntilNextRaidPointTick(){ return 3 * 3600000 + 20 * 60000; } function spendEnergy(){ TK.spent++; return true; } function energyShortToast(){}',
    'function spendRaidPoint(k){ TK.n -= k; return true; } function liveRaidInstance(){ return Promise.resolve(false); } function showToast(t){ TOASTS.push(t); }',
    B.grab('raidSpanText'), B.grab('raidNoTicketsText'), B.grab('payRaidAttempt'), 'return {payRaidAttempt};'].join('\n');
  const TK = {n: 0, spent: 0};
  const P = new Function('RaidM', 'TX', 'TK', 'TOASTS', body)(R, TX, TK, toasts);
  ok(P.payRaidAttempt(goliath, 'left', {cycle: C}) === null && TK.spent === 0 && toasts[0] === TX('toast.raid-no-tickets', {span: '3h 20m'}), `8. 0 tickets: blocked, no Energy taken, the reason ("${toasts[0]}")`);
  TK.n = 2; const paid = P.payRaidAttempt(goliath, 'core', {cycle: C, stage: c('Thrashing')});
  ok(paid && paid.energy === 6 && TK.n === 1 && TK.spent === 1, '8. a ticket and the part\'s Energy are paid');
  ok(!/toast\.not-enough-raid-points-this-costs|dialog\.not-enough-raid-points-this-costs/.test(src) && (src.match(/if\(!payRaidAttempt\(def, partId, st\)\) return;/g) || []).length === 3, '8. all three raid fight starts pay through payRaidAttempt');
  ok(/const RAID_POINTS_MAX = 10;/.test(src) && /const RAID_POINTS_REGEN_MS = 24 \* 60 \* 60 \* 1000;/.test(src) && /RM\.settleTickets\(/.test(B.grab('settleRaidPoints')), '8. the page: cap 10, +1 a day, BramblewoodRaid.settleTickets');
  const panel = B.grab('raidPanelHTML');
  ok(/raidTicketChipHTML\(tickets, tkNext\)/.test(panel) && /is-blocked/.test(panel) && /r3-no-tickets/.test(panel) && /raidTicketChipHTML\(tickets, next\)/.test(B.grab('raidHubHTML')), '8. tickets show in the hub and the raid screen; Fight greys out at 0 with the reason');
  ok(goliath.cost.raidPoints === 1, '8. the Goliath: 1 ticket a fight'); }

// ---- 9. Texts: TX keys, in all 12 packs; the retired ones gone
{ const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u, core = s=> { const t = s.trim(); return t.slice((t.match(LEAD) || [''])[0].length).replace(/[\s:]+$/, ''); };
  const keys = Object.keys(TEXT).filter(k=> /^(ui\.raid-(all-raids|hub-|instance|tickets|ticket-next|taking-part|in$|strong|part-|auto-|claim-kill|claim-held|rw-|restart)|dialog\.raid-restart|toast\.raid-(restarted|no-tickets|auto-unlocked)|results\.raid-strong)/.test(k));
  ok(keys.length >= 36, `9. the RO texts are TX keys (${keys.length})`);
  keys.forEach(k=> ok(new RegExp("TX\\('" + k.replace(/\./g, '\\.') + "'").test(src), `9. ${k} is used`));
  const packs = CODES.map(c=> JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')));
  const skip = new Set(['Raids', 'A fight costs', 'Claim']);
  keys.forEach(k=>{ const en = core(TEXT[k]); if(skip.has(en)) return; ok(packs.every(p=> typeof p[en] === 'string' && p[en]), `9. "${en}" in all 12 packs`); });
  ok(!('toast.not-enough-raid-points-this-costs' in TEXT) && !('dialog.not-enough-raid-points-this-costs' in TEXT) && packs.every(p=> !Object.keys(p).some(k=> /^Not enough Raid Points — this costs \{raidPoints\}/.test(k))), '9. the two old Raid Points texts are retired');
  ok(fs.existsSync(path.join(ROOT, 'tools', 'i18n_2026_10_19_ro.py')), '9. tools/i18n_2026_10_19_ro.py'); }

// ---- 10. The proposed SQL and the doc
{ ok(/create table if not exists public\.raid_restarts/.test(sql) && /create or replace function public\.admin_restart_raid/.test(sql) && /not public\.is_app_admin\(\)/.test(sql), '10. SQL: raid_restarts + admin_restart_raid (admins only)');
  ok((sql.match(/security definer set search_path = ''/g) || []).length === 3 && /revoke all on function public\.admin_restart_raid\(text, integer\) from public, anon;/.test(sql) && /revoke all on function public\.join_raid_instance\(text, integer\) from public, anon;/.test(sql), '10. SQL: definer functions pin search_path and are not callable by anon');
  ok(/revoke insert, update, delete, truncate on public\.raid_restarts from anon, authenticated/.test(sql) && /enable row level security/.test(sql), '10. SQL: no client writes, RLS on');
  ok(!/drop table|alter table public\.raid_week_attempts|drop policy if exists "insert own raid attempt"/i.test(sql), '10. SQL: no existing table or policy dropped or loosened');
  const doc = fs.readFileSync(path.join(ROOT, 'docs', 'raid-ops-2026-10-19.md'), 'utf8');
  ok(/24 h/.test(doc) && /instance/i.test(doc) && /ticket/i.test(doc) && /20261019_raid_ops\.sql/.test(doc), '10. docs/raid-ops-2026-10-19.md');
  ok(/^## 2026-10-19 \(package RO: /m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), '10. CHANGELOG entry'); }

setTimeout(()=>{ console.log(fail ? `raid-ops: ${fail} of ${n} checks failed` : `raid-ops: all ${n} checks pass`); process.exit(fail ? 1 : 0); }, 50);
