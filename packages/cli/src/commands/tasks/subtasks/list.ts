import { AsanaClient, formatJSON, resolvePat, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  resolveLimit,
  fieldsFlag,
  paginationFlags,
  paginationMeta,
  parseFields,
  type AccountFlag,
  type FieldsFlag,
  type PaginationFlags,
} from "@/flags";

export const listCommand = buildCommand({
  docs: { brief: "List subtasks of a task" },
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
    v.parse(s.gid("task-gid"), taskGid);

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/tasks/${taskGid}/subtasks`,
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: parseFields(flags.fields, [
        "name",
        "completed",
        "assignee.name",
        "due_on",
      ]),
    });

    this.process.stdout.write(
      formatJSON(
        { subtasks: res.data },
        { command: "tasks.subtasks.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
