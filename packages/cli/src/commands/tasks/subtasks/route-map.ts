import { buildRouteMap } from "@stricli/core";

import { createCommand } from "@/commands/tasks/subtasks/create";
import { listCommand } from "@/commands/tasks/subtasks/list";

export const subtasksRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    create: createCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List or create subtasks of a task" },
});
