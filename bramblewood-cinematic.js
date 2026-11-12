/* ============================================================
   Cinematic board effects (package FX8, 2026-11-12, owner 23:22: "a meteor effect: first a portent, darkening of the skies, then slowly
   darkness creeping, then suddenly brightness from the ball, and then boom. Do 10 more.")
   Eleven staged, board-wide sequences: omen, build-up, climax, aftermath, 3 to 6 seconds. NOT wired into fights yet (the Effects Lab group
   "Cinematic (FX8)" shows them); wiring later is one line:  BramblewoodCinematic.meteor(battlefieldEl, {onImpact(){...}})

   BramblewoodCinematic.<name>(boardEl, opts) -> Promise (resolves when everything is removed), with .skip() and .stop() on it
     names: meteor eclipse lightning tidalWave earthquake eruption blizzard aurora wildfire swarm stampede   (also .names, .play(name, el, opts))
     opts:  level ('none'|'low'|'med'|'high', default the game's effects level), reduced (default prefers-reduced-motion), speed (1),
            onImpact() at the climax, onDone()
   Cost rules: transform / opacity on a few full-board layers (no per-card filter, no blend layer), at most one canvas for particles
   (created on the first particle, removed at the end), every node, tween and ticker removed at the end.
   Low effects: about 1.6x faster, no canvas, no shake. Reduced motion / Effects None: one still frame of the aftermath, then a fade.
   A tap or click on the board skips to the aftermath (a second tap ends it). The board shake uses the CSS `translate` property, so it never
   fights the transforms the game puts on the board or its cards.
   Sound: own Web Audio cues (SoundKit's tone() / noise() are private to arena_app.js) on SoundKit.audioContext(), gated by the SFX volume;
   listed in docs/sfx-cue-sheet.md (cues 41-53).
   ============================================================ */
(function(){
'use strict';
const W = window, G = ()=> W.gsap, ORDER = ['none', 'low', 'med', 'high'];
const rnd = (a, b)=> a + Math.random() * (b - a), pick = a=> a[Math.floor(Math.random() * a.length)];
const ACTIVE = new Map();

// ---------------- sound ----------------
const SND = (()=>{
  let nb = null;
  const A = ()=>{ try{ const k = W.SoundKit; if(!k || !k.audioContext) return null; const v = k.getSfxVolume ? k.getSfxVolume() : 1; if(v <= 0) return null;
    const c = k.audioContext(); if(!c) return null; if(c.state === 'suspended' && c.resume) c.resume(); return {c, v}; }catch(e){ return null; } };
  const env = (a, g, t, att, dur, peak)=>{ g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(Math.max(0.0002, peak * a.v), t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); };
  const osc = (a, f0, f1, dur, type, peak, delay, att)=>{ const t = a.c.currentTime + (delay || 0), o = a.c.createOscillator(), g = a.c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur); env(a, g, t, att || .01, dur, peak);
    o.connect(g); g.connect(a.c.destination); o.start(t); o.stop(t + dur + .05); return o; };
  const nz = (a, dur, peak, f0, f1, type, delay, att, q)=>{ const c = a.c, t = c.currentTime + (delay || 0);
    if(!nb || nb.sampleRate !== c.sampleRate){ nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = nb.getChannelData(0); for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = nb; s.loop = true; f.type = type || 'lowpass'; f.Q.value = q || .8;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); env(a, g, t, att || .01, dur, peak);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); s.stop(t + dur + .05); };
  const wrap = fn=> (...args)=>{ try{ const a = A(); if(a) fn(a, ...args); }catch(e){} };
  return {
    rumble: wrap((a, d = 2, g = .22)=>{ nz(a, d, g, 140, 70, 'lowpass', 0, d * .45); osc(a, 46, 34, d, 'sine', g * .8, 0, d * .4); }),
    boom: wrap(a=>{ osc(a, 130, 26, .95, 'sine', .55); nz(a, .8, .45, 1200, 90, 'lowpass', 0, .005); osc(a, 60, 20, 1.3, 'triangle', .3); }),
    thunder: wrap(a=>{ nz(a, 1.7, .5, 700, 60, 'lowpass', 0, .09); osc(a, 58, 28, 1.6, 'sine', .35, 0, .08); }),
    whoosh: wrap((a, d = .6)=>{ nz(a, d, .26, 300, 2400, 'bandpass', 0, d * .75, 1.2); }),
    crack: wrap(a=>{ nz(a, .2, .4, 2400, 700, 'highpass', 0, .002); osc(a, 220, 60, .12, 'square', .12); }),
    chime: wrap((a, fs = [523, 659, 784, 1047])=>{ fs.forEach((f, i)=>{ osc(a, f, f, 1.5, 'sine', .11, i * .1, .015); osc(a, f * 2, f * 2, .9, 'sine', .035, i * .1, .015); }); }),
    drone: wrap((a, d = 2.2)=>{ osc(a, 82, 82, d, 'triangle', .1, 0, d * .6); osc(a, 83.2, 83.2, d, 'triangle', .1, 0, d * .6); osc(a, 123, 123, d, 'sine', .05, 0, d * .6); }),
    buzz: wrap((a, d = 2)=>{ const o = osc(a, 150, 150, d, 'sawtooth', .07, 0, d * .4), l = a.c.createOscillator(), lg = a.c.createGain(); l.frequency.value = 27; lg.gain.value = 22;
      l.connect(lg); lg.connect(o.frequency); l.start(); l.stop(a.c.currentTime + d + .1); nz(a, d, .06, 2400, 2800, 'bandpass', 0, d * .4, 4); }),
    wind: wrap((a, d = 2.2)=>{ nz(a, d, .24, 380, 950, 'bandpass', 0, d * .55, .7); }),
    rain: wrap((a, d = 3)=>{ nz(a, d, .07, 3800, 3600, 'highpass', 0, .7); }),
    slam: wrap(a=>{ nz(a, .95, .5, 2600, 200, 'lowpass', 0, .01); osc(a, 95, 30, .8, 'sine', .45); }),
    roar: wrap((a, d = 2)=>{ nz(a, d, .26, 800, 280, 'lowpass', 0, d * .5, .6); osc(a, 70, 52, d, 'sawtooth', .05, 0, d * .5); }),
    hooves: wrap((a, n = 12)=>{ for(let i = 0; i < n; i++) osc(a, 88, 40, .12, 'sine', .14 + i * .012, i * (.2 - i * .008), .004); }),
  };
})();

// ---------------- style ----------------
function css(){
  if(document.getElementById('cn-style')) return;
  const s = document.createElement('style'); s.id = 'cn-style';
  s.textContent = '.cn-root{position:absolute;inset:0;overflow:hidden;pointer-events:auto;z-index:50;border-radius:inherit;contain:layout paint;touch-action:manipulation}'
    + '.cn-l{position:absolute;inset:0;pointer-events:none;will-change:opacity}.cn-e{position:absolute;pointer-events:none}'
    + '.cn-cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.cn-top{position:absolute;inset:0;pointer-events:none}';
  document.head.appendChild(s);
}
const levelOf = o=>{ if(o && o.level && ORDER.includes(o.level)) return o.level;
  try{ if(typeof W.fxLevel === 'function') return W.fxLevel(); }catch(e){} const d = document.documentElement.dataset.fx; return ORDER.includes(d) ? d : 'high'; };
