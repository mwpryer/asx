import { buildCommand } from "@stricli/core";
import {
  AsanaClient,
  InputError,
  formatJSON,
  logger,
  resolvePat,
  sanitizeText,
  validateGid,
} from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
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
} from "../../flags.js";

export const commentCommand = buildCommand({
  docs: { brief: "Add a comment to a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
        { brief: "Comment text", placeholder: "text", parse: String },
      ],
    },
    flags: {
      account: accountFlag,
      fields: fieldsFlag,
      dryRun: dryRunFlag,
      json: jsonFlag,
    },
  },
  func: async function (
    this: AsxCliContext,
    flags: AccountFlag & FieldsFlag & DryRunFlag & JsonFlag,
    taskGid: string,
    text: string,
  ) {
    validateGid(taskGid, "task-gid");

    if (flags.json && text) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with the text positional argument",
        "Use either --json or the text argument, not both",
      );
    }

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      sanitizeText(text, "text");
      body = { text };
    }

    const path = `/tasks/${taskGid}/stories`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.comment", dry_run: true },
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
      optFields: flags.fields?.split(",") ?? [
        "text",
        "created_by.name",
        "created_at",
      ],
    });
    this.process.stdout.write(
      formatJSON({ story: res.data }, { command: "tasks.comment" }) + "\n",
    );
    logger.hint(`Comment added to task ${taskGid}`);
  },
});
