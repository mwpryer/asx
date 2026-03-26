import fs from "node:fs";
import * as v from "valibot";

import { accountsPath, ensureConfigDir } from "@/config/paths";
import { AuthError } from "@/errors/errors";

export interface StoredAccount {
  pat: string;
  name?: string;
  workspace_gid?: string;
  added_at: string;
}

export type AccountsFile = Record<string, StoredAccount>;

const StoredAccountSchema = v.object({
  pat: v.string(),
  name: v.optional(v.string()),
  workspace_gid: v.optional(v.string()),
  added_at: v.string(),
});

const AccountsFileSchema = v.record(v.string(), StoredAccountSchema);

export function loadAccounts(): AccountsFile {
  const p = accountsPath();
  if (!fs.existsSync(p)) return {};
  const raw = fs.readFileSync(p, "utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AuthError(
      "AUTH_REQUIRED",
      `Failed to parse ${p} - file may be corrupt`,
      `Delete or fix ${p} and re-add accounts with "asx auth add"`,
    );
  }
  const result = v.safeParse(AccountsFileSchema, parsed);
  if (!result.success) {
    throw new AuthError(
      "AUTH_REQUIRED",
      `Invalid accounts file ${p} - ${result.issues[0]!.message}`,
      `Delete or fix ${p} and re-add accounts with "asx auth add"`,
    );
  }
  // Valibot's output is a plain {} where __proto__ keys silently vanish.
  // Rebuild from the raw parsed object into a null-prototype map instead.
  const accounts: AccountsFile = Object.create(null);
  for (const [key, value] of Object.entries(
    parsed as Record<string, unknown>,
  )) {
    accounts[key] = value as StoredAccount;
  }
  return accounts;
}

export function saveAccounts(accounts: AccountsFile): void {
  ensureConfigDir();
  const p = accountsPath();
  fs.writeFileSync(p, JSON.stringify(accounts, null, 2), { mode: 0o600 });
  fs.chmodSync(p, 0o600);
}

export function getAccount(alias: string): StoredAccount | undefined {
  return loadAccounts()[alias];
}

export function setAccount(alias: string, account: StoredAccount): void {
  const accounts = loadAccounts();
  accounts[alias] = account;
  saveAccounts(accounts);
}

export function removeAccount(alias: string): boolean {
  const accounts = loadAccounts();
  if (!(alias in accounts)) return false;
  delete accounts[alias];
  saveAccounts(accounts);
  return true;
}
