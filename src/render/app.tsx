import React from "react"

const App = () => {
  const openUrlByDefaultBrowser = () => {
    window.electronAPI.openUrlByDefaultBrowser('https://www.baidu.com')
  }
  return <div>
    <h1>Hello Vite + Electron</h1>

    <button onClick={openUrlByDefaultBrowser}>openUrlByDefaultBrowser</button>
  </div>
} 

export default App