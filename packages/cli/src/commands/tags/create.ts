import {
  InputError,
  PALETTE_COLOURS,
  hint,
  resolveAuth,
  s,
} from "@mwp13/asx-core";
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
  docs: { brief: "Create a new tag" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      name: {
        kind: "parsed",
        brief: "Tag name",
        parse: String,
        optional: true,
      },
      color: {
        kind: "parsed",
        brief: "Tag colour",
        parse: String,
        optional: true,
      },
      notes: {
        kind: "parsed",
        brief: "Tag description",
        parse: String,
        optional: true,
      },
      workspace: {
        kind: "parsed",
        brief: "Workspace GID (defaults to stored account workspace)",
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
        color: string | undefined;
        notes: string | undefined;
        workspace: string | undefined;
      },
  ) {
    const hasValueFlags =
      flags.name !== undefined ||
      flags.color !== undefined ||
      flags.notes !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --color, --notes)",
        "Use either --json or individual flags, not both",
      );
    }

    let body: Record<string, unknown>;

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
      const name = v.parse(s.nonBlankText("name", 1024), flags.name);
      const notes =
        flags.notes !== undefined
          ? v.parse(s.text("notes"), flags.notes)
          : undefined;

      if (flags.color !== undefined)
        v.parse(s.enumOf("color", PALETTE_COLOURS), flags.color);

      body = { name };
      if (flags.color !== undefined) body["color"] = flags.color;
      if (notes !== undefined) body["notes"] = notes;
    }

    if (flags.workspace !== undefined)
      v.parse(s.gid("workspace"), flags.workspace);
    let workspace = flags.workspace;
    if (workspace === undefined && !flags.dryRun) {
      const auth = resolveAuth({ account: flags.account });
      workspace = auth.workspaceGid;
      if (!workspace) {
        throw new InputError(
          "INPUT_MISSING",
          "No workspace configured",
          "Pass --workspace or set a default with `asx auth add <alias> --workspace <gid>`",
        );
      }
    }

    const path =
      workspace !== undefined
        ? `/workspaces/${workspace}/tags`
        : "/workspaces/{workspace_gid}/tags";

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tags.create",
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
        optFields: parseFields(flags.fields, ["name", "gid", "permalink_url"]),
      },
      format: (res) => ({ data: { tag: res.data } }),
      command: "tags.create",
    });
    hint("Tag created");
  }),
});
