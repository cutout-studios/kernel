import {
  tokenizeValue,
  XO_CHILDREN_LABEL,
  XO_IDENTIFIER_TOKEN,
  type XOIdentifierToken,
} from "@cutout/kernel/jsx/token";

export const DEFAULT_IDENTIFIER_BYTE_LENGTH = 16;
export const DEFAULT_IDENTIFIER_ALPHABET =
  "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

const BIN_DEPTH = 2;
export const BIN_TO_BYTES = 8;
export const BYTE_DEPTH = BIN_DEPTH ** BIN_TO_BYTES;
export const TIMESTAMP_BYTE_LIMIT = 6;

export const ROOT_SNAPSHOT_TOKEN: XOIdentifierToken = [
  XO_IDENTIFIER_TOKEN,
  "",
];

export const ELEMENT_STORE_LABEL__TAGS = "[[TAGS]]";
export const ELEMENT_STORE_LABEL__ATTRIBUTES = "[[ATTRIBUTES]]";
export const ELEMENT_STORE_LABEL__CHILDREN = XO_CHILDREN_LABEL;

export const ELEMENT_STORE_PREFIX = tokenizeValue("[[ELEMENT]]");
export const ELEMENT_STORE_PREFIX__TAGS = tokenizeValue(
  ELEMENT_STORE_LABEL__TAGS,
);
export const ELEMENT_STORE_PREFIX__ATTRIBUTES = tokenizeValue(
  ELEMENT_STORE_LABEL__ATTRIBUTES,
);
export const ELEMENT_STORE_PREFIX__CHILDREN = tokenizeValue(
  ELEMENT_STORE_LABEL__CHILDREN,
);
export const ELEMENT_STORE_PREFIX__PARENT = tokenizeValue("[[PARENT]]");

export const SELECTION_ATTRIBUTE_KEY_RANK_MAP: Record<string, number> = {
  id: 3,
  key: 2,
  class: 1,
  // *: 0
};
