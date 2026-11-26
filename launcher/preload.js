const { contextBridge, ipcRenderer } = require('electron');

const on = (channel) => (cb) => ipcRenderer.on(channel, (_e, data) => cb(data));

contextBridge.exposeInMainWorld('wn', {
  info: () => ipcRenderer.invoke('app:info'),
  getConfig: () => ipcRenderer.invoke('config:get'),
  setConfig: (patch) => ipcRenderer.invoke('config:set', patch),
  restore: () => ipcRenderer.invoke('auth:restore'),
  login: () => ipcRenderer.invoke('auth:login'),
  logout: () => ipcRenderer.invoke('auth:logout'),
  launch: () => ipcRenderer.invoke('game:launch'),
  openGameDir: () => ipcRenderer.invoke('open:gamedir'),
  onLog: on('log'),
  onProgress: on('progress'),
  onState: on('state'),
});
