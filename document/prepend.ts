import type { XOStore } from "@cutout/kernel/document/store";
import type { XOJSX } from "@cutout/kernel/jsx";
import {
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
  DATA_MALFORMED_ERROR_CODE,
  OPERATION_UNSUPPORTED_ERROR_CODE,
} from "../internal/constants.ts";
import { XOError } from "../internal/error.ts"; // TODO: createError
import { isPrimitiveToken } from "../jsx/token/guards.ts";
import {
  INDEX_CHILDREN_TOKEN as CHILD_INDEX_TOKEN,
  INDEX_PARENT_TOKEN as PARENT_INDEX_TOKEN,
  INDEX_SNAPSHOTS_TOKEN as ELEMENT_INDEX_TOKEN,
  INDEX_TAGS_TOKEN as ELEMENT_TAG_INDEX_TOKEN,
  ROOT_SNAPSHOT_TOKEN as ROOT_ELEMENT_TOKEN,
  INDEX_ATTRIBUTES_TOKEN as ATTRIBUTE_INDEX_TOKEN,
} from "./constants.ts";
import type { Document } from "./types.ts";

export const prepend = (
  { store: [store] }: Document,
  value: XOJSX,
): Document => {
  const ancestryStack = [ROOT_ELEMENT_TOKEN], descendantCounter = _createDescendantCounter(); // ? TODO

  let currentParent = ROOT_ELEMENT_TOKEN,
    currentElement = _createElementID(),
    currentAttribute = null;
  for (const token of value[XO_TOKEN_VALUE_INDEX]()) {
    switch (token[XO_TOKEN_TYPE_INDEX]) {
      case XO_ELEMENT_OPEN_TOKEN: {
        _storeElementTag(store, currentElement, token);
        _storeElementChild(store, currentParent, currentElement, descendantCounter(currentParent));

        ancestryStack.push(currentElement);
        // descendantCounter(currentParent)++;

        currentAttribute = null;
        break;
      }
      case XO_ATTRIBUTE_TOKEN:
        if (token[XO_TOKEN_VALUE_INDEX] === XO_CHILDREN_LABEL) break;
        currentAttribute = token;
        break;
      case XO_ELEMENT_CLOSE_TOKEN:
        ancestryStack.pop();
        currentElement = _createElementID();
        currentParent = ancestryStack.at(-1);
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
          throw new XOError(OPERATION_UNSUPPORTED_ERROR_CODE);
        }

        _storeElementChild(store, currentParent, token, descendantCounter(currentParent));
        // descendantCounter(currentParent)++;

        break;
      case XO_PROMISE_TOKEN:
        throw new XOError(OPERATION_UNSUPPORTED_ERROR_CODE);
      case XO_FUNCTION_TOKEN:
        throw new XOError(DATA_MALFORMED_ERROR_CODE);
    }
  }

  return target;
};

// TODO: where were these?
const _createElementID = () => {};
const _createDescendantCounter = () => {};

const _storeElementTag = (
  [add]: XOStore,
  elementID: XOIdentifierToken,
  elementTag: XOElementToken,
) => {
  add([ELEMENT_INDEX_TOKEN, elementID, ELEMENT_TAG_INDEX_TOKEN, elementTag]);
  add([ELEMENT_TAG_INDEX_TOKEN, elementTag, elementID]);
};

const _storeElementAttribute = (
  [add]: XOStore,
  elementID: XOIdentifierToken,
  attributeKey: XOAttributeToken,
  attributeValue: XOOutputToken,
) => {
  // ISSUE(#99): Unwrap raw arrays/objects into paths.
  if (!isPrimitiveToken(attributeValue)) {
    throw new XOError(OPERATION_UNSUPPORTED_ERROR_CODE);
  }

  add([
    ELEMENT_INDEX_TOKEN,
    elementID,
    ATTRIBUTE_INDEX_TOKEN,
    attributeKey,
    attributeValue
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
      ATTRIBUTE_INDEX_TOKEN,
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
      ELEMENT_INDEX_TOKEN,
      child,
      PARENT_INDEX_TOKEN,
      elementID,
      position,
    ]);
  }

  add([
    ELEMENT_INDEX_TOKEN,
    elementID,
    CHILD_INDEX_TOKEN,
    position,
    child,
  ]);
};

// ...previous...

//   const appendStack: XOIdentifierToken[] = [ROOT_SNAPSHOT_TOKEN];
//   const childCounter = _createChildIndexCounter();
//   childCounter.init(ROOT_SNAPSHOT_TOKEN);

//   let attributePointer: XOAttributeToken | null = null;
//   for (const token of jsxGenerator[XO_TOKEN_VALUE_INDEX]()) {
//     const parent = appendStack.at(-1) ?? ROOT_SNAPSHOT_TOKEN;
//     const childCount = childCounter.get(parent);

//     switch (token[XO_TOKEN_TYPE_INDEX]) {
//       case XOTokenType.ELEMENT_OPEN: {
//         const snapshot = getSnapshotToken();

//         appendTag(store, { snapshot, tag: token });
//         appendChild(store, {
//           snapshot: parent,
//           child: { token: snapshot, index: childCount },
//         });

//         childCounter.init(snapshot);
//         appendStack.push(snapshot);

//         childCounter.increment(parent);

//         attributePointer = null;
//         break;
//       }
//       case XOTokenType.ATTRIBUTE:
//         if (token[XO_TOKEN_VALUE_INDEX] !== XO_CHILDREN_LABEL) {
//           attributePointer = token;
//         }
//         break;
//       case XOTokenType.ELEMENT_CLOSE:
//         appendStack.pop();
//         /* falls through */
//       case XOTokenType.UNDEFINED:
//         attributePointer = null;
//         break;
//       case XOTokenType.BOOLEAN:
//       case XOTokenType.STRING:
//       case XOTokenType.NUMBER:
//       case XOTokenType.SYMBOL:
//       case XOTokenType.ARRAY:
//       case XOTokenType.OBJECT:
//       case XOTokenType.NULL:
//         if (attributePointer) {
//           appendAttribute(
//             store,
//             {
//               snapshot: parent,
//               attribute: { key: attributePointer, value: token },
//             },
//           );

//           attributePointer = null;
//           break;
//         }

//         if (!isPrimitiveToken(token)) {
//           throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
//         }

//         appendChild(store, {
//           snapshot: parent,
//           child: { token, index: childCount },
//         });
//         childCounter.increment(parent);
//         break;
//       case XOTokenType.PROMISE:
//         throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
//       case XOTokenType.FUNCTION:
//         throw new XOError(XOErrorCode.DATA_MALFORMED);
//     }
//   }
// };
