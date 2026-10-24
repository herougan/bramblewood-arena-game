#!/usr/bin/env python3
"""EN6 (2026-10-24, owner 03:17 + 12:02 #11 "03:17 - all"): the page's side (arena_app.js, arena_template.html), applied once.
Registry rows (card editor, Codex, skill lists), card lines, the trigger editor's "– bramble" box and its card text, the board's pips, floats,
log lines and looks, the Seasons field option. The engine decides (bramblewood-engine.js, the EN6 block).
  python3 tools/en6_app_2026_10_24.py"""
import os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(ROOT, 'arena_app.js'); T = os.path.join(ROOT, 'arena_template.html')
s = open(A, encoding='utf-8').read()
if 'EN6_STATE_KEYS' in s: sys.exit('already applied')
def rep(old, new, after=False):
    global s
    assert s.count(old) == 1, (s.count(old), old[:100])
    s = s.replace(old, (old + new) if after else new)

REG = r'''
// ==== Package EN6 (2026-10-24, owner 03:17: "1. Based on number of cards in hand ... 2. Actions: Some actions like arrow - can have a subtoggle -
// bramble ... 3. Temperature based ... 4. What about 'salty'? ... like RAIN - {}, what else? ... hibernate?"; 12:02 #11 "03:17 - all"). Rules in
// bramblewood-engine.js (the EN6 block); priced in canonical/skill-costs.json and bramblewood-budget.js (EN6_UPTIME):
//   Plenty / Scarcity / Foe's Plenty / Foe's Scarcity – {…}   you (the opponent) hold 4+ cards / 1 or fewer
//   Heat / Frost / Rain / Storm / Fog / Salt / Drought – {…}  the field's temperature and weather; Season (X) – {…} in that season of the cycle
//   Full Hand N / Lean N (and the Foe's)                       +N Attack per card in hand / per empty slot
//   Hibernate N                                                asleep in the cold, healing N a round
//   Arrow / Fire Arrow / Fire Bolt – bramble                   the shot aims at the enemy bramble (the trigger editor's box does it for actions)
// The state skills share EN5's machinery: their keys join EN5_STATE_KEYS (the lit pip, the float, the log line) and EN5_STATE_DEFAULT_APP.
const EN6_SEASONS_APP = ['spring', 'summer', 'autumn', 'winter'];
const EN6_SEASON_ICO = {spring:'🌱', summer:'☀️', autumn:'🍂', winter:'⛄'};
function en6SeasonOfApp(e){ const v = e && e.season, k = typeof v === 'string' ? v.toLowerCase() : 'winter'; return EN6_SEASONS_APP.includes(k) ? k : 'winter'; }
function en6SeasonName(k){ return TX('ui.en6-season-' + (EN6_SEASONS_APP.includes(k) ? k : 'winter')); }
const EN6_STATE_DEFAULT_APP = {plenty:{attack: 1, health: 1}, scarcity:{attack: 1}, foePlenty:{health: 2}, foeScarcity:{attack: 1}, heat:{attack: 1}, frost:{health: 2}, rain:{attack: 1, health: 1}, storm:{attack: 2}, fog:{evasive: true}, salt:{armor: 1}, drought:{attack: 1}, season:{attack: 1, health: 1}};
const EN6_STATE_KEYS = {plenty:{tx:'plenty', ico:'🃏'}, scarcity:{tx:'scarcity', ico:'🫗'}, foePlenty:{tx:'foe-plenty', ico:'🎴'}, foeScarcity:{tx:'foe-scarcity', ico:'🪹'}, heat:{tx:'heat', ico:'🌡️'}, frost:{tx:'frost', ico:'❄️'},
  rain:{tx:'rain', ico:'☔'}, storm:{tx:'storm', ico:'⛈️'}, fog:{tx:'fog', ico:'🌁'}, salt:{tx:'salt', ico:'🧂'}, drought:{tx:'drought', ico:'🔆'}, season:{tx:'season', ico:'🍂'}};
Object.assign(EN5_STATE_DEFAULT_APP, EN6_STATE_DEFAULT_APP); Object.assign(EN5_STATE_KEYS, EN6_STATE_KEYS);
Object.keys(EN6_STATE_KEYS).filter(k=> k !== 'season').forEach(k=>{ const t = EN6_STATE_KEYS[k].tx;
  sk1Patch(PASSIVE_DEFS, k, {category:'passive', label:TX('ui.skn-' + t), kind:'boolean', desc:(v, n, e)=> TX('ui.sk-' + t, {skills: grantText(en5StateOfApp(k, e))}), codexNote:TX('ui.sk-' + t + '-codex'),
    get:e=> (e[k] && !(e[k + 'Grant'] && typeof e[k + 'Grant'] === 'object')) ? true : undefined});
  sk1Patch(PASSIVE_DEFS, k + 'Grant', {category:'passive', label:TX('ui.skn-' + t), kind:'grant', placeholder:grantToText(EN6_STATE_DEFAULT_APP[k]), desc:v=> TX('ui.sk-' + t, {skills: grantText(typeof v === 'string' ? parseGrantText(v) : (v || {})) || TX('ui.cx-nothing')}), codexNote:TX('ui.sk-' + t + '-codex'),
    get:e=> e[k + 'Grant'] && typeof e[k + 'Grant'] === 'object' ? grantToText(e[k + 'Grant']) : undefined, apply:(e, v)=>{ const g = parseGrantText(v); if(Object.keys(g).length){ e[k + 'Grant'] = g; e[k] = true; } }}); });
// Season (X) – {…}: the season is the skill's value (a pick in the editor); its braces are seasonGrant (the default +1/+1)
sk1Patch(PASSIVE_DEFS, 'season', {category:'passive', label:TX('ui.skn-season'), kind:'select', selectOptions:()=> EN6_SEASONS_APP.map(k=> ({value:k, label:`${EN6_SEASON_ICO[k]} ${en6SeasonName(k)}`})),
  desc:(v, n, e)=> TX('ui.sk-season', {season: en6SeasonName(typeof v === 'string' && EN6_SEASONS_APP.includes(v) ? v : en6SeasonOfApp(e)), skills: grantText(en5StateOfApp('season', e))}), codexNote:TX('ui.sk-season-codex'),
  get:e=> e.season ? en6SeasonOfApp(e) : undefined, apply:(e, v)=>{ e.season = EN6_SEASONS_APP.includes(String(v)) ? String(v) : 'winter'; }});
sk1Patch(PASSIVE_DEFS, 'seasonGrant', {category:'passive', label:TX('ui.skn-season'), kind:'grant', placeholder:grantToText(EN6_STATE_DEFAULT_APP.season), desc:(v, n, e)=> TX('ui.sk-season', {season: en6SeasonName(en6SeasonOfApp(e)), skills: grantText(typeof v === 'string' ? parseGrantText(v) : (v || {})) || TX('ui.cx-nothing')}), codexNote:TX('ui.sk-season-codex'),
  get:e=> e.seasonGrant && typeof e.seasonGrant === 'object' ? grantToText(e.seasonGrant) : undefined, apply:(e, v)=>{ const g = parseGrantText(v); if(Object.keys(g).length){ e.seasonGrant = g; if(!e.season) e.season = 'winter'; } }});
PASSIVE_DEFS.push({key:'fullHand', category:'passive', label:TX('ui.skn-full-hand'), kind:'number', min:1, defaultValue:1, desc:v=> TX('ui.sk-full-hand', {n: numOr(v, 1)}), codexNote:TX('ui.sk-full-hand-codex')},
  {key:'lean', category:'passive', label:TX('ui.skn-lean'), kind:'number', min:1, defaultValue:1, desc:v=> TX('ui.sk-lean', {n: numOr(v, 1)}), codexNote:TX('ui.sk-lean-codex')},
  {key:'foeFullHand', category:'passive', label:TX('ui.skn-foe-full-hand'), kind:'number', min:1, defaultValue:1, desc:v=> TX('ui.sk-foe-full-hand', {n: numOr(v, 1)}), codexNote:TX('ui.sk-foe-hand-codex')},
  {key:'foeLean', category:'passive', label:TX('ui.skn-foe-lean'), kind:'number', min:1, defaultValue:1, desc:v=> TX('ui.sk-foe-lean', {n: numOr(v, 1)}), codexNote:TX('ui.sk-foe-hand-codex')},
  {key:'hibernate', category:'passive', label:TX('ui.skn-hibernate'), kind:'number', min:1, defaultValue:2, desc:v=> TX('ui.sk-hibernate', {n: numOr(v, 2)}), codexNote:TX('ui.sk-hibernate-codex')});
// – bramble on the skill shots: a toggle row beside the shot (its own line folds into the shot's: "Arrow 2 – bramble")
const EN6_BRAMBLE_APP = {arrowBramble:{base:'arrow', tx:'arrow-bramble'}, fireArrowBramble:{base:'fireArrow', tx:'fire-arrow-bramble'}, fireBoltBramble:{base:'fireBolt', tx:'fire-bolt-bramble'}};
const EN6_BRAMBLE_ACTS = ['arrow', 'missile', 'damage'];
Object.keys(EN6_BRAMBLE_APP).forEach(k=>{ const b = EN6_BRAMBLE_APP[k], pd = PASSIVE_DEFS.find(p=> p.key === b.base);
  PASSIVE_DEFS.push({key:k, category:'evergreen', label:TX('ui.skn-' + b.tx), kind:'boolean', desc:()=> TX('ui.sk-shot-bramble', {skill: pd ? pd.label : b.base}), codexNote:TX('ui.sk-shot-bramble-codex')}); });
Object.assign(SKILL_ICON, {plenty:'🃏', plentyGrant:'🃏', scarcity:'🫗', scarcityGrant:'🫗', foePlenty:'🎴', foePlentyGrant:'🎴', foeScarcity:'🪹', foeScarcityGrant:'🪹', heat:'🌡️', heatGrant:'🌡️', frost:'❄️', frostGrant:'❄️',
  rain:'☔', rainGrant:'☔', storm:'⛈️', stormGrant:'⛈️', fog:'🌁', fogGrant:'🌁', salt:'🧂', saltGrant:'🧂', drought:'🔆', droughtGrant:'🔆', season:'🍂', seasonGrant:'🍂',
  fullHand:'✋', lean:'🫳', foeFullHand:'🤚', foeLean:'🫴', hibernate:'🛌', arrowBramble:'🏹', fireArrowBramble:'🏹', fireBoltBramble:'🔥'});
'''
rep("Object.assign(SKILL_ICON, {breach:'🧱', canopyCover:'🌳', timbered:'🪵', timberedGrant:'🪵', bedrock:'🪨', bedrockGrant:'🪨', forged:'🔩', forgedGrant:'🔩', lastStand:'🏳️', lastStandGrant:'🏳️'});\n", REG, after=True)

