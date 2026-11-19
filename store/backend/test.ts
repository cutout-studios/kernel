import { tokenizeValue } from "@cutout/kernel/tokens";
import { assertArrayIncludes, assertEquals } from "@std/assert";
import { MemoryBackend } from "./memory.ts";
import type { TokenPath } from "./types.ts";

const TEST_GROUP = "store/backend";

const tokenizePath = (path: (string | number)[]): TokenPath => {
  return path.map(tokenizeValue) as TokenPath;
};

Deno.test(`${TEST_GROUP} - MemoryBackend`, () => {
  const backend = new MemoryBackend([]);

  const namePath = tokenizePath(["users", 123, "name", "bobadams"]);
  const zipPath = tokenizePath(["users", 123, "address", "zip", 12345]);

  backend.add(namePath);
  backend.add(zipPath);

  assertArrayIncludes(
    backend.list(tokenizePath(["users", 123, "name"]))?.toArray() ?? [],
    [
      tokenizePath(["bobadams"]),
    ],
  );
  assertArrayIncludes(
    backend.list(tokenizePath(["users", 123, "address", "zip"]))?.toArray() ??
      [],
    [tokenizePath([12345])],
  );

  assertEquals(
    backend.list(["users", "nope"].map(tokenizeValue) as TokenPath)
      ?.toArray() ?? [],
    [],
  );
});
