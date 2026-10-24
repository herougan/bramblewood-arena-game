// upgrade_costs_tab.js — the 💰 Upgrade & Forge costs tab, inlined into .hub/index.html by tools/hub/build_hub.py after hub_app.js and
// tools/upgrade_costs_lib.js (window.UpgradeCosts). Reads UC_SEED (canonical/upgrade-costs.json as shipped).
// 2026-10-23 (package HUB2, owner 11:11: "For all these upgrade costs and forge costs, put them in the master hub and let them be
// editable."): every number of the level road, the rarity multipliers, limit break, duplicates, the Forge tiers, prestige rings,
// disenchanting and the Materia / energy prices is an input. Edits persist in the artifact's db, the Skill costs tab's pattern
// (await claude.use("db"), one onSnapshot, one write at a time per doc, 600 ms debounce): collection "upgradeCosts", doc id = the
// number's path (e.g. "forgeTiers.2.gold"): {path, value, updatedAt}; back at the shipped value the doc is deleted. The file is always
// the seed, never the db. Without db the tab still works for this visit and offers Copy JSON. Claude folds the edits into the file with
// tools/fold_upgrade_costs.js (tools/hub/pull_upgrade_costs.md).
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s==null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const hub = window.hub, U = window.UpgradeCosts;
  if(!hub || !U || typeof UC_SEED === 'undefined') return;
  const ENT = U.build(UC_SEED), SEED = U.values(UC_SEED), edits = {};
  const timers = {}, chains = {}; let db = null, mode = 'pending';
  const st = {group: 'road', q: '', only: false};
  const valueOf = p=> p in edits ? edits[p] : SEED[p];
  const table = ()=>{ const t = U.clone(UC_SEED); Object.keys(edits).forEach(p=> U.set(t, p, edits[p])); return t; };
  const r0 = v=> Math.round(v).toLocaleString('en');

  function connect(){
    return (async ()=>{
      let d = null;
      try{ d = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('db') : null; }catch(e){ d = null; }
      if(!d){ mode = 'off'; renderStatus(); return; }
      db = d; mode = 'on'; renderStatus();
      try{
        db.collection('upgradeCosts').onSnapshot(snap=>{
          const seen = {};
          snap.docs.forEach(doc=>{ const x = doc.data() || {}; if(!(x.path in SEED) || typeof x.value !== 'number' || !isFinite(x.value)) return; seen[x.path] = x.value; });
          Object.keys(SEED).forEach(p=>{ if(timers[p] || chains[p + ':busy']) return; if(p in seen && seen[p] !== SEED[p]) edits[p] = seen[p]; else delete edits[p]; });
          renderRows(); renderPreview(); renderStatus();
        }, err=>{ mode = err && err.code === 'revoked' ? 'off' : 'ro'; renderStatus(); });
      }catch(e){ mode = 'off'; renderStatus(); }
    })();
  }
  function save(p){
    clearTimeout(timers[p]);
    timers[p] = setTimeout(()=>{ delete timers[p]; chains[p + ':busy'] = true;
      chains[p] = (chains[p] || Promise.resolve()).then(()=>{ const ref = db.collection('upgradeCosts').doc(p);
        return p in edits ? ref.set({path: p, value: edits[p], updatedAt: new Date().toISOString()}) : ref.delete(); })
        .then(()=>{ delete chains[p + ':busy']; renderStatus('Saved'); }, err=>{ delete chains[p + ':busy'];
          if(err && (err.code === 'invalid_argument' || err.code === 'revoked' || err.code === 'not_granted')){ mode = 'ro'; renderStatus(); }
          else renderStatus('Not saved (' + esc(err && err.code || 'error') + '): try again'); });
    }, 600);
  }
  function setValue(p, v){
    if(v === SEED[p]) delete edits[p]; else edits[p] = v;
    renderPreview(); const row = document.querySelector(`#ucRows .sc-row[data-p="${CSS.escape(p)}"]`); if(row) row.classList.toggle('is-ed', p in edits);
    const rs = row && row.querySelector('.sc-rst'); if(rs) rs.hidden = !(p in edits);
    if(mode === 'on') save(p); else renderStatus();
  }

  function renderStatus(flash){
    const el = $('ucStatus'); if(!el) return; const n = Object.keys(edits).length;
    const msg = mode === 'pending' ? 'Connecting to the hub\'s saved edits…'
      : mode === 'on' ? `Edits save to this hub for Claude to fold into canonical/upgrade-costs.json (${n} edited${flash ? ' · ' + flash : ''}).`
      : `<b>Edits can't be saved here.</b> They last for this visit only; ${n ? n + ' edited · ' : ''}use Copy JSON and paste it to Claude.`;
    el.className = 'sc-status ' + (mode === 'on' ? 'is-on' : mode === 'pending' ? '' : 'is-off');
    el.innerHTML = `<span>${msg}</span><button type="button" class="btn" data-copy>📋 Copy JSON</button><span class="sc-copied" id="ucCopied" aria-live="polite"></span>`;
  }
  function copyJSON(){
    const text = U.format(table()), out = $('ucCopied');
    const fallback = ()=>{ if(out) out.innerHTML = 'Copy blocked here: select the text below and copy it.'; let ta = $('ucJSON');
      if(!ta){ ta = document.createElement('textarea'); ta.id = 'ucJSON'; ta.className = 'sc-json'; ta.readOnly = true; ta.setAttribute('aria-label', 'Edited cost table as JSON'); $('ucStatus').after(ta); }
      ta.value = text; ta.focus(); ta.select(); };
    try{ if(!navigator.clipboard || !navigator.clipboard.writeText){ fallback(); return; }
      navigator.clipboard.writeText(text).then(()=>{ if(out) out.textContent = 'Copied the full table (' + Object.keys(edits).length + ' edit(s)).'; }, fallback);
    }catch(e){ fallback(); }
  }

  // What the edited numbers add up to, per rarity (the game's own formula: levelUpCostRaw / forgeSpentOn / limitBreakCost).
  function preview(){
    const t = table(), mote = {dust: Math.round(t.materiaUnit.dust / t.moteDivisor), gold: Math.round(t.materiaUnit.gold / t.moteDivisor)};
    return Object.keys(t.levelCostMult).map(r=>{ const k = t.levelCostMult[r]; let dust = 0, gold = 0;
      for(let L = 1; L <= 9; L++){ const d = t.forgeStepDust[L]; dust += Math.round(d * k); gold += Math.round(d * 2 / 3 * k); }
      const from1 = {dust, gold}, from0 = {dust: dust + mote.dust, gold: gold + mote.gold};
      return {r, k, from1, from0, lb: {dust: dust * t.limitBreakCostMult, gold: gold * t.limitBreakCostMult}, melt: t.disenchantDust[r], dup: t.duplicateDivisor[r] ? {dust: Math.round(dust / t.duplicateDivisor[r]), gold: Math.round(gold / t.duplicateDivisor[r])} : null}; });
  }
  function renderPreview(){
    const el = $('ucPrev'); if(!el) return; const rows = preview(), rn = k=> (ENT.find(e=> e.path === 'levelCostMult.' + k) || {}).label || k;
    el.innerHTML = `<p class="note">Totals for a plain booster card of each rarity, with your edits (Dust · Leaves). Lv 1 to 10 is nine steps; Lv 0 to 10 adds the Materia Mote; a limit break is that road times the multiplier; a duplicate is worth 1 ÷ its divisor of the Lv 1 to 10 road.</p>`
      + `<div class="bal-wrap"><table class="bal-t"><thead><tr><th>Rarity</th><th>×</th><th>Lv 1 to 10</th><th>Lv 0 to 10</th><th>Limit break</th><th>One duplicate</th><th>Melts for</th></tr></thead><tbody>`
      + rows.map(x=> `<tr><td><b>${esc(rn(x.r))}</b></td><td class="num">${x.k}</td><td class="num">${r0(x.from1.dust)} · ${r0(x.from1.gold)}</td><td class="num">${r0(x.from0.dust)} · ${r0(x.from0.gold)}</td><td class="num">${r0(x.lb.dust)} · ${r0(x.lb.gold)}</td><td class="num">${x.dup ? r0(x.dup.dust) + ' · ' + r0(x.dup.gold) : '–'}</td><td class="num">${x.melt != null ? r0(x.melt) : '–'}</td></tr>`).join('')
      + `</tbody></table></div>`;
  }

  function renderRows(){
    const g = U.GROUPS.find(x=> x[0] === st.group); $('ucHint').textContent = g[2];
    const q = st.q;
    const list = ENT.filter(e=> (q ? true : e.group === st.group) && (!st.only || e.path in edits) && (!q || (e.path + ' ' + e.label + ' ' + e.note).toLowerCase().includes(q)));
    $('ucRows').innerHTML = list.map(e=>{ const ed = e.path in edits;
      return `<div class="sc-row${ed ? ' is-ed' : ''}" data-p="${esc(e.path)}"><div class="sc-lb"><b>${esc(e.label)}</b><small><code>${esc(e.path)}</code>${e.note ? ' · ' + esc(e.note) : ''}</small></div>`
        + `<div class="sc-in"><input type="number" min="0" step="${e.step}" inputmode="decimal" data-p="${esc(e.path)}" value="${valueOf(e.path)}" aria-label="${esc(e.label)} value"><span class="sc-seed">file ${SEED[e.path]}</span>`
        + `<button type="button" class="sc-rst" data-reset="${esc(e.path)}" aria-label="Back to the file value"${ed ? '' : ' hidden'}>↺</button></div></div>`; }).join('') || '<p class="dec-empty">Nothing matches.</p>';
  }

  function build(){
    if(build.done) return; build.done = true;
    const host = $('ucHost'); if(!host) return;
    host.innerHTML = `<div class="dec-head"><h2>Upgrade &amp; Forge costs</h2><p>Every cost behind levelling a card, the Forge's own upgrades, limit breaks, duplicates, prestige rings, disenchanting and gem sockets. Edit a number; the totals below recompute. The file the game is built from is <code>canonical/upgrade-costs.json</code>; saved edits are folded into it by Claude (tools/fold_upgrade_costs.js) and ship with the next build.</p></div>
      <div class="sc-status" id="ucStatus" role="status"></div>
      <div class="sc-grid"><section class="sc-ed" aria-label="Cost numbers">
        <div class="dec-seg sc-kinds" role="group" aria-label="Group" id="ucGroups">${U.GROUPS.map(([id, title])=> `<button type="button" data-g="${id}" aria-pressed="${id === st.group}">${esc(title)} <b>${ENT.filter(e=> e.group === id).length}</b></button>`).join('')}</div>
        <p class="sc-hint" id="ucHint"></p>
        <div class="sc-bar"><input type="search" id="ucQ" placeholder="Filter every number by name or path…" aria-label="Filter numbers"><label class="cd-chk"><input type="checkbox" id="ucOnly"> edited only</label></div>
        <div class="sc-rows" id="ucRows"></div></section>
      <section class="sc-cards" aria-label="What the numbers add up to"><div id="ucPrev"></div></section></div>`;
    $('ucGroups').addEventListener('click', e=>{ const b = e.target.closest('button[data-g]'); if(!b) return; st.group = b.dataset.g; $('ucGroups').querySelectorAll('button').forEach(x=> x.setAttribute('aria-pressed', String(x === b))); renderRows(); });
    $('ucQ').addEventListener('input', e=>{ st.q = e.target.value.trim().toLowerCase(); renderRows(); });
    $('ucOnly').addEventListener('change', e=>{ st.only = e.target.checked; renderRows(); });
    $('ucRows').addEventListener('change', e=>{ const i = e.target.closest('input[data-p]'); if(!i) return; const v = parseFloat(i.value);
      if(!isFinite(v) || v < 0){ i.value = valueOf(i.dataset.p); return; } setValue(i.dataset.p, v); });
    $('ucRows').addEventListener('click', e=>{ const b = e.target.closest('[data-reset]'); if(!b) return; const p = b.dataset.reset; setValue(p, SEED[p]); const i = document.querySelector(`#ucRows input[data-p="${CSS.escape(p)}"]`); if(i) i.value = SEED[p]; });
    $('ucStatus').addEventListener('click', e=>{ if(e.target.closest('[data-copy]')) copyJSON(); });
    renderStatus(); renderRows(); renderPreview(); connect();
  }
  hub.onShow.ucosts = build;
})();
