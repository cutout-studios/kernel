import type { XOStore } from "@cutout/kernel/document/store";
import type { XOJSX } from "@cutout/kernel/jsx";
import {
  isPrimitiveToken,
  tokenizeValue,
  XO_ARRAY_TOKEN,
  XO_ATTRIBUTE_TOKEN,
  XO_BOOLEAN_TOKEN,
  XO_CHILDREN_LABEL,
  XO_ELEMENT_CLOSE_TOKEN,
  XO_ELEMENT_OPEN_TOKEN,
  XO_FUNCTION_TOKEN,
  XO_IDENTIFIER_TOKEN,
  XO_NULL_TOKEN,
  XO_NUMBER_TOKEN,
  XO_OBJECT_TOKEN,
  XO_PROMISE_TOKEN,
  XO_STRING_TOKEN,
  XO_SYMBOL_TOKEN,
  XO_TOKEN_TYPE_INDEX,
  XO_TOKEN_VALUE_INDEX,
  XO_UNDEFINED_TOKEN,
  type XOAttributeToken,
  type XOElementToken,
  type XOIdentifierToken,
  type XONumberToken,
  type XOOutputToken,
  type XOPrimitiveToken,
} from "@cutout/kernel/jsx/token";
import {
  throwError,
  XO_DATA_MALFORMED_ERROR_CODE,
  XO_OPERATION_UNSUPPORTED_ERROR_CODE,
} from "@internal";
import {
  ELEMENT_STORE_PREFIX__ATTRIBUTES,
  ELEMENT_STORE_PREFIX__CHILDREN,
  ELEMENT_STORE_PREFIX__PARENT,
  ELEMENT_STORE_PREFIX,
  ELEMENT_STORE_PREFIX__TAGS,
  ROOT_ELEMENT_TOKEN,
} from "./constants.ts";
import { createIdentifierTokenFactory } from "./identifier.ts";
import type { Document } from "./types.ts";

export const prepend = (
  document: Document,
  value: XOJSX,
): Document => {
  const store = document.store[0],
    createElementID = createIdentifierTokenFactory(),
    ancestryStack = [ROOT_ELEMENT_TOKEN],
    descendantCounter = new Map();

  let currentParent = ROOT_ELEMENT_TOKEN,
    currentElement = createElementID(),
    currentAttribute = null;
  for (const token of value[XO_TOKEN_VALUE_INDEX]()) {
    switch (token[XO_TOKEN_TYPE_INDEX]) {
      case XO_ELEMENT_OPEN_TOKEN: {
        _storeElementTag(store, currentElement, token);
        _storeElementChild(
          store,
          currentParent,
          currentElement,
          descendantCounter.getOrInsert(currentParent, 0),
        );

        ancestryStack.push(currentElement);

        _incrementMapKey(descendantCounter, currentParent);

        currentAttribute = null;
        break;
      }
      case XO_ATTRIBUTE_TOKEN:
        if (token[XO_TOKEN_VALUE_INDEX] === XO_CHILDREN_LABEL) break;
        currentAttribute = token;
        break;
      case XO_ELEMENT_CLOSE_TOKEN:
        ancestryStack.pop();
        currentElement = createElementID();
        currentParent = ancestryStack.at(-1)!;
        /* falls through */
      case XO_UNDEFINED_TOKEN:
        currentAttribute = null;
        break;
      case XO_BOOLEAN_TOKEN:
      case XO_STRING_TOKEN:
      case XO_NUMBER_TOKEN:
      case XO_SYMBOL_TOKEN:
      case XO_ARRAY_TOKEN:
      case XO_OBJECT_TOKEN:
      case XO_NULL_TOKEN:
        if (currentAttribute) {
          _storeElementAttribute(
            store,
            currentElement,
            currentAttribute,
            token,
          );

          currentAttribute = null;
          break;
        }

        if (!isPrimitiveToken(token)) {
          throwError(XO_OPERATION_UNSUPPORTED_ERROR_CODE);
        }

        _storeElementChild(
          store,
          currentParent,
          token as XOPrimitiveToken,
          descendantCounter.getOrInsert(currentParent, 0),
        );

        _incrementMapKey(descendantCounter, currentParent);

        break;
      case XO_PROMISE_TOKEN:
        throwError(XO_OPERATION_UNSUPPORTED_ERROR_CODE);
        /* falls through */
      case XO_FUNCTION_TOKEN:
        throwError(XO_DATA_MALFORMED_ERROR_CODE);
    }
  }

  return document;
};

const _incrementMapKey = <T>(map: Map<T, number>, key: T) =>
  map.set(key, map.getOrInsert(key, 0) + 1);

const _storeElementTag = (
  [add]: XOStore,
  elementID: XOIdentifierToken,
  elementTag: XOElementToken,
) => {
  add([ELEMENT_STORE_PREFIX, elementID, ELEMENT_STORE_PREFIX__TAGS, elementTag]);
  add([ELEMENT_STORE_PREFIX__TAGS, elementTag, elementID]);
};

const _storeElementAttribute = (
  [add]: XOStore,
  elementID: XOIdentifierToken,
  attributeKey: XOAttributeToken,
  attributeValue: XOOutputToken,
) => {
  // ISSUE(#99): Unwrap raw arrays/objects into paths.
  if (!isPrimitiveToken(attributeValue)) {
    throwError(XO_OPERATION_UNSUPPORTED_ERROR_CODE);
  }

  add([
    ELEMENT_STORE_PREFIX,
    elementID,
    ELEMENT_STORE_PREFIX__ATTRIBUTES,
    attributeKey,
    attributeValue as XOPrimitiveToken,
  ]);

  // The attribute reverse lookup table require further processing
  // so the system can match them:

  // => The Store Selector is string-based, so too should the value be so we can match.
  let reverseLookupStrings = [String(attributeValue[XO_TOKEN_VALUE_INDEX])];

  // The class list is an implicit array; we must add each class separately.
  if (
    attributeKey[XO_TOKEN_VALUE_INDEX] === "class" &&
    attributeValue[XO_TOKEN_TYPE_INDEX] === XO_STRING_TOKEN
  ) {
    reverseLookupStrings = attributeValue[XO_TOKEN_VALUE_INDEX].trim()
      .split(/\s+/);
  }

  for (const string of reverseLookupStrings) {
    add([
      ELEMENT_STORE_PREFIX__ATTRIBUTES,
      attributeKey,
      tokenizeValue(string),
      elementID,
    ]);
  }
};

const _storeElementChild = (
  [add]: XOStore,
  elementID: XOIdentifierToken,
  child: XOIdentifierToken | XOPrimitiveToken,
  position: XONumberToken,
) => {
  if (child[XO_TOKEN_TYPE_INDEX] === XO_IDENTIFIER_TOKEN) {
    add([
      ELEMENT_STORE_PREFIX,
      child,
      ELEMENT_STORE_PREFIX__PARENT,
      elementID,
      position,
    ]);
  }

  add([
    ELEMENT_STORE_PREFIX,
    elementID,
    ELEMENT_STORE_PREFIX__CHILDREN,
    position,
    child,
  ]);
};
