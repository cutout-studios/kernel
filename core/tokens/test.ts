import { assertEquals } from "@std/assert";
import { TokenType } from "./constants.ts";
import { isValidToken } from "./guards.ts";
import { tokenize } from "./tokenize.ts";

const TEST_GROUP = "jsx/tokens";

Deno.test(`${TEST_GROUP} - isValidToken`, () => {
  assertEquals(
    isValidToken([TokenType.NUMBER, 0]),
    true,
  );
  assertEquals(
    isValidToken([TokenType.STRING, "string"]),
    true,
  );
  assertEquals(
    isValidToken([TokenType.BOOLEAN, false]),
    true,
  );
  assertEquals(isValidToken([TokenType.ARRAY, []]), true);
  assertEquals(isValidToken([TokenType.OBJECT, {}]), true);
  assertEquals(
    isValidToken([TokenType.UNKNOWN, Symbol("anything")]),
    true,
  );

  assertEquals(isValidToken(null), false);
  assertEquals(isValidToken([TokenType.ARRAY, {}]), false);
  assertEquals(
    isValidToken([
      TokenType.STRING,
      "string",
      "something extra",
    ]),
    false,
  );
});

Deno.test(`${TEST_GROUP} - tokenizeValue`, () => {
  assertEquals(tokenize(0), [TokenType.NUMBER, 0]);
  assertEquals(tokenize("value"), [TokenType.STRING, "value"]);
  assertEquals(tokenize(null), [TokenType.NULL, null]);
  assertEquals(tokenize(undefined), [
    TokenType.UNDEFINED,
    undefined,
  ]);

  const array: unknown[] = [];
  assertEquals(tokenize(array), [TokenType.ARRAY, array]);

  const object = {};
  assertEquals(tokenize(object), [TokenType.OBJECT, object]);

  const func = () => {};
  assertEquals(tokenize(func), [TokenType.FUNCTION, func]);
});
