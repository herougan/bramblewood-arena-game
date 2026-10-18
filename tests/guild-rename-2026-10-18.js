#!/usr/bin/env node
// 2026-10-18 (package X4, owner 15:05: "okay. + rename feature (but takes a rename ticket)"): checks that
//   1. the 🎫 Rename Ticket exists as its own item (not a field-kit item), is on the Shop's shelf, shows in the Inventory, and
//      travels in the progress blob; owners of guilds made before the feature shipped get one free ticket, once;
//   2. the guild panel shows "Rename guild" to the owner only, and the dialog shows the ticket cost;
//   3. the name rules match making a guild (trimmed, 3-24 characters, not the same name);
//   4. the client's fallback path: while rename_guild isn't applied (PGRST202 / 42883 "function does not exist") the player
//      is told renaming isn't switched on yet and keeps the ticket; a refused name keeps it too; a rename that goes through
//      spends exactly one;
//   5. supabase/proposed/20261018_guild_rename.sql is a SECURITY DEFINER function that checks the owner and the name, and it
//      is only proposed (not in supabase/migrations).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const texts = require(path.join(ROOT, 'bramblewood-texts.js'));
const TX = texts.TX || (globalThis.BramblewoodTexts && globalThis.BramblewoodTexts.TX);
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };

// one top-level function's source (brace-matched; skips strings, template literals and regex-free code well enough here)
function fnSrc(name){
  let a = src.indexOf('\nfunction ' + name + '('); if(a < 0) a = src.indexOf('\nasync function ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
const constLine = name=> (src.match(new RegExp('^const ' + name + ' = [^\\n]*', 'm')) || [''])[0];

// --- 1. the ticket item
ok(typeof TX === 'function', 'bramblewood-texts.js exports TX');
ok(/const RENAME_TICKET = \{icon:'🎫', name:'Rename Ticket'/.test(src), 'RENAME_TICKET is a 🎫 Rename Ticket');
const itemDefs = (src.match(/const ITEM_DEFS = \{([\s\S]*?)\n\};/) || [])[1] || '';
ok(itemDefs && !/rename|ticket/i.test(itemDefs), 'the ticket is not a field-kit item (ITEM_DEFS)');
ok(/PROGRESS_KEYS\.push\(RENAME_TICKET_KEY, RENAME_TICKET_GIFT_KEY\)/.test(src), 'the ticket count and gift flag travel in the progress blob');
ok(/\.\.\.\(shopTicketOnShelf\(\) \? \[\{ticket:true, qty:1\}\] : \[\]\)/.test(src), 'the Shop shelf stocks the ticket');
ok(/it\.ticket \? 'ticket:1'/.test(src) && /if\(it\.ticket\) return shopTicketShelfHTML\(/.test(src) && /it\.ticket \? shopTicketDetailHTML\(\)/.test(src) && /if\(it\.ticket\)\{ shopTicketCounter\(el\); return; \}/.test(src), 'the shelf item, its hover and its counter are wired');
ok(/myCurrencies\.gold -= RENAME_TICKET_PRICE; saveCurrencies\(\); addRenameTickets\(1\)/.test(fnSrc('shopTicketCounter')), 'buying takes the Maple Leaves and adds one ticket');
const inv = fnSrc('renderInventory');
ok(/count:renameTickets\(\)/.test(inv) && /'tk'\)/.test(inv), 'the Inventory shows Rename Tickets (once held)');

// the ticket helpers run against a fake localStorage
const store = {}; const ls = {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }};
const tkEnv = new Function('localStorage', [
  constLine('RENAME_TICKET_KEY'), constLine('RENAME_TICKET_PRICE'), constLine('RENAME_TICKET_GIFT_BEFORE'),
  fnSrc('renameTickets'), fnSrc('addRenameTickets'), fnSrc('spendRenameTicket'), fnSrc('giftFounderRenameTicket'),
  'return {renameTickets, addRenameTickets, spendRenameTicket, giftFounderRenameTicket, RENAME_TICKET_CAP};'].join('\n'))(ls);
ok(tkEnv.renameTickets() === 0, 'a new save holds no tickets');
ok(tkEnv.giftFounderRenameTicket({created_at:'2026-10-27T00:00:00Z'}) === false && tkEnv.renameTickets() === 0, 'a guild made after the cut-off gets no gift');
ok(tkEnv.giftFounderRenameTicket({created_at:'2026-10-01T00:00:00Z'}) === true && tkEnv.renameTickets() === 1, 'an early guild\'s owner gets one free ticket');
ok(tkEnv.giftFounderRenameTicket({created_at:'2026-10-01T00:00:00Z'}) === false && tkEnv.renameTickets() === 1, 'the gift is paid once');
tkEnv.addRenameTickets(50); ok(tkEnv.renameTickets() === tkEnv.RENAME_TICKET_CAP, 'tickets cap at RENAME_TICKET_CAP');
store.bramblewood_rename_tickets_v1 = '1';
ok(tkEnv.spendRenameTicket() === true && tkEnv.renameTickets() === 0 && tkEnv.spendRenameTicket() === false && tkEnv.renameTickets() === 0, 'spending never goes below zero');
const loadGuild = fnSrc('loadMyGuild');
ok(/me\.role==='owner' && giftFounderRenameTicket\(guild\)/.test(loadGuild), 'loading your guild pays the founders\' gift to owners only');

// --- 2. the panel and dialog
const roster = fnSrc('guildRosterPanelHTML');
ok(/\$\{isOwner \? `<button class="btn" id="guildRenameBtn"/.test(roster), 'the guild panel shows Rename guild to the owner only');
ok(/getElementById\('guildRenameBtn'\)/.test(fnSrc('renderGuild')) && /openGuildRenameDialog/.test(fnSrc('renderGuild')), 'the button opens the rename dialog');
const dlg = fnSrc('openGuildRenameDialog');
ok(/TX\('ui\.guild-rename-cost', \{n: have\}\)/.test(dlg) && /TX\('ui\.guild-rename-no-ticket'/.test(dlg), 'the dialog shows the ticket cost (or that you have none)');
ok(/renameGuild\(g\.id, chk\.name, g\.name\)/.test(dlg), 'the dialog calls renameGuild');

// --- 3 + 4. name rules and the client's fallback path, with stubs
const mk = (rpc, signedIn = true)=>{
  const tstore = {bramblewood_rename_tickets_v1: '2'};
  const tls = {getItem: k=> (k in tstore ? tstore[k] : null), setItem: (k, v)=>{ tstore[k] = String(v); }};
  const calls = [];
  const sb = signedIn ? {rpc: async (fn, args)=>{ calls.push([fn, args]); return rpc(fn, args); }} : null;
  const env = new Function('localStorage', 'sbClient', 'cloudUserId', 'TX', 'netErrText', [
    constLine('RENAME_TICKET_KEY'), constLine('RENAME_TICKET_PRICE'), constLine('GUILD_NAME_MIN'),
    fnSrc('renameTickets'), fnSrc('addRenameTickets'), fnSrc('spendRenameTicket'),
    fnSrc('guildNameProblem'), fnSrc('guildRenameRpcMissing'), fnSrc('renameGuild'),
    'return {renameGuild, guildNameProblem, guildRenameRpcMissing, renameTickets};'].join('\n'))(
    tls, sb, signedIn ? 'u-1' : null, TX, e=> String((e && e.message) || 'oops'));
  return Object.assign(env, {calls, tstore});
};
const base = mk(async ()=> ({data:null, error:null}));
const P = base.guildNameProblem;
ok(P('  Oak Hollow  ', 'Old').err === '' && P('  Oak Hollow  ', 'Old').name === 'Oak Hollow', 'a fine name is trimmed and accepted');
ok(P('Oak    Hollow', 'Old').name === 'Oak Hollow', 'inner runs of spaces fold to one');
ok(P('ab', 'Old').err === TX('ui.guild-name-length', {min:3, max:24, n:2}), 'two characters are too few');
ok(P('x'.repeat(25), 'Old').err !== '' && P('x'.repeat(24), 'Old').err === '', '24 characters is the most');
ok(P('   ', 'Old').err !== '', 'blank is refused');
ok(P('🦊🦊🦊', 'Old').err === '', 'length counts characters, not UTF-16 units (as Postgres char_length does)');
ok(P('Old', 'Old').err === TX('ui.guild-name-unchanged') && P('old', 'Old').err === '', 'the same name is refused; a case change is allowed');
ok(base.guildRenameRpcMissing({code:'PGRST202', message:'Could not find the function public.rename_guild(p_guild, p_name) in the schema cache'}), 'PGRST202 counts as not applied');
ok(base.guildRenameRpcMissing({code:'42883', message:'function public.rename_guild(uuid, text) does not exist'}), '42883 counts as not applied');
ok(base.guildRenameRpcMissing({message:'function rename_guild does not exist'}), '"function ... does not exist" counts as not applied');
ok(!base.guildRenameRpcMissing({code:'23505', message:'name_taken'}) && !base.guildRenameRpcMissing(null), 'other errors are not "not applied"');

(async ()=>{
  // not applied yet: the fallback message, and the ticket is kept
  for(const err of [{code:'42883', message:'function public.rename_guild(uuid, text) does not exist'}, {code:'PGRST202', message:'Could not find the function public.rename_guild'}]){
    const e = mk(async ()=> ({data:null, error:err}));
    const r = await e.renameGuild('g-1', 'New Name', 'Old Name');
    ok(r.notOn === true && r.error === TX('net.guild-rename-not-on') && /isn't switched on yet/.test(r.error), `${err.code}: "Guild renaming isn't switched on yet"`);
    ok(e.renameTickets() === 2, `${err.code}: the ticket is kept`);
    ok(e.calls.length === 1 && e.calls[0][0] === 'rename_guild' && e.calls[0][1].p_guild === 'g-1' && e.calls[0][1].p_name === 'New Name', `${err.code}: calls rename_guild(p_guild, p_name)`);
  }
  // the server refuses: the ticket is kept, and the reason is shown
  const taken = mk(async ()=> ({data:null, error:{code:'23505', message:'name_taken'}}));
  let r = await taken.renameGuild('g-1', 'Taken', 'Old');
  ok(r.error === TX('net.guild-name-taken') && taken.renameTickets() === 2, 'a taken name keeps the ticket');
  const notOwner = mk(async ()=> ({data:null, error:{code:'42501', message:'not_owner'}}));
  r = await notOwner.renameGuild('g-1', 'Mine Now', 'Old');
  ok(r.error === TX('net.guild-rename-not-owner') && notOwner.renameTickets() === 2, 'a non-owner is refused and keeps the ticket');
  const thrown = mk(async ()=>{ throw new Error('network down'); });
  r = await thrown.renameGuild('g-1', 'New Name', 'Old');
  ok(/network down/.test(r.error || '') && thrown.renameTickets() === 2, 'a network failure keeps the ticket');
  // a bad name or no ticket never reaches the server
  const bad = mk(async ()=> ({data:'x', error:null}));
  r = await bad.renameGuild('g-1', 'ab', 'Old');
  ok(r.error && bad.calls.length === 0 && bad.renameTickets() === 2, 'a too-short name is refused before the call');
  const none = mk(async ()=> ({data:'x', error:null})); none.tstore.bramblewood_rename_tickets_v1 = '0';
  r = await none.renameGuild('g-1', 'New Name', 'Old');
  ok(r.error === TX('ui.guild-rename-no-ticket', {price: 250}) && none.calls.length === 0, 'with no ticket nothing is sent');
  const out = mk(null, false);
  r = await out.renameGuild('g-1', 'New Name', 'Old');
  ok(r.error === TX('net.guild-rename-sign-in'), 'signed out: asked to sign in');
  // it goes through: exactly one ticket is spent, and the server's trimmed name is used
  const good = mk(async ()=> ({data:'New Name', error:null}));
  r = await good.renameGuild('g-1', '  New   Name ', 'Old');
  ok(r.ok === true && r.name === 'New Name' && good.renameTickets() === 1, 'a rename that goes through spends one ticket');

  // --- 5. the proposed SQL
  const sqlPath = path.join(ROOT, 'supabase', 'proposed', '20261018_guild_rename.sql');
  const sql = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, 'utf8') : '';
  ok(sql.length > 0, 'supabase/proposed/20261018_guild_rename.sql exists');
  ok(/^-- PROPOSED, NOT APPLIED/.test(sql), 'it is marked PROPOSED, NOT APPLIED');
  ok(!fs.existsSync(path.join(ROOT, 'supabase', 'migrations', '20261018_guild_rename.sql')), 'it is not in supabase/migrations');
  const fnA = (sql.match(/create or replace function public\.rename_guild\(p_guild uuid, p_name text\)[\s\S]*?\n\$\$;/) || [''])[0];
  ok(fnA && /security definer/.test(fnA) && /set search_path = ''/.test(fnA), 'rename_guild is SECURITY DEFINER with a pinned search_path');
  ok(/auth\.uid\(\)/.test(fnA) && /m\.role = 'owner'/.test(fnA) && /g\.created_by = v_uid/.test(fnA), 'it checks the caller is the guild\'s owner (role and creator)');
  ok(/btrim\(/.test(fnA) && /char_length\(v_name\) < 3 or char_length\(v_name\) > 24/.test(fnA), 'it trims and checks the 3-24 length');
  ok(/lower\(name\) = lower\(v_name\) and id <> p_guild/.test(fnA) && /unique_violation/.test(fnA), 'it checks the name is unique (case-blind), races included');
  ok(/update public\.guilds set name = v_name where id = p_guild/.test(fnA), 'it updates guilds.name');
  ok(/revoke all on function public\.rename_guild\(uuid, text\) from public, anon;/.test(sql) && /grant execute on function public\.rename_guild\(uuid, text\) to authenticated;/.test(sql), 'only signed-in players can call it');
  ok(/trust trade-off/i.test(sql) && /player_rename_tickets/.test(sql) && /rename_guild_with_ticket/.test(sql), 'it notes the ticket trust trade-off and proposes the optional server-side ticket block');

  console.log(fail ? `guild-rename-2026-10-18: ${fail} of ${checks} checks FAILED` : `guild-rename-2026-10-18: all ${checks} checks passed`);
  process.exit(fail ? 1 : 0);
})();
