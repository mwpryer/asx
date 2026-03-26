import * as v from "valibot";

import { InputError } from "@/errors/errors";

const GID_RE = /^[1-9]\d*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// ASCII control chars except \t (0x09), \n (0x0A)
// oxlint-disable-next-line no-control-regex (intentional: detecting unwanted control chars in input)
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
const DEFAULT_MAX_LENGTH = 10_000;

// Numeric GID string
export function gid(fieldName: string) {
  return v.pipe(
    v.string(),
    v.transform((val): string => {
      if (!val || !GID_RE.test(val)) {
        throw new InputError(
          "INPUT_INVALID",
          `Invalid ${fieldName}: expected a numeric GID, got "${val}"`,
          `${fieldName} must contain only digits (e.g. "1234567890")`,
        );
      }
      return val;
    }),
  );
}

// YYYY-MM-DD date, rejects invalid calendar dates
export function date(fieldName: string) {
  return v.pipe(
    v.string(),
    v.transform((val): string => {
      if (!DATE_RE.test(val)) {
        throw new InputError(
          "INPUT_INVALID",
          `Invalid ${fieldName}: expected YYYY-MM-DD format, got "${val}"`,
          `${fieldName} must be a valid date in YYYY-MM-DD format (e.g. "2025-01-15")`,
        );
      }
      const [year, month, day] = val.split("-").map(Number);
      const d = new Date(year!, month! - 1, day);
      if (
        d.getFullYear() !== year ||
        d.getMonth() !== month! - 1 ||
        d.getDate() !== day
      ) {
        throw new InputError(
          "INPUT_INVALID",
          `Invalid ${fieldName}: "${val}" is not a real date`,
          `${fieldName} must be a valid calendar date in YYYY-MM-DD format`,
        );
      }
      return val;
    }),
  );
}

// Pagination limit (integer 1-100)
export function limit() {
  return v.pipe(
    v.number(),
    v.transform((val): number => {
      if (!Number.isInteger(val) || val < 1 || val > 100) {
        throw new InputError(
          "INPUT_INVALID",
          `Invalid limit: ${val}`,
          "limit must be an integer between 1 and 100",
        );
      }
      return val;
    }),
  );
}

// Sanitise text: trim, normalise line endings, reject control chars, enforce max length
export function text(fieldName: string, maxLength = DEFAULT_MAX_LENGTH) {
  return v.pipe(
    v.string(),
    v.transform((val): string => {
      const cleaned = val.replace(/\r\n?/g, "\n").trim();
      if (CONTROL_CHAR_RE.test(cleaned)) {
        throw new InputError(
          "INPUT_INVALID",
          `Invalid ${fieldName}: contains disallowed control characters`,
          `${fieldName} must not contain ASCII control characters (newlines and tabs are allowed)`,
        );
      }
      if (cleaned.length > maxLength) {
        throw new InputError(
          "INPUT_INVALID",
          `Invalid ${fieldName}: text is ${cleaned.length} characters, maximum is ${maxLength}`,
          `${fieldName} must be at most ${maxLength} characters`,
        );
      }
      return cleaned;
    }),
  );
}

// Like text() but rejects empty-after-trim
export function nonBlankText(
  fieldName: string,
  maxLength = DEFAULT_MAX_LENGTH,
) {
  return v.pipe(
    text(fieldName, maxLength),
    v.transform((val): string => {
      if (!val) {
        throw new InputError(
          "INPUT_INVALID",
          `Invalid ${fieldName}: must not be blank`,
          `Provide a non-empty --${fieldName}`,
        );
      }
      return val;
    }),
  );
}

// Value must be in allowed list
export function enumOf<const T extends readonly string[]>(
  fieldName: string,
  allowed: T,
) {
  return v.pipe(
    v.string(),
    v.transform((val): T[number] => {
      if (!allowed.includes(val)) {
        throw new InputError(
          "INPUT_INVALID",
          `Invalid ${fieldName}: "${val}"`,
          `Must be one of: ${allowed.join(", ")}`,
        );
      }
      return val;
    }),
  );
}

// Assignee: "me" or numeric GID
export function assignee() {
  return v.union([v.literal("me"), gid("assignee")]);
}

// Parse JSON string, ensure it's an object
export function jsonInput() {
  return v.pipe(
    v.string(),
    v.transform((val): Record<string, unknown> => {
      try {
        const parsed: unknown = JSON.parse(val);
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          throw new InputError(
            "INPUT_INVALID",
            "JSON input must be an object, got " +
              (Array.isArray(parsed) ? "array" : typeof parsed),
            'Provide a JSON object like \'{"name": "Task name"}\'',
          );
        }
        return parsed as Record<string, unknown>;
      } catch (error) {
        if (error instanceof InputError) throw error;
        throw new InputError(
          "INPUT_INVALID",
          `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
          'Provide valid JSON, e.g. \'{"name": "Task name"}\'',
        );
      }
    }),
  );
}

// Comma-separated fields, falls back to defaults when omitted
export function fields(defaults: string[]) {
  return v.pipe(
    v.optional(v.string()),
    v.transform((val): string[] => {
      if (val === undefined) return defaults;
      const list = val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length === 0) {
        throw new InputError(
          "INPUT_INVALID",
          "--fields must not be empty",
          "Provide comma-separated field names, or omit --fields to use defaults",
        );
      }
      return list;
    }),
  );
}
