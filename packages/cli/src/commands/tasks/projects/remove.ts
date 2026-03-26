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

export const removeCommand = buildCommand({
  docs: { brief: "Remove a task from a project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
        { brief: "Project GID", placeholder: "project-gid", parse: String },
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
    projectGid: string,
  ) {
    validateGid(taskGid, "task-gid");
    validateGid(projectGid, "project-gid");

    const path = `/tasks/${taskGid}/removeProject`;
    const body = { project: projectGid };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.projects.remove", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "POST",
      path,
      body,
    });

    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.projects.remove" }) +
        "\n",
    );
    hint(`Task ${taskGid} removed from project ${projectGid}`);
  }),
});
