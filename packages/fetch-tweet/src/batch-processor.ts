import fs from 'node:fs';
import path from 'node:path';
import type { AIClient } from './ai-client';
import { AI_BOT_PROMPT } from './prompts';

function appendLog(details: string) {
    const logFile = path.resolve(process.cwd(), 'ai_tasks.log');
    const time = new Date().toISOString();
    fs.appendFileSync(logFile, `[${time}]\n${details}\n--------------------------------------------------\n`);
}

/**
 * Batch process items with parallel requests
 * @param items - Array of items to process
 * @param batchSize - Number of items per batch
 * @param processor - Function to process each batch
 * @returns Combined results from all batches
 */
export async function batchProcess<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[], batchIndex: number) => Promise<R[]>,
    options: { disableBatch?: boolean; maxConcurrent?: number } = {}
): Promise<R[]> {
    if (options.disableBatch) {
        console.log(`[Batch] Processing all ${items.length} items (Batching Disabled)`);
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

                console.log(`[Batch] Starting Batch ${index + 1}/${batches.length} (Items: ${batch.length}, Active Batches: ${activeCount})`);

                processor(batch, index)
                    .then(res => {
                        results[index] = res;
                    })
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
 * Process AI translation in batches
 */
export async function batchTranslate(
    items: { tw_id: string; content: string }[],
    batchSize: number,
    aiClient: AIClient,
    options: { endpoint: string; apiKey: string; model: string; prompt: (json: string) => string; disableBatch?: boolean; maxConcurrent?: number }
): Promise<{ tw_id: string; translated_content: string }[]> {
    return batchProcess(items, batchSize, async (batch, batchIndex) => {
        const prompt = options.prompt(JSON.stringify(batch));
        let aiResponseText = '';
        const startTime = Date.now();

        try {
            await aiClient.stream({
                endpoint: options.endpoint,
                apiKey: options.apiKey,
                model: options.model,
                prompt: prompt,
                onChunk: (chunk) => {
                    aiResponseText += chunk;
                }
            });

            const duration = Date.now() - startTime;
            appendLog(`Task: Translation (Batch ${batchIndex + 1})\nDuration: ${duration}ms\nPrompt: ${prompt.slice(0, 2000)}...\nResult: ${aiResponseText.slice(0, 2000)}...`);

            const match = aiResponseText.match(/<Tranalate>([\s\S]*?)<\/Tranalate>/);
            if (match && match[1]) {
                const translatedItems = JSON.parse(match[1])?.data ?? [];
                return Array.isArray(translatedItems) ? translatedItems : [];
            }
        } catch (e: any) {
            const duration = Date.now() - startTime;
            appendLog(`Task: Translation (Batch ${batchIndex + 1}) FAILED\nDuration: ${duration}ms\nError: ${e.message}\nPrompt: ${prompt.slice(0, 2000)}...`);
            console.error('Batch translation failed:', e);
        }

        return [];
    }, { disableBatch: options.disableBatch, maxConcurrent: options.maxConcurrent });
}

/**
 * Process AI tag assignment in batches
 */
export async function batchAssignTags(
    items: { tw_id: string; content: string }[],
    tagsInfo: { tag_id: string; tag_name: string }[],
    batchSize: number,
    aiClient: AIClient,
    options: { endpoint: string; apiKey: string; model: string; prompt: (itemsJson: string, tagsJson: string) => string; disableBatch?: boolean; maxConcurrent?: number }
): Promise<{ tw_id: string; tags: string[] }[]> {
    return batchProcess(items, batchSize, async (batch, batchIndex) => {
        const prompt = options.prompt(JSON.stringify(batch), JSON.stringify(tagsInfo));
        let aiResponseText = '';
        const startTime = Date.now();

        try {
            await aiClient.stream({
                endpoint: options.endpoint,
                apiKey: options.apiKey,
                model: options.model,
                prompt: prompt,
                onChunk: (chunk) => {
                    aiResponseText += chunk;
                }
            });

            const duration = Date.now() - startTime;
            appendLog(`Task: Tags Assignment (Batch ${batchIndex + 1})\nDuration: ${duration}ms\nPrompt: ${prompt.slice(0, 2000)}...\nResult: ${aiResponseText.slice(0, 2000)}...`);

            const match = aiResponseText.match(/<TagsData>([\s\S]*?)<\/TagsData>/);
            if (match && match[1]) {
                const taggedItems = JSON.parse(match[1])?.data ?? [];
                return Array.isArray(taggedItems) ? taggedItems : [];
            }
        } catch (e: any) {
            const duration = Date.now() - startTime;
            appendLog(`Task: Tags Assignment (Batch ${batchIndex + 1}) FAILED\nDuration: ${duration}ms\nError: ${e.message}\nPrompt: ${prompt.slice(0, 2000)}...`);
            console.error('Batch tag assignment failed:', e);
        }

        return [];
    }, { disableBatch: options.disableBatch, maxConcurrent: options.maxConcurrent });
}

/**
 * Process AI bot content generation in batches
 */
export async function batchGenerateBotContent(
    items: { tw_id: string; content: string }[],
    bots: { bot_id: string; prompt: string }[],
    batchSize: number,
    aiClient: AIClient,
    options: { endpoint: string; apiKey: string; model: string; disableBatch?: boolean; maxConcurrent?: number }
): Promise<Record<string, Record<string, string>>> {
    const result: Record<string, Record<string, string>> = {};

    // Process each bot separately
    for (const bot of bots) {
        const botResults = await batchProcess(items, batchSize, async (batch, batchIndex) => {
            // Process items in the batch concurrently (controlled by AIClient)
            const promises = batch.map(async (item) => {
                const prompt = AI_BOT_PROMPT(bot.prompt, item.content);
                let aiResponseText = '';
                const startTime = Date.now();

                try {
                    await aiClient.stream({
                        endpoint: options.endpoint,
                        apiKey: options.apiKey,
                        model: options.model,
                        prompt: prompt,
                        onChunk: (chunk) => {
                            aiResponseText += chunk;
                        }
                    });

                    const duration = Date.now() - startTime;
                    appendLog(`Task: Bot ${bot.bot_id} (Item ${item.tw_id})\nDuration: ${duration}ms\nPrompt: ${prompt.slice(0, 2000)}...\nResult: ${aiResponseText.slice(0, 2000)}...`);

                    const match = aiResponseText.match(/<AIBOT>([\s\S]*?)<\/AIBOT>/);
                    const content = match && match[1] ? match[1].trim() : aiResponseText.trim();

                    return { tw_id: item.tw_id, content };
                } catch (e: any) {
                    const duration = Date.now() - startTime;
                    appendLog(`Task: Bot ${bot.bot_id} (Item ${item.tw_id}) FAILED\nDuration: ${duration}ms\nError: ${e.message}\nPrompt: ${prompt.slice(0, 2000)}...`);
                    console.error(`Bot ${bot.bot_id} failed for ${item.tw_id}:`, e);
                    return { tw_id: item.tw_id, content: '' };
                }
            });

            return Promise.all(promises);
        }, { disableBatch: options.disableBatch, maxConcurrent: options.maxConcurrent });

        // Merge bot results
        for (const { tw_id, content } of botResults) {
            if (!content) continue; // Skip failed items
            if (!result[tw_id]) result[tw_id] = {};
            result[tw_id][bot.bot_id] = content;
        }
    }

    return result;
}
