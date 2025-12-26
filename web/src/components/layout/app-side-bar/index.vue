<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import { Github, Sun, Moon, PanelLeft } from "lucide-vue-next";
import NavFeeds from "@/components/layout/app-side-bar/NavFeeds.vue";
// import NavUser from "@/components/layout/app-side-bar/NavUser.vue";
import NavOther from "@/components/layout/app-side-bar/NavOther.vue";

import { useUserStore } from "@/stores/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { onMounted } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

const userStore = useUserStore();
const { toggleSidebar, state } = useSidebar();

const isDark = useDark();
const toggleDark = useToggle(isDark);

onMounted(() => {
  userStore.fetchAllFeedsInfo();
  setTimeout(() => {
    userStore.fetchAllFeedsInfo();
  }, 1);
});
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <div class="flex items-center justify-between pr-1">
            <SidebarMenuButton size="lg" as-child class="flex-1">
              <router-link to="/">
                <div
                  class="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden"
                >
                  <img src="/icon.png" class="size-full object-cover" />
                </div>
                <div class="flex flex-col gap-0.5 leading-none">
                  <span class="font-semibold" v-if="state === 'expanded'"
                    >TWAI</span
                  >
                  <span
                    class="text-xs text-muted-foreground"
                    v-if="state === 'expanded'"
                    >v1.0.0</span
                  >
                </div>
              </router-link>
            </SidebarMenuButton>

            <div v-if="state === 'expanded'" class="flex items-center gap-0.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <a
                      href="https://github.com/huanxiaomang/twai"
                      target="_blank"
                      class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <Github class="size-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>GitHub</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-muted-foreground hover:text-foreground"
                      @click="toggleDark()"
                    >
                      <Sun v-if="isDark" class="size-4" />
                      <Moon v-else class="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {{ isDark ? "切换明亮模式" : "切换暗黑模式" }}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-muted-foreground hover:text-foreground"
                      @click="toggleSidebar"
                    >
                      <PanelLeft class="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>收起侧边栏</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div v-else class="flex items-center justify-center py-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-muted-foreground hover:text-foreground"
                      @click="toggleSidebar"
                    >
                      <PanelLeft class="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>展开侧边栏</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavFeeds :feeds="userStore.feeds" />
      <NavOther />
    </SidebarContent>
    <SidebarFooter>
      <!-- <div class="flex items-center gap-1">
        <NavUser :user="userStore.user" class="flex-1" />
      </div> -->
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
