import { parentPort, workerData,isMainThread } from 'worker_threads';

if (isMainThread) {
  console.log('Main thread');
} else {
  parentPort.postMessage(getFibonacciNumber(workerData.num))
}


export function getFibonacciNumber (num) {
  if (num === 0) {
    return 0;
  } else if (num === 1) {
    return 1;
  } else {
    return getFibonacciNumber(num - 1) + getFibonacciNumber(num - 2);
  }
}
