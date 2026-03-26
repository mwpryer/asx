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

export const getCommand = buildCommand({
  docs: { brief: "Get full details of a task" },
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

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path: `/tasks/${taskGid}`,
        optFields: parseFields(flags.fields, [
          "name",
          "resource_subtype",
          "completed",
          "completed_at",
          "assignee.name",
          "due_on",
          "start_on",
          "notes",
          "num_subtasks",
          "projects.name",
          "tags.name",
          "parent.name",
          "custom_fields.name",
          "custom_fields.display_value",
          "permalink_url",
          "created_at",
          "modified_at",
        ]),
      },
      format: (res) => ({ data: { task: res.data } }),
      command: "tasks.get",
    });
  }),
});
