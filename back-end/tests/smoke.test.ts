import { describe, it, expect } from "@jest/globals";

describe("smoke", () => {
  it("o Jest roda ESM + TypeScript", () => {
    expect(1 + 1).toBe(2);
  });
});
