import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  loadAccounts,
  saveAccounts,
  getAccount,
  setAccount,
  removeAccount,
} from "../../src/auth/token-store.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "asx-test-"));
  vi.stubEnv("XDG_CONFIG_HOME", tmpDir);
});

afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("loadAccounts", () => {
  it("returns empty object when no file exists", () => {
    expect(loadAccounts()).toEqual({});
  });

  it("throws AuthError when accounts.json is corrupt", () => {
    const dir = path.join(tmpDir, "asx");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "accounts.json"), "{bad json");
    expect(() => loadAccounts()).toThrow("corrupt");
  });

  it("returns parsed accounts from file", () => {
    const dir = path.join(tmpDir, "asx");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "accounts.json"),
      JSON.stringify({ work: { pat: "tok", added_at: "2024-01-01" } }),
    );
    const accounts = loadAccounts();
    expect(accounts["work"]?.pat).toBe("tok");
  });
});

describe("setAccount / getAccount", () => {
  it("stores and retrieves an account", () => {
    setAccount("test", { pat: "abc123", added_at: "2024-01-01" });
    const account = getAccount("test");
    expect(account?.pat).toBe("abc123");
  });
});

describe("removeAccount", () => {
  it("returns false for non-existent account", () => {
    expect(removeAccount("nope")).toBe(false);
  });

  it("removes an existing account", () => {
    setAccount("rm-me", { pat: "x", added_at: "2024-01-01" });
    expect(removeAccount("rm-me")).toBe(true);
    expect(getAccount("rm-me")).toBeUndefined();
  });
});

describe("saveAccounts / loadAccounts round-trip", () => {
  it("persists to disk", () => {
    const data = {
      a: { pat: "p1", added_at: "2024-01-01" },
      b: { pat: "p2", name: "Bob", added_at: "2024-02-01" },
    };
    saveAccounts(data);
    expect(loadAccounts()).toEqual(data);
  });
});
