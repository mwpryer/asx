import { buildCommand } from "@stricli/core";

import {
  AsanaClient,
  formatJSON,
  hint,
  resolvePat,
  validateGid,
} from "@mwp13/asx-core";
import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  type AccountFlag,
  type DryRunFlag,
} from "@/flags";

export const deleteCommand = buildCommand({
  docs: { brief: "Delete a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      account: accountFlag,
      dryRun: dryRunFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & DryRunFlag,
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    const path = `/tasks/${taskGid}`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "DELETE", path },
          { command: "tasks.delete", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    await client.request({
      method: "DELETE",
      path,
    });

    this.process.stdout.write(
      formatJSON({ deleted: true, gid: taskGid }, { command: "tasks.delete" }) +
        "\n",
    );
    hint(`Task ${taskGid} deleted`);
  }),
});
