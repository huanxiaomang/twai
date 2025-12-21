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
import { Settings2 } from "lucide-vue-next";

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
      <SidebarMenuItem v-for="item in feeds" :key="item.id">
        <SidebarMenuButton
          as-child
          :is-active="isActive(`/feed/${item.id}`)"
          :tooltip="item.name"
          class="transition-all duration-200 min-h-9"
        >
          <router-link :to="`/feed/${item.id}`" class="flex items-center gap-3">
            <Avatar
              class="h-6 w-6 shrink-0 transition-all duration-300"
              :class="[
                state === 'collapsed' ? 'ml-[-3.5px]' : '',
                state === 'collapsed' && isActive(`/feed/${item.id}`)
                  ? 'ring-2 ring-sidebar-primary ring-offset-2 ring-offset-background scale-95'
                  : '',
              ]"
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
    </SidebarMenu>

    <SidebarGroupLabel
      class="text-xs font-semibold text-muted-foreground/70 mt-4"
    >
      系统
    </SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          as-child
          :is-active="isActive('/settings')"
          tooltip="Settings"
          class="transition-all duration-200 min-h-9"
        >
          <router-link to="/settings" class="flex items-center gap-3">
            <Settings2
              class="h-6 w-6 shrink-0 transition-all duration-300"
              :class="[
                state === 'collapsed' ? 'ml-[-3.5px]' : '',
                state === 'collapsed' && isActive('/settings')
                  ? 'text-sidebar-primary scale-110'
                  : '',
              ]"
            />
            <span class="truncate font-medium">Settings</span>
          </router-link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
