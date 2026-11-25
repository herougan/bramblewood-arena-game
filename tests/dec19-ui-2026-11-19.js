#!/usr/bin/env node
// Package DEC19-UI (2026-11-19): Arena co-op entry (REL1-4 b), night tint under the top bar and dialogs (UX4-1 a), every card into the Graveyard arcs (FX9-1 a). Static.
'use strict';
const fs = require('fs'), path = require('path');
const rd = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const t = rd('arena_template.html'), a = rd('arena_app.js'), x = rd('bramblewood-texts.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
// 2026-11-26 (FIXPACK1, owner 11-24 #7): The Tidelock Vault left "More ways to play" (the map spot and the Co-op pane still open it)
ok(!/openCoopBtn|arenaCoopOpen/.test(a), '1. no vault tile on the Arena\'s More ways to play');
ok(!x.includes('ui.dec19-coop-tip'), '2. its tip text is gone');
ok(/#atmoTint\{z-index:90;\}/.test(t) && /\.topbar-wrap\{position:relative; z-index:95;\}/.test(t), '3. tint under topbar (95) and dialogs (600)');
ok(/body\.in-fight #atmoTint\{[^}]*z-index:9000/.test(t), '4. fight board still tinted');
ok(/mine && matchState && to\)\{ ui16PitchToGrave\(/.test(a), '5. overdraw arcs via the pitch flight');
ok(/ui16PitchToGrave\(m, handTileEl, \{defId: gv\.defId/.test(a), '6. field card / spell used up arcs');
ok(/ui16PitchToGrave\(m, feedTile/.test(a), '7. Feed arcs');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'ok ' + n + ' checks'); process.exit(fail ? 1 : 0);
