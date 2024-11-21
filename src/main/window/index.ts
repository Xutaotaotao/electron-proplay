import  WindowPoolManager, {getOpenUrl} from './windowPool';
import type {WindowPoolOptions} from './windowPool';

export const initWindowManager = () => {
  return WindowPoolManager.getInstance(2);
}


export const openWindow = (windowOptions:WindowPoolOptions) => {
  const windowManager = initWindowManager();
  const newUrl = getOpenUrl(windowOptions.url); 
  const win = windowManager.openWindow({
    ...windowOptions,
    url: newUrl,
  });
  return win;
}

export {
  getOpenUrl,
}