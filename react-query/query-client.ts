interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequestEntry<T> {
  promise: Promise<T>;
  expiresAt: number;
}

export class QueryClient {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, PendingRequestEntry<unknown>>();

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  setCache<T>(key: string, data: T, cacheTime: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTime,
    });
  }

  removeCache(key: string): void {
    this.cache.delete(key);
  }

  hasPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  getPending<T>(key: string): Promise<T> | null {
    const pendingRequest = this.pendingRequests.get(key);
    if (!pendingRequest) return null;

    if (pendingRequest.expiresAt < Date.now()) {
      this.pendingRequests.delete(key);
      return null;
    }

    return pendingRequest.promise as Promise<T>;
  }

  setPending<T>(
    key: string,
    promise: Promise<T>,
    dedupingInterval: number
  ): void {
    this.pendingRequests.set(key, {
      promise,
      expiresAt: Date.now() + dedupingInterval,
    });
  }

  removePending(key: string): void {
    this.pendingRequests.delete(key);
  }

  clearAll(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}
