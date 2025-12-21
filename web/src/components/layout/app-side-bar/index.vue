<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import { GalleryVerticalEnd } from "lucide-vue-next";
import NavFeeds from "@/components/layout/app-side-bar/NavFeeds.vue";
import NavUser from "@/components/layout/app-side-bar/NavUser.vue";

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
import type { Feed } from "@/types";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

const userStore = useUserStore();

// Mock feeds for now, could be moved to store later
const feeds: Feed[] = [
  {
    name: "feed1",
    id: "feed1",
    avatar: "https://www.shadcn-vue.com/avatars/shadcn.jpg",
    url: "xxx",
  },
  {
    name: "feed2",
    id: "feed2",
    avatar: "https://www.shadcn-vue.com/avatars/shadcn.jpg",
    url: "xxx",
  },
  {
    name: "feed3",
    id: "feed3",
    url: "xxx",
    avatar: "https://www.shadcn-vue.com/avatars/shadcn.jpg",
  },
];
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <router-link to="/">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <GalleryVerticalEnd class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">TWAI</span>
                <span class="text-xs text-muted-foreground">v1.0.0</span>
              </div>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavFeeds :feeds="feeds" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="userStore.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
