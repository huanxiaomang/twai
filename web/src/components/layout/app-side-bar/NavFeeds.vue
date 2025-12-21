<script setup lang="ts">
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRoute } from "vue-router";

import type { Feed } from "@/types";
defineProps<{
  feeds: Feed[];
}>();

const route = useRoute();
const { state } = useSidebar();

const isActive = (path: string) => {
  return route.path === path;
};
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel class="text-xs font-semibold text-muted-foreground/70">
      订阅源
    </SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in feeds" :key="item.feed_id">
        <SidebarMenuButton
          as-child
          :is-active="isActive(`/feed/${item.feed_id}`)"
          :tooltip="item.name"
          class="transition-all duration-200 min-h-9"
        >
          <router-link
            :to="`/feed/${item.feed_id}`"
            class="flex items-center gap-3"
          >
            <Avatar
              class="h-6 w-6 shrink-0 transition-all duration-300"
              :class="[state === 'collapsed' ? 'ml-[-3.5px]' : '']"
            >
              <AvatarImage :src="item.avatar" />
              <AvatarFallback class="text-[10px]">
                {{ item.name.substring(0, 2).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <span class="truncate font-medium">{{ item.name }}</span>
          </router-link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem v-if="feeds.length === 0">
        <SidebarMenuButton as-child class="h-auto py-2 opacity-80">
          <router-link to="/settings" class="flex flex-col items-start gap-1">
            <span class="text-[11px] leading-tight text-muted-foreground"
              >暂无订阅源</span
            >
            <span class="text-[10px] leading-tight text-primary underline"
              >前往设置添加</span
            >
          </router-link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
