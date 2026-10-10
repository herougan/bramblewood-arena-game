import json, re, os, subprocess, sys
ROOT='/home/claude/bramblewood-arena-game'
# 2026-10-10 (user: "Can they maybe share the same engine, so that we remove the need of coding both sides?"): every
# build first re-copies each effect function the lab uses from the game's own source (sync_fx_src.py), and the lab
# reuses the game's stylesheet, shaders, skill effects and GSAP build. Nothing in the lab is hand-copied any more.
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sync_fx_src.py')], check=True)
idx=open(f'{ROOT}/index.html').read()
# every <style> block of the game, not only the first (2026-10-10: later blocks hold the newest look: rarity borders, Shock...)
gamecss='\n'.join(m.group(1) for m in re.finditer(r'<style[^>]*>(.*?)</style>', idx, re.S))
cards=json.load(open(f'{ROOT}/.fxcat/cards.json'))
fx=open(f'{ROOT}/.fxcat/fx-src.js').read()
shaders=open(f'{ROOT}/bramblewood-shaders.js').read()
skillfx=open(f'{ROOT}/bramblewood-skillfx.js').read()
# GSAP inlined, as in the game (2026-10-10): the CDN copy didn't load inside the hub, which broke Draw flip, Victory toss,
# the crit stamp, feathers and the new damage-number bursts.
gsap=open(f'{ROOT}/gsap.min.js').read().replace('</script','<\\/script')
gsapflip=open(f'{ROOT}/Flip.min.js').read().replace('</script','<\\/script')
C=lambda k,v='plain': cards[k][v]
page_css = r'''
/* Effects Lab — the game's own stylesheet above, plus this page's layout. */
.lab{max-width:1180px; margin:0 auto; padding:24px 16px 80px; color:var(--ink);}
.lab h1{font-family:'Baloo 2',system-ui,sans-serif; font-size:clamp(28px,4vw,40px); margin:0; line-height:1.05;}
.lab .lede{max-width:70ch; color:var(--ink-muted); margin:6px 0 0;}
.lab nav.toc{display:flex; flex-wrap:wrap; gap:8px; margin:16px 0 8px; position:sticky; top:env(safe-area-inset-top,0px); z-index:50; padding:8px 0; background:color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter:blur(6px);}
.lab nav.toc button{cursor:pointer; font:700 13px 'Baloo 2',system-ui,sans-serif; padding:5px 12px; border-radius:999px; background:var(--surface-2); color:var(--ink); text-decoration:none; border:1px solid var(--surface-border);}
.lab section{margin-top:18px;} .lab section[hidden]{display:none !important;}
.lab nav.toc button[aria-selected=true]{background:var(--accent); color:var(--accent-ink); border-color:var(--accent-strong);}
.disp-row{display:flex; flex-wrap:wrap; gap:18px; align-items:flex-end;} .disp-row figure{margin:0; display:flex; flex-direction:column; align-items:center; gap:6px;} .disp-row figcaption{font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); text-align:center;}
.disp-parts{display:flex; flex-wrap:wrap; gap:18px; align-items:flex-end;} .disp-parts{padding-top:10px;} .disp-parts .levelbadge{display:block;} .disp-parts figure{margin:0; display:flex; flex-direction:column; align-items:center; gap:6px;} .disp-parts figcaption{font:700 13px 'Baloo 2',system-ui,sans-serif;}
.disp-focus > :not([data-focus]):not(.stats), .disp-focus > .stats > :not([data-focus]), .disp-focus::before, .disp-focus::after{opacity:.16; transition:opacity .2s;} .disp-focus > .ico[data-focus] ~ *{opacity:.16;} .disp-focus [data-focus]{opacity:1 !important; outline:2px dashed #ffd56e; outline-offset:2px; border-radius:6px;} .disp-focus > .ico[data-focus]{outline-offset:-4px;}
.disp-h{font:800 16px 'Baloo 2',system-ui,sans-serif; margin:18px 0 8px;}
.atmo-lab{position:relative; height:320px; border-radius:16px; overflow:hidden; background:#2c3b22;}
.atmo-lab .bf-cards{position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:18px; z-index:2; pointer-events:none;} .atmo-lab .bf-cards .card-tile{width:96px !important; height:120px !important;}
.atmo-lab .field-snow{z-index:4;}
.num-stage{position:relative; min-height:200px;}
html body{background:var(--bg) !important; background-image:none !important;} body::before,body::after{display:none !important;}
.lab h2{font-family:'Baloo 2',system-ui,sans-serif; font-size:24px; margin:0 0 4px;}
.lab .sec-sub{color:var(--ink-muted); margin:0 0 14px; max-width:75ch;}
.fx.tbc{opacity:.85; border-style:dashed;} .fx.tbc h3{font-size:15px;}
.treat-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(190px,1fr)); gap:14px;}
.fx.treat{align-items:center; text-align:center;} .fx.treat h3{justify-content:center;}
.treat-stage{padding:10px 0 4px; perspective:800px;} .treat-stage .card-tile{width:150px !important; height:188px !important; margin:0 auto;}
.fx-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(250px,1fr)); gap:14px;}
.fx{background:var(--surface); border:1px solid var(--surface-border); border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:10px; min-width:0;}
.fx h3{margin:0; font:800 15px 'Baloo 2',system-ui,sans-serif; display:flex; align-items:center; gap:8px; justify-content:space-between;}
.fx p{margin:0; font-size:13px; color:var(--ink-muted); line-height:1.4;}
.fx .where{font-size:11.5px; color:var(--ink-muted); font-weight:600;} /* 2026-10-10: was --ink-soft, too faint on both themes */
.sk-slow{color:var(--ink) !important; font-weight:600;}
.st{font:800 10.5px 'Baloo 2',system-ui,sans-serif; padding:2px 8px; border-radius:999px; white-space:nowrap;}
.st.live{background:#2f7d3a; color:#fff;} .st.part{background:#b5651d; color:#fff;} .st.idea{background:var(--surface-3); color:var(--ink);}
.stage{position:relative; min-height:170px; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:10px; background:var(--surface-2); overflow:visible;}
.stage.dark{background:#1b2416;}
.stage .card-tile{width:110px !important; height:138px !important; margin:0;}
#breathStage .card-tile, #paradeStage .card-tile{width:72px !important; height:92px !important;} #drawStage .card-tile{width:84px !important; height:108px !important;} #paradeStage .board-card{width:72px !important; height:92px !important; flex:none;}
.stage .board-card{position:relative;}
.btns{display:flex; flex-wrap:wrap; gap:6px;}
.btns .btn{font-size:12px;}
.bf-lab{position:relative; height:360px; border-radius:16px; overflow:hidden; background:#2c3b22;}
.bf-lab .bf-cards{position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:18px; z-index:2; pointer-events:none;}
#bfLab.sudden-death::before{z-index:2;} #bfLab .bf-cards{z-index:3;} #bfLab .bf-lightning{z-index:4;}
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
TREATS = [('', 'No foil', 'The everyday print.', 'live'),
  ('holo-pearl', 'Pearl', 'A soft pastel sheen. Rare to Super Rare.', 'live'),
  ('holo-rainbow', 'Rainbow holo', 'The classic rainbow foil. Epic to Quest Unique, and foil commons.', 'live'),
  ('holo-cosmos', 'Cosmos', 'A deep-space band with twinkling glitter. Legendary and up.', 'live'),
  ('holo-hex', 'Hex foil', 'A honeycomb lattice that lights up in rainbow as it catches the light.', 'new'),
  ('holo-etched', 'Etched foil', 'Engraved metal lines on the frame only; the art stays clean.', 'new'),
  ('holo-ice', 'Cracked ice', 'Shattered-ice shards that flash as you tilt.', 'new'),
  ('holo-gold', 'Gold leaf', 'A warm gold sheen with a gold rim: a prestige or event finish.', 'new'),
  ('holo-reverse', 'Reverse holo', 'Rainbow foil on the frame, with the art left plain.', 'new'),
  ('holo-prism', 'Prism', 'Sharp prismatic facets that turn around the light.', 'new'),
  ('holo-lattice', 'Lattice', 'A grid of fine foil lines crossed at 43°, each line catching the rainbow as the light moves.', 'new'),
  ('holo-starlight', 'Starlight', 'Twinkling four-point star sparkles. Its own layer: Legendary cards wear it over Cosmos, and it can go over any finish.', 'live')]
def treat_tile(k, cls):
    t = C(k)
    return t.replace('class="card-tile ', 'class="card-tile is-holo ' + cls + ' ', 1) if cls else t
TREAT_KEYS = ['legendary', 'epic', 'rare', 'fire', 'bee', 'common']
def treat_cards(k):
    return ''.join(f'<div class="fx treat"><div class="treat-stage" data-treat="{c}">{treat_tile(k, c)}</div><h3>{n} <span class="st {"live" if st=="live" else "idea"}">{"Live" if st=="live" else "New"}</span></h3><p>{d}</p></div>' for c, n, d, st in TREATS)
TREAT_OPTS = ''.join(f'<option value="{k}">{cards[k]["name"]}</option>' for k in TREAT_KEYS)
TREAT_JSON = json.dumps({k: cards[k]['plain'] for k in TREAT_KEYS})
TREAT_CARDS = treat_cards('legendary')
def stage_card(k, holo=False, extra=''):
    return f'<div class="board-card" data-demo="{k}">{C(k, "holo" if holo else "plain")}</div>'
html = f'''<meta charset="utf-8"><title>Bramblewood Effects Lab</title>
<link rel="stylesheet" href="fonts/fonts.css">
<style>{gamecss}</style>
<style>{page_css}</style>
<div class="lab">
<header>
  <h1>Bramblewood Effects Lab</h1>
  <p class="lede">Every animation, light, shader and sound in the game so far, live. Cards here use the game's own stylesheet and art. Hover the foil cards, press the buttons, and use headphones for the sound section. Status: <span class="st live">Live</span> in the game, <span class="st part">Partly</span> built, <span class="st idea">Idea</span> not built yet.</p>
