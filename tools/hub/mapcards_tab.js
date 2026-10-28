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
  const st = {q: '', f: 'all', side: 'all', open: null};
  const chipHTML = ch=> `<span class="mc-chip mc-${ch.sev}" data-k="${ch.k}">${esc(ch.t)}</span>`;
  const cap = m=> `${rl(m.cap.boss)}`;
  function mapHead(m){
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
  function mapBody(m){
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
      const q = st.q.toLowerCase();
      if(!(m.name.toLowerCase().includes(q) || m.cards.some(c=> CD[c.id].n.toLowerCase().includes(q) || c.id.includes(q)))) return false;
    }
    return true;
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
      + `<details class="mc-sum" open><summary><b>📦 Packs against the map lists</b> <small>pack sizes, the unique card total, and what a trim would do</small></summary>${packsHTML()}</details>`
      + `<div class="mc-bar"><div class="dec-seg" role="group" aria-label="Show" id="mcF"><button type="button" data-f="all" aria-pressed="true">All maps</button><button type="button" data-f="odd" aria-pressed="false">With oddities (${oddMaps})</button><button type="button" data-f="rar" aria-pressed="false">Rarity</button><button type="button" data-f="size" aria-pressed="false">Size</button><button type="button" data-f="sel" aria-pressed="false">Selection</button></div>`
      + `<div class="dec-seg" role="group" aria-label="Kind of map" id="mcS"><button type="button" data-s="all" aria-pressed="true">Main + side</button><button type="button" data-s="main" aria-pressed="false">Main</button><button type="button" data-s="side" aria-pressed="false">Side</button></div>`
      + `<input type="search" id="mcQ" placeholder="Find a map or a card…" aria-label="Find a map or a card" autocomplete="off"><button type="button" class="ct-clear" id="mcAll">Open all</button><button type="button" class="ct-clear" id="mcNone">Close all</button></div>`
      + `<p class="ct-count" id="mcCount"></p><div id="mcMaps"></div>`;
    host.addEventListener('click', e=>{
      const f = e.target.closest('#mcF button'); if(f){ st.f = f.dataset.f; host.querySelectorAll('#mcF button').forEach(b=> b.setAttribute('aria-pressed', String(b === f))); renderMaps(); return; }
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
