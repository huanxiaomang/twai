import fs from 'node:fs';
import path from 'node:path';
import type { AIClient } from './ai-client';
import {
    TRANSLATION_PROMPT,
    TAGS_GENERATION_PROMPT,
    TAGS_ASSIGNMENT_PROMPT,
    AI_BOT_PROMPT,
    OVERVIEW_PROMPT,
} from './prompts';

function appendLog(details: string) {
    const logFile = path.resolve(process.cwd(), 'ai_tasks.log');
    const time = new Date().toISOString();
    fs.appendFileSync(logFile, `[${time}]\n${details}\n--------------------------------------------------\n`);
}

/**
 * 通用批处理工具
 */
export async function batchProcess<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[], batchIndex: number) => Promise<R[]>,
    options: { disableBatch?: boolean; maxConcurrent?: number } = {}
): Promise<R[]> {
    if (options.disableBatch || items.length <= batchSize) {
        console.log(`[Batch] Processing all ${items.length} items (single batch)`);
        return processor(items, 0);
    }

    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
    }

    const results = new Array<R[]>(batches.length);
    const maxConcurrent = options.maxConcurrent || 5;
    let currentIndex = 0;
    let activeCount = 0;
    let completedBatches = 0;

    console.log(`[Batch] Total batches: ${batches.length}. Items per batch: ${batchSize}. Max Concurrent: ${maxConcurrent}`);

    return new Promise((resolve) => {
        const next = () => {
            if (currentIndex >= batches.length && activeCount === 0) {
                resolve(results.flat());
                return;
            }

            while (currentIndex < batches.length && activeCount < maxConcurrent) {
                const index = currentIndex++;
                const batch = batches[index];
                activeCount++;

                console.log(`[Batch] Starting Batch ${index + 1}/${batches.length} (Items: ${batch.length}, Active: ${activeCount})`);

                processor(batch, index)
                    .then(res => { results[index] = res; })
                    .catch(err => {
                        console.error(`Batch ${index + 1} failed:`, err);
                        results[index] = [];
                    })
                    .finally(() => {
                        activeCount--;
                        completedBatches++;
                        console.log(`[Batch] Finished Batch ${index + 1}/${batches.length}. Remaining: ${batches.length - completedBatches}`);
                        next();
                    });
            }
        };
        next();
    });
}

/**
 * 批量翻译
 */
export async function batchTranslate(
    items: { tw_id: string; content: string }[],
    batchSize: number,
    aiClient: AIClient,
    options: { endpoint: string; apiKey: string; model: string; disableBatch?: boolean; maxConcurrent?: number }
): Promise<{ tw_id: string; translated_content: string }[]> {
    return batchProcess(items, batchSize, async (batch) => {
        const prompt = TRANSLATION_PROMPT(JSON.stringify(batch));
        let responseText = '';

        try {
            await aiClient.stream({
                endpoint: options.endpoint,
                apiKey: options.apiKey,
                model: options.model,
                prompt,
                onChunk: (chunk) => { responseText += chunk; },
            });

            const match = responseText.match(/<Tranalate>([\s\S]*?)<\/Tranalate>/);
            const jsonStr = match ? match[1].trim() : responseText.trim();

            let parsed = { data: [] };
            try { parsed = JSON.parse(jsonStr); } catch { }

            return Array.isArray(parsed.data) ? parsed.data : [];
        } catch (e: any) {
            console.error('Translation batch failed:', e);
            appendLog(`Translation batch FAILED\nError: ${e.message}\nPrompt: ${prompt.slice(0, 1000)}`);
            return [];
        }
    }, { disableBatch: options.disableBatch, maxConcurrent: options.maxConcurrent });
}

/**
 * 批量打标签（分配）
 */
export async function batchAssignTags(
    items: { tw_id: string; content: string }[],
    tagsInfo: { tag_id: string; tag_name: string }[],
    batchSize: number,
    aiClient: AIClient,
    options: { endpoint: string; apiKey: string; model: string; disableBatch?: boolean; maxConcurrent?: number }
): Promise<{ tw_id: string; tags: string[] }[]> {
    return batchProcess(items, batchSize, async (batch) => {
        const prompt = TAGS_ASSIGNMENT_PROMPT(JSON.stringify(batch), JSON.stringify(tagsInfo));
        let responseText = '';

        try {
            await aiClient.stream({
                endpoint: options.endpoint,
                apiKey: options.apiKey,
                model: options.model,
                prompt,
                onChunk: (chunk) => { responseText += chunk; },
            });

            const match = responseText.match(/<TagsData>([\s\S]*?)<\/TagsData>/);
            const jsonStr = match ? match[1].trim() : responseText.trim();

            let parsed = { data: [] };
            try { parsed = JSON.parse(jsonStr); } catch { }

            return Array.isArray(parsed.data) ? parsed.data : [];
        } catch (e: any) {
            console.error('Tag assignment batch failed:', e);
            return [];
        }
    }, { disableBatch: options.disableBatch, maxConcurrent: options.maxConcurrent });
}

/**
 * 批量生成 AI Bot 内容（每个 bot 独立处理所有 items）
 */
export async function batchGenerateBotContent(
    items: { tw_id: string; content: string }[],
    bots: { bot_id: string; prompt: string }[],
    batchSize: number,
    aiClient: AIClient,
    options: { endpoint: string; apiKey: string; model: string; disableBatch?: boolean; maxConcurrent?: number }
): Promise<Record<string, Record<string, string>>> {
    const result: Record<string, Record<string, string>> = {};

    for (const bot of bots) {
        const botResults = await batchProcess(items, batchSize, async (batch) => {
            const prompt = AI_BOT_PROMPT(bot.prompt, JSON.stringify(batch));
            let responseText = '';

            try {
                await aiClient.stream({
                    endpoint: options.endpoint,
                    apiKey: options.apiKey,
                    model: options.model,
                    prompt,
                    onChunk: (chunk) => { responseText += chunk; },
                });

                const match = responseText.match(/<AIBOT>([\s\S]*?)<\/AIBOT>/);
                const jsonStr = match ? match[1].trim() : responseText.trim();

                let parsed = { data: [] };
                try { parsed = JSON.parse(jsonStr); } catch { }

                const validItems = Array.isArray(parsed.data) ? parsed.data : [];

                return validItems.map((item: any) => ({
                    tw_id: item.tw_id,
                    content: typeof item.md === 'string' ? item.md.trim() : '',
                }));
            } catch (e: any) {
                console.error(`Bot ${bot.bot_id} batch failed:`, e);
                return [];
            }
        }, { disableBatch: options.disableBatch, maxConcurrent: options.maxConcurrent });

        // 合并结果
        for (const { tw_id, content } of botResults.flat()) {
            if (content) {
                if (!result[tw_id]) result[tw_id] = {};
                result[tw_id][bot.bot_id] = content;
            }
        }
    }

    return result;
}