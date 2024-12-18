import koffi from 'koffi'
import path from 'path'

const sumLib = koffi.load(path.resolve(
  __dirname,
  "../../resources/dylib/sum.dylib"
))

const dylibNativeSum = sumLib.func('__stdcall','sum','int',['int','int'])

export const dylibCallNativeSum = (a:number,b:number) => {
  return dylibNativeSum(a,b)
}


const rsNative = require(path.resolve(
  __dirname,
  "../../resources/node/rs-native.darwin-x64.node"
))

export const rsNativeSum = (a:number,b:number) => {
  return rsNative.sum(a,b)
}

export const rsNativeSubtraction = (a:number,b:number) => {
  return rsNative.subtraction(a,b)
}
