import type { XOStore } from "@cutout/kernel/document/store";

export type Document = {
  store: XOStore[];
};

export type Options = {
  store?: XOStore | XOStore[];
};
