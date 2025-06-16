import { parentPort } from 'worker_threads';

// 矩阵乘法函数
function multiplyMatrices(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result = new Array(rowsA);
  
  for (let i = 0; i < rowsA; i++) {
    result[i] = new Array(colsB);
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

// 斐波那契计算函数
function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// 消息处理
parentPort.on('message', (task) => {
  try {
    let result;
    
    switch (task.type) {
      case 'matrix':
        result = multiplyMatrices(task.matrixA, task.matrixB);
        break;
      case 'fibonacci':
        result = fibonacci(task.n);
        break;
      case 'prime':
        // 计算质数数量 (示例，实际实现略)
        result = `从1到${task.max}共有 ${Math.floor(task.max / 2)} 个质数`;
        break;
      default:
        throw new Error(`未知任务类型: ${task.type}`);
    }
    
    parentPort.postMessage({
      success: true,
      taskId: task.taskId,
      result
    });
  } catch (error) {
    parentPort.postMessage({
      success: false,
      taskId: task.taskId,
      error: error.message
    });
  }
});