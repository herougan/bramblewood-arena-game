// 2026-11-27 (SKILLS3-B): road fights (Maps 0-20) where the changed rules can act: a Wet source meets fire, lightning or Cull {wet}; or a status-token skill
// node tools/skills3b_select_2026_11_27.js [--json]  -> the --only list for tools/skirmish_pass.js measure (docs/balance/skirmish-pass-post1127s*)
const path = require('path'), ROOT = path.join(__dirname, '..'); process.chdir(ROOT);
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const SPL = require(path.join(ROOT, 'bramblewood-skillparams.js'));
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const defs = G.getCardDefs ? G.getCardDefs() : B.CARD_DEFS_BASELINE;
const lvlFx = (d, L)=>{ try{ return BB.levelEffectsAt ? BB.levelEffectsAt(d, L) : (d.effects || {}); }catch(e){ return d.effects || {}; } };
function tags(id, L){ const d0 = defs[id]; if(!d0) return new Set(); const d = SPL.expandDef(d0), e = SPL.expand(lvlFx(d, Math.max(1, L || 1))) || {}, t = new Set();
  const trs = Array.isArray(e.triggers) ? e.triggers : [];
  if(e.tide || e.swimmer || e.supremeTide || e.waterBolt || e.wave || e.tsunami || e.rainmaker || d.dmgType === 'water' || trs.some(x=> x && x.dmgType === 'water')) t.add('wet');
  if(d.dmgType === 'heat' || e.fireArrow || e.fireBolt || e.immolation || e.slashBurn || e.fireHit || trs.some(x=> x && (x.dmgType === 'heat' || x.do === 'fireHit'))) t.add('fire');
  if(d.dmgType === 'shock' || e.electricity || e.chainLightning || e.shockBolt || e.lightning || e.dragonLightning || trs.some(x=> x && x.dmgType === 'shock')) t.add('shock');
  if(e.hunter && e.hunterVs === 'wet') t.add('fire');
  if(['rend', 'enfeeble', 'harden', 'embolden', 'rendPlay', 'rendDeath', 'rendAround', 'enfeeblePlay', 'enfeebleDeath', 'hardenPlay', 'hardenDeath', 'emboldenPlay', 'emboldenDeath', 'dogfighter', 'attunement', 'warningColours'].some(k=> e[k]) || trs.some(x=> x && ['rend', 'enfeeble', 'harden', 'embolden'].includes(x.do))) t.add('token');
  return t; }
const out = [];
for(const m of G.CONQUEST_MAPS){ if(m.reserved || m.tower || m.endless) continue; const no = G.mapNumberOf(m.id); if(no == null || no > 20) continue;
  m.nodes.forEach(n=>{ if(!n.deck || !Object.keys(n.deck).length) return; const k = n.kind || 'skirmish'; if(k === 'tutorial' || k === 'raidboss') return;
    let rules = {}; try{ rules = G.fightRules(m, n) || {}; }catch(e){}
    const ref = (()=>{ try{ return G.referenceDeckFor(m.id, n) || {}; }catch(e){ return {}; } })();
    const lv = ref.level || 0, all = new Set(), why = [];
    Object.keys(n.deck).concat(n.leaders || []).forEach(id=> tags(id, lv).forEach(t=>{ all.add(t); why.push(t + ':' + id); }));
    Object.keys(ref.deck || {}).forEach(id=> tags(id, lv).forEach(t=>{ all.add(t); why.push(t + ':' + id + '(you)'); }));
    if(rules.tide || rules.permaTide || rules.highTide || rules.tideSpout || rules.field === 'rain'){ all.add('wet'); why.push('wet:rules'); }
    if(rules.thunderstorm){ all.add('shock'); why.push('shock:storm'); }
    if(rules.field === 'heatwave' || rules.wildfire || rules.volcano || Number(rules.eruption) > 0 || rules.lavaSpout){ all.add('fire'); why.push('fire:field'); }
    if(all.has('token') || (all.has('wet') && (all.has('fire') || all.has('shock')))) out.push({key: n.key, why: [...new Set(why)]}); }); }
if(process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1)); else { console.log(out.map(x=> x.key).join(',')); console.error(out.length + ' fights'); }
