#!/usr/bin/env node
// 2026-10-19 (package EQ, owner 21:36): equipment on the slots (a lone piece in an empty slot, a piece under a unit, a unit onto a lone piece,
// one equipping round, the piece stays in the slot when its unit dies), Weapon Master N (arrows +N, equipped allies +1/+1), Pry N, the
// five slot hazards (Ice, Lava, Poison, Gas, Rubble), the shared slotEntries scan, the CPU's equipment and hazard plays, the new cards
// (budget notes, Easter egg, Creeper's art) and the page's hooks (TX keys, the board marks, the drop targets).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js'), E = H.Engine;
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'tq-unit': {id:'tq-unit', name:'TQ Unit', attack:2, health:20, wait:0, cost:0, effects:{}},
  'tq-big': {id:'tq-big', name:'TQ Big', attack:6, health:30, wait:0, cost:0, effects:{}},
  'tq-dummy': {id:'tq-dummy', name:'TQ Dummy', attack:0, health:60, wait:9, cost:0, effects:{}},
  'tq-armored': {id:'tq-armored', name:'TQ Armored', attack:0, health:60, wait:9, cost:0, effects:{armor:3}},
  'tq-flyer': {id:'tq-flyer', name:'TQ Flyer', attack:1, health:20, wait:9, cost:0, effects:{flying:true}},
  'tq-wall': {id:'tq-wall', name:'TQ Wall', attack:0, health:30, wait:0, cost:0, archetypes:['Structure'], effects:{}},
  'tq-archer': {id:'tq-archer', name:'TQ Archer', attack:0, health:30, wait:0, cost:0, effects:{arrow:2}},
  'tq-armory': {id:'tq-armory', name:'TQ Armory', attack:0, health:30, wait:9, cost:0, archetypes:['Structure'], effects:{weaponMaster:1}},
  'tq-sword': {id:'tq-sword', name:'TQ Sword', cardType:'equipment', attack:3, health:2, wait:0, cost:1, effects:{}, equip:{grant:{reach:true}}},
  'tq-glass': {id:'tq-glass', name:'TQ Glass', cardType:'equipment', attack:1, health:0, wait:0, cost:0, effects:{}, equip:{grant:{}, breaks:true}},
});
['crowbar', 'frost-slick', 'magma-vent', 'bog-seep', 'miasma', 'rockfall', 'armory', 'bucketknee-wolf'].forEach(id=> ok(!!base[id], `the card ${id} exists`));
const mk = seed=>{ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}; return {e, P}; };
const fresh = pl=>{ pl.playedThisTurn = false; pl.playsTurn = -99; pl.lumber = 9; pl.discardUsedThisTurn = false; };
let U = 50000; const give = (pl, defId)=>{ const uid = ++U; pl.hand.push({uid, defId}); return uid; };
const all = pl=> H.boardCards(pl).filter(c=> c && !c.gap);
const at = (pl, sl)=> all(pl).find(c=> c.hp > 0 && c.slot === sl);
// move a unit to another slot by hand (as a push would): out of its row array and into the right one
const moveTo = (e, pl, c, sl)=>{ ['left', 'center', 'right'].forEach(k=>{ const i = pl.row[k].indexOf(c); if(i >= 0) pl.row[k].splice(i, 1); }); c.slot = sl; (sl === 0 ? pl.row.center : sl < 0 ? pl.row.left : pl.row.right).push(c); e.syncSlots(pl); };
const spawn = (e, P, pid, id, sl)=>{ const ok1 = e.debugSpawnCard(P, so, pid, id, sl, {}, []); return ok1 ? all(P[pid]).filter(c=> c.defId === id || (defs[c.defId] && defs[c.defId].derivedFrom === id)).pop() : null; };

