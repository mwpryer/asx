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

export const sectionsCommand = buildCommand({
  docs: { brief: "List sections in a project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
      ],
    },
    flags: {
      ...paginationFlags,
      account: accountFlag,
    },
  },
  func: async function (
    this: AsxCliContext,
    flags: AccountFlag & PaginationFlags,
    projectGid: string,
  ) {
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/projects/${projectGid}/sections`,
      query: {
        limit: flags.limit ?? DEFAULT_PAGE_LIMIT,
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: ["name", "created_at"],
    });

    this.process.stdout.write(
      formatJSON(
        { sections: res.data },
        { command: "projects.sections", pagination: paginationMeta(res) },
      ) + "\n",
    );
  },
});
