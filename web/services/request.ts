import type { Feed, FeedResponse, FeedAIResponse, Tweets } from '../src/types';
import { logger } from './logger';
import { getGitHubRawBaseUrl, fetchJson } from '../src/lib/github';

/**
 * 获取订阅源基本信息 (config.json)
 */
export const fetchFeedInfo = async (feedUrl: string): Promise<Feed> => {
    try {
        const baseUrl = getGitHubRawBaseUrl(feedUrl);
        const url = baseUrl.endsWith('/') ? `${baseUrl}config.json` : `${baseUrl}/config.json`;
        return await fetchJson<Feed>(url);
    } catch (error) {
        logger.error('Fetch Feed Info Error:', error);
        throw error;
    }
};

/**
 * 获取订阅源推文列表 (FEED_CONTENT)
 */
export const fetchFeedItem = async (feedUrl: string): Promise<FeedResponse> => {
    try {
        const baseUrl = getGitHubRawBaseUrl(feedUrl);
        const url = baseUrl.endsWith('/') ? `${baseUrl}FEED_CONTENT` : `${baseUrl}/FEED_CONTENT`;
        const raw = await fetchJson<any>(url);

        const rawList = raw.list || [];
        let groupedList: Tweets[] = [];

        if (rawList.length > 0) {
            // Check if already grouped (has 'tweets' property)
            if (rawList[0].tweets) {
                groupedList = rawList;
            } else {
                // It's a flat list of TweetItem, need to group it
                const groups = new Map<string, Tweets>();
                rawList.forEach((item: any) => {
                    // Ensure item has an author object (synthesize from authors[0] if missing)
                    if (!item.author && item.authors?.[0]) {
                        item.author = {
                            author_id: item.authors[0].name,
                            author_name: item.authors[0].name.replace('@', ''),
                            author_favicon: `https://unavatar.io/twitter/${item.authors[0].name.replace('@', '')}`
                        };
                    }

                    const authorId = item.author?.author_id || 'unknown';
                    if (!groups.has(authorId)) {
                        groups.set(authorId, {
                            author: item.author,
                            tweets: []
                        });
                    }
                    groups.get(authorId)!.tweets.push(item);
                });
                groupedList = Array.from(groups.values());
            }
        }

        return {
            feed: {
                name: raw.name,
                feed_id: raw.feed_id,
                feed_url: raw.feed_url,
                avatar: raw.avatar,
                version: raw.version,
                ai_bots: raw.ai_bots
            },
            list: groupedList,
            tags_info: raw.tags_info
        };
    } catch (error) {
        logger.error('Fetch Feed Content Error:', error);
        throw error;
    }
};

/**
 * 获取订阅源 AI 分析内容 (FEED_AI_CONTENT)
 */
/**
 * 获取订阅源 AI Bot 内容 (FEED_AI_BOT)
 */
export const fetchFeedsAIItem = async (feedUrl: string): Promise<FeedAIResponse> => {
    try {
        const baseUrl = getGitHubRawBaseUrl(feedUrl);
        const url = baseUrl.endsWith('/') ? `${baseUrl}FEED_AI_BOT` : `${baseUrl}/FEED_AI_BOT`;
        const botsContent = await fetchJson<Record<string, Record<string, string>>>(url);
        return {
            feed_item_ai_bots_content: botsContent
        };
    } catch (error) {
        logger.error('Fetch Feed AI Bots Content Error:', error);
        // Return empty structure on error to avoid breaking the app
        return {
            feed_item_ai_bots_content: {}
        };
    }
};

/**
 * 获取订阅源 AI 概览内容 (FEED_AI_OVERVIEW_YYYY_MM_DD)
 */
export const fetchFeedOverview = async (feedUrl: string, date: string): Promise<Record<string, string>> => {
    try {
        const baseUrl = getGitHubRawBaseUrl(feedUrl);
        const formattedDate = date.replace(/-/g, '_');
        const filename = `FEED_AI_OVERVIEW_${formattedDate}`;
        const url = baseUrl.endsWith('/') ? `${baseUrl}${filename}` : `${baseUrl}/${filename}`;
        return await fetchJson<Record<string, string>>(url);
    } catch (error) {
        // logger.error(`Fetch Feed Overview Error for ${date}:`, error);
        // Return empty object if not found
        return {};
    }
};