# card lines: Season (X), the shot – bramble, no double lines
rep("    if(p.key==='arrowCount') return; // 2026-10-17: read on the Arrow line, which repeats\n",
    "    if(p.key==='seasonGrant' && e.season) return; // EN6 (2026-10-24): the Season line says its braces\n"
    "    if(EN6_BRAMBLE_APP[p.key] && e[EN6_BRAMBLE_APP[p.key].base]) return; // EN6: read on the shot's own line (\"Arrow 2 – bramble\")\n"
    "    if(p.key==='season'){ lines.push(`${ic('season')}${escapeHtml(TX('ui.skn-season'))} (${EN6_SEASON_ICO[en6SeasonOfApp(e)]} ${escapeHtml(en6SeasonName(en6SeasonOfApp(e)))}) — ${skillText(p, v, e)}`); return; } // EN6\n"
    "    { const bk = Object.keys(EN6_BRAMBLE_APP).find(k=> EN6_BRAMBLE_APP[k].base === p.key); if(bk && e[bk]){ lines.push(`${ic(p.key)}${p.label}${valSuffix(v)} – ${escapeHtml(TX('ui.en6-bramble'))} — ${escapeHtml(TX('ui.en6-shot-bramble-line', {n: numOr(v, 1)}))}`); return; } } // EN6 (2026-10-24, owner 03:17 #2)\n"
    "    if(p.key==='arrowCount') return; // 2026-10-17: read on the Arrow line, which repeats\n")

