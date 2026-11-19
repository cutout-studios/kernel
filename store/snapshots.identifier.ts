import { XOError } from "@cutout/internal";
import { type XOIdentifierToken, XOTokenType } from "@cutout/kernel/tokens";

import {
  BIN_TO_BYTES,
  BYTE_DEPTH,
  DEFAULT_IDENTIFIER_ALPHABET,
  DEFAULT_IDENTIFIER_BYTE_LENGTH,
  TIMESTAMP_BYTE_LIMIT,
} from "./constants.ts";

export function getIdentifierTokenFactory(
  {
    totalByteLength = DEFAULT_IDENTIFIER_BYTE_LENGTH,
  } = {},
): () => XOIdentifierToken {
  let randomByteLength, timeByteLength;

  if (totalByteLength <= TIMESTAMP_BYTE_LIMIT) {
    timeByteLength = Math.ceil(totalByteLength / 2);
    randomByteLength = Math.floor(totalByteLength / 2);
  } else {
    timeByteLength = TIMESTAMP_BYTE_LIMIT;
    randomByteLength = totalByteLength - TIMESTAMP_BYTE_LIMIT;
  }

  let lastTime = -1;
  let lastRandom = new Uint8Array(randomByteLength);

  return function getIdentifierToken(): XOIdentifierToken {
    const now = Date.now();

    if (now <= lastTime) {
      lastRandom = _incrementBuffer(lastRandom);

      if (!lastRandom.length) {
        lastTime += 1;
        lastRandom = crypto.getRandomValues(new Uint8Array(randomByteLength));
      }
    } else {
      lastTime = now;
      lastRandom = crypto.getRandomValues(lastRandom);
    }

    const result = new Uint8Array(totalByteLength);

    result.set(_timeToBytes(lastTime, timeByteLength));
    result.set(lastRandom, timeByteLength);

    return [XOTokenType.IDENTIFIER, _encode(result)];
  };
}

function _incrementBuffer(value: Uint8Array): Uint8Array<ArrayBuffer> {
  let pointer = value.length;
  while (pointer--) {
    if (value[pointer] < BYTE_DEPTH - 1) {
      value[pointer]++;
      const container = new Uint8Array(value.length);
      container.set(value);
      return container;
    }

    value[pointer] = 0;
  }

  return new Uint8Array();
}

function _timeToBytes(time: number, bytes: number): Uint8Array {
  if (bytes > TIMESTAMP_BYTE_LIMIT) throw new XOError();

  const result = new Uint8Array(bytes);

  let pointer = result.length;
  while (pointer--) {
    result[pointer] = time % BYTE_DEPTH;
    time = Math.floor(time / BYTE_DEPTH);
  }

  return result;
}

export function _encode(
  bytes: Uint8Array,
  { alphabet = DEFAULT_IDENTIFIER_ALPHABET } = {},
): string {
  const characterSpaceSize = Math.log2(alphabet.length);
  const mask = alphabet.length - 1;

  let [result, buffer, bits] = ["", 0, 0];

  for (const byte of bytes) {
    buffer = (buffer << BIN_TO_BYTES) | byte;
    bits += BIN_TO_BYTES;

    while (bits >= characterSpaceSize) {
      bits -= characterSpaceSize;
      result += alphabet[(buffer >> bits) & mask];
    }

    buffer &= (1 << bits) - 1;
  }

  if (bits > 0) {
    result += alphabet[(buffer << (characterSpaceSize - bits)) & mask];
  }

  return result;
}
