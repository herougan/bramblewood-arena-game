#!/usr/bin/env node
// 2026-11-11 (package DESK2): checks for the desktop (Electron) copy in electron/.
//   Static (default, under a second): main.js's window settings, CSP and navigation locks, the preload's one API, the
//     electron-builder config, and .github/workflows/desktop-build.yml (triggers, three OSes, artifacts, no secret values).
//   --launch: starts the staged app with Playwright's _electron and plays it like a player would: it loads, is not a dev
//     copy, fonts (UI and the Japanese script font) load from app://, saves survive a restart, nothing errors in the console,
//     and the page cannot reach Node, file:// or other windows. Needs, from the repo root:
//       python3 assemble_arena.py && mv bramblewood-arena.html index.html && (cd electron && npm ci && node stage.js)
//       NODE_PATH=<a folder holding playwright-core> xvfb-run -a node tests/desk2-2026-11-11.js --launch
//     For a true offline run, start it with no network (Linux: unshare -n, with loopback up for Playwright's pipe).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), EL = path.join(ROOT, 'electron');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, checks = 0; const ok = (c, m) => { checks++; if(!c){ fail++; console.log('  ✗', m); } };

// ---------- static ----------
const main = read('electron/main.js'), preload = read('electron/preload.js'), pkg = JSON.parse(read('electron/package.json'));
const wp = (main.match(/webPreferences:\s*\{([\s\S]*?)\n\s*\}/) || [])[1] || '';
ok(/contextIsolation:\s*true/.test(wp), 'contextIsolation: true');
ok(/sandbox:\s*true/.test(wp), 'sandbox: true');
ok(/nodeIntegration:\s*false/.test(wp), 'nodeIntegration: false');
ok(/webSecurity:\s*true/.test(wp), 'webSecurity: true');
ok(!/allowRunningInsecureContent|enableRemoteModule|webviewTag:\s*true|nodeIntegrationInSubFrames|experimentalFeatures/.test(main), 'no insecure webPreferences');
const csp = (main.match(/const CSP = \[([\s\S]*?)\]\.join/) || [])[1] || '';
const dir = name => { const m = csp.match(new RegExp('"' + name + ' ([^"]*)"|`' + name + ' ([^`]*)`')); return m ? (m[1] || m[2]) : null; };
ok(dir('default-src') === "'self'", "CSP default-src 'self'");
ok(dir('script-src') && !/https?:|unsafe-eval|\*/.test(dir('script-src')), 'CSP script-src: no remote hosts, no unsafe-eval');
ok(dir('object-src') === "'none'", "CSP object-src 'none'");
ok(!/https:\/\/fonts\./.test(csp), 'CSP: no Google Fonts (the script fonts ship in fonts/script/)');
ok(!/ https:[;"`\s]/.test(csp) && !/https:"/.test(csp), 'CSP: no bare https: source');
ok(/frame-ancestors 'none'/.test(csp) && /base-uri 'self'/.test(csp) && /form-action 'self'/.test(csp), 'CSP frame-ancestors / base-uri / form-action');
ok(/'Content-Security-Policy': CSP/.test(main), 'every app:// response carries the CSP');
ok(/will-navigate/.test(main) && /setWindowOpenHandler\([^)]*\)\s*=>[\s\S]{0,200}action: 'deny'/.test(main), 'navigation and window.open are locked');
ok(/will-attach-webview', ev => ev.preventDefault\(\)/.test(main), 'no <webview>');
ok(/setPermissionRequestHandler\([^\n]*cb\(perm === 'fullscreen'/.test(main), 'permission requests denied except fullscreen / clipboard write');
ok(/openExternal\(url\)/.test(main) && /\^https:/.test(main), 'only https:// links go to the system browser');
const exposed = [...preload.matchAll(/exposeInMainWorld\('([^']+)'/g)].map(m => m[1]);
ok(exposed.length === 1 && exposed[0] === 'bwDesktop', `preload exposes only bwDesktop (${exposed})`);
ok(!/ipcRenderer\s*[,:]|exposeInMainWorld\([^)]*ipcRenderer\b(?!\.invoke)/.test(preload.replace(/const \{ contextBridge, ipcRenderer \}/, '')), 'preload never hands ipcRenderer to the page');
ok(/ours\(ev\)/.test(main), 'IPC answers only app://bramblewood pages');
// electron-builder
const b = pkg.build || {};
ok(b.appId && b.productName && b.asar === true, 'build: appId, productName, asar');
ok(Array.isArray(b.files) && !b.files.some(f => /game|node_modules\/\*\*|\*\*\/\*/.test(f)), 'build.files lists only the wrapper (game/ goes in extraResources)');
ok((b.extraResources || []).some(r => r.from === 'game'), 'build.extraResources ships game/');
ok(b.win && b.mac && b.linux, 'build targets for win / mac / linux');
const fz = b.electronFuses || {};
ok(fz.runAsNode === false && fz.enableNodeOptionsEnvironmentVariable === false && fz.enableNodeCliInspectArguments === false
  && fz.onlyLoadAppFromAsar === true && fz.grantFileProtocolExtraPrivileges === false, 'packaged builds flip the Electron fuses (no run-as-node, NODE_OPTIONS, --inspect; asar only)');
ok(!pkg.dependencies || !pkg.dependencies['steamworks.js'], 'steamworks.js is not a dependency (optional, installed by hand)');
ok(fs.existsSync(path.join(EL, 'package-lock.json')), 'electron/package-lock.json is committed (CI runs npm ci)');
// CI workflow
const wfPath = '.github/workflows/desktop-build.yml';
const wf = fs.existsSync(path.join(ROOT, wfPath)) ? read(wfPath) : '';
ok(wf, wfPath + ' exists');
ok(/workflow_dispatch/.test(wf) && /tags:\s*\n\s*-\s*['"]?desktop-v\*/.test(wf), 'workflow runs on workflow_dispatch and desktop-v* tags');
['windows-latest', 'macos-latest', 'ubuntu-latest'].forEach(o => ok(wf.includes(o), 'workflow builds on ' + o));
ok(/actions\/upload-artifact@v\d/.test(wf), 'workflow uploads the builds as artifacts');
ok(/check_build_pair\.sh/.test(wf) && /node electron\/stage\.js/.test(wf), 'workflow checks the committed build pair and stages it');
ok(!/npm (i|install|ci|add)\b[^\n]*steamworks/.test(wf.replace(/#.*$/gm, '')), 'workflow does not install steamworks.js');
ok(!/(-----BEGIN|password:\s*[^$\s{]|ghp_[A-Za-z0-9]{20})/.test(wf), 'workflow holds no secret values');
ok(/CSC_IDENTITY_AUTO_DISCOVERY:\s*['"]?false/.test(wf), 'workflow builds unsigned for now');
const py = cp.spawnSync('python3', ['-c','import sys, yaml; d = yaml.safe_load(open(sys.argv[1])); print(sorted(d["jobs"]))', path.join(ROOT, wfPath)], { encoding: 'utf8' });
if(py.status === 0) ok(/'package'/.test(py.stdout) && /'stage'/.test(py.stdout), 'workflow YAML parses (jobs: ' + py.stdout.trim() + ')');
else console.log('  (YAML parse skipped: python3 + PyYAML not available)');

if(!process.argv.includes('--launch')){
  console.log(`desk2: ${checks - fail}/${checks} static checks passed${fail ? '' : ' (run with --launch to start the app)'}`);
  process.exit(fail ? 1 : 0);
}

// ---------- --launch ----------
(async () => {
  let pw = null;
  for(const m of ['playwright-core', 'playwright']) { try{ pw = require(m); break; }catch(e){} }
  let bin = null; try{ bin = require(path.join(EL, 'node_modules', 'electron')); }catch(e){}
  if(!pw || !bin || !fs.existsSync(path.join(EL, 'game', 'index.html'))){
    console.log('desk2 --launch skipped: needs playwright-core (NODE_PATH), electron/node_modules (npm ci) and electron/game (node stage.js)');
    process.exit(fail ? 1 : 0);
  }
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'desk2-'));
  const env = Object.assign({}, process.env, { HOME: home, XDG_CONFIG_HOME: path.join(home, '.config'), ELECTRON_ENABLE_LOGGING: '0' });
  const args = [EL, '--root=game'];
  if(process.getuid && process.getuid() === 0) args.push('--no-sandbox'); // Chromium refuses to run as root otherwise (CI containers)
  const report = { runs: [] };
  const NET_ERR = /net::ERR_(INTERNET_DISCONNECTED|NAME_NOT_RESOLVED|NETWORK_|CONNECTION_|ADDRESS_UNREACHABLE|PROXY_|TIMED_OUT|FAILED)|Failed to fetch|NetworkError|fetch failed|WebSocket connection/i;

  async function start(label){
    const app = await pw._electron.launch({ executablePath: bin, args, env, timeout: 90000 });
    const ctx = app.context(), log = { label, console: [], errors: [], pageErrors: [], requests: [], failed: [] };
    ctx.on('console', m => { log.console.push(m.type() + ': ' + m.text()); if(m.type() === 'error') log.errors.push(m.text()); });
    ctx.on('weberror', e => log.pageErrors.push(String(e.error())));
    ctx.on('request', r => log.requests.push(r.url()));
    ctx.on('requestfailed', r => log.failed.push(r.url() + ' ' + ((r.failure() || {}).errorText || '')));
    const win = await app.firstWindow();
    await win.reload(); // listeners are attached now, so the reload records every request and message from the start
    await win.waitForFunction(() => document.readyState === 'complete' && typeof switchTab === 'function' && typeof myCurrencies === 'object', null, { timeout: 90000 });
    await win.waitForTimeout(6000); // start-up jobs: cloud attempt, steamCheckProgress (5 s), emoji set, fonts
    report.runs.push(log);
    return { app, win, log };
  }

  // Run 1: loads, security probes, fonts, write a save
  let { app, win, log } = await start('first');
  const r1 = await win.evaluate(async () => {
    const out = {};
    out.url = location.href; out.title = document.title;
    out.node = typeof require + '/' + typeof process + '/' + typeof module;
    out.api = window.bwDesktop ? Object.keys(window.bwDesktop).sort().join(',') : null;
    out.steam = window.bwDesktop ? await window.bwDesktop.steam.status() : null;
    out.dev = typeof isDevHost === 'function' ? isDevHost() : null;
    out.admin = typeof adminAllowed === 'function' ? adminAllowed() : null;
    await document.fonts.ready;
    out.uiFonts = [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, '')))].sort();
    out.bodyFont = getComputedStyle(document.body).fontFamily;
    out.emoji = !!document.querySelector('img.tw-emoji, .tw-emoji');
    return out;
  });
  ok(/^app:\/\/bramblewood\//.test(r1.url), 'served from app://bramblewood/ (' + r1.url + ')');
  ok(r1.title === 'Bramblewood Arena', 'window title');
  ok(r1.node === 'undefined/undefined/undefined', 'no Node globals in the page (' + r1.node + ')');
  ok(r1.api === 'platform,steam', 'window.bwDesktop has only platform + steam (' + r1.api + ')');
  ok(r1.steam && r1.steam.on === false, 'Steam stays off without BRAMBLE_STEAM=1');
  ok(r1.dev === false && r1.admin === false, 'not a dev copy: no admin tools');
  ok(r1.uiFonts.includes('Nunito') && r1.uiFonts.includes('Baloo 2'), 'UI fonts loaded (' + r1.uiFonts.join(', ') + ')');

  // security probes (their CSP / navigation messages are expected; errors after this mark are not counted)
  const errMark = log.errors.length;
  const probes = await win.evaluate(async () => {
    const o = {};
    o.open = window.open('file:///etc/hostname') === null;
    try{ await fetch('file:///etc/hostname'); o.fileFetch = 'read'; }catch(e){ o.fileFetch = 'blocked'; }
    try{ o.escape = (await fetch('app://bramblewood/%2e%2e/main.js')).status; }catch(e){ o.escape = 'blocked'; }
    try{ o.escape2 = (await fetch('app://bramblewood/..%2fpackage.json')).status; }catch(e){ o.escape2 = 'blocked'; }
    try{ o.otherHost = (await fetch('app://evil/index.html')).status; }catch(e){ o.otherHost = 'blocked'; }
    try{ eval('1'); o.eval = 'ran'; }catch(e){ o.eval = 'blocked'; }
    o.remoteScript = await new Promise(res => { const s = document.createElement('script'); s.src = 'https://example.com/x.js';
      s.onload = () => res('loaded'); s.onerror = () => res('blocked'); document.head.appendChild(s); setTimeout(() => res('timeout'), 4000); });
    return o;
  });
  await win.evaluate(() => { location.href = 'file:///etc/hostname'; }).catch(() => {});
  await win.waitForTimeout(800);
  const stillHere = await win.evaluate(() => location.href);
  ok(probes.open && app.windows().length === 1, 'window.open is denied');
  ok(probes.fileFetch === 'blocked', 'fetch(file://) is blocked');
  ok(probes.escape !== 200 && probes.escape2 !== 200, `app:// path escapes refused (${probes.escape}, ${probes.escape2})`);
  ok(probes.otherHost !== 200, 'app:// other hosts refused (' + probes.otherHost + ')');
  ok(probes.eval === 'blocked', 'eval blocked by the CSP');
  ok(probes.remoteScript === 'blocked', 'remote <script> blocked (' + probes.remoteScript + ')');
  ok(/^app:\/\/bramblewood\//.test(stillHere), 'navigation to file:// is refused');
  log.errors.length = errMark;

  // Japanese: the bundled script font loads from app:// (no Google)
  await win.evaluate(() => BramblewoodI18n.set('ja'));
  await win.waitForTimeout(2500);
  const ja = await win.evaluate(async () => { await document.fonts.ready;
    return { lang: document.documentElement.lang, loaded: [...document.fonts].some(f => /Noto Sans JP/.test(f.family) && f.status === 'loaded'),
      link: [...document.querySelectorAll('link[data-lang-font]')].map(l => l.href).join(' ') }; });
  ok(ja.lang === 'ja', 'language switched to Japanese');
  ok(/^app:\/\/bramblewood\/fonts\/script\/ja\.css/.test(ja.link), 'Japanese font CSS from app:// (' + ja.link + ')');
  ok(ja.loaded, 'Noto Sans JP loaded');
  ok(!log.requests.some(u => /fonts\.(googleapis|gstatic)\.com/.test(u)), 'no Google Fonts request');

  // a save: Gold through the game's own save, then a graceful quit
  const gold = await win.evaluate(() => { myCurrencies.gold = (myCurrencies.gold || 0) + 4321; saveCurrencies(true); return myCurrencies.gold; });
  await app.close();
  const lsDir = path.join(home, '.config', 'Bramblewood Arena', 'Local Storage');
  ok(fs.existsSync(lsDir), 'saves live in the userData folder (' + path.relative(home, lsDir) + ')');

  // Run 2: the save and the language are still there
  ({ app, win, log } = await start('restart'));
  const r2 = await win.evaluate(() => ({ gold: myCurrencies.gold, lang: document.documentElement.lang, stored: localStorage.getItem('bramblewood_lang_v1') }));
  ok(r2.gold === gold, `Gold survived the restart (${r2.gold} vs ${gold})`);
  ok(r2.lang === 'ja' && r2.stored === 'ja', 'language survived the restart');
  await win.evaluate(() => BramblewoodI18n.set('en'));
  await app.close();

  // console and network
  for(const run of report.runs){
    const real = run.errors.filter(t => !NET_ERR.test(t));
    ok(real.length === 0, `${run.label}: no console errors besides network ones (${real.slice(0, 5).join(' | ')})`);
    ok(run.pageErrors.length === 0, `${run.label}: no uncaught page errors (${run.pageErrors.slice(0, 3).join(' | ')})`);
  }
  const hosts = {};
  report.runs.forEach(run => run.requests.forEach(u => { let h; try{ const x = new URL(u); h = x.protocol + '//' + x.host; }catch(e){ h = u.slice(0, 40); } hosts[h] = (hosts[h] || 0) + 1; }));
  const failedHosts = [...new Set(report.runs.flatMap(r => r.failed).map(s => { try{ return new URL(s.split(' ')[0]).host + ' ' + s.split(' ').slice(1).join(' '); }catch(e){ return s; } }))];
  console.log('requests by origin:', JSON.stringify(hosts));
  console.log('failed requests:', failedHosts.length ? failedHosts.join(' | ') : 'none');
  console.log('network-only console errors:', [...new Set(report.runs.flatMap(r => r.errors).filter(t => NET_ERR.test(t)))].slice(0, 8).join(' | ') || 'none');
  fs.rmSync(path.join(home, '.config'), { recursive: true, force: true }); // the test profile; only the log stays
  fs.writeFileSync(path.join(home, 'report.json'), JSON.stringify(report, null, 1));
  console.log('full log:', path.join(home, 'report.json'));
  console.log(`desk2: ${checks - fail}/${checks} checks passed (static + launch)`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('  ✗ launch failed:', e && e.stack || e); process.exit(1); });
