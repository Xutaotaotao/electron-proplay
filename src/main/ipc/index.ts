import { ipcMain, IpcMainEvent, shell } from "electron"

const openUrlByDefaultBrowser = (e:IpcMainEvent, url: string, options?: Electron.OpenExternalOptions) => {
  shell.openExternal(url, options)

}

const initIpcOn = () => {
  ipcMain.on('openUrlByDefaultBrowser', openUrlByDefaultBrowser)
}

export const initIpc = () => {
  initIpcOn()
}