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
  docs: { brief: "Get custom field definition details" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Custom field GID",
          placeholder: "custom-field-gid",
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
    customFieldGid: string,
  ) {
    v.parse(s.gid("custom-field-gid"), customFieldGid);

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path: `/custom_fields/${customFieldGid}`,
        optFields: parseFields(flags.fields, [
          "name",
          "resource_subtype",
          "type",
          "description",
          "format",
          "enum_options",
          "enum_options.name",
          "enum_options.enabled",
          "enum_options.color",
          "precision",
          "is_formula_field",
        ]),
      },
      format: (res) => ({ data: { custom_field: res.data } }),
      command: "custom-fields.get",
    });
  }),
});
