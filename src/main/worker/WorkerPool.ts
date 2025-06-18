'use strict';

import { Worker } from 'worker_threads';
import Bluebird from 'bluebird';
import { cpus } from 'os';

class WorkerPool {
  /**
   * @param {string} workerPath Worker 文件的路径
   * @param {number} numberOfThreads 线程数，默认为 CPU 核心数
   */
  constructor(private workerPath: string, private numberOfThreads: number = cpus().length) {
    if (numberOfThreads < 1) {
      throw new Error('线程数应大于等于1！');
    }

    this._queue = []; // 任务队列
    this._workersById = {}; // { [key: number]: Worker }
    this._activeWorkersById = {}; // { [key: number]: boolean }

    for (let i = 0; i < this.numberOfThreads; i++) {
      const worker = new Worker(workerPath);
      this._workersById[i] = worker;
      this._activeWorkersById[i] = false;
    }
  }

  /**
   * 获取一个空闲的 worker id
   * @returns {number} 空闲的 worker 的 id
   */
  private getInactiveWorkerId(): number {
    for (let i = 0; i < this.numberOfThreads; i++) {
      if (!this._activeWorkersById[i]) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 运行 worker
   * @param {number} workerId 要使用的 worker 的 id
   * @param {object} task 任务对象
   */
  private runWorker(workerId: number, task: { data: any, cb: (error: any, result?: any) => void }): void {
    const worker = this._workersById[workerId];

    // 任务完成后的回调函数
    const doAfterTaskIsFinished = () => {
      // 清理 worker 的监听器，避免因为未释放监听器导致的内存泄漏
      worker.removeAllListeners('message');
      worker.removeAllListeners('error');
      this._activeWorkersById[workerId] = false;

      // 如果队列不为空，运行下一个任务
      if (this._queue.length) {
        const nextQueue = this._queue.shift()
        if (nextQueue) {
          this.runWorker(workerId, nextQueue);
        }
      }
    };

    // 设置 worker 为活跃状态
    this._activeWorkersById[workerId] = true;

    // 接收 worker 发来的结果，解析任务的 Promise
    const messageCallback = (result: any) => {
      task.cb(null, result);
      doAfterTaskIsFinished();
    };

    // 接收到错误信息，拒绝任务的 Promise
    const errorCallback = (error: any) => {
      task.cb(error);
      doAfterTaskIsFinished();
    };

    // 添加监听器
    worker.once('message', messageCallback);
    worker.once('error', errorCallback);
    worker.postMessage(task.data); // 作为消息传递数据
  }

  /**
   * 运行任务
   * @param {*} data
   * @returns {Promise<any>} Promise 对象
   */
  public run(data: any): Bluebird<any> {
    return new Bluebird<any>((resolve, reject) => {
      const availableWorkerId = this.getInactiveWorkerId();

      const task = {
        data,
        cb: (error: any, result?: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      };

      if (availableWorkerId === -1) {
        // 没有空闲 worker，将任务加入队列
        this._queue.push(task);
      } else {
        // 有空闲 worker，运行任务
        this.runWorker(availableWorkerId, task);
      }
    });
  }

  /**
   * 销毁所有 worker
   * @param {boolean} force 是否强制销毁
   */
  public destroy(force: boolean = false): void {
    for (let i = 0; i < this.numberOfThreads; i++) {
      if (this._activeWorkersById[i] && !force) {
        throw new Error(`worker ${i} 正在运行中！`);
      }
      this._workersById[i].terminate(); // 终止 worker
    }
  }

  private _queue: { data: any, cb: (error: any, result?: any) => void }[];
  private _workersById: { [key: number]: Worker };
  private _activeWorkersById: { [key: number]: boolean };
}

export default WorkerPool;
