import type { AsanaResponse } from "@mwp13/asx-core";

export const DEFAULT_PAGE_LIMIT = 20;

// Flag definitions (spread into parameters.flags)
export const accountFlag = {
  kind: "parsed",
  brief: "Account alias to use",
  parse: String,
  optional: true,
} as const;

export const paginationFlags = {
  limit: {
    kind: "parsed",
    brief: "Max results to return",
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

// Types (use in func signatures)
export type AccountFlag = { account: string | undefined };
export type PaginationFlags = {
  limit: number | undefined;
  offset: string | undefined;
};

export function paginationMeta(res: AsanaResponse<unknown>) {
  return res.next_page ? { next_offset: res.next_page.offset } : undefined;
}
