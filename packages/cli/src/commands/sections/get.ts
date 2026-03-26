import { SECTION_FIELDS, s } from "@mwp13/asx-core";
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
  docs: { brief: "Get section details" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Section GID", placeholder: "section-gid", parse: String },
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
    sectionGid: string,
  ) {
    v.parse(s.gid("section-gid"), sectionGid);

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path: `/sections/${sectionGid}`,
        optFields: parseFields(flags.fields, [...SECTION_FIELDS]),
      },
      format: (res) => ({ data: { section: res.data } }),
      command: "sections.get",
    });
  }),
});
