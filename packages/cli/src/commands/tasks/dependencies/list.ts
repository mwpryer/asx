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
  docs: { brief: "List task dependencies" },
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
    const res = await client.request({
      path: `/tasks/${taskGid}/dependencies`,
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: flags.fields?.split(",") ?? [
        "name",
        "completed",
        "assignee.name",
        "due_on",
      ],
    });

    this.process.stdout.write(
      formatJSON(
        { dependencies: res.data },
        {
          command: "tasks.dependencies.list",
          pagination: paginationMeta(res),
        },
      ) + "\n",
    );
  }),
});
