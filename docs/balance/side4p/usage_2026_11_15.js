// 2026-11-15 (SIDE4P scratch): per-map usage counts for the maps of the given fights; --fixes overrides decks
const fs=require('fs'),a=process.argv.slice(2),i=a.indexOf('--fixes');const L=require('./skir1/lib_fight_2026_11_11.js');
const fx={};if(i>=0)fs.readFileSync(a[i+1],'utf8').trim().split('\n').map(JSON.parse).forEach(x=>fx[x.key]=x.deck);
const codes=a.filter((x,j)=>!x.startsWith('--')&&!(j>0&&a[j-1]==='--fixes'));
for(const m of L.maps()){const fs_=L.fightsOf(m);if(!fs_.some(n=>codes.includes(n.key)))continue;const c={};fs_.forEach(n=>Object.keys(fx[n.key]||n.deck).forEach(id=>c[id]=(c[id]||0)+1));
const cap=L.ucapOf(m);console.log(m.id,'line',cap,'of',fs_.length,'over:',Object.entries(c).filter(([,k])=>k>cap).sort((x,y)=>y[1]-x[1]).map(([id,k])=>id+' '+k).join(', ')||'none');}
