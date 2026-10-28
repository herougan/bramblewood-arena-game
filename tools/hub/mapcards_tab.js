// mapcards_tab.js — the 🗺️ Map cards tab, inlined into .hub/index.html by tools/hub/build_hub.py after cardtable_tab.js.
// 2026-10-28 (package HUB9; owner 10-28 16:43: "Can the map cards also be included in the master-hub? We can note oddities in card selection, rarity
// oddities, or size of map cards oddities. It might also be outside my expectation as, balancing this way may make our pack size and unique card
// total not match."): every map's card list (canonical/map-pools.json) in road order, each card with its rarity, pack and role; per map the counts
// against the proposed cap (CONTENT4 L7, not applied) and the oddity chips; a packs-versus-lists summary on top.
// Reads MC_DATA (tools/hub/mapcards_data.py). Show only: nothing is stored.
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[c]);
  const hub = window.hub;
  if(!hub || typeof MC_DATA === 'undefined' || !MC_DATA) return;
  const D = MC_DATA, CD = D.cards, RL = {}; D.rarities.forEach(r=> RL[r.k] = r.l);
  const rl = k=> k ? (RL[k] || k) : 'Unrated';
  const rtx = k=> k ? `<span class="rtx rtx-${esc(k)}">${esc(rl(k))}</span>` : '<span class="mc-dim">–</span>';
  const name = id=> {
    const c = CD[id] || {n: id};
    return hub.hasCard && hub.hasCard(id) ? `<button type="button" class="cardlink" data-card-open="${esc(id)}">${esc(c.n)}</button>` : esc(c.n);
  };
  const FL = {rx: ['rarity not revealed yet on this map', 'hi'], ra: ['above the map\'s rarity cap', 'warn'], late: ['first obtainable after this map', 'warn'],
    nosrc: ['no pack or other source', 'hi'], many: ['on %d+ lists', 'info'], mis: ['possible theme misfit', 'info'], unused: ['not played in any fight of this map', 'info']};
  const FLT = {rx: 'not revealed', ra: 'above cap', late: 'later', nosrc: 'no source', many: 'many maps', mis: 'misfit?', unused: 'unused'};
  const st = {q: '', f: 'all', side: 'all', open: null, view: 'current'};
  // 2026-10-28 (package THEME1, owner's plan steps 1-2): the Proposal view: each map's proposed list (unique + carried) beside its current list,
  // added / cut / moved marked; D.proposal comes from docs/balance/theme1-proposal-2026-10-28.json (a proposal, nothing applied).
  const PR = D.proposal || null;
  const mname = k=> { const m = D.lists.find(x=> x.key === k); return m ? m.name : k; };
  const dest = to=> to.kind === 'map' ? `→ ${esc(to.name)} (Map ${to.no})` : to.kind === 'pack' ? `pack only (Pack ${esc(to.tier)})` : to.kind === 'base' ? 'Base card' : to.kind === 'none' ? 'no home yet' : `own source (${esc(to.source)})`;
  const tags = r=> (r.g && r.g.length ? `<span class="mc-tag" title="cost generator: ${esc(r.g.join(', '))}">${r.g.map(g=> ({lumber:'🪵', stone:'🪨', metal:'🔩'})[g] || g).join('')}</span>` : '') + (r.h ? `<span class="mc-tag" title="high cost">💰${r.c}</span>` : '');
  function propHead(m){
    const p = PR.lists[m.key];
    if(!p || p.kept) return `<span class="mc-chips"><span class="mc-chip mc-info">kept as it is (tutorial / endless)</span></span>`;
    const chips = (p.mix.flags || []).map(f=> `<span class="mc-chip mc-warn">${esc(f)}</span>`).join('')
      + (p.side ? `<span class="mc-chip ${p.side.class === 'ask' ? 'mc-hi' : 'mc-info'}" title="${esc(p.side.reason)}">${esc(p.side.label)} · ${p.side.unique} unique</span>` : '')
      + `<span class="mc-chip mc-info">cost avg ${p.mix.avgCost} · ${p.mix.high} high · ${p.mix.gen} generator${p.mix.gen === 1 ? '' : 's'}</span>`
      + (p.mix.introduces && p.mix.introduces.length ? `<span class="mc-chip mc-ok">introduces ${esc(p.mix.introduces.join(', '))}</span>` : '');
    return `<span class="mc-chips">${chips}</span>`;
  }
  const chipHTML = ch=> `<span class="mc-chip mc-${ch.sev}" data-k="${ch.k}">${esc(ch.t)}</span>`;
  const cap = m=> `${rl(m.cap.boss)}`;
  function mapHead(m){
    if(st.view === 'proposal' && PR){
      const p = PR.lists[m.key] || {}, label = m.sub ? `<span class="mc-side">side map</span> ` : '';
      const cnt = p.n ? `<span class="mc-counts" title="current → proposed; unique to this map; carried from earlier maps"><span>now <b>${p.n.current}</b> → <b>${p.n.proposed}</b></span><span>unique <b>${p.n.unique}</b></span><span>carried <b>${p.n.carried}</b></span></span>` : `<span class="mc-counts"><span>kept <b>${m.n.total}</b></span></span>`;
      return `<summary><span class="mc-t"><b>${esc(m.sub ? 'opens at Map ' + m.no : 'Map ' + m.no)}</b> · ${esc(m.name)} ${label}</span>${cnt}${propHead(m)}</summary>`;
    }
    const n = m.n, over = !m.skipped && n.total > n.capTotal;
    const label = m.sub ? `<span class="mc-side">side map</span> ` : '';
    const noText = m.sub ? `opens at Map ${m.no}` : `Map ${m.no}`;
    return `<summary><span class="mc-t"><b>${esc(noText)}</b> · ${esc(m.name)} ${label}</span>`
      + `<span class="mc-counts" title="new / carried / total, against the proposed cap"><span>new <b>${n.new}</b></span><span>carried <b>${n.old}</b></span><span class="${over ? 'mc-over' : ''}">total <b>${n.total}</b>${m.skipped ? '' : ` / cap ${n.capTotal}`}</span></span>`
      + `<span class="mc-chips">${m.chips.length ? m.chips.map(chipHTML).join('') : '<span class="mc-chip mc-ok">no oddities</span>'}</span></summary>`;
  }
  function cardRows(m){
    const rows = m.cards.slice().sort((a, b)=> (b.new - a.new) || ((CD[a.id].r ? D.steps.indexOf(CD[a.id].r === 'starter' ? 'common' : CD[a.id].r) : -1) - (CD[b.id].r ? D.steps.indexOf(CD[b.id].r === 'starter' ? 'common' : CD[b.id].r) : -1)) || CD[a.id].n.localeCompare(CD[b.id].n));
    return rows.map(c=>{
      const d = CD[c.id], role = [c.base ? 'Base (carried)' : c.new ? 'new' : 'carried'].concat(c.roles);
      const fl = c.fl.map(f=> `<span class="mc-chip mc-${FL[f][1]} mc-sm" title="${esc(FL[f][0].replace('%d', D.thresholdMany))}">${esc(FLT[f])}${f === 'many' ? ' ×' + c.nl : f === 'late' ? ' (Map ' + d.o + ')' : ''}</span>`).join('');
      return `<tr><td class="mc-nm">${d.ic ? `<span aria-hidden="true">${esc(d.ic)}</span> ` : ''}${name(c.id)}</td><td>${rtx(d.r)}</td><td>${esc(d.pk || '–')}</td>`
        + `<td>${role.map((r, i)=> `<span class="mc-role${i ? ' mc-x' : ''}">${esc(r)}</span>`).join(' ')}</td>`
        + `<td class="mc-n">${c.f == null ? '–' : c.f + (m.n.fights ? ' / ' + m.n.fights : '')}</td><td class="mc-fl">${fl}</td></tr>`;
    }).join('');
  }
  function propBody(m){
    const p = PR.lists[m.key];
    if(!p || p.kept) return `<div class="mc-meta"><span>${esc(p ? p.theme : '')}</span><span>The tutorial and the endless dungeons keep their lists.</span></div>`;
    const prop = new Set(p.u.map(r=> r.id).concat(p.c.map(r=> r.id))), cutBy = {}; p.x.forEach(x=> cutBy[x.id] = x.to);
    const cur = m.cards.map(c=>{
      const kept = prop.has(c.id), to = cutBy[c.id];
      const cls = kept ? '' : to && to.kind === 'map' ? 'mc-mv' : 'mc-cut';
      return `<li class="${cls}"><span class="mc-cn">${name(c.id)}</span> ${rtx(CD[c.id].r)} <span class="mc-why">${kept ? 'kept' : dest(to || {kind: 'none'})}</span></li>`; }).join('');
    const row = (r, kind)=>{
      const cls = r.w ? '' : r.mf ? 'mc-mv' : 'mc-add';
      const note = r.w ? 'kept' : r.mf ? `moved from ${esc(mname(r.mf))}` : kind === 'c' && r.fr ? `added, from ${esc(r.fr === 'base' ? 'Base' : mname(r.fr))}` : 'added';
      const extra = kind === 'u' ? `<span class="mc-why" title="${esc(r.why)}${r.af && r.af.length ? ' · also fits ' + esc(r.af.map(mname).join(', ')) : ''}">· ${esc(r.why.split(';')[0])}</span>` : '';
      return `<li class="${cls}"><span class="mc-cn">${name(r.id)}</span> ${rtx(CD[r.id] ? CD[r.id].r : '')} ${tags(r)} <span class="mc-why">${note}</span> ${extra}</li>`; };
    return `<div class="mc-meta"><span><b>Theme.</b> ${esc(p.theme)}</span>${p.side ? `<span><b>Side map call:</b> ${esc(p.side.label)} (${p.side.unique} unique): ${esc(p.side.reason)}</span>` : ''}`
      + `<span><b>Mix.</b> ${p.mix.n} cards: ${p.mix.high} high-cost, ${p.mix.gen} generator${p.mix.gen === 1 ? '' : 's'}, ${p.mix.plain} plain; average cost ${p.mix.avgCost}; resources ${esc((p.mix.resources || []).join(', ') || 'none')}.</span>`
      + `<span class="mc-legend"><span class="mc-add">added</span> <span class="mc-mv">moved</span> <span class="mc-cut">cut</span></span></div>`
      + `<div class="mc-cmp"><div><h4>Current list (${m.cards.length})</h4><ul class="mc-ul">${cur}</ul></div>`
      + `<div><h4>Proposed: unique (${p.u.length})</h4><ul class="mc-ul">${p.u.map(r=> row(r, 'u')).join('')}</ul><h4>Proposed: carried (${p.c.length})</h4><ul class="mc-ul">${p.c.map(r=> row(r, 'c')).join('') || '<li class="mc-dim">none</li>'}</ul></div></div>`;
  }
  function mapBody(m){
    if(st.view === 'proposal' && PR) return propBody(m);
    const n = m.n;
    return `<div class="mc-meta"><span>Rarity cap on this map: <b>${esc(cap(m))}</b> (revealed: ${esc(rl(m.cap.reveal))})</span>`
      + `<span>Biome: ${esc((m.biomes || []).map(b=> D.biomeLabels[b] || b).join(' + ') || '–')}</span>`
      + (m.skipped ? '<span>Tutorial / endless dungeon: its list is kept as it is (no size flags).</span>'
        : `<span>Proposed cap (CONTENT4 L7): ${n.capNew} new + ${n.capOld} carried = ${n.capTotal}${n.planAfter != null ? `; the plan would keep ${n.planAfter} (${n.planNew} new + ${n.planOld} carried)` : ''}</span>`)
      + `</div><div class="mc-wrap"><table class="mc-t2"><thead><tr><th>Card</th><th>Rarity</th><th>Pack</th><th>Role</th><th title="fights of this map that play it">Fights</th><th>Notes</th></tr></thead><tbody>${cardRows(m)}</tbody></table></div>`;
  }
  const hasOdd = m=> m.chips.some(c=> c.sev === 'hi' || c.sev === 'warn');
  function visible(m){
    if(st.side === 'main' && m.sub) return false;
    if(st.side === 'side' && !m.sub) return false;
    if(st.f === 'odd' && !hasOdd(m)) return false;
    if(['rar', 'size', 'sel'].includes(st.f) && !m.chips.some(c=> c.k === st.f)) return false;
    if(st.q){
      const q = st.q.toLowerCase(), pp = st.view === 'proposal' && PR && PR.lists[m.key];
      const pids = pp && !pp.kept ? pp.u.concat(pp.c).map(r=> r.id) : [];
      if(!(m.name.toLowerCase().includes(q) || m.cards.some(c=> CD[c.id].n.toLowerCase().includes(q) || c.id.includes(q)) || pids.some(i=> (CD[i] ? CD[i].n : i).toLowerCase().includes(q)))) return false;
    }
    return true;
  }
  function propSumHTML(){
    const T = PR.totals;
    const pk = PR.packs.map(p=> `<tr><td><b>${esc(p.name)}</b><br><small>${esc(p.maps || 'no maps')}</small></td><td class="mc-n">${p.cards}</td><td class="mc-n">${p.listedNow}</td><td class="mc-n">${p.unique}</td><td class="mc-n">${p.carriedOnly}</td><td class="mc-n ${p.packOnly ? 'mc-over' : ''}">${p.packOnly}</td></tr>`).join('');
    const sc = (PR.sideClasses || []).map(x=> `<tr><td>${esc(x.name)}</td><td>${x.class === 'ask' ? '<b class="mc-over">Ask owner</b>' : x.class === 'delve' ? 'Full delve' : 'Additional challenges'}</td><td class="mc-n">${x.unique}</td><td>${esc(x.reason)}</td></tr>`).join('');
    const po = PR.packs.filter(p=> p.packOnlyIds && p.packOnlyIds.length).map(p=> `<details class="mc-none"><summary>${esc(p.name)}: ${p.packOnly} pack only</summary><p class="mc-names">${p.packOnlyIds.map(i=> `<span class="mc-nn">${name(i)} ${rtx(CD[i] ? CD[i].r : '')}</span>`).join(' ')}</p></details>`).join('');
    return `<div class="mc-stats">`
      + `<div class="mc-stat"><b>${T.entriesNow} → ${T.entriesProposed}</b><span>list entries</span><small>${T.lists} lists (the tutorial and endless dungeons kept)</small></div>`
      + `<div class="mc-stat"><b>${T.uniqueNow} → ${T.onAnyList}</b><span>different cards on a list</span><small>${T.uniqueProposed} with a unique home, ${T.rewards} of them skirmish rewards</small></div>`
      + `<div class="mc-stat mc-plan"><b>${T.packOnly}</b><span>pack cards become pack only</span><small>Packs 1-4; ${T.packOnlyAll} with the faction pool and Mystery Booster</small></div>`
      + `<div class="mc-stat"><b>${T.noHome}</b><span>creatures with no home yet</span><small>no source, on no list</small></div>`
      + `<div class="mc-stat"><b>${T.moved}</b><span>cards moved to a better map</span><small>${T.swaps} swaps for the cost mix</small></div></div>`
      + `<div class="mc-wrap"><table class="mc-t2 mc-pk"><thead><tr><th>Pack</th><th>Cards</th><th>On a list now</th><th>Unique on a map (proposed)</th><th>Carried only</th><th>Pack only</th></tr></thead><tbody>${pk}</tbody></table></div>`
      + po
      + `<h4 class="mc-h4">Side maps: a full delve or additional challenges (owner 10-28 21:49: 1-3 unique cards)</h4><div class="mc-wrap"><table class="mc-t2"><thead><tr><th>Side map</th><th>Call</th><th>Unique</th><th>Why</th></tr></thead><tbody>${sc}</tbody></table></div>`
      + `<details class="mc-none"><summary>${T.noHome} creatures with no home yet</summary><p class="mc-names">${PR.noHome.map(i=> `<span class="mc-nn">${name(i)} ${rtx(CD[i] ? CD[i].r : '')}</span>`).join(' ')}</p></details>`
      + `<p class="mc-note">A proposal for decision THEME1-1, built ${esc(PR.built)} by <code>tools/theme1_proposal_2026_10_28.py</code>; the readable version is <code>docs/balance/theme1-proposal-2026-10-28.md</code>. Nothing in <code>canonical/</code> changed.</p>`;
  }
  function renderMaps(){
    const list = D.lists.filter(visible);
    $('mcCount').textContent = `${list.length} of ${D.lists.length} lists shown`;
    const open = new Set(st.open || []);
    $('mcMaps').innerHTML = list.map(m=> `<details class="mc-map${hasOdd(m) ? ' mc-has' : ''}" id="mc-${esc(m.key)}" data-key="${esc(m.key)}"${open.has(m.key) || (st.q && list.length < 6) ? ' open' : ''}>${mapHead(m)}<div class="mc-body" data-lazy="1"></div></details>`).join('')
      || '<p class="dec-empty">No list matches.</p>';
    $('mcMaps').querySelectorAll('details[open]').forEach(fill);
  }
  function fill(dt){
    const b = dt.querySelector('.mc-body'); if(!b || !b.dataset.lazy) return;
    const m = D.lists.find(x=> x.key === dt.dataset.key); if(!m) return;
    b.innerHTML = mapBody(m); delete b.dataset.lazy;
  }
  const num = v=> v == null ? '–' : v;
  function packsHTML(){
    const T = D.totals, rows = D.packs.map(p=>{
      return `<tr><td><b>${esc(p.name)}</b><br><small>${esc(p.maps || 'no maps')}${p.lists ? ' · ' + p.lists + ' lists' : ''}</small></td>`
        + `<td class="mc-n">${p.cards}${p.draw ? `<br><small>${p.draw} a pack</small>` : ''}</td><td class="mc-n">${p.maps ? p.inRange : '–'}</td><td class="mc-n">${p.maps ? p.elsewhere : p.elsewhere}</td>`
        + `<td class="mc-n ${p.none ? 'mc-over' : ''}">${p.none}</td><td class="mc-n">${p.maps ? p.rangeOther : '–'}</td>`
        + `<td class="mc-n">${D.planned && p.afterRange != null ? p.afterRange : '–'}</td><td class="mc-n">${D.planned && p.afterAny != null ? p.afterAny : '–'}</td></tr>`
        ;
    }).join('');
    const nones = D.packs.filter(p=> p.none_ids.length).map(p=> `<details class="mc-none"><summary>${esc(p.name)}: ${p.none} cards in the pack but on no map list</summary><p class="mc-names">${p.none_ids.map(i=> `<span class="mc-nn">${name(i)} ${rtx(CD[i].r)}</span>`).join(' ')}</p></details>`).join('');
    const bs = Object.entries(T.bySource).sort((a, b)=> b[1] - a[1]).map(([k, v])=> `${esc(k)} ${v}`).join(' · ');
    return `<div class="mc-stats">`
      + `<div class="mc-stat"><b>${T.obtainable}</b><span>obtainable cards</span><small>${bs}</small></div>`
      + `<div class="mc-stat"><b>${T.listed}</b><span>unique cards on a map list</span><small>${T.listedObtainable} obtainable${T.listedNotObtainable.length ? ', ' + T.listedNotObtainable.length + ' with no source' : ''}</small></div>`
      + `<div class="mc-stat"><b>${T.obtainableNotListed}</b><span>obtainable, on no list</span><small>they still drop from packs / rewards</small></div>`
      + `<div class="mc-stat"><b>${T.entries}</b><span>list entries</span><small>${T.lists} lists, repeats counted</small></div>`
      + (D.planned ? `<div class="mc-stat mc-plan"><b>${T.planUnique}</b><span>unique on lists after the proposed trim</span><small>${T.planEntries} entries; ${T.planAwaiting} pack cards would lose their source map and wait for one</small></div>` : '')
      + `</div>`
      + `<div class="mc-wrap"><table class="mc-t2 mc-pk"><thead><tr><th>Pack</th><th title="cards of canonical/cards.json whose source is this pack tier">Cards in the pack</th><th title="of those, on a list of a map in this pack's range">On a list in its maps</th><th title="of those, only on a list of a map outside the range">On a list elsewhere</th><th title="in the pack, on no map list at all (they still drop from the pack)">On no list</th><th title="cards on this pack's maps' lists that do not come from this pack (Base, rewards, other packs)">Listed there, not from this pack</th><th title="after the CONTENT4 L7 trim, if applied: pack cards still on a list of the pack's maps">After trim: on its maps</th><th title="after the trim: on any list">After trim: any list</th></tr></thead><tbody>${rows}</tbody></table></div>`
      + nones
      + `<p class="mc-note">${T.listedNotObtainable.length ? `Listed but with no pack or other source: ${T.listedNotObtainable.map(i=> name(i)).join(', ')}.` : ''}</p>`;
  }
  function build(){
    const host = $('mcHost'); if(!host || host.dataset.built) return; host.dataset.built = '1';
    const oddMaps = D.lists.filter(hasOdd).length;
    host.innerHTML = `<div class="dec-head"><h2>Map cards</h2><p>The card list of each map (<code>canonical/map-pools.json</code>) in road order, a side map at the number it opens on. Each card shows its rarity, pack and role (<b>new</b> to this map, <b>carried</b> from an earlier map, <b>Base</b>, <b>reward</b>, <b>showcase</b>, first-clear pack). The cap is the CONTENT4 L7 proposal (new 7, carried 3 before Map 10 and 5 after), not applied yet. The rarity cap is the game's own (<code>roadRarityCap</code>). Chips mark oddities: <span class="mc-chip mc-hi mc-sm">serious</span> <span class="mc-chip mc-warn mc-sm">worth a look</span> <span class="mc-chip mc-info mc-sm">for information</span>. Theme misfits are only <i>possible</i>: the card's biomes (<code>unit-themes.json</code>) share nothing with the map's biome or its neighbours. Fights read from <code>docs/balance/decks.json</code>${D.decksDate ? ' (exported ' + esc(D.decksDate) + ')' : ''}. Built ${esc(D.built)}.</p></div>`
      + (PR ? `<details class="mc-sum mc-psum" open hidden><summary><b>🧭 THEME1 proposal: unique cards, the 8-11 cut, the mix</b> <small>steps 1 and 2 of the owner's plan; nothing applied</small></summary>${propSumHTML()}</details>` : '')
      + `<details class="mc-sum mc-csum" open><summary><b>📦 Packs against the map lists</b> <small>pack sizes, the unique card total, and what a trim would do</small></summary>${packsHTML()}</details>`
      + `<div class="mc-bar">${PR ? `<div class="dec-seg" role="group" aria-label="View" id="mcV"><button type="button" data-v="current" aria-pressed="true">Current</button><button type="button" data-v="proposal" aria-pressed="false">Proposal</button></div>` : ''}<div class="dec-seg" role="group" aria-label="Show" id="mcF"><button type="button" data-f="all" aria-pressed="true">All maps</button><button type="button" data-f="odd" aria-pressed="false">With oddities (${oddMaps})</button><button type="button" data-f="rar" aria-pressed="false">Rarity</button><button type="button" data-f="size" aria-pressed="false">Size</button><button type="button" data-f="sel" aria-pressed="false">Selection</button></div>`
      + `<div class="dec-seg" role="group" aria-label="Kind of map" id="mcS"><button type="button" data-s="all" aria-pressed="true">Main + side</button><button type="button" data-s="main" aria-pressed="false">Main</button><button type="button" data-s="side" aria-pressed="false">Side</button></div>`
      + `<input type="search" id="mcQ" placeholder="Find a map or a card…" aria-label="Find a map or a card" autocomplete="off"><button type="button" class="ct-clear" id="mcAll">Open all</button><button type="button" class="ct-clear" id="mcNone">Close all</button></div>`
      + `<p class="ct-count" id="mcCount"></p><div id="mcMaps"></div>`;
    host.addEventListener('click', e=>{
      const f = e.target.closest('#mcF button'); if(f){ st.f = f.dataset.f; host.querySelectorAll('#mcF button').forEach(b=> b.setAttribute('aria-pressed', String(b === f))); renderMaps(); return; }
      const v = e.target.closest('#mcV button'); if(v){ st.view = v.dataset.v; host.querySelectorAll('#mcV button').forEach(b=> b.setAttribute('aria-pressed', String(b === v)));
        st.open = [...host.querySelectorAll('#mcMaps details[open]')].map(d=> d.dataset.key);
        const ps = host.querySelector('.mc-psum'), cs = host.querySelector('.mc-csum'); if(ps) ps.hidden = st.view !== 'proposal'; if(cs) cs.hidden = st.view === 'proposal';
        renderMaps(); return; }
      const s = e.target.closest('#mcS button'); if(s){ st.side = s.dataset.s; host.querySelectorAll('#mcS button').forEach(b=> b.setAttribute('aria-pressed', String(b === s))); renderMaps(); return; }
      if(e.target.id === 'mcAll'){ host.querySelectorAll('#mcMaps details').forEach(d=>{ d.open = true; fill(d); }); return; }
      if(e.target.id === 'mcNone'){ host.querySelectorAll('#mcMaps details').forEach(d=> d.open = false); return; }
    });
    host.addEventListener('toggle', e=>{ const d = e.target; if(d.matches && d.matches('#mcMaps > details') && d.open) fill(d); }, true);
    $('mcQ').addEventListener('input', e=>{ st.q = e.target.value.trim(); renderMaps(); });
    renderMaps();
  }
  hub.onShow.mapcards = build;
})();
