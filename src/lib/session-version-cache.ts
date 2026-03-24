import { getSessionVersion } from "./auth-db";

const CACHE_TTL_MS = 60_000; // 60 seconds

interface CacheEntry {
  version: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export async function getCachedSessionVersion(
  userId: string,
): Promise<number> {
  const entry = cache.get(userId);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.version;
  }

  // DB query — if it throws, we propagate (fail-secure)
  const version = await getSessionVersion(userId);
  cache.set(userId, { version, expiresAt: Date.now() + CACHE_TTL_MS });
  return version;
}

export function clearUserCache(userId: string): void {
  cache.delete(userId);
}

export function clearAllCache(): void {
  cache.clear();
}
