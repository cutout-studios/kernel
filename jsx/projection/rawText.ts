import {
XO_ARRAY_TOKEN,
XO_ATTRIBUTE_TOKEN,
  XO_BOOLEAN_TOKEN,
  XO_CHILDREN_LABEL,
  XO_ELEMENT_CLOSE_TOKEN,
  XO_ELEMENT_OPEN_TOKEN,
  XO_FRAGMENT_LABEL,
  XO_FUNCTION_TOKEN,
  XO_NULL_TOKEN,
  XO_NUMBER_TOKEN,
  XO_OBJECT_TOKEN,
  XO_PROMISE_TOKEN,
  XO_STRING_TOKEN,
  XO_SYMBOL_TOKEN,
  XO_UNDEFINED_TOKEN,
} from "@cutout/kernel/jsx/token";

import type { Projection } from "./types.ts";

/**
 * A spartan projection that attempts to provide an as-close-to-the-source as possible text representation of the provided JSX.
 *
 * > [!NOTE]
 * > The result is raw - not escaped, nor processed in any intelligent way. Do NOT consume it insecurely.
 *
 * @param JSX The JSX IR to project.
 * @returns The raw JSX text.
 *
 * @example
 * ```tsx
 * rawText(<div></div>); // => "<div></div>"
 * ```
 */
export const rawText: Projection<string> = (jsx): string => {
  const state: _FormatState = {
    result: "",
    context: {
      property: false,
      fragment: false,
    },
  };

  for (const [type, value] of jsx[1]()) {
    switch (type) {
      case XO_ELEMENT_OPEN_TOKEN:
        _openElement(state, value);
        break;
      case XO_ELEMENT_CLOSE_TOKEN:
        _closeElement(state, value);
        break;
      case XO_ATTRIBUTE_TOKEN:
        _addAttribute(state, value);
        break;
      case XO_STRING_TOKEN:
      case XO_SYMBOL_TOKEN:
      case XO_FUNCTION_TOKEN:
      case XO_OBJECT_TOKEN:
      case XO_ARRAY_TOKEN:
      case XO_BOOLEAN_TOKEN:
      case XO_NUMBER_TOKEN:
        _addAttributeValue(state, value);
        break;
      case XO_NULL_TOKEN:
      case XO_UNDEFINED_TOKEN:
      case XO_PROMISE_TOKEN:
      default:
        break;
    }
  }

  return state.result;
};

type _FormatState = {
  result: string;
  context: {
    property: boolean;
    fragment: boolean;
  };
};

// Cognitive convenience methods
function _openElement(
  state: _FormatState,
  value: string,
) {
  if (value === XO_FRAGMENT_LABEL) {
    return state.context.fragment = true;
  }

  state.result += `<${value}`;
  state.context.fragment = false;
  state.context.property = true;
}

function _closeElement(
  state: _FormatState,
  value: string,
) {
  if (value === XO_FRAGMENT_LABEL) {
    return state.context.fragment = false;
  }

  if (state.context.property) {
    state.result += ">";
    state.context.property = false;
  }

  state.result += `</${value}>`;
}

function _addAttribute(
  state: _FormatState,
  value: string,
) {
  if (state.context.fragment) return;

  if (value === XO_CHILDREN_LABEL) {
    state.result += ">";
    return state.context.property = false;
  }

  state.result += ` ${value}=`;
  state.context.property = true;
}

function _addAttributeValue(state: _FormatState, value: unknown) {
  value = String(value);

  if (state.context.property) {
    return state.result += `"${value}"`;
  }

  state.result += value;
}
