import { AsxError } from "@mwp13/asx-core";
import type { AsxCliContext } from "@/context";

let capturedExitCode: number | undefined;

// Return exit code captured by asxFunc, if any
export function getCapturedExitCode(): number | undefined {
  return capturedExitCode;
}

// Catches AsxError, writes JSON (piped) or text (TTY) to stdout, stashes exit code
export function asxFunc<
  T extends (this: AsxCliContext, ...args: never[]) => Promise<void>,
>(fn: T): T {
  const wrapped = async function (this: AsxCliContext, ...args: unknown[]) {
    try {
      await fn.apply(this, args as never);
    } catch (err) {
      if (err instanceof AsxError) {
        const isTTY = process.stdout.isTTY === true;
        const output = isTTY
          ? err.message + (err.suggestion ? `\nhint: ${err.suggestion}` : "")
          : JSON.stringify(err.toJSON(), null, 2);
        this.process.stdout.write(output + "\n");
        capturedExitCode = err.exitCode;
        return;
      }
      throw err;
    }
  };
  return wrapped as unknown as T;
}
