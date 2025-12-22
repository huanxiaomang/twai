export interface Feed {
    name: string;
    feed_id: string;
    feed_url: string;
    avatar: string;
    ai_bots?: AIBotItem[];
    version: string;
}

export interface FeedAIResponse {
    feed_ai_analysis: Record<string, string>; // Overview, summary, etc.
    feed_item_ai_bots_content?: Record<string, Record<string, string>>; // tw_id -> bot_id -> content
}

export interface FeedResponse {
    feed: Feed;
    list: FeedItemContent[];
    tags_info?: TagInfo[];
    feed_ai_analysis: Record<string, string>; // Overview, summary, etc.
    feed_item_ai_bots_content?: Record<string, Record<string, string>>; // tw_id -> bot_id -> content
}

export interface FeedItemContent {
    tw_id: string;
    url: string;
    title?: string;
    content_text?: string;
    image?: string;
    date_published: string;
    authors?: Author[];
    attachments?: Attachment[];
    tags?: string[];
    is_translated: boolean;
    rawText?: string;
}

export interface TagInfo {
    tag_id: string;
    tag_name: string;
    tag_count: number;
}

export interface Author {
    name: string;
    url?: string;
    avatar?: string;
}

export interface Attachment {
    url: string;
    mime_type?: string;
    title?: string;
}

export type AIBotItem = {
    bot_id: string;
    name: string;
    avatar: string;
    description?: string;
    prompt: string;
};

export interface UserState {
    curr_feed: Feed | null;
    curr_tweet_id: string | null;
    curr_tags: string[];
    date_range: DateRange;
    ai_panel_width: number;
}

export interface UserConfig {
    user: UserInfo;
    ai_config: UserAIConfig;
    subscribe_feed_url: string[];
}

export interface UserStarredItem {
    starred_items: FeedItemContent[];
}

export type DateRange = "all" | "starred" | "last_day" | "last_week" | (string & {});

export interface UserInfo {
    name: string;
    email: string;
    avatar: string;
}

export interface UserAIConfig {
    model: string;
    end_point: string;
    api_key: string;
}