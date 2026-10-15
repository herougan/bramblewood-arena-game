// W2 lab registrations (2026-10-16): the designer's new skills (Venomous, Toxin, Weaken, Wilting, Bulldoze, Tangleweed, Strangle,
// Invincible, Invisible, Poison Gas, Absolute Zero, Spitfire, Trap, Slash & Burn, Nova, Crystallise, Cure, Taunt), the Cloudy field,
// the straight-drop normal death, the heal's ➕ and the reworked Molting / Bludgeon floats. Contract: docs/effects-lab-contract.md.
// The effect code is SkillFX.* in bramblewood-skillfx.js (the W2 section); the game plays it from w2SkillVfx in arena_app.js.
if(typeof window.floatDetachDepth === 'undefined') window.floatDetachDepth = 0;
(function(){
const R = FXLAB.register, S = ()=> window.SkillFX;
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe;
const css = ()=>{ try{ S().w2Css(); }catch(e){} };
const HOOK = 'w2SkillVfx (arena_app.js): ';
// A status look that lasts: the class on the board card, held for a moment.
// The lasting looks hang on the .board-card (as in a fight); a stage element may be its tile, so climb to the card.
const bc = el=> (el && el.closest && el.closest('.board-card')) || el;
const hold = (ctx, el, cls, ms)=>{ css(); const c = bc(el); c.classList.add(cls); return ctx.wait(ms || 1600).then(()=> c.classList.remove(cls)); };

R({id:'sk-venom', stage:'board', inGameHook:HOOK + 'statusFx venom → SkillFX.venomBite', variants:[
  {key:'A', label:'Fangs stab, venom drips down the card', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '🦂 +2☠', 'poison'); ctx.sound('poisonApply'); S().venomBite(t); return ctx.wait(1000); }}]});
R({id:'sk-toxin', stage:'board', inGameHook:HOOK + 'statusFx toxin → SkillFX.toxinMark; the card keeps a green inner glow (.is-toxic)', variants:[
  {key:'A', label:'A toxic ring closes in, ☣️ glows; the card stays tinged', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '☣️ +1', 'poison'); S().toxinMark(t); return ctx.wait(700).then(()=> hold(ctx, t, 'is-toxic', 1400)); }}]});
R({id:'st-toxin-tick', stage:'board', inGameHook:HOOK + 'toxinTick (round start)', variants:[
  {key:'A', label:'A green shake and "☣️ -N"', play:ctx=>{ const t = foe(ctx)[1]; css(); bc(t).classList.add('is-toxic'); ctx.float(t, '☣️ -2', 'poison-tick'); ctx.sound('bubble'); window.gsap.fromTo(t, {x:0}, {x:3, duration:.05, yoyo:true, repeat:5, clearProps:'transform'}); return ctx.wait(1100).then(()=> bc(t).classList.remove('is-toxic')); }}]});
R({id:'sk-weaken', stage:'board', inGameHook:HOOK + 'statusFx weaken → SkillFX.weakenDrain', variants:[
  {key:'A', label:'A ⚔ cracks and sinks out; the card dims', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '💔 −1⚔', 'debuff'); S().weakenDrain(t); return ctx.wait(900); }}]});
R({id:'sk-wilting', stage:'board', inGameHook:HOOK + 'statusFx wilting → SkillFX.wilt', variants:[
  {key:'A', label:'Petals drop; the card sags', play:ctx=>{ const t = mine(ctx)[1]; ctx.float(t, '🥀 −1⚔', 'debuff'); S().wilt(t); return ctx.wait(1100); }}]});
R({id:'sk-bulldoze', stage:'board', inGameHook:HOOK + 'statusFx bulldoze → SkillFX.bulldozeShove', variants:[
  {key:'A', label:'Shoved back a step, dust, "+1 Wait"', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '🚜 ⏪ +1 Wait', 'debuff wait-push'); ctx.sound('swipeTone'); S().bulldozeShove(t, {fromAbove:true}); return ctx.wait(900); }}]});
