import { parentPort, workerData } from 'worker_threads';

// 模拟计算密集型任务 - 斐波那契数列
function fibonacci(n) {
  return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

if (!parentPort) {
  throw new Error('parentPort is required');
}

// 监听主线程消息
parentPort.on('message', (data) => {
  // 执行计算密集型任务
  const result = {
    input: data,
    output: fibonacci(data),
    pid: process.pid
  };
  
  // 将结果发送回主线程
  parentPort.postMessage(result);
});