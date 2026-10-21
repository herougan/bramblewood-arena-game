// skill_costs_tab.js — the 🧮 Skill costs tab, inlined into .hub/index.html by tools/hub/build_hub.py after hub_app.js and
// tools/skill_costs.js (window.SkillCosts). Reads SC_SEED (canonical/skill-costs.json as shipped) and SC_CARDS (the cards the
// balance tools measure), plus CARDS (maps, skill labels) from the Cards tab.
// 2026-10-18 (owner, 19:54: "Your bramble master hub should let me edit N values of all skills, triggers and actions. Triggers
// and actions are costed by How often x How strong."): every trigger weight, action value, skill cost and modifier is a number
// input; each edit recomputes every card's S, N and both budget rules at once and lists the cards over / well under budget.
// Edits persist in the artifact's db (collection "skillCosts", one doc per edited entry: {kind, id, value, updatedAt}, doc id
// "<kind>:<id>"; back at its seed value the doc is deleted). Seeds always come from SC_SEED, never from the db. Without db
// (a copy outside claude.ai, or the capability not granted) the tab is read-only: a note and "Copy JSON" of the edited table.
// Claude applies the saved edits with tools/hub/pull_skill_costs.md.
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s==null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const hub = window.hub, SC = window.SkillCosts;
  if(!hub || !SC || typeof SC_SEED === 'undefined') return;
  const KINDS = [['trigger', 'triggers', 'Triggers', 'How often it fires (On Death = 1)'], ['action', 'actions', 'Actions', 'How strong one firing is (per point where it takes a number)'],
    ['skill', 'skills', 'Skills', 'Keyword skills: a flat cost, × N, or × (1 + N/2)'], ['modifier', 'modifiers', 'Modifiers', 'Adjust a trigger or action']];
  const LIST = {}; KINDS.forEach(([k, f])=> LIST[k] = SC_SEED[f] || []);
  const SEED = {}; KINDS.forEach(([k])=> LIST[k].forEach(e=> SEED[k + ':' + e.id] = e.value));
  // 2026-10-19 (package SW, owner 00:19: "defining the N-worth of skills ... run experiments with test units with each skill"): each
  // entry's measuredS from tools/skill_worth.js (docs/skill-worth-2026-10-19.md), in the entry's own units, next to its value; Apply
  // copies it into the value (an ordinary edit: it saves to the db like a typed one). No measuredS: measuredWhy says why.
  const MEAS = {}; KINDS.forEach(([k])=> LIST[k].forEach(e=> MEAS[k + ':' + e.id] = {v: typeof e.measuredS === 'number' ? e.measuredS : null, conf: e.measuredConf || '', se: e.measuredSE, why: e.measuredWhy || '', off: e.measuredOff || ''}));
  const measGap = key=>{ const m = MEAS[key]; return m && m.v != null ? Math.abs(m.v - valueOf(key)) : -1; };
  const edits = {}; // "<kind>:<id>" -> value, from the db (or this visit only, when read-only)
  const SKL = {}; (typeof CARDS !== 'undefined' ? CARDS.skills : []).forEach(s=> SKL[s.key] = s);
  const MAPS = {}; (typeof CARDS !== 'undefined' ? CARDS.maps : []).forEach(m=> MAPS[m.id] = m);
  const HCB = {}; (typeof CARDS !== 'undefined' ? CARDS.cards : []).forEach(c=> HCB[c.id] = c);
  const RN = {starter:'Starter', common:'Common', uncommon:'Uncommon', rare:'Rare', veryrare:'Very Rare', superrare:'Super Rare', epic:'Epic', heroic:'Heroic', unique:'Unique', legendary:'Legendary', mythic:'Mythic', ancient:'Ancient', quest:'Quest', questunique:'Quest Unique'};
  const rarName = r=> RN[r] || (r ? r : 'No rarity');
  const mapName = id=>{ const m = MAPS[id]; return m ? (m.num != null ? 'Map ' + m.num + (m.sub ? ' (side)' : '') + ': ' : '') + m.name : ''; };
  // The cards: each one's budget fields as cards.json prints them.
  const cards = SC_CARDS.map(x=> ({id:x.id, name:x.n, rarity:x.r || null, cost:x.c, wait:x.w, attack:x.a, health:x.h, effects:x.e, faction:x.faction, basic:x.basic, tutorial:x.tutorial, quest:x.quest,
    source:x.k ? {kind:x.k} : undefined, map:(HCB[x.id] || {}).map || ''}));
  // Which cards use each entry (the editor's "used by" column).
  const USED = {};
  const use = (k, id)=>{ (USED[k] = USED[k] || new Set()).add(id); };
  cards.forEach(c=> Object.entries(c.effects || {}).forEach(([k, v])=>{
    if(k === 'triggers'){ (Array.isArray(v) ? v : []).forEach(t=>{ if(!t) return; use('trigger:' + t.on, c.id); const a = (SC_SEED.aliases || {})[t.do] || t.do;
      const aid = a === 'exile' && (!t.who || t.who === 'self') ? 'exileSelf' : a; LIST.action.filter(e=> e.id.split('.')[0] === aid).forEach(e=> use('action:' + e.id, c.id));
      if(t.sub === 'all') use('modifier:subAll', c.id); if(t.once) use('modifier:onceCap', c.id); if(t.on === 'perTurn' && t.turnOf && t.turnOf !== 'both') use('modifier:turnOfOne', c.id); }); return; }
    const sh = (SC_SEED.shorthands || {})[k]; if(sh){ use('trigger:' + sh.trigger, c.id); use('action:' + sh.action, c.id); return; }
    use('skill:' + k, c.id); }));
  const nUsed = k=> USED[k] ? USED[k].size : 0;

  function tableNow(){ const t = JSON.parse(JSON.stringify(SC_SEED));
    KINDS.forEach(([k, f])=> (t[f] || []).forEach(e=>{ const key = k + ':' + e.id; if(key in edits) e.value = edits[key]; })); return t; }
  const seedCalc = SC.make(SC_SEED), SEEDB = {}; cards.forEach(c=> SEEDB[c.id] = seedCalc.budget(c));
  let calc = seedCalc, NOW = SEEDB;
  function recompute(){ calc = SC.make(tableNow()); NOW = {}; cards.forEach(c=> NOW[c.id] = calc.budget(c)); }
  const verdict = b=> !b.ok ? 'over' : b.wellUnder ? 'under' : 'ok';

  // ---------- state ----------
  const st = {kind:'trigger', q:'', onlyEdited:false, byGap:false, v:'over', map:'*', r:'*', cq:'', key:'gap', dir:-1, open:null};
  let db = null, mode = 'pending'; // pending | on | off | ro
  const timers = {}, chains = {};

  function build(){
    if(build.done) return; build.done = true;
    const host = $('scHost'); if(!host) return;
    host.innerHTML = `<div class="dec-head"><h2>Skill costs</h2><p>Every number behind S, the skill part of the stat budget. A trigger costs <b>how often × how strong</b>: its weight here × its action's value (On Death = 1, so an On Death "deal 2 damage" costs 2; On Any Played = 5 with a value-2 action costs 10). Keyword skills keep the costs they had. Change a number and every card's S, N and both rules (2A+H+S ≤ N, A·H+S·|S| ≤ (N/3)²) update below.</p><p class="sc-formula">${(()=>{ const f = window.BramblewoodBudget && BramblewoodBudget.formulaParts((SC_SEED && SC_SEED.budget) || {}); return f ? `${f.n}; ${f.zero}. ${f.base}. Both scores ×1.5 per half-miss skill (Evasive, Swift, Flying, Shadow, Blind).` : ''; })()}</p></div>
      <div class="sc-status" id="scStatus" role="status"></div>
      <div class="sc-grid"><section class="sc-ed" aria-label="Cost table">
        <div class="dec-seg sc-kinds" role="group" aria-label="Kind" id="scKinds">${KINDS.map(([k, , l])=> `<button type="button" data-k="${k}" aria-pressed="${k === st.kind}">${l} <b>${LIST[k].length}</b></button>`).join('')}${COMBOS ? `<button type="button" data-k="combo" aria-pressed="false">Combos <b>${COMBOS.pairs}</b></button>` : ''}</div>
        <p class="sc-hint" id="scHint"></p>
        <div class="sc-bar"><input type="search" id="scQ" placeholder="Filter by name or id…" aria-label="Filter entries"><label class="cd-chk"><input type="checkbox" id="scOnly"> edited only</label><label class="cd-chk"><input type="checkbox" id="scGap"> biggest gap to measured first</label></div>
        <div class="sc-rows" id="scRows"></div></section>
      <section class="sc-cards" aria-label="Cards against the budget">
        <div class="sc-sum" id="scSum"></div>
        <div class="sc-bar"><div class="dec-seg" role="group" aria-label="Show" id="scV">${[['over', 'Over'], ['under', 'Well under'], ['changed', 'S changed'], ['flip', 'Flipped'], ['all', 'All']].map(([v, l])=> `<button type="button" data-v="${v}" aria-pressed="${v === st.v}">${l} <b id="scVn-${v}"></b></button>`).join('')}</div></div>
        <div class="sc-bar"><select id="scMap" aria-label="Map"></select><select id="scR" aria-label="Rarity"></select><input type="search" id="scCq" placeholder="Card or skill…" aria-label="Search cards"></div>
        <div class="bal-wrap"><table class="bal-t sc-t"><thead><tr><th data-k="name">Card</th><th data-k="rarity">Rarity</th><th data-k="map">Map</th><th data-k="S">S</th><th data-k="N">N</th><th data-k="x1">2A+H+S</th><th data-k="x2">A·H+S·|S|</th><th data-k="gap">Margin</th></tr></thead><tbody id="scBody"></tbody></table></div>
        <p class="note sc-foot" id="scFoot"></p></section></div>`;
    // filters
    const present = f=>{ const n = {}; cards.forEach(c=>{ const v = f(c); if(v) n[v] = (n[v] || 0) + 1; }); return n; };
    const nm = present(c=> c.map), nr = present(c=> c.rarity || 'none');
    $('scMap').innerHTML = '<option value="*">Any map</option>' + Object.keys(nm).sort((a, b)=> ((MAPS[a] || {}).num ?? 999) - ((MAPS[b] || {}).num ?? 999) || (MAPS[a] && MAPS[a].sub ? 1 : 0) - (MAPS[b] && MAPS[b].sub ? 1 : 0)).map(m=> `<option value="${esc(m)}">${esc(mapName(m) || m)} (${nm[m]})</option>`).join('') + '<option value="-">Not on a map</option>';
    $('scR').innerHTML = '<option value="*">Any rarity</option>' + SC.LADDER.concat(['quest', 'questunique', 'none']).filter(r=> nr[r]).map(r=> `<option value="${r}">${esc(r === 'none' ? 'No rarity' : rarName(r))} (${nr[r]})</option>`).join('');
    $('scKinds').addEventListener('click', e=>{ const b = e.target.closest('button[data-k]'); if(!b) return; st.kind = b.dataset.k; $('scKinds').querySelectorAll('button').forEach(x=> x.setAttribute('aria-pressed', String(x === b))); renderRows(); });
    $('scV').addEventListener('click', e=>{ const b = e.target.closest('button[data-v]'); if(!b) return; st.v = b.dataset.v; $('scV').querySelectorAll('button').forEach(x=> x.setAttribute('aria-pressed', String(x === b))); renderCards(); });
    $('scQ').addEventListener('input', e=>{ st.q = e.target.value.trim().toLowerCase(); renderRows(); });
    $('scOnly').addEventListener('change', e=>{ st.onlyEdited = e.target.checked; renderRows(); });
    $('scGap').addEventListener('change', e=>{ st.byGap = e.target.checked; renderRows(); });
    $('scMap').addEventListener('change', e=>{ st.map = e.target.value; renderCards(); });
    $('scR').addEventListener('change', e=>{ st.r = e.target.value; renderCards(); });
    $('scCq').addEventListener('input', e=>{ st.cq = e.target.value.trim().toLowerCase(); renderCards(); });
    host.querySelectorAll('.sc-t th').forEach(th=> th.addEventListener('click', ()=>{ const k = th.dataset.k; if(st.key === k) st.dir = -st.dir; else { st.key = k; st.dir = (k === 'name' || k === 'map') ? 1 : -1; } renderCards(); }));
    const toggle = tr=>{ st.open = st.open === tr.dataset.id ? null : tr.dataset.id; renderCards(); const again = document.querySelector(`#scBody tr[data-id="${CSS.escape(tr.dataset.id)}"]`); if(again) again.focus(); };
    $('scBody').addEventListener('click', e=>{ const tr = e.target.closest('tr[data-id]'); if(tr) toggle(tr); });
    $('scBody').addEventListener('keydown', e=>{ const tr = e.target.closest('tr[data-id]'); if(tr && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); toggle(tr); } });
    const rows = $('scRows');
    rows.addEventListener('input', e=>{ const inp = e.target.closest('input[data-key]'); if(!inp) return; const v = inp.value.trim(); if(v === '' || !isFinite(+v)) return; setValue(inp.dataset.key, +v, false); });
    rows.addEventListener('change', e=>{ const inp = e.target.closest('input[data-key]'); if(!inp) return; if(inp.value.trim() === '' || !isFinite(+inp.value)) inp.value = valueOf(inp.dataset.key); renderRows(); });
    rows.addEventListener('click', e=>{ const b = e.target.closest('button[data-reset]'); if(b){ setValue(b.dataset.reset, SEED[b.dataset.reset], true); return; }
      const ap = e.target.closest('button[data-apply]'); if(ap){ const m = MEAS[ap.dataset.apply]; if(m && m.v != null){ setValue(ap.dataset.apply, m.v, true); const again = document.querySelector(`#scRows input[data-key="${CSS.escape(ap.dataset.apply)}"]`); if(again) again.focus(); } } });
    $('scStatus').addEventListener('click', e=>{ const b = e.target.closest('button[data-copy]'); if(b) copyJSON(b); });
    renderStatus(); renderRows(); renderCards();
    connect();
  }

  const valueOf = key=> key in edits ? edits[key] : SEED[key];
  function setValue(key, v, rerow){
    if(v === SEED[key]) delete edits[key]; else edits[key] = v;
    recompute(); renderCards(); renderSum(); if(rerow) renderRows(); else markRow(key);
    if(mode === 'on') save(key);
  }
  function markRow(key){ const row = document.querySelector(`#scRows .sc-row[data-key="${CSS.escape(key)}"]`); if(row) row.classList.toggle('is-ed', key in edits); }

  // ---------- db ----------
  async function connect(){
    let d = null;
    try{ d = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('db') : null; }catch(e){ d = null; }
    if(!d){ mode = 'off'; renderStatus(); return; }
    db = d; mode = 'on'; renderStatus();
    try{
      db.collection('skillCosts').onSnapshot(snap=>{
        const seen = {};
        snap.docs.forEach(doc=>{ const x = doc.data() || {}; const key = x.kind + ':' + x.id; if(!(key in SEED) || typeof x.value !== 'number' || !isFinite(x.value)) return; seen[key] = x.value; });
        // the db is the source of truth for every entry without a write of ours still waiting
        Object.keys(SEED).forEach(key=>{ if(timers[key] || chains[key + ':busy']) return; if(key in seen && seen[key] !== SEED[key]) edits[key] = seen[key]; else delete edits[key]; });
        recompute(); renderRows(); renderCards(); renderStatus();
      }, err=>{ mode = err && err.code === 'revoked' ? 'off' : 'ro'; renderStatus(); });
    }catch(e){ mode = 'off'; renderStatus(); }
  }
  function save(key){
    clearTimeout(timers[key]);
    timers[key] = setTimeout(()=>{ delete timers[key];
      const [kind, ...rest] = key.split(':'), id = rest.join(':');
      chains[key + ':busy'] = true;
      chains[key] = (chains[key] || Promise.resolve()).then(()=>{
        const ref = db.collection('skillCosts').doc(key);
        return key in edits ? ref.set({kind, id, value: edits[key], updatedAt: new Date().toISOString()}) : ref.delete();
      }).then(()=>{ delete chains[key + ':busy']; renderStatus('Saved'); }, err=>{ delete chains[key + ':busy'];
        if(err && (err.code === 'invalid_argument' || err.code === 'revoked' || err.code === 'not_granted')){ mode = 'ro'; renderStatus(); }
        else renderStatus('Not saved (' + esc(err && err.code || 'error') + '): try again'); });
    }, 600);
  }

  // ---------- status / copy ----------
  function renderStatus(flash){
    const el = $('scStatus'); if(!el) return; const n = Object.keys(edits).length;
    const copy = `<button type="button" class="btn" data-copy>📋 Copy JSON</button>`;
    const msg = mode === 'pending' ? 'Connecting to the hub\'s saved edits…'
      : mode === 'on' ? `Edits save to this hub for Claude to apply (${n} edited${flash ? ' · ' + flash : ''}).`
      : `<b>Edits can't be saved here.</b> They last for this visit only; ${n ? n + ' edited · ' : ''}use Copy JSON and paste it to Claude.`;
    el.className = 'sc-status ' + (mode === 'on' ? 'is-on' : mode === 'pending' ? '' : 'is-off');
    el.innerHTML = `<span>${msg}</span>${copy}<span class="sc-copied" id="scCopied" aria-live="polite"></span>`;
  }
  function tableJSON(){ const t = tableNow();
    return '{\n' + Object.entries(t).map(([k, v])=> ' ' + JSON.stringify(k) + ': ' + (Array.isArray(v) && v.length && typeof v[0] === 'object' ? '[\n' + v.map(x=> '  ' + JSON.stringify(x)).join(',\n') + '\n ]' : JSON.stringify(v))).join(',\n') + '\n}\n'; }
  function copyJSON(btn){
    const text = tableJSON(), out = $('scCopied');
    const fallback = ()=>{ if(out) out.innerHTML = 'Copy blocked here: select the text below and copy it.'; let ta = $('scJSON');
      if(!ta){ ta = document.createElement('textarea'); ta.id = 'scJSON'; ta.className = 'sc-json'; ta.readOnly = true; ta.setAttribute('aria-label', 'Edited cost table as JSON'); $('scStatus').after(ta); }
      ta.value = text; ta.focus(); ta.select(); };
    try{ if(!navigator.clipboard || !navigator.clipboard.writeText){ fallback(); return; }
      navigator.clipboard.writeText(text).then(()=>{ if(out) out.textContent = 'Copied ' + Object.keys(edits).length + ' edit(s) in the full table.'; }, fallback);
    }catch(e){ fallback(); }
  }

  // ---------- editor rows ----------
  function label(kind, e){ if(kind === 'skill'){ const s = SKL[e.id]; return (s && s.icon ? s.icon + ' ' : '') + (s ? s.label : e.id); } return e.label || e.id; }
  function hint(kind, e){
    if(kind === 'skill') return e.scale === 'n' ? (e.value < 0 ? 'payment: × its N' + (e.payDefault ? ` (${e.payDefault} if unset)` : '') : '× its N') : e.scale === 'half' ? '× (1 + N/2)' : 'flat';
    if(kind === 'action') return e.per ? 'per ' + ({amount:'point', amount2:'Health point', count:'one'})[e.per] : 'flat';
    if(kind === 'trigger') return e.inEngine === false ? 'not in the engine yet' : 'weight';
    return '';
  }
  // ---------- combos (2026-10-19, package DC, owner 08:10: "duo-skill combos, 1,000-2,000 times") ----------
  // Read-only: the skill pairs tools/skill_combo.js measured on one unit (docs/skill-combos-2026-10-19.md), the strongest synergies
  // (the pair is worth more than its two skills apart) and anti-synergies (less), at medium or high confidence, and the per-family
  // multiplier a card with two skills could be costed with.
  const COMBOS = typeof SC_COMBOS !== 'undefined' && SC_COMBOS && (SC_COMBOS.syn || []).length + (SC_COMBOS.anti || []).length ? SC_COMBOS : null;
  function renderCombos(){
    $('scHint').textContent = `Skill pairs on one unit (b2, 4/14 Wait 2): ${COMBOS.pairs} pairs, ${COMBOS.G} games a point, ${Number(COMBOS.games).toLocaleString('en')} games in all (docs/skill-combos-2026-10-19.md). Interaction = S(pair) − S(A) − S(B); medium and high confidence only. Read-only.`;
    const hit = r=> !st.q || (r.pair + ' ' + (r.ctx || '')).toLowerCase().includes(st.q), sg = v=> (v > 0 ? '+' : '') + v;
    const row = r=> `<div class="sc-row sc-cb"><div class="sc-lb"><b>${esc(r.pair)}</b><small>${r.ctx && r.ctx !== 'plain' ? esc(r.ctx) + ' · ' : ''}S ${r.S} vs ${r.sumSingles} apart (${r.Sa} + ${r.Sb})${r.cards ? ' · on ' + r.cards + ' card' + (r.cards === 1 ? '' : 's') : ''}</small></div>`
      + `<div class="sc-ms c-${esc(r.confidence)}"><span class="sc-mv"><small>interaction</small><b>${sg(r.interaction)}</b><small>±${r.se} · ${esc(r.confidence)}</small></span></div></div>`;
    const syn = COMBOS.syn.filter(hit), anti = COMBOS.anti.filter(hit), m = COMBOS.model || {};
    const fam = (m.families || []).map(f=> `<span class="chip">${esc(f.fam)} <b>×${f.m}</b> <small>(${f.pairs})</small></span>`).join(' ');
    $('scRows').innerHTML = `<h3 class="sc-cbh">Synergies <small>(${syn.length})</small></h3>` + (syn.map(row).join('') || '<p class="dec-empty">Nothing matches.</p>')
      + `<h3 class="sc-cbh">Anti-synergies <small>(${anti.length})</small></h3>` + (anti.map(row).join('') || '<p class="dec-empty">Nothing matches.</p>')
      + (fam ? `<h3 class="sc-cbh">Family multipliers <small>S(A+B) ≈ m × (S(A) + S(B)); one global m = ${m.global}</small></h3><p class="sc-cbf">${fam}</p>` : '');
  }
  function renderRows(){
    if(st.kind === 'combo' && COMBOS){ renderCombos(); return; }
    const kd = KINDS.find(k=> k[0] === st.kind); $('scHint').textContent = kd[3] + ' · "measured": what tools/skill_worth.js measured on 2026-10-19 (docs/skill-worth-2026-10-19.md); Apply copies it into the value.';
    const list = LIST[st.kind].filter(e=>{ const key = st.kind + ':' + e.id; if(st.onlyEdited && !(key in edits)) return false;
      return !st.q || (e.id + ' ' + label(st.kind, e) + ' ' + (e.note || '')).toLowerCase().includes(st.q); });
    const sorted = st.byGap ? list.slice().sort((a, b)=> measGap(st.kind + ':' + b.id) - measGap(st.kind + ':' + a.id) || label(st.kind, a).localeCompare(label(st.kind, b)))
      : st.kind === 'skill' ? list.slice().sort((a, b)=> nUsed('skill:' + b.id) - nUsed('skill:' + a.id) || label('skill', a).localeCompare(label('skill', b))) : list;
    $('scRows').innerHTML = sorted.map(e=>{ const key = st.kind + ':' + e.id, ed = key in edits, n = nUsed(key), m = MEAS[key] || {}, hasM = m.v != null;
      const mTitle = hasM ? `Measured ${m.v}${m.se != null ? ' (±' + m.se + ')' : ''}, confidence ${m.conf || 'low'}${m.off ? ' · off the scale: only a bound (the solve ran off its range)' : ''}` : 'Not measured' + (m.why ? ': ' + m.why : '');
      const mShow = hasM ? (m.off === '>' ? '≥' : m.off === '<' ? '≤' : '') + m.v : '–'; // 2026-10-19: an off-the-scale value is a bound
      const meas = `<div class="sc-ms${hasM ? ' c-' + esc(m.conf || 'low') : ' is-none'}" title="${esc(mTitle)}"><span class="sc-mv"><small>measured</small><b>${mShow}</b>${hasM ? `<small>${esc(m.conf || 'low')}</small>` : ''}</span>`
        + (hasM ? `<button type="button" class="sc-apply" data-apply="${esc(key)}"${valueOf(key) === m.v ? ' disabled' : ''} aria-label="Use the measured value ${m.v} for ${esc(label(st.kind, e))}">Apply</button>` : '') + '</div>';
      return `<div class="sc-row${ed ? ' is-ed' : ''}" data-key="${esc(key)}"><div class="sc-lb"><b>${esc(label(st.kind, e))}</b><small><code>${esc(e.id)}</code> · ${esc(hint(st.kind, e))} · ${n ? n + ' card' + (n === 1 ? '' : 's') : 'unused'}${e.note ? ' · ' + esc(e.note) : ''}${!hasM && m.why ? ' · not measured: ' + esc(m.why) : ''}</small></div>`
        + `<div class="sc-in"><input type="number" step="0.1" inputmode="decimal" data-key="${esc(key)}" value="${valueOf(key)}" aria-label="${esc(label(st.kind, e))} value"><span class="sc-seed">seed ${SEED[key]}</span>`
        + `<button type="button" class="sc-rst" data-reset="${esc(key)}" aria-label="Back to the seed value"${ed ? '' : ' hidden'}>↺</button></div>${meas}</div>`; }).join('') || '<p class="dec-empty">Nothing matches.</p>';
  }

  // ---------- cards ----------
  function sumCounts(){ let over = 0, under = 0, changed = 0, flip = 0, sOver = 0, sUnder = 0;
    cards.forEach(c=>{ const b = NOW[c.id], s = SEEDB[c.id]; if(!b.ok) over++; if(b.wellUnder) under++; if(!s.ok) sOver++; if(s.wellUnder) sUnder++; if(b.S !== s.S) changed++; if(b.ok !== s.ok) flip++; });
    return {over, under, changed, flip, sOver, sUnder, all:cards.length}; }
  function renderSum(){
    const k = sumCounts(), d = (a, b)=> a === b ? '' : ` <small>(seed ${b})</small>`;
    $('scSum').innerHTML = `<div class="sc-tile v-over"><b>${k.over}</b><span>over budget${d(k.over, k.sOver)}</span></div><div class="sc-tile v-under"><b>${k.under}</b><span>well under (2A+H+S ≤ 60% of N)${d(k.under, k.sUnder)}</span></div>`
      + `<div class="sc-tile"><b>${k.changed}</b><span>cards whose S moved</span></div><div class="sc-tile"><b>${k.flip}</b><span>flipped pass ↔ over</span></div>`;
    ['over', 'under', 'changed', 'flip', 'all'].forEach(v=>{ const el = $('scVn-' + v); if(el) el.textContent = k[v]; });
  }
  function renderCards(){
    renderSum();
    const terms = st.cq.split(/\s+/).filter(Boolean);
    const list = cards.filter(c=>{ const b = NOW[c.id], s = SEEDB[c.id];
      if(st.v === 'over' && b.ok) return false; if(st.v === 'under' && !b.wellUnder) return false; if(st.v === 'changed' && b.S === s.S) return false; if(st.v === 'flip' && b.ok === s.ok) return false;
      if(st.map === '-' ? !!c.map : st.map !== '*' && c.map !== st.map) return false;
      if(st.r !== '*' && (c.rarity || 'none') !== st.r) return false;
      if(terms.length){ const hay = (c.name + ' ' + c.id + ' ' + Object.keys(c.effects || {}).join(' ') + ' ' + (c.effects.triggers || []).map(t=> t && (t.on + ' ' + t.do)).join(' ')).toLowerCase(); if(!terms.every(t=> hay.includes(t))) return false; }
      return true; });
    // Margin: how far inside (positive) or over (negative) the tighter rule is, as a share of its limit.
    const gap = b=> Math.min((b.N - b.x1) / b.N, (b.N2 - b.x2) / b.N2), f1 = v=> Math.round(v * 10) / 10;
    const val = (c, k)=>{ const b = NOW[c.id]; return k === 'name' ? c.name : k === 'rarity' ? SC.LADDER.indexOf(c.rarity || 'common') : k === 'map' ? (mapName(c.map) || '~') : k === 'gap' ? -gap(b) : b[k]; };
    list.sort((a, b)=>{ const x = val(a, st.key), y = val(b, st.key); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * st.dir || a.name.localeCompare(b.name); });
    document.querySelectorAll('.sc-t th').forEach(th=> th.dataset.k === st.key ? th.setAttribute('aria-sort', st.dir > 0 ? 'ascending' : 'descending') : th.removeAttribute('aria-sort'));
    const MAX = 400, shown = list.slice(0, MAX);
    $('scBody').innerHTML = shown.map(c=>{ const b = NOW[c.id], s = SEEDB[c.id], v = verdict(b), g = gap(b);
      const sCell = b.S === s.S ? `${b.S}` : `<s>${s.S}</s> ${b.S}`;
      const row = `<tr data-id="${esc(c.id)}" class="v-${v}${st.open === c.id ? ' is-open' : ''}" tabindex="0" aria-expanded="${st.open === c.id}"><td><b>${esc(c.name)}</b> <small>${c.attack}/${c.health} · 🪵${c.cost} · ⏳${c.wait}</small></td><td>${esc(rarName(c.rarity))}</td><td><small>${esc(mapName(c.map) || '—')}</small></td>`
        + `<td class="num">${sCell}</td><td class="num">${b.N}</td><td class="num${b.x1 <= b.N ? '' : ' bad'}">${f1(b.x1)} <small>${b.x1 <= b.N ? '≤' : '&gt;'} N = ${f1(b.N)}</small></td><td class="num${b.x2 <= b.N2 ? '' : ' bad'}">${f1(b.x2)} <small>${b.x2 <= b.N2 ? '≤' : '&gt;'} (N/3)² = ${f1(b.N2)}</small></td>` /* inclusive since 16:22 */ /* 2026-10-19 (BF2, owner 13:57: "Say 5 < N = 20") */
        + `<td class="num sc-v">${v === 'over' ? 'over ' : v === 'under' ? 'under ' : ''}${Math.abs(g) < 0.1 ? Math.round(g * 1000) / 10 : Math.round(g * 100)}%</td></tr>`;
      if(st.open !== c.id) return row;
      const parts = b.parts.length ? b.parts.map(p=> `<span class="chip">${esc(p[0] === 'skill' ? label('skill', {id:p[1]}) : p[1])} <b>${p[2]}</b>${p[3] ? ' <small>(' + esc(p[3]) + ')</small>' : ''}</span>`).join(' ') : 'No skills (S = 0).';
      return row + `<tr class="sc-detail"><td colspan="8">S = ${b.S}: ${parts}${b.m !== 1 ? ` · both scores × ${b.m} (half-miss)` : ''}${b.missing.length ? ` · <b>no entry:</b> ${esc(b.missing.join(', '))}` : ''}</td></tr>`; }).join('')
      || '<tr><td colspan="8" class="dec-empty">No card matches.</td></tr>';
    $('scFoot').textContent = (list.length > MAX ? `Showing ${MAX} of ${list.length}; narrow the filters to see the rest. ` : `${list.length} card${list.length === 1 ? '' : 's'}. `)
      + 'Margin: how far inside the tighter rule is (negative = over). Tap a card for its S breakdown. N uses the level the card starts at (Base and quest cards 0, rewards 1).';
  }
  hub.onShow.costs = build;
})();
