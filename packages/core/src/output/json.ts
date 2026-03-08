export interface MetaInfo {
  command: string;
  account?: string;
  pagination?: { next_offset: string };
  dry_run?: boolean;
}

export function formatJSON<T>(data: T, meta: MetaInfo): string {
  const envelope = {
    _meta: {
      command: meta.command,
      ...(meta.account && { account: meta.account }),
      ...(meta.pagination && { pagination: meta.pagination }),
      ...(meta.dry_run && { dry_run: true }),
      timestamp: new Date().toISOString(),
    },
    ...data,
  };
  return JSON.stringify(envelope, null, 2);
}
