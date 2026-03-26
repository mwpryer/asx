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
    v.parse(s.gid("task-gid"), taskGid);

    const path = `/tasks/${taskGid}`;

    if (flags.dryRun) {
      preview({ ctx: this, command: "tasks.delete", method: "DELETE", path });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "DELETE",
        path,
      },
      format: () => ({ data: { deleted: true, gid: taskGid } }),
      command: "tasks.delete",
    });
    hint(`Task ${taskGid} deleted`);
  }),
});
