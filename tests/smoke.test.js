// tests/smoke.test.js
import { describe, it, expect } from "vitest";
import { ping } from "../src/logic.js";

describe("harness", () => {
  it("returns pong", () => {
    expect(ping()).toBe("pong");
  });
});
