// electron.d.ts
export interface IElectronAPI {
  openUrlByDefaultBrowser: (url: string, options?: Electron.OpenExternalOptions) => Promise<void>,
  communicateWithEachOtherWithPromise: (msg: string) => Promise<string>,
  communicateWithEachOtherSendMsg: (msg: string) => Promise<string>,
  communicateWithEachOtherSendSyncMsg: (msg: string) => string,
  onUpdateCounterFormMain: (callback: (value: number) => void) => void,
  updateCounterCallback: (value: number) => void,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}