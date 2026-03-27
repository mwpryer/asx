import { InputError, hint, resolveAuth, s } from "@mwp13/asx-core";
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

    if (flags.workspace !== undefined)
      v.parse(s.gid("workspace"), flags.workspace);

    let body: Record<string, unknown>;
    let workspace: string | undefined;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      if (flags.name === undefined) {
        throw new InputError(
          "INPUT_MISSING",
          "--name is required when not using --json",
          "Provide --name or use --json with a JSON object containing a name field",
        );
      }
      if (flags.resourceSubtype === undefined) {
        throw new InputError(
          "INPUT_MISSING",
          "--resource-subtype is required when not using --json",
          "Provide --resource-subtype (text, number, or enum)",
        );
      }
      v.parse(
        s.enumOf("resource-subtype", ["text", "number", "enum"]),
        flags.resourceSubtype,
      );
      const name = v.parse(s.nonBlankText("name", 1024), flags.name);
      const description =
        flags.description !== undefined
          ? v.parse(s.text("description"), flags.description)
          : undefined;

      body = { name, resource_subtype: flags.resourceSubtype };
      if (description !== undefined) body["description"] = description;
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
      preview({
        ctx: this,
        command: "custom-fields.create",
        method: "POST",
        path,
        body,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "POST",
        path,
        body,
        optFields: parseFields(flags.fields, [
          "gid",
          "name",
          "resource_subtype",
          "type",
        ]),
      },
      format: (res) => ({ data: { custom_field: res.data } }),
      command: "custom-fields.create",
    });
    hint("Custom field created");
  }),
});
