import {
  AsanaClient,
  TAG_FIELDS,
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
  docs: { brief: "Get tag details" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [{ brief: "Tag GID", placeholder: "tag-gid", parse: String }],
    },
    flags: {
      account: accountFlag,
      fields: fieldsFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & FieldsFlag,
    tagGid: string,
  ) {
    v.parse(s.gid("tag-gid"), tagGid);

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/tags/${tagGid}`,
      optFields: parseFields(flags.fields, [...TAG_FIELDS]),
    });

    this.process.stdout.write(
      formatJSON({ tag: res.data }, { command: "tags.get" }) + "\n",
    );
  }),
});
