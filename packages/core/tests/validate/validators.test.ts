import { describe, it, expect } from "vitest";

import { InputError } from "@/errors/errors";
import {
  validateGid,
  validateDate,
  validateLimit,
  validateEnum,
  sanitizeText,
} from "@/validate/validators";

describe("validateGid", () => {
  it("returns the GID for numeric strings", () => {
    expect(validateGid("1234567890", "task-gid")).toBe("1234567890");
  });

  it("returns the GID for single digit", () => {
    expect(validateGid("1", "task-gid")).toBe("1");
  });

  it("throws InputError for zero", () => {
    expect(() => validateGid("0", "task-gid")).toThrow(InputError);
  });

  it("throws InputError for non-numeric strings", () => {
    expect(() => validateGid("abc", "task-gid")).toThrow(InputError);
  });

  it("throws InputError for empty string", () => {
    expect(() => validateGid("", "task-gid")).toThrow(InputError);
  });

  it("throws InputError for GID with spaces", () => {
    expect(() => validateGid("123 456", "task-gid")).toThrow(InputError);
  });

  it("throws InputError for GID with special characters", () => {
    expect(() => validateGid("123-456", "task-gid")).toThrow(InputError);
    expect(() => validateGid("123.456", "task-gid")).toThrow(InputError);
  });

  it("throws InputError for GID with leading/trailing whitespace", () => {
    expect(() => validateGid(" 123", "task-gid")).toThrow(InputError);
    expect(() => validateGid("123 ", "task-gid")).toThrow(InputError);
  });

  it("thrown error has code INPUT_INVALID and non-empty suggestion", () => {
    try {
      validateGid("abc", "task-gid");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });
});

describe("validateDate", () => {
  it("returns the date string for valid YYYY-MM-DD", () => {
    expect(validateDate("2026-03-15", "due_on")).toBe("2026-03-15");
  });

  it("returns the date string for leap day", () => {
    expect(validateDate("2028-02-29", "due_on")).toBe("2028-02-29");
  });

  it("throws InputError for wrong separators", () => {
    expect(() => validateDate("2026/03/15", "due_on")).toThrow(InputError);
    expect(() => validateDate("2026.03.15", "due_on")).toThrow(InputError);
  });

  it("throws InputError for invalid month", () => {
    expect(() => validateDate("2026-13-01", "due_on")).toThrow(InputError);
    expect(() => validateDate("2026-00-01", "due_on")).toThrow(InputError);
  });

  it("throws InputError for invalid day", () => {
    expect(() => validateDate("2026-01-32", "due_on")).toThrow(InputError);
    expect(() => validateDate("2026-02-30", "due_on")).toThrow(InputError);
  });

  it("throws InputError for Feb 29 on non-leap year", () => {
    expect(() => validateDate("2026-02-29", "due_on")).toThrow(InputError);
  });

  it("throws InputError for empty string", () => {
    expect(() => validateDate("", "due_on")).toThrow(InputError);
  });

  it("throws InputError for plain text", () => {
    expect(() => validateDate("tomorrow", "due_on")).toThrow(InputError);
  });

  it("thrown error has code INPUT_INVALID and non-empty suggestion", () => {
    try {
      validateDate("bad", "due_on");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });
});

describe("validateLimit", () => {
  it("returns the value for valid limits", () => {
    expect(validateLimit(1)).toBe(1);
    expect(validateLimit(50)).toBe(50);
    expect(validateLimit(100)).toBe(100);
  });

  it("throws InputError for zero", () => {
    expect(() => validateLimit(0)).toThrow(InputError);
  });

  it("throws InputError for negative numbers", () => {
    expect(() => validateLimit(-1)).toThrow(InputError);
  });

  it("throws InputError for values above 100", () => {
    expect(() => validateLimit(101)).toThrow(InputError);
  });

  it("throws InputError for non-integers", () => {
    expect(() => validateLimit(1.5)).toThrow(InputError);
  });
});

describe("validateEnum", () => {
  const allowed = ["red", "green", "blue"] as const;

  it("returns the value for a valid enum member", () => {
    expect(validateEnum("red", "color", allowed)).toBe("red");
    expect(validateEnum("blue", "color", allowed)).toBe("blue");
  });

  it("throws InputError for an invalid value", () => {
    expect(() => validateEnum("purple", "color", allowed)).toThrow(InputError);
  });

  it("thrown error includes the invalid value and allowed list", () => {
    try {
      validateEnum("purple", "color", allowed);
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).message).toContain("purple");
      expect((err as InputError).suggestion).toContain("red");
    }
  });
});

describe("sanitizeText", () => {
  it("returns normal text unchanged", () => {
    expect(sanitizeText("Hello world", "name")).toBe("Hello world");
  });

  it("returns empty string", () => {
    expect(sanitizeText("", "name")).toBe("");
  });

  it("allows text with newlines", () => {
    expect(sanitizeText("line1\nline2", "notes")).toBe("line1\nline2");
  });

  it("allows text with tabs", () => {
    expect(sanitizeText("col1\tcol2", "notes")).toBe("col1\tcol2");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeText("  hello  ", "name")).toBe("hello");
    expect(sanitizeText("\nhello\n", "notes")).toBe("hello");
  });

  it("normalises \\r\\n to \\n", () => {
    expect(sanitizeText("line1\r\nline2", "notes")).toBe("line1\nline2");
  });

  it("normalises bare \\r to \\n", () => {
    expect(sanitizeText("line1\rline2", "notes")).toBe("line1\nline2");
  });

  it("throws InputError for null byte control character", () => {
    expect(() => sanitizeText("hello\x00world", "name")).toThrow(InputError);
  });

  it("throws InputError for bell control character", () => {
    expect(() => sanitizeText("hello\x07world", "name")).toThrow(InputError);
  });

  it("throws InputError for other control characters", () => {
    expect(() => sanitizeText("hello\x01world", "name")).toThrow(InputError);
    expect(() => sanitizeText("hello\x7Fworld", "name")).toThrow(InputError);
  });

  it("throws InputError for text exceeding default maxLength", () => {
    const longText = "a".repeat(10_001);
    expect(() => sanitizeText(longText, "notes")).toThrow(InputError);
  });

  it("throws InputError for text exceeding custom maxLength", () => {
    const text = "a".repeat(1025);
    expect(() => sanitizeText(text, "name", 1024)).toThrow(InputError);
  });

  it("allows text at exactly maxLength", () => {
    const text = "a".repeat(1024);
    expect(sanitizeText(text, "name", 1024)).toBe(text);
  });

  it("thrown error has code INPUT_INVALID and non-empty suggestion", () => {
    try {
      sanitizeText("hello\x00world", "name");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });
});
