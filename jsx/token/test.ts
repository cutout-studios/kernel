import { assertEquals } from "@std/assert";
import { TokenType } from "./constants.ts";
import { isValidToken } from "./guards.ts";
import { tokenizeValue } from "./tokenizeValue.ts";

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
  assertEquals(tokenizeValue(0), [TokenType.NUMBER, 0]);
  assertEquals(tokenizeValue("value"), [TokenType.STRING, "value"]);
  assertEquals(tokenizeValue(null), [TokenType.NULL, null]);
  assertEquals(tokenizeValue(undefined), [
    TokenType.UNDEFINED,
    undefined,
  ]);

  const array: unknown[] = [];
  assertEquals(tokenizeValue(array), [TokenType.ARRAY, array]);

  const object = {};
  assertEquals(tokenizeValue(object), [TokenType.OBJECT, object]);

  const func = () => {};
  assertEquals(tokenizeValue(func), [TokenType.FUNCTION, func]);
});
