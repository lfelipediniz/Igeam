const { contextBridge, ipcRenderer } = require('electron');

// expõe funções seguras para o frontend (renderer)
contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping')
});
