import type {
  XOIdentifierToken,
  XONullToken,
  XOPrimitiveToken,
  XOPromiseToken,
  XOSyntaxToken,
} from "@cutout/kernel/jsx/token";

export type TokenSegment =
  | XOPrimitiveToken
  | XOSyntaxToken
  | XOIdentifierToken;
export type TokenPath = TokenSegment[];

export interface Backend {
  add(path: TokenPath): XOPromiseToken | XONullToken;
  list(
    prefix: TokenPath,
  ): Generator<TokenPath | XOPromiseToken> | undefined;
}
