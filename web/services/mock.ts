import type { Feed, FeedItemContent, FeedResponse, FeedAIResponse } from '../src/types';
import { storage } from './ls';

// Mock URL or configurable
const FEED_URL = '/eg2.json';

/**
 * Fetch feed with caching logic
 */
export const fetchFeedItem = async (feedUrl: string): Promise<FeedResponse> => {
    const cacheKey = `feed_${feedUrl}`;

    // const cachedData = storage.get<FeedResponse>(cacheKey);
    // if (cachedData) {
    //     console.log(`[MockService] Cache hit for ${cacheKey}`);
    //     return cachedData;
    // }

    console.log(`[MockService] Cache miss for ${cacheKey}, fetching...`);
    try {

        const data: FeedResponse = {
            feed: {
                name: "前端圈",
                feed_id: "web",
                feed_url: "github.com",
                avatar: "https://vuejs.org/images/logo.png",
                ai_bots: [
                    {
                        bot_id: "faker",
                        name: "AI讲师",
                        avatar: "https://vuejs.org/images/logo.png",
                        description: "AI Bot 1 description",
                        prompt: "AI Bot 1 prompt"
                    },
                    {
                        bot_id: "fucker",
                        name: "网络喷子",
                        avatar: "https://vuejs.org/images/logo.png",
                        description: "AI Bot 1 description",
                        prompt: "AI Bot 1 prompt"
                    }
                ]
            },
            list: [
                {
                    "tw_id": "7e8066317608fbb0d458f0bb72a7a29b",
                    "url": "https://x.com/boshen_c/status/2001878127228891251",
                    "title": "RT by @youyuxi: In the latest version of Oxfmt (better prettier replacement): • oxfmt --migrate prettier • oxfmit --init • oxfmt --stdin-filepath for pipe usage • Node.js API • Sort package.json fields by default • Respect root .editorconfig Give it a try:",
                    "content_text": "In the latest version of Oxfmt (better prettier replacement):\n\n• oxfmt --migrate prettier\n• oxfmit --init\n• oxfmt --stdin-filepath for pipe usage\n• Node.js API\n• Sort package.json fields by default\n• Respect root .editorconfig\n\nGive it a try:\n\n• https://t.co/O68UNpWalD— Boshen (@boshen_c) December 19, 2025\n",
                    "date_published": "2025-12-19T04:51:00.000Z",
                    "authors": [{ "name": "@boshen_c" }],
                    is_translated: false,
                    rawText: "sad",
                    tags: ["tech"]
                }, {
                    "tw_id": "87dd186cb5594dda46b75a70c08e434a",
                    "url": "https://x.com/voidzerodev/status/2001342848898068784",
                    "title": "RT by @youyuxi: Want to understand why some of your @vitest_dev tests are slower than expected? Then you can use the built-in experimental @OpenTelemetry support to figure out what makes tests slow and how much time is spent on each part of it. 📈 When enabled, Vitest will generate traces…",
                    "content_text": "Want to understand why some of your @vitest_dev tests are slower than expected? Then you can use the built-in experimental @OpenTelemetry support to figure out what makes tests slow and how much time is spent on each part of it. 📈 \n\nWhen enabled, Vitest will generate traces… pic.twitter.com/Jyz5if6Mjf— VoidZero (@voidzerodev) December 17, 2025\n",
                    "image": "https://pbs.twimg.com/media/G8Yyts4XIAAylGf.jpg?name=small&format=webp",
                    "date_published": "2025-12-17T17:24:00.000Z",
                    "authors": [{ "name": "@voidzerodev" }],
                    "attachments": [
                        {
                            "url": "https://pbs.twimg.com/media/G8Yyts4XIAAylGf.jpg?name=small&format=webp"
                        }
                    ],
                    is_translated: false,
                    rawText: "xs",
                    tags: ["leisure"]
                },
            ],
            feed_ai_analysis: {}
        }
        // storage.set(cacheKey, data);

        return data;
    } catch (error) {
        console.error('[MockService] Fetch error:', error);
        throw error;
    }
};

export const fetchFeedsAIItem = async (feedUrl: string): Promise<FeedAIResponse> => {
    const cacheKey = `feed_${feedUrl}_ai`;

    // const cachedData = storage.get<FeedAIResponse>(cacheKey);
    // if (cachedData) {
    //     console.log(`[MockService] Cache hit for ${cacheKey}`);
    //     return cachedData;
    // }

    console.log(`[MockService] Cache miss for ${cacheKey}, fetching...`);
    try {
        const data: FeedAIResponse = {
            feed_ai_analysis: {
                'overview': 'overview',
                'summary': 'summary',
            },
            feed_item_ai_bots_content: {
                '7e8066317608fbb0d458f0bb72a7a29b': {
                    'faker': 'content1',
                    'fucker': 'content1',
                },
                '87dd186cb5594dda46b75a70c08e434a': {
                    'faker': 'content2',
                    'fucker': 'content2',
                }
            }
        }
        // storage.set(cacheKey, data);

        return data;
    } catch (error) {
        console.error('[MockService] Fetch error:', error);
        throw error;
    }
};


export const fetchFeedInfo = async (feedUrl: string): Promise<Feed> => {

    const data: Feed = {
        name: "前端圈",
        feed_id: "web",
        feed_url: feedUrl,
        avatar: "https://vuejs.org/images/logo.png",
        ai_bots: [
            {
                bot_id: "faker",
                name: "AI讲师",
                avatar: "https://vuejs.org/images/logo.png",
                description: "AI Bot 1 description",
                prompt: "AI Bot 1 prompt"
            },
            {
                bot_id: "fucker",
                name: "网络喷子",
                avatar: "https://vuejs.org/images/logo.png",
                description: "AI Bot 1 description",
                prompt: "AI Bot 1 prompt"
            }
        ]
    }

    return Promise.resolve(data);
};
