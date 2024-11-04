import React,{useEffect, useState} from "react"

const Main = () => {

  const [count, setCount] = useState(0)

  const openUrlByDefaultBrowser = () => {
    window.electronAPI.openUrlByDefaultBrowser('https://www.baidu.com')
  }
  const communicateWithEachOtherSendMsgPromise = () => {
    window.electronAPI.communicateWithEachOtherWithPromise("Hello Promise").then((msg: string) => {
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

  useEffect(() => {
    window.electronAPI.onUpdateCounterFormMain((value: number) => {
      setCount((pre) => {
        const res = pre + value
        window.electronAPI.updateCounterCallback(res);
        return res
      })
    });
  },[]);


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

    <div>{count}</div>
  </div>
}

export default Main