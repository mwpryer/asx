import { s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc, exec } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  fieldsFlag,
  parseFields,
  type AccountFlag,
  type FieldsFlag,
} from "@/flags";

export const listCommand = buildCommand({
  docs: { brief: "List tags on a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      account: accountFlag,
      fields: fieldsFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & FieldsFlag,
    taskGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);

    await exec<{
      tags?: Array<Record<string, unknown>>;
    }>({
      ctx: this,
      account: flags.account,
      request: {
        path: `/tasks/${taskGid}`,
        optFields: parseFields(flags.fields, ["tags.name"]),
      },
      format: (res) => ({
        data: { tags: res.data.tags ?? [] },
      }),
      command: "tasks.tags.list",
    });
  }),
});
