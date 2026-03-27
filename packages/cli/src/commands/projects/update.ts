import { InputError, PALETTE_COLOURS, s } from "@mwp13/asx-core";
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
  docs: { brief: "Update an existing project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
      ],
    },
    flags: {
      name: {
        kind: "parsed",
        brief: "New project name",
        parse: String,
        optional: true,
      },
      notes: {
        kind: "parsed",
        brief: "Project description (replaces existing)",
        parse: String,
        optional: true,
      },
      color: {
        kind: "parsed",
        brief: "Project colour",
        parse: String,
        optional: true,
      },
      dueOn: {
        kind: "parsed",
        brief: "Due date (YYYY-MM-DD)",
        parse: String,
        optional: true,
      },
      startOn: {
        kind: "parsed",
        brief: "Start date (YYYY-MM-DD)",
        parse: String,
        optional: true,
      },
      archive: {
        kind: "boolean",
        brief: "Archive the project",
        default: false,
      },
      unarchive: {
        kind: "boolean",
        brief: "Unarchive the project",
        default: false,
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
        notes: string | undefined;
        color: string | undefined;
        dueOn: string | undefined;
        startOn: string | undefined;
        archive: boolean;
        unarchive: boolean;
      },
    projectGid: string,
  ) {
    v.parse(s.gid("project-gid"), projectGid);

    if (flags.archive && flags.unarchive) {
      throw new InputError(
        "INPUT_INVALID",
        "--archive and --unarchive are mutually exclusive",
        "Use either --archive or --unarchive, not both",
      );
    }

    const hasValueFlags =
      flags.name !== undefined ||
      flags.notes !== undefined ||
      flags.color !== undefined ||
      flags.dueOn !== undefined ||
      flags.startOn !== undefined ||
      flags.archive ||
      flags.unarchive;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --notes, --color, --due-on, --start-on, --archive, --unarchive)",
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
      if (flags.dueOn !== undefined) v.parse(s.date("due-on"), flags.dueOn);
      if (flags.startOn !== undefined)
        v.parse(s.date("start-on"), flags.startOn);

      body = {};
      if (name !== undefined) body["name"] = name;
      if (notes !== undefined) body["notes"] = notes;
      if (flags.color !== undefined) body["color"] = flags.color;
      if (flags.dueOn !== undefined) body["due_on"] = flags.dueOn;
      if (flags.startOn !== undefined) body["start_on"] = flags.startOn;
      if (flags.archive) body["archived"] = true;
      if (flags.unarchive) body["archived"] = false;

      if (Object.keys(body).length === 0) {
        throw new InputError(
          "INPUT_MISSING",
          "No update flags provided. Pass at least one of --name, --notes, --color, --due-on, --start-on, --archive, --unarchive, or use --json.",
        );
      }
    }

    const path = `/projects/${projectGid}`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "projects.update",
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
          "name",
          "gid",
          "archived",
          "color",
          "notes",
          "due_on",
          "start_on",
          "permalink_url",
        ]),
      },
      format: (res) => ({ data: { project: res.data } }),
      command: "projects.update",
    });
  }),
});
