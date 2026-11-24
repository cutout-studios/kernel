import type {
  XOAttributeToken,
  XOElementToken,
  XOStringToken,
} from "@cutout/kernel/jsx/token";
import type { ATTRIBUTE_OPERATORS, COMBINATORS } from "./constants.ts";

export type Combinator = typeof COMBINATORS[number];

export type AttributeOperator = typeof ATTRIBUTE_OPERATORS[number];

/**
 * Represents a JSX document selector string.
 * (i.e. `div#myCoolElement`)
 */
export type Selector = [
  tag?: XOElementToken,
  attributes?: AttributeSelector[],
  combinator?: Combinator,
  child?: Selector,
];

/**
 * Sub-component of the document selector specific to targeting element attributes.
 * (i.e. `[disabled=false]`)
 */
export type AttributeSelector = [
  key: XOAttributeToken,
  value?: XOStringToken,
  operator?: AttributeOperator,
  caseSensitive?: boolean,
];
