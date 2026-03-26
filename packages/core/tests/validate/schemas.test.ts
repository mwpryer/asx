import * as v from "valibot";
import { describe, it, expect } from "vitest";

import { InputError } from "@/errors/errors";
import {
  gid,
  date,
  limit,
  text,
  nonBlankText,
  enumOf,
  assignee,
  jsonInput,
  fields,
} from "@/validate/schemas";

describe("gid", () => {
  const schema = gid("task-gid");

  it("returns the GID for numeric strings", () => {
    expect(v.parse(schema, "1234567890")).toBe("1234567890");
  });

  it("returns the GID for single digit", () => {
    expect(v.parse(schema, "1")).toBe("1");
  });

  it("throws InputError for zero", () => {
    expect(() => v.parse(schema, "0")).toThrow(InputError);
  });

  it("throws InputError for non-numeric strings", () => {
    expect(() => v.parse(schema, "abc")).toThrow(InputError);
  });

  it("throws InputError for empty string", () => {
    expect(() => v.parse(schema, "")).toThrow(InputError);
  });

  it("throws InputError for GID with spaces", () => {
    expect(() => v.parse(schema, "123 456")).toThrow(InputError);
  });

  it("throws InputError for GID with special characters", () => {
    expect(() => v.parse(schema, "123-456")).toThrow(InputError);
    expect(() => v.parse(schema, "123.456")).toThrow(InputError);
  });

  it("throws InputError for GID with leading/trailing whitespace", () => {
    expect(() => v.parse(schema, " 123")).toThrow(InputError);
    expect(() => v.parse(schema, "123 ")).toThrow(InputError);
  });

  it("thrown error has code INPUT_INVALID and non-empty suggestion", () => {
    try {
      v.parse(schema, "abc");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });
});

describe("date", () => {
  const schema = date("due_on");

  it("returns the date string for valid YYYY-MM-DD", () => {
    expect(v.parse(schema, "2026-03-15")).toBe("2026-03-15");
  });

  it("returns the date string for leap day", () => {
    expect(v.parse(schema, "2028-02-29")).toBe("2028-02-29");
  });

  it("throws InputError for wrong separators", () => {
    expect(() => v.parse(schema, "2026/03/15")).toThrow(InputError);
    expect(() => v.parse(schema, "2026.03.15")).toThrow(InputError);
  });

  it("throws InputError for invalid month", () => {
    expect(() => v.parse(schema, "2026-13-01")).toThrow(InputError);
    expect(() => v.parse(schema, "2026-00-01")).toThrow(InputError);
  });

  it("throws InputError for invalid day", () => {
    expect(() => v.parse(schema, "2026-01-32")).toThrow(InputError);
    expect(() => v.parse(schema, "2026-02-30")).toThrow(InputError);
  });

  it("throws InputError for Feb 29 on non-leap year", () => {
    expect(() => v.parse(schema, "2026-02-29")).toThrow(InputError);
  });

  it("throws InputError for empty string", () => {
    expect(() => v.parse(schema, "")).toThrow(InputError);
  });

  it("throws InputError for plain text", () => {
    expect(() => v.parse(schema, "tomorrow")).toThrow(InputError);
  });

  it("thrown error has code INPUT_INVALID and non-empty suggestion", () => {
    try {
      v.parse(schema, "bad");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });
});

describe("limit", () => {
  const schema = limit();

  it("returns the value for valid limits", () => {
    expect(v.parse(schema, 1)).toBe(1);
    expect(v.parse(schema, 50)).toBe(50);
    expect(v.parse(schema, 100)).toBe(100);
  });

  it("throws InputError for zero", () => {
    expect(() => v.parse(schema, 0)).toThrow(InputError);
  });

  it("throws InputError for negative numbers", () => {
    expect(() => v.parse(schema, -1)).toThrow(InputError);
  });

  it("throws InputError for values above 100", () => {
    expect(() => v.parse(schema, 101)).toThrow(InputError);
  });

  it("throws InputError for non-integers", () => {
    expect(() => v.parse(schema, 1.5)).toThrow(InputError);
  });
});

describe("text", () => {
  const schema = text("name");

  it("returns normal text unchanged", () => {
    expect(v.parse(schema, "Hello world")).toBe("Hello world");
  });

  it("returns empty string", () => {
    expect(v.parse(schema, "")).toBe("");
  });

  it("allows text with newlines", () => {
    expect(v.parse(text("notes"), "line1\nline2")).toBe("line1\nline2");
  });

  it("allows text with tabs", () => {
    expect(v.parse(text("notes"), "col1\tcol2")).toBe("col1\tcol2");
  });

  it("trims leading and trailing whitespace", () => {
    expect(v.parse(schema, "  hello  ")).toBe("hello");
    expect(v.parse(text("notes"), "\nhello\n")).toBe("hello");
  });

  it("normalises \\r\\n to \\n", () => {
    expect(v.parse(text("notes"), "line1\r\nline2")).toBe("line1\nline2");
  });

  it("normalises bare \\r to \\n", () => {
    expect(v.parse(text("notes"), "line1\rline2")).toBe("line1\nline2");
  });

  it("throws InputError for null byte control character", () => {
    expect(() => v.parse(schema, "hello\x00world")).toThrow(InputError);
  });

  it("throws InputError for bell control character", () => {
    expect(() => v.parse(schema, "hello\x07world")).toThrow(InputError);
  });

  it("throws InputError for other control characters", () => {
    expect(() => v.parse(schema, "hello\x01world")).toThrow(InputError);
    expect(() => v.parse(schema, "hello\x7Fworld")).toThrow(InputError);
  });

  it("throws InputError for text exceeding default maxLength", () => {
    const longText = "a".repeat(10_001);
    expect(() => v.parse(text("notes"), longText)).toThrow(InputError);
  });

  it("throws InputError for text exceeding custom maxLength", () => {
    const val = "a".repeat(1025);
    expect(() => v.parse(text("name", 1024), val)).toThrow(InputError);
  });

  it("allows text at exactly maxLength", () => {
    const val = "a".repeat(1024);
    expect(v.parse(text("name", 1024), val)).toBe(val);
  });

  it("thrown error has code INPUT_INVALID and non-empty suggestion", () => {
    try {
      v.parse(schema, "hello\x00world");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });
});

describe("nonBlankText", () => {
  const schema = nonBlankText("name", 1024);

  it("returns non-empty text", () => {
    expect(v.parse(schema, "Hello")).toBe("Hello");
  });

  it("throws InputError for empty string", () => {
    expect(() => v.parse(schema, "")).toThrow(InputError);
  });

  it("throws InputError for whitespace-only string", () => {
    expect(() => v.parse(schema, "   ")).toThrow(InputError);
  });

  it("thrown error mentions must not be blank", () => {
    try {
      v.parse(schema, "");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).message).toContain("must not be blank");
    }
  });
});

describe("enumOf", () => {
  const allowed = ["red", "green", "blue"] as const;
  const schema = enumOf("color", allowed);

  it("returns the value for a valid enum member", () => {
    expect(v.parse(schema, "red")).toBe("red");
    expect(v.parse(schema, "blue")).toBe("blue");
  });

  it("throws InputError for an invalid value", () => {
    expect(() => v.parse(schema, "purple")).toThrow(InputError);
  });

  it("thrown error includes the invalid value and allowed list", () => {
    try {
      v.parse(schema, "purple");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).message).toContain("purple");
      expect((err as InputError).suggestion).toContain("red");
    }
  });
});

