import { buildCommand } from "@stricli/core";
import { AsanaClient, formatJSON, resolvePat } from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import { accountFlag, type AccountFlag } from "../../flags.js";

export const createCommand = buildCommand({
  docs: { brief: "Create a new task" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      name: { kind: "parsed", brief: "Task name", parse: String },
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
      account: accountFlag,
    },
  },
  func: async function (
    this: AsxCliContext,
    flags: AccountFlag & {
      name: string;
      project: string | undefined;
      assignee: string | undefined;
      due: string | undefined;
      notes: string | undefined;
    },
  ) {
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const body: Record<string, unknown> = { name: flags.name };
    if (flags.project) body["projects"] = [flags.project];
    if (flags.assignee) body["assignee"] = flags.assignee;
    if (flags.due) body["due_on"] = flags.due;
    if (flags.notes) body["notes"] = flags.notes;

    const res = await client.request({
      method: "POST",
      path: "/tasks",
      body,
      optFields: ["name", "gid", "permalink_url"],
    });

    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.create" }) + "\n",
    );
  },
});
