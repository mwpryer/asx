import { buildCommand } from "@stricli/core";

import {
  AsanaClient,
  InputError,
  formatJSON,
  hint,
  resolvePat,
  sanitizeText,
  validateGid,
} from "@mwp13/asx-core";
import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  resolveLimit,
  dryRunFlag,
  fieldsFlag,
  jsonFlag,
  paginationFlags,
  paginationMeta,
  parseJsonInput,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
  type JsonFlag,
  type PaginationFlags,
} from "@/flags";

export const commentsCommand = buildCommand({
  docs: { brief: "List or add comments on a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      ...paginationFlags,
      text: {
        kind: "parsed",
        brief: "Comment text (triggers add mode)",
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
      PaginationFlags &
      DryRunFlag &
      JsonFlag & { text: string | undefined },
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    // Add mode: --text or --json provided
    if (flags.text || flags.json) {
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
        const text = sanitizeText(flags.text!, "text");
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
            { command: "tasks.comments", dry_run: true },
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
        formatJSON({ story: res.data }, { command: "tasks.comments" }) + "\n",
      );
      hint(`Comment added to task ${taskGid}`);
      return;
    }

    // List mode: no --text or --json
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request<Array<{ resource_subtype?: string }>>({
      path: `/tasks/${taskGid}/stories`,
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: flags.fields?.split(",") ?? [
        "text",
        "created_by.name",
        "created_at",
        "resource_subtype",
      ],
    });

    const comments = res.data.filter(
      (s) => s.resource_subtype === "comment_added",
    );

    this.process.stdout.write(
      formatJSON(
        { comments },
        { command: "tasks.comments", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
