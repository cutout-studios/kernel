import {
  tokenizeValue,
  type XOStringToken,
  XOTokenType,
} from "@cutout/kernel/jsx/token";
import {
  unionGuardFactory,
  XO_DATA_MALFORMED_ERROR_CODE,
  XO_OPERATION_UNSUPPORTED_ERROR_CODE,
  XOError,
} from "@internal";

import {
  ATTRIBUTE_OPERATORS,
  COMBINATORS,
  DESCENDANT_COMBINATOR,
} from "./constants.ts";
import type { AttributeSelector, Selector } from "./types.ts";

/**
 * Creates a JSX selector.
 * @param query The selector string to convert into a selector object.
 * @returns The list of selector objects.
 */
export const create = (query: string): Selector[] => {
  if (/[:@]/.test(query)) {
    throw new XOError(XO_OPERATION_UNSUPPORTED_ERROR_CODE);
  }

  const listRegex = /([^,]+)(?:,|$)/g;
  const combinatorRegex =
    /(?<s>(?:\[[^\]]*\]|[^\s>+~|])+)(?<c>\s*(?:\+|>|~|\|\|)\s*|\s+)?/g;

  const selectors: Selector[] = [];
  let rawQuery: RegExpExecArray | null;

  while ((rawQuery = listRegex.exec(query)) !== null) {
    const statement = rawQuery[0].replaceAll(/\s+/g, " ");
    let root: Selector | undefined;
    let pointer: Selector | undefined;
    let rawSubquery: RegExpExecArray | null;

    // ISSUE(#100): properly resolve CSS combinators (right-most first)
    while ((rawSubquery = combinatorRegex.exec(statement)) !== null) {
      const result = _parseSubqueryMatch(rawSubquery);
      pointer = pointer ? (pointer[3] = result) : (root = result);
    }

    if (!root) throw new XOError(XO_DATA_MALFORMED_ERROR_CODE);
    selectors.push(root);
  }

  return selectors;
};

// ISSUE(#97): properly handle CSS.escape'd characters
const _isCombinator = unionGuardFactory(COMBINATORS);
function _parseSubqueryMatch({ groups }: RegExpExecArray): Selector {
  const { c: rawCombinator, s: subquery } = groups!;
  const combinator = rawCombinator?.trim() ||
    (rawCombinator ? DESCENDANT_COMBINATOR : undefined);

  const result: Selector = [];
  let piece: RegExpExecArray | null;

  const subqueryRegex =
    /(?<t>[a-z][\w-]*)|#(?<i>[\w-]+)|\.(?<c>[\w-]+)|(?<a>\[[^\]]*\])/giy;

  while ((piece = subqueryRegex.exec(subquery)) !== null) {
    const { t: tag, i: id, c: className, a: attribute } = piece.groups!;
    if (id || className || attribute) result[1] ??= [];

    if (tag) result[0] = [XOTokenType.ELEMENT_OPEN, tag];
    else if (id) {
      result[1]!.push([
        [XOTokenType.ATTRIBUTE, "id"],
        [XOTokenType.STRING, id],
      ]);
    } else if (className) {
      result[1]!.push([
        [XOTokenType.ATTRIBUTE, "class"],
        [XOTokenType.STRING, className],
      ]);
    } else if (attribute) {
      const parsed = _parseAttribute(attribute);
      if (parsed) result[1]!.push(parsed);
    }
  }

  if (_isCombinator(combinator)) result[2] = combinator;
  else if (combinator) throw new XOError(XO_DATA_MALFORMED_ERROR_CODE);

  return result;
}

const _isAttributeOperator = unionGuardFactory(ATTRIBUTE_OPERATORS);
function _parseAttribute(
  rawAttributeText: string,
): AttributeSelector | undefined {
  const attributeMatch = rawAttributeText.match(
    /(?<k>[-\w]+)(?<o>[$~*^|]?=)?(?<v>"[^"]*"|'[^']*'|[-\w]+)?(?:\s+(?<c>[si]))?/,
  );
  if (!attributeMatch?.groups) return;
  const { k: key, v: value, o: operator, c: casing } = attributeMatch.groups;
  if (!key) return;
  const result: AttributeSelector = [[XOTokenType.ATTRIBUTE, key]];
  if (value) {
    result[1] = tokenizeValue(
      value.replace(/^["']|["']$/g, ""),
    ) as XOStringToken;
  }
  if (_isAttributeOperator(operator)) result[2] = operator;
  if (casing) result[3] = casing === "s";
  return result;
}
