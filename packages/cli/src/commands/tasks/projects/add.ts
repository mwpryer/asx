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

export const addCommand = buildCommand({
  docs: { brief: "Add a task to a project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
        { brief: "Project GID", placeholder: "project-gid", parse: String },
      ],
    },
    flags: {
      section: {
        kind: "parsed",
        brief: "Section GID (optional placement)",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      dryRun: dryRunFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & DryRunFlag & { section: string | undefined },
    taskGid: string,
    projectGid: string,
  ) {
    validateGid(taskGid, "task-gid");
    validateGid(projectGid, "project-gid");
    if (flags.section) validateGid(flags.section, "section");

    const path = `/tasks/${taskGid}/addProject`;
    const body: Record<string, string> = { project: projectGid };
    if (flags.section) body["section"] = flags.section;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.projects.add", dry_run: true },
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
      formatJSON({ task: res.data }, { command: "tasks.projects.add" }) + "\n",
    );
    hint(`Task ${taskGid} added to project ${projectGid}`);
  }),
});
