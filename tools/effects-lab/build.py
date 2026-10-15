import json, re, os, subprocess, sys
# 2026-10-15: the repo this script sits in (was a fixed path to the main checkout, so a build from a worktree read the main
# checkout's sources while sync_fx_src.py wrote the worktree's .fxcat).
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
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
# 2026-10-14: procedural damage, Cards of old and the GSAP experiments (ProcFX), loaded like SkillFX
procfx=open(f'{ROOT}/bramblewood-procfx.js').read()
# GSAP inlined, as in the game (2026-10-10): the CDN copy didn't load inside the hub, which broke Draw flip, Victory toss,
# the crit stamp, feathers and the new damage-number bursts.
gsap=open(f'{ROOT}/gsap.min.js').read().replace('</script','<\\/script')
gsapflip=open(f'{ROOT}/Flip.min.js').read().replace('</script','<\\/script')
# ---- 2026-10-15: the Effects catalogue (every inventory entry + FXLAB registrations; docs/effects-lab-contract.md) ----
LAB = os.path.dirname(os.path.abspath(__file__))
unitfx = open(f'{ROOT}/bramblewood-unitfx.js').read()
# the six effect batches, exactly as the game bundles them (assemble_arena.py)
fxbatches = '\n'.join(open(f'{ROOT}/bramblewood-fx-{b}.js', encoding='utf-8').read() for b in 'abcdefg')  # 2026-10-16: + G (map titles and grandeur, the fun set)
_inv = json.load(open(f'{ROOT}/docs/effects-inventory-2026-10-15.json', encoding='utf-8'))
_INV_KEYS = ['id', 'area', 'name', 'trigger', 'current', 'quality', 'priority', 'themeNotes', 'variantsSuggested', 'future', 'batch']
inventory_js = json.dumps([{k: e.get(k) for k in _INV_KEYS} for e in _inv], ensure_ascii=False, separators=(',', ':'))
fixtures_js = open(f'{LAB}/fixtures.json', encoding='utf-8').read()  # the game's own markup (capstages.py)
fxcore = open(f'{LAB}/fxlab-core.js', encoding='utf-8').read()
fxcatalogue = open(f'{LAB}/fxlab-catalogue.js', encoding='utf-8').read()
# every manifest file, in name order (_existing.js first, then a.js … f.js)
_mdir = f'{LAB}/manifest'
_scr = lambda s: s.replace('</script', '<\\/script')
# one <script> per manifest, so a syntax error in one batch's file can't take the others down
manifests = '\n'.join(f'<script>// ---- manifest/{f} ----\n' + _scr(open(os.path.join(_mdir, f), encoding='utf-8').read()) + '\n</script>' for f in sorted(os.listdir(_mdir)) if f.endswith('.js'))
inventory_js, fixtures_js, fxcore, fxcatalogue, fxbatches, unitfx = map(_scr, [inventory_js, fixtures_js, fxcore, fxcatalogue, fxbatches, unitfx])
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
#waveStage .card-tile, #dropStage .card-tile{width:72px !important; height:92px !important;}
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
/* Procedural FX tab (2026-10-14) */
@media (min-width:640px){ .fx.pfx-wide{grid-column:span 2;} }
#pfxCrackStage .card-tile, #pfxCrumbleStage .card-tile{width:130px !important; height:162px !important; cursor:crosshair;}
#pfxShatterStage .card-tile{cursor:crosshair;}
#pfxOldStage{gap:16px; flex-wrap:wrap; padding:14px 8px; min-height:200px;} #pfxOldStage .card-tile{width:124px !important; height:155px !important;}
#pfxFlipStage{gap:5px; flex-wrap:nowrap;} #pfxFlipStage .card-tile{width:42px !important; height:53px !important;}
#pfxLanternStage{min-height:200px; gap:12px; overflow:hidden;} #pfxLanternStage .card-tile{width:68px !important; height:85px !important;}
#pfxRippleStage{display:grid; grid-template-columns:repeat(4, 48px); gap:9px; padding:16px; justify-content:center;} #pfxRippleStage .card-tile{width:48px !important; height:60px !important; cursor:pointer;}
.pfx-scrub{width:100%; accent-color:#e0a63a;}
.pfx-scrubrow{display:flex; align-items:center; gap:8px; font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted);}
@media (max-width:560px){ .bf-lab{height:300px;} .bf-lab .bf-cards .card-tile{width:72px !important; height:90px !important;} }
/* ---- Effects catalogue (2026-10-15): every inventory entry, the stage dock, filters, coverage ---- */
/* 2026-10-16 (user: "The simulation window on the right is sticky on scroll. So I can see it when I scroll far down."): the
   stage dock never stuck, because overflow-x:hidden on <body> made the body its own (non-scrolling) scroll container, which
   sticky binds to. The viewport clips sideways now (html), and the body only clips, which makes no scroll container. */
