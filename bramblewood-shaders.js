// Shader layers (T7, 2026-10-03 — "Let's REALLY delve into this. Let's try some on the maps and in
// the beginning few web pages"). Real WebGL, not CSS: two kinds of layer.
//
//  • scene  — draws a painted picture (the splash art) through a fragment shader. The shader reads
//             the picture's own pixels to decide what moves: green pixels sway in the wind, blue
//             pixels ripple like water and catch glints, bright pixels bloom. Light shafts and
//             fireflies are added on top, and the view drifts slightly with the pointer.
//  • map    — a transparent overlay for a Conquest map, one look per terrain: dappled canopy
//             light (forest), caustics (water), embers and lava glow (fire), drifting fog and a
//             lantern that follows your pointer (caves), heat shimmer (savanna), snowfall and an
//             aurora (tundra), bubbles (coral), marsh fog and fireflies (swamp), clouds and wind
//             (sky), and embers with lightning (storm).
//
// Every layer: one shared animation loop; pauses when off screen or when the tab is hidden;
// renders at reduced resolution; destroys itself (and frees its GL context) when its host leaves
// the page. Browser-only; a no-op anywhere without WebGL.
(function(root){
'use strict';
if(typeof window === 'undefined' || typeof document === 'undefined'){ if(typeof module!=='undefined' && module.exports) module.exports = {}; return; }

const COMMON = `
precision mediump float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_int;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i = 0; i < 4; i++){ v += a*noise(p); p = p*2.03 + 1.7; a *= 0.5; } return v; }
// glowing points, one chance per grid cell, drifting with the cell grid; q is aspect-correct
float sparks(vec2 q, float scale, float t, vec2 drift, float size, float density){
  vec2 p = q*scale + drift*t; vec2 id = floor(p); vec2 f = fract(p) - 0.5;
  float h = hash(id);
  vec2 o = (vec2(hash(id+3.1), hash(id+7.7)) - 0.5)*0.6 + 0.15*vec2(sin(t*1.3 + h*6.28), cos(t*1.1 + h*12.0));
  float d = length(f - o); float tw = 0.55 + 0.45*sin(t*(1.5 + h*3.0) + h*40.0);
  return step(1.0 - density, h) * smoothstep(size, 0.0, d) * tw;
}
// diagonal god rays from the top-left; uv is 0..1 with y down
float shafts(vec2 uv, float t){
  vec2 dir = normalize(vec2(0.8, 1.0)); float x = dot(uv, vec2(dir.y, -dir.x));
  float r = noise(vec2(x*7.0, t*0.12)) * noise(vec2(x*19.0 + 3.0, t*0.2));
  return r * smoothstep(1.3, 0.0, dot(uv, dir));
}
float caustic(vec2 uv, float t){
  vec2 p = mod(uv*6.2831, 6.2831) - 250.0; vec2 i = p; float c = 1.0; float inten = 0.005;
  for(int n = 0; n < 4; n++){ float tt = t*(1.0 - (3.5/float(n+1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0/length(vec2(p.x/(sin(i.x+tt)/inten), p.y/(cos(i.y+tt)/inten))); }
  c /= 4.0; c = 1.17 - pow(c, 1.4); return pow(abs(c), 8.0);
}
`;

const VERT = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const SCENE_FRAG = COMMON + `
uniform sampler2D u_tex; uniform vec2 u_texSize; uniform vec2 u_focus; uniform sampler2D u_depthTex; uniform float u_hasDepth;
vec2 coverUV(vec2 uv){ float ca = u_res.x/u_res.y, ia = u_texSize.x/u_texSize.y;
  vec2 s = ca > ia ? vec2(1.0, ia/ca) : vec2(ca/ia, 1.0);
  vec2 f = u_focus + u_mouse*0.012; return f + (uv - u_focus)*s; }
void main(){
  vec2 uv = vec2(gl_FragCoord.x/u_res.x, 1.0 - gl_FragCoord.y/u_res.y);
  vec2 q = gl_FragCoord.xy/u_res.y;
  float t = u_time;
  vec2 iu = coverUV(uv);
  // Depth parallax (effects experiment #2): near pixels (white in the depth map) shift with the
  // camera, far ones barely move. Three refinement steps keep the shift stable at depth edges.
  if(u_hasDepth > 0.5){
    vec2 cam = u_mouse + 0.35*vec2(sin(t*0.21), cos(t*0.17));
    vec2 p = iu;
    for(int k = 0; k < 3; k++){ float d = texture2D(u_depthTex, p).r; p = iu - (d - 0.4) * cam * vec2(0.026, 0.016) * u_int; }
    iu = clamp(p, vec2(0.001), vec2(0.999));
  }
  vec3 c0 = texture2D(u_tex, iu).rgb;
  float green = smoothstep(0.02, 0.14, c0.g - max(c0.r, c0.b));
  // blue in the lower part of the picture is water; blue up top is sky and stays still
  float water = smoothstep(0.03, 0.16, c0.b - max(c0.r, c0.g*0.92)) * smoothstep(0.38, 0.55, iu.y);
  // a painted scene with a depth map also carries a water mask in its green channel: use that
  // instead of the colour guess, so blue birds and flowers stay still and only the river moves
  if(u_hasDepth > 0.5) water = texture2D(u_depthTex, iu).g;
  vec2 px = 1.0/u_texSize;
  // wind: foliage sways in gusts, more near the top of the picture
  float gust = 0.6 + 0.4*sin(t*0.35) * noise(vec2(t*0.2, 1.0));
  vec2 off = vec2(sin(t*1.7 + iu.y*28.0 + noise(iu*7.0 + t*0.25)*5.0), 0.0) * px * 1.6 * green * gust * u_int;
  // water: ripples
  off += water * vec2(sin(iu.y*150.0 + t*2.4), cos(iu.x*80.0 + t*1.6)) * px * 1.2 * u_int;
  vec3 col = texture2D(u_tex, iu + off).rgb;
  // glints on water
  float gli = pow(noise(iu*vec2(60.0, 260.0) + vec2(t*0.6, t*1.2)), 10.0) * water;
  col += vec3(0.9, 0.97, 1.0) * gli * 1.6 * u_int;
  // bloom-lite: bright neighbours bleed light
  vec3 b = vec3(0.0);
  for(int k = 0; k < 4; k++){ float a = float(k)*1.5708 + 0.785; vec3 s = texture2D(u_tex, iu + vec2(cos(a), sin(a))*px*3.0).rgb;
    b += max(s - 0.72, 0.0); }
  col += b * 0.55 * u_int;
  // light shafts and fireflies
  col += vec3(1.0, 0.9, 0.65) * shafts(uv, t) * 0.32 * u_int;
  float ff = sparks(q, 7.0, t, vec2(0.05, -0.08), 0.12, 0.22) + sparks(q, 12.0, t, vec2(-0.04, -0.05), 0.1, 0.15)*0.6;
  col += vec3(0.85, 1.0, 0.45) * ff * smoothstep(0.15, 0.6, uv.y) * u_int;
  // slow breathing light + vignette
  col *= 0.96 + 0.04*sin(t*0.5);
  col *= mix(1.0, smoothstep(1.25, 0.35, length((uv - vec2(0.5, 0.45))*vec2(1.2, 1.0))), 0.55);
  gl_FragColor = vec4(col, 1.0);
}`;

// map overlay: premultiplied colour, blended over the CSS-painted map
const MAP_FRAG = COMMON + `
uniform float u_kind; uniform vec3 u_tint;
// Lighting (2026-10-05): up to 4 short-lived point lights (x, y in 0..1 with y down, radius in
// screen heights, strength) and an optional lit cloth texture for the battlefield felt.
uniform vec4 u_lights[4]; uniform vec3 u_lightCol[4]; uniform float u_felt;
// Shockwave (2026-10-05): x, y (0..1, y down), age 0..1, strength. A bright crest with a dark trough
// behind it rolls out across the felt — castle hits and the heaviest blows.
uniform vec4 u_wave; uniform vec3 u_waveCol;
// Card shadows (2026-10-05): up to 12 card rectangles (x, y, w, h in 0..1, y down) cast soft
// shadows on the felt, pushed away from the lamp.
uniform vec4 u_cards[12]; uniform float u_ncards;
float boxSdf(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
vec4 add(vec4 acc, vec3 c, float a){ a = clamp(a, 0.0, 1.0); return acc + vec4(c*a, a)*(1.0 - acc.a); }
void main(){
  vec2 uv = vec2(gl_FragCoord.x/u_res.x, 1.0 - gl_FragCoord.y/u_res.y);
  vec2 q = gl_FragCoord.xy/u_res.y;
  float t = u_time; vec4 o = vec4(0.0); int k = int(u_kind + 0.5);
  vec2 m = vec2(u_mouse.x*0.5 + 0.5, u_mouse.y*0.5 + 0.5); // pointer in uv
  float aspect = u_res.x/u_res.y;
  if(k == 0){ // forest: canopy dapple, light shafts, fireflies
    float d = fbm(uv*vec2(3.2, 4.0)*vec2(aspect, 1.0)*0.6 + vec2(t*0.045, t*0.02) + 0.3*vec2(sin(t*0.4), 0.0));
    o = add(o, vec3(1.0, 0.95, 0.7), smoothstep(0.58, 0.78, d)*0.28);
    o = add(o, vec3(0.0, 0.05, 0.0), smoothstep(0.42, 0.22, d)*0.30);
    o = add(o, vec3(1.0, 0.92, 0.6), shafts(uv, t)*0.34);
    o = add(o, vec3(0.8, 1.0, 0.4), sparks(q, 9.0, t, vec2(0.05, -0.06), 0.14, 0.18));
  } else if(k == 1 || k == 6){ // water / coral: caustics, glints, bubbles
    float c = caustic(uv*vec2(aspect, 1.0)*0.9 + vec2(t*0.01, 0.0), t*0.45);
    o = add(o, vec3(0.75, 0.95, 1.0), c*0.42);
    o = add(o, vec3(0.0, 0.1, 0.2), smoothstep(0.4, 1.0, uv.y)*0.18);
    if(k == 6){ vec2 bq = q*10.0 + vec2(0.0, t*0.9); vec2 id = floor(bq); vec2 f = fract(bq) - 0.5; float h = hash(id);
      float r = length(f - (vec2(hash(id+2.0), 0.0) - 0.5)*0.5 - vec2(sin(t*2.0 + h*9.0)*0.08, 0.0));
      o = add(o, vec3(0.85, 1.0, 1.0), step(0.86, h) * smoothstep(0.03, 0.0, abs(r - 0.12)) * 0.8); }
    else o = add(o, vec3(1.0), sparks(q, 18.0, t, vec2(0.15, 0.0), 0.06, 0.12)*0.7);
  } else if(k == 2 || k == 8 || k == 10){ // fire / foundry / storm: lava glow, smoke, rising embers
    float g = fbm(vec2(uv.x*aspect*2.0, uv.y*3.0 - t*0.25));
    float glow = smoothstep(0.45, 1.0, uv.y) * (0.55 + 0.45*sin(t*1.3 + g*6.0));
    o = add(o, vec3(1.0, 0.45, 0.1), glow*g*(k == 8 ? 0.55 : 0.38));
    o = add(o, vec3(0.08, 0.05, 0.05), smoothstep(0.5, 0.0, uv.y) * fbm(uv*vec2(aspect*2.0, 2.0) + vec2(t*0.03, t*0.06)) * 0.45);
    float e = sparks(q, 11.0, t, vec2(0.12, 0.55), 0.09, 0.28) + sparks(q, 20.0, t, vec2(-0.1, 0.8), 0.07, 0.2);
    o = add(o, vec3(1.0, 0.6, 0.2), e);
    if(k == 10){ float slot = floor(t*1.5); float fl = step(0.94, hash(vec2(slot, 3.0))) * exp(-fract(t*1.5)*7.0);
      o = add(o, vec3(0.85, 0.9, 1.0), fl*0.45); }
  } else if(k == 3){ // caves: fog, spores, and a lantern that follows the pointer
    float f = fbm(uv*vec2(aspect*1.6, 2.2) + vec2(t*0.035, -t*0.01));
    o = add(o, vec3(0.6, 0.55, 0.75), smoothstep(0.45, 0.85, f)*0.32);
    float lamp = smoothstep(0.38, 0.0, length((uv - m)*vec2(aspect, 1.0)));
    o = add(o, vec3(0.0, 0.0, 0.02), (1.0 - lamp)*0.30);
    o = add(o, vec3(1.0, 0.8, 0.45), lamp*0.18);
    o = add(o, vec3(0.5, 1.0, 0.95), sparks(q, 10.0, t, vec2(0.03, -0.05), 0.1, 0.16));
  } else if(k == 4){ // savanna: heat shimmer, dust, sun shafts
    float s = sin(uv.y*70.0 - t*3.0 + fbm(uv*vec2(4.0, 2.0) + t*0.2)*6.0);
    o = add(o, vec3(1.0, 0.85, 0.55), smoothstep(0.85, 1.0, s) * smoothstep(0.3, 0.9, uv.y) * 0.16);
    o = add(o, vec3(1.0, 0.9, 0.65), shafts(uv, t)*0.3);
    o = add(o, vec3(1.0, 0.92, 0.75), sparks(q, 14.0, t, vec2(0.35, -0.05), 0.07, 0.2)*0.7);
  } else if(k == 5){ // tundra: aurora and snowfall
    float band = sin(uv.x*aspect*2.5 + fbm(vec2(uv.x*3.0, t*0.1))*4.0 + t*0.25);
    float aur = smoothstep(0.55, 0.0, uv.y) * smoothstep(0.2, 1.0, band) * (0.5 + 0.5*fbm(vec2(uv.x*8.0, t*0.3)));
    o = add(o, mix(vec3(0.3, 1.0, 0.7), vec3(0.6, 0.5, 1.0), uv.x), aur*0.35);
    float sn = sparks(q, 9.0, t, vec2(0.12, -0.55), 0.09, 0.4) + sparks(q, 16.0, t, vec2(0.2, -0.9), 0.07, 0.35)*0.8 + sparks(q, 28.0, t, vec2(0.3, -1.3), 0.06, 0.3)*0.6;
    o = add(o, vec3(1.0), sn*0.9);
  } else if(k == 7){ // swamp: low fog, murk, green fireflies
    float f = fbm(uv*vec2(aspect*1.4, 3.0) + vec2(t*0.05, 0.0));
    o = add(o, vec3(0.65, 0.75, 0.6), smoothstep(0.35, 1.0, uv.y) * smoothstep(0.4, 0.8, f) * 0.38);
    o = add(o, vec3(0.6, 1.0, 0.3), sparks(q, 8.0, t, vec2(0.04, -0.04), 0.14, 0.22));
  } else if(k == 11){ // rain on the battlefield: slanted streaks and splash rings on the felt
    vec2 rq = vec2(q.x + q.y*0.18, q.y);
    float col = floor(rq.x*90.0); float h = hash(vec2(col, 7.0));
    float y = fract(rq.y*0.8 + t*(1.6 + h*0.8) + h*10.0);
    float streak = step(0.93, h + 0.0*y) * smoothstep(0.0, 0.08, y) * smoothstep(0.2, 0.08, y) * smoothstep(0.5, 0.0, abs(fract(rq.x*90.0) - 0.5));
    o = add(o, vec3(0.8, 0.88, 1.0), streak*0.5);
    vec2 sp = q*6.0; vec2 id = floor(sp); vec2 f = fract(sp) - 0.5; float hh = hash(id);
    float ph = fract(t*0.7 + hh*7.0); float r = length(f - (vec2(hash(id+1.3), hash(id+2.7)) - 0.5)*0.6);
    float ring = smoothstep(0.03, 0.0, abs(r - ph*0.35)) * (1.0 - ph) * step(0.7, hh);
    o = add(o, vec3(0.85, 0.92, 1.0), ring*0.55);
    o = add(o, vec3(0.05, 0.08, 0.12), 0.12);
  } else { // 9 sky: drifting clouds, wind streaks
    float c = fbm(uv*vec2(aspect*1.2, 2.5) + vec2(t*0.04, 0.0));
    o = add(o, vec3(1.0), smoothstep(0.55, 0.85, c)*0.38);
    float row = floor(uv.y*28.0); float rf = fract(uv.y*28.0);
    float st = smoothstep(0.9, 1.0, sin((uv.x*aspect - t*(0.5 + hash(vec2(row, 4.0))*0.5))*2.2 + row*1.7)) * step(0.8, hash(vec2(row, 1.0))) * smoothstep(0.1, 0.0, abs(rf - 0.5));
    o = add(o, vec3(1.0), st*0.45);
    o = add(o, vec3(1.0, 0.95, 0.8), shafts(uv, t)*0.22);
  }
  vec4 outc = o * u_int;
  if(u_felt > 0.5){
    // Felt: a fine woven height field (two crossed threads plus grain), turned into a surface
    // normal and lit by a warm lamp that drifts slowly and leans toward the pointer. Shadows are
    // alpha-only darkening, highlights are additive, so the cloth reads on any table colour.
    vec2 px = gl_FragCoord.xy;
    float f = 1.15;
    float h0 = sin(px.x*f)*sin(px.y*f*0.97) + 0.6*fbm(px*0.035) + 0.25*noise(px*0.6);
    float hx = sin((px.x+1.0)*f)*sin(px.y*f*0.97) + 0.6*fbm((px+vec2(1.0,0.0))*0.035) + 0.25*noise((px+vec2(1.0,0.0))*0.6);
    float hy = sin(px.x*f)*sin((px.y+1.0)*f*0.97) + 0.6*fbm((px+vec2(0.0,1.0))*0.035) + 0.25*noise((px+vec2(0.0,1.0))*0.6);
    vec3 n = normalize(vec3(h0 - hx, h0 - hy, 2.2));
    vec2 lampUv = vec2(0.32 + 0.22*m.x + 0.05*sin(t*0.13), 0.18 + 0.12*m.y + 0.04*cos(t*0.11));
    vec3 L = normalize(vec3((lampUv - uv)*vec2(aspect, -1.0), 0.75));
    float diff = dot(n, L);
    float pool = smoothstep(1.25, 0.0, length((uv - lampUv)*vec2(aspect, 1.0)));
    float shade = (diff - 0.82) * 1.6 * (u_felt < 1.5 ? 1.0 : 0.0);   // 2 = light only (terrain floor, no cloth)
    outc.a += clamp(-shade, 0.0, 1.0) * 0.16 + (1.0 - pool) * 0.10;     // cloth shadow + falloff
    outc.rgb += vec3(1.0, 0.86, 0.6) * (clamp(shade, 0.0, 1.0)*0.10 + pool*0.07);
    // Ground material per map (2026-10-05, effects rec. G3) — only on terrain floors (u_felt 2).
    if(u_felt > 1.5){
      vec2 gq = q * 7.0;
      if(k == 1 || k == 6 || k == 7){            // wet: slow-moving specular glints toward the lamp
        float w1 = fbm(gq*0.8 + vec2(t*0.08, t*0.05)), w2 = fbm(gq*0.8 + vec2(0.01, 0.0) + vec2(t*0.08, t*0.05));
        float w3 = fbm(gq*0.8 + vec2(0.0, 0.01) + vec2(t*0.08, t*0.05));
        vec3 wn = normalize(vec3((w1 - w2)*40.0, (w1 - w3)*40.0, 1.0));
        vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
        float spec = pow(max(dot(wn, H), 0.0), 60.0) * (0.4 + 0.6*pool);
        outc.rgb += vec3(0.85, 0.95, 1.0) * spec * 0.35;
        outc.a += 0.05;                            // a damp darkening
      } else if(k == 2 || k == 8 || k == 10){    // ash: glowing cracks that breathe
        float c = abs(fbm(gq*0.9) - 0.5);
        float crack = smoothstep(0.028, 0.0, c) * smoothstep(0.3, 0.75, fbm(gq*0.35 + 3.0));
        float pulse = 0.6 + 0.4*sin(t*1.4 + fbm(gq*0.5)*6.0);
        outc.rgb += vec3(1.0, 0.42, 0.08) * crack * pulse * 0.55;
        outc.a += 0.06;
      } else if(k == 5){                          // frost: cold bloom and glittering crystals
        float fr = smoothstep(0.45, 0.8, fbm(gq*0.6));
        outc.rgb += vec3(0.85, 0.93, 1.0) * fr * 0.10;
        vec2 cid = floor(gq*4.0); float hz = hash(cid);
        outc.rgb += vec3(1.0) * step(0.985, hz) * (0.5 + 0.5*sin(t*3.0 + hz*40.0)) * 0.6 * fr;
      } else if(k == 4){                          // sand: wind ripples catching the light
        float rip = sin((uv.x*aspect + uv.y*0.35 + fbm(gq*0.25)*0.25) * 70.0);
        outc.rgb += vec3(1.0, 0.9, 0.7) * smoothstep(0.82, 1.0, rip) * 0.035;
        outc.a += smoothstep(0.82, 1.0, -rip) * 0.025;
      }
    }
  }
  if(u_felt > 0.5 && u_ncards > 0.5){
    vec2 lampS = vec2(0.32 + 0.22*m.x + 0.05*sin(t*0.13), 0.18 + 0.12*m.y + 0.04*cos(t*0.11));
    float sh = 0.0;
    for(int i = 0; i < 12; i++){
      if(float(i) >= u_ncards) break;
      vec4 C = u_cards[i];
      vec2 c = C.xy + C.zw*0.5;
      vec2 dir = (c - lampS) * vec2(aspect, 1.0);
      vec2 off = normalize(dir + vec2(0.0001)) * 0.026 + vec2(0.0, 0.016);
      vec2 p = (uv - c) * vec2(aspect, 1.0) - off;
      float d = boxSdf(p, C.zw*0.5*vec2(aspect, 1.0), 0.012);
      sh = max(sh, smoothstep(0.05, -0.01, d));
    }
    outc.a += sh * 0.55 * (1.0 - outc.a);
  }
  for(int i = 0; i < 4; i++){
    vec4 L4 = u_lights[i];
    if(L4.w <= 0.001) continue;
    float d = length((uv - L4.xy) * vec2(aspect, 1.0));
    float a = L4.w * pow(smoothstep(L4.z, 0.0, d), 1.6);
    outc.rgb += u_lightCol[i] * a;   // additive: light, not paint
  }
  if(u_wave.w > 0.001){
    float wd = length((uv - u_wave.xy) * vec2(aspect, 1.0));
    float R = 0.04 + u_wave.z * 0.55;                       // ring radius in screen heights
    float fade = u_wave.w * (1.0 - u_wave.z) * (1.0 - u_wave.z);
    float crest = smoothstep(0.035, 0.0, abs(wd - R));
    float trough = smoothstep(0.07, 0.0, abs(wd - (R - 0.05))) * step(wd, R);
    outc.rgb += u_waveCol * crest * fade * 0.55;
    outc.a += trough * fade * 0.22;
  }
  gl_FragColor = outc;
}`;

const MAP_KIND = {m1:0, m2:1, m3:2, m4:3, m5:4, m6:5, m7:6, m8:7, m9:8, m10:9, m11:10, m12:3, m13:4, m14:10};

const layers = new Set();
let raf = null, t0 = performance.now();

function compile(gl, type, src){
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ const e = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error('shader: ' + e); }
  return s;
}
function program(gl, frag){
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT)); gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(p, 0, 'a_pos'); gl.linkProgram(p);
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
  return p;
}

