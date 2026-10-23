// progression_tab.js — the 📚 Progression plan tab, inlined into .hub/index.html by tools/hub/build_hub.py after hub_app.js.
// 2026-10-23 (package HUB3, owner 19:27: "let's all discuss this in the 'Units by theme' tab (maybe) in the master hub ... Help me remember
// my definitions and log it in the master hub as well, in the same section"; "Let me also sort by advancement in the master hub"): next
// to 🗂 Units by theme. Reads PP_DOC (docs/progression-plan.md as HTML: the owner's definitions, targets, open questions and the
// balancing suggestions) and PP_DATA (docs/balance/progression-plan-2026-10-23.json from node tools/progression_plan_2026_10_23.js:
// targets vs today, every card in its bucket sorted by advancement, the leftover mistakes, eggs and babies, Map 0-1 skills, Ants, the
// faction-reward pacing and the collection by map). Read only: nothing is saved, nothing goes into browser storage.
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[c]);
  const hub = window.hub;
  if(!hub || typeof PP_DATA === 'undefined' || !PP_DATA) return;
  const D = PP_DATA;
  const BUCKET = {tutorialBase: 'Tutorial base', base: 'Base', 'skirmish-p1': 'Skirmish base · Pack 1 maps', 'skirmish-p2': 'Skirmish base · Pack 2 maps', 'skirmish-p3': 'Skirmish base · Pack 3 maps', 'skirmish-p4': 'Skirmish base · after Map 20',
    'pack-p1': 'Pack 1', 'pack-p2': 'Pack 2', 'pack-p3': 'Pack 3', 'pack-p4': 'Pack · after Map 20', 'pack-nomap': 'Pack · no map', factionOtter: 'Faction · Otter', factionHummingbird: 'Faction · Hummingbird', factionShared: 'Faction · shared',
    secrets: 'Pack Secrets I (Mystery)', quest: 'Quest special', nest: 'Nest egg card', raid: 'Raid craft', smith: 'Blacksmith', materia: 'Materia', unsorted: 'Unsorted'};
  const RN = {starter: 'Starter', common: 'Common', uncommon: 'Uncommon', rare: 'Rare', veryrare: 'Very Rare', superrare: 'Super Rare', epic: 'Epic', heroic: 'Heroic', unique: 'Unique', legendary: 'Legendary', mythic: 'Mythic'};
  const RO = Object.keys(RN);
  const st = {view: 'plan', q: '', bucket: '', key: 'adv', dir: 1};
  const advTxt = a=> a == null ? '–' : a < 0 ? 'Tutorial' : 'Map ' + a;
  const VIEWS = [['plan', 'Definitions & suggestions'], ['targets', 'Targets vs today'], ['cards', 'Cards by advancement'], ['mistakes', 'Leftover mistakes'], ['eggs', 'Eggs & babies'], ['pacing', 'Faction pacing & collection'], ['early', 'Maps 0-1: skills & Ants']];

  function table(head, rows){ return `<div class="bal-wrap"><table class="bal-t pp-t"><thead><tr>${head.map(h=> `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('') || `<tr><td colspan="${head.length}" class="dec-empty">Nothing here.</td></tr>`}</tbody></table></div>`; }
  function vTargets(){
    return `<p class="note">Today's live cards (unattainable ones are counted apart as "unplaced"), in the owner's buckets. Gap: below the target is negative. Click a row's bucket to see its cards.</p>`
      + table(['Bucket', 'Target', 'Today', 'Unplaced', 'Gap'], D.targets.map(t=> `<tr><td><a href="#" data-pp-bucket="${esc(t.key)}">${esc(t.label)}</a></td><td>${esc(t.target)}</td><td class="num">${t.actual}</td><td class="num">${t.unplaced || ''}</td><td class="num ${t.gap ? (t.gap < 0 ? 'pp-lo' : 'pp-hi') : ''}">${t.gap == null ? '' : t.gap > 0 ? '+' + t.gap : t.gap}</td></tr>`));
  }
  function vCards(){
    const q = st.q, list = D.cards.filter(c=> (!st.bucket || c.bucket === st.bucket) && (!q || (c.name + ' ' + c.id + ' ' + (c.sk || []).join(' ') + ' ' + (BUCKET[c.bucket] || c.bucket)).toLowerCase().includes(q)));
    const val = (c, k)=> k === 'adv' ? (c.adv == null ? 999 : c.adv) : k === 'r' ? RO.indexOf(c.r) : k === 'bucket' ? (BUCKET[c.bucket] || c.bucket) : c[k] == null ? '' : c[k];
    list.sort((a, b)=>{ const x = val(a, st.key), y = val(b, st.key); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * st.dir || a.name.localeCompare(b.name); });
    const opts = ['<option value="">Every bucket</option>'].concat(Object.keys(BUCKET).filter(k=> D.cards.some(c=> c.bucket === k)).map(k=> `<option value="${k}"${k === st.bucket ? ' selected' : ''}>${esc(BUCKET[k])} (${D.cards.filter(c=> c.bucket === k).length})</option>`)).join('');
    const th = (k, l)=> `<th data-pp-sort="${k}"${st.key === k ? ` aria-sort="${st.dir > 0 ? 'ascending' : 'descending'}"` : ''}>${l}</th>`;
    return `<div class="sc-bar"><input type="search" id="ppQ" placeholder="Name, id, skill, bucket…" value="${esc(st.q)}" aria-label="Search cards"><select id="ppB" aria-label="Bucket">${opts}</select></div>
      <p class="note" aria-live="polite">${list.length} cards. Advancement: the map where the card first becomes obtainable (its first map pool; a side map counts from the map that unlocks it; a skirmish reward its map).</p>
      <div class="bal-wrap"><table class="bal-t pp-t"><thead><tr>${th('adv', 'Advancement')}${th('name', 'Card')}${th('r', 'Rarity')}${th('bucket', 'Bucket')}${th('where', 'Where')}<th>Skills</th>${th('lvl', 'Start Lv')}</tr></thead><tbody>`
      + list.map(c=> `<tr><td>${esc(advTxt(c.adv))}</td><td>${esc(c.name)}${c.lava ? ' <span class="pp-tag" title="volcanic biome">🌋</span>' : ''}${c.ant ? ' <span class="pp-tag" title="Ant type">🐜</span>' : ''}</td><td>${esc(RN[c.r] || c.r)}</td><td>${esc(BUCKET[c.bucket] || c.bucket)}</td><td><code>${esc(c.where || '')}</code></td><td><small>${esc((c.sk || []).join(', '))}</small></td><td class="num">${c.lvl}</td></tr>`).join('')
      + `</tbody></table></div>`;
  }
  function vMistakes(){
    return `<p class="note">Found by the tool; nothing is fixed here (package RW5 changes the data). Each with the proposed fix.</p><ol class="pp-list">`
      + D.mistakes.map(m=> `<li><b>${esc(m.kind)}</b> · ${esc(m.what)}<br><span class="pp-fix">Fix: ${esc(m.fix)}</span>${m.ids && m.ids.length ? `<details><summary>${m.ids.length} card${m.ids.length === 1 ? '' : 's'}</summary><small>${m.ids.map(esc).join(', ')}</small></details>` : ''}</li>`).join('') + '</ol>';
  }
  function vEggs(){
    const E = D.eggs;
    return `<h3>How it works today</h3><ul>${E.facts.map(f=> `<li>${esc(f)}</li>`).join('')}</ul><h3>Against the owner's rule</h3><ul>${E.inconsistencies.map(f=> `<li>${esc(f)}</li>`).join('')}</ul><p><b>Proposal:</b> ${esc(E.proposal)}</p>`
      + '<h3>Egg cards</h3>' + table(['Card', 'Rarity', 'Source', 'Start Lv', 'Wait', 'Hatches into', 'Obtainable'], E.eggCards.map(c=> `<tr><td>${esc(c.name)}</td><td>${esc(RN[c.r] || c.r)}</td><td>${esc(c.src)}</td><td class="num">${c.lvl}</td><td class="num">${c.wait}</td><td><small>${esc(c.hatchInto ? JSON.stringify(c.hatchInto).slice(0, 80) : '')}</small></td><td>${c.un ? 'no' : 'yes'}</td></tr>`))
      + '<h3>Baby-like cards</h3>' + table(['Card', 'Rarity', 'Bucket', 'Start Lv', 'Obtainable'], E.babyCards.map(c=> `<tr><td>${esc(c.name)}</td><td>${esc(RN[c.r] || c.r)}</td><td>${esc(BUCKET[c.bucket] || c.bucket)}</td><td class="num">${c.lvl}</td><td>${c.un ? 'no' : 'yes'}</td></tr>`));
  }
  function vPacing(){
    const P = D.pacing || [], C = D.collection || [], F = D.factionTrack || {}, mp = x=> x == null ? '–' : x >= 99 ? '60+' : 'Map ' + x;
    return `<p class="note">The standard pattern (C, C, C, U, C, C, U, C, U, R ...) placed on today's hand-outs (tools/faction_track_sim_2026_10_21.js: the 0-2 faction pack, each map's last fight, every ${esc(F.everyWins)}th first clear, the 3-2 Growth, achievements; ${esc(F.receivedByMap15)} received by Map 15). Window: no Very Rare by Map 15, past Uncommon by Map 17.</p>`
      + table(['Model', 'First Rare', 'First Very Rare+', 'Last Uncommon', 'Pool runs dry', 'Verdict'], P.map(p=>{ const hi = Object.entries(p.first || {}).filter(([r])=> RO.indexOf(r) >= RO.indexOf('veryrare')).sort((a, b)=> a[1].reward - b[1].reward)[0];
        return `<tr><td>${esc(p.label)}</td><td>${p.first && p.first.rare ? `#${p.first.rare.reward} · ${mp(p.first.rare.map)}` : '–'}</td><td>${hi ? `${esc(RN[hi[0]])} #${hi[1].reward} · ${mp(hi[1].map)}` : '–'}</td><td>${p.lastUncommon ? `#${p.lastUncommon.reward} · ${mp(p.lastUncommon.map)}` : '–'}</td><td>${p.dryAt ? `${p.dryAt.reward} copies · ${mp(p.dryAt.map)}` : '–'}</td><td>${esc(p.verdict)}</td></tr>`; }))
      + `<h3>Faction cards received by map (today's track)</h3><p class="note">${(F.perMap || []).filter(x=> x.map <= 24).map(x=> `M${x.map}: ${x.received}`).join(' · ')}</p>`
      + `<h3>Collection by map (first clears of every main-map fight)</h3><p class="note">Copies received: the starting deck, skirmish rewards, first-clear pack cards, free packs, faction rewards, the boss's Base gift, expected drops. "With the proposal": + a pack of 3 and a faction pack (3: 2 of your side + 1 basic) at the end of every map.</p>`
      + table(['By the end of', 'Fights', 'Starter', 'Skirmish rewards', 'First-clear pack cards', 'Free packs', 'Faction', 'Base gifts', 'Drops', 'Today', 'With the proposal'], C.map(c=> `<tr><td>Map ${c.map} · ${esc(c.name)}</td><td class="num">${c.fights}</td><td class="num">${c.starter}</td><td class="num">${c.skirmishRewards}</td><td class="num">${c.firstClearPackCards}</td><td class="num">${c.freePackCards}</td><td class="num">${c.factionRewards}</td><td class="num">${c.bossBaseGifts}</td><td class="num">${c.drops}</td><td class="num"><b>${c.today}</b></td><td class="num"><b>${c.withProposal}</b> (+${c.proposalAdds})</td></tr>`));
  }
  function vEarly(){
    const S = D.skillsSeen || [], A = D.ants || {}, O = D.outsideFaction || [];
    const G = {tutorial: 'Tutorial decks', starter: 'Your starting deck', map0enemy: 'Map 0 enemies', map0rewards: 'Map 0 rewards', map1enemy: 'Map 1 enemies', map1rewards: 'Map 1 rewards'};
    return `<h3>Skills a player meets in Maps 0-1</h3><p class="note">From the tutorial decks, the starting deck the game builds (each side), Map 0 and Map 1's enemy decks and first-clear rewards. "?" = hidden by SKILL_REVEAL_MAP until that map.</p>`
      + table(['Skill', 'Where', 'Cards', 'Reveal'], S.map(s=> `<tr><td>${esc(s.label)}</td><td>${Object.keys(s.where).map(k=> esc(G[k] || k)).join(', ')}</td><td><small>${esc([...new Set(Object.values(s.where).flat())].join(', '))}</small></td><td>${esc(s.hidden || '')}</td></tr>`))
      + `<h3>Ant cards (Ant type) by advancement</h3>` + table(['Card', 'Rarity', 'Bucket', 'Advancement', 'Skills'], (A.live || []).map(c=> `<tr><td>${esc(c.name)}</td><td>${esc(RN[c.r] || c.r)}</td><td>${esc(BUCKET[c.bucket] || c.bucket)}</td><td>${esc(advTxt(c.adv))}</td><td><small>${esc((c.sk || []).join(', '))}</small></td></tr>`))
      + `<p class="note">Not obtainable today: ${(A.unplaced || []).map(c=> esc(c.name)).join(', ') || 'none'}.</p>`
      + `<h3>Otter / Hummingbird cards outside the faction pool</h3>` + table(['Card', 'Kind', 'Rarity', 'Bucket'], O.map(c=> `<tr><td>${esc(c.name)}</td><td>${esc(c.kind)}</td><td>${esc(RN[c.r] || c.r)}</td><td>${esc(BUCKET[c.bucket] || c.bucket)}</td></tr>`));
  }
  function render(){
    const body = $('ppBody'); if(!body) return;
    body.innerHTML = st.view === 'plan' ? `<article class="doc">${typeof PP_DOC === 'string' ? PP_DOC : ''}</article>` : st.view === 'targets' ? vTargets() : st.view === 'cards' ? vCards() : st.view === 'mistakes' ? vMistakes() : st.view === 'eggs' ? vEggs() : st.view === 'pacing' ? vPacing() : vEarly();
    $('ppViews').querySelectorAll('button').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.v === st.view)));
  }
  function build(){
    if(build.done) return; build.done = true;
    const host = $('ppHost'); if(!host) return;
    host.innerHTML = `<div class="dec-head"><h2>📚 Progression plan</h2><p>The owner's definitions of where cards come from and how many of each kind there should be, today's counts against them, and the balancing suggestions. Text: <code>docs/progression-plan.md</code>; numbers: <code>node tools/progression_plan_2026_10_23.js</code> (built ${esc(D.generated)}). Units by theme: <a href="#units" data-tab="units">🗂</a>.</p></div>
      <div class="dec-seg pp-views" role="group" aria-label="View" id="ppViews">${VIEWS.map(([k, l])=> `<button type="button" data-v="${k}" aria-pressed="${k === st.view}">${esc(l)}</button>`).join('')}</div><div id="ppBody"></div>`;
    $('ppViews').addEventListener('click', e=>{ const b = e.target.closest('button[data-v]'); if(!b) return; st.view = b.dataset.v; render(); });
    host.addEventListener('click', e=>{
      const a = e.target.closest('[data-pp-bucket]'); if(a){ e.preventDefault(); st.view = 'cards'; st.bucket = a.dataset.ppBucket; st.q = ''; render(); return; }
      const th = e.target.closest('[data-pp-sort]'); if(th){ const k = th.dataset.ppSort; if(st.key === k) st.dir = -st.dir; else { st.key = k; st.dir = 1; } render(); }
    });
    host.addEventListener('input', e=>{ if(e.target.id === 'ppQ'){ st.q = e.target.value.trim().toLowerCase(); const pos = e.target.selectionStart; render(); const i = $('ppQ'); if(i){ i.focus(); try{ i.setSelectionRange(pos, pos); }catch(_){} } } });
    host.addEventListener('change', e=>{ if(e.target.id === 'ppB'){ st.bucket = e.target.value; render(); } });
    render();
  }
  hub.onShow.progress = build;
})();
