import type { Feed, FeedItemContent, FeedResponse } from '../src/types';
import { storage } from './ls';

// Mock URL or configurable
const FEED_URL = '/eg2.json';
const FEED_URL_VERSION = '?version=abc';

/**
 * Fetch feed with caching logic
 */
export const fetchFeed = async (feedId: string, version: string): Promise<FeedResponse> => {
    const cacheKey = `feed_${feedId}_${version}`;

    const cachedData = storage.get<FeedResponse>(cacheKey);
    if (cachedData) {
        console.log(`[MockService] Cache hit for ${cacheKey}`);
        return cachedData;
    }

    console.log(`[MockService] Cache miss for ${cacheKey}, fetching...`);
    try {
        const response = await fetch(FEED_URL + version);
        if (!response.ok) throw new Error('Failed to fetch feed');

        const data = await response.json();
        storage.set(cacheKey, data);

        return data;
    } catch (error) {
        console.error('[MockService] Fetch error:', error);
        throw error;
    }
};
