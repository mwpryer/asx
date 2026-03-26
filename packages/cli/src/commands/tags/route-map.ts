import { buildRouteMap } from "@stricli/core";

import { createCommand } from "@/commands/tags/create";
import { deleteCommand } from "@/commands/tags/delete";
import { getCommand } from "@/commands/tags/get";
import { listCommand } from "@/commands/tags/list";
import { updateCommand } from "@/commands/tags/update";

export const tagsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
    create: createCommand,
    update: updateCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage Asana tags" },
});
