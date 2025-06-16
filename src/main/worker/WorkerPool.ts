import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import os from 'os';
import process from 'process';
import { 
  WorkerId, 
  TaskId, 
  WorkerInfo, 
  WorkerPoolOptions, 
  TaskInfo, 
  PendingTask, 
  PoolMetrics 
} from './types';

export class WorkerPool extends EventEmitter {
  private readonly workerPath: string;
  private readonly workerData: any;
  private readonly maxSize: number;
  private readonly taskTimeout: number;
  private readonly idleTimeout: number;
  
  private _workers = new Map<WorkerId, WorkerInfo>();
  private _freeIds = new Set<WorkerId>();
  private _pendingQueue: PendingTask[] = [];
  private _tasks = new Map<TaskId, TaskInfo>();
  private _nextWorkerId = 0;
  private _reaperInterval?: NodeJS.Timeout;
  private _isShuttingDown = false;
  
  private _metrics: PoolMetrics = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    avgTime: 0,
    activeWorkers: 0
  };

  constructor(workerPath: string, workerData: any, options: WorkerPoolOptions = {}) {
    super();
    this.workerPath = workerPath;
    this.workerData = workerData;
    this.maxSize = options.size || os.cpus().length;
    this.taskTimeout = options.taskTimeout || 30_000;
    this.idleTimeout = options.idleTimeout || 60_000;

    this._initWorkers();
    this._startReaper();
  }

  private _initWorkers(): void {
    for (let i = 0; i < this.maxSize; i++) {
      this._createWorker(this._nextWorkerId++);
    }
  }

  private _createWorker(id: WorkerId): void {
    const worker = new Worker(this.workerPath,{workerData: this.workerData});
    
    const messageHandler = (result: any) => this._handleResult(id, result);
    const errorHandler = (err: Error) => this._handleError(id, err);

    worker
      .on('message', messageHandler)
      .on('error', errorHandler)
      .on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker ${id} 异常退出，退出码: ${code}`);
          // this._replaceDeadWorker(id);
        }
      });

    this._workers.set(id, {
      instance: worker,
      lastTaskTime: Date.now(),
      messageHandler,
      errorHandler
    });
    
    this._freeIds.add(id);
    this._metrics.activeWorkers++;
    
    this.emit('workerCreated', id);
  }

  private _replaceDeadWorker(id: WorkerId): void {
    if (this._isShuttingDown) return;
    
    this._workers.delete(id);
    this._freeIds.delete(id);
    this._metrics.activeWorkers--;
    
    // 创建新的worker替换
    this._createWorker(this._nextWorkerId++);
    this.emit('workerReplaced', id);
  }

  private _handleResult(workerId: WorkerId, result: any): void {
    console.log(`Worker ${workerId} 完成任务: ${result}`);
    const entry = Array.from(this._tasks.entries()).find(
      ([_, task]) => task.workerId === workerId
    );

    if (!entry) return;

    const [taskId, task] = entry;
    
    // 计算执行时间并更新平均时间
    const duration = Number(process.hrtime.bigint() - task.start) / 1e6;
    this._updateAvgTime(duration);

    // 清理任务记录
    this._tasks.delete(taskId);
    this._freeIds.add(workerId);
    this._metrics.completedTasks++;
    
    // 更新worker最后任务时间
    const worker = this._workers.get(workerId);
    if (worker) {
      worker.lastTaskTime = Date.now();
    }

    this.emit('taskCompleted', { taskId, workerId, duration, result });
    
    // 尝试处理下一个任务
    this._processNextTask();
  }

  private _handleError(workerId: WorkerId, error: Error): void {
    console.error(`Worker ${workerId} 发生错误: ${error.message}`);
    const entry = Array.from(this._tasks.entries()).find(
      ([_, task]) => task.workerId === workerId
    );

    if (!entry) return;

    const [taskId, task] = entry;
    
    // 清理任务记录
    this._tasks.delete(taskId);
    this._freeIds.add(workerId);
    this._metrics.failedTasks++;

    this.emit('taskFailed', { taskId, workerId, error });
    
    // 尝试处理下一个任务
    this._processNextTask();
  }

  private _updateAvgTime(duration: number): void {
    const totalCompleted = this._metrics.completedTasks + 1;
    this._metrics.avgTime = 
      (this._metrics.avgTime * (totalCompleted - 1) + duration) / totalCompleted;
  }

  private _getOptimalWorkerId(): WorkerId {
  if (this._freeIds.size === 0) {
    throw new Error('没有可用的工作线程');
  }
  
  // 简单策略：返回第一个空闲的worker
  const workerId = this._freeIds.values().next().value;
  if (workerId === undefined) {
    throw new Error('无法获取工作线程ID');
  }
  
  return workerId;
}

 private _processNextTask(): void {
  if (this._pendingQueue.length === 0 || this._freeIds.size === 0 || this._isShuttingDown) {
    return;
  }

  const workerId = this._getOptimalWorkerId();
  const task = this._pendingQueue.shift()!;
  
  // 更新worker状态
  this._freeIds.delete(workerId);
  const worker = this._workers.get(workerId)!;
  worker.lastTaskTime = Date.now();

  // 记录任务信息
  this._tasks.set(task.taskId, {
    workerId,
    start: process.hrtime.bigint()
  });

  // 设置任务超时
  const timeoutId = setTimeout(() => {
    if (this._tasks.has(task.taskId)) {
      this._tasks.delete(task.taskId);
      this._freeIds.add(workerId);
      this._metrics.failedTasks++;
      task.reject(new Error(`任务执行超时，已超过${this.taskTimeout}毫秒`));
      this.emit('taskTimeout', { taskId: task.taskId, workerId });
    }
  }, this.taskTimeout);

  // 设置一次性消息处理器
  const handleMessage = (result: any) => {
    clearTimeout(timeoutId);
    // 使用 removeListener 替代 off
    worker.instance.removeListener('message', handleMessage);
    worker.instance.removeListener('error', handleError);
    task.resolve(result);
  };

  const handleError = (err: Error) => {
    clearTimeout(timeoutId);
    // 使用 removeListener 替代 off
    worker.instance.removeListener('message', handleMessage);
    worker.instance.removeListener('error', handleError);
    task.reject(err);
  };

  worker.instance.once('message', handleMessage);
  worker.instance.once('error', handleError);

  // 发送任务数据
  worker.instance.postMessage(task.data);
  
  this.emit('taskStarted', { taskId: task.taskId, workerId });
}

  private _startReaper(): void {
    this._reaperInterval = setInterval(() => {
      if (this._isShuttingDown) return;
      
      const now = Date.now();
      const workersToReap: WorkerId[] = [];

      for (const [id, worker] of this._workers) {
        if (this._freeIds.has(id) && 
            now - worker.lastTaskTime > this.idleTimeout) {
          workersToReap.push(id);
        }
      }

      // 确保至少保留一个worker
      if (this._workers.size - workersToReap.length >= 1) {
        for (const id of workersToReap) {
          const worker = this._workers.get(id);
          if (worker) {
            worker.instance.terminate();
            this._workers.delete(id);
            this._freeIds.delete(id);
            this._metrics.activeWorkers--;
            this.emit('workerReaped', id);
          }
        }
      }
    }, this.idleTimeout / 2);
  }

  public run<T = any>(data: any): Promise<T> {
    if (this._isShuttingDown) {
      return Promise.reject(new Error('线程池正在关闭，无法接受新任务'));
    }

    return new Promise<T>((resolve, reject) => {
      const taskId = Symbol();

      const task: PendingTask = {
        taskId,
        data,
        resolve: (result: T) => resolve(result),
        reject: (error: Error) => reject(error)
      };

      this._pendingQueue.push(task);
      this._metrics.totalTasks++;
      
      this.emit('taskQueued', { taskId, queueLength: this._pendingQueue.length });
      
      // 尝试立即处理任务
      this._processNextTask();
    });
  }

  public getMetrics(): PoolMetrics {
    return { ...this._metrics };
  }

  public getStatus() {
    return {
      totalWorkers: this._workers.size,
      freeWorkers: this._freeIds.size,
      busyWorkers: this._workers.size - this._freeIds.size,
      pendingTasks: this._pendingQueue.length,
      runningTasks: this._tasks.size,
      metrics: this.getMetrics()
    };
  }

  public async shutdown(force = false): Promise<void> {
    this._isShuttingDown = true;
    
    // 清除定时器
    if (this._reaperInterval) {
      clearInterval(this._reaperInterval);
    }

    if (force) {
      // 强制关闭：清空队列，终止所有worker
      this._pendingQueue.length = 0;
    } else {
      // 优雅关闭：等待进行中的任务完成
      while (this._tasks.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 拒绝所有pending的任务
    for (const task of this._pendingQueue) {
      task.reject(new Error('线程池已关闭'));
    }
    this._pendingQueue.length = 0;

    // 关闭所有worker
    const shutdownPromises: Promise<void>[] = [];
    for (const [id, worker] of this._workers) {
      shutdownPromises.push(
        new Promise<void>((resolve) => {
          worker.instance.once('exit', () => resolve());
          worker.instance.terminate();
        })
      );
    }

    await Promise.all(shutdownPromises);

    // 清理数据结构
    this._workers.clear();
    this._freeIds.clear();
    this._tasks.clear();
    this._metrics.activeWorkers = 0;

    this.emit('close');
  }
}