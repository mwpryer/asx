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
  docs: { brief: "Remove a member from a project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
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
    projectGid: string,
    userGid: string,
  ) {
    v.parse(s.gid("project-gid"), projectGid);
    v.parse(s.gid("user-gid"), userGid);

    const path = `/projects/${projectGid}/removeMembers`;
    const body = { members: [userGid] };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "projects.memberships.remove", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    await client.request({ method: "POST", path, body });

    this.process.stdout.write(
      formatJSON({ members: {} }, { command: "projects.memberships.remove" }) +
        "\n",
    );
    hint(`Member ${userGid} removed from project ${projectGid}`);
  }),
});
