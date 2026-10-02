// In-page mock of the Supabase client for two-browser tests (2026-10-03).
// Every page gets one; realtime broadcasts are forwarded to the OTHER page through a Playwright
// binding (window.__relaySend -> Python -> other page's window.__relayDeliver), so two real game
// pages can play a live match against each other with no backend.
window.__mkRelayClient = function(me, profiles){
  const handlers = {}; // channelName -> [{event, fn}]
  const db = {profiles: profiles || []};
  window.__relayDeliver = function(channel, event, payload){
    (handlers[channel]||[]).filter(h=> h.event===event).forEach(h=>{ try{ h.fn({payload}); }catch(e){ console.error('relay handler', e); } });
  };
  function q(table){
    let rows = (db[table]||[]).slice(), single = false;
    const b = { select(){ return b; }, eq(k,v){ rows = rows.filter(r=> r[k]===v); return b; }, in(k,vs){ rows = rows.filter(r=> vs.includes(r[k])); return b; },
      order(){ return b; }, limit(){ return b; }, gte(){ return b; }, maybeSingle(){ single = true; return b; }, update(){ return b; }, upsert(){ return b; }, insert(){ return b; }, delete(){ return b; },
      then(res, rej){ return Promise.resolve({data: single ? (rows[0]||null) : rows, error:null}).then(res, rej); } };
    return b;
  }
  return {
    from: q,
    rpc: async (name, args)=>{ (window.__rpcLog = window.__rpcLog || []).push(name); return {data:null, error:null}; },
    channel(name){
      const ch = {
        on(kind, filter, fn){ (handlers[name] = handlers[name] || []).push({event: filter && filter.event, fn}); return ch; },
        subscribe(cb){ cb && cb('SUBSCRIBED'); return ch; },
        send(msg){ window.__relaySend(name, msg.event, JSON.parse(JSON.stringify(msg.payload))); return Promise.resolve('ok'); },
        track(){}, presenceState(){ return {}; },
      };
      return ch;
    },
    removeChannel(){}, auth: {},
  };
};
