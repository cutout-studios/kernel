import type { Document } from "./types.ts";

export const isDocument = (value: unknown): value is Document => {
  if (typeof value !== "object" || value === null) return false;

  return "store" in value;
}
