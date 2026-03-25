import { run } from "@stricli/core";

import { getCapturedExitCode } from "@/command";
import { buildCliContext } from "@/context";
import { app } from "@/app";

await run(app, process.argv.slice(2), buildCliContext(process));

const exitCode = getCapturedExitCode();
if (exitCode !== undefined) process.exitCode = exitCode;
