/**
 * @packageDocumentation
 *
 * "tokenizeValue" is an important utilty: it transforms arbitrary JavaScript data into tokens.
 */

import type { AnyFunction } from "@internal";
import {
  ARRAY_TOKEN,
  BOOLEAN_TOKEN,
  FUNCTION_TOKEN,
  NULL_TOKEN,
  NUMBER_TOKEN,
  OBJECT_TOKEN,
  PROMISE_TOKEN,
  STRING_TOKEN,
  SYMBOL_TOKEN,
  UNDEFINED_TOKEN,
  UNKNOWN_TOKEN,
} from "./constants.ts";
import type { OutputToken, UnknownToken } from "./types.ts";

type TokenForValue<T> = T extends number | bigint ? [typeof NUMBER_TOKEN, T]
  : T extends string ? [typeof STRING_TOKEN, T]
  : T extends boolean ? [typeof BOOLEAN_TOKEN, T]
  : T extends symbol ? [typeof SYMBOL_TOKEN, T]
  : T extends undefined ? [typeof UNDEFINED_TOKEN, undefined]
  : T extends AnyFunction ? [typeof FUNCTION_TOKEN, T]
  : T extends null ? [typeof NULL_TOKEN, null]
  : T extends readonly unknown[] ? [typeof ARRAY_TOKEN, T]
  : T extends Promise<unknown> ? [typeof PROMISE_TOKEN, T]
  : T extends object ? [typeof OBJECT_TOKEN, T]
  : [typeof UNKNOWN_TOKEN, T];

/**
 * Attempts to convert an arbitrary value into a `XOToken`.
 *
 * @param {unknown} value The unknown value to convert.
 * @returns {OutputToken | UnknownToken}
 *
 * @example
 * ```ts
 * const [type, value] = tokenizeValue("hello");
 *   // type -> XO_STRING_TOKEN
 *   // value -> "hello"
 * ```
 */
export const tokenizeValue = <T>(value: T): TokenForValue<T> =>
  _tokenizeValue(value) as TokenForValue<T>;

function _tokenizeValue(value: unknown): OutputToken | UnknownToken {
  switch (typeof value) {
    case "bigint":
    case "number":
      return [NUMBER_TOKEN, value as number];
    case "string":
      return [STRING_TOKEN, value as string];
    case "boolean":
      return [BOOLEAN_TOKEN, value as boolean];
    case "symbol":
      return [SYMBOL_TOKEN, value as symbol];
    case "undefined":
      return [UNDEFINED_TOKEN, undefined];
    case "function":
      return [FUNCTION_TOKEN, value as AnyFunction];
    case "object":
      if (value === null) {
        return [NULL_TOKEN, null];
      } else if (Array.isArray(value)) {
        return [ARRAY_TOKEN, value];
      } else if (value instanceof Promise) {
        return [PROMISE_TOKEN, value];
      }

      return [OBJECT_TOKEN, value];
    default:
      return [UNKNOWN_TOKEN, value];
  }
}
