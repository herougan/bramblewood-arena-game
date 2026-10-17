/* FXLAB catalogue page (2026-10-15): every inventory entry, grouped by area, with search, filters, coverage, the
   "Variants to choose" view, the shared stage dock and the speed control. Reads FXLAB (fxlab-core.js); runs after the
   manifests have registered. Markup lives in build.py (section#catalogue). */
(function(){
'use strict';
const L = window.FXLAB; if(!L) return;
const $ = (s, r)=> (r || document).querySelector(s), $$ = (s, r)=> [...(r || document).querySelectorAll(s)];
const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
const sec = $('#catalogue'); if(!sec) return;
const AREAS = [['combat-attack', 'Combat: attacks', 'A'], ['combat-skill', 'Combat: skills', 'A'], ['status', 'Statuses', 'B C D'], ['field', 'Fields', 'B'],
  ['weather-time', 'Weather and time', 'B'], ['darkness-light', 'Darkness and light', 'B'], ['death', 'Deaths', 'C'], ['castle', 'Castle', 'C'],
  ['summon-spawn', 'Summons and spawns', 'C'], ['card-treatment', 'Card treatments', 'D'], ['foil', 'Foils', 'D'], ['pack-card-open', 'Packs and card opening', 'D'],
  ['rewards-results', 'Rewards and results', 'F'], ['meta-progression', 'Progression', 'D F'], ['conquest-map', 'Conquest map', 'E'], ['world-ambience', 'World ambience', 'E'], ['map-grandeur', 'Map titles and grandeur', 'G'], ['fun', 'Fun VFX (new ideas)', 'G'],
  ['ui-feedback', 'UI feedback', 'F'], ['tutorial-dialogue', 'Tutorial and dialogue', 'F'], ['raid-dungeon-pvp', 'Raid, dungeon, PvP', 'F']];
const known = new Set(AREAS.map(a=> a[0]));
L.inventory.forEach(e=>{ if(!known.has(e.area)){ known.add(e.area); AREAS.push([e.area, e.area, e.batch]); } });
const qual = e=> (String(e.quality || '').match(/^(good|basic|missing|broken)/) || ['', 'basic'])[1];
const nVar = e=>{ const r = L.get(e.id); return r ? r.variants.length : 0; };

// ---------- list ----------
function playBtns(e){
  const r = L.get(e.id);
  if(!r) return '<span class="fxl-nb">not built yet</span>';
  return r.variants.map(v=> `<button type="button" class="fxl-pb" data-id="${esc(e.id)}" data-k="${v.key}" title="${esc(v.key + ': ' + (v.label || 'Variant ' + v.key))}" aria-label="Play ${esc(e.name)}, variant ${v.key}">▶ ${v.key}</button>`).join('');
}
// 2026-10-16 (user: "The A/B/C/D/E... and GOOD and A/B? should take up 1 thin column on the right. Otherwise the text is
// super squeezed."): the badges and the play buttons share one narrow column (.fxl-side), stacked, so the name and trigger get the width.
function rowHTML(e){
  const q = qual(e), r = L.get(e.id);
  const more = [['Retired', e.retired], ['Now in the game', e.current], ['Quality', e.quality], ['Theme notes', e.themeNotes], ['Lab note', r && r.note],
    ['Variants', r && r.variants.map(v=> `${v.key}: ${v.label || '—'}`).join(' · ')], ['In-game hook', r && r.inGameHook], ['Batch', e.batch + ' · priority ' + e.priority + (e.future ? ' · planned' : '')]]
    .filter(x=> x[1]).map(([k, v])=> `<div><b>${k}</b> ${esc(v)}</div>`).join('');
  return `<div class="fxl-row${e.status === 'retired' ? ' is-retired' : ''}" data-id="${esc(e.id)}"><div class="fxl-main"><button type="button" class="fxl-name" aria-expanded="false">${esc(e.name)}</button>
    <span class="fxl-id">${esc(e.id)}</span><div class="fxl-trig">${esc(e.trigger)}</div></div>
    <div class="fxl-side"><div class="fxl-meta"><span class="fxl-q q-${q}">${q}</span>${e.status === 'retired' ? `<span class="fxl-q q-retired" title="${esc(e.retired || 'Retired')}">retired</span>` : ''}${(e.isNew || e.added) ? `<span class="fxl-q q-new"${e.added ? ` title="Added ${esc(e.added)}"` : ''}>new</span>` : e.updated ? `<span class="fxl-q q-upd" title="Updated ${esc(e.updated)}">updated</span>` : ''}${e.future ? '<span class="fxl-q q-future">future</span>' : ''}${e.priority === 1 ? '<span class="fxl-tag">P1</span>' : ''}${e.variantsSuggested ? '<span class="fxl-tag" title="The inventory suggests 2–3 variants to choose from">A/B?</span>' : ''}</div>
    <div class="fxl-play${r && r.variants.length > 1 ? ' is-many' : ''}">${playBtns(e)}</div></div><div class="fxl-more" hidden>${more}</div></div>`;
}
const list = $('#fxlList');
list.innerHTML = AREAS.map(([a, label, batch])=>{
  const rows = L.inventory.filter(e=> e.area === a); if(!rows.length) return '';
  return `<details class="fxl-area" data-area="${a}"><summary><span class="fxl-aname">${esc(label)}</span><span class="fxl-acount"></span><span class="fxl-abar"><i></i></span>
    <span class="fxl-abatch" title="Build batch">${esc(batch)}</span><button type="button" class="btn small fxl-all" data-area="${a}">▶ Play all</button></summary>
    <div class="fxl-rows">${rows.map(rowHTML).join('')}</div></details>`; }).join('');

// ---------- filters ----------
const F = {q:$('#fxlQ'), area:$('#fxlArea'), qual:$('#fxlQual'), vars:$('#fxlVars'), built:$('#fxlBuilt'), fut:$('#fxlFut')};
F.area.innerHTML = '<option value="">All areas</option>' + AREAS.map(([a, l])=> `<option value="${a}">${esc(l)}</option>`).join('');
const rowsById = new Map($$('.fxl-row', list).map(r=> [r.dataset.id, r]));
function matches(e){
  const q = F.q.value.trim().toLowerCase();
  if(q && !(e.name + ' ' + e.id + ' ' + e.trigger).toLowerCase().includes(q)) return false;
  if(F.area.value && e.area !== F.area.value) return false;
  const qv = F.qual.value; if(qv){ if(qv === 'future'){ if(!e.future) return false; } else if(qual(e) !== qv) return false; }
  const vv = F.vars.value; if(vv === 'suggested' && !e.variantsSuggested) return false; if(vv === 'registered' && nVar(e) < 2) return false;
  if(F.built.value === 'built' && !L.get(e.id)) return false; if(F.built.value === 'todo' && L.get(e.id)) return false;
  // 2026-10-17: what the 10-16/17 pass added or changed, and what it retired (inventory status / added / updated)
  if(F.built.value === 'new17' && !(e.added || e.updated)) return false; if(F.built.value === 'retired' && e.status !== 'retired') return false;
  if(F.fut.value === 'only' && !e.future) return false; if(F.fut.value === 'hide' && e.future) return false;
  return true;
}
function applyFilters(){
  let shown = 0; const filtering = !!(F.q.value.trim() || F.area.value || F.qual.value || F.vars.value || F.built.value || F.fut.value);
  $$('.fxl-area', list).forEach(d=>{
    let n = 0, b = 0, tot = 0;
    $$('.fxl-row', d).forEach(r=>{ const e = L.byId.get(r.dataset.id); const ok = matches(e); r.hidden = !ok; if(ok) n++; tot++; if(L.get(e.id)) b++; });
    d.hidden = n === 0; shown += n;
    $('.fxl-acount', d).textContent = (filtering ? `${n} of ${tot}` : `${tot}`) + ` · built ${b}`;
    $('.fxl-abar i', d).style.width = (tot ? b/tot*100 : 0).toFixed(1) + '%';
    if(filtering && F.q.value.trim() && n) d.open = true;
  });
  $('#fxlShown').textContent = `Showing ${shown} of ${L.inventory.length}`;
}
Object.values(F).forEach(el=> el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', applyFilters));
$('#fxlClear').addEventListener('click', ()=>{ Object.values(F).forEach(el=> el.value = ''); applyFilters(); });

// ---------- coverage ----------
function coverage(){
  const tot = L.inventory.length, built = L.inventory.filter(e=> L.get(e.id)).length, vars = L.list().filter(r=> r.variants.length >= 2).length;
  const added = L.inventory.filter(e=> e.added).length, upd = L.inventory.filter(e=> e.updated).length, retired = L.inventory.filter(e=> e.status === 'retired').length; // 2026-10-17
  const sugg = L.inventory.filter(e=> e.variantsSuggested).length, suggDone = L.inventory.filter(e=> e.variantsSuggested && nVar(e) >= 2).length;
  $('#fxlCov').innerHTML = `<div class="fxl-covtop"><b>${built}</b> of ${tot} built <span class="fxl-pct">${(built/tot*100).toFixed(1)}%</span>
    <span class="fxl-covbar"><i style="width:${(built/tot*100).toFixed(2)}%"></i></span><span class="fxl-covnote">${vars} with variants to choose · ${suggDone}/${sugg} suggested variant sets done · ${added} new and ${upd} updated on 10-16/17 · ${retired} retired</span></div>
    <details class="fxl-covareas"><summary>By area</summary><div class="fxl-covgrid">${AREAS.map(([a, l])=>{ const rows = L.inventory.filter(e=> e.area === a); if(!rows.length) return '';
      const b = rows.filter(e=> L.get(e.id)).length; return `<button type="button" class="fxl-covarea" data-area="${a}"><span>${esc(l)}</span><span class="fxl-covbar"><i style="width:${(b/rows.length*100).toFixed(1)}%"></i></span><span>${b}/${rows.length}</span></button>`; }).join('')}</div></details>`;
  $$('.fxl-covarea').forEach(b=> b.addEventListener('click', ()=>{ F.area.value = b.dataset.area; applyFilters(); const d = $(`.fxl-area[data-area="${b.dataset.area}"]`); if(d){ d.open = true; d.scrollIntoView({block:'start', behavior:'smooth'}); } }));
  if(L.problems.length) $('#fxlProblems').innerHTML = '<b>Registration problems</b><ul>' + L.problems.map(p=> `<li>${esc(p)}</li>`).join('') + '</ul>';
  $('#fxlProblems').hidden = !L.problems.length;
  $('[data-view="variants"] .fxl-n').textContent = vars;
  $('[data-view="list"] .fxl-n').textContent = tot; // 2026-10-16: + the new map-title / map-grand / fun entries
}

// ---------- variants view ----------
function variantsView(){
  const recs = L.list().filter(r=> r.variants.length >= 2);
  const sugg = L.inventory.filter(e=> e.variantsSuggested && nVar(e) < 2);
  $('#fxlVariants').innerHTML = `<p class="sec-sub">Entries with two or more registered variants. Play each, then tell us A, B or C. ${sugg.length} more entries in the inventory ask for variants but don't have them yet.</p>` +
    (recs.length ? `<div class="fxl-vgrid">${recs.map(r=>{ const e = r.entry; return `<div class="fxl-vcard" data-id="${esc(e.id)}"><h3>${esc(e.name)} <span class="fxl-q q-${qual(e)}">${qual(e)}</span></h3>
      <div class="fxl-id">${esc(e.id)} · ${esc(e.area)}</div><p>${esc(r.note || e.themeNotes || e.trigger)}</p>
      <div class="fxl-vbtns">${r.variants.map(v=> `<button type="button" class="fxl-pb fxl-vb" data-id="${esc(e.id)}" data-k="${v.key}"><b>${v.key}</b> ${esc(v.label || '')}</button>`).join('')}</div>
      <button type="button" class="btn small ghost fxl-seq" data-id="${esc(e.id)}">▶ Play ${r.variants.map(v=> v.key).join(' → ')}</button></div>`; }).join('')}</div>` : '<p class="fxl-empty">None yet.</p>');
}

// ---------- dock, playing, speed ----------
const dock = $('#fxlDock'), frame = $('#fxlFrame'), now = $('#fxlNow');
L.setFrame(frame);
let seqToken = 0;
L.on((type, d)=>{
  $$('.fxl-pb.is-playing').forEach(b=> b.classList.remove('is-playing'));
  if(type === 'start'){ const e = d.rec.entry; now.innerHTML = `<b>${esc(e.name)}</b> · ${d.key}${d.v.label ? ' — ' + esc(d.v.label) : ''}<span>${esc(e.id)} · ${esc(d.v.stage || d.rec.stage)} stage</span>`;
    $$(`.fxl-pb[data-id="${CSS.escape(d.id)}"][data-k="${d.key}"]`).forEach(b=> b.classList.add('is-playing')); }
});
function openDock(){ dock.classList.add('is-open'); dock.classList.remove('is-mini'); document.body.classList.add('fxl-dock-open'); const m = $('#fxlDockMin'); if(m){ m.textContent = '▾'; m.setAttribute('aria-expanded', 'true'); } }
// 2026-10-16: on a phone the stage can shrink to its title bar (▾) and grow back (▴); playing anything opens it again.
{ const m = $('#fxlDockMin'); if(m) m.addEventListener('click', ()=>{ const mini = dock.classList.toggle('is-mini'); if(mini){ seqToken++; L.stop(); } m.textContent = mini ? '▴' : '▾'; m.setAttribute('aria-expanded', String(!mini)); m.setAttribute('aria-label', mini ? 'Show the stage' : 'Shrink the stage'); }); }
$('#fxlDockClose').addEventListener('click', ()=>{ seqToken++; L.stop(); dock.classList.remove('is-open'); document.body.classList.remove('fxl-dock-open'); });
$('#fxlReplay').addEventListener('click', ()=>{ const b = $('.fxl-pb.is-playing') || sec.dataset.last && $(`.fxl-pb[data-id="${CSS.escape(sec.dataset.last.split('|')[0])}"][data-k="${sec.dataset.last.split('|')[1]}"]`); if(b) b.click(); });
function playOne(id, k){ openDock(); sec.dataset.last = id + '|' + k; return L.play(id, k); }
sec.addEventListener('click', e=>{
  const pb = e.target.closest('.fxl-pb'); if(pb){ e.preventDefault(); seqToken++; playOne(pb.dataset.id, pb.dataset.k); return; }
  const nm = e.target.closest('.fxl-name'); if(nm){ const m = $('.fxl-more', nm.closest('.fxl-row')); m.hidden = !m.hidden; nm.setAttribute('aria-expanded', String(!m.hidden)); return; }
  const all = e.target.closest('.fxl-all'); if(all){ e.preventDefault(); playAll(all); return; }
  const sq = e.target.closest('.fxl-seq'); if(sq){ const r = L.get(sq.dataset.id); runSeq(r.variants.map(v=> [r.id, v.key]), sq); }
});
async function runSeq(items, btn){
  const my = ++seqToken; const label = btn ? btn.textContent : '';
  if(btn){ btn.classList.add('is-running'); btn.textContent = '■ Stop'; }
  for(const [id, k] of items){ if(my !== seqToken) break; await playOne(id, k); if(my !== seqToken) break; await new Promise(r=> setTimeout(r, 350)); }
  if(btn){ btn.classList.remove('is-running'); btn.textContent = label; }
}
function playAll(btn){
  if(btn.classList.contains('is-running')){ seqToken++; L.stop(); return; }
  const d = btn.closest('.fxl-area'); const items = [];
  $$('.fxl-row', d).forEach(r=>{ if(r.hidden) return; const rec = L.get(r.dataset.id); if(rec) rec.variants.forEach(v=> items.push([rec.id, v.key])); });
  if(!items.length){ btn.textContent = 'Nothing built'; setTimeout(()=> btn.textContent = '▶ Play all', 1200); return; }
  runSeq(items, btn).then(()=>{ btn.textContent = '▶ Play all'; });
}
$$('[data-speed]').forEach(b=> b.addEventListener('click', ()=>{ L.setSpeed(+b.dataset.speed); $$('[data-speed]').forEach(x=> x.setAttribute('aria-pressed', String(x === b))); }));
$$('[data-view]').forEach(b=> b.addEventListener('click', ()=>{ const v = b.dataset.view; $$('[data-view]').forEach(x=> x.setAttribute('aria-selected', String(x === b)));
  $('#fxlListView').hidden = v !== 'list'; $('#fxlVariants').hidden = v !== 'variants'; if(v === 'variants') variantsView(); }));
// A speed set elsewhere on the page (the old tabs' slow-motion boxes) shouldn't stick when the catalogue plays.
document.addEventListener('click', e=>{ if(e.target.closest('nav.toc [data-tab="catalogue"]')) L.setSpeed(L.speed); });

// The stage dock sticks just under the sticky tab bar, whatever its height at this width.
const navTop = ()=>{ const n = $('nav.toc'); if(n) document.documentElement.style.setProperty('--fxl-top', (n.offsetHeight + 10) + 'px'); };
navTop(); addEventListener('resize', navTop);
coverage(); applyFilters();
// Open the first area with something built, so the page has something to press straight away.
const firstBuilt = $$('.fxl-area', list).find(d=> $$('.fxl-row', d).some(r=> L.get(r.dataset.id)));
if(firstBuilt) firstBuilt.open = true;
window.FXLAB_UI = {applyFilters, coverage, variantsView, playOne};
})();
