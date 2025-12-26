export interface AIRequestOptions {
    endpoint: string;
    apiKey: string;
    model: string;
    prompt: string;
    signal?: AbortSignal;
    onChunk?: (chunk: string) => void;
}

export class AIClient {
    private maxConcurrent: number;
    private running: number = 0;
    private queue: (() => void)[] = [];

    // Rate limiting
    private tokenUsage: number = 0;
    private lastResetTime: number = Date.now();
    private readonly MAX_TOKENS_PER_MINUTE = 250000;

    constructor(maxConcurrent: number = 3) {
        this.maxConcurrent = maxConcurrent;
    }

    async stream(options: AIRequestOptions): Promise<void> {
        if (this.running >= this.maxConcurrent) {
            await new Promise<void>((resolve) => {
                this.queue.push(resolve);
            });
        }

        this.running++;
        console.log(`Processing ${this.running}/${this.maxConcurrent}`);

        try {
            // Check rate limit before starting
            await this.checkRateLimit(options.prompt.length);
            await this.callAIStreamWithRetry(options);
        } finally {
            this.running--;
            const next = this.queue.shift();
            if (next) next();
        }
    }

    private async checkRateLimit(estimatedTokens: number): Promise<void> {
        const now = Date.now();
        if (now - this.lastResetTime > 60000) {
            this.tokenUsage = 0;
            this.lastResetTime = now;
        }

        // Simple estimation: 1 char ~= 1 token (conservative for Chinese/Code)
        // Or just track request size.
        // The user said "context size", which usually means input + output.
        // We only know input here. Let's assume input is the main factor or just track it.
        // Actually, the error is 429 Resource Exhausted, which might be RPM or TPM.
        // The user specifically mentioned "250k context size per minute".

        this.tokenUsage += estimatedTokens;

        if (this.tokenUsage > this.MAX_TOKENS_PER_MINUTE) {
            const waitTime = 60000 - (now - this.lastResetTime) + 1000; // Wait until next minute + buffer
            if (waitTime > 0) {
                console.warn(`[Rate Limit] Token usage (${this.tokenUsage}) exceeded ${this.MAX_TOKENS_PER_MINUTE}/min. Waiting ${Math.ceil(waitTime / 1000)}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                this.tokenUsage = 0;
                this.lastResetTime = Date.now();
            }
        }
    }

    private async callAIStreamWithRetry(options: AIRequestOptions, retries = 3): Promise<void> {
        try {
            await this.callAIStream(options);
        } catch (error: any) {
            if (retries > 0 && error.message.includes('429')) {
                console.warn(`[429 Too Many Requests] Quota exhausted. Waiting 60s before retrying... (Retries left: ${retries})`);
                await new Promise(resolve => setTimeout(resolve, 60000));
                return this.callAIStreamWithRetry(options, retries - 1);
            }
            throw error;
        }
    }

    private async callAIStream(options: AIRequestOptions): Promise<void> {
        const { endpoint, apiKey, model, prompt, signal, onChunk } = options;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
            }),
            signal,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
        }

        if (!response.body) {
            throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data.trim() === '[DONE]') continue;

                        try {
                            const json = JSON.parse(data);
                            const content = json.choices?.[0]?.delta?.content;
                            if (content && onChunk) onChunk(content);
                        } catch (e) {
                            // ignore parse errors for partial chunks
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }
}
