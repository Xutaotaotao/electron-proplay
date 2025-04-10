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

  const chooseFiles = () => {
    window.electronAPI.opneFileDialog().then((res) => {
      setFileList(res.filePaths)
    })
  }

  return <div>
    <h1>WorkerThreads</h1>
    <Space>
      <Button onClick={runFbonacciWorker}>runFbonacciWorker</Button>
      <Button onClick={testGetFibonacciNumberWithoutWork}>testGetFibonacciNumberWithoutWork</Button>
    </Space>
    <h1>WorkerPool</h1>
    <Button onClick={chooseFiles}>chooseFiles</Button>
    <div>
      {
        fileList?.map((item) => <div key={item}>{item}</div>)
      }
    </div>
  </div>
}

export default WorkerThreads