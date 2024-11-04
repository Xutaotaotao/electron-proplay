import { contextBridge,ipcRenderer } from "electron";

type OnUpdateCounterFormMainCallback = (value: number) => void;

contextBridge.exposeInMainWorld("electronAPI", {
  openUrlByDefaultBrowser: (url:string) => ipcRenderer.send('openUrlByDefaultBrowser', url),
  communicateWithEachOtherWithPromise: (msg:string) => ipcRenderer.invoke('communicateWithEachOtherWithPromise', msg),
  communicateWithEachOtherSendMsg: (msg:string) => ipcRenderer.send('communicateWithEachOtherSendMsg', msg),
  communicateWithEachOtherSendSyncMsg: (msg:string) => ipcRenderer.sendSync('communicateWithEachOtherSendSyncMsg', msg),
  onUpdateCounterFormMain: (callback:OnUpdateCounterFormMainCallback) => ipcRenderer.on('update-counter', (_event, value) => callback(value)),
  updateCounterCallback: (value:number) => ipcRenderer.send('counterValueCallback', value)
})

ipcRenderer.on('communicateWithEachOtherReply', (_event, arg) => {
  console.log(arg)
})


