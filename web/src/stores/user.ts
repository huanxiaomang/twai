import { defineStore } from 'pinia';
import type { UserState, Feed, FeedItemContent, TweetCategory, UserAIConfig } from '@/types';
import { storage } from '../../services/ls';

const STORAGE_KEY = 'twai_user_state';

const initialState: UserState = {
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
    curr_feed: null,
    curr_version: null,
    curr_tweet_id: null,
    curr_tags: [],
    starred_items: [],
    category: "none",
};

export const useUserStore = defineStore('user', {
    state: (): UserState => {
        const savedState = storage.get<UserState>(STORAGE_KEY);
        if (savedState) {
            // Merge saved state with initial state to ensure new fields are present
            return {
                ...initialState,
                ...savedState,
                user: { ...initialState.user, ...savedState.user },
                ai_config: { ...initialState.ai_config, ...savedState.ai_config },
            };
        }
        return initialState;
    },
    actions: {
        setCurrFeed(feed: Feed | null) {
            this.curr_feed = feed;
            this.save();
        },
        setCurrVersion(version: string | null) {
            this.curr_version = version;
            this.save();
        },
        setCurrTweetId(id: string | null) {
            this.curr_tweet_id = id;
            this.save();
        },
        setCurrTags(tags: string[]) {
            this.curr_tags = tags;
            this.save();
        },
        toggleStarred(item: FeedItemContent) {
            const index = this.starred_items.findIndex(i => i.id === item.id);
            if (index > -1) {
                this.starred_items.splice(index, 1);
            } else {
                this.starred_items.push({ ...item, read: true });
            }
            this.save();
        },
        setCategory(category: TweetCategory) {
            this.category = category;
            this.save();
        },
        save() {
            storage.set(STORAGE_KEY, this.$state, true);
        }
    }
});
