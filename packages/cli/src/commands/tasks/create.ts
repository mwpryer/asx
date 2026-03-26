import { InputError, resolveAuth, s } from "@mwp13/asx-core";
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
  docs: { brief: "Create a new task" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      name: {
        kind: "parsed",
        brief: "Task name",
        parse: String,
        optional: true,
      },
      project: {
        kind: "parsed",
        brief: "Project GID",
        parse: String,
        optional: true,
      },
      assignee: {
        kind: "parsed",
        brief: "Assignee GID or 'me'",
        parse: String,
        optional: true,
      },
      due: {
        kind: "parsed",
        brief: "Due date (YYYY-MM-DD)",
        parse: String,
        optional: true,
      },
      notes: {
        kind: "parsed",
        brief: "Task description",
        parse: String,
        optional: true,
      },
      parent: {
        kind: "parsed",
        brief: "Parent task GID (create as subtask)",
        parse: String,
        optional: true,
      },
      startOn: {
        kind: "parsed",
        brief: "Start date (YYYY-MM-DD)",
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
        project: string | undefined;
        assignee: string | undefined;
        due: string | undefined;
        notes: string | undefined;
        parent: string | undefined;
        startOn: string | undefined;
      },
  ) {
    const hasValueFlags =
      flags.name !== undefined ||
      flags.project !== undefined ||
      flags.assignee !== undefined ||
      flags.due !== undefined ||
      flags.notes !== undefined ||
      flags.parent !== undefined ||
      flags.startOn !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --project, --assignee, --due, --notes, --parent, --start-on)",
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
      if (flags.project) v.parse(s.gid("project"), flags.project);
      if (flags.parent) v.parse(s.gid("parent"), flags.parent);
      if (flags.assignee) v.parse(s.assignee(), flags.assignee);
      if (flags.due) v.parse(s.date("due"), flags.due);
      if (flags.startOn) v.parse(s.date("start-on"), flags.startOn);

      if (flags.parent && flags.project) {
        throw new InputError(
          "INPUT_INVALID",
          "--parent and --project cannot be used together",
          "Pass one or the other. To add a subtask to a project, create it with --parent then use `asx tasks projects add`",
        );
      }

      body = { name };
      if (flags.parent) {
        body["parent"] = flags.parent;
      } else if (flags.project) {
        body["projects"] = [flags.project];
      } else if (!flags.dryRun) {
        const auth = resolveAuth({ account: flags.account });
        if (auth.workspaceGid) {
          body["workspace"] = auth.workspaceGid;
        } else {
          throw new InputError(
            "INPUT_MISSING",
            "--project or --parent is required when no default workspace is configured",
            "Pass --project, --parent, or set a default workspace with `asx auth add <alias> --workspace <gid>`",
          );
        }
      }
      if (flags.assignee) body["assignee"] = flags.assignee;
      if (flags.due) body["due_on"] = flags.due;
      if (flags.startOn) body["start_on"] = flags.startOn;
      if (notes) body["notes"] = notes;
    }

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.create",
        method: "POST",
        path: "/tasks",
        body,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "POST",
        path: "/tasks",
        body,
        optFields: parseFields(flags.fields, ["name", "gid", "permalink_url"]),
      },
      format: (res) => ({ data: { task: res.data } }),
      command: "tasks.create",
    });
  }),
});
