import { readEnv } from "./readEnv.ts";

export const PROJECT_ROOT = readEnv("PROJECT_ROOT", Deno.cwd());

export const CALLSITE_INDEX = 0;
export const CALLSITE_PARENT_INDEX = 1;

/**
 * Canonical XOError error codes.
 */
export enum ErrorCode {
  DATA_MISSING = "DATA_MISSING",
  DATA_MALFORMED = "DATA_MALFORMED",
  DATA_ACCESS = "DATA_ACCESS",
  OPERATION_UNSUPPORTED = "OPERATION_UNSUPPORTED",
  OPERATION_INSECURE = "OPERATION_INSECURE",
  OPERATION_FAILURE = "OPERATION_FAILURE",
  OPERATION_REDUNDANT = "OPERATION_REDUNDANT",
}

export const ERROR_CODE_MESSAGES = {
  [ErrorCode.DATA_MISSING]: "Failed due to missing data.",
  [ErrorCode.DATA_MALFORMED]: "Failed due to improperly formatted data.",
  [ErrorCode.DATA_ACCESS]: "Cannot access the requested data as instructed.",
  [ErrorCode.OPERATION_UNSUPPORTED]:
    "Could not perform a currently unsupported operation.",
  [ErrorCode.OPERATION_INSECURE]: "Refused to perform an insecure operation.",
  [ErrorCode.OPERATION_REDUNDANT]:
    "Refused to re-perform an operation unnecessarily.",
  [ErrorCode.OPERATION_FAILURE]: "Failed to perform the operation.",
};

export const ERROR_CONTEXT_MAX_SIZE = 100;
export const ERROR_CONTEXT_TRUNCATION_CHARACTER = "…";
export const ERROR_CONTEXT_MISSING_MESSAGE = "None.";

export const ERROR_GUIDANCE_MISSING_MESSAGE = "Not provided.";