const reducedOf = o=> (o && o.reduced != null) ? !!o.reduced : !!(W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

// ---------------- the runner ----------------
function run(name, host, opts, build){
  opts = opts || {}; const g = G();
  host = host || document.getElementById('battlefieldEl') || document.body;
  const prev = ACTIVE.get(host); if(prev) prev.stop();
  let resolve; const promise = new Promise(r=> resolve = r);
  if(!g || !host){ resolve(); return promise; }
  css();
  const lvl = levelOf(opts), still = reducedOf(opts) || lvl === 'none', low = lvl === 'low', rich = !still && !low;
  const w = Math.max(120, host.clientWidth || host.offsetWidth || 390), h = Math.max(120, host.clientHeight || host.offsetHeight || 500);
  const U = Math.max(.7, Math.min(2, Math.sqrt(w * h) / 360));
  const posFix = getComputedStyle(host).position === 'static'; if(posFix) host.style.position = 'relative'; if(rich) host.style.willChange = 'translate'; /* the shake moves one layer, no repaint */
  const root = document.createElement('div'); root.className = 'cn-root'; root.dataset.cine = name; root.setAttribute('aria-hidden', 'true');
  const top = document.createElement('div'); top.className = 'cn-top'; root.appendChild(top); host.appendChild(root);
  const tl = g.timeline({paused: true, onUpdate(){ if(!root.isConnected) end(); }, onComplete: ()=> end()});
  const P = []; let cv = null, cx = null, ck = 1, lastT = 0, ended = false, tickOn = false, skipped = false;
  const MAXP = rich ? 150 : 0;

  // layers
  const mk = (cls, style, html)=>{ const d = document.createElement('div'); d.className = cls; d.style.cssText = style || ''; if(html) d.innerHTML = html; root.insertBefore(d, top); return d; };
  // particles
  const add = o=>{ if(!o || P.length >= MAXP) return; P.push(Object.assign({x: 0, y: 0, vx: 0, vy: 0, gy: 0, drag: 0, life: 1, age: 0, s: 3, s1: null, a: 1, c: '255,255,255', k: 'dot', add: false, io: false, ph: Math.random() * 6.28}, o)); if(o.s1 == null) P[P.length - 1].s1 = P[P.length - 1].s; };
  const needCv = ()=>{ if(cv || !rich) return !!cv; cv = document.createElement('canvas'); cv.className = 'cn-cv'; ck = Math.min(W.devicePixelRatio || 1, 1.25);
    cv.width = Math.round(w * ck); cv.height = Math.round(h * ck); cx = cv.getContext('2d'); if(!cx){ cv = null; return false; } cx.setTransform(ck, 0, 0, ck, 0, 0); top.appendChild(cv);
    if(!tickOn){ tickOn = true; g.ticker.add(tick); } return true; };
  function tick(){
    if(ended) return; if(!root.isConnected){ end(); return; }
    const t = tl.time(); const dt = Math.min(.05, Math.max(0, t - lastT)); lastT = t;
    for(let i = P.length - 1; i >= 0; i--){ const p = P[i]; p.age += dt; if(p.age >= p.life){ P.splice(i, 1); continue; }
      if(p.upd) p.upd(p, dt); else { p.vy += p.gy * dt; if(p.drag){ const d = Math.max(0, 1 - p.drag * dt); p.vx *= d; p.vy *= d; } p.x += p.vx * dt; p.y += p.vy * dt; } }
    cx.clearRect(0, 0, w, h);
    let comp = '';
    for(const p of P){ const f = p.age / p.life, a = p.a * (p.io ? Math.sin(Math.PI * f) : 1 - f); if(a <= .01) continue; const sz = (p.s + (p.s1 - p.s) * f) * U;
      const c = p.add ? 'lighter' : 'source-over'; if(c !== comp){ cx.globalCompositeOperation = c; comp = c; }
      cx.globalAlpha = a;
      if(p.k === 'streak'){ cx.strokeStyle = 'rgb(' + p.c + ')'; cx.lineWidth = sz; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * .028, p.y - p.vy * .028); cx.stroke(); }
      else if(p.k === 'wing'){ const fl = Math.sin(p.age * 38 + p.ph) * sz; cx.strokeStyle = 'rgb(' + p.c + ')'; cx.lineWidth = Math.max(1, sz * .45); cx.beginPath(); cx.moveTo(p.x - sz, p.y - fl); cx.lineTo(p.x, p.y); cx.lineTo(p.x + sz, p.y - fl); cx.stroke(); }
      else { cx.fillStyle = 'rgb(' + p.c + ')'; cx.beginPath(); cx.arc(p.x, p.y, sz, 0, 6.2832); cx.fill(); } }
    cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
  }

  // the toolbox the effects use
  const S = {g, w, h, U, tl, low, rich, host, root, P, add,
    L: (style, html)=> mk('cn-l', style, html),
    el: (style, html)=> mk('cn-e', style, html),
    set: (el, v)=> g.set(el, v),
    label: (n, at)=> tl.addLabel(n, at),
    cue: (n, at, ...args)=>{ if(!still) tl.call(()=> SND[n] && SND[n](...args), null, at); },
    flash(color, peak, down, at, up){ const d = document.createElement('div'); d.className = 'cn-l'; d.style.cssText = 'background:' + color + ';opacity:0'; top.appendChild(d);
      tl.to(d, {opacity: peak, duration: up || .05, ease: 'power1.out'}, at).to(d, {opacity: 0, duration: down, ease: 'power2.out'}, at + (up || .05)); return d; },
    ring(x, y, R, color, at, dur, bw){ const d = document.createElement('div'); d.className = 'cn-e'; d.style.cssText = 'left:0;top:0;width:' + 2 * R + 'px;height:' + 2 * R + 'px;border-radius:50%;border:' + (bw || 4) * U + 'px solid ' + color + ';box-sizing:border-box;opacity:0';
      root.insertBefore(d, top); g.set(d, {xPercent: -50, yPercent: -50, x, y, scale: .05});
      tl.to(d, {opacity: 1, duration: .04}, at).to(d, {scale: 1, duration: dur || .9, ease: 'power2.out'}, at).to(d, {opacity: 0, duration: (dur || .9) * .7, ease: 'power1.in'}, at + (dur || .9) * .3); return d; },
    shake(at, dur, a0, a1, ease){ if(!rich) return; const o = {a: a0 * U}; tl.to(o, {a: a1 * U, duration: dur, ease: ease || 'none', onUpdate(){ const a = o.a; host.style.translate = (Math.random() - .5) * 2 * a + 'px ' + (Math.random() - .5) * 1.4 * a + 'px'; }}, at);
      tl.call(()=>{ host.style.translate = ''; }, null, at + dur + .01); },
    burst(at, n, f){ if(!needCv()) return; tl.call(()=>{ for(let i = 0; i < n; i++) add(f(i, n)); }, null, at); },
    stream(at, dur, rate, f){ if(!needCv()) return; const st = {p: 0, acc: 0, last: 0};
      tl.to(st, {p: 1, duration: dur, ease: 'none', onUpdate(){ const t = this.time(), dt = Math.min(.08, t - st.last); st.last = t; if(dt <= 0) return;
        st.acc += (typeof rate === 'function' ? rate(st.p) : rate) * dt; while(st.acc >= 1){ st.acc--; add(f(0, st.p)); } }}, at); },
    end(at){ tl.to(root, {opacity: 0, duration: .35, ease: 'sine.in'}, at); tl.call(()=> end(), null, at + .36); /* a long ambient tween never holds the promise past the fade */ },
    svg(style, inner){ return mk('cn-l', style, '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" style="position:absolute;inset:0;overflow:visible">' + inner + '</svg>'); },
  };

  // finishing
  function end(){
    if(ended) return; ended = true; ACTIVE.delete(host);
    try{ tl.kill(); g.killTweensOf(root); g.killTweensOf(root.querySelectorAll('*')); if(tickOn) g.ticker.remove(tick); }catch(e){}
    host.style.translate = ''; host.style.willChange = ''; if(posFix) host.style.position = '';
    root.removeEventListener('pointerdown', onTap); root.remove(); P.length = 0; cv = cx = null;
    try{ if(opts.onDone) opts.onDone(); }catch(e){}
    resolve();
  }
  function skip(){ if(ended) return; const at = tl.labels.after; if(still || at == null || tl.time() >= at){ end(); return; } skipped = true; P.length = 0; tl.seek('after'); tl.timeScale(Math.max(1, tl.timeScale())); }
  function onTap(e){ e.preventDefault(); e.stopPropagation(); skip(); }
  root.addEventListener('pointerdown', onTap);
  promise.skip = skip; promise.stop = end; promise.timeline = tl; promise.root = root; promise.sim = ()=> P.length;
  ACTIVE.set(host, {stop: end});

  try{ build(S); }catch(err){ if(W.__fxDebug) console.warn('[cinematic] ' + name, err); end(); return promise; }
  if(opts.onImpact && tl.labels.climax != null) tl.call(()=>{ try{ opts.onImpact(); }catch(e){} }, null, 'climax');
  tl.timeScale((opts.speed || 1) * (low ? 1.6 : 1));
  if(still){ const T = tl.labels.after != null ? tl.labels.after + .1 : tl.duration() * .6; tl.time(T, true); g.to(root, {opacity: 0, duration: .45, delay: 1.2, ease: 'sine.in', onComplete: end}); }
  else if(opts.paused){ /* test harness: the caller steps promise.timeline itself */ } else tl.play(0);
  return promise;
}

