<script setup lang="ts">
import { useUserStore } from "@/stores/user";
const store = useUserStore();
</script>

<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center bg-background p-8 text-center animate-in fade-in duration-500"
  >
    <div class="relative mb-6">
      <img
        src="/none.png"
        alt="No selection"
        class="h-48 w-48 object-contain opacity-90"
      />
      <div
        class="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-primary/10 blur-sm"
      ></div>
    </div>
    <h2 class="text-xl font-semibold tracking-tight">欢迎使用 TWAI</h2>
    <p class="mt-2 max-w-[280px] text-sm text-muted-foreground">
      可以从左侧侧边栏选择一个订阅源开始阅读，或者前往设置添加新的订阅源。
    </p>
    <router-link
      v-if="store.subscribe_feed_url.length === 0"
      to="/settings"
      class="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      前往设置添加订阅源
    </router-link>
  </div>
</template>
