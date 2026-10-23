// resources_tab.js — the 🪙 Resources tab, inlined into .hub/index.html by tools/hub/build_hub.py after hub_app.js.
// 2026-10-23 (package HUB3, owner 19:27 #17: "In the masterhub, there should be a tab called resources - shows you what resources exist in
// the game like fragments and materia - then estimations of how much a dedicated player can earn in a week."): reads RS_DATA
// (docs/balance/resources-2026-10-23.json from node tools/resources_week_2026_10_23.js): every resource with where it comes from and what
// spends it, the assumptions, a week of play at Maps 3 / 10 / 20, the road's first-clear totals and the sessions to Gannet Cliffs and
// the Gatorback Swamp. Read only.
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[c]);
  const hub = window.hub;
  if(!hub || typeof RS_DATA === 'undefined' || !RS_DATA) return;
  const D = RS_DATA, st = {kind: '', q: ''};
  const n0 = v=> v == null ? '–' : (Math.round(v * 10) / 10).toLocaleString('en');
  const KINDS = [...new Set(D.resources.map(r=> r.kind))];
  const WEEK_ROWS = [['gold', '🍁 Maple Leaves'], ['dust', '✨ Magic Dust'], ['gems', '🍂 Gold Leaves'], ['metal', '🔩 Metal'], ['kibble', '🦴 Kibble'], ['laurels', '🌿 Laurels'], ['beer', '🍺 Beer'],
    ['ironShard', '⛓️ Iron Shards'], ['raidTickets', '🎫 Raid Tickets'], ['kitItems', '🎒 Field-kit items'], ['eggs', '🥚 Eggs (repeat wins)'], ['babies', '🍼 Rescued babies'], ['cardDrops', '🃏 Card drops'], ['xp', '⭐ XP (notices)'], ['energy', '⚡ Energy spent'], ['fights', '⚔️ Fights']];
  function rows(){
    const q = st.q; return D.resources.filter(r=> (!st.kind || r.kind === st.kind) && (!q || JSON.stringify(r).toLowerCase().includes(q)))
      .map(r=> `<tr><td><b>${esc(r.icon)} ${esc(r.name)}</b><br><small>${esc(r.kind)}</small></td><td>${esc(r.from)}</td><td>${esc(r.spent)}</td><td><small>${esc(r.notes)}${r.refs && r.refs.length ? '<br><code>' + r.refs.map(esc).join(' · ') + '</code>' : ''}</small></td></tr>`).join('') || '<tr><td colspan="4" class="dec-empty">Nothing matches.</td></tr>';
  }
  function render(){
    const A = D.assumptions || {}, W = D.weeks || [], S = D.sessions || {};
    $('rsBody').innerHTML = `<h3>A dedicated player's week</h3>
      <p class="note">Assumptions: awake ${esc(A.awakeHours)} h a day and back before Energy caps (Energy cap ${Object.entries(A.energyCapAt || {}).map(([m, c])=> c + ' from Map ' + m).join(', ')}, bought as each place opens), +free Energy; every Energy on repeat wins of an already-cleared skirmish (Sweeps, so time is not the limit) at rank ${esc(A.rank)}; all ${esc(A.noticesPerDay)} daily notices and every daily / weekly quest tier done; ${esc(A.pvpPerDay)} PvP a day at ${Math.round((A.pvpWin || 0) * 100)}% wins; ${esc(A.raidsPerDay)} raid a day at ~${esc(A.raidDamage)} damage. No packs bought, no first clears (those are below), no achievements.</p>
      <div class="bal-wrap"><table class="bal-t"><thead><tr><th>Per week</th>${W.map(w=> `<th>Map ${w.map} · ${esc(w.mapName)}<br><small>${w.energyPerFight}⚡ a fight · ${w.fightsPerDay} fights a day</small></th>`).join('')}</tr></thead><tbody>`
      + WEEK_ROWS.map(([k, l])=> `<tr><td>${esc(l)}</td>${W.map(w=> `<td class="num">${n0(w.week[k])}</td>`).join('')}</tr>`).join('')
      + `<tr><td><small>Maple Leaves from: Conquest · notices · quest tiers</small></td>${W.map(w=> `<td class="num"><small>${n0(w.split.conquestGold)} · ${n0(w.split.noticeGold)} · ${n0(w.split.questTierGold)}</small></td>`).join('')}</tr>`
      + `<tr><td><small>Hedgerow Pouches that buys</small></td>${W.map(w=> `<td class="num"><small>${n0(w.hedgerowPouchesAffordable)}</small></td>`).join('')}</tr></tbody></table></div>
      <h3>The road's first clears (main maps)</h3><div class="bal-wrap"><table class="bal-t"><thead><tr><th>Through</th><th>Fights</th><th>⚡ Energy</th><th>🍁 Maple Leaves</th><th>✨ Dust</th></tr></thead><tbody>`
      + (D.road || []).map(r=> `<tr><td>Map ${r.map} · ${esc(r.name)}</td><td class="num">${r.fights}</td><td class="num">${n0(r.energy)}</td><td class="num">${n0(r.gold)}</td><td class="num">${n0(r.dust)}</td></tr>`).join('') + `</tbody></table></div>
      <h3>Sessions (owner's pace: Gannet Cliffs cleared in 1-2 sessions, packs from session 3-4)</h3>
      <p class="note">A session: ${esc((A.session || {}).minutes)} min, ~${esc((A.session || {}).minutesPerFight)} min a fight, ${Math.round(((A.session || {}).winRate || 0) * 100)}% of first tries won (a loss costs its Energy), a full Energy cap at the start (${esc((S.gannetCleared || {}).energyPerSession)}⚡ a session with regen).</p>
      <ul><li>Gannet Cliffs (Map 3) fully cleared: <b>${esc((S.gannetCleared || {}).sessions)} sessions</b> (${esc((S.gannetCleared || {}).attempts)} fights, ${esc((S.gannetCleared || {}).energy)}⚡; time alone ${esc((S.gannetCleared || {}).byTime)}, Energy ${esc((S.gannetCleared || {}).byEnergy)}).</li>
      <li>Maps 0-4 cleared, the Gatorback Swamp's packs open: <b>${esc((S.gatorReached || {}).sessions)} sessions</b> (${esc((S.gatorReached || {}).energy)}⚡); ${n0(S.goldAtMap4)} Maple Leaves from first clears by then.</li></ul>
      <h3>Every resource</h3><div class="sc-bar"><input type="search" id="rsQ" placeholder="Filter…" value="${esc(st.q)}" aria-label="Filter resources"><select id="rsK" aria-label="Kind"><option value="">Every kind</option>${KINDS.map(k=> `<option${k === st.kind ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select></div>
      <div class="bal-wrap"><table class="bal-t rs-t"><thead><tr><th>Resource</th><th>Comes from</th><th>Spent on</th><th>Notes · read from</th></tr></thead><tbody id="rsRows">${rows()}</tbody></table></div>`;
  }
  function build(){
    if(build.done) return; build.done = true;
    const host = $('rsHost'); if(!host) return;
    host.innerHTML = `<div class="dec-head"><h2>🪙 Resources</h2><p>Every currency, material and token in the game, where it comes from and what spends it, and what a dedicated player earns in a week. Numbers from the game's own tables: <code>node tools/resources_week_2026_10_23.js</code> (built ${esc(D.generated)}); the assumptions are listed and editable in the tool.</p></div><div id="rsBody"></div>`;
    render();
    host.addEventListener('input', e=>{ if(e.target.id === 'rsQ'){ st.q = e.target.value.trim().toLowerCase(); $('rsRows').innerHTML = rows(); } });
    host.addEventListener('change', e=>{ if(e.target.id === 'rsK'){ st.kind = e.target.value; $('rsRows').innerHTML = rows(); } });
  }
  hub.onShow.resources = build;
})();
