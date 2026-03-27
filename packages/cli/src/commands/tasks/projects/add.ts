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
    v.parse(s.gid("task-gid"), taskGid);
    v.parse(s.gid("project-gid"), projectGid);
    if (flags.section !== undefined) v.parse(s.gid("section"), flags.section);

    const path = `/tasks/${taskGid}/addProject`;
    const body: Record<string, string> = { project: projectGid };
    if (flags.section !== undefined) body["section"] = flags.section;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.projects.add",
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
      command: "tasks.projects.add",
    });
    hint(`Task ${taskGid} added to project ${projectGid}`);
  }),
});
