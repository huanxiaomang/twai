'use strict';

const fs$1 = require('node:fs/promises');
const path = require('node:path');
const node_url = require('node:url');
const fflate = require('fflate');
const fs = require('node:fs');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const fs__default$1 = /*#__PURE__*/_interopDefaultCompat(fs$1);
const path__default = /*#__PURE__*/_interopDefaultCompat(path);
const fs__default = /*#__PURE__*/_interopDefaultCompat(fs);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class AIClient {
  constructor(maxConcurrent = 3) {
    __publicField(this, "maxConcurrent");
    __publicField(this, "running", 0);
    __publicField(this, "queue", []);
    // Rate limiting
    __publicField(this, "tokenUsage", 0);
    __publicField(this, "lastResetTime", Date.now());
    __publicField(this, "MAX_TOKENS_PER_MINUTE", 25e4);
    this.maxConcurrent = maxConcurrent;
  }
  async stream(options) {
    if (this.running >= this.maxConcurrent) {
      await new Promise((resolve) => {
        this.queue.push(resolve);
      });
    }
    this.running++;
    console.log(`Processing ${this.running}/${this.maxConcurrent}`);
    try {
      await this.checkRateLimit(options.prompt.length);
      await this.callAIStreamWithRetry(options);
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next)
        next();
    }
  }
  async checkRateLimit(estimatedTokens) {
    const now = Date.now();
    if (now - this.lastResetTime > 6e4) {
      this.tokenUsage = 0;
      this.lastResetTime = now;
    }
    this.tokenUsage += estimatedTokens;
    if (this.tokenUsage > this.MAX_TOKENS_PER_MINUTE) {
      const waitTime = 6e4 - (now - this.lastResetTime) + 1e3;
      if (waitTime > 0) {
        console.warn(`[Rate Limit] Token usage (${this.tokenUsage}) exceeded ${this.MAX_TOKENS_PER_MINUTE}/min. Waiting ${Math.ceil(waitTime / 1e3)}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.tokenUsage = 0;
        this.lastResetTime = Date.now();
      }
    }
  }
  async callAIStreamWithRetry(options, retries = 3) {
    try {
      await this.callAIStream(options);
    } catch (error) {
      if (retries > 0 && error.message.includes("429")) {
        console.warn(`[429 Too Many Requests] Quota exhausted. Waiting 30s before retrying... (Retries left: ${retries})`);
        await new Promise((resolve) => setTimeout(resolve, 3e4));
        return this.callAIStreamWithRetry(options, retries - 1);
      }
      throw error;
    }
  }
  async callAIStream(options) {
    const { endpoint, apiKey, model, prompt, signal, onChunk } = options;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: true
      }),
      signal
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
    }
    if (!response.body) {
      throw new Error("No response body");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done)
          break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.trim() === "")
            continue;
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data.trim() === "[DONE]")
              continue;
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content && onChunk)
                onChunk(content);
            } catch (e) {
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

const TRANSLATION_PROMPT = (itemsJson) => `\u7ED9\u4F60\u4E00\u7CFB\u5217\u63A8\u6587\uFF0C\u4F60\u6765\u5C06\u5404\u79CD\u4E0D\u662F\u4E2D\u6587\u7684\u8BED\u8A00\u5185\u5BB9\u7FFB\u8BD1\u4E3A\u4E2D\u6587\uFF0C\u8F93\u51FA\u4EE5\u4E0B\u6307\u5B9A\u683C\u5F0F\uFF0C\u4E0D\u8981\u8F93\u51FA\u4EFB\u4F55\u5176\u4ED6\u5185\u5BB9\uFF01\u5E76\u4E14\u53EA\u7FFB\u8BD1\u9700\u8981\u7FFB\u8BD1\u7684\u63A8\u6587item\u5373\u53EF\uFF0C\u5982\u679C\u672C\u8EAB\u662F\u4E2D\u6587\u4E0D\u9700\u8981\u7FFB\u8BD1\uFF0C\u5C31\u4E0D\u9700\u8981\u8FD4\u8FD8\u7ED9\u6211\u3002\u53EA\u8FD4\u56DE\u9700\u8981\u7FFB\u8BD1\u7684item\u7FFB\u8BD1\u540E\u7684\u7279\u5B9A\u7ED3\u6784\u6570\u7EC4\u5C31\u597D\u3002\u9488\u5BF9\u6280\u672F\u7C7B\uFF0C\u4FDD\u7559\u82F1\u6587\u7684\u5173\u952E\u8BCD\u3002\u683C\u5F0F\uFF1A<Tranalate>{"data":[{
    "tw_id":"\u539F\u5148\u5BF9\u5E94\u7684\u63A8\u6587id",
    "translated_content":"\u7FFB\u8BD1\u540E\u7684\u5185\u5BB9"
},{
    "tw_id":"\u539F\u5148\u5BF9\u5E94\u7684\u63A8\u6587id",
    "translated_content":"\u7FFB\u8BD1\u540E\u7684\u5185\u5BB9"
}]}</Tranalate>\u3002\u5E16\u5B50\u5185\u5BB9\uFF1A${itemsJson}`;
const TAGS_GENERATION_PROMPT = (contentJson) => `\u7ED9\u4F60\u4E00\u7CFB\u5217\u63A8\u6587\u5185\u5BB9\u6570\u7EC4\uFF0C\u4F60\u6765\u63A8\u65AD\u4ED6\u4EEC\u53EF\u4EE5\u8FDB\u884C\u5212\u5206\u7684tag\u90FD\u6709\u4EC0\u4E48\uFF0C\u6211\u540E\u9762\u4F1A\u6839\u636E\u8FD9\u51E0\u4E2Atag\u7ED9\u6BCF\u4E2A\u63A8\u6587\u6253\u4E0A\u6807\u7B7E\u3002\u8F93\u51FA\u683C\u5F0F\uFF1A<TagsInfo>{"data": [
    { "tag_id": "xxx", "tag_name": "xxx" },
    { "tag_id": "xxx", "tag_name": "xxx" }
]}</TagsInfo>\u3002\u63A8\u6587\u5185\u5BB9\uFF1A${contentJson}`;
const TAGS_ASSIGNMENT_PROMPT = (itemsJson, tagsInfoJson) => `\u7ED9\u4F60\u4E00\u7CFB\u5217\u63A8\u6587\uFF08\u643A\u5E26{tw_id:'xxx',content:'xxx'}[]\uFF0C\u8FD9\u91CCcontent\u622A\u65AD\u5230\u4E0D\u5927\u4E8E50\u4E2A\u5B57\uFF09\uFF0C\u548Ctag\uFF08\u643A\u5E26tags_info\uFF09\uFF0C\u4F60\u6765\u5224\u65AD\u8FD9\u4E9B\u63A8\u6587\u90FD\u542B\u6709\u54EA\u4E9Btag,\u4E00\u4E2A\u63A8\u6587\u53EF\u4EE5\u6709\u591A\u4E2Atag\uFF0C\u4F46\u662F\u81F3\u5C11\u6709\u4E00\u4E2Atag\uFF08\u5982\u679C\u63A8\u6587\u5185\u5BB9\u65E0\u6CD5\u5206\u7C7B\uFF0C\u5C31\u4F7F\u7528"\u5176\u4ED6"\uFF09\u8FD4\u56DE\u683C\u5F0F\uFF1A<TagsData>{"data": [
    { "tw_id": "xxx", "tags": ['tagid\u7EC4\u6210\u7684\u6570\u7EC4\u6761\u76EE1','tagid\u7EC4\u6210\u7684\u6570\u7EC4\u6761\u76EE2'] },
     ...
]}</TagsData>\u3002\u63A8\u6587\u6570\u636E\uFF1A${itemsJson}\uFF0CTags\u4FE1\u606F\uFF1A${tagsInfoJson}`;
const AI_BOT_PROMPT = (botPrompt, tweetContent) => `${botPrompt}

,\u4EE5\u4E0Aprompt\u662F\u4E00\u4E2A\u53EB\u505A\u63A8\u6587\u89E3\u6790\u7684aibot\u7684\u529F\u80FD\uFF0C\u4F60\u8981\u628A\u8FD9\u4E2A\u529F\u80FD\u5E94\u7528\u4E8E\u4EE5\u4E0B\u6240\u6709\u8D34\u6587\uFF0C\u5E76\u4E14\u5176\u4E2D\u7684description\u4F1A\u5199\u5339\u914D\u54EA\u79CD\u8D34\u6587\uFF0C\u6709\u4E9B\u8D34\u6587\u4E0D\u5339\u914D\u5C31\u4E0D\u9700\u8981\u751F\u6210\uFF0C\u4E5F\u4E0D\u7528\u52A0\u5165\u8FD4\u56DE\u7684\u6570\u7EC4\u5185\u3002\u8FD4\u56DE\u7ED9\u6211\u8FD9\u4E2A\u683C\u5F0F\u7684\u6570\u636E\uFF08\u4E0D\u5339\u914D\u7684\u8BDD\u90A3\u4E2Aitem\u5C31\u4E0D\u7528\u6DFB\u52A0\u5230\u6570\u7EC4\u5185\uFF09\uFF1A<AIBOT>{"data":[{
                    "tw_id":"\u539F\u5148\u5BF9\u5E94\u7684\u63A8\u6587id",
                    "md":"aibot\u751F\u6210\u7684\u5185\u5BB9\uFF0C\u4F7F\u7528markdown\u683C\u5F0F"
                },{
                    "tw_id":"\u539F\u5148\u5BF9\u5E94\u7684\u63A8\u6587id",
                    "md":"aibot\u751F\u6210\u7684\u5185\u5BB9\uFF0C\u4F7F\u7528markdown\u683C\u5F0F"
}]}</AIBOT>\u63A8\u6587\u5185\u5BB9\uFF1A${tweetContent}`;
const OVERVIEW_PROMPT = (day, itemsJson) => `\u7ED9\u4F60\u4E00\u7CFB\u5217\u63A8\u7279\u6570\u636E\uFF0C\u4F60\u662F\u4E00\u4E2AAI\u52A9\u624B\uFF0C\u5E2E\u52A9\u7528\u6237\u751F\u6210\u6240\u9700\u7684\u5168\u90E8\u5E16\u5B50\u5185\u5BB9\u6982\u89C8\uFF08overview\uFF09\uFF0C\u8BA9\u7528\u6237\u5FEB\u901F\u4E86\u89E3\u53D1\u751F\u4E86\u4EC0\u4E48\u3001\u6709\u54EA\u4E9B\u65B0\u6D88\u606F\u3002

\u4E0E\u603B\u7ED3\u4E0D\u540C\uFF0C\u603B\u7ED3\u9700\u8981\u5B8C\u6574\u6574\u7406\u5E76\u6DB5\u76D6\u6240\u6709\u5185\u5BB9\uFF0C\u800C\u6982\u89C8\u65E0\u9700\u5982\u6B64\uFF0C\u53EA\u9700\u63D0\u53D6\u7CBE\u534E\u90E8\u5206\u3002

\u8BF7\u751F\u6210\u4E00\u4E2AMarkdown\u683C\u5F0F\u7684\u6982\u89C8\uFF0C\u6CE8\u610F\uFF1A
- \u7EDD\u4E0D\u662F\u751F\u6210\u4E00\u4E2A\u4E2A\u72EC\u7ACB\u7684\u5361\u7247\uFF1B
- \u5728\u6709\u9650\u5B57\u6570\u548C\u6709\u9650\u7A7A\u95F4\u5185\uFF0C\u7528\u7B80\u8981\u6587\u5B57\u6574\u7406\u5185\u5BB9\uFF1B
- \u53EF\u4EE5\u9002\u5F53\u6DFB\u52A0 <a> \u6807\u7B7E\u7684 href \u6307\u5411\u5BF9\u5E94\u94FE\u63A5\uFF0C\u6216\u4F7F\u7528\u8D85\u94FE\u63A5\uFF1B
- \u53EF\u4EE5\u52A0\u5165\u4F5C\u8005\u5934\u50CF\u7B49\u5143\u7D20\uFF1B
- \u9700\u8981\u6309\u7C7B\u522B\u8FDB\u884C\u5206\u7C7B\uFF08\u53EF\u5229\u7528\u5E16\u5B50\u4E2D\u7684 tag\uFF09\uFF1B
- \u6BCF\u4E2A\u5206\u7C7B\u4E0B\u751F\u6210\u9002\u91CF\u6587\u5B57\u7684\u6982\u89C8\uFF0C\u4F7F\u8BFB\u8005\u4E00\u773C\u770B\u53BB\u5373\u53EF\u5927\u81F4\u4E86\u89E3\u5185\u5BB9\uFF0C\u65E0\u9700\u9605\u8BFB\u6BCF\u4E00\u4E2A\u5177\u4F53\u6807\u9898\u3002

\u6BCF\u4E2A\u5177\u4F53\u6761\u76EE\u540E\u9762\u5FC5\u987B\u52A0\u4E0A\u5BF9\u5E94\u7684\u4E00\u4E2A\u6216\u591A\u4E2A\u5E16\u5B50\u8D85\u94FE\u63A5\u4F5C\u4E3A\u4FE1\u606F\u6765\u6E90\uFF0C\u8D85\u94FE\u63A5\u683C\u5F0F\u4E3A\uFF1A<tweet-link tw-id='xxxid'>xxx\u6807\u9898</tweet-link>

tweet-link \u4F7F\u7528\u793A\u4F8B\uFF1A
- \u4E00\u4E2A\u6761\u76EE\u5185\u5BB9 <tweet-link tw-id='xxx'>OxFmt \u6700\u65B0\u7248</tweet-link>
- \u4E0B\u4E00\u4E2A\u6761\u76EE\u5185\u5BB9 <tweet-link tw-id='xxx'>Rolldown postBanner</tweet-link> <tweet-link tw-id='xxx'>Angular \u7528 Rolldown</tweet-link>

\u52A0\u4E00\u4E9B\u50CF\u662F\u732B\u5A18\u4F1A\u8BF4\u7684\u8BDD\uFF0C\u9632\u6B62\u8FC7\u4E8E\u65E0\u804A\uFF0C\u6BD4\u5982\u5728\u672B\u5C3E\u52A0\u4E00\u4E9B\u6BD4\u5982 "xxxx\uFF08\u65E5\u671F\uFF09\u8FD9\u4E00\u5929\u7684\u6982\u51B5\u5C31\u662F\u8FD9\u4E9B\u55B5~" \u8FD9\u6837\u7684\u5185\u5BB9\u3002\u5982\u679C\u8F93\u5165\u7684\u63A8\u6587\u6761\u76EE\u5F88\u5C11\uFF0C\u53EF\u4EE5\u9002\u5F53\u6DFB\u52A0\u4E00\u4E9B\u6BD4\u5982 "xxxx\uFF08\u65E5\u671F\uFF09\u8FD9\u4E00\u5929\u7684\u6982\u51B5\u53EA\u6709\u8FD9\u4E9B\u55B5~" \u8FD9\u6837\u7684\u5185\u5BB9\u3002\u8FD8\u6709\u5F88\u591A\u60C5\u51B5\uFF0C\u81EA\u884C\u5224\u65AD\u3002

\u76F4\u63A5\u8F93\u51FA\u5BF9\u5E94\u7684 Markdown \u5185\u5BB9\uFF0C\u4E0D\u8981\u6709\u4EFB\u4F55\u591A\u4F59\u5E9F\u8BDD\uFF01\u5E16\u5B50\u5185\u5BB9\uFF1A${itemsJson}`;

function appendLog(details) {
  const logFile = path__default.resolve(process.cwd(), "ai_tasks.log");
  const time = (/* @__PURE__ */ new Date()).toISOString();
  fs__default.appendFileSync(logFile, `[${time}]
${details}
--------------------------------------------------
`);
}
async function batchProcess(items, batchSize, processor, options = {}) {
  if (options.disableBatch) {
    console.log(`[Batch] Processing all ${items.length} items (Batching Disabled)`);
    return processor(items, 0);
  }
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  const results = new Array(batches.length);
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
        processor(batch, index).then((res) => {
          results[index] = res;
        }).catch((err) => {
          console.error(`Batch ${index + 1} failed:`, err);
          results[index] = [];
        }).finally(() => {
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
async function batchTranslate(items, batchSize, aiClient, options) {
  return batchProcess(items, batchSize, async (batch, batchIndex) => {
    const prompt = options.prompt(JSON.stringify(batch));
    let aiResponseText = "";
    const startTime = Date.now();
    try {
      await aiClient.stream({
        endpoint: options.endpoint,
        apiKey: options.apiKey,
        model: options.model,
        prompt,
        onChunk: (chunk) => {
          aiResponseText += chunk;
        }
      });
      const duration = Date.now() - startTime;
      appendLog(`Task: Translation (Batch ${batchIndex + 1})
Duration: ${duration}ms
Prompt: ${prompt.slice(0, 2e3)}...
Result: ${aiResponseText.slice(0, 2e3)}...`);
      const match = aiResponseText.match(/<Tranalate>([\s\S]*?)<\/Tranalate>/);
      if (match && match[1]) {
        const translatedItems = JSON.parse(match[1])?.data ?? [];
        return Array.isArray(translatedItems) ? translatedItems : [];
      }
    } catch (e) {
      const duration = Date.now() - startTime;
      appendLog(`Task: Translation (Batch ${batchIndex + 1}) FAILED
Duration: ${duration}ms
Error: ${e.message}
Prompt: ${prompt.slice(0, 2e3)}...`);
      console.error("Batch translation failed:", e);
    }
    return [];
  }, { disableBatch: options.disableBatch, maxConcurrent: options.maxConcurrent });
}
async function batchAssignTags(items, tagsInfo, batchSize, aiClient, options) {
  return batchProcess(items, batchSize, async (batch, batchIndex) => {
    const prompt = options.prompt(JSON.stringify(batch), JSON.stringify(tagsInfo));
    let aiResponseText = "";
    const startTime = Date.now();
    try {
      await aiClient.stream({
        endpoint: options.endpoint,
        apiKey: options.apiKey,
        model: options.model,
        prompt,
        onChunk: (chunk) => {
          aiResponseText += chunk;
        }
      });
      const duration = Date.now() - startTime;
      appendLog(`Task: Tags Assignment (Batch ${batchIndex + 1})
Duration: ${duration}ms
Prompt: ${prompt.slice(0, 2e3)}...
Result: ${aiResponseText.slice(0, 2e3)}...`);
      const match = aiResponseText.match(/<TagsData>([\s\S]*?)<\/TagsData>/);
      if (match && match[1]) {
        const taggedItems = JSON.parse(match[1])?.data ?? [];
        return Array.isArray(taggedItems) ? taggedItems : [];
      }
    } catch (e) {
      const duration = Date.now() - startTime;
      appendLog(`Task: Tags Assignment (Batch ${batchIndex + 1}) FAILED
Duration: ${duration}ms
Error: ${e.message}
Prompt: ${prompt.slice(0, 2e3)}...`);
      console.error("Batch tag assignment failed:", e);
    }
    return [];
  }, { disableBatch: options.disableBatch, maxConcurrent: options.maxConcurrent });
}
async function batchGenerateBotContent(items, bots, batchSize, aiClient, options) {
  const result = {};
  for (const bot of bots) {
    const botResults = await batchProcess(items, batchSize, async (batch, batchIndex) => {
      const promises = batch.map(async (item) => {
        const prompt = AI_BOT_PROMPT(bot.prompt, item.content);
        let aiResponseText = "";
        const startTime = Date.now();
        try {
          await aiClient.stream({
            endpoint: options.endpoint,
            apiKey: options.apiKey,
            model: options.model,
            prompt,
            onChunk: (chunk) => {
              aiResponseText += chunk;
            }
          });
          const duration = Date.now() - startTime;
          appendLog(`Task: Bot ${bot.bot_id} (Item ${item.tw_id})
Duration: ${duration}ms
Prompt: ${prompt.slice(0, 2e3)}...
Result: ${aiResponseText.slice(0, 2e3)}...`);
          const match = aiResponseText.match(/<AIBOT>([\s\S]*?)<\/AIBOT>/);
          const content = match && match[1] ? match[1].trim() : aiResponseText.trim();
          return { tw_id: item.tw_id, content };
        } catch (e) {
          const duration = Date.now() - startTime;
          appendLog(`Task: Bot ${bot.bot_id} (Item ${item.tw_id}) FAILED
Duration: ${duration}ms
Error: ${e.message}
Prompt: ${prompt.slice(0, 2e3)}...`);
          console.error(`Bot ${bot.bot_id} failed for ${item.tw_id}:`, e);
          return { tw_id: item.tw_id, content: "" };
        }
      });
      return Promise.all(promises);
    }, { disableBatch: options.disableBatch, maxConcurrent: options.maxConcurrent });
    for (const { tw_id, content } of botResults) {
      if (!content)
        continue;
      if (!result[tw_id])
        result[tw_id] = {};
      result[tw_id][bot.bot_id] = content;
    }
  }
  return result;
}

path__default.dirname(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href))));
let sharedClient;
function cleanContent(text) {
  if (!text)
    return "";
  const suffixRegex = /—\s+.*?\s+\(@.*?\)\s+\w+\s+\d{1,2},\s+\d{4}$/;
  const suffixRegexAlt = /—\s+.*?\s+\(@.*?\)\s+.*$/;
  let cleaned = text.replace(suffixRegex, "").trim();
  if (cleaned === text) {
    cleaned = text.replace(suffixRegexAlt, "").trim();
  }
  cleaned = cleaned.replace(/\s+Video$/i, "").trim();
  return cleaned;
}
function processMedia(item) {
  const media = [];
  const hasVideoSuffix = item.content_text && /\s+Video$/i.test(item.content_text);
  if (item.image) {
    const isVideo = hasVideoSuffix || item.image.includes("video_thumb") || item.image.includes("amplify_video_thumb");
    media.push({
      url: item.image,
      type: isVideo ? "video" : "image"
    });
  }
  if (Array.isArray(item.attachments)) {
    item.attachments.forEach((att) => {
      if (!att.url)
        return;
      if (media.some((m) => m.url === att.url))
        return;
      const isVideo = hasVideoSuffix || att.url.includes("video_thumb") || att.url.includes("amplify_video_thumb");
      media.push({
        url: att.url,
        type: isVideo ? "video" : "image"
      });
    });
  }
  return media;
}
function extractSourceAuthor(feed) {
  const homePage = feed.home_page_url || "";
  const handleMatch = homePage.match(/x\.com\/([^\/]+)/) || homePage.match(/twitter\.com\/([^\/]+)/);
  const handle = handleMatch ? handleMatch[1] : "unknown";
  return {
    author_id: `@${handle}`,
    author_name: handle,
    author_favicon: `https://unavatar.io/x/${handle}`
  };
}
async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok)
        return res;
      throw new Error(`Status ${res.status}`);
    } catch (e) {
      console.error(`Fetch failed for ${url} (Attempt ${i + 1}/${retries + 1}):`, e);
      if (i === retries)
        throw e;
    }
  }
  throw new Error("Unreachable");
}
async function fetchAndFormat(options) {
  const allItems = [];
  for (const url of options.rss_urls) {
    try {
      console.log(`Fetching RSS: ${url}`);
      const response = await fetchWithRetry(url);
      const feed = await response.json();
      const sourceAuthor = extractSourceAuthor(feed);
      const items = feed.items || [];
      for (const item of items) {
        const isRt = (item.content || "").startsWith("RT by @");
        const content = cleanContent(item.content_text || "");
        const formattedItem = {
          tw_id: item.id,
          url: item.url,
          content,
          originText: "",
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
  const uniqueItems = allItems;
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
  const translationTask = (async () => {
    const itemsToTranslate = uniqueItems.map((item) => ({
      tw_id: item.tw_id,
      content: item.content
    }));
    console.log("Starting AI translation...");
    const translatedResults = await batchTranslate(
      itemsToTranslate,
      batchSize,
      aiClient,
      {
        ...commonAiOptions,
        prompt: TRANSLATION_PROMPT,
        disableBatch: options.no_batch,
        maxConcurrent: options.max_concurrent
      }
    );
    console.log(`
AI translation finished. Processed ${translatedResults.length} items.`);
    for (const tItem of translatedResults) {
      const originalItem = uniqueItems.find((i) => i.tw_id === tItem.tw_id);
      if (originalItem) {
        originalItem.originText = originalItem.content;
        originalItem.content = tItem.translated_content;
        originalItem.is_translated = true;
      }
    }
  })();
  let generatedTagsInfo = [];
  const tagsTask = (async () => {
    const contentForTags = uniqueItems.map((i) => i.content.slice(0, 30));
    const step1Prompt = TAGS_GENERATION_PROMPT(JSON.stringify(contentForTags));
    let step1Response = "";
    console.log("Starting Tag Generation (Step 1)...");
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
          if (!generatedTagsInfo.some((t) => t.tag_id === "other")) {
            generatedTagsInfo.push({ tag_id: "other", tag_name: "\u5176\u4ED6" });
          }
        }
      }
    } catch (e) {
      console.error("Tag Generation Step 1 failed:", e);
      return;
    }
    if (generatedTagsInfo.length === 0)
      return;
    const itemsForTagging = uniqueItems.map((i) => ({
      tw_id: i.tw_id,
      content: i.content.slice(0, 50)
    }));
    console.log("Starting Tag Assignment (Step 2)...");
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
      const originalItem = uniqueItems.find((i) => i.tw_id === itemTag.tw_id);
      if (originalItem && Array.isArray(itemTag.tags)) {
        originalItem.tags = itemTag.tags;
      }
    }
  })();
  let feed_item_ai_bots_content = {};
  const botsTask = (async () => {
    const bots = options.ai_bots || [];
    if (bots.length === 0)
      return;
    const itemsForBots = uniqueItems.map((i) => ({
      tw_id: i.tw_id,
      content: i.content
    }));
    console.log("Starting AI Bots generation...");
    feed_item_ai_bots_content = await batchGenerateBotContent(
      itemsForBots,
      bots.map((b) => ({ bot_id: b.bot_id, prompt: b.prompt })),
      batchSize,
      aiClient,
      {
        ...commonAiOptions,
        disableBatch: options.no_batch,
        maxConcurrent: options.max_concurrent
      }
    );
    console.log("AI Bots generation finished.");
  })();
  await Promise.all([tagsTask, translationTask, botsTask]);
  uniqueItems.sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime());
  return [{
    ...options.feed_info,
    ai_bots: options.ai_bots,
    list: uniqueItems,
    tags_info: generatedTagsInfo.length > 0 ? generatedTagsInfo : options.feed_info.tags_info || []
  }, feed_item_ai_bots_content];
}
async function generateOverview(items, options, client) {
  if (!options.overview_day)
    return {};
  const day = options.overview_day;
  const filteredItems = items.filter((item) => item.date_published.startsWith(day));
  if (filteredItems.length === 0) {
    console.log(`No items found for overview day: ${day}`);
    return {
      overview: {
        [day]: "[NO POSTS]"
      }
    };
  }
  const itemsForPrompt = filteredItems.map((item) => ({
    tw_id: item.tw_id,
    content: item.content.slice(0, 250)
  }));
  const prompt = OVERVIEW_PROMPT(day, JSON.stringify(itemsForPrompt));
  const aiClient = client || sharedClient || new AIClient(options.max_concurrent);
  let aiResponseText = "";
  console.log("Starting Overview Generation...");
  try {
    await aiClient.stream({
      endpoint: options.end_point,
      apiKey: options.apikey,
      model: options.model,
      prompt,
      onChunk: (chunk) => {
        aiResponseText += chunk;
      }
    });
    console.log("\nOverview Generation finished.");
    return {
      overview: {
        [day]: aiResponseText
      }
    };
  } catch (e) {
    console.error("Overview Generation failed:", e);
    return {};
  }
}
if (process.argv[1] === (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href)) || process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.mjs") || process.argv[1]?.endsWith("index.cjs")) {
  (async () => {
    try {
      const configPath = process.env.FEED_CONFIG_PATH || process.argv[2];
      const resolvedConfigPath = path__default.resolve(process.cwd(), configPath);
      let options;
      console.log(`Loading config from: ${configPath}`);
      const configFile = await fs__default$1.readFile(resolvedConfigPath, "utf-8");
      const config = JSON.parse(configFile);
      const currentVersion = parseInt(config.version, 10) || 0;
      const newVersion = (currentVersion + 1).toString();
      config.version = newVersion;
      console.log(`Version updated: ${currentVersion} -> ${newVersion}`);
      await fs__default$1.writeFile(resolvedConfigPath, JSON.stringify(config, null, 2), "utf-8");
      console.log(`Config updated at: ${resolvedConfigPath}`);
      if (!process.env.AI_MODEL) {
        console.log("AI_MODEL is not set");
      }
      if (!process.env.AI_ENDPOINT) {
        console.log("AI_ENDPOINT is not set");
      }
      if (!process.env.AI_API_KEY) {
        console.log("AI_API_KEY is not set");
      }
      options = {
        rss_urls: config.rss_urls,
        feed_info: {
          name: config.name,
          feed_id: config.feed_id,
          feed_url: config.feed_url,
          avatar: config.avatar,
          version: newVersion
          // Use the new version
        },
        ai_bots: config.ai_bots,
        model: process.env.AI_MODEL,
        end_point: process.env.AI_ENDPOINT,
        apikey: process.env.AI_API_KEY,
        batch_size: config.batch_size || 20,
        max_concurrent: config.max_concurrent || 5
      };
      const res = await fetchAndFormat(options);
      const [feed, feed_item_ai_bots_content] = res;
      const outputDir = process.env.OUTPUT_DIR ? path__default.resolve(process.cwd(), process.env.OUTPUT_DIR) : path__default.resolve(process.cwd(), "cache");
      await fs__default$1.mkdir(outputDir, { recursive: true });
      const compressData = (data) => {
        return new Promise((resolve, reject) => {
          fflate.zlib(fflate.strToU8(data), { level: 9 }, (err, compressed) => {
            if (err)
              reject(err);
            else
              resolve(compressed);
          });
        });
      };
      const feedContentPath = path__default.join(outputDir, "FEED_CONTENT");
      const feedCompressed = await compressData(JSON.stringify(feed));
      await fs__default$1.writeFile(feedContentPath, feedCompressed);
      console.log(`Saved compressed feed to: ${feedContentPath}`);
      if (feed_item_ai_bots_content) {
        const botsContentPath = path__default.join(outputDir, "FEED_AI_BOT");
        const botsCompressed = await compressData(JSON.stringify(feed_item_ai_bots_content, null, 2));
        await fs__default$1.writeFile(botsContentPath, botsCompressed);
        console.log(`Saved compressed AI bots content to: ${botsContentPath}`);
      }
      if (feed.list && feed.list.length > 0) {
        const today = /* @__PURE__ */ new Date();
        const yesterday = new Date(Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate() - 1
        ));
        const overviewDay = process.env.OVERVIEW_DAY || yesterday.toISOString().split("T")[0];
        const overviewOptions = { ...options, overview_day: overviewDay };
        console.log(`Generating overview for day: ${overviewDay}`);
        const overviewResult = await generateOverview(feed.list, overviewOptions);
        if (overviewResult.overview) {
          const overviewFilename = `FEED_AI_OVERVIEW_${overviewDay.replace(/-/g, "_")}`;
          const overviewPath = path__default.join(outputDir, overviewFilename);
          const overviewCompressed = await compressData(JSON.stringify(overviewResult.overview, null, 2));
          await fs__default$1.writeFile(overviewPath, overviewCompressed);
          console.log(`Saved compressed overview to: ${overviewPath}`);
        }
      }
    } catch (error) {
      console.error("Execution failed:", error);
      process.exit(1);
    }
  })();
}

exports.fetchAndFormat = fetchAndFormat;
exports.generateOverview = generateOverview;
