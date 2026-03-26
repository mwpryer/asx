import {
  AsanaClient,
  SECTION_FIELDS,
  formatJSON,
  resolvePat,
  s,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

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

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/sections/${sectionGid}`,
      optFields: parseFields(flags.fields, [...SECTION_FIELDS]),
    });

    this.process.stdout.write(
      formatJSON({ section: res.data }, { command: "sections.get" }) + "\n",
    );
  }),
});
