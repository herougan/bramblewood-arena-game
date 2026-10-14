// Prints every skill in the game's skill definitions (SKILL_DEFS in arena_app.js) as JSON:
// {skills:[{key, label, icon, kind, category, valueKind}], budget:SB_DEFAULT_SKILLS, halfMiss:SB_HALF_MISS, v2:SB_V2_DEFAULTS}.
// Used by tools/cardplan/skill_n_sheet.py. Evaluates only the definition blocks, in a sandbox,
// with a catch-all scope so helper functions the definitions mention don't need to exist.
const fs = require('fs'), vm = require('vm'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'arena_app.js'), 'utf8');
function block(startRe, endRe){
  const s = src.search(startRe); if(s < 0) throw new Error('not found ' + startRe);
  const rest = src.slice(s), m = rest.match(endRe); return rest.slice(0, m.index + m[0].length);
}
const parts = [
  block(/^const SKILL_ICON = /m, /\};\n/),
  block(/^const PASSIVE_DEFS = \[/m, /\n\];\n/),
  block(/^const ACTIVE_PRESETS = \[/m, /\n\];\n/),
  block(/^const SKILL_DEFS = \[/m, /\n\];\n/),
  block(/^const SB_DEFAULT_SKILLS = /m, /\};\n/),
  block(/^const SB_HALF_MISS = /m, /\];\n/),
  block(/^const SB_V2_DEFAULTS = /m, /\};\n/),
];
const stub = ()=>{ const f = function(){ return f; }; return f; };
const scope = new Proxy({}, {has:(t, k)=> !(k in globalThis) || k === 'undefined' ? k !== 'undefined' : false, get:(t, k)=> k in t ? t[k] : stub(), set:(t, k, v)=>{ t[k] = v; return true; }});
const code = 'with(__p){' + parts.join('\n').replace(/^const /gm, 'var ') + '\n;__out = {SKILL_ICON, SKILL_DEFS, SB_DEFAULT_SKILLS, SB_HALF_MISS, SB_V2_DEFAULTS};}';
const ctx = vm.createContext({__p: scope, Object, Array, Number, String, Math, JSON, Set, Map, RegExp, Boolean});
vm.runInContext(code, ctx);
const {SKILL_ICON, SKILL_DEFS, SB_DEFAULT_SKILLS, SB_HALF_MISS, SB_V2_DEFAULTS} = scope.__out;
const seen = new Set(), rows = [];
SKILL_DEFS.forEach(s=>{
  if(!s || !s.key || seen.has(s.key)) return; seen.add(s.key);
  const vk = s.kind || 'boolean';
  const kind = s.category === 'evergreen' ? 'trigger' : (vk === 'boolean' || vk === 'none' ? 'flag' : 'number');
  let desc = ''; try{ desc = String(s.desc(vk === 'twoNumber' ? ['N','N'] : 'N')); }catch(e){}
  rows.push({key:s.key, label:s.label || s.key, icon:SKILL_ICON[s.key] || '', kind, category:s.category || '', valueKind:vk, desc});
});
process.stdout.write(JSON.stringify({skills:rows, budget:SB_DEFAULT_SKILLS, halfMiss:SB_HALF_MISS, v2:SB_V2_DEFAULTS}, null, 1));
