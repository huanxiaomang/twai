<script setup lang="ts">
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRoute } from "vue-router";
import { Settings2, Info } from "lucide-vue-next";

const route = useRoute();
const { state } = useSidebar();

const isActive = (path: string) => {
  return route.path === path;
};
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel
      class="text-xs font-semibold text-muted-foreground/70 mt-4"
    >
      其他
    </SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          as-child
          :is-active="isActive('/settings')"
          tooltip="设置"
          class="transition-all duration-200 min-h-9"
        >
          <router-link to="/settings" class="flex items-center gap-3">
            <Settings2
              class="h-6 w-6 shrink-0 transition-all duration-300"
              :class="[
                state === 'collapsed' && isActive('/settings')
                  ? 'text-sidebar-primary scale-110'
                  : '',
              ]"
            />
            <span class="truncate font-medium pt-0.5">设置</span>
          </router-link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          as-child
          :is-active="isActive('/about')"
          tooltip="关于"
          class="transition-all duration-200 min-h-9"
        >
          <router-link to="/about" class="flex items-center gap-3">
            <Info
              class="h-6 w-6 shrink-0 transition-all duration-300"
              :class="[
                state === 'collapsed' && isActive('/about')
                  ? 'text-sidebar-primary scale-110'
                  : '',
              ]"
            />
            <span class="truncate font-medium pt-0.5">关于</span>
          </router-link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
