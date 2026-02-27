import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { resolvePat } from "../../src/auth/resolve.js";
import { setAccount } from "../../src/auth/token-store.js";
import { AuthError } from "../../src/errors/errors.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "asx-test-"));
  vi.stubEnv("XDG_CONFIG_HOME", tmpDir);
});

afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("resolvePat", () => {
  it("uses --account flag to look up stored account", () => {
    setAccount("work", { pat: "stored-pat", added_at: "2024-01-01" });
    expect(resolvePat({ account: "work" })).toBe("stored-pat");
  });

  it("throws for unknown --account", () => {
    expect(() => resolvePat({ account: "nope" })).toThrow(AuthError);
  });

  it("auto-selects single stored account", () => {
    setAccount("only", { pat: "auto-pat", added_at: "2024-01-01" });
    expect(resolvePat()).toBe("auto-pat");
  });

  it("throws when multiple accounts and no flag", () => {
    setAccount("a", { pat: "p1", added_at: "2024-01-01" });
    setAccount("b", { pat: "p2", added_at: "2024-01-01" });
    expect(() => resolvePat()).toThrow(AuthError);
  });

  it("throws when no credentials at all", () => {
    expect(() => resolvePat()).toThrow(AuthError);
  });
});
