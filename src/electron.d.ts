// electron.d.ts
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
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
    electronMainMessagePort: MessagePort
    electronWorkMessagePort: MessagePort
  }
}