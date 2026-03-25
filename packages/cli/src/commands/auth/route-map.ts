import { buildRouteMap } from "@stricli/core";

import { addCommand } from "@/commands/auth/add";
import { listCommand } from "@/commands/auth/list";
import { removeCommand } from "@/commands/auth/remove";
import { statusCommand } from "@/commands/auth/status";

export const authRouteMap = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    remove: removeCommand,
    status: statusCommand,
  },
  docs: { brief: "Manage authentication and accounts" },
});
