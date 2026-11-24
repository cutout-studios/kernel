#!/usr/bin/env bash
set -euo pipefail

size() { deno bundle --minify "$@" 2>/dev/null | brotli -q 11 -c | wc -c | tr -d ' '; }

core=$(size internal/module.ts)

printf '%8s B  %s\n' "$core" "internal/module.ts"

entrypoints=(
  jsx/module.ts
  jsx/token/module.ts
  jsx/projection/module.ts
  selector/module.ts
  document/module.ts
  document/store/module.ts
  all.module.ts
)

for m in "${entrypoints[@]}"; do
  s=$(size "$m")
  printf '%8s B  %s\n' "$s" "$m"
done
