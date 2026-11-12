// Package UIFX3 "Story" (2026-11-13, owner 00:03: "immersion with dialogue"): the group "Story (UIFX3)" (area of the inventory rows story-*).
// Every variant plays the game's own code, bramblewood-ui-story.js (window.StoryUI): StoryUI.demo builds a stand-in dialogue dock in the stage
// with the game's markup (.dialogue-dock / .dlg-line) and runs each line through StoryUI.line, exactly as playDialogue does; the scene layer
// (vignette, letterbox, ambience) sits inside the stage. Lab speakers use emoji portraits (the game uses card and NPC art).
//   story-scene       two speakers, a shout, a whisper, a boss intro with letterbox (A: a computer's two-line dock, B: a phone's one line)
//   story-arrive      the portrait rises and settles, the line slides in from its side, lit and dim, the nameplate in the people's colour
//   story-typewriter  letters at their own delays, pauses at punctuation, *marked* and capitalised stress, a tap completes the line
//   story-react       shout, laugh, whisper, question
//   story-letterbox   boss (crimson) and story (gold) framing
//   story-ambient     fireflies, rain, embers
//   story-bark        the battlefield bubble's squash-pop and tail wiggle
(function(){
const R = FXLAB.register, W = window, ok = ()=> W.StoryUI && typeof W.StoryUI.demo === 'function';
const SPK = {
  shieldback:{who:'shieldback', name:'High Marshal Shieldback', icon:'🦦', people:'legion'},
  swiftpaw:{who:'swiftpaw', name:'Captain Swiftpaw', icon:'🦦', people:'legion'},
  aurelia:{who:'aurelia', name:'Matriarch Aurelia', icon:'🐦', people:'sun'},
  vesper:{who:'vesper', name:'Warlord Vesper', icon:'🐦', people:'tribes'},
  whisper:{who:'whisper', name:'Whisper-of-Ash', icon:'🐦', people:'void'},
  traveller:{who:'traveller', name:'The Wandering Traveller', icon:'🧳', people:'road'},
  golem:{who:'golem', name:'Cobble, the Forge golem', icon:'🗿', people:'stone'},
};
const L = (k, text, mood)=> Object.assign({}, SPK[k], {text}, mood ? {mood} : {});
const play = (ctx, script, opts)=> ok() ? W.StoryUI.demo(ctx.root, script, Object.assign({mul:.75, hold:650, tail:400}, opts || {})) : ctx.wait(800);
const BOSS = {scene:'boss', lines:[
  L('shieldback', 'Eyes up. The Thornback Boar holds the bridge.'),
  L('swiftpaw', 'HA! Then we knock it *off* the bridge!'),
  L('whisper', '…Or we wait. It tires before the third charge.', 'whisper'),
  L('shieldback', 'Third charge it is. Shields up!')]};
R({id:'story-scene', stage:'screen', inGameHook:'playDialogue → StoryUI.line(b, line, {id, sp, script}) … StoryUI.end(id)', note:'UIFX3: the brief\'s demo. Bars and a red vignette close in, the second speaker takes the right side, the shout jolts the portrait as the ! is typed, the whisper dims it.', variants:[
  {key:'A', label:'A computer\'s dock (two lines): boss intro with letterbox, two speakers, a shout, a whisper', play:ctx=> play(ctx, BOSS, {maxLines:2})},
  {key:'B', label:'A phone\'s dock (one line): the other speaker waits, dimmed, at the far corner', play:ctx=> play(ctx, BOSS, {maxLines:1})}]});
R({id:'story-arrive', stage:'screen', inGameHook:'playDialogue → StoryUI.line (speaker change) + SoundKit.storyArrive', note:'UIFX3: each people has its plate colour (Legion oxblood, Sunthroat amber, Crimson Wing, road-folk indigo, Forge stone).', variants:[
  {key:'A', label:'Otter and hummingbird: left and right, lit and dim', play:ctx=> play(ctx, {lines:[L('shieldback', 'Even the Legion cannot fell that thing alone.'), L('aurelia', 'Then the Tribes will sing beside you, for an afternoon.')]}, {maxLines:2})},
  {key:'B', label:'Three peoples in turn: road-folk, Crimson Wing, the Forge golem', play:ctx=> play(ctx, {lines:[L('traveller', 'Packs, trinkets, the odd rumour.'), L('vesper', 'An otter with a deck. How quaint.'), L('golem', 'Cobble. I keep the fire.')]}, {maxLines:2, hold:450})}]});
R({id:'story-typewriter', stage:'screen', inGameHook:'playDialogue → StoryUI.line; a tap on the line → StoryUI.complete(), the next tap → dialogueAdvance', note:'UIFX3: the box has its final size from the first frame; one babble syllable a word in the speaker\'s voice.', variants:[
  {key:'A', label:'Medium speed: pauses after commas and full stops, Dust and Leaves stressed', play:ctx=> play(ctx, {lines:[L('golem', 'Feed a card Dust and Leaves, and I temper it. One level at a time.')]}, {mul:1, maxLines:2, hold:900})},
  {key:'B', label:'Slow speed (the NPC dialogue setting): the same line at 1.5x', play:ctx=> play(ctx, {lines:[L('golem', 'Feed a card Dust and Leaves, and I temper it. One level at a time.')]}, {mul:1.5, maxLines:2, hold:700})},
  {key:'C', label:'A tap completes the line at once (then the next tap would move on)', play:async ctx=>{ if(!ok()) return ctx.wait(500); const p = play(ctx, {lines:[L('traveller', 'Only that the Crown didn\'t fly away on its own. But you didn\'t hear it from me.', 'whisper')]}, {mul:1, maxLines:2, hold:1600}); await ctx.wait(700); W.StoryUI.complete(); return p; }}]});
R({id:'story-react', stage:'screen', inGameHook:'playDialogue → StoryUI.line (Effects Medium and up)', note:'UIFX3: the mood comes from line.mood, or from the line itself (!, ?, …, HA, CAPITALS).', variants:[
  {key:'A', label:'Shout: the portrait jolts and shakes as the ! is typed, surprise lines', play:ctx=> play(ctx, {lines:[L('swiftpaw', 'HELLO! Anyone down there?')]}, {maxLines:2, hold:1000})},
  {key:'B', label:'Laugh: the portrait bobs', play:ctx=> play(ctx, {lines:[L('traveller', 'Competition! Wonderful. We\'ll share a counter.', 'laugh')]}, {maxLines:2, hold:900})},
  {key:'C', label:'Whisper: italic, softer ink, the portrait dims and shrinks', play:ctx=> play(ctx, {lines:[L('whisper', '…Don\'t tell the Marshal you saw me.', 'whisper')]}, {maxLines:2, hold:1000})},
  {key:'D', label:'Question: a head tilt at the end', play:ctx=> play(ctx, {lines:[L('aurelia', 'Will you stand with your enemies, if only for an afternoon?')]}, {maxLines:2, hold:1200})}]});
R({id:'story-letterbox', stage:'screen', inGameHook:'playDialogue → StoryUI.line (first line of a scene:\'boss\' / \'story\' script) + SoundKit.storyLetterbox', note:'UIFX3: in a fight only two glowing edge lines and the vignette, gone after the first line; a story scene also blurs the screen\'s edges at High outside fights.', variants:[
  {key:'A', label:'Boss: crimson edge lines, a red vignette that pulses once', play:ctx=> play(ctx, {scene:'boss', lines:[L('shieldback', 'That one doesn\'t surrender. Don\'t wait for it to.'), L('swiftpaw', 'Then we make it a short conversation.')]}, {maxLines:2, hold:500})},
  {key:'B', label:'Story: gold edge lines, a warm vignette, the soft blur behind', play:ctx=> play(ctx, {scene:'story', lines:[L('traveller', 'Eight scales. Lay them side by side and look: one hide, one dragon.'), L('traveller', 'And still warm.')]}, {maxLines:2, hold:500})}]});
R({id:'story-ambient', stage:'screen', inGameHook:'playDialogue → StoryUI.line (a script\'s ambient mark; Effects Medium and up, never in a fight)', note:'UIFX3: CSS transform and opacity only, 11 to 12 particles or two rain layers.', variants:[
  {key:'A', label:'Fireflies (the old well, the glow pool, the bog wisp)', play:ctx=> play(ctx, {ambient:'fireflies', lines:[L('traveller', 'Wells are patient. So are the friends you make on both sides of the river.')]}, {maxLines:2, hold:2600})},
  {key:'B', label:'Rain for a sad beat (the ash cairn)', play:ctx=> play(ctx, {ambient:'rain', lines:[L('aurelia', 'A cairn of black stones. Each one, a climber who didn\'t come down.'), L('shieldback', 'Add a stone for them. Then keep climbing.')]}, {maxLines:2, hold:900})},
  {key:'C', label:'Embers (the Scale Trail finale, with the story framing)', play:ctx=> play(ctx, {scene:'story', ambient:'embers', lines:[L('traveller', 'The dragons never left. They sleep under the mountains.')]}, {maxLines:2, hold:2600})}]});
R({id:'story-bark', stage:'board', inGameHook:'showSpeechBubble → StoryUI.bubble(b, holdS)', note:'UIFX3: the pop pivots on the tail tip, so the bubble never dips over the card\'s numbers.', variants:[
  {key:'A', label:'A bark: squash-pop from the tail, the tail wiggles, a clean lift and fade', play:ctx=>{ const t = ctx.board.foe[1]; if(typeof W.showSpeechBubble === 'function') W.showSpeechBubble(t, 'You smell like supper.', 'is-bark', {hold:1.1});
    else if(W.StoryUI){ const b = document.createElement('div'); b.className = 'speech-bubble is-bark'; b.textContent = 'You smell like supper.'; document.body.appendChild(b); const r = t.getBoundingClientRect(); b.style.left = Math.round(r.left + r.width/2 - b.offsetWidth/2) + 'px'; b.style.top = Math.round(r.top - b.offsetHeight - 6) + 'px'; W.StoryUI.bubble(b, 1.1); }
    return ctx.wait(2000); }},
  {key:'B', label:'An emote: a rounder pop', play:ctx=>{ const t = ctx.board.mine[1]; if(W.StoryUI){ const b = document.createElement('div'); b.className = 'speech-bubble is-emote'; b.textContent = '😤'; document.body.appendChild(b); const r = t.getBoundingClientRect(); b.style.left = Math.round(r.left + r.width/2 - b.offsetWidth/2) + 'px'; b.style.top = Math.round(r.top - b.offsetHeight - 6) + 'px'; W.StoryUI.bubble(b, 1); } return ctx.wait(1900); }}]});
})();
