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
  docs: { brief: "Get user details" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "User GID", placeholder: "user-gid", parse: String },
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
    userGid: string,
  ) {
    validateGid(userGid, "user-gid");

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/users/${userGid}`,
      optFields: parseFields(flags.fields, [
        "name",
        "email",
        "photo",
        "workspaces.name",
      ]),
    });

    this.process.stdout.write(
      formatJSON({ user: res.data }, { command: "users.get" }) + "\n",
    );
  }),
});
