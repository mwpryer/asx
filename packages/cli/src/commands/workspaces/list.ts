import { buildCommand } from "@stricli/core";
import { AsanaClient, formatJSON, resolvePat } from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import {
  accountFlag,
  DEFAULT_PAGE_LIMIT,
  paginationFlags,
  paginationMeta,
  type AccountFlag,
  type PaginationFlags,
} from "../../flags.js";

export const listCommand = buildCommand({
  docs: { brief: "List accessible workspaces" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      ...paginationFlags,
      account: accountFlag,
    },
  },
  func: async function (
    this: AsxCliContext,
    flags: AccountFlag & PaginationFlags,
  ) {
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: "/workspaces",
      query: {
        limit: flags.limit ?? DEFAULT_PAGE_LIMIT,
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: ["name", "is_organization"],
    });

    this.process.stdout.write(
      formatJSON(
        { workspaces: res.data },
        { command: "workspaces.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  },
});
