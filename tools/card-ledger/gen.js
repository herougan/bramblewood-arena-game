// Card Ledger data (2026-10-11): node tools/card-ledger/gen.js out.json, then swap __DATA__ in template.html for it.
const fs=require('fs'), R=require('path').join(__dirname,'..','..')+'/';
const src=fs.readFileSync(R+'arena_app.js','utf8');
const i0=src.indexOf('const CONQUEST_MAPS = ['), j0=src.indexOf('\n];',i0);
const MAPS=eval(src.slice(i0+'const CONQUEST_MAPS = '.length, j0+2));
const mains=MAPS.filter(m=>!m.sub && !m.reserved);
const mapNo=id=>{ const m=MAPS.find(x=>x.id===id); if(!m) return null; const p=m.sub?MAPS.find(x=>x.id===m.parent):m; const i=mains.indexOf(p); return i<0?null:(m.sub? i+'-A' : String(i)); };
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
const rows=cards.filter(c=>!c.test && c.cardType!=='materia' && !String(c.id).startsWith('test-')).map(c=>{
  const s=c.source||{}; let src='Base', grp='Base', mno=null;
  if(s.kind==='map'){ mno=mapNo(s.id); src=`Map ${mno} · ${s.node}`; grp='Map'; }
  else if(s.kind==='pack'){ src=PACK[s.tier]||('Pack '+s.tier); grp=s.tier===11||s.tier===12||s.tier===13?'Faction pack':'Pack'; }
  else if(s.kind==='smith'){ src='Blacksmith'; grp='Other'; }
  else if(s.kind){ src=s.kind[0].toUpperCase()+s.kind.slice(1); grp='Other'; }
  else if(c.token){ src='Token'; grp='Token'; }
  else if(c.locked && c.rarity!=='starter' && !c.basic){ src= inDecks.has(c.id) ? 'Enemy only' : 'Unused'; grp='Other'; }
  const b=bal[c.id];
  return {id:c.id,n:c.name,i:c.icon||'',r:c.rarity||'common',c:c.cost||0,w:c.wait||0,a:c.attack||0,h:c.health||0,
    t:(c.archetypes||[]).join(', '),sk:skills(c),src,g:grp,m:mno,tok:!!c.token,eq:c.cardType==='equipment',
    wr:b? b.winRate : null, band:b? b.band : null, stale: b ? (b.cost!==c.cost||b.wait!==c.wait||b.attack!==c.attack||b.health!==c.health) : null};
});
fs.writeFileSync(process.argv[2], JSON.stringify({generated:'2026-10-11', balanceRun:'2026-10-09', bands, rows}));
console.log(rows.length, 'rows', rows.filter(r=>r.wr!=null).length, 'with win rate', rows.filter(r=>r.stale).length, 'stale');
