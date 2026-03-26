import { buildRouteMap } from "@stricli/core";

import { addCommand } from "@/commands/tasks/comments/add";
import { listCommand } from "@/commands/tasks/comments/list";

export const commentsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    add: addCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List or add comments on a task" },
});
