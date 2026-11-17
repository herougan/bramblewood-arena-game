// SKAUD1: every skill key the app, the cost table, the workbook and the cards know.
const ROOT=require('path').resolve(__dirname,'../..');
const fs=require('fs');
const app=fs.readFileSync(ROOT+'/arena_app.js','utf8').split('\n');
const S=__dirname+'/out/';
const reg={};
const sect=[[745,1508,'passive'],[1509,1628,'trigger'],[1629,2364,'action'],[2365,3400,'skilldef']];
sect.forEach(([a,b,kind])=>{ for(let i=a-1;i<b;i++){ const re=/\{\s*key:\s*'([^']+)'\s*,\s*(?:category:\s*'([^']+)')?[^}]*?label:\s*(?:'([^']*)'|"([^"]*)"|TX\('([^']+)')/g; let m; while((m=re.exec(app[i]))){ if(!reg[m[1]]) reg[m[1]]={kind,cat:m[2]||'',label:m[3]||m[4]||m[5]||'',line:i+1}; } } });
// keys whose label is on a later line
sect.forEach(([a,b,kind])=>{ for(let i=a-1;i<b;i++){ const re=/key:\s*'([^']+)'/g; let m; while((m=re.exec(app[i]))){ if(!reg[m[1]]) reg[m[1]]={kind,cat:'',label:'?',line:i+1}; } } });
const cost=JSON.parse(fs.readFileSync(ROOT+'/canonical/skill-costs.json','utf8'));
const costIds=new Set([...cost.skills.map(s=>s.id)]);
const trigIds=cost.triggers.map(s=>s.id), actIds=cost.actions.map(s=>s.id);
const sheet=JSON.parse(fs.readFileSync(S+'skills.json','utf8'));
const sheetKeys=new Set(sheet.map(r=>r.Key).filter(Boolean));
const inv=JSON.parse(fs.readFileSync(S+'inv2.json','utf8')).inv;
const all=new Set([...Object.keys(reg),...costIds,...sheetKeys,...Object.keys(inv).filter(k=>!k.includes('#'))]);
const rows=[...all].sort().map(k=>[k,reg[k]?reg[k].kind+':'+reg[k].cat:'-',reg[k]?reg[k].label:'-',costIds.has(k)?'C':'-',sheetKeys.has(k)?'W':'-',(inv[k]||[]).length].join('\t'));
fs.writeFileSync(S+'keys.tsv',rows.join('\n'));
console.log('all',all.size,'reg',Object.keys(reg).length,'cost',costIds.size,'sheet',sheetKeys.size);
console.log('triggers',trigIds.join(' '));console.log('actions',actIds.join(' '));
