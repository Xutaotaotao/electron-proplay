import { Log4 as log } from "@/common/log";

interface ScheduleOption {
  taskName: string;
  taskFunction: any;
  interval: number;
}

interface TaskOption {
  taskFunction: any;
  interval: number;
  taskInstance: any;
  isRun: boolean;
}

interface TaskList {
  [taskName: string]: TaskOption | null;
}

class TaskQueueManager {
  private static instance: TaskQueueManager;
  private taskList: TaskList = {};
  private taskQueue: any[] = [];
  private overMaxQueueSizeTaskQueue: any[] = [];

  private readonly MAX_QUEUE_SIZE = 10;
  private readonly OVER_MAX_QUEUE_SIZE = 10;
  private readonly WHITE_LIST: string[] = ["initTask"];

  // 私有构造函数，确保外部不能直接实例化
  private constructor() {
    this.startQueueProcessing();
  }

  // 获取唯一的实例
  public static getInstance(): TaskQueueManager {
    if (!TaskQueueManager.instance) {
      TaskQueueManager.instance = new TaskQueueManager();
    }
    return TaskQueueManager.instance;
  }

  // 任务注册
  registerSchedule(scheduleOption: ScheduleOption): void {
    const { taskName, taskFunction, interval } = scheduleOption;
    if (this.taskList[taskName]) {
      this.taskList[taskName] = null;
    }
    this.taskList[taskName] = {
      taskFunction,
      interval,
      isRun: false,
      taskInstance: null,
    };
  }

  // 告警上传
  private logAndUploadTaskSizeTooLarge(
    type: "task_queue_size" | "over_max_queue_size",
  ): void {
    const data: any = {};
    let taskQueue: any[] = [];
    if (type === "task_queue_size") {
      data.taskQueue = taskQueue.map((item) => item.name);
      taskQueue = taskQueue.map((item) => item.name);
    } else {
      data.overMaxQueue = this.overMaxQueueSizeTaskQueue.map(
        (item) => item.name,
      );
      taskQueue = this.overMaxQueueSizeTaskQueue.map((item) => item.name);
    }
    try {
      // todo 上传任务队日志
      log.info(type, JSON.stringify(taskQueue));
    } catch (err) {
      log.info("task_queue_size_too_large err", err);
    }
  }

  // 添加队列前置判断
  private shouldAddTaskToQueue(taskName: string): boolean {
    if (this.taskQueue.find((task) => task.name === taskName)) {
      return false;
    }
    if (this.WHITE_LIST.includes(taskName)) {
      return true;
    }
    if (this.taskQueue.length >= this.MAX_QUEUE_SIZE) {
      this.logAndUploadTaskSizeTooLarge("task_queue_size");
      return false;
    }
    return true;
  }

  // 添加超过最大任务队列前置判断
  private shouldAddOverMaxQueueSizeTaskQueue(taskName: string): boolean {
    if (this.overMaxQueueSizeTaskQueue.find((task) => task.name === taskName)) {
      return false;
    } else {
      if (this.overMaxQueueSizeTaskQueue.length >= this.OVER_MAX_QUEUE_SIZE) {
        this.logAndUploadTaskSizeTooLarge("over_max_queue_size");
        return false;
      } else {
        return true;
      }
    }
  }

  // 任务执行
  runTask(taskName: string, initRun = true): void {
    const options: TaskOption | null = this.taskList[taskName];
    if (!options) {
      return;
    }
    const { taskFunction, interval, taskInstance, isRun } = options;
    if (isRun && taskInstance && taskInstance.clear) {
      taskInstance && taskInstance.clear();
    } else {
      if (!this.taskList[taskName]) {
        return;
      }
      this.taskList[taskName].isRun = true;
      if (initRun) {
        if (this.shouldAddTaskToQueue(taskName)) {
          this.taskQueue.push({
            name: taskName,
            callback: taskFunction,
          });
        } else {
          if (this.shouldAddOverMaxQueueSizeTaskQueue(taskName)) {
            this.overMaxQueueSizeTaskQueue.push({
              name: taskName,
              callback: taskFunction,
            });
          }
        }
      }
    }
    if (!this.taskList[taskName]) {
      return;
    }
    this.taskList[taskName].taskInstance = setInterval(() => {
      if (this.shouldAddTaskToQueue(taskName)) {
        this.taskQueue.push({
          name: taskName,
          callback: taskFunction,
        });
      } else {
        if (this.shouldAddOverMaxQueueSizeTaskQueue(taskName)) {
          this.overMaxQueueSizeTaskQueue.push({
            name: taskName,
            callback: taskFunction,
          });
        }
      }
    }, interval);
  }

