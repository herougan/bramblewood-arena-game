// Bramblewood Arena desktop wrapper: proof of concept (2026-10-17, docs/platform-roadmap-2026-10-17.md §4).
//
// What it does: opens the built single-page game (index.html plus assets/, art/, fonts/, version.json) from local files
// in a Chromium window. Nothing is downloaded at start; Supabase (sign-in, sync, ranked, raids, market) still needs the
// network and fails soft exactly like the website does offline ("☁️ Offline").
//
// Why a custom app:// scheme instead of file://
//   - arena_app.js treats file:// as a developer copy (isDevHost() → admin tools and the Shift debug bar). app://bramblewood
//     is not a dev host, so a packaged build behaves like the live site (admin only for app_admins accounts).
//   - app:// is registered as standard + secure, so localStorage, fetch, Web Workers from blob: and WebGL work as on https.
//   - We can attach our own Content-Security-Policy to every response.
//
// Run (from this folder):  npm i && npm start          → loads ../index.html from the repo (build it first:
//                                                         python3 assemble_arena.py && mv bramblewood-arena.html index.html)
//                          npm run start:staged         → copies only what ships into ./game and runs that
//                          npm run dist                 → unpacked app in ./dist (no installer, no signing)
// Steam (optional, later): npm i steamworks.js, then STEAM_APP_ID=480 npm start (480 = Valve's Spacewar test app).
'use strict';
const { app, BrowserWindow, protocol, session, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const SCHEME = 'app', HOST = 'bramblewood';
const SUPABASE = 'xjctfwobcsyiztecutrb.supabase.co';

// Where the game files are: --root=<dir>, else BRAMBLEWOOD_ROOT, else (packaged) resources/game, else the repo root.
function gameRoot(){
  const arg = process.argv.find(a => a.startsWith('--root='));
  const dir = arg ? arg.slice(7) : process.env.BRAMBLEWOOD_ROOT;
  if(dir) return path.resolve(__dirname, dir);
  if(app.isPackaged) return path.join(process.resourcesPath, 'game');
  return path.resolve(__dirname, '..');
}
const ROOT = gameRoot();

// Same policy as vercel.json, enforced here (not report-only). Inline scripts stay allowed because the game ships as one
// self-contained HTML file. jsDelivr is deliberately NOT allowed: the Twemoji/Noto emoji option falls back to System
// emoji until the emoji sets are bundled (roadmap §1). Google Fonts stays for the CJK/Tamil script fonts (roadmap §4).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' blob:",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob:",
  `connect-src 'self' https://${SUPABASE} wss://${SUPABASE}`,
  "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
].join('; ');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.webm': 'audio/webm', '.wav': 'audio/wav',
};

protocol.registerSchemesAsPrivileged([{
  scheme: SCHEME,
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true, codeCache: true },
}]);

// Desktop games start their sound without a click first.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Optional Steam hook-up. Off unless STEAM_APP_ID is set and steamworks.js is installed.
let steam = null;
if(process.env.STEAM_APP_ID){
  try{
    const sw = require('steamworks.js');
    steam = sw.init(Number(process.env.STEAM_APP_ID));
    sw.electronEnableSteamOverlay(); // adds the GPU switches the overlay needs; must run before the app is ready
    console.log('[steam] signed in as', steam.localplayer.getName());
  }catch(e){ console.warn('[steam] not available:', e && e.message); }
}

function resolveSafe(urlPath){
  let rel;
  try{ rel = decodeURIComponent(urlPath); }catch(e){ return null; }
  if(rel === '/' || rel === '') rel = '/index.html';
  const full = path.normalize(path.join(ROOT, rel));
  if(full !== ROOT && !full.startsWith(ROOT + path.sep)) return null; // no ../ escapes
  return full;
}

async function serve(request){
  const url = new URL(request.url);
  if(url.host !== HOST) return new Response('Not found', { status: 404 });
  const file = resolveSafe(url.pathname);
  if(!file) return new Response('Forbidden', { status: 403 });
  let stat;
  try{ stat = await fs.promises.stat(file); }catch(e){ return new Response('Not found', { status: 404 }); }
  if(!stat.isFile()) return new Response('Not found', { status: 404 });
  const headers = {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
  };
  // Range requests, so <audio> can seek in long music files (roadmap §5).
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') || '');
  if(range && stat.size > 0){
    let start = range[1] === '' ? Math.max(0, stat.size - Number(range[2])) : Number(range[1]);
    let end = range[1] !== '' && range[2] !== '' ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if(start > end || start >= stat.size) return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } });
    const fh = await fs.promises.open(file, 'r');
    try{
      const buf = Buffer.alloc(end - start + 1);
      await fh.read(buf, 0, buf.length, start);
      return new Response(buf, { status: 206, headers: Object.assign(headers, { 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': String(buf.length) }) });
    }finally{ await fh.close(); }
  }
  const body = await fs.promises.readFile(file);
  return new Response(body, { status: 200, headers: Object.assign(headers, { 'Content-Length': String(body.length) }) });
}

function createWindow(){
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 960, minHeight: 600,
    backgroundColor: '#2f4a2c', show: false, autoHideMenuBar: true,
    title: 'Bramblewood Arena',
    webPreferences: {
      contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true, spellcheck: false,
      // A preload with contextBridge (window.bwDesktop: Steam achievements, cloud saves, quit) comes with roadmap step D3.
    },
  });
  win.once('ready-to-show', () => win.show());
  win.webContents.on('before-input-event', (e, input) => {
    if(input.type !== 'keyDown') return;
    if(input.key === 'F11'){ win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if(!app.isPackaged && input.control && input.shift && input.key.toLowerCase() === 'i'){ win.webContents.toggleDevTools(); e.preventDefault(); }
  });
  win.loadURL(`${SCHEME}://${HOST}/index.html`);
  return win;
}

// One copy at a time; a second launch focuses the first.
if(!app.requestSingleInstanceLock()){ app.quit(); }
else{
  app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if(w){ if(w.isMinimized()) w.restore(); w.focus(); } });

  // Keep the game inside app://; send real web links (credits, store page) to the system browser.
  app.on('web-contents-created', (_e, contents) => {
    contents.on('will-navigate', (ev, url) => { if(!url.startsWith(`${SCHEME}://${HOST}/`)){ ev.preventDefault(); if(/^https:\/\//.test(url)) shell.openExternal(url); } });
    contents.setWindowOpenHandler(({ url }) => { if(/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
    contents.on('will-attach-webview', ev => ev.preventDefault());
  });

  app.whenReady().then(() => {
    if(!fs.existsSync(path.join(ROOT, 'index.html'))){
      console.error(`[bramblewood] no index.html in ${ROOT}. Build it first (python3 assemble_arena.py && mv bramblewood-arena.html index.html) or pass --root=<folder>.`);
    }
    protocol.handle(SCHEME, serve);
    // The game never needs the camera, microphone, location or notifications (same as the site's Permissions-Policy).
    session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(perm === 'fullscreen' || perm === 'clipboard-sanitized-write'));
    if(process.platform !== 'darwin') Menu.setApplicationMenu(null);
    createWindow();
    app.on('activate', () => { if(BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if(process.platform !== 'darwin') app.quit(); });
}
