# `@cutout/kernel`

[![JSR](https://jsr.io/badges/@cutout/kernel)]([https://jsr.io/@cutout/kernel](https://jsr.io/@cutout/kernel))

`@cutout/kernel` is a tiny, generic, interpretable JSX runtime for the Deno
ecosystem. It's inspired in part by the long-abandoned
[OpenJSX](https://github.com/OpenJSX).

_**Write JSX once, use it anywhere.**_

> [!WARNING]
> `@cutout/kernel` is pending in-production testing. Use at your own discretion.

## How it works

In a new TSX file, point your `@jsxImportSource` to _this_ runtime
([`@cutout/kernel`](https://github.com/cutout-studios/toolbox/blob/main/jsx/module.ts))
instead of the default one (React).

```tsx
/** @jsxImportSource jsr:@cutout/kernel */
```

The `@cutout/kernel` runtime _progressively evaluates_ your JSX via a series of
nested
[`Generators`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator):
returning a flat stream of tuples we call "tokens". This token stream can then
be _projected_ into whatever shape you need.

The simplest built-in projection is `rawText`, which serializes the JSX verbatim
into a string:

```tsx
/** @jsxImportSource jsr:@cutout/kernel */
import { rawText } from "@cutout/kernel/projections";

console.log(
  rawText(<div></div>),
); // => "<div></div>"
```

Any script written in the above way can simply be
[run with Deno directly](https://docs.deno.com/runtime/reference/cli/run/), no
setup or build required:

```bash
deno myCutoutApp.tsx
```

---

<p align="center">
  <a href="https://github.com/cutout-studios/.github/blob/main/profile/TRADEMARK.md">Copyright 2026, Cutout Studios</a>
</p>
