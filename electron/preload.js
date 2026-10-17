// Preload bridge for the desktop build (2026-10-18, roadmap P6 / D3, first slice). Runs sandboxed with context isolation,
// so the page only sees the small API below, never Node or ipcRenderer itself.
//
// The game can feature-test it:  if(window.bwDesktop) bwDesktop.steam.unlock('FIRST_WIN')
// Every call returns a Promise; with Steam off (the default, see steam.js) they resolve to false / null.
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const call = (ch, ...a) => ipcRenderer.invoke(ch, ...a).catch(() => false);

contextBridge.exposeInMainWorld('bwDesktop', {
  platform: 'electron',
  steam: {
    status: () => call('steam:status'),                    // {on, reason}
    unlock: id => call('steam:unlock', String(id)),        // achievement API name, [A-Za-z0-9_]{1,64}
    isUnlocked: id => call('steam:isUnlocked', String(id)),
    clear: id => call('steam:clear', String(id)),          // unpackaged runs only (testing)
    openOverlay: dialog => call('steam:overlay', String(dialog)), // Friends, Community, Players, Settings, OfficialGameGroup, Stats, Achievements
    openStorePage: () => call('steam:store'),
    playerName: () => call('steam:playerName'),
  },
});
