// 2026-10-23 (package HUB2, owner 11:11: "For all these upgrade costs and forge costs, put them in the master hub and let them be editable."):
// the one description of canonical/upgrade-costs.json's editable numbers. Used by the hub's Costs tab (inlined by tools/hub/build_hub.py),
// by the fold tool (tools/fold_upgrade_costs.js) and by tests/upgrade-costs-2026-10-23.js. Runs as a plain browser script (window.UpgradeCosts)
// and as a CommonJS module. A number is addressed by a path: "levelCostMult.rare", "forgeStepDust.3", "forgeTiers.2.gold",
// "prestige.gold.dust", "materiaUnit.dust", "energyUpgradeStep". The path is also the hub db document id (collection "upgradeCosts").
(function(root){
  'use strict';
  const RAR = {starter:'Base / Starter', common:'Common', uncommon:'Uncommon', rare:'Rare', veryrare:'Very Rare', superrare:'Super Rare', epic:'Epic', heroic:'Heroic', unique:'Unique', legendary:'Legendary', mythic:'Mythic', ancient:'Ancient', divine:'Divine', void:'Void', daemonic:'Daemonic', quest:'Quest', special:'Special', eventrare:'Event Rare', questunique:'Quest Unique', devlegendary:'Dev Legendary', eventlegendary:'Event Legendary', devancient:'Dev Ancient'};
  const rn = k=> RAR[k] || k;
  const GROUPS = [ // [id, title, what it does]
    ['road', 'Level road', 'Dust to level a Common card L to L+1 (the card\'s rarity multiplier applies on top); Leaves (gold) are two thirds of the Dust. Level 0 to 1 is one Materia Mote.'],
    ['rarity', 'Rarity multiplier', 'Every level step\'s cost is multiplied by this for the card\'s rarity (Common = 1).'],
    ['mods', 'Card kind multiplier', 'On top of the rarity: hero cards, event cards, quest / base cards.'],
    ['limit', 'Limit break', 'Level 10 to 11 costs this times the whole road to 10; each rarity also needs this many lifetime duplicates.'],
    ['dups', 'Duplicates as Forge credit', 'Feeding a spare copy banks 1 / this of the card\'s whole 1 to 10 cost (smaller = a spare is worth more).'],
    ['tiers', 'Forge tiers', 'What it costs to upgrade the Forge itself, and the map that unlocks each tier. Tier 1 is free.'],
    ['prestige', 'Prestige rings', 'Gold, Rainbow and Extended Art finishes for a maxed card.'],
    ['melt', 'Disenchanting', 'Magic Dust a plain spare copy melts into, by rarity (treatments multiply it).'],
    ['misc', 'Materia and energy', 'The Materia Unit, the bench price, the Maple Leaf price of an energy upgrade.']];
  const E = []; // {path, group, label, note, step}
  function build(t){
    E.length = 0;
    const add = (path, group, label, note, step)=> E.push({path, group, label, note: note || '', step: step || 1});
    (t.forgeStepDust || []).forEach((v, L)=>{ if(L >= 1) add('forgeStepDust.' + L, 'road', 'Level ' + L + ' to ' + (L + 1), 'Dust on a Common'); });
    Object.keys(t.levelCostMult || {}).forEach(k=> add('levelCostMult.' + k, 'rarity', rn(k), '×', 0.5));
    add('modifiers.hero', 'mods', 'Hero card', '×', 0.25); add('modifiers.event', 'mods', 'Event card', '×', 0.25); add('modifiers.questBase', 'mods', 'Quest and Base card', '×', 0.25);
    add('limitBreakCostMult', 'limit', 'Limit break cost', '× the road to 10', 0.5);
    Object.keys(t.limitBreakDups || {}).forEach(k=> add('limitBreakDups.' + k, 'limit', rn(k), 'lifetime duplicates'));
    Object.keys(t.duplicateDivisor || {}).forEach(k=> add('duplicateDivisor.' + k, 'dups', rn(k), '÷', 0.25));
    (t.forgeTiers || []).forEach(f=>{ if(f.gold == null) return; ['gold', 'dust', 'strange', 'map'].forEach(k=> add('forgeTiers.' + (f.tier - 1) + '.' + k, 'tiers', 'Tier ' + f.tier + ' ' + f.name + ': ' + ({gold:'Leaves (gold)', dust:'Dust', strange:'Strange Materia', map:'unlocks at Map'})[k])); });
    (t.prestige || []).forEach(p=> ['dust', 'gold'].forEach(k=> add('prestige.' + p.key + '.' + k, 'prestige', p.key[0].toUpperCase() + p.key.slice(1) + ' ring: ' + (k === 'dust' ? 'Dust' : 'Leaves (gold)'))));
    Object.keys(t.disenchantDust || {}).forEach(k=> add('disenchantDust.' + k, 'melt', rn(k), 'Dust'));
    add('materiaUnit.dust', 'misc', 'Materia Unit: Dust', 'a Common\'s whole road to 10, in Dust'); add('materiaUnit.gold', 'misc', 'Materia Unit: Leaves (gold)');
    add('moteDivisor', 'misc', 'Materia Mote = Unit ÷', 'the Level 0 to 1 step');
    add('materiaDustCost', 'misc', 'Materia bench: Dust per crystal'); add('energyUpgradeStep', 'misc', 'Energy upgrade: Leaves × number bought', '150, 300, 450 …');
    return E.slice();
  }
  // path -> [container, key]; null when the path does not exist
  function locate(t, path){
    const p = String(path).split('.'); let cur = t;
    for(let i = 0; i < p.length - 1; i++){
      if(Array.isArray(cur) && !/^\d+$/.test(p[i])){ cur = cur.find(x=> x && (x.key === p[i] || x.id === p[i])); }
      else if(cur && typeof cur === 'object') cur = cur[p[i]]; else return null;
      if(cur == null || typeof cur !== 'object') return null;
    }
    const last = p[p.length - 1];
    return cur && typeof cur === 'object' && typeof cur[last] === 'number' ? [cur, last] : null;
  }
  const get = (t, path)=>{ const l = locate(t, path); return l ? l[0][l[1]] : undefined; };
  function set(t, path, v){ const l = locate(t, path); if(!l) return false; l[0][l[1]] = v; return true; }
  const clone = o=> JSON.parse(JSON.stringify(o));
  function values(t){ const o = {}; build(t).forEach(e=> o[e.path] = get(t, e.path)); return o; }
  // edits: [{path, value}] (extra fields ignored). Returns {table, changed:[{path, from, to}], unknown:[…]}.
  function apply(t, edits){
    const out = clone(t), changed = [], unknown = [];
    (edits || []).forEach(e=>{ const v = Number(e && e.value);
      if(!e || typeof e.path !== 'string' || !isFinite(v) || v < 0){ unknown.push(JSON.stringify(e)); return; }
      const cur = get(out, e.path); if(cur === undefined){ unknown.push(e.path); return; }
      if(cur !== v){ changed.push({path: e.path, from: cur, to: v}); set(out, e.path, v); } });
    return {table: out, changed, unknown};
  }
  // The file layout: one short line per key, arrays of objects one entry a line.
  function format(o){
    return '{\n' + Object.entries(o).map(([k, v])=> ' ' + JSON.stringify(k) + ': ' + (Array.isArray(v) && v.length && typeof v[0] === 'object' ? '[\n' + v.map(x=> '  ' + JSON.stringify(x)).join(',\n') + '\n ]' : JSON.stringify(v))).join(',\n') + '\n}\n';
  }
  const api = {GROUPS, build, get, set, locate, values, apply, format, clone};
  if(typeof module !== 'undefined' && module.exports) module.exports = api; else root.UpgradeCosts = api;
})(typeof window !== 'undefined' ? window : this);
