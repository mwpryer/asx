import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const CLI = resolve(import.meta.dirname, "../dist/cli.js");

function run(args: string[]): Promise<{ stdout: string; exitCode: number }> {
  return new Promise((res) => {
    execFile("node", [CLI, ...args], (error, stdout) => {
      res({ stdout, exitCode: error?.code ? Number(error.code) : 0 });
    });
  });
}

function parseJSON(stdout: string) {
  return JSON.parse(stdout) as { error: { code: string; message: string } };
}

describe("stricli framework errors are wrapped in JSON envelope", () => {
  it("missing positional arg returns INPUT_INVALID with exit 3", async () => {
    const { stdout, exitCode } = await run([
      "tasks",
      "followers",
      "add",
      "1234",
    ]);
    const out = parseJSON(stdout);
    expect(exitCode).toBe(3);
    expect(out.error.code).toBe("INPUT_INVALID");
    expect(out.error.message).toContain("user-gid");
  });

  it("unknown flag returns INPUT_INVALID with exit 3", async () => {
    const { stdout, exitCode } = await run([
      "tasks",
      "dependencies",
      "add",
      "1234",
      "--add",
      "5678",
    ]);
    const out = parseJSON(stdout);
    expect(exitCode).toBe(3);
    expect(out.error.code).toBe("INPUT_INVALID");
    expect(out.error.message).toContain("--add");
  });

  it("unknown command returns INPUT_INVALID with exit 3", async () => {
    const { stdout, exitCode } = await run([
      "tasks",
      "add-project",
      "1234",
      "5678",
    ]);
    const out = parseJSON(stdout);
    expect(exitCode).toBe(3);
    expect(out.error.code).toBe("INPUT_INVALID");
    expect(out.error.message).toContain("add-project");
  });

  it("error messages contain no ANSI escape codes", async () => {
    const { stdout } = await run(["tasks", "followers", "add", "1234"]);
    // oxlint-disable-next-line no-control-regex
    expect(stdout).not.toMatch(/\x1B\[/);
  });

  it("error output has no stderr leakage", async () => {
    const result = await new Promise<{ stderr: string }>((res) => {
      execFile(
        "node",
        [CLI, "tasks", "add-project"],
        (_err, _stdout, stderr) => {
          res({ stderr });
        },
      );
    });
    expect(result.stderr).toBe("");
  });
});
