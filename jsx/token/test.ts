import { assertEquals } from "@std/assert";
import {
  ARRAY_TOKEN,
  BOOLEAN_TOKEN,
  FUNCTION_TOKEN,
  NULL_TOKEN,
  NUMBER_TOKEN,
  OBJECT_TOKEN,
  STRING_TOKEN,
  UNDEFINED_TOKEN,
  UNKNOWN_TOKEN,
} from "./constants.ts";
import { isValidToken } from "./guards.ts";
import { tokenizeValue } from "./tokenizeValue.ts";

const TEST_GROUP = "jsx/tokens";

Deno.test(`${TEST_GROUP} - isValidToken`, () => {
  assertEquals(
    isValidToken([NUMBER_TOKEN, 0]),
    true,
  );
  assertEquals(
    isValidToken([STRING_TOKEN, "string"]),
    true,
  );
  assertEquals(
    isValidToken([BOOLEAN_TOKEN, false]),
    true,
  );
  assertEquals(isValidToken([ARRAY_TOKEN, []]), true);
  assertEquals(isValidToken([OBJECT_TOKEN, {}]), true);
  assertEquals(
    isValidToken([UNKNOWN_TOKEN, Symbol("anything")]),
    true,
  );

  assertEquals(isValidToken(null), false);
  assertEquals(isValidToken([ARRAY_TOKEN, {}]), false);
  assertEquals(
    isValidToken([
      STRING_TOKEN,
      "string",
      "something extra",
    ]),
    false,
  );
});

Deno.test(`${TEST_GROUP} - tokenizeValue`, () => {
  assertEquals(tokenizeValue(0), [NUMBER_TOKEN, 0]);
  assertEquals(tokenizeValue("value"), [STRING_TOKEN, "value"]);
  assertEquals(tokenizeValue(null), [NULL_TOKEN, null]);
  assertEquals(tokenizeValue(undefined), [
    UNDEFINED_TOKEN,
    undefined,
  ]);

  const array: unknown[] = [];
  assertEquals(tokenizeValue(array), [ARRAY_TOKEN, array]);

  const object = {};
  assertEquals(tokenizeValue(object), [OBJECT_TOKEN, object]);

  const func = () => {};
  assertEquals(tokenizeValue(func), [FUNCTION_TOKEN, func]);
});
