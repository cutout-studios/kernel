import { assertSnapshot } from "@std/testing/snapshot";
import { parse } from "./parse.ts";

const TEST_MODULE = "store/selector";

Deno.test(`${TEST_MODULE}`, async (test) => {
  await assertSnapshot(test, parse("div"));
  await assertSnapshot(test, parse("div#id"));
  await assertSnapshot(test, parse("div#id.className"));
  await assertSnapshot(test, parse("#id"));
  await assertSnapshot(test, parse("#id.className"));
});

Deno.test(`${TEST_MODULE} - attributes`, async (test) => {
  await assertSnapshot(test, parse("[foo]"));
  await assertSnapshot(test, parse("div[foo]"));
  await assertSnapshot(test, parse("div#id.className[foo]"));
  await assertSnapshot(test, parse("[foo='bar']"));
  await assertSnapshot(test, parse("[foo~='bar']"));
  await assertSnapshot(test, parse("[foo~='bar' s]"));
  await assertSnapshot(test, parse("[foo~=bar i]"));
  await assertSnapshot(test, parse("[foo]#id"));
  await assertSnapshot(test, parse("[foo]#id.className"));
  await assertSnapshot(test, parse("[foo='bar']#id"));
  await assertSnapshot(test, parse("[foo='bar'].className#id"));
});

Deno.test(`${TEST_MODULE} - list`, async (test) => {
  await assertSnapshot(test, parse("div, span"));
  await assertSnapshot(test, parse("div#id, span.className"));
  await assertSnapshot(test, parse("h1, h2, h3, h4, h5"));
  await assertSnapshot(test, parse("div > span, span + li"));
});

Deno.test(`${TEST_MODULE} - combinators`, async (test) => {
  await assertSnapshot(test, parse("div span"));
  await assertSnapshot(test, parse("div > span"));
  await assertSnapshot(test, parse("div#id > span"));
  await assertSnapshot(test, parse("div#id > span.className"));
  await assertSnapshot(test, parse("div + span > #id"));
  await assertSnapshot(test, parse("div+span>#id"));
  await assertSnapshot(test, parse("div        +   span >       #id"));
  await assertSnapshot(test, parse("div#id + span.className > a"));
  await assertSnapshot(test, parse("div#id + span.className > a[foo='bar']"));
});
