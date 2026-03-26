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
  docs: { brief: "Update an existing tag" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [{ brief: "Tag GID", placeholder: "tag-gid", parse: String }],
    },
    flags: {
      name: {
        kind: "parsed",
        brief: "New tag name",
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
        brief: "Tag description (replaces existing)",
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
      },
    tagGid: string,
  ) {
    validateGid(tagGid, "tag-gid");

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
      const name = flags.name
        ? sanitizeText(flags.name, "name", 1024)
        : undefined;
      const notes = flags.notes
        ? sanitizeText(flags.notes, "notes")
        : undefined;

      body = {};
      if (name) body["name"] = name;
      if (flags.color) body["color"] = flags.color;
      if (notes) body["notes"] = notes;

      if (Object.keys(body).length === 0) {
        throw new InputError(
          "INPUT_MISSING",
          "No update flags provided. Pass at least one of --name, --color, --notes, or use --json.",
        );
      }
    }

    const path = `/tags/${tagGid}`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "PUT", path, body },
          { command: "tags.update", dry_run: true },
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
        "name",
        "gid",
        "color",
        "notes",
        "permalink_url",
      ],
    });

    this.process.stdout.write(
      formatJSON({ tag: res.data }, { command: "tags.update" }) + "\n",
    );
    hint(`Tag ${tagGid} updated`);
  }),
});
