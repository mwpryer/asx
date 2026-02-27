import { buildCommand } from "@stricli/core";
import {
  AsanaClient,
  InputError,
  formatJSON,
  resolvePat,
} from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import { accountFlag, type AccountFlag } from "../../flags.js";

export const updateCommand = buildCommand({
  docs: { brief: "Update an existing task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      name: {
        kind: "parsed",
        brief: "New task name",
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
        brief: "Task description (replaces existing)",
        parse: String,
        optional: true,
      },
      account: accountFlag,
    },
  },
  func: async function (
    this: AsxCliContext,
    flags: AccountFlag & {
      name: string | undefined;
      assignee: string | undefined;
      due: string | undefined;
      notes: string | undefined;
    },
    taskGid: string,
  ) {
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const body: Record<string, unknown> = {};
    if (flags.name) body["name"] = flags.name;
    if (flags.assignee) body["assignee"] = flags.assignee;
    if (flags.due) body["due_on"] = flags.due;
    if (flags.notes) body["notes"] = flags.notes;

    if (Object.keys(body).length === 0) {
      throw new InputError(
        "INPUT_MISSING",
        "No update flags provided. Pass at least one of --name, --assignee, --due, or --notes.",
      );
    }

    const res = await client.request({
      method: "PUT",
      path: `/tasks/${taskGid}`,
      body,
      optFields: ["name", "gid", "completed", "assignee.name", "due_on"],
    });

    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.update" }) + "\n",
    );
  },
});
