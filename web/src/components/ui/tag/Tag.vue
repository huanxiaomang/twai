<script setup lang="ts">
import { cn } from "@/lib/utils";

interface Props {
  active?: boolean;
  class?: string;
}

defineProps<Props>();
</script>

<template>
  <button
    type="button"
    :class="
      cn(
        'relative inline-flex h-6 items-center rounded px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer',
        active
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        $props.class
      )
    "
  >
    <slot />
    <div v-if="$slots.badge" class="absolute -right-1 -top-1">
      <slot name="badge" />
    </div>
  </button>
</template>
