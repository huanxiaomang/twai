<script setup lang="ts">
import { computed, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { cn } from "@/lib/utils";
import type { TweetItem } from "@/types";
import { ChevronLeft } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const store = useUserStore();

const groupedItems = computed(() => store.groupedFilteredItems);

const selectItem = (id: string) => {
  store.setInternalScrolling(true);
  store.setCurrTweetId(id);
  const el = document.getElementById(`post-${id}`);
  const container = document.querySelector(
    ".h-full.bg-background.overflow-y-auto"
  );
  if (el && container) {
    const targetScrollTop = el.offsetTop - store.scroll_offset;
    container.scrollTo({ top: targetScrollTop, behavior: "smooth" });
  }
  // Unlock after smooth scroll finishes
  setTimeout(() => {
    store.setInternalScrolling(false);
  }, 1000);
};

const getDisplayTitle = (item: TweetItem) => {
  // If translation is disabled and item is translated, show original text
  if (!store.auto_translate_chinese && item.is_translated) {
    return item.originText || item.content || "无标题";
  }
  return item.content || "无标题";
};

// Auto-scroll to active item in Outline
watch(
  () => store.curr_tweet_id,
  (newId) => {
    if (newId) {
      setTimeout(() => {
        const el = document.getElementById(`outline-item-${newId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    }
  }
);
</script>

<template>
  <div
    class="w-full h-full flex flex-col border-r bg-muted/20 overflow-hidden shrink-0 animate-in fade-in slide-in-from-left-2 duration-300"
  >
    <div
      class="p-4 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between"
    >
      <h2 class="text-sm font-semibold tracking-tight flex items-center gap-2">
        筛选结果
        <span
          class="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full"
        >
          {{ store.filteredFeedItems.length }}
        </span>
      </h2>
      <Button
        variant="ghost"
        size="icon"
        class="h-6 w-6 text-muted-foreground hover:text-foreground"
        @click="store.toggleOutline"
      >
        <ChevronLeft class="size-4" />
      </Button>
    </div>

    <div class="flex-1 overflow-y-auto p-2 scroll-smooth">
      <div class="space-y-4">
        <div v-for="group in groupedItems" :key="group.author.author_id">
          <template v-if="group.tweets.length > 0">
            <div
              class="px-2 py-1 text-[10px] font-bold text-muted-foreground/60 tracking-widest flex items-center gap-2"
            >
              <img
                v-if="group.author.author_favicon"
                :src="group.author.author_favicon"
                class="size-3.5 rounded-full object-cover border border-border/50"
              />
              {{ group.author.author_name }}
            </div>
            <div class="space-y-0.5 mt-1">
              <div
                v-for="item in group.tweets"
                :key="item.tw_id"
                :id="`outline-item-${item.tw_id}`"
                @click="selectItem(item.tw_id)"
                :class="
                  cn(
                    'group flex flex-col gap-1 px-3 py-2 rounded-md cursor-pointer transition-all duration-200',
                    store.curr_tweet_id === item.tw_id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )
                "
              >
                <div class="text-xs font-medium line-clamp-2 leading-snug">
                  {{ getDisplayTitle(item) }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <div
          v-if="store.filteredFeedItems.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <p class="text-xs text-muted-foreground italic">暂无目录内容</p>
        </div>
      </div>
    </div>
  </div>
</template>