# trigger editor: the – bramble box, its reading, its card text
rep("  return html;\n}\nfunction readEditorFormIntoCard(){",
    "  // EN6 (2026-10-24, owner 03:17 #2: \"Some actions like arrow - can have a subtoggle - bramble\"): Arrow, Missile and Deal damage at one opponent\n"
    "  if(EN6_BRAMBLE_ACTS.includes(t.do) && (t.do !== 'damage' || ((t.who || 'enemy') === 'enemy' && t.sub !== 'all'))) html += `<label class=\"en6-bramble-tg\" title=\"${escapeAttr(TX('ui.en6-ed-bramble-tip'))}\"><input type=\"checkbox\" data-t=\"bramble\" data-i=\"${i}\"${t.bramble ? ' checked' : ''}> ${escapeHtml(TX('ui.en6-ed-bramble'))}</label>`;\n"
    "  return html;\n}\nfunction readEditorFormIntoCard(){")
rep("  const costEl = row.querySelector('[data-t=\"cost\"]'); // Pay: Burn 1 Lumber (2026-10-16)\n",
    "  { const brEl = row.querySelector('[data-t=\"bramble\"]'); if(brEl && brEl.checked && EN6_BRAMBLE_ACTS.includes(t.do)) t.bramble = true; } // EN6 (2026-10-24): – bramble\n"
    "  const costEl = row.querySelector('[data-t=\"cost\"]'); // Pay: Burn 1 Lumber (2026-10-16)\n")
