import type { Store } from "./types.ts";

export const isStore = (value: unknown): value is Store => {
  if (!Array.isArray(value)) return false;

  if (typeof value[0] !== "function" || typeof value[1] !== "function") {
    return false;
  }

  return true;
};
