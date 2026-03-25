import { buildRouteMap } from "@stricli/core";

import { getCommand } from "@/commands/users/get";
import { listCommand } from "@/commands/users/list";

export const usersRouteMap = buildRouteMap({
  routes: { list: listCommand, get: getCommand },
  docs: { brief: "Manage Asana users" },
});