R({id:'sk-bind', stage:'board', inGameHook:HOOK + 'statusFx bound → SkillFX.vineBind; then the .is-bound vines stay while it is Bound', variants:[
  {key:'A', label:'Tangleweed: vines whip round, then hold', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '🪢 Bound', 'debuff'); S().vineBind(t); return ctx.wait(900).then(()=> hold(ctx, t, 'is-bound', 1500)); }},
  {key:'B', label:'Strangle: thicker vines, then the squeeze', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '🪢 Strangled', 'debuff'); S().vineBind(t, {strangle:true}); css(); bc(t).classList.add('is-bound');
    return ctx.wait(1100).then(()=>{ ctx.float(t, '🪢 -2', 'dmg'); S().squeeze(t); return ctx.wait(900); }).then(()=> bc(t).classList.remove('is-bound')); }}]});
R({id:'sk-invincible', stage:'board', inGameHook:HOOK + 'a 0-damage hit on an Invincible unit → SkillFX.invincibleBlock; .is-invincible gold aura while it lasts', variants:[
  {key:'A', label:'Gold aura; a blow bounces off', play:ctx=>{ const t = mine(ctx)[1]; css(); bc(t).classList.add('is-invincible'); return ctx.wait(500).then(()=>{ ctx.float(t, '🌟 Invincible', 'quick'); S().invincibleBlock(t); return ctx.wait(1200); }).then(()=> bc(t).classList.remove('is-invincible')); }}]});
R({id:'sk-invisible', stage:'board', inGameHook:HOOK + '.is-invisible while it lasts; statusEnd invisible {attacked} → SkillFX.unveil', variants:[
  {key:'A', label:'Faint and shimmering, then it attacks and shows itself', play:ctx=>{ const t = mine(ctx)[1]; css(); bc(t).classList.add('is-invisible'); ctx.float(foe(ctx)[1], '🫥 Unseen', 'quick');
    return ctx.wait(1400).then(()=>{ bc(t).classList.remove('is-invisible'); S().unveil(t); return ctx.wait(700); }); }}]});
R({id:'sk-poison-gas', stage:'board', inGameHook:HOOK + 'poisonGas (on arrival) → SkillFX.gasCloud', variants:[
  {key:'A', label:'Green clouds roll over every enemy unit', play:ctx=>{ const fs = foe(ctx); fs.forEach(el=> ctx.float(el, '+2☠', 'poison')); ctx.sound('poisonApply'); S().gasCloud(fs); return ctx.wait(1300); }}]});
R({id:'sk-absolute-zero', stage:'board', inGameHook:HOOK + 'absoluteZero (on arrival) → SkillFX.absoluteZero; each unit then gets the usual Frozen look', variants:[
  {key:'A', label:'A white-blue flash, frost blooms on every enemy unit', play:ctx=>{ ctx.sound('iceShatter'); S().absoluteZero(ctx.board.el, foe(ctx)); return ctx.wait(1300); }}]});
R({id:'sk-spitfire', stage:'board', inGameHook:'ninthPassVfx: bolt {element fire, key spitfire} → SkillFX.boltGlob; the splash is an ordinary hit', variants:[
  {key:'A', label:'A fire glob at a random enemy', play:ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[Math.floor(Math.random()*3)]; if(S().boltGlob) S().boltGlob(a, t, {element:'fire', flight:600}); return ctx.wait(700).then(()=>{ ctx.float(t, '-2', 'heat'); return ctx.wait(700); }); }}]});
const fakeSlot = (ctx, kind)=>{ const el = bc(foe(ctx)[2]); css(); const t = el.querySelector('.card-tile'); if(t) t.style.visibility = 'hidden';
  el.classList.add('empty-slot', 'w2-hazard'); if(kind === 'scorch') el.classList.add('w2-scorch');
  const m = document.createElement('span'); m.className = 'w2-hazard-mark ' + kind; m.textContent = kind === 'scorch' ? '🔥 3' : '🪤 5'; el.appendChild(m); return el; };
R({id:'sk-trap-set', stage:'board', inGameHook:HOOK + 'hazardSet → SkillFX.trapSet on the empty slot; the slot then shows its mark (w2HazardMark)', variants:[
  {key:'A', label:'Trap: a 🪤 drops onto the empty slot', play:ctx=>{ const el = fakeSlot(ctx, 'trap'); S().trapSet(el, {kind:'trap'}); return ctx.wait(1500); }},
  {key:'B', label:'Slash & Burn: the slot catches fire', play:ctx=>{ const el = fakeSlot(ctx, 'scorch'); S().trapSet(el, {kind:'scorch'}); return ctx.wait(1500); }}]});
