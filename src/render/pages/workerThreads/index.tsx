import { Button } from "antd"
import React from "react"
const WorkerThreads = () => {

  const runFbonacciWorker = () => {
    window.electronAPI.runFbonacciWorker()
  }

  const testGetFibonacciNumberWithoutWork = () => {
    window.electronAPI.testGetFibonacciNumberWithoutWork()
  }

  return <div>
    <h1>WorkerThreads</h1>
    <Button onClick={runFbonacciWorker}>runFbonacciWorker</Button>
    <Button onClick={testGetFibonacciNumberWithoutWork}>testGetFibonacciNumberWithoutWork</Button>

  </div>
}

export default WorkerThreads