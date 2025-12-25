<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-side-bar/index.vue";
import { Toaster } from "@/components/ui/sonner";
import { useUserStore } from "@/stores/user";

const store = useUserStore();

onMounted(() => {
  store.init();
});
</script>

<template>
  <SidebarProvider>
    <div class="flex min-h-screen w-full">
      <AppSidebar />
      <main class="flex-1 overflow-auto">
        <RouterView />
      </main>
    </div>
    <Toaster />
  </SidebarProvider>
</template>
