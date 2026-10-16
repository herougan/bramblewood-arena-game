/* ============================================================
   Unit FX, hit styles and skins (2026-10-08)
   User: "more sfx samples ... hit vfx such as claw marks" and "Prepare a construct such that some
   units have special vfx, sfx, or even skins that do. Maybe a fire breathing skin of a familiar
   card - then it literally blows fire (vfx) to an enemy card."

   How a unit looks and sounds when it fights is resolved in three layers, later ones winning:
     1. its hit style, guessed from its name and type tags (claw / bite / sting / peck / blunt);
     2. the card's own `fx` field in its definition, e.g. {hit:'claw', attack:'fireBreath', sfx:'roar'};
     3. the skin its owner has equipped, from UnitFX.SKINS below.
   A skin can also restyle the card itself (`tileClass`, a CSS class added to its tile) and swap
   its art (`art`). Skins are owned per player (localStorage for now; server-side later).

   Everything here is DOM-only and self-contained, so the Effects Lab can call it too.
   ============================================================ */
(function(){
  const HIT_RULES = [
    [/\b(cat|kitten|fox|wolf|bear|lynx|tiger|lion|panther|cheetah|leopard|jaguar|raccoon|trash panda|badger|wolverine|hyena|eagle|hawk|falcon|owl|griffin|dragon|drake|mole|yeti|macaque|monkey)\b/i, 'claw'],
    [/\b(dog|hound|jackal|croc|crocodile|alligator|shark|snake|serpent|viper|eel|moray|piranha|rat|crab|hippo|turtle)\b/i, 'bite'],
    [/\b(bee|wasp|hornet|scorpion|mosquito|leech|urchin|porcupine|hedgehog|ant|spider)\b/i, 'sting'],
    [/\b(bird|sparrow|robin|toucan|hummingbird|crow|raven|woodpecker|chick|duck|goose|finch|parrot|heron|stork|kiwi|pelican|fledgling|courier)\b/i, 'peck'],
  ];
  function guessHit(def){
    if(!def) return 'blunt';
    const text = [def.name || '', def.id || '', ...(Array.isArray(def.archetypes) ? def.archetypes : [])].join(' ').replace(/-/g, ' ');
    for(const [re, style] of HIT_RULES) if(re.test(text)) return style;
    return 'blunt';
  }

  // ---- Skins -------------------------------------------------------------------------------
  // base: the card it dresses; fx: overrides for layer 3; tileClass/art: the look on the card.
  const SKINS = {
    'acorn-chipmunk:ember': {
      base: 'acorn-chipmunk', name: 'Ember Chipmunk', icon: '🔥',
      blurb: 'A chipmunk who ate one chilli too many. It breathes a jet of fire at whatever it attacks.',
      fx: {attack: 'fireBreath', hit: 'burn', sfx: 'fireBreath'},
      tileClass: 'skin-ember',
    },
  };
  const OWN_KEY = 'bramblewood_skins_owned_v1', EQUIP_KEY = 'bramblewood_skins_equipped_v1';
  const read = (k, d)=>{ try{ return JSON.parse(localStorage.getItem(k) || 'null') || d; }catch(e){ return d; } };
  const write = (k, v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  let owned = new Set(read(OWN_KEY, [])), equipped = read(EQUIP_KEY, {});
  function skinsFor(defId){ return Object.keys(SKINS).filter(k=> SKINS[k].base === defId).map(k=> Object.assign({id:k, owned: owned.has(k)}, SKINS[k])); }
  function grantSkin(id){ if(SKINS[id]){ owned.add(id); write(OWN_KEY, [...owned]); } }
  function equipSkin(defId, skinId){
    if(skinId && (!SKINS[skinId] || SKINS[skinId].base !== defId || !owned.has(skinId))) return false;
    if(skinId) equipped[defId] = skinId; else delete equipped[defId];
    write(EQUIP_KEY, equipped); return true;
  }
  function equippedSkin(defId){ const k = equipped[defId]; return k && SKINS[k] && owned.has(k) ? k : null; }

  // The resolved FX for one unit. `mine` = it's the local player's card (skins only show on yours
  // until skins are synced between players).
  function resolve(def, mine){
    const out = {hit: guessHit(def), attack: null, sfx: null, skin: null};
    if(def && def.fx) Object.assign(out, def.fx);
    const sk = def && mine ? equippedSkin(def.id) : null;
    if(sk){ Object.assign(out, SKINS[sk].fx || {}); out.skin = sk; }
    return out;
  }

  // ---- Hit marks ---------------------------------------------------------------------------
  const NS = 'http://www.w3.org/2000/svg';
  function overlay(target, cls, ms){
    const tile = target && (target.querySelector('.card-tile') || target);
    if(!tile) return null;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 130'); svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('class', 'ufx-mark ' + cls); svg.setAttribute('aria-hidden', 'true');
    tile.appendChild(svg);
    setTimeout(()=> svg.remove(), ms || 700);
    return svg;
  }
  function path(svg, d, cls){ const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); if(cls) p.setAttribute('class', cls); svg.appendChild(p); return p; }
  const rnd = (a, b)=> a + Math.random()*(b - a);
  function claw(target){
    const svg = overlay(target, 'ufx-claw', 760); if(!svg) return;
    const tilt = rnd(-14, 14), x0 = rnd(26, 40);
    for(let i = 0; i < 3; i++){
      const x = x0 + i*14, y1 = 26 + i*3 + rnd(-3, 3), y2 = 104 - i*4 + rnd(-3, 3);
      const d = `M${x + tilt*0.6} ${y1} Q ${x + 6} ${(y1 + y2)/2} ${x - tilt*0.6 + 4} ${y2}`;
      path(svg, d, 'ufx-gash-under').style.animationDelay = (i*40) + 'ms';
      path(svg, d, 'ufx-gash').style.animationDelay = (i*40) + 'ms';
    }
  }
  // Bite (2026-10-08, user: "the bite should really crunch down, the back teeth lagging 0.1s behind, then opening, then
  // fading out immediately. It has that punch"): front jaws snap shut past their mark (a crunch), the back row follows
  // 0.1 s later, a flash marks the crunch, then the jaws spring open and vanish.
  // 2026-10-16 (user: "The teeth damage effect: 8a: Make the teeth close. 8b: Just 1 row of teeth each is okay. 8c: Make the teeth
  // fade out slightly towards the roots. Make the roots very very slightly red. Like 255/238/238 kind."): one row per jaw (6 on top,
  // 5 below, set half a tooth apart so they mesh), and the jaws travel all the way in: the tips pass each other and interlock at the
  // card's middle (CSS ufxJawTop/ufxJawBot). Each tooth is white at the tip and fades toward a faintly red root (#FFEEEE).
  // The fade is drawn as four bands per tooth (root to tip: #FFEEEE at .5, then .7, .88, white at 1), each band one path for the
  // whole jaw; an SVG gradient fill (url(#id)) drew nothing on the board, so plain fills it is. A thin dark edge runs only along the
  // outer 60% toward the tip, so the roots stay soft.
  const TOOTH_BANDS = [[0, .3, '#ffeeee', .5], [.3, .55, '#fff3f3', .7], [.55, .8, '#fff9f9', .88], [.8, 1, '#ffffff', 1]];
  function bite(target){
    const svg = overlay(target, 'ufx-bite', 600); if(!svg) return;
    // y: the gum line (roots), dir: +1 tips point down (top jaw), -1 up; x0: first root's left; n teeth w wide, h long
    const jaw = (cls, y, dir, x0, n, w, h)=>{
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'ufx-jaw ' + cls); svg.appendChild(g);
      const at = (x, f, side)=> [x + (side < 0 ? w/2*f : w - w/2*f), y + dir*h*f];
      TOOTH_BANDS.forEach(([fa, fb, col, op])=>{ let d = '';
        for(let i = 0; i < n; i++){ const x = x0 + i*w, a1 = at(x, fa, -1), a2 = at(x, fa, 1), b2 = at(x, fb, 1), b1 = at(x, fb, -1);
          d += `M${a1[0].toFixed(2)} ${a1[1].toFixed(2)} L${a2[0].toFixed(2)} ${a2[1].toFixed(2)} L${b2[0].toFixed(2)} ${b2[1].toFixed(2)} L${b1[0].toFixed(2)} ${b1[1].toFixed(2)} Z `; }
        const p = path(g, d, 'ufx-tooth-band'); p.style.fill = col; p.style.fillOpacity = op; });
      let e = ''; for(let i = 0; i < n; i++){ const x = x0 + i*w, l = at(x, .4, -1), r = at(x, .4, 1), tip = [x + w/2, y + dir*h]; e += `M${l[0].toFixed(2)} ${l[1].toFixed(2)} L${tip[0]} ${tip[1]} L${r[0].toFixed(2)} ${r[1].toFixed(2)} `; }
      path(g, e, 'ufx-tooth-edge');
      return g;
    };
    // closed, the tips pass each other by ~8 units around the card's middle (y 61-69) and mesh, half a tooth apart
    jaw('ufx-jaw-top', 52, 1, 17, 6, 11, 17); jaw('ufx-jaw-bot', 78, -1, 22.5, 5, 11, 17);
    const fl = document.createElementNS(NS, 'ellipse'); fl.setAttribute('cx', 50); fl.setAttribute('cy', 65); fl.setAttribute('rx', 34); fl.setAttribute('ry', 10); fl.setAttribute('class', 'ufx-crunch'); svg.appendChild(fl);
    // (2026-10-12: no squash of its own any more; the hit's impactSquash already gives the one crunch, two read as a double bite)
  }
  function sting(target){
    const svg = overlay(target, 'ufx-sting', 620); if(!svg) return;
    const cx = rnd(38, 62), cy = rnd(48, 80); let d = '';
    for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2, r1 = 3, r2 = i % 2 ? 11 : 18; d += `M${cx + Math.cos(a)*r1} ${cy + Math.sin(a)*r1} L${cx + Math.cos(a)*r2} ${cy + Math.sin(a)*r2} `; }
    path(svg, d, 'ufx-star');
    const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.setAttribute('r', 3.2); dot.setAttribute('class', 'ufx-dot'); svg.appendChild(dot);
  }
  function peck(target){
    const svg = overlay(target, 'ufx-peck', 600); if(!svg) return;
    for(let i = 0; i < 3; i++){
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', rnd(30, 70)); c.setAttribute('cy', rnd(40, 95)); c.setAttribute('r', rnd(3, 5));
      c.setAttribute('class', 'ufx-dent'); c.style.animationDelay = (i*70) + 'ms'; svg.appendChild(c);
    }
  }
  function burn(target){
    const svg = overlay(target, 'ufx-burn', 900); if(!svg) return;
    path(svg, `M${rnd(25, 35)} 110 C 30 80, 55 85, 50 55 C 62 75, 78 70, 72 110 Z`, 'ufx-scorch');
  }
  const MARKS = {claw, bite, sting, peck, burn};
  function hitMark(style, target){ const f = MARKS[style]; if(f) f(target); }

  // ---- Fire breath ---------------------------------------------------------------------------
  // A jet of flame puffs from the attacker's mouth (upper middle of its tile) to the target,
  // each puff growing, reddening and fading as it travels. ms = how long the jet lasts.
  function fireBreath(fromEl, toEl, ms){
    if(!fromEl || !toEl || !document.body.animate) return;
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const sx = a.left + a.width/2, sy = a.top + a.height*0.38;
    const ex = b.left + b.width/2, ey = b.top + b.height/2;
    const dx = ex - sx, dy = ey - sy, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
    const jet = document.createElement('div'); jet.className = 'ufx-jet'; jet.setAttribute('aria-hidden', 'true');
    jet.style.left = sx + 'px'; jet.style.top = sy + 'px'; jet.style.transform = `rotate(${ang}rad)`;
    document.body.appendChild(jet);
    const dur = ms || 520, n = 22;
    for(let i = 0; i < n; i++){
      const p = document.createElement('i'); jet.appendChild(p);
      const spread = rnd(-0.2, 0.2)*Math.min(len, 400)*0.4, size = rnd(26, 46);
      p.style.width = p.style.height = size + 'px'; p.style.left = p.style.top = (-size/2) + 'px';
      p.animate([
        {transform:`translate(0px, 0px) scale(.35)`, opacity:0, filter:'hue-rotate(10deg)'},
        {opacity:1, offset:0.15},
        {transform:`translate(${len*0.55}px, ${spread*0.5}px) scale(1.1)`, opacity:.95, offset:0.55},
        {transform:`translate(${len*1.02}px, ${spread}px) scale(1.9)`, opacity:0, filter:'hue-rotate(-25deg) brightness(.8)'},
      ], {duration: dur*0.75, delay: i/n*dur*0.55, easing:'cubic-bezier(.2,.6,.4,1)', fill:'both'});
    }
    setTimeout(()=> jet.remove(), dur + 120);
  }
  const ATTACKS = {fireBreath};
  function attackFx(kind, fromEl, toEl, ms){ const f = ATTACKS[kind]; if(f) f(fromEl, toEl, ms); }

  window.UnitFX = {guessHit, resolve, hitMark, attackFx, fireBreath, claw, bite, sting, peck, burn,
    SKINS, skinsFor, grantSkin, equipSkin, equippedSkin};
})();

