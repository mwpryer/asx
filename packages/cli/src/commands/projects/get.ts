import { buildCommand } from "@stricli/core";
import { AsanaClient, formatJSON, resolvePat } from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import { accountFlag, type AccountFlag } from "../../flags.js";

export const getCommand = buildCommand({
  docs: { brief: "Get project details" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
      ],
    },
    flags: {
      account: accountFlag,
    },
  },
  func: async function (
    this: AsxCliContext,
    flags: AccountFlag,
    projectGid: string,
  ) {
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/projects/${projectGid}`,
      optFields: [
        "name",
        "archived",
        "color",
        "notes",
        "owner.name",
        "workspace.name",
        "team.name",
        "created_at",
        "modified_at",
      ],
    });

    this.process.stdout.write(
      formatJSON({ project: res.data }, { command: "projects.get" }) + "\n",
    );
  },
});
