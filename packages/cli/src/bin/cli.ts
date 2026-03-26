import { EXIT_INPUT } from "@mwp13/asx-core";
import type { StricliDynamicCommandContext } from "@stricli/core";
import { run } from "@stricli/core";

import { app } from "@/app";
import { getCapturedExitCode } from "@/command";
import type { AsxCliContext } from "@/context";

// Buffer stderr so Stricli errors re-emit as JSON on stdout
const stderrChunks: string[] = [];
const cliProcess = {
  stdout: process.stdout,
  stderr: { write: (str: string) => void stderrChunks.push(str) },
  env: process.env,
  exitCode: undefined as number | string | null | undefined,
};

await run(app, process.argv.slice(2), {
  process: cliProcess,
} as unknown as StricliDynamicCommandContext<AsxCliContext>);

const capturedExitCode = getCapturedExitCode();
if (capturedExitCode !== undefined) {
  // AsxError caught by asxFunc, flush buffered stderr
  for (const chunk of stderrChunks) process.stderr.write(chunk);
  process.exitCode = capturedExitCode;
} else if (cliProcess.exitCode != null && cliProcess.exitCode !== 0) {
  // Stricli framework error (parse, unknown command)
  const message = stderrChunks.join("").trim();
  if (message) {
    if (process.stdout.isTTY === true) {
      process.stdout.write(message + "\n");
    } else {
      process.stdout.write(
        JSON.stringify({ error: { code: "INPUT_INVALID", message } }, null, 2) +
          "\n",
      );
    }
  }
  process.exitCode = EXIT_INPUT;
} else {
  // Success, flush buffered stderr
  for (const chunk of stderrChunks) process.stderr.write(chunk);
}
