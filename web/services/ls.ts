import SecureLS from 'secure-ls';

const ls = new SecureLS({ encodingType: 'aes' });

const CACHE_KEYS_LIST = 'twai_cache_keys';
const MAX_CACHE_ITEMS = 500; // Limit for request-generated cache

/**
 * Storage service with permanent storage and FIFO cache eviction
 */
class StorageService {
    private cacheKeys: string[] = [];

    constructor() {
        this.loadCacheKeys();
    }

    private loadCacheKeys() {
        try {
            const storedKeys = ls.get(CACHE_KEYS_LIST);
            this.cacheKeys = Array.isArray(storedKeys) ? storedKeys : [];
        } catch (e) {
            this.cacheKeys = [];
        }
    }

    private saveCacheKeys() {
        ls.set(CACHE_KEYS_LIST, this.cacheKeys);
    }

    /**
     * Set a value in storage
     * @param key Storage key
     * @param value Value to store
     * @param forever If true, store permanently (no eviction). If false, use FIFO eviction.
     */
    set(key: string, value: any, forever = false) {
        ls.set(key, value);

        if (!forever) {
            // Remove if already in cache list to avoid duplicates
            const index = this.cacheKeys.indexOf(key);
            if (index > -1) {
                this.cacheKeys.splice(index, 1);
            }

            this.cacheKeys.push(key);

            // Evict oldest if limit reached
            while (this.cacheKeys.length > MAX_CACHE_ITEMS) {
                const oldestKey = this.cacheKeys.shift();
                if (oldestKey) {
                    ls.remove(oldestKey);
                }
            }
            this.saveCacheKeys();
        } else {
            // If it was in cache list but now set as forever, remove from cache list
            const index = this.cacheKeys.indexOf(key);
            if (index > -1) {
                this.cacheKeys.splice(index, 1);
                this.saveCacheKeys();
            }
        }
    }

    /**
     * Get a value from storage. Does NOT update eviction order.
     */
    get<T>(key: string): T | null {
        const value = ls.get(key);
        if (value !== undefined && value !== null && value !== '') {
            return value as T;
        }
        return null;
    }

    remove(key: string) {
        ls.remove(key);
        const index = this.cacheKeys.indexOf(key);
        if (index > -1) {
            this.cacheKeys.splice(index, 1);
            this.saveCacheKeys();
        }
    }

    clear() {
        // Clear everything tracked in cache
        this.cacheKeys.forEach(key => ls.remove(key));
        this.cacheKeys = [];
        ls.remove(CACHE_KEYS_LIST);
        // Note: This doesn't clear 'forever' items as we don't track them in a list.
        // User would need to clear localStorage manually or we'd need a separate list.
    }
}

export const storage = new StorageService();
