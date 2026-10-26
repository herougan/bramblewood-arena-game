// deckopt_summary.js: the map picker and the table sort for the summary at the top of the 🧬 Deck optimizer tab (package HUB6, 2026-10-26).
// The tab is lazy (its HTML is stamped in on first open), so the listeners sit on the document and look for the elements when used.
document.addEventListener('change', e=>{
  const s = e.target; if(!s || s.id !== 'dosMapSel') return;
  document.querySelectorAll('.dos-mapdeck').forEach(d=>{ d.hidden = d.dataset.dsmap !== s.value; });
});
(function(){
  function sortBy(th){
    const t = th.closest('table'), tb = t.tBodies[0], k = +th.dataset.dsk, asc = th.getAttribute('aria-sort') !== 'ascending';
    t.querySelectorAll('th[data-dsk]').forEach(h=> h.setAttribute('aria-sort', 'none'));
    th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
    const v = r=>{ const c = r.cells[k], x = c.dataset.v; return k === 0 ? x : (x === '' ? null : parseFloat(x)); };
    Array.from(tb.rows).sort((a, b)=>{ const x = v(a), y = v(b); if(x === y) return 0; if(x === null) return 1; if(y === null) return -1; return (x < y ? -1 : 1) * (asc ? 1 : -1); }).forEach(r=> tb.appendChild(r));
  }
  document.addEventListener('click', e=>{ const th = e.target.closest && e.target.closest('.dos-t th[data-dsk]'); if(th) sortBy(th); });
  document.addEventListener('keydown', e=>{ if(e.key !== 'Enter' && e.key !== ' ') return; const th = e.target.closest && e.target.closest('.dos-t th[data-dsk]'); if(th){ e.preventDefault(); sortBy(th); } });
})();
// 2026-10-27 (package HUB7): the heatmap's cell tooltip (hover, keyboard focus or tap), placed inside the .hm box so it never widens the page.
(function(){
  function show(td){
    const box = td.closest('.hm'), tip = box && box.querySelector('.hm-tip'); if(!tip) return;
    tip.innerHTML = td.dataset.tip; tip.hidden = false;
    const b = box.getBoundingClientRect(), c = td.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    let x = c.left - b.left + c.width / 2 - w / 2; x = Math.max(8, Math.min(x, b.width - w - 8));
    let y = c.top - b.top - h - 6; if(y < 4) y = c.bottom - b.top + 6;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hide(box){ const t = (box || document).querySelector('.hm-tip'); if(t) t.hidden = true; }
  const cell = e=> e.target.closest && e.target.closest('.hm-t td[data-tip]');
  document.addEventListener('mouseover', e=>{ const td = cell(e); if(td) show(td); else if(e.target.closest && !e.target.closest('.hm-t')) hide(); });
  document.addEventListener('focusin', e=>{ const td = cell(e); if(td) show(td); });
  document.addEventListener('focusout', e=>{ if(cell(e)) hide(); });
  document.addEventListener('click', e=>{ const td = cell(e); if(td) show(td); else if(!(e.target.closest && e.target.closest('.hm-tip'))) hide(); });
  document.addEventListener('keydown', e=>{ if(e.key === 'Escape') hide(); });
  document.addEventListener('scroll', ()=> hide(), true);
})();