</header>
<nav class="toc" role="tablist" aria-label="Effects">
  <button type="button" role="tab" data-tab="skills">Skills</button><button type="button" role="tab" data-tab="cardnew">Card ideas</button><button type="button" role="tab" data-tab="displays">Card displays</button><button type="button" role="tab" data-tab="treatments">Foils</button><button type="button" role="tab" data-tab="numbers">Damage numbers</button><button type="button" role="tab" data-tab="cards">Cards</button><button type="button" role="tab" data-tab="combat">Combat</button><button type="button" role="tab" data-tab="battlefield">Battlefield</button><button type="button" role="tab" data-tab="screens">Screens &amp; atmosphere</button><button type="button" role="tab" data-tab="sound">Sound</button><button type="button" role="tab" data-tab="ambience">Ambience</button><button type="button" role="tab" data-tab="tbc">Coming next</button><button type="button" role="tab" data-tab="all">Full list</button>
</nav>


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
  <div class="fx"><h3>Card drag trail <span class="st live">Live</span></h3><div class="stage" id="dragStage">{{C_DRAG}}</div><p>Drag this card around: a faint gold sparkle trail follows it, as it does when you drag a card from your hand.</p><div class="where">Dragging a hand card</div></div>
  <div class="fx"><h3>Leader throne <span class="st live">Live</span></h3><div class="stage dark" id="throneStage">{{C_THRONE}}</div><div class="btns"><button class="btn small" data-card="throne">👑 Summon leader</button></div><p>The leader rises on a pillar of light, a crown drops onto it and a short fanfare plays.</p><div class="where">Summoning your leader</div></div>
  <div class="fx"><h3>Deck shuffle <span class="st live">Live</span></h3><div class="stage" id="shuffleStage"><div class="deck-widget hq-tile" style="width:96px;height:124px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px"><div class="castle-label">Deck</div><div class="ico deck-back-mark">🌰</div></div></div><div class="btns"><button class="btn small" data-card="shuffle">🔀 Shuffle</button></div><p>At the start of a match both decks split and riffle together twice, with a papery riffle sound.</p><div class="where">Match start, after the versus opener</div></div>
  <div class="fx"><h3>Draw flip <span class="st live">Live</span></h3><div class="stage" id="drawStage" style="justify-content:space-around"><div class="deck-widget hq-tile" style="width:70px;height:92px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:10px"><div class="castle-label">Deck</div><div class="ico deck-back-mark">🌰</div></div><div style="width:84px">{{C_DRAW}}</div></div><div class="btns"><button class="btn small" data-card="draw">🃏 Draw</button></div><p>A card that comes into your hand flies out of your deck face down and flips face up in its slot. The opening hand deals one by one after the shuffle.</p><div class="where">Every draw</div></div>
  <div class="fx"><h3>Victory toss <span class="st live">Live</span></h3><div class="stage dark" id="paradeStage" style="gap:6px">{{C_P1}}{{C_P2}}{{C_P3}}</div><div class="btns"><button class="btn small" data-card="parade">🚩 Win</button></div><p>Under the Victory sign the winners are launched into the air one after another, get knocked about, land with a squash and settle back in place. Some cheer with an emote.</p><div class="where">Match end, winning side</div></div>
  <div class="fx"><h3>Card emotes <span class="st live">Live</span></h3><div class="stage dark" id="emoteStage">{stage_card('bee')}</div><div class="btns" id="emoteBtns"></div><p>Small emoji bubbles for moments that don't need words: summoned, attacking, hurt, low Health, dodging, healed, a kill, defeat and victory, and idle fidgets. They share the speech cooldown, so a card never talks and emotes at once.</p><div class="where">Board units during a battle</div></div>
  <div class="fx"><h3>Heat haze <span class="st live">Live</span></h3><div class="stage dark" id="hazeStage">{stage_card('fire')}</div><p>Fire creatures have hot air shimmering up off the card: faint wavy bands drifting upward.</p><div class="where">Fire and volcanic units on the board</div></div>
  <div class="fx"><h3>Critical hit <span class="st live">Live</span></h3><div class="stage dark" id="critStage">{{C_CRIT}}</div><div class="btns"><button class="btn small" data-card="crit">▶ Critical hit</button></div><p>A 👊 number bursts out big on a gold starburst and recoils to size; a quick flash on the card. No CRIT! word any more.</p></div>