// ---- 1. Equipment on the slots
{ const {e, P} = mk(1); fresh(P[1]);
  const sw = give(P[1], 'tq-sword');
  ok(e.canPlay(P[1], 'tq-sword', sw), '1. an equipment card is playable when a slot is open (2026-10-19: it goes onto the board now)');
  const ev = []; ok(e.placeCard(P, so, 1, sw, 0, {}, ev), '1. an equipment card goes into an empty legal slot');
  ok(P[1].eqSlots && P[1].eqSlots[0] && P[1].eqSlots[0].defId === 'tq-sword' && !all(P[1]).length, '1. it lies there alone (pl.eqSlots), no unit on the board');
  ok(P[1].lumber === 8 && P[1].playedThisTurn && ev.some(x=> x.type === 'equipLaid'), '1. it pays its Lumber, uses the play, logs equipLaid');
  ok(e.legalSlots(P[1]).join() === '0', `1. a lone piece doesn't open the slots beside it (legal ${e.legalSlots(P[1]).join()})`);
  // the enemy's swing facing it goes past to the bramble
  const foe = spawn(e, P, 2, 'tq-big', 0); foe.wait = 0; const hq0 = P[1].hq.hp;
  e.resolveCombat(P, so, {}, [], 2); ok(P[1].hq.hp < hq0, `1. a swing facing a lone piece hits the bramble (${hq0} -> ${P[1].hq.hp})`);
  ok(P[1].eqSlots[0], '1. the lone piece is untouched');
  // a unit played onto the lone piece picks it up, equipping for a round
  fresh(P[1]); const u = give(P[1], 'tq-unit'); const ev2 = [];
  ok(e.placeCard(P, so, 1, u, 0, {}, ev2), '1. a unit can be played onto a slot holding a lone piece');
  const c = at(P[1], 0); ok(c && c.equipment === 'tq-sword' && c.equipping === 1 && !P[1].eqSlots[0], '1. it picks the piece up and is equipping');
  ok(ev2.some(x=> x.type === 'equip' && x.how === 'pickup' && x.pending), '1. the equip event (pickup, pending)');
  ok(c.atk === 2 && c.maxHp === 20, `1. no bonus while equipping (${c.atk}/${c.maxHp})`);
  const ev3 = []; e.roundStart(P, 2, so, {}, ev3);
  ok(c.atk === 5 && c.maxHp === 22 && (defs[c.defId].effects || {}).reach && c.equipOn, `1. after a round: +3/+2 and Reach (${c.atk}/${c.maxHp})`);
  ok(ev3.some(x=> x.type === 'equipReady' && x.equipDefId === 'tq-sword'), '1. equipReady is logged');
  // it dies: the piece stays in the slot for the next unit
  c.hp = 0; const ev4 = []; e.removeDeadCards(P, so, {}, {}, ev4);
  ok(P[1].eqSlots[0] && P[1].eqSlots[0].defId === 'tq-sword' && !P[1].graveyard.some(g=> g.defId === 'tq-sword'), '1. its unit died: the piece stays in the slot');
  ok(ev4.some(x=> x.type === 'equipDrop'), '1. equipDrop is logged');
  fresh(P[1]); const u2 = give(P[1], 'tq-unit'); e.placeCard(P, so, 1, u2, 0, {}, []);
  const c2 = at(P[1], 0); ok(c2 && c2.equipment === 'tq-sword' && c2.atk === 2, '1. the next unit in that slot picks it up (and waits its round)'); }
{ const {e, P} = mk(2); fresh(P[1]);
  const c = spawn(e, P, 1, 'tq-unit', 0), sw = give(P[1], 'tq-sword');
  ok(e.equipSlotsFor(P[1]).includes(0) && e.equipSlotsFor(P[1]).includes(1), `1b. the "+" targets for a piece: free slots and your carriers' slots (${e.equipSlotsFor(P[1]).join()})`);
  ok(e.placeCard(P, so, 1, sw, 0, {}, []) && c.equipment === 'tq-sword' && c.equipping === 1, '1b. played onto a slot holding your unit: it goes under the unit');
  fresh(P[1]); const g2 = give(P[1], 'tq-glass'); ok(!e.placeCard(P, so, 1, g2, 0, {}, []), '1b. one piece per unit');
  // the old drag-onto-a-unit path (equip) works the same way
  const c3 = spawn(e, P, 1, 'tq-unit', 1); fresh(P[1]);
  ok(e.equip(P, so, 1, c3.uid, g2, {}, []) && c3.equipping === 1 && c3.atk === 2, '1b. equip(): the drag onto a unit, equipping too');
  e.roundStart(P, 2, so, {}, []); ok(c3.atk === 3, '1b. ... and the bonus a round later');
  c3.hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  ok(!(P[1].eqSlots || {})[1] && P[1].graveyard.some(g=> g.defId === 'tq-glass'), '1b. equip.breaks: the piece goes to the graveyard with its unit');
  const w = spawn(e, P, 1, 'tq-wall', -1); fresh(P[1]); const s3 = give(P[1], 'tq-sword');
  ok(!e.canEquip(P[1], s3, w.uid), '1b. a Structure carries nothing'); }
