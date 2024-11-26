import { Log4 } from "@/common/log";
import React from "react";
import { Button, Space } from "antd";

const Main = () => {

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

  return (
    <Space direction="vertical">
      <div>
        <Button onClick={openNewWindow}>openNewWindow</Button>
      </div>

      <div>
        <Button onClick={openNewWindowByDefaultHandle}>
          openNewWindowByDefaultHandle
        </Button>
      </div>
    </Space>
  );
};

export default Main;
