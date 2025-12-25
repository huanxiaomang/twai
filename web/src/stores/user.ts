import { defineStore } from 'pinia';
import type {
    UserState,
    UserConfig,
    Feed,
    TweetItem,
    FeedResponse,
    FeedAIResponse,
    DateRange,
    UserInfo,
    UserAIConfig,
    TagInfo,
    Tweets
} from '@/types';
import { parseISO, isWithinInterval, subDays, isSameDay } from "date-fns";
import { storage } from '../../services/ls';
import { fetchFeedInfo, fetchFeedItem, fetchFeedsAIItem, fetchFeedOverview } from '../../services/request';
import { logger } from '../../services/logger';
import { toast } from 'vue-sonner';

const STATE_KEY = 'twai_user_state';
const CONFIG_KEY = 'twai_user_config';

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
    starred_items: {},
    show_video_download_prompt: true,
    auto_translate_chinese: true,
};

const initialState: UserState = {
    curr_feed: null,
    curr_tweet_id: null,
    curr_tags: [],
    date_range: "all",
    ai_panel_width: 25,
    outline_panel_width: 20,
    is_outline_visible: true,
    is_ai_panel_visible: true,
    scroll_offset: 10,
};

const CacheKeyFactory = {
    version: (url: string) => `feed_version_${url}`,
    data: (url: string, version: string) => `feed_data_${url}_${version}`,
    ai: (url: string, version: string) => `feed_ai_${url}_${version}`,
};

