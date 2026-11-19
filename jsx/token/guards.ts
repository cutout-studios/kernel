/**
 * @packageDocumentation
 *
 * These type guards allows `@cutout/kernel` to guarantee robust runtime data type consistency.
 */

import {
  TOKEN_LENGTH,
  TOKEN_TYPE_INDEX,
  TOKEN_VALUE_INDEX,
  TokenType,
} from "./constants.ts";
import type {
  JSXGeneratorToken,
  OutputToken,
  PrimitiveToken,
  PromiseToken,
  ValidToken,
} from "./types.ts";

/**
 * A TypeScript guard for vaild (not unknown) XO Tokens.
 *
 * @param {unknown} value
 */
export const isValidToken = (
  value: unknown,
): value is ValidToken => isOutputToken(value) || isGeneratorToken(value);

/**
 * A TypeScript guard for XO Tokens that can be returned
 * from a Generator.
 *
 * @param {unknown} value
 */
export const isOutputToken = (
  value: unknown,
): value is OutputToken => {
  if (!Array.isArray(value)) return false;
  if (value.length !== TOKEN_LENGTH) return false;

  switch (value[TOKEN_TYPE_INDEX]) {
    case TokenType.NUMBER:
      return typeof value[TOKEN_VALUE_INDEX] === "number" ||
        typeof value[TOKEN_VALUE_INDEX] === "bigint";
    case TokenType.ARRAY:
      return Array.isArray(value[TOKEN_VALUE_INDEX]);
    case TokenType.BOOLEAN:
      return typeof value[TOKEN_VALUE_INDEX] === "boolean";
    case TokenType.NULL:
      return value[TOKEN_VALUE_INDEX] === null;
    case TokenType.OBJECT:
      return typeof value[TOKEN_VALUE_INDEX] === "object";
    case TokenType.FUNCTION:
      return typeof value[TOKEN_VALUE_INDEX] === "function";
    case TokenType.PROMISE:
      return value[TOKEN_VALUE_INDEX] instanceof Promise;
    case TokenType.ATTRIBUTE:
    case TokenType.ELEMENT_OPEN:
    case TokenType.ELEMENT_CLOSE:
    case TokenType.STRING:
      return typeof value[TOKEN_VALUE_INDEX] === "string";
    case TokenType.SYMBOL:
      return typeof value[TOKEN_VALUE_INDEX] === "symbol";
    case TokenType.UNDEFINED:
      return value[TOKEN_VALUE_INDEX] === undefined;
    case TokenType.UNKNOWN:
      return true;
  }

  return false;
};

/**
 * A TypeScript guard for XO Primitive tokens.
 *
 * @param {unknown} value
 */
export const isPrimitiveToken = (value: unknown): value is PrimitiveToken => {
  if (!isOutputToken(value)) return false;

  return [
    TokenType.BOOLEAN,
    TokenType.NULL,
    TokenType.NUMBER,
    TokenType.STRING,
    TokenType.SYMBOL,
    TokenType.UNDEFINED,
  ].includes(value[TOKEN_TYPE_INDEX]);
};

/**
 * A TypeScript guard for XO Promise tokens.
 *
 * @param {unknown} value
 */
export const isPromiseToken = (
  value: unknown,
): value is PromiseToken => {
  if (!isOutputToken(value)) return false;

  return value[TOKEN_TYPE_INDEX] === TokenType.PROMISE;
};

/**
 * A TypeScript guard for XO Generator tokens.
 *
 * @param {unknown} value
 */
export const isGeneratorToken = (
  value: unknown,
): value is JSXGeneratorToken => {
  if (!Array.isArray(value)) return false;
  if (value.length !== TOKEN_LENGTH) return false;

  return value[0] === TokenType.GENERATOR && isGeneratorFactory(value[1]);
};

const isGeneratorFactory = (value: unknown): value is () => Generator => {
  if (typeof value !== "function") {
    return false;
  }

  const maybeGenerator = value();

  return typeof maybeGenerator === "object" && maybeGenerator !== null &&
    "next" in maybeGenerator &&
    "return" in maybeGenerator && "throw" in maybeGenerator;
};
