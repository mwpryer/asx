import { InputError, PALETTE_COLOURS, hint, s } from "@mwp13/asx-core";
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
    v.parse(s.gid("tag-gid"), tagGid);

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
      const name =
        flags.name !== undefined
          ? v.parse(s.nonBlankText("name", 1024), flags.name)
          : undefined;
      const notes =
        flags.notes !== undefined
          ? v.parse(s.text("notes"), flags.notes)
          : undefined;

      if (flags.color !== undefined)
        v.parse(s.enumOf("color", PALETTE_COLOURS), flags.color);

      body = {};
      if (name !== undefined) body["name"] = name;
      if (flags.color !== undefined) body["color"] = flags.color;
      if (notes !== undefined) body["notes"] = notes;

      if (Object.keys(body).length === 0) {
        throw new InputError(
          "INPUT_MISSING",
          "No update flags provided. Pass at least one of --name, --color, --notes, or use --json.",
        );
      }
    }

    const path = `/tags/${tagGid}`;

    if (flags.dryRun) {
      preview({ ctx: this, command: "tags.update", method: "PUT", path, body });
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
          "name",
          "gid",
          "color",
          "notes",
          "permalink_url",
        ]),
      },
      format: (res) => ({ data: { tag: res.data } }),
      command: "tags.update",
    });
    hint(`Tag ${tagGid} updated`);
  }),
});
