import { defineConfig } from "vite"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

function copyWorkerFiles() {
  console.log('Copying worker files...')
  // 目标路径
  const destDir = path.resolve(__dirname, '../dist/worker')
  
  // 清空或创建目标目录
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true })
  }
  fs.mkdirSync(destDir, { recursive: true })
  
  // 源文件路径
  const srcPath = path.resolve(__dirname, '../src/worker')
  
  // 读取源目录下所有文件并复制
  const files = fs.readdirSync(srcPath)
  files.forEach(file => {
    const srcFile = path.join(srcPath, file)
    const destFile = path.join(destDir, file)
    fs.copyFileSync(srcFile, destFile)
    console.log(`Copied: ${file}`)
  })
}

// 创建一个简单的构建配置
export default defineConfig({
  plugins: [{
    name: 'copy-worker',
    buildStart() {
      copyWorkerFiles()
    },
    closeBundle() {
      copyWorkerFiles()
    }
  }]
})