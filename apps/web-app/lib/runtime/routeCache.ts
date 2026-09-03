/**
 * Single-process, in-memory cache-aside for the DB reads that gate every
 * public page view (site/page/domain lookups). Correct for the current
 * single-VM/single-Node deployment; would need a shared store (Redis) if
 * this app is ever horizontally scaled to more than one process.
 *
 * The freshness TTL keeps normal operation up to date. The resilience this
 * exists for is the stale-on-error fallback: a database error serves the
 * last-known-good value regardless of staleness, rather than 500ing — so a
 * page that's been viewed at least once keeps serving through a transient
 * Postgres outage. It does not protect against the Node process itself
 * going down (that needs nginx-level proxy_cache + stale-if-error).
 */

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

export async function cachedOrStale<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;

  try {
    const value = await load();
    store.set(key, { value, expiresAt: now + ttlMs });
    return value;
  } catch (error) {
    if (hit) return hit.value;
    throw error;
  }
}

export function invalidateRouteCache(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
