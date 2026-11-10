// 2026-11-11 (package SKIR1): the card kinds the owner's mix rule names (00:16: "No stone until Map 21+. Focus on lumber. Good mix of lumber
// cards, no lumber cards, wait/nowait cards, lumber generators and normal animals"), read the way THEME8's tools/theme8/deckmix_2026_11_11.py
// reads them (one rule, two languages: keep the two in step). Used by tools/skir1/* and tests/skir1-2026-11-11.js.
'use strict';
const LUMBER_KEYS = ['milling', 'felling', 'driftwood', 'scavenge', 'salvage', 'coppice', 'windfall'];
const STONE_KEYS = ['stonecutter', 'quarry'];
// minor skills never count (owner DES1-2): a card with only these is a plain animal
const MINOR = new Set(['flying', 'diurnal', 'nocturnal', 'crepuscular', 'crepuscularDay', 'crepuscularNight', 'tide', 'salt', 'heat', 'frost', 'resist', 'swimmer', 'hatchling']);
const STATUS_KEYS = new Set(['poison', 'greaterPoison', 'bleed', 'daunt', 'weaken', 'wither', 'decay', 'freeze', 'iceArrow', 'frostbite', 'stunOnHit', 'confuse',
  'web', 'strangle', 'tangle', 'corrode', 'shock', 'exploit', 'sleep', 'paralyze', 'brittle', 'blind', 'expose', 'rupture', 'hemorrhage']);
const on = v => !(v == null || v === false || v === 0);
function lumberGen(c) {
  const e = (c && c.effects) || {};
  if (LUMBER_KEYS.some(k => k in e) && !(e.felling && typeof e.felling === 'object' && ['metal', 'stone'].includes(e.felling.res))) return true;
  if (e.tribeDelivery) return true;
  if (on(e.delivery)) { const res = (typeof e.delivery === 'object' && e.delivery.res) || e.deliveryRes || 'lumber'; if (String(res).toLowerCase().startsWith('lumber')) return true; }
  return (e.triggers || []).some(t => t && t.do === 'gain' && String(t.resource || 'lumber').toLowerCase() === 'lumber');
}
function stone(c) {
  if (!c) return false;
  if (c.stoneCost || c.metalCost || c.uraniumCost) return true;
  const e = c.effects || {};
  if (STONE_KEYS.some(k => k in e)) return true;
  if (e.delivery && typeof e.delivery === 'object' && ['stone', 'metal'].includes(String(e.delivery.res || '').toLowerCase())) return true;
  return (e.triggers || []).some(t => t && (['stone', 'metal'].includes(String(t.resource || '').toLowerCase()) || (t.pay && 'stone' in t.pay)));
}
function skills(c) {
  const out = [], e = (c && c.effects) || {};
  Object.keys(e).forEach(k => { if (on(e[k]) && !MINOR.has(k)) out.push(k); });
  Object.values((c && c.levelSkills) || {}).forEach(sk => Object.keys(sk || {}).forEach(k => { if (!MINOR.has(k) && !out.includes(k)) out.push(k); }));
  return out;
}
const plain = c => !skills(c).length;
const status = c => skills(c).some(k => STATUS_KEYS.has(k));
// the kinds of one card: cost1 (costs Lumber) / cost0, wait1 / wait0, lumber (makes Lumber), plain, status, stone
function kinds(c) { return { cost1: (c.cost || 0) >= 1, cost0: !((c.cost || 0) >= 1), wait1: (c.wait || 0) >= 1, wait0: !((c.wait || 0) >= 1), lumber: lumberGen(c), plain: plain(c), status: status(c), stone: stone(c) }; }
const MIX_KINDS = ['cost1', 'cost0', 'wait1', 'wait0', 'lumber', 'plain'];
// a map's skirmishes together: the different cards of each kind across every deck (D: id -> card)
function mixOf(D, ids) { const out = {}; MIX_KINDS.concat(['status', 'stone']).forEach(k => { out[k] = []; }); ids.forEach(id => { const c = D[id]; if (!c) return; const k = kinds(c); Object.keys(out).forEach(x => { if (k[x]) out[x].push(id); }); }); return out; }
module.exports = { lumberGen, stone, skills, plain, status, kinds, mixOf, MIX_KINDS, STATUS_KEYS, MINOR };
