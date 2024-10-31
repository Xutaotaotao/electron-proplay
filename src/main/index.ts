import { BrowserWindow,app } from "electron";
import { resolve,join } from "path";


const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
  });

  if (import.meta.env.MODE === "dev") {
    if (import.meta.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(import.meta.env.VITE_DEV_SERVER_URL);
      mainWindow.webContents.openDevTools({ mode: "detach", activate: true, });
    }
  } else {
    mainWindow.loadFile(resolve(__dirname, "../render/index.html"));
  }
};

const main = () => {
  createWindow();
}

app.whenReady().then(() => {
  main();
})

