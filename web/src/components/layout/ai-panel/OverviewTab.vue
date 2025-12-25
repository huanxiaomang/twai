<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { marked } from "marked";
import { getHighlighter } from "@/lib/highlighter";
import { useDark } from "@vueuse/core";
import type { Highlighter } from "shiki";

const store = useUserStore();
const isDark = useDark();
const contentRef = ref<HTMLElement | null>(null);
const highlighter = ref<Highlighter | null>(null);
const renderedHtml = ref("");

// Initialize shiki
onMounted(async () => {
  highlighter.value = await getHighlighter();
});

const markdown = computed(() => {
  return store.feedAIAnalysis?.overview || "暂无概览内容";
});

// Update HTML when markdown, highlighter or theme changes
watch(
  [markdown, highlighter, isDark],
  async ([newMarkdown, hl, dark]) => {
    if (!newMarkdown) {
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

onMounted(() => {
  if (contentRef.value) {
    contentRef.value.addEventListener("click", handleContentClick);
  }
});

onUnmounted(() => {
  if (contentRef.value) {
    contentRef.value.removeEventListener("click", handleContentClick);
  }
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-1 overflow-y-auto p-6 scroll-smooth">
      <div ref="contentRef" class="markdown-body" v-html="renderedHtml"></div>
    </div>
  </div>
</template>

<style scoped>
/* Local styles removed, using global .markdown-body from style.css */
</style>
