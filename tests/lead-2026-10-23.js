#!/usr/bin/env node
// 2026-10-23 (package LEAD, owner 01:03 #12: "Elites & above should have leaders. Normal skirmishes past Map 10 should have leaders. (While
// keeping BR roughly ...) Typically the 'boss unit' is the leader. For special bosses - e.g. twin-headed, they can have 2 leaders."):
//   1. every elite and above on Maps 0-24 (main and side maps; not the Tutorial, the endless floors or the Tower) has a leader, its showcase
//      card (the boss unit), and a paired boss two (node.leaders); skirmishes keep SK's rule (Map 2 on, the showcase); T-4 none;
//   2. the CPU gets both of a paired boss's leaders in reserve (the fight setup the game and the tools share);
//   3. the battle rating within 5% of the fight with no leader (docs/balance/lead-2026-10-23.json "before"; the named exceptions), PG's
//      copy ladder on every deck LEAD touched (tools/lead_2026_10_23.js check);
//   4. the tune ran for every changed fight (docs/balance/lead-2026-10-23-tune.jsonl);
//   5. an elite's / a boss's leader is shown (leadersShownFor: the VS opener; a paired boss's panel shows both); a skirmish's is not;
//   6. the new text is a TX key, translated in the 12 packs.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/lead-2026-10-23.json'), 'utf8'));
const PAIRS = plan.pairs;

// --- 1. who leads
{ let elites = 0, skirmishes = 0;
  for(const m of G.CONQUEST_MAPS){ const no = G.mapNumberOf(m.id);
    for(const n of m.nodes || []){ if(!n.deck) continue; const bk = G.baseKind(n.kind || 'skirmish'), L = G.skirmishLeadersOf(n, m.id);
      if(m.endless || m.tower || m.reserved){ ok(Array.isArray(n.leaders) || !L.length, `${n.key}: an endless / Tower floor has no rule leader`); continue; }
      if(m.id === 'mtut'){ ok(!L.length, `${n.key}: the Tutorial's lessons have no leader`); continue; }
      if(G.LEADER_KINDS.includes(bk)){ elites++;
        ok(L.length >= 1, `${n.key} (${n.kind}) on Map ${no} has a leader`);
        if(PAIRS[n.key]) ok(L.length === 2 && L.join() === PAIRS[n.key].join(), `${n.key}: the paired boss leads with ${PAIRS[n.key].join(' + ')} (got ${L.join(' + ')})`);
        else if(!Array.isArray(n.leaders)) ok(L[0] === G.nodeShowcaseId(n), `${n.key}: the leader is the showcase card`);
        const bossOf = k=> k === '7-5' && plan.boss[k] === 'hollow-oath-keeper' ? 'truffle-piglet' : plan.boss[k]; // 2026-10-26 (CONTENT3, G3): the Oath-Keeper left Map 7; 7-5's showcase is the card that took its place
        if(plan.boss[n.key]) ok(L[0] === bossOf(n.key), `${n.key}: the boss unit ${bossOf(n.key)} leads (got ${L[0]})`);
      } else if(bk === 'skirmish'){ skirmishes++;
        if(no >= 2) ok(L.length === 1 && L[0] === G.nodeShowcaseId(n), `${n.key}: a Map ${no} skirmish leads with its showcase (SK)`);
        else ok(!L.length, `${n.key}: a Map ${no} skirmish has no leader`);
      }
    } }
  ok(elites >= 110, `elite+ fights counted: ${elites}`); ok(skirmishes >= 140, `skirmishes counted: ${skirmishes}`); }

// --- 2. a paired boss's two leaders reach the CPU's reserve
for(const key of Object.keys(PAIRS)){
  const m = G.CONQUEST_MAPS.find(mm=> (mm.nodes || []).some(n=> n.key === key)), n = m.nodes.find(x=> x.key === key);
  const ctx = G.referenceFightSetup(m.id, n, {});
  ok(ctx.setup.reserveLeaders && ctx.setup.reserveLeaders.length === 2, `${key}: the fight setup puts 2 leaders in the CPU's reserve`);
}

