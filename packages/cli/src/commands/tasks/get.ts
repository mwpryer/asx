import { buildCommand } from "@stricli/core";

import {
  AsanaClient,
  formatJSON,
  resolvePat,
  validateGid,
} from "@mwp13/asx-core";
import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  fieldsFlag,
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
    validateGid(taskGid, "task-gid");

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/tasks/${taskGid}`,
      optFields: flags.fields?.split(",") ?? [
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
      ],
    });

    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.get" }) + "\n",
    );
  }),
});
