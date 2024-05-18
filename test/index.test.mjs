import { equal } from "node:assert";
import { describe, it } from "node:test";
import { a } from "../src/index.mjs";

describe("Test Suite", () => {
  it("should equal to 1", () => {
    equal(a, 1);
  });
});
