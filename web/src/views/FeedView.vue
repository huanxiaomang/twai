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
import InvalidFeedView from "@/views/InvalidFeedView.vue";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-vue-next";

const store = useUserStore();
const route = useRoute();
const isFilterWrapped = ref(false);
const isFeedValid = ref(true);

// 1. Update curr_feed when route changes
watch(
  () => route.params.feed_id,
  async (newId) => {
    if (newId) {
      // Ensure store is initialized first (to load subscribe_feed_url from localStorage)
      await store.init();

      // Then ensure feeds are loaded
      if (store.feeds.length === 0) {
        await store.fetchAllFeedsInfo();
      }

      // Now find the feed after ensuring feeds are loaded
      const feed = store.feeds.find((f) => f.feed_id === newId);
      if (feed) {
        isFeedValid.value = true;
        store.setCurrFeed(feed);
      } else {
        isFeedValid.value = false;
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
  <div
    class="h-screen w-full overflow-hidden bg-background text-foreground relative"
  >
    <!-- Loading Overlay -->
    <div
      v-if="store.isLoadingContent"
      class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] animate-in fade-in duration-300"
    >
      <img
        :src="`/loading${Math.floor(Math.random() * 5) + 1}.png`"
        class="h-24 animate-bounce opacity-80 object-contain"
        alt="Loading..."
      />
      <p class="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
        正在同步最新内容...
      </p>
    </div>

    <template v-if="isFeedValid">
      <ResizablePanelGroup
        direction="horizontal"
        :key="store.is_ai_panel_visible ? 'ai-visible' : 'ai-hidden'"
      >
        <ResizablePanel
          :default-size="
            store.is_ai_panel_visible ? 100 - store.ai_panel_width : 100
          "
          :min-size="30"
        >
          <div class="flex flex-col h-full">
            <FeedFilter
              class="w-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden h-auto min-h-[60px]"
              @wrap-change="isFilterWrapped = $event"
            />
            <div class="flex-1 flex overflow-hidden relative">
              <ResizablePanelGroup
                direction="horizontal"
                class="h-full"
                :key="
                  store.is_outline_visible
                    ? 'outline-visible'
                    : 'outline-hidden'
                "
              >
                <ResizablePanel
                  v-if="store.is_outline_visible"
                  :default-size="store.outline_panel_width"
                  :min-size="20"
                  v-on:resize="store.setOutlinePanelWidth"
                >
                  <OutlineView />
                </ResizablePanel>
                <ResizableHandle v-if="store.is_outline_visible" />
                <ResizablePanel
                  :default-size="
                    store.is_outline_visible
                      ? 100 - store.outline_panel_width
                      : 100
                  "
                >
                  <PostList />
                </ResizablePanel>
              </ResizablePanelGroup>

              <!-- Floating Outline Toggle Button (When Hidden) -->
              <div
                v-if="!store.is_outline_visible"
                class="absolute left-2 top-2 z-10"
              >
                <Button
                  variant="outline"
                  size="icon"
                  class="h-8 w-8 bg-background shadow-sm border-muted hover:bg-accent"
                  @click="store.toggleOutline"
                >
                  <ChevronRight class="size-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle v-if="store.is_ai_panel_visible" />
        <ResizablePanel
          v-if="store.is_ai_panel_visible"
          :default-size="store.ai_panel_width"
          :min-size="20"
          v-on:resize="store.setAIPanelWidth"
        >
          <AiPanel />
        </ResizablePanel>
      </ResizablePanelGroup>

      <!-- Floating AI Panel Toggle Button (When Hidden) -->
      <AiPanel v-if="!store.is_ai_panel_visible" />
    </template>
    <template v-else>
      <InvalidFeedView />
    </template>
  </div>
</template>