describe("assignee", () => {
  const schema = assignee();

  it("accepts 'me'", () => {
    expect(v.parse(schema, "me")).toBe("me");
  });

  it("accepts a valid GID", () => {
    expect(v.parse(schema, "12345")).toBe("12345");
  });

  it("rejects invalid values", () => {
    expect(() => v.parse(schema, "abc")).toThrow();
  });
});

describe("jsonInput", () => {
  const schema = jsonInput();

  it("parses a valid JSON object", () => {
    expect(v.parse(schema, '{"name": "Task"}')).toEqual({ name: "Task" });
  });

  it("throws InputError for arrays", () => {
    expect(() => v.parse(schema, "[1,2]")).toThrow(InputError);
  });

  it("throws InputError for primitives", () => {
    expect(() => v.parse(schema, '"hello"')).toThrow(InputError);
    expect(() => v.parse(schema, "42")).toThrow(InputError);
  });

  it("throws InputError for invalid JSON", () => {
    expect(() => v.parse(schema, "not json")).toThrow(InputError);
  });

  it("thrown error for invalid JSON includes parse message", () => {
    try {
      v.parse(schema, "not json");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).message).toContain("Invalid JSON");
    }
  });
});

describe("fields", () => {
  const defaults = ["gid", "name"];
  const schema = fields(defaults);

  it("returns defaults when undefined", () => {
    expect(v.parse(schema, undefined)).toEqual(["gid", "name"]);
  });

  it("parses comma-separated fields", () => {
    expect(v.parse(schema, "gid,name,notes")).toEqual(["gid", "name", "notes"]);
  });

  it("trims whitespace around fields", () => {
    expect(v.parse(schema, " gid , name ")).toEqual(["gid", "name"]);
  });

  it("throws InputError for empty string", () => {
    expect(() => v.parse(schema, "")).toThrow(InputError);
  });

  it("throws InputError for whitespace/commas only", () => {
    expect(() => v.parse(schema, " , ")).toThrow(InputError);
  });

  it("thrown error mentions --fields", () => {
    try {
      v.parse(schema, "");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).message).toContain("--fields");
    }
  });
});
