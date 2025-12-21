export interface Feed {
    name: string;
    id: string;
    url: string;
    avatar: string;
}

export interface FeedResponse {
    feed: Feed;
    version: string;
    list: FeedItemContent[];
}

export interface FeedItemContent {
    id: string;
    url: string;
    title?: string;
    content_text?: string;
    content_html?: string;
    summary?: string;
    image?: string;
    date_published: string;
    authors?: Author[];
    attachments?: Attachment[];
    tags?: string[];
    read?: boolean;
    ai_analysis?: AIAnalysisItem[];
    originText?: string;
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

export type AIAnalysisItem = {
    id: string;
    name: string;
    avatar: string;
    description: string;
    prompt: string;
    content: string | null;
};

export interface UserState {
    user: UserInfo;
    ai_config: UserAIConfig;
    subscribe_feed_url: string[];
    curr_feed: Feed | null;
    curr_version: string | null;
    curr_tweet_id: string | null;
    curr_tags: string[];
    starred_items: FeedItemContent[];
    category: TweetCategory;
}

export type TweetCategory = "none" | "author";

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