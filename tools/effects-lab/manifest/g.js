// Batch G lab registrations (2026-10-15): small effects added after batches A–F, one file so they don't touch another batch's.
// Contract: docs/effects-lab-contract.md. The effect code lives where the game plays it (named per entry below).
(function(){
const R = FXLAB.register, S = ()=> window.SkillFX;
const mine = ctx=> ctx.board.mine, foe = ctx=> ctx.board.foe;
// Bloodlust N (2026-10-15, user: "New Skill: Bloodlust - ability idk, but I assume when it draws blood, it gets stronger."): when its
// attack lands on a Bleeding enemy (or makes it bleed) it gains +N Attack for the fight, up to +3N. SkillFX.bloodlustPulse
// (bramblewood-skillfx.js), played by ninthPassVfx in arena_app.js on statusFx 'bloodlust'.
R({id:'sk-bloodlust', stage:'board', inGameHook:'ninthPassVfx (arena_app.js): statusFx bloodlust → SkillFX.bloodlustPulse', note:'Low effects and up: it is the only cue that the Attack went up.',
  variants:[
    {key:'A', label:'A red heartbeat: two pulses and a red flush', play:ctx=>{ const a = mine(ctx)[1], t = foe(ctx)[1]; ctx.float(t, '-3', ''); return ctx.wait(250).then(()=>{ ctx.float(a, '🩸 Bloodlust +1⚔', 'debuff'); ctx.sound('bleedTick'); S().bloodlustPulse(a); return ctx.wait(1200); }); }},
    {key:'B', label:'At its cap (+3N): one deeper throb', play:ctx=>{ const a = mine(ctx)[1]; ctx.float(a, '🩸 Bloodlust +1⚔', 'debuff'); ctx.sound('bleedTick'); S().bloodlustPulse(a, {full:true}); return ctx.wait(1100); }},
  ]});
})();
