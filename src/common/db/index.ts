import type { queryParam, insertParam, updateParam, deleteParam } from "./api";

export const sqQuery = (param: queryParam) => {
  if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
    return window.electronAPI.sqQuery(param);
  } else {
    return import("./api").then((module) => module.sqQuery(param));
  }
};

export const sqInsert = (param: insertParam) => {
  if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
    return window.electronAPI.sqInsert(param);
  } else {
    return import("./api").then((module) => module.sqInsert(param));
  }
};
export const sqUpdate = (param: updateParam) => {
  if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
    return window.electronAPI.sqUpdate(param);
  } else {
    return import("./api").then((module) => module.sqUpdate(param));
  }
};
export const sqDelete = (param: deleteParam) => {
  if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
    return window.electronAPI.sqDelete(param);
  } else {
    return import("./api").then((module) => module.sqDelete(param));
  }
};

export { queryParam, insertParam, updateParam, deleteParam };
