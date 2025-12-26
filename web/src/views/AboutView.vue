<script setup lang="ts">
import {
  Info,
  Bot,
  Globe,
  CalendarDays,
  Github,
  Clock,
  RefreshCw,
  Lock,
  Heart,
  Sparkles,
} from "lucide-vue-next";
</script>

<template>
  <div class="h-full w-full overflow-y-auto bg-background">
    <div class="container max-w-2xl mx-auto py-12 px-6">
      <div
        class="animate-in fade-in slide-in-from-bottom-2 duration-700 space-y-12"
      >
        <!-- 标题 -->
        <div class="text-center space-y-3">
          <h1 class="text-3xl font-bold tracking-tight">关于 TWAI</h1>
          <p class="text-muted-foreground">您的个人 AI 资讯助手 · v1.0.0</p>
        </div>

        <!-- 简介卡片 -->
        <div
          class="flex flex-col items-center gap-4 p-8 rounded-2xl border bg-card shadow-sm"
        >
          <div class="p-4 rounded-full bg-primary/10 text-primary">
            <Bot class="w-10 h-10" />
          </div>
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-bold">TWAI</h2>
            <p class="text-muted-foreground">
              Twitter + AI = 更聪明的资讯阅读体验
            </p>
          </div>
        </div>

        <!-- 项目简介 -->
        <section class="space-y-6">
          <h3 class="text-xl font-semibold flex items-center gap-2">
            <Info class="w-5 h-5 text-primary" />
            项目简介
          </h3>
          <div
            class="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
          >
            <p>
              TWAI 是一款专注于高效管理和深度阅读
              Twitter（X）资讯的开源工具。通过 RSS 订阅 + AI
              智能处理，帮助您快速把握热点、精华内容，避免信息过载。
            </p>
            <p>
              所有数据本地存储，支持加密保护隐私；界面极简流畅，专为深度阅读者设计。
            </p>
          </div>
        </section>

        <!-- 数据源与更新机制 -->
        <section class="space-y-6">
          <h3 class="text-xl font-semibold flex items-center gap-2">
            <RefreshCw class="w-5 h-5 text-primary" />
            数据源与更新机制
          </h3>
          <div class="bg-muted/50 rounded-xl p-6 space-y-6 border">
            <div class="flex items-start gap-4">
              <div class="p-2 rounded-full bg-primary/10 text-primary">
                <Clock class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <p class="font-medium flex items-center gap-2">
                  <CalendarDays class="w-4 h-4" />
                  每日自动更新
                </p>
                <p class="text-sm text-muted-foreground mt-1">
                  GitHub Actions 每日前凌晨
                  3:00（UTC）执行自动化脚本，稳定可靠。
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="p-2 rounded-full bg-primary/10 text-primary">
                <Github class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <p class="font-medium">数据拉取与处理</p>
                <p class="text-sm text-muted-foreground mt-1">
                  使用 RSS.app 服务拉取指定 Twitter 账号的最新推文 → AI
                  进行翻译、标签分类、Bot 解析、每日概览生成。
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="p-2 rounded-full bg-primary/10 text-primary">
                <Sparkles class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <p class="font-medium">更新内容</p>
                <p class="text-sm text-muted-foreground mt-1">
                  每天新增 <strong>前一天</strong> 的完整推文数据与 AI
                  分析内容（例如：今天更新 2025-12-25 的数据）。
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="p-2 rounded-full bg-primary/10 text-primary">
                <Globe class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-muted-foreground">
                  数据文件托管在 GitHub 仓库的特定目录下，您只需导入对应的 JSON
                  Feed URL，即可一键订阅最新内容。
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 核心功能 -->
        <section class="space-y-6">
          <h3 class="text-xl font-semibold flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-primary" />
            核心功能
          </h3>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li
              class="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border"
            >
              <div class="p-2 rounded-full bg-primary/10 text-primary">
                <Globe class="w-5 h-5" />
              </div>
              <span class="text-sm">多源 RSS/JSON 订阅管理</span>
            </li>
            <li
              class="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border"
            >
              <div class="p-2 rounded-full bg-primary/10 text-primary">
                <Bot class="w-5 h-5" />
              </div>
              <span class="text-sm">AI 翻译、标签、每日概览</span>
            </li>
            <li
              class="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border"
            >
              <div class="p-2 rounded-full bg-primary/10 text-primary">
                <Lock class="w-5 h-5" />
              </div>
              <span class="text-sm">本地加密存储，保护隐私</span>
            </li>
            <li
              class="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border"
            >
              <div class="p-2 rounded-full bg-primary/10 text-primary">
                <Heart class="w-5 h-5" />
              </div>
              <span class="text-sm">极简流畅的阅读体验</span>
            </li>
          </ul>
        </section>

        <!-- 结尾 -->
        <div
          class="text-center text-sm text-muted-foreground pt-8 border-t space-y-2"
        >
          <p class="flex items-center justify-center gap-2">
            <Github class="w-4 h-4" />
            开源 · 免费 · 无广告
          </p>
          <p>感谢您使用 TWAI，祝您阅读愉快~</p>
        </div>
      </div>
    </div>
  </div>
</template>
