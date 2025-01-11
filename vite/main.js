import { cwd } from "process";
import path from "path";
import { builtinModules } from "module";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";


const __dirname = fileURLToPath(new URL(".", import.meta.url));

const sharedResolve = {
  alias: {
    "@": path.resolve(__dirname, "../src"),
  },
};

export default defineConfig({
  root: path.resolve(__dirname, "../src/main"),
  envDir: cwd(),
  resolve: sharedResolve,
  build: {
    outDir: path.resolve(__dirname, "../dist/main"),
    minify: false,
    sourcemap: true,
    watch: {},
    lib: {
      entry: path.resolve(__dirname, "../src/main/index.ts"),
      formats: ["cjs"],
    },
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes("use client")
        ) {
          return;
        } else {
          warn(warning);
        }
      },
      external: [
        "electron",
        "sqlite3",
        "koffi",
        "log4js",
        ...builtinModules,
      ],
      output: {
        entryFileNames: "[name].cjs",
      },
    },
    emptyOutDir: true,
    chunkSizeWarningLimit: 2048,
  },
})
