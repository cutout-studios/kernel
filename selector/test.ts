import { assertSnapshot } from "@std/testing/snapshot";
import { create } from "./create.ts";

const TEST_MODULE = "store/selector";

Deno.test(`${TEST_MODULE}`, async (test) => {
  await assertSnapshot(test, create("div"));
  await assertSnapshot(test, create("div#id"));
  await assertSnapshot(test, create("div#id.className"));
  await assertSnapshot(test, create("#id"));
  await assertSnapshot(test, create("#id.className"));
});

Deno.test(`${TEST_MODULE} - attributes`, async (test) => {
  await assertSnapshot(test, create("[foo]"));
  await assertSnapshot(test, create("div[foo]"));
  await assertSnapshot(test, create("div#id.className[foo]"));
  await assertSnapshot(test, create("[foo='bar']"));
  await assertSnapshot(test, create("[foo~='bar']"));
  await assertSnapshot(test, create("[foo~='bar' s]"));
  await assertSnapshot(test, create("[foo~=bar i]"));
  await assertSnapshot(test, create("[foo]#id"));
  await assertSnapshot(test, create("[foo]#id.className"));
  await assertSnapshot(test, create("[foo='bar']#id"));
  await assertSnapshot(test, create("[foo='bar'].className#id"));
});

Deno.test(`${TEST_MODULE} - list`, async (test) => {
  await assertSnapshot(test, create("div, span"));
  await assertSnapshot(test, create("div#id, span.className"));
  await assertSnapshot(test, create("h1, h2, h3, h4, h5"));
  await assertSnapshot(test, create("div > span, span + li"));
});

Deno.test(`${TEST_MODULE} - combinators`, async (test) => {
  await assertSnapshot(test, create("div span"));
  await assertSnapshot(test, create("div > span"));
  await assertSnapshot(test, create("div#id > span"));
  await assertSnapshot(test, create("div#id > span.className"));
  await assertSnapshot(test, create("div + span > #id"));
  await assertSnapshot(test, create("div+span>#id"));
  await assertSnapshot(test, create("div        +   span >       #id"));
  await assertSnapshot(test, create("div#id + span.className > a"));
  await assertSnapshot(test, create("div#id + span.className > a[foo='bar']"));
});
