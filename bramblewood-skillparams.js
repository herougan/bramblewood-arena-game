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
  function isFused(k, v){
    const f = has(FAM, k) ? FAM[k] : null; if(!f || !plainObj(v)) return false;
    const ks = Object.keys(v); return ks.length > 0 && ks.every(x=> x === 'v' || has(f.params, x));
  }
  function needsExpand(e){ if(!plainObj(e)) return false; for(const k in e){ if(isFused(k, e[k])) return true; } return false; }
  function expand(e){
    if(!needsExpand(e)) return e;
    const out = {};
    Object.keys(e).forEach(k=>{ const v = e[k];
      if(!isFused(k, v)){ out[k] = v; return; } // a flat key after the object (a cloud override merged in) wins: the later one counts
      if(!has(v, 'v')) out[k] = true; else if(v.v !== null) out[k] = v.v;
      const ps = FAM[k].params; Object.keys(ps).forEach(f=>{ if(has(v, f)) out[ps[f]] = v[f]; });
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
    return out;
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
  return {PARAMS: P, FAMILIES: FAM, ALIAS, isFused, needsExpand, expand, fuse, expandDef, fuseDef, expandDefsInPlace, aliasOf, familyOf, fusedKey};
});
