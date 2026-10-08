/**
 * @packageDocumentation
 * Important constants in the @cutout/kernel runtime.
 *
 * These define the magic numbers and labels used to structure tokens and handle
 * special JSX cases.
 */

/**
 * The different "flavors" of tokens we track when processing JSX.
 *
 * @enum {number}
 */
export enum TokenType {
  // -- System --
  /** Something we haven't recognized yet. */
  UNKNOWN = 0x00,
  /** A token generator, used to stream JSX content progressively. */
  GENERATOR = 0x01,

  // --- JavaScript Primitives ---
  /** The literal undefined value. */
  UNDEFINED = 0x02,
  /** The literal null value. */
  NULL = 0x03,
  /** A simple true/false boolean. */
  BOOLEAN = 0x04,
  /** A string value (text content). */
  STRING = 0x05,
  /** A number value (integer/float, bigint). */
  NUMBER = 0x06,
  /** A JavaScript symbol. */
  SYMBOL = 0x07,

  // --- Complex Types ---
  /** An array of children or mixed content. */
  ARRAY = 0x08,
  /** A generic object (usually an attribute container). */
  OBJECT = 0x09,
  /** An element function, class, event listener, etc. */
  FUNCTION = 0x0A,
  /** An async operation */
  PROMISE = 0x0B,

  // --- JSX Structure ---
  /** Marks the start of a JSX tag (e.g., `<div`). */
  ELEMENT_OPEN = 0x0C,
  /** Marks the end of a JSX tag (e.g., `</div>`). */
  ELEMENT_CLOSE = 0x0D,
  /** A JSX element attribute (e.g. `class=`). */
  ATTRIBUTE = 0x0E,

  // -- Other --
  /** Marks a special unique string for internal tracking. */
  IDENTIFIER = 0x0F,
}

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
