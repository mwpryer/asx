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
    validateGid(taskGid, "task-gid");

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
      if (!flags.text) {
        throw new InputError(
          "INPUT_MISSING",
          "--text is required when not using --json",
          "Provide --text or use --json with a JSON object",
        );
      }
      const text = sanitizeText(flags.text, "text");
      if (!text) {
        throw new InputError(
          "INPUT_INVALID",
          "Invalid text: must not be blank",
          "Provide non-empty --text",
        );
      }
      body = { text };
    }

    const path = `/tasks/${taskGid}/stories`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.comments.add", dry_run: true },
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
      optFields: parseFields(flags.fields, [
        "text",
        "created_by.name",
        "created_at",
      ]),
    });
    this.process.stdout.write(
      formatJSON({ story: res.data }, { command: "tasks.comments.add" }) + "\n",
    );
    hint(`Comment added to task ${taskGid}`);
  }),
});