// ---------------- 1. Meteor ----------------
function meteor(S){
  const {w, h, tl, g, U} = S, sx = w * .8, sy = h * .07, ix = w * .4, iy = h * .62, R = Math.max(24, w * .05), ang = Math.atan2(iy - sy, ix - sx) * 180 / Math.PI;
  const dark = S.L('background:#06051a;opacity:0'), vig = S.L('background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 24%,rgba(3,1,12,.94) 100%);opacity:0;transform:scale(1.8)');
  const cw = w * .26, crater = S.el('left:0;top:0;width:' + cw + 'px;height:' + cw * .36 + 'px;opacity:0',
    '<i style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse,#1a0d08 30%,#3a1f12 62%,rgba(40,24,14,0) 72%)"></i><i class="hot" style="position:absolute;inset:6%;border-radius:50%;background:radial-gradient(ellipse,#fff3b8 0,#ffa43a 34%,#c4400e 62%,rgba(120,30,8,0) 74%);box-shadow:0 0 ' + 34 * U + 'px ' + 10 * U + 'px rgba(255,120,30,.55)"></i>');
  g.set(crater, {xPercent: -50, yPercent: -50, x: ix, y: iy + R * .25, scale: .15});
  const warm = S.el('left:0;top:0;width:' + w * 1.7 + 'px;height:' + w * 1.7 + 'px;border-radius:50%;background:radial-gradient(circle,rgba(255,206,120,.9),rgba(255,120,36,.32) 36%,rgba(255,90,20,0) 66%);opacity:0');
  g.set(warm, {xPercent: -50, yPercent: -50, x: sx, y: sy});
  const mover = S.el('left:0;top:0;width:0;height:0;opacity:0',
    '<i class="t" style="position:absolute;left:' + -h * .55 + 'px;top:' + -R * .42 + 'px;width:' + h * .55 + 'px;height:' + R * .84 + 'px;border-radius:60% 0 0 60%;background:linear-gradient(to left,rgba(255,236,176,.95),rgba(255,126,34,.55) 34%,rgba(255,60,10,0));transform-origin:100% 50%"></i>'
    + '<i class="b" style="position:absolute;left:' + -R + 'px;top:' + -R + 'px;width:' + 2 * R + 'px;height:' + 2 * R + 'px;border-radius:50%;background:radial-gradient(circle,#fff 0 22%,#ffe9a8 34%,#ff9a2e 58%,rgba(255,70,10,0) 72%);box-shadow:0 0 ' + R + 'px rgba(255,140,40,.7)"></i>');
  const tail = mover.querySelector('.t'), ball = mover.querySelector('.b');
  g.set(mover, {x: sx, y: sy, rotation: ang, scale: .14}); g.set(tail, {scaleX: 0});
  // omen: a faint ember high in the sky; the sky darkens
  tl.to(mover, {opacity: 1, duration: .9, ease: 'sine.out'}, .25).to(ball, {opacity: .55, duration: .16, repeat: 5, yoyo: true, ease: 'sine.inOut'}, .9);
  tl.to(dark, {opacity: .42, duration: 1.5, ease: 'sine.inOut'}, .35);
  // build: the ember grows and drifts, darkness creeps in from the edges
  tl.to(mover, {scale: .32, x: sx - (sx - ix) * .1, y: sy + (iy - sy) * .1, duration: 2.2, ease: 'sine.inOut'}, .9).to(warm, {x: sx - (sx - ix) * .1, y: sy + (iy - sy) * .1, duration: 2.2, ease: 'sine.inOut'}, .9);
  tl.to(dark, {opacity: .76, duration: 1.8, ease: 'sine.in'}, 1.3).to(vig, {opacity: 1, scale: 1, duration: 2.0, ease: 'sine.inOut'}, 1.2);
  S.cue('drone', .9, 2.4); S.cue('rumble', 1.8, 2.0, .2);
  // climax: sudden brightness as the burning ball comes in
  tl.addLabel('strike', 3.1);
  tl.to(warm, {opacity: 1, duration: .1, ease: 'power2.out'}, 3.1).to(dark, {opacity: .16, duration: .12, ease: 'power2.out'}, 3.1).to(vig, {opacity: .3, duration: .2}, 3.1);
  tl.to(tail, {scaleX: 1, duration: .22, ease: 'power2.out'}, 3.1).to(ball, {opacity: 1, duration: .05}, 3.1);
  tl.to(mover, {x: ix, y: iy, scale: 1.7, duration: .55, ease: 'power3.in'}, 3.1).to(warm, {x: ix, y: iy, duration: .55, ease: 'power3.in'}, 3.1);
  S.cue('whoosh', 3.1, .6);
  // boom
  tl.addLabel('climax', 3.65);
  tl.to(mover, {opacity: 0, duration: .1}, 3.62);
  S.flash('#fff8e6', 1, .75, 3.65, .04); S.ring(ix, iy, w * .62, 'rgba(255,248,220,.95)', 3.65, .95, 5); S.ring(ix, iy, w * .5, 'rgba(255,150,60,.8)', 3.75, .95, 3);
  S.shake(3.65, .5, 13, 0, 'power2.out'); S.cue('boom', 3.65);
  tl.to(crater, {opacity: 1, scale: 1, duration: .3, ease: 'power3.out'}, 3.65);
  S.burst(3.65, 40, i=>{ const a = -Math.PI * rnd(.06, .94), v = rnd(220, 640) * U; return {x: ix, y: iy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, gy: 900 * U, life: rnd(.8, 1.6), s: rnd(1.5, 4), s1: 1, c: pick(['255,170,60', '255,110,30', '70,44,28', '30,20,16']), add: i % 3 === 0}; });
  S.burst(3.68, 9, ()=>({x: ix + rnd(-30, 30), y: iy, vx: rnd(-90, 90) * U, vy: rnd(-90, -20) * U, drag: .9, life: rnd(1.2, 1.9), s: rnd(14, 24), s1: rnd(46, 70), a: .32, c: '70,56,48'}));
  S.stream(3.8, 1.4, 14, ()=>({x: ix + rnd(-cw * .3, cw * .3), y: iy, vx: rnd(-14, 14), vy: rnd(-110, -40) * U, life: rnd(.7, 1.2), s: 2, s1: .6, c: '255,150,50', add: true}));
  // aftermath: the crater cools and fades, the sky returns
  tl.addLabel('after', 3.95);
  tl.to(warm, {opacity: 0, duration: .7, ease: 'sine.out'}, 3.7).to(dark, {opacity: 0, duration: 1.7, ease: 'sine.inOut'}, 3.9).to(vig, {opacity: 0, duration: 1.5, ease: 'sine.inOut'}, 3.9);
  tl.to(crater.querySelector('.hot'), {opacity: 0, duration: 2.0, ease: 'sine.in'}, 3.9).to(crater, {opacity: 0, duration: .8}, 5.1);
  S.end(5.7);
}

