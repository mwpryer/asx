import { getAccount, loadAccounts } from "@/auth/token-store";
import { AuthError } from "@/errors/errors";

export interface ResolvePatOpts {
  account?: string;
}

export interface ResolvedAuth {
  pat: string;
  workspaceGid?: string;
}

export function resolveAuth(opts?: ResolvePatOpts): ResolvedAuth {
  // 1. --account flag -> file lookup
  if (opts?.account) {
    const stored = getAccount(opts.account);
    if (stored) return { pat: stored.pat, workspaceGid: stored.workspace_gid };
    throw new AuthError(
      "AUTH_REQUIRED",
      `Account "${opts.account}" not found`,
      'Run "asx auth add <alias>" to add an account',
    );
  }

  // 2. single stored account -> auto-select
  const accounts = loadAccounts();
  const keys = Object.keys(accounts);
  if (keys.length === 1) {
    const acct = accounts[keys[0]!]!;
    return { pat: acct.pat, workspaceGid: acct.workspace_gid };
  }

  // 3. error
  if (keys.length > 1) {
    throw new AuthError(
      "AUTH_REQUIRED",
      "Multiple accounts configured, specify which to use",
      "Use --account <alias> to specify which account",
    );
  }

  throw new AuthError(
    "AUTH_REQUIRED",
    "No Asana credentials found",
    'Run "asx auth add <alias>" to add an account',
  );
}

export function resolvePat(opts?: ResolvePatOpts): string {
  return resolveAuth(opts).pat;
}
