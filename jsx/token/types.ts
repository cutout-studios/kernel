import type { AnyFunction } from "@internal";
import type {
  ARRAY_TOKEN,
  ATTRIBUTE_TOKEN,
  BOOLEAN_TOKEN,
  ELEMENT_CLOSE_TOKEN,
  ELEMENT_OPEN_TOKEN,
  FUNCTION_TOKEN,
  GENERATOR_TOKEN,
  IDENTIFIER_TOKEN,
  NULL_TOKEN,
  NUMBER_TOKEN,
  OBJECT_TOKEN,
  PROMISE_TOKEN,
  STRING_TOKEN,
  SYMBOL_TOKEN,
  TOKENS,
  UNDEFINED_TOKEN,
  UNKNOWN_TOKEN,
} from "./constants.ts";

/**
 * @packageDocumentation
 * Types for the @cutout/kernel runtime.
 * These define the intermediate representation (IR) stream our JSX returns.
 *
 * Basically, every piece of data in our JSX tree is a token tuple of `[type, value]`.
 */

/**
 * The fundamental shape of a token in @cutout/kernel: a readonly tuple of `[type, value]`.
 *
 * @template A The token type (default: `XO_UNKNOWN_TOKEN`).
 * @template T The actual data payload (default: `unknown`).
 *
 * @example
 * ```ts
 * // A simple number token
 * const token: AnyXOToken<XO_NUMBER_TOKEN, number> = [0x03, 42];
 * ```
 */
export type AnyToken<
  A extends typeof TOKENS[number] = typeof UNKNOWN_TOKEN,
  T = unknown,
> = [A, T];

// -----------------------------------------------------------------------------
// System Tokens
// -----------------------------------------------------------------------------

/**
 * A `System Token` is reserved for the JSX system; manipulating these
 * tokens directly should generally be avoided (unless you know what you're doing).
 */
export type SystemToken =
  | UnknownToken
  | JSXGeneratorToken
  | IdentifierToken;

/**
 * A token where we genuinely don't know the type or value yet.
 * Handy for initial parsing stages or error fallbacks.
 */
export type UnknownToken = AnyToken<
  typeof UNKNOWN_TOKEN,
  unknown
>;

/**
 * A token representing a JSX generator.
 *
 * JSX Generators are allow us to yield tokens
 * dynamically, which is great for streaming SSR or lazy evaluation.
 * It yields OutputXOTokens on demand.
 */
export type JSXGeneratorToken = AnyToken<
  typeof GENERATOR_TOKEN,
  () => Generator<OutputToken>
>;

/**
 * A token for a system-level identifier.
 */
export type IdentifierToken = AnyToken<
  typeof IDENTIFIER_TOKEN,
  string
>;

// -----------------------------------------------------------------------------
// Primitive Tokens
// -----------------------------------------------------------------------------

/**
 * A `Primitive Token` points to a -direct- value in the current stack frame
 * (as opposed to a reference to something stored elsewhere).
 */
export type PrimitiveToken =
  | NullToken
  | UndefinedToken
  | BooleanToken
  | NumberToken
  | StringToken
  | SymbolToken;

/**
 * A token for the literal null value.
 */
export type NullToken = AnyToken<typeof NULL_TOKEN, null>;

/**
 * A token for the literal undefined value.
 */
export type UndefinedToken = AnyToken<
  typeof UNDEFINED_TOKEN,
  undefined
>;

/**
 * A token wrapping a boolean value.
 */
export type BooleanToken = AnyToken<
  typeof BOOLEAN_TOKEN,
  boolean
>;

/**
 * A token wrapping a standard number.
 */
export type NumberToken = AnyToken<
  typeof NUMBER_TOKEN,
  number
>;

/**
 * A token wrapping a string, typically holding text content.
 */
export type StringToken = AnyToken<
  typeof STRING_TOKEN,
  string
>;

/**
 * A token for a symbol value.
 */
export type SymbolToken = AnyToken<
  typeof SYMBOL_TOKEN,
  symbol
>;

// -----------------------------------------------------------------------------
// Reference Tokens
// -----------------------------------------------------------------------------

/**
 * A `Reference Token` contains a reference to a more complex object
 * stored in the memory heap.
 */
export type ReferenceToken =
  | ArrayToken
  | ObjectToken
  | FunctionToken
  | PromiseToken;

/**
 * A token wrapping an object.
 * Typically used for attribute containers.
 */
export type ObjectToken = AnyToken<
  typeof OBJECT_TOKEN,
  object
>;

/**
 * A token representing an array.
 * Usually contains children elements or mixed content.
 */
export type ArrayToken = AnyToken<
  typeof ARRAY_TOKEN,
  Array<unknown>
>;

/**
 * A token wrapping a function.
 *
 * In the context of JSX, this often represents a component definition or
 * event listener.
 */
export type FunctionToken = AnyToken<
  typeof FUNCTION_TOKEN,
  AnyFunction
>;

/**
 * A token wrapping a Promise for more token(s).
 *
 * This could be an individual token, or, another JSX token stream.
 */
export type PromiseToken = AnyToken<typeof PROMISE_TOKEN, Promise<ValidToken>>;

// -----------------------------------------------------------------------------
// Syntax
// -----------------------------------------------------------------------------

/**
 * `Syntax Token`s govern the actual structure of the JSX:
 * Elements, attributes, and the like.
 */
export type SyntaxToken =
  | ElementToken
  | ElementCloseToken
  | AttributeToken;

/**
 * A token representing the opening of a JSX element.
 * The value is the tag name (e.g., "div", "MyComponent").
 */
export type ElementToken = AnyToken<
  typeof ELEMENT_OPEN_TOKEN,
  string
>;

/**
 * A token representing the closing of a JSX element.
 * The value is usually the tag name again, matching the opener.
 */
export type ElementCloseToken = AnyToken<
  typeof ELEMENT_CLOSE_TOKEN,
  string
>;

/**
 * A token for an attribute key.
 * Used when we need to explicitly tag a key inside an attribute object.
 */
export type AttributeToken = AnyToken<
  typeof ATTRIBUTE_TOKEN,
  string
>;

/**
 * These are the token types that are safe to format.
 *
 * Basically, everything except the Generator tokens (since those are internal
 * streams that actually _contain_ the output).
 */
export type OutputToken =
  | PrimitiveToken
  | ReferenceToken
  | SyntaxToken;

/**
 * This covers every valid token you might encounter when working with `@cutout/kernel`.
 *
 * It includes the output-safe tokens plus the Generator tokens used for
 * internal processing and streaming logic.
 */
export type ValidToken =
  | OutputToken
  | IdentifierToken
  | JSXGeneratorToken;
