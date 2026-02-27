import { buildCommand } from "@stricli/core";
import { AsanaClient, formatJSON, logger, resolvePat } from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import { accountFlag, type AccountFlag } from "../../flags.js";

export const commentCommand = buildCommand({
  docs: { brief: "Add a comment to a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
        { brief: "Comment text", placeholder: "text", parse: String },
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
    text: string,
  ) {
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "POST",
      path: `/tasks/${taskGid}/stories`,
      body: { text },
      optFields: ["text", "created_by.name", "created_at"],
    });
    this.process.stdout.write(
      formatJSON({ story: res.data }, { command: "tasks.comment" }) + "\n",
    );
    logger.hint(`Comment added to task ${taskGid}`);
  },
});
