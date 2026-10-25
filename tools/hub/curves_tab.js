// curves_tab.js — the 📊 Curves tab, inlined into .hub/index.html by tools/hub/build_hub.py after hub_app.js.
// 2026-10-25 (package HUB5; owner 10-25 17:53 #52, item H3: "What's the exp curve like? Can I see it in master hub? all the crafting and resource and lvl
// curves?" and "it was so ez to reach level 15. But 15-25 was a drag"): the player's XP per level and in total, the Forge and crafting costs, and the
// Energy and resource curves, as small SVG charts with the values on hover (or on touch). Read only: no db, no browser storage.
// CV_GAME holds the game's own functions and tables, copied as text out of arena_app.js by tools/hub/hub5_data.py at build time (xpToNext,
// STAMINA_PLACES, mapEnergyBase, levelGateMap), so these curves ARE the game's. CV_DATA: canonical/upgrade-costs.json and the resources estimate.
(function(){
  const $ = id=> document.getElementById(id);
  const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[c]);
  const hub = window.hub;
  if(!hub || typeof CV_DATA === 'undefined' || !CV_DATA || typeof CV_GAME === 'undefined') return;
  const G = CV_GAME, U = CV_DATA.upgrade, RES = CV_DATA.resources, RL = CV_DATA.rarityLabel;
  const n0 = v=> v == null ? '–' : Math.round(v).toLocaleString('en');
  const short = v=> { const a = Math.abs(v); return a >= 1e6 ? +(v / 1e6).toPrecision(3) + 'M' : a >= 1e4 ? +(v / 1e3).toPrecision(3) + 'k' : a >= 1e3 ? (Math.round(v / 100) / 10) + 'k' : String(Math.round(v * 10) / 10); };
  // The levels the owner called out: easy to 15, a drag from 15 to 25 (item H3 / B2).
  const DRAG = [15, 25];

  // ---------- a small line chart: SVG, values on hover / touch ----------
  // cfg: xs (numbers), series [{name, ys, c: 1..6, dash, step}], bands [{x0, x1, label}], marks [{x, label}], logY, yFmt, xFmt, xLabel, yLabel, tips [html per x]
  function chart(host, cfg){
    const W = 720, H = 300, L = 62, R = 18, T = 16, B = 44, xs = cfg.xs, nx = xs.length;
    const all = cfg.series.flatMap(s=> s.ys).filter(v=> v != null && isFinite(v) && (!cfg.logY || v > 0));
    let lo = cfg.logY ? Math.min(...all) : 0, hi = Math.max(...all, 1);
    let ticks = [];
    if(cfg.logY){ const a = Math.floor(Math.log10(lo)), b = Math.ceil(Math.log10(hi)); for(let k = a; k <= b; k++) ticks.push(Math.pow(10, k)); lo = ticks[0]; hi = ticks[ticks.length - 1]; if(hi === lo) hi = lo * 10; }
    else { const step = Math.pow(10, Math.floor(Math.log10(hi / 4))), m = [1, 2, 2.5, 5, 10].find(k=> hi / (k * step) <= 5) * step; hi = Math.ceil(hi / m) * m; for(let v = 0; v <= hi + 1e-9; v += m) ticks.push(v); }
    const x0 = xs[0], x1 = xs[nx - 1];
    const X = x=> L + (x - x0) / ((x1 - x0) || 1) * (W - L - R);
    const Y = v=> cfg.logY ? T + (1 - (Math.log10(Math.max(v, lo)) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (H - T - B) : T + (1 - v / hi) * (H - T - B);
    const yf = cfg.yFmt || short, xf = cfg.xFmt || (v=> String(v));
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.title)}" preserveAspectRatio="xMidYMid meet">`;
    (cfg.bands || []).forEach(b=>{ s += `<rect class="cv-band" x="${X(b.x0)}" y="${T}" width="${Math.max(0, X(b.x1) - X(b.x0))}" height="${H - T - B}"/><text class="cv-bandt" x="${(X(b.x0) + X(b.x1)) / 2}" y="${T + 12}" text-anchor="middle">${esc(b.label)}</text>`; });
    ticks.forEach(v=>{ s += `<line class="cv-grid" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="cv-axt" x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${yf(v)}</text>`; });
    const xstep = Math.max(1, Math.ceil(nx / 12));
    xs.forEach((x, i)=>{ if(i % xstep === 0 || i === nx - 1) s += `<text class="cv-axt" x="${X(x)}" y="${H - B + 16}" text-anchor="middle">${esc(xf(x))}</text>`; });
    if(cfg.xLabel) s += `<text class="cv-axl" x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle">${esc(cfg.xLabel)}</text>`;
    if(cfg.yLabel) s += `<text class="cv-axl" transform="translate(12 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle">${esc(cfg.yLabel)}</text>`;
    (cfg.marks || []).forEach(m=>{ s += `<line class="cv-mark" x1="${X(m.x)}" x2="${X(m.x)}" y1="${T}" y2="${H - B}"/><text class="cv-markt" x="${X(m.x) + 3}" y="${H - B - 4}">${esc(m.label)}</text>`; });
    cfg.series.forEach(se=>{
      let d = '';
      se.ys.forEach((v, i)=>{ if(v == null || !isFinite(v) || (cfg.logY && v <= 0)) return; const px = X(xs[i]), py = Y(v);
        if(!d) d = `M${px} ${py}`; else if(se.step) d += ` H${px} V${py}`; else d += ` L${px} ${py}`; });
      s += `<path class="cv-line c${se.c}" ${se.dash ? 'stroke-dasharray="6 4"' : ''} d="${d}"/>`;
      if(nx <= 40) se.ys.forEach((v, i)=>{ if(v == null || !isFinite(v) || (cfg.logY && v <= 0)) return; s += `<circle class="cv-dot c${se.c}" cx="${X(xs[i])}" cy="${Y(v)}" r="2.6"/>`; });
    });
    s += `<line class="cv-cross" id="cvx" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/><rect class="cv-hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent"/></svg>`;
    const leg = cfg.series.length > 1 || cfg.legend ? `<div class="cv-leg">${cfg.series.map(se=> `<span><i class="c${se.c}${se.dash ? ' dash' : ''}"></i>${esc(se.name)}</span>`).join('')}</div>` : '';
    host.innerHTML = `<div class="cv-ch">${s}<div class="cv-tip" role="status" hidden></div></div>${leg}`;
    const box = host.querySelector('.cv-ch'), svg = box.querySelector('svg'), tip = box.querySelector('.cv-tip'), cross = svg.querySelector('.cv-cross');
    function move(ev){
      const r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * W;
      let best = 0, bd = 1e9; xs.forEach((x, i)=>{ const d = Math.abs(X(x) - px); if(d < bd){ bd = d; best = i; } });
      cross.setAttribute('x1', X(xs[best])); cross.setAttribute('x2', X(xs[best])); cross.setAttribute('visibility', 'visible');
      const rows = cfg.series.map(se=> `<div><i class="c${se.c}${se.dash ? ' dash' : ''}"></i>${esc(se.name)}: <b>${se.ys[best] == null ? '–' : esc(cfg.tipFmt ? cfg.tipFmt(se.ys[best]) : n0(se.ys[best]))}</b></div>`).join('');
      tip.innerHTML = `<div class="cv-tx">${esc(cfg.xName || 'x')} ${esc(xf(xs[best]))}</div>${rows}${cfg.tips && cfg.tips[best] ? `<div class="cv-tt">${cfg.tips[best]}</div>` : ''}`;
      tip.hidden = false;
      const frac = X(xs[best]) / W; tip.style.left = frac > 0.62 ? 'auto' : (frac * 100 + 2) + '%'; tip.style.right = frac > 0.62 ? ((1 - frac) * 100 + 2) + '%' : 'auto';
    }
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move);
    svg.addEventListener('pointerleave', ()=>{ tip.hidden = true; cross.setAttribute('visibility', 'hidden'); });
  }
  const fig = (id, title, note)=> `<figure class="cv-fig"><figcaption><b>${esc(title)}</b>${note ? `<span>${note}</span>` : ''}</figcaption><div id="${id}"></div></figure>`;

  // ---------- 1. XP ----------
  const trial = {a: 200, b: 50, c: 20, g: 1.12};
  const xpTrial = L=> Math.round(trial.a + trial.b * (L - 1) + trial.c * (Math.pow(trial.g, L - 1) - 1));
  const LV = Array.from({length: 60}, (_, i)=> i + 1);
  const cum = f=> { let t = 0; return LV.map(L=> { const v = t; t += f(L); return v; }); }; // total XP needed to REACH level L
  const trialOn = ()=> !(trial.a === 200 && trial.b === 50 && trial.c === 20 && trial.g === 1.12);
  function drawXp(){
    const cur = LV.map(L=> G.xpToNext(L)), cu = cum(G.xpToNext), tr = LV.map(xpTrial), tc = cum(xpTrial);
    const bands = [{x0: DRAG[0], x1: DRAG[1], label: 'Levels 15-25'}];
    const s1 = [{name: 'The game now', ys: cur, c: 1}], s2 = [{name: 'The game now', ys: cu, c: 1}];
    if(trialOn()){ s1.push({name: 'Your trial', ys: tr, c: 2, dash: true}); s2.push({name: 'Your trial', ys: tc, c: 2, dash: true}); }
    chart($('cvXp1'), {title: 'XP needed for each level', xs: LV, series: s1, bands, xName: 'Level', xLabel: 'Player level', yLabel: 'XP to the next level'});
    chart($('cvXp2'), {title: 'Total XP to reach each level', xs: LV, series: s2, bands, xName: 'Reach level', xLabel: 'Player level', yLabel: 'Total XP'});
    const upto = (arr, a, b)=> arr[b - 1] - arr[a - 1];
    const stretch = (c)=> ({first: c[14], drag: c[24] - c[14]});
    const A = stretch(cu), T = stretch(tc);
    $('cvXpSum').innerHTML = `<p>With the game's curve, reaching <b>Level 15</b> takes <b>${n0(A.first)} XP</b> in all and the stretch <b>from 15 to 25</b> another <b>${n0(A.drag)} XP</b>, about <b>${(A.drag / A.first).toFixed(1)}x</b> as much.`
      + (trialOn() ? ` Your trial: ${n0(T.first)} XP to Level 15, then ${n0(T.drag)} XP (${(T.drag / T.first).toFixed(1)}x).` : '') + `</p>`;
    const keys = [1, 2, 5, 10, 15, 20, 25, 30, 40, 50, 60];
    $('cvXpRows').innerHTML = keys.map(L=> `<tr class="${L >= DRAG[0] && L <= DRAG[1] ? 'cv-drag' : ''}"><td>${L}</td><td class="num">${n0(cur[L - 1])}</td><td class="num">${n0(cu[L - 1])}</td>${trialOn() ? `<td class="num">${n0(tr[L - 1])}</td><td class="num">${n0(tc[L - 1])}</td>` : ''}</tr>`).join('');
    $('cvXpHead').innerHTML = `<tr><th>Level</th><th>XP to next</th><th>Total to reach</th>${trialOn() ? '<th>Trial: to next</th><th>Trial: total</th>' : ''}</tr>`;
  }
  // ---------- 2. Forge and crafting ----------
  const RAR = Object.keys(U.levelCostMult);
  const mote = {dust: Math.round(U.materiaUnit.dust / U.moteDivisor), gold: Math.round(U.materiaUnit.gold / U.moteDivisor)};
  function step(L, k){ if(L <= 0) return {dust: mote.dust, gold: mote.gold}; const l = Math.max(1, Math.min(9, L)), d = U.forgeStepDust[l]; return {dust: Math.round(d * k), gold: Math.round(d * 2 / 3 * k)}; }
  function road(k, from){ let d = 0, g = 0; for(let L = from; L < 10; L++){ const c = step(L, k); d += c.dust; g += c.gold; } return {dust: d, gold: g}; }
  const FL = Array.from({length: 12}, (_, i)=> i); // levels 0..11
  function cumTo(k){ // dust spent to reach level L from Level 0 (the game's forgeSpentOn): 11 adds the limit break (mult x the whole road)
    const out = []; let t = 0; for(let L = 0; L <= 10; L++){ out.push(t); if(L < 10) t += step(L, k).dust; } out.push(t + t * U.limitBreakCostMult); return out; }
  function drawForge(){
    const sel = ['common', 'rare', 'epic', 'unique', 'mythic'].filter(r=> U.levelCostMult[r] != null);
    const log = $('cvLog').checked;
    const marks = [5, 9, 10, 11].map(L=> ({x: L, label: 'Map ' + G.levelGateMap(L)}));
    chart($('cvForge1'), {title: 'Dust spent to reach each Forge level, by rarity', xs: FL, logY: log, marks, xName: 'Level', xLabel: 'Forge level (11 = limit break)', yLabel: 'Magic Dust (total)',
      series: sel.map((r, i)=> ({name: RL[r] + ' (x' + U.levelCostMult[r] + ')', ys: cumTo(U.levelCostMult[r]).map(v=> v || (log ? null : 0)), c: i + 1}))});
    const r = $('cvRar').value, k = U.levelCostMult[r], steps = FL.slice(0, 10);
    chart($('cvForge2'), {title: 'Cost of each step', xs: steps, xName: 'Step from level', xLabel: 'Step: Level L to L+1 (0 to 1 is one Materia Mote)', yLabel: 'cost',
      series: [{name: 'Magic Dust', ys: steps.map(L=> step(L, k).dust), c: 1}, {name: 'Maple Leaves (gold)', ys: steps.map(L=> step(L, k).gold), c: 3}]});
    $('cvForgeRows').innerHTML = RAR.map(q=>{ const m = U.levelCostMult[q], rd = road(m, 1), dd = U.duplicateDivisor[q];
      return `<tr><td>${esc(RL[q] || q)}</td><td class="num">x${m}</td><td class="num">${n0(rd.dust)}</td><td class="num">${n0(rd.gold)}</td><td class="num">${n0(rd.dust * U.limitBreakCostMult)}</td><td class="num">${U.limitBreakDups[q] == null ? '–' : U.limitBreakDups[q]}</td><td class="num">${dd == null ? '–' : '1/' + dd}</td><td class="num">${U.disenchantDust[q] == null ? '–' : n0(U.disenchantDust[q])}</td></tr>`; }).join('');
    $('cvTierRows').innerHTML = U.forgeTiers.map(t=> `<tr><td>${t.tier}</td><td>${esc(t.name)}</td><td class="num">${t.cap}</td><td>${esc(RL[t.upTo] || t.upTo)}</td><td class="num">${t.map == null ? 'open' : 'Map ' + t.map}</td><td class="num">${t.gold == null ? '–' : n0(t.gold)}</td><td class="num">${t.dust == null ? '–' : n0(t.dust)}</td><td class="num">${t.strange == null ? '–' : t.strange}</td></tr>`).join('');
  }
  // ---------- 3. Energy and resources ----------
  function drawEnergy(){
    const places = G.staminaOrder.map(w=> G.STAMINA_PLACES[w]);
    const base = G.energyBase; let mx = base, dust = 0;
    const xs = [0], max = [base], dd = [0], cd = [0], tips = [''];
    places.forEach(P=> P.costs.forEach((c, i)=>{ mx += P.each; dust += c.dust; xs.push(xs.length); max.push(mx); dd.push(c.dust); cd.push(dust);
      tips.push(`${esc(P.label)}, step ${i + 1}: ${n0(c.dust)} Dust${Object.keys(c.mats || {}).length ? ' + ' + Object.entries(c.mats).map(([id, q])=> q + ' ' + esc(id.replace(/-/g, ' '))).join(', ') : ''}`); }));
    chart($('cvEn1'), {title: 'Max Energy by upgrade step', xs, series: [{name: 'Max Energy', ys: max, c: 1, step: true}], xName: 'After step', xLabel: 'Upgrade steps bought (Nest, then Forge, then Tavern)', yLabel: 'Max Energy', tips});
    chart($('cvEn2'), {title: 'Magic Dust per Energy step', xs, series: [{name: 'This step', ys: dd.map((v, i)=> i ? v : null), c: 2}, {name: 'Total so far', ys: cd, c: 4}], xName: 'Step', xLabel: 'Upgrade step', yLabel: 'Magic Dust', tips});
    const MAPS = Array.from({length: 61}, (_, i)=> i);
    const first = MAPS.map(m=> G.mapEnergyBase(m)[0]), rest = MAPS.map(m=> G.mapEnergyBase(m)[1]);
    chart($('cvEn3'), {title: 'Energy a fight costs, by map', xs: MAPS, series: [{name: "A map's first skirmish", ys: first, c: 3, step: true}, {name: 'Other fights', ys: rest, c: 1, step: true}, {name: 'A boss (double)', ys: rest.map(v=> v * 2), c: 5, step: true}], xName: 'Map', xLabel: 'Map', yLabel: 'Energy per fight'});
    const caps = RES && RES.assumptions && RES.assumptions.energyCapAt ? Object.entries(RES.assumptions.energyCapAt).map(([m, c])=> [+m, c]).sort((a, b)=> a[0] - b[0]) : [[0, 20]];
    const capAt = m=> caps.reduce((c, [mm, cc])=> m >= mm ? cc : c, caps[0][1]);
    chart($('cvEn4'), {title: 'Fights on a full Energy bar', xs: MAPS.slice(0, 41), series: [{name: 'Other fights per full bar', ys: MAPS.slice(0, 41).map(m=> Math.floor(capAt(m) / rest[m])), c: 1, step: true}, {name: 'Hours to refill from empty', ys: MAPS.slice(0, 41).map(m=> Math.round(capAt(m) * G.regenMs / 3600000 * 10) / 10), c: 2, step: true}],
      xName: 'Map', xLabel: 'Map (max Energy as the Resources tab assumes: ' + caps.map(([m, c])=> c + ' from Map ' + m).join(', ') + ')', yLabel: 'fights, or hours', tipFmt: v=> String(v)});
    $('cvEnNote').innerHTML = `Energy comes back <b>1 every ${G.regenMs / 60000} minutes</b>, so a bar of ${caps[caps.length - 1][1]} refills in ${Math.round(caps[caps.length - 1][1] * G.regenMs / 360000) / 10} hours. The Nest, Forge and Tavern steps are the game's <code>STAMINA_PLACES</code> table; costs per fight are <code>mapEnergyBase</code> and <code>ENERGY_COST</code> in <code>arena_app.js</code>.`;
  }
  function drawRes(){
    const el = $('cvResWrap'); if(!RES){ el.innerHTML = '<p class="dec-empty">Run node tools/resources_week_2026_10_23.js to get the resource curves.</p>'; return; }
    const R = RES.road, xs = R.map(r=> r.map);
    chart($('cvRes1'), {title: 'First-clear rewards, running total by map', xs, series: [{name: 'Maple Leaves', ys: R.map(r=> r.gold), c: 3}, {name: 'Magic Dust', ys: R.map(r=> r.dust), c: 4}], xName: 'Through Map', xLabel: 'Map', yLabel: 'running total',
      tips: R.map(r=> `${esc(r.name)}: ${r.fights} fights in all`)});
    chart($('cvRes2'), {title: 'Energy to clear the road once, running total', xs, series: [{name: 'Energy', ys: R.map(r=> r.energy), c: 1}], xName: 'Through Map', xLabel: 'Map', yLabel: 'Energy'});
    $('cvWeekRows').innerHTML = RES.weeks.map(w=> `<tr><td>Map ${w.map} ${esc(w.mapName)}</td><td>${esc(w.farm)}</td><td class="num">${w.fightsPerDay}</td><td class="num">${n0(w.week.gold)}</td><td class="num">${n0(w.week.dust)}</td><td class="num">${n0(w.week.xp)}</td><td class="num">${n0(w.week.energy)}</td></tr>`).join('');
  }
  function build(){
    const host = $('cvHost'); if(!host || host.dataset.built) return; host.dataset.built = '1';
    host.innerHTML = `<div class="dec-head"><h2>Curves</h2><p>The player's level, the Forge and the Energy and resource curves, read from the game's own code and tables (<code>arena_app.js</code>, <code>canonical/upgrade-costs.json</code>). Hover a chart (or touch it) for the values. Nothing here changes the game: to change a curve, ask for the action item (the XP re-fit is <b>B2</b>, decided, not built yet).</p></div>`
      + `<section class="cv-sec"><h3>⭐ Player level and XP</h3>`
      + `<div class="cv-call"><b>Levels 15-25 are marked.</b> Owner, 10-25 17:53: "it was so ez to reach level 15. But 15-25 was a drag ... make the exponential part extremely gentle, and instead strengthen the linear part." The formula is <code>xpToNext(L)</code> = round(200 + 50(L-1) + 20(1.12<sup>L-1</sup> - 1)); XP comes mostly from quests and milestones, with a trickle of 3 a win.</div>`
      + `<div id="cvXpSum" class="cv-sum"></div>`
      + fig('cvXp1', 'XP needed for each level', 'The linear part dominates for the first levels; the exponential part passes it near Level 40.') + fig('cvXp2', 'Total XP to reach each level', '')
      + `<details class="cv-try"><summary>Try a curve (not saved, not sent anywhere)</summary><p class="cv-dim">XP to next = round(a + b(L-1) + c(g<sup>L-1</sup> - 1)). Move the numbers and watch the dashed line and the table. The game's values are a=200, b=50, c=20, g=1.12.</p>`
      + `<div class="cv-inputs">${[['a', 'a: base', 1], ['b', 'b: linear per level', 1], ['c', 'c: exponential part', 1], ['g', 'g: growth per level', 0.005]].map(([k, l, st])=> `<label>${l}<input type="number" data-trial="${k}" step="${st}" value="${trial[k]}" inputmode="decimal"></label>`).join('')}<button type="button" id="cvReset">Reset to the game's</button></div></details>`
      + `<div class="bal-wrap"><table class="bal-t cv-t"><thead id="cvXpHead"></thead><tbody id="cvXpRows"></tbody></table></div></section>`
      + `<section class="cv-sec"><h3>🔨 Crafting and the Forge</h3><p class="cv-dim">A Common's step from Level L to L+1 costs <code>forgeStepDust[L]</code> Dust and two thirds of that in Maple Leaves; other rarities pay it times their multiplier. Level 0 to 1 is one Materia Mote. A limit break (10 to 11) costs ${U.limitBreakCostMult}x the whole road to 10. Levels 5-8 open on Map ${G.levelGateMap(5)}, 9 on Map ${G.levelGateMap(9)}, 10 on Map ${G.levelGateMap(10)} and the limit break on Map ${G.levelGateMap(11)} (the vertical lines).</p>`
      + `<label class="ct-chk cv-log"><input type="checkbox" id="cvLog" checked> log scale</label>` + fig('cvForge1', 'Dust spent to reach each Forge level, by rarity', '')
      + `<label class="cv-pick">Cost of each step for <select id="cvRar">${RAR.map(r=> `<option value="${r}">${esc(RL[r] || r)}</option>`).join('')}</select></label>` + fig('cvForge2', 'Cost of each step', '')
      + `<h4>By rarity (Level 1 to 10)</h4><div class="bal-wrap"><table class="bal-t cv-t"><thead><tr><th>Rarity</th><th>Multiplier</th><th>Dust, 1 to 10</th><th>Leaves, 1 to 10</th><th>Dust, limit break</th><th>Duplicates for a limit break</th><th>A duplicate feeds</th><th>Disenchant gives Dust</th></tr></thead><tbody id="cvForgeRows"></tbody></table></div>`
      + `<h4>The Forge tiers</h4><div class="bal-wrap"><table class="bal-t cv-t"><thead><tr><th>Tier</th><th>Name</th><th>Level cap</th><th>Up to</th><th>Opens</th><th>Maple Leaves</th><th>Dust</th><th>Strange</th></tr></thead><tbody id="cvTierRows"></tbody></table></div>`
      + `<p class="cv-dim">Edit these numbers in the 💰 Upgrade &amp; Forge costs tab; this page reads <code>canonical/upgrade-costs.json</code>.</p></section>`
      + `<section class="cv-sec"><h3>⚡ Energy</h3><p class="cv-dim" id="cvEnNote"></p>` + fig('cvEn1', 'Max Energy by upgrade step', 'Hover for the Dust and materials each step needs.') + fig('cvEn2', 'Magic Dust per Energy step', '')
      + fig('cvEn3', 'Energy a fight costs, by map', 'It climbs fast to Map 3, then slowly.') + fig('cvEn4', 'Fights on a full Energy bar', '') + `</section>`
      + `<section class="cv-sec" id="cvResWrap"><h3>🪙 Resources along the road</h3><p class="cv-dim">Estimates from <code>docs/balance/resources-2026-10-23.json</code> (a dedicated player; the assumptions are in the 🪙 Resources tab). They are first-clear rewards only, summed map by map.</p>`
      + fig('cvRes1', 'First-clear rewards, running total by map', '') + fig('cvRes2', 'Energy to clear the road once, running total', '')
      + `<h4>A week of play at three points of the road</h4><div class="bal-wrap"><table class="bal-t cv-t"><thead><tr><th>Where</th><th>Farm</th><th>Fights a day</th><th>Maple Leaves</th><th>Dust</th><th>XP</th><th>Energy used</th></tr></thead><tbody id="cvWeekRows"></tbody></table></div></section>`;
    host.addEventListener('input', e=>{ const k = e.target.dataset && e.target.dataset.trial; if(!k) return; const v = parseFloat(e.target.value); if(isFinite(v)){ trial[k] = v; drawXp(); } });
    host.addEventListener('change', e=>{ if(e.target.id === 'cvLog' || e.target.id === 'cvRar') drawForge(); });
    host.addEventListener('click', e=>{ if(e.target.id === 'cvReset'){ Object.assign(trial, {a: 200, b: 50, c: 20, g: 1.12}); host.querySelectorAll('[data-trial]').forEach(i=> i.value = trial[i.dataset.trial]); drawXp(); } });
    drawXp(); drawForge(); drawEnergy(); drawRes();
  }
  hub.onShow.curves = build;
})();
