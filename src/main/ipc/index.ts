import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, shell } from "electron"

const openUrlByDefaultBrowser = (e:IpcMainEvent, url: string, options?: Electron.OpenExternalOptions) => {
  shell.openExternal(url, options)
}

const initIpcOn = () => {
  ipcMain.on('openUrlByDefaultBrowser', openUrlByDefaultBrowser)
  ipcMain.on('communicateWithEachOtherSendMsg', (event:IpcMainEvent, msg:string) => {
    event.reply('communicateWithEachOtherReply', `I got ${msg},ok`)
  })
  ipcMain.on('communicateWithEachOtherSendSyncMsg', (event:IpcMainEvent, msg:string) => {
    event.returnValue = `I got ${msg},ok`
  })
  ipcMain.on('counterValueCallback', (event:IpcMainEvent, value:string) => {
    console.log('counterValueCallback',value)
  })
}

const initIpcHandle = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcMain.handle('communicateWithEachOtherWithPromise', (event: IpcMainInvokeEvent, ...args: any[]): Promise<string> => {
    const msg = args[0];
    return Promise.resolve(`I got ${msg}, ok`);
  });
};

export const initIpc = () => {
  initIpcOn()
  initIpcHandle()
}