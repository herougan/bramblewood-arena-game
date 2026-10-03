#!/usr/bin/env node
// Card-data hash (bramblewood-integrity.js): matches Node's SHA-256, is stable across key order,
// ignores cosmetic fields, and changes when any gameplay number changes.
'use strict';
const path = require('path');
const crypto = require('crypto');
const H = require('./lib/harness.js');
const I = require(path.join(H.ROOT, 'bramblewood-integrity.js'));
const failures = [];
const check = (ok, msg)=>{ if(!ok) failures.push(msg); };
['', 'abc', 'Bramblewood 🦦 otters', 'x'.repeat(1000)].forEach(s=>{
  check(I.sha256(s) === crypto.createHash('sha256').update(s, 'utf8').digest('hex'), `sha256 mismatch for "${s.slice(0,20)}"`);
});
const defs = H.loadCardDefs();
const h0 = I.cardDataHash(defs);
check(/^[0-9a-f]{64}$/.test(h0), 'hash should be 64 hex chars');
// key order doesn't matter
const shuffled = {}; Object.keys(defs).reverse().forEach(id=>{ const d = defs[id]; shuffled[id] = Object.fromEntries(Object.entries(d).reverse()); });
check(I.cardDataHash(shuffled) === h0, 'hash should not depend on key order');
// cosmetic changes don't matter
const id0 = Object.keys(defs)[0];
const cos = JSON.parse(JSON.stringify(defs)); cos[id0].flavor = 'new flavor'; cos[id0].art = 'data:x'; cos[id0].icon = '🐸';
check(I.cardDataHash(cos) === h0, 'cosmetic fields should not change the hash');
// gameplay changes do
const atk = JSON.parse(JSON.stringify(defs)); atk[id0].attack = (atk[id0].attack||0) + 1;
check(I.cardDataHash(atk) !== h0, 'an attack change should change the hash');
const del = JSON.parse(JSON.stringify(defs)); delete del[id0];
check(I.cardDataHash(del) !== h0, 'removing a card should change the hash');
// the server hashes canonical/cards.json directly; the browser hashes the same rows keyed by id
const canon = require(path.join(H.ROOT, 'canonical', 'cards.json'));
const keyed = {}; canon.forEach(c=>{ keyed[c.id] = Object.assign({}, c); });
check(I.cardDataHash(canon) === I.cardDataHash(keyed), 'list form and keyed form should hash the same');
console.log(`  canonical/cards.json fingerprint ${I.cardDataHash(canon).slice(0,12)}`);
console.log(`  card data hash ${h0.slice(0,12)} over ${Object.keys(defs).length} cards`);
console.log(`integrity: ${failures.length} failure(s)`);
failures.forEach(f=> console.log('  FAIL '+f));
process.exit(failures.length ? 1 : 0);
