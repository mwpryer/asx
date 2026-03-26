import {
  AsanaClient,
  InputError,
  PALETTE_COLOURS,
  formatJSON,
  hint,
  resolveAuth,
  resolvePat,
  s,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

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
      if (!flags.name) {
        throw new InputError(
          "INPUT_MISSING",
          "--name is required when not using --json",
          "Provide --name or use --json with a JSON object containing a name field",
        );
      }
      const name = v.parse(s.nonBlankText("name", 1024), flags.name);
      const notes = flags.notes
        ? v.parse(s.text("notes"), flags.notes)
        : undefined;

      if (flags.color) v.parse(s.enumOf("color", PALETTE_COLOURS), flags.color);

      body = { name };
      if (flags.color) body["color"] = flags.color;
      if (notes) body["notes"] = notes;
    }

    if (flags.workspace) v.parse(s.gid("workspace"), flags.workspace);
    let workspace = flags.workspace;
    if (!workspace && !flags.dryRun) {
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

    const path = workspace
      ? `/workspaces/${workspace}/tags`
      : "/workspaces/{workspace_gid}/tags";

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tags.create", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "POST",
      path,
      body,
      optFields: parseFields(flags.fields, ["name", "gid", "permalink_url"]),
    });

    this.process.stdout.write(
      formatJSON({ tag: res.data }, { command: "tags.create" }) + "\n",
    );
    hint(`Tag created: ${(res.data as Record<string, unknown>)?.["gid"]}`);
  }),
});
