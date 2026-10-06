# `@cutout/store`

**The Idea**: Store and retrieve JSX across various backends. Something like
this:

```tsx
import { createStore } from "@cutout/store";
import { XOMemoryBackend } from "@cutout/store/backends";

const store = createStore({ backend: new XOMemoryBackend() });

store.append(
  <>
    {/* Use whatever markup you want, even HTML. */}
    <user id={123}>
      <username>bobadams</username>
      <displayname>Bob Adams</displayname>
    </user>

    <user id={456}>
      <username>denathor345</username>
      <displayname>Denathor Roxx</displayname>
    </user>
  </>,
);

// Later...
import { rawText } from "@cutout/kernel/projections";
import { parseSelector } from "@cutout/store/selector";

const getUser = (userId) => parseSelector(`user#${userId}`);

console.log(
  rawText(
    store.select(getUser(123))[0], // get the stored IR subtree
  ), /*
        <user id="123">
          <username>bobadams</username>
          <displayname>Bob Adams</displayname>
        </user>
      */
);
```

---

<p align="center">
  <a href="https://github.com/cutout-studios/.github/blob/main/profile/TRADEMARK.md">Copyright 2026, Cutout Studios</a>
</p>