/* ============================================================
   Battle board pass P2 (2026-10-15): two board effects, DOM-only so the Effects Lab plays the same code.
   ============================================================ */
(function(){
  const U = window.UnitFX; if(!U) return;
  const reduced = ()=>{ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
  const spd = o=> Math.max(0.25, Number(o && o.speed) || 1);
  // Guardian plates break on death (user: "should break on death"): the steel sheets braced out from behind a Guardian crack into
  // jagged pieces that flash, spin outward and fall away. The plates themselves are hidden at once (.guard-plates.is-broken).
  // el: the Guardian's .board-card. Returns a Promise.
  const BANDS = [[0, 26], [26, 52], [52, 77], [77, 100]];
  function guardBreak(el, opts){
    opts = opts || {};
    const gp = el && el.querySelector && el.querySelector('.guard-plates');
    if(!gp || gp.classList.contains('is-broken')) return Promise.resolve();
    const plates = [...gp.querySelectorAll('i')].map(p=>{ const r = p.getBoundingClientRect(), cs = getComputedStyle(p); return {r, bg: cs.backgroundImage, bc: cs.borderColor, left: p.classList.contains('gp-l')}; }).filter(p=> p.r.width > 2);
    gp.classList.add('is-broken');
    if(!plates.length || reduced() || !document.body.animate) return Promise.resolve();
    const host = document.createElement('div'); host.className = 'ufx-guard-shards'; host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:10040; overflow:visible;';
    document.body.appendChild(host);
    const k = 1 / spd(opts); let longest = 0;
    plates.forEach((p, pi)=>{
      BANDS.forEach(([a, b], bi)=>{
        // a jagged band: the cut wanders a few % left and right so the pieces read as torn steel, not neat slices
        const j = v=> Math.max(0, Math.min(100, v + (Math.random()*8 - 4)));
        const top = bi === 0 ? '0% 0%, 100% 0%' : `0% ${j(a)}%, 35% ${j(a)}%, 62% ${j(a)}%, 100% ${j(a)}%`;
        const bot = bi === BANDS.length - 1 ? '100% 100%, 0% 100%' : `100% ${j(b)}%, 62% ${j(b)}%, 35% ${j(b)}%, 0% ${j(b)}%`;
        const s = document.createElement('i');
        s.style.cssText = `position:absolute; left:${p.r.left}px; top:${p.r.top}px; width:${p.r.width}px; height:${p.r.height}px; border-radius:4px;
          background:${p.bg}; border:1.5px solid ${p.bc}; box-sizing:border-box; clip-path:polygon(${top}, ${bot}); will-change:transform, opacity;`;
        host.appendChild(s);
        const out = (p.left ? -1 : 1), dx = out * (18 + Math.random()*46), dy = 34 + Math.random()*70 + bi*10, rot = out * (25 + Math.random()*110) * (Math.random() < .25 ? -1 : 1);
        const dur = (720 + Math.random()*260) * k, delay = (pi*40 + bi*35) * k; longest = Math.max(longest, dur + delay);
        s.animate([
          {transform:'translate(0,0) rotate(0deg)', filter:'brightness(1)', opacity:1},
          {transform:`translate(${dx*0.12}px, ${-6 - Math.random()*6}px) rotate(${rot*0.1}deg)`, filter:'brightness(1.45)', opacity:1, offset:0.14},
          {transform:`translate(${dx*0.6}px, ${dy*0.35}px) rotate(${rot*0.6}deg)`, filter:'brightness(1.1)', opacity:.95, offset:0.55},
          {transform:`translate(${dx}px, ${dy}px) rotate(${rot}deg)`, filter:'brightness(.8)', opacity:0},
        ], {duration:dur, delay, easing:'cubic-bezier(.25,.1,.55,1)', fill:'both'});
      });
      // a white crack-flash where the plate stood
      const f = document.createElement('b');
      f.style.cssText = `position:absolute; left:${p.r.left + p.r.width/2 - 14}px; top:${p.r.top + p.r.height*0.42 - 14}px; width:28px; height:28px; border-radius:50%;
        background:radial-gradient(circle, rgba(255,255,255,.95), rgba(210,225,240,.45) 45%, transparent 70%);`;
      host.appendChild(f);
      f.animate([{transform:'scale(.3)', opacity:0}, {transform:'scale(1.4)', opacity:1, offset:.3}, {transform:'scale(2)', opacity:0}], {duration:380*k, easing:'ease-out', fill:'both'});
    });
    return new Promise(res=> setTimeout(()=>{ host.remove(); res(); }, longest + 60));
  }
  // The opponent pitches a card (user: "If they pitch, I should see a card fading in while being dumped into the ground. Then just as
  // it hits the ground, their resource count goes up like how ours does - animation wise."): the card fades in above `ground` (a
  // point in screen px: where it lands), tips and drops, and sinks into the ground in a ring of dust; opts.onLand runs as it hits.
  // cardHTML: the card's face markup (cardTileHTML). opts: {w (card width, px), speed, onLand}. Returns a Promise.
  function pitchDump(cardHTML, ground, opts){
    opts = opts || {};
    const land = ()=>{ try{ opts.onLand && opts.onLand(); }catch(e){} };
    if(!ground || reduced() || !document.body.animate){ land(); return Promise.resolve(); }
    const k = 1 / spd(opts), w = opts.w || 64, h = Math.round(w * 1.25), drop = opts.drop != null ? opts.drop : Math.round(h * 0.45);
    const host = document.createElement('div'); host.className = 'ufx-pitch-dump'; host.setAttribute('aria-hidden', 'true');
    // the clip box ends at the ground line, so whatever passes below it has gone "into the ground"; the card fades in at its top
    // (its bottom `drop` px above the ground), falls, touches down and sinks out of sight
    const boxH = h + drop + 6;
    host.style.cssText = `position:fixed; left:${ground.x - w}px; top:${ground.y - boxH}px; width:${w*2}px; height:${boxH}px; pointer-events:none; z-index:10040; overflow:hidden;`;
    const card = document.createElement('div');
    card.style.cssText = `position:absolute; left:${w/2}px; top:6px; width:${w}px; height:${h}px; transform-origin:50% 100%; filter:drop-shadow(0 3px 4px rgba(0,0,0,.45));`;
    card.innerHTML = cardHTML || '<div class="card-tile"></div>';
    const tile = card.firstElementChild; if(tile){ tile.style.width = '100%'; tile.style.height = '100%'; tile.style.margin = '0'; tile.style.boxSizing = 'border-box'; }
    host.appendChild(card); document.body.appendChild(host);
    const a = card.animate([
      {transform:'translateY(0) rotate(-5deg) scale(.86)', opacity:0, offset:0},
      {transform:'translateY(-3px) rotate(-3deg) scale(1)', opacity:1, offset:.3},
      {transform:`translateY(${drop}px) rotate(4deg) scale(1)`, opacity:1, offset:.58, easing:'ease-out'},
      {transform:`translateY(${drop + 3}px) rotate(3deg) scaleY(.9) scaleX(1.06)`, opacity:1, offset:.64},
      {transform:`translateY(${drop + h + 6}px) rotate(2deg) scale(.96)`, opacity:.8, offset:1},
    ], {duration:1250*k, easing:'cubic-bezier(.45,0,.55,1)', fill:'both'});
    // dust ring where it meets the ground, timed to the touch-down
    const landAt = 1250*k*0.6;
    setTimeout(()=>{
      land();
      for(let i = 0; i < 7; i++){
        const d = document.createElement('i'), dx = (i - 3) * (w*0.16) + (Math.random()*6 - 3);
        d.style.cssText = `position:fixed; left:${ground.x + dx - 5}px; top:${ground.y - 8}px; width:10px; height:10px; border-radius:50%; pointer-events:none; z-index:10041;
          background:radial-gradient(circle, rgba(214,190,150,.9), rgba(150,120,80,.35) 60%, transparent 72%);`;
        document.body.appendChild(d);
        d.animate([{transform:'translate(0,0) scale(.5)', opacity:.9}, {transform:`translate(${dx*0.9}px, ${-10 - Math.random()*12}px) scale(${1.6 + Math.random()})`, opacity:0}],
          {duration:560*k, easing:'ease-out', fill:'both'}).onfinish = ()=> d.remove();
      }
    }, landAt);
    return new Promise(res=> a.onfinish = ()=>{ host.remove(); res(); });
  }
  Object.assign(U, {guardBreak, pitchDump});
})();
