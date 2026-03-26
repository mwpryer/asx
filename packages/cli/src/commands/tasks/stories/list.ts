import { s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc, exec } from "@/command";
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
  docs: { brief: "List all stories on a task" },
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

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path: `/tasks/${taskGid}/stories`,
        query: {
          limit: resolveLimit(flags),
          ...(flags.offset && { offset: flags.offset }),
        },
        optFields: parseFields(flags.fields, [
          "text",
          "created_by.name",
          "created_at",
          "type",
          "resource_subtype",
        ]),
      },
      format: (res) => ({
        data: { stories: res.data },
        pagination: paginationMeta(res),
      }),
      command: "tasks.stories.list",
    });
  }),
});