R({id:'sk-trap-snap', stage:'board', inGameHook:HOOK + 'hazardSprung → SkillFX.trapSnap on the card just played there', variants:[
  {key:'A', label:'Trap: jaws snap shut', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '🪤 -5', 'dmg'); ctx.sound('bite'); S().trapSnap(t, {kind:'trap'}); return ctx.wait(900); }},
  {key:'B', label:'Burning ground flares under it', play:ctx=>{ const t = foe(ctx)[1]; ctx.float(t, '🔥 -3', 'dmg'); S().trapSnap(t, {kind:'scorch'}); return ctx.wait(900); }}]});
R({id:'sk-nova', stage:'board', inGameHook:HOOK + 'nova (on death) → SkillFX.nova; each hit is an ordinary magic hit', variants:[
  {key:'A', label:'A violet ring bursts; orbs strike every enemy unit', play:ctx=>{ const fs = foe(ctx); S().nova(mine(ctx)[1], fs, {onEachImpact:el=> ctx.float(el, '-3', '')}); return ctx.wait(1200); }}]});
R({id:'sk-crystallise', stage:'board', inGameHook:HOOK + 'spawn {kind crystal} → SkillFX.crystalForm; the crystal keeps the .is-crystal tint', variants:[
  {key:'A', label:'Shards gather and the crystal forms', play:ctx=>{ const t = mine(ctx)[1]; css(); bc(t).classList.add('is-crystal'); S().crystalForm(t); return ctx.wait(1500).then(()=> bc(t).classList.remove('is-crystal')); }}]});
R({id:'sk-cure', stage:'board', inGameHook:HOOK + 'statusFx cure → SkillFX.cure', variants:[
  {key:'A', label:'A 💊 pops, sparkles lift the sickness', play:ctx=>{ const t = mine(ctx)[0]; ctx.float(t, '💊 Cured 2', 'heal'); ctx.sound('cleanseTone'); S().cure(t); return ctx.wait(1000); }}]});
R({id:'sk-taunt', stage:'board', inGameHook:HOOK + 'statusFx taunted → SkillFX.tauntCall', variants:[
  {key:'A', label:'Gold calls ring out; the attacker turns to it', play:ctx=>{ const t = mine(ctx)[1]; ctx.float(t, '📢 Taunt!', 'quick'); S().tauntCall(t, foe(ctx)[0]); return ctx.wait(900); }}]});
R({id:'field-cloudy', stage:'board', inGameHook:'syncCloudFx (arena_app.js, from syncNightVeil): SkillFX.cloudShadows while rules.cloudy', note:'The shadows drift slowly; give it a few seconds.', variants:[
  {key:'A', label:'Soft cloud shadows drift over the board', play:ctx=>{ S().cloudShadows(ctx.board.el, true); return ctx.wait(5000).then(()=> S().cloudShadows(ctx.board.el, false)); }}]});
// Changed looks (2026-10-16): the normal death drops straight down (death-fall in c.js plays the live fallDeathVfx, so it shows
// the new drop); the heal shows ➕ (user: "The heal animation should include the + emoji."); Molting / Bludgeon say what they do now.
R({id:'sk-heal-generic', stage:'board', variants:[
  {key:'E', label:'2026-10-16: "➕N" and rising ➕ (SkillFX.healPlus)', play:ctx=>{ const t = mine(ctx)[1]; ctx.float(t, '➕3', 'heal'); ctx.sound('healTone'); S().healPlus(t); return ctx.wait(900); }}]});
R({id:'sk-shed', stage:'board', variants:[
  {key:'C', label:'Molting (2026-10-16): "🦀 +N/+N · ⏪ +1 Wait"', play:ctx=>{ const el = mine(ctx)[1]; ctx.float(el, '🦀 +1/+1 · ⏪ +1 Wait', 'heal'); return window.FX && FX.A && FX.A.skinShed ? FX.A.skinShed(el, {molt:true}) : ctx.wait(900); }}]});
R({id:'sk-bludgeon', stage:'board', variants:[
  {key:'D', label:'2026-10-16: −1 Attack and any skill broken ("🔨 −1⚔ · Thorns broken")', play:ctx=>{ const el = foe(ctx)[0]; ctx.float(el, '🔨 −1⚔ · Thorns broken', 'debuff'); return window.FX && FX.A && FX.A.bludgeonBreak ? FX.A.bludgeonBreak(el, {broke:'thorns'}) : ctx.wait(900); }}]});
})();
