const { parentPort } = require('worker_threads')
const { createReadStream, createWriteStream } = require('fs')
const crypto = require('crypto')

async function encryptFile(filePath) {
  return new Promise((resolve, reject) => {
    const algorithm = 'aes-256-cbc'
    const iv = crypto.randomBytes(16)
    const key = crypto.randomBytes(32)
    
    const input = createReadStream(filePath)
    const outputPath = `${filePath}.enc`
    const output = createWriteStream(outputPath)
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    
    input
      .pipe(cipher)
      .pipe(output)
      .on('finish', () => resolve({
        key: key.toString('hex'),
        iv: iv.toString('hex'),
        outputPath
      }))
      .on('error', reject)
  })
}

parentPort.on('message', async ({ type, filePath }) => {
  if (type !== 'ENCRYPT') return
  
  try {
    const result = await encryptFile(filePath)
    parentPort.postMessage({ ...result, filePath })
  } catch (error) {
    parentPort.postMessage({ 
      error: `加密失败: ${error.message}`,
      filePath
    })
  }
})