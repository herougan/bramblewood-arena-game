// chips_tab.js — the 🏷️ Chips & FX tab, inlined into .hub/index.html by tools/hub/build_hub.py after hub_app.js. Reads CH_DATA,
// which the build copies from docs/chips-inventory.json (written by node tools/hub/chips_inventory.js from arena_app.js,
// arena_template.html and canonical/cards.json: the list is never typed by hand).
// 2026-10-21 (package HC, owner: "Status chips: in Master Hub, let me know all the status chips and context chips (e.g. flying)
// available and context fx (like blind) available. Maybe we can drop some of them."): a filterable, sortable list of every status
// chip, context chip and context FX, near-duplicates grouped, and a Keep / Drop / Merge choice plus a note on each row.
// The marks persist in the artifact's db (collection "chipReview", one doc per marked entry, doc id = the entry id, body
// {id, kind, name, mark, into, note, updatedAt}; an entry with no mark and no note has no doc). Without db (a copy outside
// claude.ai, or the capability not granted) the marks last for this visit and a "Copy JSON" button hands them to Claude.
// Claude reads them back with tools/hub/pull_chip_review.md. Nothing goes into browser storage.
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const hub = window.hub;
  if(!hub || typeof CH_DATA === 'undefined' || !CH_DATA) return;
  const D = CH_DATA, E = D.entries || [], BY = {}, GR = {};
  E.forEach(e=> BY[e.id] = e); (D.groups || []).forEach(g=> GR[g.id] = g);
  const KIND = {status: {label: 'Status chip', short: 'Status', tip: 'Shown on a unit in play: the pills along the top of a board card and the live-status lines'},
    chip: {label: 'Context chip', short: 'Context chip', tip: 'A skill or ability mark on the card face (Flying, Tide, Poison ...)'},
    fx: {label: 'Context FX', short: 'Context FX', tip: 'A visual state on a unit or the battlefield (tint, overlay, plates, darkness ...)'}};
  const WHERE = {hand: 'Hand', board: 'Board', raid: 'Raid', codex: 'Codex'};
  const REASON = {sameIcon: ['≈ same icon', 'Different things draw the same picture'], similarMeaning: ['≈ same meaning', 'Their one-line meanings share most of their words'], pair: ['pair', 'The same word in its places: what gives it, what it is, how it looks']};
  const MARKS = [['keep', 'Keep'], ['drop', 'Drop'], ['merge', 'Merge']];
  const st = {q: '', kind: '*', mark: '*', dup: false, zero: false, group: '', sort: 'kind', dir: 1, open: {}};
  const marks = {};            // id -> {mark, into, note}
  const timers = {}, chains = {}, busy = {};
  let db = null, mode = 'pending', built = false; // pending | on | off | ro
  const docId = id=> String(id).replace(/[^A-Za-z0-9_\-.~:@+]/g, '_');
  const mk = id=> marks[id] || {mark: '', into: '', note: ''};
  const isDup = e=> (e.groups || []).some(g=> GR[g] && GR[g].reason !== 'pair');
  const dupReasons = e=> (e.groups || []).map(g=> GR[g]).filter(g=> g && g.reason !== 'pair');
  const hay = e=> (e._hay || (e._hay = [e.name, e.key, e.icon, e.altIcon, e.meaning, (e.causedBy || []).join(' '), (e.source || []).join(' '), e.kind, (KIND[e.kind] || {}).label, (e.examples || []).join(' ')].join(' ').toLowerCase()));
  const cardsTxt = e=> e.cards == null ? '–' : String(e.cards);

  // ---------- build ----------
  function build(){
    if(built) return; built = true;
    const host = $('chHost'); if(!host) return;
    const n = k=> E.filter(e=> e.kind === k).length;
    host.innerHTML = `
      <div class="dec-head"><h2>Chips &amp; FX</h2>
        <p id="chLead"></p></div>
      <div class="sc-status" id="chStatus" role="status"></div>
      <div class="ch-bar">
        <input type="search" id="chQ" placeholder="Search name, icon, meaning, skill, code…" aria-label="Search chips and effects" autocomplete="off">
        <div class="dec-seg" role="group" aria-label="Kind" id="chKind">
          <button type="button" data-k="*" aria-pressed="true">All <b>${E.length}</b></button>
          ${['status', 'chip', 'fx'].map(k=> `<button type="button" data-k="${k}" aria-pressed="false" title="${esc(KIND[k].tip)}">${esc(KIND[k].short)} <b>${n(k)}</b></button>`).join('')}
        </div>
      </div>
      <div class="ch-bar">
        <div class="dec-seg" role="group" aria-label="Decision" id="chMark">
          <button type="button" data-m="*" aria-pressed="true">Any mark</button><button type="button" data-m="-" aria-pressed="false">Unmarked <b id="chcNone"></b></button>
          <button type="button" data-m="keep" aria-pressed="false">Keep <b id="chcKeep"></b></button><button type="button" data-m="drop" aria-pressed="false">Drop <b id="chcDrop"></b></button><button type="button" data-m="merge" aria-pressed="false">Merge <b id="chcMerge"></b></button>
        </div>
        <label class="ch-chk"><input type="checkbox" id="chDup"> near-duplicates only</label>
        <label class="ch-chk"><input type="checkbox" id="chZero"> no card has it</label>
        <label class="ch-sort">Sort <select id="chSort" aria-label="Sort by">
          <option value="kind">Kind, then name</option><option value="name">Name</option><option value="cards-">Cards: most first</option><option value="cards+">Cards: fewest first</option>
          <option value="group">Near-duplicates together</option><option value="mark">Decision</option></select></label>
      </div>
      <p class="ch-count" id="chCount" aria-live="polite"></p>
      <div id="chGroupBanner"></div>
      <div class="ch-head" aria-hidden="true"><button type="button" data-s="name">Name</button><span>What it means</span><span>Shows on</span><button type="button" data-s="cards-">Cards</button><span>Decision</span></div>
      <div class="ch-list" id="chList"></div>`;
    $('chLead').innerHTML = `${n('status')} status chips, ${n('chip')} context chips and ${n('fx')} context FX, read from the game's own code (${esc(D.generated)}, source ${esc(D.sourceHash)}) with their card counts from <code>canonical/cards.json</code> (${D.cardCount} cards). `
      + `Mark each one <b>Keep</b>, <b>Drop</b> or <b>Merge</b> and add a note; your marks save to this hub for Claude. Rows that draw the same picture or say nearly the same thing are grouped (<span class="ch-g">≈</span>). `
      + `<details class="ch-scope"><summary>What is counted</summary><span class="ch-fine">${esc(D.scope)} A card "has" a status when it carries a skill (or trigger action) whose name the status word matches; statuses that only fields, weather or other statuses give show 0.</span></details>`;
    $('chQ').addEventListener('input', e=>{ st.q = e.target.value.trim().toLowerCase(); render(); });
    $('chKind').addEventListener('click', e=>{ const b = e.target.closest('button[data-k]'); if(!b) return; st.kind = b.dataset.k; seg('chKind', b); render(); });
    $('chMark').addEventListener('click', e=>{ const b = e.target.closest('button[data-m]'); if(!b) return; st.mark = b.dataset.m; seg('chMark', b); render(); });
    $('chDup').addEventListener('change', e=>{ st.dup = e.target.checked; render(); });
    $('chZero').addEventListener('change', e=>{ st.zero = e.target.checked; render(); });
    $('chSort').addEventListener('change', e=>{ setSort(e.target.value); render(); });
    host.querySelector('.ch-head').addEventListener('click', e=>{ const b = e.target.closest('button[data-s]'); if(!b) return; const v = b.dataset.s; const cur = st.sort;
      setSort(v === 'name' ? (cur === 'name' ? 'kind' : 'name') : (cur === 'cards-' ? 'cards+' : 'cards-')); $('chSort').value = st.sort; render(); });
    $('chGroupBanner').addEventListener('click', e=>{ if(e.target.closest('[data-cleargroup]')){ st.group = ''; render(); } });
    $('chList').addEventListener('click', onClick);
    $('chList').addEventListener('input', onInput);
    $('chStatus').addEventListener('click', e=>{ if(e.target.closest('[data-copy]')) copyJSON(); });
    connect(); render();
  }
  function seg(id, btn){ $(id).querySelectorAll('button').forEach(b=> b.setAttribute('aria-pressed', String(b === btn))); }
  function setSort(v){ st.sort = v; }

  // ---------- list ----------
  function filtered(){
    const terms = st.q.split(/\s+/).filter(Boolean);
    const g = st.group && GR[st.group] ? new Set(GR[st.group].members) : null;
    return E.filter(e=> (st.kind === '*' || e.kind === st.kind) && (!g || g.has(e.id))
      && (st.mark === '*' || (st.mark === '-' ? !mk(e.id).mark : mk(e.id).mark === st.mark))
      && (!st.dup || isDup(e)) && (!st.zero || e.cards === 0) && terms.every(t=> hay(e).includes(t) || (mk(e.id).note || '').toLowerCase().includes(t)));
  }
  const KORD = {status: 0, chip: 1, fx: 2};
  function sorted(list){
    const nm = (a, b)=> a.name.localeCompare(b.name), s = st.sort;
    const firstG = e=> { const g = (e.groups || []).map(x=> GR[x]).filter(x=> x && x.reason !== 'pair')[0]; return g ? parseInt(g.id.slice(1), 10) : 9999; };
    const mrank = e=> ({drop: 0, merge: 1, keep: 2, '': 3})[mk(e.id).mark];
    list.sort((a, b)=> s === 'name' ? nm(a, b) : s === 'cards-' ? (b.cards == null ? -1 : b.cards) - (a.cards == null ? -1 : a.cards) || nm(a, b) : s === 'cards+' ? (a.cards == null ? 1e9 : a.cards) - (b.cards == null ? 1e9 : b.cards) || nm(a, b)
      : s === 'group' ? firstG(a) - firstG(b) || KORD[a.kind] - KORD[b.kind] || nm(a, b) : s === 'mark' ? mrank(a) - mrank(b) || KORD[a.kind] - KORD[b.kind] || nm(a, b) : KORD[a.kind] - KORD[b.kind] || nm(a, b));
    return list;
  }
  function iconCell(e){
    if(e.icon) return `<span class="ch-ic" aria-hidden="true">${esc(e.icon)}</span>`;
    if(e.altIcon) return `<span class="ch-ic is-alt" title="No chip of its own: this is the glyph of its look or its skill" aria-hidden="true">${esc(e.altIcon)}</span>`;
    if(e.color) return `<span class="ch-ic ch-sw" style="--sw:${esc(e.color)}" title="Shown only as a coloured word" aria-hidden="true"></span>`;
    return `<span class="ch-ic is-none" title="No picture" aria-hidden="true">·</span>`;
  }
  function rowHTML(e){
    const m = mk(e.id), open = !!st.open[e.id];
    const badges = [];
    dupReasons(e).forEach(g=> badges.push(`<button type="button" class="ch-badge is-dup" data-g="${esc(g.id)}" title="${esc(REASON[g.reason][1] + ' (' + g.members.length + '). Tap to see the group')}">${esc(REASON[g.reason][0])} ${esc(g.id)}</button>`));
    (e.groups || []).map(x=> GR[x]).filter(g=> g && g.reason === 'pair').slice(0, 1).forEach(g=> badges.push(`<button type="button" class="ch-badge is-pair" data-g="${esc(g.id)}" title="${esc(REASON.pair[1] + ' (' + g.members.length + '). Tap to see them')}">pair ${esc(g.id)}</button>`));
    if(e.retired) badges.push('<span class="ch-badge is-warn" title="The skill is retired in the registry">retired</span>');
    if(e.cards === 0) badges.push('<span class="ch-badge is-warn" title="No card in canonical/cards.json carries the skill that gives it">no card</span>');
    if(e.css === false) badges.push('<span class="ch-badge is-warn" title="No CSS rule for this class was found in the game files">no CSS</span>');
    if(!e.meaning) badges.push('<span class="ch-badge is-warn" title="The game has no description text for it">no text</span>');
    if(m.note) badges.push('<span class="ch-badge" title="You left a note">📝</span>');
    return `<article class="ch-row k-${e.kind}${m.mark ? ' m-' + m.mark : ''}${open ? ' is-open' : ''}" data-id="${esc(e.id)}">
      <div class="ch-nm">${iconCell(e)}<div><b>${esc(e.name)}</b><span class="ch-kind">${esc(KIND[e.kind].label)}</span><div class="ch-bd">${badges.join('')}</div></div></div>
      <p class="ch-mean">${e.meaning ? esc(e.meaning) : '<i>(the game has no text for it)</i>'}</p>
      <p class="ch-shows">${Object.keys(WHERE).filter(w=> (e.shows || []).includes(w)).map(w=> WHERE[w]).join(' · ') || '–'}</p>
      <p class="ch-n" title="Cards in canonical/cards.json that can cause it">${cardsTxt(e)}<small> cards</small></p>
      <div class="ch-act" role="group" aria-label="Decision for ${esc(e.name)}">${MARKS.map(([v, l])=> `<button type="button" data-mark="${v}" aria-pressed="${m.mark === v}">${l}</button>`).join('')}</div>
      <button type="button" class="ch-more" data-more aria-expanded="${open}">${open ? '▾ Less' : '▸ More'}</button>
      ${open ? detailHTML(e, m) : ''}
    </article>`;
  }
  function detailHTML(e, m){
    const mates = [...new Set((e.groups || []).flatMap(g=> (GR[g] ? GR[g].members : [])))].filter(x=> x !== e.id && BY[x]);
    const into = m.mark === 'merge' ? `<label class="ch-into">Merge into <select data-into aria-label="Merge ${esc(e.name)} into"><option value="">(say in the note)</option>${mates.map(x=> `<option value="${esc(x)}"${m.into === x ? ' selected' : ''}>${esc(BY[x].icon || BY[x].altIcon || '')} ${esc(BY[x].name)} · ${esc(KIND[BY[x].kind].short)}</option>`).join('')}</select></label>` : '';
    const link = id=> BY[id] ? `<button type="button" class="ch-lk" data-focus="${esc(id)}">${esc(BY[id].icon || BY[id].altIcon || '')} ${esc(BY[id].name)}</button>` : '';
    const rel = [].concat(e.fx || [], e.link ? [e.link] : []).map(link).join(' ');
    return `<div class="ch-detail">
      ${mates.length ? `<p><b>Grouped with</b> ${mates.slice(0, 14).map(link).join(' ')}${mates.length > 14 ? ' …' : ''}</p>` : ''}
      ${rel ? `<p><b>Linked</b> ${rel}</p>` : ''}
      ${(e.examples || []).length ? `<p><b>Cards, e.g.</b> ${esc(e.examples.join(', '))}${e.cards > e.examples.length ? ` and ${e.cards - e.examples.length} more` : ''}</p>` : ''}
      ${(e.causedBy || []).length ? `<p><b>Given by</b> <code>${esc(e.causedBy.join(', '))}</code></p>` : ''}
      ${e.note ? `<p><b>Note from the game</b> ${esc(e.note)}</p>` : ''}
      <p class="ch-src"><b>Source</b> ${(e.source || []).map(s=> `<code>${esc(s)}</code>`).join(' ')}</p>
      ${into}
      <label class="ch-note">Your note<textarea rows="2" data-note maxlength="500" placeholder="Why keep it, drop it, or what to merge it with…" aria-label="Note on ${esc(e.name)}">${esc(m.note)}</textarea></label>
    </div>`;
  }
  function groupBanner(){
    const el = $('chGroupBanner'); if(!el) return;
    const g = st.group && GR[st.group];
    el.innerHTML = g ? `<div class="ch-gb"><b>${esc(g.id)} · ${esc(REASON[g.reason][0])}</b> ${esc(g.label)}. ${esc(g.note || '')} <button type="button" class="btn" data-cleargroup>Show all</button></div>` : '';
  }
  function render(){
    const list = sorted(filtered()), el = $('chList'); if(!el) return;
    groupBanner(); renderCounts();
    $('chCount').textContent = `${list.length} of ${E.length}` + (list.length === E.length ? '' : ' shown');
    el.innerHTML = list.map(rowHTML).join('') || '<p class="dec-empty">Nothing matches. Clear a filter or the search.</p>';
    document.querySelectorAll('.ch-head button[data-s]').forEach(b=> b.setAttribute('aria-sort', (b.dataset.s === 'name' && st.sort === 'name') || (b.dataset.s === 'cards-' && st.sort === 'cards-') ? 'descending' : (b.dataset.s === 'cards-' && st.sort === 'cards+') ? 'ascending' : 'none'));
  }
  function renderCounts(){
    const c = {keep: 0, drop: 0, merge: 0}; let marked = 0; Object.keys(marks).forEach(id=>{ if(BY[id] && marks[id].mark){ c[marks[id].mark]++; marked++; } });
    const set = (id, v)=>{ const x = $(id); if(x) x.textContent = v; };
    set('chcKeep', c.keep); set('chcDrop', c.drop); set('chcMerge', c.merge); set('chcNone', E.length - marked);
    renderStatus();
  }
  function patchRow(id){ // re-render one row in place (keeps the page where it is)
    const row = document.querySelector(`#chList .ch-row[data-id="${CSS.escape(id)}"]`); if(!row) return;
    if(st.mark !== '*' || st.sort === 'mark'){ render(); return; } // the row may leave the list or move
    const tmp = document.createElement('div'); tmp.innerHTML = rowHTML(BY[id]); const nr = tmp.firstElementChild;
    const ta = row.querySelector('textarea[data-note]'), keepFocus = ta && document.activeElement === ta;
    row.replaceWith(nr); if(keepFocus){ const t = nr.querySelector('textarea[data-note]'); if(t){ t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }
    renderCounts();
  }

  // ---------- events ----------
  function setMark(id, patch){
    const cur = Object.assign({mark: '', into: '', note: ''}, marks[id] || {}), next = Object.assign(cur, patch);
    if(next.mark !== 'merge') next.into = '';
    if(!next.mark && !next.note) delete marks[id]; else marks[id] = next;
    if(mode === 'on') save(id);
  }
  function onClick(e){
    const row = e.target.closest('.ch-row'); const id = row && row.dataset.id;
    const mb = e.target.closest('button[data-mark]');
    if(mb && id){ const v = mb.dataset.mark; setMark(id, {mark: mk(id).mark === v ? '' : v}); patchRow(id); return; }
    if(e.target.closest('[data-more]') && id){ st.open[id] = !st.open[id]; patchRow(id); return; }
    const gb = e.target.closest('button[data-g]'); if(gb){ st.group = gb.dataset.g; render(); const top = $('chGroupBanner'); if(top && top.scrollIntoView) top.scrollIntoView({block: 'nearest'}); return; }
    const fb = e.target.closest('button[data-focus]');
    if(fb){ const t = BY[fb.dataset.focus]; if(t){ st.group = ''; st.kind = '*'; st.mark = '*'; st.dup = false; st.zero = false; st.q = t.name.toLowerCase(); $('chQ').value = t.name; seg('chKind', $('chKind').querySelector('[data-k="*"]')); seg('chMark', $('chMark').querySelector('[data-m="*"]')); $('chDup').checked = false; $('chZero').checked = false; st.open[t.id] = true; render(); } }
  }
  function onInput(e){
    const row = e.target.closest('.ch-row'); const id = row && row.dataset.id; if(!id) return;
    if(e.target.matches('textarea[data-note]')){ setMark(id, {note: e.target.value.slice(0, 500)}); renderCounts(); return; } // the 📝 shows on the next redraw
    if(e.target.matches('select[data-into]')){ setMark(id, {into: e.target.value}); }
  }

  // ---------- db ----------
  async function connect(){
    let d = null;
    try{ d = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('db') : null; }catch(e){ d = null; }
    if(!d){ mode = 'off'; renderStatus(); return; }
    db = d; mode = 'on'; renderStatus();
    try{
      db.collection('chipReview').onSnapshot(snap=>{
        const seen = {};
        snap.docs.forEach(doc=>{ const x = doc.data() || {}; if(typeof x.id !== 'string' || !BY[x.id]) return;
          seen[x.id] = {mark: ['keep', 'drop', 'merge'].includes(x.mark) ? x.mark : '', into: typeof x.into === 'string' && BY[x.into] ? x.into : '', note: typeof x.note === 'string' ? x.note.slice(0, 500) : ''}; });
        // the db is the source of truth for every entry without a write of ours still on its way
        new Set(Object.keys(marks).concat(Object.keys(seen))).forEach(id=>{ if(timers[id] || busy[id]) return; if(seen[id] && (seen[id].mark || seen[id].note)) marks[id] = seen[id]; else delete marks[id]; });
        const ae = document.activeElement; if(ae && ae.matches && ae.matches('#chList textarea')) { renderCounts(); return; } // do not redraw under the owner's typing
        render();
      }, err=>{ mode = err && err.code === 'revoked' ? 'off' : 'ro'; renderStatus(); });
    }catch(e){ mode = 'off'; renderStatus(); }
  }
  function save(id){
    clearTimeout(timers[id]);
    timers[id] = setTimeout(()=>{ delete timers[id]; busy[id] = true;
      chains[id] = (chains[id] || Promise.resolve()).then(()=>{
        const ref = db.collection('chipReview').doc(docId(id)), m = marks[id], e = BY[id];
        return m ? ref.set({id, kind: e.kind, name: e.name, mark: m.mark, into: m.into || '', note: m.note || '', updatedAt: new Date().toISOString()}) : ref.delete();
      }).then(()=>{ delete busy[id]; renderStatus('Saved'); }, err=>{ delete busy[id];
        if(err && (err.code === 'invalid_argument' || err.code === 'revoked' || err.code === 'not_granted')){ mode = 'ro'; renderStatus(); }
        else renderStatus('Not saved (' + esc(err && err.code || 'error') + '): mark it again'); });
    }, 500);
  }

  // ---------- status / copy ----------
  function renderStatus(flash){
    const el = $('chStatus'); if(!el) return; const n = Object.keys(marks).filter(id=> BY[id]).length;
    const msg = mode === 'pending' ? 'Connecting to the hub\'s saved marks…'
      : mode === 'on' ? `Your marks save to this hub for Claude to read (${n} marked or noted${flash ? ' · ' + flash : ''}).`
      : `<b>Marks can't be saved here.</b> They last for this visit only; ${n ? n + ' marked · ' : ''}use Copy JSON and paste it to Claude.`;
    el.className = 'sc-status ' + (mode === 'on' ? 'is-on' : mode === 'pending' ? '' : 'is-off');
    el.innerHTML = `<span>${msg}</span><button type="button" class="btn" data-copy>📋 Copy JSON</button><span class="sc-copied" id="chCopied" aria-live="polite"></span>`;
  }
  function marksJSON(){
    const now = new Date().toISOString();
    const list = Object.keys(marks).filter(id=> BY[id]).sort().map(id=>{ const m = marks[id], e = BY[id]; return {id, kind: e.kind, name: e.name, mark: m.mark, into: m.into || '', note: m.note || '', updatedAt: now}; });
    return JSON.stringify({collection: 'chipReview', source: 'docs/chips-inventory.json ' + D.generated + ' ' + D.sourceHash, marks: list}, null, 1) + '\n';
  }
  function copyJSON(){
    const text = marksJSON(), out = $('chCopied');
    const fallback = ()=>{ if(out) out.textContent = 'Copy blocked here: select the text below and copy it.'; let ta = $('chJSON');
      if(!ta){ ta = document.createElement('textarea'); ta.id = 'chJSON'; ta.className = 'sc-json'; ta.readOnly = true; ta.setAttribute('aria-label', 'Chip review marks as JSON'); $('chStatus').after(ta); }
      ta.value = text; ta.focus(); ta.select(); };
    try{ if(!navigator.clipboard || !navigator.clipboard.writeText){ fallback(); return; }
      navigator.clipboard.writeText(text).then(()=>{ if(out) out.textContent = 'Copied ' + Object.keys(marks).filter(id=> BY[id]).length + ' mark(s).'; }, fallback);
    }catch(e){ fallback(); }
  }
  hub.onShow.chips = build;
})();
