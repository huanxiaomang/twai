import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { zlib, strToU8 } from 'fflate';
import { AIClient } from './ai-client';
import { batchTranslate, batchAssignTags, batchGenerateBotContent } from './batch-processor';
import { TRANSLATION_PROMPT, TAGS_GENERATION_PROMPT, TAGS_ASSIGNMENT_PROMPT, OVERVIEW_PROMPT } from './prompts';

let sharedClient: AIClient;

export interface Author {
    author_id: string;
    author_name: string;
    author_favicon: string;
}

export interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

export interface TweetItem {
    tw_id: string;
    url: string;
    content: string;
    originText: string;
    date_published: string;
    author: Author;
    authors: { name: string }[];
    media: MediaItem[];
    is_rt: boolean;
    is_translated: boolean;
    tags: string[];
}

export interface AIBotItem {
    bot_id: string;
    name: string;
    avatar: string;
    description?: string;
    prompt: string;
}

export interface FetchOptions {
    feed_info: {
        name: string;
        feed_id: string;
        feed_url: string;
        avatar: string;
        version: string;
    }
    rss_urls: string[];
    ai_bots: AIBotItem[];
    model: string;
    end_point: string;
    apikey: string;
    overview_day?: string;
    batch_size?: number;
    max_concurrent?: number;
    no_batch?: boolean;
}

export interface Feed {
    name: string;
    feed_id: string;
    feed_url: string;
    avatar: string;
    ai_bots?: AIBotItem[];
    version: string;
    list?: TweetItem[];
    overview_prompt?: string;
    tags_info?: { tag_id: string; tag_name: string }[];
}

export type FeedResult = [Feed, Record<string, Record<string, string>>];

/**
 * Helper to convert Uint8Array to Base64
 */
function uint8ToBase64(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('base64');
}

/**
 * Clean tweet content by removing the common RSS suffix: "— Name (@handle) Date"
 */
function cleanContent(text: string): string {
    if (!text) return '';
    // Match the suffix pattern: — Name (@handle) Month Day, Year or similar
    // Example: — Evan You (@youyuxi) Dec 23, 2025
    const suffixRegex = /—\s+.*?\s+\(@.*?\)\s+\w+\s+\d{1,2},\s+\d{4}$/;
    const suffixRegexAlt = /—\s+.*?\s+\(@.*?\)\s+.*$/; // More aggressive fallback

    let cleaned = text.replace(suffixRegex, '').trim();
    if (cleaned === text) {
        cleaned = text.replace(suffixRegexAlt, '').trim();
    }

    // Remove trailing " Video" text
    cleaned = cleaned.replace(/\s+Video$/i, '').trim();

    return cleaned;
}

/**
 * Process attachments to determine media type
 */
function processMedia(item: any): MediaItem[] {
    const media: MediaItem[] = [];

    // Check if content ends with " Video" to determine if it's a video
    const hasVideoSuffix = item.content_text && /\s+Video$/i.test(item.content_text);

    // Check image field (common in rss.app)
    if (item.image) {
        const isVideo = hasVideoSuffix || item.image.includes('video_thumb') || item.image.includes('amplify_video_thumb');
        media.push({
            url: item.image,
            type: isVideo ? 'video' : 'image'
        });
    }

    // Check attachments array
    if (Array.isArray(item.attachments)) {
        item.attachments.forEach((att: any) => {
            if (!att.url) return;
            // If we already added this URL from item.image, skip
            if (media.some(m => m.url === att.url)) return;

            const isVideo = hasVideoSuffix || att.url.includes('video_thumb') || att.url.includes('amplify_video_thumb');
            media.push({
                url: att.url,
                type: isVideo ? 'video' : 'image'
            });
        });
    }

    return media;
}

/**
 * Extract author info from feed metadata
 */
