import { captureCallSite } from "./callsite.ts";
import {
  ERROR_CODE_MESSAGES,
  ERROR_CONTEXT_MAX_SIZE,
  ERROR_CONTEXT_MISSING_MESSAGE,
  ERROR_CONTEXT_TRUNCATION_CHARACTER,
  ERROR_GUIDANCE_MISSING_MESSAGE,
  ErrorCode,
  PROJECT_ROOT,
} from "./constants.ts";
import type { CallSite } from "./types.ts";

/** @internal */
export type XOErrorCallsite = {
  file: string | null;
  column: number | null;
  line: number | null;
};

/**
 * A wrapper class for the native Error that
 * enforces a standard error code.
 */
export class XOError extends Error {
  /** The canonical XO Error code. */
  code: ErrorCode;

  /**
   * Construct a new XOError instance.
   *
   * @example
   * ```ts
   * throw new XOError(XOErrorCode.DATA_ACCESS, {
   *   context: User,
   *   guidance: "The user may not be logged in yet due to a race condition. See Issue #35."
   * });
   * ```
   */
  constructor(
    code: ErrorCode = ErrorCode.OPERATION_UNSUPPORTED,
    { guidance, context, ...options }: XOErrorOptions = {},
  ) {
    super(`[${code}] ${ERROR_CODE_MESSAGES[code]}`, options);

    this.name = "XOError";
    this.code = code;
    this.#callsite = captureCallSite();
    this.#context = context;
    this.#guidance = guidance;
  }

  /**
   * The actual call information re: where this
   * error was created.
   */
  get callsite(): XOErrorCallsite | undefined {
    if (!this.#callsite) return undefined;

    let file = this.#callsite.getFileName();

    if (file) {
      file = file.startsWith(PROJECT_ROOT)
        ? file.slice(PROJECT_ROOT.length + 1)
        : file;
    }

    return {
      file,
      column: this.#callsite.getColumnNumber(),
      line: this.#callsite.getLineNumber(),
    };
  }

  /**
   * Additional context specified by the caller that
   * might be relevant in debugging.
   */
  get context(): string {
    if (!this.#context) return ERROR_CONTEXT_MISSING_MESSAGE;

    const result = typeof this.#context === "object"
      ? JSON.stringify(this.#context)
      : String(this.#context);

    if (result.length > ERROR_CONTEXT_MAX_SIZE) {
      return result.slice(
        0,
        ERROR_CONTEXT_MAX_SIZE - ERROR_CONTEXT_TRUNCATION_CHARACTER.length,
      ) + ERROR_CONTEXT_TRUNCATION_CHARACTER;
    }

    return result;
  }

  /**
   * Guidance provided to the developer to help them troubleshoot.
   */
  get guidance(): string {
    return this.#guidance?.trim() || ERROR_GUIDANCE_MISSING_MESSAGE;
  }

  #callsite?: CallSite;
  #context?: unknown;
  #guidance?: string;
}

type XOErrorOptions = {
  context?: unknown;
  guidance?: string;
} & ErrorOptions;
