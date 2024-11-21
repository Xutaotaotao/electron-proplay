import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join,resolve } from 'path';

export type WindowPoolOptions = BrowserWindowConstructorOptions & {
  url: string,
  brandNew?: boolean,
}

export const getOpenUrl = (url:string) => {
  const baseUrl =
    import.meta.env.MODE === "dev"
    ? import.meta.env.VITE_DEV_SERVER_URL
      : `file://${resolve(__dirname, "../render/index.html")}`;
  const newUrl = url.startsWith('http') || url.startsWith('https')? url : `${baseUrl}#${url}`;
  return newUrl;
}

class WindowPoolManager {
  private static instance: WindowPoolManager;
  private windowPoolSize: number;
  private windowPools: Map<string, BrowserWindow>;

  private constructor(poolSize: number) {
    this.windowPoolSize = poolSize;
    this.windowPools = new Map<string, BrowserWindow>();
    this.initPool();
  }

  public static getInstance(poolSize: number = 2): WindowPoolManager {
    if (!WindowPoolManager.instance) {
      WindowPoolManager.instance = new WindowPoolManager(poolSize);
    }
    return WindowPoolManager.instance;
  }

  private createPoolWindow(windowOptions: WindowPoolOptions): { id: string, win: BrowserWindow } {
    const win = new BrowserWindow({ ...windowOptions, show: false });
    const idData = windowOptions.url;
    const newUrl = getOpenUrl(windowOptions.url);
    win.loadURL(newUrl);
    this.windowPools.set(idData, win);
    return {
      id: idData,
      win,
    };
  }

  private initPool() {
    for (let i = 0; i < this.windowPoolSize; i++) {
      this.createPoolWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
          preload: join(__dirname, '../preload/index.cjs'),
        },
        url: `/preWindow/${i}`, // 使用占位符 URL
      });
    }
  }

  private usePreWindow(): { id: string, win: BrowserWindow } | null {
    const preWindowKey = Array.from(this.windowPools.keys()).find((key) => key.startsWith('/preWindow') && this.windowPools.get(key)?.isVisible() === false);
    if (preWindowKey) {
      const preWindow = this.windowPools.get(preWindowKey);
      if (preWindow) {
        this.windowPools.delete(preWindowKey);
        return {
          id: preWindowKey,
          win: preWindow,
        };
      }
    }
    return null;
  }

  public openWindow(windowOptions: WindowPoolOptions): BrowserWindow {
    let windowEntry;
    const idData = windowOptions.url;
    if (idData && this.windowPools.has(idData) && !windowOptions.brandNew) {
      const win = this.windowPools.get(idData);
      if (win) {
        win.show();
        win.moveTop();
        win.focus();
        return win;
      }
    } else {
      windowEntry = this.usePreWindow();
    }

    if (!windowEntry) {
      windowEntry = this.createPoolWindow(windowOptions);
    }

    const { win } = windowEntry;
    win.show();
    win.moveTop();
    win.focus();
    win.loadURL(windowOptions.url);

    this.windowPools.set(idData, win);

    win.on('closed', () => {
      this.windowPools.delete(idData);
      this.ensurePreWindowPool();
    })

    this.ensurePreWindowPool();

    return win;
  }

  private ensurePreWindowPool() {
    const currentPreWindowCount = Array.from(this.windowPools.keys()).filter((key) => key.startsWith('/preWindow')).length;
    if (currentPreWindowCount < this.windowPoolSize) {
      this.createPoolWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
          preload: join(__dirname, '../preload/index.cjs'),
        },
        url: `/preWindow/${currentPreWindowCount + 1}`,
      });
    }
  }
}

export default WindowPoolManager;