// ---------------- 2. Eclipse ----------------
function eclipse(S){
  const {w, h, tl, g, U} = S, cx = w * .5, cy = h * .26, R = Math.max(30, Math.min(w, h) * .11);
  const centre = (el, x, y)=> g.set(el, {xPercent: -50, yPercent: -50, x, y});
  const dim = S.L('background:#0a0d24;opacity:0'), gold = S.L('background:linear-gradient(to bottom,rgba(255,214,120,.5),rgba(255,190,90,.15) 60%,rgba(255,190,90,0));opacity:0');
  const stars = []; for(let i = 0; i < 12; i++){ const s = S.el('left:0;top:0;width:' + 2.6 * U + 'px;height:' + 2.6 * U + 'px;border-radius:50%;background:#fff;box-shadow:0 0 6px #cfe0ff;opacity:0'); g.set(s, {x: rnd(.06, .94) * w, y: rnd(.05, .75) * h}); stars.push(s); }
  const sun = S.el('left:0;top:0;width:' + 2 * R + 'px;height:' + 2 * R + 'px;border-radius:50%;background:radial-gradient(circle,#fffbe6 0,#fff0b0 70%,#ffe08a 100%);box-shadow:0 0 ' + 40 * U + 'px ' + 12 * U + 'px rgba(255,226,140,.7);opacity:0'); centre(sun, cx, cy);
  const rays = S.el('left:0;top:0;width:' + 6.4 * R + 'px;height:' + 6.4 * R + 'px;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.7) 0 2.4deg,rgba(255,255,255,0) 2.4deg 11deg);-webkit-mask-image:radial-gradient(circle,transparent 24%,#000 34%,transparent 70%);mask-image:radial-gradient(circle,transparent 24%,#000 34%,transparent 70%);opacity:0'); centre(rays, cx, cy);
  const corona = S.el('left:0;top:0;width:' + 4.2 * R + 'px;height:' + 4.2 * R + 'px;border-radius:50%;background:radial-gradient(circle,rgba(0,0,0,0) 46%,rgba(255,246,222,.98) 50%,rgba(196,204,255,.5) 62%,rgba(150,150,255,0) 100%);opacity:0'); centre(corona, cx, cy);
  const moon = S.el('left:0;top:0;width:' + 2.06 * R + 'px;height:' + 2.06 * R + 'px;border-radius:50%;background:radial-gradient(circle at 40% 36%,#10131f,#04050b 70%);opacity:0'); centre(moon, cx - 3.4 * R, cy + 1.3 * R);
  const gem = S.el('left:0;top:0;width:' + 1.1 * R + 'px;height:' + 1.1 * R + 'px;border-radius:50%;background:radial-gradient(circle,#fff 0,rgba(255,250,220,.85) 30%,rgba(255,240,180,0) 70%);opacity:0'); centre(gem, cx - R * .9, cy + R * .45);
  const gem2 = gem.cloneNode(); gem2.style.opacity = 0; moon.parentNode.insertBefore(gem2, moon.nextSibling); centre(gem2, cx + R * .85, cy - R * .5);
  // omen: the sun sharpens, the light goes strange
  tl.to(sun, {opacity: 1, duration: .8}, 0).to(dim, {opacity: .16, duration: 1.0, ease: 'sine.inOut'}, .2).to(moon, {opacity: 1, duration: .3}, 1.0);
  // build: the moon slides across, the sky goes blue-black
  tl.to(moon, {x: cx, y: cy, duration: 2.25, ease: 'sine.inOut'}, 1.1).to(dim, {opacity: .8, duration: 2.1, ease: 'power2.in'}, 1.3);
  tl.to(sun, {scale: .96, duration: 2.2, ease: 'none'}, 1.1);
  S.cue('drone', .5, 3);
  tl.to(gem, {opacity: 1, duration: .14, ease: 'power2.out'}, 3.08).to(gem, {opacity: 0, duration: .22}, 3.22);
  // climax: totality, the corona flares, the stars come out
  tl.addLabel('climax', 3.3);
  tl.to(sun, {opacity: 0, duration: .08}, 3.3).to(corona, {opacity: 1, scale: 1.1, duration: .35, ease: 'power2.out'}, 3.3).fromTo(corona, {scale: .85}, {scale: 1.1, duration: .35, ease: 'power2.out', immediateRender: false}, 3.3);
  tl.to(rays, {opacity: .85, duration: .6, ease: 'power2.out'}, 3.35).to(rays, {rotation: 14, duration: 2.4, ease: 'none'}, 3.3);
  tl.to(stars, {opacity: .9, duration: .5, stagger: .04}, 3.35);
  S.cue('chime', 3.4, [196, 294, 392]);
  tl.to(corona, {scale: 1.2, duration: 1.0, ease: 'sine.inOut'}, 3.65);
  // aftermath: the diamond ring, the moon moves on, gold light returns
  tl.addLabel('after', 4.3);
  tl.to(moon, {x: cx + 3.4 * R, y: cy - 1.3 * R, duration: 1.4, ease: 'sine.inOut'}, 4.3);
  tl.to(sun, {opacity: 1, duration: .2}, 4.35).to(gem2, {opacity: 1, duration: .1}, 4.28).to(gem2, {opacity: 0, duration: .5}, 4.4).to(gem2, {scale: 2.4, duration: .5}, 4.28);
  S.flash('#fff6d6', .55, .8, 4.3, .06); S.cue('chime', 4.3, [523, 784, 1047, 1568]);
  tl.to(corona, {opacity: 0, duration: .5}, 4.3).to(rays, {opacity: 0, duration: .6}, 4.3).to(stars, {opacity: 0, duration: .8, stagger: .03}, 4.4);
  tl.to(dim, {opacity: 0, duration: 1.3, ease: 'sine.out'}, 4.4).to(gold, {opacity: 1, duration: .5}, 4.3).to(gold, {opacity: 0, duration: 1.2, ease: 'sine.in'}, 4.9);
  tl.to([sun, moon], {opacity: 0, duration: .5}, 5.5);
  S.end(5.85);
}

// ---------------- 3. Lightning storm ----------------
function lightning(S){
  const {w, h, tl, g, U} = S, tx = w * rnd(.4, .6), ty = h * .6;
  const dark = S.L('background:#050812;opacity:0'), cloud = S.L('background:linear-gradient(to bottom,#0a0e1b,rgba(20,26,44,.9) 38%,rgba(20,26,44,0) 80%);opacity:0');
  const drift = S.el('left:0;top:0;width:' + w * 2 + 'px;height:' + h * .42 + 'px;background:radial-gradient(ellipse at 15% 40%,rgba(60,70,98,.65),rgba(60,70,98,0) 28%),radial-gradient(ellipse at 45% 60%,rgba(52,62,90,.7),rgba(52,62,90,0) 30%),radial-gradient(ellipse at 78% 35%,rgba(64,74,104,.6),rgba(64,74,104,0) 28%);opacity:0');
  const scorch = S.el('left:0;top:0;width:' + w * .2 + 'px;height:' + w * .07 + 'px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.8),rgba(0,0,0,0) 70%);opacity:0'); g.set(scorch, {xPercent: -50, yPercent: -50, x: tx, y: ty});
  const seg = (x0, y0, x1, y1, n, j)=>{ let p = 'M' + x0 + ' ' + y0; for(let i = 1; i < n; i++){ const t = i / n; p += 'L' + (x0 + (x1 - x0) * t + rnd(-j, j)).toFixed(1) + ' ' + (y0 + (y1 - y0) * t + rnd(-j * .2, j * .2)).toFixed(1); } return p + 'L' + x1 + ' ' + y1; };
  const bx = tx + rnd(-w * .12, w * .12), main = seg(bx, -6, tx, ty, 16, 22 * U);
  let br = ''; for(let i = 0; i < 3; i++){ const t = rnd(.25, .6); br += '<path d="' + seg(bx + (tx - bx) * t, ty * t, bx + (tx - bx) * t + rnd(-1, 1) * w * .22, ty * t + h * rnd(.12, .22), 7, 12 * U) + '" />'; }
  const bolt = S.svg('opacity:0', '<g fill="none" stroke-linejoin="round" stroke-linecap="round"><g stroke="rgba(150,190,255,.65)" stroke-width="' + 11 * U + '"><path d="' + main + '"/></g><g stroke="#fff" stroke-width="' + 3.2 * U + '"><path class="m" d="' + main + '"/>' + br.replace(/<path /g, '<path stroke-width="' + 1.6 * U + '" ') + '</g></g>');
  const paths = [...bolt.querySelectorAll('path')]; paths.forEach(p=>{ const L = p.getTotalLength(); g.set(p, {strokeDasharray: L, strokeDashoffset: L}); });
  // omen: the sky goes slate, wind gathers, rain begins
  tl.to(cloud, {opacity: 1, duration: 1.4, ease: 'sine.inOut'}, 0).to(drift, {opacity: 1, duration: 1.6}, .2).to(drift, {x: -w * .7, duration: 5.4, ease: 'none'}, 0).to(dark, {opacity: .5, duration: 1.6, ease: 'sine.inOut'}, .2);
  S.stream(.7, 3.6, p=> 14 + 150 * Math.min(1, p * 1.6), ()=>({x: rnd(-.15, 1.1) * w, y: -10, vx: -90 * U, vy: rnd(820, 1100) * U, life: .55, s: 1.1, c: '190,214,255', a: .55, k: 'streak'}));
  S.cue('rain', .7, 3.6); S.cue('wind', .3, 1.6);
  // build: distant flickers, each closer
  S.flash('rgba(176,204,255,1)', .22, .35, 1.5); S.flash('rgba(176,204,255,1)', .32, .3, 2.2); S.flash('rgba(176,204,255,1)', .26, .1, 2.85); S.flash('rgba(190,214,255,1)', .5, .35, 2.95);
  S.cue('thunder', 1.8); S.cue('rumble', 2.4, 1.2, .12);
  tl.to(dark, {opacity: .72, duration: .5, ease: 'sine.in'}, 2.9);
  // climax: a held breath, then one strike
  tl.addLabel('climax', 3.55);
  tl.set(bolt, {opacity: 1}, 3.55).to(paths, {strokeDashoffset: 0, duration: .09, ease: 'none', stagger: .018}, 3.55);
  S.flash('#eef4ff', 1, .5, 3.56, .03); S.flash('#dbe8ff', .6, .35, 3.7, .02);
  tl.to(dark, {opacity: .12, duration: .06}, 3.56);
  S.ring(tx, ty, w * .3, 'rgba(210,228,255,.9)', 3.6, .55, 3); S.shake(3.58, .38, 8, 0, 'power2.out'); S.cue('crack', 3.56); S.cue('thunder', 3.78);
  S.burst(3.6, 26, ()=>{ const a = -Math.PI * rnd(.05, .95), v = rnd(160, 520) * U; return {x: tx, y: ty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, gy: 700 * U, life: rnd(.4, .9), s: rnd(1.2, 3), s1: .6, c: pick(['235,244,255', '150,190,255']), add: true}; });
  tl.to(scorch, {opacity: 1, duration: .2}, 3.6);
  // aftermath: the afterimage fades, rain thins, smoke curls off the scorch
  tl.addLabel('after', 3.85);
  tl.to(bolt, {opacity: 0, duration: .9, ease: 'power2.in'}, 3.9);
  S.stream(3.9, 1.3, 9, ()=>({x: tx + rnd(-w * .05, w * .05), y: ty, vx: rnd(-14, 14), vy: rnd(-70, -30) * U, drag: .2, life: 1.3, s: 7, s1: 20, a: .25, c: '110,116,130'}));
  tl.to(cloud, {opacity: 0, duration: 1.4, ease: 'sine.inOut'}, 4.2).to(drift, {opacity: 0, duration: 1.2}, 4.3).to(dark, {opacity: 0, duration: 1.4, ease: 'sine.inOut'}, 4.1).to(scorch, {opacity: 0, duration: .9}, 4.8);
  S.end(5.5);
}

