import { Elog, Log4 } from "@/common/log";
import React, { useEffect, useState } from "react";
import { Button, Space } from "antd";

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
    window.electronAPI.communicateWithEachOtherSendMsg("Hello");
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
    <Space direction="vertical">
      <div>
        <Button onClick={openUrlByDefaultBrowser}>
          openUrlByDefaultBrowser
        </Button>
      </div>

      <div>
        <Button onClick={communicateWithEachOtherSendMsgPromise}>
          communicateWithEachOtherSendMsgPromise
        </Button>
      </div>

      <div>
        <Button onClick={communicateWithEachOtherSendMsg}>
          communicateWithEachOtherSendMsg
        </Button>
      </div>

      <div>
        <Button onClick={communicateWithEachOtherSendMsgSendSync}>
          communicateWithEachOtherSendMsgSendSync
        </Button>
      </div>

      <div>{count}</div>

      <div>
        <Button onClick={mainSendMsgToWork}>mainSendMsgToWork</Button>
      </div>

      <div>
        <Button onClick={mainSendMsgToWorkByMessagePort}>
          mainSendMsgToWorkByMessagePort
        </Button>
      </div>
    </Space>
  );
};

export default Main;
