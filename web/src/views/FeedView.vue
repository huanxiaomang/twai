<script setup lang="ts">
import FilterPanel from "@/components/FilterPanel.vue";
import OutlineView from "@/components/layout/outline-view/index.vue";
import PostList from "@/components/layout/post-list/index.vue";
</script>

<template>
  <div
    class="flex h-screen w-full overflow-hidden bg-background text-foreground"
  >
    <FilterPanel />
    <div>
      <OutlineView />
      <PostList />
    </div>
  </div>
</template>