// ---------------- 4. Tidal wave ----------------
function tidalWave(S){
  const {w, h, tl, g, U} = S;
  const tint = S.L('background:rgba(150,196,190,.55);opacity:0'), shade = S.L('background:linear-gradient(to top,rgba(2,24,36,.9),rgba(4,36,52,.45) 60%,rgba(4,36,52,0));opacity:0');
  const wall = S.el('left:0;top:0;width:100%;height:' + h * 1.3 + 'px;background:linear-gradient(to bottom,rgba(244,255,255,0) 0,rgba(236,255,255,.96) 3%,rgba(150,226,236,.88) 9%,rgba(32,128,158,.86) 22%,rgba(8,64,104,.9) 100%)');
  const foam = S.el('left:' + -w * .1 + 'px;top:0;width:' + w * 1.4 + 'px;height:' + 14 * U + 'px;background:radial-gradient(circle at 10px 0,#fff 0 9px,rgba(255,255,255,0) 10px) 0 0/' + 20 * U + 'px ' + 14 * U + 'px repeat-x');
  const foam2 = S.el('left:' + -w * .1 + 'px;top:0;width:' + w * 1.4 + 'px;height:' + 22 * U + 'px;background:radial-gradient(circle at 14px 0,rgba(230,255,255,.9) 0 13px,rgba(255,255,255,0) 14px) 0 0/' + 28 * U + 'px ' + 22 * U + 'px repeat-x;opacity:.7');
  wall.appendChild(foam); wall.appendChild(foam2); foam.style.top = foam2.style.top = -10 * U + 'px'; foam.style.position = foam2.style.position = 'absolute';
  const wet = S.L('background:linear-gradient(to bottom,rgba(180,236,244,.28),rgba(120,200,220,.12));opacity:0');
  g.set(wall, {y: h * 1.02});
  // omen: the sea draws back, the light goes sickly green, a swell shows at the bottom edge
  tl.to(tint, {opacity: .45, duration: 1.0, ease: 'sine.inOut'}, 0).to(wall, {y: h * .93, duration: 1.1, ease: 'sine.out'}, .1);
  tl.to(foam, {x: -w * .05, duration: 1.2, repeat: 3, yoyo: true, ease: 'sine.inOut'}, 0).to(foam2, {x: w * .05, duration: 1.4, repeat: 3, yoyo: true, ease: 'sine.inOut'}, 0);
  S.cue('wind', .2, 1.6); S.cue('rumble', .9, 2.2, .2);
  // build: the wall of water stands up and comes on
  tl.to(shade, {opacity: 1, duration: 2.0, ease: 'power2.in'}, 1.1).to(wall, {y: h * .5, duration: 1.1, ease: 'power1.in'}, 1.2).to(wall, {y: -h * .08, duration: 1.0, ease: 'power3.in'}, 2.3);
  S.stream(1.8, 1.5, p=> 20 + 60 * p, ()=>{ const y = gsap.getProperty(wall, 'y'); return {x: rnd(0, w), y: y + rnd(-8, 8), vx: rnd(-40, 40), vy: rnd(-180, -60) * U, gy: 500 * U, life: rnd(.4, .8), s: rnd(1.5, 3.5), s1: .8, c: '236,255,255'}; });
  // climax: it breaks over the board
  tl.addLabel('climax', 3.3);
  S.flash('#f2ffff', .6, .7, 3.3, .05); S.shake(3.3, .55, 11, 0, 'power2.out'); S.cue('slam', 3.3);
  S.burst(3.3, 56, ()=>({x: rnd(0, w), y: rnd(-4, h * .1), vx: rnd(-120, 120) * U, vy: rnd(60, 420) * U, gy: 700 * U, life: rnd(.6, 1.2), s: rnd(1.5, 4), s1: 1, c: pick(['255,255,255', '200,244,250', '120,200,226'])}));
  tl.to(wet, {opacity: 1, duration: .3}, 3.3);
  // aftermath: the water drains away, leaving a wet sheen
  tl.addLabel('after', 3.55);
  tl.to(wall, {y: h * 1.08, duration: 1.7, ease: 'power2.inOut'}, 3.6).to(shade, {opacity: 0, duration: 1.4}, 3.7).to(tint, {opacity: 0, duration: 1.2}, 3.7);
  S.stream(3.7, 1.0, 40, ()=>({x: rnd(0, w), y: gsap.getProperty(wall, 'y') + rnd(0, 10), vx: rnd(-30, 30), vy: rnd(40, 160) * U, gy: 400 * U, life: .6, s: 2, s1: .6, c: '230,252,255'}));
  S.cue('whoosh', 3.7, 1.4);
  tl.to(wet, {opacity: 0, duration: 1.3, ease: 'sine.in'}, 4.1);
  S.end(5.5);
}

