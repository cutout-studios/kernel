import {
  isDocument,
  queryDocument,
  type XODocument,
} from "@cutout/kernel/document";
import type { XOJSX } from "@cutout/kernel/jsx";
import { XO_GENERATOR_TOKEN } from "@cutout/kernel/jsx/token";
import type { XOSelector } from "@cutout/kernel/selector";

export const query = (
  source: XOJSX | XODocument,
  selector: XOSelector,
): XOJSX => [
  XO_GENERATOR_TOKEN,
  function* () {
    if (isDocument(source)) {
      yield* queryDocument(source, selector);
      return;
    }

    // TODO
  },
];
