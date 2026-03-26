import {
  AsanaClient,
  InputError,
  formatJSON,
  hint,
  resolvePat,
  sanitizeText,
  validateGid,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  fieldsFlag,
  jsonFlag,
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
    validateGid(customFieldGid, "custom-field-gid");

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
      const name = flags.name
        ? sanitizeText(flags.name, "name", 1024)
        : undefined;
      const description = flags.description
        ? sanitizeText(flags.description, "description")
        : undefined;

      body = {};
      if (name) body["name"] = name;
      if (description) body["description"] = description;

      if (Object.keys(body).length === 0) {
        throw new InputError(
          "INPUT_MISSING",
          "No update flags provided. Pass at least one of --name, --description, or use --json.",
        );
      }
    }

    const path = `/custom_fields/${customFieldGid}`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "PUT", path, body },
          { command: "custom-fields.update", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "PUT",
      path,
      body,
      optFields: flags.fields?.split(",") ?? [
        "gid",
        "name",
        "resource_subtype",
        "type",
        "description",
      ],
    });

    this.process.stdout.write(
      formatJSON(
        { custom_field: res.data },
        { command: "custom-fields.update" },
      ) + "\n",
    );
    hint(`Custom field ${customFieldGid} updated`);
  }),
});
