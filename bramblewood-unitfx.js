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
  function bite(target){
    const svg = overlay(target, 'ufx-bite', 720); if(!svg) return;
    const teeth = (y, dir)=>{ let d = ''; for(let i = 0; i < 6; i++){ const x = 20 + i*12; d += `M${x} ${y} L${x + 6} ${y + dir*14} L${x + 12} ${y} `; } return d; };
    path(svg, teeth(36, 1), 'ufx-teeth ufx-top');
    path(svg, teeth(94, -1), 'ufx-teeth ufx-bot');
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
