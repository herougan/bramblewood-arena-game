import json, re, os
ROOT='/home/claude/bramblewood-arena-game'
idx=open(f'{ROOT}/index.html').read()
a=idx.index('<style>')+7; b=idx.index('</style>',a); gamecss=idx[a:b]
cards=json.load(open(f'{ROOT}/.fxcat/cards.json'))
fx=open(f'{ROOT}/.fxcat/fx-src.js').read()
shaders=open(f'{ROOT}/bramblewood-shaders.js').read()
skillfx=open(f'{ROOT}/bramblewood-skillfx.js').read()
C=lambda k,v='plain': cards[k][v]
page_css = r'''
/* Effects Lab — the game's own stylesheet above, plus this page's layout. */
.lab{max-width:1180px; margin:0 auto; padding:24px 16px 80px; color:var(--ink);}
.lab h1{font-family:'Baloo 2',system-ui,sans-serif; font-size:clamp(28px,4vw,40px); margin:0; line-height:1.05;}
.lab .lede{max-width:70ch; color:var(--ink-muted); margin:6px 0 0;}
.lab nav.toc{display:flex; flex-wrap:wrap; gap:8px; margin:16px 0 8px; position:sticky; top:env(safe-area-inset-top,0px); z-index:50; padding:8px 0; background:color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter:blur(6px);}
.lab nav.toc a{font:700 13px 'Baloo 2',system-ui,sans-serif; padding:5px 12px; border-radius:999px; background:var(--surface-2); color:var(--ink); text-decoration:none; border:1px solid var(--surface-border);}
.lab section{margin-top:28px;}
.lab h2{font-family:'Baloo 2',system-ui,sans-serif; font-size:24px; margin:0 0 4px;}
.lab .sec-sub{color:var(--ink-muted); margin:0 0 14px; max-width:75ch;}
.fx.tbc{opacity:.85; border-style:dashed;} .fx.tbc h3{font-size:15px;}
.fx-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(250px,1fr)); gap:14px;}
.fx{background:var(--surface); border:1px solid var(--surface-border); border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:10px; min-width:0;}
.fx h3{margin:0; font:800 15px 'Baloo 2',system-ui,sans-serif; display:flex; align-items:center; gap:8px; justify-content:space-between;}
.fx p{margin:0; font-size:13px; color:var(--ink-muted); line-height:1.4;}
.fx .where{font-size:11.5px; color:var(--ink-soft);}
.st{font:800 10.5px 'Baloo 2',system-ui,sans-serif; padding:2px 8px; border-radius:999px; white-space:nowrap;}
.st.live{background:#2f7d3a; color:#fff;} .st.part{background:#b5651d; color:#fff;} .st.idea{background:var(--surface-3); color:var(--ink);}
.stage{position:relative; min-height:170px; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:10px; background:var(--surface-2); overflow:visible;}
.stage.dark{background:#1b2416;}
.stage .card-tile{width:110px !important; height:138px !important; margin:0;}
#breathStage .card-tile{width:72px !important; height:92px !important;}
.stage .board-card{position:relative;}
.btns{display:flex; flex-wrap:wrap; gap:6px;}
.btns .btn{font-size:12px;}
.bf-lab{position:relative; height:360px; border-radius:16px; overflow:hidden; background:#2c3b22;}
.bf-lab .bf-cards{position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:18px; z-index:2; pointer-events:none;}
.bf-lab .bf-cards .card-tile{width:96px !important; height:120px !important; pointer-events:auto;}
.bf-controls{display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin:10px 0 0;}
.bf-controls select{font:inherit; padding:6px 10px; border-radius:8px; border:1px solid var(--surface-border); background:var(--surface); color:var(--ink);}
.snd-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:8px;}
.snd-grid .btn{justify-content:flex-start; font-size:12.5px; width:100%;}
.lab table{width:100%; border-collapse:collapse; font-size:13px;}
.lab .tbl{overflow-x:auto; border:1px solid var(--surface-border); border-radius:12px;}
.lab th, .lab td{text-align:left; padding:7px 10px; border-bottom:1px solid var(--surface-border); vertical-align:top;}
.lab th{font:800 12px 'Baloo 2',system-ui,sans-serif; background:var(--surface-2); position:sticky; top:0;}
.mini-vignette{position:absolute; inset:0; border-radius:12px; box-shadow:inset 0 0 50px 8px rgba(190,20,20,.6); animation:dangerPulse 1.05s ease-in-out infinite; pointer-events:none;}
.motes{position:absolute; inset:0; width:100%; height:100%; border-radius:12px; background:#1e2618;}
.dash-demo{width:100%; height:150px;}
.dash-demo line{stroke:#ffd77a; stroke-width:4; stroke-dasharray:9 7; stroke-linecap:round; animation:facingFlow .55s linear infinite;}
.mock-gy{position:relative; padding:10px 18px; border-radius:999px; border:2px solid var(--gold); background:var(--gold-soft); font:800 13px 'Baloo 2',system-ui,sans-serif; color:var(--accent-strong);}
.leak-pack{position:relative; padding:20px 26px; border-radius:16px; background:linear-gradient(160deg,#c98a3a,#7a4a18); border:3px solid #f3d38c; color:#fff6dc; font:800 14px 'Baloo 2',system-ui,sans-serif; display:flex; flex-direction:column; align-items:center; gap:4px;}
.leak-pack span{font-size:40px;}

.skill-arena{position:relative; border-radius:16px; padding:22px 12px; background:radial-gradient(ellipse at 50% 40%, #3a4d2c, #1f2a18); display:flex; flex-direction:column; gap:70px; align-items:center; overflow:visible;}
.sk-row{display:flex; gap:22px; justify-content:center;}
.sk-row .card-tile{width:104px !important; height:130px !important; margin:0;}
.sk-btns{margin-top:12px; align-items:center;}
.sk-slow{display:flex; align-items:center; gap:6px; font-size:13px; color:var(--ink-muted); margin-left:6px;}
.breathe .card-tile{animation:breathe 3.2s ease-in-out infinite;}
.breathe > :nth-child(2) .card-tile{animation-delay:-1.1s;} .breathe > :nth-child(3) .card-tile{animation-delay:-2.2s;}
@keyframes breathe{50%{transform:translateY(-2.5px) scale(1.006);}}
.shine-sweep{position:absolute; inset:0; border-radius:inherit; overflow:hidden; pointer-events:none; z-index:9;}
.shine-sweep::before{content:''; position:absolute; top:-20%; bottom:-20%; width:38%; left:-60%; transform:skewX(-20deg); background:linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent); animation:shineGo .75s ease-in-out forwards;}
@keyframes shineGo{to{left:130%;}}
.ready-flare{box-shadow:0 0 0 3px #ffd56e, 0 0 24px 6px rgba(255,200,80,.75) !important; transition:box-shadow .2s;}
.dust-puff{position:absolute; width:16px; height:16px; border-radius:50%; background:radial-gradient(circle, rgba(220,200,160,.9), rgba(220,200,160,0) 70%); pointer-events:none; z-index:5;}
@media (max-width:560px){ .sk-row{gap:8px;} .sk-row .card-tile{width:76px !important; height:95px !important;} .skill-arena{gap:44px;} }
@media (max-width:560px){ .bf-lab{height:300px;} .bf-lab .bf-cards .card-tile{width:72px !important; height:90px !important;} }
'''
def stage_card(k, holo=False, extra=''):
    return f'<div class="board-card" data-demo="{k}">{C(k, "holo" if holo else "plain")}</div>'
