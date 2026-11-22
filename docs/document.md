# `@cutout/kernel/store`

**The Idea**: Store and retrieve JSX across various backends. Something like
this:

```tsx
import { createDocument } from "@cutout/kernel/document";
import { appendElement } from "@cutout/kernel/element";

const document = createDocument();

appendElement(
  document,
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
import { createSelector, querySelector } from "@cutout/kernel/selector";

const userSelector = (userId) => createSelector(`user#${userId}`);

console.log(
  rawText(
    querySelector(document, userSelector(123)), // get the stored IR subtree
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
