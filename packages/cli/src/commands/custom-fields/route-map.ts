import { buildRouteMap } from "@stricli/core";

import { createCommand } from "@/commands/custom-fields/create";
import { deleteCommand } from "@/commands/custom-fields/delete";
import { getCommand } from "@/commands/custom-fields/get";
import { listCommand } from "@/commands/custom-fields/list";
import { updateCommand } from "@/commands/custom-fields/update";

export const customFieldsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
    create: createCommand,
    update: updateCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage Asana custom field definitions" },
});
