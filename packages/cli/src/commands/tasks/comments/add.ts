import { InputError, hint, s } from "@mwp13/asx-core";
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

export const addCommand = buildCommand({
  docs: { brief: "Add a comment to a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      text: {
        kind: "parsed",
        brief: "Comment text",
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
      JsonFlag & { text: string | undefined },
    taskGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);

    if (flags.json && flags.text) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with --text",
        "Use either --json or --text, not both",
      );
    }

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      if (flags.text === undefined) {
        throw new InputError(
          "INPUT_MISSING",
          "--text is required when not using --json",
          "Provide --text or use --json with a JSON object",
        );
      }
      const text = v.parse(s.nonBlankText("text"), flags.text);
      body = { text };
    }

    const path = `/tasks/${taskGid}/stories`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.comments.add",
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
          "text",
          "created_by.name",
          "created_at",
        ]),
      },
      format: (res) => ({ data: { story: res.data } }),
      command: "tasks.comments.add",
    });
    hint(`Comment added to task ${taskGid}`);
  }),
});