html = f'''<title>Bramblewood Effects Lab</title>
<link rel="stylesheet" href="fonts/fonts.css">
<style>{gamecss}</style>
<style>{page_css}</style>
<div class="lab">
<header>
  <h1>Bramblewood Effects Lab</h1>
  <p class="lede">Every animation, light, shader and sound in the game so far, live. Cards here use the game's own stylesheet and art. Hover the foil cards, press the buttons, and use headphones for the sound section. Status: <span class="st live">Live</span> in the game, <span class="st part">Partly</span> built, <span class="st idea">Idea</span> not built yet.</p>
</header>
<nav class="toc"><a href="#skills">Skills ✨new</a><a href="#cardnew">Card ideas ✨new</a><a href="#cards">Cards</a><a href="#combat">Combat</a><a href="#battlefield">Battlefield shaders</a><a href="#screens">Screens</a><a href="#sound">Sound</a><a href="#ambience">Ambience</a><a href="#tbc">Coming next</a><a href="#all">Full list</a></nav>


<section id="skills"><h2>Combat skills <span class="st idea" style="vertical-align:middle">new</span></h2><p class="sec-sub">Choreographed skill effects. Arrow and Fire Arrow are now live in the game with this exact animation: the archer draws (leans back while the arrow is pulled along the line of fire), releases with a snap-forward recoil and a bowstring ring, the arrow arcs and accelerates, then sticks and quivers as the target is knocked back. The rest are new prototypes for skills we have, ready to wire in.</p>
<div class="skill-arena" id="skillArena">
  <div class="sk-row sk-enemy">{{SK_T1}}{{SK_T2}}{{SK_T3}}</div>
  <div class="sk-row sk-mine">{{SK_ALLY1}}{{SK_SHOOTER}}{{SK_ALLY2}}</div>
</div>
<div class="btns sk-btns">
  <button class="btn primary" data-skill="arrow">🏹 Arrow</button><button class="btn primary" data-skill="fire">🔥 Fire Arrow</button>
  <button class="btn" data-skill="volley">🏹🏹 Volley</button><button class="btn" data-skill="pierce">➶ Pierce</button><button class="btn" data-skill="dart">🧪 Poison dart</button>
  <button class="btn" data-skill="frost">❄️ Frost bolt</button><button class="btn" data-skill="lightning">⚡ Chain lightning</button><button class="btn" data-skill="heal">💚 Heal</button>
  <button class="btn" data-skill="shield">🛡️ Shield up</button><button class="btn" data-skill="rally">🚩 Rally</button>
  <label class="sk-slow"><input type="checkbox" id="skSlow"> Slow motion (×4)</label>
</div>
<div class="tbl" style="margin-top:12px"><table><thead><tr><th>Skill</th><th>Status</th><th>Beats</th></tr></thead><tbody>
<tr><td>🏹 Arrow</td><td><span class="st live">Live</span></td><td>Draw (lean back, arrow pulled) → release, recoil, string ring → arcing, accelerating flight → stick, quiver, knock-back, splinters</td></tr>
<tr><td>🔥 Fire Arrow</td><td><span class="st live">Live</span></td><td>As Arrow, plus a flame lit on the tip while drawing, an ember trail, a burst of flame, an ignite ring and a scorched edge on the target</td></tr>
<tr><td>🏹🏹 Volley</td><td><span class="st idea">Prototype</span></td><td>One draw, three arrows released in quick succession at up to three targets</td></tr>
<tr><td>➶ Pierce</td><td><span class="st idea">Prototype</span></td><td>The arrow passes through the first target and flies on into the next</td></tr>
<tr><td>🧪 Poison dart</td><td><span class="st idea">Prototype</span></td><td>A thin green dart with dripping trail; green splash ring on hit</td></tr>
<tr><td>❄️ Frost bolt</td><td><span class="st idea">Prototype</span></td><td>A spinning ice shard; shatters into frost and leaves a frosted card for a moment</td></tr>
<tr><td>⚡ Chain lightning</td><td><span class="st idea">Prototype</span></td><td>A flickering forked bolt jumping card to card</td></tr>
<tr><td>💚 Heal · 🛡️ Shield up · 🚩 Rally</td><td><span class="st idea">Prototype</span></td><td>Rising pluses and rings; a shield dome; a banner with golden chevrons rising through allies</td></tr>
</tbody></table></div>
</section>

<section id="cardnew"><h2>Card ideas <span class="st idea" style="vertical-align:middle">new</span></h2><p class="sec-sub">New card animations from the recommendations list, prototyped here so you can judge them before they go in.</p>
<div class="fx-grid">
  <div class="fx"><h3>Summon slam <span class="st idea">Prototype</span></h3><div class="stage dark" id="slamStage">{{C_SLAM}}</div><div class="btns"><button class="btn small" data-card="slam">▶ Play card</button></div><p>The card drops from above, slams down with a squash, kicks up dust and nudges the felt.</p></div>
  <div class="fx"><h3>Hourglass flip on Wait <span class="st idea">Prototype</span></h3><div class="stage" id="waitStage">{{C_WAIT}}</div><div class="btns"><button class="btn small" data-card="wait">▶ Wait ticks down</button></div><p>The ⏳ badge flips like an hourglass and the number rolls down. Teaches Wait without text.</p></div>
  <div class="fx"><h3>Idle breathing <span class="st live">Live</span></h3><div class="stage" id="breathStage">{{C_B1}}{{C_B2}}{{C_B3}}</div><p>Resting cards rise and fall a pixel or two, out of step, so the board never looks paused. Stunned, frozen and sleeping units hold still.</p><div class="where">Board units during a battle</div></div>
  <div class="fx"><h3>Shine sweep <span class="st idea">Prototype</span></h3><div class="stage" id="shineStage">{{C_SHINE}}</div><div class="btns"><button class="btn small" data-card="shine">▶ Sweep</button></div><p>A single diagonal glint crosses a new or upgraded card.</p></div>
  <div class="fx"><h3>Ready pulse <span class="st live">Live</span></h3><div class="stage dark" id="readyStage">{{C_READY}}</div><div class="btns"><button class="btn small" data-card="ready">▶ Becomes ready</button></div><p>When Wait reaches 0 the card flares gold from the edges and gives a small hop: it can fight now.</p></div>
  <div class="fx"><h3>Low-HP tremble <span class="st live">Live</span></h3><div class="stage" id="lowStage">{{C_LOW}}</div><div class="btns"><button class="btn small" data-card="low">Toggle ≤25% HP</button></div><p>A unit at a quarter of its health or less shivers every couple of seconds and its Health turns red.</p><div class="where">Board units</div></div>
  <div class="fx"><h3>Castle cracks <span class="st live">Live</span></h3><div class="stage dark" id="crackStage">{{C_CASTLE}}</div><div class="btns"><button class="btn small" data-crack="0">100%</button><button class="btn small" data-crack="1">≤66%</button><button class="btn small" data-crack="2">≤33%</button><button class="btn small" data-crack="3">≤15%</button></div><p>The castle cracks in three stages as it loses Health; each new crack lands with a jolt and a puff of masonry dust.</p><div class="where">Both castles in a battle</div></div>
  <div class="fx"><h3>Crit stamp <span class="st live">Live</span></h3><div class="stage dark" id="critStage">{{C_CRIT}}</div><div class="btns"><button class="btn small" data-card="crit">▶ Critical hit</button></div><p>A slanted CRIT! stamp on a gold starburst slams onto the card; the number gets the crit look.</p></div>
</div></section>

<section id="tbc"><h2>Coming next <span class="st idea" style="vertical-align:middle">TBC</span></h2><p class="sec-sub">Ideas queued for later. Not built yet; listed so you can veto or reorder them.</p>
<div class="fx-grid"><div class="fx tbc"><h3>🌫️ Heat haze <span class="st idea">TBC</span></h3><p>Shimmering air above fire cards and on the volcano map (shader).</p></div><div class="fx tbc"><h3>🧊 Frost creep <span class="st idea">TBC</span></h3><p>Ice crystals grow in from the corners of a frozen card.</p></div><div class="fx tbc"><h3>💥 Pixel shatter <span class="st idea">TBC</span></h3><p>Tokens burst into pixel squares instead of crumbling.</p></div><div class="fx tbc"><h3>📺 Chromatic glitch <span class="st idea">TBC</span></h3><p>A short RGB split on a shocked or paralysed card.</p></div><div class="fx tbc"><h3>📖 Page curl / pixelate transitions <span class="st idea">TBC</span></h3><p>Codex pages curl; entering a battle pixelates in.</p></div><div class="fx tbc"><h3>🚶 Walking map pawn <span class="st idea">TBC</span></h3><p>Your pawn hops node to node on the Conquest map.</p></div><div class="fx tbc"><h3>🌅 Sudden-death red sky <span class="st idea">TBC</span></h3><p>The battlefield sky bleeds red when sudden death starts.</p></div><div class="fx tbc"><h3>⚡ Storm lightning flash <span class="st idea">TBC</span></h3><p>Storm maps flash white with a delayed thunder roll.</p></div><div class="fx tbc"><h3>✨ Card drag trail <span class="st idea">TBC</span></h3><p>A faint sparkle trail follows a dragged card.</p></div><div class="fx tbc"><h3>🔀 Deck shuffle at match start <span class="st idea">TBC</span></h3><p>Both decks riffle before the first draw.</p></div><div class="fx tbc"><h3>🃏 Draw flip from deck <span class="st idea">TBC</span></h3><p>Drawn cards fly from the deck pile and flip face up.</p></div><div class="fx tbc"><h3>🎺 Victory parade <span class="st idea">TBC</span></h3><p>Survivors march off the board after a win.</p></div><div class="fx tbc"><h3>👑 Leader summon throne <span class="st idea">TBC</span></h3><p>The leader rises on a throne of light when summoned.</p></div><div class="fx tbc"><h3>🎯 Raid telegraph glow <span class="st idea">TBC</span></h3><p>A raid boss glows on the lane it will hit next turn.</p></div><div class="fx tbc"><h3>🌊 Water ripples under cards <span class="st idea">TBC</span></h3><p>Cards dropped on water maps send out ripples (shader).</p></div><div class="fx tbc"><h3>🪶 Feather burst on flyers <span class="st idea">TBC</span></h3><p>Flying units shed feathers when hit.</p></div></div></section>

<section id="cards"><h2>Cards</h2><p class="sec-sub">How cards look at rest and in your collection.</p>
<div class="fx-grid">
  <div class="fx"><h3>Holo foil — three looks <span class="st live">Live</span></h3>
    <div class="stage">{stage_card('rare', True)}{stage_card('epic', True)}{stage_card('legendary', True)}</div>
    <p>Pearl (Rare–Super Rare), rainbow (Epic–Quest Unique), cosmos with glitter (Legendary+). Tilts toward the pointer; drifts on its own.</p><div class="where">Nest, card detail, pack reveals · CSS on the real card</div></div>
  <div class="fx"><h3>Legibility pills and stat chips <span class="st live">Live</span></h3>
    <div class="stage">{stage_card('common')}{stage_card('bee')}</div>
    <p>Dark enamel cost and Wait pills with a bright rim; Attack and Health on dark chips; parchment name scroll.</p><div class="where">Every card</div></div>
  <div class="fx"><h3>Hero card and level-up ring <span class="st live">Live</span></h3>
    <div class="stage"><div class="hero-card-big" id="heroDemo" style="width:110px">{C('epic').replace('class="card-tile', 'class="card-tile is-hero-card', 1)}</div></div>
    <div class="btns"><button class="btn small" data-act="heroLevel">▶ Level up</button><button class="btn small" data-act="materia">💎 Materia burst</button></div>
    <p>Gold ring and 🦸 badge; after a level-up the card lifts inside a rotating ring of light.</p><div class="where">Deck → 🦸 Hero, Forge Materia bench</div></div>
</div></section>

<section id="combat"><h2>Combat</h2><p class="sec-sub">What happens on the board during a fight. Press the buttons; cards reset after each death.</p>
<div class="fx-grid">
  <div class="fx"><h3>Damage numbers <span class="st live">Live</span></h3>
    <div class="stage" id="dmgStage">{stage_card('fire')}</div>
    <div class="btns"><button class="btn small" data-dmg="-3|">−3</button><button class="btn small" data-dmg="-12|">−12 heavy</button><button class="btn small primary" data-dmg="-11|crit">✸ Critical</button><button class="btn small" data-dmg="☠️ -2|poison-tick">☠️ Poison</button><button class="btn small" data-dmg="🩸 -2|bleed-tick">🩸 Bleed</button><button class="btn small" data-dmg="🔥 -4|heat">🔥 Fire hit</button><button class="btn small" data-dmg="❄️ -3|debuff">❄️ Cold hit</button><button class="btn small" data-dmg="+4|heal">Heal</button><button class="btn small" data-dmg="🛡 0|blocked">Blocked</button><button class="btn small" data-dmg="+2|gold">Gold</button></div>
    <p>Chunky face, lit gradient, separate outline; tinted by type with its icon beside the number; bigger for 8+. Critical hits get a spinning gold starburst and a CRIT! stamp on the card.</p><div class="where">All hits, ticks and gains</div></div>
  <div class="fx"><h3>Impact squash and recoil <span class="st live">Live</span></h3>
    <div class="stage" id="squashStage">{stage_card('ant')}</div>
    <div class="btns"><button class="btn small" data-act="squash">▶ Hit</button><button class="btn small" data-act="squashHeavy">▶ Heavy hit (with hit-stop)</button></div>
    <p>The struck card squashes and is knocked away, then springs back. Heavy blows freeze all motion for 70 ms.</p><div class="where">Every melee hit</div></div>
  <div class="fx"><h3>Deaths: bleed-out and burn-away <span class="st live">Live</span></h3>
    <div class="stage" id="deathStage">{stage_card('common')}</div>
    <div class="btns"><button class="btn small primary" data-death="fall">Normal (knocked out)</button><button class="btn small" data-death="bleed">Bleed</button><button class="btn small" data-death="poison">Poison</button><button class="btn small" data-death="cold">Cold</button><button class="btn small" data-death="burn">Burn</button></div>
    <p><b>Normal:</b> the card topples back, greys out and crumbles into leaves and dust. <b>Bleed / poison / cold:</b> a dark wash runs down and drops fall, red, green or icy by cause. <b>Burn:</b> fire deaths burn away from the bottom with embers.</p><div class="where">Card deaths; burn also on a falling castle</div></div>
  <div class="fx"><h3>Victory dance <span class="st live">Live</span></h3>
    <div class="stage">{stage_card('bee').replace('class="board-card"', 'class="board-card is-dancing" style="--dance-delay:0s"',1)}{stage_card('rare').replace('class="board-card"', 'class="board-card is-dancing" style="--dance-delay:.09s"',1)}</div>
    <p>The winner's survivors bob and wiggle in a loose wave.</p><div class="where">Match end</div></div>
  <div class="fx"><h3>Attack preview <span class="st live">Live</span></h3>
    <div class="stage dark"><svg class="dash-demo" viewBox="0 0 300 150"><line x1="150" y1="135" x2="150" y2="15"/></svg></div>
    <p>Hovering a card draws a line beneath the cards to what it will hit; the dashes flow toward the target.</p><div class="where">Battlefield hover</div></div>
  <div class="fx"><h3>Pitch preview <span class="st live">Live</span></h3>
    <div class="stage"><div class="mock-gy discardzone pitch-ready">💀 Graveyard<span class="pitch-badge"><b>+1 🪵</b><small>Lumber</small></span></div></div>
    <p>Pick up a card and the Graveyard glows with what it would pitch for; it grows when you hover it.</p><div class="where">Dragging a hand card</div></div>
</div></section>

<section id="battlefield"><h2>Battlefield shaders</h2><p class="sec-sub">One WebGL layer under the cards: the map's weather, a lit cloth or ground material, point lights for hits, a shockwave, and soft card shadows. Pick a map and fire effects.</p>
<div class="bf-lab battlefield" id="bfLab"><div class="bf-cards">{C('common')}{C('bee')}{C('rare')}</div></div>
<div class="bf-controls">
  <select id="bfKind" aria-label="Map"><option value="0">Forest (Outskirts)</option><option value="1">Water (Sunken Hollow)</option><option value="2">Volcano (Ashen Peak)</option><option value="3">Caves</option><option value="4">Savanna</option><option value="5">Tundra</option><option value="6">Coral</option><option value="7">Swamp</option><option value="8">Foundry</option><option value="9">Sky (Eyrie)</option><option value="10">Storm (Sundered Peak)</option><option value="11">Rain</option></select>
  <select id="bfFelt" aria-label="Floor"><option value="2">Map ground (light only + material)</option><option value="1">Cloth felt</option><option value="0">No floor lighting</option></select>
  <button class="btn small" data-light="physical">💡 Hit light</button><button class="btn small" data-light="heat">🔥 Heat light</button><button class="btn small" data-light="cold">❄️ Cold light</button><button class="btn small" data-light="poison">☠️ Poison light</button><button class="btn small primary" data-act="wave">💥 Shockwave</button>
</div>
<p class="sec-sub" style="margin-top:8px">If this box stays flat, your browser has WebGL off; the game falls back to plain CSS. Move the pointer over it: the lamp leans toward you.</p>
</section>

<section id="screens"><h2>Screens and atmosphere</h2>
<div class="fx-grid">
  <div class="fx"><h3>Low-castle danger pulse <span class="st live">Live</span></h3><div class="stage dark" style="min-height:140px"><div class="mini-vignette"></div><span style="color:#f3e3bf;font-weight:800">Castle under 25%</span></div><p>A red edge pulses with the heartbeat; faster under 10%.</p><div class="where">Battles</div></div>
  <div class="fx"><h3>Pack light leak <span class="st live">Live</span></h3><div class="stage dark"><div class="leak-pack pack-open-pack leak-gold" id="leakPack"><span>🏆</span>Golden Case</div></div><div class="btns"><button class="btn small" data-leak="leak-blue">Rare</button><button class="btn small" data-leak="leak-violet">Epic</button><button class="btn small" data-leak="leak-gold">Legendary</button></div><p>Rays leak from the seams in the colour of the best card inside before the pack bursts.</p><div class="where">Shop pack openings</div></div>
  <div class="fx"><h3>Floating motes <span class="st live">Live</span></h3><div class="stage" style="min-height:150px"><canvas class="motes" id="motes"></canvas></div><p>Golden motes by day, green fireflies at night; drawn from one sprite at 30 fps and paused during fights.</p><div class="where">Menus (live clock)</div></div>
  <div class="fx"><h3>Leaf sweep transition <span class="st live">Live</span></h3><div class="stage dark" id="leafStage" style="overflow:hidden"></div><div class="btns"><button class="btn small" data-act="leaves">▶ Play</button></div><p>A gust of leaves crosses the screen when you change menus.</p><div class="where">Home, Play, Codex and other menus</div></div>
</div></section>

<section id="sound"><h2>Sound effects</h2><p class="sec-sub">All synthesised live in the browser (no files yet). Tap to hear each one.</p>
<div class="snd-grid" id="sndGrid"></div>
<h3 style="margin:18px 0 6px;font:800 16px 'Baloo 2',system-ui,sans-serif">Rival voices</h3>
<div class="snd-grid" id="babbleGrid"></div>
</section>

<section id="ambience"><h2>Ambience</h2><p class="sec-sub">Continuous soundscapes per place. One plays at a time.</p>
<div class="btns" id="ambGrid"></div></section>

<section id="all"><h2>Full list</h2><p class="sec-sub">Everything in the effects catalogue, with where it lives.</p><div class="tbl"><table id="allTbl"></table></div></section>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
var matchState = null;
{shaders}
{skillfx}
SkillFX.setImages('assets/fx/arrow.png', 'assets/fx/fire_arrow.png');
</script>
<script>
const RARITY_TIER_BANDS = ['starter','common','uncommon','quest','rare','veryrare','superrare','epic','heroic','unique','questunique','legendary','mythic','ancient'];
const MATERIA_KINDS = [{{id:'ember', icon:'🔥', name:'Ember'}}, {{id:'tide', icon:'💧', name:'Tide'}}, {{id:'grove', icon:'🌿', name:'Grove'}}, {{id:'stone', icon:'🪨', name:'Stone'}}];
{fx}
</script>
<script src="effects-lab.js"></script>
'''
rep={'{SK_T1}':C('common'),'{SK_T2}':C('bee'),'{SK_T3}':C('ant'),'{SK_ALLY1}':C('rare'),'{SK_SHOOTER}':C('epic'),'{SK_ALLY2}':C('fire'),
 '{C_SLAM}':C('bee'),'{C_WAIT}':C('common'),'{C_B1}':C('rare'),'{C_B2}':C('epic'),'{C_B3}':C('ant'),'{C_SHINE}':C('legendary'),'{C_READY}':C('fire'),'{C_CRIT}':C('ant'),'{C_LOW}':C('rare'),'{C_CASTLE}':C('castle').replace('">', '"><div class="castle-cracks" aria-hidden="true"></div>', 1)}
for k,v in rep.items(): html=html.replace(k, v)
open(f'{ROOT}/.fxcat/effects.html','w').write(html)
print(len(html))
