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
  docs: { brief: "Remove a comment from a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Story GID", placeholder: "story-gid", parse: String },
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
    storyGid: string,
  ) {
    v.parse(s.gid("story-gid"), storyGid);

    const path = `/stories/${storyGid}`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.comments.remove",
        method: "DELETE",
        path,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "DELETE",
        path,
      },
      format: () => ({ data: { deleted: true, gid: storyGid } }),
      command: "tasks.comments.remove",
    });
    hint(`Comment ${storyGid} removed`);
  }),
});
