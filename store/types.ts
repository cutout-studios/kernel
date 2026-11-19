import type { XOSelector } from "@cutout/kernel/jsx/selector";
import type { XOJSXToken } from "@cutout/kernel/jsx/token";

export type Store = {
  append(jsx: XOJSXToken): void;
  select(selectors: XOSelector[]): XOJSXToken[];
};
