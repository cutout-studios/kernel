/**
 * @packageDocumentation
 *
 * "tokenizeValue" is an important utilty: it transforms arbitrary JavaScript data into tokens.
 */

import type { AnyFunction } from "@cutout/internal";
import { TokenType } from "./constants.ts";
import type { OutputToken, UnknownToken } from "./types.ts";

type TokenForValue<T> = T extends number | bigint ? [TokenType.NUMBER, T]
  : T extends string ? [TokenType.STRING, T]
  : T extends boolean ? [TokenType.BOOLEAN, T]
  : T extends symbol ? [TokenType.SYMBOL, T]
  : T extends undefined ? [TokenType.UNDEFINED, undefined]
  : T extends AnyFunction ? [TokenType.FUNCTION, T]
  : T extends null ? [TokenType.NULL, null]
  : T extends readonly unknown[] ? [TokenType.ARRAY, T]
  : T extends Promise<unknown> ? [TokenType.PROMISE, T]
  : T extends object ? [TokenType.OBJECT, T]
  : [TokenType.UNKNOWN, T];

/**
 * Attempts to convert an arbitrary value into a `XOToken`.
 *
 * @param {unknown} value The unknown value to convert.
 * @returns {OutputToken | UnknownToken}
 *
 * @example
 * ```ts
 * const [type, value] = tokenizeValue("hello");
 *   // type -> XOTokenType.String
 *   // value -> "hello"
 * ```
 */
export const tokenizeValue = <T>(value: T): TokenForValue<T> =>
  _tokenizeValue(value) as TokenForValue<T>;

function _tokenizeValue(value: unknown): OutputToken | UnknownToken {
  switch (typeof value) {
    case "bigint":
    case "number":
      return [TokenType.NUMBER, value as number];
    case "string":
      return [TokenType.STRING, value as string];
    case "boolean":
      return [TokenType.BOOLEAN, value as boolean];
    case "symbol":
      return [TokenType.SYMBOL, value as symbol];
    case "undefined":
      return [TokenType.UNDEFINED, undefined];
    case "function":
      return [TokenType.FUNCTION, value as AnyFunction];
    case "object":
      if (value === null) {
        return [TokenType.NULL, null];
      } else if (Array.isArray(value)) {
        return [TokenType.ARRAY, value];
      } else if (value instanceof Promise) {
        return [TokenType.PROMISE, value];
      }

      return [TokenType.OBJECT, value];
    default:
      return [TokenType.UNKNOWN, value];
  }
}
