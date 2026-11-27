import type { XOJSX } from "@cutout/kernel/jsx";
import type { XOSelector } from "@cutout/kernel/selector";
import type { Document } from "./types.ts";

export const query = (
  document: Document,
  selector: XOSelector,
): XOJSX => [];

// type SelectionFrame = {
//   isSnapshot: true;
//   token: XOIdentifierToken;
// } | {
//   isSnapshot: false;
//   token: XOOutputToken;
// };

// export function selectJSX(
//   store: XOStore,
//   snapshot: XOIdentifierToken,
// ): XOJSXToken {
//   return [
//     XOTokenType.GENERATOR,
//     function* () {
//       let selectionStack: SelectionFrame[] = [
//         { token: snapshot, isSnapshot: true },
//       ];
//       while (selectionStack.length) {
//         const frame = selectionStack.pop()!;

//         if (!frame.isSnapshot) {
//           yield frame.token;
//           continue;
//         }

//         const snapshotPathGenerator = store.list([
//           INDEX_SNAPSHOTS_TOKEN,
//           frame.token,
//         ]);

//         if (!snapshotPathGenerator) continue;

//         let tagValue: string | undefined;
//         const attributes: (XOAttributeToken | XOPrimitiveToken)[] = [];
//         const orderedChildren: SelectionFrame[] = [];
//         for (const path of snapshotPathGenerator) {
//           if (isPromiseToken(path)) {
//             throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
//           }

//           const [indexNameToken, keyToken, valueToken] = path as XOStorePath;

//           switch (indexNameToken[XO_TOKEN_VALUE_INDEX]) {
//             case INDEX_TAGS_LABEL: {
//               yield keyToken as XOElementToken;
//               [, tagValue] = keyToken as XOElementToken;
//               break;
//             }
//             case INDEX_ATTRIBUTES_LABEL:
//               attributes.push(
//                 keyToken as XOAttributeToken,
//                 valueToken as XOPrimitiveToken,
//               );
//               break;
//             case XO_CHILDREN_LABEL: {
//               const [, childIndex] = keyToken as XONumberToken;
//               const [childType] = valueToken;

//               orderedChildren[childIndex] = childType === XOTokenType.IDENTIFIER
//                 ? {
//                   isSnapshot: true,
//                   token: valueToken as XOIdentifierToken,
//                 }
//                 : {
//                   isSnapshot: false,
//                   token: valueToken as XOPrimitiveToken,
//                 };
//             }
//           }
//         }

//         yield* attributes;

//         if (orderedChildren.length) {
//           yield [XOTokenType.ATTRIBUTE, XO_CHILDREN_LABEL];
//         }

//         selectionStack = [...selectionStack, {
//           isSnapshot: false,
//           token: [XOTokenType.ELEMENT_CLOSE, tagValue!],
//         }, ...(orderedChildren.reverse())];
//       }
//     },
//   ];
// }

// export function selectTokens(
//   store: XOStore,
//   { attributes, tag }: XOSelector,
// ): XOIdentifierToken[] {
//   let result;

//   if (attributes) {
//     for (
//       const { value, key } of [...attributes].sort(
//         _attributeSpecificityHeuristic,
//       )
//     ) {
//       const attributeSet = new Set<string>();
//       const prefix = value ? [key, value] : [key];
//       for (
//         const path of store.list([INDEX_ATTRIBUTES_TOKEN, ...prefix]) ??
//           []
//       ) {
//         if (isPromiseToken(path)) {
//           throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
//         }

//         const [, snapshotId] = path.at(-1) as XOIdentifierToken;

//         attributeSet.add(snapshotId);
//       }

//       result = result ? _intersect(result, attributeSet) : attributeSet;
//     }
//   }

//   if (tag) {
//     const tagSet = new Set<string>();
//     for (
//       const path of store.list([INDEX_TAGS_TOKEN, tag]) ?? []
//     ) {
//       if (isPromiseToken(path)) {
//         throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
//       }

//       const [, snapshotId] = path.at(-1) as XOIdentifierToken;

//       tagSet.add(snapshotId);
//     }
//     result = result ? _intersect(result, tagSet) : tagSet;
//   }

//   return Array.from(result ?? new Set<string>()).map(
//     (id) => [XOTokenType.IDENTIFIER, id],
//   );
// }

// function _intersect<T>(left: Set<T>, right: Set<T>): Set<T> {
//   const result = new Set<T>();

//   const [smallerSet, largerSet] = left.size < right.size
//     ? [left, right]
//     : [right, left];
//   for (const item of smallerSet) {
//     if (largerSet.has(item)) {
//       result.add(item);
//     }
//   }

//   return result;
// }

// function _attributeSpecificityHeuristic(
//   {
//     key: [, leftKeyValue],
//     value: [, leftValue] = tokenizeValue(""),
//   }: XOAttributeSelector,
//   {
//     key: [, rightKeyValue],
//     value: [, rightValue] = tokenizeValue(""),
//   }: XOAttributeSelector,
// ): number {
//   const rankDifference =
//     (SELECTION_ATTRIBUTE_KEY_RANK_MAP[rightKeyValue] ?? 0) -
//     (SELECTION_ATTRIBUTE_KEY_RANK_MAP[leftKeyValue] ?? 0);
//   if (rankDifference) return rankDifference;

//   return (rightValue.length || rightKeyValue.length) -
//     (leftValue.length || leftKeyValue.length);
// }

// };

// // ISSUE(#100): properly resolve CSS combinators and attribute comparators
// function _checkSelectorSupport(selectors: XOSelector[]) {
//   for (const { attributes, combinator, child } of selectors) {
//     if (combinator || child) {
//       throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
//     }

//     for (const { operator, caseSensitive } of attributes) {
//       if (operator || caseSensitive !== undefined) {
//         throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
//       }
//     }
//   }
// }
