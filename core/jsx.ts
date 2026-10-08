/**
 * @packageDocumentation
 * The runtime implementation for the `@cutout/kernel` pragma, which transforms standard JSX syntax (like
 * `<div>Hello</div>`) into a custom token stream using generators.
 * Think of this as the bridge between TypeScript's JSX emission and XO's runtime-typed
 * intermediate representation (IR).
 */

import {
  TokenType,
  CHILDREN_LABEL,
  FRAGMENT_LABEL,
  TOKEN_TYPE_INDEX,
  TOKEN_VALUE_INDEX,
  UNSERIALIZABLE_LABEL
} from "./tokens/constants.ts";

import {
  isOutputToken,
  isOutputGeneratorToken,
  isValidToken
} from "./tokens/guards.ts";

import { tokenize } from "./tokens/tokenize.ts";

import type {
  AttributeToken,
  ElementCloseToken,
  ElementToken,
  OutputGeneratorToken,
  OutputToken,
  UnknownToken,
} from "./tokens/types.ts";


/**
 * The default @cutout/kernel typings.
 *
 * Without knowing how you want to format your JSX,
 * we must allow all elements and attributes:
 * otherwise nothing will work!
 */
// deno-lint-ignore no-namespace
export namespace JSX {
  /**
   * `IntrinsicElements` must be defined, otherwise nothing is valid.
   */
  export interface IntrinsicElements {
    /** Allows all tags and properties. */
    [elementTag: string]: unknown;
  }
}

/**
 * Custom elements. Define an element function and TypeScript will infer its attributes.
 *
 * @example
 * ```tsx
 * const MyElement = defineElement<{ hello: string; }>(
 *   attributes => <div>{attributes.hello}</div>
 * );
 *
 * const correct = <MyElement hello="123" /> // Works!
 * const incorrect = <MyElement hello={123} /> // Type Error.
 * ```
 */
export type ElementFunction<A = Record<string, unknown>> = (
  attributes: A,
) => OutputGeneratorToken;

/**
 * The core transformation function for `@cutout/kernel`.
 *
 * This is what TypeScript calls when it sees `<MyComponent prop="value">child</MyComponent>`.
 * Instead of returning a node, we return a `XOGeneratorToken`.
 * This allows us to lazily evaluate the component tree.
 *
 * @param element The tag name or element function (e.g., "div" or `MyComponent`).
 * @param _elementAttributes The attribute object passed to the element.
 * @param _elementChildren Child elements.
 *   Note: The "react" pragma passes children as a separate list, while
 *   "react-jsx" includes them inside the attributes. We handle both cases here.
 *
 * @returns A generator token representing the element structure.
 */
export const jsx = (
  element: ElementFunction | string,
  _elementAttributes: { [key: string]: unknown },
  ..._elementChildren: unknown[]
): OutputGeneratorToken => {
  const _generator = function* () {
    // 1. Normalize children across "react" and "react-jsx" pragma types.
    //    We separate children from the rest of the attributes to handle them separately.
    let { children, ...attributes } = _elementAttributes;
    children = children ?? _elementChildren;

    // These are both "single values" and need to be wrapped in an array
    // for consistent processing later.
    if (isValidToken(children) || !Array.isArray(children)) {
      children = [children];
    }

    // 2. If the element is a function, yield said function resolution.
    if (typeof element === "function") {
      const [_, result] = element({ children, ...attributes });
      yield* result();
      return;
    }

    // 3. Otherwise, we've hit an intrinsic element.
    // => 3.1. Yield the opening tag.
    yield [TokenType.ELEMENT_OPEN, element] as ElementToken;

    // => 3.2. Yield all non-child attributes.
    for (const key in attributes) {
      yield [TokenType.ATTRIBUTE, key] as AttributeToken;
      yield* _forwardTokens(attributes[key]);
    }

    // => 3.3. Yield children.
    if (Array.isArray(children) && children.length) {
      yield [
        TokenType.ATTRIBUTE,
        CHILDREN_LABEL,
      ] as AttributeToken;

      for (const child of children as unknown[]) yield* _forwardTokens(child);
    }

    // => 3.4. Yield the closing tag.
    yield [
      TokenType.ELEMENT_CLOSE,
      element,
    ] as ElementCloseToken;
  };

  return [TokenType.GENERATOR, _generator];
};

/**
 * Provided for compatibility with TypeScript/Deno JSX transforms.
 * There's nothing to optimize here.
 */
export const jsxs: typeof jsx = jsx;

/**
 * The special "Fragment" element.
 *
 * In JSX, this lets you group elements without adding an extra wrapper to the
 * DOM. Here, it's just an alias for our fragment label.
 */
export const Fragment: string = FRAGMENT_LABEL;

function* _forwardTokens(
  value: unknown,
  debug = false,
): Generator<OutputToken> {
  if (Array.isArray(value) && !isValidToken(value)) {
    for (const item of value) yield* _forwardTokens(item);
    return;
  }

  if (isOutputGeneratorToken(value)) {
    yield* value[TOKEN_VALUE_INDEX]();
    return;
  }

  if (isOutputToken(value)) {
    yield value;
    return;
  }

  const token = tokenize(value) as OutputToken | UnknownToken;

  if (token[TOKEN_TYPE_INDEX] !== TokenType.UNKNOWN) {
    yield token;
  }

  // ISSUE(#47): implement jsxDEV to exercise the `debug` option.
  if (token[TOKEN_TYPE_INDEX] === TokenType.UNKNOWN && debug) {
    let unknownValue;

    try {
      unknownValue = JSON.stringify(value);
    } catch {
      unknownValue = UNSERIALIZABLE_LABEL;
    }

    console.warn(`Encountered unknown value "${unknownValue}". Skipping.`);
  }
}
