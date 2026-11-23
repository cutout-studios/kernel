import type { XOJSX } from "@cutout/kernel/jsx";

import type { Element } from "./types.ts";

// TBD
type Options = unknown;

// TODO: port from checkpoint/1
export const create = <T extends Record<string, unknown>>(
  render: (attributes: T) => XOJSX,
  options?: Options,
): Element<T> => {};
