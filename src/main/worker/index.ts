import { Log4 } from "@/common/log";
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { getFibonacciNumber } from "@/worker/fibonacci.work";
import { WorkerPool } from "./WorkerPool";
import { performance } from "perf_hooks";

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
  // 生成随机矩阵
  function generateRandomMatrix(rows: number, cols: number) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.floor(Math.random() * 100)),
    );
  }

  // 计算任务模板
  const tasks = [
    {
      type: "matrix",
      matrixA: generateRandomMatrix(200, 200),
      matrixB: generateRandomMatrix(200, 200),
    },
    {
      type: "matrix",
      matrixA: generateRandomMatrix(300, 300),
      matrixB: generateRandomMatrix(300, 300),
    },
    {
      type: "fibonacci",
      n: 500000,
    },
    {
      type: "fibonacci",
      n: 1000000,
    },
    {
      type: "prime",
      max: 10000000,
    },
  ];

  // 扩展任务数量
  const expandedTasks:any = [];
  for (let i = 0; i < 20; i++) {
    expandedTasks.push({ ...tasks[i % tasks.length] });
  }

  async function main() {
    const startTime = performance.now();

    // 创建线程池
    const pool = new WorkerPool(
      resolve(__dirname, "../worker/matrix-worker.js"),
      {}, // 无初始数据
      {
        size: 4,
        taskTimeout: 120000, // 2分钟超时
        idleTimeout: 300000, // 5分钟空闲超时
      },
    );

    // 事件监听
    pool
      .on("workerCreated", (id) => console.log(`Worker ${id} 已创建`))
      .on("taskQueued", ({ taskId }) =>
        console.log(`任务 ${taskId.toString()} 进入队列`),
      )
      .on("taskStarted", ({ taskId, workerId }) =>
        console.log(`任务 ${taskId.toString()} 由 Worker ${workerId} 开始执行`),
      )
      .on("taskCompleted", ({ taskId, workerId, duration }) =>
        console.log(
          `✅ 任务完成 | Worker ${workerId} | 耗时 ${duration.toFixed(2)}ms`,
        ),
      )
      .on("taskFailed", ({ taskId, workerId, error }) =>
        console.error(
          `❌ 任务失败 | Worker ${workerId} | 原因: ${error}`,
        ),
      )
      .on("workerReplaced", (id) => console.warn(`Worker ${id} 已被替换`))
      .on("workerPermanentFailure", (id) =>
        console.error(`❗️ Worker ${id} 永久失效`),
      );

    // 提交任务
    const promises = expandedTasks.map((task: any, i: number) => {
      return pool
        .run({
          ...task,
          taskId: i, // 添加任务ID
          name: `task-${i}-${task.type}`,
        })
        .then((result) => {
          // 处理特别大的结果
          if (
            typeof result === "object" &&
            result !== null &&
            result.length > 100
          ) {
            return { ...result, _truncated: true, length: result.length };
          }
          return result;
        });
    });

    try {
      // 等待所有任务完成
      const results = await Promise.allSettled(promises);

      // 处理结果
      results.forEach((outcome, index) => {
        const taskType = expandedTasks[index].type;
        if (outcome.status === "fulfilled") {
          const result = outcome.value;
          if (taskType === "matrix") {
            console.log(
              `任务 ${index} (矩阵) 结果维度: ${result.length}x${result[0]?.length}`,
            );
          } else {
            console.log(`任务 ${index} (${taskType}) 结果:`, result);
          }
        } else {
          console.error(`任务 ${index} 失败:`, outcome.reason);
        }
      });

      // 性能统计
      const endTime = performance.now();
      const poolMetrics = pool.getMetrics();
      const totalTime = endTime - startTime;

      console.log("\n======= 执行摘要 =======");
      console.log(`总执行时间: ${(totalTime / 1000).toFixed(2)}秒`);
      console.log(`总任务数: ${poolMetrics.totalTasks}`);
      console.log(`成功任务: ${poolMetrics.completedTasks}`);
      console.log(`失败任务: ${poolMetrics.failedTasks}`);
      console.log(`平均任务时间: ${poolMetrics.avgTime.toFixed(2)}ms`);
      console.log(`活跃工作线程: ${poolMetrics.activeWorkers}`);
    } catch (error) {
      console.error("线程池执行失败:", error);
    } finally {
      // 关闭线程池
      await pool.shutdown();
      console.log("线程池已关闭");
    }
  }

  main().catch(console.error);
};