html{overflow-x:hidden;} body{overflow-x:clip !important; overflow-y:visible !important;}
.lab nav.toc button[data-tab="catalogue"]{font-weight:800;}
.fxl-cov{background:var(--surface); border:1px solid var(--surface-border); border-radius:14px; padding:10px 14px; margin:0 0 10px;}
.fxl-covtop{display:flex; flex-wrap:wrap; align-items:center; gap:6px 12px; font-size:14px; color:var(--ink);}
.fxl-covtop b{font:800 20px 'Baloo 2',system-ui,sans-serif;} .fxl-pct{font-weight:800; color:var(--ink-muted);} .fxl-covnote{font-size:12.5px; color:var(--ink-muted);}
.fxl-covbar{flex:1 1 160px; min-width:80px; height:8px; border-radius:99px; background:var(--surface-3, var(--surface-2)); overflow:hidden; display:block;}
.fxl-covbar i{display:block; height:100%; background:linear-gradient(90deg,#2f7d3a,#6cbf4a); border-radius:inherit;}
.fxl-covareas summary{cursor:pointer; font:700 12.5px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); margin-top:6px;}
.fxl-covgrid{display:grid; grid-template-columns:repeat(auto-fill, minmax(230px,1fr)); gap:4px 14px; margin-top:6px;}
.fxl-covarea{display:grid; grid-template-columns:minmax(0,1fr) 70px 52px; align-items:center; gap:8px; font-size:12px; text-align:left; background:none; border:0; padding:3px 4px; color:var(--ink); cursor:pointer; border-radius:6px;}
.fxl-covarea:hover{background:var(--surface-2);} .fxl-covarea span:last-child{text-align:right; color:var(--ink-muted); font-variant-numeric:tabular-nums;}
.fxl-problems{border:1px solid #b5651d; background:color-mix(in srgb, #b5651d 12%, var(--surface)); color:var(--ink); border-radius:12px; padding:8px 12px; font-size:12.5px; margin-bottom:10px;}
.fxl-problems ul{margin:4px 0 0; padding-left:18px;}
.fxl-views{display:flex; gap:6px; margin:4px 0 10px; flex-wrap:wrap;}
.fxl-views button{cursor:pointer; font:700 13px 'Baloo 2',system-ui,sans-serif; padding:5px 12px; border-radius:999px; background:var(--surface-2); color:var(--ink); border:1px solid var(--surface-border);}
.fxl-views button[aria-selected=true]{background:var(--ink); color:var(--bg);} .fxl-n{opacity:.7; font-weight:600;}
.fxl-layout{display:grid; grid-template-columns:minmax(0,1fr) minmax(340px,46%); gap:16px; align-items:start;}
.fxl-left{min-width:0;}
.fxl-tools{display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:8px;}
.fxl-tools input, .fxl-tools select{font:inherit; font-size:13px; padding:6px 9px; border-radius:9px; border:1px solid var(--surface-border); background:var(--surface); color:var(--ink); min-width:0;}
.fxl-tools input{flex:1 1 220px;} .fxl-tools select{flex:0 1 auto; max-width:100%;}
#fxlShown{font-size:12px; color:var(--ink-muted); margin-left:auto;}
.fxl-area{border:1px solid var(--surface-border); border-radius:12px; background:var(--surface); margin-bottom:6px;}
.fxl-area > summary{display:flex; align-items:center; gap:8px; padding:8px 10px; cursor:pointer; list-style:none; flex-wrap:wrap;}
.fxl-area > summary::-webkit-details-marker{display:none;}
.fxl-area > summary::before{content:'▸'; color:var(--ink-muted); width:10px;} .fxl-area[open] > summary::before{content:'▾';}
.fxl-aname{font:800 15px 'Baloo 2',system-ui,sans-serif; color:var(--ink);} .fxl-acount{font-size:12px; color:var(--ink-muted); font-variant-numeric:tabular-nums;}
.fxl-abar{width:70px; height:6px; border-radius:9px; background:var(--surface-2); overflow:hidden; display:inline-block;} .fxl-abar i{display:block; height:100%; background:#4f9a3a;}
.fxl-abatch{font:800 10.5px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); border:1px solid var(--surface-border); border-radius:6px; padding:0 5px;}
.fxl-all{margin-left:auto;} .fxl-all.is-running{background:#a33; color:#fff;}
.fxl-rows{border-top:1px solid var(--surface-border);}
.fxl-row{display:grid; grid-template-columns:minmax(0,1fr) 62px; gap:4px 10px; align-items:start; padding:7px 10px; border-bottom:1px solid var(--surface-border);}
/* 2026-10-16 (user: "The A/B/C/D/E... and GOOD and A/B? should take up 1 thin column on the right"): badges and play buttons stack in .fxl-side */
.fxl-side{display:flex; flex-direction:column; gap:4px; min-width:0;}
.fxl-row:last-child{border-bottom:0;} .fxl-row[hidden]{display:none;}
.fxl-main{min-width:0;}
.fxl-name{all:unset; cursor:pointer; font-weight:700; font-size:13.5px; color:var(--ink);} .fxl-name:hover, .fxl-name:focus-visible{text-decoration:underline;}
.fxl-id{font:600 10.5px ui-monospace,Menlo,monospace; color:var(--ink-muted); margin-left:6px; overflow-wrap:anywhere;}
.fxl-trig{font-size:11.5px; color:var(--ink-muted); line-height:1.35; overflow-wrap:anywhere;}
.fxl-meta{display:flex; flex-direction:column; gap:3px;} .fxl-meta > *{text-align:center; padding:1px 3px; font-size:9.5px;}
.fxl-q, .fxl-tag{font:800 10px 'Baloo 2',system-ui,sans-serif; padding:1px 7px; border-radius:99px; white-space:nowrap; text-transform:uppercase; letter-spacing:.03em;}
.q-good{background:#2f7d3a; color:#fff;} .q-basic{background:#b98a1d; color:#1d1606;} .q-missing{background:#a8432f; color:#fff;} .q-broken{background:#6d1fa8; color:#fff;} .q-future{background:#2d5d93; color:#fff;}
.fxl-tag{background:var(--surface-2); color:var(--ink); border:1px solid var(--surface-border);}
.fxl-play{display:grid; grid-template-columns:1fr; gap:3px;} .fxl-play.is-many{grid-template-columns:1fr 1fr;}
.fxl-play .fxl-pb{width:100%; padding:3px 0; text-align:center;} .fxl-play.is-many .fxl-pb{font-size:11px;}
.fxl-pb{cursor:pointer; font:800 12px 'Baloo 2',system-ui,sans-serif; padding:3px 9px; border-radius:8px; border:1px solid var(--accent-strong, #2f7d3a); background:var(--accent, #3e8f48); color:var(--accent-ink, #fff); white-space:nowrap;}
.fxl-pb:hover{filter:brightness(1.1);} .fxl-pb.is-playing{outline:2px solid #ffd56e; outline-offset:1px;}
.fxl-nb{font-size:10.5px; line-height:1.2; color:var(--ink-muted); font-style:italic; text-align:center;}
.q-new{background:#7a3fb0; color:#fff;}
.fxl-more{grid-column:1 / -1; font-size:12px; color:var(--ink); background:var(--surface-2); border-radius:8px; padding:6px 9px; display:grid; gap:3px;}
.fxl-more[hidden]{display:none;} .fxl-more b{color:var(--ink-muted); margin-right:4px;}
.fxl-vgrid{display:grid; grid-template-columns:repeat(auto-fill, minmax(250px,1fr)); gap:10px;}
.fxl-vcard{background:var(--surface); border:1px solid var(--surface-border); border-radius:12px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;}
.fxl-vcard h3{margin:0; font:800 15px 'Baloo 2',system-ui,sans-serif; display:flex; gap:6px; align-items:center; justify-content:space-between;}
.fxl-vcard p{margin:0; font-size:12.5px; color:var(--ink-muted);}
.fxl-vbtns{display:flex; flex-direction:column; gap:5px;} .fxl-vb{text-align:left; white-space:normal;}
.fxl-empty{color:var(--ink-muted);}
.fxl-dock{position:sticky; top:var(--fxl-top, 58px); background:var(--surface); border:1px solid var(--surface-border); border-radius:14px; padding:8px; display:flex; flex-direction:column; gap:8px; max-height:calc(100vh - var(--fxl-top, 58px) - 12px); overflow:auto;}
.fxl-dockbar{display:flex; align-items:flex-start; gap:8px;}
.fxl-now{flex:1; font-size:13px; color:var(--ink); min-height:34px;} .fxl-now span{display:block; font:600 10.5px ui-monospace,Menlo,monospace; color:var(--ink-muted);}
.fxl-x{display:none; cursor:pointer; border:1px solid var(--surface-border); background:var(--surface-2); color:var(--ink); border-radius:8px; width:32px; height:32px; font-size:15px;}
/* 2026-10-16: the frame never grows past the window, so the sticky dock stays whole; tall stages are zoomed to fit (fxlab-core fit) */
.fxl-frame{max-height:calc(100vh - var(--fxl-top, 58px) - 130px); position:relative; min-height:240px; border-radius:12px; overflow:hidden; background:#1f2a18; isolation:isolate;}
.fxl-frame:empty::after{content:'The stage appears here'; position:absolute; inset:0; display:grid; place-items:center; color:#cfc6a8; font:700 13px 'Baloo 2',system-ui,sans-serif;}
.fxl-speed{display:flex; gap:6px; align-items:center; flex-wrap:wrap; font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted);}
.fxl-speed button{cursor:pointer; font:800 12px 'Baloo 2',system-ui,sans-serif; padding:3px 10px; border-radius:99px; border:1px solid var(--surface-border); background:var(--surface-2); color:var(--ink);}
.fxl-speed button[aria-pressed=true]{background:var(--ink); color:var(--bg);} #fxlReplay{margin-left:auto;}
/* stages */
.fxl-stage{position:relative; overflow:hidden;}
.fxl-stage-cards{min-height:240px; display:flex; align-items:center; justify-content:center; padding:26px 8px; background:radial-gradient(ellipse at 50% 40%, #3a4d2c, #1f2a18);}
.fxl-cardrow{display:flex; gap:8px; align-items:center; justify-content:center; flex-wrap:wrap; perspective:800px;}
.fxl-cardrow .board-card{position:relative; width:90px; height:112px; flex:none;}
.fxl-cardrow .card-tile{width:90px !important; height:112px !important; margin:0;}
.fxl-stage-board, .fxl-stage-map, .fxl-stage-pack{background:#1b2314;}
.fxl-app{padding:8px 0 !important; margin:0 !important; max-width:none !important;}
.fxl-app .content-wrap{padding:0 !important; margin:0 !important; max-width:none !important;}
.fxl-app #view-play{display:block !important; position:relative;}
.fxl-maplayout{position:relative !important; inset:auto !important; left:auto !important; top:auto !important; z-index:0 !important; display:block !important; overflow:hidden; background-size:auto, auto, cover, auto;}
.fxl-maplayout .conquest-main{position:relative; width:100%; height:100%; overflow:hidden !important; padding:0 !important; margin:0 !important;}
.fxl-maplayout .conquest-map-canvas{position:absolute !important; inset:0 !important; width:100% !important; height:100% !important; min-height:0 !important; margin:0 !important;}
.fxl-packwrap{position:relative; overflow:hidden;}
.fxl-po{position:absolute !important; inset:0 !important; z-index:0 !important; padding:24px 12px 12px !important; overflow:hidden !important;}
.fxl-po .po2-top{position:absolute !important;} .fxl-po .po2-pack{--pw:200px !important;} .fxl-po .po2-deck{--cw:230px !important;}
.fxl-ui{display:flex; flex-direction:column; align-items:center; gap:14px; padding:14px 10px 70px; position:relative; min-height:300px; background:radial-gradient(ellipse at 50% 30%, #3a4d2c, #1f2a18);}
.fxl-hud{display:flex; flex-wrap:wrap; gap:6px; justify-content:center;}
.fxl-results{position:relative !important; width:min(100%, 320px) !important; margin:0 !important; transform:none !important; padding:16px 14px !important; overflow:hidden;}
.fxl-toasts{position:absolute !important; left:50% !important; bottom:10px !important; top:auto !important; width:min(92%, 360px) !important;}
.fxl-screen{height:300px; position:relative; background:linear-gradient(rgba(10,14,8,.35), rgba(10,14,8,.6)), url(assets/maps/m1.png) center/cover; image-rendering:pixelated;}
.fxl-screen-cap{position:absolute; left:10px; top:8px; font:800 11px 'Baloo 2',system-ui,sans-serif; color:#e8dfc2; opacity:.7; text-transform:uppercase; letter-spacing:.08em;}
.fxl-layer{position:absolute; inset:0; pointer-events:none; z-index:20;}
@media (max-width:760px){
  .fxl-layout{grid-template-columns:minmax(0,1fr);}
  /* 2026-10-16 (user: sticky stage; on phone "keep it usable"): a docked mini stage at the bottom, about a third of the screen,
     with ▾ to shrink it to its title bar; the tab bar is one row you swipe, so the list keeps most of the screen. */
  .fxl-dock{position:fixed; left:0; right:0; bottom:0; top:auto; z-index:900; border-radius:16px 16px 0 0; max-height:none; transform:translateY(105%); transition:transform .25s ease; box-shadow:0 -10px 30px rgba(0,0,0,.35); border-bottom:0; padding:6px 8px calc(6px + env(safe-area-inset-bottom, 0px)); gap:6px;}
  .fxl-dock.is-open{transform:none;}
  .fxl-frame{max-height:36vh; min-height:150px;}
  .fxl-dock.is-mini .fxl-frame, .fxl-dock.is-mini .fxl-speed{display:none;}
  .fxl-now{min-height:0; font-size:12.5px;}
  .fxl-x{display:block; flex:none;}
  body.fxl-dock-open .lab{padding-bottom:calc(36vh + 120px);}
  .lab nav.toc{flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; padding:6px 0;} .lab nav.toc::-webkit-scrollbar{display:none;} .lab nav.toc button{flex:none;}
  .fxl-row{grid-template-columns:minmax(0,1fr) 58px; padding:7px 8px;}
  .fxl-tools select{flex:1 1 140px;}
  #fxlShown{margin-left:0;}
  .fxl-cardrow{gap:6px;} .fxl-cardrow .board-card{width:62px; height:78px;} .fxl-cardrow .card-tile{width:62px !important; height:78px !important;}
  .fxl-abar{display:none;}
}
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
  ('holo-starlight', 'Starlight', 'Twinkling four-point star sparkles. Its own layer: Legendary cards wear it over Cosmos, and it can go over any finish.', 'live'),
  # 2026-10-14: these eight began in the Lab and are now in the game's stylesheet.
  ('holo-aurora', 'Aurora', 'Slow northern-lights curtains of green, teal and violet drifting across the art.', 'new'),
  ('holo-galaxy', 'Galaxy swirl', 'A spiral of violet and blue arms turning slowly around the light, over a fine star field.', 'new'),
  ('holo-molten', 'Molten gold', 'A hot gold sheen and glowing rim; liquid gold drips from the top edge and swells.', 'new'),
  ('holo-frost', 'Frost crystal', 'Fern-like ice crystals grow in from the corners, then thaw, over a cold blue sheen.', 'new'),
  ('holo-oilslick', 'Oil slick', 'Thin-film rainbow pooled in organic blotches that slide as the light moves.', 'new'),
  ('holo-sakura', 'Sakura', 'A soft pink sheen with cherry petals drifting down across the card.', 'new'),
  ('holo-sparkle', 'Glitter field', 'Dense multicolour glitter that flashes where the light falls, with a few bright glints.', 'new'),
  ('holo-scanline', 'Holo scanlines', 'Fine scanlines with a bright bar rolling down and the odd flicker, like a projected hologram.', 'new'),
  # 2026-10-14: procedural, from bramblewood-procfx.js (ProcFX.decorateOld adds the aged-paper layers)
  ('holo-old', 'Cards of old', 'A well-loved vintage print: yellowed, foxed paper with a water-stain tide line, creases, rubbed corners and faded ink, grown procedurally per card.', 'new')]
STATUS_PILL = {'live': ('live', 'Live'), 'new': ('idea', 'New'), 'lab': ('part', 'Lab')}
def treat_tile(k, cls):
    t = C(k)
    return t.replace('class="card-tile ', 'class="card-tile is-holo ' + cls + ' ', 1) if cls else t
TREAT_KEYS = ['legendary', 'epic', 'rare', 'fire', 'bee', 'common']
def treat_cards(k):
    return ''.join(f'<div class="fx treat"><div class="treat-stage" data-treat="{c}">{treat_tile(k, c)}</div><h3>{n} <span class="st {STATUS_PILL[st][0]}">{STATUS_PILL[st][1]}</span></h3><p>{d}</p></div>' for c, n, d, st in TREATS)
TREAT_OPTS = ''.join(f'<option value="{k}">{cards[k]["name"]}</option>' for k in TREAT_KEYS)
TREAT_JSON = json.dumps({k: cards[k]['plain'] for k in TREAT_KEYS})
TREAT_CARDS = treat_cards('legendary')
def stage_card(k, holo=False, extra=''):
    return f'<div class="board-card" data-demo="{k}">{C(k, "holo" if holo else "plain")}</div>'
# 2026-10-16: a doctype, as the hub serves it (tools/hub/build_hub.py doc()); without it the page ran in quirks mode locally.
html = f'''<!doctype html>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bramblewood Effects Lab</title>
<link rel="stylesheet" href="fonts/fonts.css">
<style>{gamecss}</style>
<style>{page_css}</style>

<div class="lab">
<header>
  <h1>Bramblewood Effects Lab</h1>
  <p class="lede">Every animation, light, shader and sound in the game so far, live. Cards here use the game's own stylesheet and art. Hover the foil cards, press the buttons, and use headphones for the sound section. Status: <span class="st live">Live</span> in the game, <span class="st part">Partly</span> built, <span class="st idea">Idea</span> not built yet.</p>
</header>
<nav class="toc" role="tablist" aria-label="Effects">
  <button type="button" role="tab" data-tab="catalogue">📚 Catalogue</button><button type="button" role="tab" data-tab="skills">Skills</button><button type="button" role="tab" data-tab="procfx">Procedural FX</button><button type="button" role="tab" data-tab="music">Music</button><button type="button" role="tab" data-tab="cardnew">Card ideas</button><button type="button" role="tab" data-tab="displays">Card displays</button><button type="button" role="tab" data-tab="treatments">Foils</button><button type="button" role="tab" data-tab="numbers">Damage numbers</button><button type="button" role="tab" data-tab="cards">Cards</button><button type="button" role="tab" data-tab="combat">Combat</button><button type="button" role="tab" data-tab="battlefield">Battlefield</button><button type="button" role="tab" data-tab="screens">Screens &amp; atmosphere</button><button type="button" role="tab" data-tab="sound">Sound</button><button type="button" role="tab" data-tab="ambience">Ambience</button><button type="button" role="tab" data-tab="tbc">Coming next</button><button type="button" role="tab" data-tab="all">Full list</button>
</nav>

<section id="catalogue"><h2>Effects catalogue</h2>
<p class="sec-sub">Every effect moment in the game, built or planned: the {len(_inv)} entries of the effects inventory, grouped by area. Press ▶ A, B or C to play a variant on its stage (cards, board, map, pack, UI or screen). Rows that say “not built yet” are waiting for their batch. The other tabs are the earlier showcase pages.</p>
<div id="fxlCov" class="fxl-cov"></div>
<div id="fxlProblems" class="fxl-problems" hidden></div>
<div class="fxl-views" role="tablist" aria-label="Catalogue view"><button type="button" role="tab" data-view="list" aria-selected="true">All effects <span class="fxl-n">{len(_inv)}</span></button><button type="button" role="tab" data-view="variants" aria-selected="false">Variants to choose <span class="fxl-n">0</span></button></div>
<div class="fxl-layout">
  <div class="fxl-left">
    <div id="fxlListView">
      <div class="fxl-tools" role="search">
        <input type="search" id="fxlQ" placeholder="Search name, id or trigger" aria-label="Search effects">
        <select id="fxlArea" aria-label="Area"></select>
        <select id="fxlQual" aria-label="Quality"><option value="">Any quality</option><option value="good">Good</option><option value="basic">Basic</option><option value="missing">Missing</option><option value="broken">Broken</option><option value="future">Future</option></select>
        <select id="fxlVars" aria-label="Variants"><option value="">Variants: any</option><option value="suggested">Variants suggested</option><option value="registered">Has 2+ variants</option></select>
        <select id="fxlBuilt" aria-label="Built"><option value="">Built or not</option><option value="built">Built in the lab</option><option value="todo">Not built yet</option></select>
        <select id="fxlFut" aria-label="Future"><option value="">Now and future</option><option value="hide">Hide future</option><option value="only">Future only</option></select>
        <button type="button" class="btn small ghost" id="fxlClear">Clear</button><span id="fxlShown"></span>
      </div>
      <div id="fxlList"></div>
    </div>
    <div id="fxlVariants" hidden></div>
  </div>
  <aside id="fxlDock" class="fxl-dock" aria-label="Stage">
    <div class="fxl-dockbar"><div id="fxlNow" class="fxl-now" aria-live="polite">Press ▶ on any built effect.</div><button type="button" id="fxlDockMin" class="fxl-x" aria-label="Shrink the stage" aria-expanded="true">▾</button><button type="button" id="fxlDockClose" class="fxl-x" aria-label="Close the stage">✕</button></div>
    <div id="fxlFrame" class="fxl-frame"></div>
    <div class="fxl-speed">Speed <button type="button" data-speed="1" aria-pressed="true">1×</button><button type="button" data-speed="0.5" aria-pressed="false">0.5×</button><button type="button" data-speed="0.25" aria-pressed="false">0.25×</button><button type="button" id="fxlReplay">↻ Replay</button></div>
  </aside>
</div>
</section>

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
  <button class="btn primary" data-skill="boomerang">🪃 Anti-Air boomerang</button><button class="btn primary" data-skill="shieldcall">🛡️ Shield Call</button><button class="btn primary" data-skill="backstab">🗡️ Backstab</button>
  <button class="btn" data-skill="frostdeath">❄️ Frost death shards</button><button class="btn" data-skill="poisondeath">☠ Poison death drips</button>
  <label class="sk-slow"><input type="checkbox" id="skSlow"> Slow motion (×4)</label>
</div>
<h3 class="disp-h">More skills <span class="st part" style="vertical-align:middle">Lab</span></h3>
<div class="btns sk-btns" id="skMore" style="margin-top:4px">
  <button class="btn" data-skill="swarm">🐜 Swarm</button><button class="btn" data-skill="regen">💚 Regeneration</button><button class="btn" data-skill="poisoncloud">☠ Poison cloud</button><button class="btn" data-skill="bleed">🩸 Bleed</button>
  <button class="btn" data-skill="thorns">🌵 Thorns</button><button class="btn" data-skill="earthquake">🌎💥 Earthquake</button><button class="btn" data-skill="quick">👢 Quick strike</button><button class="btn" data-skill="evasive">🍃 Evasive dodge</button>
  <button class="btn" data-skill="cleave">🪓 Cleave (Sweep)</button><button class="btn" data-skill="guardian">🛡 Guardian wall</button><button class="btn" data-skill="dynamite">🧨 Dynamite</button><button class="btn" data-skill="helmet">🪖 Helmet deflect</button>
  <button class="btn" data-skill="darksight">👁️ Darksight</button><button class="btn" data-skill="frostbite">🥶 Frostbite chill</button><button class="btn" data-skill="scorch">🔥 Immolation scorch</button><button class="btn" data-skill="lantern">🏮 Lantern glow</button>
</div>

<h3 class="disp-h">Even more skills <span class="st live" style="vertical-align:middle">Live</span></h3>
<p class="sec-sub" style="margin:2px 0 6px">2026-10-15: 29 more, each wired into real fights at the event that triggers it (see the table below and docs/effects-catalogue.md).</p>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">Air &amp; water</span><button class="btn" data-skill="swoop">🦅 Flying swoop</button><button class="btn" data-skill="gust">🪁 Tailwind gust</button><button class="btn" data-skill="splash">🏊 Swimmer splash</button></div>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">Weapons</span><button class="btn" data-skill="fork">🔱 Fork prongs</button><button class="btn" data-skill="octolash">🐙 Octolash</button><button class="btn" data-skill="piercethru">➹ Pierce through</button><button class="btn" data-skill="scar">🐾 Scar claws</button><button class="btn" data-skill="parry">⚔️ Counter parry</button><button class="btn" data-skill="crown">👑 King Slayer</button><button class="btn" data-skill="stealth">👻 Stealth slip</button></div>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">Defence</span><button class="btn" data-skill="armor">🛡️ Armor block</button><button class="btn" data-skill="armorpart">🛡 Armor glance</button><button class="btn" data-skill="perforate">🪓 Armor shred</button><button class="btn" data-skill="mirror">🪞 Reflect</button></div>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">Statuses</span><button class="btn" data-skill="stun">💫 Stun stars</button><button class="btn" data-skill="confuse">❓ Confused</button><button class="btn" data-skill="freeze">🧊 Freeze</button><button class="btn" data-skill="sleep">💤 Sleep</button><button class="btn" data-skill="paralyze">⚡ Paralyze</button><button class="btn" data-skill="corrode">🧪 Corrode</button><button class="btn" data-skill="blind">🖤 Blind ink</button><button class="btn" data-skill="fear">😨 Daunt</button><button class="btn" data-skill="curse">🜏 Weaken / curse</button><button class="btn" data-skill="expose">🎯 Expose</button><button class="btn" data-skill="addwait">⏳ +Wait</button><button class="btn" data-skill="coffee">☕ Coffee</button></div>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">Support</span><button class="btn" data-skill="sap">🩸 Sap drain</button><button class="btn" data-skill="bloom">🌸 Bloom pollen</button><button class="btn" data-skill="esprit">🤝 Esprit aura</button><button class="btn" data-skill="rage">😡 Berserk</button><button class="btn" data-skill="revive">✨ Revive</button><button class="btn" data-skill="summon">🥚 Summon</button><button class="btn" data-skill="loot">🪵 Lumber gain</button><button class="btn" data-skill="prayer">🕊️ Prayer</button></div>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">Earlier passes (2026-10-14)</span><button class="btn" data-skill="fireball">🟠 Fireball</button><button class="btn" data-skill="meteor">☄️ Meteor</button><button class="btn" data-skill="banana">🍌 Banana</button><button class="btn" data-skill="munch">😋 Munch</button><button class="btn" data-skill="smokebomb">🌫️ Smoke Bomb</button><button class="btn" data-skill="psychic">💭 Psychic</button></div>
<h3 class="disp-h">Arrows, Bolts and prongs <span class="st live" style="vertical-align:middle">Live</span></h3>
<p class="sec-sub" style="margin:2px 0 6px">2026-10-15: the new arrows, the Bolt family (one coloured glob per element), the reworked Fork / Trident / Pitchfork and Crab Claws, and Chilli.</p>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">Prongs</span><button class="btn" data-skill="fork">⇔ Fork (2 nearest)</button><button class="btn" data-skill="trident">🔱 Trident (3 nearest)</button><button class="btn" data-skill="pitchfork">🍴 Pitchfork (4 nearest)</button><button class="btn" data-skill="crabclaws">🦞 Crab Claws</button></div>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">Arrows</span><button class="btn" data-skill="icearrow">🧊🏹 Ice Arrow</button><button class="btn" data-skill="twinshot">🏹🏹 Twin Shot</button><button class="btn" data-skill="volley">🎯🏹 Volley</button></div>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">Bolts</span><button class="btn" data-skill="firebolt">🔥 Fire Bolt</button><button class="btn" data-skill="acidbolt">🧪 Acid Bolt</button><button class="btn" data-skill="poisonbolt">🐍 Poison Bolt</button><button class="btn" data-skill="icebolt">❄️ Ice Bolt</button><button class="btn" data-skill="shockbolt">⚡ Shock Bolt</button></div>
<div class="btns sk-btns" style="margin-top:4px"><span class="sk-grp" style="font:700 12px 'Baloo 2',system-ui,sans-serif; color:var(--ink-muted); min-width:9em">One-offs</span><button class="btn" data-skill="chilli">🌶️ Chilli</button><button class="btn" data-skill="chilliburn">🌶️ Chilli sting</button></div>
<div class="tbl" style="margin-top:12px"><table><thead><tr><th>Skill</th><th>Status</th><th>Beats</th></tr></thead><tbody>
<tr><td>🏹 Arrow</td><td><span class="st live">Live</span></td><td>Draw (lean back, arrow pulled) → release, recoil, string ring → arcing, accelerating flight → stick, quiver, knock-back, splinters</td></tr>
<tr><td>🔥 Fire Arrow</td><td><span class="st live">Live</span></td><td>As Arrow, plus a flame lit on the tip while drawing, an ember trail, a burst of flame, an ignite ring and a scorched edge on the target</td></tr>
<tr><td>🏹🏹 Volley</td><td><span class="st idea">Prototype</span></td><td>One draw, three arrows released in quick succession at up to three targets</td></tr>
<tr><td>➶ Pierce</td><td><span class="st idea">Prototype</span></td><td>The arrow passes through the first target and flies on into the next</td></tr>
<tr><td>🧪 Poison dart</td><td><span class="st idea">Prototype</span></td><td>A thin green dart with dripping trail; green splash ring on hit</td></tr>
<tr><td>❄️ Frost bolt</td><td><span class="st idea">Prototype</span></td><td>A spinning ice shard; shatters into frost and leaves a frosted card for a moment</td></tr>
<tr><td>⚡ Chain lightning</td><td><span class="st idea">Prototype</span></td><td>A flickering forked bolt jumping card to card</td></tr>
<tr><td>🪃 Anti-Air boomerang</td><td><span class="st live">Live</span></td><td>A spinning boomerang hooks up into the flier on a low curve, feathers fly, and it swings back on a higher one (whirr out and back)</td></tr>
<tr><td>🛡️ Shield Call</td><td><span class="st live">Live</span></td><td>A big shield drops from above into the slot, lands with a squash and a dust ring, then a ring of metal</td></tr>
<tr><td>🗡️ Backstab</td><td><span class="st live">Live</span></td><td>A dagger flashes in from the attacker's side and leaves a thin red slash; the target is shoved away from it</td></tr>
<tr><td>❄️ / ☠ Element deaths</td><td><span class="st live">Live</span></td><td>Cold deaths shed ice shards with a glassy crack; poison deaths drip green as the card melts</td></tr>
<tr><td>💚 Heal · 🛡️ Shield up · 🚩 Rally</td><td><span class="st idea">Prototype</span></td><td>Rising pluses and rings; a shield dome; a banner with golden chevrons rising through allies</td></tr>
<tr><td>🐜 Swarm</td><td><span class="st part">Lab</span></td><td>A buzzing cloud lifts off the attacker, converges on the target, mobs it, then scatters</td></tr>
<tr><td>💚 Regeneration</td><td><span class="st part">Lab</span></td><td>Green motes spiral in from around the card and a glowing stitch knits it closed</td></tr>
<tr><td>☠ Poison cloud</td><td><span class="st part">Lab</span></td><td>Green puffs billow up around the card, bubbles rise and the card sickens for a beat</td></tr>
<tr><td>🩸 Bleed</td><td><span class="st part">Lab</span></td><td>A quick red cut, then drops swell on the lower edge, fall and splat below</td></tr>
<tr><td>🌵 Thorns</td><td><span class="st part">Lab</span></td><td>Spikes burst from the defender toward the attacker, who is stung and knocked back</td></tr>
<tr><td>🌎💥 Earthquake</td><td><span class="st part">Lab</span></td><td>The board rumbles, cracks tear open under each card and they jump in dust</td></tr>
<tr><td>👢 Quick strike</td><td><span class="st part">Lab</span></td><td>Speed lines and afterimages as the attacker darts in, strikes and darts back</td></tr>
<tr><td>🍃 Evasive dodge</td><td><span class="st part">Lab</span></td><td>A blink sidestep leaving an afterimage; leaves flutter and “Miss!” pops</td></tr>
<tr><td>🪓 Cleave (Sweep)</td><td><span class="st part">Lab</span></td><td>One wide glowing arc swept across the row; each card is hit as the blade passes</td></tr>
<tr><td>🛡 Guardian wall</td><td><span class="st part">Lab</span></td><td>A hex shield wall rises in front of the card and pulses twice as it draws attacks</td></tr>
<tr><td>🧨 Dynamite</td><td><span class="st part">Lab</span></td><td>A lit stick is lobbed, fizzes, then blows: flash, fireball, smoke, debris and a rumble</td></tr>
<tr><td>🪖 Helmet deflect</td><td><span class="st part">Lab</span></td><td>A helmet flashes up; a bright ping, sparks, and a chip skips away</td></tr>
<tr><td>👁️ Darksight</td><td><span class="st part">Lab</span></td><td>The card darkens, two glowing eyes open and glance about, and hidden foes are marked</td></tr>
<tr><td>🥶 Frostbite chill</td><td><span class="st part">Lab</span></td><td>An icy breath rolls across, flakes settle, rime creeps in from the edges</td></tr>
<tr><td>🔥 Immolation scorch</td><td><span class="st part">Lab</span></td><td>Flames lick up from the lower edge in a heat shimmer; embers rise and the edge chars</td></tr>
<tr><td>🏮 Lantern glow</td><td><span class="st part">Lab</span></td><td>A lantern swings above the card, casting a warm flickering pool; moths circle</td></tr>
<tr><td>🦅 Flying swoop</td><td><span class="st live">Live</span></td><td>A bright air-trail climbs over the field and dives onto the target; feathers fly <em style="color:var(--ink-muted)">(on: A melee hit by a Flyer (once a round))</em></td></tr>
<tr><td>🪁 Tailwind gust</td><td><span class="st live">Live</span></td><td>Wind streaks across the card and it leans with them <em style="color:var(--ink-muted)">(on: A Flyer gets a Tailwind turn)</em></td></tr>
<tr><td>🏊 Swimmer splash</td><td><span class="st live">Live</span></td><td>Blue rings at its foot, droplets thrown up and falling back, a bob <em style="color:var(--ink-muted)">(on: A Swimmer gets its Flow turn)</em></td></tr>
<tr><td>🛡️ Armor block / glance</td><td><span class="st live">Live</span></td><td>A steel plate flashes over the card with a glint; sparks off the struck edge; a 🛡️ for a full block <em style="color:var(--ink-muted)">(on: A hit on an Armored unit (full block, or once a round when it only absorbs))</em></td></tr>
<tr><td>🪓 Armor shred</td><td><span class="st live">Live</span></td><td>The plate flashes and breaks into chips that fall away <em style="color:var(--ink-muted)">(on: Perforate takes Armor for good)</em></td></tr>
<tr><td>🔱 Fork prongs · 🐙 Octolash</td><td><span class="st live">Live</span></td><td>Steel tines (purple tentacles for Octolash) thrust into the struck card and pull back <em style="color:var(--ink-muted)">(on: A Fork / Trident / Pitchfork / Octolash side hit)</em></td></tr>
<tr><td>➹ Pierce through</td><td><span class="st live">Live</span></td><td>A lance of light punches through the card; chips fly from the exit <em style="color:var(--ink-muted)">(on: A Pierce/Rend hit through Armor, and Pierce damage to the castle)</em></td></tr>
<tr><td>💫 Stun stars · ❓ Confused</td><td><span class="st live">Live</span></td><td>Glyphs wheel round the card's head while it wobbles <em style="color:var(--ink-muted)">(on: Stun, Stun on hit, Stagger (✦), Confuse (❓), Tipsy (🫧))</em></td></tr>
<tr><td>🧊 Freeze</td><td><span class="st live">Live</span></td><td>A block of ice grows up over the card, cracks spider across it, it glazes away <em style="color:var(--ink-muted)">(on: Freeze on hit)</em></td></tr>
<tr><td>💤 Sleep</td><td><span class="st live">Live</span></td><td>The card dims and sways while three Z's float up <em style="color:var(--ink-muted)">(on: Sleep on hit, Coffee crash)</em></td></tr>
<tr><td>⚡ Paralyze</td><td><span class="st live">Live</span></td><td>Yellow sparks crackle round the edges, redrawn each flicker; the card twitches <em style="color:var(--ink-muted)">(on: Paralyze on hit)</em></td></tr>
<tr><td>🧪 Corrode</td><td><span class="st live">Live</span></td><td>Acid runs down the card, fizzing, with a yellow-green tint <em style="color:var(--ink-muted)">(on: Corrode, Ichor)</em></td></tr>
<tr><td>🖤 Blind ink</td><td><span class="st live">Live</span></td><td>Ink splats across the card's eyes and drips away <em style="color:var(--ink-muted)">(on: Blind)</em></td></tr>
<tr><td>😨 Daunt</td><td><span class="st live">Live</span></td><td>A cold purple pall; the card shivers and a bead of sweat flies off <em style="color:var(--ink-muted)">(on: Daunt, Cower)</em></td></tr>
<tr><td>🜏 Weaken / curse</td><td><span class="st live">Live</span></td><td>Dark tendrils climb the card and wring the colour out of it <em style="color:var(--ink-muted)">(on: Weaken (debuff), Render, Curse ticks)</em></td></tr>
<tr><td>🎯 Expose</td><td><span class="st live">Live</span></td><td>A red crosshair spins in, locks on and flashes <em style="color:var(--ink-muted)">(on: Expose)</em></td></tr>
<tr><td>⏳ +Wait · ☕ Coffee</td><td><span class="st live">Live</span></td><td>A clock pops up; its hands drag slowly round (more Wait) or race round (less) <em style="color:var(--ink-muted)">(on: Increase Wait; Coffee)</em></td></tr>
<tr><td>⚔️ Counter parry</td><td><span class="st live">Live</span></td><td>Blades cross between the cards with a ping, and the riposte shoves the attacker <em style="color:var(--ink-muted)">(on: Counterattack)</em></td></tr>
<tr><td>🪞 Reflect</td><td><span class="st live">Live</span></td><td>A mirror sheen sweeps the defender and a beam snaps back into the attacker <em style="color:var(--ink-muted)">(on: Reflect)</em></td></tr>
<tr><td>👑 King Slayer</td><td><span class="st live">Live</span></td><td>A crown pops over the King and cracks in two <em style="color:var(--ink-muted)">(on: King Slayer bonus)</em></td></tr>
<tr><td>👻 Stealth slip</td><td><span class="st live">Live</span></td><td>It melts into shadow and a dark afterimage slips across to the castle <em style="color:var(--ink-muted)">(on: A Stealth unit hits the castle)</em></td></tr>
<tr><td>🐾 Scar claws</td><td><span class="st live">Live</span></td><td>Three claw marks rake across the card and glow red <em style="color:var(--ink-muted)">(on: Scar)</em></td></tr>
<tr><td>🩸 Sap drain</td><td><span class="st live">Live</span></td><td>Red motes are pulled out of the unit it hit and stream into it <em style="color:var(--ink-muted)">(on: Sap heals the attacker)</em></td></tr>
<tr><td>🌸 Bloom pollen</td><td><span class="st live">Live</span></td><td>Petals and pollen drift from the flowering card to the healed ally <em style="color:var(--ink-muted)">(on: Bloom heals an ally)</em></td></tr>
<tr><td>🤝 Esprit aura</td><td><span class="st live">Live</span></td><td>Golden chevrons rise up through the card in a gold ring <em style="color:var(--ink-muted)">(on: Esprit, Grit, Inspiring, named buffs)</em></td></tr>
<tr><td>😡 Berserk</td><td><span class="st live">Live</span></td><td>Red steam vents, an anger mark pops, the card shudders <em style="color:var(--ink-muted)">(on: Berserk, Frenzy)</em></td></tr>
<tr><td>✨ Revive</td><td><span class="st live">Live</span></td><td>A pillar of light falls; the card lifts back out of grey with sparkles <em style="color:var(--ink-muted)">(on: Revivificated)</em></td></tr>
<tr><td>🥚 Summon</td><td><span class="st live">Live</span></td><td>A green rune circle spins open under the new card and it pops in <em style="color:var(--ink-muted)">(on: Any spawn (Brood, Twin, On Death spawns, Meiosis))</em></td></tr>
<tr><td>🪵 Lumber gain</td><td><span class="st live">Live</span></td><td>Logs hop from the card to the Lumber pill (or the enemy castle) <em style="color:var(--ink-muted)">(on: On Ready / On Spawn Lumber, Worthy)</em></td></tr>
<tr><td>🕊️ Prayer</td><td><span class="st live">Live</span></td><td>A beam of light falls on the card and a dove rises <em style="color:var(--ink-muted)">(on: Grace from Prayer and other Grace skills)</em></td></tr>
<tr><td>🔱 Fork · Trident · Pitchfork</td><td><span class="st live">Live</span></td><td>Steel tines thrust into each unit hit beyond the first (2 / 3 / 4 nearest, within 1 / 1 / 2 columns) <em style="color:var(--ink-muted)">(on: each prong hit, 2026-10-15 rework)</em></td></tr>
<tr><td>🧊🏹 Ice Arrow</td><td><span class="st live">Live</span></td><td>The bow shot; a block of ice grows over the unit when it freezes (1 in 2) <em style="color:var(--ink-muted)">(on: each Ice Arrow; its freeze)</em></td></tr>
<tr><td>🏹🏹 Twin Shot · 🎯🏹 Volley</td><td><span class="st live">Live</span></td><td>One bow shot per arrow, in quick succession <em style="color:var(--ink-muted)">(on: each arrow)</em></td></tr>
<tr><td>🔥🧪🐍❄️⚡ Bolts</td><td><span class="st live">Live</span></td><td>The shooter squashes as it spits; a wobbling glob in the element's colours lobs over, shedding droplets, and splats with a burst <em style="color:var(--ink-muted)">(on: each Bolt; the status effect plays after)</em></td></tr>
<tr><td>🌶️ Chilli</td><td><span class="st live">Live</span></td><td>A chilli pops up and is gobbled; the card flushes red, shakes and puffs steam (a smaller flash and wisp at each round-start sting) <em style="color:var(--ink-muted)">(on: eating it; each sting)</em></td></tr>
</tbody></table></div>
</section>

<section id="procfx"><h2>Procedural damage &amp; GSAP experiments <span class="st idea" style="vertical-align:middle">New</span></h2><p class="sec-sub">From bramblewood-procfx.js (ProcFX). Stone fractures dug by drunken-miner random walks, a cellular automaton that erodes a castle into falling rubble, and a procedurally aged “cards of old” finish. Everything is seeded: the same castle or card always breaks and ages the same way. Then five GSAP experiments: Voronoi shatter, a Flip riffle, a quickTo lantern, a scrubbable forge timeline and a grid ripple.</p>
<div class="bf-controls" style="margin:0 0 10px"><label class="sk-slow"><input type="checkbox" id="pfxSlow"> Slow motion (×4)</label></div>
<div class="fx-grid">
  <div class="fx"><h3>Drunken-miner cracks <span class="st idea">New</span></h3><div class="stage dark" id="pfxCrackStage">{{C_PFX_CASTLE}}</div>
    <div class="btns"><button class="btn small" data-pfx="crack" data-stage="1">≤66%</button><button class="btn small" data-pfx="crack" data-stage="2">≤33%</button><button class="btn small" data-pfx="crack" data-stage="3">≤15%</button><button class="btn small ghost" data-pfx="crack" data-stage="0">Repair</button><button class="btn small" data-pfx="reseed">🎲 New seed</button></div>
    <p>Click the castle to strike it there. Each hit sends out “miners”: random walks with momentum and sharp kinks that taper and branch, drawn with a dark gap, a shadowed core and a lit lower lip so they read as chiselled stone. A strike spalls a small crater. Calling it again keeps the old cracks and adds new ones.</p><div class="where">ProcFX.cracks · ProcFX.castleDamage(el, hp/max)</div></div>
  <div class="fx"><h3>Cellular-automaton crumble <span class="st idea">New</span></h3><div class="stage dark" id="pfxCrumbleStage">{{C_PFX_CASTLE2}}</div>
    <div class="btns"><button class="btn small primary" data-pfx="siege">🏰 Siege: crack ×3, then fall</button><button class="btn small" data-pfx="crumble">🧱 Crumble now</button></div>
    <p>A grid of jittered stone blocks over the tile. Each step a block breaks away with a chance that rises with its broken neighbours, along the cracks, and sharply when the block under it is gone. Fallen blocks leave the tile's mask and drop as rubble that bounces; broken edges get a dark rim with a lit lip.</p><div class="where">ProcFX.crumble · castle kill</div></div>
  <div class="fx pfx-wide"><h3>Cards of old <span class="st idea">New</span></h3><div class="stage" id="pfxOldStage">{{C_PFX_OLD}}</div>
    <div class="btns"><button class="btn small" data-pfx="oldseed">🎲 Age them differently</button><label class="sk-slow"><input type="checkbox" id="pfxOldClean"> Show the clean print</label></div>
    <p>An aged-paper finish grown per card: yellowed paper browning toward the edges, fibre grain and specks, foxing spots and a water stain with a darker tide line (both grown by a cellular automaton), drunken-walk creases with flaked ink along them, a dog-eared corner, rubbed white edges and corners, faded ink and an old halftone print. A soft warm sheen follows the light. Hover a card.</p><div class="where">card-tile is-holo holo-old · ProcFX.decorateOld</div></div>
  <div class="fx"><h3>Voronoi shatter <span class="st idea">New</span></h3><div class="stage dark" id="pfxShatterStage">{{C_PFX_SHATTER}}</div>
    <div class="btns"><button class="btn small" data-pfx="shatter">💥 Shatter</button></div>
    <p>Click the card to break it from there. Voronoi shards (denser near the hit), the fracture lines flash, then the shards fly on ballistic arcs with a 3D tumble; launch times come from gsap.utils.distribute so the break travels outward.</p><div class="where">ProcFX.shatter · quickSetter physics</div></div>
  <div class="fx"><h3>Flip riffle <span class="st idea">New</span></h3><div class="stage" id="pfxFlipStage">{{C_PFX_FLIP}}</div>
    <div class="btns"><button class="btn small" data-pfx="riffle">🔀 Riffle</button><button class="btn small" data-pfx="riffle2">🔀 Riffle ×3</button></div>
    <p>The row gathers, the order is shuffled, and Flip animates each card from where it was; cards moving right arc high and cards moving left arc low, so the halves interleave.</p><div class="where">ProcFX.flipShuffle · Flip plugin</div></div>
  <div class="fx"><h3>Lantern light <span class="st idea">New</span></h3><div class="stage dark" id="pfxLanternStage">{{C_PFX_LANTERN}}</div>
    <div class="btns"><button class="btn small" data-pfx="lantern">🏮 Light the lantern</button></div>
    <p>The board goes dark except a flickering pool of light that trails your pointer (quickTo); it wanders on its own when you leave. Cards turn to face it, brighten as it nears and cast shadows away from it.</p><div class="where">ProcFX.lantern · caves, Darksight</div></div>
  <div class="fx"><h3>Forge timeline <span class="st idea">New</span></h3><div class="stage dark" id="pfxForgeStage">{{C_PFX_FORGE}}</div>
    <div class="pfx-scrubrow">Scrub <input type="range" class="pfx-scrub" id="pfxForgeScrub" min="0" max="1000" value="0"></div>
    <div class="btns" id="pfxForgeBtns"><button class="btn small primary" data-forge="play">▶ Forge</button><button class="btn small" data-forge="heat">Heat</button><button class="btn small" data-forge="hammer">Hammer</button><button class="btn small" data-forge="quench">Quench</button><button class="btn small" data-forge="temper">Temper</button><button class="btn small ghost" data-forge="blank">Reset</button></div>
    <p>One timeline with labels: heat it red, three hammer blows with sparks, quench in steam, temper with a gold shine. Drag the slider to scrub, or jump to a label with tweenTo.</p><div class="where">ProcFX.forge · Forge, card upgrades</div></div>
  <div class="fx"><h3>Ripple from click <span class="st idea">New</span></h3><div class="stage dark" id="pfxRippleStage">{{C_PFX_RIPPLE}}</div>
    <p>Click any card: a wave pops through the grid from it. One gsap.utils.distribute grid stagger drives both the pop and the glow; the glow colour is interpolated from gold to teal by distance.</p><div class="where">ProcFX.ripple · rally, level-up, set complete</div></div>
</div></section>

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
  <div class="fx"><h3>Shockwave ripple <span class="st part">Lab</span></h3><div class="stage dark" id="waveStage">{{C_W1}}{{C_W2}}{{C_W3}}</div><div class="btns"><button class="btn small" data-gen="shockwave">💥 Shockwave</button></div><p>A ring of rippled, brightened air rolls out from the middle card; neighbours are shoved outward as it passes. For castle hits and big crits.</p><div class="where">SkillFX.shockwave</div></div>
  <div class="fx"><h3>Castle crumble <span class="st part">Lab</span></h3><div class="stage dark" id="crumbleStage">{{C_CASTLE2}}</div><div class="btns"><button class="btn small" data-gen="collapse">🧱 Collapse</button><button class="btn small" data-gen="sink">⬇ Sink</button><button class="btn small" data-gen="topple">↘ Topple</button></div><p><b>Collapse:</b> the tower breaks into bands that tumble down. <b>Sink:</b> it shudders and sinks into the ground in dust. <b>Topple:</b> it leans over its foot and crashes.</p><div class="where">SkillFX.castleCrumble</div></div>
  <div class="fx"><h3>Level-up burst <span class="st part">Lab</span></h3><div class="stage dark" id="lvlStage">{{C_LVL}}</div><div class="btns"><button class="btn small" data-gen="levelup">⭐ Level up</button></div><p>Gold rays turn behind the card, it pops, a LEVEL UP! ribbon stamps on and stars rise.</p><div class="where">SkillFX.levelUp</div></div>
  <div class="fx"><h3>Card unlock sparkle <span class="st part">Lab</span></h3><div class="stage dark" id="unlockStage">{{C_UNLOCK}}</div><div class="btns"><button class="btn small" data-gen="unlock">🔓 Unlock</button></div><p>The card starts greyed and locked; the padlock shakes and springs open, colour floods back with a glint and sparkles burst out.</p><div class="where">SkillFX.unlockSparkle</div></div>
  <div class="fx"><h3>Skirmish sky-drop <span class="st part">Lab</span></h3><div class="stage dark" id="dropStage" style="overflow:hidden">{{C_D1}}{{C_D2}}{{C_D3}}</div><div class="btns"><button class="btn small" data-gen="skydrop">🪂 Drop in</button></div><p>Cards fall from the sky one after another, their shadows growing on the ground, and land with a squash and a dust ring.</p><div class="where">SkillFX.skyDrop · map skirmish start</div></div>
  <div class="fx"><h3>Critical hit <span class="st live">Live</span></h3><div class="stage dark" id="critStage">{{C_CRIT}}</div><div class="btns"><button class="btn small" data-card="crit">▶ Critical hit</button></div><p>A 👊 number bursts out big on a gold starburst and recoils to size; a quick flash on the card. No CRIT! word any more.</p></div>
</div></section>

<section id="tbc"><h2>Coming next <span class="st idea" style="vertical-align:middle">TBC</span></h2><p class="sec-sub">The first list is all built. Here is the next one, not built yet; veto or reorder freely.</p>
<div class="fx-grid"><div class="fx tbc"><h3>🔗 Combo counter <span class="st idea">TBC</span></h3><p>Several hits in one round build a x2, x3… counter over the board. Waiting on a decision: cosmetic only, a small reward per step, or drop it.</p></div><div class="fx tbc"><h3>🧭 Card tilt in hand <span class="st idea">On hold</span></h3><p>Hand cards lean toward the pointer. On hold: the style guide keeps the magnetic tilt out of the hand strip, because it fights the drag and selection motion there.</p></div></div></section>

<section id="treatments"><h2>Foils</h2><p class="sec-sub">Every print finish on the same card. Hover a card (or turn on auto-tilt) to move the light. Live ones are in the game today; New ones are in the game's stylesheet, ready to assign to print variants, pack rarities or events; Aurora onward came from this Lab and are now in the game too.</p>
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
  <select id="bfKind" aria-label="Map"><option value="0">Forest (Outskirts)</option><option value="1">Water (Sunken Hollow)</option><option value="2">Volcano (Ashen Peak)</option><option value="3">Caves</option><option value="4">Savanna</option><option value="5">Tundra</option><option value="6">Coral</option><option value="7">Swamp</option><option value="8">Foundry</option><option value="9">Sky (Eyrie)</option><option value="10">Storm (Sundered Peak)</option><option value="11">Rain</option><option value="12">Beach (Pebble Beach)</option></select>
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

<section id="music"><h2>Music <span class="st live" style="vertical-align:middle">Live</span></h2><p class="sec-sub">Every note is composed or generated here and played by small synthesised instruments, so the whole library is ours: no samples, no licences, nothing to download. Use headphones.</p>
<h3 style="margin:14px 0 6px;font:800 16px 'Baloo 2',system-ui,sans-serif">Songbook: place themes</h3><p class="sec-sub">Written melodies that loop with small variations; each plays in its own place and crossfades when you move.</p>
<div class="snd-grid" id="songGrid"></div>
<h3 style="margin:18px 0 6px;font:800 16px 'Baloo 2',system-ui,sans-serif">Battle music: one band per people</h3><p class="sec-sub">Improvised live, at three intensities: calm, drums join (round 5+ or a castle under 60%), full (sudden death or a castle under 30%).</p>
<div class="btns" id="bandLvl"></div><div class="snd-grid" id="bandGrid"></div>
<h3 style="margin:18px 0 6px;font:800 16px 'Baloo 2',system-ui,sans-serif">Home</h3><p class="sec-sub">Home keeps the endless calm piano: a new short piece in a new key every minute or so.</p>
<div class="btns"><button type="button" class="btn small ghost" id="musicStop">⏹ Stop all music</button></div>
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
{procfx}
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
<script>
// 2026-10-15: Effects catalogue. The game's unit effects and the six effect batches (FX.A … FX.F), then the inventory,
// the stage fixtures, the FXLAB core, every manifest (registrations) and the catalogue page.
{unitfx}
{fxbatches}
window.FXLAB_INVENTORY = {inventory_js};
window.FXLAB_FIXTURES = {fixtures_js};
</script>
<script>
{fxcore}
</script>
{manifests}
<script>
{fxcatalogue}
</script>
'''
rep={'{TREAT_OPTS}':TREAT_OPTS,'{TREAT_CARDS}':treat_cards('legendary'),'{TREAT_JSON}':TREAT_JSON,'{SK_T1}':C('common'),'{SK_T2}':C('bee'),'{SK_T3}':C('ant'),'{SK_ALLY1}':C('rare'),'{SK_SHOOTER}':C('epic'),'{SK_ALLY2}':C('fire'),
 '{C_SLAM}':C('bee'),'{C_WAIT}':C('common'),'{C_B1}':C('rare'),'{C_B2}':C('epic'),'{C_B3}':C('ant'),'{C_SHINE}':C('legendary'),'{C_READY}':C('fire'),'{C_CRIT}':C('ant'),'{C_LOW}':C('rare'),'{C_DRAG}':C('legendary'),'{C_THRONE}':C('epic'),'{C_DRAW}':C('fire'),'{C_P1}':"<div class='board-card' style='position:relative'>"+C('bee')+"</div>",'{C_P2}':"<div class='board-card' style='position:relative'>"+C('ant')+"</div>",'{C_P3}':"<div class='board-card' style='position:relative'>"+C('common')+"</div>",'{C_W1}':C('rare'),'{C_W2}':C('legendary'),'{C_W3}':C('bee'),'{C_CASTLE2}':C('castle'),'{C_LVL}':C('epic'),'{C_UNLOCK}':C('legendary'),'{C_D1}':C('common'),'{C_D2}':C('fire'),'{C_D3}':C('bee'),'{C_CASTLE}':C('castle').replace('">', '"><div class="castle-cracks" aria-hidden="true"></div>', 1)}
def _old(k, n):
    return treat_tile(k, 'holo-old').replace('class="card-tile ', f'data-pfx-seed="old-{k}-{n}" class="card-tile ', 1)
rep.update({'{C_PFX_CASTLE}':C('castle'), '{C_PFX_CASTLE2}':C('castle'), '{C_PFX_SHATTER}':C('legendary'), '{C_PFX_FORGE}':C('epic'),
  '{C_PFX_OLD}':_old('legendary', 1) + _old('fire', 2) + _old('bee', 3) + _old('rare', 4),
  '{C_PFX_FLIP}':''.join(C(k) for k in ['common', 'rare', 'epic', 'legendary', 'fire']),
  '{C_PFX_LANTERN}':C('bee') + C('fire') + C('ant'),
  '{C_PFX_RIPPLE}':''.join(C(k) for k in (['common', 'rare', 'epic', 'legendary', 'fire', 'bee', 'ant'] * 2)[:12])})
for k,v in rep.items(): html=html.replace(k, v)
open(f'{ROOT}/.fxcat/effects.html','w',encoding='utf-8').write(html)
print(len(html))
# 2026-10-10: the page loads effects-lab.js from beside it; copy the source so the hub never serves a stale one.
import shutil as _sh
_sh.copy(f'{ROOT}/tools/effects-lab/effects-lab.js', f'{ROOT}/.fxcat/effects-lab.js')
# 2026-10-15: the catalogue's stages show the game's own art (card art, the castle, the map ground, the pack art), so every
# asset the fixtures point at is copied from the game's assets/ beside the page (.fxcat/assets/ → the hub root).
_need = set(re.findall(r'assets/((?:cards|castles|maps|fx|tex)/[\w.-]+?\.(?:png|webp|jpg|jpeg|gif|svg))', fixtures_js)) | {'maps/m1.png'}
# 2026-10-15 (batch E): every map's art (≈350 KB), so the map stage can be dressed as any map (map-theme-<id>) without 404s.
_need |= {'maps/' + f for f in os.listdir(f'{ROOT}/assets/maps') if f.endswith('.png')}
_copied = 0
# 2026-10-16: the game's fonts too (the map titles use Caveat, MedievalSharp and Lilita One; .fxcat/fonts was a stale hand copy).
for _f in os.listdir(f'{ROOT}/fonts'):
    _src, _dst = f'{ROOT}/fonts/{_f}', f'{ROOT}/.fxcat/fonts/{_f}'
    if os.path.isfile(_src) and not (os.path.exists(_dst) and os.path.getsize(_dst) == os.path.getsize(_src)):
        os.makedirs(os.path.dirname(_dst), exist_ok=True); _sh.copy(_src, _dst); _copied += 1
for _rel in sorted(_need):
    _src, _dst = f'{ROOT}/assets/{_rel}', f'{ROOT}/.fxcat/assets/{_rel}'
    if not os.path.exists(_src): continue
    if os.path.exists(_dst) and os.path.getsize(_dst) == os.path.getsize(_src): continue
    os.makedirs(os.path.dirname(_dst), exist_ok=True); _sh.copy(_src, _dst); _copied += 1
print('catalogue:', len(_inv), 'entries;', _copied, 'assets copied;', sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(f'{ROOT}/.fxcat') for f in fs if not f.endswith(('effects-test.html', 'playground.html', 'cards.json', 'fx-src.js'))) // 1024, 'KB lab total')