// equipped pieces move with their unit (here on the ice)
{ const {e, P} = mk(3); fresh(P[1]);
  const c = spawn(e, P, 1, 'tq-unit', 0); c.equipment = 'tq-sword'; c.equipOn = true;
  e.floorScan(P, so, {}, []); fresh(P[2]);
  const fs1 = give(P[2], 'frost-slick'); ok(e.placeCard(P, so, 2, fs1, 1, {}, [], {hazardPid:1}), '1c. Frost Slick on the foe\'s slot 1');
  moveTo(e, P[1], c, 1); e.floorScan(P, so, {}, []);
  ok(c.slot === 2 && c.equipment === 'tq-sword', `1c. the unit slid on (to ${c.slot}) and its piece went with it`); }

// ---- 2. Weapon Master N
{ const dmgWith = wm=>{ const {e, P} = mk(4); const a = spawn(e, P, 1, 'tq-archer', 0); if(wm) spawn(e, P, 1, 'tq-armory', 1);
    const d = spawn(e, P, 2, 'tq-dummy', 0); const h0 = d.hp; e.resolveCombat(P, so, {}, [], 1); return h0 - d.hp; };
  const a0 = dmgWith(false), a1 = dmgWith(true);
  ok(a1 === a0 + 1, `2. Weapon Master 1: arrows deal 1 more (${a0} -> ${a1})`); }
{ const {e, P} = mk(5); const c = spawn(e, P, 1, 'tq-unit', 0); fresh(P[1]); const sw = give(P[1], 'tq-sword'); e.placeCard(P, so, 1, sw, 0, {}, []);
  const arm = spawn(e, P, 1, 'tq-armory', 1); e.syncPhaseStats(P, so, []);
  ok((c.phaseAtk || 0) === 0, '2. no Weapon Master bonus while equipping');
  e.roundStart(P, 2, so, {}, []); e.syncPhaseStats(P, so, []);
  ok(c.phaseAtk === 1 && c.maxHp === 23, `2. an equipped ally gets +1/+1 (phaseAtk ${c.phaseAtk}, max ${c.maxHp})`);
  arm.hp = 0; e.removeDeadCards(P, so, {}, {}, []); e.syncPhaseStats(P, so, []);
  ok((c.phaseAtk || 0) === 0 && c.maxHp === 22, `2. it goes with the last Weapon Master (phaseAtk ${c.phaseAtk}, max ${c.maxHp})`); }

