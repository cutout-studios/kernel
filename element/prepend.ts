import {
  isDocument,
  prependDocument,
  type XODocument,
} from "@cutout/kernel/document";
import type { XOJSX } from "@cutout/kernel/jsx";
import { XO_GENERATOR_TOKEN } from "@cutout/kernel/jsx/token";

export const prepend = <T extends XOJSX | XODocument>(
  target: T,
  value: XOJSX,
): T => {
  if (isDocument(target)) {
    return prependDocument(target, value);
  }

  return [
    XO_GENERATOR_TOKEN,
    function* () {
      yield* value;
      yield* target;
    },
  ];
};
