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
  resolveLimit,
  dryRunFlag,
  fieldsFlag,
  paginationFlags,
  paginationMeta,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
  type PaginationFlags,
} from "@/flags";

export const dependenciesCommand = buildCommand({
  docs: { brief: "List, add, or remove task dependencies" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      ...paginationFlags,
      add: {
        kind: "parsed",
        brief: "Dependency task GID to add",
        parse: String,
        optional: true,
      },
      remove: {
        kind: "parsed",
        brief: "Dependency task GID to remove",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      fields: fieldsFlag,
      dryRun: dryRunFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag &
      FieldsFlag &
      PaginationFlags &
      DryRunFlag & {
        add: string | undefined;
        remove: string | undefined;
      },
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    if (flags.add && flags.remove) {
      throw new InputError(
        "INPUT_INVALID",
        "Cannot specify both --add and --remove",
        "Use exactly one of --add or --remove",
      );
    }

    if (flags.add) {
      validateGid(flags.add, "add");

      const path = `/tasks/${taskGid}/addDependencies`;
      const body = { dependencies: [flags.add] };

      if (flags.dryRun) {
        this.process.stdout.write(
          formatJSON(
            { method: "POST", path, body },
            { command: "tasks.dependencies", dry_run: true },
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
        formatJSON(
          { dependencies: res.data },
          { command: "tasks.dependencies" },
        ) + "\n",
      );
      hint(`Dependency ${flags.add} added to task ${taskGid}`);
      return;
    }

    if (flags.remove) {
      validateGid(flags.remove, "remove");

      const path = `/tasks/${taskGid}/removeDependencies`;
      const body = { dependencies: [flags.remove] };

      if (flags.dryRun) {
        this.process.stdout.write(
          formatJSON(
            { method: "POST", path, body },
            { command: "tasks.dependencies", dry_run: true },
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
        formatJSON(
          { dependencies: res.data },
          { command: "tasks.dependencies" },
        ) + "\n",
      );
      hint(`Dependency ${flags.remove} removed from task ${taskGid}`);
      return;
    }

    // List dependencies
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/tasks/${taskGid}/dependencies`,
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: flags.fields?.split(",") ?? [
        "name",
        "completed",
        "assignee.name",
        "due_on",
      ],
    });

    this.process.stdout.write(
      formatJSON(
        { dependencies: res.data },
        { command: "tasks.dependencies", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