export const useUserStore = defineStore('user', {
    state: () => ({
        // UserState
        curr_feed: initialState.curr_feed,
        curr_tweet_id: initialState.curr_tweet_id,
        curr_tags: initialState.curr_tags,
        date_range: initialState.date_range,
        ai_panel_width: initialState.ai_panel_width,
        outline_panel_width: initialState.outline_panel_width,
        is_outline_visible: initialState.is_outline_visible,
        is_ai_panel_visible: initialState.is_ai_panel_visible,
        scroll_offset: initialState.scroll_offset,

        // UserConfig
        user: initialConfig.user,
        ai_config: initialConfig.ai_config,
        subscribe_feed_url: initialConfig.subscribe_feed_url,
        starred_items: initialConfig.starred_items,
        show_video_download_prompt: initialConfig.show_video_download_prompt,
        auto_translate_chinese: initialConfig.auto_translate_chinese,

        // Runtime State (Not persisted)
        feeds: [] as Feed[],
        feedItems: [] as TweetItem[],
        tagsInfo: [] as TagInfo[],
        feedAIAnalysis: {} as Record<string, string>,
        feedItemAIBotsContent: {} as Record<string, Record<string, string>>,
        isLoadingFeeds: false,
        isLoadingContent: false,
        isInternalScrolling: false,
        isInitialized: false,
    }),
    getters: {
        groupedFilteredItems(state): Tweets[] {
            // 1. First, get all items and filter them
            let list = [...state.feedItems];

            // Date Range Filter
            const range = state.date_range;
            if (range === "starred") {
                const feedId = state.curr_feed?.feed_id;
                list = list.filter((item) => {
                    return item && feedId && state.starred_items[feedId]?.includes(item.tw_id);
                });
            } else if (range === "last_day") {
                const now = new Date();
                const yesterday = subDays(now, 1);
                list = list.filter((item) => {
                    if (!item) return false;
                    const date = parseISO(item.date_published);
                    return isWithinInterval(date, { start: yesterday, end: now });
                });
            } else if (range === "last_week") {
                const now = new Date();
                const lastWeek = subDays(now, 7);
                list = list.filter((item) => {
                    if (!item) return false;
                    const date = parseISO(item.date_published);
                    return isWithinInterval(date, { start: lastWeek, end: now });
                });
            } else if (range !== "all" && range) {
                try {
                    const targetDate = parseISO(range);
                    list = list.filter((item) => {
                        if (!item) return false;
                        const itemDate = parseISO(item.date_published);
                        return isSameDay(itemDate, targetDate);
                    });
                } catch (e) {
                    console.error("Failed to filter by date:", range);
                }
            }

            // Tags Filter
            if (state.curr_tags.length > 0) {
                list = list.filter((item) => {
                    if (!item || !item.tags) return false;
                    return item.tags.some((tag) => state.curr_tags.includes(tag));
                });
            }

            // Sort by date (newest first)
            list.sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime());

            // 2. Group by author_id
            const groups: Tweets[] = [];
            const groupMap = new Map<string, Tweets>();

            list.forEach(item => {
                const authorId = item.author.author_id;
                if (!groupMap.has(authorId)) {
                    const newGroup: Tweets = {
                        author: item.author,
                        tweets: []
                    };
                    groupMap.set(authorId, newGroup);
                    groups.push(newGroup);
                }
                groupMap.get(authorId)!.tweets.push(item);
            });

            return groups;
        },
        filteredFeedItems(): TweetItem[] {
            return this.groupedFilteredItems.flatMap(group => group.tweets);
        },
        tagCounts(state): Record<string, number> {
            // Calculate counts based on items filtered by date range (but not tags)
            let list = [...state.feedItems];
            const range = state.date_range;

            if (range === "starred") {
                const feedId = state.curr_feed?.feed_id;
                list = list.filter((item) => feedId && state.starred_items[feedId]?.includes(item.tw_id));
            } else if (range === "last_day") {
                const now = new Date();
                const yesterday = subDays(now, 1);
                list = list.filter((item) => isWithinInterval(parseISO(item.date_published), { start: yesterday, end: now }));
            } else if (range === "last_week") {
                const now = new Date();
                const lastWeek = subDays(now, 7);
                list = list.filter((item) => isWithinInterval(parseISO(item.date_published), { start: lastWeek, end: now }));
            } else if (range !== "all" && range) {
                try {
                    const targetDate = parseISO(range);
                    list = list.filter((item) => isSameDay(parseISO(item.date_published), targetDate));
                } catch (e) { }
            }

            const counts: Record<string, number> = {};
            list.forEach(item => {
                if (!item) return;
                item.tags?.forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            });
            return counts;
        }
    },
    actions: {
        async init() {
            if (this.isInitialized) return;

            const [savedState, savedConfig] = await Promise.all([
                storage.get<UserState>(STATE_KEY),
                storage.get<UserConfig>(CONFIG_KEY)
            ]);

            if (savedState) {
                this.curr_feed = savedState.curr_feed ?? initialState.curr_feed;
                this.curr_tweet_id = savedState.curr_tweet_id ?? initialState.curr_tweet_id;
                this.curr_tags = savedState.curr_tags ?? initialState.curr_tags;
                this.date_range = savedState.date_range ?? initialState.date_range;
                this.ai_panel_width = savedState.ai_panel_width ?? initialState.ai_panel_width;
                this.outline_panel_width = savedState.outline_panel_width ?? initialState.outline_panel_width;
                this.is_outline_visible = savedState.is_outline_visible ?? initialState.is_outline_visible;
                this.is_ai_panel_visible = savedState.is_ai_panel_visible ?? initialState.is_ai_panel_visible;
                this.scroll_offset = savedState.scroll_offset ?? initialState.scroll_offset;
            }

            if (savedConfig) {
                this.user = savedConfig.user ?? initialConfig.user;
                this.ai_config = savedConfig.ai_config ?? initialConfig.ai_config;
                this.subscribe_feed_url = savedConfig.subscribe_feed_url ?? initialConfig.subscribe_feed_url;
                this.starred_items = savedConfig.starred_items ?? initialConfig.starred_items;
                this.show_video_download_prompt = savedConfig.show_video_download_prompt ?? initialConfig.show_video_download_prompt;
                this.auto_translate_chinese = savedConfig.auto_translate_chinese ?? initialConfig.auto_translate_chinese;
            }

            this.isInitialized = true;
        },
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
            const startTime = Date.now();
            try {
                // 1. Get latest version info
                await this.fetchAllFeedsInfo();
                const feed = this.feeds.find(f => f.feed_url === feedUrl);
                const version = feed?.version || 'unknown';

                const vKey = CacheKeyFactory.version(feedUrl);
                const dKey = CacheKeyFactory.data(feedUrl, version);
                const aKey = CacheKeyFactory.ai(feedUrl, version);

                // 2. Handle version invalidation
                const oldVersion = await storage.get<string>(vKey);
                if (oldVersion && oldVersion !== version) {
                    await storage.remove(CacheKeyFactory.data(feedUrl, oldVersion));
                    await storage.remove(CacheKeyFactory.ai(feedUrl, oldVersion));
                }
                await storage.set(vKey, version, true);

                // 3. Parallel Fetch (Cache or Network)
                const [dataRes, aiRes] = await Promise.all([
                    (async () => {
                        const cached = await storage.get<FeedResponse>(dKey);
                        if (cached) return cached;
                        const res = await fetchFeedItem(feedUrl);
                        await storage.set(dKey, res);
                        return res;
                    })(),
                    (async () => {
                        const cached = await storage.get<FeedAIResponse>(aKey);
                        if (cached) return cached;
                        const res = await fetchFeedsAIItem(feedUrl);
                        await storage.set(aKey, res);
                        return res;
                    })()
                ]);

                // 4. Update State
                this.feedItems = dataRes.list.flatMap((group: any) => group.tweets);

                this.tagsInfo = dataRes.tags_info ?? [];
                if (dataRes.feed) {
                    this.curr_feed = dataRes.feed;
                }
                this.feedAIAnalysis = {};
                this.feedItemAIBotsContent = aiRes.feed_item_ai_bots_content ?? {};


            } catch (error) {
                logger.error('获取订阅源详情失败', error, { showToast: true });
            } finally {
                const elapsed = Date.now() - startTime;
                const minDelay = 300;
                if (elapsed < minDelay) {
                    await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
                }
                this.isLoadingContent = false;
            }
        },

        async fetchOverview(date: string) {
            if (!this.curr_feed) return;
            // Check if already in memory state
            if (this.feedAIAnalysis[date]) return;

            const feedUrl = this.curr_feed.feed_url;
            const version = this.curr_feed.version || 'unknown';
            const cacheKey = `feed_ai_overview_${feedUrl}_${version}_${date}`;

            // Check persistent storage
            const cached = await storage.get<string>(cacheKey);
            if (cached) {
                this.feedAIAnalysis = {
                    ...this.feedAIAnalysis,
                    [date]: cached
                };
                return;
            }

            try {
                const res = await fetchFeedOverview(feedUrl, date);
                if (res && res[date]) {
                    this.feedAIAnalysis = {
                        ...this.feedAIAnalysis,
                        [date]: res[date]
                    };
                    // Save to persistent storage
                    await storage.set(cacheKey, res[date]);
                }
            } catch (e) {
                console.error("Failed to fetch overview:", e);
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
        setOutlinePanelWidth(width: number) {
            this.outline_panel_width = width;
            this.saveState();
        },
        toggleOutline() {
            this.is_outline_visible = !this.is_outline_visible;
            this.saveState();
        },
        toggleAIPanel() {
            this.is_ai_panel_visible = !this.is_ai_panel_visible;
            this.saveState();
        },
        setInternalScrolling(val: boolean) {
            this.isInternalScrolling = val;
        },
        setScrollOffset(val: number) {
            this.scroll_offset = val;
            this.saveState();
        },
        jumpToTweet(id: string) {
            const exists = this.filteredFeedItems.some(item => item.tw_id === id);
            if (!exists) {
                toast.error("未在当前筛选结果中找到该推文");
                return;
            }

            this.setInternalScrolling(true);
            this.setCurrTweetId(id);
            const el = document.getElementById(`post-${id}`);
            const container = document.querySelector(
                ".h-full.bg-background.overflow-y-auto"
            );
            if (el && container) {
                const targetScrollTop = el.offsetTop - this.scroll_offset;
                container.scrollTo({ top: targetScrollTop, behavior: "smooth" });
            }
            setTimeout(() => {
                this.setInternalScrolling(false);
            }, 1000);
        },
        setVideoDownloadPrompt(val: boolean) {
            this.show_video_download_prompt = val;
            this.saveConfig();
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
        toggleStarred(item: TweetItem) {
            const feedId = this.curr_feed?.feed_id;
            if (!feedId) return;
            if (!this.starred_items[feedId]) {
                this.starred_items[feedId] = [];
            }
            const index = this.starred_items[feedId].indexOf(item.tw_id);
            if (index > -1) {
                this.starred_items[feedId].splice(index, 1);
            } else {
                this.starred_items[feedId].push(item.tw_id);
            }
            this.saveConfig();
        },

        // Data Management
        importConfig(json: string) {
            try {
                const config = JSON.parse(json) as UserConfig;
                if (config.user && config.ai_config && Array.isArray(config.subscribe_feed_url)) {
                    this.user = config.user;
                    this.ai_config = config.ai_config;
                    this.subscribe_feed_url = config.subscribe_feed_url;
                    this.starred_items = config.starred_items || {};
                    this.saveConfig();
                    this.fetchAllFeedsInfo();
                    return true;
                }
            } catch (e) {
                logger.error('导入配置失败', e);
            }
            return false;
        },

        // Persistence
        async saveState() {
            const state: UserState = {
                curr_feed: this.curr_feed,
                curr_tweet_id: this.curr_tweet_id,
                curr_tags: this.curr_tags,
                date_range: this.date_range,
                ai_panel_width: this.ai_panel_width,
                outline_panel_width: this.outline_panel_width,
                is_outline_visible: this.is_outline_visible,
                is_ai_panel_visible: this.is_ai_panel_visible,
                scroll_offset: this.scroll_offset,
            };
            await storage.set(STATE_KEY, state, true);
        },
        async saveConfig() {
            const config: UserConfig = {
                user: this.user,
                ai_config: this.ai_config,
                subscribe_feed_url: this.subscribe_feed_url,
                starred_items: this.starred_items,
                show_video_download_prompt: this.show_video_download_prompt,
                auto_translate_chinese: this.auto_translate_chinese,
            };
            await storage.set(CONFIG_KEY, config, true);
        },
        async saveAll() {
            await Promise.all([this.saveState(), this.saveConfig()]);
        }
    }
});
