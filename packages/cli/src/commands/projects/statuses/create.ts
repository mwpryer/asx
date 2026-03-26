import { InputError, STATUS_COLOURS, hint, s } from "@mwp13/asx-core";
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
  docs: { brief: "Create a project status update" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
      ],
    },
    flags: {
      title: {
        kind: "parsed",
        brief: "Status title",
        parse: String,
        optional: true,
      },
      color: {
        kind: "parsed",
        brief:
          "Status colour (on_track, at_risk, off_track, on_hold, complete)",
        parse: String,
        optional: true,
      },
      text: {
        kind: "parsed",
        brief: "Status body text",
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
        title: string | undefined;
        color: string | undefined;
        text: string | undefined;
      },
    projectGid: string,
  ) {
    v.parse(s.gid("project-gid"), projectGid);

    const hasValueFlags =
      flags.title !== undefined ||
      flags.color !== undefined ||
      flags.text !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--title, --color, --text)",
        "Use either --json or individual flags, not both",
      );
    }

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      if (!flags.title) {
        throw new InputError(
          "INPUT_MISSING",
          "--title is required when not using --json",
          "Provide --title or use --json with a JSON object containing a title field",
        );
      }
      const title = v.parse(s.nonBlankText("title", 1024), flags.title);
      if (flags.color) v.parse(s.enumOf("color", STATUS_COLOURS), flags.color);
      const text = flags.text ? v.parse(s.text("text"), flags.text) : undefined;

      body = { title };
      if (flags.color) body["color"] = flags.color;
      if (text) body["text"] = text;
    }

    const path = `/projects/${projectGid}/project_statuses`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "projects.statuses.create",
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
          "title",
          "color",
          "text",
          "created_by.name",
          "created_at",
        ]),
      },
      format: (res) => ({ data: { status: res.data } }),
      command: "projects.statuses.create",
    });
    hint(`Status update created for project ${projectGid}`);
  }),
});
