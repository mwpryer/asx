import { buildCommand } from "@stricli/core";

import {
  AsanaClient,
  formatJSON,
  resolvePat,
  validateGid,
} from "@mwp13/asx-core";
import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  fieldsFlag,
  type AccountFlag,
  type FieldsFlag,
} from "@/flags";

export const listCommand = buildCommand({
  docs: { brief: "List tags on a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      account: accountFlag,
      fields: fieldsFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & FieldsFlag,
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request<{
      tags?: Array<Record<string, unknown>>;
    }>({
      path: `/tasks/${taskGid}`,
      optFields: flags.fields?.split(",") ?? ["tags.name"],
    });

    this.process.stdout.write(
      formatJSON(
        { tags: res.data.tags ?? [] },
        { command: "tasks.tags.list" },
      ) + "\n",
    );
  }),
});
