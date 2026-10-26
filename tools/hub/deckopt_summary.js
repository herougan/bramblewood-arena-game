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
