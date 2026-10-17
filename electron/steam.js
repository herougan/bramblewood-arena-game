// Steam stub for the desktop build (2026-10-18, roadmap P6 / D3). A no-op unless BOTH are true:
//   1. the env flag BRAMBLE_STEAM=1 is set, and
//   2. the optional `steamworks.js` npm package is installed (npm i steamworks.js; it bundles Valve's redistributable
//      steam_api library, so no Steamworks SDK download and no fees are needed to test with App ID 480 "Spacewar").
// The App ID comes from STEAM_APP_ID, else steam_appid.txt in the working folder (Steam's own dev convention), else 480.
// Nothing here is called by the game yet: main.js wires it to window.bwDesktop.steam (preload.js), and the game can call
// those hooks later (e.g. when an in-game achievement unlocks). Every call is safe when Steam is off and just returns false.
'use strict';

const ACH_ID = /^[A-Za-z0-9_]{1,64}$/; // Steam API names; the game passes its own ids, mapped 1:1 in Steamworks
// steamworks.js overlay.Dialog is a TypeScript const enum (no runtime object), so the numbers live here.
const OVERLAY_DIALOGS = { Friends: 0, Community: 1, Players: 2, Settings: 3, OfficialGameGroup: 4, Stats: 5, Achievements: 6 };

let sw = null, client = null, reason = 'off (set BRAMBLE_STEAM=1)';

function wanted(){ return process.env.BRAMBLE_STEAM === '1'; }

// Call before app 'ready': the overlay needs Chromium switches that only apply at start-up.
function init(){
  if(!wanted() || client) return !!client;
  try{ sw = require('steamworks.js'); }
  catch(e){ reason = 'steamworks.js not installed (npm i steamworks.js)'; console.warn('[steam]', reason); return false; }
  try{
    const id = Number(process.env.STEAM_APP_ID) || undefined; // undefined → steamworks.js reads steam_appid.txt
    client = sw.init(id === undefined && !hasAppIdFile() ? 480 : id);
    sw.electronEnableSteamOverlay();
    reason = 'on';
    console.log('[steam] on, signed in as', safe(() => client.localplayer.getName(), '?'));
  }catch(e){
    client = null; reason = 'init failed (is the Steam client running?): ' + (e && e.message);
    console.warn('[steam]', reason);
  }
  return !!client;
}

function hasAppIdFile(){
  try{ return require('fs').existsSync(require('path').join(process.cwd(), 'steam_appid.txt')); }catch(e){ return false; }
}
function safe(fn, fallback){ try{ return fn(); }catch(e){ return fallback; } }

const api = {
  init,
  status(){ return { on: !!client, reason }; },
  // Achievements
  unlock(id){ return !!client && ACH_ID.test(String(id)) && safe(() => client.achievement.activate(String(id)), false); },
  isUnlocked(id){ return !!client && ACH_ID.test(String(id)) && safe(() => client.achievement.isActivated(String(id)), false); },
  clear(id){ return !!client && ACH_ID.test(String(id)) && safe(() => client.achievement.clear(String(id)), false); }, // testing only
  // Overlay
  openOverlay(dialog){ if(!client || !Object.prototype.hasOwnProperty.call(OVERLAY_DIALOGS, dialog)) return false;
    return safe(() => { client.overlay.activateDialog(OVERLAY_DIALOGS[dialog]); return true; }, false); },
  openStorePage(){ return !!client && safe(() => { client.overlay.activateToStore(client.utils.getAppId(), 0); return true; }, false); },
  playerName(){ return client ? safe(() => client.localplayer.getName(), null) : null; },
};

module.exports = api;
