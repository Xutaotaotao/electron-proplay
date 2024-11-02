// electron.d.ts
export interface IElectronAPI {
  openUrlByDefaultBrowser: (url: string, options?: Electron.OpenExternalOptions) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}