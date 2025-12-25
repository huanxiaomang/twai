<script setup lang="ts">
import { useUserStore } from "@/stores/user";

const props = defineProps<{
  twId: string;
}>();

const store = useUserStore();

const handleClick = () => {
  store.jumpToTweet(props.twId);
};
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 mx-1 text-[11px] font-normal rounded-full bg-secondary/50 text-secondary-foreground/80 border border-border/50 cursor-pointer opacity-50 hover:opacity-100 transition-all duration-200 vertical-middle"
    @click="handleClick"
  >
    <slot />
  </span>
</template>
