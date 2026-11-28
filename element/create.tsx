/// <reference lib="dom" />

/** @jsxImportSource @cutout/kernel */

import type { XOJSX } from "@cutout/kernel/jsx";
import type { XOProjection } from "@cutout/kernel/jsx/projection";

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
  XO_STRING_TOKEN,
  XO_SYMBOL_TOKEN,
  XO_UNDEFINED_TOKEN,
} from "@cutout/kernel/jsx/token";
import type { Element } from "./types.ts";

export const create = (
  render: (attributes: Record<string, unknown>) => XOJSX,
): Element<Record<string, unknown>> => {
  const name = `xo-${
    crypto.subtle.digest("SHA-1", new TextEncoder().encode(render.toString()))
  }`;

  customElements.define(
    name,
    class extends HTMLElement {
      #controller = new AbortController();
      #observer = new MutationObserver(this.#render);

      connectedCallback() {
        this.#observer.observe(this, {
          attributes: true,
          attributeOldValue: true,
        });

        this.#render();
      }

      disconnectedCallback() {
        this.#observer.disconnect();
        this.#controller.abort();
      }

      get #attributeObject() {
        const result: Record<string, unknown> = {};

        for (const { name, value } of this.attributes) {
          result[name] = value;
        }

        return result;
      }

      #render() {
        if (!this.shadowRoot) this.attachShadow({ mode: "open" });

        const selectorStates = _getDOMSelectorStates(this.shadowRoot!);

        requestAnimationFrame(() => {
          this.shadowRoot!.replaceChildren(
            ..._domTransform(render(this.#attributeObject), {
              event: { signal: this.#controller.signal },
            }),
          );
          this.shadowRoot!.appendChild(this.shadowRoot!.cloneNode(true));

          _applyDOMSelectorStates(this.shadowRoot!, selectorStates);
        });
      }
    },
  );

  const _ = { name };
  return (attributes) => (
    <_.name {...attributes}>
      <template shadowrootmode="open">{render(attributes)}</template>
    </_.name>
  );
};

// TODO: convert to XOSelector => [type, data][]
type DOMSelectorStates = Record<
  string,
  {
    focus: boolean;
    scroll?: { left: number; top: number };
    popover: boolean;
  }
>;

function _getDOMSelectorStates(root: ShadowRoot): DOMSelectorStates {
  const selectorStates: DOMSelectorStates = {};
  const elementStack: [element: HTMLElement, index: number][] = [];

  for (let i = 0; i < root.childNodes.length; i++) {
    elementStack.push([root.childNodes[i] as HTMLElement, i]);
  }

  const selectorStack = [];
  while (elementStack.length) {
    const [currentElement, currentIndex] = elementStack.pop()!;

    selectorStack.push(_getBestSelector(currentElement, currentIndex));

    if (currentElement.childNodes.length) {
      for (let i = 0; i < currentElement.childNodes.length; i++) {
        elementStack.push([currentElement.childNodes[i] as HTMLElement, i]);
      }

      continue;
    }

    let hasState = false;
    const states = {
      focus: false,
      popover: false,
      scroll: { top: 0, left: 0 },
    };

    if (document.activeElement === currentElement) {
      hasState = true;
      states.focus = true;
    }

    if (currentElement?.matches(":popover-open")) {
      hasState = true;
      states.popover = true;
    }

    if (currentElement.scrollTop || currentElement.scrollLeft) {
      hasState = true;
      states.scroll = {
        top: currentElement.scrollTop,
        left: currentElement.scrollLeft,
      };
    }

    if (hasState) {
      selectorStates[selectorStack.join(" > ")] = states;
    }

    selectorStack.pop();
  }

  return selectorStates;
}

const _applyDOMSelectorStates = (
  root: ShadowRoot,
  selectorStates: DOMSelectorStates,
) => {
  for (const selector in selectorStates) {
    const { focus, scroll, popover } = selectorStates[selector];

    const element = root.querySelector(selector) as HTMLElement;

    if (!element) continue;
    if (focus) element.focus();
    if (scroll) element.scrollBy(scroll);
    if (popover) element.showPopover();
  }
};

