/** @jsxImportSource @cutout/kernel */

import { rawText } from "@cutout/kernel/jsx/projection";
import { createSelector } from "@cutout/kernel/selector";
import { assertSnapshot } from "@std/testing/snapshot";

import { create } from "./create.ts";
import { prepend } from "./prepend.ts";
import { query } from "./query.ts";

const TEST_MODULE = "document";

Deno.test(TEST_MODULE, async (test) => {
  const document = create(), selector = createSelector("user#1");

  prepend(
    document,
    <>
      <user id={1}>
        <username>Bob</username>
      </user>
      <user id={2}>
        <username>Janet</username>
      </user>
    </>,
  );

  await assertSnapshot(test, rawText(query(document, selector)));

  prepend(
    document,
    <user id={1}>
      <username>Bobby</username>
    </user>,
  );

  // Same selector, but returns "Bobby" now.
  await assertSnapshot(test, rawText(query(document, selector)));
});

Deno.test(`${TEST_MODULE} — multiple children`, async (test) => {
  const document = create();
  const selector = createSelector("user#1");

  prepend(
    document,
    <user id={1}>
      <username>Bob</username>
      <email>bob@example.com</email>
      <role>admin</role>
    </user>,
  );
  await assertSnapshot(test, rawText(query(document, selector)));
});

Deno.test(`${TEST_MODULE} — deep nesting`, async (test) => {
  const document = create();
  const selector = createSelector("org#1");

  prepend(
    document,
    <org id={1}>
      <team>
        <member>
          <name>Bob</name>
        </member>
      </team>
    </org>,
  );

  await assertSnapshot(test, rawText(query(document, selector)));
});

Deno.test(`${TEST_MODULE} — class selector`, async (test) => {
  const document = create();
  const employees = createSelector(".employee");
  const admins = createSelector(".admin");
  const employeeAdmins = createSelector(".employee.admin");

  prepend(
    document,
    <>
      <user class="employee">
        <username>Bob</username>
      </user>
      <user class="admin employee">
        <username>Janet</username>
      </user>
      <user class="admin">
        <username>Ross</username>
      </user>
    </>,
  );

  await assertSnapshot(
    test,
    query(document, employees).map((jsx) => rawText(jsx)),
  );

  await assertSnapshot(
    test,
    query(document, admins).map((jsx) => rawText(jsx)),
  );

  await assertSnapshot(
    test,
    query(document, employeeAdmins).map((jsx) => rawText(jsx)),
  );
});

Deno.test(`${TEST_MODULE} — HTML`, async (test) => {
  const document = create();
  const headerSelector = createSelector("header");

  prepend(
    document,
    <html>
      <head>
        <title>Hello, World!</title>
      </head>
      <body>
        <main>
          <header>
            Hello <i>World</i>!
          </header>
        </main>
      </body>
    </html>,
  );

  await assertSnapshot(test, query(document, headerSelector));
});
