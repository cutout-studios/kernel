/**
 * @packageDocumentation
 *
 * These type guards allows `@cutout/kernel` to guarantee robust runtime data type consistency.
 */

import {
  ARRAY_TOKEN,
  ATTRIBUTE_TOKEN,
  BOOLEAN_TOKEN,
  ELEMENT_CLOSE_TOKEN,
  ELEMENT_OPEN_TOKEN,
  FUNCTION_TOKEN,
  GENERATOR_TOKEN,
  NULL_TOKEN,
  NUMBER_TOKEN,
  OBJECT_TOKEN,
  PROMISE_TOKEN,
  STRING_TOKEN,
  SYMBOL_TOKEN,
  TOKEN_LENGTH,
  TOKEN_TYPE_INDEX,
  TOKEN_VALUE_INDEX,
  UNDEFINED_TOKEN,
  UNKNOWN_TOKEN,
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
    case NUMBER_TOKEN:
      return typeof value[TOKEN_VALUE_INDEX] === "number" ||
        typeof value[TOKEN_VALUE_INDEX] === "bigint";
    case ARRAY_TOKEN:
      return Array.isArray(value[TOKEN_VALUE_INDEX]);
    case BOOLEAN_TOKEN:
      return typeof value[TOKEN_VALUE_INDEX] === "boolean";
    case NULL_TOKEN:
      return value[TOKEN_VALUE_INDEX] === null;
    case OBJECT_TOKEN:
      return typeof value[TOKEN_VALUE_INDEX] === "object";
    case FUNCTION_TOKEN:
      return typeof value[TOKEN_VALUE_INDEX] === "function";
    case PROMISE_TOKEN:
      return value[TOKEN_VALUE_INDEX] instanceof Promise;
    case ATTRIBUTE_TOKEN:
    case ELEMENT_OPEN_TOKEN:
    case ELEMENT_CLOSE_TOKEN:
    case STRING_TOKEN:
      return typeof value[TOKEN_VALUE_INDEX] === "string";
    case SYMBOL_TOKEN:
      return typeof value[TOKEN_VALUE_INDEX] === "symbol";
    case UNDEFINED_TOKEN:
      return value[TOKEN_VALUE_INDEX] === undefined;
    case UNKNOWN_TOKEN:
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
    BOOLEAN_TOKEN,
    NULL_TOKEN,
    NUMBER_TOKEN,
    STRING_TOKEN,
    SYMBOL_TOKEN,
    UNDEFINED_TOKEN,
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

  return value[TOKEN_TYPE_INDEX] === PROMISE_TOKEN;
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

  return value[0] === GENERATOR_TOKEN && isGeneratorFactory(value[1]);
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
