import type { AnyShape, EmptyShape } from "@cutout/internal";
import type { XOJSXToken } from "@cutout/kernel/tokens";

/**
 * A "projection" is a function used to cast JSX to a different format.
 */
export type Projection<T = unknown, O extends AnyShape = EmptyShape> = (
  jsx: XOJSXToken,
  options?: O,
) => T;
