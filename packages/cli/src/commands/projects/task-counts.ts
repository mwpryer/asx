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

export const taskCountsCommand = buildCommand({
  docs: { brief: "Get task counts for a project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
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
    projectGid: string,
  ) {
    v.parse(s.gid("project-gid"), projectGid);

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/projects/${projectGid}/task_counts`,
      optFields: parseFields(flags.fields, [
        "num_tasks",
        "num_incomplete_tasks",
        "num_completed_tasks",
      ]),
    });

    this.process.stdout.write(
      formatJSON(
        { task_counts: res.data },
        { command: "projects.task-counts" },
      ) + "\n",
    );
  }),
});