// --- 3. BR and the copy ladder (the tool's own check)
{ const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools/lead_2026_10_23.js'), 'check'], {encoding: 'utf8'});
  // 2026-10-24 (package BAL3, owner BAL2-1 12:02: "use our agreed philosophy and schedule"): LEAD's Enemy levels are gone, so a leader's battle
  // rating is no longer held (the schedule sets the level); only the copy-ladder / other failures count. Was: the whole check (BR within 5%).
  const other = (r.stdout || '').split('\n').filter(l=> /^FAIL /.test(l) && !/^FAIL \S+ BR /.test(l));
  ok(r.status === 0 || !other.length, 'tools/lead_2026_10_23.js check passes (BR aside, BAL2-1):\n' + other.join('\n') + (r.stderr || ''));
  ok(Object.keys(plan.brExcept || {}).length <= 3, 'at most 3 named BR exceptions'); }

// --- 4. the tune ran for every changed fight
{ const log = fs.readFileSync(path.join(ROOT, 'docs/balance/lead-2026-10-23-tune.jsonl'), 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l));
  const tuned = new Set(log.map(o=> o.mapId + ':' + o.key));
  plan.fights.filter(f=> !f.kept).forEach(f=> ok(tuned.has(f.mapId + ':' + f.key), `${f.key}: tuned`)); }

// --- 5. shown to the player: elites and bosses, not skirmishes
{ ok(/function leadersShownFor\(node, mapId\)/.test(src), 'leadersShownFor exists');
  const opener = src.slice(src.indexOf('function showVersusOpener('), src.indexOf('function showVersusOpener(') + 6000);
  ok(/leadersShownFor\(node, map && map\.id\)/.test(opener) && /ui\.lead-vs-leaders/.test(opener) && /ui\.nv-vs-ally-leader/.test(opener), 'the VS opener names the leader(s)');
  ok(/cnp-pair/.test(src) && /leadersShownFor\(selectedNode, map\.id\)/.test(src), 'the map panel shows a paired boss\'s two leaders');
  ok(/\.vs-leaders\{/.test(tpl) && /\.cnp-pair\{/.test(tpl), 'their styles are in the template');
  // evaluate leadersShownFor against the real data
  const fnSrc = name=>{ const a = src.indexOf('\nfunction ' + name + '('); let i = src.indexOf('{', a), d = 0; for(; i < src.length; i++){ if(src[i] === '{') d++; else if(src[i] === '}'){ d--; if(!d) break; } } return src.slice(a + 1, i + 1); };
  const shown = new Function('G', `const LEADER_KINDS = G.LEADER_KINDS, baseKind = G.baseKind, skirmishLeadersOf = G.skirmishLeadersOf, getCardDefs = G.getCardDefs; ${fnSrc('leadersShownFor')} return leadersShownFor;`)(G);
  const at = (mid, k)=> G.CONQUEST_MAPS.find(m=> m.id === mid).nodes.find(n=> n.key === k);
  ok(shown(at('m11', '20-9'), 'm11').length === 1, '20-9 (boss): its leader is shown');
  ok(shown(at('m24', '24-8'), 'm24').length === 2, '24-8 (paired): both leaders are shown');
  ok(shown(at('m11', '20-1'), 'm11').length === 0, '20-1 (skirmish): its showcase leader is not shown (SK)'); }

// --- 6. texts
{ ok(TEXT['ui.lead-vs-leaders'] === '👑 Leaders: {a} and {b}', 'TX ui.lead-vs-leaders');
  for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
    const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')); const t = pack['Leaders: {a} and {b}'];
    ok(t && /\{a\}/.test(t) && /\{b\}/.test(t), `lang/${code}.json translates "Leaders: {a} and {b}"`); } }

console.log(`lead-2026-10-23: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
