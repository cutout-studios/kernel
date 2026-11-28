import type { XOJSX } from "@cutout/kernel/jsx";

/**
 * Custom elements. Define an element function and TypeScript will infer its attributes.
 *
 * @example
 * ```tsx
 * const MyElement = defineElement<{ hello: string; }>(
 *   attributes => <div>{attributes.hello}</div>
 * );
 *
 * const correct = <MyElement hello="123" /> // Works!
 * const incorrect = <MyElement hello={123} /> // Type Error.
 * ```
 */
export type Element<A = Record<string, unknown>> = (
  attributes: A,
) => XOJSX;
