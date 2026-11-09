// Skill parameters (2026-11-07, package ENG35; owner 20:58: "Fuse skills together. For example, Almanac number and grant are the same. In
// the game too, fuse them. It's just a matter of parameter choice"). One skill per idea: a family's key (almanac, nocturnal, tide, arrow ...)
// holds true (the default), a plain value (as before), or an object of named parameters {v, gives, hp, ...} (canonical/skill-params.json).
// The rules code keeps reading the old flat keys (almanacGrant, nocturnalHp ...), so a card is expanded once when it is read:
//   expand(effects)      fused object -> the flat keys (v -> the key itself; v absent = true; v null = no base value), other keys as they are
//   fuse(effects)        old flat twin keys -> the fused object (the fold tool, the editor's save); idempotent; key order kept (the family
//                        sits where its first key was)
//   expandDef(def)       a card def with its effects and each levelSkills level expanded (the same object when nothing needs it)
//   expandDefsInPlace(defs)  every def of a defs map, in place (the engine; the same map object, so callers that patch it later still reach it)
//   aliasOf(key)         an old twin key -> [family, param] (deliveryRes -> ['delivery', 'res'], kinglyGrant -> ['king', 'gives']), else null
//   familyOf(key)        the family's entry (params, default, number, stat, ability, about), for the fused key or any of its old keys
// ENG39 (2026-11-09, owner decision DES2-3 a: "Merge all 15 groups as parameters (ENG35)"): a family may also list KINDS, its named
// versions ("kinds": {"<selector>": {"<value>": "<old key>"}}). An old skill with its own rule and price (Weaken, Scar, Requiem, Archer ...)
// is written as its family's key plus the selector: "daunt": {"v": 1, "lasts": "lasting"} expands to "weaken": 1; "carnage": {"v": 5,
// "who": "any", "gives": {...}} to "requiem": 5 + "requiemGrant"; a kind that is a family keeps its own parts. fuse() folds the old key into
// the family (only when the card holds no other version of that family: the second stays its old key). kindOf(key) -> [family, {selector:
// value ...}]; rootOf(key) -> the family key a part or a kind belongs to (requiemGrant -> carnage); kindsOf(family) -> [{match, key}].
// A kind may need two selectors at once ("kindSets": Fire Bolt is "arrow": {"v": 2, "type": "fire", "form": "bolt"}; owner 23:05 on ENG35-2).
// DOM-free. Node: require('./bramblewood-skillparams.js') reads canonical/skill-params.json; the page: assemble_arena.py puts
// __SKILL_PARAMS__ and this file ahead of the engine (global BramblewoodSkillParams).
(function(root, factory){
  if(typeof module === 'object' && module.exports){ let P = null; try{ P = require('./canonical/skill-params.json'); }catch(e){} module.exports = factory(P); }
  else root.BramblewoodSkillParams = factory(typeof __SKILL_PARAMS__ !== 'undefined' ? __SKILL_PARAMS__ : null);
})(typeof self !== 'undefined' ? self : this, function(P){
  'use strict';
  P = P && P.families ? P : {families: {}, fields: {}};
  const FAM = P.families, ALIAS = {};
  Object.keys(FAM).forEach(k=>{ const ps = FAM[k].params || {}; Object.keys(ps).forEach(f=>{ if(!ALIAS[ps[f]]) ALIAS[ps[f]] = [k, f]; }); }); // first family wins a shared key (deliveryRes: delivery, stemGrant: stem)
  const has = (o, k)=> Object.prototype.hasOwnProperty.call(o, k);
  const plainObj = v=> !!v && typeof v === 'object' && !Array.isArray(v);
  // ENG39: the kinds. A family lists them as "kinds": {"<selector>": {"<value>": "<old key>"}} and, for a kind named by two selectors at once,
  // "kindSets": [{"match": {"type": "fire", "form": "bolt"}, "key": "fireBolt"}] (ENG35-2: one shot family, a damage type and a form).
  // FK[family] = [{match, key}]; SELS[family] = its selector names; KIND[old key] = [family, match] (the first family listing a key wins)
  const KIND = {}, FK = {}, SELS = {};
  Object.keys(FAM).forEach(k=>{ const ks = FAM[k].kinds || {}, list = [];
    Object.keys(ks).forEach(p=>{ Object.keys(ks[p]).forEach(val=> list.push({match: {[p]: val}, key: ks[p][val]})); });
    (FAM[k].kindSets || []).forEach(e=>{ const m = {}; Object.keys(e.match || {}).forEach(p=> m[p] = String(e.match[p])); list.push({match: m, key: e.key}); });
    if(!list.length) return; FK[k] = list; SELS[k] = new Set(); list.forEach(e=>{ Object.keys(e.match).forEach(p=> SELS[k].add(p)); if(!has(KIND, e.key)) KIND[e.key] = [k, e.match]; }); });
  // a selector value as written on a card: "true" -> true, "2" -> 2, else the name
  const selVal = s=> s === 'true' ? true : s === 'false' ? false : (/^-?\d+(\.\d+)?$/.test(s) ? Number(s) : s);
  const typedMatch = m=>{ const o = {}; Object.keys(m).forEach(p=> o[p] = selVal(m[p])); return o; };
  // the selectors an object uses: [selector names, old key]; null when it has none; false when no kind has exactly those values
  function selOf(k, v){
    const S = has(SELS, k) ? SELS[k] : null; if(!S) return null;
    const used = Object.keys(v).filter(p=> S.has(p)); if(!used.length) return null;
    const e = FK[k].find(x=>{ const ms = Object.keys(x.match); return ms.length === used.length && ms.every(p=> has(v, p) && String(v[p]) === x.match[p]); });
    return e ? [used, e.key] : false;
  }
  function isFused(k, v){
    const f = has(FAM, k) ? FAM[k] : null; if(!f || !plainObj(v)) return false;
    const ks = Object.keys(v); if(!ks.length) return false;
    const s = selOf(k, v); if(s === false) return false;
    if(s){ const tf = has(FAM, s[1]) ? FAM[s[1]] : null; return ks.every(x=> x === 'v' || s[0].includes(x) || (tf && has(tf.params, x))); }
    return ks.every(x=> x === 'v' || has(f.params, x));
  }
  // one fused key into out (a kind into its old key, and that key's own parts when it is a family)
  function expandOne(out, k, v){
    const s = selOf(k, v);
    if(s){ const rest = {}; Object.keys(v).forEach(x=>{ if(!s[0].includes(x)) rest[x] = v[x]; });
      if(has(FAM, s[1]) && Object.keys(rest).some(x=> x !== 'v')){ expandOne(out, s[1], rest); return; }
      if(!has(rest, 'v')) out[s[1]] = true; else if(rest.v !== null) out[s[1]] = rest.v; return; }
    if(!has(v, 'v')) out[k] = true; else if(v.v !== null) out[k] = v.v;
    const ps = FAM[k].params; Object.keys(ps).forEach(f=>{ if(has(v, f)) out[ps[f]] = v[f]; });
  }
  function needsExpand(e){ if(!plainObj(e)) return false; for(const k in e){ if(isFused(k, e[k])) return true; } return false; }
  function expand(e){
    if(!needsExpand(e)) return e;
    const out = {};
    Object.keys(e).forEach(k=>{ const v = e[k];
      if(!isFused(k, v)){ out[k] = v; return; } // a flat key after the object (a cloud override merged in) wins: the later one counts
      expandOne(out, k, v);
    });
    return out;
  }
  function fuse(e0){
    if(!plainObj(e0)) return e0;
    const e = expand(e0), out = {}, used = new Set();
    const famObj = (k, base)=>{ const ps = FAM[k].params, o = {}; let any = false;
      if(base !== undefined && base !== true) o.v = base; if(base === undefined) o.v = null;
      Object.keys(ps).forEach(f=>{ const ok = ps[f]; if(has(e, ok) && !used.has(ok)){ o[f] = e[ok]; used.add(ok); any = true; } });
      return any ? o : null; };
    Object.keys(e).forEach(k=>{
      if(used.has(k)) return;
      if(has(FAM, k)){ used.add(k); const o = famObj(k, e[k]); out[k] = o || e[k]; return; }
      const a = has(ALIAS, k) ? ALIAS[k] : null;
      if(a){ // a part whose base comes later keeps waiting for it; a part with no base anywhere becomes {v: null, part}
        if(Object.keys(FAM).some(b=> has(e, b) && !used.has(b) && Object.values(FAM[b].params).includes(k))) return;
        const o = famObj(a[0], undefined); if(o){ used.add(a[0]); out[a[0]] = o; } return;
      }
      out[k] = e[k];
    });
    // ENG39: a kind (weaken, requiem ...) folds into its family, when the card holds no other version of that family
    const present = new Set(Object.keys(out)), claimed = new Set(), res = {};
    Object.keys(out).forEach(k=>{
      const kd = has(KIND, k) ? KIND[k] : null, v = out[k];
      if(!kd || present.has(kd[0]) || claimed.has(kd[0])){ res[k] = v; return; }
      claimed.add(kd[0]); const o = {};
      if(plainObj(v) && has(FAM, k) && isFused(k, v)){ if(has(v, 'v')) o.v = v.v; Object.assign(o, typedMatch(kd[1])); Object.keys(v).forEach(x=>{ if(x !== 'v') o[x] = v[x]; }); }
      else { if(v !== true) o.v = v; Object.assign(o, typedMatch(kd[1])); }
      res[kd[0]] = o;
    });
    return res;
  }
  function expandDef(d){
    if(!d || typeof d !== 'object') return d;
    const fx = d.effects, ls = d.levelSkills;
    const eNeed = needsExpand(fx), lNeed = plainObj(ls) && Object.keys(ls).some(L=> needsExpand(ls[L]));
    if(!eNeed && !lNeed) return d;
    const out = Object.assign({}, d);
    if(eNeed) out.effects = expand(fx);
    if(lNeed){ out.levelSkills = {}; Object.keys(ls).forEach(L=>{ out.levelSkills[L] = expand(ls[L]); }); }
    return out;
  }
  function fuseDef(d){
    if(!d || typeof d !== 'object') return d;
    const out = Object.assign({}, d);
    if(plainObj(d.effects)) out.effects = fuse(d.effects);
    if(plainObj(d.levelSkills)){ out.levelSkills = {}; Object.keys(d.levelSkills).forEach(L=>{ out.levelSkills[L] = fuse(d.levelSkills[L]); }); }
    return out;
  }
  function expandDefsInPlace(defs){
    if(!defs || typeof defs !== 'object') return defs;
    Object.keys(defs).forEach(id=>{ const d = defs[id], x = expandDef(d); if(x !== d) defs[id] = x; });
    return defs;
  }
  function aliasOf(k){ return has(ALIAS, k) ? ALIAS[k].slice() : null; }
  function familyOf(k){ if(has(FAM, k)) return Object.assign({key: k}, FAM[k]); const a = aliasOf(k); return a ? Object.assign({key: a[0]}, FAM[a[0]]) : null; }
  // the fused key for any key: an old twin key's family, else the key itself
  function fusedKey(k){ const a = aliasOf(k); return a ? a[0] : k; }
  // ENG39: a kind's family and selector; the family any key belongs to (a part's, then a kind's); a family's kinds
  function kindOf(k){ return has(KIND, k) ? [KIND[k][0], typedMatch(KIND[k][1])] : null; }
  function rootOf(k){ const b = fusedKey(k); return has(KIND, b) ? KIND[b][0] : b; }
  function kindsOf(k){ return (has(FK, k) ? FK[k] : []).map(e=> ({match: typedMatch(e.match), key: e.key})); }
  return {PARAMS: P, FAMILIES: FAM, ALIAS, KIND, isFused, needsExpand, expand, fuse, expandDef, fuseDef, expandDefsInPlace, aliasOf, familyOf, fusedKey, kindOf, rootOf, kindsOf};
});
