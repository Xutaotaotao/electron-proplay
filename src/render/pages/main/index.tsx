import { Elog, Log4 } from "@/common/log";
import React, { useEffect, useState } from "react";

const Main = () => {
  const [count, setCount] = useState(0);

  const openUrlByDefaultBrowser = () => {
    window.electronAPI.openUrlByDefaultBrowser("https://www.baidu.com");
  };
  const communicateWithEachOtherSendMsgPromise = () => {
    window.electronAPI
      .communicateWithEachOtherWithPromise("Hello Promise")
      .then((msg: string) => {
        Elog.info(msg);
      });
  };
  const communicateWithEachOtherSendMsg = () => {
    setInterval(() => {
      window.electronAPI.communicateWithEachOtherSendMsg("Hello");
    }, 200);
  };
  const communicateWithEachOtherSendMsgSendSync = () => {
    const msg =
      window.electronAPI.communicateWithEachOtherSendSyncMsg("Hello sync");
    Elog.info(msg);
  };
  const mainSendMsgToWork = () => {
    window.electronAPI.mainSendMsgToWork("Hello work");
  };

  const mainSendMsgToWorkByMessagePort = () => {
    window.electronAPI.mainMessagePortSend(
      "Hello work, I am main,send by message port",
    );
  };

  const openNewWindow = () => {
    let count = 0;
    const openWindows = () => {
      if (count < 10) {
        Log4.info("openNewWindow");
        window.electronAPI.openNewWindow("/testWindow");
        count += 1;
        setTimeout(openWindows, 1000);
      }
    };
    openWindows();
  };

  const openNewWindowByDefaultHandle = () => {
    let count = 0;
    const openWindows = () => {
      if (count < 10) {
        Log4.info("openNewWindowByDefaultHandle");
        window.electronAPI.openNewWindowByDefaultHandle("/testWindow");
        count += 1;
        setTimeout(openWindows, 1000);
      }
    };
    openWindows();
  };

  useEffect(() => {
    Log4.info("main");
    window.electronAPI.onUpdateCounterFormMain((value: number) => {
      setCount((pre) => {
        const res = pre + value;
        window.electronAPI.updateCounterCallback(res);
        return res;
      });
    });
    window.electronAPI.onCommunicateWithEachOtherReply((value: string) => {
      Elog.info(value);
    });
    window.electronAPI.mainMessagePort((value) => {
      Elog.info(value + "");
    });
  }, []);

  return (
    <div>
      <h1>Hello Vite + Electron</h1>
      <div>
        <button onClick={openUrlByDefaultBrowser}>
          openUrlByDefaultBrowser
        </button>
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

      <div>
        <button onClick={mainSendMsgToWork}>mainSendMsgToWork</button>
      </div>

      <div>
        <button onClick={mainSendMsgToWorkByMessagePort}>
          mainSendMsgToWorkByMessagePort
        </button>
      </div>

      <div>
        <button onClick={openNewWindow}>openNewWindow</button>
      </div>

      <div>
        <button onClick={openNewWindowByDefaultHandle}>
          openNewWindowByDefaultHandle
        </button>
      </div>
    </div>
  );
};

export default Main;
