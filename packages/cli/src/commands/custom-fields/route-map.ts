import { buildRouteMap } from "@stricli/core";

import { getCommand } from "@/commands/custom-fields/get";
import { listCommand } from "@/commands/custom-fields/list";

export const customFieldsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
  },
  docs: { brief: "Manage Asana custom field definitions" },
});
