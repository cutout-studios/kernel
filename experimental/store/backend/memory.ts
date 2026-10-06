import { type XONullToken, XOTokenType } from "@cutout/kernel/tokens";
import type { Backend, TokenPath, TokenSegment } from "./types.ts";

type SerializedPathTrie = Map<string, SerializedPathTrie>;

export class MemoryBackend implements Backend {
  constructor(paths?: TokenPath[]) {
    for (const path of paths ?? []) {
      this.add(path);
    }
  }

  add(path: TokenPath): XONullToken {
    this.#scanCache.clear();

    let pointer = this.#pathTrie;
    for (const segment of path) {
      const segmentString = JSON.stringify(segment);

      if (!pointer.has(segmentString)) {
        pointer.set(segmentString, new Map());
      }

      pointer = pointer.get(segmentString) as SerializedPathTrie;
    }

    return [XOTokenType.NULL, null];
  }

  list(
    prefix: TokenPath,
  ): Generator<TokenPath> | undefined {
    const cacheKey = JSON.stringify(prefix);

    if (this.#scanCache.has(cacheKey)) {
      return this.#scanCache.get(cacheKey);
    }

    const scanRoot = this.#resolvePath(prefix);

    if (!scanRoot) return;

    const result = this.#flatten(scanRoot).reverse();

    this.#scanCache.set(cacheKey, result);

    return (function* () {
      for (const path of result) yield path;
    })();
  }

  #pathTrie: SerializedPathTrie = new Map();
  #resolvePath(path: TokenPath): SerializedPathTrie | undefined {
    if (path.length === 0) return this.#pathTrie;

    let pointer: SerializedPathTrie | undefined = this.#pathTrie;
    for (const segment of path) {
      pointer = pointer.get(JSON.stringify(segment));

      if (pointer === undefined) return;
    }

    return pointer;
  }

  #scanCache = new Map();
  #flatten(root: SerializedPathTrie): TokenPath[] {
    const result: TokenPath[] = [];

    const stack: [TokenSegment[], SerializedPathTrie][] = [[[], root]];
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
}
