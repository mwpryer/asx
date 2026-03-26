import { AsanaClient, formatJSON, resolvePat, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  fieldsFlag,
  parseFields,
  type AccountFlag,
  type FieldsFlag,
} from "@/flags";

export const listCommand = buildCommand({
  docs: { brief: "List projects a task belongs to" },
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
    v.parse(s.gid("task-gid"), taskGid);

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request<{
      projects?: Array<Record<string, unknown>>;
    }>({
      path: `/tasks/${taskGid}`,
      optFields: parseFields(flags.fields, ["projects.name"]),
    });

    this.process.stdout.write(
      formatJSON(
        { projects: res.data.projects ?? [] },
        { command: "tasks.projects.list" },
      ) + "\n",
    );
  }),
});
