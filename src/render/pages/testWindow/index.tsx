import { Log4 } from "@/common/log"
import React, { useEffect } from "react"

const TestWindow = () => {
    useEffect(() => {
        Log4.info('testWindow')
    },[])
    return (
        <div>
            <h1>Test Window</h1>
        </div>
    )
}

export default TestWindow