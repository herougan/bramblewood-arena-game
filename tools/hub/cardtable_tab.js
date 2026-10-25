// cardtable_tab.js — the 🗃️ Card table tab, inlined into .hub/index.html by tools/hub/build_hub.py after hub_app.js.
// 2026-10-25 (package HUB5; owner 10-25 17:53 #28 H2: "Have a card table in the master hub (max 100 cards per page, w sort and filter options."
// and 22:36 G11: "For each pack ... show the pack and the various cards that can represent the pack's packaging art"):
//   Table  every card of canonical/cards.json, 100 a page, sortable by any column; filters for text, rarity, pack, first map (canonical/card-obtain-maps.json),
//          faction, type and skill.
//   Packs  each pack with its tier and price and the rare-and-higher cards with art that could wear its packaging, as thumbnails to accept or reject.
//          Show only: nothing is stored (no db, no browser storage).
// Reads CT_DATA (tools/hub/hub5_data.py card_table), CT_PACKS (packs) and CT_COLS / CT_ROWS (the thumbnail sheet, cards-thumbs.webp: 96 px tiles).
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[c]);
  const hub = window.hub;
  if(!hub || typeof CT_DATA === 'undefined' || !CT_DATA) return;
  const PAGE = 100, D = CT_DATA, ROWS = D.cards;
  const RIDX = {}; D.rarities.forEach((r, i)=> RIDX[r.k] = i);
  const RLAB = {}; D.rarities.forEach(r=> RLAB[r.k] = r.l);
  const rlab = k=> k ? (RLAB[k] || k) : 'Unrated';
  const baseSk = s=> s.replace(/ [0-9.]+$/, '');
  ROWS.forEach(r=>{ r.hay = (r.n + ' ' + r.id + ' ' + r.sk.join(' ') + ' ' + r.sp + ' ' + r.an + ' ' + r.sd + ' ' + r.ty + ' ' + r.f).toLowerCase(); r.skb = r.sk.map(baseSk); });
  const NONE = '(none)', NOTLISTED = '(not listed)';
  const st = {view: 'table', q: '', rar: '', pk: '', mp: '', fac: '', ty: '', sk: '', hideX: false, key: 'n', dir: 1, page: 0};
  const num = (v, d)=> v == null ? d : v;
  const SORT = {
    n: r=> r.n.toLowerCase(), r: r=> r.r ? RIDX[r.r] : -1, a: r=> num(r.a, -1), h: r=> num(r.h, -1), w: r=> num(r.w, 0), c: r=> num(r.c, 0),
    sk: r=> r.sk.length, mp: r=> num(r.mp, 999), src: r=> r.src + ' ' + r.sd, pk: r=> r.pk
  };
  const uniq = (f)=> [...new Set(ROWS.map(f).filter(v=> v !== ''))];
  function opts(label, values, fmt){ return `<option value="">${esc(label)}</option>` + values.map(v=> `<option value="${esc(v)}">${esc(fmt ? fmt(v) : v)}</option>`).join(''); }
  // The sheet is CT_COLS x CT_ROWS tiles (96 px each); percentages keep a tile in step with its box, so CSS alone can resize a thumbnail.
  const thumb = (t, s, cls)=> t >= 0 ? `<span class="${cls || 'ct-th'}" style="width:${s}px;height:${s}px;background-image:url(cards-thumbs.webp);background-size:${CT_COLS * 100}% ${CT_ROWS * 100}%;background-position:${CT_COLS > 1 ? (t % CT_COLS) / (CT_COLS - 1) * 100 : 0}% ${CT_ROWS > 1 ? Math.floor(t / CT_COLS) / (CT_ROWS - 1) * 100 : 0}%" aria-hidden="true"></span>` : `<span class="${cls || 'ct-th'} ct-noart" style="width:${s}px;height:${s}px" title="No art" aria-hidden="true"></span>`;

  function filtered(){
    const q = st.q;
    const list = ROWS.filter(r=>{
      if(st.hideX && r.x) return false;
      if(st.rar && (st.rar === NONE ? r.r : r.r !== st.rar)) return false;
      if(st.pk && (st.pk === NONE ? r.pk : r.pk !== st.pk)) return false;
      if(st.mp && (st.mp === NOTLISTED ? r.mp != null : String(r.mp) !== st.mp)) return false;
      if(st.fac && (st.fac === NONE ? r.f : r.f !== st.fac)) return false;
      if(st.ty && r.ty !== st.ty) return false;
      if(st.sk && !r.skb.includes(st.sk)) return false;
      if(q && !q.split(/\s+/).every(w=> r.hay.includes(w))) return false;
      return true;
    });
    const f = SORT[st.key] || SORT.n, d = st.dir;
    list.sort((a, b)=>{ const x = f(a), y = f(b); return (x < y ? -1 : x > y ? 1 : a.n.localeCompare(b.n)) * (x === y ? 1 : d); });
    return list;
  }
  const HEADS = [['n', 'Name'], ['r', 'Rarity'], ['a', 'Atk'], ['h', 'HP'], ['w', 'Wait'], ['c', 'Costs'], ['sk', 'Skills'], ['mp', 'First map'], ['src', 'Source'], ['pk', 'Pack']];
  function pager(total, pages){
    return `<div class="ct-pager" role="navigation" aria-label="Pages"><button type="button" data-pg="first" ${st.page === 0 ? 'disabled' : ''} aria-label="First page">«</button><button type="button" data-pg="prev" ${st.page === 0 ? 'disabled' : ''} aria-label="Previous page">‹ Prev</button>`
      + `<span>Page <b>${st.page + 1}</b> of ${pages}</span><button type="button" data-pg="next" ${st.page >= pages - 1 ? 'disabled' : ''} aria-label="Next page">Next ›</button><button type="button" data-pg="last" ${st.page >= pages - 1 ? 'disabled' : ''} aria-label="Last page">»</button></div>`;
  }
  function renderTable(){
    const list = filtered(), total = list.length, pages = Math.max(1, Math.ceil(total / PAGE));
    if(st.page >= pages) st.page = pages - 1;
    const from = st.page * PAGE, slice = list.slice(from, from + PAGE);
    const rows = slice.map(r=>{
      const sk = r.sk.length ? `<span class="ct-sk" title="${esc(r.sk.join(', '))}">${r.sk.map(s=> `<i>${esc(s)}</i>`).join('')}</span>` : '<span class="ct-dim">–</span>';
      const tags = [r.ty !== 'creature' ? r.ty : '', r.f, r.x ? 'hidden / token / test' : ''].filter(Boolean).map(t=> `<small class="ct-tag">${esc(t)}</small>`).join('');
      return `<tr><td class="ct-nm">${thumb(r.t, 34)}<span><b>${esc(r.ic)} ${esc(r.n)}</b><small>${esc(r.id)}${r.sp ? ' · ' + esc(r.sp) : ''}</small>${tags}</span></td>`
        + `<td><span class="ct-r r-${esc(r.r || 'none')}">${esc(rlab(r.r))}</span></td><td class="ct-n">${r.a == null ? '–' : r.a}</td><td class="ct-n">${r.h == null ? '–' : r.h}</td><td class="ct-n">${r.w}</td>`
        + `<td class="ct-cs">${r.cs ? esc(r.cs) : '<span class="ct-dim">0</span>'}</td><td class="ct-skc">${sk}</td>`
        + `<td class="ct-n">${r.mp == null ? '<span class="ct-dim" title="Not listed in canonical/card-obtain-maps.json (the file reads that as Map 0: Base, tutorial, quest, Easter eggs, unsorted)">–</span>' : r.mp}</td>`
        + `<td class="ct-src">${esc(r.sd)}</td><td>${r.pk ? esc(r.pk) + (r.pt != null && r.pt !== 99 && r.pt !== 11 ? ` <small class="ct-dim">T${r.pt}</small>` : '') : '<span class="ct-dim">–</span>'}</td></tr>`;
    }).join('') || '<tr><td colspan="10" class="dec-empty">No card matches these filters.</td></tr>';
    const head = HEADS.map(([k, l])=> `<th data-k="${k}" ${st.key === k ? `aria-sort="${st.dir > 0 ? 'ascending' : 'descending'}"` : ''} tabindex="0" role="columnheader" scope="col">${l}</th>`).join('');
    $('ctBody').innerHTML = `<p class="ct-count" aria-live="polite">${total === ROWS.length ? `All ${total} cards` : `${total} of ${ROWS.length} cards`}${total ? ` · showing ${from + 1}-${from + slice.length}` : ''} · 100 a page</p>`
      + pager(total, pages)
      + `<div class="bal-wrap ct-wrap"><table class="bal-t ct-t"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>` + (slice.length > 20 ? pager(total, pages) : '');
  }
  function renderPacks(){
    const P = CT_PACKS;
    $('ctBody').innerHTML = `<div class="ct-packs-note"><p><b>Which card should wear each pack's packaging?</b> Each pack below lists the Rare-and-higher cards with art from its own pool, best rarity first. The game wears the first eight today (<code>packCoverCandidates</code> in <code>arena_app.js</code>; marked <span class="ct-badge">in use</span>); the rest are further candidates. Accept or reject by eye and tell Claude the card names. This page shows only; it stores nothing.</p>`
      + `<p>Pack prices and sizes are today's (<code>SHOP_PACKS_DEFAULT</code>). The owner's G15 note (all packs give 3 cards, Collector's 5, re-costed) is <b>decided, not built yet</b>, so sizes and prices here will change with it.</p></div>`
      + P.packs.map(p=>{
        const c = p.cands;
        const grid = c.length ? c.map((x, i)=> `<figure class="ct-cand ${i < 8 ? 'used' : ''}" title="${esc(x.n)} (${esc(rlab(x.r))})">${thumb(x.t, 96, 'ct-th ct-big')}<figcaption><b>${esc(x.n)}</b><small>${esc(rlab(x.r))}${i < 8 ? ' · <span class="ct-badge">in use</span>' : ''}</small></figcaption></figure>`).join('')
          : `<p class="ct-dim">${esc(p.note || 'No Rare-or-higher card with art in this pack.')}</p>`;
        return `<section class="ct-pack"><header><span class="ct-pic">${esc(p.icon)}</span><div><h3>${esc(p.name)}</h3><p>Tier <b>${p.tier}</b>${p.maps ? ' · ' + esc(p.maps) : ''} · ${esc(p.price)}${p.cards ? ' · ' + p.cards + ' cards' : ''} · ${c.length} art candidate${c.length === 1 ? '' : 's'}</p>${p.note && c.length ? `<p class="ct-dim">${esc(p.note)}</p>` : p.note && !c.length ? '' : ''}</div></header><div class="ct-cands">${grid}</div></section>`;
      }).join('');
  }
  function render(){
    document.querySelectorAll('#ctView button').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.v === st.view)));
    $('ctFilters').hidden = st.view !== 'table';
    st.view === 'table' ? renderTable() : renderPacks();
  }
  function build(){
    const host = $('ctHost'); if(!host || host.dataset.built) return; host.dataset.built = '1';
    const rars = D.rarities.map(r=> r.k).filter(k=> ROWS.some(x=> x.r === k));
    const pks = [...new Set(ROWS.map(r=> r.pk).filter(Boolean))];
    const mps = [...new Set(ROWS.map(r=> r.mp).filter(v=> v != null))].sort((a, b)=> a - b);
    const facs = uniq(r=> r.f), tys = uniq(r=> r.ty);
    host.innerHTML = `<div class="dec-head"><h2>Card table</h2><p>Every card in <code>canonical/cards.json</code> (${ROWS.length}), 100 a page. Click a column to sort, use the filters to narrow. <b>Costs</b> are Lumber 🪵, Stone 🪨, Metal 🔩 and the rarer resources; <b>First map</b> is the map where the card becomes obtainable (<code>canonical/card-obtain-maps.json</code>); <b>Pack</b> is its pack, if it has one. The 🎴 Cards tab has the picture view with decks and win rates.</p></div>`
      + `<div class="ct-viewbar"><div class="dec-seg" role="group" aria-label="View" id="ctView"><button type="button" data-v="table" aria-pressed="true">🗃️ Table</button><button type="button" data-v="packs" aria-pressed="false">📦 Packs</button></div></div>`
      + `<div id="ctFilters" class="ct-filters"><input type="search" id="ctQ" placeholder="Search name, id, skill, species…" aria-label="Search cards" autocomplete="off">`
      + `<select id="ctRar" aria-label="Rarity">${opts('Any rarity', [...rars, NONE], v=> v === NONE ? 'Unrated' : RLAB[v])}</select>`
      + `<select id="ctPk" aria-label="Pack">${opts('Any pack', [...pks, NONE], v=> v === NONE ? 'Not in a pack' : v)}</select>`
      + `<select id="ctMp" aria-label="First map">${opts('Any first map', [...mps.map(String), NOTLISTED], v=> v === NOTLISTED ? 'Not listed' : 'Map ' + v)}</select>`
      + `<select id="ctFac" aria-label="Faction">${opts('Any faction', [...facs, NONE], v=> v === NONE ? 'No faction' : v)}</select>`
      + `<select id="ctTy" aria-label="Type">${opts('Any type', tys)}</select>`
      + `<select id="ctSk" aria-label="Skill">${opts('Any skill', D.skills.map(s=> s.l), v=> { const s = D.skills.find(x=> x.l === v); return s ? `${v} (${s.n})` : v; })}</select>`
      + `<label class="ct-chk"><input type="checkbox" id="ctX"> hide tokens, tests and hidden</label><button type="button" id="ctClear" class="ct-clear">Clear filters</button></div>`
      + `<div id="ctBody"></div>`;
    const on = (id, ev, fn)=> $(id).addEventListener(ev, fn);
    const sel = {ctRar: 'rar', ctPk: 'pk', ctMp: 'mp', ctFac: 'fac', ctTy: 'ty', ctSk: 'sk'};
    Object.keys(sel).forEach(id=> on(id, 'change', e=>{ st[sel[id]] = e.target.value; st.page = 0; render(); }));
    on('ctQ', 'input', e=>{ st.q = e.target.value.trim().toLowerCase(); st.page = 0; render(); });
    on('ctX', 'change', e=>{ st.hideX = e.target.checked; st.page = 0; render(); });
    on('ctClear', 'click', ()=>{ Object.assign(st, {q: '', rar: '', pk: '', mp: '', fac: '', ty: '', sk: '', hideX: false, page: 0}); $('ctQ').value = ''; $('ctX').checked = false; Object.keys(sel).forEach(id=> $(id).value = ''); render(); });
    on('ctView', 'click', e=>{ const b = e.target.closest('button[data-v]'); if(!b) return; st.view = b.dataset.v; render(); });
    host.addEventListener('click', e=>{
      const th = e.target.closest('th[data-k]');
      if(th){ const k = th.dataset.k; if(st.key === k) st.dir = -st.dir; else { st.key = k; st.dir = ['a', 'h', 'sk', 'r'].includes(k) ? -1 : 1; } st.page = 0; renderTable(); return; }
      const pg = e.target.closest('[data-pg]');
      if(pg){ const pages = Math.max(1, Math.ceil(filtered().length / PAGE)), v = pg.dataset.pg; st.page = v === 'first' ? 0 : v === 'prev' ? Math.max(0, st.page - 1) : v === 'next' ? Math.min(pages - 1, st.page + 1) : pages - 1; renderTable(); const w = host.querySelector('.ct-count'); if(w) w.scrollIntoView({block: 'start'}); }
    });
    host.addEventListener('keydown', e=>{ const th = e.target.closest && e.target.closest('th[data-k]'); if(th && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); th.click(); } });
    render();
  }
  hub.onShow.ctable = build;
})();
