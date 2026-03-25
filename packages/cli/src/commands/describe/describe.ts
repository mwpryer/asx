import { buildCommand } from "@stricli/core";

import {
  formatJSON,
  TASK_FIELDS,
  PROJECT_FIELDS,
  WORKSPACE_FIELDS,
  SECTION_FIELDS,
  USER_FIELDS,
} from "@mwp13/asx-core";
import type { AsxCliContext } from "@/context";
import { COMMAND_SCHEMAS } from "@/commands/describe/schemas";

const RESOURCE_FIELDS: Record<string, readonly string[]> = {
  task: TASK_FIELDS,
  project: PROJECT_FIELDS,
  workspace: WORKSPACE_FIELDS,
  section: SECTION_FIELDS,
  user: USER_FIELDS,
};

export const describeCommand = buildCommand({
  docs: { brief: "Describe CLI commands and resource types" },
  parameters: {
    positional: {
      kind: "array",
      parameter: {
        brief: "Command name (e.g. tasks.create) or resource type (e.g. task)",
        parse: String,
      },
      minimum: 0,
      maximum: 1,
    },
  },
  func: async function (this: AsxCliContext, _flags: {}, ...args: string[]) {
    const target = args[0];

    if (!target) {
      const commands = Object.keys(COMMAND_SCHEMAS).sort();
      const resources = Object.keys(RESOURCE_FIELDS).sort();
      this.process.stdout.write(
        formatJSON({ commands, resources }, { command: "describe" }) + "\n",
      );
      return;
    }

    if (target in COMMAND_SCHEMAS) {
      this.process.stdout.write(
        formatJSON(
          { command: target, schema: COMMAND_SCHEMAS[target] },
          { command: "describe" },
        ) + "\n",
      );
      return;
    }

    if (target in RESOURCE_FIELDS) {
      this.process.stdout.write(
        formatJSON(
          { resource: target, fields: RESOURCE_FIELDS[target] },
          { command: "describe" },
        ) + "\n",
      );
      return;
    }

    const allKeys = [
      ...Object.keys(COMMAND_SCHEMAS),
      ...Object.keys(RESOURCE_FIELDS),
    ].sort();
    this.process.stderr.write(
      `Unknown target "${target}". Available: ${allKeys.join(", ")}\n`,
    );
  },
});
