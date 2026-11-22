# `@cutout/kernel/store`

**The Idea**: Store and retrieve JSX across various backends. Something like
this:

```tsx
import { createStore } from "@cutout/store";
import { XOMemoryStore } from "@cutout/kernel/document/store";

const document = createDocument({ store: new XOMemoryStore() });

document.append(
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
import { rawText } from "@cutout/kernel/jsx/projection";
import { parseSelector } from "@cutout/kernel/jsx/selector";

const getUser = (userId) => parseSelector(`user#${userId}`);

console.log(
  rawText(
    document.select(getUser(123))[0], // get the stored IR subtree
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
