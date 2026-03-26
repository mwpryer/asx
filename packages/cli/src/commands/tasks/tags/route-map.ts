import { buildRouteMap } from "@stricli/core";

import { addCommand } from "@/commands/tasks/tags/add";
import { listCommand } from "@/commands/tasks/tags/list";
import { removeCommand } from "@/commands/tasks/tags/remove";

export const tagsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    add: addCommand,
    remove: removeCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List, add, or remove tags on a task" },
});
