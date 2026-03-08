import { buildCommand } from "@stricli/core";
import {
  AsanaClient,
  formatJSON,
  resolvePat,
  validateGid,
} from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import {
  accountFlag,
  fieldsFlag,
  type AccountFlag,
  type FieldsFlag,
} from "../../flags.js";

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
  func: async function (
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
        "completed",
        "assignee.name",
        "due_on",
        "notes",
        "projects.name",
        "tags.name",
        "parent.name",
        "permalink_url",
        "created_at",
        "modified_at",
      ],
    });

    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.get" }) + "\n",
    );
  },
});
