import {
  AsanaClient,
  formatJSON,
  resolvePat,
  validateGid,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  resolveLimit,
  fieldsFlag,
  paginationFlags,
  paginationMeta,
  type AccountFlag,
  type FieldsFlag,
  type PaginationFlags,
} from "@/flags";

export const listCommand = buildCommand({
  docs: { brief: "List comments on a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      ...paginationFlags,
      account: accountFlag,
      fields: fieldsFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & FieldsFlag & PaginationFlags,
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request<Array<{ resource_subtype?: string }>>({
      path: `/tasks/${taskGid}/stories`,
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: flags.fields?.split(",") ?? [
        "text",
        "created_by.name",
        "created_at",
        "resource_subtype",
      ],
    });

    const comments = res.data.filter(
      (s) => s.resource_subtype === "comment_added",
    );

    this.process.stdout.write(
      formatJSON(
        { comments },
        { command: "tasks.comments.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
