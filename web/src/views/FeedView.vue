<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import FeedFilter from "@/components/FeedFilter.vue";
import OutlineView from "@/components/layout/outline-view/index.vue";
import PostList from "@/components/layout/post-list/index.vue";
import AiPanel from "@/components/layout/ai-panel/index.vue";
import { useUserStore } from "@/stores/user";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

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
      store.fetchFeedFullData(newUrl);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="h-screen w-full overflow-hidden bg-background text-foreground">
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel :default-size="100 - store.ai_panel_width" :min-size="30">
        <div class="flex flex-col h-full">
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
      </ResizablePanel>
      <ResizableHandle with-handle />
      <ResizablePanel
        :default-size="store.ai_panel_width"
        :min-size="20"
        v-on:resize="store.setAIPanelWidth"
      >
        <AiPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>
