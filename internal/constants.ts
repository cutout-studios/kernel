import { readEnv } from "./readEnv.ts";

export const PROJECT_ROOT = readEnv("PROJECT_ROOT", Deno.cwd());

export const CALLSITE_INDEX = 0;
export const CALLSITE_PARENT_INDEX = 1;

export const DATA_MISSING_ERROR_CODE = "DATA_MISSING";
export const DATA_MALFORMED_ERROR_CODE = "DATA_MALFORMED";
export const DATA_ACCESS_ERROR_CODE = "DATA_ACCESS";
export const OPERATION_UNSUPPORTED_ERROR_CODE = "OPERATION_UNSUPPORTED";
export const OPERATION_INSECURE_ERROR_CODE = "OPERATION_INSECURE";
export const OPERATION_FAILURE_ERROR_CODE = "OPERATION_FAILURE";
export const OPERATION_REDUNDANT_ERROR_CODE = "OPERATION_REDUNDANT";

export const ERROR_CODES = [
  DATA_MISSING_ERROR_CODE,
  DATA_MALFORMED_ERROR_CODE,
  DATA_ACCESS_ERROR_CODE,
  OPERATION_UNSUPPORTED_ERROR_CODE,
  OPERATION_INSECURE_ERROR_CODE,
  OPERATION_FAILURE_ERROR_CODE,
  OPERATION_REDUNDANT_ERROR_CODE,
] as const;

export const ERROR_CODE_MESSAGES: Record<typeof ERROR_CODES[number], string> = {
  [DATA_MISSING_ERROR_CODE]: "Failed due to missing data.",
  [DATA_MALFORMED_ERROR_CODE]: "Failed due to improperly formatted data.",
  [DATA_ACCESS_ERROR_CODE]: "Cannot access the requested data as instructed.",
  [OPERATION_UNSUPPORTED_ERROR_CODE]:
    "Could not perform a currently unsupported operation.",
  [OPERATION_INSECURE_ERROR_CODE]: "Refused to perform an insecure operation.",
  [OPERATION_REDUNDANT_ERROR_CODE]:
    "Refused to re-perform an operation unnecessarily.",
  [OPERATION_FAILURE_ERROR_CODE]: "Failed to perform the operation.",
};

export const ERROR_CONTEXT_MAX_SIZE = 100;
export const ERROR_CONTEXT_TRUNCATION_CHARACTER = "…";
export const ERROR_CONTEXT_MISSING_MESSAGE = "None.";

export const ERROR_GUIDANCE_MISSING_MESSAGE = "Not provided.";
