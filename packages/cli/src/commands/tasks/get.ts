import { buildCommand } from "@stricli/core";
import { AsanaClient, formatJSON, resolvePat } from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import { accountFlag, type AccountFlag } from "../../flags.js";

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
    },
  },
  func: async function (
    this: AsxCliContext,
    flags: AccountFlag,
    taskGid: string,
  ) {
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/tasks/${taskGid}`,
      optFields: [
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
