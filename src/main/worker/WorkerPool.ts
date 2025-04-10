import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import os from 'os';

// 类型定义
type WorkerId = string | number;
type TaskId = symbol;

interface WorkerInfo {
  instance: Worker;
  lastTaskTime: number;
  messageHandler: (result: any) => void;
  errorHandler: (err: Error) => void;
}

interface Task {
  workerId: WorkerId;
  start: bigint;
}

interface WorkerPoolOptions {
  size?: number;
  taskTimeout?: number;
  idleTimeout?: number;
}

interface WorkerPoolMetrics {
  totalTasks: number;
  failedTasks: number;
  avgTime: number;
  activeWorkers: number;
  pendingTasks: number;
}

declare interface WorkerPool {
  on(event: 'workerError', listener: (err: { workerId: WorkerId; error: Error }) => void): this;
  on(event: 'workerReaped', listener: (workerId: WorkerId) => void): this;
  emit(event: 'workerError', err: { workerId: WorkerId; error: Error }): boolean;
  emit(event: 'workerReaped', workerId: WorkerId): boolean;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  emit(event: string | symbol, ...args: any[]): boolean;
}

class WorkerPool extends EventEmitter {
  private readonly workerPath: string;
  private readonly maxSize: number;
  private readonly taskTimeout: number;
  private readonly idleTimeout: number;

  private readonly _workers = new Map<WorkerId, WorkerInfo>();
  private readonly _tasks = new Map<TaskId, Task>();
  private readonly _freeIds = new Set<WorkerId>();
  private readonly _pendingQueue: Array<{
    taskId: TaskId;
    data: any;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  private _metrics = {
    totalTasks: 0,
    failedTasks: 0,
    avgTime: 0,
  };

  constructor(workerPath: string, options: WorkerPoolOptions = {}) {
    super();
    this.workerPath = workerPath;
    this.maxSize = options.size || os.cpus().length;
    this.taskTimeout = options.taskTimeout || 30_000;
    this.idleTimeout = options.idleTimeout || 60_000;

    this._initWorkers();
    this._startReaper();
  }

  private _initWorkers(): void {
    for (let i = 0; i < this.maxSize; i++) {
      this._createWorker(i);
    }
  }

  private _createWorker(id: WorkerId): void {
    const worker = new Worker(this.workerPath);
    
    const messageHandler = (result: any) => this._handleResult(id, result);
    const errorHandler = (err: Error) => this._handleError(id, err);

    worker
      .on('message', messageHandler)
      .on('error', errorHandler)
      .on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker ${id} exited with code ${code}`);
        }
        this._replaceDeadWorker(id);
      });

    this._workers.set(id, {
      instance: worker,
      lastTaskTime: 0,
      messageHandler,
      errorHandler,
    });

    this._freeIds.add(id);
  }

  public run<T = any>(data: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const taskId = Symbol();
      const timeoutId = setTimeout(() => {
        this._tasks.delete(taskId);
        reject(new Error(`Task timeout after ${this.taskTimeout}ms`));
      }, this.taskTimeout);

      this._pendingQueue.push({
        taskId,
        data,
        resolve: (result: T) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (err: Error) => {
          clearTimeout(timeoutId);
          reject(err);
        },
      });

      this._metrics.totalTasks++;
      this._processNextTask();
    });
  }

  private _processNextTask(): void {
    if (this._pendingQueue.length === 0 || this._freeIds.size === 0) return;

    const workerId = this._getOptimalWorkerId();
    const task = this._pendingQueue.shift()!;

    this._freeIds.delete(workerId);
    const worker = this._workers.get(workerId)!;
    worker.lastTaskTime = Date.now();

    this._tasks.set(task.taskId, {
      workerId,
      start: process.hrtime.bigint(),
    });

    worker.instance.postMessage(task.data);

    const resultHandler = (result: any) => {
      worker.instance.off('message', resultHandler);
      task.resolve(result);
    };

    const errorHandler = (err: Error) => {
      worker.instance.off('error', errorHandler);
      task.reject(err);
    };

    worker.instance.once('message', resultHandler);
    worker.instance.once('error', errorHandler);
  }

  private _getOptimalWorkerId(): WorkerId {
    return this._freeIds.values().next().value;
  }

  private _handleResult(workerId: WorkerId, result: any): void {
    const entry = Array.from(this._tasks.entries()).find(
      ([_, task]) => task.workerId === workerId
    );

    if (!entry) return;

    const [taskId, task] = entry;
    const duration = Number(process.hrtime.bigint() - task.start) / 1e6;
    this._metrics.avgTime =
      (this._metrics.avgTime * (this._metrics.totalTasks - 1) + duration) /
      this._metrics.totalTasks;

    this._tasks.delete(taskId);
    this._freeIds.add(workerId);
    this._processNextTask();
  }

  private _handleError(workerId: WorkerId, error: Error): void {
    this._metrics.failedTasks++;
    this.emit('workerError', { workerId, error });
    this._replaceDeadWorker(workerId);
  }

  private _replaceDeadWorker(workerId: WorkerId): void {
    const worker = this._workers.get(workerId);
    if (!worker) return;

    worker.instance.removeAllListeners();
    worker.instance.terminate();

    this._workers.delete(workerId);
    this._freeIds.delete(workerId);

    if (this._workers.size < this.maxSize) {
      const newId = Date.now().toString(36);
      this._createWorker(newId);
    }
  }

  private _startReaper(): void {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [id, worker] of this._workers) {
        if (now - worker.lastTaskTime > this.idleTimeout) {
          worker.instance.terminate();
          this._workers.delete(id);
          this._freeIds.delete(id);
          this.emit('workerReaped', id);
        }
      }
    }, this.idleTimeout / 2);

    this.on('close', () => clearInterval(interval));
  }

  public getMetrics(): WorkerPoolMetrics {
    return {
      ...this._metrics,
      activeWorkers: this.maxSize - this._freeIds.size,
      pendingTasks: this._pendingQueue.length,
    };
  }

  public async shutdown(): Promise<void> {
    this._pendingQueue.length = 0;

    const runningTasks = Array.from(this._tasks.values());
    await Promise.all(
      runningTasks.map(
        (task) =>
          new Promise((resolve) => {
            this._workers.get(task.workerId)?.instance.once('message', resolve);
          })
      )
    );

    for (const [id, worker] of this._workers) {
      worker.instance.terminate();
    }

    this._workers.clear();
    this._freeIds.clear();
    this.emit('close');
  }
}

export default WorkerPool;