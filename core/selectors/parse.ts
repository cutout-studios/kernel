import { enumGuardFactory, XOError, XOErrorCode } from "__internal__";

import { TokenType } from "../tokens/constants.ts";
import { tokenize } from "../tokens/tokenize.ts";
import type { StringToken } from "../tokens/types.ts";

import { AttributeOperator, Combinator } from "./constants.ts";
import type { AttributeSelector, Selector } from "./types.ts";

export const parse = (query: string): Selector[] => {
  if (/[:@]/.test(query)) {
    throw new XOError(XOErrorCode.OPERATION_UNSUPPORTED);
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
      pointer = pointer ? (pointer.child = result) : (root = result);
    }

    if (!root) throw new XOError(XOErrorCode.DATA_MALFORMED);
    selectors.push(root);
  }

  return selectors;
};

// ISSUE(#97): properly handle CSS.escape'd characters
const _isCombinator = enumGuardFactory(Combinator);
function _parseSubqueryMatch({ groups }: RegExpExecArray): Selector {
  const { c: rawCombinator, s: subquery } = groups!;
  const combinator = rawCombinator?.trim() ||
    (rawCombinator ? Combinator.DESCENDANT : undefined);

  const result: Selector = { attributes: [] };
  let piece: RegExpExecArray | null;

  const subqueryRegex =
    /(?<t>[a-z][\w-]*)|#(?<i>[\w-]+)|\.(?<c>[\w-]+)|(?<a>\[[^\]]*\])/giy;

  while ((piece = subqueryRegex.exec(subquery)) !== null) {
    const { t: tag, i: id, c: className, a: attribute } = piece.groups!;
    if (tag) result.tag = [TokenType.ELEMENT_OPEN, tag];
    else if (id) {
      result.attributes.push({
        key: [TokenType.ATTRIBUTE, "id"],
        value: [TokenType.STRING, id],
      });
    } else if (className) {
      result.attributes.push({
        key: [TokenType.ATTRIBUTE, "class"],
        value: [TokenType.STRING, className],
      });
    } else if (attribute) {
      const parsed = _parseAttribute(attribute);
      if (parsed) result.attributes.push(parsed);
    }
  }

  if (_isCombinator(combinator)) result.combinator = combinator;
  else if (combinator) throw new XOError(XOErrorCode.DATA_MALFORMED);

  return result;
}

const _isAttributeOperator = enumGuardFactory(AttributeOperator);
function _parseAttribute(
  rawAttributeText: string,
): AttributeSelector | undefined {
  const attributeMatch = rawAttributeText.match(
    /(?<k>[-\w]+)(?<o>[$~*^|]?=)?(?<v>"[^"]*"|'[^']*'|[-\w]+)?(?:\s+(?<c>[si]))?/,
  );
  if (!attributeMatch?.groups) return;
  const { k: key, v: value, o: operator, c: casing } = attributeMatch.groups;
  if (!key) return;
  const result: AttributeSelector = { key: [TokenType.ATTRIBUTE, key] };
  if (value) {
    result.value = tokenize(
      value.replace(/^["']|["']$/g, ""),
    ) as StringToken;
  }
  if (casing) result.caseSensitive = casing === "s";
  if (_isAttributeOperator(operator)) result.operator = operator;
  return result;
}
