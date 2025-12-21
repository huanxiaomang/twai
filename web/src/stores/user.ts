import { defineStore } from 'pinia';
import type {
    UserState,
    UserConfig,
    UserStarredItem,
    Feed,
    FeedItemContent,
    DateRange,
    UserInfo,
    UserAIConfig
} from '@/types';
import { storage } from '../../services/ls';

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
};

const initialStarred: UserStarredItem = {
    starred_items: [],
};

export const useUserStore = defineStore('user', {
    state: () => {
        const savedState = storage.get<UserState>(STATE_KEY);
        const savedConfig = storage.get<UserConfig>(CONFIG_KEY);
        const savedStarred = storage.get<UserStarredItem>(STARRED_KEY);

        return {
            // UserState
            curr_feed: savedState?.curr_feed ?? initialState.curr_feed,
            curr_tweet_id: savedState?.curr_tweet_id ?? initialState.curr_tweet_id,
            curr_tags: savedState?.curr_tags ?? initialState.curr_tags,
            date_range: savedState?.date_range ?? initialState.date_range,

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
                const { fetchFeedInfo } = await import('../../services/mock');
                const feedPromises = this.subscribe_feed_url.map(url => fetchFeedInfo(url));
                this.feeds = await Promise.all(feedPromises);
            } catch (error) {
                console.error('Failed to fetch feeds info:', error);
            } finally {
                this.isLoadingFeeds = false;
            }
        },

        async fetchFeedData(feedUrl: string) {
            this.isLoadingContent = true;
            try {
                const { fetchFeedItem } = await import('../../services/mock');
                const response = await fetchFeedItem(feedUrl);
                this.feedItems = response.list;
                // Optionally update curr_feed if it's different or missing info
                if (response.feed) {
                    this.curr_feed = response.feed;
                }
            } catch (error) {
                console.error('Failed to fetch feed data:', error);
            } finally {
                this.isLoadingContent = false;
            }
        },

        async fetchFeedsAIData(feedUrl: string) {
            try {
                const { fetchFeedsAIItem } = await import('../../services/mock');
                const response = await fetchFeedsAIItem(feedUrl);
                this.feedAIAnalysis = response.feed_ai_analysis;
                this.feedItemAIBotsContent = response.feed_item_ai_bots_content ?? {};
            } catch (error) {
                console.error('Failed to fetch feed AI data:', error);
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
