import { BrowserWindow, Menu, MessageChannelMain, app } from "electron";
import { join } from "path";
import { initIpc } from "./ipc";
import { openWindow } from "./window";
import { initTestTask } from "@/common/schedule/testTask";

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

  initMenu(mainWindow);
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
  main();
  // initTestTask();
});
