import {
  AsanaClient,
  TEAM_FIELDS,
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
  docs: { brief: "Get team details" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Team GID", placeholder: "team-gid", parse: String },
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
    teamGid: string,
  ) {
    validateGid(teamGid, "team-gid");

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/teams/${teamGid}`,
      optFields: parseFields(flags.fields, [...TEAM_FIELDS]),
    });

    this.process.stdout.write(
      formatJSON({ team: res.data }, { command: "teams.get" }) + "\n",
    );
  }),
});