function extractSourceAuthor(feed: any): Author {
    const homePage = feed.home_page_url || '';
    const handleMatch = homePage.match(/x\.com\/([^\/]+)/) || homePage.match(/twitter\.com\/([^\/]+)/);
    const handle = handleMatch ? handleMatch[1] : 'unknown';

    return {
        author_id: `@${handle}`,
        author_name: handle,
        author_favicon: `https://unavatar.io/x/${handle}`
    };
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url);
            if (res.ok) return res;
            throw new Error(`Status ${res.status}`);
        } catch (e) {
            console.error(`Fetch failed for ${url} (Attempt ${i + 1}/${retries + 1}):`, e);
            if (i === retries) throw e;
        }
    }
    throw new Error('Unreachable');
}

export async function fetchAndFormat(options: FetchOptions) {
    const allItems: TweetItem[] = [];

    // 1. Fetch RSS with Retry
    for (const url of options.rss_urls) {
        try {
            console.log(`Fetching RSS: ${url}`);
            const response = await fetchWithRetry(url);
            const feed = await response.json();
            const sourceAuthor = extractSourceAuthor(feed);

            const items = feed.items || [];
            for (const item of items) {
                const isRt = (item.content || '').startsWith('RT by @');
                const content = cleanContent(item.content_text || '');
                const formattedItem: TweetItem = {
                    tw_id: item.id,
                    url: item.url,
                    content: content,
                    originText: '',
                    date_published: item.date_published,
                    author: sourceAuthor,
                    authors: item.authors || [],
                    media: processMedia(item),
                    is_rt: isRt,
                    is_translated: false,
                    tags: []
                };

                allItems.push(formattedItem);
            }
        } catch (error) {
            console.error(`Error processing ${url}:`, error);
            process.exit(1);
        }
    }

    // 2. Deduplication (Removed as per requirement)
    const uniqueItems = allItems;

    // 3. Parallel AI Tasks
    if (!sharedClient) {
        sharedClient = new AIClient(options.max_concurrent);
    }
    const aiClient = sharedClient;
    const batchSize = options.batch_size || 15;
    const commonAiOptions = {
        endpoint: options.end_point,
        apiKey: options.apikey,
        model: options.model
    };

    // Task A: Translation
    const translationTask = (async () => {
        const itemsToTranslate = uniqueItems.map(item => ({
            tw_id: item.tw_id,
            content: item.content
        }));

        console.log('Starting AI translation...');
        const translatedResults = await batchTranslate(
            itemsToTranslate,
            batchSize,
            aiClient,
            {
                ...commonAiOptions,
                prompt: TRANSLATION_PROMPT,
                disableBatch: options.no_batch,
                maxConcurrent: options.max_concurrent
            },
        );

        console.log(`\nAI translation finished. Processed ${translatedResults.length} items.`);

        for (const tItem of translatedResults) {
            const originalItem = uniqueItems.find(i => i.tw_id === tItem.tw_id);
            if (originalItem) {
                originalItem.originText = originalItem.content;
                originalItem.content = tItem.translated_content;
                originalItem.is_translated = true;
            }
        }
    })();

    // Task B: Tags (Step 1 & 2)
    let generatedTagsInfo: { tag_id: string; tag_name: string }[] = [];
    const tagsTask = (async () => {
        // Step 1: Generate Tags Info
        const contentForTags = uniqueItems.map(i => i.content.slice(0, 30));
        const step1Prompt = TAGS_GENERATION_PROMPT(JSON.stringify(contentForTags));

        let step1Response = '';
        console.log('Starting Tag Generation (Step 1)...');
        try {
            await aiClient.stream({
                ...commonAiOptions,
                prompt: step1Prompt,
                onChunk: (chunk) => step1Response += chunk
            });
            const match1 = step1Response.match(/<TagsInfo>([\s\S]*?)<\/TagsInfo>/);
            if (match1 && match1[1]) {
                const parsed = JSON.parse(match1[1]);
                if (parsed.tags_info) {
                    generatedTagsInfo = parsed.tags_info;
                    // Ensure "other" tag exists
                    if (!generatedTagsInfo.some(t => t.tag_id === 'other')) {
                        generatedTagsInfo.push({ tag_id: "other", tag_name: "其他" });
                    }
                }
            }
        } catch (e) {
            console.error('Tag Generation Step 1 failed:', e);
            return; // Cannot proceed to step 2
        }

        // Step 2: Assign Tags
        if (generatedTagsInfo.length === 0) return;

        const itemsForTagging = uniqueItems.map(i => ({
            tw_id: i.tw_id,
            content: i.content.slice(0, 50)
        }));

        console.log('Starting Tag Assignment (Step 2)...');
        const taggedResults = await batchAssignTags(
            itemsForTagging,
            generatedTagsInfo,
            batchSize,
            aiClient,
            {
                ...commonAiOptions,
                prompt: TAGS_ASSIGNMENT_PROMPT,
                disableBatch: options.no_batch,
                maxConcurrent: options.max_concurrent
            }
        );

        console.log(`Tag Assignment finished. Processed ${taggedResults.length} items.`);

        for (const itemTag of taggedResults) {
            const originalItem = uniqueItems.find(i => i.tw_id === itemTag.tw_id);
            if (originalItem && Array.isArray(itemTag.tags)) {
                originalItem.tags = itemTag.tags;
            }
        }
    })();

    // Task C: AI Bots
    let feed_item_ai_bots_content: Record<string, Record<string, string>> = {};
    const botsTask = (async () => {
        const bots = options.ai_bots || [];
        if (bots.length === 0) return;

        const itemsForBots = uniqueItems.map(i => ({
            tw_id: i.tw_id,
            content: i.content
        }));

        console.log('Starting AI Bots generation...');
        feed_item_ai_bots_content = await batchGenerateBotContent(
            itemsForBots,
            bots.map(b => ({ bot_id: b.bot_id, prompt: b.prompt })),
            batchSize,
            aiClient,
            {
                ...commonAiOptions,
                disableBatch: options.no_batch,
                maxConcurrent: options.max_concurrent
            }
        );
        console.log('AI Bots generation finished.');
    })();

    // Wait for all tasks
    await Promise.all([tagsTask, translationTask, botsTask]);

    // Sort by date descending
    uniqueItems.sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime());

    return [{
        ...options.feed_info,
        ai_bots: options.ai_bots,
        list: uniqueItems,
        tags_info: generatedTagsInfo.length > 0 ? generatedTagsInfo : (options.feed_info as any).tags_info || [],
    }, feed_item_ai_bots_content] as FeedResult;
}