// ---- 3. Pry N (the Crowbar)
{ const {e, P} = mk(6); const c = spawn(e, P, 1, 'tq-unit', 0); fresh(P[1]); const cb = give(P[1], 'crowbar');
  ok(e.placeCard(P, so, 1, cb, 0, {}, []), '3. the Crowbar goes under a unit'); e.roundStart(P, 2, so, {}, []);
  ok(c.atk === 4 && (defs[c.defId].effects || {}).pry === 1, `3. +2/+0 and Pry 1 once equipped (${c.atk})`);
  const t = spawn(e, P, 2, 'tq-armored', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(t.armorLoss === 1 && ev.some(x=> x.kind === 'armorShred' && x.pry), `3. a landed hit strips 1 Armor for good (armorLoss ${t.armorLoss})`); }

// ---- 4. Slot hazards
const hz = (e, P, pid, id, tpid, sl)=>{ fresh(P[pid]); const u = give(P[pid], id); const ev = []; const r = e.placeCard(P, so, pid, u, sl, {}, ev, {hazardPid:tpid}); return {r, ev}; };
{ const {e, P} = mk(8); spawn(e, P, 2, 'tq-unit', 0); e.floorScan(P, so, {}, []);
  const r = hz(e, P, 1, 'frost-slick', 2, 1); ok(r.r && r.ev.some(x=> x.type === 'floorSet' && x.kind === 'ice') && e.floorAt(2, 1).kind === 'ice', '4. Frost Slick lays Ice on a foe slot');
  ok(P[1].graveyard.some(g=> g.defId === 'frost-slick') && P[1].playedThisTurn, '4. the hazard card goes to the graveyard and uses the play');
  fresh(P[2]); const u = give(P[2], 'tq-unit'); const ev = []; e.placeCard(P, so, 2, u, 1, {}, ev);
  const c = all(P[2]).find(x=> x.uid !== at(P[2], 0).uid);
  ok(c.slot === 2 && ev.some(x=> x.type === 'floorSlide' && x.from === 1 && x.to === 2), `4. Ice: a unit played onto it slides on (the way beside it is blocked, so the other: ${c.slot})`);
  // moving onto it: the way it was moving
  const m = spawn(e, P, 2, 'tq-unit', -1); e.floorScan(P, so, {}, []); hz(e, P, 1, 'frost-slick', 2, -2); moveTo(e, P[2], m, -2); e.floorScan(P, so, {}, []);
  ok(m.slot === -3, `4. Ice: a unit moving onto it keeps going that way (-1 -> -2 -> ${m.slot})`);
}
{ const {e, P} = mk(9); const c = spawn(e, P, 2, 'tq-unit', 0), fl = spawn(e, P, 2, 'tq-flyer', 1); e.floorScan(P, so, {}, []);
  hz(e, P, 1, 'magma-vent', 2, 0); hz(e, P, 1, 'magma-vent', 2, 1);
  const h0 = c.hp, f0 = fl.hp, ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(h0 - c.hp === 2 && ev.some(x=> x.type === 'floorTick' && x.kind === 'lava' && x.dmg === 2), `4. Lava: 2 fire at the start of the round (${h0} -> ${c.hp})`);
  ok(fl.hp === f0, '4. Lava: a flyer is above it');
  e.roundStart(P, 3, so, {}, []); const ev4 = []; e.roundStart(P, 4, so, {}, ev4);
  ok(!e.floorAt(2, 0) && ev4.some(x=> x.type === 'floorEnd' && x.kind === 'lava'), '4. Lava wears off after its 3 rounds (floorEnd)');
  ok(h0 - c.hp === 6, `4. ... having burned 3 times (${h0 - c.hp})`); }
{ const {e, P} = mk(10); spawn(e, P, 2, 'tq-unit', 0); e.floorScan(P, so, {}, []);
  hz(e, P, 1, 'bog-seep', 2, 1); fresh(P[2]); const u = give(P[2], 'tq-unit'); e.placeCard(P, so, 2, u, 1, {}, []);
  const c = at(P[2], 1); ok(c && c.poison === 2, `4. Poison Floor: Poison 2 on entering (${c && c.poison})`);
  e.roundStart(P, 2, so, {}, []); ok(c.poison >= 2 && (c.poison === 4 || c.poison === 2), `4. ... and again at the round's start (${c.poison})`);
  const fl = spawn(e, P, 2, 'tq-flyer', 2); hz(e, P, 1, 'bog-seep', 2, 3); moveTo(e, P[2], fl, 3); e.floorScan(P, so, {}, []);
  ok(!(fl.poison > 0), '4. Poison Floor: a flyer is above it'); }
{ const {e, P} = mk(11); const fl = spawn(e, P, 2, 'tq-flyer', 0); e.floorScan(P, so, {}, []);
  hz(e, P, 1, 'miasma', 2, 0); e.roundStart(P, 2, so, {}, []);
  ok(fl.poison === 1, `4. Toxic Gas (Miasma): Poison 1 a round, flyers too (${fl.poison})`); }
{ const {e, P} = mk(12); spawn(e, P, 2, 'tq-unit', 0); e.floorScan(P, so, {}, []);
  ok(e.legalSlots(P[2]).includes(1), '4. slot 1 is open to the foe');
  ok(!hz(e, P, 1, 'rockfall', 2, 0).r, '4. Rubble needs an empty slot'); ok(!hz(e, P, 1, 'rockfall', 1, 0).r, '4. Rubble goes on the foe\'s side only');
  ok(hz(e, P, 1, 'rockfall', 2, 1).r && !e.legalSlots(P[2]).includes(1), `4. Rubble: the foe can't play into that slot (${e.legalSlots(P[2]).join()})`);
  fresh(P[2]); const u = give(P[2], 'tq-unit'); ok(!e.placeCard(P, so, 2, u, 1, {}, []), '4. ... placeCard refuses it');
  ok(e.legalSlots(P[1]).includes(0), '4. Rubble on the foe side leaves your own plays alone'); }
{ const {e, P} = mk(13); const small = spawn(e, P, 2, 'tq-unit', 0), big = spawn(e, P, 2, 'tq-big', 1), fl = spawn(e, P, 2, 'tq-flyer', -1); spawn(e, P, 1, 'tq-unit', 0);
  e.floorScan(P, so, {}, []); fresh(P[1]); P[1].hand = []; give(P[1], 'magma-vent');
  const ev = []; e.aiTakeTurn(P, so, 1, {}, ev);
  ok(ev.some(x=> x.type === 'floorSet' && x.kind === 'lava' && x.pid === 2 && x.slot === 1), `5. the CPU lays Lava under the strongest unit it can burn (${JSON.stringify(ev.filter(x=> x.type === 'floorSet'))})`);
  fresh(P[1]); P[1].hand = []; give(P[1], 'rockfall'); const ev2 = []; e.aiTakeTurn(P, so, 1, {}, ev2);
  const rs = ev2.find(x=> x.type === 'floorSet'); ok(rs && rs.kind === 'rubble' && rs.pid === 2 && !at(P[2], rs.slot), `5. the CPU drops Rubble on an open foe slot (${rs && rs.slot})`);
  // equipment: under its strongest unit
  const {e: e2, P: P2} = mk(14); spawn(e2, P2, 1, 'tq-unit', 0); const strong = spawn(e2, P2, 1, 'tq-big', 1); fresh(P2[1]); P2[1].hand = []; give(P2[1], 'tq-sword');
  e2.aiTakeTurn(P2, so, 1, {}, []); ok(strong.equipment === 'tq-sword', '5. the CPU puts its equipment under its strongest unit'); }
// the shared scan
{ const {e, P} = mk(15); const a = spawn(e, P, 1, 'tq-unit', 0); let L = e.slotEntries(P, '_testKey');
  ok(L.length === 1 && L[0].fresh && L[0].to === 0, '6. slotEntries: a new unit is a fresh entry');
  ok(!e.slotEntries(P, '_testKey').length, '6. ... seen once');
  moveTo(e, P[1], a, 1); L = e.slotEntries(P, '_testKey'); ok(L.length === 1 && !L[0].fresh && L[0].from === 0 && L[0].to === 1, '6. ... a moved unit is an entry with from / to');
  ok(e.slotEntries(P, '_otherKey').length === 1, '6. each key keeps its own memory'); }
// the new trigger on a unit: On Enter Slot (played, then moved in)
{ const d2 = Object.assign({}, defs, {'tq-scout': {id:'tq-scout', name:'TQ Scout', attack:1, health:20, wait:2, cost:0, effects:{triggers:[{on:'onEnterSlot', do:'gain', resource:'lumber', amount:1}]}}});
  const e = E.makeSimEngine(d2, E.mulberry32(17), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})};
  P[1].lumber = 0; e.debugSpawnCard(P, so, 1, 'tq-unit', 0, {}, []); const l0 = P[1].lumber; e.debugSpawnCard(P, so, 1, 'tq-scout', 1, {}, []);
  ok(P[1].lumber === l0 + 1, `6b. On Enter Slot fires when the unit is played (even while Waiting): Lumber ${l0} -> ${P[1].lumber}`);
  const sc = all(P[1]).find(c=> c.defId === 'tq-scout'); moveTo(e, P[1], sc, 2); e.floorScan(P, so, {}, []);
  ok(P[1].lumber === l0 + 2, `6b. ... and when it moves into another slot (${P[1].lumber})`); }
