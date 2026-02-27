import { describe, it, expect } from "vitest";
import { formatJSON } from "../../src/output/json.js";

describe("formatJSON", () => {
  it("wraps data with _meta envelope", () => {
    const result = JSON.parse(
      formatJSON({ items: [1, 2] }, { command: "test" }),
    );
    expect(result._meta.command).toBe("test");
    expect(result._meta.timestamp).toBeDefined();
    expect(result.items).toEqual([1, 2]);
  });

  it("includes account when provided", () => {
    const result = JSON.parse(
      formatJSON({}, { command: "x", account: "work" }),
    );
    expect(result._meta.account).toBe("work");
  });

  it("omits account when not provided", () => {
    const result = JSON.parse(formatJSON({}, { command: "x" }));
    expect(result._meta.account).toBeUndefined();
  });

  it("includes pagination when provided", () => {
    const result = JSON.parse(
      formatJSON({}, { command: "x", pagination: { next_offset: "abc" } }),
    );
    expect(result._meta.pagination).toEqual({ next_offset: "abc" });
  });

  it("omits pagination when not provided", () => {
    const result = JSON.parse(formatJSON({}, { command: "x" }));
    expect(result._meta.pagination).toBeUndefined();
  });
});
