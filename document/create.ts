/** @jsxImportSource @cutout/kernel */

import type { XOStore } from "@cutout/kernel/document/store";
import {
  isPrimitiveToken,
  tokenizeValue,
  XO_CHILDREN_LABEL,
  XO_TOKEN_TYPE_INDEX,
  XO_TOKEN_VALUE_INDEX,
  type XOAttributeToken,
  type XOIdentifierToken,
  type XOJSXToken,
  XOTokenType,
} from "@cutout/kernel/jsx/token";
import type { XOSelector } from "@cutout/kernel/selector";
import { XOError, XOErrorCode } from "@internal";

import { ROOT_SNAPSHOT_TOKEN } from "./constants.ts";
import { appendAttribute, appendChild, appendTag } from "./snapshots.append.ts";
import { getIdentifierTokenFactory } from "./snapshots.identifier.ts";
import { selectJSX, selectTokens } from "./snapshots.select.ts";
import type { Store } from "./types.ts";

type Options = {
  store: XOStore;
};

/**
 * Creates a new XOStore for saving and manipulating JSX data documents.
 *
 * @param options Configuration options - currently just the backend used.
 * @returns The created XOStore.
 */
export const create = ({ store }: Options): Store => {
  const getSnapshotToken = getIdentifierTokenFactory();

  return {
    append(jsxGenerator: XOJSXToken) {
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
    },
    select(selectors: XOSelector[]): XOJSXToken[] {
      _checkSelectorSupport(selectors);

      const snapshotIds = new Set<string>();
      for (const selector of selectors) {
        for (const snapshot of selectTokens(store, selector)) {
          snapshotIds.add(snapshot[XO_TOKEN_VALUE_INDEX]);
        }
      }

      const result: XOJSXToken[] = [];
      for (const snapshotId of snapshotIds) {
        result.push(
          selectJSX(store, [XOTokenType.IDENTIFIER, snapshotId]),
        );
      }

      return result;
    },
  };
};

function _createChildIndexCounter() {
  const record = {} as Record<string, number>;
  return {
    get([, snapshotId]: XOIdentifierToken) {
      return tokenizeValue(record[snapshotId]);
    },
    init([, snapshotId]: XOIdentifierToken) {
      record[snapshotId] ??= 0;
    },
    increment([, snapshotId]: XOIdentifierToken) {
      record[snapshotId]++;
    },
  };
}

// ISSUE(#100): properly resolve CSS combinators and attribute comparators
function _checkSelectorSupport(selectors: XOSelector[]) {
  for (const { attributes, combinator, child } of selectors) {
    if (combinator || child) {
      throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
    }

    for (const { operator, caseSensitive } of attributes) {
      if (operator || caseSensitive !== undefined) {
        throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
      }
    }
  }
}
