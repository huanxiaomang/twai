<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import FeedFilter from "@/components/FeedFilter.vue";
import OutlineView from "@/components/layout/outline-view/index.vue";
import PostList from "@/components/layout/post-list/index.vue";
import { useUserStore } from "@/stores/user";

const store = useUserStore();
const route = useRoute();
const isFilterWrapped = ref(false);

// 1. Update curr_feed when route changes
watch(
  () => route.params.feed_id,
  (newId) => {
    if (newId) {
      const feed = store.feeds.find((f) => f.feed_id === newId);
      if (feed) {
        store.setCurrFeed(feed);
      }
    }
  },
  { immediate: true }
);

// 2. Fetch data when curr_feed changes
watch(
  () => store.curr_feed?.feed_url,
  (newUrl) => {
    if (newUrl) {
      store.fetchFeedData(newUrl);
      store.fetchFeedsAIData(newUrl);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground"
  >
    <FeedFilter
      :class="[
        isFilterWrapped ? 'h-30' : 'h-15',
        'w-full shrink-0 transition-all duration-200',
      ]"
      @wrap-change="isFilterWrapped = $event"
    />
    <div class="flex-1 flex overflow-hidden">
      <OutlineView />
      <PostList />
    </div>
  </div>
</template>
