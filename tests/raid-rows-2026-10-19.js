#!/usr/bin/env node
// 2026-10-18 (owner 20:40): in a raid you can't play into the middle / back rows: those are the CPU allies' rows.
'use strict';
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const fails = [];
if(!/pid === viewerPid && !m\.raidFull && m\.engine\.legalReserveSlots/.test(src)) fails.push('reserve-row play targets are still drawn for you in raids');
if(!/if\(m\.raidFull && popts && popts\.reserve\) return false;/.test(src)) fails.push('playCardByUid still lets you play into a raid reserve row');
if(fails.length){ console.log('raid-rows: ' + fails.length + ' failure(s)'); fails.forEach(f=> console.log('  FAIL ' + f)); process.exit(1); }
console.log('raid-rows: all passed');
