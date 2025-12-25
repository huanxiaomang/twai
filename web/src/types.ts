export interface Author {
    author_id: string;
    author_name: string;
    author_favicon: string;
}

export interface TagInfo {
    tag_id: string;
    tag_name: string;
}

export interface Feed {
    name: string;
    feed_id: string;
    feed_url: string;
    avatar: string;
    ai_bots?: AIBotItem[];
    version: string;
}

export interface FeedAIResponse {
    overview?: Record<string, string>;  // date -> content
    feed_item_ai_bots_content?: Record<string, Record<string, string>>; // tw_id -> bot_id -> content
}

export interface MediaItem {
    url: string;              // 媒体资源的缩略图 URL（RSS 中提供的）
    type: 'image' | 'video';  // 单个媒体项 of type: image or video
}

export interface TweetItem {
    tw_id: string;                  // 原始推文的 ID
    author: Author;
    authors: {
        name: string;
    }[];                            // 如果是转发贴，里面的第一项的name就是被转发的原帖的作者id
    url: string;                    // 推文完整链接
    content: string;                // 提取后的纯正文文本（保留换行，无签名、无 RT 前缀）
    originText: string;             // 如果被翻译，翻译前的原文
    date_published: string;         // ISO 格式发布时间
    media: MediaItem[];             // 媒体信息，支持精确区分图片/视频及混排
    is_rt: boolean;                 // 是否为转发帖
    original_id?: string;           // 可选：如果是带评论的转发，可记录原帖 ID
    is_translated?: boolean;        // 是否已翻译，翻译文本覆盖content
    tags?: string[];                // 自动提取的标签数组
}

export interface Tweets {
    author: Author;
    tweets: TweetItem[];
};

export interface FeedResponse {
    feed: Feed;
    list: Tweets[];
    tags_info?: TagInfo[];
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
    outline_panel_width: number;
    is_outline_visible: boolean;
    is_ai_panel_visible: boolean;
    scroll_offset: number;
}

export interface UserConfig {
    user: UserInfo;
    ai_config: UserAIConfig;
    subscribe_feed_url: string[];
    starred_items: Record<string, string[]>; // feed_id -> tw_id
    show_video_download_prompt: boolean;
    auto_translate_chinese: boolean;
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
