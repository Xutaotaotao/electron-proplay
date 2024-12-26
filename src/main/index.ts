import { BrowserWindow, Menu, MessageChannelMain, app, session } from "electron";
import { join } from "path";
import { installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import { initIpc } from "./ipc";
import { openWindow } from "./window";
import { initTestTask } from "@/common/schedule/testTask";
import { Log4 } from "@/common/log";
import path from "path";
import os from "os";

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

const initElectronDevtoolsInstaller = () => {
  installExtension([REACT_DEVELOPER_TOOLS,REDUX_DEVTOOLS],{loadExtensionOptions: { allowFileAccess: true }})
  .then(([react,redux]) => Log4.info(`已添加扩展: ${react.name} ${redux.name}`))
  .catch((err) => Log4.error('发生错误: ', err));
}

const initInstallDevtoolsInstallerBySession = () => {
  const reactDevToolsPath = path.join(
    os.homedir(),
    '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/6.0.1_0'
  )
  Log4.info(reactDevToolsPath)
  session.defaultSession.loadExtension(reactDevToolsPath).then(({name}) => {
    Log4.info(`已添加扩展: ${name}`)
  }).catch((err) => {
    Log4.error('发生错误: ', err)
  })
}

const main = async () => {
  const { port1, port2 } = new MessageChannelMain();
  const mainWindow = openWindow({
    width: 1024,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
    url: `/main`,
  });

  if (import.meta.env.MODE === "dev") {
    mainWindow.webContents.openDevTools({ mode: "detach", activate: true });
  }

  const workWindow = openWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
    url: `/work`,
    show:false,
  });

  // initMenu(mainWindow);
  initIpc({
    mainWindow,
    workWindow,
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.webContents.postMessage("portMain", null, [port1]);
  });

  workWindow.once("ready-to-show", () => {
    workWindow.webContents.postMessage("portWork", null, [port2]);
  });
};

app.whenReady().then(() => {
  initInstallDevtoolsInstallerBySession()
  // initElectronDevtoolsInstaller()
  main();

  // initTestTask();
});
