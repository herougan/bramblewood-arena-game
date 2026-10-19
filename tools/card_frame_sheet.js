#!/usr/bin/env node
// Card frame comparison sheet (2026-10-19, package CF, owner 22:32: "Equipment & devilry card frame - can it be improved? ... I don't
// want to stray too far from that. Just abit different."). Renders the same cards at hand size (the match's .hand-strip) and at
// detail size (openCardDetail) on a phone (390) and a desktop (1366) viewport, and saves one PNG per viewport and size:
//   node tools/card_frame_sheet.js <tag>      -> docs/screens/cf/<tag>-{hand,detail}-{390,1366}.png   (tag: before / after)
// Crowbar and the Evomax unit are stand-ins (no such cards in canonical/cards.json yet): Crowbar is a Scrapper equipment card wearing
// Siege Hammer's art, the Evomax unit is Dolphin Knight with mechanicLine 'evolution'. Needs index.html (build first) and Chromium.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let pw; try{ pw = require('playwright'); }catch(e){ pw = require('/home/claude/.npm-global/lib/node_modules/playwright'); }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TAG = process.argv[2] || 'after';
const OUT = path.join(ROOT, 'docs', 'screens', 'cf'); fs.mkdirSync(OUT, {recursive:true});
const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
const CARDS = [['otter-centurion', 'Normal'], ['quill-spear', 'Quill Spear (equip)'], ['cf-crowbar', 'Crowbar (equip, Scrapper)'], ['terraumbra', 'Terraumbra (equip, Evomax)'],
  ['cinder-imp', 'Devilry'], ['cf-evomax', 'Evomax unit'], ['shrine-acolyte', 'Ecclesia'], ['hollow-oath-keeper', 'Scrapper']];
// the defs cache lives for one task, so the stand-ins are added in the same evaluate that uses them (window.__cfDefs())
const MOCKS = `(()=>{ window.__cfDefs = ()=>{ const defs = getCardDefs();
  if(!defs['cf-crowbar']) defs['cf-crowbar'] = Object.assign({}, defs['siege-hammer'], {id:'cf-crowbar', name:'Crowbar', icon:'🔧', mechanicLine:'exile', rarity:'common', attack:2, health:0, equip:{grant:{pierce:1}}});
  if(!defs['cf-evomax']) defs['cf-evomax'] = Object.assign({}, defs['dolphin-knight'], {id:'cf-evomax', name:'Evomax Stand-in', mechanicLine:'evolution'});
  return defs; }; return !!window.__cfDefs()['cf-crowbar']; })()`;

