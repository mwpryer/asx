import { buildCommand } from "@stricli/core";

import {
  AsanaClient,
  InputError,
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

export const followersCommand = buildCommand({
  docs: { brief: "Add or remove a task follower" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      add: {
        kind: "parsed",
        brief: "User GID to add as follower",
        parse: String,
        optional: true,
      },
      remove: {
        kind: "parsed",
        brief: "User GID to remove as follower",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      dryRun: dryRunFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag &
      DryRunFlag & {
        add: string | undefined;
        remove: string | undefined;
      },
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    if (flags.add && flags.remove) {
      throw new InputError(
        "INPUT_INVALID",
        "Cannot specify both --add and --remove",
        "Use exactly one of --add or --remove",
      );
    }
    if (!flags.add && !flags.remove) {
      throw new InputError(
        "INPUT_MISSING",
        "One of --add or --remove is required",
        "Pass --add <user-gid> or --remove <user-gid>",
      );
    }

    if (flags.add) {
      validateGid(flags.add, "add");

      const path = `/tasks/${taskGid}/addFollowers`;
      const body = { followers: [flags.add] };

      if (flags.dryRun) {
        this.process.stdout.write(
          formatJSON(
            { method: "POST", path, body },
            { command: "tasks.followers", dry_run: true },
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
        formatJSON({ task: res.data }, { command: "tasks.followers" }) + "\n",
      );
      hint(`Follower ${flags.add} added to task ${taskGid}`);
      return;
    }

    // Remove follower
    validateGid(flags.remove!, "remove");

    const path = `/tasks/${taskGid}/removeFollowers`;
    const body = { followers: [flags.remove!] };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.followers", dry_run: true },
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
      formatJSON({ task: res.data }, { command: "tasks.followers" }) + "\n",
    );
    hint(`Follower ${flags.remove} removed from task ${taskGid}`);
  }),
});
