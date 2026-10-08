/** @internal */
export const enumGuardFactory =
  <const E extends Record<string, string | number>>(enumerator: E) =>
  (value: unknown): value is E[keyof E] =>
    (Object.values(enumerator) as ReadonlyArray<unknown>).includes(value);
