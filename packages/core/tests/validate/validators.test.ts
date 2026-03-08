import { describe, it, expect } from "vitest";
import {
  validateGid,
  validateDate,
  sanitizeText,
} from "../../src/validate/validators.js";
import { InputError } from "../../src/errors/errors.js";

describe("validateGid", () => {
  it("returns the GID for numeric strings", () => {
    expect(validateGid("1234567890", "task-gid")).toBe("1234567890");
  });

  it("returns the GID for single digit", () => {
    expect(validateGid("0", "task-gid")).toBe("0");
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
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });
});

describe("validateDate", () => {
  it("returns the date string for valid YYYY-MM-DD", () => {
    expect(validateDate("2025-01-15", "due_on")).toBe("2025-01-15");
  });

  it("returns the date string for leap day", () => {
    expect(validateDate("2024-02-29", "due_on")).toBe("2024-02-29");
  });

  it("throws InputError for wrong separators", () => {
    expect(() => validateDate("2025/01/15", "due_on")).toThrow(InputError);
    expect(() => validateDate("2025.01.15", "due_on")).toThrow(InputError);
  });

  it("throws InputError for invalid month", () => {
    expect(() => validateDate("2025-13-01", "due_on")).toThrow(InputError);
    expect(() => validateDate("2025-00-01", "due_on")).toThrow(InputError);
  });

  it("throws InputError for invalid day", () => {
    expect(() => validateDate("2025-01-32", "due_on")).toThrow(InputError);
    expect(() => validateDate("2025-02-30", "due_on")).toThrow(InputError);
  });

  it("throws InputError for Feb 29 on non-leap year", () => {
    expect(() => validateDate("2025-02-29", "due_on")).toThrow(InputError);
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
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
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
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });
});
