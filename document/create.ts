import { isStore } from "./store/guard.ts";
import { createMemoryStore } from "./store/memory.ts";
import type { Document, Options } from "./types.ts";

export const create = (
  { store = createMemoryStore() }: Options = {},
): Document => ({
  store: isStore(store) ? [store] : store,
});
