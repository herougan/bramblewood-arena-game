// cardtable_tab.js — the 🗃️ Card table tab, inlined into .hub/index.html by tools/hub/build_hub.py after hub_app.js.
// 2026-10-25 (package HUB5; owner 10-25 17:53 #28 H2: "Have a card table in the master hub (max 100 cards per page, w sort and filter options."
// and 22:36 G11: "For each pack ... show the pack and the various cards that can represent the pack's packaging art"):
//   Table  every card of canonical/cards.json, 100 a page, sortable by any column; filters for text, rarity, pack, first map (canonical/card-obtain-maps.json),
//          faction, type and skill.
//   Packs  each pack with its tier and price and the rare-and-higher cards with art that could wear its packaging, as thumbnails to accept or reject.
//          Show only: nothing is stored (no db, no browser storage).
// Reads CT_DATA (tools/hub/hub5_data.py card_table), CT_PACKS (packs) and CT_COLS / CT_ROWS (the thumbnail sheet, cards-thumbs.webp: 96 px tiles).
// 2026-10-27 (package BAL6, K5, owner 10-27 11:22: "also show the general 'contribution' of each card with our myriad testing. For example Owl
// Nightwatch is TOO strong"): a third view, 🏅 Contribution: each card's contribution to winning over random CPU-vs-CPU fights
// (tools/balance/contribution.js; CT_CONTRIB from tools/hub/contribution_data.py), sortable, with the top 20 too strong and too weak for their
// rarity band flagged. Show only, like the rest of the tab.
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
  // ---- 🏅 Contribution (BAL6)
  const CB = typeof CT_CONTRIB !== 'undefined' ? CT_CONTRIB : null;
  const byId = {}; ROWS.forEach(r=> byId[r.id] = r);
  const cst = {key: 'c', dir: -1, band: '', flag: '', q: '', page: 0};
  const BAND_LAB = {starter: 'Starter', common: 'Common', uncommon: 'Uncommon', rare: 'Rare', 'veryrare+': 'Very Rare and up'};
  const pts = (v, sign)=> v == null ? '–' : ((sign !== false && v > 0) ? '+' : v < 0 ? '−' : '') + Math.abs(v * 100).toFixed(1);
  const ci = se=> se == null ? '' : `<small class="ct-dim"> ±${(se * 196).toFixed(1)}</small>`;
  const CSORT = {k: r=> num(r.k, 1e9), n: r=> r.n.toLowerCase(), b: r=> CB.bandOrder.indexOf(r.b) * 1000 + (RIDX[r.r] || 0), d: r=> r.d, rd: r=> num(r.rd, -9), pc: r=> num(r.pc, -9), c: r=> num(r.c, -9), vb: r=> num(r.vb, -9), z: r=> num(r.z, -99)};
  const CHEADS = [['k', 'Rank'], ['n', 'Card'], ['b', 'Rarity (band)'], ['d', 'Decks'], ['rd', 'Raw Δ'], ['pc', 'Per copy'], ['c', 'Contribution'], ['vb', 'vs band'], ['z', 'z']];
  const flagChip = r=> r.f === 'strong' ? '<span class="cb-flag cb-strong" title="Top 20 too strong for its rarity band">▲ too strong</span>' : r.f === 'weak' ? '<span class="cb-flag cb-weak" title="Top 20 too weak for its rarity band">▼ too weak</span>' : '';
  const sig = r=> r.z != null && Math.abs(r.z) >= 1.96;
  const bar = v=>{ const w = Math.min(50, Math.abs(v || 0) * 100 / 30 * 50); return `<span class="cb-bar" aria-hidden="true"><i class="${v >= 0 ? 'cb-pos' : 'cb-neg'}" style="${v >= 0 ? 'left:50%' : 'right:50%'};width:${w}%"></i></span>`; };
  const cardCell = r=>{ const t = byId[r.id]; return `<td class="ct-nm">${thumb(t ? t.t : -1, 30)}<span><b>${esc(t ? t.ic : '')} ${esc(r.n)}</b><small>${r.l} 🪵 · ${r.a == null ? '–' : r.a}/${r.h == null ? '–' : r.h}${r.sk.length ? ' · ' + esc(r.sk.join(', ')) : ''}</small>${flagChip(r)}</span></td>`; };
  function cbRow(r){
    return `<tr${r.f ? ` class="cb-row-${r.f}"` : ''}><td class="ct-n">${r.k == null ? '–' : r.k}</td>${cardCell(r)}<td><span class="ct-r r-${esc(r.r)}">${esc(rlab(r.r))}</span><small class="ct-dim cb-sub">${esc(BAND_LAB[r.b] || r.b)} #${r.br == null ? '–' : r.br} of ${r.bs || '–'}</small></td>`
      + `<td class="ct-n">${r.d}<small class="ct-dim cb-sub">${r.mc} copies</small></td><td class="ct-n">${pts(r.rd)}</td><td class="ct-n">${pts(r.pc)}${ci(r.pcs)}</td>`
      + `<td class="ct-n cb-c"><b>${pts(r.c)}</b>${ci(r.cs)}${bar(r.c)}</td><td class="ct-n${sig(r) ? (r.vb > 0 ? ' cb-hi' : ' cb-lo') : ''}">${pts(r.vb)}</td><td class="ct-n">${r.z == null ? '–' : r.z.toFixed(1)}</td></tr>`;
  }
  function cbTable(list, sortable, caption){
    const head = CHEADS.map(([k, l])=> sortable ? `<th data-ck="${k}" ${cst.key === k ? `aria-sort="${cst.dir > 0 ? 'ascending' : 'descending'}"` : ''} tabindex="0" role="columnheader" scope="col">${l}</th>` : `<th scope="col">${l}</th>`).join('');
    return `<div class="bal-wrap ct-wrap"><table class="bal-t ct-t cb-t"><caption class="sr-only">${esc(caption)}</caption><thead><tr>${head}</tr></thead><tbody>${list.map(cbRow).join('') || '<tr><td colspan="9" class="dec-empty">No card matches.</td></tr>'}</tbody></table></div>`;
  }
  function cbFiltered(){
    const q = cst.q, list = CB.rows.filter(r=> (!cst.band || r.b === cst.band) && (!cst.flag || (cst.flag === 'any' ? !!r.f : r.f === cst.flag)) && (!q || q.split(/\s+/).every(w=> (r.n + ' ' + r.id + ' ' + r.sk.join(' ')).toLowerCase().includes(w))));
    const f = CSORT[cst.key] || CSORT.c, d = cst.dir; list.sort((a, b)=>{ const x = f(a), y = f(b); return x < y ? -d : x > y ? d : a.n.localeCompare(b.n); }); return list;
  }
  function renderContribTable(){
    const list = cbFiltered(), total = list.length, pages = Math.max(1, Math.ceil(total / PAGE)); if(cst.page >= pages) cst.page = pages - 1; if(cst.page < 0) cst.page = 0;
    const from = cst.page * PAGE, slice = list.slice(from, from + PAGE);
    const pg = `<div class="ct-pager" role="navigation" aria-label="Contribution pages"><button type="button" data-cpg="prev" ${cst.page === 0 ? 'disabled' : ''}>‹ Prev</button><span>Page <b>${cst.page + 1}</b> of ${pages}</span><button type="button" data-cpg="next" ${cst.page >= pages - 1 ? 'disabled' : ''}>Next ›</button></div>`;
    $('cbAll').innerHTML = `<p class="ct-count" aria-live="polite">${total} of ${CB.rows.length} cards${total ? ` · showing ${from + 1}-${from + slice.length}` : ''} · click a column to sort</p>` + pg + cbTable(slice, true, "Every card's contribution") + (slice.length > 20 ? pg : '');
  }
  function renderContrib(){
    if(!CB){ $('ctBody').innerHTML = '<p class="dec-empty">No contribution run yet (node tools/balance/contribution.js).</p>'; return; }
    const by = {}; CB.rows.forEach(r=> by[r.id] = r);
    const owl = by['owl-nightwatch'], nRank = CB.rows.filter(r=> r.k != null).length, S = CB.settings;
    const owlTxt = owl ? `<b>Owl Nightwatch</b> (Common, ${owl.l} 🪵, ${owl.a}/${owl.h}, ${esc(owl.sk.join(', '))}): contribution <b>${pts(owl.c)}</b>${ci(owl.cs)} points, rank <b>${owl.k}</b> of ${nRank} overall and <b>${owl.br}</b> of ${owl.bs} Commons; ${pts(owl.vb)} over the Common median (z ${owl.z == null ? '–' : owl.z.toFixed(1)})${owl.f ? ', flagged too ' + owl.f : ''}. Raw Δ by the field's light: ${Object.entries(owl.ph).map(([k, v])=> esc(k) + ' ' + pts(v)).join(', ')}.` : '';
    const bands = CB.bandOrder.map(b=>{ const x = CB.bands[b]; return `<li><b>${esc(BAND_LAB[b])}</b> median ${pts(x.median)} <small class="ct-dim">(${x.cards} cards, SD ${pts(x.sd, false)})</small></li>`; }).join('');
    $('ctBody').innerHTML = `<div class="cb-head"><p><b>Contribution</b> = what a card adds to its deck's win rate, in win-rate points, over <b>${CB.fights.toLocaleString('en')}</b> random CPU-vs-CPU fights: two random legal 20-card decks from ${S.cards} cards, both brambles ${S.bramble} Health, a field drawn from the maps' ${S.fields} road fights, Smart CPU on both sides, Level ${S.level}. `
      + `It is a regression on the copy counts of both decks, so the rest of the deck is controlled for; <b>per copy</b> is one copy against an average copy, <b>contribution</b> is per copy times the copies a deck usually holds. <b>vs band</b> compares it with the median of its rarity band; the ▲ / ▼ flags are the top 20 each way. <b>Raw Δ</b> is the plain win rate with the card minus without it.</p>`
      + `<p class="ct-dim">Confidence: split-half reliability <b>${CB.reliability}</b> (r = ${CB.splitHalfR}); a card's 95% interval is about ±${(CB.medianSE * 196).toFixed(1)} points (median), shown after each number. Random decks are not built decks: a card that needs partners reads low here. Data: <code>${esc(CB.file)}</code> (${esc(CB.generated)}), <code>tools/balance/contribution.js</code>.</p>`
      + (owlTxt ? `<p class="cb-owl">${owlTxt}</p>` : '') + `<ul class="cb-bands">${bands}</ul></div>`
      + `<div class="cb-tops"><section><h3>▲ Top 20 too strong for their band</h3>${cbTable(CB.tooStrong.map(id=> by[id]), false, 'Top 20 too strong')}</section><section><h3>▼ Top 20 too weak for their band</h3>${cbTable(CB.tooWeak.map(id=> by[id]), false, 'Top 20 too weak')}</section></div>`
      + `<h3 class="cb-allh">Every card</h3><div class="ct-filters cb-filters"><input type="search" id="cbQ" placeholder="Search a card or skill…" aria-label="Search the contribution table" autocomplete="off" value="${esc(cst.q)}">`
      + `<select id="cbBand" aria-label="Rarity band">${opts('Any band', CB.bandOrder, v=> BAND_LAB[v])}</select><select id="cbFlag" aria-label="Flag"><option value="">Every card</option><option value="any">Flagged only</option><option value="strong">Too strong</option><option value="weak">Too weak</option></select></div><div id="cbAll"></div>`;
    $('cbBand').value = cst.band; $('cbFlag').value = cst.flag;
    $('cbQ').addEventListener('input', e=>{ cst.q = e.target.value.trim().toLowerCase(); cst.page = 0; renderContribTable(); });
    $('cbBand').addEventListener('change', e=>{ cst.band = e.target.value; cst.page = 0; renderContribTable(); });
    $('cbFlag').addEventListener('change', e=>{ cst.flag = e.target.value; cst.page = 0; renderContribTable(); });
    renderContribTable();
  }
  function render(){
    document.querySelectorAll('#ctView button').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.v === st.view)));
    $('ctFilters').hidden = st.view !== 'table';
    st.view === 'table' ? renderTable() : st.view === 'contrib' ? renderContrib() : renderPacks();
  }
  function build(){
    const host = $('ctHost'); if(!host || host.dataset.built) return; host.dataset.built = '1';
    const rars = D.rarities.map(r=> r.k).filter(k=> ROWS.some(x=> x.r === k));
    const pks = [...new Set(ROWS.map(r=> r.pk).filter(Boolean))];
    const mps = [...new Set(ROWS.map(r=> r.mp).filter(v=> v != null))].sort((a, b)=> a - b);
    const facs = uniq(r=> r.f), tys = uniq(r=> r.ty);
    host.innerHTML = `<div class="dec-head"><h2>Card table</h2><p>Every card in <code>canonical/cards.json</code> (${ROWS.length}), 100 a page. Click a column to sort, use the filters to narrow. <b>Costs</b> are Lumber 🪵, Stone 🪨, Metal 🔩 and the rarer resources; <b>First map</b> is the map where the card becomes obtainable (<code>canonical/card-obtain-maps.json</code>); <b>Pack</b> is its pack, if it has one. The 🎴 Cards tab has the picture view with decks and win rates.</p></div>`
      + `<div class="ct-viewbar"><div class="dec-seg" role="group" aria-label="View" id="ctView"><button type="button" data-v="table" aria-pressed="true">🗃️ Table</button><button type="button" data-v="packs" aria-pressed="false">📦 Packs</button>${CB ? '<button type="button" data-v="contrib" aria-pressed="false">🏅 Contribution</button>' : ''}</div></div>`
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
      const cth = e.target.closest('th[data-ck]'); // BAL6: the contribution table's sort
      if(cth){ const k = cth.dataset.ck; if(cst.key === k) cst.dir = -cst.dir; else { cst.key = k; cst.dir = ['k', 'n', 'b'].includes(k) ? 1 : -1; } cst.page = 0; renderContribTable(); return; }
      const cpg = e.target.closest('[data-cpg]');
      if(cpg){ cst.page += cpg.dataset.cpg === 'next' ? 1 : -1; renderContribTable(); const w = $('cbAll'); if(w) w.scrollIntoView({block: 'start'}); return; }
      const th = e.target.closest('th[data-k]');
      if(th){ const k = th.dataset.k; if(st.key === k) st.dir = -st.dir; else { st.key = k; st.dir = ['a', 'h', 'sk', 'r'].includes(k) ? -1 : 1; } st.page = 0; renderTable(); return; }
      const pg = e.target.closest('[data-pg]');
      if(pg){ const pages = Math.max(1, Math.ceil(filtered().length / PAGE)), v = pg.dataset.pg; st.page = v === 'first' ? 0 : v === 'prev' ? Math.max(0, st.page - 1) : v === 'next' ? Math.min(pages - 1, st.page + 1) : pages - 1; renderTable(); const w = host.querySelector('.ct-count'); if(w) w.scrollIntoView({block: 'start'}); }
    });
    host.addEventListener('keydown', e=>{ const th = e.target.closest && e.target.closest('th[data-k], th[data-ck]'); if(th && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); th.click(); } });
    render();
  }
  hub.onShow.ctable = build;
})();