// TODO: return XOSelector
const _getBestSelector = (element: HTMLElement, index?: number) => {
  const tag = element.tagName, id = element.id;

  if (id) return `${tag}#${id}`;

  const key = element.getAttribute("key");

  if (key) return `${tag}[key=${key}]`;
  if (index) return `${tag}:nth-of-type(${index})`;

  return tag;
};

const _domTransform: XOProjection<HTMLCollection, {
  event?: AddEventListenerOptions;
}> = (
  [, generator],
  options,
): HTMLCollection => {
  const state: _FormatState = {
    root: globalThis.document.createDocumentFragment(),
    stack: [],
    pointers: {},
  };

  for (const [type, value] of generator()) {
    switch (type) {
      case XO_ELEMENT_OPEN_TOKEN:
        _openElement(state, value);
        break;
      case XO_ELEMENT_CLOSE_TOKEN:
        _closeElement(state);
        break;
      case XO_ATTRIBUTE_TOKEN:
        _targetAttribute(state, value);
        break;
      case XO_NUMBER_TOKEN:
      case XO_STRING_TOKEN:
      case XO_BOOLEAN_TOKEN:
        _handlePrimitive(state, value);
        break;
      case XO_OBJECT_TOKEN:
      case XO_ARRAY_TOKEN:
        _handleObject(state, value);
        break;
      case XO_FUNCTION_TOKEN:
        _addEventListener(
          state,
          (event: Event) => (value as EventListener)(event),
          options?.event,
        );
        break;
      case XO_SYMBOL_TOKEN:
      case XO_NULL_TOKEN:
      case XO_UNDEFINED_TOKEN:
      default:
        break;
    }
  }

  return state.root.children;
};

type _FormatState = {
  root: DocumentFragment;
  stack: HTMLElement[];
  pointers: {
    element?: HTMLElement;
    attribute?: string;
  };
};

// Cognitive convenience methods
function _openElement(
  state: _FormatState,
  value: string,
) {
  if (value === XO_FRAGMENT_LABEL) return;

  const previous = state.pointers.element ?? state.root;

  state.pointers.element = globalThis.document.createElement(value);

  state.stack.push(state.pointers.element);
  previous.appendChild(state.pointers.element);
}

function _closeElement(
  state: _FormatState,
) {
  state.stack.pop();
  state.pointers.element = state.stack.at(-1);
}

function _targetAttribute(state: _FormatState, value: string) {
  if (value === XO_CHILDREN_LABEL) {
    return state.pointers.attribute = undefined;
  }

  state.pointers.attribute = value;
}

function _handlePrimitive(
  state: _FormatState,
  value: string | number | boolean,
) {
  if (state.pointers.attribute) {
    return state.pointers.element?.setAttribute(
      state.pointers.attribute,
      typeof value === "boolean" && value ? "" : String(value),
    );
  }

  _appendTextNode(state, value);
}

function _handleObject(state: _FormatState, value: object) {
  if (!state.pointers.element) return;

  // "style", "dataset" and "classlist" are
  // the only (?) valid HTML object properties that are not
  // implicitly representable by JSX.
  switch (state.pointers.attribute) {
    case "style": {
      const style = value as CSSStyleDeclaration;
      for (let i = 0; i < style.length; i++) {
        state.pointers.element.style.setProperty(
          style[i],
          style.getPropertyValue(style[i]),
          style.getPropertyPriority(style[i]),
        );
      }
      return;
    }
    case "dataset": {
      for (const key in value) {
        state.pointers.element.dataset[key] = (value as DOMStringMap)[key];
      }
      return;
    }
    case "classlist": {
      (value as DOMTokenList).forEach((token) => {
        state.pointers.element?.classList.add(token);
      });
      return;
    }
    default:
      _appendTextNode(state, value);
  }
}

function _appendTextNode(state: _FormatState, value: unknown) {
  if (!state.pointers.element) return;

  state.pointers.element.appendChild(
    globalThis.document.createTextNode(
      typeof value === "object" ? JSON.stringify(value) : String(value),
    ),
  );
}

function _addEventListener(
  state: _FormatState,
  value: EventListener,
  options?: EventListenerOptions,
) {
  if (!state.pointers.element || !state.pointers.attribute) return;

  state.pointers.element.addEventListener(
    state.pointers.attribute.replace(/^on/, ""),
    value,
    options,
  );
}
