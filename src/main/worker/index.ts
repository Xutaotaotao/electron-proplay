import { Log4 } from "@/common/log";
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { getFibonacciNumber } from "@/worker/fibonacci.work";
import WorkerPool from "./WorkerPool";
import { performance } from "perf_hooks";
import Bluebird from "bluebird";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const testFbonacciWorker = (number: Number) => {
  console.time(`workerTime ${number}`);
  const worker = new Worker(resolve(__dirname, "../worker/fibonacci.work.js"), {
    workerData: { num: number },
  });
  worker.on("message", (result) => {
    Log4.info(`${number}th Fibonacci Result: ${result}`);
    console.timeEnd(`workerTime ${number}`);
  });

  worker.on("error", (error) => {
    Log4.error(error);
  });

  worker.on("exit", (exitCode) => {
    Log4.info(`结束 Code ${exitCode}`);
  });
};

export const testMainThreadBlocking = () => {
  console.time("blockingTest");
  let sum = 0;
  for (let i = 0; i < 10000000000000000000000; i++) {
    sum += i;
  }
  console.timeEnd("blockingTest");
};

export const runFbonacciWorker = () => {
  Log4.info("runFbonacciWorker start");
  Log4.info("runFbonacciWorker 45");
  testFbonacciWorker(45);
  Log4.info("runFbonacciWorker 10");
  testFbonacciWorker(10);
  testMainThreadBlocking();
};

export const testGetFibonacciNumberWithoutWork = () => {
  console.time("testGetFibonacciNumberWithoutWork");
  Log4.info("testGetFibonacciNumber start");
  const result1 = getFibonacciNumber(45);
  Log4.info(`45th Fibonacci Result: ${result1}`);

  const result2 = getFibonacciNumber(10);
  Log4.info(`10th Fibonacci Result: ${result2}`);

  Log4.info("testGetFibonacciNumber");
  console.timeEnd("testGetFibonacciNumberWithoutWork");
  testMainThreadBlocking();
};

export const testWorkPool = (number: number) => {
  const pool = new WorkerPool(
    resolve(__dirname, "../worker/fibonacci.work.js"),
    4,
  );

  // 2. 创建测试数据
  const inputs = [38, 39, 40, 41, 42, 43, 44, 45]; // 斐波那契计算

  // 3. 使用线程池执行任务
  Bluebird.map(
    inputs,
    (n) => {
      console.time(`Task ${n}`);
      return pool.run(n).then((result) => {
        console.timeEnd(`Task ${n}`);
        console.log(`Worker ${result.pid}: fib(${n}) = ${result.output}`);
        return result;
      });
    },
    { concurrency: 4 },
  )
    .then((results) => {
      console.log("\n所有任务完成:");
      results.forEach((r) => {
        console.log(`fib(${r.input}) = ${r.output} (worker: ${r.pid})`);
      });

      // 4. 正常关闭线程池
      pool.destroy();
    })
    .catch((err) => {
      console.error("任务执行失败:", err);

      // 5. 强制关闭线程池 (即使有未完成的任务)
      pool.destroy(true);
    });
};
