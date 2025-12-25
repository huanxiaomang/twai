<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { Sparkles, Bot, PanelRightClose } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./OverviewTab.vue";
import AIBotTab from "./AIBotTab.vue";

const store = useUserStore();
const activeTab = ref("overview");
</script>

<template>
  <div
    v-if="store.is_ai_panel_visible"
    class="w-full h-full flex flex-col border-l bg-muted/10 overflow-hidden shrink-0 animate-in fade-in slide-in-from-right-2 duration-300 font-normal"
  >
    <!-- Header -->
    <div
      class="h-14 px-4 border-b bg-background/50 backdrop-blur-sm flex items-center gap-3"
    >
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
        @click="store.toggleAIPanel"
      >
        <PanelRightClose class="size-4" />
      </Button>

      <Tabs v-model="activeTab" class="flex-1">
        <TabsList class="bg-transparent h-9 p-0 gap-2">
          <TabsTrigger
            value="overview"
            class="data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:bg-muted rounded-none h-full px-3 text-xs font-semibold transition-all"
          >
            <Sparkles class="size-3.5 mr-1.5" />
            概览
          </TabsTrigger>
          <TabsTrigger
            value="aibot"
            class="data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:bg-muted rounded-none h-full px-3 text-xs font-semibold transition-all"
          >
            <Bot class="size-3.5 mr-1.5" />
            AI Bot
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <OverviewTab v-if="activeTab === 'overview'" />
      <AIBotTab v-if="activeTab === 'aibot'" />
    </div>
  </div>

  <!-- Floating Expand Button when collapsed -->
  <div
    v-else
    class="fixed right-6 bottom-6 z-50 animate-in fade-in zoom-in duration-300"
  >
    <Button
      class="h-12 px-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground flex items-center gap-2"
      @click="store.toggleAIPanel"
    >
      <Sparkles class="size-5" />
      <span class="text-sm font-semibold">AI分析</span>
    </Button>
  </div>
</template>

<style scoped>
/* Custom tab styles to make them look more like a navbar */
:deep(.tabs-list) {
  background-color: transparent;
}
</style>
