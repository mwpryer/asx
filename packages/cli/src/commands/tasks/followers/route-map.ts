import { buildRouteMap } from "@stricli/core";

import { addCommand } from "@/commands/tasks/followers/add";
import { listCommand } from "@/commands/tasks/followers/list";
import { removeCommand } from "@/commands/tasks/followers/remove";

export const followersRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    add: addCommand,
    remove: removeCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List, add, or remove task followers" },
});
