/**
 * @packageDocumentation
 * Important constants in the @cutout/kernel runtime.
 *
 * These define the magic numbers and labels used to structure tokens and handle
 * special JSX cases.
 */

// -- System --
/** Something we haven't recognized yet. */
export const UNKNOWN_TOKEN = 0x0;
/** A token generator, used to stream JSX content progressively. */
export const GENERATOR_TOKEN = 0x1;

// --- JavaScript Primitives ---
/** The literal undefined value. */
export const UNDEFINED_TOKEN = 0x2;
/** The literal null value. */
export const NULL_TOKEN = 0x3;
/** A simple true/false boolean. */
export const BOOLEAN_TOKEN = 0x4;
/** A string value (text content). */
export const STRING_TOKEN = 0x5;
/** A number value (integer/float, bigint). */
export const NUMBER_TOKEN = 0x6;
/** A JavaScript symbol. */
export const SYMBOL_TOKEN = 0x7;

// --- Complex Types ---
/** An array of children or mixed content. */
export const ARRAY_TOKEN = 0x8;
/** A generic object (usually an attribute container). */
export const OBJECT_TOKEN = 0x9;
/** An element function, class, event listener, etc. */
export const FUNCTION_TOKEN = 0xA;
/** An async operation */
export const PROMISE_TOKEN = 0xB;

// --- JSX Structure ---
/** Marks the start of a JSX tag (e.g., `<div`). */
export const ELEMENT_OPEN_TOKEN = 0xC;
/** Marks the end of a JSX tag (e.g., `</div>`). */
export const ELEMENT_CLOSE_TOKEN = 0xD;
/** A JSX element attribute (e.g. `class=`). */
export const ATTRIBUTE_TOKEN = 0xE;

// -- Other --
/** Marks a special unique string for internal tracking. */
export const IDENTIFIER_TOKEN = 0xF;

export const TOKENS = [
  UNKNOWN_TOKEN,
  GENERATOR_TOKEN,
  UNDEFINED_TOKEN,
  NULL_TOKEN,
  BOOLEAN_TOKEN,
  STRING_TOKEN,
  NUMBER_TOKEN,
  SYMBOL_TOKEN,
  ARRAY_TOKEN,
  OBJECT_TOKEN,
  FUNCTION_TOKEN,
  PROMISE_TOKEN,
  ELEMENT_OPEN_TOKEN,
  ELEMENT_CLOSE_TOKEN,
  ATTRIBUTE_TOKEN,
  IDENTIFIER_TOKEN,
] as const;

// ------------------------------------------------------------
// Token Structure
// ------------------------------------------------------------

/**
 * The expected length of a valid token.
 *
 * Tokens are structured as `[type, value]`: their length is always 2.
 * Handy for validation checks.
 *
 * @example
 * ```ts
 * const token = [0x07, 42];
 * ```
 */
export const TOKEN_LENGTH = 2;

/**
 * The index of the type discriminator in a token tuple.
 *
 * @example
 * ```ts
 * const type = token[TOKEN_TYPE_INDEX]; // 0x07 (NUMBER)
 * ```
 */
export const TOKEN_TYPE_INDEX = 0;

/**
 * The index of the payload in a token tuple.
 *
 * @example
 * ```ts
 * const value = token[TOKEN_VALUE_INDEX]; // "hello!"
 * ```
 */
export const TOKEN_VALUE_INDEX = 1;

// ------------------------------------------------------------
// Internal Labels
// ------------------------------------------------------------

/**
 * In our flat IR, child boundaries are distinguished with this label so they don't get mixed up with everything else.
 */
export const CHILDREN_LABEL = "[[CHILDREN]]";

/**
 * A `Fragment` lets you group elements without adding a node.
 * We use this label to represent a `Fragment` so we can recognize
 * and handle it during transformation.
 */
export const FRAGMENT_LABEL = "[[FRAGMENT]]";

/**
 * If we hit a value we don't know how to convert to a token (like a
 * function that isn't a component, or a circular reference), we swap
 * it out for this label during debugging/serialization so we don't crash.
 */
export const UNSERIALIZABLE_LABEL = "[[UNSERIALIZABLE]]";
