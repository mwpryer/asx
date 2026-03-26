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
  docs: { brief: "Add a tag to a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
        { brief: "Tag GID", placeholder: "tag-gid", parse: String },
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
    tagGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);
    v.parse(s.gid("tag-gid"), tagGid);

    const path = `/tasks/${taskGid}/addTag`;
    const body = { tag: tagGid };

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.tags.add",
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
      command: "tasks.tags.add",
    });
    hint(`Tag ${tagGid} added to task ${taskGid}`);
  }),
});
