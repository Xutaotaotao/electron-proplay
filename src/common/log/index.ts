import { ElectronLogger, Logger4 } from "./api";

export type LOG_TYPE = 'error' | 'warn' | 'info' | 'debug'
export interface LOG_PARAMS {
  type: LOG_TYPE
  value: string
}

let loggerInstance: ElectronLogger | null = null;
let logger4Instance: Logger4 | null = null;

const ElectronLoggerInstance = () => {
  if (!loggerInstance) {
    loggerInstance = ElectronLogger.getInstance();
  }
  return loggerInstance;
};

const Logger4Instance = () => {
  if (!logger4Instance) {
    logger4Instance = Logger4.getInstance();
  }
  return logger4Instance;
}

const formatDateWithMilliseconds = (date: Date) => {
  const padZero = (num:number, size:number) => {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  };

  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1, 2);
  const day = padZero(date.getDate(), 2);
  const hours = padZero(date.getHours(), 2);
  const minutes = padZero(date.getMinutes(), 2);
  const seconds = padZero(date.getSeconds(), 2);
  const milliseconds = padZero(date.getMilliseconds(), 3);

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

const parseLog = (param: any,showTime = false): string => {
  let logString = ''
  if (typeof param === 'string') {
    logString = param;
  } else if (param instanceof Error) {
    logString = param.stack || param.message;
  } else {
    try {
      logString = JSON.stringify(param);
    } catch (error) {
      logString = param.toString();
    }
  }
  return showTime ? `${formatDateWithMilliseconds(new Date())} - ${logString}` : logString
}

export const Elog = {
  info: (...value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Elog('info',parseLog(value))
      console.info(parseLog(value,true))
    } else {
      ElectronLoggerInstance().info(parseLog(value))
    }
  },
  warn: (...value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Elog('warn',parseLog(value))
      console.warn(parseLog(value,true))
    } else {
      ElectronLoggerInstance().warn(parseLog(value))
    }
  },
  error: (...value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Elog('error',parseLog(value))
      console.error(parseLog(value,true))
    } else {
      ElectronLoggerInstance().error(parseLog(value))
    }
  },
  debug: (...value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Elog('debug',parseLog(value))
      console.debug(parseLog(value,true))
    } else {
      ElectronLoggerInstance().debug(parseLog(value))
    }
  }
}

export const Log4 = {
  info: (...value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Log4('info',parseLog(value))
      console.info(parseLog(value,true))
    } else {
      Logger4Instance().info(value)
    }
  },
  warn: (...value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Log4('warn',parseLog(value))
      console.warn(parseLog(value,true))
    } else {
      Logger4Instance().warn(value)
    }
  },
  error: (...value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Log4('error',parseLog(value))
      console.error(parseLog(value,true))
    } else {
      Logger4Instance().error(value)
    }
  },
  debug: (...value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Log4('debug',parseLog(value))
      console.debug(parseLog(value,true))
    } else {
      Logger4Instance().debug(value)
    }
  }
}
