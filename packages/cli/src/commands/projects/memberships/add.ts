import {
  AsanaClient,
  formatJSON,
  hint,
  resolvePat,
  validateGid,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  type AccountFlag,
  type DryRunFlag,
} from "@/flags";

export const addCommand = buildCommand({
  docs: { brief: "Add a member to a project" },
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
    validateGid(projectGid, "project-gid");
    validateGid(userGid, "user-gid");

    const path = `/projects/${projectGid}/addMembers`;
    const body = { members: [userGid] };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "projects.memberships.add", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    await client.request({ method: "POST", path, body });

    this.process.stdout.write(
      formatJSON({ members: {} }, { command: "projects.memberships.add" }) +
        "\n",
    );
    hint(`Member ${userGid} added to project ${projectGid}`);
  }),
});
