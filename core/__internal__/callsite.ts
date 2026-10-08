import { CALLSITE_INDEX, CALLSITE_PARENT_INDEX } from "./constants.ts";
import type { CallSite } from "./types.ts";

/**
 * @internal
 *
 * Capture a single stack frame as a native V8 CallSite.
 * Returns undefined in non-V8 runtimes, where prepareStackTrace is ignored
 * and `.stack` is a plain string.
 */
export function captureCallSite(
  frameIndex: number = CALLSITE_INDEX,
): CallSite | undefined {
  const original = Error.prepareStackTrace;
  Error.prepareStackTrace = (_error, trace) => trace;
  try {
    const { stack } = new Error() as unknown as { stack: CallSite[] | string };
    return Array.isArray(stack) ? stack[frameIndex] : undefined;
  } finally {
    Error.prepareStackTrace = original;
  }
}

export const getParentCallSite = () =>
  captureCallSite(CALLSITE_PARENT_INDEX + 1); // +1 for captureCallSite's own frame
