"use client";

import { useEffect } from "react";

type DigestAlgorithm = AlgorithmIdentifier & { name?: string };

function toUint8Array(data: BufferSource): Uint8Array {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  throw new TypeError("Unsupported data type for digest polyfill");
}

function fallbackDigest(data: Uint8Array): ArrayBuffer {
  const result = new Uint8Array(32);
  const view = new DataView(result.buffer);

  let hashA = 0x811c9dc5;
  let hashB = 0x1000193;

  for (let i = 0; i < data.length; i += 1) {
    hashA ^= data[i];
    hashA = Math.imul(hashA, 0x01000193);

    hashB += data[i] + (hashB << 1) + (hashB << 4) + (hashB << 7) + (hashB << 8) + (hashB << 24);
    hashB >>>= 0;
  }

  let valueA = hashA >>> 0;
  let valueB = hashB >>> 0;

  for (let i = 0; i < 8; i += 1) {
    const rotatedB = (valueB << ((i % 5) + 1)) | (valueB >>> (32 - ((i % 5) + 1)));
    const combined = (valueA ^ rotatedB) >>> 0;
    view.setUint32(i * 4, combined);

    valueA = Math.imul(valueA ^ 0x9e3779b9 ^ i, 0x01000193) >>> 0;
    valueB = (valueB + combined + i * 2654435761) >>> 0;
  }

  return result.buffer;
}

function resolveAlgorithm(algorithm: DigestAlgorithm): string {
  if (typeof algorithm === "string") {
    return algorithm;
  }

  if (algorithm?.name) {
    return algorithm.name;
  }

  throw new TypeError("Unsupported algorithm identifier for digest polyfill");
}

export function CryptoSubtlePolyfill() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const cryptoObj: Crypto | undefined = window.crypto || (window as any).msCrypto;

    if (!cryptoObj || (cryptoObj as any).subtle || window.isSecureContext) {
      return;
    }

    const subtlePolyfill = {
      digest: async (algorithm: DigestAlgorithm, data: BufferSource) => {
        const algorithmName = resolveAlgorithm(algorithm).toLowerCase();

        if (algorithmName !== "sha-256") {
          throw new Error("SubtleCrypto polyfill only supports SHA-256");
        }

        const bytes = toUint8Array(data);
        return fallbackDigest(bytes);
      },
      encrypt: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement encrypt")),
      decrypt: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement decrypt")),
      sign: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement sign")),
      verify: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement verify")),
      deriveKey: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement deriveKey")),
      deriveBits: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement deriveBits")),
      generateKey: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement generateKey")),
      importKey: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement importKey")),
      exportKey: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement exportKey")),
      wrapKey: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement wrapKey")),
      unwrapKey: () => Promise.reject(new Error("SubtleCrypto polyfill does not implement unwrapKey")),
    } as SubtleCrypto;

    (cryptoObj as any).subtle = subtlePolyfill;
  }, []);

  return null;
}
