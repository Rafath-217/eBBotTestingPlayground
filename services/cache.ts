/**
 * Simple localStorage cache with session-based invalidation.
 *
 * Cache entries are tagged with a session ID generated at module load time.
 * On hard reload the module re-executes, generating a new session ID,
 * which automatically invalidates all entries from the previous session.
 * Tab switches within the SPA keep the same module instance, so cached data is reused.
 */

const SESSION_ID = Date.now().toString(36) + Math.random().toString(36).slice(2);
const CACHE_PREFIX = 'ebbot_cache_';

interface CacheEntry<T> {
  sid: string;
  d: T;
}

// Clean up stale entries from previous sessions on load
(function cleanup() {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const entry = JSON.parse(localStorage.getItem(key)!);
        if (entry.sid !== SESSION_ID) toRemove.push(key);
      } catch {
        toRemove.push(key!);
      }
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
})();

/** Returns cached value or `undefined` on miss */
export function getCached<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (entry.sid !== SESSION_ID) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return undefined;
    }
    return entry.d;
  } catch {
    return undefined;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ sid: SESSION_ID, d: data }));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/** Remove a specific cache entry */
export function removeCache(key: string): void {
  localStorage.removeItem(CACHE_PREFIX + key);
}

/** Remove cache entries whose key starts with the given prefix */
export function removeCacheByPrefix(prefix: string): void {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX + prefix)) toRemove.push(key);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

/** Clear all ebbot cache entries */
export function clearAllCache(): void {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) toRemove.push(key!);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}