  // 取消任务
  cancelTask(taskName: string): void {
    // 判断任务实例是否存在
    if (!this.taskList[taskName]) {
      return;
    }
    const { taskInstance } = this.taskList[taskName];
    // 取消任务实例
    if (taskInstance) {
      if (taskInstance.clear) {
        taskInstance.clear();
      } else {
        clearInterval(taskInstance);
      }
    }
    // 重置任务状态
    this.taskList[taskName].isRun = false;
    this.taskList[taskName].taskInstance = null;
    // 从任务队列中移除该任务
    this.taskQueue = this.taskQueue.filter((item) => item.name !== taskName);
    delete this.taskList[taskName];
  }

  // 根据关键词批量取消任务
  cancelTaskByKeyWords(taskKeyWords: string): void {
    Object.keys(this.taskList).forEach((o: string) => {
      if (o.toLowerCase().indexOf(taskKeyWords.toLowerCase()) !== -1) {
        this.cancelTask(o);
      }
    });
  }

  // 查找任务是否运行
  isTaskRun(taskName: string): boolean {
    const options: TaskOption | null = this.taskList[taskName];
    if (!options) {
      return false;
    }
    return options.isRun;
  }

  // 任务是否注册
  isRegisterTask(taskName: string): boolean {
    if (this.taskList[taskName]) {
      return true;
    }
    return false;
  }

  // 获取任务实例
  getTaskOption(taskName: string): TaskOption | false {
    if (this.taskList[taskName]) {
      return this.taskList[taskName];
    }
    return false;
  }

  // 任务时间是否变化
  taskTimeHasChange(taskName: string, time: number): boolean {
    const taskOption = this.getTaskOption(taskName);
    if (
      taskOption &&
      taskOption.interval &&
      taskOption.interval === time * 1000
    ) {
      return true;
    } else {
      return false;
    }
  }

  // 判断是否可以执行任务
  private canDoTask(): boolean {
    if (import.meta.env.VITE_CURRENT_RUN_MODE === "main") {
      const { net } = require("electron");
      if (net.isOnline()) {
        return true;
      }
      return false;
    } else {
      if (!navigator.onLine) {
        return false;
      }
      return true;
    }
  }

  // 任务队列核心
  private async processQueue(): Promise<void> {
    if (this.taskQueue.length || this.overMaxQueueSizeTaskQueue.length) {
      let taskItem = null;
      if (this.taskQueue.length) {
        taskItem = this.taskQueue.shift();
      }
      if (this.overMaxQueueSizeTaskQueue.length) {
        taskItem = this.overMaxQueueSizeTaskQueue.shift();
      }
      if (!taskItem) {
        return;
      }
      if (this.isTaskRun(taskItem.name) && this.canDoTask()) {
        const timeout = 5000; // 超时时间，单位毫秒
        try {
          const taskPromise = new Promise((resolve, reject) => {
            const result = taskItem.callback();
            if (result && typeof result.then === "function") {
              result
                .then((res: any) => {
                  resolve(res);
                })
                .catch((err: Error) => {
                  reject(err);
                });
            } else {
              resolve("sync function");
            }
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Task timed out")), timeout),
          );

          Promise.race([taskPromise, timeoutPromise])
            .then(() => {})
            .catch((err) => {
              log.info(
                `${taskItem.name} failed with error or timeout`,
                import.meta.env.VITE_CURRENT_RUN_MODE,
                err,
              );
            });
        } catch (err) {
          log.info(`${taskItem.name} failed with error`, err);
        }
      } else {
        return;
      }
    } else {
      return;
    }
  }

  // 启动任务队列处理
  startQueueProcessing(): void {
    let intervalId: any = setInterval(() => {
      this.processQueue();
      if (
        this.taskQueue.length === 0 ||
        this.overMaxQueueSizeTaskQueue.length === 0
      ) {
        clearInterval(intervalId);
        intervalId = null;
        setTimeout(() => this.startQueueProcessing(), 100);
      }
    }, 2024);
  }
}

export default TaskQueueManager;
