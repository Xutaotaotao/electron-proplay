import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent, shell } from "electron"
import { Elog, LOG_PARAMS,Log4 } from "@/common/log"
import { join } from "path"
import { getOpenUrl, openWindow } from "../window"

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
  ipcMain.on('Elog', (event:IpcMainEvent,arg: LOG_PARAMS) => {
      const { type, value } = arg
      switch (type) {
        case 'info':
          Elog.info(value)
          break
        case 'error':
          Elog.error(value)
          break
        case 'warn':
          Elog.warn(value)
          break
        case 'debug':
          Elog.debug(value)
          break
        default:
          console.log('Unknown log type:', type, ...value)
          break
      }
    })
    ipcMain.on('Log4', (event:IpcMainEvent,arg: LOG_PARAMS) => {
      const { type, value } = arg
      switch (type) {
        case 'info':
          Log4.info(value)
          break
        case 'error':
          Log4.error(value)
          break
        case 'warn':
          Log4.warn(value)
          break
        case 'debug':
          Log4.debug(value)
          break
        default:
          console.log('Unknown log type:', type, ...value)
          break
      }
    })
  }

const initIpcHandle = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcMain.handle('communicateWithEachOtherWithPromise', (event: IpcMainInvokeEvent, ...args: any[]): Promise<string> => {
    const msg = args[0];
    return Promise.resolve(`I got ${msg}, ok`);
  });
  ipcMain.handle('openNewWindow', (event: IpcMainInvokeEvent, url: string) => {
    openWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: join(__dirname, "../preload/index.cjs"),
      },
      url,
      brandNew: true,
    });
  })
  ipcMain.handle('openNewWindowByDefaultHandle', (event: IpcMainInvokeEvent, url: string) => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: join(__dirname, "../preload/index.cjs"),
      },
    });
    const newUrl = getOpenUrl(url)
    win.loadURL(newUrl);
  })
};


export const initIpc = (winodws:IpcMainWindow) => {
  initIpcOn(winodws)
  initIpcHandle()
}