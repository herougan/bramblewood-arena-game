const ROOT='/home/claude/bramblewood-arena-game/.claude/worktrees/agent-a3a461b0c6abd12e7';
const B=require(ROOT+'/tools/lib_bramble.js'); const G=B.G;
const D=B.CARD_DEFS_BASELINE;
const out=[];
B.MAPS.slice(0,21).forEach((m,mi)=>{
  m.nodes.forEach(n=>{
    let rules={}; try{ rules=G.fightRules(m.id,n);}catch(e){rules={err:String(e)}}
    let castle=null; try{ const c=G.skirmishCastle(n); castle={hp:c.hp,shield:c.shield,effects:(c.character&&c.character.effects)||{}, id:c.character&&c.character.id}; }catch(e){castle={err:String(e)}}
    const deck=Object.entries(n.deck||{}).map(([id,k])=>{const d=D[id]||{}; return {id,k,name:d.name,attack:d.attack,health:d.health,effects:d.effects||{},triggers:d.triggers||null,species:d.species,types:d.types}});
    out.push({map:mi,mapId:m.id,mapName:m.name,key:n.key,kind:n.kind,name:n.name,leaders:n.leaders||null,rules,castle,deck});
  });
});
require('fs').writeFileSync(process.argv[2],JSON.stringify(out,null,1));
console.log(out.length);
