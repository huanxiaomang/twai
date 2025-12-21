<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import { Github } from "lucide-vue-next";
import NavFeeds from "@/components/layout/app-side-bar/NavFeeds.vue";
import NavUser from "@/components/layout/app-side-bar/NavUser.vue";
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
} from "@/components/ui/sidebar";
import { onMounted } from "vue";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

const userStore = useUserStore();

onMounted(() => {
  userStore.fetchAllFeedsInfo();
});
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <div class="flex items-center justify-between pr-2">
            <SidebarMenuButton size="lg" as-child class="flex-1">
              <router-link to="/">
                <div
                  class="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden"
                >
                  <img src="/icon.png" class="size-full object-cover" />
                </div>
                <div class="flex flex-col gap-0.5 leading-none">
                  <span class="font-semibold">TWAI</span>
                  <span class="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </router-link>
            </SidebarMenuButton>
            <a
              href="https://github.com/huanxiaomang/twai"
              target="_blank"
              class="text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <Github class="size-4" />
            </a>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavFeeds :feeds="userStore.feeds" />
      <NavOther />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="userStore.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
