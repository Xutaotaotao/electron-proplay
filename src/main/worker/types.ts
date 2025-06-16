import { Worker } from 'worker_threads';

export type WorkerId = string | number;
export type TaskId = symbol;

export interface WorkerInfo {
  instance: Worker;
  lastTaskTime: number;
  messageHandler: (result: any) => void;
  errorHandler: (err: Error) => void;
}

export interface WorkerPoolOptions {
  size?: number;
  taskTimeout?: number;
  idleTimeout?: number;
}

export interface TaskInfo {
  workerId: WorkerId;
  start: bigint;
}

export interface PendingTask {
  taskId: TaskId;
  data: any;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
}

export interface PoolMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgTime: number;
  activeWorkers: number;
}