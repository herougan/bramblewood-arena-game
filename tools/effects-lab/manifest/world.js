// 2026-11-13 (package UIFX2, owner 00:03: "season changes when moving from certain maps etc."): the world as a journey, the catalogue group
// "World (UIFX2)". Each play runs the game's own code (bramblewood-ui-world.js, BramblewoodWorld) on the Lab's map stage:
//   one entry per season: A the change into it from the season before it on the road, B its ambient while the map is open
//   the travel beat: A on to the next map (route and paw prints, into a new season), B back a map in the same season (route only), C into a side map (no route)
// In the game: renderConquestSubTab → BramblewoodWorld.arrive(map) on every map render (travel when the map changed).
(function(){
const R = FXLAB.register, W = ()=> window.BramblewoodWorld, AREA = 'World (UIFX2)';
const NAME = {spring:'Spring blossom', summer:'Summer haze', autumn:'Autumn leaves', winter:'First snow', desert:'Sand on the wind', ash:'Ash and ember glow', coast:'Tide line', deep:'Into the dark'};
const FROM = {spring:'coast', summer:'coast', autumn:'summer', winter:'coast', desert:'winter', ash:'desert', coast:'spring', deep:'autumn'};
const WHERE = {spring:'Map 2 → Map 1 (Thistlewood), Clovermead, The Aerie Vault', summer:'Map 3 → Map 4 (Sunken Hollow), the swamps, the savanna', autumn:'Map 5 → Map 6 (Sable Swampmire), Morel Hollow, Briar Maze, Redwood Deep, Long Grass',
  winter:'Map 10 → Map 11 (Eyrie Heights), Taiga, Tundra, the summits', desert:'Map 17 → Map 18 (The Glass Dunes), The Pale Desert', ash:'Map 18 → Map 19 (Ashen Spurn), Sundered Peak, the Foundry, the volcano',
  coast:'Map 1 → Map 2 (Pebble Beach), Gannet Cliffs, Kelp Mangroves, Coral Current', deep:'Map 7 → Map 8 (Caves & Alcoves), every dark map and dungeon'};
const on = (ctx, k, o)=> W().setSeason(k, Object.assign({host: ctx.map.layout, canvas: ctx.map.el}, o || {}));
const fresh = (ctx, k)=>{ const w = W(); if(!w) return null; w.stop(); on(ctx, k, {instant: true}); return w; };
const change = async (ctx, k)=>{ if(!fresh(ctx, FROM[k])) return; await ctx.wait(900); on(ctx, k, {dir: 'right'}); await ctx.wait(3400); W().stop(); };
const ambient = async (ctx, k)=>{ if(!fresh(ctx, k)) return; await ctx.wait(5000); W().stop(); };
Object.keys(NAME).forEach(k=> R({id: 'map-grand-uifx2-' + k, area: AREA, name: 'Season: ' + NAME[k], stage: 'map', trigger: 'moving to a map of this season from one of another',
  inGameHook: 'renderConquestSubTab → BramblewoodWorld.arrive → setSeason', note: WHERE[k] + '. Low effects / reduced motion: the vignette only, at once.', variants: [
    {key: 'A', label: 'UIFX2 · The change, from ' + FROM[k], play: ctx=> change(ctx, k)},
    {key: 'B', label: 'UIFX2 · Its ambient while the map is open', play: ctx=> ambient(ctx, k)}]}));
const trip = async (ctx, a, b, plan)=>{ const w = W() && fresh(ctx, W().seasonOf(a)); if(!w) return; await ctx.wait(700); w.travel(a, b, {host: ctx.map.layout, canvas: ctx.map.el, plan}); await ctx.wait(3000); w.stop(); };
R({id: 'map-grand-uifx2-travel', area: AREA, name: 'Travel between maps', stage: 'map', trigger: 'moving to another map (map list, the edge arrows, a swipe, a side map)',
  inGameHook: 'renderConquestSubTab → BramblewoodWorld.arrive → travel', note: 'Under 1.2 s; any tap, key or wheel finishes it at once and still goes through. No route while the map\'s title card is due (it is the arrival then).', variants: [
    {key: 'A', label: 'UIFX2 · On to the next map: a lit route and paw prints from the left, into autumn', play: ctx=> trip(ctx, 'mw', 'm8', {kind: 'road', dir: 'right'})},
    {key: 'B', label: 'UIFX2 · Back a map, same season: the route from the right only', play: ctx=> trip(ctx, 'm11', 'm3', {kind: 'road', dir: 'left'})},
    {key: 'C', label: 'UIFX2 · Into a side map: no route (the map zooms), winter to spring', play: ctx=> trip(ctx, 'm10', 'mv', {kind: 'zoom', dir: 'up'})}]});
})();
