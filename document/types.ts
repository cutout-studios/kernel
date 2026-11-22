import type { XOJSXToken } from "@cutout/kernel/jsx/token";
import type { XOSelector } from "@cutout/kernel/selector";

export type Store = {
  append(jsx: XOJSXToken): void;
  select(selectors: XOSelector[]): XOJSXToken[];
};
