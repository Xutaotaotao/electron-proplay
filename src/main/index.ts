import { BrowserWindow, Menu, MessageChannelMain, app } from "electron";
import { resolve, join } from "path";
import { initIpc } from "./ipc";

const createWindow = (hashRoute = '') => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
  });
  const baseUrl = import.meta.env.MODE === "dev" 
    ? import.meta.env.VITE_DEV_SERVER_URL 
    : `file://${resolve(__dirname, "../render/index.html")}`;

  const url = `${baseUrl}#${hashRoute}`;

  mainWindow.loadURL(url);

  if (import.meta.env.MODE === "dev") {
    mainWindow.webContents.openDevTools({ mode: "detach", activate: true });
  }
  return mainWindow;
};

const initMenu = (mainWindow: BrowserWindow) => {
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: () => {
            mainWindow.webContents.send("update-counter", 1);
          },
          label: "IncrementNumber",
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
};

const main = () => {
  const { port1, port2 } = new MessageChannelMain()
  const mainWindow = createWindow('main');
  const workWindow = createWindow('work')
  initMenu(mainWindow);
  initIpc({
    mainWindow,
    workWindow,
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.postMessage('portMain', null, [port1])
  })

  workWindow.once('ready-to-show', () => {
    workWindow.webContents.postMessage('portWork', null, [port2])
  })
};

app.whenReady().then(() => {
  main();
});
