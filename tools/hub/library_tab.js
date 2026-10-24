// 2026-10-24 (package HUB4): the 📖 Library tab's filter. The list is plain HTML built by tools/hub/library.py; this only hides rows that do not
// match the box (and opens the History group while something is typed). No browser storage.
(function(){
  hub.onShow.library = function(){
    const q = document.getElementById('libQ'); if(!q || q.dataset.on) return; q.dataset.on = '1';
    const n = document.getElementById('libN'), hist = document.querySelector('#p-library details.lib-hist');
    const run = ()=>{
      const terms = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean); let shown = 0;
      document.querySelectorAll('#p-library .lib-row').forEach(r=>{ const on = terms.every(t=> r.dataset.hay.includes(t)); r.hidden = !on; if(on) shown++; });
      if(hist && terms.length) hist.open = true;
      n.textContent = terms.length ? shown + ' match' + (shown === 1 ? '' : 'es') : '';
    };
    q.addEventListener('input', run);
  };
})();
