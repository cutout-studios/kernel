/** @jsxImportSource @cutout/kernel */

import { XOMemoryStore } from "@cutout/kernel/document/store";
import { rawText } from "@cutout/kernel/jsx/projection";
import { parseSelector } from "@cutout/kernel/jsx/selector";
import { assertSnapshot } from "@std/testing/snapshot";

import { create } from "./create.ts";

const TEST_MODULE = "document";

Deno.test(TEST_MODULE, async (test) => {
  const store = create({ store: new XOMemoryStore() });
  const selector = parseSelector("user#1");

  store.append(
    <>
      <user id={1}>
        <username>Bob</username>
      </user>
      <user id={2}>
        <username>Janet</username>
      </user>
    </>,
  );

  await assertSnapshot(test, rawText(store.select(selector)[0]));

  store.append(
    <user id={1}>
      <username>Bobby</username>
    </user>,
  );

  // Same selector, but returns "Bobby" now.
  await assertSnapshot(test, rawText(store.select(selector)[0]));
});

Deno.test(`${TEST_MODULE} — multiple children`, async (test) => {
  const store = create({ store: new XOMemoryStore() });
  const selector = parseSelector("user#1");

  store.append(
    <user id={1}>
      <username>Bob</username>
      <email>bob@example.com</email>
      <role>admin</role>
    </user>,
  );
  await assertSnapshot(test, rawText(store.select(selector)[0]));
});

Deno.test(`${TEST_MODULE} — deep nesting`, async (test) => {
  const store = create({ store: new XOMemoryStore() });
  const selector = parseSelector("org#1");

  store.append(
    <org id={1}>
      <team>
        <member>
          <name>Bob</name>
        </member>
      </team>
    </org>,
  );

  await assertSnapshot(test, rawText(store.select(selector)[0]));
});

Deno.test(`${TEST_MODULE} — class selector`, async (test) => {
const document = create({ store: new XOMemoryStore() });
const employees = parseSelector(".employee");
  const admins = parseSelector(".admin");
  const employeeAdmins = parseSelector(".employee.admin");

  document.append(
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
    document.select(employees).map((jsx) => rawText(jsx)),
  );

  await assertSnapshot(
    test,
    document.select(admins).map((jsx) => rawText(jsx)),
  );

  await assertSnapshot(
    test,
    document.select(employeeAdmins).map((jsx) => rawText(jsx)),
  );
});

Deno.test(`${TEST_MODULE} — HTML`, async (test) => {
  const document = create({ store: new XOMemoryStore() });
  const headerSelector = parseSelector("header");

  document.append(
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

  await assertSnapshot(test, rawText(document.select(headerSelector)[0]));
});
