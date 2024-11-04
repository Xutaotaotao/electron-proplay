import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent, shell } from "electron"


export interface IpcMainWindow {
  mainWindow: BrowserWindow,
  workWindow: BrowserWindow
}

const openUrlByDefaultBrowser = (e:IpcMainEvent, url: string, options?: Electron.OpenExternalOptions) => {
  shell.openExternal(url, options)
}

const initIpcOn = (winodws:IpcMainWindow) => {
  ipcMain.on('openUrlByDefaultBrowser', openUrlByDefaultBrowser)
  ipcMain.on('communicateWithEachOtherSendMsg', (event:IpcMainEvent, msg:string) => {
    event.reply('communicateWithEachOtherReply', msg)
  })
  ipcMain.on('communicateWithEachOtherSendSyncMsg', (event:IpcMainEvent, msg:string) => {
    event.returnValue = `I got ${msg},ok`
  })
  ipcMain.on('counterValueCallback', (event:IpcMainEvent, value:string) => {
    console.log('counterValueCallback',value)
  })
  ipcMain.on('mainSendMsgToWork', (event:IpcMainEvent, msg:string) => {
    winodws.workWindow.webContents.send('workSendMsgToMain', msg)
  })
}

const initIpcHandle = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcMain.handle('communicateWithEachOtherWithPromise', (event: IpcMainInvokeEvent, ...args: any[]): Promise<string> => {
    const msg = args[0];
    return Promise.resolve(`I got ${msg}, ok`);
  });
};


export const initIpc = (winodws:IpcMainWindow) => {
  initIpcOn(winodws)
  initIpcHandle()
}