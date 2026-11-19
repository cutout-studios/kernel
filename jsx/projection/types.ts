import type { XOJSXToken } from "@cutout/kernel/jsx/token";
import type { AnyShape, EmptyShape } from "@internal";

/**
 * A "projection" is a function used to cast JSX to a different format.
 */
export type Projection<T = unknown, O extends AnyShape = EmptyShape> = (
  jsx: XOJSXToken,
  options?: O,
) => T;
