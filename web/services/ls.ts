import { zlib, unzlib, strToU8, strFromU8 } from 'fflate';

const CACHE_KEYS_LIST = 'twai_cache_keys';
const MAX_CACHE_ITEMS = 500;

/**
 * Helper to convert Uint8Array to Base64 for localStorage storage
 */
function uint8ToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Helper to convert Base64 back to Uint8Array
 */
function base64ToUint8(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Storage service with Zlib compression (via fflate) and FIFO cache eviction.
 * Provides both compressed and uncompressed storage options.
 */
export class StorageService {
    private cacheKeys: string[] = [];
    private useCompression: boolean;
    private initialized: Promise<void>;

    constructor(options: { useCompression?: boolean } = {}) {
        this.useCompression = options.useCompression !== false;
        this.initialized = this.init();
    }

    private async init() {
        try {
            const storedKeys = await this.get<string[]>(CACHE_KEYS_LIST);
            this.cacheKeys = Array.isArray(storedKeys) ? storedKeys : [];
        } catch (e) {
            this.cacheKeys = [];
        }
    }

    private async saveCacheKeys() {
        await this.set(CACHE_KEYS_LIST, this.cacheKeys, true);
    }

    /**
     * Set a value in storage
     * @param key Storage key
     * @param value Value to store
     * @param forever If true, store permanently (no eviction). If false, use FIFO eviction.
     */
    async set(key: string, value: any, forever = false) {
        await this.initialized;

        const jsonStr = JSON.stringify(value);
        let dataToStore: string;

        if (this.useCompression) {
            // Use fflate's async zlib compression
            const compressed = await new Promise<Uint8Array>((resolve, reject) => {
                zlib(strToU8(jsonStr), {
                    level: 9 // Max compression level for zlib in fflate
                }, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
            // Prefix with 'c:' to indicate compressed data
            dataToStore = 'c:' + uint8ToBase64(compressed);
        } else {
            // Prefix with 'r:' to indicate raw JSON
            dataToStore = 'r:' + jsonStr;
        }

        localStorage.setItem(key, dataToStore);

        // Don't track the cache keys list itself in the eviction list
        if (key === CACHE_KEYS_LIST) return;

        if (!forever) {
            const index = this.cacheKeys.indexOf(key);
            if (index > -1) {
                this.cacheKeys.splice(index, 1);
            }

            this.cacheKeys.push(key);

            // Evict oldest if limit reached
            while (this.cacheKeys.length > MAX_CACHE_ITEMS) {
                const oldestKey = this.cacheKeys.shift();
                if (oldestKey) {
                    localStorage.removeItem(oldestKey);
                }
            }
            await this.saveCacheKeys();
        } else {
            // If it was in cache list but now set as forever, remove from cache list
            const index = this.cacheKeys.indexOf(key);
            if (index > -1) {
                this.cacheKeys.splice(index, 1);
                await this.saveCacheKeys();
            }
        }
    }

    /**
     * Get a value from storage. Handles both compressed and raw formats.
     */
    async get<T>(key: string): Promise<T | null> {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        try {
            if (raw.startsWith('c:')) {
                const compressed = base64ToUint8(raw.slice(2));
                const decompressed = await new Promise<Uint8Array>((resolve, reject) => {
                    unzlib(compressed, (err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                });
                return JSON.parse(strFromU8(decompressed)) as T;
            } else if (raw.startsWith('r:')) {
                return JSON.parse(raw.slice(2)) as T;
            } else {
                // Fallback for old data or un-prefixed data
                return JSON.parse(raw) as T;
            }
        } catch (e) {
            return null;
        }
    }

    async remove(key: string) {
        await this.initialized;
        localStorage.removeItem(key);
        const index = this.cacheKeys.indexOf(key);
        if (index > -1) {
            this.cacheKeys.splice(index, 1);
            await this.saveCacheKeys();
        }
    }

    async clear() {
        await this.initialized;
        // Clear everything tracked in cache
        this.cacheKeys.forEach(key => localStorage.removeItem(key));
        this.cacheKeys = [];
        localStorage.removeItem(CACHE_KEYS_LIST);
    }
}

export const storage = new StorageService({ useCompression: false });
