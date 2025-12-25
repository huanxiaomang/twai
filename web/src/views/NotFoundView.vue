<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <div
    class="flex h-screen w-full flex-col items-center justify-center bg-background p-8 text-center animate-in fade-in duration-500"
  >
    <div class="relative mb-6">
      <img
        src="/404.png"
        alt="404 Not Found"
        class="h-64 object-contain opacity-90"
      />
    </div>
    <h1 class="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
    <h2 class="mt-2 text-xl font-semibold tracking-tight">页面走丢了</h2>
    <p class="mt-2 max-w-[350px] text-sm text-muted-foreground">
      抱歉，我们找不到您要访问的页面。它可能已被移动、删除或从未存在过。
    </p>
    <router-link to="/" class="mt-8">
      <Button variant="default"> 返回首页 </Button>
    </router-link>
  </div>
</template>
