// Package PERF4 (2026-11-12): DOM of a seeded fight after each round, to compare two builds (e.g. PERF4_KEEP_DOM true vs false): node tools/perf/dom_same4.js <page.html> <rounds> <out.json> [map], twice, then python3 tools/perf/dom_same4_cmp.py (edit its dir) A B. Row decor paths, inline styles and a few timing classes are ignored; the log, rows and hand must match.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const src=fs.readFileSync(ROOT+'/tests/perf2-2026-11-11.js','utf8');
const lit=n=>{const j=src.indexOf('const '+n+' = ')+n.length+9,q=src[j];let k=j+1;while(src[k]!==q||src[k-1]==='\\')k++;return src.slice(j,k+1);};
const SKIP=eval(lit('SKIP')),INSTR=eval(lit('INSTR')),OWN=eval(lit('OWN'));
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const http=require('http');
(async()=>{
 const page=process.argv[2], rounds=+process.argv[3]||5, outf=process.argv[4], map=process.argv[5]||'5-3';
 const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=p==='/index.html'?page:ROOT+p;fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'}[path.extname(f)]||'application/octet-stream'});r.end(d);});});
 await new Promise(r=>s.listen(0,'127.0.0.1',r));
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
 const pg=await (await b.newContext({viewport:{width:1366,height:768}})).newPage();
 await pg.addInitScript(SKIP+INSTR);await pg.goto('http://127.0.0.1:'+s.address().port+'/index.html');
 await pg.waitForFunction("typeof startConquestMatch === 'function'");await pg.waitForTimeout(1500);await pg.evaluate(OWN);
 await pg.evaluate(`(async()=>{adminModeEnabled=true;forcedNextSeed=777;switchTab('play');startConquestMatch('mw','${map}',{skipEnergyCost:true,noOpener:true});await new Promise(r=>setTimeout(r,2600));try{skipTriggerLesson();}catch(e){}})()`);
 const res = await pg.evaluate(`(async()=>{const m=matchState,W=ms=>new Promise(r=>setTimeout(r,ms));const out=[];
  const snap=()=>{const g=id=>{const e=document.getElementById(id);return e?e.outerHTML:'';};
    const strip=h=>h.replace(/ d="[^"]*"/g,'').replace(/ style="[^"]*"/g,'').replace(/ class="([^"]*)"/g,(x,c)=>' class="'+c.split(/\\s+/).filter(z=>!/^(is-entering|dragging)$/.test(z)).sort().join(' ')+'"');
    return {mine:strip(g('rowMine')),enemy:strip(g('rowEnemy')),log:g('battleLog'),hand:strip(g('handStrip')),root:strip(document.getElementById('view-play').innerHTML.replace(/<div class="board-row[\\s\\S]*?<\\/div><\\/div>/g,'').replace(/<div class="battle-log"[\\s\\S]*?<\\/div>/g,''))};};
  for(let k=0;k<${rounds};k++){ const pl=m.players[1];const c=pl.hand.find(h=>m.engine.canPlay(pl,h.defId,h.uid)); if(c) await playCardByUid(c.uid,'left'); await W(900); const r0=m.round; afterPlayerAction(1); while(m.round===r0&&!m.over) await W(50); for(let i=0;i<200&&m.resolving;i++) await W(50); await W(1500); out.push({round:m.round,over:m.over,snap:snap(),logLen:m.log.length,hp:[m.players[1].hq.hp,m.players[2].hq.hp]}); if(m.over)break; }
  return out;})()`);
 fs.writeFileSync(outf,JSON.stringify(res));
 await b.close();s.close();
})();