</div></section>

<section id="tbc"><h2>Coming next <span class="st idea" style="vertical-align:middle">TBC</span></h2><p class="sec-sub">The first list is all built. Here is the next one, not built yet; veto or reorder freely.</p>
<div class="fx-grid"><div class="fx tbc"><h3>🔗 Combo counter <span class="st idea">TBC</span></h3><p>Several hits in one round build a x2, x3… counter over the board. Waiting on a decision: cosmetic only, a small reward per step, or drop it.</p></div><div class="fx tbc"><h3>🧭 Card tilt in hand <span class="st idea">On hold</span></h3><p>Hand cards lean toward the pointer. On hold: the style guide keeps the magnetic tilt out of the hand strip, because it fights the drag and selection motion there.</p></div></div></section>

<section id="treatments"><h2>Foils</h2><p class="sec-sub">Every print finish on the same card. Hover a card (or turn on auto-tilt) to move the light. The first four are live in the game today; the rest are ready to assign to print variants, pack rarities or events.</p>
<div class="bf-controls"><label>Card <select id="treatCard">{TREAT_OPTS}</select></label><label class="sk-slow"><input type="checkbox" id="treatAuto" checked> Auto-tilt</label><label class="sk-slow"><input type="checkbox" id="treatStar"> ＋ Starlight on every card</label></div>
<div class="treat-grid">{TREAT_CARDS}</div></section>

