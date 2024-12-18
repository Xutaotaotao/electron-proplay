// electron.d.ts
import { LOG_TYPE } from "@/common/log";
import { queryParam,insertParam,updateParam,deleteParam } from "@/common/db";

export interface IElectronAPI {
  openUrlByDefaultBrowser: (url: string, options?: Electron.OpenExternalOptions) => Promise<void>,
  communicateWithEachOtherWithPromise: (msg: string) => Promise<string>,
  communicateWithEachOtherSendMsg: (msg: string | object) => Promise<string>,
  communicateWithEachOtherSendSyncMsg: (msg: string) => string,
  onUpdateCounterFormMain: (callback: (value: number) => void) => void,
  updateCounterCallback: (value: number) => void,
  mainSendMsgToWork: (msg: string) => void,
  listenMsgFromMain: (callback: (msg: string) => void) => void,
  mainMessagePort: (callback: (msg: string | object) => void) => void,
  workMessagePort: (callback: (msg: string) => void) => void,
  mainMessagePortSend: (msg: string) => void,
  onCommunicateWithEachOtherReply: (callback: (msg: string) => void) => void,
  Elog: (type:LOG_TYPE,msg:string) => void,
  Log4: (type:LOG_TYPE,msg:string) => void,
  openNewWindow: (url:string) => void,
  openNewWindowByDefaultHandle: (url:string) => void,
  onTestSend: (callback: (msg: number[]) => void) => void,
  sqQuery: (param: queryParam) => Promise<any>,
  sqInsert: (param: insertParam) => Promise<any>,
  sqUpdate: (param: updateParam) => Promise<any>,
  sqDelete: (param: deleteParam) => Promise<any>,
  dylibCallNativeSum: (param:{a:number,b:number}) => Promise<number>,
  rsNativeSum: (param:{a:number,b:number}) => Promise<number>,
  rsNativeSubtraction: (param:{a:number,b:number}) => Promise<number>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
    electronMainMessagePort: MessagePort
    electronWorkMessagePort: MessagePort
  }
}