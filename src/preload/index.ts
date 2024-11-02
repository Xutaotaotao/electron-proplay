import { contextBridge,ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openUrlByDefaultBrowser: (url:string) => ipcRenderer.send('openUrlByDefaultBrowser', url)
})


