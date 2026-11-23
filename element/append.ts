import type { XODocument } from "@cutout/kernel/document";
import type { XOJSX } from "@cutout/kernel/jsx";

import type { Element } from "./types.ts";

// TODO: see document/snapshots.append.ts
export const append = <T extends XOJSX | XODocument>(
  target: T,
  value: XOJSX | Element,
): T => {
  const appendStack: XOIdentifierToken[] = [ROOT_SNAPSHOT_TOKEN];
  const childCounter = _createChildIndexCounter();
  childCounter.init(ROOT_SNAPSHOT_TOKEN);

  let attributePointer: XOAttributeToken | null = null;
  for (const token of jsxGenerator[XO_TOKEN_VALUE_INDEX]()) {
    const parent = appendStack.at(-1) ?? ROOT_SNAPSHOT_TOKEN;
    const childCount = childCounter.get(parent);

    switch (token[XO_TOKEN_TYPE_INDEX]) {
      case XOTokenType.ELEMENT_OPEN: {
        const snapshot = getSnapshotToken();

        appendTag(store, { snapshot, tag: token });
        appendChild(store, {
          snapshot: parent,
          child: { token: snapshot, index: childCount },
        });

        childCounter.init(snapshot);
        appendStack.push(snapshot);

        childCounter.increment(parent);

        attributePointer = null;
        break;
      }
      case XOTokenType.ATTRIBUTE:
        if (token[XO_TOKEN_VALUE_INDEX] !== XO_CHILDREN_LABEL) {
          attributePointer = token;
        }
        break;
      case XOTokenType.ELEMENT_CLOSE:
        appendStack.pop();
        /* falls through */
      case XOTokenType.UNDEFINED:
        attributePointer = null;
        break;
      case XOTokenType.BOOLEAN:
      case XOTokenType.STRING:
      case XOTokenType.NUMBER:
      case XOTokenType.SYMBOL:
      case XOTokenType.ARRAY:
      case XOTokenType.OBJECT:
      case XOTokenType.NULL:
        if (attributePointer) {
          appendAttribute(
            store,
            {
              snapshot: parent,
              attribute: { key: attributePointer, value: token },
            },
          );

          attributePointer = null;
          break;
        }

        if (!isPrimitiveToken(token)) {
          throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
        }

        appendChild(store, {
          snapshot: parent,
          child: { token, index: childCount },
        });
        childCounter.increment(parent);
        break;
      case XOTokenType.PROMISE:
        throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
      case XOTokenType.FUNCTION:
        throw new XOError(XOErrorCode.DATA_MALFORMED);
    }
  }
};

import type { XOStore } from "@cutout/kernel/document/store";
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
} from "@cutout/kernel/jsx/token";
import { XOError, XOErrorCode } from "@internal";

import {
  INDEX_ATTRIBUTES_TOKEN,
  INDEX_CHILDREN_TOKEN,
  INDEX_PARENT_TOKEN,
  INDEX_SNAPSHOTS_TOKEN,
  INDEX_TAGS_TOKEN,
  ROOT_SNAPSHOT_TOKEN,
} from "./constants.ts";

export function appendTag(
  store: XOStore,
  { snapshot, tag }: {
    snapshot: XOIdentifierToken;
    tag: XOElementToken;
  },
): void {
  store.add([
    INDEX_SNAPSHOTS_TOKEN,
    snapshot,
    INDEX_TAGS_TOKEN,
    tag,
  ]);
  store.add([INDEX_TAGS_TOKEN, tag, snapshot]);
}

export function appendAttribute(
  store: XOStore,
  { snapshot, attribute: { key, value } }: {
    snapshot: XOIdentifierToken;
    attribute: { key: XOAttributeToken; value: XOOutputToken };
  },
): void {
  // ISSUE(#99): Unwrap raw arrays/objects into backend paths.
  if (!isPrimitiveToken(value)) {
    throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
  }

  store.add([
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
    store.add([
      INDEX_ATTRIBUTES_TOKEN,
      key,
      tokenizeValue(string),
      snapshot,
    ]);
  }
}

export function appendChild(
  store: XOStore,
  { snapshot = ROOT_SNAPSHOT_TOKEN, child: { token: child, index } }: {
    snapshot?: XOIdentifierToken;
    child: {
      token: XOIdentifierToken | XOPrimitiveToken;
      index: XONumberToken;
    };
  },
) {
  if (child[XO_TOKEN_TYPE_INDEX] === XOTokenType.IDENTIFIER) {
    store.add([
      INDEX_SNAPSHOTS_TOKEN,
      snapshot,
      INDEX_CHILDREN_TOKEN,
      index,
      child,
    ]);

    store.add([
      INDEX_SNAPSHOTS_TOKEN,
      child,
      INDEX_PARENT_TOKEN,
      snapshot,
      index,
    ]);

    return;
  }

  store.add([
    INDEX_SNAPSHOTS_TOKEN,
    snapshot,
    INDEX_CHILDREN_TOKEN,
    index,
    child,
  ]);
}
