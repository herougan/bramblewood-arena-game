#!/usr/bin/env node
// The card pass's report (2026-10-19, package CB): docs/card-pass-2026-10-19.md and the sheets of docs/card-pass-2026-10-19.xlsx
// (docs/balance/card-pass-sheets.json, written into the workbook by tools/card_pass_xlsx.py).
//   node tools/card_pass_docs_2026_10_19.js && python3 tools/card_pass_xlsx.py
// Reads docs/balance/: card-pass-plan.json (the choices), card-pass-screen / -confirm (the measures), skirmish-pass-th-after.jsonl (the curve
// before this package), skirmish-pass-cb-mid.jsonl (rebuilt decks, before the retune), skirmish-pass-cb-after.jsonl (final),
// card-pass-nodes-before.json / card-pass-nodes-after.json (every fight before / after), skirmish-pass-decks.json and the saved decks before.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'docs', 'balance');
const P = require('./card_pass_2026_10_19.js');
const J = f=>{ try{ return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); }catch(e){ return null; } };
const L = f=> P.readJsonl(path.join(OUT, f));
const plan = J('card-pass-plan.json'), conf = Object.assign({}, P.tagRows('screen'), P.tagRows('confirm'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), NOW = {}; cards.forEach(c=> NOW[c.id] = c);
const RAR = {starter: 'Starter', common: 'Common', uncommon: 'Uncommon', rare: 'Rare', veryrare: 'Very Rare', superrare: 'Super Rare', epic: 'Epic', heroic: 'Heroic', unique: 'Unique', legendary: 'Legendary'};
const rn = r=> RAR[r] || r || '–';
const pct = v=> v == null ? '–' : (Math.round(v * 10) / 10) + '%';
const bandTxt = r=> P.bandOf(r).map(v=> Math.round(v * 100)).join('–') + '%';
const before = P.RAW; // card_pass reads cards.json at load: after apply that is the new card; the plan keeps the old stats in `from`
const st = plan.stats || {}, rar = plan.rarity || {};

// ---- measuredS notes: S at the owner's current values vs S at the measured worth (canonical/skill-costs.json measuredS)
function sNote(id, old){ const c = Object.assign({}, NOW[id], old || {}), b = P.SC.budget(c), m = P.SCM.budget(c), gap = Math.round((m.S - b.S) * 10) / 10;
  return {S: b.S, Sm: m.S, gap, okNow: b.ok, okM: m.ok}; }
function measuredLine(id, x){ const old = {attack: x.from.attack, health: x.from.health, cost: x.from.cost}, n = sNote(id, old), strong = x.wrBefore > P.bandOf(x.rarity)[1] * 100;
  if(Math.abs(n.gap) < 3) return '';
  if(strong && n.gap > 0) return `skill under-costed (S ${n.S} → measured ${n.Sm})` + (!n.okM ? ': with measuredS its old stats fail budget v3, so applying measuredS would have caught it' : '');
  if(!strong && n.gap < 0) return `skill over-costed (S ${n.S} → measured ${n.Sm}): applying measuredS frees ${Math.round(-n.gap * 10) / 10} budget points for a buff`;
  return `S ${n.S} → measured ${n.Sm}`; }

// ---- sheets
const sheets = [];
const changed = Object.entries(st).map(([id, x])=>{ const c = NOW[id]; return {id, name: c.name, rarity: rn(x.rarity), lumber: x.from.cost, wait: c.wait || 0, was: `${x.from.attack}/${x.from.health}` + (x.cost != null && x.cost !== x.from.cost ? ` (${x.from.cost} Lumber)` : ''),
  now: `${x.attack}/${x.health}` + (x.cost != null && x.cost !== x.from.cost ? ` (${x.cost} Lumber)` : ''), wrBefore: x.wrBefore, gamesBefore: x.gamesBefore || 100, wrAfter: x.wrAfter, band: bandTxt(x.rarity), verdict: x.verdict, why: x.why, measured: x.fit ? '' : measuredLine(id, x), src: c.source ? (c.source.kind === 'map' ? c.source.node : c.source.kind) : '–'}; })
  .sort((a, b)=> (a.verdict === 'FIT') - (b.verdict === 'FIT') || (a.wrBefore > 60) - (b.wrBefore > 60) || a.name.localeCompare(b.name));
sheets.push({name: 'Changed cards', header: ['Card', 'Rarity', 'Lumber', 'Wait', 'Was', 'Now', 'Win rate before', 'Games', 'Win rate after (400)', 'Band', 'Result', 'Why', 'measuredS note', 'Source now'],
  rows: changed.map(r=> [r.name, r.rarity, r.lumber, r.wait, r.was, r.now, r.wrBefore, r.gamesBefore, r.wrAfter, r.band, r.verdict, r.why, r.measured, r.src])});
sheets.push({name: 'Rarity', header: ['Card', 'Was', 'Now', 'Win rate', 'Games', 'Why'], rows: Object.entries(rar).map(([id, x])=> [NOW[id].name, rn(x.from), rn(x.to), x.wr, x.games, x.why])});
const srcTxt = s=> s.kind === 'map' ? `reward ${s.node}` : s.kind === 'pack' ? (s.tier === 99 ? 'Mystery Booster' : 'basic packs') : s.kind;
sheets.push({name: 'Sources', header: ['Card', 'Rarity', 'Source', 'Where', 'Was', 'Why'], rows: (plan.sources || []).map(s=> [s.name, rn(s.rarity), srcTxt(s.source), s.where, s.from && s.from.kind ? (s.from.kind + (s.from.node ? ' ' + s.from.node : s.from.id ? ' ' + s.from.id : '')) : 'none', s.why])});
sheets.push({name: 'Sourceless', header: ['Card', 'Rarity', 'Why it stays without a source'], rows: (plan.sourceless || []).map(s=> [s.name, rn(s.rarity), s.why])});
sheets.push({name: 'Odd sources kept', header: ['Card', 'Types', 'Note'], rows: (plan.oddSources || []).map(o=> [o.name || o.id, (o.types || []).join('/'), o.why])});
const leftRows = (plan.left || []).map(l=>{ const n = sNote(l.id); return [NOW[l.id].name, rn(NOW[l.id].rarity), NOW[l.id].cost || 0, `${NOW[l.id].attack}/${NOW[l.id].health}`, l.wr, bandTxt(NOW[l.id].rarity), l.tried || '', l.why, Math.abs(n.gap) >= 3 ? `S ${n.S} → measured ${n.Sm}` : '']; });
sheets.push({name: 'Left (owner calls)', header: ['Card', 'Rarity', 'Lumber', 'Stats', 'Win rate (400)', 'Band', 'Nearest step tried', 'Why left', 'measuredS'], rows: leftRows});
const allRows = Object.values(conf).sort((a, b)=> a.name.localeCompare(b.name)).map(x=>{ const c = NOW[x.id], s = st[x.id], wr = s ? s.wrAfter : x.wr, o = P.outside(wr / 100, c.rarity);
  return [c.name, rn(c.rarity), c.cost || 0, `${c.attack}/${c.health}`, x.wr, x.games, s ? s.wrAfter : '', bandTxt(c.rarity), o ? (o > 0 ? 'above' : 'below') + ' by ' + Math.round(Math.abs(o) * 10) / 10 : 'in band', P.skipReason(c) || '', s ? s.verdict : '']; });
sheets.push({name: 'All cards', header: ['Card', 'Rarity', 'Lumber', 'Stats now', 'Win rate (before)', 'Games', 'After', 'Band', 'Now', 'Report-only group', 'Changed'], rows: allRows});

// ---- the curve
const thAfter = L('skirmish-pass-th-after.jsonl'), cbMid = L('skirmish-pass-cb-mid.jsonl'), cbAfter = L('skirmish-pass-cb-after.jsonl'), cbFresh = L('skirmish-pass-cb-fresh.jsonl');
const key = r=> r.map + ':' + r.key, idx = a=> Object.fromEntries(a.map(r=> [key(r), r]));
const TH = idx(thAfter), MID = idx(cbMid), AFT = idx(cbAfter), FR = idx(cbFresh);
const nb = J('card-pass-nodes-before.json') || {}, na = J('card-pass-nodes-after.json') || {};
const names = {}; cards.forEach(c=> names[c.id] = c.name);
const deckDiff = (a, b)=>{ const o = []; Object.keys(Object.assign({}, a, b)).sort().forEach(id=>{ const d = (b[id] || 0) - (a[id] || 0); if(d) o.push(`${d > 0 ? '+' : '−'}${Math.abs(d)} ${names[id] || id}`); }); return o.join('; '); };
const curveRows = cbAfter.map(r=>{ const k = key(r), b = nb[k] || {}, a = na[k] || {}, moves = [];
  const dd = deckDiff(b.deck || {}, a.deck || {}); if(dd) moves.push(dd); if((b.shield || 0) !== (a.shield || 0)) moves.push(`Shield ${b.shield || 0} → ${a.shield || 0}`); if((b.hp || 0) !== (a.hp || 0)) moves.push(`Health ${b.hp} → ${a.hp}`);
  return {code: r.code || r.key, name: r.name, kind: r.kind, target: r.target, lo: r.lo, hi: r.hi, th: (TH[k] || {}).win, mid: (MID[k] || {}).win, after: r.win, fresh: (FR[k] || {}).win, green: r.green, moves: moves.join(' · ')}; });
sheets.push({name: 'Curve', header: ['Fight', 'Name', 'Kind', 'Target', 'Green from', 'to', 'Before (TH final)', 'Rebuilt decks, before retune', 'After', 'Fresh seeds', 'Now', 'Retune'],
  rows: curveRows.map(r=> [r.code, r.name, r.kind, r.target, r.lo, r.hi, r.th, r.mid, r.after, r.fresh == null ? '' : r.fresh, r.green, r.moves])});
const dB = J('card-pass-decks-before.json') || {road: {}}, dA = J('skirmish-pass-decks.json') || {road: {}};
const deckTxt = d=> d && d.cards ? d.cards.map(c=> `${c.n}× ${c.name}`).join(', ') : '';
sheets.push({name: 'Decks', header: ['Map', 'Before', 'After', 'Score after (own fights)'], rows: Object.keys(dA.road).map(Number).sort((a, b)=> a - b).map(n=> [n, deckTxt(dB.road[n]), deckTxt(dA.road[n]), dA.road[n].score])});
fs.writeFileSync(path.join(OUT, 'card-pass-sheets.json'), JSON.stringify({sheets}, null, 1) + '\n');

// ---- the doc
const md = [];
const tbl = (h, rows)=>{ md.push('| ' + h.join(' | ') + ' |', '|' + h.map(()=> '---').join('|') + '|'); rows.forEach(r=> md.push('| ' + r.map(v=> String(v == null ? '' : v).replace(/\|/g, '/')).join(' | ') + ' |')); md.push(''); };
const nIn = changed.filter(r=> r.verdict === 'IN').length, nTow = changed.filter(r=> r.verdict === 'TOWARD' || r.verdict === 'EDGE').length, nFit = changed.filter(r=> r.verdict === 'FIT').length;
const down = changed.filter(r=> r.verdict !== 'FIT' && r.wrBefore > 60 && r.wrAfter < r.wrBefore).length, up = changed.filter(r=> r.verdict !== 'FIT' && r.wrAfter > r.wrBefore).length;
const measured = Object.values(conf).filter(x=> !P.skipReason(NOW[x.id]));
const inBand = arr=> arr.filter(x=>{ const s = st[x.id]; return !P.outside((s ? s.wrAfter : x.wr) / 100, NOW[x.id].rarity); }).length;
const inBefore = measured.filter(x=> !P.outside(x.wr / 100, before[x.id] ? (rar[x.id] ? rar[x.id].from : NOW[x.id].rarity) : NOW[x.id].rarity)).length;
const out8 = arr=> arr.filter(x=>{ const s = st[x.id]; return Math.abs(P.outside((s ? s.wrAfter : x.wr) / 100, NOW[x.id].rarity)) > 8; }).length;
const out8Before = measured.filter(x=> Math.abs(P.outside(x.wr / 100, rar[x.id] ? rar[x.id].from : NOW[x.id].rarity)) > 8).length;
const srcK = {}; (plan.sources || []).forEach(s=>{ const k = s.source.kind === 'pack' ? (s.source.tier === 99 ? 'Mystery Booster' : 'basic packs') : (s.from && s.from.kind === 'map' && s.from.node ? 'moved reward' : 'fight reward'); srcK[k] = (srcK[k] || 0) + 1; });
const green = a=> a.filter(r=> r.green === 'green').length;
md.push('# The card pass, 2026-10-19 (package CB)', '',
  'Owner (00:19, the overnight plan): **"balance the cards themselves (L1) + balance rarity, choose where the cards come from"**. A later package does levels. You asked for it overnight, so the choices are made and written down here; each one is data (`docs/balance/card-pass-plan.json`) and can be reverted card by card.', '',
  'The spreadsheet is `docs/card-pass-2026-10-19.xlsx`: **Changed cards**, **Rarity**, **Sources**, **Sourceless**, **Odd sources kept**, **Left (owner calls)**, **All cards** (every measured card), **Curve** (every main fight before / after) and **Decks** (the reference decks before / after).', '',
  '## In short', '',
  `- **Every live card measured** at Level 1 on card_balance.js's yardstick: ${Object.keys(conf).length} cards at 100 games (±5 points), and the ${Object.values(conf).filter(x=> x.games >= 400).length} that came out more than 3 points outside their band again at **400 games** (±2.5 points; ±5 at 95%). Every number in the tables is a 400-game number unless it says otherwise.`,
  `- **${changed.length} cards changed:** ${nIn} now inside their band, ${nTow} moved toward it as far as a budget-legal step goes, ${nFit} fitted to budget v3 (the three the 10-19 cost model put over: Raven Harbinger, Bone Diviner, The Magnate Duck). ${down} were toned down, ${up} lifted. Every change passes budget v3 at today's \`value\` S.`,
  `- **Cards the pass measures (${measured.length}, the report-only groups aside): ${inBefore} in band before, ${inBand(measured)} after; more than 8 points out: ${out8Before} → ${out8(measured)}.**`,
  `- **Rarity:** ${Object.keys(rar).length} moves (${Object.entries(rar).map(([id, x])=> `${NOW[id].name} ${rn(x.from)} → ${rn(x.to)}`).join(', ')}). Every other mismatch is fixed by stats, or is a 2+ Lumber card (the yardstick's known bias, below), or waits for your call.`,
  `- **Sources:** ${(plan.sources || []).length} cards got a source: ` + Object.entries(srcK).map(([k, v])=> `${v} ${k}`).join(', ') + `. ${(plan.sourceless || []).length} stay without one, each with its reason (Dragons, enemy-only bosses, cards held for maps past 24, parked designs). The test allows exactly that list.`,
  cbAfter.length ? `- **The road curve:** reference decks rebuilt, then all ${cbAfter.length} main fights measured (120 games, the measure seeds): ${green(cbMid)} green before the retune, **${green(cbAfter)} green after**${cbFresh.length ? `; ${green(cbFresh)} on fresh seeds` : ''}.` : '- **The road curve:** (pending)', '');
md.push('## How it was measured', '',
  '- **The yardstick** is `tools/card_balance.js`\'s test, unchanged: the card at Level 1 (a Level 0 card at its Level 1 stats), 8 copies (6 / 4 / 3 at 1 / 2 / 3+ Lumber) in a deck of the reference filler, against 20 filler cards; Open battles, 60 rounds, its fixed seeds (7700 + 131k). `tools/card_pass_2026_10_19.js` plays the same games with more of them, sharded and resumable.',
  '- **The bands** are the tool\'s (Common 35–60%, Uncommon 45–68%, Rare 52–75%, Very Rare 56–80%, Super Rare 60–84%, Epic 62–87%, Heroic 64–89%, Unique 66–92%, Legendary 70–97%).',
  '- **Games:** 100 for every live card (±5 points, one standard error), then 400 for every card more than 3 points out (±2.5; ±5 at 95%). A change was searched only for cards **more than 8 points out at 400 games**.',
  '- **The search** (per card): Attack in steps of 1 and Health in steps of 10% toward the band, smallest change first (budget units 2|ΔA| + |ΔH|), each variant checked against budget v3 **before** it is played (today\'s `value` S, never measuredS), the first that lands inside the band with 2 points to spare at 100 games is confirmed at 400. For a 2+ Lumber card far under its band, the 2026-10-18 Lumber cut (one less, two for 3+, stats re-fitted to the budget) is tried after the stat steps, and kept **only if it lands in the band**, as on 10-18. The strong side and the steps that crossed the band were re-run with every step at 400 games.',
  '- **Kept:** inside the band at 400 games (IN); or 5+ points nearer without passing the far edge and with no Lumber change (TOWARD); or past the far edge by under a point (EDGE, inside the noise). Anything else is left and reported.',
  '- **Report-only groups** (measured, not changed; the 2026-10-18 pass\'s skip list by rule): starter and Base starter-deck cards, the reference filler (changing it moves every number), Legendaries / Dragons / the great beasts (your call is pending), enemy-only bosses, raid cards, eggs, materia, equipment, the spell, the secret card, and deck-plan cards **below** their band (Ecclesia, Devilry, Remember, Changelings, Lumberjack / Timber, Sacrifice: the filler can\'t feed their plan). Deck-plan cards and walls **above** their band show their strength without their plan, so they were tuned.',
  '- **Bounty is not a deck-plan skill here.** The 10-18 pass counted it as a Lumber maker; most Bounty cards are plain fighters (Badger Berserker, War Hound, Squire\'s Mount, Bramblewood Lynx …) that measured 89–95%. Bounty costs 0.5 a point today and measures 11.65: the clearest case of "fixed with stats now, would be fixed by applying measuredS".', '');
md.push('## The changed cards', '', '"Before" is 400 games where the card was confirmed (100 for the few only screened); "after" is 400 games at the new stats. The measuredS column says where the skill\'s measured worth explains the miss.', '');
tbl(['Card', 'Rarity', 'Lumber', 'Was', 'Now', 'Win rate', 'Band', 'Result', 'measuredS note'], changed.map(r=> [r.name, r.rarity, r.lumber, r.was, r.now, `${pct(r.wrBefore)} → ${pct(r.wrAfter)}`, r.band, r.verdict, r.measured]));
const caught = changed.filter(r=> /would have caught/.test(r.measured)), freed = changed.filter(r=> /frees/.test(r.measured)), under = changed.filter(r=> /under-costed/.test(r.measured) && !/would have caught/.test(r.measured));
md.push('### Would be fixed by applying measuredS', '', `${caught.length + freed.length + under.length} of the changed cards are out of band because the skill's measured worth differs from its cost. All are fixed with stats now. What applying measuredS (the hub's 🧮 Skill costs) would do for them:`, '');
md.push(`- **The budget would have forced the change** (${caught.length}): at measuredS their old stats fail budget v3.`); caught.forEach(r=> md.push(`  - ${r.name} (${r.was} → ${r.now}): ${r.measured.replace(/: with measuredS.*$/, '')}.`));
md.push(`- **The skill is under-costed, but the budget still has room even at measuredS** (${under.length}): measuredS explains the miss, the budget wouldn't force it, so stats were the fix either way.`); under.forEach(r=> md.push(`  - ${r.name} (${r.was} → ${r.now}): ${r.measured}.`));
md.push(`- **The skill is over-costed: measuredS frees budget for the buff** (${freed.length}): today's budget allowed the buff found; with measuredS a bigger one would fit.`); freed.forEach(r=> md.push(`  - ${r.name} (${r.was} → ${r.now}): ${r.measured.replace(/^skill over-costed /, '').replace(/: applying measuredS frees/, ', frees')}.`));
md.push('');
md.push('## Rarity', '', 'Every card\'s win rate was checked against every band. The moves applied are the clear mismatches no stat change can fix:', '');
Object.entries(rar).forEach(([id, x])=> md.push(`- **${NOW[id].name}** ${rn(x.from)} → **${rn(x.to)}**: ${x.why}.`));
md.push('', 'Not moved, and why:', '',
  '- **The bands overlap** (Common 35–60, Uncommon 45–68, Rare 52–75 …), so a card 3–8 points out of its band is usually inside the next one too; that is noise and yardstick, not a mismatch. 30 cards sit there (Alpine Marmot, Hedgehog Scout, Dung Beetle, Tide-Pool Crab at 66–68% as Commons; Archerfish, Rockslide Ram, Electric Ray at 73–75% as Uncommons …). They are in the All cards sheet.',
  '- **2+ Lumber cards measure 25–45% whatever their rarity** (the 10-18 finding: Lumber only comes from discards, so a costly card arrives late in the filler test). An Epic at 48% at 2 Lumber is strong for a 2-Lumber card, so the yardstick can\'t call its rarity. The ones left are in the Left sheet.',
  '- **Up-moves on the road are capped:** a card that fights in a Map 13 skirmish can\'t become Very Rare (the cap is Rare to Map 15). Fawn Scout stops at Rare for that reason.',
  '- **Your calls:** Burrow Rabbit (Starter, 85%) and Crimson Wing Recruit (Starter, 79%) perform like Epics; Otter Centurion (Rare, Base, 84%) like a Super Rare. They are starter-deck cards in every reference deck, so I left them: changing them reshapes the tutorial and the whole curve.', '');
md.push('## Sources', '', `Before the pass, ${(plan.sources || []).filter(s=> !(s.from && s.from.kind === 'map' && s.from.node)).length + (plan.sourceless || []).length} live cards could not be had (no source, a design-day record \`{kind:"design"}\`, or a map without a fight). The rules, in order:`, '',
  '1. **Fixed homes**: the map leaders with no home take their map\'s last fight, as every other map leader does (The Gannet Queen 3-7, Old Snapjaw 5-7, the Triumvirate the siege\'s boss 23-8); the shrine cards their 2026-10-16 homes (Shrine Steps 20-4, the Quiet Summit\'s 21-6).',
  '2. **A fight it already plays in**, inside the road\'s reward cap for that fight: fewest rewards first (no fight above 3), its namesake fight, more copies, a main map, an elite or boss for the rarer cards.',
  '3. **A fight of a map whose theme has its type** (the thematic pass\'s THEMES), within 3 maps of its home (the 2026-10-16 placement\'s home, its suggested map if that map exists now, or where it fights).',
  '4. **The packs**: the basic pack pool (Hedgerow Pouch, Tidemire Chest, Highcrest Case) for the rest, Common to Epic; the two irradiated mutants to the Mystery Booster with the other oddities.', '',
  `- **Moved** (${(plan.sources || []).filter(s=> s.from && s.from.kind === 'map' && s.from.node).length}): rewards that sat clearly off their map's theme and outside their fight: ` + (plan.sources || []).filter(s=> s.from && s.from.kind === 'map' && s.from.node).map(s=> `${s.name} (${s.from.node} → ${s.source.node})`).join(', ') + '.',
  `- **Kept as they are** (${(plan.oddSources || []).length}): the other off-theme rewards are plausible where they are (a Balloon Archer on the flight map, the Tide Spirit in the tidal mangroves, field cards); the Odd sources sheet lists them.`,
  '- **The dynamite-packrat** had a map with no fight (`{kind:"map", id:"m4"}`); it is now the reward of a Caves & Alcoves fight. **MissingNo.** keeps its fightless Map 21 pointer: its secret isn\'t built.',
  '- **The reference decks** count main-map rewards (not side maps, not packs), so the new main-map rewards enter them; that is part of why the decks were rebuilt.', '');
tbl(['Card', 'Rarity', 'Source', 'Why'], (plan.sources || []).map(s=> [s.name, rn(s.rarity), s.source.kind === 'map' ? s.where : srcTxt(s.source), s.why]));
md.push('### Cards that stay without a source', '', 'The allowed list (`SOURCELESS` in `tools/card_pass_2026_10_19.js`; `tests/card-pass-2026-10-19.js` fails on any other sourceless live card). Materia have their own giver and aren\'t counted; tokens and test cards aren\'t live.', '');
tbl(['Card', 'Rarity', 'Why'], (plan.sourceless || []).map(s=> [s.name, rn(s.rarity), s.why]));
md.push('## Left for you', '', 'Cards still more than 8 points out after the pass, with the nearest step tried:', '');
tbl(['Card', 'Rarity', 'Lumber', 'Stats', 'Win rate', 'Band', 'Nearest step', 'Why left', 'measuredS'], leftRows);
md.push('**Legendaries and Dragons (report only):** the five Dragons and the Caldera Wyrm are still over budget v3 (your pending call; the Fit would be about 10/37–10/39 and 6/19). At 4 Lumber the Dragons, the Leviathan, the Dragon-Turtle and Starfall Owl all measure 33–34%, the 4-Lumber floor of this yardstick, so it can\'t rate them; the Old Willow of the Ford is in band (94%); the Cathedral Eagle (11%) is a Prayer card. Nothing here is wildly off in a way stats would fix, so none changed. The Magnate Duck lost one Health to fit budget v3 (6/60 → 6/59).', '');
md.push('**Starters (report only):** Burrow Rabbit 85%, Crimson Wing Recruit 79% (band 20–48%); Otter Centurion 84% (Rare, Base). The weak end (Duckling, Guppy, Garden Snail, Earthworm at 1–4%) is the starter sets\' 1/1s and 0/4s, as designed.', '');
// curve
md.push('## The road curve', '');
if(cbAfter.length){
  md.push(`The reference decks were rebuilt first (\`node tools/skirmish_pass.js decks --keep\`: each map's current deck is a candidate, so a deck only changes when the search finds a better one), then every main fight was measured on the measure seeds (120 games). The retune is the curve tuner as R2 / TH ran it (\`curve\`, themes on): CPU deck moves, then the Shield, then Health.`, '');
  tbl(['', 'Green', 'Too easy', 'Too hard'], [['Before this package (TH final)', green(thAfter), thAfter.filter(r=> r.green === 'easy').length, thAfter.filter(r=> r.green === 'hard').length],
    ['New cards, rebuilt decks, before the retune', green(cbMid), cbMid.filter(r=> r.green === 'easy').length, cbMid.filter(r=> r.green === 'hard').length],
    ['After the retune', green(cbAfter), cbAfter.filter(r=> r.green === 'easy').length, cbAfter.filter(r=> r.green === 'hard').length]].concat(cbFresh.length ? [['After, fresh seeds (5100 + 37g, never tuned on)', green(cbFresh), cbFresh.filter(r=> r.green === 'easy').length, cbFresh.filter(r=> r.green === 'hard').length]] : []));
  const ch = curveRows.filter(r=> r.moves);
  md.push(`**${ch.length} fights retuned.** The Curve sheet has every fight; the changed ones:`, '');
  tbl(['Fight', 'Kind', 'Target (green)', 'Before', 'Rebuilt', 'After', 'Retune'], ch.map(r=> [`${r.code} ${r.name}`, r.kind, `${r.target}% (${r.lo}–${r.hi})`, pct(r.th), pct(r.mid), pct(r.after) + (r.green !== 'green' ? ` (${r.green})` : ''), r.moves]));
  const off = curveRows.filter(r=> r.green !== 'green'); if(off.length){ md.push('**Still off the curve:** ' + off.map(r=> `${r.code} ${pct(r.after)} (${r.lo}–${r.hi})`).join(', ') + '.', ''); }
  if(cbFresh.length){ const offF = cbFresh.filter(r=> r.green !== 'green'); md.push(`**Fresh seeds** (5100 + 37g, 120 games, never tuned on): ${green(cbFresh)} of ${cbFresh.length} green (TH had 145, R2 157); the ${offF.length} others are ${offF.filter(r=> r.green === 'easy').length} too easy and ${offF.filter(r=> r.green === 'hard').length} too hard, ` +
    `${offF.filter(r=> Math.min(Math.abs(r.win - r.lo), Math.abs(r.win - r.hi)) <= 8).length} of them within 8 points of their band. The mean of both seed sets is green for ${cbAfter.filter(r=>{ const f = FR[key(r)]; if(!f) return false; const m = (r.win + f.win) / 2; return m >= r.lo && m <= r.hi; }).length} fights. At 120 games two seed sets differ by about 6 points.`, ''); }
  // big Shields the retune set (over three times the rule), a call for the owner as in R2 / TH
  try{ const B = require('./lib_bramble.js'), big = [];
    curveRows.forEach(r=>{ const [mid, k] = [cbAfter.find(x=> (x.code || x.key) === r.code), null]; if(!mid) return; const node = B.byKey(mid.map, mid.key); if(!node) return; B.G.NODE_MAP_HINT.set(node, mid.map);
      const rule = B.G.ruleShieldOf(node), b = (nb[key(mid)] || {}).shield || 0, a = (na[key(mid)] || {}).shield || 0; if(a !== b && a > 3 * Math.max(1, rule)) big.push([`${r.code} ${r.name}`, rule, b, a]); });
    if(big.length){ md.push('**Shields over three times the rule** that the retune set (your call, as in R2 / TH):', ''); tbl(['Fight', 'Rule', 'Before', 'Now'], big); } }catch(e){ md.push('(Shield list: ' + e.message + ')', ''); }
  md.push('**The Pale Desert (18-A)**, a side map the pale-desert test holds to its curve with the bramble by rule: the rebuilt Map 18 deck put 18-A-4 under its band (66.7%, target 77) and 18-A-8 over (70.8%, target 60). Two hand swaps inside the map\'s own cards: 18-A-4 Meerkat Warrens one Caustic Scorpion → one Meerkat Burrower (78.3%, fresh 84.2%), 18-A-8 The Dry Well two Thorny Devils → two Pale Oryx (60%, fresh 55.8%). Its stored measure is refreshed. The other side maps were not retuned (the brief: the main-map curve).', '');
  md.push('### The reference decks', '');
  tbl(['Map', 'Before', 'After'], Object.keys(dA.road).map(Number).sort((a, b)=> a - b).map(n=> [n, deckTxt(dB.road[n]), deckTxt(dA.road[n])]));
}
md.push('## Decisions for you', '',
  `1. **Apply measuredS?** The pass used today\'s \`value\`s. Bounty (0.5 → 11.65 a point) is the big one: ${changed.filter(r=> r.verdict !== 'FIT' && (NOW[r.id].effects || {}).bounty && r.wrBefore > 75).length} Bounty fighters measured 76–95% and are cut now. Arrow (Petal Fletcher, still 87.5% at 1/1, the stat floor) and Shadow (worth below zero as measured: Margay stays at 28%, no budget-legal buff moves it) are the others. The "would be fixed by applying measuredS" list above is the set to look at.`,
  '2. **Starters:** Burrow Rabbit, Crimson Wing Recruit and Otter Centurion measure far over their band and sit in every reference deck. Tone them down (and retune the early road), or leave the starter decks strong?',
  '3. **Sacrifice:** Ash Imp and Cinder Imp stay at 94–97% whatever their stats; Puppeteer Imp 99% at 2/5. A Sacrifice cost, not stats.',
  '4. **The weak 2+ Lumber cards** (Left sheet): the 10-18 Lumber cut overshoots for Ember Revenant and the Marshal of Rivergate (48–51% → 98% at 1 Lumber), and misses for the others. Their skills or the costly-card rule need a look; the new leaders (The Gannet Queen, Old Snapjaw, the Triumvirate) are among them.',
  '5. **Dragons / Caldera Wyrm over budget:** unchanged, still your call.',
  '6. **Sources:** the 37 sourceless cards, especially the parked ones (Elementals, ravens, hive structures, Moon Jelly, the mutant): keep them parked or place them now? And the 15 odd rewards kept where they are.',
  '7. **Packs:** 32 cards joined the basic pack pool (most of them the 10-12 / 10-14 design cards). If you\'d rather they were rewards of new fights, the plan file lists them.', '');
md.push('## Files', '',
  '- `tools/card_pass_2026_10_19.js`: `measure`, `search`, `plan`, `sources`, `apply`, `report`; `SOURCELESS`, the fixed homes and the moves.',
  '- `tools/card_pass_docs_2026_10_19.js` and `tools/card_pass_xlsx.py`: this doc\'s tables and the workbook.',
  '- `tools/skirmish_pass.js`: `decks --keep` (the current deck is a candidate).',
  '- `canonical/cards.json`: the stats, rarities and sources; each changed card has a `2026-10-19 (card pass, package CB)` line in its creatorNote.',
  '- `arena_app.js`: the reference decks (`WINRATE_REF_DECKS`) and the retuned fights.',
  '- `docs/balance/`: `card-pass-screen*` / `-confirm*` / `-search*` / `-refine*` (the measures), `card-pass-plan.json` (the choices), `card-balance.json` (rewritten from these measures, so the deck tools rank by today\'s numbers), `skirmish-pass-cb-*.jsonl` (the curve), `card-pass-curve-fixes*.jsonl` (the retune), `card-pass-nodes-before/after.json`, `card-pass-decks-before.json`.',
  '- `tests/card-pass-2026-10-19.js` (in run-all).', '');
fs.writeFileSync(path.join(ROOT, 'docs', 'card-pass-2026-10-19.md'), md.join('\n'));
console.log('doc written:', md.length, 'lines;', sheets.length, 'sheets');
