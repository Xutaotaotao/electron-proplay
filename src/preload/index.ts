import { contextBridge,ipcRenderer } from "electron";

type OnUpdateCounterFormMainCallback = (value: number) => void;

contextBridge.exposeInMainWorld("electronAPI", {
  openUrlByDefaultBrowser: (url:string) => ipcRenderer.send('openUrlByDefaultBrowser', url),
  communicateWithEachOtherWithPromise: (msg:string) => ipcRenderer.invoke('communicateWithEachOtherWithPromise', msg),
  communicateWithEachOtherSendMsg: (msg:string) => ipcRenderer.send('communicateWithEachOtherSendMsg', msg),
  onCommunicateWithEachOtherReply: (callback:(msg:string) => void) => ipcRenderer.on('communicateWithEachOtherReply', (_event, arg) => callback(arg)),
  communicateWithEachOtherSendSyncMsg: (msg:string) => ipcRenderer.sendSync('communicateWithEachOtherSendSyncMsg', msg),
  onUpdateCounterFormMain: (callback:OnUpdateCounterFormMainCallback) => ipcRenderer.on('update-counter', (_event, value) => callback(value)),
  updateCounterCallback: (value:number) => ipcRenderer.send('counterValueCallback', value),
  mainSendMsgToWork: (msg:string) => ipcRenderer.send('mainSendMsgToWork', msg),
  listenMsgFromMain: (callback:(msg:string) => void) => ipcRenderer.on('workSendMsgToMain', (_event, msg) => callback(msg)),
  mainMessagePort: (callback:(msg:string) => void) => {
    ipcRenderer.on('portMain', e => {
      window.electronMainMessagePort = e.ports[0]
      window.electronMainMessagePort.onmessage = messageEvent => {
        callback(messageEvent.data)
      }
    })
  },
  mainMessagePortSend: (msg:string) => {
    if (!window.electronMainMessagePort) return
    window.electronMainMessagePort.postMessage(msg)
  },
  workMessagePort: (callback:(msg:string) => void) => {
    ipcRenderer.on('portWork', e => {
      window.electronWorkMessagePort = e.ports[0]
      window.electronWorkMessagePort.onmessage = messageEvent => {
        callback(messageEvent.data)
      }
    })
  }
})




