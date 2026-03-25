import { InputError, validateLimit, type AsanaResponse } from "@mwp13/asx-core";

const DEFAULT_PAGE_LIMIT = 20;

// Flag definitions
export const accountFlag = {
  kind: "parsed",
  brief: "Account alias to use",
  parse: String,
  optional: true,
} as const;

export const paginationFlags = {
  limit: {
    kind: "parsed",
    brief: "Max results to return (1-100)",
    parse: Number,
    optional: true,
  },
  offset: {
    kind: "parsed",
    brief: "Pagination offset from a previous response",
    parse: String,
    optional: true,
  },
} as const;

export const fieldsFlag = {
  kind: "parsed",
  brief: "Comma-separated field names to return (overrides defaults)",
  parse: String,
  optional: true,
} as const;

export const dryRunFlag = {
  kind: "boolean",
  brief: "Preview the request without sending it",
  default: false,
} as const;

export const jsonFlag = {
  kind: "parsed",
  brief: "Raw JSON request body (mutually exclusive with value flags)",
  parse: String,
  optional: true,
} as const;

// Types
export type AccountFlag = { account: string | undefined };
export type PaginationFlags = {
  limit: number | undefined;
  offset: string | undefined;
};
export type FieldsFlag = { fields: string | undefined };
export type DryRunFlag = { dryRun: boolean };
export type JsonFlag = { json: string | undefined };

export function resolveLimit(flags: PaginationFlags): number {
  if (flags.limit === undefined) return DEFAULT_PAGE_LIMIT;
  return validateLimit(flags.limit);
}

export function paginationMeta(res: AsanaResponse<unknown>) {
  return res.next_page ? { next_offset: res.next_page.offset } : undefined;
}

export function parseJsonInput(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);
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
}
