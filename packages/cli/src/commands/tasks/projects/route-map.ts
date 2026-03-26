import { buildRouteMap } from "@stricli/core";

import { addCommand } from "@/commands/tasks/projects/add";
import { listCommand } from "@/commands/tasks/projects/list";
import { removeCommand } from "@/commands/tasks/projects/remove";

export const projectsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    add: addCommand,
    remove: removeCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List, add, or remove task project associations" },
});
