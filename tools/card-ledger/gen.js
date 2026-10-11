// Card Ledger data (2026-10-11): node tools/card-ledger/gen.js out.json, then swap __DATA__ in template.html for it.
const fs=require('fs'), R=require('path').join(__dirname,'..','..')+'/';
const src=fs.readFileSync(R+'arena_app.js','utf8');
const i0=src.indexOf('const CONQUEST_MAPS = ['), j0=src.indexOf('\n];',i0);
const MAPS=eval(src.slice(i0+'const CONQUEST_MAPS = '.length, j0+2));
const mains=MAPS.filter(m=>!m.sub && !m.reserved);
const mapNo=id=>{ const m=MAPS.find(x=>x.id===id); if(!m) return null; const p=m.sub?MAPS.find(x=>x.id===m.parent):m; const i=mains.indexOf(p); return i<0?null:(m.sub? (i+1)+'-A' : String(i+1)); }; // from 1, as on the world screen
const fightCode=(id,key)=>{ const m=MAPS.find(x=>x.id===id); if(!m) return key; const n=m.nodes.find(x=>x.key===key); if(!n) return key; if(n.kind==='raidboss') return mapNo(id)+'-R'; const f=m.nodes.filter(x=>x.kind!=='tutorial'&&x.kind!=='raidboss'); return mapNo(id)+'-'+(f.indexOf(n)+1); };
const labels={}; for(const m of src.matchAll(/\{key:'(\w+)',\s*category:'\w+',\s*label:'([^']+)'/g)) labels[m[1]]=m[2];
const cards=JSON.parse(fs.readFileSync(R+'canonical/cards.json','utf8'));
const bal={}; (JSON.parse(fs.readFileSync(R+'docs/balance/card-balance.json','utf8')).rows||[]).forEach(r=>bal[r.id]=r);
const bands=JSON.parse(fs.readFileSync(R+'docs/balance/card-balance.json','utf8')).bands;
const PACK={1:'Pack 1',11:'Otter pack',12:'Hummingbird pack',13:'Riverbank (both packs)',99:'Mystery Booster'};
const human=k=>labels[k]||k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
const TRIG={onSpawn:'Spawn',onReady:'Ready',onDeath:'Death',onAttacked:'Attacked',onAttack:'Attack',onKill:'Kill',onRoundStart:'Round start',perTurn:'Each turn',onAllySpawn:'Ally spawn',onEnemySpawn:'Enemy spawn',onAllyDie:'Ally dies',onHealed:'Healed',onAllyPlayed:'Ally played',onAllyReady:'Ally ready',onMove:'Move',onExile:'Exile',onDiscard:'Discard',onColumnSpawn:'Column spawn',onHeal:'Heal',onAllyHealed:'Ally healed',onEnemyPlayed:'Enemy played',onEnemyReady:'Enemy ready'};
const skills=c=>{ const e=c.effects||{}, out=[];
  for(const [k,v] of Object.entries(e)){ if(k==='triggers') continue; if(v===false||v==null) continue;
    if(k==='onSpawnGold') { out.push(`+${v} Lumber on arrival`); continue; } if(k==='onReadyGold'){ out.push(`+${v} Lumber when Ready`); continue; }
    out.push(typeof v==='number'||typeof v==='string' ? `${human(k)} ${v}` : (v===true? human(k) : human(k))); }
  const nm=id=> (cards.find(x=>x.id===id)||{}).name||id;
  const DO={damage:t=>`deal ${t.amount??''} damage`, spawnCard:t=>`spawn ${t.count&&t.count>1?t.count+'× ':''}${nm(t.defId)}`, gain:t=>`+${t.amount??1} ${t.resource||'Lumber'}`, buff:t=>`+${t.amount??0}/+${t.amount2??0} to ${t.who||'self'}`, debuff:t=>`−${t.amount??0} Attack to ${t.who||'enemy'}`, exileGrave:t=>`exile ${t.count||1} from graveyard`, drawCard:t=>`draw ${t.count||t.amount||1}`, heal:t=>`heal ${t.amount??''}`, poison:t=>`poison ${t.amount??''}`, missile:t=>`missile ${t.amount??''}`};
  (e.triggers||[]).forEach(t=> out.push(`⚡ ${TRIG[t.on]||t.on}: ${(DO[t.do]||(x=>x.do))(t)}${t.whileWaiting?' (even while Waiting)':''}`));
  return out; };
const inDecks=new Set(); MAPS.forEach(m=>m.nodes.forEach(n=>Object.keys(n.deck||{}).forEach(id=>inDecks.add(id))));
// Forge cost to level 10 in Materia Units (forge economy v2, 2026-10-11): rarity × (0.5 for Base, Quest and map-reward
// cards, 1.5 for Event cards). 1 MU = 675 Dust + 450 Maple Leaves.
const MULT={starter:1,common:1,uncommon:2,rare:4,veryrare:6,superrare:8,epic:11,heroic:14,unique:17,legendary:21,mythic:25,ancient:30,quest:2,questunique:17,special:4,devlegendary:21,devancient:30,eventlegendary:21,eventrare:4};
const forgeMU=c=>{ let k=MULT[c.rarity||'common']||1; const s=c.source||{}; if(/^event/.test(c.rarity||'')||s.kind==='event') k*=1.5; else if(c.rarity==='starter'||c.rarity==='quest'||c.rarity==='questunique'||(!s.kind && (c.basic||!c.locked))||s.kind==='map'||s.kind==='quest') k*=0.5; return Math.round(k*10)/10; };
const rows=cards.filter(c=>!c.test && c.cardType!=='materia' && !String(c.id).startsWith('test-')).map(c=>{
  const s=c.source||{}; let src='Base', grp='Base', mno=null;
  if(s.kind==='map'){ mno=mapNo(s.id); src=`Map ${mno} · ${fightCode(s.id, s.node)}`; grp='Map'; }
  else if(s.kind==='pack'){ src=PACK[s.tier]||('Pack '+s.tier); grp=s.tier===11||s.tier===12||s.tier===13?'Faction pack':'Pack'; }
  else if(s.kind==='smith'){ src='Blacksmith'; grp='Other'; }
  else if(s.kind){ src=s.kind[0].toUpperCase()+s.kind.slice(1); grp='Other'; }
  else if(c.token){ src='Token'; grp='Token'; }
  else if(c.locked && c.rarity!=='starter' && !c.basic){ src= inDecks.has(c.id) ? 'Enemy only' : 'Unused'; grp='Other'; }
  const b= c.cardType==='spell' ? null : bal[c.id]; // a deck of 8 spells has too few units for the win-rate test to mean anything
  return {id:c.id,n:c.name,i:c.icon||'',r:c.rarity||'common',c:c.cost||0,w:c.wait||0,a:c.attack||0,h:c.health||0,
    t:(c.archetypes||[]).join(', '),sk:skills(c),src,g:grp,m:mno,f:forgeMU(c),tok:!!c.token,eq:c.cardType==='equipment',
    wr:b? b.winRate : null, band:b? b.band : null, stale: b ? (b.cost!==c.cost||b.wait!==c.wait||b.attack!==c.attack||b.health!==c.health) : null};
});
// Live values (2026-10-11): pass a JSON array of card_overrides rows ({id, data, deleted}) as the 2nd argument to show
// any cards changed in the live game on top of the card file.
const live = {}; const KEYS = {c:'cost', w:'wait', a:'attack', h:'health', r:'rarity'};
if(process.argv[3]) JSON.parse(fs.readFileSync(process.argv[3],'utf8')).forEach(o=>{ if(!o || o.deleted || !o.data) return; const row = rows.find(r=> r.id===o.id); if(!row) return;
  const x = {}; Object.entries(KEYS).forEach(([k,f])=>{ if(o.data[f] != null && o.data[f] !== row[k]) x[k] = o.data[f]; }); if(Object.keys(x).length) live[o.id] = x; });
fs.writeFileSync(process.argv[2], JSON.stringify({generated:new Date().toISOString().slice(0,10), balanceRun:'2026-10-09', bands, rows, live}));
console.log(rows.length, 'rows', rows.filter(r=>r.wr!=null).length, 'with win rate', rows.filter(r=>r.stale).length, 'stale');