<section id="displays"><h2>Card displays</h2><p class="sec-sub">Every size a card is drawn at, all from the same card face, and the parts that make up the face. Use it to judge legibility at each size.</p>
<div class="bf-controls"><label>Card <select id="dispCard">{TREAT_OPTS}</select></label></div>
<h3 class="disp-h">Sizes</h3><div class="disp-row" id="dispSizes"></div>
<h3 class="disp-h">In a battle</h3><div class="disp-row" id="dispBattle"></div>
<h3 class="disp-h">Parts</h3><div class="disp-parts show-levels" id="dispParts"></div>
</section>

<section id="numbers"><h2>Damage numbers <span class="st idea" style="vertical-align:middle">new</span></h2><p class="sec-sub">Each number bursts out of the hit, then recoils back to size; the burst behind it fades fast. An icon in front says what kind of hit it was. On the enemy row numbers pop higher on the card; on yours they spread out more sideways. Press a button to hit the card.</p>
<div class="fx-grid">
  <div class="fx"><h3>Enemy card</h3><div class="stage dark num-stage" id="numEnemy">{stage_card('fire')}</div></div>
  <div class="fx"><h3>Your card</h3><div class="stage dark num-stage" id="numMine">{stage_card('bee')}</div></div>
</div>
<div class="btns" id="numBtns" style="margin-top:10px"></div>
</section>

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
    <div class="btns"><button class="btn small" data-dmg="-3|">−3</button><button class="btn small" data-dmg="-12|">−12 heavy</button><button class="btn small primary" data-dmg="-11|crit">👊 Critical</button><button class="btn small" data-dmg="-2|poison-tick">☠️ Poison</button><button class="btn small" data-dmg="-2|bleed-tick">🩸 Bleed</button><button class="btn small" data-dmg="-4|heat">🔥 Fire hit</button><button class="btn small" data-dmg="-3|cold">❄️ Cold hit</button><button class="btn small" data-dmg="+4|heal">💚 Heal</button><button class="btn small" data-dmg="0|blocked">🛡 Blocked</button><button class="btn small" data-dmg="+2|gold">🪙 Gold</button></div>
    <p>Chunky face, lit gradient, separate outline; tinted by type with its icon in front. Every number bursts out on a starburst in its colour and recoils to size; the burst fades fast. More in the Damage numbers tab.</p><div class="where">All hits, ticks and gains</div></div>
  <div class="fx"><h3>Impact squash and recoil <span class="st live">Live</span></h3>
    <div class="stage" id="squashStage">{stage_card('ant')}</div>
    <div class="btns"><button class="btn small" data-act="squash">▶ Hit</button><button class="btn small" data-act="squashHeavy">▶ Heavy hit (with hit-stop)</button></div>
    <p>The struck card squashes and is knocked away, then springs back. Heavy blows freeze all motion for 70 ms.</p><div class="where">Every melee hit</div></div>
  <div class="fx"><h3>Deaths: bleed-out and burn-away <span class="st live">Live</span></h3>
    <div class="stage" id="deathStage">{stage_card('common')}</div>
    <div class="btns"><button class="btn small primary" data-death="fall">Normal</button><button class="btn small" data-death="bleed">Bleed</button><button class="btn small" data-death="poison">Poison</button><button class="btn small" data-death="cold">Cold</button><button class="btn small" data-death="burn">Burn</button></div>
    <p><b>Normal:</b> the card topples back in one smooth fall until it lies flat, greys out and puffs leaves and dust. <b>Bleed / poison / cold:</b> a dark wash runs down and drops fall, red, green or icy by cause. <b>Burn:</b> fire deaths burn away from the bottom with embers.</p><div class="where">Card deaths; burn also on a falling castle</div></div>
  <div class="fx"><h3>Frost, shock, feathers, shatter <span class="st live">Live</span></h3>
    <div class="stage" id="statusStage">{stage_card('bee')}</div>
    <div class="btns"><button class="btn small" data-st="frost">❄️ Freeze</button><button class="btn small" data-st="shock">🌩 Shock</button><button class="btn small" data-st="feather">🪶 Hit a flyer</button><button class="btn small" data-st="shatter">💥 Shatter</button></div>
    <p><b>Frost creep:</b> ice crystals grow in from the corners of a frozen unit. <b>Shock:</b> soft electric glows flicker over the card in a few places. <b>Flyers</b> shed feathers when hit. <b>Shatter:</b> tokens break into squares instead of crumbling.</p><div class="where">Status effects, hits on flyers, token deaths</div></div>
  <div class="fx"><h3>Victory dance <span class="st idea">Retired</span></h3>
    <div class="stage">{stage_card('bee').replace('class="board-card"', 'class="board-card is-dancing" style="--dance-delay:0s"',1)}{stage_card('rare').replace('class="board-card"', 'class="board-card is-dancing" style="--dance-delay:.09s"',1)}</div>
    <p>Replaced by the victory toss (Card ideas tab): the endless wiggle is gone.</p><div class="where">Match end</div></div>
  <div class="fx"><h3>Attack preview <span class="st live">Live</span></h3>
    <div class="stage dark"><svg class="dash-demo" viewBox="0 0 300 150"><line x1="150" y1="135" x2="150" y2="15"/></svg></div>
    <p>Hovering a card draws a line beneath the cards to what it will hit; the dashes flow toward the target.</p><div class="where">Battlefield hover</div></div>
  <div class="fx"><h3>Pitch preview <span class="st live">Live</span></h3>
    <div class="stage"><div class="mock-gy discardzone pitch-ready">💀 Graveyard<span class="pitch-badge"><b>+1 🪵</b><small>Lumber</small></span></div></div>
    <p>Pick up a card and the Graveyard glows with what it would pitch for; it grows when you hover it.</p><div class="where">Dragging a hand card</div></div>
