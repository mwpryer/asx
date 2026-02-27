import { buildCommand } from "@stricli/core";
import { AsanaClient, formatJSON, logger, resolvePat } from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import { accountFlag, type AccountFlag } from "../../flags.js";

export const completeCommand = buildCommand({
  docs: { brief: "Mark a task as complete" },
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
      method: "PUT",
      path: `/tasks/${taskGid}`,
      body: { completed: true },
      optFields: ["name", "gid", "completed"],
    });
    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.complete" }) + "\n",
    );
    logger.hint(`Task ${taskGid} marked complete`);
  },
});
