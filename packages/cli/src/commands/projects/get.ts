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
    v.parse(s.gid("project-gid"), projectGid);

    await exec({
      ctx: this,
      account: flags.account,
      request: {
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
      },
      format: (res) => ({ data: { project: res.data } }),
      command: "projects.get",
    });
  }),
});
