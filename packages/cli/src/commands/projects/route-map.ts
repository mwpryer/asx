import { buildRouteMap } from "@stricli/core";
import { listCommand } from "./list.js";
import { getCommand } from "./get.js";
import { sectionsCommand } from "./sections.js";

export const projectsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
    sections: sectionsCommand,
  },
  docs: { brief: "Manage Asana projects" },
});
