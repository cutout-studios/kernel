import type {
  AttributeToken,
  ElementToken,
  StringToken,
} from "../tokens/types.ts";
import type { AttributeOperator, Combinator } from "./constants.ts";

export type Selector = {
  tag?: ElementToken;
  attributes: AttributeSelector[];
  combinator?: Combinator;
  child?: Selector;
};

export type AttributeSelector = {
  key: AttributeToken;
  value?: StringToken;
  operator?: AttributeOperator;
  caseSensitive?: boolean;
};
