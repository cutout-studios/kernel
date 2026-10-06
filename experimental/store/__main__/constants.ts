import {
  tokenizeValue,
  XO_CHILDREN_LABEL,
  type XOIdentifierToken,
  XOTokenType,
} from "@cutout/kernel/tokens";

export const DEFAULT_IDENTIFIER_BYTE_LENGTH = 16;
export const DEFAULT_IDENTIFIER_ALPHABET =
  "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

const BIN_DEPTH = 2;
export const BIN_TO_BYTES = 8;
export const BYTE_DEPTH = BIN_DEPTH ** BIN_TO_BYTES;
export const TIMESTAMP_BYTE_LIMIT = 6;

export const ROOT_SNAPSHOT_TOKEN: XOIdentifierToken = [
  XOTokenType.IDENTIFIER,
  "",
];

export const INDEX_TAGS_LABEL = "[[TAGS]]";
export const INDEX_ATTRIBUTES_LABEL = "[[ATTRIBUTES]]";

export const INDEX_SNAPSHOTS_TOKEN = tokenizeValue("[[SNAPSHOTS]]");
export const INDEX_TAGS_TOKEN = tokenizeValue(INDEX_TAGS_LABEL);
export const INDEX_ATTRIBUTES_TOKEN = tokenizeValue(INDEX_ATTRIBUTES_LABEL);
export const INDEX_PARENT_TOKEN = tokenizeValue("[[PARENT]]");
export const INDEX_CHILDREN_TOKEN = tokenizeValue(XO_CHILDREN_LABEL);

export const SELECTION_ATTRIBUTE_KEY_RANK_MAP: Record<string, number> = {
  id: 3,
  key: 2,
  class: 1,
  // *: 0
};