(async()=>{
  const b = await pw.chromium.launch({executablePath: EXE});
  for(const vw of [390, 1366]){
    const ctx = await b.newContext({viewport:{width:vw, height: vw < 600 ? 844 : 900}, deviceScaleFactor:2, reducedMotion:'reduce'});
    const pg = await ctx.newPage(); pg.on('pageerror', e=> console.log('  page error:', String(e).slice(0, 160)));
    await pg.addInitScript(INIT); await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(3000);
    if(!await pg.evaluate(MOCKS)) console.log('  mocks did not stick');
    // ---- hand size: a sheet of .hand-strip tiles next to the real hand, at the real hand's card size
    await pg.evaluate("(()=>{ playSubTab='arena'; switchTab('play'); startMatch('ai'); return 1; })()"); await pg.waitForTimeout(2500);
    for(let i = 0; i < 10 && !await pg.evaluate("!!document.querySelector('#handStrip .card-tile')"); i++) await pg.waitForTimeout(500);
    await pg.evaluate(`(()=>{ const real = document.querySelector('#handStrip .card-tile'), cs = real ? getComputedStyle(real) : null;
      const w = cs ? cs.width : '96px', h = cs ? cs.height : '134px', defs = window.__cfDefs();
      const host = document.createElement('div'); host.id = 'cfSheet';
      host.style.cssText = 'position:absolute; left:0; top:0; width:' + innerWidth + 'px; box-sizing:border-box; z-index:2147483000; background:#191512; padding:14px;';
      host.innerHTML = '<div class="hand-strip" style="--match-card-w:' + w + '; --match-card-h:' + h + '; display:flex; flex-wrap:wrap; gap:14px 10px; overflow:visible; transform:none; position:static; height:auto; max-width:none; justify-content:flex-start;">'
        + ${JSON.stringify(CARDS)}.map(([id, label])=> '<div style="display:flex; flex-direction:column; align-items:center; gap:4px;">' + cardTileHTML(defs[id], {inPlay:true, extraClass:'playable'})
          + '<div style="font:700 10px/1.2 system-ui; color:#d8c8a8; max-width:' + w + '; text-align:center;">' + label + '</div></div>').join('') + '</div>';
      document.body.appendChild(host); const st = document.createElement('style'); st.id = 'cfHide'; st.textContent = 'body > *:not(#cfSheet){visibility:hidden !important;}'; document.head.appendChild(st); return w + 'x' + h; })()`).then(s=> console.log(`  ${vw}: hand card ${s}`));
    await pg.waitForTimeout(800);
    await pg.locator('#cfSheet').screenshot({path: path.join(OUT, `${TAG}-hand-${vw}.png`)});
    await pg.evaluate("(()=>{ document.getElementById('cfSheet').remove(); document.getElementById('cfHide').remove(); try{ endMatch(); }catch(e){} return 1; })()");
    // ---- detail size: each card in the detail popup, cropped to its tile
    await pg.evaluate("(()=>{ const st = document.createElement('style'); st.textContent = '[class^=coach-], .toast, .toast-wrap, #toastWrap{display:none !important;} #cardDetailOverlay .card-tile.locked{filter:none !important; opacity:1 !important;} #cardDetailOverlay .card-tile.locked .archmark{display:flex !important;}'; document.head.appendChild(st); return 1; })()");
    const shots = [];
    for(const [id] of CARDS){
      await pg.evaluate(`(window.__cfDefs(), openCardDetail(${JSON.stringify(id)}), 1)`); await pg.waitForTimeout(500);
      const loc = pg.locator('#cardDetailOverlay .card-tile').first();
      const f = path.join(OUT, `_tmp-${TAG}-${vw}-${id}.png`); await loc.screenshot({path: f}); shots.push(f);
      await pg.evaluate("(()=>{ try{ closeCardDetail(); }catch(e){ const o = document.getElementById('cardDetailOverlay'); if(o) o.classList.remove('open'); } return 1; })()");
    }
    fs.writeFileSync(path.join(OUT, `_tmp-${TAG}-${vw}.json`), JSON.stringify({shots, labels: CARDS.map(c=> c[1])}));
    await ctx.close();
  }
  await b.close();
  // the detail shots side by side, labelled, into one sheet per viewport (Pillow)
  const PY = `
import json, sys, os
from PIL import Image, ImageDraw, ImageFont
out, tag = sys.argv[1], sys.argv[2]
try: FONT = ImageFont.load_default(size=26)
except Exception: FONT = None
for vw in (390, 1366):
    j = os.path.join(out, '_tmp-%s-%d.json' % (tag, vw)); spec = json.load(open(j))
    ims = [Image.open(f).convert('RGBA') for f in spec['shots']]
    h = max(i.height for i in ims); pad = 24
    sheet = Image.new("RGBA", (sum(i.width for i in ims) + pad * (len(ims) + 1), h + pad * 2 + 44), (25, 21, 18, 255)); d = ImageDraw.Draw(sheet); x = pad
    for im, lab in zip(ims, spec['labels']):
        sheet.alpha_composite(im, (x, pad)); d.text((x, pad + h + 8), lab, fill=(216, 200, 168, 255), font=FONT); x += im.width + pad
    sheet.save(os.path.join(out, '%s-detail-%d.png' % (tag, vw)))
    for f in spec['shots']: os.remove(f)
    os.remove(j)
`;
  const r = require('child_process').spawnSync('python3', ['-c', PY, OUT, TAG], {stdio:'inherit'});
  if(r.status) process.exit(r.status);
  console.log('  wrote docs/screens/cf/' + TAG + '-{hand,detail}-{390,1366}.png');
})().catch(e=>{ console.error(e); process.exit(1); });
