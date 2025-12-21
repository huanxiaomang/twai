<script setup lang="ts">
import { Info } from "lucide-vue-next";
</script>

<template>
  <div class="h-full w-full overflow-y-auto bg-background">
    <div
      class="container max-w-2xl py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">关于</h1>
        <p class="text-sm text-muted-foreground">了解更多关于 TWAI 的信息。</p>
      </div>

      <div class="space-y-6">
        <div class="flex items-center gap-3 p-6 rounded-xl border bg-muted/30">
          <div class="p-3 rounded-full bg-primary/10 text-primary">
            <Info class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-lg font-bold">TWAI v1.0.0</h2>
            <p class="text-sm text-muted-foreground">您的个人 AI 资讯助手</p>
          </div>
        </div>

        <div class="prose prose-sm dark:prose-invert max-w-none">
          <p>
            TWAI 是一款旨在帮助用户高效管理和阅读 RSS/JSON 订阅源的工具。结合 AI
            分析功能，为您提供更深度的内容洞察。
          </p>
          <h3 class="text-base font-bold mt-4">核心功能</h3>
          <ul
            class="list-disc list-inside space-y-1 text-sm text-muted-foreground"
          >
            <li>多源订阅管理</li>
            <li>AI 内容摘要与分析</li>
            <li>安全加密的本地存储</li>
            <li>极致流畅的阅读体验</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
