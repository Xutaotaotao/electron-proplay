import { Button, Space } from "antd"
import React, { useState } from "react"
const WorkerThreads = () => {

  const [fileList, setFileList] = useState<any[]>([])

  const runFbonacciWorker = () => {
    window.electronAPI.runFbonacciWorker()
  }

  const testGetFibonacciNumberWithoutWork = () => {
    window.electronAPI.testGetFibonacciNumberWithoutWork()
  }

  const runWorkerPool = () => {
    window.electronAPI.testWorkPool(100)
  }

  return <div>
    <h1>WorkerThreads</h1>
    <Space>
      <Button onClick={runFbonacciWorker}>runFbonacciWorker</Button>
      <Button onClick={testGetFibonacciNumberWithoutWork}>testGetFibonacciNumberWithoutWork</Button>
    </Space>
    <h1>WorkerPool</h1>
    <Button onClick={runWorkerPool}>runWorkerPool 100 </Button>
  </div>
}

export default WorkerThreads