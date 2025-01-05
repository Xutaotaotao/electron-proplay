import { Log4 } from "@/common/log";
import { Worker } from "worker_threads";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import  {getFibonacciNumber } from "@/worker/fibonacci.work"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const testFbonacciWorker = (number:Number) => {
  console.time(`workerTime ${number}`);
  const worker = new Worker(resolve(__dirname, '../worker/fibonacci.work.js'), { workerData: { num: number } });
  worker.on("message", result => {
    Log4.info (`${number}th Fibonacci Result: ${result}`);
    console.timeEnd(`workerTime ${number}`)
  });

  worker.on("error", error => {
    Log4.error(error);
  });

  worker.on("exit", exitCode => {
    Log4.info(`结束 Code ${exitCode}`);
  })
}

export const testMainThreadBlocking = () => {
  console.time('blockingTest');
  let sum = 0;
  for (let i = 0; i < 10000000000000000000000; i++) {
    sum += i;
  }
  console.timeEnd('blockingTest');
}


export const runFbonacciWorker = () => {
  Log4.info('runFbonacciWorker start')
  Log4.info('runFbonacciWorker 45')
  testFbonacciWorker(45)
  Log4.info('runFbonacciWorker 10')
  testFbonacciWorker(10)
  testMainThreadBlocking()
}

export const testGetFibonacciNumberWithoutWork = () => {
  console.time('testGetFibonacciNumberWithoutWork')
  Log4.info('testGetFibonacciNumber start')
  const result1 = getFibonacciNumber(45)
  Log4.info(`50th Fibonacci Result: ${result1}`)

  const result2 = getFibonacciNumber(10)
  Log4.info(`10th Fibonacci Result: ${result2}`)
  
  Log4.info('testGetFibonacciNumber')
  console.timeEnd('testGetFibonacciNumberWithoutWork')
  testMainThreadBlocking()
}

