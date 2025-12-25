<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center bg-background p-8 text-center animate-in fade-in duration-500"
  >
    <div class="relative mb-6">
      <img
        src="/invalid.png"
        alt="Invalid Feed"
        class="h-48 w-48 object-contain opacity-90"
      />
    </div>
    <h2 class="text-xl font-semibold tracking-tight">无效的订阅源</h2>
    <p class="mt-2 max-w-[280px] text-sm text-muted-foreground">
      抱歉，您访问的订阅源不存在或已被移除。
    </p>
    <router-link to="/" class="mt-6">
      <Button variant="outline"> 返回首页 </Button>
    </router-link>
  </div>
</template>
