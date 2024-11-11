class ElectronLogger {
  private static instance: ElectronLogger | null = null;
  private logger: any;

  private constructor() {}

  private async initialize() {
    try {
      const log = require("electron-log/main");
      log.initialize();
      this.logger = log;
    } catch (error) {
      console.error("Failed to initialize logger:", error);
      this.logger = null;
    }
  }

  static getInstance(): ElectronLogger {
    if (ElectronLogger.instance === null) {
      ElectronLogger.instance = new ElectronLogger();
      ElectronLogger.instance.initialize();
    }
    return ElectronLogger.instance;
  }

  info(message: string): void {
    this.logger?.info(message);
  }

  warn(message: string): void {
    this.logger?.warn(message, "color: yellow");
  }

  error(message: string): void {
    this.logger?.error(message, "color: red");
  }

  debug(message: string): void {
    this.logger?.debug(message, "color: blue");
  }
}

class Logger4 {
  private static instance: Logger4 | null = null;
  private logger: any;

  private constructor() {
    this.initLogger();
  }

  public static getInstance(): Logger4 {
    if (this.instance === null) {
      this.instance = new Logger4();
    }
    return this.instance;
  }

  private getLogPath(): string {
    const { app } = require("electron");
    const path = require("path");
    const userDataPath = app.getPath("userData");
    const logPath = path.join(userDataPath, "logs");
    return logPath;
  }

  private initLogger() {
    const log4js = require("log4js");
    const path = require("path");
    const logPath = this.getLogPath();
    
    try {
      // 配置 log4js，指定日志输出方式和文件存储设置
      log4js.configure({
        appenders: {
          // 控制台输出配置
          out: {
            type: "console",  // 日志输出到控制台
          },
          // 日志文件输出配置
          main: {
            type: "dateFile",  // 使用日期文件类型的 appender
            filename: path.join(logPath, "log"),  // 日志文件的路径和名称
            pattern: "yyyy-MM-dd.log",  // 日志文件名的日期模式
            alwaysIncludePattern: true,  // 文件名总是包含模式中的日期
            maxLogSize: 3 * 1024 * 1024,  // 单个日志文件的最大尺寸（3 MB）
            backups: 20,  // 保留的日志文件备份数量
            mode: 0o777,  // 文件权限模式
          },
        },
        categories: {
          // 默认的日志类别及其关联的 appenders 和日志级别
          default: {
            appenders: ["out", "main"],  // 同时输出到控制台和日志文件
            level: "debug",  // 日志级别为 debug，记录 debug 及以上级别的日志
          },
        },
      });
      // 获取名为 "main" 的 logger 实例
      this.logger = log4js.getLogger("main");
    } catch (err) {
      // 捕获并输出初始化日志系统时的错误
      console.error("initLogger error:", err);
    }
  }

  public info(message: string) {
    if (this.logger) {
      this.logger.info(message);
    } else {
      console.log("Logger not initialized:", message);
    }
  }

  public error(message: string) {
    if (this.logger) {
      this.logger.error(message);
    } else {
      console.log("Logger not initialized:", message);
    }
  }

  public warn(message: string) {
    if (this.logger) {
      this.logger.warn(message);
    } else {
      console.log("Logger not initialized:", message);
    }
  }

  public debug(message: string) {
    if (this.logger) {
      this.logger.debug(message);
    } else {
      console.log("Logger not initialized:", message);
    }
  }
}

export { ElectronLogger, Logger4 };
