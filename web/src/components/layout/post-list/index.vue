<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import PostCard from "./PostCard.vue";
import { useActiveScroll } from "vue-use-active-scroll";

const store = useUserStore();
const containerRef = ref<HTMLElement | null>(null);

const targets = computed(() =>
  store.filteredFeedItems.map((item) => `post-${item.tw_id}`)
);

const { activeId } = useActiveScroll(targets, {
  root: containerRef,
  boundaryOffset: {
    toTop: store.scroll_offset,
    toBottom: store.scroll_offset,
  },
});

watch(activeId, (newId) => {
  if (newId) {
    const twId = newId.replace("post-", "");
    if (store.curr_tweet_id !== twId) {
      store.setCurrTweetId(twId);
    }
  }
});

// Handle filtering sync: if current item is filtered out, select the first available one
watch(
  () => store.filteredFeedItems,
  (newList) => {
    if (newList.length > 0) {
      const exists = newList.some((item) => item.tw_id === store.curr_tweet_id);
      if (!exists) {
        const firstId = newList[0]?.tw_id;
        if (firstId) {
          store.setCurrTweetId(firstId);
          // Scroll to top when filter changes and current item is gone
          setTimeout(() => {
            if (containerRef.value) {
              containerRef.value.scrollTop = 0;
            }
          }, 50);
        }
      }
    } else {
      store.setCurrTweetId(null);
    }
  }
);
</script>

<template>
  <div
    ref="containerRef"
    class="h-full bg-background overflow-y-auto scroll-smooth"
  >
    <div
      v-if="store.filteredFeedItems.length === 0"
      class="flex h-full w-full flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500"
    >
      <img
        src="/none.png"
        alt="No results"
        class="h-36 object-contain opacity-50 grayscale"
      />
      <p class="mt-4 text-sm text-muted-foreground italic">
        {{
          store.curr_tags.length === 0
            ? "没有选择标签呢"
            : store.date_range === "starred"
            ? "暂无收藏内容呢"
            : "什么都没有筛选到呢"
        }}
      </p>
    </div>

    <div v-else class="max-w-3xl mx-auto divide-y divide-border/40 pb-20">
      <PostCard
        v-for="item in store.filteredFeedItems"
        :key="item.tw_id"
        :item="item"
        :is-selected="store.curr_tweet_id === item.tw_id"
      />
    </div>
  </div>
</template>