export async function generateOverview(items: TweetItem[], options: FetchOptions, client?: AIClient) {
    if (!options.overview_day) return {};

    const day = options.overview_day;
    // Filter items by day (assuming date_published is ISO string and we match YYYY-MM-DD)
    const filteredItems = items.filter(item => item.date_published.startsWith(day));

    if (filteredItems.length === 0) {
        console.log(`No items found for overview day: ${day}`);
        return {
            overview: {
                [day]: '[NO POSTS]'
            }
        };
    }

    const itemsForPrompt = filteredItems.map(item => ({
        tw_id: item.tw_id,
        content: item.content.slice(0, 250)
    }));

    const prompt = OVERVIEW_PROMPT(day, JSON.stringify(itemsForPrompt));

    const aiClient = client || sharedClient || new AIClient(options.max_concurrent);
    let aiResponseText = '';

    console.log('Starting Overview Generation...');
    try {
        await aiClient.stream({
            endpoint: options.end_point,
            apiKey: options.apikey,
            model: options.model,
            prompt: prompt,
            onChunk: (chunk) => {
                aiResponseText += chunk;
            }
        });
        console.log('\nOverview Generation finished.');

        return {
            overview: {
                [day]: aiResponseText
            }
        };
    } catch (e) {
        console.error('Overview Generation failed:', e);
        return {};
    }
}


