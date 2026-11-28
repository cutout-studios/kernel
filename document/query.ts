import type { XOStore, XOStorePath } from "@cutout/kernel/document/store";
import type { XOJSX } from "@cutout/kernel/jsx";
import {
  isPromiseToken,
  tokenizeValue,
  XO_ATTRIBUTE_TOKEN,
  XO_ELEMENT_CLOSE_TOKEN,
  XO_GENERATOR_TOKEN,
  XO_IDENTIFIER_TOKEN,
  XO_TOKEN_VALUE_INDEX,
  type XOAttributeToken,
  type XOElementCloseToken,
  type XOElementToken,
  type XOIdentifierToken,
  type XONumberToken,
  type XOOutputToken,
} from "@cutout/kernel/jsx/token";
import type { XOAttributeSelector, XOSelector } from "@cutout/kernel/selector";

import { throwError, XO_OPERATION_UNSUPPORTED_ERROR_CODE } from "@internal";

import {
  ELEMENT_STORE_LABEL__ATTRIBUTES,
  ELEMENT_STORE_LABEL__CHILDREN,
  ELEMENT_STORE_LABEL__TAGS,
  ELEMENT_STORE_PREFIX,
  ELEMENT_STORE_PREFIX__ATTRIBUTES,
  ELEMENT_STORE_PREFIX__TAGS,
  SELECTION_ATTRIBUTE_KEY_RANK_MAP,
} from "./constants.ts";
import type { Document } from "./types.ts";

// NOTE: temp naive implementation
// ISSUE(#100): properly resolve CSS combinators and attribute comparators
export const query = (
  document: Document,
  [tag, attributes]: XOSelector,
): XOJSX => {
  const { store: [store] } = document, [, list] = store;

  return [
    XO_GENERATOR_TOKEN,
    function* () {
      let results;

      if (attributes) {
        for (
          const [key, value] of [...attributes].sort(
            _attributeSpecificityHeuristic,
          )
        ) {
          const attributeSet = new Set<string>();
          const prefix = value ? [key, value] : [key];
          for (
            const path of list([ELEMENT_STORE_PREFIX__ATTRIBUTES, ...prefix]) ??
              []
          ) {
            if (isPromiseToken(path)) {
              throwError(XO_OPERATION_UNSUPPORTED_ERROR_CODE);
            }

            const [, snapshotId] = path.at(-1) as XOIdentifierToken;

            attributeSet.add(snapshotId);
          }

          results = results ? _intersect(results, attributeSet) : attributeSet;
        }
      }

      if (tag) {
        const tagSet = new Set<string>();
        for (
          const path of list([ELEMENT_STORE_PREFIX__TAGS, tag]) ?? []
        ) {
          if (isPromiseToken(path)) {
            throwError(XO_OPERATION_UNSUPPORTED_ERROR_CODE);
          }

          const [, snapshotId] = path.at(-1) as XOIdentifierToken;

          tagSet.add(snapshotId);
        }
        results = results ? _intersect(results, tagSet) : tagSet;
      }

      for (const result of results ?? []) {
        yield* _retrieveElement(store, [XO_IDENTIFIER_TOKEN, result])
          [XO_TOKEN_VALUE_INDEX]();
      }
    },
  ];
};

const _retrieveElement = (
  [, list]: XOStore,
  elementID: XOIdentifierToken,
): XOJSX => [
  XO_GENERATOR_TOKEN,
  function* () {
    let stack: [XOIdentifierToken | XOOutputToken, boolean][] = [[
      elementID,
      true,
    ]];

    while (stack.length) {
      const [currentToken, isElementID] = stack.pop()!;

      if (!isElementID) {
        yield currentToken as XOOutputToken;
        continue;
      }

      const listResults = list([
        ELEMENT_STORE_PREFIX,
        currentToken as XOIdentifierToken,
      ]);

      if (!listResults) continue;

      const elementAttributes: XOOutputToken[] = [],
        elementChildren: [XOOutputToken, boolean][] = [];

      let currentElementTag: string;
      for (const listResult of listResults) {
        if (isPromiseToken(listResult)) {
          throwError(XO_OPERATION_UNSUPPORTED_ERROR_CODE);
        }

        const [[, resultType], keyToken, valueToken] =
          listResult as XOStorePath;

        switch (resultType) {
          case ELEMENT_STORE_LABEL__TAGS: {
            yield keyToken as XOElementToken;
            [, currentElementTag] = keyToken as XOElementToken;
            break;
          }
          case ELEMENT_STORE_LABEL__ATTRIBUTES:
            elementAttributes.push(
              keyToken as XOAttributeToken,
              valueToken as XOOutputToken,
            );
            break;
          case ELEMENT_STORE_LABEL__CHILDREN: {
            const [, childPosition] = keyToken as XONumberToken,
              [childType] = valueToken;
            elementChildren[childPosition] = [
              valueToken as XOOutputToken,
              childType === XO_IDENTIFIER_TOKEN,
            ];
            break;
          }
        }
      }

      yield* elementAttributes;

      if (elementChildren.length) {
        yield [
          XO_ATTRIBUTE_TOKEN,
          ELEMENT_STORE_LABEL__CHILDREN,
        ] as XOAttributeToken;
      }

      stack = [
        ...stack,
        [[
          XO_ELEMENT_CLOSE_TOKEN,
          currentElementTag!,
        ], false] as [XOElementCloseToken, boolean],
        ...(elementChildren.reverse()),
      ];
    }
  },
];

const _attributeSpecificityHeuristic = (
  [
    [, leftKeyValue],
    [, leftValue] = tokenizeValue(""),
  ]: XOAttributeSelector,
  [
    [, rightKeyValue],
    [, rightValue] = tokenizeValue(""),
  ]: XOAttributeSelector,
): number => {
  const rankDifference =
    (SELECTION_ATTRIBUTE_KEY_RANK_MAP[rightKeyValue] ?? 0) -
    (SELECTION_ATTRIBUTE_KEY_RANK_MAP[leftKeyValue] ?? 0);
  if (rankDifference) return rankDifference;

  return (rightValue.length || rightKeyValue.length) -
    (leftValue.length || leftKeyValue.length);
};

const _intersect = <T>(left: Set<T>, right: Set<T>): Set<T> => {
  const result = new Set<T>();

  const [smallerSet, largerSet] = left.size < right.size
    ? [left, right]
    : [right, left];
  for (const item of smallerSet) {
    if (largerSet.has(item)) result.add(item);
  }

  return result;
};
