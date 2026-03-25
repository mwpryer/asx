import { InputError } from "@/errors/errors";

const GID_PATTERN = /^[1-9]\d*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// ASCII control characters except \t (0x09) and \n (0x0A)
// oxlint-disable-next-line no-control-regex -- intentional: detecting unwanted control chars in input
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

const DEFAULT_MAX_LENGTH = 10_000;

export function validateGid(value: string, fieldName: string): string {
  if (!value || !GID_PATTERN.test(value)) {
    throw new InputError(
      "INPUT_INVALID",
      `Invalid ${fieldName}: expected a numeric GID, got "${value}"`,
      `${fieldName} must contain only digits (e.g. "1234567890")`,
    );
  }
  return value;
}

export function validateDate(value: string, fieldName: string): string {
  if (!DATE_PATTERN.test(value)) {
    throw new InputError(
      "INPUT_INVALID",
      `Invalid ${fieldName}: expected YYYY-MM-DD format, got "${value}"`,
      `${fieldName} must be a valid date in YYYY-MM-DD format (e.g. "2025-01-15")`,
    );
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year!, month! - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month! - 1 ||
    date.getDate() !== day
  ) {
    throw new InputError(
      "INPUT_INVALID",
      `Invalid ${fieldName}: "${value}" is not a real date`,
      `${fieldName} must be a valid calendar date in YYYY-MM-DD format`,
    );
  }

  return value;
}

export function validateLimit(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new InputError(
      "INPUT_INVALID",
      `Invalid limit: ${value}`,
      "limit must be an integer between 1 and 100",
    );
  }
  return value;
}

export function sanitizeText(
  value: string,
  fieldName: string,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string {
  const cleaned = value.replace(/\r\n?/g, "\n").trim();

  if (CONTROL_CHAR_PATTERN.test(cleaned)) {
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
}
