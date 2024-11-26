import { queryParam,insertParam,updateParam,deleteParam} from "@/common/db";
import { LOG_TYPE } from "@/common/log";
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
  },
  Elog: (type: LOG_TYPE, value: string) => {
    ipcRenderer.send('Elog', { type, value })
  },
  Log4: (type: LOG_TYPE, value: string) => {
    ipcRenderer.send('Log4', { type, value })
  },
  openNewWindow: (url:string) => {
    ipcRenderer.invoke('openNewWindow',url)
  },
  openNewWindowByDefaultHandle: (url:string) => {
    ipcRenderer.invoke('openNewWindowByDefaultHandle',url)
  },
  onTestSend: (callback:any) => {
    ipcRenderer.on('testSend', (_event, arg) => callback(arg))
  },
  sqQuery: (param: queryParam) => {
    return ipcRenderer.invoke('sqQuery', param)
  },
  sqInsert: (param: insertParam) => {
    return ipcRenderer.invoke('sqInsert', param)
  },
  sqUpdate: (param: updateParam) => {
    return ipcRenderer.invoke('sqUpdate', param)
  },
  sqDelete: (param: deleteParam) => {
    return ipcRenderer.invoke('sqDelete', param)
  }

})




