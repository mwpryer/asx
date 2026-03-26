import { InputError, hint, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc, preview, exec } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  fieldsFlag,
  jsonFlag,
  parseFields,
  parseJsonInput,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
  type JsonFlag,
} from "@/flags";

export const updateCommand = buildCommand({
  docs: { brief: "Update a custom field definition" },
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
      name: {
        kind: "parsed",
        brief: "New custom field name",
        parse: String,
        optional: true,
      },
      description: {
        kind: "parsed",
        brief: "New custom field description",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      fields: fieldsFlag,
      dryRun: dryRunFlag,
      json: jsonFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag &
      FieldsFlag &
      DryRunFlag &
      JsonFlag & {
        name: string | undefined;
        description: string | undefined;
      },
    customFieldGid: string,
  ) {
    v.parse(s.gid("custom-field-gid"), customFieldGid);

    const hasValueFlags =
      flags.name !== undefined || flags.description !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --description)",
        "Use either --json or individual flags, not both",
      );
    }

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      const name =
        flags.name !== undefined
          ? v.parse(s.nonBlankText("name", 1024), flags.name)
          : undefined;
      const description =
        flags.description !== undefined
          ? v.parse(s.text("description"), flags.description)
          : undefined;

      body = {};
      if (name !== undefined) body["name"] = name;
      if (description !== undefined) body["description"] = description;

      if (Object.keys(body).length === 0) {
        throw new InputError(
          "INPUT_MISSING",
          "No update flags provided. Pass at least one of --name, --description, or use --json.",
        );
      }
    }

    const path = `/custom_fields/${customFieldGid}`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "custom-fields.update",
        method: "PUT",
        path,
        body,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "PUT",
        path,
        body,
        optFields: parseFields(flags.fields, [
          "gid",
          "name",
          "resource_subtype",
          "type",
          "description",
        ]),
      },
      format: (res) => ({ data: { custom_field: res.data } }),
      command: "custom-fields.update",
    });
    hint(`Custom field ${customFieldGid} updated`);
  }),
});
