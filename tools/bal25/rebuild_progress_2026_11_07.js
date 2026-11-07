#!/usr/bin/env node
// BAL25 (2026-11-07): rebuilds docs/balance/bal25/card-power-progress.jsonl from a finished card-power.json (rows keep games, played, wins,
// rateAll and byPhase for both passes), so `node tools/card_balance.js --v3 --resume --report-only` can re-fit the report without playing.
// Used once: the first v3 run deleted its progress file on finishing (the tool keeps it now).   node tools/bal25/rebuild_progress_2026_11_07.js
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', '..', 'docs', 'balance', 'bal25');
const rep = JSON.parse(fs.readFileSync(path.join(DIR, 'card-power.json'), 'utf8'));
const settings = {games: rep.games, mode: rep.mode, seed: rep.advanced.seed, only: '', filler: rep.filler.join(','), v: 3, top: rep.advanced.topShare, advMix: rep.advanced.poolCards,
  scopeMaxMap: rep.scope.maxMap, phases: Object.entries(rep.env.phases).map(x=> x.join(':')).join(','), fields: /skill_test_robust/.test(rep.env.fields)};
const lines = [JSON.stringify({settings})];
const m = (games, played, wins, rateAll, byPhase)=> ({games, played, wins, rate: played ? wins / played : null, rateAll: rateAll == null ? null : rateAll / 100, byPhase});
rep.rows.forEach(r=> lines.push(JSON.stringify({phase: 'basic', id: r.id, m: m(r.games, r.played, r.wins, r.winRateAll, r.byPhase)})));
rep.rows.forEach(r=>{ if(r.adv) lines.push(JSON.stringify({phase: 'adv', id: r.id, m: m(r.adv.games, r.adv.played, r.adv.wins, r.adv.rateAll, r.advByPhase)})); });
fs.writeFileSync(path.join(DIR, 'card-power-progress.jsonl'), lines.join('\n') + '\n');
console.log('rebuilt', lines.length - 1, 'lines');
