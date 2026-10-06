/**
 * @packageDocumentation
 * The runtime implementation for the `@cutout/kernel` pragma, which transforms standard JSX syntax (like
 * `<div>Hello</div>`) into a custom token stream using generators.
 * Think of this as the bridge between TypeScript's JSX emission and XO's runtime-typed
 * intermediate representation (IR).
 */

import {
  isJSXToken,
  isOutputToken,
  isValidToken,
  tokenizeValue,
  type UnknownToken,
  XO_CHILDREN_LABEL,
  XO_FRAGMENT_LABEL,
  XO_TOKEN_TYPE_INDEX,
  XO_TOKEN_VALUE_INDEX,
  XO_UNSERIALIZABLE_LABEL,
  type XOAttributeToken,
  type XOElementCloseToken,
  type XOElementToken,
  type XOJSXToken,
  type XOOutputToken,
  XOTokenType,
} from "@cutout/kernel/tokens";

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
export type XOElementFunction<A = Record<string, unknown>> = (
  attributes: A,
) => XOJSXToken;

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
  element: XOElementFunction | string,
  _elementAttributes: { [key: string]: unknown },
  ..._elementChildren: unknown[]
): XOJSXToken => {
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
    yield [XOTokenType.ELEMENT_OPEN, element] as XOElementToken;

    // => 3.2. Yield all non-child attributes.
    for (const key in attributes) {
      yield [XOTokenType.ATTRIBUTE, key] as XOAttributeToken;
      yield* _forwardTokens(attributes[key]);
    }

    // => 3.3. Yield children.
    if (Array.isArray(children) && children.length) {
      yield [
        XOTokenType.ATTRIBUTE,
        XO_CHILDREN_LABEL,
      ] as XOAttributeToken;

      for (const child of children as unknown[]) yield* _forwardTokens(child);
    }

    // => 3.4. Yield the closing tag.
    yield [
      XOTokenType.ELEMENT_CLOSE,
      element,
    ] as XOElementCloseToken;
  };

  return [XOTokenType.GENERATOR, _generator];
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

  if (token[XO_TOKEN_TYPE_INDEX] !== XOTokenType.UNKNOWN) {
    yield token;
  }

  // ISSUE(#47): implement jsxDEV to exercise the `debug` option.
  if (token[XO_TOKEN_TYPE_INDEX] === XOTokenType.UNKNOWN && debug) {
    let unknownValue;

    try {
      unknownValue = JSON.stringify(value);
    } catch {
      unknownValue = XO_UNSERIALIZABLE_LABEL;
    }

    console.warn(`Encountered unknown value "${unknownValue}". Skipping.`);
  }
}
