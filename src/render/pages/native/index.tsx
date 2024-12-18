import { Button, Space } from "antd"
import React from "react"

const Native = () => {
  const dylibCallNativeSum = () => {
    window.electronAPI.dylibCallNativeSum({a:1,b:2}).then((res) => {
      console.log(res)
    })
  }

  const rsNativeSum = () => {
    window.electronAPI.rsNativeSum({a:1,b:2}).then((res) => {
      console.log(res)
    })
  }

  const rsNativeSubtraction = () => {
    window.electronAPI.rsNativeSubtraction({a:10,b:2}).then((res) => {
      console.log(res)
    })
  }

  return <div>
    <Space>
      <Button onClick={dylibCallNativeSum}> 调用 dylib 加法</Button>
      <Button onClick={rsNativeSum}> 调用 Rust node 加法</Button>
      <Button onClick={rsNativeSubtraction}> 调用 Rust node 减法</Button>
    </Space>
  </div>
}

export default Native