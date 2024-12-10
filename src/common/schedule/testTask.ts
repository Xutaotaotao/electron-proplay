import TaskQueueManager from "./index";

export const initTestTask = () => {
  const testTask = () => {
    console.log("testTask");
  }
  const taskQueueManager = TaskQueueManager.getInstance();
  taskQueueManager.registerSchedule({
    taskName: "testTask",
    taskFunction: testTask,
    interval: 1000,
  });
  taskQueueManager.runTask("testTask");
}