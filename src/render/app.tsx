import React from "react"

const App = () => {
  const openUrlByDefaultBrowser = () => {
    window.electronAPI.openUrlByDefaultBrowser('https://www.baidu.com')
  }
  const communicateWithEachOtherSendMsgPromise = () => {
    window.electronAPI.communicateWithEachOtherWithPromise("Hello Promise").then((msg: any) => {
      console.log(msg)
    })
  }
  const communicateWithEachOtherSendMsg = () => {
    window.electronAPI.communicateWithEachOtherSendMsg("Hello");
  };
  const communicateWithEachOtherSendMsgSendSync = () => {
    const msg = window.electronAPI.communicateWithEachOtherSendSyncMsg("Hello sync");
    console.log(msg)
  }


  return <div>
    <h1>Hello Vite + Electron</h1>
    <div>
      <button onClick={openUrlByDefaultBrowser}>openUrlByDefaultBrowser</button>
    </div>

    <div>
      <button onClick={communicateWithEachOtherSendMsgPromise}>
        communicateWithEachOtherSendMsgPromise
      </button>
    </div>

    <div>
      <button onClick={communicateWithEachOtherSendMsg}>
        communicateWithEachOtherSendMsg
      </button>
    </div>

    <div>
      <button onClick={communicateWithEachOtherSendMsgSendSync}>
        communicateWithEachOtherSendMsgSendSync
      </button>
    </div>
  </div>
}

export default App