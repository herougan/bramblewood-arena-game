// SKAUD1 inventory v2: per skill key (expanded through bramblewood-skillparams.js, so kinds read as their old keys), the cards today and after the REDESIGN3 fold.
const ROOT=require('path').resolve(__dirname,'../..');
const fs=require('fs');
const L=require(ROOT+'/tools/redesign3/lib.js');
const SP=require(ROOT+'/bramblewood-skillparams.js');
const R3=JSON.parse(fs.readFileSync(ROOT+'/docs/design/redesign3-2026-11-17.json','utf8'));
const FOLD={}; R3.fold.forEach(f=>FOLD[f.id]=f);
(R3.special||[]).forEach(s=>(s.carriers||[]).forEach(c=>{ if(c.changed) FOLD[c.id]=FOLD[c.id]||{id:c.id,effects:c.effects,attack:c.attack,health:c.health,special:true}; }));
const POOLS=L.POOLS; const ALLMAPS=Object.keys(POOLS);
const where={};
function add(id,t){ (where[id]=where[id]||[]).push(t); }
ALLMAPS.forEach((mid,mi)=>{ const p=POOLS[mid];
  (p.cards||[]).forEach(id=>add(id,'M'+mi));
  Object.entries(p.submaps||{}).forEach(([s,ids])=>ids.forEach(id=>add(id,'S'+mi)));
  (p.special||[]).forEach(id=>add(id,'X'+mi));
});
// R3 moves: a moved card's main list becomes its new map
R3.fold.forEach(f=>{ if(f.map!==undefined && f.from!==f.map){ where[f.id]=(where[f.id]||[]).filter(t=>!/^M/.test(t)); where[f.id].unshift('M'+f.map); } });
const app=fs.readFileSync(ROOT+'/arena_app.js','utf8');
function keysOf(eff){ const out={}; if(!eff) return out; let e=eff; try{ e=SP.expand(eff)||eff; }catch(x){}
  Object.keys(eff).forEach(k=>{ if(k!=='triggers') out[k]=1; });
  Object.keys(e).forEach(k=>{ if(k!=='triggers') out[k]=1; });
  return Object.keys(out); }
function trigsOf(eff){ return ((eff&&eff.triggers)||[]).map(t=>(t.on||'?')+'>'+(t.do||'?')); }
const inv={}, inv3={}, trig={}, trig3={};
const push=(o,k,v)=>{ (o[k]=o[k]||[]).push(v); };
L.CARDS.forEach(c=>{
  const lv=Object.assign({}, ...Object.values(c.levelSkills||{}));
  const now=Object.assign({}, lv, c.effects||{});
  const f=FOLD[c.id]; const after=f?Object.assign({}, lv, f.effects):now;
  keysOf(now).forEach(k=>push(inv,k,c.id)); keysOf(after).forEach(k=>push(inv3,k,c.id));
  trigsOf(now).concat(trigsOf(lv)).forEach(p=>push(trig,p,c.id)); trigsOf(after).forEach(p=>push(trig3,p,c.id));
});
const cardInfo={};
L.CARDS.forEach(c=>{ const w=where[c.id]||[];
  const mainMap=(w.find(t=>/^M\d+$/.test(t))||'').slice(1);
  const road=w.some(t=>+t.slice(1)<=20);
  const easter=!!c.easterEgg, test=!!c.test, token=!!c.token;
  const inApp=app.includes("'"+c.id+"'")||app.includes('"'+c.id+'"');
  cardInfo[c.id]={name:c.name,A:c.attack,H:c.health,r:c.rarity,where:[...new Set(w)],main:mainMap===''?null:+mainMap,road,app:inApp,test,token,easter,boss:!!(c.worldBoss||c.raid),hidden:!!c.hidden,unatt:!!c.unattainable,eff:c.effects,lv:c.levelSkills||null,r3:FOLD[c.id]?FOLD[c.id].effects:null,fill:L.fillOf(c,c.effects||{},c.attack,c.health).fill};
});
fs.writeFileSync(process.argv[2],JSON.stringify({inv,inv3,trig,trig3,cardInfo}));
console.log(Object.keys(inv).length, Object.keys(inv3).length);