// gravity boards: hazards can't be played, equipment only onto a unit
{ const e = E.makeSimEngine(defs, E.mulberry32(16), {recordEvents:true}); const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}; fresh(P[1]);
  const u = give(P[1], 'magma-vent'); ok(!e.canPlay(P[1], 'magma-vent', u), '7. a gravity board has no slots: no hazards');
  const s = give(P[1], 'tq-sword'); ok(!e.canPlay(P[1], 'tq-sword', s), '7. ... and no lone piece (no unit to carry it either)'); }

// ---- 8. the cards
{ const cards = JSON.parse(R('canonical/cards.json')), by = Object.fromEntries(cards.map(c=> [c.id, c]));
  const NEW = ['crowbar', 'bucketknee-wolf', 'armory', 'frost-slick', 'magma-vent', 'bog-seep', 'miasma', 'rockfall'];
  { const at = cards.findIndex(c=> c.id === NEW[0]); ok(at >= 0 && JSON.stringify(cards.slice(at, at + NEW.length).map(c=> c.id)) === JSON.stringify(NEW), '8. the new cards sit together, appended after the older cards'); } // 2026-10-19 (merge): later packages append after them
  NEW.forEach(id=> ok(/package EQ/.test(by[id].creatorNote || '') && /N = [\d.]+/.test(by[id].creatorNote), `8. ${id}: its creatorNote shows the budget`));
  ok(by.crowbar.cardType === 'equipment' && by.crowbar.attack === 2 && by.crowbar.health === 0 && by.crowbar.equip.grant.pry === 1 && by.crowbar.rarity === 'rare', '8. Crowbar: equipment +2/+0, Pry 1, Rare');
  ok(!by.crowbar.source && !/half-life|gordon|freeman|headcrab/i.test(by.crowbar.name + ' ' + by.crowbar.flavor), '8. Crowbar: no source yet, a generic name and flavour');
  ok(by['bucketknee-wolf'].easterEgg && by['bucketknee-wolf'].source.kind === 'easteregg' && by['bucketknee-wolf'].rarity === 'veryrare' && !by['bucketknee-wolf'].effects.pounce, '8. the Bucketknee Wolf: a Very Rare Easter egg, no Pounce');
  ok(!/skyrim|arrow in the knee|adventurer like you/i.test(by['bucketknee-wolf'].flavor), '8. its flavour winks without quoting');
  ok(/EASTER_EGG_IDS = \[[^\]]*'bucketknee-wolf'/.test(R('arena_app.js')), '8. it is on EASTER_EGG_IDS');
  ['frost-slick', 'magma-vent', 'bog-seep', 'miasma', 'rockfall'].forEach(id=>{ const c = by[id];
    ok(c.cardType === 'spell' && c.spell.do === 'hazard' && c.hazard && ['ice', 'lava', 'poison', 'gas', 'rubble'].includes(c.hazard.kind) && ['uncommon', 'rare'].includes(c.rarity) && !c.source, `8. ${id}: a hazard spell, Uncommon or Rare, no source`); });
  ok(/^data:image\/png;base64,/.test(by.creeper.art || '') && by.creeper.art === 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'art/cards/creeper.png')).toString('base64'), '8. Creeper wears its old art again (art/cards/creeper.png)');
  const sk = JSON.parse(R('canonical/skill-costs.json')).skills.map(s=> s.id);
  ['weaponMaster', 'pry', 'hazardIce', 'hazardRubble'].forEach(k=> ok(sk.includes(k), `8. skill-costs.json has ${k}`));
  ok(JSON.parse(R('canonical/skill-costs.json')).triggers.some(t=> t.id === 'onEnterSlot'), '8. skill-costs.json has the On Enter Slot trigger');
  ok(by['magma-vent'].hazard.triggers[0].on === 'onRoundStart' && by['magma-vent'].hazard.triggers[0].do === 'damage' && by['bog-seep'].hazard.triggers.some(t=> t.on === 'onEnterSlot' && t.do === 'poison') && by.miasma.hazard.flyers === true, '8. the hazards are written as triggers and actions (owner 21:56)');
  const briefs = R('docs/art/new-cards-2026-10-19-briefs.md');
  NEW.filter(id=> id !== 'bucketknee-wolf').concat(['bucketknee-wolf']).forEach(id=> ok(briefs.includes('`' + id + '`'), `8. an art brief for ${id}`));
  const wolfBrief = briefs.slice(briefs.indexOf('`bucketknee-wolf`')); const wb = wolfBrief.slice(0, wolfBrief.indexOf('\n\n', 200) > 0 ? wolfBrief.indexOf('\n\n', 200) : 2000);
  ok(/feathered stick/.test(wb) && !/\b(arrow|spiked|studded|monitor|sperm|corpse|no clothes|sword|bow)\b/i.test(wb.replace(/^.*Avoid.*$/gm, '')) && /background/i.test(wb), '8. the wolf\'s prompt: a background, "an old feathered stick", none of the banned words'); }

