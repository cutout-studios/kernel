import type {
  XOAttributeToken,
  XOElementToken,
  XOStringToken,
} from "@cutout/kernel/tokens";
import type { AttributeOperator, Combinator } from "./constants.ts";

export type Selector = {
  tag?: XOElementToken;
  attributes: AttributeSelector[];
  combinator?: Combinator;
  child?: Selector;
};

export type AttributeSelector = {
  key: XOAttributeToken;
  value?: XOStringToken;
  operator?: AttributeOperator;
  caseSensitive?: boolean;
};
