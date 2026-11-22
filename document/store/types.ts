import type {
  XOIdentifierToken,
  XONullToken,
  XOPrimitiveToken,
  XOPromiseToken,
  XOSyntaxToken,
} from "@cutout/kernel/jsx/token";

/**
 * Represents a path through the data in a XOBackend.
 * Each segment represents a node in the append-tree.
 */
export type TokenPath = TokenSegment[];

/**
 * Represents a single node in the XOBackend.
 */
export type TokenSegment =
  | XOPrimitiveToken
  | XOSyntaxToken
  | XOIdentifierToken;

/**
 * A universal key-value token data interface,
 * to provide persistence to an XOStore.
 */
export interface Store {
  /**
   * Appends a new path to the backend.
   * @param path The path to append.
   */
  add(path: TokenPath): XOPromiseToken | XONullToken;

  /**
   * Lists the subtree located at the path prefix.
   * @param prefix Path to the parent node.
   */
  list(
    prefix: TokenPath,
  ): Generator<TokenPath | XOPromiseToken> | undefined;
}
