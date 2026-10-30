#!/usr/bin/env node
// 2026-10-28 (package TOOLS1, owner 10-28 21:40: "To achieve all of this, it seems we need the following applications: 1) a good way to
// measure cards contribution 2) a good way to quickly measure skills impact to a card's contribution and therefore indirectly its strength -
// in a fair and balanced way 3) a good way to optimise a deck out of a list of cards, say, 15 cards."): the balance workbench, one command
// line for the three tools. Measurement only: it never writes cards, decks, prices or game code (skill --all writes a suggested-price file
// for the owner to review).
//
//   node tools/bench/bench.js contrib --cards owl-nightwatch,fox-kit      T1: contribution ± 95% and value per budget point (global context)
//   node tools/bench/bench.js contrib --map 3                              T1 in a map's context: its fields, its level, its cards as the pool
//   node tools/bench/bench.js contrib --all                                T1 for every card of the context (resumable: re-run the same command)
//   node tools/bench/bench.js skill arrow                                  T2: one skill's measured worth in budget points vs its price
//   node tools/bench/bench.js skill --all                                  T2 for every skill, ranked by mispricing (resumable)
//   node tools/bench/bench.js deck --map 3 --max-unique 6 --max-copies 4   T3: strong decks with different focuses from a card list
//   node tools/bench/bench.js check                                        self-checks (no long runs)
//   node tools/bench/bench.js help [contrib|skill|deck]
// Shared options: --games M (fights a card / variant, default 200), --copies k (the slot, default 4), --seed S, --workers N (default 2),
// --map N [--mode bpro|map-true], --pool a,b,c (the deck pool), --level L, --cache-dir D, --tag T, --out DIR, --quiet.
'use strict';
const path = require('path'), fs = require('fs');
const L = require('./lib.js');

const HELP = {
  main: fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 18).map(l => l.replace(/^\/\/ ?/, '')).join('\n'),
  contrib: `contrib (T1): each card's contribution by paired swaps.
  --cards a,b,c     the cards to measure (default with --map: the map's pool)   --all   every card of the context's pool
  --map N           the map's context: its fights' fields, its reference level, its own cards as the deck pool (--mode bpro, or map-true)
  --games M         fights a card (default 200; about 10-20 s a card on 2 cores; cached, so a re-run is instant)
  --save            write docs/balance/bench-contrib-<context>-<tag>.json/.md (always with --all)`,
  skill: `skill (T2): a skill's worth measured on the cards that carry it, in budget points, against its price.
  skill <id> [<id> ...]   the skills (keyword ids as in effects, or T:<on>><do> for a trigger entry, e.g. T:onReady>gain)
  --all             every skill of the context's cards, ranked by mispricing; writes docs/balance/bench-skills-<tag>.json/.md and
                    bench-skill-prices-<tag>.json (suggested prices: nothing is written to canonical/skill-costs.json)
  --carriers n      real carriers a skill (default 3)   --no-synthetic   skip skills on fewer than 2 cards instead of adding vanilla carriers
  --min-real n      below this many real carriers, vanilla carriers are added (default 2)
  --plan            print the carriers and the number of variants, play nothing
  --games M         fights a variant (default 200)`,
  deck: `deck (T3): several strong decks with different focuses from a card list.
  --map N           the map's context: its gauntlet (its fight decks and reference decks under its fields, deckopt's), its level
  --pool a,b,c      the card list (default: the map's own pool, deckopt's bpro list)
  --max-unique 6 --max-copies 4 --size 20   the deck rule (owner step 4: at most 6 different cards, at most 4 copies each)
  --budget G        search games in all (default 9000, about 8 minutes on 2 cores)   --apart 6   copies each focus's deck keeps from the earlier ones   --focus open,big,economy,swarm,<family>  (default: every focus the pool supports)
  --final-games F   games per gauntlet entry for the reported decks (default 24)   --level L (default the map's reference level)
  --anchor a,b,c --anchor-min N   (DECK1) at least N copies (default 10) from the anchor list (the map's own list); --focus sets the order`,
};

async function main(argv) {
  const cmd = argv[0] || 'help', a = argv.slice(1), o = L.defaults();
  if (cmd === 'help' || cmd === '--help' || cmd === '-h') { console.log(HELP[a[0]] || HELP.main); return; }
  while (a.length) {
    if (L.parseCommon(a, o)) continue;
    const k = a.shift();
    switch (k) {
      case '--cards': o.cards = a.shift().split(',').map(s => s.trim()).filter(Boolean); break;
      case '--all': o.all = true; break; case '--save': o.save = true; break;
      case '--carriers': o.carriers = +a.shift(); break; case '--min-real': o.minReal = +a.shift(); break; case '--no-synthetic': o.synthetic = false; break; case '--plan': o.planOnly = true; break;
      case '--max-unique': o.maxUnique = +a.shift(); break; case '--max-copies': o.maxCopies = +a.shift(); break; case '--size': o.size = +a.shift(); break;
      case '--budget': o.budget = +a.shift(); break; case '--focus': o.focus = a.shift().split(','); break; case '--final-games': o.finalGames = +a.shift(); break;
      case '--road-weight': o.roadWeight = +a.shift(); break; case '--apart': o.apart = +a.shift(); break;
      case '--anchor': o.anchor = a.shift().split(',').map(s => s.trim()).filter(Boolean); break; case '--anchor-min': o.anchorMin = +a.shift(); break; // 2026-10-30 (DECK1)
      case '--help': case '-h': console.log(HELP[cmd] || HELP.main); return;
      default: if (!k.startsWith('--') && cmd === 'skill') { (o.skills = o.skills || []).push(k); break; } throw new Error('unknown option ' + k + ' (bench.js help ' + cmd + ')');
    }
  }
  if (cmd === 'contrib') {
    const T1 = require('./contrib.js'), B = new L.Bench(o);
    try { const res = await T1.run(B, o); T1.print(res, B.log); if (o.all || o.save) B.log('-> ' + path.relative(L.ROOT, T1.save(res, o)) + ' (+ .md)'); } finally { B.close(); }
  } else if (cmd === 'skill') {
    const T2 = require('./skill.js'), B = new L.Bench(o);
    try { await T2.main(B, o); } finally { B.close(); }
  } else if (cmd === 'deck') {
    const T3 = require('./deck.js'); await T3.main(o);
  } else if (cmd === 'check') {
    const p = await require('./check.js').run(o); p.forEach(x => console.log('problem: ' + x)); console.log(p.length ? p.length + ' problem(s)' : 'ok'); if (p.length) process.exit(1);
  } else throw new Error('unknown command ' + cmd + ' (contrib, skill, deck, check, help)');
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { main };
