import type { XOJSXToken } from "@cutout/kernel/tokens";
import type { XOStoreSelector } from "@cutout/store/selector";

export type Store = {
  append(jsx: XOJSXToken): void;
  select(selectors: XOStoreSelector[]): XOJSXToken[];
};
