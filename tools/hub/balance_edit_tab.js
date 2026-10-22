// balance_edit_tab.js — the 🎚️ Budget & stats tab, inlined into .hub/index.html by tools/hub/build_hub.py after tools/skill_costs.js
// (window.SkillCosts), bramblewood-budget.js (window.BramblewoodBudget), SC_SEED (canonical/skill-costs.json) and SC_CARDS (the cards
// the balance tools measure), with HB_DATA (each card's map and animal, the special monsters' rows, the BR weights) built by build_hub.py.
// 2026-10-19 (package HB, owner 17:44: "Where is our balance, monsters, and skills file -> can it be put into the artefact for my
// assessment. Also s.t. i can edit the values"). Three views:
//   Budget    every budget constant as a number input; any edit recomputes, in the page, every card's Base, N, score and band status, and
//             lists the cards that flip; an N(L) table for a few Bases.
//   Cards     every live card against the budget, Attack and Health editable in the table.
//   Monsters  the special monsters (canonical/special-monsters.json, package RJ): stats editable, score, N needed, equivalent card, BR.
// Edits persist in the artifact's db, the Skill costs tab's pattern (await claude.use("db"), one onSnapshot per collection, one write at
// a time per doc, 600 ms debounce): collection "budgetEdits" (doc id = the constant: {key, value, prev, updatedAt}), "cardEdits" (doc id =
// card id: {id, attack, health, prev: {attack, health}, note, updatedAt}), "monsterEdits" (doc id = the monster's key: {key, id, name,
// group, attack, health, prev, note, source, updatedAt}). A doc back at the file's values (and no note) is deleted. The files are always
// the seeds, never the db. Without db the tab still works for this visit and offers Copy JSON. Claude applies the edits with
// tools/hub/pull_balance_edits.md and tools/hub/apply_balance_edits.js.
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s==null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const hub = window.hub, SC = window.SkillCosts, BB = window.BramblewoodBudget;
  if(!hub || !SC || !BB || typeof HB_DATA === 'undefined' || typeof SC_SEED === 'undefined' || typeof SC_CARDS === 'undefined') return;
  const r1 = v=> Math.round(v * 10) / 10, r2 = v=> Math.round(v * 100) / 100, EPS = 1e-9;
  const fmt = v=> v == null || !isFinite(v) ? '–' : String(r2(v));

  // ---------- the budget constants ----------
  const FILEB = SC_SEED.budget || {}, DEF = BB.DEFAULTS || {};
  const HAS_MAP = DEF.perMap != null; // the helper has the Map term (BF3); without it the page adds perMap × Map itself
  const CONST = [ // [key, label, what it does, input step]
    ['base', 'Base', 'the number every Base starts from', 0.5],
    ['perRarity', 'Rarity', '× the rarity rank (the values below)', 0.5],
    ['perWait', 'Wait', '× Wait', 0.5], ['perWait2', 'Wait²', '× Wait²', 0.1],
    ['perLumber', 'Lumber', '× Lumber', 0.5], ['perLumber2', 'Lumber²', '× Lumber²', 0.1],
    ['perRitual', 'Ritual', '× Ritual points', 0.5],
    ['perMap', 'Map', '× the map where the card becomes obtainable', 0.05],
    ['scale', 'N × (scale)', 'BF5 (owner 21:36): the whole N times this; 0.5 halves it', 0.05],
    ['plainBonus', 'N × (no abilities)', 'BF5 (10-21): a card with no abilities at all', 0.01], ['lightBonus', 'N × (only light abilities)', 'BF5 (10-21): only Flying, Tide, Diurnal / Nocturnal / Crepuscular', 0.01],
    ['fragileUse', 'Fragile ×', 'BF7 (10-22): a Fragile card\'s caps, both left sides × this (more stats; was BF5\'s N × 0.75)', 0.05],
    ['levelLinDiv', 'Level ÷ (in Base)', 'N = (Base + L ÷ this) × …', 1],
    ['levelDiv', 'Level ÷ (growth)', '… × (1 + L ÷ this)', 1],
    ['zeroPenalty', 'Level 0 penalty', 'N at Level 0 = Base − this', 0.5],
    ['missMult', 'Half-miss ×', 'the stat terms (2A+H, A·H; not S, BF7 10-22) × this per Evasive, Swift, Flying, Shadow, Blind', 0.05],
    ['bandLow', 'Band: well under at', 'a card is well under when f×((2A+H)×m+S) ≤ this × N; over when f×((2A+H)×m+S) > N or f×(A·H×m+S·|S|) > (N/3)² (BF6, owner 15:15; BF7 10-22)', 0.05]];
  const FALLBACK = {perMap: 0, bandLow: 0.6};
  const SEEDB = {}; CONST.forEach(([k])=> SEEDB[k] = FILEB[k] != null ? +FILEB[k] : DEF[k] != null ? +DEF[k] : FALLBACK[k]);
  const NOTFILE = k=> FILEB[k] == null && DEF[k] == null; // shown, but neither file has it yet
  const bEd = {}; // key -> value
  const cfgOf = ed=>{ const c = Object.assign({}, FILEB, SEEDB); Object.assign(c, ed || {}); return c; };
  const bVal = k=> k in bEd ? bEd[k] : SEEDB[k];

  // ---------- cards ----------
  const RN = {starter:'Base', common:'Common', uncommon:'Uncommon', rare:'Rare', veryrare:'Very Rare', superrare:'Super Rare', epic:'Epic', heroic:'Heroic', unique:'Unique', legendary:'Legendary', mythic:'Mythic', ancient:'Ancient', divine:'Divine', void:'Void', daemonic:'Daemonic', quest:'Quest', questunique:'Quest Unique', special:'Special'};
  const rarName = r=> RN[r] || (r || 'No rarity');
  const MAPN = {}; (HB_DATA.maps || []).forEach(m=>{ if(!m.sub && !(m.num in MAPN)) MAPN[m.num] = m.name; });
  const mapLabel = n=> n ? 'Map ' + n + (MAPN[n] ? ': ' + MAPN[n] : '') : 'No map';
  const HALF = SC_SEED.halfMiss || BB.HALF_MISS || [];
  const calc = SC.make(SC_SEED);
  const cards = SC_CARDS.filter(x=> HB_DATA.cards[x.id]).map(x=>{ const h = HB_DATA.cards[x.id];
    return {id:x.id, name:x.n, rarity:x.r || null, cost:x.c, wait:x.w, attack:x.a, health:x.h, effects:x.e || {}, faction:x.faction, basic:x.basic, tutorial:x.tutorial, quest:x.quest,
      source:x.k ? {kind:x.k} : undefined, mapN: +h.m || 0, mapId: h.mi || '', animal: h.an || '', group: h.ag || '', cn: h.cn || '',
      halves: HALF.filter(k=> (x.e || {})[k]).length}; });
  const CBY = {}; cards.forEach(c=> CBY[c.id] = c);
  const cEd = {}; // id -> {attack, health, note}
  const statsOf = c=>{ const e = cEd[c.id]; return {attack: e && e.attack != null ? e.attack : c.attack, health: e && e.health != null ? e.health : c.health}; };
  const sCache = {};
  function sOf(c, A){ const k = c.id + '|' + A; if(!(k in sCache)) sCache[k] = calc.cardS(c.effects, Object.assign({}, c, {attack: A})); return sCache[k]; }
  function baseOf(d, cfg, M){ const b = BB.baseOf(Object.assign({}, d, {obtainMap: M || 0}), cfg); return HAS_MAP ? b : r2(b + (+cfg.perMap || 0) * (M || 0)); }
  const st = {view:'budget', level:'1', q:'', v:'all', r:'*', map:'*', an:'*', key:'status', dir:-1, open:null, mq:'', mv:'all', mg:'*', mkey:'over', mdir:-1, mopen:null};
  const levelFor = c=> st.level === 'start' ? SC.levelOf(c) : 1;
  function statusOf(x1, x2, N, cfg){ const N2 = r2((N / 3) * (N / 3)); if(x1 > N + EPS || x2 > N2 + EPS) return 'over'; if(x1 <= (+cfg.bandLow) * N + EPS) return 'under'; return 'in'; }
  // 2026-10-22 (package BF7): the caps' left sides from the helper (BB.capScores: the half-miss m on the stat terms only, Fragile's f on the whole
  // left side), N x the card's N multiplier (BB.nMultOf) and an Archer's Attack at 0, as tools/skill_costs.js budget() does
  function evalCard(c, cfg, s){ const A = +s.attack || 0, H = +s.health || 0, sc = sOf(c, A), m = Math.pow(+cfg.missMult, c.halves), L = levelFor(c), e = c.effects || {}, Ae = (e.archer && !(Number(e.archer) < 0)) ? 0 : A;
    const base = baseOf(c, cfg, c.mapN), N = r2(BB.nAt(base, L, cfg) * (BB.nMultOf ? BB.nMultOf(e, cfg) : 1)), N2 = r2((N / 3) * (N / 3)), cs = BB.capScores(Ae, H, sc.S, e, cfg, {m}), x1 = cs.x1, x2 = cs.x2 /* 2026-10-21 (BF6, owner 15:15: "for the cap-2, it should be AxH+SxS instead"): cap 2 is A·H + S·|S| */;
    return {base, L, N, N2, S: sc.S, parts: sc.parts, missing: sc.missing, m, x1, x2, status: statusOf(x1, x2, N, cfg), share: x1 / N}; }
  let FILE = {}, NOW = {};
  function recomputeFile(){ const cfg = cfgOf(null); FILE = {}; cards.forEach(c=> FILE[c.id] = evalCard(c, cfg, c)); }
  function recompute(){ const cfg = cfgOf(bEd); NOW = {}; cards.forEach(c=> NOW[c.id] = evalCard(c, cfg, statsOf(c))); }

  // ---------- monsters ----------
  const RW = HB_DATA.ratingWeight || {}, LEG = BB.LADDER.indexOf('legendary');
  const brAs = (rar, L)=>{ const w = RW[BB.LADDER[BB.rankOf(rar)]] || 1, cap = Math.max(11, L), l = Math.max(0, Math.min(cap, L)); return r1(w * (l <= 0 ? 0.7 : 1 + (l - 1) * 0.31)); }; // arena_app.js ratingLevelFactor
  const mons = (HB_DATA.monsters || []).map(r=> Object.assign({}, r, {halves: r.mm > 1 ? Math.max(1, Math.round(Math.log(r.mm) / Math.log(+SEEDB.missMult || 1.5))) : 0}));
  const MBY = {}; mons.forEach(r=> MBY[r.key] = r);
  const mEd = {}; // key -> {attack, health, note}
  const mStats = r=>{ const e = mEd[r.key], s = r.st || {}; return {attack: e && e.attack != null ? e.attack : s.attack, health: e && e.health != null ? e.health : s.health}; };
  function evalMon(r, cfg, s){
    const A = +s.attack || 0, H = +s.health || 0, m = Math.pow(+cfg.missMult, r.halves), S = +r.S || 0, d = {rarity: r.st.rarity, wait: r.st.wait || 0, cost: r.st.cost || 0, effects: {}};
    const cs = BB.capScores(A, H, S, null, cfg, {m, f: r.f || 1}) /* BF7 (10-22): m on the stats only */, x1 = cs.x1, x2 = cs.x2 /* BF6: cap 2 A·H + S·|S| */, need = r2(Math.max(x1, 3 * Math.sqrt(Math.max(0, x2))));
    const nAt = (dd, L)=> BB.nAt(baseOf(dd, cfg, r.map), L, cfg), holds = N=> x1 <= N + EPS && x2 <= (N / 3) * (N / 3) + EPS;
    const N = nAt(d, r.lv); let eq = null;
    for(let k = Math.min(LEG, BB.rankOf(d.rarity)); k <= LEG && !eq; k++){ const dd = Object.assign({}, d, {rarity: BB.LADDER[k]}); for(let L = 1; L <= 11; L++) if(holds(nAt(dd, L))){ eq = {rarity: BB.LADDER[k], level: L, past: false}; break; } }
    if(!eq){ const leg = Object.assign({}, d, {rarity: 'legendary'}); let L = 12; for(; L <= 2000 && !holds(nAt(leg, L)); L++); eq = {rarity: 'legendary', level: L, past: true, Y: r2(need / nAt(leg, 11))}; }
    return {x1, x2, need, N, m, ok: holds(N), over: r2(need / N), eq, brP: brAs(eq.rarity, eq.level)}; }
  const eqText = (e, r)=> e.past ? `past the cap: Lv ${e.level} Legendary (${e.Y}× a Lv 11 Legendary's N)` : `Lv ${e.level} ${rarName(e.rarity)}`;
  let MFILE = {}, MNOW = {};
  function recomputeMons(){ const c0 = cfgOf(null), c1 = cfgOf(bEd); MFILE = {}; MNOW = {}; mons.forEach(r=>{ MFILE[r.key] = evalMon(r, c0, r.st); MNOW[r.key] = evalMon(r, c1, mStats(r)); }); }

  // ---------- db (the Skill costs tab's pattern) ----------
  let db = null, mode = 'pending'; // pending | on | off | ro
  const timers = {}, busy = {}, chains = {};
  const COLL = {b: 'budgetEdits', c: 'cardEdits', m: 'monsterEdits'};
  const now = ()=> new Date().toISOString();
  function body(kind, key){
    if(kind === 'b'){ if(!(key in bEd)) return null; return {key, value: bEd[key], prev: SEEDB[key], updatedAt: now()}; }
    if(kind === 'c'){ const e = cEd[key], c = CBY[key]; if(!e) return null; const s = statsOf(c); return {id: key, name: c.name, attack: s.attack, health: s.health, prev: {attack: c.attack, health: c.health}, note: e.note || '', updatedAt: now()}; }
    const e = mEd[key], r = MBY[key]; if(!e) return null; const s = mStats(r);
    return {key, id: r.id, name: r.name, group: r.g, where: r.where, attack: s.attack, health: s.health, prev: {attack: r.st.attack, health: r.st.health}, note: e.note || '', source: r.src.file ? r.src.file + ' ' + r.src.path : 'computed', updatedAt: now()};
  }
  function save(kind, key){
    if(mode !== 'on') { renderStatus(); return; }
    const t = kind + '|' + key; clearTimeout(timers[t]);
    timers[t] = setTimeout(()=>{ delete timers[t]; busy[t] = true;
      chains[t] = (chains[t] || Promise.resolve()).then(()=>{ const ref = db.collection(COLL[kind]).doc(key), b = body(kind, key); return b ? ref.set(b) : ref.delete(); })
        .then(()=>{ delete busy[t]; renderStatus('Saved'); }, err=>{ delete busy[t];
          if(err && (err.code === 'invalid_argument' || err.code === 'revoked' || err.code === 'not_granted' || err.code === 'permission_denied')){ mode = 'ro'; renderStatus(); }
          else renderStatus('Not saved (' + esc(err && err.code || 'error') + '): try again'); });
    }, 600);
  }
  const pending = (kind, key)=> timers[kind + '|' + key] || busy[kind + '|' + key];
  async function connect(){
    let d = null;
    try{ d = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('db') : null; }catch(e){ d = null; }
    if(!d){ mode = 'off'; renderStatus(); return; }
    db = d; mode = 'on'; renderStatus();
    const fail = err=>{ mode = err && err.code === 'revoked' ? 'off' : 'ro'; renderStatus(); };
    try{
      db.collection(COLL.b).onSnapshot(snap=>{ const seen = {};
        snap.docs.forEach(doc=>{ const x = doc.data() || {}, k = doc.id; if(!(k in SEEDB) || typeof x.value !== 'number' || !isFinite(x.value)) return; seen[k] = x.value; });
        Object.keys(SEEDB).forEach(k=>{ if(pending('b', k)) return; if(k in seen && seen[k] !== SEEDB[k]) bEd[k] = seen[k]; else delete bEd[k]; });
        refresh(); }, fail);
      db.collection(COLL.c).onSnapshot(snap=>{ const seen = {};
        snap.docs.forEach(doc=>{ const x = doc.data() || {}, k = doc.id, c = CBY[k]; if(!c) return; const A = Number(x.attack), H = Number(x.health);
          seen[k] = {attack: isFinite(A) && x.attack !== null ? A : c.attack, health: isFinite(H) && x.health !== null ? H : c.health, note: typeof x.note === 'string' ? x.note.slice(0, 500) : ''}; });
        Object.keys(CBY).forEach(k=>{ if(pending('c', k)) return; if(seen[k]) cEd[k] = seen[k]; else delete cEd[k]; });
        refresh(); }, fail);
      db.collection(COLL.m).onSnapshot(snap=>{ const seen = {};
        snap.docs.forEach(doc=>{ const x = doc.data() || {}, k = doc.id, r = MBY[k]; if(!r) return; const A = Number(x.attack), H = Number(x.health);
          seen[k] = {attack: isFinite(A) && x.attack !== null ? A : r.st.attack, health: isFinite(H) && x.health !== null ? H : r.st.health, note: typeof x.note === 'string' ? x.note.slice(0, 500) : ''}; });
        Object.keys(MBY).forEach(k=>{ if(pending('m', k)) return; if(seen[k]) mEd[k] = seen[k]; else delete mEd[k]; });
        refresh(); }, fail);
    }catch(e){ mode = 'off'; renderStatus(); }
  }

  // ---------- setters ----------
  function setConst(k, v){ if(v === SEEDB[k]) delete bEd[k]; else bEd[k] = v; recompute(); recomputeMons(); save('b', k); }
  function setCard(id, patch){ const c = CBY[id], e = Object.assign({attack: c.attack, health: c.health, note: ''}, cEd[id] || {}, patch);
    if(e.attack === c.attack && e.health === c.health && !e.note) delete cEd[id]; else cEd[id] = e; recompute(); save('c', id); }
  function setMon(key, patch){ const r = MBY[key], e = Object.assign({attack: r.st.attack, health: r.st.health, note: ''}, mEd[key] || {}, patch);
    if(e.attack === r.st.attack && e.health === r.st.health && !e.note) delete mEd[key]; else mEd[key] = e; recomputeMons(); save('m', key); }

  // ---------- the page ----------
  function build(){
    if(build.done) return; build.done = true;
    const host = $('hbHost'); if(!host) return;
    recomputeFile(); recompute(); recomputeMons();
    host.innerHTML = `<div class="dec-head"><h2>Budget &amp; stats</h2><p>The stat budget's numbers, every live card's Attack and Health, and the special monsters, all editable. Every change recomputes here at once: each card's Base, N, score (2A+H+S), A·H+S·|S| and whether it is <b>over</b>, <b>in band</b> or <b>well under</b>. Edits save to this hub; Claude applies them to the files (bramblewood-budget.js, canonical/skill-costs.json, canonical/cards.json, the raid files). The files are not changed until then.</p>
      <p class="hb-xlink">Skill costs (S of every skill, trigger and action, the measured S and its confidence, the Combos view): <a href="#costs" data-tab="costs">🧮 Skill costs tab →</a> · Win rates: <a href="#balance" data-tab="balance">⚖️ Balance →</a></p></div>
      <div class="sc-status" id="hbStatus" role="status"></div>
      <nav class="dec-seg hb-views" role="group" aria-label="View" id="hbViews">${[['budget', '📐 Budget'], ['cards', '🎴 Cards'], ['monsters', '👹 Monsters']].map(([v, l])=> `<button type="button" data-view="${v}" aria-pressed="${v === st.view}">${l} <b id="hbVn-${v}"></b></button>`).join('')}<button type="button" data-hbgo="costs">🧮 Skills ↗</button></nav>
      <div id="hbBody"></div>`;
    $('hbViews').addEventListener('click', e=>{ const g = e.target.closest('button[data-hbgo]'); if(g){ hub.show(g.dataset.hbgo); return; }
      const b = e.target.closest('button[data-view]'); if(!b) return; show(b.dataset.view); });
    $('hbStatus').addEventListener('click', e=>{ const b = e.target.closest('button[data-copy]'); if(b) copyJSON(); });
    const bodyEl = $('hbBody');
    bodyEl.addEventListener('input', onInput); bodyEl.addEventListener('change', onChange); bodyEl.addEventListener('click', onClick);
    bodyEl.addEventListener('keydown', e=>{ const tr = e.target.closest('[data-toggle]'); if(tr && e.target === tr && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); tr.click(); } });
    renderStatus(); render(); connect();
  }
  function show(v){ st.view = v; $('hbViews').querySelectorAll('button[data-view]').forEach(x=> x.setAttribute('aria-pressed', String(x.dataset.view === v))); render(); }
  function refresh(){ if(!build.done) return; recompute(); recomputeMons(); renderStatus(); const a = document.activeElement;
    // keep a field the owner is typing in: re-render everything around it only when it isn't inside the view
    if(a && a.closest && a.closest('#hbBody') && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')){ renderLive(); return; } render(); }
  function render(){ const v = st.view; counts(); if(v === 'budget') renderBudget(); else if(v === 'cards') renderCards(); else renderMons(); }
  function renderLive(){ counts(); if(st.view === 'budget'){ renderBudgetLive(); return; } if(st.view === 'cards'){ cards.forEach(c=> updateCardRow(c.id)); renderCardSum(); return; } mons.forEach(r=> updateMonRow(r.key)); renderMonSum(); }
  function counts(){ const n = o=> Object.keys(o).length; const set = (k, x)=>{ const el = $('hbVn-' + k); if(el) el.textContent = x ? x + ' edited' : ''; };
    set('budget', n(bEd)); set('cards', n(cEd)); set('monsters', n(mEd)); }

  function renderStatus(flash){
    const el = $('hbStatus'); if(!el) return; const n = Object.keys(bEd).length + Object.keys(cEd).length + Object.keys(mEd).length;
    const msg = mode === 'pending' ? 'Connecting to the hub\'s saved edits…'
      : mode === 'on' ? `Edits save to this hub for Claude to apply (${n} edited${flash ? ' · ' + flash : ''}).`
      : `<b>Edits can't be saved here.</b> They last for this visit only; ${n ? n + ' edited · ' : ''}use Copy JSON and paste it to Claude.`;
    el.className = 'sc-status ' + (mode === 'on' ? 'is-on' : mode === 'pending' ? '' : 'is-off');
    el.innerHTML = `<span>${msg}</span><button type="button" class="btn" data-copy>📋 Copy JSON</button><span class="sc-copied" id="hbCopied" aria-live="polite"></span>`;
  }
  function editsJSON(){ const docs = (kind, keys)=> keys.map(k=> ({id: k, data: body(kind, k)})).filter(d=> d.data);
    return JSON.stringify({source: 'hub 🎚️ Budget & stats', budgetEdits: docs('b', Object.keys(bEd)), cardEdits: docs('c', Object.keys(cEd)), monsterEdits: docs('m', Object.keys(mEd))}, null, 1); }
  function copyJSON(){ const text = editsJSON(), out = $('hbCopied');
    const fallback = ()=>{ if(out) out.textContent = 'Copy blocked here: select the text below and copy it.'; let ta = $('hbJSON');
      if(!ta){ ta = document.createElement('textarea'); ta.id = 'hbJSON'; ta.className = 'sc-json'; ta.readOnly = true; ta.setAttribute('aria-label', 'Edits as JSON'); $('hbStatus').after(ta); }
      ta.value = text; ta.focus(); ta.select(); };
    try{ if(!navigator.clipboard || !navigator.clipboard.writeText){ fallback(); return; } navigator.clipboard.writeText(text).then(()=>{ if(out) out.textContent = 'Copied the edits as JSON.'; }, fallback); }catch(e){ fallback(); }
  }

  // ---------- events ----------
  const numIn = inp=>{ const v = inp.value.trim(); return v === '' || !isFinite(+v) ? null : +v; };
  function onInput(e){ const t = e.target;
    if(t.dataset.const){ const v = numIn(t); if(v == null) return; if(t.dataset.const === 'levelLinDiv' || t.dataset.const === 'levelDiv'){ if(v === 0) return; } setConst(t.dataset.const, v); markConst(t.dataset.const); renderBudgetLive(); counts(); return; }
    if(t.dataset.card){ const v = numIn(t); if(v == null || v < 0) return; setCard(t.dataset.card, {[t.dataset.stat]: Math.round(v)}); updateCardRow(t.dataset.card); renderCardSum(); counts(); return; }
    if(t.dataset.cnote){ setCard(t.dataset.cnote, {note: t.value.slice(0, 500)}); updateCardRow(t.dataset.cnote); counts(); return; }
    if(t.dataset.mon){ const v = numIn(t); if(v == null || v < 0) return; setMon(t.dataset.mon, {[t.dataset.stat]: Math.round(v)}); updateMonRow(t.dataset.mon); renderMonSum(); counts(); return; }
    if(t.dataset.mnote){ setMon(t.dataset.mnote, {note: t.value.slice(0, 500)}); updateMonRow(t.dataset.mnote); counts(); return; }
    if(t.id === 'hbQ'){ st.q = t.value.trim().toLowerCase(); renderCardBody(); return; }
    if(t.id === 'hbMq'){ st.mq = t.value.trim().toLowerCase(); renderMonBody(); return; }
  }
  function onChange(e){ const t = e.target;
    if(t.dataset.const){ if(numIn(t) == null) t.value = bVal(t.dataset.const); return; }
    if(t.dataset.card){ if(numIn(t) == null) t.value = statsOf(CBY[t.dataset.card])[t.dataset.stat]; return; }
    if(t.dataset.mon){ if(numIn(t) == null) t.value = mStats(MBY[t.dataset.mon])[t.dataset.stat]; return; }
    const sel = {hbR: 'r', hbMap: 'map', hbAn: 'an', hbLv: 'level', hbMg: 'mg'}[t.id];
    if(sel){ st[sel] = t.value; if(sel === 'level'){ recomputeFile(); recompute(); } if(sel === 'mg') renderMonBody(); else renderCardBody(); }
  }
  function onClick(e){ const t = e.target;
    const rst = t.closest('button[data-reset]'); if(rst){ const k = rst.dataset.reset; delete bEd[k]; recompute(); recomputeMons(); save('b', k); renderBudget(); counts(); return; }
    const cr = t.closest('button[data-creset]'); if(cr){ delete cEd[cr.dataset.creset]; recompute(); save('c', cr.dataset.creset); renderCardBody(); counts(); return; }
    const mr = t.closest('button[data-mreset]'); if(mr){ delete mEd[mr.dataset.mreset]; recomputeMons(); save('m', mr.dataset.mreset); renderMonBody(); counts(); return; }
    const fl = t.closest('button[data-flip]'); if(fl){ st.q = fl.dataset.flip; st.v = 'all'; st.r = '*'; st.map = '*'; st.an = '*'; st.open = fl.dataset.flip; show('cards'); return; }
    const sv = t.closest('[data-sv]'); if(sv){ st.v = sv.dataset.sv; renderCardBody(); return; }
    const msv = t.closest('[data-msv]'); if(msv){ st.mv = msv.dataset.msv; renderMonBody(); return; }
    const th = t.closest('th[data-k]'); if(th){ const k = th.dataset.k; if(th.closest('.hb-mt')){ if(st.mkey === k) st.mdir = -st.mdir; else { st.mkey = k; st.mdir = (k === 'name' || k === 'g') ? 1 : -1; } renderMonBody(); }
      else { if(st.key === k) st.dir = -st.dir; else { st.key = k; st.dir = (k === 'name' || k === 'id' || k === 'animal') ? 1 : -1; } renderCardBody(); } return; }
    if(t.closest('input, textarea, button, a, select')) return;
    const tg = t.closest('[data-toggle]'); if(tg){ const id = tg.dataset.toggle;
      if(tg.dataset.kind === 'm'){ st.mopen = st.mopen === id ? null : id; renderMonBody(); } else { st.open = st.open === id ? null : id; renderCardBody(); }
      const again = document.querySelector(`[data-toggle="${CSS.escape(id)}"]`); if(again) again.focus(); }
  }

  // ---------- Budget view ----------
  function rarityChips(cfg){ const per = +cfg.perRarity; return BB.LADDER.slice(0, 12).map((r, i)=> `<span class="chip">${esc(rarName(r))} <b>${fmt(per * i)}</b></span>`).join(' '); }
  function constRow([k, label, what, step]){ const ed = k in bEd, f = SEEDB[k];
    const dis = FILEB[k] != null && DEF[k] != null && +FILEB[k] !== +DEF[k] ? ` · <b class="hb-warn">bramblewood-budget.js says ${esc(DEF[k])}</b>` : '';
    return `<div class="sc-row hb-cr${ed ? ' is-ed' : ''}" data-ckey="${k}"><div class="sc-lb"><b>${esc(label)}</b><small><code>${k}</code> · ${esc(what)}${NOTFILE(k) ? ' · <i>not in the files yet (default ' + esc(f) + ')</i>' : ''}${dis}</small>${k === 'perRarity' ? `<div class="hb-rar" id="hbRar">${rarityChips(cfgOf(bEd))}</div>` : ''}</div>`
      + `<div class="sc-in"><input type="number" step="${step}" inputmode="decimal" data-const="${k}" value="${bVal(k)}" aria-label="${esc(label)}"><span class="sc-seed">file ${esc(f)}</span></div>`
      + `<button type="button" class="hb-rst" data-reset="${k}"${ed ? '' : ' disabled'} aria-label="Reset ${esc(label)} to the file's value">Reset to file</button></div>`; }
  function markConst(k){ const row = document.querySelector(`.hb-cr[data-ckey="${k}"]`); if(!row) return; row.classList.toggle('is-ed', k in bEd); const b = row.querySelector('button[data-reset]'); if(b) b.disabled = !(k in bEd); }
  function renderBudget(){
    $('hbBody').innerHTML = `<div class="sc-grid hb-grid"><section class="sc-ed hb-ed" aria-label="Budget constants"><p class="sc-hint">Base = base + Rarity + Wait + Lumber + Ritual + Map terms; N(L) = (Base + L ÷ levelLinDiv) × (1 + L ÷ levelDiv); N(0) = Base − the Level 0 penalty. Both rules allow equal: 2A+H+S ≤ N and A·H+S ≤ (N/3)².</p>
      <div class="sc-rows hb-rows">${CONST.map(constRow).join('')}</div></section>
      <section class="hb-live" aria-label="Live preview"><p class="sc-formula" id="hbFormula"></p><div class="sc-sum" id="hbSum"></div>
      <h3 class="hb-h">N(L) for a few Bases</h3><div class="bal-wrap"><table class="bal-t hb-nt" id="hbNt"></table></div>
      <h3 class="hb-h">Cards that flip <small id="hbFlipN"></small></h3><p class="note">Against the files' numbers and stats, at ${st.level === 'start' ? 'each card\'s start level' : 'Level 1'}. Tap one to open it in Cards.</p><div class="hb-flips" id="hbFlips"></div></section></div>`;
    renderBudgetLive();
  }
  function tally(E){ const k = {over: 0, in: 0, under: 0}; cards.forEach(c=> k[E[c.id].status]++); return k; }
  function renderBudgetLive(){
    if(!$('hbSum')) return; const cfg = cfgOf(bEd), c0 = cfgOf(null), a = tally(NOW), b = tally(FILE), d = (x, y)=> x === y ? '' : ` <small>(file ${y})</small>`;
    const rar = $('hbRar'); if(rar) rar.innerHTML = rarityChips(cfg);
    const f = BB.formulaParts ? BB.formulaParts(cfg) : null;
    $('hbFormula').textContent = f ? `${f.n}; ${f.zero}. ${f.base}${HAS_MAP || !(+cfg.perMap) ? '' : ' + ' + cfg.perMap + '×Map'}. Well under at ≤ ${cfg.bandLow} × N.${f.miss ? ` Caps: ${f.cap1}, ${f.cap2}; ${f.miss}. ${f.fragileText}.` : '' /* BF7 (10-22) */}` : '';
    const flips = cards.filter(c=> NOW[c.id].status !== FILE[c.id].status);
    $('hbSum').innerHTML = `<div class="sc-tile v-ok"><b>${a.in}</b><span>in band${d(a.in, b.in)}</span></div><div class="sc-tile v-over"><b>${a.over}</b><span>over budget${d(a.over, b.over)}</span></div>`
      + `<div class="sc-tile v-under"><b>${a.under}</b><span>well under${d(a.under, b.under)}</span></div><div class="sc-tile"><b>${flips.length}</b><span>flipped, of ${cards.length} cards</span></div>`;
    const LV = [0, 1, 2, 4, 7, 10, 11], BASES = [14, 21, 30, 40];
    $('hbNt').innerHTML = `<thead><tr><th>Base</th>${LV.map(L=> `<th>Lv ${L}</th>`).join('')}</tr></thead><tbody>` + BASES.map(B=> `<tr><td><b>${B}</b></td>${LV.map(L=>{ const n = BB.nAt(B, L, cfg), o = BB.nAt(B, L, c0);
      return `<td class="num">${fmt(n)}${n !== o ? ` <small><s>${fmt(o)}</s></small>` : ''}</td>`; }).join('')}</tr>`).join('') + '</tbody>';
    const NAME = {over: 'over', in: 'in band', under: 'well under'};
    $('hbFlipN').textContent = flips.length ? `(${flips.length})` : '';
    $('hbFlips').innerHTML = flips.length ? flips.sort((x, y)=> x.name.localeCompare(y.name)).slice(0, 150).map(c=> `<button type="button" class="chip hb-flip v-${NOW[c.id].status}" data-flip="${esc(c.id)}">${esc(c.name)} <small>${NAME[FILE[c.id].status]} → <b>${NAME[NOW[c.id].status]}</b></small></button>`).join('') + (flips.length > 150 ? `<p class="note">and ${flips.length - 150} more: see Cards → Flipped.</p>` : '')
      : '<p class="dec-empty">No card changes status.</p>';
  }

  // ---------- Cards view ----------
  const ST_LABEL = {over: 'over', in: 'in band', under: 'well under'};
  function renderCards(){
    const opt = (arr, cur)=> arr.map(([v, l])=> `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(l)}</option>`).join('');
    const cnt = f=>{ const n = {}; cards.forEach(c=>{ const v = f(c); n[v] = (n[v] || 0) + 1; }); return n; };
    const nr = cnt(c=> c.rarity || 'none'), nm = cnt(c=> c.mapN), na = cnt(c=> c.group || c.animal || '-');
    const rars = [['*', 'Any rarity']].concat(BB.LADDER.concat(['quest', 'questunique', 'special', 'none']).filter(r=> nr[r]).map(r=> [r, (r === 'none' ? 'No rarity' : rarName(r)) + ` (${nr[r]})`]));
    const maps = [['*', 'Any map']].concat(Object.keys(nm).map(Number).sort((a, b)=> a - b).map(m=> [String(m), mapLabel(m) + ` (${nm[m]})`]));
    const ans = [['*', 'Any animal']].concat(Object.keys(na).sort((a, b)=> na[b] - na[a] || a.localeCompare(b)).map(a=> [a, (a === '-' ? 'Not a creature' : a) + ` (${na[a]})`]));
    $('hbBody').innerHTML = `<div class="sc-bar"><input type="search" id="hbQ" value="${esc(st.q)}" placeholder="Card, id or skill…" aria-label="Search cards">
        <select id="hbR" aria-label="Rarity">${opt(rars, st.r)}</select><select id="hbMap" aria-label="Map">${opt(maps, st.map)}</select><select id="hbAn" aria-label="Animal">${opt(ans, st.an)}</select>
        <select id="hbLv" aria-label="Level for N">${opt([['1', 'N at Level 1'], ['start', 'N at each card\'s start level']], st.level)}</select></div>
      <div class="sc-bar"><div class="dec-seg" role="group" aria-label="Show" id="hbSv"></div></div>
      <p class="note" id="hbCsum"></p>
      <div class="bal-wrap hb-wrap"><table class="bal-t sc-t hb-ct"><thead><tr>${[['name', 'Card'], ['rarity', 'Rarity'], ['wait', 'W'], ['cost', '🪵'], ['map', 'Map'], ['attack', 'A'], ['health', 'H'], ['skills', 'Skills (S each)'], ['S', 'S'], ['base', 'Base'], ['N', 'N'], ['x1', '2A+H+S'], ['x2', 'A·H+S·|S| vs (N/3)²'], ['status', 'Band']].map(([k, l])=> `<th data-k="${k}">${l}</th>`).join('')}</tr></thead><tbody id="hbCbody"></tbody></table></div>
      <p class="note sc-foot" id="hbCfoot"></p>`;
    renderCardBody();
  }
  function cardSkills(b){ return b.parts.length ? b.parts.map(p=> `<span class="chip">${esc(p[1])} <b>${p[2]}</b></span>`).join('') : '<small>none</small>'; }
  function cardFilter(){
    const terms = st.q.split(/\s+/).filter(Boolean);
    return cards.filter(c=>{ const b = NOW[c.id], f = FILE[c.id];
      if(st.v === 'over' && b.status !== 'over') return false; if(st.v === 'in' && b.status !== 'in') return false; if(st.v === 'under' && b.status !== 'under') return false;
      if(st.v === 'flip' && b.status === f.status) return false; if(st.v === 'edited' && !cEd[c.id]) return false;
      if(st.r !== '*' && (c.rarity || 'none') !== st.r) return false; if(st.map !== '*' && String(c.mapN) !== st.map) return false;
      if(st.an !== '*' && (c.group || c.animal || '-') !== st.an) return false;
      if(terms.length){ const hay = (c.name + ' ' + c.id + ' ' + c.animal + ' ' + Object.keys(c.effects || {}).join(' ') + ' ' + ((c.effects || {}).triggers || []).map(t=> t && (t.on + ' ' + t.do)).join(' ')).toLowerCase(); if(!terms.every(t=> hay.includes(t))) return false; }
      return true; }); }
  const ORDER = {over: 3, in: 2, under: 1};
  function cardVal(c, k){ const b = NOW[c.id], s = statsOf(c);
    return k === 'name' ? c.name : k === 'rarity' ? BB.rankOf(c.rarity) : k === 'map' ? c.mapN : k === 'attack' ? s.attack : k === 'health' ? s.health : k === 'skills' ? b.parts.length
      : k === 'status' ? ORDER[b.status] * 1000 + b.share : k === 'base' ? b.base : k in b ? b[k] : c[k]; }
  function renderCardSum(){ const el = $('hbCsum'); if(!el) return; const a = tally(NOW), f = tally(FILE), d = (x, y)=> x === y ? '' : ` (file ${y})`;
    el.innerHTML = `<b>${a.in}</b> in band${d(a.in, f.in)} · <b class="hb-o">${a.over}</b> over${d(a.over, f.over)} · <b class="hb-u">${a.under}</b> well under${d(a.under, f.under)} · ${Object.keys(cEd).length} card${Object.keys(cEd).length === 1 ? '' : 's'} edited${Object.keys(bEd).length ? ' · with ' + Object.keys(bEd).length + ' budget edit(s)' : ''}`;
    const seg = $('hbSv'); if(seg){ const n = {all: cards.length, over: a.over, in: a.in, under: a.under, flip: cards.filter(c=> NOW[c.id].status !== FILE[c.id].status).length, edited: Object.keys(cEd).length};
      seg.innerHTML = [['all', 'All'], ['over', 'Over'], ['in', 'In band'], ['under', 'Well under'], ['flip', 'Flipped'], ['edited', 'Edited']].map(([v, l])=> `<button type="button" data-sv="${v}" aria-pressed="${v === st.v}">${l} <b>${n[v]}</b></button>`).join(''); } }
  function cardCells(c){ const b = NOW[c.id], f = FILE[c.id], ch = (x, y)=> x !== y ? ` <small><s>${fmt(y)}</s></small>` : '';
    return {S: `${fmt(b.S)}${ch(b.S, f.S)}`, base: `${fmt(b.base)}${ch(b.base, f.base)}`, N: `${fmt(b.N)}${b.L !== 1 ? `<small> Lv ${b.L}</small>` : ''}${ch(b.N, f.N)}`,
      x1: `${fmt(b.x1)} <small>${b.x1 <= b.N + EPS ? '≤' : '&gt;'} ${fmt(b.N)} · ${Math.round(100 * b.share)}%</small>${b.m !== 1 ? ` <small>×${r2(b.m)}</small>` : ''}`,
      x2: `${fmt(b.x2)} <small>${b.x2 <= b.N2 + EPS ? '≤' : '&gt;'} ${fmt(b.N2)}</small>`,
      status: `${ST_LABEL[b.status]}${b.status !== f.status ? ` <small>(was ${ST_LABEL[f.status]})</small>` : ''}`}; }
  function cardRow(c){ const b = NOW[c.id], s = statsOf(c), e = cEd[c.id], cells = cardCells(c), open = st.open === c.id;
    const statIn = k=> `<input type="number" min="0" step="1" inputmode="numeric" class="hb-num${s[k] !== c[k] ? ' is-ch' : ''}" data-card="${esc(c.id)}" data-stat="${k}" value="${s[k]}" aria-label="${esc(c.name)} ${k === 'attack' ? 'Attack' : 'Health'}">`;
    const row = `<tr data-row="${esc(c.id)}" class="v-${b.status === 'in' ? 'ok' : b.status}${e ? ' is-ed' : ''}"><td data-toggle="${esc(c.id)}" tabindex="0" aria-expanded="${open}" class="hb-name"><b>${esc(c.name)}</b><small>${esc(c.id)}${c.animal ? ' · ' + esc(c.animal) : ''}${e && e.note ? ' · 📝' : ''}</small></td>`
      + `<td>${esc(rarName(c.rarity))}</td><td class="num">${c.wait}</td><td class="num">${c.cost}</td><td class="num" title="${esc(mapLabel(c.mapN))}">${c.mapN || '–'}</td>`
      + `<td>${statIn('attack')}</td><td>${statIn('health')}</td><td class="hb-sk">${cardSkills(b)}</td>`
      + ['S', 'base', 'N', 'x1', 'x2'].map(k=> `<td class="num${k === 'x1' && b.x1 > b.N + EPS || k === 'x2' && b.x2 > b.N2 + EPS ? ' bad' : ''}" data-c="${k}">${cells[k]}</td>`).join('') + `<td class="sc-v" data-c="status">${cells.status}</td></tr>`;
    if(!open) return row;
    const bp = BB.baseParts ? BB.baseParts(Object.assign({}, c, {obtainMap: c.mapN}), cfgOf(bEd)).parts.map(p=> `${p.k} ${fmt(p.v)}`).join(' + ') : fmt(b.base);
    return row + `<tr class="sc-detail" data-detail="${esc(c.id)}"><td colspan="14"><div class="hb-det"><div><b>Base</b> = ${esc(bp)}${!HAS_MAP && +cfgOf(bEd).perMap && c.mapN ? ' + map ' + fmt(+cfgOf(bEd).perMap * c.mapN) : ''} = ${fmt(b.base)} · ${esc(mapLabel(c.mapN))}${HB_DATA.obtainMaps ? ' (where it becomes obtainable)' : ' (the Cards tab\'s map: card-obtain-maps.json was not built)'}</div>`
      + `<div><b>S</b> = ${fmt(b.S)}: ${b.parts.length ? b.parts.map(p=> `${esc(p[1])} ${p[2]}${p[3] ? ' (' + esc(p[3]) + ')' : ''}`).join(', ') : 'no skills'}${b.m !== 1 ? ` · both scores × ${r2(b.m)} (half-miss)` : ''}${b.missing.length ? ' · <b>no cost entry:</b> ' + esc(b.missing.join(', ')) : ''}</div>`
      + `<div>File: ${c.attack}/${c.health}, ${ST_LABEL[FILE[c.id].status]}. ${c.cn ? '<small>Last note: …' + esc(c.cn) + '</small>' : ''}</div>`
      + `<label class="hb-note">Note for Claude (saved with the edit) <textarea rows="2" data-cnote="${esc(c.id)}" maxlength="500" placeholder="Why this change?">${esc(e && e.note || '')}</textarea></label>`
      + `<button type="button" class="hb-rst" data-creset="${esc(c.id)}"${e ? '' : ' disabled'}>Reset to file</button></div></td></tr>`; }
  function updateCardRow(id){ const tr = document.querySelector(`#hbCbody tr[data-row="${CSS.escape(id)}"]`); if(!tr) return; const c = CBY[id], b = NOW[id], cells = cardCells(c), e = cEd[id];
    tr.className = `v-${b.status === 'in' ? 'ok' : b.status}${e ? ' is-ed' : ''}`;
    tr.querySelectorAll('td[data-c]').forEach(td=>{ const k = td.dataset.c; td.innerHTML = cells[k]; if(k === 'x1') td.classList.toggle('bad', b.x1 > b.N + EPS); if(k === 'x2') td.classList.toggle('bad', b.x2 > b.N2 + EPS); });
    tr.querySelectorAll('input[data-card]').forEach(inp=> inp.classList.toggle('is-ch', statsOf(c)[inp.dataset.stat] !== c[inp.dataset.stat]));
    const sk = tr.querySelector('.hb-sk'); if(sk) sk.innerHTML = cardSkills(b);
    const det = document.querySelector(`#hbCbody tr[data-detail="${CSS.escape(id)}"] button[data-creset]`); if(det) det.disabled = !e; }
  function renderCardBody(){
    if(!$('hbCbody')) return; renderCardSum();
    const list = cardFilter().sort((a, b)=>{ const x = cardVal(a, st.key), y = cardVal(b, st.key); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * st.dir || a.name.localeCompare(b.name); });
    document.querySelectorAll('.hb-ct th').forEach(th=> th.dataset.k === st.key ? th.setAttribute('aria-sort', st.dir > 0 ? 'ascending' : 'descending') : th.removeAttribute('aria-sort'));
    const MAX = 250, shown = list.slice(0, MAX);
    $('hbCbody').innerHTML = shown.map(cardRow).join('') || '<tr><td colspan="14" class="dec-empty">No card matches.</td></tr>';
    $('hbCfoot').textContent = (list.length > MAX ? `Showing ${MAX} of ${list.length}; narrow the filters to see the rest. ` : `${list.length} card${list.length === 1 ? '' : 's'}. `)
      + 'Type a new Attack or Health in the table: the row recomputes at once and the edit saves. Tap a card\'s name for its Base and S breakdown, a note, and Reset to file. S uses canonical/skill-costs.json as built (the Skill costs tab\'s pending edits are not included).';
  }

  // ---------- Monsters view ----------
  function renderMons(){
    const groups = []; mons.forEach(r=>{ if(!groups.find(g=> g[0] === r.g)) groups.push([r.g, r.gt]); });
    const n = {}; mons.forEach(r=> n[r.g] = (n[r.g] || 0) + 1);
    $('hbBody').innerHTML = mons.length ? `<p class="note">The special monsters from canonical/special-monsters.json (package RJ, ${esc(HB_DATA.monstersGenerated || '')}): raid parts' brambles, the raid's elders, row-deck copies, Commons and guards, the async raid bosses, the Conquest bosses' signature units and the Tower specials. Score, N and the equivalent card recompute here with your stat and budget edits; BR as boss is RJ's number. Edits to a bramble or an async boss go to its file (raids.json castleHp, raid-bosses.json hqHp); the rest are computed from card stats, so they become an override list for Claude.</p>
      <div class="sc-bar"><input type="search" id="hbMq" value="${esc(st.mq)}" placeholder="Monster, id, where…" aria-label="Search monsters"><select id="hbMg" aria-label="Group"><option value="*">All groups (${mons.length})</option>${groups.map(([g, t])=> `<option value="${esc(g)}"${st.mg === g ? ' selected' : ''}>${esc(t)} (${n[g]})</option>`).join('')}</select></div>
      <div class="sc-bar"><div class="dec-seg" role="group" aria-label="Show" id="hbMsv"></div></div><p class="note" id="hbMsum"></p>
      <div class="bal-wrap hb-wrap"><table class="bal-t sc-t hb-mt"><thead><tr>${[['name', 'Monster'], ['g', 'Group'], ['lv', 'Lv'], ['rar', 'Rarity · W · 🪵'], ['attack', 'A'], ['health', 'H'], ['sk', 'Skills'], ['S', 'S'], ['x1', 'Score 2A+H+S'], ['x2', 'A·H+S·|S|'], ['need', 'N needed'], ['N', 'N at its Lv'], ['over', 'Band'], ['eq', 'Equivalent card'], ['brP', 'BR as player'], ['brB', 'BR as boss'], ['src', 'Stats live in']].map(([k, l])=> `<th data-k="${k}">${l}</th>`).join('')}</tr></thead><tbody id="hbMbody"></tbody></table></div>
      <p class="note sc-foot" id="hbMfoot"></p>` : '<p class="dec-empty">Run node tools/special_monsters.js, then rebuild the hub.</p>';
    renderMonBody();
  }
  function monFilter(){ const terms = st.mq.split(/\s+/).filter(Boolean);
    return mons.filter(r=>{ const b = MNOW[r.key];
      if(st.mg !== '*' && r.g !== st.mg) return false; if(st.mv === 'over' && b.ok) return false; if(st.mv === 'in' && !b.ok) return false;
      if(st.mv === 'edited' && !mEd[r.key]) return false; if(st.mv === 'flag' && !r.flag) return false;
      if(terms.length){ const hay = (r.name + ' ' + r.id + ' ' + r.where + ' ' + r.sk + ' ' + r.gt).toLowerCase(); if(!terms.every(t=> hay.includes(t))) return false; }
      return true; }); }
  function monVal(r, k){ const b = MNOW[r.key], s = mStats(r);
    return k === 'name' ? r.name : k === 'g' ? r.gt : k === 'lv' ? r.lv : k === 'rar' ? BB.rankOf(r.st.rarity) : k === 'attack' ? +s.attack || 0 : k === 'health' ? +s.health || 0 : k === 'sk' ? r.sk
      : k === 'S' ? r.S : k === 'eq' ? (b.eq.past ? 100 : 0) + BB.rankOf(b.eq.rarity) * 1000 + b.eq.level : k === 'brB' ? (+r.file.brB || 0) : k === 'src' ? (r.src.file || '~') : b[k]; }
  function renderMonSum(){ const el = $('hbMsum'); if(!el) return; let ok = 0, ok0 = 0; mons.forEach(r=>{ if(MNOW[r.key].ok) ok++; if(MFILE[r.key].ok) ok0++; });
    el.innerHTML = `<b>${ok}</b> of ${mons.length} rows in band${ok !== ok0 ? ` (file ${ok0})` : ''} · <b class="hb-o">${mons.length - ok}</b> over · ${Object.keys(mEd).length} edited`;
    const seg = $('hbMsv'); if(seg){ const n = {all: mons.length, over: mons.length - ok, in: ok, edited: Object.keys(mEd).length, flag: mons.filter(r=> r.flag).length};
      seg.innerHTML = [['all', 'All'], ['over', 'Over'], ['in', 'In band'], ['flag', 'Flagged by RJ'], ['edited', 'Edited']].map(([v, l])=> `<button type="button" data-msv="${v}" aria-pressed="${v === st.mv}">${l} <b>${n[v]}</b></button>`).join(''); } }
  function monCells(r){ const b = MNOW[r.key], f = MFILE[r.key], ch = (x, y)=> x !== y ? ` <small><s>${fmt(y)}</s></small>` : '';
    return {x1: `${fmt(b.x1)}${b.m !== 1 ? ` <small>×${r2(b.m)}</small>` : ''}${ch(b.x1, f.x1)}`, x2: `${fmt(b.x2)}${ch(b.x2, f.x2)}`, need: `${fmt(b.need)}${ch(b.need, f.need)}`, N: `${fmt(b.N)}${ch(b.N, f.N)}`,
      over: b.ok ? `in band <small>${Math.round(100 * b.over)}%</small>` : `over <small>${r2(b.over)}× N</small>`, eq: esc(eqText(b.eq, r)) + (eqText(b.eq, r) !== eqText(f.eq, r) ? ` <small>(was ${esc(eqText(f.eq, r))})</small>` : ''),
      brP: `${fmt(b.brP)}${r.file.brP != null && r.file.brP !== b.brP ? ` <small>RJ ${fmt(r.file.brP)}</small>` : ''}`}; }
  function monRow(r){ const b = MNOW[r.key], s = mStats(r), e = mEd[r.key], cells = monCells(r), open = st.mopen === r.key;
    const statIn = k=> s[k] == null ? '–' : `<input type="number" min="0" step="1" inputmode="numeric" class="hb-num${s[k] !== r.st[k] ? ' is-ch' : ''}" data-mon="${esc(r.key)}" data-stat="${k}" value="${s[k]}" aria-label="${esc(r.name)} ${k === 'attack' ? 'Attack' : 'Health'}">`;
    const src = r.src.file ? `<small>${esc(r.src.file.replace('canonical/', ''))} <code>${esc(r.src.path)}</code>${r.rj != null && r.rj !== r.st.health ? ` · RJ measured it at ${esc(r.rj)}` : ''}</small>` : '<small>computed → override list</small>';
    const row = `<tr data-row="${esc(r.key)}" class="v-${b.ok ? 'ok' : 'over'}${e ? ' is-ed' : ''}"><td data-toggle="${esc(r.key)}" data-kind="m" tabindex="0" aria-expanded="${open}" class="hb-name"><b>${esc(r.name)}${r.flag ? ' ⚑' : ''}</b><small>${esc(r.where)}${e && e.note ? ' · 📝' : ''}</small></td>`
      + `<td><small>${esc(r.gt)}</small></td><td class="num">${r.lv}</td><td><small>${esc(rarName(r.st.rarity))} · W${r.st.wait || 0} · 🪵${r.st.cost || 0}</small></td><td>${statIn('attack')}</td><td>${statIn('health')}</td>`
      + `<td class="hb-sk"><small>${esc(r.sk)}</small></td><td class="num">${fmt(r.S)}</td>` + ['x1', 'x2', 'need', 'N'].map(k=> `<td class="num" data-c="${k}">${cells[k]}</td>`).join('')
      + `<td class="sc-v" data-c="over">${cells.over}</td><td data-c="eq"><small>${cells.eq}</small></td><td class="num" data-c="brP">${cells.brP}</td><td class="num">${fmt(r.file.brB)}</td><td>${src}</td></tr>`;
    if(!open) return row;
    return row + `<tr class="sc-detail" data-detail="${esc(r.key)}"><td colspan="17"><div class="hb-det"><div><b>${esc(r.name)}</b> <code>${esc(r.key)}</code>${r.role ? ' · ' + esc(r.role) : ''} · met on map ${r.map || '–'} at Lv ${r.lv}</div>`
      + `<div><b>RJ's read:</b> ${esc(r.why || '—')}</div><div><b>RJ's equivalent:</b> ${esc(r.file.equiv || '—')}${r.file.brNote ? ' · <b>BR as boss:</b> ' + esc(r.file.brNote) : ''}</div>`
      + `<label class="hb-note">Note for Claude (saved with the edit) <textarea rows="2" data-mnote="${esc(r.key)}" maxlength="500" placeholder="Why this change?">${esc(e && e.note || '')}</textarea></label>`
      + `<button type="button" class="hb-rst" data-mreset="${esc(r.key)}"${e ? '' : ' disabled'}>Reset to file</button></div></td></tr>`; }
  function updateMonRow(key){ const tr = document.querySelector(`#hbMbody tr[data-row="${CSS.escape(key)}"]`); if(!tr) return; const r = MBY[key], b = MNOW[key], cells = monCells(r), e = mEd[key];
    tr.className = `v-${b.ok ? 'ok' : 'over'}${e ? ' is-ed' : ''}`; tr.querySelectorAll('td[data-c]').forEach(td=>{ const k = td.dataset.c; td.innerHTML = k === 'eq' ? `<small>${cells.eq}</small>` : cells[k]; });
    tr.querySelectorAll('input[data-mon]').forEach(inp=> inp.classList.toggle('is-ch', mStats(r)[inp.dataset.stat] !== r.st[inp.dataset.stat]));
    const det = document.querySelector(`#hbMbody tr[data-detail="${CSS.escape(key)}"] button[data-mreset]`); if(det) det.disabled = !e; }
  function renderMonBody(){
    if(!$('hbMbody')) return; renderMonSum();
    const list = monFilter().sort((a, b)=>{ const x = monVal(a, st.mkey), y = monVal(b, st.mkey); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * st.mdir || a.name.localeCompare(b.name); });
    document.querySelectorAll('.hb-mt th').forEach(th=> th.dataset.k === st.mkey ? th.setAttribute('aria-sort', st.mdir > 0 ? 'ascending' : 'descending') : th.removeAttribute('aria-sort'));
    $('hbMbody').innerHTML = list.map(monRow).join('') || '<tr><td colspan="17" class="dec-empty">Nothing matches.</td></tr>';
    $('hbMfoot').textContent = `${list.length} row${list.length === 1 ? '' : 's'}. N needed = max(2A+H+S, 3·√(A·H+S·|S|)); in band when both rules hold at the level it fights at. Equivalent card: the lowest rarity from its own, then the lowest level up to 11, whose N holds it (its own Wait and Lumber); past Level 11 it is a Legendary on the N line. BR as player = the rarity's weight × (1 + 0.31 × (Level − 1)). Tap a name for RJ's reasoning, a note and Reset to file.`;
  }

  hub.onShow.budget = build;
  // for tests and Claude: the page's state (read-only copies)
  hub.balanceEdits = ()=> JSON.parse(editsJSON());
})();
