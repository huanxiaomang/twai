<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { marked } from "marked";
import { getHighlighter } from "@/lib/highlighter";
import { useDark } from "@vueuse/core";
import { format, parseISO } from "date-fns";
import type { Highlighter } from "shiki";

const store = useUserStore();
const isDark = useDark();
const highlighter = ref<Highlighter | null>(null);
const renderedHtml = ref("");

// Initialize shiki
onMounted(async () => {
  highlighter.value = await getHighlighter();
});

const effectiveDate = computed(() => {
  const range = store.date_range;
  // If it's a specific date string (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(range)) {
    return range;
  }
  // If it's "last_day", get the date of the latest tweet
  if (range === "last_day") {
    const latestTweet = store.filteredFeedItems[0];
    if (latestTweet) {
      return format(parseISO(latestTweet.date_published), "yyyy-MM-dd");
    }
  }
  return null;
});

const displayState = computed(() => {
  const range = store.date_range;
  if (["all", "starred", "last_week"].includes(range)) {
    return "multi-day";
  }

  const date = effectiveDate.value;
  if (!date) return "no-data";

  const content = store.feedAIAnalysis[date];

  if (!content) {
    return "no-data";
  }

  if (content === "[NO POSTS]") {
    return "empty-day";
  }

  return "content";
});

const markdown = computed(() => {
  const date = effectiveDate.value;
  if (date) {
    return store.feedAIAnalysis[date] || "";
  }
  return "";
});

watch(
  [effectiveDate, () => store.curr_feed],
  ([newDate, newFeed]) => {
    if (newDate && newFeed) {
      store.fetchOverview(newDate);
    }
  },
  { immediate: true }
);

// Update HTML when markdown, highlighter or theme changes
watch(
  [markdown, highlighter, isDark],
  async ([newMarkdown, hl, dark]) => {
    if (!newMarkdown || newMarkdown === "[NO POSTS]") {
      renderedHtml.value = "";
      return;
    }

    if (!hl) {
      renderedHtml.value = await marked(newMarkdown, { breaks: true });
      return;
    }

    const tokens = marked.lexer(newMarkdown);
    for (const token of tokens) {
      if (token.type === "code") {
        token.text = hl.codeToHtml(token.text, {
          lang: token.lang || "text",
          theme: dark ? "github-dark" : "github-light",
        });
        // Mark as escaped so marked doesn't escape it again
        (token as any).escaped = true;
      }
    }

    const renderer = new marked.Renderer();
    renderer.code = ({ text, escaped }) => {
      if (escaped) return text;
      return `<pre><code>${text}</code></pre>`;
    };

    renderedHtml.value = await marked.parser(tokens, { renderer });
  },
  { immediate: true }
);

const handleContentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const tweetLink = target.closest("tweet-link");
  if (tweetLink) {
    const twId = tweetLink.getAttribute("tw-id");
    if (twId) {
      store.jumpToTweet(twId);
    }
  }
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <Transition name="fade" mode="out-in">
      <div
        v-if="displayState === 'content'"
        :key="effectiveDate || 'content'"
        class="flex-1 overflow-y-auto p-6 scroll-smooth"
        @click="handleContentClick"
      >
        <div class="markdown-body" v-html="renderedHtml"></div>
      </div>

      <div
        v-else-if="displayState === 'multi-day'"
        key="multi-day"
        class="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 animate-in fade-in duration-500"
      >
        <div class="size-24 flex items-center justify-center">
          <img src="/think.png" class="size-full object-contain opacity-80" />
        </div>
        <div class="text-center space-y-1">
          <p class="text-sm font-bold text-foreground/80">
            内容概览暂时仅生成某天的数据呢
          </p>
          <p class="text-xs text-muted-foreground">
            请在上方选择"最近一天"或指定日期以查看 AI 概览
          </p>
        </div>
      </div>

      <div
        v-else-if="displayState === 'empty-day'"
        key="empty-day"
        class="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 animate-in fade-in duration-500"
      >
        <div class="size-24 flex items-center justify-center">
          <img
            src="/null-overview.png"
            class="size-full object-contain opacity-80"
          />
        </div>
        <div class="text-center space-y-1">
          <p class="text-sm font-bold text-foreground/80">真是冷清的一天呢</p>
          <p class="text-xs text-muted-foreground">
            {{ effectiveDate }} 这一天一个推文都没有!
          </p>
        </div>
      </div>

      <div
        v-else
        key="no-data"
        class="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 animate-in fade-in duration-500"
      >
        <div class="size-24 flex items-center justify-center">
          <img
            src="/no-ai-bot-analysis.png"
            class="size-full object-contain opacity-80"
          />
        </div>
        <div class="text-center space-y-1">
          <p class="text-sm font-bold text-foreground/80">没有这一天的数据呢</p>
          <p class="text-xs text-muted-foreground">
            AI 还没有为这一天生成内容概览
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
