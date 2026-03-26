import {
  AsanaClient,
  InputError,
  formatJSON,
  hint,
  resolveAuth,
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
  parseFields,
  parseJsonInput,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
  type JsonFlag,
} from "@/flags";

export const createCommand = buildCommand({
  docs: { brief: "Create a custom field definition" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      name: {
        kind: "parsed",
        brief: "Custom field name",
        parse: String,
        optional: true,
      },
      resourceSubtype: {
        kind: "parsed",
        brief: "Field type (text, number, enum)",
        parse: String,
        optional: true,
      },
      workspace: {
        kind: "parsed",
        brief: "Workspace GID (defaults to stored account workspace)",
        parse: String,
        optional: true,
      },
      description: {
        kind: "parsed",
        brief: "Custom field description",
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
        resourceSubtype: string | undefined;
        workspace: string | undefined;
        description: string | undefined;
      },
  ) {
    const hasValueFlags =
      flags.name !== undefined ||
      flags.resourceSubtype !== undefined ||
      flags.description !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --resource-subtype, --description)",
        "Use either --json or individual flags, not both",
      );
    }

    if (flags.workspace) validateGid(flags.workspace, "workspace");

    let body: Record<string, unknown>;
    let workspace: string | undefined;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      if (!flags.name) {
        throw new InputError(
          "INPUT_MISSING",
          "--name is required when not using --json",
          "Provide --name or use --json with a JSON object containing a name field",
        );
      }
      if (!flags.resourceSubtype) {
        throw new InputError(
          "INPUT_MISSING",
          "--resource-subtype is required when not using --json",
          "Provide --resource-subtype (text, number, or enum)",
        );
      }
      const validSubtypes = ["text", "number", "enum"];
      if (!validSubtypes.includes(flags.resourceSubtype)) {
        throw new InputError(
          "INPUT_INVALID",
          `Invalid resource-subtype: ${flags.resourceSubtype}`,
          `Must be one of: ${validSubtypes.join(", ")}`,
        );
      }
      const name = sanitizeText(flags.name, "name", 1024);
      if (!name) {
        throw new InputError(
          "INPUT_INVALID",
          "Invalid name: must not be blank",
          "Provide a non-empty --name",
        );
      }
      const description = flags.description
        ? sanitizeText(flags.description, "description")
        : undefined;

      body = { name, resource_subtype: flags.resourceSubtype };
      if (description) body["description"] = description;
    }

    if (!flags.dryRun) {
      const auth = resolveAuth({ account: flags.account });
      workspace = flags.workspace ?? auth.workspaceGid;
      if (!workspace) {
        throw new InputError(
          "INPUT_MISSING",
          "No workspace configured",
          "Pass --workspace or set a default with `asx auth add <alias> --workspace <gid>`",
        );
      }
    } else {
      workspace = flags.workspace ?? "WORKSPACE_GID";
    }

    const path = `/workspaces/${workspace}/custom_fields`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "custom-fields.create", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const auth = resolveAuth({ account: flags.account });
    const client = new AsanaClient({ pat: auth.pat });
    const res = await client.request({
      method: "POST",
      path,
      body,
      optFields: parseFields(flags.fields, [
        "gid",
        "name",
        "resource_subtype",
        "type",
      ]),
    });

    this.process.stdout.write(
      formatJSON(
        { custom_field: res.data },
        { command: "custom-fields.create" },
      ) + "\n",
    );
    hint("Custom field created");
  }),
});
