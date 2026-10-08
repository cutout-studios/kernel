import type { AnyShape, EmptyShape } from "__internal__";
import type { OutputGeneratorToken } from "../tokens/types.ts";

/**
 * A "projection" is a function used to cast JSX to a different format.
 */
export type Projection<T = unknown, O extends AnyShape = EmptyShape> = (
  jsx: OutputGeneratorToken,
  options?: O,
) => T;
