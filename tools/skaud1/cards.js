// SKAUD1: the card moves for every merge / remove, priced with tools/skill_costs.js budget() at Level 1 (base: the REDESIGN3 fold where it changes the card).
const ROOT=require('path').resolve(__dirname,'../..');
const fs=require('fs');
const L=require(ROOT+'/tools/redesign3/lib.js');
const R3=JSON.parse(fs.readFileSync(ROOT+'/docs/design/redesign3-2026-11-17.json','utf8'));
const FOLD={}; R3.fold.forEach(f=>FOLD[f.id]=f);
(R3.special||[]).forEach(s=>(s.carriers||[]).forEach(c=>{ if(c.changed && !FOLD[c.id]) FOLD[c.id]={id:c.id,effects:c.effects,attack:c.attack,health:c.health}; }));
const trg=(on,doo,extra)=>Object.assign({on,do:doo},extra);
// key -> [ [cardId, fn(effects)->effects, note] ]
const del=k=>e=>{ const o=Object.assign({},e); delete o[k]; return o; };
const swap=(k,nk,v)=>e=>{ const o=Object.assign({},e); const old=o[k]; delete o[k]; o[nk]=(typeof v==='function')?v(old,o):v; return o; };
const addTrig=(k,t)=>e=>{ const o=Object.assign({},e); const old=o[k]; delete o[k]; o.triggers=(o.triggers||[]).concat([typeof t==='function'?t(old):t]); return o; };
const num=v=> typeof v==='number'?v:(v&&typeof v==='object'&&typeof v.v==='number'?v.v:1);
const MOVES={
  injured:[['hedgerow-shrew',del('injured')]],
  dirge:[['wolfsbane-alpha',e=>Object.assign({},e,{carnage:3})]],
  requiem:[['cinder-skeleton',e=>Object.assign({},e,{carnage:3})]],
  tally:[['raven-scout',e=>Object.assign({},e,{carnage:2})]],
  muster:[['wolf-pack-runner',e=>Object.assign({},e,{throng:10})]],
  beset:[['ravenous-wolverine',e=>Object.assign({},e,{throng:10})]],
  felling:[['golden-magpie',addTrig('felling',v=>trg('onKill','gain',{resource:'lumber',amount:num(v)}))],
           ['magnate-duck',addTrig('felling',v=>trg('onKill','gain',{resource:'lumber',amount:num(v)}))],
           ['prospector-mole',addTrig('felling',v=>trg('onKill','gain',{resource:'metal',amount:num(v)}))]],
  healing:['abbey-goose','nectar-vintner','vampire-bat-nurse','unicorn','peat-smoke-shaman','mossmother-newt','bumblebee-queen'].map(id=>[id,swap('healing','nursing',v=>num(v))]),
  quick:['jaguar-stalker','jackrabbit-sprinter','fleetfootd','pride-queen','ruby-throat-duelist','ember-centipede','great-barracuda','alpine-swift'].map(id=>[id,swap('quick','swift',true)]),
  sonar:['oilbird','cave-swiftlet','whip-spider','beluga'].map(id=>[id,swap('sonar','keenSense',true)]),
  spiteful:[['thornwood-palisade',swap('spiteful','thorns',v=>num(v))]],
  ichor:[['velvet-worm',swap('ichor','thorns',v=>num(v))]],
  prey:[['springbok-pronker',swap('prey','evasive',true)]],
  predator:['leopard-seal','marsh-harrier','hedge-weasel'].map(id=>[id,swap('predator','hunter',v=>({v:num(v),vs:'weaker'}))]),
  executioner:[['grave-grin-hyena',swap('executioner','hunter',v=>({v:num(v),vs:'wounded'}))]],
  rockSolid:[['quarry-troll',swap('rockSolid','hoard',{v:1,res:'stone'})]],
  ironWill:[['iron-warden',swap('ironWill','hoard',{v:1,res:'metal'})]],
  timber:[['heartwood-treant',e=>Object.assign({},e,{hoard:1})]],
  drought:[['dromedary',del('drought')]],
  rain:[['puddle-hopper',swap('rain','rainrunner',1)]],
  brood:['carrion-fly-swarm','swarm-matriarch','grotto-lobster','lemming-swarm'].map(id=>[id,swap('brood','offspring',v=>num(v))]),
  twin:[['puddle-changeling',swap('twin','offspring',1)]],
  sprout:[['seed-cache-squirrel',addTrig('sprout',v=>trg('onSpawn','spawnCard',{defId:'growth-sprout',count:num(v)}))],
          ['grovebearer-dragon-turtle',addTrig('sprout',v=>trg('onSpawn','spawnCard',{defId:'growth-sprout',count:num(v)}))]],
  quarry:[['badger-stonemason',swap('quarry','masonry',1)]],
  stonecutter:[['marmot-stonecutter',swap('stonecutter','masonry',1)]],
  lasso:[['yeti-snarer',swap('lasso','bola',1)]],
  rabid:[['rabid-jackal',e=>{ const o=Object.assign({},e); delete o.rabid; delete o.weakness; o.poison=2; return o; }]],
  weakness:[['rabid-jackal',e=>{ const o=Object.assign({},e); delete o.rabid; delete o.weakness; o.poison=2; return o; }]],
  toxin:[['cone-snail',swap('toxin','poison',v=>num(v))]],
  rocket:[['bombardier-beetle',swap('rocket','fireBolt',1)]],
  dragonLightning:[['thunder-lizard',swap('dragonLightning','electricity',v=>num(v))]],
  explode:[['marsh-gas-toad',swap('explode','dynamite',v=>v.damage>=6?3:2)],['creeper',swap('explode','dynamite',3)]],
  moonborn:[['lunar-howler',swap('moonborn','fullMoon',3)]],
  relict:[['nautilus-drifter',swap('relict','mountainClimber',true)]],
  shapeshifter:[['coffer-mimic',swap('shapeshifter','changeling',true)]],
  natureForce:[['lichen-tortoise',swap('natureForce','kinship',{type:'Elemental',atk:1,hp:1})]],
  bananarang:[['howler-monkey',swap('bananarang','boomerang',true)]],
  friction:[['grindstone-boar',swap('friction','recoil',v=>num(v))]],
  perforate:[['old-snapjaw',swap('perforate','pierce',v=>num(v))],['woodpecker-sapper',swap('perforate','pierce',v=>num(v))]],
  weaponMaster:[['armory',swap('weaponMaster','fletcher',v=>num(v))]],
  sentry:['fen-mink','goose-sentry','battlement-heron','water-scorpion','muntjac-barker'].map(id=>[id,swap('sentry','ambush',v=>v===true?2:num(v))]),
  onReadyDamage:['great-horned-owl','cave-warlord'].map(id=>[id,addTrig('onReadyDamage',v=>trg('onReady','damage',{amount:v.amount,dmgType:v.dmgType}))]),
  onSpawnDevilry:[['ash-imp',addTrig('onSpawnDevilry',v=>trg('onSpawn','gain',{resource:'devilry',amount:num(v)}))]],
  berserk:[['monarch-wingblade',e=>Object.assign({},e,{harbinger:1})],['tasmanian-devil',e=>Object.assign({},e,{harbinger:1})],['test-skill-berserk',e=>Object.assign({},e,{harbinger:1})]],
  scar:['savanna-cheetah','stoat-cutthroat','magma-titan'].map(id=>[id,e=>Object.assign({},e,{exploit:num(e.exploit)})]),
  breach:['beetle-battering-ram','peak-condor','badger-sapper','sawfish'].map(id=>[id,e=>Object.assign({},e,{puncture:num(e.puncture)})]),
  swipe:['jay-pilferer','tax-collector-teal'].map(id=>[id,swap('swipe','plunder',v=>({v:num(v),res:'lumber'}))]),
};
function trim(c, eff){
  let best=null; const A=c.attack, H=c.health;
  for(let da=0; da<=Math.floor(A/2); da++) for(let dh=0; dh<=Math.floor(H/2); dh++){
    const f=L.fillOf(c,eff,A-da,H-dh); if(f.b.ok){ const cost=3*da+dh; if(!best||cost<best.cost) best={cost,A:A-da,H:H-dh,fill:f.fill}; }
  }
  return best;
}
const out={};
Object.entries(MOVES).forEach(([k,list])=>{ out[k]=list.map(([id,fn])=>{
  const c0=L.BYID[id]; if(!c0) return {id,missing:true};
  const f=FOLD[id]; const c=Object.assign({},c0, f?{effects:f.effects,attack:f.attack,health:f.health}:{});
  const before=c.effects||{}; const after=fn(before);
  const b0=L.fillOf(c,before,c.attack,c.health), b1=L.fillOf(c,after,c.attack,c.health);
  const r={id,name:c.name,from:before,to:after,A:c.attack,H:c.health,fillBefore:b0.fill,fill:b1.fill,ok:b1.b.ok,missing:b1.b.missing&&b1.b.missing.length?b1.b.missing:undefined};
  if(!b1.b.ok){ const t=trim(c,after); r.trim=t; if(t){ r.newA=t.A; r.newH=t.H; r.fill=t.fill; r.ok=true; } }
  return r; }); });
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
Object.entries(out).forEach(([k,l])=>l.forEach(r=>console.log(k.padEnd(14),(r.id||'').padEnd(26),r.missing?'MISSING':`${r.A}/${r.H} ${r.fillBefore}% -> ${r.fill}% ok=${r.ok}${r.newA!==undefined?` trim->${r.newA}/${r.newH}`:''}${r.missing?' miss:'+r.missing:''}`)));
