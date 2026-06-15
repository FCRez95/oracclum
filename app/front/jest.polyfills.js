// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextDecoder, TextEncoder } = require("util");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ReadableStream, TransformStream, WritableStream } = require("stream/web");

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder;
}

if (typeof globalThis.ReadableStream === "undefined") {
  globalThis.ReadableStream = ReadableStream;
}

if (typeof globalThis.TransformStream === "undefined") {
  globalThis.TransformStream = TransformStream;
}

if (typeof globalThis.WritableStream === "undefined") {
  globalThis.WritableStream = WritableStream;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const webPrimitives = require("next/dist/compiled/@edge-runtime/primitives/fetch");

for (const key of [
  "Blob",
  "File",
  "FormData",
  "Headers",
  "Request",
  "Response",
  "fetch",
]) {
  if (typeof globalThis[key] === "undefined" && webPrimitives[key]) {
    globalThis[key] = webPrimitives[key];
  }
}
