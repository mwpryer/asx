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
  docs: { brief: "Add a dependency to a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
        {
          brief: "Dependency task GID",
          placeholder: "dependency-gid",
          parse: String,
        },
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
    depGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);
    v.parse(s.gid("dependency-gid"), depGid);

    const path = `/tasks/${taskGid}/addDependencies`;
    const body = { dependencies: [depGid] };

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.dependencies.add",
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
      format: (res) => ({ data: { dependencies: res.data } }),
      command: "tasks.dependencies.add",
    });
    hint(`Dependency ${depGid} added to task ${taskGid}`);
  }),
});
