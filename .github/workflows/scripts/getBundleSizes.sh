#!/usr/bin/env bash
set -euo pipefail

size() { deno bundle --minify "$@" 2>/dev/null | brotli -q 11 -c | wc -c | tr -d ' '; }

core=$(size internal/module.ts)

printf '%8s B  %s\n' "$core" "internal/module.ts"

entrypoints=(
  jsx/projection/module.ts
  jsx/selector/module.ts
  jsx/token/module.ts
  jsx/module.ts
  document/store/module.ts
  document/module.ts
)

for m in "${entrypoints[@]}"; do
  s=$(size "$m" --external @internal)
  printf '%8s B  %s\n' "$s" "$m"
done
