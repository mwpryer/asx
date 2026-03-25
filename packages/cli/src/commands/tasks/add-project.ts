import { buildCommand } from "@stricli/core";

import {
  AsanaClient,
  InputError,
  formatJSON,
  hint,
  resolvePat,
  validateGid,
} from "@mwp13/asx-core";
import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  type AccountFlag,
  type DryRunFlag,
} from "@/flags";

export const addProjectCommand = buildCommand({
  docs: { brief: "Add a task to a project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      project: {
        kind: "parsed",
        brief: "Project GID",
        parse: String,
        optional: true,
      },
      section: {
        kind: "parsed",
        brief: "Section GID within the project",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      dryRun: dryRunFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag &
      DryRunFlag & {
        project: string | undefined;
        section: string | undefined;
      },
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    if (!flags.project) {
      throw new InputError(
        "INPUT_MISSING",
        "--project is required",
        "Pass --project <gid>",
      );
    }
    validateGid(flags.project, "project");
    if (flags.section) validateGid(flags.section, "section");

    const path = `/tasks/${taskGid}/addProject`;
    const body = {
      project: flags.project,
      ...(flags.section && { section: flags.section }),
    };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.add-project", dry_run: true },
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
    });

    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.add-project" }) + "\n",
    );
    hint(`Task ${taskGid} added to project ${flags.project}`);
  }),
});
