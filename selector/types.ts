import type {
  XOAttributeToken,
  XOElementToken,
  XOStringToken,
} from "@cutout/kernel/jsx/token";
import type { AttributeOperator, Combinator } from "./constants.ts";

/**
 * Represents a JSX document selector string.
 * (i.e. `div#myCoolElement`)
 */
export type Selector = [
  tag?: XOElementToken,
  attributes?: AttributeSelector[],
  combinator?: Combinator,
  child?: Selector
];

/**
 * Sub-component of the document selector specific to targeting element attributes.
 * (i.e. `[disabled=false]`)
 */
export type AttributeSelector = [
  key: XOAttributeToken,
  value?: XOStringToken,
  operator?: AttributeOperator,
  caseSensitive?: boolean
];