rep("    if(key==='defId') t.defId = e.target.value;\n  });",
    "    if(key==='defId') t.defId = e.target.value;\n    if(key==='bramble'){ if(e.target.checked) t.bramble = true; else delete t.bramble; } // EN6 (2026-10-24)\n  });")
rep("  if(t.cost === 'burnLumber') doText = `burn 1 Lumber (if you have it), then ${doText}`; // the cost step (2026-10-16)\n",
    "  if(t.bramble && EN6_BRAMBLE_ACTS.includes(t.do)) doText = t.do === 'arrow' ? TX('ui.en6-trig-arrow-bramble', {n: amt}) : t.do === 'missile' ? TX('ui.en6-trig-missile-bramble', {n: amt}) : TX('ui.en6-trig-damage-bramble', {n: amt, type: dmgType === FILL ? '' : dmgWord(dmgType)}); // EN6 (2026-10-24): \"Arrow 2 – bramble\"\n"
    "  if(t.cost === 'burnLumber') doText = `burn 1 Lumber (if you have it), then ${doText}`; // the cost step (2026-10-16)\n")

# board: the Hibernate pip; log lines; looks
rep("  try{ en5StatusBadges(c, badges); }catch(e){} // the state skills on (2026-10-24, package EN5)\n",
    "  try{ en5StatusBadges(c, badges); }catch(e){} // the state skills on (2026-10-24, package EN5)\n"
    "  try{ en6StatusBadges(c, badges); }catch(e){} // Hibernate asleep (2026-10-24, package EN6)\n")
rep("  { const w5 = en5LogText(ev, nm); if(w5) return w5; } // EN5 (2026-10-24): Breach, Canopy Cover, the state skills\n",
    "  { const w5 = en5LogText(ev, nm); if(w5) return w5; } // EN5 (2026-10-24): Breach, Canopy Cover, the state skills\n"
    "  { const w6 = en6LogText(ev, nm); if(w6) return w6; } // EN6 (2026-10-24): Hibernate, the season, – bramble\n")
rep("  try{ en5Vfx(ev); }catch(e){} // EN5 (2026-10-24)\n",
    "  try{ en5Vfx(ev); }catch(e){} // EN5 (2026-10-24)\n  try{ en6Vfx(ev); }catch(e){} // EN6 (2026-10-24)\n")
