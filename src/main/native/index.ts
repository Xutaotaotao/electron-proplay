import koffi from 'koffi'
import path from 'path'


export const dylibCallNativeSum = (a:number,b:number) => {
  if (process.platform === 'darwin') {
    const sumLib = koffi.load(path.resolve(
      __dirname,
      "../../resources/dylib/sum.dylib"
    ))
    
    const dylibNativeSum = sumLib.func('__stdcall','sum','int',['int','int'])
    return dylibNativeSum(a,b)
  } else {
    return "not darwin"
  }
}



const rsNative =  process.platform === 'darwin' ? require(path.resolve(
  __dirname,
  "../../resources/node/rs-native.darwin-x64.node"
)) : null

export const rsNativeSum = (a:number,b:number) => {
  return rsNative ? rsNative.sum(a,b) : "not darwin"
}

export const rsNativeSubtraction = (a:number,b:number) => {
  return rsNative ? rsNative.subtraction(a,b) : 'not darwin'
}
