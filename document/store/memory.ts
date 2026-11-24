import { XO_NULL_TOKEN } from "@cutout/kernel/jsx/token";
import type { Store, StorePath, StoreSegment } from "./types.ts";

type SerializedPathTrie = Map<string, SerializedPathTrie>;

export const createMemoryStore = (paths: StorePath[] = []): Store => {
  const cache = new Map(),
    trie = new Map(),
    add = (path: StorePath) => {
      cache.clear();

      let pointer = trie;
      for (const segment of path) {
        const segmentString = JSON.stringify(segment);

        if (!pointer.has(segmentString)) {
          pointer.set(segmentString, new Map());
        }

        pointer = pointer.get(segmentString) as SerializedPathTrie;
      }

      return [XO_NULL_TOKEN, null];
    },
    list = (prefix: StorePath) => {
      const cacheKey = JSON.stringify(prefix);

      if (cache.has(cacheKey)) return cache.get(cacheKey);

      const scanRoot = _resolvePath(prefix, trie);

      if (!scanRoot) return;

      const result = _flatten(scanRoot).reverse();

      cache.set(cacheKey, result);

      return (function* () {
        for (const path of result) yield path;
      })();
    };

  for (const path of paths) add(path);

  return [add, list];
};

function _resolvePath(
  path: StorePath,
  root: Map,
): SerializedPathTrie | undefined {
  if (path.length === 0) return root;

  let pointer: SerializedPathTrie | undefined = root;
  for (const segment of path) {
    pointer = pointer.get(JSON.stringify(segment));

    if (pointer === undefined) return;
  }

  return pointer;
}

function _flatten(root: SerializedPathTrie): StorePath[] {
  const result: StorePath[] = [];

  const stack: [StoreSegment[], SerializedPathTrie][] = [[[], root]];
  while (stack.length) {
    const [currentKeyPath, currentSubtrie] = stack.pop() ?? [];

    if (!currentKeyPath || !currentSubtrie) continue;

    for (const [key, value] of currentSubtrie.entries()) {
      if (value.size) {
        stack.push([[...currentKeyPath, JSON.parse(key)], value]);
        continue;
      }

      result.push([...currentKeyPath, JSON.parse(key)]);
    }
  }

  return result;
}