VFX = r'''// ---- EN6 (2026-10-24, owner 03:17 / 12:02 #11): Hibernate's sleep (the 🛌 pip, its float, the heal's motes come from the plain heal), the season
// turning (a log line and a float over the board), a – bramble action's arrow into the enemy bramble. The state skills' pips and floats are EN5's.
function en6StatusBadges(c, badges){ if(!c || !c.hibernating) return; badges.push(`<span class="abadge en6-hib" title="${escapeAttr(TX('ui.en6-hib-tip'))}">🛌</span>`); }
function en6LogText(ev, nm){
  if(!ev) return null;
  if(ev.type === 'statusFx' && ev.kind === 'hibernate') return {cls:'', text:TX(ev.on ? 'ui.en6-log-hib-on' : 'ui.en6-log-hib-off', {name: nm(ev.targetDefId)})};
  if(ev.type === 'heal' && ev.cause === 'hibernate') return {cls:'heal', text:TX('ui.en6-log-hib-heal', {name: nm(ev.targetDefId), n: ev.amount})};
  if(ev.type === 'season') return {cls:'gold', text:TX('ui.en6-log-season', {season: en6SeasonName(ev.season)})};
  if(ev.type === 'brambleShot') return {cls:'', text:TX(ev.targetSide === 'B' ? 'ui.en6-log-bramble-foe' : 'ui.en6-log-bramble-you', {name: nm(ev.defId), d: ev.amount})};
  return null;
}
function en6Vfx(ev){
  if(!ev || !matchState) return; const m = matchState;
  if(ev.type === 'statusFx' && ev.kind === 'hibernate'){ const rc = m.replayCards && m.replayCards[ev.targetUid]; if(rc){ rc.hibernating = !!ev.on; rc.asleep = ev.on ? Math.max(1, rc.asleep || 0) : 0; }
    try{ updateCardStatusDisplay(ev.targetUid); }catch(e){} const el = boardCardEl(ev.targetUid); if(!el) return;
    try{ floatText(el, ev.on ? `🛌 ${TX('ui.en6-float-hib')}` : TX('ui.en6-float-wake'), ev.on ? 'buff' : 'faded'); }catch(e){}
    if(ev.on){ try{ tintPulse(el, 'en6-hib-pulse'); }catch(e){} } else el.classList.remove('en6-hib-pulse'); }
  if(ev.type === 'season'){ const bf = document.getElementById('battlefieldEl') || document.body; try{ floatText(bf, `${EN6_SEASON_ICO[ev.season] || '🍂'} ${en6SeasonName(ev.season)}`, 'buff', {big: true}); }catch(e){} }
  if(ev.type === 'brambleShot'){ setTimeout(()=>{ if(matchState !== m) return; const src = boardCardEl(ev.uid), hq = hqTileEl(ev.targetSide); if(!src || !hq || !hasGsap() || reducedMotion() || !fxAtLeast('low')) return;
    const a = en2Ctr(src), b = en2Ctr(hq), ar = en2Layer('🏹', 'en6-bramble-arrow'); gsap.set(ar, {x:a.x, y:a.y, xPercent:-50, yPercent:-50, scale:.7, opacity:0, rotation:Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 45});
    gsap.timeline({onComplete:()=>{ ar.remove(); try{ en2Ring(b.x, b.y, 60); }catch(e){} }}).to(ar, {opacity:1, duration:.06}).to(ar, {x:b.x, y:b.y, duration:.3, ease:'power1.in'}).to(ar, {opacity:0, scale:1.2, duration:.1}); }, 60); }
}
'''
rep("function renderVfxForEvent(ev){\n", VFX + "function renderVfxForEvent(ev){\n")
# replay snapshots carry Hibernate
rep("en5On:rc.en5On||'' /* EN5 */,", "en5On:rc.en5On||'' /* EN5 */, hibernating:!!rc.hibernating /* EN6 */,")
rep("en5On:c._en5On||'' /* EN5 (2026-10-24): the state skills on */,", "en5On:c._en5On||'' /* EN5 (2026-10-24): the state skills on */, hibernating:!!c.hibernating /* EN6 (2026-10-24): Hibernate asleep */,")
# the Seasons field option (off by default; Edit skirmish lists it)
rep("  wildfire:     {icon:'🔥', name:TX('ui.fx-name-wildfire'), editor:'wildfire', short:TX('ui.fx-wildfire-short'), text:TX('ui.fx-wildfire'), codex:TX('ui.fxx-wildfire')},\n});",
    "  wildfire:     {icon:'🔥', name:TX('ui.fx-name-wildfire'), editor:'wildfire', short:TX('ui.fx-wildfire-short'), text:TX('ui.fx-wildfire'), codex:TX('ui.fxx-wildfire')},\n"
    "  // 2026-10-24 (package EN6, owner 03:17 #4): rules.seasons, a slow cycle of the four seasons (3 rounds each; a number on the flag sets the length),\n"
    "  // off by default and on no map yet. Season (X) – {…} reads it; Summer counts as hot and Winter as cold (the engine's en6Season).\n"
    "  seasons:      {icon:'🍂', name:TX('ui.fx-name-seasons'), editor:'seasons', short:TX('ui.fx-seasons-short'), text:TX('ui.fx-seasons', {n: 3}), codex:TX('ui.fxx-seasons')},\n});")
open(A, 'w', encoding='utf-8').write(s)

t = open(T, encoding='utf-8').read()
CSS = '''
/* 2026-10-24 (package EN6): Hibernate's pip and its cold blue sleep, a – bramble action's arrow, the trigger editor's – bramble box */
.abadge.en6-hib{background:color-mix(in srgb, #7fb6ea 32%, var(--surface-2)); box-shadow:0 0 5px rgba(120,180,240,.75);}
.board-card.en6-hib-pulse{filter:saturate(.7) brightness(.95) drop-shadow(0 0 6px rgba(140,190,255,.8))}
.sfx.en6-bramble-arrow{font-size:22px;pointer-events:none;z-index:60}
.en6-bramble-tg{display:inline-flex;align-items:center;gap:4px;font-size:12px;margin-left:6px;white-space:nowrap}
'''
anchor = '.abadge.en5-state'
i = t.find(anchor); assert i > 0
j = t.find('\n', t.find('}', i)) + 1
t = t[:j] + CSS + t[j:]
open(T, 'w', encoding='utf-8').write(t)
print('app + template: EN6 applied')
