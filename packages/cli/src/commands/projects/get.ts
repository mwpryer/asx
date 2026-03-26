import {
  AsanaClient,
  formatJSON,
  resolvePat,
  validateGid,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  fieldsFlag,
  parseFields,
  type AccountFlag,
  type FieldsFlag,
} from "@/flags";

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
      fields: fieldsFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & FieldsFlag,
    projectGid: string,
  ) {
    validateGid(projectGid, "project-gid");

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/projects/${projectGid}`,
      optFields: parseFields(flags.fields, [
        "name",
        "archived",
        "color",
        "notes",
        "owner.name",
        "workspace.name",
        "team.name",
        "due_on",
        "start_on",
        "default_view",
        "privacy_setting",
        "permalink_url",
        "created_at",
        "modified_at",
      ]),
    });

    this.process.stdout.write(
      formatJSON({ project: res.data }, { command: "projects.get" }) + "\n",
    );
  }),
});