let supported = null;
function isSupported(){
  if(supported !== null) return supported;
  try{ const c = document.createElement('canvas'); const g = c.getContext('webgl'); supported = !!g; const lc = g && g.getExtension('WEBGL_lose_context'); if(lc) lc.loseContext(); }
  catch(e){ supported = false; }
  return supported;
}

let pointer = [0, 0];
window.addEventListener('pointermove', e=>{ pointer = [(e.clientX/innerWidth)*2 - 1, (e.clientY/innerHeight)*2 - 1]; }, {passive:true});
window.addEventListener('deviceorientation', e=>{ if(e.gamma == null) return; pointer = [Math.max(-1, Math.min(1, e.gamma/30)), Math.max(-1, Math.min(1, (e.beta-40)/30))]; }, {passive:true});

function mount(host, opts){
  opts = opts || {};
  if(!host || !isSupported()) return null;
  const cv = document.createElement('canvas');
  cv.className = 'bw-shader ' + (opts.className || '');
  cv.setAttribute('aria-hidden', 'true');
  const scene = opts.preset === 'scene';
  const gl = cv.getContext('webgl', {premultipliedAlpha: true, alpha: !scene, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power'});
  if(!gl) return null;
  let prog;
  try{ prog = program(gl, scene ? SCENE_FRAG : MAP_FRAG); }catch(e){ console.warn('[shaders]', e.message); return null; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = n=> gl.getUniformLocation(prog, n);
  const u = {res: U('u_res'), time: U('u_time'), mouse: U('u_mouse'), int: U('u_int'), kind: U('u_kind'), tint: U('u_tint'), tex: U('u_tex'), texSize: U('u_texSize'), focus: U('u_focus'), depthTex: U('u_depthTex'), hasDepth: U('u_hasDepth'),
    lights: U('u_lights'), lightCol: U('u_lightCol'), felt: U('u_felt'), wave: U('u_wave'), waveCol: U('u_waveCol'), cards: U('u_cards'), ncards: U('u_ncards')};
  if(!scene){ gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(u.kind, opts.kind || 0); gl.uniform1f(u.felt, opts.felt ? Number(opts.felt) : 0); }
  const layer = {shadowSel: opts.shadows || null, host, cv, gl, u, scene, ready: !scene, scale: opts.scale || (scene ? 0.75 : 0.5), intensity: opts.intensity == null ? 1 : opts.intensity, w: 0, h: 0, mouse: [0,0], lights: []};
  // Point light: x, y in 0..1 of the host (y down), colour [r,g,b] 0..1, strength ~0.3–1,
  // radius in host heights, life in ms. Rises in 60 ms, then fades out. At most 4 at once.
  layer.flash = (x, y, color, strength, radius, life)=>{
    layer.lights.push({x, y, c: color || [1, 0.85, 0.6], s: strength == null ? 0.6 : strength, r: radius || 0.35, life: life || 520, t0: performance.now()});
    if(layer.lights.length > 4) layer.lights.shift();
  };
  // Shockwave: one at a time (a newer one replaces the old). life in ms.
  layer.wave = (x, y, color, strength, life)=>{ layer.waveState = {x, y, c: color || [1, 0.9, 0.7], s: strength == null ? 0.8 : strength, life: life || 700, t0: performance.now()}; };
  if(scene){
    const img = new Image();
    img.onload = ()=>{
      if(!layers.has(layer)) return;
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.uniform1i(u.tex, 0); gl.uniform2f(u.texSize, img.naturalWidth, img.naturalHeight);
      const f = opts.focus || [0.5, 0.4]; gl.uniform2f(u.focus, f[0], f[1]);
      gl.uniform1f(u.hasDepth, 0);
      layer.ready = true; host.classList.add('has-shader');
      if(opts.depth){
        const dimg = new Image();
        dimg.onload = ()=>{
          if(!layers.has(layer)) return;
          gl.activeTexture(gl.TEXTURE1);
          const dt = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, dt);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dimg);
          gl.activeTexture(gl.TEXTURE0);
          gl.uniform1i(u.depthTex, 1); gl.uniform1f(u.hasDepth, 1);
        };
        dimg.src = opts.depth;
      }
    };
    img.src = opts.image;
  } else host.classList.add('has-shader');
  cv.addEventListener('webglcontextlost', e=>{ e.preventDefault(); destroy(layer); });
  if(opts.prepend) host.insertBefore(cv, host.firstChild); else host.appendChild(cv);
  layers.add(layer);
  layer.destroy = ()=> destroy(layer);
  if(!raf) raf = requestAnimationFrame(loop);
  return layer;
}

function destroy(layer){
  if(!layers.has(layer)) return;
  layers.delete(layer);
  try{ const lc = layer.gl.getExtension('WEBGL_lose_context'); if(lc) lc.loseContext(); }catch(e){}
  if(layer.cv.parentNode) layer.cv.parentNode.removeChild(layer.cv);
  if(layer.host && layer.host.classList) layer.host.classList.remove('has-shader');
}

let frameNo = 0;
function loop(now){
  raf = null;
  if(!layers.size) return;
  const t = (now - t0) / 1000;
  frameNo++;
  layers.forEach(l=>{
    // Perf (2026-10-05): ambient-only layers draw at ~30 fps; anything with a live light or a
    // shockwave draws every frame so impacts stay smooth.
    const busyFx = (l.lights && l.lights.length) || l.waveState;
    if(!busyFx && (frameNo & 1) && l.ready && l.w) return;
    if(!l.host.isConnected || !l.cv.isConnected){ destroy(l); return; }
    if(document.hidden || !l.ready) return;
    const r = l.host.getBoundingClientRect();
    if(r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * dpr * l.scale)), h = Math.max(1, Math.round(r.height * dpr * l.scale));
    if(w !== l.w || h !== l.h){ l.cv.width = w; l.cv.height = h; l.w = w; l.h = h; l.gl.viewport(0, 0, w, h); }
    // ease the pointer so the light doesn't jump
    l.mouse[0] += (pointer[0] - l.mouse[0]) * 0.08; l.mouse[1] += (pointer[1] - l.mouse[1]) * 0.08;
    const gl = l.gl, u = l.u;
    gl.uniform2f(u.res, w, h); gl.uniform1f(u.time, t); gl.uniform2f(u.mouse, l.mouse[0], l.mouse[1]); gl.uniform1f(u.int, l.intensity);
    if(!l.scene){
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      if(u.lights){
        const nowMs = performance.now();
        l.lights = l.lights.filter(L=> nowMs - L.t0 < L.life);
        const pos = new Float32Array(16), col = new Float32Array(12);
        l.lights.forEach((L, i)=>{
          const age = nowMs - L.t0, k = age < 60 ? age/60 : Math.pow(1 - (age - 60)/(L.life - 60), 2);
          pos.set([L.x, L.y, L.r, L.s * Math.max(0, k)], i*4); col.set(L.c, i*3);
        });
        gl.uniform4fv(u.lights, pos); gl.uniform3fv(u.lightCol, col);
      }
      if(u.cards){
        let n = 0;
        if(l.shadowSel && !l.noShadows && (frameNo % 3 === 0 || !l.shadowArr)){
          const arr = new Float32Array(48);
          const els = l.host.querySelectorAll(l.shadowSel);
          for(let i = 0; i < els.length && n < 12; i++){
            const c = els[i].getBoundingClientRect(); if(c.width < 4) continue;
            arr.set([(c.left - r.left)/r.width, (c.top - r.top)/r.height, c.width/r.width, c.height/r.height], n*4); n++;
          }
          l.shadowArr = arr; l.shadowN = n;
        }
        n = l.shadowN || 0;
        if(n && l.shadowArr) gl.uniform4fv(u.cards, l.shadowArr);
        gl.uniform1f(u.ncards, n);
      }
      if(u.wave){
        const W = l.waveState, age = W ? (performance.now() - W.t0)/W.life : 2;
        if(W && age < 1){ gl.uniform4f(u.wave, W.x, W.y, age, W.s); gl.uniform3f(u.waveCol, W.c[0], W.c[1], W.c[2]); }
        else { if(W) l.waveState = null; gl.uniform4f(u.wave, 0, 0, 0, 0); }
      }
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });
  if(layers.size) raf = requestAnimationFrame(loop);
}

function destroyAll(){ [...layers].forEach(destroy); }
// Move a live layer into a freshly re-rendered host (keeps its GL context: moving a canvas element
// doesn't reset it). Returns false if the layer is gone.
function reattach(layer, host, prepend){
  if(!layer || !layers.has(layer) || !host) return false;
  if(layer.host !== host){ if(layer.host && layer.host.classList) layer.host.classList.remove('has-shader'); layer.host = host; host.classList.add('has-shader'); }
  if(layer.cv.parentNode !== host){ if(prepend) host.insertBefore(layer.cv, host.firstChild); else host.appendChild(layer.cv); }
  if(!raf) raf = requestAnimationFrame(loop);
  return true;
}

const api = {mount, destroyAll, reattach, isSupported, MAP_KIND, _layers: layers};
if(root) root.BramblewoodShaders = api;
if(typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
