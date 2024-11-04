import React, { useEffect, useState } from "react"
const Work = () => {

  const [msg,setMsg] = useState('')
  const [portMsg,setPortMsg] = useState('')

  useEffect(() => {
    window.electronAPI.listenMsgFromMain((value: string) => {
      setMsg(value)
    })
    window.electronAPI.workMessagePort((value) => {
      setPortMsg(value)
    })
  },[])

  return <div>
    <h1>Work</h1>
    <div>
      <p>{msg}</p>
    </div>
    <div>
      <p>{portMsg}</p>
    </div>
  </div>
}

export default Work