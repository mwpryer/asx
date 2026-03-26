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

export const addCommand = buildCommand({
  docs: { brief: "Add a follower to a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
        { brief: "User GID", placeholder: "user-gid", parse: String },
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
    userGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);
    v.parse(s.gid("user-gid"), userGid);

    const path = `/tasks/${taskGid}/addFollowers`;
    const body = { followers: [userGid] };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.followers.add", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    await client.request({ method: "POST", path, body });

    this.process.stdout.write(
      formatJSON({ followers: {} }, { command: "tasks.followers.add" }) + "\n",
    );
    hint(`Follower ${userGid} added to task ${taskGid}`);
  }),
});
