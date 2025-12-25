<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { useDark } from "@vueuse/core";
import { marked } from "marked";
import { getHighlighter } from "@/lib/highlighter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Highlighter } from "shiki";

const store = useUserStore();
const isDark = useDark();
const highlighter = ref<Highlighter | null>(null);
const renderedContents = ref<Record<string, string>>({});

// Initialize shiki
onMounted(async () => {
  highlighter.value = await getHighlighter();
});

const bots = computed(() => store.curr_feed?.ai_bots || []);

const botContents = computed(() => {
  if (!store.curr_tweet_id) return {};
  return store.feedItemAIBotsContent[store.curr_tweet_id] || {};
});

// Update HTML when bots, contents, highlighter or theme changes
watch(
  [botContents, highlighter, isDark],
  async ([contents, hl, dark]) => {
    const newRendered: Record<string, string> = {};

    for (const [botId, markdown] of Object.entries(contents)) {
      if (!markdown) {
        newRendered[botId] = "";
        continue;
      }

      if (!hl) {
        newRendered[botId] = await marked(markdown, { breaks: true });
        continue;
      }

      const tokens = marked.lexer(markdown);
      for (const token of tokens) {
        if (token.type === "code") {
          token.text = hl.codeToHtml(token.text, {
            lang: token.lang || "text",
            theme: dark ? "github-dark" : "github-light",
          });
          (token as any).escaped = true;
        }
      }

      const renderer = new marked.Renderer();
      renderer.code = ({ text, escaped }) => {
        if (escaped) return text;
        return `<pre><code>${text}</code></pre>`;
      };

      newRendered[botId] = await marked.parser(tokens, { renderer });
    }

    renderedContents.value = newRendered;
  },
  { immediate: true }
);

const activeBots = computed(() => {
  return bots.value.filter((bot) => botContents.value[bot.bot_id]);
});
</script>

<template>
  <div class="h-full overflow-hidden flex flex-col">
    <Transition name="fade" mode="out-in">
      <div
        v-if="activeBots.length > 0"
        :key="store.curr_tweet_id || 'none'"
        class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        <!-- Hint Text -->
        <div
          class="flex items-center gap-2 px-4 py-3 bg-muted/20 border border-border/30 rounded-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-xs text-muted-foreground">
            以下内容由 AI Bot 根据当前推文生成
          </p>
        </div>

        <div v-for="bot in activeBots" :key="bot.bot_id" class="space-y-4">
          <!-- Bot Header with Tooltip -->
          <div class="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <div class="flex items-center gap-3 group">
                    <Avatar class="size-10 transition-colors">
                      <AvatarImage :src="bot.avatar" :alt="bot.name" />
                      <AvatarFallback>{{
                        bot.name.slice(0, 2)
                      }}</AvatarFallback>
                    </Avatar>
                    <div class="flex flex-col">
                      <span
                        class="text-sm font-bold text-foreground group-hover:text-primary transition-colors"
                      >
                        {{ bot.name }}
                      </span>
                      <span
                        class="text-[10px] text-muted-foreground font-mono tracking-wider"
                      >
                        {{ bot.bot_id }}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  class="max-w-xs p-4 space-y-3 bg-popover/95 backdrop-blur-md border-border shadow-xl"
                >
                  <div class="space-y-1">
                    <p class="text-xs font-bold text-primary">
                      Bot ID: {{ bot.bot_id }}
                    </p>
                    <p class="text-xs text-foreground leading-relaxed">
                      {{ bot.description || "暂无描述" }}
                    </p>
                  </div>
                  <div v-if="bot.prompt" class="space-y-1">
                    <p class="text-xs text-foreground leading-relaxed">
                      <span class="font-bold">Prompt:</span> {{ bot.prompt }}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <!-- Content Card -->
          <div class="relative">
            <div class="overflow-hidden">
              <div
                class="markdown-body p-2 font-normal"
                v-html="renderedContents[bot.bot_id]"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 animate-in fade-in duration-500"
      >
        <div class="size-24 flex items-center justify-center">
          <img
            :src="
              store.curr_tweet_id ? '/no-ai-bot-analysis.png' : '/no-tweet.png'
            "
            class="size-full object-contain opacity-80"
          />
        </div>
        <div class="text-center space-y-1">
          <p class="text-sm font-bold text-foreground/80">
            {{
              store.curr_tweet_id
                ? "该推文暂无 AI Bot 解析呢"
                : "请选择一条推文"
            }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{
              store.curr_tweet_id
                ? "可能没有配置适合的AI Bot来解析该贴文呢"
                : "我来显示AI Bot解析的内容"
            }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