</div></section>

<section id="battlefield"><h2>Battlefield shaders</h2><p class="sec-sub">One WebGL layer under the cards: the map's weather, a lit cloth or ground material, point lights for hits, a shockwave, and soft card shadows; storm lightning and the sudden-death sky sit on top. Pick a map and fire effects.</p>
<div class="bf-lab battlefield" id="bfLab"><div class="bf-cards">{C('common')}{C('bee')}{C('rare')}</div></div>
<div class="bf-controls">
  <select id="bfKind" aria-label="Map"><option value="0">Forest (Outskirts)</option><option value="1">Water (Sunken Hollow)</option><option value="2">Volcano (Ashen Peak)</option><option value="3">Caves</option><option value="4">Savanna</option><option value="5">Tundra</option><option value="6">Coral</option><option value="7">Swamp</option><option value="8">Foundry</option><option value="9">Sky (Eyrie)</option><option value="10">Storm (Sundered Peak)</option><option value="11">Rain</option></select>
  <select id="bfFelt" aria-label="Floor"><option value="2">Map ground (light only + material)</option><option value="1">Cloth felt</option><option value="0">No floor lighting</option></select>
  <button class="btn small" data-light="physical">💡 Hit light</button><button class="btn small" data-light="heat">🔥 Heat light</button><button class="btn small" data-light="cold">❄️ Cold light</button><button class="btn small" data-light="poison">☠️ Poison light</button><button class="btn small primary" data-act="wave">💥 Shockwave</button><button class="btn small" data-act="ripple">💧 Water ripple</button><button class="btn small" data-act="lightning">⚡ Lightning</button><button class="btn small" data-act="sdsky">☠️ Sudden-death sky</button>
