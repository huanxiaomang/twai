import { defineStore } from 'pinia';
import type {
    UserState,
    UserConfig,
    UserStarredItem,
    Feed,
    FeedItemContent,
    FeedResponse,
    FeedAIResponse,
    DateRange,
    UserInfo,
    UserAIConfig
} from '@/types';
import { storage } from '../../services/ls';
import { fetchFeedInfo, fetchFeedItem, fetchFeedsAIItem } from '../../services/mock';
import { logger } from '../../services/logger';

const STATE_KEY = 'twai_user_state';
const CONFIG_KEY = 'twai_user_config';
const STARRED_KEY = 'twai_user_starred';

const initialConfig: UserConfig = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: 'https://www.shadcn-vue.com/avatars/shadcn.jpg',
    },
    ai_config: {
        model: "gpt-4o",
        end_point: "https://api.openai.com/v1",
        api_key: "",
    },
    subscribe_feed_url: [],
};

const initialState: UserState = {
    curr_feed: null,
    curr_tweet_id: null,
    curr_tags: [],
    date_range: "all",
    ai_panel_width: 25,
};

const initialStarred: UserStarredItem = {
    starred_items: [],
};

const CacheKeyFactory = {
    version: (url: string) => `feed_version_${url}`,
    data: (url: string, version: string) => `feed_data_${url}_${version}`,
    ai: (url: string, version: string) => `feed_ai_${url}_${version}`,
};

export const useUserStore = defineStore('user', {
    state: () => {
        // ... existing state initialization ...
        const savedState = storage.get<UserState>(STATE_KEY);
        const savedConfig = storage.get<UserConfig>(CONFIG_KEY);
        const savedStarred = storage.get<UserStarredItem>(STARRED_KEY);

        return {
            // UserState
            curr_feed: savedState?.curr_feed ?? initialState.curr_feed,
            curr_tweet_id: savedState?.curr_tweet_id ?? initialState.curr_tweet_id,
            curr_tags: savedState?.curr_tags ?? initialState.curr_tags,
            date_range: savedState?.date_range ?? initialState.date_range,
            ai_panel_width: savedState?.ai_panel_width ?? initialState.ai_panel_width,

            // UserConfig
            user: savedConfig?.user ?? initialConfig.user,
            ai_config: savedConfig?.ai_config ?? initialConfig.ai_config,
            subscribe_feed_url: savedConfig?.subscribe_feed_url ?? initialConfig.subscribe_feed_url,

            // UserStarredItem
            starred_items: savedStarred?.starred_items ?? initialStarred.starred_items,

            // Runtime State (Not persisted)
            feeds: [] as Feed[],
            feedItems: [] as FeedItemContent[],
            feedAIAnalysis: {} as Record<string, string>,
            feedItemAIBotsContent: {} as Record<string, Record<string, string>>,
            isLoadingFeeds: false,
            isLoadingContent: false,
        };
    },
    actions: {
        async fetchAllFeedsInfo() {
            this.isLoadingFeeds = true;
            try {
                const feedPromises = this.subscribe_feed_url.map((url: string) => fetchFeedInfo(url));
                this.feeds = await Promise.all(feedPromises);
            } catch (error) {
                logger.error('获取订阅源信息失败', error, { showToast: true });
            } finally {
                this.isLoadingFeeds = false;
            }
        },

        async fetchFeedFullData(feedUrl: string) {
            this.isLoadingContent = true;
            try {
                // 1. Get latest version info
                await this.fetchAllFeedsInfo();
                const feed = this.feeds.find(f => f.feed_url === feedUrl);
                const version = feed?.version || 'unknown';

                const vKey = CacheKeyFactory.version(feedUrl);
                const dKey = CacheKeyFactory.data(feedUrl, version);
                const aKey = CacheKeyFactory.ai(feedUrl, version);

                // 2. Handle version invalidation
                const oldVersion = storage.get<string>(vKey);
                if (oldVersion && oldVersion !== version) {
                    storage.remove(CacheKeyFactory.data(feedUrl, oldVersion));
                    storage.remove(CacheKeyFactory.ai(feedUrl, oldVersion));
                }
                storage.set(vKey, version, true);

                // 3. Parallel Fetch (Cache or Network)
                const [dataRes, aiRes] = await Promise.all([
                    (async () => {
                        const cached = storage.get<FeedResponse>(dKey);
                        if (cached) return cached;
                        const res = await fetchFeedItem(feedUrl);
                        storage.set(dKey, res);
                        return res;
                    })(),
                    (async () => {
                        const cached = storage.get<FeedAIResponse>(aKey);
                        if (cached) return cached;
                        const res = await fetchFeedsAIItem(feedUrl);
                        storage.set(aKey, res);
                        return res;
                    })()
                ]);

                // 4. Update State
                this.feedItems = dataRes.list;
                if (dataRes.feed) this.curr_feed = dataRes.feed;
                this.feedAIAnalysis = aiRes.feed_ai_analysis;
                this.feedItemAIBotsContent = aiRes.feed_item_ai_bots_content ?? {};

            } catch (error) {
                logger.error('获取订阅源详情失败', error, { showToast: true });
            } finally {
                this.isLoadingContent = false;
            }
        },

        // UserState Actions
        setCurrFeed(feed: Feed | null) {
            this.curr_feed = feed;
            this.saveState();
        },
        setCurrTweetId(id: string | null) {
            this.curr_tweet_id = id;
            this.saveState();
        },
        setCurrTags(tags: string[]) {
            this.curr_tags = tags;
            this.saveState();
        },
        setDateRange(range: DateRange) {
            this.date_range = range;
            this.saveState();
        },
        setAIPanelWidth(width: number) {
            this.ai_panel_width = width;
            this.saveState();
        },

        // UserConfig Actions
        updateUser(user: Partial<UserInfo>) {
            this.user = { ...this.user, ...user };
            this.saveConfig();
        },
        updateAIConfig(config: Partial<UserAIConfig>) {
            this.ai_config = { ...this.ai_config, ...config };
            this.saveConfig();
        },
        addFeedUrl(url: string) {
            if (!this.subscribe_feed_url.includes(url)) {
                this.subscribe_feed_url.push(url);
                this.saveConfig();
            }
        },
        removeFeedUrl(url: string) {
            this.subscribe_feed_url = this.subscribe_feed_url.filter(u => u !== url);
            this.saveConfig();
        },

        // UserStarredItem Actions
        toggleStarred(item: FeedItemContent) {
            const index = this.starred_items.findIndex(i => i.tw_id === item.tw_id);
            if (index > -1) {
                this.starred_items.splice(index, 1);
            } else {
                this.starred_items.push({ ...item });
            }
            this.saveStarred();
        },

        // Persistence
        saveState() {
            const state: UserState = {
                curr_feed: this.curr_feed,
                curr_tweet_id: this.curr_tweet_id,
                curr_tags: this.curr_tags,
                date_range: this.date_range,
                ai_panel_width: this.ai_panel_width,
            };
            storage.set(STATE_KEY, state, true);
        },
        saveConfig() {
            const config: UserConfig = {
                user: this.user,
                ai_config: this.ai_config,
                subscribe_feed_url: this.subscribe_feed_url,
            };
            storage.set(CONFIG_KEY, config, true);
        },
        saveStarred() {
            const starred: UserStarredItem = {
                starred_items: this.starred_items,
            };
            storage.set(STARRED_KEY, starred, true);
        },
        saveAll() {
            this.saveState();
            this.saveConfig();
            this.saveStarred();
        }
    }
});
