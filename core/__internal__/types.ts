/** @internal */
export type AnyFunction = (...args: never[]) => unknown;

/** @internal */
export type AnyArray = Array<unknown>;

/** @internal */
export type AnyShape = Record<PropertyKey, unknown>;

/** @internal */
export type EmptyShape = Readonly<Record<PropertyKey, never>>;

/** @internal */
export type OneOrMany<T> = T | [first: T, ...rest: T[]];

/** @internal */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/** @internal */
export interface CallSite {
  getMethodName(): string | null;
  getFileName(): string | null;
  getLineNumber(): number | null;
  getColumnNumber(): number | null;
  getFunctionName(): string | null;
  getTypeName(): string | null;
  isNative(): boolean;
  isEval(): boolean;
  getEvalOrigin(): string | undefined;
  isToplevel(): boolean;
}