</div>
<p class="sec-sub" style="margin-top:8px">If this box stays flat, your browser has WebGL off; the game falls back to plain CSS. Move the pointer over it: the lamp leans toward you.</p>
</section>

<section id="screens"><h2>Screens and atmosphere</h2>
<h3 class="disp-h">Weather and atmosphere</h3><p class="sec-sub">The weather a fight can have, on the game's own battlefield layer: pick one.</p>
<div class="atmo-lab battlefield" id="atmoLab"><div class="bf-cards">{C('common')}{C('fire')}{C('bee')}</div></div>
<div class="bf-controls" id="atmoBtns"><button class="btn small" data-atmo="clear">☀️ Clear (Outskirts)</button><button class="btn small" data-atmo="rain">🌧️ Rain</button><button class="btn small" data-atmo="storm">⛈️ Storm</button><button class="btn small" data-atmo="snow">❄️ Snow (Frozen Ground)</button><button class="btn small" data-atmo="embers">🌋 Embers and ash</button><button class="btn small" data-atmo="mist">🌫️ Swamp mist</button><button class="btn small" data-atmo="deep">🌊 Underwater</button><button class="btn small" data-atmo="sky">☁️ High winds (Eyrie)</button><button class="btn small" data-atmo="caves">🕯️ Caves</button><button class="btn small" data-atmo="sudden">☠️ Sudden-death sky</button></div>
<div class="fx-grid" style="margin-top:16px">
  <div class="fx"><h3>Low-castle danger pulse <span class="st live">Live</span></h3><div class="stage dark" style="min-height:140px"><div class="mini-vignette"></div><span style="color:#f3e3bf;font-weight:800">Castle under 25%</span></div><p>A red edge pulses with the heartbeat; faster under 10%.</p><div class="where">Battles</div></div>
  <div class="fx"><h3>Pack light leak <span class="st live">Live</span></h3><div class="stage dark"><div class="leak-pack pack-open-pack leak-gold" id="leakPack"><span>🏆</span>Golden Case</div></div><div class="btns"><button class="btn small" data-leak="leak-blue">Rare</button><button class="btn small" data-leak="leak-violet">Epic</button><button class="btn small" data-leak="leak-gold">Legendary</button></div><p>Rays leak from the seams in the colour of the best card inside before the pack bursts.</p><div class="where">Shop pack openings</div></div>
  <div class="fx"><h3>Floating motes <span class="st live">Live</span></h3><div class="stage" style="min-height:150px"><canvas class="motes" id="motes"></canvas></div><p>Golden motes by day, green fireflies at night; drawn from one sprite at 30 fps and paused during fights.</p><div class="where">Menus (live clock)</div></div>
  <div class="fx"><h3>Pixel reveal and page turn <span class="st live">Live</span></h3><div class="stage dark" style="min-height:140px"><span style="color:#f3e3bf;font-weight:800">Battle start · Codex pages</span></div><div class="btns"><button class="btn small" data-act="pixel">▶ Pixel reveal</button></div><p>A battle without a versus opener appears through a dissolving grid of dark squares. Switching Codex sections turns the page like a book, with a papery swish.</p><div class="where">Arena battles, Codex tabs</div></div>
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
<script>
{gsap}
</script>
<script>
{gsapflip}
</script>
<script>
var matchState = null;
{shaders}
{skillfx}
SkillFX.setImages('assets/fx/arrow.png', 'assets/fx/fire_arrow.png');
</script>
<script>
var FX_KEY = 'bramblewood_fx_level', FX_ORDER = ['none','low','med','high'];
const RARITY_TIER_BANDS = ['starter','common','uncommon','quest','rare','veryrare','superrare','epic','heroic','unique','questunique','legendary','mythic','ancient'];
const MATERIA_KINDS = [{{id:'ember', icon:'🔥', name:'Ember'}}, {{id:'tide', icon:'💧', name:'Tide'}}, {{id:'grove', icon:'🌿', name:'Grove'}}, {{id:'stone', icon:'🪨', name:'Stone'}}];
{fx}
</script>
<script>window.TREAT_CARDS = {TREAT_JSON};</script>
<script src="effects-lab.js"></script>
'''
rep={'{TREAT_OPTS}':TREAT_OPTS,'{TREAT_CARDS}':treat_cards('legendary'),'{TREAT_JSON}':TREAT_JSON,'{SK_T1}':C('common'),'{SK_T2}':C('bee'),'{SK_T3}':C('ant'),'{SK_ALLY1}':C('rare'),'{SK_SHOOTER}':C('epic'),'{SK_ALLY2}':C('fire'),
 '{C_SLAM}':C('bee'),'{C_WAIT}':C('common'),'{C_B1}':C('rare'),'{C_B2}':C('epic'),'{C_B3}':C('ant'),'{C_SHINE}':C('legendary'),'{C_READY}':C('fire'),'{C_CRIT}':C('ant'),'{C_LOW}':C('rare'),'{C_DRAG}':C('legendary'),'{C_THRONE}':C('epic'),'{C_DRAW}':C('fire'),'{C_P1}':"<div class='board-card' style='position:relative'>"+C('bee')+"</div>",'{C_P2}':"<div class='board-card' style='position:relative'>"+C('ant')+"</div>",'{C_P3}':"<div class='board-card' style='position:relative'>"+C('common')+"</div>",'{C_CASTLE}':C('castle').replace('">', '"><div class="castle-cracks" aria-hidden="true"></div>', 1)}
for k,v in rep.items(): html=html.replace(k, v)
open(f'{ROOT}/.fxcat/effects.html','w',encoding='utf-8').write(html)
print(len(html))
