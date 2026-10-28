// hub_app.js — inlined into .hub/index.html by tools/hub/build_hub.py, after the tab code (show, showSub, window.hub).
// 2026-10-15 (user: "i think the main things you can do is to improve the master hub"): the 🎴 Cards tab (art thumbnails
// from the cards-thumbs.webp sprite sheet, filters, a detail sheet with skills, source, balance and the decks that use the
// card), the header's global search across cards, changelog, decisions, design and guide docs, dialogues and fights, the
// theme toggle and the changelog's open/close-all. Reads the CARDS and SEARCH constants the build writes just above.
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s==null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const hub = window.hub;
  document.documentElement.style.setProperty('--cols', CARDS.cols);
  const SK = {}; CARDS.skills.forEach(s=> SK[s.key] = s);
  const MAPS = {}; CARDS.maps.forEach(m=> MAPS[m.id] = m);
  const BYID = {}; CARDS.cards.forEach(c=> BYID[c.id] = c);
  const RAR = ['starter', 'common', 'uncommon', 'rare', 'epic', 'heroic', 'legendary', 'unique', ''];
  const rarName = r=> r ? r[0].toUpperCase() + r.slice(1) : 'No rarity';
  const SRC = {map:'Conquest map', pack:'Packs', base:'Starting cards', raid:'Raid', nest:'Nest (eggs)', smith:'Blacksmith', design:'Design only (not placed)',
    unsorted:'Unsorted', materia:'Materia', secret:'Secret', event:'Event'};
  const mapLabel = m=> m ? (m.num != null ? `Map ${m.num}${m.sub ? ' (side)' : ''}: ` : '') + m.name : '';
  const skLabel = s=>{ const d = SK[s.k]; return (d && d.icon ? d.icon + ' ' : '') + (d ? d.label : s.k) + (typeof s.v === 'number' ? ' ' + s.v : '') + (s.lv ? ` (Lv ${s.lv})` : ''); };
  hub.thumb = (c, size)=> c.t < 0 ? `<span class="th" style="--s:${size}px" aria-hidden="true">${esc(c.icon || '🃏')}</span>`
    : `<span class="th img" style="--s:${size}px;--x:${c.t % CARDS.cols};--y:${Math.floor(c.t / CARDS.cols)}" aria-hidden="true"></span>`;
  CARDS.cards.forEach(c=>{ c.hay = [c.name, c.id, c.sp, c.f, (c.ar || []).join(' '), c.sk.map(s=> (SK[s.k] ? SK[s.k].label : s.k) + ' ' + s.k).join(' '), c.where, c.r].join(' ').toLowerCase(); });

  // ---------- go: one place that opens any target (tab, sub-tab, element, card, decision) ----------
  hub.go = j=>{
    if(j.card){ hub.show('cards'); openCard(j.card); return; }
    if(j.dec){ hub.show('decisions'); if(window.hubFindDecision) window.hubFindDecision(j.dec); return; }
    hub.show(j.tab); if(j.sub) hub.showSub(j.sub);
    const el = j.el && document.getElementById(j.el); if(!el) return;
    for(let p = el; p; p = p.parentElement) if(p.tagName === 'DETAILS') p.open = true;
    el.scrollIntoView({block:'start'}); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  };
  document.addEventListener('click', e=>{
    const g = e.target.closest('[data-go]'); if(g){ e.preventDefault(); e.stopPropagation(); closeCard(); hub.go(JSON.parse(g.dataset.go)); return; }
    const cl = e.target.closest('[data-cl]'); if(cl){ document.querySelectorAll('#p-changelog details.cl').forEach(d=> d.open = cl.dataset.cl === 'open'); }
  }, true);

  // 2026-10-28 (package HUB8, L8; owner: "In the stat budget and card check sections, let the card names be clickable, opening card detail ...
  // Color the rarity by its rarity."): any <button data-card-open="<card id>"> in any tab opens the Cards tab's detail sheet in place (no tab
  // switch). Names are real buttons, so Enter / Space work. The sheet moves to <body> so it can show over a tab whose Cards panel is hidden.
  // Rarity text wears .rtx .rtx-<key> (the --rc-<key> colours of cardtable_tab.css, which already have light and dark values).
  const sheet0 = $('cdSheet'); if(sheet0 && sheet0.parentNode !== document.body) document.body.appendChild(sheet0);
  document.addEventListener('click', e=>{
    const o = e.target.closest('[data-card-open]'); if(!o) return;
    e.preventDefault(); e.stopPropagation(); if(BYID[o.dataset.cardOpen]) openCard(o.dataset.cardOpen);
  }, true);
  hub.openCard = id=>{ if(BYID[id]) openCard(id); };
  hub.hasCard = id=> !!BYID[id];

  // ---------- Cards tab ----------
  let built = false;
  const st = {q:'', r:'*', s:'*', m:'*', k:'*', a:'*', o:'rarity', x:false};
  function opts(sel, list, all){ $(sel).innerHTML = `<option value="*">${esc(all)}</option>` + list.map(([v, l])=> `<option value="${esc(v)}">${esc(l)}</option>`).join(''); }
  function buildCards(){
    if(built) return; built = true;
    const live = CARDS.cards.filter(c=> !c.test && !c.tok), count = f=>{ const n = {}; live.forEach(c=> [].concat(f(c)).forEach(v=>{ if(v != null && v !== '') n[v] = (n[v] || 0) + 1; })); return n; };
    const nr = count(c=> c.r || 'none');
    opts('cdR', RAR.map(r=> r || 'none').filter(r=> nr[r]).map(r=> [r, `${rarName(r === 'none' ? '' : r)} (${nr[r]})`]), 'Any rarity');
    const ns = count(c=> c.src || 'unsorted');
    opts('cdS', Object.keys(ns).sort((a, b)=> ns[b] - ns[a]).map(s=> [s, `${SRC[s] || s} (${ns[s]})`]).concat([['un', `Not obtainable yet (${live.filter(c=> c.un).length})`]]), 'Any source');
    const nm = count(c=> c.map);
    opts('cdM', CARDS.maps.filter(m=> nm[m.id]).map(m=> [m.id, `${mapLabel(m)} (${nm[m.id]})`]), 'Any map');
    const nk = count(c=> c.sk.map(s=> s.k));
    opts('cdK', Object.keys(nk).sort((a, b)=> (SK[a] ? SK[a].label : a).localeCompare(SK[b] ? SK[b].label : b)).map(k=> [k, `${SK[k] && SK[k].icon ? SK[k].icon + ' ' : ''}${SK[k] ? SK[k].label : k} (${nk[k]})`]), 'Any skill');
    const na = count(c=> c.ar || []);
    opts('cdA', Object.keys(na).sort().map(a=> [a, `${a} (${na[a]})`]), 'Any type');
    $('cdO').innerHTML = [['rarity', 'Sort: rarity'], ['name', 'Sort: name'], ['map', 'Sort: map order'], ['c', 'Sort: cost'], ['w', 'Sort: wait'], ['a', 'Sort: attack'], ['h', 'Sort: health'], ['wr', 'Sort: win rate'], ['nuse', 'Sort: most used']]
      .map(([v, l])=> `<option value="${v}">${l}</option>`).join('');
    $('cdLead').textContent = `${live.length} cards (plus ${CARDS.cards.length - live.length} tokens and test cards), straight from the build. Tap one for its skills, where it drops and which decks use it.`;
    const bind = (id, key, ev)=> $(id).addEventListener(ev || 'change', e=>{ st[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; if(key === 'q') st.q = st.q.trim().toLowerCase(); render(); });
    bind('cdQ', 'q', 'input'); bind('cdR', 'r'); bind('cdS', 's'); bind('cdM', 'm'); bind('cdK', 'k'); bind('cdA', 'a'); bind('cdO', 'o'); bind('cdX', 'x');
    $('cdGrid').addEventListener('click', e=>{ const b = e.target.closest('.cd'); if(b) openCard(b.dataset.id); });
    $('cdSheet').addEventListener('click', e=>{ if(e.target.closest('[data-close]')) closeCard();
      const ed = e.target.closest('[data-edit-card]'); if(ed && hub.editCard){ const id = ed.dataset.editCard; lastFocus = null; closeCard(); hub.editCard(id); } });
    document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && !$('cdSheet').hidden) closeCard(); });
    render();
  }
  const mapOrder = c=>{ const m = MAPS[c.map]; return m ? (m.num == null ? 999 : m.num) * 100 + (m.sub ? 50 : 0) + (parseInt(String(c.node).split('-').pop(), 10) || 0) : 1e6; };
  function render(){
    const terms = st.q.split(/\s+/).filter(Boolean);
    const list = CARDS.cards.filter(c=> (st.x || (!c.test && !c.tok)) && (st.r === '*' || (c.r || 'none') === st.r)
      && (st.s === '*' || (st.s === 'un' ? c.un : (c.src || 'unsorted') === st.s)) && (st.m === '*' || c.map === st.m)
      && (st.k === '*' || c.sk.some(s=> s.k === st.k)) && (st.a === '*' || (c.ar || []).includes(st.a)) && terms.every(t=> c.hay.includes(t)));
    const o = st.o, num = (c, k)=> k === 'wr' ? (c.wr ? c.wr[0] : -1) : (c[k] || 0);
    list.sort((a, b)=> o === 'name' ? a.name.localeCompare(b.name) : o === 'rarity' ? (RAR.indexOf(b.r || '') - RAR.indexOf(a.r || '')) || a.name.localeCompare(b.name)
      : o === 'map' ? mapOrder(a) - mapOrder(b) || a.name.localeCompare(b.name) : (num(b, o) - num(a, o)) || a.name.localeCompare(b.name));
    $('cdN').textContent = `${list.length} card${list.length === 1 ? '' : 's'}` + (list.some(c=> c.un) ? ' · faded ones are not obtainable yet' : '');
    $('cdGrid').innerHTML = list.map(c=> `<button type="button" class="cd r-${c.r || 'none'}${c.un ? ' is-un' : ''}" data-id="${esc(c.id)}">${hub.thumb(c, 56)}<span>`
      + `<b>${esc(c.name)}</b><span class="ln"><span class="rb rtx rtx-${c.r || 'none'}">${esc(rarName(c.r))}</span> · 🪵${c.c} · ⏳${c.w} · ⚔${c.a} · ❤${c.h}${c.wr ? ` · ${c.wr[0]}%` : ''}</span>`
      + `<span class="sks">${c.sk.length ? esc(c.sk.map(skLabel).join(' · ')) : '<i style="opacity:.6">No skills</i>'}</span></span></button>`).join('')
      || '<p class="dec-empty">Nothing matches. Clear a filter or the search.</p>';
  }
  let lastFocus = null;
  function openCard(id){
    buildCards(); const c = BYID[id]; if(!c) return; lastFocus = document.activeElement;
    const m = MAPS[c.map], go = o=> esc(JSON.stringify(o));
    const verdict = c.wr ? ({strong:'too strong', weak:'too weak', ok:'in band'})[c.wr[3]] || c.wr[3] : '';
    $('cdBody').innerHTML = `<div class="cdd-top r-${c.r || 'none'}">${hub.thumb(c, 96)}<div><h2 id="cdTitle">${esc(c.name)}</h2>`
      + `<span class="rb rtx rtx-${c.r || 'none'}">${esc(rarName(c.r))}</span> <code>${esc(c.id)}</code>${c.tok ? ' <span class="chip">token</span>' : ''}${c.test ? ' <span class="chip">test</span>' : ''}</div></div>`
      + (hub.editCard && !c.tok && !c.test ? `<p class="cdd-edit"><button type="button" class="btn cdd-editbtn" data-edit-card="${esc(c.id)}">✏️ Edit card</button> <small>Attack, Health and the budget check, in 🎚️ Budget &amp; stats</small></p>` : '')
      + `<div class="cdd-stats"><div><b>${c.c}</b><small>Cost</small></div><div><b>${c.w}</b><small>Wait</small></div><div><b>${c.a}</b><small>Attack</small></div><div><b>${c.h}</b><small>Health</small></div></div>`
      + `<h3>Skills</h3>${c.sk.length ? '<p>' + c.sk.map(s=> `<span class="chip">${esc(skLabel(s))}</span>`).join('') + '</p>' : '<p>None.</p>'}`
      + `<h3>Where to get it</h3><p>${esc(c.where || '—')}${c.un ? ' <span class="chip">not obtainable yet</span>' : ''}</p>`
      + (m ? `<p><a href="#decks" data-go="${go({tab:'decks', el:('fight-' + c.map + '-' + c.node).replace(/[^\w-]/g, '_')})}">${esc(mapLabel(m))}${c.node ? ' · fight ' + esc(c.node) : ''} →</a></p>` : '')
      + (c.wr ? `<h3>Balance</h3><p>Wins ${c.wr[0]}% of simulated games; its rarity's band is ${c.wr[1]}–${c.wr[2]}% (${esc(verdict)}). <a href="#balance" data-go="${go({tab:'balance'})}">Balance tab →</a></p>` : '')
      + (c.use ? `<h3>In ${c.nuse} enemy deck${c.nuse === 1 ? '' : 's'}</h3><ul>${c.use.map(([el, l])=> `<li><a href="#decks" data-go="${go({tab:'decks', el})}">${esc(l)}</a></li>`).join('')}${c.nuse > c.use.length ? `<li>…and ${c.nuse - c.use.length} more</li>` : ''}</ul>` : '')
      + ((c.ar || []).length || c.sp || c.f ? `<h3>Type</h3><p>${[c.f, ...(c.ar || [])].filter(Boolean).map(a=> `<span class="chip">${esc(a)}</span>`).join('')}${c.sp ? ` <small>species: ${esc(c.sp)}</small>` : ''}</p>` : '')
      + (c.fl ? `<p class="cdd-fl">“${esc(c.fl)}”</p>` : '');
    $('cdSheet').hidden = false; $('cdSheet').querySelector('.cd-x').focus();
  }
  function closeCard(){ const s = $('cdSheet'); if(!s || s.hidden) return; s.hidden = true; if(lastFocus && lastFocus.focus) lastFocus.focus(); }
  hub.onShow.cards = buildCards;

  // ---------- global search ----------
  const TYPES = {'Card':'🎴', 'Decision':'🗳️', 'Action items':'🎯', 'Changelog':'🗒️', 'Design':'📐', 'Fight':'⚔️', 'Dialogue':'💬', 'Guide':'🧠', 'Library':'📖', 'History':'🕰️'};
  const ORDER = Object.keys(TYPES);
  const IDX = CARDS.cards.filter(c=> !c.test).map(c=> ({type:'Card', label:c.name, sub:`${rarName(c.r)} · ${c.sk.map(skLabel).join(', ') || 'no skills'}`, hay:c.hay, text:c.where, go:{card:c.id}, c}))
    .concat(SEARCH.map(r=> ({type:r[0], label:r[1], sub:r[2], hay:(r[1] + ' ' + r[2] + ' ' + r[3]).toLowerCase(), text:r[3], go:r[4]})));
  const q = $('hubQ'), res = $('hubRes'); let hits = [], sel = -1;
  const mark = (s, terms)=>{ let h = esc(s); terms.forEach(t=>{ if(t.length < 2) return; h = h.replace(new RegExp('(' + esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return h; };
  function snippet(text, terms){
    if(!text) return ''; const low = text.toLowerCase(); let i = -1;
    for(const t of terms){ i = low.indexOf(t); if(i >= 0) break; }
    if(i < 0) return text.slice(0, 140);
    const a = Math.max(0, i - 50); return (a ? '…' : '') + text.slice(a, a + 160) + (a + 160 < text.length ? '…' : '');
  }
  function search(){
    const v = q.value.trim().toLowerCase(), terms = v.split(/\s+/).filter(Boolean);
    if(!terms.length){ res.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    const groups = {};
    IDX.forEach(e=>{ if(!terms.every(t=> e.hay.includes(t))) return; const L = e.label.toLowerCase();
      const s = (L === v ? 1000 : 0) + (L.startsWith(v) ? 300 : 0) + (L.includes(v) ? 100 : 0) + terms.filter(t=> L.includes(t)).length * 20;
      (groups[e.type] = groups[e.type] || []).push([s, e]); });
    hits = []; let html = '';
    ORDER.forEach(ty=>{ const g = groups[ty]; if(!g) return; g.sort((a, b)=> b[0] - a[0]);
      const max = ty === 'Card' ? 8 : 6, shown = g.slice(0, max);
      html += `<div class="hs-g">${TYPES[ty]} ${esc(ty)}${g.length > max ? ` · top ${max} of ${g.length}` : ''}</div>`;
      shown.forEach(([, e])=>{ const k = hits.push(e) - 1;
        html += `<div class="hs-i" role="option" id="hs-${k}" data-k="${k}" aria-selected="false">${e.c ? hub.thumb(e.c, 36) : `<span class="hs-ty">${TYPES[ty]}</span>`}<span><b>${mark(e.label, terms)}</b>`
          + `<small>${mark(e.type === 'Card' ? e.sub : (e.sub ? e.sub + ' — ' : '') + snippet(e.text, terms), terms)}</small></span></div>`; }); });
    res.innerHTML = html || '<div class="hs-none">Nothing found. Try fewer words.</div>';
    res.hidden = false; q.setAttribute('aria-expanded', 'true'); sel = hits.length ? 0 : -1; paint();
  }
  function paint(){ res.querySelectorAll('.hs-i').forEach(el=> el.setAttribute('aria-selected', String(+el.dataset.k === sel)));
    const cur = $('hs-' + sel); if(cur) cur.scrollIntoView({block:'nearest'}); q.setAttribute('aria-activedescendant', sel >= 0 ? 'hs-' + sel : ''); }
  function pick(k){ const e = hits[k]; if(!e) return; res.hidden = true; q.setAttribute('aria-expanded', 'false'); q.blur(); hub.go(e.go); }
  q.addEventListener('input', search);
  q.addEventListener('focus', ()=>{ if(q.value.trim()) search(); });
  q.addEventListener('keydown', e=>{
    if(e.key === 'ArrowDown'){ e.preventDefault(); if(hits.length){ sel = (sel + 1) % hits.length; paint(); } }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); if(hits.length){ sel = (sel - 1 + hits.length) % hits.length; paint(); } }
    else if(e.key === 'Enter'){ e.preventDefault(); pick(sel); }
    else if(e.key === 'Escape'){ res.hidden = true; q.setAttribute('aria-expanded', 'false'); }
  });
  res.addEventListener('mousedown', e=>{ const it = e.target.closest('.hs-i'); if(it){ e.preventDefault(); pick(+it.dataset.k); } });
  document.addEventListener('mousedown', e=>{ if(!e.target.closest('.hs')){ res.hidden = true; q.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', e=>{ if(e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !e.metaKey && !e.ctrlKey){ e.preventDefault(); q.focus(); q.select(); } });

  // ---------- theme toggle: auto -> light -> dark ----------
  const tb = $('hubTheme'), root = document.documentElement;
  const setTheme = t=>{ if(t === 'light' || t === 'dark') root.dataset.theme = t; else delete root.dataset.theme;
    tb.textContent = t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '🌓 Auto'; tb.title = 'Colour theme: ' + (t || 'auto'); try{ localStorage.setItem('hub.theme', t || 'auto'); }catch(e){} };
  setTheme(root.dataset.theme || 'auto');
  tb.addEventListener('click', ()=>{ const cur = root.dataset.theme || 'auto'; setTheme(cur === 'auto' ? 'light' : cur === 'light' ? 'dark' : 'auto'); });
})();
