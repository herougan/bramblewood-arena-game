// units_tab.js — the 🗂 Units by theme tab, inlined into .hub/index.html by tools/hub/build_hub.py after hub_app.js. Reads UT_DATA
// (canonical/unit-themes.json from tools/unit_themes.js) and CARDS (the Cards tab's thumbnails).
// 2026-10-19 (package UC; owner 08:49: "To move forward, let's separate the units thematically? Then we pick and choose, then do
// post-balancing — meaning we apply skills post-facto. Dangerous versions of a biome monster can come later in the game."): every
// creature card (live and pool) and the proposed later variants, filtered and grouped by biome, family, faction, map, rarity and
// status; each tile shows the base body (stats without skills) apart from the current skills, which are applied later. The owner
// picks units for a map (a checkbox per unit for the map being picked for); picks persist in the artifact's db (collection
// "unitPicks", doc id "<map>:<unit>", body {map, unit, picked, updatedAt}). Without db the picks last for this visit only: a note and
// "Copy JSON". The Post-balance queue lists the picked units whose stats or skills still need assigning; Claude works it with
// tools/hub/pull_unit_picks.md. Nothing here goes into browser storage: the picks live in the db or for this visit only.
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[c]);
  const hub = window.hub;
  if(!hub || typeof UT_DATA === 'undefined') return;
  const D = UT_DATA, V = D.vocab, UNITS = D.units;
  const BIO = {}; V.biomes.forEach(b=> BIO[b.id] = b);
  const FAM = {}; V.families.forEach(f=> FAM[f.id] = f);
  const FAC = {}; V.factions.forEach(f=> FAC[f.id] = f);
  const STG = {}; V.stages.forEach(s=> STG[s.id] = s);
  const TIER = {}; V.variantTiers.forEach(t=> TIER[t.id] = t);
  const MAP = {}; D.maps.forEach(m=> MAP[m.id] = m);
  const BYID = {}; UNITS.forEach(u=> BYID[u.id] = u);
  const CB = {}; (typeof CARDS !== 'undefined' ? CARDS.cards : []).forEach(c=> CB[c.id] = c);
  const SKL = {}; (typeof CARDS !== 'undefined' ? CARDS.skills : []).forEach(s=> SKL[s.key] = s);
  const LADDER = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary'];
  const RN = {starter:'Starter', common:'Common', uncommon:'Uncommon', rare:'Rare', veryrare:'Very Rare', superrare:'Super Rare', epic:'Epic', heroic:'Heroic', unique:'Unique', legendary:'Legendary'};
  const rarName = r=> RN[r] || (r || 'No rarity');
  // the maps a unit can be picked for: the road and its side maps (not the Tutorial, not the endless dungeons)
  const PICK_MAPS = D.maps.filter(m=> !['mtut', 'mm', 'mlb'].includes(m.id)).sort((a, b)=> (a.no ?? 99) - (b.no ?? 99) || (a.sub ? 1 : 0) - (b.sub ? 1 : 0) || a.name.localeCompare(b.name));
  const mapShort = id=>{ const m = MAP[id]; return m ? (m.sub ? m.name.replace(/^The /, '') : 'Map ' + (m.no ?? '·')) : id; }; // a side map by its name (two can share a number)
  const mapLabel = id=>{ const m = MAP[id]; return m ? 'Map ' + (m.no ?? '·') + (m.sub ? ' side' : '') + ' · ' + m.name : id; };
  const skillText = s=> s[0] === 'trigger' ? '⚡ ' + s[1] : ((SKL[s[0]] && SKL[s[0]].icon ? SKL[s[0]].icon + ' ' : '') + (SKL[s[0]] ? SKL[s[0]].label : s[0]) + (s[1] != null && s[1] !== '' ? ' ' + s[1] : ''));
  const onMap = (u, m)=> (u.maps.home || []).includes(m) || !!(u.maps.fights || {})[m];
  const mainMap = u=> (u.maps.home || [])[0] || Object.entries(u.maps.fights || {}).sort((a, b)=> b[1] - a[1])[0]?.[0] || '';
  UNITS.forEach(u=>{ u._hay = [u.name, u.id, u.family, u.sub, u.faction, (u.types || []).join(' '), u.biomes.map(b=> BIO[b] ? BIO[b].label : b).join(' '), FAC[u.faction] ? FAC[u.faction].label : '',
    u.skills.map(skillText).join(' '), u.variant ? (u.variant.tier + ' ' + (u.variant.of || '')) : ''].join(' ').toLowerCase(); });

  // ---------- state ----------
  const st = {q:'', biome:'*', fam:'*', fac:'*', map:'*', r:'*', status:'*', group:'biome', pickMap:'', only:false, view:'cat', ready:false, shown:120};
  const PAGE = 120;
  const picks = {}; // "<map>:<unit>" -> true (only picked ones are kept here)
  const timers = {}, chains = {}, busy = {};
  let db = null, mode = 'pending'; // pending | on | off | ro
  const docId = (m, u)=> (m + ':' + u).replace(/[^A-Za-z0-9_\-.~:@+]/g, '_');
  const isPicked = (m, u)=> !!picks[m + ':' + u];
  const picksFor = m=> UNITS.filter(u=> isPicked(m, u.id));
  const mapsPicked = u=> PICK_MAPS.filter(m=> isPicked(m.id, u.id)).map(m=> m.id);

  // What still needs assigning for a unit picked for map m (the post-balance step); [] = ready as it is.
  function needs(u, m){
    const out = [];
    if(u.status === 'proposed') out.push('a proposed ' + (TIER[u.variant.tier] ? TIER[u.variant.tier].prefix : u.variant.tier) + ' version: the body is a draft (' + (u.variant.of ? 'from ' + (BYID[u.variant.of] || {}).name : '') + '), no skills yet, not in cards.json');
    else if(u.status === 'pool') out.push('a pool card: place it (a source on this map) and measure it');
    if(u.status !== 'proposed' && !onMap(u, m)) out.push('new to ' + mapShort(m) + ': re-fit its stats for this stage' + (u.firstMap != null ? ' (it lives on Map ' + u.firstMap + ' now)' : ' (not on the road yet)'));
    if(u.status !== 'proposed' && !u.skills.length) out.push('no skills yet');
    return out;
  }

  // ---------- build ----------
  function build(){
    if(build.done) return; build.done = true;
    const host = $('utHost'); if(!host) return;
    const C = D.counts;
    host.innerHTML = `<div class="dec-head"><h2>Units by theme</h2><p>Every creature card, sorted by where it lives (biome), what it is (family) and who it runs with (faction): ${C.live} live, ${C.pool} in the pool and ${C.proposed} proposed later versions ("Dire" / "Elder"). Each tile shows its <b>base body</b>, the stats before skills, apart from its current skills: <b>skills are applied later</b>, in the post-balance step. Pick units for a map; the queue lists what still needs stats or skills.</p></div>
      <div class="sc-status" id="utStatus" role="status"></div>
      <div class="ut-bar" role="group" aria-label="View"><div class="dec-seg" id="utView"><button type="button" data-v="cat" aria-pressed="true">🗂 Catalogue</button><button type="button" data-v="queue" aria-pressed="false">🧰 Post-balance queue <b id="utQn"></b></button></div>
        <label class="ut-pick">Picking for <select id="utPick" aria-label="The map you are picking units for"></select></label></div>
      <div class="ut-maps" id="utMaps" role="group" aria-label="Picked per map"></div>
      <div id="utCat"><div class="cd-bar ut-filters">
        <input type="search" id="utQ" placeholder="Name, type, skill…" aria-label="Search units" autocomplete="off">
        <select id="utB" aria-label="Biome"></select><select id="utF" aria-label="Family"></select><select id="utC" aria-label="Faction"></select>
        <select id="utM" aria-label="Map (earned or fights there)"></select><select id="utR" aria-label="Rarity"></select><select id="utG" aria-label="Group by"></select>
        <div class="dec-seg" id="utS" role="group" aria-label="Status"></div>
        <label class="cd-chk"><input type="checkbox" id="utOnly"> picked for this map only</label></div>
        <p class="cd-count" id="utN" aria-live="polite"></p><div id="utGrid"></div><p class="ut-more"><button type="button" class="btn" id="utMore" hidden>Show more</button></p></div>
      <div id="utQueue" hidden></div>`;
    const counts = f=>{ const n = {}; UNITS.forEach(u=> [].concat(f(u)).forEach(v=>{ if(v != null && v !== '') n[v] = (n[v] || 0) + 1; })); return n; };
    const nb = counts(u=> u.biomes[0]), nf = counts(u=> u.family), nc = counts(u=> u.faction), nm = counts(u=> Object.keys(u.maps.fights || {}).concat(u.maps.home || []).filter((v, i, a)=> a.indexOf(v) === i)), nr = counts(u=> u.rarity || 'none');
    const opt = (v, l)=> `<option value="${esc(v)}">${esc(l)}</option>`;
    $('utB').innerHTML = opt('*', 'Any biome') + V.biomes.filter(b=> nb[b.id]).map(b=> opt(b.id, `${b.icon} ${b.label} (${nb[b.id]})`)).join('');
    $('utF').innerHTML = opt('*', 'Any family') + V.families.filter(f=> nf[f.id]).map(f=> opt(f.id, `${f.icon} ${f.label} (${nf[f.id]})`)).join('');
    $('utC').innerHTML = opt('*', 'Any faction') + V.factions.filter(f=> nc[f.id]).map(f=> opt(f.id, `${f.icon} ${f.label} (${nc[f.id]})`)).join('') + V.factions.filter(f=> !nc[f.id]).map(f=> opt(f.id, `${f.icon} ${f.label} (none yet)`)).join('');
    $('utM').innerHTML = opt('*', 'Any map') + PICK_MAPS.filter(m=> nm[m.id]).map(m=> opt(m.id, `${mapLabel(m.id)} (${nm[m.id]})`)).join('') + opt('-', 'On no map');
    $('utR').innerHTML = opt('*', 'Any rarity') + LADDER.concat(['none']).filter(r=> nr[r]).map(r=> opt(r, `${r === 'none' ? 'No rarity' : rarName(r)} (${nr[r]})`)).join('');
    $('utG').innerHTML = [['biome', 'Group: biome'], ['family', 'Group: family'], ['faction', 'Group: faction'], ['map', 'Group: map'], ['rarity', 'Group: rarity'], ['stage', 'Group: road stage'], ['none', 'No groups']].map(([v, l])=> opt(v, l)).join('');
    const ns = counts(u=> u.status);
    $('utS').innerHTML = [['*', 'All', UNITS.length], ['live', 'Live', ns.live], ['pool', 'Pool', ns.pool], ['proposed', 'Proposed', ns.proposed]].map(([v, l, n])=> `<button type="button" data-s="${v}" aria-pressed="${v === st.status}">${l} <b>${n || 0}</b></button>`).join('');
    $('utPick').innerHTML = PICK_MAPS.map(m=> opt(m.id, mapLabel(m.id))).join('');
    st.pickMap = PICK_MAPS[0] ? PICK_MAPS[0].id : '';
    const bind = (id, key, ev)=> $(id).addEventListener(ev || 'change', e=>{ st[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; if(key === 'q') st.q = st.q.trim().toLowerCase(); st.shown = PAGE; render(); });
    bind('utQ', 'q', 'input'); bind('utB', 'biome'); bind('utF', 'fam'); bind('utC', 'fac'); bind('utM', 'map'); bind('utR', 'r'); bind('utG', 'group'); bind('utOnly', 'only');
    $('utS').addEventListener('click', e=>{ const b = e.target.closest('button[data-s]'); if(!b) return; st.status = b.dataset.s; $('utS').querySelectorAll('button').forEach(x=> x.setAttribute('aria-pressed', String(x === b))); st.shown = PAGE; render(); });
    $('utView').addEventListener('click', e=>{ const b = e.target.closest('button[data-v]'); if(!b) return; st.view = b.dataset.v; $('utView').querySelectorAll('button').forEach(x=> x.setAttribute('aria-pressed', String(x === b))); renderView(); });
    $('utPick').addEventListener('change', e=>{ setPickMap(e.target.value); });
    $('utMaps').addEventListener('click', e=>{ const b = e.target.closest('button[data-m]'); if(b) setPickMap(b.dataset.m); });
    $('utMore').addEventListener('click', ()=>{ st.shown += PAGE; render(); });
    $('utGrid').addEventListener('change', e=>{ const cb = e.target.closest('input[data-pick]'); if(cb) togglePick(st.pickMap, cb.dataset.pick, cb.checked); });
    $('utQueue').addEventListener('change', e=>{ const cb = e.target.closest('input[data-qpick]'); if(cb){ const [m, u] = cb.dataset.qpick.split('|'); togglePick(m, u, cb.checked); } });
    $('utQueue').addEventListener('click', e=>{ const r = e.target.closest('input[data-ready]'); if(r){ st.ready = r.checked; renderQueue(); } });
    $('utStatus').addEventListener('click', e=>{ const b = e.target.closest('button[data-copy]'); if(b) copyJSON(); });
    renderStatus(); renderMaps(); renderView();
    connect();
  }
  function setPickMap(m){ st.pickMap = m; $('utPick').value = m; renderMaps(); if(st.view === 'cat') render(); else renderQueue(); }

  // ---------- picks ----------
  function togglePick(m, u, on){
    const key = m + ':' + u; if(on) picks[key] = true; else delete picks[key];
    renderMaps(); renderQn(); if(st.view === 'queue') renderQueue(); else markTile(u);
    if(mode === 'on') save(m, u);
  }
  function markTile(u){ const t = document.querySelector(`#utGrid .ut-tile[data-id="${CSS.escape(u)}"]`); if(!t) return;
    const un = BYID[u]; t.classList.toggle('is-picked', isPicked(st.pickMap, u)); const o = t.querySelector('.ut-also'); if(o) o.innerHTML = alsoHTML(un); }
  async function connect(){
    let d = null;
    try{ d = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('db') : null; }catch(e){ d = null; }
    if(!d){ mode = 'off'; renderStatus(); return; }
    db = d; mode = 'on'; renderStatus();
    try{
      db.collection('unitPicks').onSnapshot(snap=>{
        const seen = {};
        snap.docs.forEach(doc=>{ const x = doc.data() || {}; if(typeof x.map !== 'string' || typeof x.unit !== 'string' || !MAP[x.map] || !BYID[x.unit]) return; seen[x.map + ':' + x.unit] = x.picked === true; });
        // the db is the source of truth for every pick without a write of ours still on its way
        const keys = new Set(Object.keys(picks).concat(Object.keys(seen)));
        keys.forEach(k=>{ if(timers[k] || busy[k]) return; if(seen[k]) picks[k] = true; else delete picks[k]; });
        renderMaps(); renderQn(); renderStatus(); if(st.view === 'queue') renderQueue(); else render();
      }, err=>{ mode = err && err.code === 'revoked' ? 'off' : 'ro'; renderStatus(); });
    }catch(e){ mode = 'off'; renderStatus(); }
  }
  function save(m, u){
    const key = m + ':' + u; clearTimeout(timers[key]);
    timers[key] = setTimeout(()=>{ delete timers[key]; busy[key] = true;
      chains[key] = (chains[key] || Promise.resolve()).then(()=> db.collection('unitPicks').doc(docId(m, u)).set({map: m, unit: u, picked: !!picks[key], updatedAt: new Date().toISOString()}))
        .then(()=>{ delete busy[key]; renderStatus('Saved'); }, err=>{ delete busy[key];
          if(err && (err.code === 'invalid_argument' || err.code === 'revoked' || err.code === 'not_granted')){ mode = 'ro'; renderStatus(); }
          else renderStatus('Not saved (' + esc(err && err.code || 'error') + '): tick it again'); });
    }, 300);
  }

  // ---------- status / copy ----------
  function renderStatus(flash){
    const el = $('utStatus'); if(!el) return; const n = Object.keys(picks).length;
    const msg = mode === 'pending' ? 'Connecting to the hub\'s saved picks…'
      : mode === 'on' ? `Picks save to this hub for Claude's post-balance step (${n} picked${flash ? ' · ' + flash : ''}).`
      : `<b>Picks can't be saved here.</b> They last for this visit only; ${n ? n + ' picked · ' : ''}use Copy JSON and paste it to Claude.`;
    el.className = 'sc-status ' + (mode === 'on' ? 'is-on' : mode === 'pending' ? '' : 'is-off');
    el.innerHTML = `<span>${msg}</span><button type="button" class="btn" data-copy>📋 Copy JSON</button><span class="sc-copied" id="utCopied" aria-live="polite"></span>`;
  }
  function picksJSON(){
    const now = new Date().toISOString(), list = Object.keys(picks).map(k=>{ const i = k.indexOf(':'); return {map: k.slice(0, i), unit: k.slice(i + 1), picked: true, updatedAt: now}; })
      .sort((a, b)=> (MAP[a.map].no ?? 99) - (MAP[b.map].no ?? 99) || a.map.localeCompare(b.map) || a.unit.localeCompare(b.unit));
    const queue = list.map(p=> ({map: p.map, unit: p.unit, needs: needs(BYID[p.unit], p.map)})).filter(x=> x.needs.length);
    return JSON.stringify({collection: 'unitPicks', source: 'canonical/unit-themes.json ' + D.generated, picks: list, queue}, null, 1) + '\n';
  }
  function copyJSON(){
    const text = picksJSON(), out = $('utCopied');
    const fallback = ()=>{ if(out) out.textContent = 'Copy blocked here: select the text below and copy it.'; let ta = $('utJSON');
      if(!ta){ ta = document.createElement('textarea'); ta.id = 'utJSON'; ta.className = 'sc-json'; ta.readOnly = true; ta.setAttribute('aria-label', 'Unit picks as JSON'); $('utStatus').after(ta); }
      ta.value = text; ta.focus(); ta.select(); };
    try{ if(!navigator.clipboard || !navigator.clipboard.writeText){ fallback(); return; }
      navigator.clipboard.writeText(text).then(()=>{ if(out) out.textContent = 'Copied ' + Object.keys(picks).length + ' pick(s) and the queue.'; }, fallback);
    }catch(e){ fallback(); }
  }

  // ---------- the per-map strip ----------
  function renderMaps(){
    const el = $('utMaps'); if(!el) return;
    el.innerHTML = PICK_MAPS.map(m=>{ const p = picksFor(m.id), q = p.filter(u=> needs(u, m.id).length).length, on = m.id === st.pickMap;
      return `<button type="button" class="ut-mc${on ? ' is-on' : ''}${p.length ? ' has' : ''}" data-m="${esc(m.id)}" aria-pressed="${on}" title="${esc(mapLabel(m.id))}">`
        + `<span>${esc(m.sub ? 'Map ' + (m.no ?? '·') + ' side' : mapShort(m.id))}</span>${m.sub ? `<em>${esc(mapShort(m.id))}</em>` : ''}<b>${p.length}</b>${q ? `<small>${q} to do</small>` : ''}</button>`; }).join('');
    const cur = el.querySelector('.is-on'); if(cur && cur.scrollIntoView && build.done) cur.scrollIntoView({inline:'nearest', block:'nearest'});
    renderQn();
  }
  function renderQn(){ const n = queueRows(false).length, el = $('utQn'); if(el) el.textContent = n; }

  // ---------- catalogue ----------
  function filtered(){
    const terms = st.q.split(/\s+/).filter(Boolean);
    return UNITS.filter(u=> (st.status === '*' || u.status === st.status) && (st.biome === '*' || u.biomes.includes(st.biome)) && (st.fam === '*' || u.family === st.fam)
      && (st.fac === '*' || u.faction === st.fac) && (st.r === '*' || (u.rarity || 'none') === st.r)
      && (st.map === '*' || (st.map === '-' ? !(u.maps.home || []).length && !Object.keys(u.maps.fights || {}).length : onMap(u, st.map)))
      && (!st.only || isPicked(st.pickMap, u.id)) && terms.every(t=> u._hay.includes(t)));
  }
  function groupOf(u){
    switch(st.group){
      case 'biome': { const b = BIO[u.biomes[0]]; return b ? [V.biomes.indexOf(b), b.icon + ' ' + b.label] : [99, 'No biome']; }
      case 'family': { const f = FAM[u.family]; return f ? [V.families.indexOf(f), f.icon + ' ' + f.label] : [99, 'No family']; }
      case 'faction': { const f = FAC[u.faction]; return f ? [V.factions.indexOf(f), f.icon + ' ' + f.label] : [99, 'No faction']; }
      case 'map': { const m = mainMap(u); return m && MAP[m] ? [PICK_MAPS.findIndex(x=> x.id === m) + 1 || 98, mapLabel(m)] : [999, 'On no map yet']; }
      case 'rarity': { const i = LADDER.indexOf(u.rarity); return [i < 0 ? 99 : i, rarName(u.rarity)]; }
      case 'stage': return u.stage ? [u.stage, 'Stage ' + u.stage + ' · ' + STG[u.stage].label + ' (Maps ' + STG[u.stage].maps.join('–') + ')'] : [9, 'Not on the road yet'];
      default: return [0, ''];
    }
  }
  const sortKey = u=> [u.stage || 9, LADDER.indexOf(u.rarity), u.status === 'proposed' ? 1 : 0];
  function render(){
    if(st.view !== 'cat') return;
    const list = filtered().map(u=> ({u, g: groupOf(u)}));
    list.sort((a, b)=> a.g[0] - b.g[0] || a.g[1].localeCompare(b.g[1]) || (sortKey(a.u)[0] - sortKey(b.u)[0]) || (sortKey(a.u)[1] - sortKey(b.u)[1]) || (sortKey(a.u)[2] - sortKey(b.u)[2]) || a.u.name.localeCompare(b.u.name));
    const gcount = {}; list.forEach(x=> gcount[x.g[1]] = (gcount[x.g[1]] || 0) + 1);
    const shown = list.slice(0, st.shown); let html = '', cur = null;
    shown.forEach(x=>{
      if(st.group !== 'none' && x.g[1] !== cur){ if(cur !== null) html += '</div>'; cur = x.g[1]; html += `<h3 class="ut-gh">${esc(cur)} <small>${gcount[cur]}</small></h3><div class="ut-grid">`; }
      else if(cur === null){ cur = ''; html += '<div class="ut-grid">'; }
      html += tile(x.u); });
    if(cur !== null) html += '</div>';
    $('utGrid').innerHTML = html || '<p class="dec-empty">Nothing matches. Clear a filter or the search.</p>';
    $('utN').textContent = `${list.length} unit${list.length === 1 ? '' : 's'}${list.length > shown.length ? ` · showing ${shown.length}` : ''} · ticking picks for ${mapLabel(st.pickMap)}`;
    const more = $('utMore'); more.hidden = list.length <= shown.length; more.textContent = `Show ${Math.min(PAGE, list.length - shown.length)} more (${list.length - shown.length} left)`;
  }
  function thumb(u){
    const c = CB[u.id] || (u.variant && u.variant.kind === 'proposed' ? CB[u.variant.of] : null);
    if(c && hub.thumb) return hub.thumb(c, 48);
    return `<span class="th" style="--s:48px" aria-hidden="true">${esc(u.icon || '🃏')}</span>`;
  }
  function alsoHTML(u){ const other = mapsPicked(u).filter(m=> m !== st.pickMap); return other.length ? 'also picked for ' + other.map(mapShort).map(esc).join(', ') : ''; }
  function tile(u){
    const b = u.body, picked = isPicked(st.pickMap, u.id), v = u.variant;
    const badge = u.status === 'proposed' ? '<span class="ut-st s-proposed">Proposed</span>' : u.status === 'pool' ? '<span class="ut-st s-pool">Pool</span>' : '<span class="ut-st s-live">Live</span>';
    const extra = (u.token ? ' <span class="chip">token</span>' : '') + (u.enemyOnly ? ' <span class="chip" title="Unattainable: only enemies field it for now">enemy only</span>' : '') + (u.hidden ? ' <span class="chip">hidden</span>' : '')
      + (u.structure ? ' <span class="chip">structure</span>' : '') + (u.manual ? ` <span class="chip ut-hand" title="${esc('Hand-tagged: ' + u.manual.join(', ') + (u.why.manual ? ' · ' + u.why.manual : ''))}">✋ checked</span>` : '');
    const bios = u.biomes.map((x, i)=> BIO[x] ? `<span class="ut-tag${i ? '' : ' is-main'}" title="${esc(i ? 'Also: ' : 'Main biome: ')}${esc(BIO[x].label)}">${BIO[x].icon} ${esc(BIO[x].label)}</span>` : '').join('');
    const fam = FAM[u.family], fac = FAC[u.faction];
    const tags = bios + (fam ? `<span class="ut-tag" title="Family${u.sub ? ': ' + esc(u.sub) : ''}">${fam.icon} ${esc(fam.label)}${u.sub && u.sub.toLowerCase() !== fam.label.toLowerCase() ? ' <small>' + esc(u.sub) + '</small>' : ''}</span>` : '')
      + (fac ? `<span class="ut-tag" title="Faction / society">${fac.icon} ${esc(fac.label.split(' (')[0])}</span>` : '')
      + `<span class="ut-tag" title="Size">${esc(u.size)}</span>` + (u.stage ? `<span class="ut-tag" title="Road stage: where it first lives">${esc(STG[u.stage].label)} · Map ${u.firstMap}</span>` : '<span class="ut-tag">not on the road</span>');
    const body = `<div class="ut-body" title="Base body: its stats before any skill"><small>Base body</small><span>🪵${b.cost}</span><span>⏳${b.wait}</span><span>⚔${b.attack}</span><span>❤${b.health}</span>`
      + (b.dmg && b.dmg !== 'physical' ? `<span title="Damage type">${esc(b.dmg)}</span>` : '') + ((b.resist || []).length ? `<span title="Resists">🛡 ${esc(b.resist.join(', '))}</span>` : '') + '</div>';
    let skills;
    if(u.status === 'proposed') skills = `<div class="ut-sk is-todo"><small>Skills · applied later</small>to assign${v && v.baseSkills && v.baseSkills.length ? `&nbsp;<span class="ut-was">(${esc(BYID[v.of] ? BYID[v.of].name : '')} has ${esc(v.baseSkills.map(skillText).join(' · '))})</span>` : ''}</div>`;
    else skills = `<div class="ut-sk${u.skills.length ? '' : ' is-todo'}"><small>Skills · applied later</small>${u.skills.length ? esc(u.skills.map(skillText).join(' · ')) : 'none yet'}</div>`;
    let vline = '';
    if(v && v.kind === 'proposed'){ const base = BYID[v.of];
      vline = `<p class="ut-var">${esc(TIER[v.tier].prefix)} version of <b>${esc(base ? base.name : v.of)}</b> for ${esc(mapLabel(v.map))}: Atk ×${v.mult.attack}, HP ×${v.mult.health}, Lumber +${v.lumber}, Wait +${v.wait}, rarity +${v.rarityStep}${v.fitted ? ', fitted under budget v3' : ''} (N ${v.N}; 2A+H ${v.x1}).</p>`; }
    else if(v && v.kind === 'existing'){ const base = v.of && BYID[v.of]; vline = `<p class="ut-var">Already a${v.tier === 'elder' || v.tier === 'ancient' ? 'n' : ''} ${esc(TIER[v.tier] ? TIER[v.tier].id : v.tier)} version${base ? ' of <b>' + esc(base.name) + '</b>' : ' (no earlier card yet)'}.</p>`; }
    const home = (u.maps.home || []).map(mapShort), fights = Object.keys(u.maps.fights || {}).filter(m=> MAP[m]);
    const where = `<p class="ut-where">${home.length ? (u.status === 'proposed' ? 'Proposed for ' : u.status === 'pool' ? 'Made for ' : 'Earned on ') + esc(home.join(', ')) : u.source ? esc(({pack:'From packs', base:'A base card', raid:'A raid drop', nest:'From the Nest', secret:'A secret find'})[u.source] || u.source) : 'No source yet'}`
      + (fights.length ? ` · fights on ${fights.length > 4 ? fights.length + ' maps' : esc(fights.map(mapShort).join(', '))}` : '') + '</p>';
    return `<article class="ut-tile r-${esc(u.rarity || 'none')}${picked ? ' is-picked' : ''} st-${u.status}" data-id="${esc(u.id)}">`
      + `<div class="ut-top">${thumb(u)}<div class="ut-name"><b>${esc(u.name)}</b><span>${badge} <span class="rb">${esc(rarName(u.rarity))}</span>${extra}</span></div></div>`
      + `<div class="ut-tags">${tags}</div>${body}${skills}${vline}${where}`
      + `<label class="ut-cb"><input type="checkbox" data-pick="${esc(u.id)}"${picked ? ' checked' : ''}> Pick for ${esc(mapShort(st.pickMap))}</label><p class="ut-also">${alsoHTML(u)}</p></article>`;
  }

  // ---------- post-balance queue ----------
  function queueRows(withReady){
    const out = [];
    PICK_MAPS.forEach(m=> picksFor(m.id).forEach(u=>{ const n = needs(u, m.id); if(n.length || withReady) out.push({m: m.id, u, n}); }));
    return out;
  }
  function renderQueue(){
    const el = $('utQueue'); if(!el) return;
    const rows = queueRows(st.ready), byMap = {};
    rows.forEach(r=> (byMap[r.m] = byMap[r.m] || []).push(r));
    const total = Object.keys(picks).length, todo = queueRows(false).length;
    let html = `<div class="ut-qhead"><p>${total ? `${total} pick${total === 1 ? '' : 's'}; <b>${todo}</b> still need${todo === 1 ? 's' : ''} stats or skills assigned.` : 'Nothing picked yet: tick units in the catalogue.'} `
      + `Claude works this list with <code>tools/hub/pull_unit_picks.md</code>: it reads the picks, fits each unit's stats for its map's stage and applies its skills.</p>`
      + `<label class="cd-chk"><input type="checkbox" data-ready${st.ready ? ' checked' : ''}> show picks that are ready as they are</label></div>`;
    PICK_MAPS.forEach(m=>{ const list = byMap[m.id]; if(!list) return;
      html += `<section class="ut-qmap"><h3>${esc(mapLabel(m.id))} <small>${list.length}</small></h3><div class="bal-wrap"><table class="bal-t ut-qt"><thead><tr><th>Unit</th><th>Base body</th><th>Skills now</th><th>Still to do</th><th>Picked</th></tr></thead><tbody>`
        + list.map(({u, n})=> `<tr class="${n.length ? '' : 'is-ready'}"><td><b>${esc(u.icon)} ${esc(u.name)}</b> <small>${esc(u.status)} · ${esc(rarName(u.rarity))}${u.biomes[0] && BIO[u.biomes[0]] ? ' · ' + BIO[u.biomes[0]].icon : ''}${FAM[u.family] ? ' ' + FAM[u.family].icon : ''}</small></td>`
          + `<td class="num">🪵${u.body.cost} ⏳${u.body.wait} ⚔${u.body.attack} ❤${u.body.health}</td><td>${u.skills.length ? esc(u.skills.map(skillText).join(' · ')) : '<i>none</i>'}</td>`
          + `<td>${n.length ? '<ul>' + n.map(x=> `<li>${esc(x)}</li>`).join('') + '</ul>' : 'ready as it is'}</td>`
          + `<td><label class="ut-cb"><input type="checkbox" data-qpick="${esc(m.id + '|' + u.id)}" checked aria-label="Picked for ${esc(mapShort(m.id))}: ${esc(u.name)}"></label></td></tr>`).join('')
        + '</tbody></table></div></section>'; });
    if(!rows.length && total) html += '<p class="dec-empty">Every pick is ready as it is.</p>';
    el.innerHTML = html;
  }
  function renderView(){ $('utCat').hidden = st.view !== 'cat'; $('utQueue').hidden = st.view !== 'queue'; if(st.view === 'cat') render(); else renderQueue(); }
  hub.onShow.units = build;
})();
