import fs from "fs";
import { accountsPath, ensureConfigDir } from "../config/paths.js";
import { AuthError } from "../errors/errors.js";

export interface StoredAccount {
  pat: string;
  name?: string;
  workspace_gid?: string;
  added_at: string;
}

export type AccountsFile = Record<string, StoredAccount>;

export function loadAccounts(): AccountsFile {
  const p = accountsPath();
  if (!fs.existsSync(p)) return {};
  const raw = fs.readFileSync(p, "utf-8");
  try {
    return JSON.parse(raw) as AccountsFile;
  } catch {
    throw new AuthError(
      "AUTH_REQUIRED",
      `Failed to parse ${p} - file may be corrupt`,
      `Delete or fix ${p} and re-add accounts with "asx auth add"`,
    );
  }
}

export function saveAccounts(accounts: AccountsFile): void {
  ensureConfigDir();
  fs.writeFileSync(accountsPath(), JSON.stringify(accounts, null, 2), {
    mode: 0o600,
  });
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
