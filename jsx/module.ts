/**
 * @packageDocumentation
 * The runtime implementation for the `@cutout/kernel` pragma, which transforms standard JSX syntax (like
 * `<div>Hello</div>`) into a custom token stream using generators.
 * Think of this as the bridge between TypeScript's JSX emission and XO's runtime-typed
 * intermediate representation (IR).
 */

import type { XOElement } from "@cutout/kernel/element";
import {
  isJSXToken,
  isOutputToken,
  isValidToken,
  tokenizeValue,
  type UnknownToken,
  XO_ATTRIBUTE_TOKEN,
  XO_CHILDREN_LABEL,
  XO_ELEMENT_CLOSE_TOKEN,
  XO_ELEMENT_OPEN_TOKEN,
  XO_FRAGMENT_LABEL,
  XO_GENERATOR_TOKEN,
  XO_TOKEN_TYPE_INDEX,
  XO_TOKEN_VALUE_INDEX,
  XO_UNKNOWN_TOKEN,
  XO_UNSERIALIZABLE_LABEL,
  type XOAttributeToken,
  type XOElementCloseToken,
  type XOElementToken,
  type XOJSXToken,
  type XOOutputToken,
} from "@cutout/kernel/jsx/token";

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

export type XOJSX = XOJSXToken;

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
  element: XOElement | string,
  _elementAttributes: { [key: string]: unknown },
  ..._elementChildren: unknown[]
): XOJSX => {
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
    yield [XO_ELEMENT_OPEN_TOKEN, element] as XOElementToken;

    // => 3.2. Yield all non-child attributes.
    for (const key in attributes) {
      yield [XO_ATTRIBUTE_TOKEN, key] as XOAttributeToken;
      yield* _forwardTokens(attributes[key]);
    }

    // => 3.3. Yield children.
    if (Array.isArray(children) && children.length) {
      yield [
        XO_ATTRIBUTE_TOKEN,
        XO_CHILDREN_LABEL,
      ] as XOAttributeToken;

      for (const child of children as unknown[]) yield* _forwardTokens(child);
    }

    // => 3.4. Yield the closing tag.
    yield [
      XO_ELEMENT_CLOSE_TOKEN,
      element,
    ] as XOElementCloseToken;
  };

  return [XO_GENERATOR_TOKEN, _generator];
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
export const Fragment: string = XO_FRAGMENT_LABEL;

function* _forwardTokens(
  value: unknown,
  debug = false,
): Generator<XOOutputToken> {
  if (Array.isArray(value) && !isValidToken(value)) {
    for (const item of value) yield* _forwardTokens(item);
    return;
  }

  if (isJSXToken(value)) {
    yield* value[XO_TOKEN_VALUE_INDEX]();
    return;
  }

  if (isOutputToken(value)) {
    yield value;
    return;
  }

  const token = tokenizeValue(value) as XOOutputToken | UnknownToken;

  if (token[XO_TOKEN_TYPE_INDEX] !== XO_UNKNOWN_TOKEN) {
    yield token;
  }

  // ISSUE(#47): implement jsxDEV to exercise the `debug` option.
  if (token[XO_TOKEN_TYPE_INDEX] === XO_UNKNOWN_TOKEN && debug) {
    let unknownValue;

    try {
      unknownValue = JSON.stringify(value);
    } catch {
      unknownValue = XO_UNSERIALIZABLE_LABEL;
    }

    console.warn(`Encountered unknown value "${unknownValue}". Skipping.`);
  }
}
