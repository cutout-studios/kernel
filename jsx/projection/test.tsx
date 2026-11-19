/** @jsxImportSource @cutout/kernel */

import { assertSnapshot } from "@std/testing/snapshot";
import { rawText } from "./rawText.ts";

const TEST_GROUP = "jsx/projections";

Deno.test(`${TEST_GROUP} - rawText`, (test) =>
  assertSnapshot(test, rawText(<div></div>)));

Deno.test(
  `${TEST_GROUP} - rawText, attributes`,
  (test) =>
    assertSnapshot(
      test,
      rawText(<div style="color:red;" id="my-cool-div"></div>),
    ),
);

Deno.test(
  `${TEST_GROUP} - rawText, children`,
  (test) =>
    assertSnapshot(
      test,
      rawText(
        <ul>
          <li>Child #1</li>
          <li>Child #2</li>
          <li>Child #3</li>
        </ul>,
      ),
    ),
);

Deno.test(
  `${TEST_GROUP} - rawText, mapped children`,
  (test) =>
    assertSnapshot(
      test,
      rawText(
        <ul>
          {["Child #1", "Child #2", "Child #3"].map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>,
      ),
    ),
);

Deno.test(
  `${TEST_GROUP} - rawText, children + attributes`,
  (test) =>
    assertSnapshot(
      test,
      rawText(
        <ul id="main">
          <li class="selected">Child #1</li>
          <li>Child #2</li>
          <li>Child #3</li>
        </ul>,
      ),
    ),
);

Deno.test(
  `${TEST_GROUP} - rawText, nested children`,
  (test) =>
    assertSnapshot(
      test,
      rawText(
        <ul id="main">
          <li class="selected">Child #1</li>
          <li>Child #2</li>
          <li>
            <button type="button" disabled>Child #3</button>
          </li>
        </ul>,
      ),
    ),
);

Deno.test(
  `${TEST_GROUP} - rawText, deeply nested children`,
  (test) =>
    assertSnapshot(
      test,
      rawText(
        <div>
          <div>
            <div>
              <div>
                <div>
                  Hello, World!
                </div>
              </div>
            </div>
          </div>
        </div>,
      ),
    ),
);

Deno.test(
  `${TEST_GROUP} - rawText, deeply nested children + attributes`,
  (test) =>
    assertSnapshot(
      test,
      rawText(
        <div id="1">
          <div id="2">
            <div id="3">
              <div id="4">
                <div id="5">
                  Hello, World!
                </div>
              </div>
            </div>
          </div>
        </div>,
      ),
    ),
);

Deno.test(`${TEST_GROUP} - rawText, fragment`, (test) =>
  assertSnapshot(
    test,
    rawText(
      <>
        <span>Hello #1</span>
        <span>Hello #2</span>
      </>,
    ),
  ));
