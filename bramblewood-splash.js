/* ============================================================
   Lively splash (2026-10-08)
   User: "The background splash at the start needs to be more lively. Maybe dancing otters (2.5d,
   many layers), as we zoom in, and they move outwards. Leaving maybe an angry otter pointing a
   spear at an angry hummingbird with a staff."

   A layered pixel-art scene over the splash painting: three depth bands of otters dance (two-frame
   sprites, nearer ones bigger, sharper and faster); the camera pushes in while the crowd parts to
   the sides, nearer otters moving further (parallax); in the gap an angry otter levels a spear at an
   angry hummingbird holding a staff. Sprites are drawn from small character grids at load (no image
   files). Reduced motion or Effects: None shows the final standoff, still.
   ============================================================ */
(function(){
  const PAL = {
    O:'#2b170c', B:'#8a5a33', b:'#6e4526', L:'#e0bd92', N:'#1a0d06', E:'#120a05', W:'#ffffff',
    G:'#33a85e', D:'#1c6b3a', T:'#d8344a', K:'#2a2a2a', V:'#bfefff', v:'#7fd3f0', Y:'#f2c94c', R:'#c0262d',
  };
  // Otter, facing right. Arms are overlaid per frame.
  const OTTER = [
    '....O....O......',
    '....OOOOOO......',
    '...OBBBBBBO.....',
    '...OBEBBEBO.....',
    '...OBBLLBBO.....',
    '...OBLNNLBO.....',
    '....OLLLLO......',
    '....OBBBBO......',
    '...OBBLLBBO.....',
    '...OBLLLLBO.....',
    '..OBBLLLLBBO....',
    '..OBBLLLLBBO....',
    '..OBBLLLLBBO....',
    '...OBBLLBBO.....',
    '...OBBBBBBO.OOO.',
    '...OBBOOBBOOBBO.',
    '...OBO..OBOBBO..',
    '..OBBO.OBBOOO...',
    '..OOOO.OOOO.....',
  ];
  const ARMS_UP = [[1,4,'O'],[2,4,'O'],[1,5,'B'],[2,5,'O'],[1,6,'O'],[2,6,'B'],[2,7,'O'],[3,7,'B'],
                   [12,4,'O'],[13,4,'O'],[12,5,'O'],[13,5,'B'],[12,6,'B'],[13,6,'O'],[11,7,'O'],[12,7,'B']];
  const ARMS_DOWN = [[1,9,'O'],[2,9,'B'],[1,10,'O'],[1,11,'B'],[1,12,'O'],
                     [12,9,'B'],[13,9,'O'],[13,10,'O'],[13,11,'B'],[13,12,'O']];
  // Angry brows: a dark line slanting down toward the nose, and a red anger mark.
  const BROWS = [[4,2,'O'],[5,3,'O'],[9,2,'O'],[8,3,'O'],[4,3,'B'],[9,3,'B']];
  // Hummingbird, facing left (long beak, red throat); the wing has two positions.
  const BIRD = [
    '..................',
    '..................',
    '..................',
    '..................',
    '.....DDG..........',
    '....DGGGGD........',
    'KKKDGEGGGGD.......',
    '...DTTGGGGGD......',
    '....DTTGGGGGD.....',
    '.....DGGGGGGGD....',
    '......DDGGGDDDDD..',
    '........DDD..DDDD.',
    '.........O.O......',
  ];
  const fromArt = (rows, y0)=> rows.flatMap((r, y)=> r.split('').map((ch, x)=> ch === '.' ? null : [x, y0 + y, ch]).filter(Boolean));
  const WING_UP = fromArt(['..........VV', '.........VVvV', '........VVvVV', '.......VVvVV', '........VVV'], 0);
  const WING_DOWN = fromArt(['........VVVV', '.........VvVVV', '..........VvVV'], 6);
  const BIRD_BROWS = [[4,5,'O'],[5,5,'O'],[6,5,'E']];
  function sheet(grid, frames){
    const h = grid.length, w = grid[0].length;
    const c = document.createElement('canvas'); c.width = w*frames.length; c.height = h;
    const g = c.getContext('2d');
    frames.forEach((over, f)=>{
      const rows = grid.map(r=> r.split(''));
      over.forEach(([x, y, ch])=>{ if(rows[y] && x < w) rows[y][x] = ch; });
      rows.forEach((r, y)=> r.forEach((ch, x)=>{ if(PAL[ch]){ g.fillStyle = PAL[ch]; g.fillRect(f*w + x, y, 1, 1); } }));
    });
    return {url: c.toDataURL(), w, h, frames: frames.length};
  }
  function sprite(sh, cls, px){
    const el = document.createElement('span');
    el.className = 'ss-sprite ' + (cls||'');
    el.style.cssText = `width:${sh.w*px}px; height:${sh.h*px}px; background-image:url(${sh.url}); background-size:${sh.w*sh.frames*px}px ${sh.h*px}px;`;
    el.style.setProperty('--fw', (sh.w*px) + 'px');
    return el;
  }

  function build(splash){
    if(!splash || splash.querySelector('.splash-stage')) return;
    const still = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.getAttribute('data-fx') === 'none';
    const dancer = sheet(OTTER, [ARMS_UP, ARMS_DOWN]);
    const fighter = sheet(OTTER, [ARMS_DOWN.concat(BROWS), ARMS_DOWN.concat(BROWS)]);
    const bird = sheet(BIRD, [WING_UP.concat(BIRD_BROWS), WING_DOWN.concat(BIRD_BROWS)]);

    const stage = document.createElement('div');
    stage.className = 'splash-stage' + (still ? ' is-still' : '');
    stage.setAttribute('aria-hidden', 'true');
    const cam = document.createElement('div'); cam.className = 'ss-cam'; stage.appendChild(cam);

    // Three depth bands: far (small, hazy, slow) → near (big, crisp, quick).
    const bands = [{n:9, px:4, y:60, depth:.35}, {n:7, px:6, y:72, depth:.7}, {n:5, px:9, y:88, depth:1}];
    let k = 0;
    bands.forEach((b, bi)=>{
      const band = document.createElement('div'); band.className = 'ss-band'; band.style.setProperty('--depth', b.depth); band.style.zIndex = 1 + bi;
      for(let i = 0; i < b.n; i++){
        const x = (i + 0.5) / b.n * 100 + ((k*37) % 7 - 3);            // spread across, a little jitter
        const side = x < 50 ? -1 : 1;
        const o = sprite(dancer, 'ss-otter' + (i % 2 ? ' ss-flip' : ''), b.px);
        const holder = document.createElement('span'); holder.className = 'ss-dancer';
        holder.style.left = x + '%'; holder.style.top = (b.y + ((k*13) % 5) - 2) + '%';
        holder.style.setProperty('--out', (side * (10 + b.depth*20 + Math.abs(x - 50)*0.3)).toFixed(1) + 'vw');
        holder.style.setProperty('--hop', (0.42 + ((k*7) % 5)*0.04 - b.depth*0.06).toFixed(2) + 's');
        holder.style.setProperty('--delay', (-((k*0.13) % 0.5)).toFixed(2) + 's');
        holder.appendChild(o); band.appendChild(holder); k++;
      }
      cam.appendChild(band);
    });

    // The standoff, revealed in the gap as the crowd parts.
    const duel = document.createElement('div'); duel.className = 'ss-duel';
    const otterSide = document.createElement('span'); otterSide.className = 'ss-fighter ss-otter-f';
    otterSide.appendChild(sprite(fighter, 'ss-shake', 6));
    const spear = document.createElement('span'); spear.className = 'ss-spear'; otterSide.appendChild(spear);
    const birdSide = document.createElement('span'); birdSide.className = 'ss-fighter ss-bird-f';
    birdSide.appendChild(sprite(bird, 'ss-hover', 7));
    const staff = document.createElement('span'); staff.className = 'ss-staff'; birdSide.appendChild(staff);
    duel.append(otterSide, birdSide);
    cam.appendChild(duel);

    const bg = splash.querySelector('.entrance-bg');
    if(bg && bg.nextSibling) splash.insertBefore(stage, bg.nextSibling); else splash.prepend(stage);
  }
  // The show starts when the splash is actually seen: when the loading screen lifts (see runLoader).
  // The scene is built only after the page has loaded, so it can never hold up the load itself.
  let wantPlay = false;
  function play(){
    wantPlay = true;
    const st = document.querySelector('#splashScreen .splash-stage');
    if(st && !st.classList.contains('is-still')) requestAnimationFrame(()=> requestAnimationFrame(()=> st.classList.add('is-playing')));
  }
  function init(){
    const sp = document.getElementById('splashScreen');
    if(!sp || sp.hidden) return;
    build(sp);
    if(wantPlay || !document.getElementById('bwLoader')) play();
  }
  if(document.readyState === 'complete') setTimeout(init, 0); else window.addEventListener('load', ()=> setTimeout(init, 0), {once:true});
  window.SplashStage = {build, play};
})();
