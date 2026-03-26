import { hint, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc, preview, exec } from "@/command";
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
    v.parse(s.gid("task-gid"), taskGid);
    v.parse(s.gid("project-gid"), projectGid);

    const path = `/tasks/${taskGid}/removeProject`;
    const body = { project: projectGid };

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.projects.remove",
        method: "POST",
        path,
        body,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: { method: "POST", path, body },
      format: (res) => ({ data: { task: res.data } }),
      command: "tasks.projects.remove",
    });
    hint(`Task ${taskGid} removed from project ${projectGid}`);
  }),
});
