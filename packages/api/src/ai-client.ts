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

        try {
            await this.callAIStream(options);
        } finally {
            this.running--;
            const next = this.queue.shift();
            if (next) next();
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
