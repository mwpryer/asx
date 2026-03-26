import { buildRouteMap } from "@stricli/core";

import { createCommand } from "@/commands/sections/create";
import { deleteCommand } from "@/commands/sections/delete";
import { getCommand } from "@/commands/sections/get";
import { listCommand } from "@/commands/sections/list";
import { updateCommand } from "@/commands/sections/update";

export const sectionsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
    create: createCommand,
    update: updateCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage Asana sections" },
});
