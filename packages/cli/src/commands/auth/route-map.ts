import { buildRouteMap } from "@stricli/core";
import { addCommand } from "./add.js";
import { listCommand } from "./list.js";
import { removeCommand } from "./remove.js";
import { statusCommand } from "./status.js";

export const authRouteMap = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    remove: removeCommand,
    status: statusCommand,
  },
  docs: { brief: "Manage authentication and accounts" },
});
