// Package VFX3 (2026-11-28, standing VFX line in docs/action-items.md): Batch V lab registrations of the VFX3 looks (bramblewood-fx-v.js section 6,
// window.FX.V), key V3 (labels start "VFX3 ·"); each "Low" variant passes {level:'low'} (Effects Low). GIFs: docs/screens/vfx3/.
(function(){
const R = FXLAB.register, V = ()=> window.FX.V, foe = (ctx, i)=> ctx.board.foe[i == null ? 1 : i], mine = (ctx, i)=> ctx.board.mine[i == null ? 1 : i];
const LOW = {level:'low'}, after = (ctx, p, ms)=> Promise.resolve(p).then(()=> ctx.wait(ms || 250)), snd = (n, ...a)=> V().sound(n, ...a);
const two = (id, hook, hi, lo, fn, extra)=> R(Object.assign({id, stage:'board', inGameHook:hook, variants:[
  {key:'V3', label:'VFX3 · ' + hi, play:ctx=> after(ctx, fn(ctx, {}, true))},
  {key:'V3L', label:'VFX3 · Effects Low: ' + lo, play:ctx=> after(ctx, fn(ctx, LOW, false))}]}, extra || {}));
two('sk-keen-sense-sniff', 'onEvent: hit by a Keen Sense unit on a grounded target in the dark, fog, a blinding sandstorm or with Evasive (once a round an attacker); FX.B.keenSense steps aside in the dark (FX.V.owns)',
  'Scent wisps drift off the target to the striker, its nose twitches, a glint on the target (380 ms; sniff)', 'the nose and the glint',
  (ctx, o, cue)=>{ if(cue) snd('sniff'); return V().keenSniff(mine(ctx), foe(ctx), o); });
two('sk-siege-batter', 'onEvent: hit by a Siege unit on a Structure (siegeTone) or hitHQ {siege} on the bramble; FX.A.siegeRam / demolishCrack step aside (FX.V.owns)',
  'A battering ram drives in from the striker\'s side, splinters and bricks fly (420 ms; siegeTone): a Structure, then the bramble', 'the ram and the jolt',
  (ctx, o, cue)=>{ if(cue) snd('siegeTone'); return V().siegeBatter(foe(ctx), Object.assign({fromBelow:true}, o)).then(()=> ctx.wait(200)).then(()=>{ if(cue) snd('siegeTone'); return V().siegeBatter(ctx.board.castleFoe, Object.assign({fromBelow:true}, o)); }); });
two('sum-bulwark-palisade', 'onEvent: spawn {kind: bulwark}, each Log Wall 160 ms on (it rises from the floor, FX6; constructTone\'s three knocks)',
  'Three stakes knock up out of the floor on the hammer\'s beats, a lashing binds them (~570 ms; constructTone)', 'the three stakes',
  (ctx, o, cue)=>{ if(cue) try{ SoundKit.constructTone(); }catch(e){} return Promise.all([0, 2].map((i, k)=> ctx.wait(k*80).then(()=> V().bulwarkPalisade(mine(ctx, i), o)))); });
R({id:'sk-count-up', stage:'board', note:'VFX3: Lone Wolf (no event: its bonus read off the unit as the board draws), Throng and Plenty (statusFx stateSkill on); the state skill\'s icon and ring (en5StateVfx) step aside, its float stays.',
  inGameHook:'onEvent: statusFx stateSkill {on} throng / plenty; fxHook boardRendered / cardStatusShown: a Lone Wolf unit whose bonus rose', variants:
  [['loneWolf', 3, '🐺 Lone Wolf: three empty slots tick up, a wolf\'s head (countTick)'], ['throng', 10, '🐜🐜 Throng: ten units tick up, a crowd (countTick)'], ['plenty', 4, '🃏 Plenty: four cards tick up, a fan of cards (countTick)']]
  .map(([kind, n, label], i)=> ({key:'V3' + 'ABC'[i], label:'VFX3 · ' + label, play:ctx=>{ snd('countTick', n); return after(ctx, V().countUp(mine(ctx), {kind, n})); }}))
  .concat([{key:'V3L', label:'VFX3 · Effects Low: the sign only (wolf, crowd, cards)', play:ctx=> ['loneWolf', 'throng', 'plenty'].reduce((p, kind)=> p.then(()=> V().countUp(mine(ctx), {kind, n:4, level:'low'})).then(()=> ctx.wait(150)), Promise.resolve())}])});
R({id:'sum-undead-rise', stage:'board', inGameHook:'renderBoard → riseUpFx: an enemy undead card (subtype undead or species Undead) rising out of the ground as it is played (UIPOLISH1); the bone clatter is its cue',
  variants:[{key:'V3', label:'VFX3 · An undead card rises: bones fly in and lock under a skull, the eyes light (1 s at speed 1.6; boneClatter)', play:ctx=> after(ctx, V().skeletonRise(foe(ctx), {speed:1.6}), 300)},
    {key:'V3L', label:'VFX3 · Effects Low: the skull, its eyes and the dust (no bones)', play:ctx=> after(ctx, V().skeletonRise(foe(ctx), {speed:1.6, level:'low'}), 300)}]});
})();