// ---------------- 5. Earthquake fissure ----------------
function earthquake(S){
  const {w, h, tl, g, U} = S, cx = w * rnd(.45, .55);
  const dim = S.L('background:rgba(54,36,22,.8);opacity:0');
  // the crack's spine: jagged, running down the board
  const pts = []; const n = 14; for(let i = 0; i <= n; i++){ const t = i / n; pts.push([cx + (i && i < n ? rnd(-1, 1) * 22 * U : 0) + Math.sin(t * 5) * w * .03, h * (.1 + .85 * t)]); }
  const spine = 'M' + pts.map(p=> p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
  const wide = (k)=> 'M' + pts.map((p, i)=> (p[0] - (i === 0 || i === n ? 1 : (5 + 13 * Math.sin(Math.PI * i / n) + rnd(0, 7)) * k * U)).toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'L' + pts.slice().reverse().map((p, i, a)=> (p[0] + ((i === 0 || i === n) ? 1 : (5 + 13 * Math.sin(Math.PI * (n - i) / n) + rnd(0, 7)) * k * U)).toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
  let br = ''; for(let i = 0; i < 4; i++){ const k = Math.floor(rnd(3, 11)), p = pts[k], sgn = i % 2 ? 1 : -1; br += '<path d="M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + 'L' + (p[0] + sgn * w * rnd(.08, .2)).toFixed(1) + ' ' + (p[1] + rnd(-20, 40)).toFixed(1) + 'L' + (p[0] + sgn * w * rnd(.2, .34)).toFixed(1) + ' ' + (p[1] + rnd(10, 70)).toFixed(1) + '"/>'; }
  const cracks = S.svg('opacity:1', '<g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="rgba(255,150,60,.55)" stroke-width="' + 8 * U + '"><path d="' + spine + '"/>' + br + '</g><g stroke="#0a0604" stroke-width="' + 3 * U + '"><path d="' + spine + '"/>' + br + '</g></g>');
  const cp = [...cracks.querySelectorAll('path')]; cp.forEach(p=>{ const L = p.getTotalLength(); g.set(p, {strokeDasharray: L, strokeDashoffset: L}); });
  const chasm = S.svg('opacity:0', '<g class="c"><path d="' + wide(1) + '" fill="#060304" stroke="rgba(255,176,74,.85)" stroke-width="' + 2.4 * U + '"/><path d="' + wide(.45) + '" fill="rgba(255,120,30,.55)"/></g>');
  const cg = chasm.querySelector('.c'); g.set(cg, {svgOrigin: cx + ' ' + h * .5, scaleX: .04});
  // omen: a tremor, dust trickles from above
  tl.to(dim, {opacity: .3, duration: 2.6, ease: 'sine.in'}, .2);
  S.shake(.3, 1.6, .6, 2.4); S.cue('rumble', .3, 3.0, .22);
  S.stream(.5, 2.7, p=> 12 + 50 * p, ()=>({x: rnd(0, w), y: -6, vx: rnd(-10, 10), vy: rnd(40, 130) * U, life: rnd(1, 1.8), s: rnd(1, 2.4), s1: 1.4, a: .6, c: '150,120,90'}));
  // build: the ground cracks, line by line
  tl.to(cp, {strokeDashoffset: 0, duration: 1.1, ease: 'power1.in', stagger: .22}, 1.9);
  S.shake(1.9, 1.5, 2.4, 8); S.cue('crack', 2.2); S.cue('crack', 2.9);
  S.burst(2.8, 14, ()=>({x: rnd(cx - 60, cx + 60), y: rnd(h * .3, h * .8), vx: rnd(-30, 30), vy: rnd(-90, -20) * U, life: rnd(.8, 1.4), s: rnd(2, 5), s1: 8, a: .4, c: '130,104,82'}));
  // climax: it splits open
  tl.addLabel('climax', 3.4);
  tl.to(chasm, {opacity: 1, duration: .08}, 3.4).to(cg, {scaleX: 1, duration: .45, ease: 'power3.out'}, 3.4).to(cracks, {opacity: 0, duration: .3}, 3.5);
  S.shake(3.4, 1.0, 19, 0, 'power2.out'); S.flash('rgba(255,210,150,1)', .3, .4, 3.4, .04); S.cue('boom', 3.4); S.cue('rumble', 3.4, 1.8, .3);
  S.burst(3.4, 22, ()=>({x: cx + rnd(-20, 20), y: rnd(h * .3, h * .85), vx: rnd(-80, 80) * U, vy: rnd(-60, -20) * U, drag: 1, life: rnd(1.3, 2), s: rnd(16, 30), s1: rnd(50, 90), a: .34, c: '118,96,78'}));
  S.burst(3.42, 24, ()=>{ const a = -Math.PI * rnd(.1, .9), v = rnd(180, 520) * U; return {x: cx + rnd(-14, 14), y: rnd(h * .4, h * .8), vx: Math.cos(a) * v, vy: Math.sin(a) * v, gy: 900 * U, life: rnd(.8, 1.4), s: rnd(2, 5), s1: 1.5, c: '58,48,42'}; });
  // aftermath: the tremor fades, the chasm closes slowly, dust settles
  tl.addLabel('after', 3.7);
  tl.to(cg, {scaleX: .3, duration: 1.4, ease: 'sine.inOut'}, 3.9).to(chasm, {opacity: 0, duration: 1.0, ease: 'sine.in'}, 4.4).to(dim, {opacity: 0, duration: 1.5, ease: 'sine.out'}, 3.9);
  S.end(5.4);
}

// ---------------- 6. Volcanic eruption ----------------
function eruption(S){
  const {w, h, tl, g, U} = S, vx0 = w * .5, vy0 = h * 1.01;
  const sky = S.L('background:radial-gradient(ellipse at 50% 100%,rgba(255,84,20,.55),rgba(120,24,10,.2) 55%,rgba(40,8,6,0) 80%);opacity:0'), dim = S.L('background:#1a0a08;opacity:0');
  const column = S.el('left:0;top:0;width:' + w * .3 + 'px;height:' + h * 1.05 + 'px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 38%,#000 62%,transparent);mask-image:linear-gradient(90deg,transparent,#000 38%,#000 62%,transparent);background:linear-gradient(to top,rgba(255,170,70,.9),rgba(255,106,24,.38) 55%,rgba(255,80,10,0));opacity:0;transform-origin:50% 100%'); g.set(column, {xPercent: -50, x: vx0, y: 0, scaleY: 0, transformOrigin: '50% 100%'}); column.style.top = '0';
  const smoke = S.L('background:linear-gradient(to bottom,rgba(40,24,20,.96),rgba(58,34,26,.82) 55%,rgba(58,34,26,0));opacity:0'); g.set(smoke, {yPercent: 55});
  const glow = S.el('left:0;top:0;width:' + w * 1.2 + 'px;height:' + h * .5 + 'px;background:radial-gradient(ellipse at 50% 100%,rgba(255,170,60,.95),rgba(255,90,20,.45) 40%,rgba(255,60,10,0) 70%);opacity:0'); g.set(glow, {xPercent: -50, x: vx0, y: h * .52});
  // omen: grey smoke wisps from the ground, a low glow, a faint tremor
  tl.to(sky, {opacity: .5, duration: 1.4, ease: 'sine.inOut'}, .2).to(glow, {opacity: .45, duration: 1.2}, .5);
  S.stream(.2, 1.4, 12, ()=>({x: vx0 + rnd(-30, 30), y: vy0, vx: rnd(-20, 20), vy: rnd(-90, -40) * U, drag: .1, life: rnd(1.4, 2), s: 8, s1: 30, a: .3, c: '110,100,96'}));
  S.shake(.4, 1.4, .4, 2); S.cue('rumble', .3, 2.8, .24);
  // build: the glow pulses, ash falls, sparks spit
  tl.to(dim, {opacity: .5, duration: 1.9, ease: 'sine.in'}, 1.2).to(glow, {opacity: .9, duration: .45, repeat: 3, yoyo: true, ease: 'sine.inOut'}, 1.3).to(sky, {opacity: .9, duration: 1.8}, 1.3);
  S.shake(1.4, 1.8, 2, 6); S.stream(1.3, 1.9, 22, ()=>({x: rnd(0, w), y: -6, vx: rnd(-20, 20), vy: rnd(50, 130) * U, life: rnd(1.6, 2.4), s: rnd(1, 2.4), s1: 1.2, a: .6, c: '120,114,110'}));
  S.stream(1.7, 1.5, p=> 6 + 20 * p, ()=>({x: vx0 + rnd(-16, 16), y: vy0, vx: rnd(-90, 90) * U, vy: rnd(-520, -240) * U, gy: 900 * U, life: rnd(.7, 1.2), s: 2, s1: 1, c: '255,170,60', add: true}));
  // climax: the blast
  tl.addLabel('climax', 3.2);
  S.flash('#ffd8a0', .85, .6, 3.2, .05); S.shake(3.2, 1.2, 15, 2, 'power2.out'); S.cue('boom', 3.2); S.cue('roar', 3.25, 2.4);
  tl.to(column, {opacity: 1, scaleY: 1, duration: .22, ease: 'power3.out'}, 3.2).to(column, {opacity: 0, duration: .9, ease: 'sine.in'}, 3.5);
  tl.to(smoke, {opacity: .72, yPercent: -8, duration: 1.5, ease: 'power2.out'}, 3.25).to(glow, {opacity: 1, duration: .15}, 3.2);
  S.stream(3.2, 1.2, p=> 110 * (1 - p * .5), ()=>{ const a = -Math.PI / 2 + rnd(-.26, .26), v = rnd(640, 1180) * U; return {x: vx0 + rnd(-14, 14), y: vy0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, gy: 1150 * U, life: rnd(1, 1.7), s: rnd(2.5, 6), s1: 1.2, c: pick(['255,230,120', '255,160,50', '255,96,28']), add: true}; });
  // aftermath: lava rains down, the cloud thins, the glow dies
  tl.addLabel('after', 4.3);
  S.stream(4.3, 1.0, 22, ()=>({x: vx0 + rnd(-w * .3, w * .3), y: rnd(-6, h * .3), vx: rnd(-20, 20), vy: rnd(40, 160) * U, gy: 300 * U, life: rnd(.8, 1.4), s: rnd(1.5, 3.5), s1: 1, c: '255,120,40', add: true}));
  tl.to(smoke, {opacity: 0, duration: 1.2, ease: 'sine.in'}, 4.5).to(dim, {opacity: 0, duration: 1.3, ease: 'sine.inOut'}, 4.4).to(sky, {opacity: 0, duration: 1.4}, 4.5).to(glow, {opacity: 0, duration: 1.3}, 4.4);
  S.end(5.8);
}

// ---------------- 7. Blizzard whiteout ----------------
function blizzard(S){
  const {w, h, tl, g, U} = S;
  const cold = S.L('background:#9cc4ea;opacity:0'), white = S.L('background:#f2f8ff;opacity:0');
  const fog = [0, 1, 2].map(i=>{ const e = S.el('left:0;top:0;width:' + w * 2.2 + 'px;height:' + h * .6 + 'px;background:radial-gradient(ellipse at 50% 50%,rgba(240,248,255,.95),rgba(240,248,255,.7) 45%,rgba(240,248,255,0) 72%);opacity:0'); g.set(e, {x: w * (.3 - i * .5), y: h * (-.1 + i * .3)}); return e; });
  const frost = S.L('background:radial-gradient(ellipse at 50% 50%,rgba(210,238,255,0) 52%,rgba(190,228,255,.55) 80%,rgba(240,250,255,.9) 100%);opacity:0;transform:scale(1.25)');
  // omen: the air chills, a few flakes
  tl.to(cold, {opacity: .32, duration: 1.1, ease: 'sine.inOut'}, 0);
  S.stream(.2, 4.1, p=> p < .22 ? 8 + 40 * p : (p < .75 ? 30 + 190 * (p - .22) / .53 : 20), ()=>({x: rnd(.1, 1.3) * w, y: rnd(-.1, .9) * h, vx: rnd(-720, -380) * U, vy: rnd(60, 220) * U, life: rnd(.6, 1.1), s: rnd(1, 2.6), s1: 1, c: '255,255,255', a: .9}));
  S.cue('wind', .3, 3.4);
  // build: wind, fog bands sweep through, visibility drops
  tl.to(fog, {opacity: 1, duration: 1.0, stagger: .3, ease: 'sine.inOut'}, 1.0).to(fog, {x: '-=' + w * 1.1, duration: 2.6, ease: 'none', stagger: .15}, 1.0);
  tl.to(white, {opacity: .9, duration: 2.1, ease: 'power2.in'}, 1.3).to(cold, {opacity: .5, duration: 1.8}, 1.2);
  // climax: the whiteout peaks, a gust, then hush
  tl.addLabel('climax', 3.4);
  tl.to(white, {opacity: .93, duration: .15, ease: 'power2.out'}, 3.4); S.flash('#ffffff', .4, .5, 3.4, .06); S.shake(3.4, .3, 4, 0, 'power1.out');
  // aftermath: the wind drops, the fog lifts, frost and ice glints remain
  tl.addLabel('after', 3.9);
  tl.to(white, {opacity: 0, duration: 1.5, ease: 'sine.inOut'}, 3.8).to(fog, {opacity: 0, duration: 1.1, stagger: .1}, 3.8).to(cold, {opacity: 0, duration: 1.6}, 4.0);
  tl.to(frost, {opacity: 1, scale: 1, duration: .9, ease: 'power2.out'}, 3.7).to(frost, {opacity: 0, duration: .9, ease: 'sine.in'}, 5.0);
  S.burst(4.2, 34, ()=>({x: rnd(0, w), y: rnd(0, h), life: rnd(.5, 1.0), s: rnd(1.4, 3.2), s1: .6, io: true, add: true, c: pick(['255,255,255', '190,230,255']), a: .95}));
  S.cue('chime', 4.2, [1319, 1568, 1976]);
  S.end(5.7);
}

// ---------------- 8. Aurora blessing ----------------
function aurora(S){
  const {w, h, tl, g, U} = S;
  const night = S.L('background:#050a22;opacity:0'), stars = []; for(let i = 0; i < 16; i++){ const s = S.el('left:0;top:0;width:' + 2.4 * U + 'px;height:' + 2.4 * U + 'px;border-radius:50%;background:#fff;box-shadow:0 0 6px #cfe6ff;opacity:0'); g.set(s, {x: rnd(.04, .96) * w, y: rnd(.03, .8) * h}); stars.push(s); }
  const mask = 'repeating-linear-gradient(90deg,#000 0,rgba(0,0,0,.35) 7%,#000 15%,rgba(0,0,0,.55) 22%)';
  const cur = [['rgba(70,255,170,.62)', 'rgba(90,200,255,.34)'], ['rgba(120,255,210,.5)', 'rgba(150,120,255,.3)'], ['rgba(100,230,255,.5)', 'rgba(190,100,255,.34)']].map((c, i)=>{
    const e = S.el('left:' + -w * .1 + 'px;top:' + -h * .05 + 'px;width:' + w * 1.2 + 'px;height:' + h * .78 + 'px;background:linear-gradient(to bottom,rgba(0,0,0,0),' + c[0] + ' 34%,' + c[1] + ' 72%,rgba(150,90,255,0));-webkit-mask-image:' + mask + ';mask-image:' + mask + ';opacity:0;transform-origin:50% 0'); g.set(e, {scaleY: .3, skewX: -6 + i * 6, x: (i - 1) * w * .06}); return e; });
  const flare = S.L('background:radial-gradient(ellipse at 50% 0,rgba(196,255,224,.95),rgba(80,255,170,.3) 40%,rgba(80,255,170,0) 66%);opacity:0'), gold = S.L('background:linear-gradient(to bottom,rgba(255,236,160,.0),rgba(255,230,150,.3));opacity:0');
  // omen: a calm night falls, stars show
  tl.to(night, {opacity: .62, duration: 1.4, ease: 'sine.inOut'}, 0).to(stars, {opacity: .9, duration: .7, stagger: .05}, .4);
  tl.to(stars, {opacity: .35, duration: .8, repeat: 5, yoyo: true, ease: 'sine.inOut', stagger: .11}, 1.3);
  S.cue('drone', .2, 2.6);
  // build: curtains of light unfurl and sway
  tl.to(cur, {opacity: .85, scaleY: 1, duration: 1.7, ease: 'sine.out', stagger: .3}, 1.1);
  cur.forEach((e, i)=> tl.to(e, {skewX: '+=7', x: '+=' + (i % 2 ? -1 : 1) * w * .08, duration: 1.5, repeat: 3, yoyo: true, ease: 'sine.inOut'}, 1.2 + i * .2));
  // climax: the light pours down onto the board
  tl.addLabel('climax', 3.0);
  tl.to(flare, {opacity: 1, duration: .35, ease: 'power2.out'}, 3.0).to(flare, {opacity: .35, duration: 1.3, ease: 'sine.inOut'}, 3.35);
  tl.to(cur, {opacity: 1, scaleY: 1.22, duration: .8, ease: 'power2.out'}, 3.0).to(gold, {opacity: 1, duration: .8}, 3.1);
  S.ring(w / 2, h * .2, w * .75, 'rgba(206,255,226,.75)', 3.05, 1.5, 4); S.cue('chime', 3.0, [392, 523, 659, 784, 1047]);
  S.stream(3.0, 1.7, 80, ()=>({x: rnd(0, w), y: rnd(h * .05, h * .45), vx: rnd(-14, 14), vy: rnd(36, 100) * U, life: rnd(1.1, 1.8), s: rnd(1.6, 3.6), s1: .8, io: true, add: true, c: pick(['190,255,214', '255,236,160', '150,230,255']), a: .95}));
  // aftermath: the curtains thin and drift off, the night lifts, motes linger
  tl.addLabel('after', 4.2);
  tl.to(cur, {opacity: 0, duration: 1.2, ease: 'sine.in', stagger: .15}, 4.2).to(flare, {opacity: 0, duration: 1.0}, 4.3).to(gold, {opacity: 0, duration: 1.3}, 4.5);
  tl.to(night, {opacity: 0, duration: 1.4, ease: 'sine.inOut'}, 4.3).to(stars, {opacity: 0, duration: .7, stagger: .03}, 4.6);
  S.end(5.8);
}

// ---------------- 9. Wildfire sweep ----------------
function wildfire(S){
  const {w, h, tl, g, U} = S, fw = w * .6, sw = w + fw * .5;
  const haze = S.L('background:linear-gradient(to bottom,rgba(150,70,24,.6),rgba(110,50,20,.5));opacity:0'), smoke = S.L('background:#1c0e06;opacity:0');
  const scorch = S.el('left:0;top:0;width:' + sw + 'px;height:' + h + 'px;background:linear-gradient(90deg,rgba(12,7,4,.82) 0,rgba(12,7,4,.82) 86%,rgba(12,7,4,0));opacity:1'); g.set(scorch, {x: -sw});
  const front = S.el('left:0;top:0;width:' + fw + 'px;height:' + h + 'px;background:linear-gradient(90deg,rgba(60,14,0,0),rgba(255,90,10,.22) 45%,rgba(255,170,60,.55) 85%,rgba(255,230,150,0));opacity:0'); g.set(front, {x: -fw});
  const fx = ()=> gsap.getProperty(front, 'x') + fw * .82;
  // omen: smoke haze, embers blown ahead of the fire
  tl.to(haze, {opacity: .55, duration: 1.3, ease: 'sine.inOut'}, 0).to(smoke, {opacity: .4, duration: 2.6, ease: 'sine.in'}, .6);
  S.stream(.1, 2.6, 16, ()=>({x: -6, y: rnd(.05, .95) * h, vx: rnd(200, 420) * U, vy: rnd(-40, 30), life: rnd(1.4, 2.2), s: rnd(1.2, 2.6), s1: .8, add: true, c: '255,150,50', a: .9}));
  S.cue('wind', .2, 1.6); S.cue('roar', 1.3, 2.4);
  // build + climax: the front sweeps across, scorching behind it
  tl.to(front, {opacity: 1, duration: .3}, 1.2).to(front, {x: w, duration: 2.7, ease: 'power1.in'}, 1.3).to(scorch, {x: 0, duration: 2.7, ease: 'power1.in'}, 1.3);
  S.stream(1.3, 2.7, p=> 80 + 90 * p, ()=>{ const x = fx(); return {x: x + rnd(-fw * .45, fw * .08), y: rnd(.1, 1) * h, vx: rnd(-30, 60), vy: rnd(-380, -140) * U, life: rnd(.35, .75), s: rnd(3, 8), s1: 1, add: true, c: pick(['255,170,50', '255,120,30', '255,214,100']), a: .8}; });
  S.shake(1.6, 2.4, .8, 3.6); tl.addLabel('mid', 2.7); S.flash('rgba(255,150,50,1)', .22, .5, 2.6);
  tl.addLabel('climax', 3.7);
  S.flash('#ffe2a8', .5, .6, 3.75, .05); S.cue('boom', 3.8);
  S.burst(3.75, 36, ()=>({x: w * rnd(.78, 1), y: rnd(.1, 1) * h, vx: rnd(-80, 80) * U, vy: rnd(-540, -160) * U, gy: 360 * U, life: rnd(.7, 1.3), s: rnd(2, 5), s1: 1, add: true, c: pick(['255,200,80', '255,140,40'])}));
  tl.to(front, {opacity: 0, duration: .4}, 4.0);
  // aftermath: smoke rises, embers glow and wink out, the scorch fades
  tl.addLabel('after', 4.05);
  S.stream(4.0, 1.3, 26, ()=>({x: rnd(0, w), y: rnd(.4, 1) * h, vx: rnd(-10, 10), vy: rnd(-90, -40) * U, life: rnd(1, 1.5), s: 10, s1: 30, a: .22, c: '90,84,80'}));
  S.stream(4.0, 1.2, 30, ()=>({x: rnd(0, w * .9), y: rnd(.1, 1) * h, life: rnd(.7, 1.3), s: rnd(1.4, 2.8), s1: 1, io: true, add: true, c: '255,130,40', a: .95}));
  tl.to(haze, {opacity: 0, duration: 1.3}, 4.1).to(smoke, {opacity: 0, duration: 1.3}, 4.1).to(scorch, {opacity: 0, duration: 1.0, ease: 'sine.in'}, 4.6);
  S.end(5.5);
}

// ---------------- 10. Swarm blots out the sun ----------------
function swarm(S){
  const {w, h, tl, g, U} = S, sun = S.L('background:radial-gradient(circle at 76% 14%,rgba(255,246,176,.9),rgba(255,214,110,.4) 24%,rgba(255,200,100,0) 56%);opacity:0'), dark = S.L('background:#130e04;opacity:0');
  const sw = {cx: -w * .15, cy: h * .13, sp: .02};
  // omen: a bright sky, a few specks on the horizon
  tl.to(sun, {opacity: 1, duration: .7}, 0);
  const N = 120;
  S.stream(.25, 2.6, p=> 8 + 44 * p, ()=>{ const r = Math.random(), a = rnd(0, 6.28); return {life: 8, s: rnd(2.2, 3.4), a: .92, c: '22,14,6', k: 'wing', ox: Math.cos(a) * Math.sqrt(r), oy: Math.sin(a) * Math.sqrt(r) * .7, f1: rnd(1.5, 3.2), wob: rnd(10, 40), x: -100, y: -100,
    upd(p, dt){ p.age += 0; const t = p.age; p.x = sw.cx + p.ox * sw.sp * w + Math.sin(t * p.f1 + p.ph) * p.wob * U; p.y = sw.cy + p.oy * sw.sp * w + Math.cos(t * p.f1 * 1.3 + p.ph) * p.wob * .6 * U; }}; });
  S.cue('buzz', .8, 4.2);
  // build: the cloud gathers over the sun, light fails
  tl.to(sw, {cx: w * .76, cy: h * .15, sp: .2, duration: 2.5, ease: 'sine.inOut'}, .4);
  tl.to(sun, {opacity: .12, duration: 1.8, ease: 'sine.in'}, 1.4).to(dark, {opacity: .4, duration: 1.8, ease: 'sine.in'}, 1.2);
  // climax: it sweeps down across the whole board, near-dark
  tl.addLabel('climax', 3.0);
  tl.to(sw, {cx: w * .5, cy: h * .5, sp: .34, duration: 1.0, ease: 'power2.inOut'}, 3.0).to(dark, {opacity: .78, duration: .6, ease: 'power2.out'}, 3.0);
  // aftermath: it thins and flies off the far side, the sun comes back
  tl.addLabel('after', 4.0);
  tl.to(sw, {cx: w * 1.5, cy: h * .3, sp: .12, duration: 1.4, ease: 'power2.in'}, 4.0).to(dark, {opacity: 0, duration: 1.3, ease: 'sine.inOut'}, 4.1).to(sun, {opacity: 1, duration: 1.2, ease: 'sine.out'}, 4.3);
  tl.to(sun, {opacity: 0, duration: .6}, 5.2);
  S.end(5.5);
}

// ---------------- 11. Stampede ----------------
function stampede(S){
  const {w, h, tl, g, U} = S, fs = Math.max(38, Math.min(w * .17, h * .22)), kinds = ['🦌', '🐐', '🐃', '🦌', '🐏', '🐐', '🦌', '🐃', '🐏', '🦌', '🐐', '🐃', '🦌', '🐏'];
  const haze = S.L('background:linear-gradient(to left,rgba(170,128,84,.85),rgba(170,128,84,.35) 45%,rgba(170,128,84,0));opacity:0'), dim = S.L('background:#2a1a0c;opacity:0');
  // one darkened layer holds the whole herd, so the animals read as silhouettes (one filter on one layer, never per animal)
  const herd = S.L('filter:brightness(0);opacity:.86');
  const runners = kinds.map((k, i)=>{ const e = document.createElement('div'); e.className = 'cn-e'; e.style.cssText = 'left:0;top:0;line-height:1;white-space:nowrap;font-size:' + fs * rnd(.85, 1.15) + 'px'; e.textContent = k; herd.appendChild(e);
    g.set(e, {x: w + 2 * fs, y: h * (.1 + .8 * ((i * 5) % 14) / 13) - fs / 2, display: 'none'}); return e; });
  // omen: dust trembles on the far horizon
  tl.to(haze, {opacity: .5, duration: 1.4, ease: 'sine.inOut'}, .1).to(dim, {opacity: .3, duration: 2.4, ease: 'sine.in'}, .6);
  S.shake(.3, 1.4, .5, 2.4); S.cue('rumble', .2, 2.8, .2);
  S.stream(.3, 2.2, 14, ()=>({x: w + 6, y: rnd(.25, .95) * h, vx: rnd(-90, -30) * U, vy: rnd(-40, 10), life: rnd(1.2, 1.8), s: rnd(10, 18), s1: rnd(30, 50), a: .24, c: '168,130,92'}));
  // build + climax: the herd thunders across
  tl.addLabel('climax', 3.1);
  runners.forEach((e, i)=>{ const t0 = 2.2 + i * .1 + rnd(0, .08), d = rnd(1.25, 1.5);
    tl.set(e, {display: 'block'}, t0).to(e, {x: -2.2 * fs, duration: d, ease: 'none'}, t0).to(e, {y: '+=' + fs * .14, duration: .17, repeat: Math.round(d / .17), yoyo: true, ease: 'sine.inOut'}, t0); });
  S.stream(2.3, 2.6, 60, ()=>{ const e = runners[Math.floor(rnd(0, runners.length))], x = gsap.getProperty(e, 'x'); if(x > w || x < -fs) return null; return {x: x + fs * rnd(.5, 1), y: gsap.getProperty(e, 'y') + fs * rnd(.7, 1), vx: rnd(30, 120) * U, vy: rnd(-70, -10) * U, drag: .8, life: rnd(.6, 1.1), s: rnd(6, 11), s1: rnd(18, 28), a: .26, c: '170,134,96'}; });
  S.shake(2.4, 2.4, 5, 9); S.cue('hooves', 2.2, 13); S.cue('roar', 2.3, 2.4);
  tl.to(haze, {opacity: 1, duration: 1.2, ease: 'sine.in'}, 2.5); S.flash('rgba(214,176,128,1)', .4, .8, 3.1, .2);
  // aftermath: hooves fade, the dust settles
  tl.addLabel('after', 4.4);
  tl.to(haze, {opacity: 0, duration: 1.3, ease: 'sine.inOut'}, 4.6).to(dim, {opacity: 0, duration: 1.3}, 4.6);
  S.end(5.9);
}

const API = {
  meteor: (el, o)=> run('meteor', el, o, meteor), eclipse: (el, o)=> run('eclipse', el, o, eclipse), lightning: (el, o)=> run('lightning', el, o, lightning),
  tidalWave: (el, o)=> run('tidalWave', el, o, tidalWave), earthquake: (el, o)=> run('earthquake', el, o, earthquake), eruption: (el, o)=> run('eruption', el, o, eruption),
  blizzard: (el, o)=> run('blizzard', el, o, blizzard), aurora: (el, o)=> run('aurora', el, o, aurora), wildfire: (el, o)=> run('wildfire', el, o, wildfire),
  swarm: (el, o)=> run('swarm', el, o, swarm), stampede: (el, o)=> run('stampede', el, o, stampede),
};
API.names = Object.keys(API).slice();
API.play = (name, el, o)=> API[name] ? API[name](el, o) : Promise.resolve();
API.running = ()=> ACTIVE.size;
W.BramblewoodCinematic = API;
})();
