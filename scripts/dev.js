#!/usr/bin/env node
import electronPath from "electron";
import main from "../vite/main.js";
import render from "../vite/render.js";
import preload from "../vite/preload.js";
import worker from "../vite/worker.js";
import createViteElectronService from '../vite/service.js'

createViteElectronService({
  render,
  preload,
  main,
  worker,
  electronPath
});