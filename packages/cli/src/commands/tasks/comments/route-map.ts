import { buildRouteMap } from "@stricli/core";

import { addCommand } from "@/commands/tasks/comments/add";
import { listCommand } from "@/commands/tasks/comments/list";
import { removeCommand } from "@/commands/tasks/comments/remove";

export const commentsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    add: addCommand,
    remove: removeCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List, add, or remove comments on a task" },
});
