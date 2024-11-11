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

const parseLog = (params: any[]): string => {
  return params.map(param => {
    if (typeof param === 'string') {
      return param;
    } else if (param instanceof Error) {
      return param.stack || param.message;
    } else {
      return JSON.stringify(param);
      JSON.parse
    }
  }).join(" ");
}

export const Elog = {
  info: (value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Elog('info',parseLog(value))
      console.info(value)
    } else {
      ElectronLoggerInstance().info(parseLog(value))
    }
  },
  warn: (value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Elog('warn',parseLog(value))
      console.warn(value)
    } else {
      ElectronLoggerInstance().warn(parseLog(value))
    }
  },
  error: (value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Elog('error',parseLog(value))
      console.error(value)
    } else {
      ElectronLoggerInstance().error(parseLog(value))
    }
  },
  debug: (value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Elog('debug',parseLog(value))
      console.debug(value)
    } else {
      ElectronLoggerInstance().debug(parseLog(value))
    }
  }
}

export const Log4 = {
  info: (value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Log4('info',parseLog(value))
      console.info(value)
    } else {
      Logger4Instance().info(value)
    }
  },
  warn: (value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Log4('warn',parseLog(value))
      console.warn(value)
    } else {
      Logger4Instance().warn(value)
    }
  },
  error: (value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Log4('error',parseLog(value))
      console.error(value)
    } else {
      Logger4Instance().error(value)
    }
  },
  debug: (value: any) => {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
      window.electronAPI.Log4('debug',parseLog(value))
      console.debug(value)
    } else {
      Logger4Instance().debug(value)
    }
  }
}
