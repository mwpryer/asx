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
  docs: { brief: "Get workspace details" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Workspace GID",
          placeholder: "workspace-gid",
          parse: String,
        },
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
    workspaceGid: string,
  ) {
    validateGid(workspaceGid, "workspace-gid");

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/workspaces/${workspaceGid}`,
      optFields: parseFields(flags.fields, [
        "name",
        "is_organization",
        "email_domains",
      ]),
    });

    this.process.stdout.write(
      formatJSON({ workspace: res.data }, { command: "workspaces.get" }) + "\n",
    );
  }),
});