// ---- 9. the page
{ const app = R('arena_app.js'), tx = R('bramblewood-texts.js');
  ['ui.eq-equipping', 'ui.eq-lone-tip', 'ui.eq-floor-ice', 'ui.eq-floor-lava', 'ui.eq-floor-poison', 'ui.eq-floor-gas', 'ui.eq-floor-rubble', 'ui.skn-weapon-master', 'ui.sk-weapon-master', 'ui.skn-pry', 'ui.sk-pry', 'ui.de-equip-note']
    .forEach(k=> ok(tx.includes(`"${k}"`) && app.includes(`'${k}'`), `9. ${k}: a TX key, used by the page`));
  ok(app.includes('eqSlotMarks(') && app.includes('data-hzcell'), '9. the board draws the lone pieces, the floors and the hazard drop targets');
  ok(/\{key:'weaponMaster', category:'passive', label:TX\('ui\.skn-weapon-master'\)/.test(app) && /\{key:'pry', category:'passive', label:TX\('ui\.skn-pry'\)/.test(app), '9. Weapon Master and Pry are in PASSIVE_DEFS');
  ok(/'tests\/equipment-hazards-2026-10-19\.js'|equipment-hazards-2026-10-19\.js/.test(R('tests/run-all.sh')), '9. run-all.sh runs this file'); }
console.log(`equipment-hazards: ${checks} checks, ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
