import { AsanaClient, formatJSON, hint, resolvePat, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc } from "@/command";
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
      this.process.stdout.write(
        formatJSON(
          { method: "DELETE", path },
          { command: "tasks.comments.remove", dry_run: true },
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
      formatJSON(
        { deleted: true, gid: storyGid },
        { command: "tasks.comments.remove" },
      ) + "\n",
    );
    hint(`Comment ${storyGid} removed`);
  }),
});
