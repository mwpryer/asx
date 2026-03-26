import { buildRouteMap } from "@stricli/core";

import { addCommand } from "@/commands/tasks/dependencies/add";
import { listCommand } from "@/commands/tasks/dependencies/list";
import { removeCommand } from "@/commands/tasks/dependencies/remove";

export const dependenciesRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    add: addCommand,
    remove: removeCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List, add, or remove task dependencies" },
});
