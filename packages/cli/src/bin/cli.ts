import { run } from "@stricli/core";
import { app } from "../app.js";
import { buildCliContext } from "../context.js";

await run(app, process.argv.slice(2), buildCliContext(process));
