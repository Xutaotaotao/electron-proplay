import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("EP", {
  log: (data:string) => {console.log(data)}
})