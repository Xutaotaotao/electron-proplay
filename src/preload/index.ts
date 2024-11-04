import { contextBridge,ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openUrlByDefaultBrowser: (url:string) => ipcRenderer.send('openUrlByDefaultBrowser', url),
  communicateWithEachOtherWithPromise: (msg:string) => ipcRenderer.invoke('communicateWithEachOtherWithPromise', msg),
  communicateWithEachOtherSendMsg: (msg:string) => ipcRenderer.send('communicateWithEachOtherSendMsg', msg),
  communicateWithEachOtherSendSyncMsg: (msg:string) => ipcRenderer.sendSync('communicateWithEachOtherSendSyncMsg', msg),
})

ipcRenderer.on('communicateWithEachOtherReply', (_event, arg) => {
  console.log(arg)
})


