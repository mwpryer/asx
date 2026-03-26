import { s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc, exec } from "@/command";
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
    v.parse(s.gid("workspace-gid"), workspaceGid);

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path: `/workspaces/${workspaceGid}`,
        optFields: parseFields(flags.fields, [
          "name",
          "is_organization",
          "email_domains",
        ]),
      },
      format: (res) => ({ data: { workspace: res.data } }),
      command: "workspaces.get",
    });
  }),
});
