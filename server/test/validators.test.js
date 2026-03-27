import test from "node:test";
import assert from "node:assert/strict";
import { isValidEmail } from "../src/utils/validators.js";

test("isValidEmail validates common email formats", () => {
  assert.equal(isValidEmail("person@example.com"), true);
  assert.equal(isValidEmail("invalid"), false);
  assert.equal(isValidEmail("a@b"), false);
});
