import { XOError, XOErrorCode } from "@cutout/internal";
import {
  isPrimitiveToken,
  tokenizeValue,
  XO_TOKEN_TYPE_INDEX,
  XO_TOKEN_VALUE_INDEX,
  type XOAttributeToken,
  type XOElementToken,
  type XOIdentifierToken,
  type XONumberToken,
  type XOOutputToken,
  type XOPrimitiveToken,
  XOTokenType,
} from "@cutout/kernel/tokens";
import type { XOBackend } from "@cutout/store/backend";

import {
  INDEX_ATTRIBUTES_TOKEN,
  INDEX_CHILDREN_TOKEN,
  INDEX_PARENT_TOKEN,
  INDEX_SNAPSHOTS_TOKEN,
  INDEX_TAGS_TOKEN,
  ROOT_SNAPSHOT_TOKEN,
} from "./constants.ts";

export function appendTag(
  backend: XOBackend,
  { snapshot, tag }: {
    snapshot: XOIdentifierToken;
    tag: XOElementToken;
  },
): void {
  backend.add([
    INDEX_SNAPSHOTS_TOKEN,
    snapshot,
    INDEX_TAGS_TOKEN,
    tag,
  ]);
  backend.add([INDEX_TAGS_TOKEN, tag, snapshot]);
}

export function appendAttribute(
  backend: XOBackend,
  { snapshot, attribute: { key, value } }: {
    snapshot: XOIdentifierToken;
    attribute: { key: XOAttributeToken; value: XOOutputToken };
  },
): void {
  // ISSUE(#99): Unwrap raw arrays/objects into backend paths.
  if (!isPrimitiveToken(value)) {
    throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
  }

  backend.add([
    INDEX_SNAPSHOTS_TOKEN,
    snapshot,
    INDEX_ATTRIBUTES_TOKEN,
    key,
    value,
  ]);

  // The attribute reverse lookup table require further processing
  // so the system can match them:

  // => The Store Selector is string-based, so too should the value be so we can match.
  let reverseLookupStrings = [String(value[XO_TOKEN_VALUE_INDEX])];

  // => The class list is an implicit array; we must add each class separately.
  if (
    key[XO_TOKEN_VALUE_INDEX] === "class" &&
    value[XO_TOKEN_TYPE_INDEX] === XOTokenType.STRING
  ) {
    reverseLookupStrings = value[XO_TOKEN_VALUE_INDEX].trim()
      .split(/\s+/);
  }

  for (const string of reverseLookupStrings) {
    backend.add([
      INDEX_ATTRIBUTES_TOKEN,
      key,
      tokenizeValue(string),
      snapshot,
    ]);
  }
}

export function appendChild(
  backend: XOBackend,
  { snapshot = ROOT_SNAPSHOT_TOKEN, child: { token: child, index } }: {
    snapshot?: XOIdentifierToken;
    child: {
      token: XOIdentifierToken | XOPrimitiveToken;
      index: XONumberToken;
    };
  },
) {
  if (child[XO_TOKEN_TYPE_INDEX] === XOTokenType.IDENTIFIER) {
    backend.add([
      INDEX_SNAPSHOTS_TOKEN,
      snapshot,
      INDEX_CHILDREN_TOKEN,
      index,
      child,
    ]);

    backend.add([
      INDEX_SNAPSHOTS_TOKEN,
      child,
      INDEX_PARENT_TOKEN,
      snapshot,
      index,
    ]);

    return;
  }

  backend.add([
    INDEX_SNAPSHOTS_TOKEN,
    snapshot,
    INDEX_CHILDREN_TOKEN,
    index,
    child,
  ]);
}
