<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { parseISO, isWithinInterval, subDays, isSameDay } from "date-fns";

const store = useUserStore();

const filteredList = computed(() => {
  let list = store.feedItems;

  // 1. Date Range Filter
  const range = store.date_range;
  if (range === "starred") {
    // For starred, we might want to show all starred items across all feeds,
    // or just starred items from the current feed.
    // Usually "starred" as a filter in a feed view means "show starred items from this feed".
    list = list.filter((item) =>
      store.starred_items.some((s) => s.tw_id === item.tw_id)
    );
  } else if (range === "last_day") {
    const now = new Date();
    const yesterday = subDays(now, 1);
    list = list.filter((item) => {
      const date = parseISO(item.date_published);
      return isWithinInterval(date, { start: yesterday, end: now });
    });
  } else if (range === "last_week") {
    const now = new Date();
    const lastWeek = subDays(now, 7);
    list = list.filter((item) => {
      const date = parseISO(item.date_published);
      return isWithinInterval(date, { start: lastWeek, end: now });
    });
  } else if (range !== "all" && range) {
    // Specific date string (e.g. "2025-12-22")
    try {
      const targetDate = parseISO(range);
      list = list.filter((item) => {
        const itemDate = parseISO(item.date_published);
        return isSameDay(itemDate, targetDate);
      });
    } catch (e) {
      console.error("Failed to filter by date:", range);
    }
  }

  // 2. Tags Filter
  if (store.curr_tags.length > 0) {
    list = list.filter((item) => {
      if (!item.tags) return false;
      return item.tags.some((tag) => store.curr_tags.includes(tag));
    });
  }

  return list;
});
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-2">
    <div
      v-if="store.isLoadingContent"
      class="text-sm text-muted-foreground animate-pulse"
    >
      加载中...
    </div>
    <div
      v-else-if="filteredList.length === 0"
      class="text-sm text-muted-foreground italic"
    >
      没有匹配的内容
    </div>
    <div
      v-for="item in filteredList"
      :key="item.tw_id"
      class="p-2 border rounded hover:bg-muted/50 transition-colors"
    >
      <span class="text-xs font-mono">{{ item.tw_id }}</span>
      <div v-if="item.title" class="text-sm font-medium mt-1">
        {{ item.title }}
      </div>
    </div>
  </div>
</template>
