/** @jsxImportSource @cutout/kernel */

import {
  isDocument,
  prependDocument,
  type XODocument,
} from "@cutout/kernel/document";
import type { XOJSX } from "@cutout/kernel/jsx";

export const prepend = <T extends XOJSX | XODocument>(
  target: T,
  value: XOJSX,
): T => {
  if (isDocument(target)) return prependDocument(target, value);

  return <>{value}{target}</>;
};