if (process.argv[1] === import.meta.url || process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.mjs') || process.argv[1]?.endsWith('index.cjs')) {
    (async () => {
        try {
            // 1. Configuration Loading
            const configPath = process.env.FEED_CONFIG_PATH || process.argv[2];
            const resolvedConfigPath = path.resolve(process.cwd(), configPath);
            let options: FetchOptions;

            console.log(`Loading config from: ${configPath}`);
            const configFile = await fs.readFile(resolvedConfigPath, 'utf-8');
            const config = JSON.parse(configFile);

            // Increment version
            const currentVersion = parseInt(config.version, 10) || 0;
            const newVersion = (currentVersion + 1).toString();
            config.version = newVersion;
            console.log(`Version updated: ${currentVersion} -> ${newVersion}`);

            // Write updated config back to file
            await fs.writeFile(resolvedConfigPath, JSON.stringify(config, null, 2), 'utf-8');
            console.log(`Config updated at: ${resolvedConfigPath}`);

            if (!process.env.AI_MODEL) {
                console.log('AI_MODEL is not set');
            }
            if (!process.env.AI_ENDPOINT) {
                console.log('AI_ENDPOINT is not set');
            }
            if (!process.env.AI_API_KEY) {
                console.log('AI_API_KEY is not set');
            }

            options = {
                rss_urls: config.rss_urls,
                feed_info: {
                    name: config.name,
                    feed_id: config.feed_id,
                    feed_url: config.feed_url,
                    avatar: config.avatar,
                    version: newVersion, // Use the new version
                },
                ai_bots: config.ai_bots,
                model: process.env.AI_MODEL!,
                end_point: process.env.AI_ENDPOINT!,
                apikey: process.env.AI_API_KEY!,
                batch_size: config.batch_size || 20,
                max_concurrent: config.max_concurrent || 5,
            };

            // 2. Execution
            const res = await fetchAndFormat(options);
            const [feed, feed_item_ai_bots_content] = res;

            // 3. Output Handling
            const outputDir = process.env.OUTPUT_DIR ? path.resolve(process.cwd(), process.env.OUTPUT_DIR) : path.resolve(process.cwd(), 'cache');
            await fs.mkdir(outputDir, { recursive: true });

            // Helper function for compression
            const compressData = (data: string): Promise<Uint8Array> => {
                return new Promise<Uint8Array>((resolve, reject) => {
                    zlib(strToU8(data), { level: 9 }, (err, compressed) => {
                        if (err) reject(err);
                        else resolve(compressed);
                    });
                });
            };

            // Save Main Feed (Compressed)
            const feedContentPath = path.join(outputDir, 'FEED_CONTENT');
            const feedCompressed = await compressData(JSON.stringify(feed));
            await fs.writeFile(feedContentPath, feedCompressed);
            console.log(`Saved compressed feed to: ${feedContentPath}`);

            // Save AI Bots Content (Compressed)
            if (feed_item_ai_bots_content) {
                const botsContentPath = path.join(outputDir, 'FEED_AI_BOT');
                const botsCompressed = await compressData(JSON.stringify(feed_item_ai_bots_content, null, 2));
                await fs.writeFile(botsContentPath, botsCompressed);
                console.log(`Saved compressed AI bots content to: ${botsContentPath}`);
            }

            // Save Overview (Compressed)
            if (feed.list && feed.list.length > 0) {
                const today = new Date();
                const yesterday = new Date(Date.UTC(
                    today.getUTCFullYear(),
                    today.getUTCMonth(),
                    today.getUTCDate() - 1
                ));

                const overviewDay = process.env.OVERVIEW_DAY || yesterday.toISOString().split('T')[0];
                const overviewOptions = { ...options, overview_day: overviewDay };

                console.log(`Generating overview for day: ${overviewDay}`);
                const overviewResult = await generateOverview(feed.list, overviewOptions);

                if (overviewResult.overview) {
                    const overviewFilename = `FEED_AI_OVERVIEW_${overviewDay.replace(/-/g, '_')}`;
                    const overviewPath = path.join(outputDir, overviewFilename);
                    const overviewCompressed = await compressData(JSON.stringify(overviewResult.overview, null, 2));
                    await fs.writeFile(overviewPath, overviewCompressed);
                    console.log(`Saved compressed overview to: ${overviewPath}`);
                }
            }

        } catch (error) {
            console.error('Execution failed:', error);
            process.exit(1);
        }
    })();
}
