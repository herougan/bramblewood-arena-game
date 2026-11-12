// 2026-11-13 (package UIFX1): places a player walks into. BramblewoodPlaces.enter(kind, el, opts) → Promise plays the place's entrance over the
// screen it opens (switchTab's one hook line passes every tab; one that is not a place only ends the last place's ambience) and starts its ambient
// life. Transform and opacity only (Web Animations); a tap, a key or the wheel skips; every node, timer and listener is gone at the end.
// Effects None: nothing. Reduced motion: a plain fade. Effects Low: the short, plain take, no ambience. Catalogue: docs/effects-catalogue.md.
(function(){
'use strict';
if(typeof window === 'undefined' || typeof document === 'undefined') return;
const W = window, D = document;
const ORDER = ['none', 'low', 'med', 'high'];
const lvl = ()=>{ try{ return typeof fxLevel === 'function' ? fxLevel() : 'high'; }catch(e){ return 'high'; } };
const atLeast = l=> ORDER.indexOf(lvl()) >= ORDER.indexOf(l);
const reduced = ()=>{ try{ return typeof reducedMotion === 'function' ? reducedMotion() : !!(W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
const live = ()=>{ try{ return typeof matchState !== 'undefined' && !!matchState && !matchState.over; }catch(e){ return false; } };
const sound = (n, ...a)=>{ try{ if(typeof SoundKit !== 'undefined' && typeof SoundKit[n] === 'function') SoundKit[n](...a); }catch(e){} };
const rng = seed=>{ let s = seed >>> 0 || 1; return ()=> (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }; // same motes every play
const SWING = 'cubic-bezier(.6,.02,.3,1)', OUT = 'cubic-bezier(.2,.7,.3,1)';

const CSS = `
.bwp-layer{position:fixed; inset:0; z-index:590; overflow:hidden; pointer-events:auto; cursor:pointer; contain:strict;}
.bwp-layer.is-hosted{position:absolute; z-index:50;}
.bwp-layer i, .bwp-layer b{position:absolute; display:block; pointer-events:none;}
.bwp-layer > i{will-change:transform, opacity;}
.bwp-glow{left:50%; top:52%; width:50vmax; height:50vmax; margin:-25vmax 0 0 -25vmax; border-radius:50%; opacity:0;
  background:radial-gradient(circle, rgba(255,230,170,1) 0, rgba(255,186,96,.72) 16%, rgba(255,150,60,.3) 32%, rgba(255,150,60,0) 52%);}
.bwp-glow.is-gold{background:radial-gradient(circle, rgba(255,240,190,.92) 0, rgba(240,196,90,.55) 16%, rgba(214,160,50,.18) 34%, rgba(214,160,50,0) 52%);}
.bwp-mote{left:50%; top:50%; width:6px; height:6px; margin:-3px; border-radius:50%; opacity:0; background:#fff0c4; box-shadow:0 0 8px 3px rgba(255,190,90,.6);}
/* the shop: an indigo-and-canvas tent (the cart's awning stripes), tied back to the poles */
.bwp-shop .bwp-flap{top:0; bottom:0; width:calc(50% + 12px); box-shadow:0 0 34px rgba(0,0,0,.5);
  background:linear-gradient(180deg, rgba(24,14,30,.45), rgba(24,14,30,0) 22%, rgba(24,14,30,0) 70%, rgba(24,14,30,.55)), linear-gradient(rgba(96,64,34,.3), rgba(96,64,34,.3)),
    repeating-linear-gradient(90deg, rgba(0,0,0,.26) 0, rgba(0,0,0,0) 20px, rgba(255,240,210,.08) 38px, rgba(0,0,0,0) 56px, rgba(0,0,0,.26) 76px),
    repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(90deg, #3b4a78 0 36px, #303d66 36px 38px, #d9c7a6 38px 74px, #c4b28e 74px 76px);}
.bwp-shop .bwp-flap.is-l{left:0; transform-origin:0 0;}
.bwp-shop .bwp-flap.is-r{right:0; transform-origin:100% 0; background-position:right top;}
.bwp-shop .bwp-flap b{top:0; bottom:0; width:16px; background:linear-gradient(90deg, rgba(20,14,30,.55), rgba(20,14,30,.15)), #2c3760;}
.bwp-shop .bwp-flap.is-l b{right:0; background:radial-gradient(ellipse 6px 12px at 50% 30%, #a87a44 0 92%, transparent) no-repeat, radial-gradient(ellipse 6px 12px at 50% 52%, #a87a44 0 92%, transparent) no-repeat,
    radial-gradient(ellipse 6px 12px at 50% 74%, #a87a44 0 92%, transparent) no-repeat, repeating-linear-gradient(180deg, #e9dcc0 0 7px, transparent 7px 13px) 4px 0 / 2px 100% no-repeat, linear-gradient(270deg, rgba(20,14,30,.6), rgba(20,14,30,.1)), #2c3760;}
.bwp-shop .bwp-flap.is-r b{left:0; background:repeating-linear-gradient(180deg, #e9dcc0 0 7px, transparent 7px 13px) 10px 0 / 2px 100% no-repeat, linear-gradient(90deg, rgba(20,14,30,.6), rgba(20,14,30,.1)), #2c3760;}
.bwp-shop .bwp-flap::after{content:''; position:absolute; top:0; bottom:0; width:70px; background:linear-gradient(90deg, rgba(255,200,120,0), rgba(255,200,120,.38));} /* lantern light on the inner edge */
.bwp-shop .bwp-flap.is-l::after{right:16px;} .bwp-shop .bwp-flap.is-r::after{left:16px; transform:scaleX(-1);}
.bwp-slit{left:50%; top:0; bottom:0; width:28px; margin-left:-14px; opacity:0; background:linear-gradient(90deg, rgba(255,190,100,0), rgba(255,214,140,.7) 30%, rgba(255,246,214,1) 50%, rgba(255,214,140,.7) 70%, rgba(255,190,100,0));}
.bwp-valance{left:-8px; right:-8px; top:0; height:44px; background:repeating-linear-gradient(90deg, #3b4a78 0 40px, #d9c7a6 40px 80px); box-shadow:0 6px 10px rgba(0,0,0,.35);
  -webkit-mask:linear-gradient(#000 0 0) top / 100% 30px no-repeat, radial-gradient(circle at 20px 30px, #000 12px, transparent 12.5px) 0 0 / 40px 44px repeat-x;
          mask:linear-gradient(#000 0 0) top / 100% 30px no-repeat, radial-gradient(circle at 20px 30px, #000 12px, transparent 12.5px) 0 0 / 40px 44px repeat-x;}
/* the Premium shop: a gilded pavilion, plum velvet with gold braid, a Gold Leaf crest that unclasps */
.bwp-premium .bwp-flap{top:0; bottom:0; width:calc(50% + 10px); box-shadow:0 0 40px rgba(0,0,0,.55);
  background:repeating-linear-gradient(90deg, rgba(0,0,0,.34) 0, rgba(0,0,0,0) 24px, rgba(255,170,215,.12) 42px, rgba(0,0,0,0) 60px, rgba(0,0,0,.34) 84px), linear-gradient(180deg, #6e1a44, #4c1030 58%, #300a1e);}
.bwp-premium .bwp-flap.is-l{left:0; transform-origin:0 0;}
.bwp-premium .bwp-flap.is-r{right:0; transform-origin:100% 0;}
.bwp-premium .bwp-flap b{top:0; bottom:0; width:12px; background:linear-gradient(90deg, #8a6420, #f5d77e 45%, #b8862b);}
.bwp-premium .bwp-flap.is-l b{right:0;} .bwp-premium .bwp-flap.is-r b{left:0;}
.bwp-premium .bwp-flap::after{content:''; position:absolute; left:0; right:0; bottom:0; height:30px; border-top:4px solid #e8c06a;
  background:repeating-linear-gradient(90deg, #e8c06a 0 3px, #a87a24 3px 5px, transparent 5px 9px);}
.bwp-pelmet{left:-6px; right:-6px; top:0; height:64px; box-shadow:0 8px 14px rgba(0,0,0,.45);
  border-bottom:5px solid #d9ae4e;}
.bwp-pelmet{background:repeating-linear-gradient(90deg, rgba(0,0,0,.22) 0, rgba(0,0,0,0) 14px, rgba(255,170,215,.08) 24px, rgba(0,0,0,0) 34px, rgba(0,0,0,.22) 48px), linear-gradient(180deg, #5a1236, #3e0c26);}
.bwp-pelmet::before{content:''; position:absolute; left:0; right:0; top:8px; height:3px; background:repeating-linear-gradient(90deg, #e8c06a 0 6px, #a87a24 6px 9px);}
.bwp-pelmet::after{content:''; position:absolute; left:0; right:0; top:100%; height:26px;
  background:radial-gradient(circle at 24px 2px, #f3d27a 0 4px, #8a6420 4.5px 5px, transparent 5.5px) 0 14px / 48px 12px repeat-x,
    radial-gradient(ellipse 24px 16px at 24px 0, #4c1030 0 90%, #e8c06a 91% 99%, transparent 100%) 0 0 / 48px 17px repeat-x;}
.bwp-crest{left:50%; top:26px; width:70px; height:70px; margin-left:-35px; border-radius:50%; overflow:hidden;
  background:radial-gradient(circle at 36% 30%, #fff6cc, #f3d27a 30%, #c4922e 66%, #7a5418);
  box-shadow:0 0 0 4px #4c1030, 0 0 0 7px #e8c06a, 0 8px 18px rgba(0,0,0,.5);}
.bwp-crest::before{content:''; position:absolute; left:50%; top:50%; width:30px; height:30px; margin:-15px 0 0 -15px; border-radius:0 100% 0 100%; transform:rotate(45deg);
  background:linear-gradient(135deg, #b8501a, #7a2a10); box-shadow:inset 0 0 0 2px rgba(255,230,160,.5);}
.bwp-crest::after{content:''; position:absolute; left:50%; top:24%; bottom:24%; width:2px; margin-left:-1px; background:rgba(255,230,160,.8); transform:rotate(45deg);}
.bwp-crest b{top:-10%; bottom:-10%; left:0; width:30%; background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.75), rgba(255,255,255,0)); transform:translateX(-140%) skewX(-18deg);}
.bwp-rays{left:50%; top:40%; width:85vmax; height:85vmax; margin:-42.5vmax 0 0 -42.5vmax; border-radius:50%; opacity:0;
  background:repeating-conic-gradient(from 0deg, rgba(255,226,150,.42) 0 5deg, rgba(255,226,150,0) 5deg 15deg);
  -webkit-mask:radial-gradient(circle, #000 0, rgba(0,0,0,.6) 22%, transparent 50%); mask:radial-gradient(circle, #000 0, rgba(0,0,0,.6) 22%, transparent 50%);}
.bwp-gleaf{left:50%; top:60px; width:19px; height:19px; margin:-9.5px; border-radius:0 100% 0 100%; opacity:0;
  background:linear-gradient(135deg, transparent 46%, rgba(140,90,20,.75) 46% 54%, transparent 54%), linear-gradient(135deg, #fff6c0, #f5c842 40%, #d99a1e 70%, #9a6412);
  box-shadow:inset 0 0 0 1px rgba(122,84,24,.6), 0 0 6px rgba(255,214,110,.55);}
/* the Nest: the twig rim opens around you, down drifts out (the twigs are one seeded SVG, nestTwigs(), drawn once and scaled) */
.bwp-rim{left:50%; top:50%; width:120vmax; height:120vmax; margin:-60vmax 0 0 -60vmax; border-radius:50%;}
.bwp-down{left:50%; top:50%; width:16px; height:24px; margin:-12px 0 0 -8px; opacity:0; border-radius:50% 50% 45% 45%;
  background:linear-gradient(90deg, transparent 47%, rgba(190,170,140,.8) 47% 53%, transparent 53%) 0 40% / 100% 60% no-repeat, radial-gradient(ellipse at 40% 30%, #fffaf0, #eadfc8 58%, rgba(234,223,200,0) 72%);}
/* the Codex: the great book's tooled leather cover swings open on its spine, the marbled flyleaf follows */
.bwp-codex{perspective:1400px;}
.bwp-codex .bwp-page{inset:0; transform-origin:0 50%; backface-visibility:hidden;
  background:linear-gradient(90deg, rgba(70,44,20,.45), rgba(70,44,20,0) 7%), radial-gradient(ellipse 18% 9% at 22% 30%, rgba(60,110,120,.32), transparent 70%), radial-gradient(ellipse 14% 22% at 64% 62%, rgba(176,96,40,.28), transparent 70%),
    radial-gradient(ellipse 26% 12% at 78% 22%, rgba(60,110,120,.26), transparent 70%), radial-gradient(ellipse 22% 14% at 36% 78%, rgba(150,120,50,.3), transparent 70%),
    repeating-radial-gradient(ellipse 60% 40% at 40% 50%, rgba(90,120,120,.08) 0 6px, transparent 6px 15px), #ede0c0;}
.bwp-shade{inset:0; opacity:0; background:linear-gradient(90deg, rgba(40,20,8,.75), rgba(40,20,8,.25) 40%, rgba(40,20,8,0) 80%);}
.bwp-cover{inset:0; transform-origin:0 50%; backface-visibility:hidden;
  background:linear-gradient(180deg, transparent 17%, rgba(0,0,0,.45) 17% 18%, rgba(255,214,160,.16) 18% 20.5%, transparent 20.5% 39%, rgba(0,0,0,.45) 39% 40%, rgba(255,214,160,.16) 40% 42.5%, transparent 42.5% 57.5%,
      rgba(0,0,0,.45) 57.5% 58.5%, rgba(255,214,160,.16) 58.5% 61%, transparent 61% 79.5%, rgba(0,0,0,.45) 79.5% 80.5%, rgba(255,214,160,.16) 80.5% 83%, transparent 83%) 0 0 / 40px 100% no-repeat,
    radial-gradient(ellipse 70% 55% at 52% 45%, rgba(255,220,170,.12), transparent 70%), radial-gradient(circle at 30% 20%, rgba(0,0,0,.09) 0 1px, transparent 1px) 0 0 / 5px 5px,
    linear-gradient(90deg, rgba(0,0,0,.6), rgba(0,0,0,.2) 40px, rgba(255,210,150,.1) 44px, rgba(0,0,0,0) 52px), linear-gradient(160deg, #6e3a20, #4a2412 58%, #331607);}
.bwp-cover::before{content:''; position:absolute; inset:22px 22px 22px 58px; border:2px solid #c9a24a; border-radius:6px; box-shadow:inset 0 0 0 5px rgba(0,0,0,0), inset 0 0 0 6px rgba(201,162,74,.8);}
.bwp-cover::after{content:''; position:absolute; inset:70px 70px 70px 106px; border:1px solid rgba(201,162,74,.6); border-radius:4px; background:rgba(40,16,6,.22);}
.bwp-cover > b{width:46px; height:46px; z-index:1; background:radial-gradient(circle at 30% 30%, #f6dc8c, #c9a24a 55%, #7a5a20); box-shadow:0 2px 4px rgba(0,0,0,.5);}
.bwp-cover > b.c1{left:46px; top:10px; border-radius:0 0 100% 0;} .bwp-cover > b.c2{right:10px; top:10px; border-radius:0 0 0 100%;}
.bwp-cover > b.c3{left:46px; bottom:10px; border-radius:0 100% 0 0;} .bwp-cover > b.c4{right:10px; bottom:10px; border-radius:100% 0 0 0;}
.bwp-cover > i{left:calc(50% + 18px); top:50%; width:150px; height:150px; margin:-75px 0 0 -75px; border-radius:50%; overflow:hidden; z-index:1;
  background:radial-gradient(circle, #2e6a5c 0 7%, #f3d684 7.5% 10%, transparent 10.5% 56%, #c9a24a 57% 60%, transparent 61% 66%, #e6c272 67% 71%, #8a6a2a 72% 73%, transparent 74%);}
.bwp-cover > i::before{content:''; position:absolute; left:50%; top:50%; width:66px; height:66px; margin:-33px 0 0 -33px; transform:rotate(45deg); border:3px solid #d9b45a; box-shadow:inset 0 0 0 5px rgba(0,0,0,0), inset 0 0 0 6px rgba(217,180,90,.6);}
.bwp-cover > i::after{content:''; position:absolute; inset:0; border-radius:50%; background:repeating-conic-gradient(from 0deg, rgba(232,196,110,.9) 0 2deg, transparent 2deg 15deg);
  -webkit-mask:radial-gradient(circle, transparent 0 46%, #000 47% 53%, transparent 54%); mask:radial-gradient(circle, transparent 0 46%, #000 47% 53%, transparent 54%);}
.bwp-cover > i b{top:-10%; bottom:-10%; left:0; width:34%; z-index:1; background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,250,230,.75), rgba(255,255,255,0)); transform:translateX(-160%) skewX(-16deg);}
/* the Camp: the tent's door is rolled up, the campfire glows behind it */
.bwp-door{inset:0; transform-origin:50% 0;
  background:radial-gradient(ellipse 120% 90% at 50% 40%, transparent 55%, rgba(30,10,6,.55) 100%), repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, #6e2a20 0 70px, #521d16 70px 73px, #78302a 73px 143px, #521d16 143px 146px), #6b2a1f;}
.bwp-door::after{content:''; position:absolute; left:0; right:0; bottom:0; height:14px; background:repeating-linear-gradient(90deg, #e9dcc0 0 9px, transparent 9px 15px) 0 4px / 100% 2px no-repeat, #4a1a12;}
.bwp-roll{left:-2%; right:-2%; height:40px; top:calc(100% - 40px); border-radius:20px; box-shadow:0 6px 12px rgba(0,0,0,.45);
  background:repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 2px, transparent 2px 73px), linear-gradient(180deg, #3a120e, #8a3a2a 30%, #b4604e 44%, #6e2a20 70%, #2e0e0a);}
.bwp-rope{top:0; bottom:20px; width:5px; margin-left:-2.5px; transform-origin:50% 0; background:repeating-linear-gradient(160deg, #d9b47a 0 4px, #8a6a3a 4px 7px); box-shadow:0 2px 3px rgba(0,0,0,.4);}
.bwp-fire{left:50%; bottom:-12.5vh; width:60vmax; height:35vh; margin-left:-30vmax; border-radius:50%; opacity:0;
  background:radial-gradient(ellipse at 50% 70%, rgba(255,190,90,.85), rgba(255,120,40,.4) 30%, rgba(255,110,30,0) 62%);}
.bwp-ember{left:50%; bottom:6vh; width:5px; height:5px; margin-left:-2.5px; border-radius:50%; opacity:0; background:#ffd27a; box-shadow:0 0 8px 2px rgba(255,130,40,.8);}
/* the Stomping Grounds: the arena's timber gates swing in, sand dust rolls out */
.bwp-stomp{perspective:1300px;}
.bwp-gate{top:0; bottom:0; width:50%; box-shadow:inset 0 0 70px rgba(0,0,0,.55);
  background:radial-gradient(circle, #9a9088 0 3px, #3a332e 3px 4px, transparent 4.5px) 23px 15% / 46px 24px repeat-x, radial-gradient(circle, #9a9088 0 3px, #3a332e 3px 4px, transparent 4.5px) 23px 82% / 46px 24px repeat-x,
    linear-gradient(180deg, transparent 12%, #2e2824 12% 18%, transparent 18% 79%, #2e2824 79% 85%, transparent 85%),
    repeating-linear-gradient(90deg, rgba(0,0,0,.45) 0 3px, rgba(255,220,170,.06) 3px 6px, transparent 6px 46px), linear-gradient(180deg, #84593a, #6a4628 50%, #553620);}
.bwp-gate.is-l{left:0; transform-origin:0 50%;} .bwp-gate.is-r{right:0; transform-origin:100% 50%;}
.bwp-gate b{top:50%; width:46px; height:46px; margin-top:-23px; border-radius:50%; border:6px solid #3a332e; box-shadow:0 3px 0 rgba(0,0,0,.35), inset 0 0 0 2px #8a8078;}
.bwp-gate.is-l b{right:22px;} .bwp-gate.is-r b{left:22px;}
.bwp-sun{left:50%; top:0; bottom:0; width:60px; margin-left:-30px; opacity:0; background:linear-gradient(90deg, rgba(255,226,160,0), rgba(255,236,190,.9), rgba(255,226,160,0));}
.bwp-dust{left:50%; bottom:2vh; width:120px; height:80px; margin-left:-60px; border-radius:50%; opacity:0;
  background:radial-gradient(ellipse, rgba(214,182,128,.85), rgba(190,156,104,.4) 50%, rgba(190,156,104,0) 70%);}
/* the Inventory: the satchel's flap lifts off its buckle */
.bwp-inventory{perspective:1200px;}
.bwp-inside{inset:0; background:radial-gradient(ellipse 80% 70% at 50% 45%, rgba(30,16,6,.35), rgba(30,16,6,.85));}
.bwp-sflap{left:0; right:0; top:0; height:86%; transform-origin:50% 0; border-radius:0 0 50% 50% / 0 0 22% 22%; box-shadow:0 18px 34px rgba(0,0,0,.55);
  background:radial-gradient(ellipse 70% 50% at 50% 26%, rgba(255,220,170,.14), transparent 70%), radial-gradient(circle at 30% 30%, rgba(0,0,0,.07) 0 1px, transparent 1.5px) 0 0 / 6px 6px,
    linear-gradient(180deg, #8a5630, #6a3e1e 64%, #52300f);}
.bwp-sflap::before{content:''; position:absolute; inset:16px; border:2px dashed rgba(240,210,160,.7); border-radius:0 0 50% 50% / 0 0 22% 22%;}
.bwp-strap{left:50%; top:calc(86% - 46px); width:44px; height:calc(14% + 46px); margin-left:-22px; background:linear-gradient(90deg, #4a2a10, #6a3e1e 30%, #6a3e1e 70%, #4a2a10);}
.bwp-strap::before{content:''; position:absolute; left:6px; right:6px; top:6px; bottom:0; border:2px dashed rgba(240,210,160,.55); border-bottom:0;}
.bwp-buckle{left:50%; top:calc(86% - 34px); width:60px; height:44px; margin-left:-30px; border-radius:8px; border:7px solid #d9ae4e;
  box-shadow:inset 0 0 0 2px #8a6420, 0 3px 6px rgba(0,0,0,.45); background:transparent;}
.bwp-buckle::after{content:''; position:absolute; left:50%; top:-4px; bottom:-4px; width:6px; margin-left:-3px; border-radius:3px; background:#b8862b;}
/* ambient life while a place is open: transform and opacity only, behind the panels */
.bwp-host{position:relative;}
.bwp-host > .bwp-amb{position:absolute !important; inset:0; z-index:0 !important; pointer-events:none; overflow:hidden; border-radius:inherit;}
.bwp-amb.is-fixed{position:fixed; inset:0; z-index:1; pointer-events:none; overflow:hidden;}
.bwp-amb i{position:absolute; display:block; pointer-events:none;}
.bwp-amb .bwp-lamp{left:8%; right:8%; top:0; height:230px; background:radial-gradient(ellipse 50% 62% at 50% 22%, rgba(255,196,110,.42), rgba(255,196,110,0) 72%); animation:bwpFlicker 3.4s linear infinite;}
.bwp-amb .bwp-lamp.is-gold{background:radial-gradient(ellipse 50% 62% at 50% 22%, rgba(255,226,140,.4), rgba(255,226,140,0) 72%); animation-duration:5.2s;}
.bwp-amb .bwp-speck{width:4px; height:4px; border-radius:50%; background:#ffe6a8; box-shadow:0 0 6px 2px rgba(255,190,90,.45); opacity:0; animation:bwpRise linear infinite;}
.bwp-amb .bwp-gleaf{top:-20px; opacity:0; margin:0; animation:bwpFall linear infinite;}
.bwp-amb .bwp-down{top:-24px; margin:0; opacity:0; animation:bwpFall linear infinite;}
.bwp-amb .bwp-fire{left:0; width:100%; margin:0; bottom:-120px; height:300px; animation:bwpFlicker 2.6s linear infinite; background:radial-gradient(ellipse at 50% 70%, rgba(255,170,80,.42), rgba(255,120,40,.16) 34%, rgba(255,110,30,0) 62%);}
.bwp-amb .bwp-ember{bottom:20px; opacity:0; margin:0; animation:bwpRise linear infinite;}
.bwp-amb .bwp-shaft{left:-10%; top:-20%; width:46%; height:150%; transform:rotate(24deg); transform-origin:0 0;
  background:linear-gradient(90deg, rgba(255,236,190,0), rgba(255,236,190,.09) 30%, rgba(255,236,190,.12) 50%, rgba(255,236,190,.09) 70%, rgba(255,236,190,0)); animation:bwpBreathe 8s ease-in-out infinite;}
.bwp-amb .bwp-shaft .bwp-speck{animation-name:bwpDrift;}
@keyframes bwpFlicker{0%,100%{opacity:1;} 12%{opacity:.82;} 19%{opacity:.97;} 41%{opacity:.86;} 58%{opacity:1;} 73%{opacity:.8;} 86%{opacity:.94;}}
@keyframes bwpBreathe{0%,100%{opacity:.55;} 50%{opacity:1;}}
@keyframes bwpRise{0%{transform:translate(0,0); opacity:0;} 15%{opacity:.9;} 80%{opacity:.6;} 100%{transform:translate(var(--dx, 18px), var(--dy, -160px)); opacity:0;}}
@keyframes bwpDrift{0%{transform:translate(0,0); opacity:0;} 25%{opacity:.85;} 75%{opacity:.7;} 100%{transform:translate(var(--dx, 30px), var(--dy, 60px)); opacity:0;}}
@keyframes bwpFall{0%{transform:translate(0,0) rotate(0deg); opacity:0;} 10%{opacity:.9;} 50%{transform:translate(var(--dx, 30px), calc(var(--dy, 420px) / 2)) rotate(160deg);} 90%{opacity:.8;}
  100%{transform:translate(calc(var(--dx, 30px) * -.4), var(--dy, 420px)) rotate(320deg); opacity:0;}}
body.bwp-on-shop #view-shop.cart-scene::before, body.bwp-on-premium #view-shop.cart-scene::before{transform-origin:50% 0; animation:bwpBreeze 6.5s ease-in-out infinite;}
@keyframes bwpBreeze{0%,100%{transform:none;} 30%{transform:scaleY(1.07) skewX(-.6deg);} 55%{transform:scaleY(.97);} 78%{transform:scaleY(1.04) skewX(.5deg);}}
html[data-fx="low"] .bwp-amb, html[data-fx="none"] .bwp-amb{display:none;}
html[data-fx="low"] body.bwp-on-shop #view-shop.cart-scene::before, html[data-fx="none"] body.bwp-on-shop #view-shop.cart-scene::before{animation:none;}
@media (prefers-reduced-motion: reduce){ .bwp-amb{display:none;} body.bwp-on-shop #view-shop.cart-scene::before, body.bwp-on-premium #view-shop.cart-scene::before{animation:none;} }
@media (max-width:560px){ .bwp-cover::before{inset:14px 14px 14px 48px;} .bwp-cover > b{width:32px; height:32px;} .bwp-cover > b.c1, .bwp-cover > b.c3{left:34px;} .bwp-cover::after{inset:44px 40px 44px 66px;} .bwp-cover > i{width:112px; height:112px; margin:-56px 0 0 -56px;} .bwp-cover > i::before{width:48px; height:48px; margin:-24px 0 0 -24px;} .bwp-gate b{width:34px; height:34px; margin-top:-17px; border-width:5px;} }
`;
// The Nest's rim: about 520 short bent twigs laid mostly round the hole (seeded, so every visit is the same nest), a hole cut by an
// even-odd clip, a dark lip and the warm light inside as CSS layers on top. Built once per page.
let twigs = '';
function nestTwigs(){
  if(twigs) return twigs;
  const R = rng(42), C = ['#24160a', '#3a2614', '#4f3620', '#6b4c2e', '#87643e', '#a9834f', '#c9a46a', '#dcbc84'];
  let p = '';
  for(let k = 0; k < 520; k++){
    const r = 84 + Math.pow(R(), 1.35) * 640, a = R() * 6.2832, t = a + 1.5708 + (R() - .5) * 1.1, L = 30 + R() * 95, bend = (R() - .5) * 26;
    const x = 500 + Math.cos(a) * r, y = 500 + Math.sin(a) * r, dx = Math.cos(t) * L / 2, dy = Math.sin(t) * L / 2, f = n=> n.toFixed(0);
    p += `<path d="M${f(x - dx)} ${f(y - dy)}Q${f(x + bend * Math.cos(a))} ${f(y + bend * Math.sin(a))} ${f(x + dx)} ${f(y + dy)}" stroke="${C[(R() * C.length) | 0]}" stroke-width="${(1.6 + R() * 3.4).toFixed(1)}"/>`;
  }
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="g"><stop offset=".08" stop-color="#7a5836"/><stop offset=".45" stop-color="#4a3320"/>'
    + '<stop offset="1" stop-color="#1e1208"/></radialGradient><clipPath id="c"><path clip-rule="evenodd" d="M0 0H1000V1000H0ZM500 418A82 82 0 1 0 500.1 418Z"/></clipPath></defs>'
    + `<g clip-path="url(#c)"><rect width="1000" height="1000" fill="url(#g)"/><g fill="none" stroke-linecap="round">${p}</g></g></svg>`;
  return twigs = 'radial-gradient(circle closest-side, rgba(20,12,6,0) 0 16.2%, rgba(20,12,6,.9) 16.6%, rgba(20,12,6,.35) 20%, rgba(20,12,6,0) 28%), '
    + 'radial-gradient(circle closest-side, rgba(255,214,150,.2) 0 17%, rgba(255,214,150,0) 40%), url("data:image/svg+xml,' + encodeURIComponent(svg) + '") center / 100% 100% no-repeat';
}
let styled = false;
function css(){ if(styled) return; styled = true; if(D.getElementById('bwp-style')) return; const s = D.createElement('style'); s.id = 'bwp-style'; s.textContent = CSS; (D.head || D.body).appendChild(s); }

// ---- one entrance at a time ----
let cur = null;
function begin(kind, host, ms, rate){
  css();
  const lay = D.createElement('div');
  lay.className = 'bwp-layer bwp-' + kind + (host === D.body ? '' : ' is-hosted');
  lay.setAttribute('aria-hidden', 'true');
  host.appendChild(lay);
  const run = {kind, lay, ms, rate: rate > 0 ? rate : 1, anims: [], timers: [], done: false};
  run.skip = ()=> finish(run);
  run.tap = ()=> finish(run, true);
  lay.addEventListener('pointerdown', run.tap);
  W.addEventListener('keydown', run.skip, true);
  W.addEventListener('wheel', run.skip, {capture: true, passive: true});
  run.promise = new Promise(res=> run.resolve = res);
  run.timers.push(setTimeout(run.skip, ms / run.rate + 400)); // never outlives its own length, whatever the animation clock does
  return run;
}
// eat: the tap that skipped must not also press what is under it (a touch's click is aimed after the finger lifts), so an empty, clear
// layer stays to swallow that one click, 500 ms at most.
function finish(run, eat){
  if(run.done) return; run.done = true;
  const lay = run.lay;
  run.timers.forEach(clearTimeout); run.timers.length = 0;
  lay.removeEventListener('pointerdown', run.tap);
  W.removeEventListener('keydown', run.skip, true);
  W.removeEventListener('wheel', run.skip, {capture: true});
  run.anims.forEach(a=>{ try{ a.cancel(); }catch(e){} }); run.anims.length = 0;
  if(eat){
    lay.textContent = ''; lay.style.opacity = '0';
    let t = 0; const gone = ()=>{ clearTimeout(t); lay.removeEventListener('click', swallow, true); lay.remove(); }, swallow = e=>{ e.preventDefault(); e.stopPropagation(); gone(); };
    lay.addEventListener('click', swallow, true); t = setTimeout(gone, 500);
  } else lay.remove();
  if(cur === run) cur = null;
  run.resolve(true);
}
function bit(run, cls, style, html){ const i = D.createElement('i'); i.className = cls; if(style) i.style.cssText = style; if(html) i.innerHTML = html; run.lay.appendChild(i); return i; }
function an(run, node, frames, ms, delay, ease){
  const a = node.animate(frames, {duration: ms, delay: delay || 0, easing: ease || OUT, fill: 'both'});
  if(run.rate !== 1) a.playbackRate = run.rate;
  run.anims.push(a); return a;
}
function later(run, ms, fn){ run.timers.push(setTimeout(fn, ms / run.rate)); }
function size(run){ const h = run.lay.parentNode; if(h && h !== D.body && h.getBoundingClientRect){ const r = h.getBoundingClientRect(); if(r.width) return {w: r.width, h: r.height}; } return {w: W.innerWidth || 1024, h: W.innerHeight || 768}; }
// motes thrown out from a point: n of them, each `make(R, k)` → {from, to, ms, delay} in px (fill-forward keyframes, opacity in and out)
function motes(run, cls, n, seed, make){
  const R = rng(seed);
  for(let k = 0; k < n; k++){ const m = make(R, k), i = bit(run, cls, m.style), delay = Math.round(m.delay);
    an(run, i, [{transform: m.from, opacity: 0}, {transform: m.mid || m.from, opacity: m.peak || 1, offset: m.at || .3}, {transform: m.to, opacity: 0}], Math.min(Math.round(m.ms), run.ms - delay), delay, m.ease || OUT); }
}
const fadeOut = (run, at)=> an(run, run.lay, [{opacity: 1}, {opacity: 0}], run.ms - at, at, 'ease-in');
const pair = (run, cls, html)=> [bit(run, cls + ' is-l', '', html), bit(run, cls + ' is-r', '', html)];

// ---- the places ----
const PLACES = {
  shop: {ms: 820, low: 420, play(run, low){ // the canvas tent: flaps part, lantern light spills out, the stall shows
    sound('bushRustle');
    if(low){ const [l, r] = pair(run, 'bwp-flap', '<b></b>'), v = bit(run, 'bwp-valance');
      an(run, l, [{transform: 'none'}, {transform: 'translateX(-102%)'}], 380, 0, SWING); an(run, r, [{transform: 'none'}, {transform: 'translateX(102%)'}], 380, 0, SWING);
      an(run, v, [{transform: 'none'}, {transform: 'translateY(-105%)'}], 200, 220, 'ease-in'); return; }
    const g = bit(run, 'bwp-glow');
    an(run, g, [{transform: 'scale(.5)', opacity: 0}, {transform: 'scale(2.24)', opacity: .95, offset: .45}, {transform: 'scale(3.64)', opacity: 0}], 700, 90);
    const [l, r] = pair(run, 'bwp-flap', '<b></b>');
    an(run, l, [{transform: 'rotate(0deg) scaleX(1)'}, {transform: 'rotate(1.5deg) scaleX(.86)', offset: .22}, {transform: 'rotate(7deg) scaleX(.14)'}], 560, 100, SWING);
    an(run, r, [{transform: 'rotate(0deg) scaleX(1)'}, {transform: 'rotate(-1.5deg) scaleX(.86)', offset: .22}, {transform: 'rotate(-7deg) scaleX(.14)'}], 560, 100, SWING);
    const {w, h} = size(run);
    motes(run, 'bwp-mote', 12, 7, (R, k)=>{ const s = k % 2 ? 1 : -1, x = s * (30 + R() * w * .42), y = -(20 + R() * h * .3) + R() * 60;
      return {from: `translate(${(s * R() * 24).toFixed(0)}px, ${(R() * 80 - 20).toFixed(0)}px) scale(.6)`, mid: `translate(${(x * .45).toFixed(0)}px, ${(y * .4).toFixed(0)}px) scale(1)`,
        to: `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px) scale(.4)`, ms: 500 + R() * 140, delay: 170 + R() * 80}; });
    an(run, bit(run, 'bwp-slit'), [{transform: 'scaleX(.4)', opacity: 0}, {transform: 'scaleX(1.6)', opacity: 1, offset: .3}, {transform: 'scaleX(4)', opacity: .85, offset: .6}, {transform: 'scaleX(10)', opacity: 0}], 500, 0);
    an(run, bit(run, 'bwp-valance'), [{transform: 'none'}, {transform: 'translateY(-110%)'}], 220, 540, 'ease-in');
    fadeOut(run, 660);
    later(run, 260, ()=> sound('pitchChime'));
  }},
  premium: {ms: 880, low: 440, play(run, low){ // the gilded pavilion: velvet drapes sweep up, the Gold Leaf crest unclasps, gold leaves fall
    sound('rareRise');
    if(low){ const [l, r] = pair(run, 'bwp-flap', '<b></b>'), p = bit(run, 'bwp-pelmet');
      an(run, l, [{transform: 'none'}, {transform: 'translateX(-102%)'}], 400, 0, SWING); an(run, r, [{transform: 'none'}, {transform: 'translateX(102%)'}], 400, 0, SWING);
      an(run, p, [{transform: 'none'}, {transform: 'translateY(-130%)'}], 220, 220, 'ease-in'); return; }
    an(run, bit(run, 'bwp-rays'), [{transform: 'rotate(0deg) scale(1.1)', opacity: 0}, {transform: 'rotate(9deg) scale(2)', opacity: .9, offset: .45}, {transform: 'rotate(20deg) scale(2.4)', opacity: 0}], 760, 110);
    an(run, bit(run, 'bwp-glow is-gold'), [{transform: 'scale(.56)', opacity: 0}, {transform: 'scale(2.38)', opacity: .9, offset: .45}, {transform: 'scale(3.64)', opacity: 0}], 700, 120);
    const [l, r] = pair(run, 'bwp-flap', '<b></b>');
    an(run, l, [{transform: 'rotate(0deg) scale(1, 1)'}, {transform: 'rotate(1deg) scale(.9, 1)', offset: .2}, {transform: 'rotate(9deg) scale(.13, .93)'}], 600, 150, SWING);
    an(run, r, [{transform: 'rotate(0deg) scale(1, 1)'}, {transform: 'rotate(-1deg) scale(.9, 1)', offset: .2}, {transform: 'rotate(-9deg) scale(.13, .93)'}], 600, 150, SWING);
    const p = bit(run, 'bwp-pelmet');
    an(run, p, [{transform: 'none'}, {transform: 'translateY(-130%)'}], 240, 560, 'ease-in');
    const {w, h} = size(run);
    motes(run, 'bwp-gleaf', 14, 11, (R, k)=>{ const s = k % 2 ? 1 : -1, x = s * (40 + R() * w * .4), y = 140 + R() * h * .55, rot = s * (200 + R() * 320);
      return {from: 'translate(0px, 0px) rotate(0deg) scale(.5)', mid: `translate(${(x * .55).toFixed(0)}px, ${(y * .25).toFixed(0)}px) rotate(${(rot * .4).toFixed(0)}deg) scale(1)`, at: .25, peak: 1,
        to: `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px) rotate(${rot.toFixed(0)}deg) scale(.8)`, ms: 560 + R() * 120, delay: 170 + R() * 60, ease: 'cubic-bezier(.25,.6,.45,1)'}; });
    const c = bit(run, 'bwp-crest', '', '<b></b>');
    an(run, c.firstChild, [{transform: 'translateX(-140%) skewX(-18deg)'}, {transform: 'translateX(380%) skewX(-18deg)'}], 260, 0, 'ease-in-out');
    an(run, c, [{transform: 'scale(1)', opacity: 1}, {transform: 'scale(1.18)', opacity: 1, offset: .45}, {transform: 'scale(.2) rotate(40deg)', opacity: 0}], 300, 140, 'ease-in');
    fadeOut(run, 740);
    later(run, 300, ()=> sound('crystalTing', 1)); later(run, 400, ()=> sound('crystalTing', 1.335));
  }},
  nest: {ms: 860, low: 420, play(run, low){ // the Old Nest: you look out through its hollow, the twig rim opens around you and the down drifts out
    sound('featherFlutter');
    if(low){ an(run, bit(run, 'bwp-rim', 'background:' + nestTwigs()), [{transform: 'scale(1)', opacity: 1}, {transform: 'scale(3.2)', opacity: 0}], 400, 0, 'cubic-bezier(.45,0,.7,.6)'); return; }
    an(run, bit(run, 'bwp-glow'), [{transform: 'scale(.42)', opacity: 0}, {transform: 'scale(1.68)', opacity: .7, offset: .4}, {transform: 'scale(3.08)', opacity: 0}], 680, 40);
    const rim = bit(run, 'bwp-rim', 'background:' + nestTwigs());
    an(run, rim, [{transform: 'scale(1)', opacity: 1}, {transform: 'scale(1.35)', opacity: 1, offset: .3}, {transform: 'scale(4.4)', opacity: 0}], 760, 60, 'cubic-bezier(.45,0,.7,.6)');
    const {w, h} = size(run), r0 = .08 * 1.2 * Math.max(w, h);
    motes(run, 'bwp-down', 12, 5, (R, k)=>{ const a = (k / 12) * Math.PI * 2 + R() * .4, x0 = Math.cos(a) * r0, y0 = Math.sin(a) * r0, out = 1.5 + R() * .9, rot = (R() - .5) * 200;
      return {from: `translate(${x0.toFixed(0)}px, ${y0.toFixed(0)}px) rotate(0deg) scale(.6)`, mid: `translate(${(x0 * out).toFixed(0)}px, ${(y0 * out - 10).toFixed(0)}px) rotate(${(rot * .4).toFixed(0)}deg) scale(1)`, at: .35, peak: .95,
        to: `translate(${(x0 * out * 1.15 + (R() - .5) * 60).toFixed(0)}px, ${(y0 * out + 60 + R() * 80).toFixed(0)}px) rotate(${rot.toFixed(0)}deg) scale(.85)`, ms: 600 + R() * 120, delay: 110 + R() * 70}; });
    later(run, 300, ()=> sound('featherFlutter'));
  }},
  codex: {ms: 880, low: 420, play(run, low){ // the Codex: the great book's tooled cover swings open on its spine (away, so it stays in view), the flyleaf follows
    const coverHTML = '<b class="c1"></b><b class="c2"></b><b class="c3"></b><b class="c4"></b><i><b></b></i>';
    sound('pageTurn');
    if(low){ an(run, bit(run, 'bwp-cover', '', coverHTML), [{transform: 'rotateY(0deg)'}, {transform: 'rotateY(92deg)'}], 400, 0, SWING); return; }
    const sh = bit(run, 'bwp-shade'), p1 = bit(run, 'bwp-page'), cv = bit(run, 'bwp-cover', '', coverHTML);
    an(run, cv.querySelector('i b'), [{transform: 'translateX(-160%) skewX(-16deg)'}, {transform: 'translateX(420%) skewX(-16deg)'}], 300, 0, 'ease-in-out');
    an(run, cv, [{transform: 'rotateY(0deg)'}, {transform: 'rotateY(7deg)', offset: .18}, {transform: 'rotateY(92deg)'}], 500, 80, 'cubic-bezier(.55,.05,.3,1)');
    an(run, sh, [{opacity: 0}, {opacity: .7, offset: .35}, {opacity: 0}], 560, 140);
    an(run, p1, [{transform: 'rotateY(0deg)'}, {transform: 'rotateY(92deg)'}], 400, 230, 'cubic-bezier(.5,0,.3,1)');
    const {h} = size(run);
    motes(run, 'bwp-mote', 9, 3, R=>{ const y = (R() - .5) * h * .8, x = 40 + R() * 160; // dust puffed off the spine
      return {style: 'left:14px', from: `translate(0px, ${y.toFixed(0)}px) scale(.6)`, mid: `translate(${(x * .5).toFixed(0)}px, ${(y - 10).toFixed(0)}px) scale(1)`, peak: .8,
        to: `translate(${x.toFixed(0)}px, ${(y - 40 - R() * 40).toFixed(0)}px) scale(.5)`, ms: 440 + R() * 120, delay: 230 + R() * 80}; });
    fadeOut(run, 740);
    later(run, 260, ()=> sound('pageTurn'));
  }},
  deck: {ms: 860, low: 420, play(run, low){ // the Camp: the tent door is rolled up on its roll; the campfire glows behind it
    sound('mapUnroll');
    const {w, h} = size(run);
    if(low){ an(run, bit(run, 'bwp-door'), [{transform: 'scaleY(1)'}, {transform: 'scaleY(0)'}], 400, 0, SWING); return; }
    const f = bit(run, 'bwp-fire');
    an(run, f, [{transform: 'scale(1.2)', opacity: 0}, {transform: 'scale(2)', opacity: .9, offset: .5}, {transform: 'scale(2.2)', opacity: 0}], 720, 120);
    motes(run, 'bwp-ember', 10, 9, R=>{ const x = (R() - .5) * w * .7, y = -(h * (.3 + R() * .3));
      return {from: `translate(${x.toFixed(0)}px, 0px)`, mid: `translate(${(x + (R() - .5) * 40).toFixed(0)}px, ${(y * .4).toFixed(0)}px)`, peak: 1,
        to: `translate(${(x + (R() - .5) * 80).toFixed(0)}px, ${y.toFixed(0)}px)`, ms: 520 + R() * 160, delay: 200 + R() * 80, ease: 'cubic-bezier(.3,.5,.5,1)'}; });
    const d = bit(run, 'bwp-door'), roll = bit(run, 'bwp-roll');
    an(run, d, [{transform: 'scaleY(1)'}, {transform: 'scaleY(0)'}], 600, 80, SWING);
    an(run, roll, [{transform: 'translateY(0px)'}, {transform: `translateY(${-(h - 20).toFixed(0)}px)`}], 600, 80, SWING);
    an(run, roll, [{opacity: 1}, {opacity: 0}], 160, 640, 'ease-in');
    [.24, .76].forEach(x=> an(run, bit(run, 'bwp-rope', `left:${x * 100}%`), [{transform: 'scaleY(1)'}, {transform: 'scaleY(.02)'}], 600, 80, SWING)); // the ties shorten as the roll climbs
    fadeOut(run, 720);
    later(run, 600, ()=> sound('woodKnock'));
  }},
  stomp: {ms: 900, low: 440, play(run, low){ // the Stomping Grounds: the arena's timber gates swing in, sand dust rolls out
    sound('woodKnock');
    const sun = low ? null : bit(run, 'bwp-sun'), [l, r] = pair(run, 'bwp-gate', '<b></b>');
    if(low){ an(run, l, [{transform: 'rotateY(0deg)'}, {transform: 'rotateY(95deg)'}], 420, 0, SWING); an(run, r, [{transform: 'rotateY(0deg)'}, {transform: 'rotateY(-95deg)'}], 420, 0, SWING); return; }
    an(run, sun, [{transform: 'scaleX(.3)', opacity: 0}, {transform: 'scaleX(3)', opacity: .9, offset: .35}, {transform: 'scaleX(14)', opacity: 0}], 640, 200);
    const shake = s=> [{transform: 'translate(0px, 0px) rotateY(0deg)', easing: 'linear'}, {transform: `translate(${-3 * s}px, 3px) rotateY(0deg)`, offset: .07, easing: 'linear'},
      {transform: `translate(${2 * s}px, -1px) rotateY(0deg)`, offset: .13, easing: 'linear'}, {transform: 'translate(0px, 0px) rotateY(0deg)', offset: .19, easing: 'cubic-bezier(.55,.05,.3,1)'},
      {transform: `translate(0px, 0px) rotateY(${s * 104}deg)`}];
    an(run, l, shake(1), 780, 40, 'linear'); an(run, r, shake(-1), 780, 40, 'linear');
    const {w} = size(run);
    motes(run, 'bwp-dust', 10, 13, R=>{ const x = (R() - .5) * w * .7;
      return {from: `translate(${(x * .3).toFixed(0)}px, 20px) scale(.35)`, mid: `translate(${(x * .7).toFixed(0)}px, -10px) scale(1.2)`, at: .3, peak: .85,
        to: `translate(${x.toFixed(0)}px, ${(-30 - R() * 60).toFixed(0)}px) scale(2.3)`, ms: 520 + R() * 160, delay: 230 + R() * 90}; });
    fadeOut(run, 760);
    later(run, 160, ()=> sound('leaderSlam'));
  }},
  inventory: {ms: 760, low: 380, play(run, low){ // the Inventory: the satchel's flap lifts off its buckle
    sound('shelfPick');
    if(low){ an(run, bit(run, 'bwp-sflap'), [{transform: 'rotateX(0deg)'}, {transform: 'rotateX(-95deg)'}], 360, 0, SWING); return; }
    const ins = bit(run, 'bwp-inside'), fl = bit(run, 'bwp-sflap'), st = bit(run, 'bwp-strap'), bk = bit(run, 'bwp-buckle');
    an(run, bk, [{transform: 'translateY(0px) rotate(0deg)', opacity: 1}, {transform: 'translateY(-6px) rotate(-8deg)', opacity: 1, offset: .35}, {transform: 'translateY(46px) rotate(-28deg)', opacity: 0}], 240, 0, 'ease-in');
    an(run, st, [{transform: 'translateY(0px)', opacity: 1}, {transform: 'translateY(60px)', opacity: 0}], 220, 60, 'ease-in');
    an(run, fl, [{transform: 'rotateX(0deg)'}, {transform: 'rotateX(5deg)', offset: .14}, {transform: 'rotateX(-96deg)'}], 520, 120, 'cubic-bezier(.5,.05,.3,1)'); // folds up and back, away from you
    an(run, ins, [{opacity: 1}, {opacity: 0}], 420, 260, 'ease-out');
    fadeOut(run, 640);
    later(run, 200, ()=> sound('pickup'));
  }},
};
// The Forge keeps its own flare (dressForgePlace); a Codex view showing the Forge is not the library.
function placeOf(kind, el){
  if(kind === 'shop' && el && el.classList && el.classList.contains('is-premium-shop')) return 'premium';
  if(kind === 'codex' && el && el.querySelector && el.querySelector('#view-forge')) return null;
  return PLACES[kind] ? kind : null;
}

// ---- ambient life: a few nodes kept as the screen's first child (re-added when the screen redraws), or one fixed layer ----
const sp = (R, a, b)=> (a + R() * (b - a)).toFixed(1);
const AMB = {
  shop: R=> '<i class="bwp-lamp"></i>' + Array.from({length: 5}, ()=> `<i class="bwp-speck" style="left:${sp(R, 18, 82)}%; top:${sp(R, 70, 160)}px; --dx:${sp(R, -30, 30)}px; --dy:${sp(R, -60, -110)}px; animation-duration:${sp(R, 7, 11)}s; animation-delay:-${sp(R, 0, 9)}s"></i>`).join(''),
  premium: R=> '<i class="bwp-lamp is-gold"></i>' + Array.from({length: 4}, ()=> `<i class="bwp-gleaf" style="left:${sp(R, 4, 92)}%; --dx:${sp(R, -40, 40)}px; --dy:${sp(R, 280, 520)}px; animation-duration:${sp(R, 9, 14)}s; animation-delay:-${sp(R, 0, 12)}s"></i>`).join(''),
  nest: R=> Array.from({length: 4}, ()=> `<i class="bwp-down" style="left:${sp(R, 3, 94)}%; --dx:${sp(R, -36, 36)}px; --dy:${sp(R, 300, 560)}px; animation-duration:${sp(R, 11, 16)}s; animation-delay:-${sp(R, 0, 14)}s"></i>`).join(''),
  deck: R=> '<i class="bwp-fire"></i>' + Array.from({length: 5}, ()=> `<i class="bwp-ember" style="left:${sp(R, 20, 80)}%; --dx:${sp(R, -30, 30)}px; --dy:${sp(R, -140, -240)}px; animation-duration:${sp(R, 4, 7)}s; animation-delay:-${sp(R, 0, 6)}s"></i>`).join(''),
  codex: R=> '<i class="bwp-shaft">' + Array.from({length: 6}, ()=> `<i class="bwp-speck" style="left:${sp(R, 25, 75)}%; top:${sp(R, 10, 80)}%; --dx:${sp(R, -20, 40)}px; --dy:${sp(R, 30, 90)}px; animation-duration:${sp(R, 8, 13)}s; animation-delay:-${sp(R, 0, 10)}s"></i>`).join('') + '</i>',
};
const AMB_FIXED = {codex: true};
let amb = null;
function ambientOn(k, el){
  if(!AMB[k] || !el || live() || reduced() || !atLeast('med')){ ambientOff(); return; }
  if(amb && amb.kind === k && amb.el === el) return;
  ambientOff(); css();
  const layer = D.createElement('div');
  layer.className = 'bwp-amb bwp-amb-' + k + (AMB_FIXED[k] ? ' is-fixed' : '');
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = AMB[k](rng(k.length * 97 + 1));
  let mo = null;
  if(AMB_FIXED[k]) D.body.appendChild(layer);
  else {
    const put = ()=>{ if(layer.parentNode !== el) el.insertBefore(layer, el.firstChild); };
    put(); el.classList.add('bwp-host');
    if(typeof MutationObserver === 'function'){ mo = new MutationObserver(put); mo.observe(el, {childList: true}); }
  }
  D.body.classList.add('bwp-on-' + k);
  amb = {kind: k, el, layer, mo};
}
function ambientOff(){
  if(!amb) return; const a = amb; amb = null;
  if(a.mo) a.mo.disconnect();
  a.layer.remove(); a.el.classList.remove('bwp-host'); D.body.classList.remove('bwp-on-' + a.kind);
}
// SHOP1's Shop | Premium switch redraws the same screen with .is-premium-shop: that is walking into the other shop.
let shopWatch = null;
function watchShop(el){
  if(shopWatch && shopWatch.el === el) return;
  unwatchShop();
  if(!el || typeof MutationObserver !== 'function') return;
  const mo = new MutationObserver(recs=>{ const was = recs[0] && /(^|\s)is-premium-shop(\s|$)/.test(recs[0].oldValue || ''), now = el.classList.contains('is-premium-shop');
    if(was !== now && !el.hidden) P.enter('shop', el, {from: 'shop-switch'}); });
  mo.observe(el, {attributes: true, attributeFilter: ['class'], attributeOldValue: true});
  shopWatch = {el, mo};
}
function unwatchShop(){ if(shopWatch){ shopWatch.mo.disconnect(); shopWatch = null; } }

function fade(el){
  if(!el || typeof el.animate !== 'function') return Promise.resolve(false);
  const a = el.animate([{opacity: 0}, {opacity: 1}], {duration: 180, easing: 'ease-out'});
  return a.finished.then(()=> true, ()=> true);
}

const P = {};
// The full entrance plays on the first arrival at each place in a session; later arrivals get the short take (about the page turn's length),
// as the Forge flare and the map titles do (owner 2026-10-08: "Clicking play or any other button should instantly transit you").
const seen = new Set();
// kind: a switchTab tab ('shop' with .is-premium-shop is the Premium shop) or a place name. el: the screen it opens.
// opts.from: where the player came from (the same place or nothing: a redraw or a page load, no entrance). opts.host: play inside this element
// (the Effects Lab). opts.rate: the Lab's speed. opts.force: the full take, even with no `from` or on a later visit.
P.enter = function(kind, el, opts){
  opts = opts || {};
  try{
    const k = placeOf(kind, el);
    if(kind === 'shop' && !opts.host) watchShop(el); else if(!opts.host) unwatchShop();
    if(!k){ if(!opts.host) ambientOff(); return Promise.resolve(false); }
    if(!opts.force && (!opts.from || opts.from === kind)){ if(!opts.host) ambientOn(k, el); return Promise.resolve(false); }
    if(cur) finish(cur);
    if(!atLeast('low')){ if(!opts.host) ambientOff(); return Promise.resolve(false); }
    if(reduced()){ if(!opts.host) ambientOff(); return fade(el); }
    const low = !atLeast('med'), short = low || (!opts.force && seen.has(k)), spec = PLACES[k], host = opts.host || D.body;
    if(!host || typeof host.appendChild !== 'function') return Promise.resolve(false);
    if(!opts.host) seen.add(k);
    if(el && el.classList && !opts.host) el.classList.remove('view-turn-fwd', 'view-turn-back'); // the entrance replaces the page turn
    const run = begin(k, host, short ? spec.low : spec.ms, opts.rate);
    cur = run;
    spec.play(run, short);
    Promise.all(run.anims.map(a=> a.finished)).then(()=> finish(run), ()=> finish(run));
    if(!opts.host){ if(low) ambientOff(); else ambientOn(k, el); }
    return run.promise;
  }catch(e){ try{ if(cur) finish(cur); }catch(_){} return Promise.resolve(false); }
};
P.skip = ()=>{ if(cur) finish(cur); };
P.seek = ms=>{ if(!cur) return false; cur.timers.forEach(clearTimeout); cur.timers.length = 0; cur.anims.forEach(a=>{ a.pause(); a.currentTime = ms; }); return true; }; // hold the playing entrance at ms (contact sheets); skip() ends it
P.stop = ()=>{ P.skip(); ambientOff(); unwatchShop(); }; // everything off (the Lab between plays; a test)
P.ambient = (kind, el)=>{ const k = placeOf(kind, el); if(k) ambientOn(k, el); else ambientOff(); }; // the Lab shows a place's ambience on its own
P.kinds = Object.keys(PLACES);
P.lengthOf = (k, low)=> PLACES[k] ? (low ? PLACES[k].low : PLACES[k].ms) : 0;
P.state = ()=> ({playing: cur ? cur.kind : null, ambient: amb ? amb.kind : null, shopWatch: !!shopWatch});
W.BramblewoodPlaces = P;
})();
