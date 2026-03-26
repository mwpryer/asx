import { TEAM_FIELDS, s } from "@mwp13/asx-core";
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
    v.parse(s.gid("team-gid"), teamGid);

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path: `/teams/${teamGid}`,
        optFields: parseFields(flags.fields, [...TEAM_FIELDS]),
      },
      format: (res) => ({ data: { team: res.data } }),
      command: "teams.get",
    });
  }),
});
